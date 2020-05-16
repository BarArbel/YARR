require('dotenv').config()
const io = require('socket.io')(process.env.PORT);
const mysqlConnection = require("./connection");
const Table = require('./Classes/Table.js');
const util = require('util');

const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);

console.log('Server has started');

const tables = [];
const sockets = [];

io.on('connection', async socket =>{
  console.log('Connection Made!');
  var interruptedInstanceID;
  const table = new Table();

  tables.push(table);
  socket.emit('instanceId', {id: table.time+'_'+table.id});
  
  socket.on('createTables', async () => {
    //Creating table for each experiment   
    const sql = `CREATE TABLE ${process.env.DATABASE}.DDA_Input_${table.time}_${table.id} (
      EventID int unsigned NOT NULL AUTO_INCREMENT,
      Timestamp float NOT NULL,
      Event enum(
        'pickup','giveItem','revivePlayer','temporaryLose','revived','lose','dropitem','getDamaged','blockDamage','failPickup','fallAccidently','individualLoss','spawn','powerupSpawn','powerupTaken','powerupMissed','win','avoidDamage',
        'enemyLoc','itemLoc','takenItemLoc','playerLoc','lvlUp','lvlDown','lvlStay','newRound'
      ) NOT NULL,
      PlayerID int unsigned DEFAULT NULL,
      CoordX float DEFAULT NULL,
      CoordY float DEFAULT NULL,
      Item int DEFAULT NULL,
      Enemy int DEFAULT NULL,
      GameMode enum('Cooperative','Competitive') NOT NULL,
      PRIMARY KEY (EventID)
    );`;

    try {
      await query(sql);
      console.log("dda table created");
      socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_${table.time}_${table.id} was created`);
    }
    catch(err) {
      throw err;
    }

    const sql2 = `CREATE TABLE ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id} (
      EventID int unsigned NOT NULL AUTO_INCREMENT,
      Timestamp float NOT NULL,
      Event enum(
        'pickup','giveItem','revivePlayer','temporaryLose','revived','lose','dropitem','getDamaged','blockDamage','failPickup','fallAccidently','individualLoss','spawn','powerupSpawn','powerupTaken','powerupMissed','win','avoidDamage',
        'enemyLoc','itemLoc','takenItemLoc','playerLoc','lvlUp','lvlDown','lvlStay','newRound'
      ) NOT NULL,
      PlayerID int unsigned DEFAULT NULL,
      CoordX float DEFAULT NULL,
      CoordY float DEFAULT NULL,
      Item int DEFAULT NULL,
      Enemy int DEFAULT NULL,
      GameMode enum('Cooperative','Competitive') NOT NULL,
      PRIMARY KEY (EventID)
    );`;

    try {
      await query(sql2);
      console.log("tracker table created");
      socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id} was created`);
    }
    catch (err) {
      throw err;
    }
  });

  //Add information about instance
  socket.on('addInstanceMetaData', async data => {
    const sql1 = `SELECT ExperimentId, StudyId FROM ${process.env.DATABASE}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1;`;
    console.log(sql1);
    console.log(data);
    mysqlConnection.query(sql1, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableExpData', {message: "There's no experiment with such ID", instanceId: `${table.time}_${table.id}`});
        }
        else {
          const sql2 = `INSERT INTO ${process.env.DATABASE}.instances (StudyId, ExperimentId, InstanceId, CreationTimestamp, Status, DDAParity)
          VALUES  (${results[0]["StudyId"]},${results[0]["ExperimentId"]},"${table.time}_${table.id}",${table.time},     "running", false);`;
          console.log(sql2);
          mysqlConnection.query(sql2, (error, results) => {
            if (error || !results.length) {
              // TODO: Take care of exception
              socket.emit('unableToAddInstanceData', {message: "Adding instance data failed", instanceId: `${table.time}_${table.id}`});
            }});

       } 
    }
  )});

  //Add information about instance
  socket.on('editInstanceMetaData', async data => {
    interruptedInstanceID = data.InterruptedInstanceID;

    // Update information about interrupted instance
    table.time = interruptedInstanceID.split("_")[0];
    table.id =  interruptedInstanceID.split("_")[1];
    const sql = `SET SQL_SAFE_UPDATES=0;
                 UPDATE  ${process.env.DATABASE}.instances SET Status = "running" where InstanceId = '${data.InstanceID}' ;
                 SET SQL_SAFE_UPDATES=1; ` ;
    console.log(sql);
    mysqlConnection.query(sql, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableInstance', {message: "There's no instance with such ID", instanceId: `${table.time}_${table.id}`});
        }
        else{
          socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_${table.time}_${table.id} was created`);
          socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id} was created`);
        }
    }
  )});

  //Sending Data to the Tracker table for experiment analysis
  socket.on('TrackerInput', async data => {
    const sql = `INSERT INTO ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
      VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
    const { err, rows, fields } = await query(sql)
    if(err) throw err;
    console.log("data was added");
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id} updated`);
  });

    //Sending new game code for a verification
    socket.on('newCodeInput', async data => {
      const sql = `SELECT * FROM ${process.env.DATABASE}.game_codes where code = '${data.Code}' LIMIT 1 ;`;
      mysqlConnection.query(sql, (error, results) => {
        if (error || !results.length) {
          socket.emit('wrongCode', {message: "Wrong code", instanceId: `${table.time}_${table.id}`});
        }
        else {
          console.log("correct new game");
          console.log(results[0]["ExperimentId"]);
          console.log("Provided game code is correct. " + data.Code + "\nInstanceID: " + table.id);
          socket.emit('newCorrect', {experimentID: results[0]["ExperimentId"], instanceId: `${table.time}_${table.id}`});
        }});
    });

    //Sending interrupted game code for a verification
    socket.on('interruptedCodeInput', async data => {
      const sql = `SELECT * FROM ${process.env.DATABASE}.interupted_instances where GameCode = '${data.Code}' LIMIT 1 ;`;
      mysqlConnection.query(sql, (error, results) => {
        if (error || !results.length) {
          socket.emit('wrongCode', {message: "Wrong code", instanceId: `${table.time}_${table.id}`});
        }
        else {
          console.log("correct interrupted game");
          this.interruptedInstanceID = results[0]["InstanceId"];
          console.log(results[0]["ExperimentId"]);
          console.log("Provided game code is correct. " + data.Code + "\nInstanceID: " + table.id);
          socket.emit('interruptedCorrect', {experimentID: results[0]["ExperimentId"], instanceId: `${table.time}_${table.id}`, interruptedInstanceId: results[0]["InstanceId"]});
        }});
    });

    // Add instance ID to the server
    socket.on('initNewGameSettings', data => {
      
      var numOfPlayers = 3;
      var roundDuration;
      var colorBlindness;
      var skin;
      var modeList = new Array();
      var difficList = new Array();
      const sql1 = `SELECT * FROM ${process.env.DATABASE}.rounds where ExperimentId = '${data.ExperimentID}' ORDER BY RoundNumber ASC;`;

      mysqlConnection.query(sql1, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          for (row in results) {
            modeList.push(results[row]["GameMode"]);
            difficList.push(results[row]["Difficulty"]);
          }
        }});
      
      const sql2 = `SELECT * FROM ${process.env.DATABASE}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1 ;`;
      mysqlConnection.query(sql2, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          roundDuration = results[0]["RoundDuration"];
          colorBlindness = results[0]["Disability"];
          skin = results[0]["ColorSettings"];

          socket.emit('newGameSettings', {rSettings: {numberOfPlayers:  numOfPlayers, 
                                                      roundLength:      roundDuration, 
                                                      blindness:        colorBlindness, 
                                                      modes:            modeList,
                                                      skin:             skin,
                                                      difficulties:     difficList}, instanceId: `${table.time}_${table.id}`});   
        }});
    
    });

    // Add instance ID to the server
    socket.on('initInterrGameSettings', data => {
      
      // Expected game settings
      var roundsNumber;

      // Actual game settings
      var numOfPlayers = 3;
      var roundDuration;
      var colorBlindness;
      var skin;
      var initTimestamp;
      var roundsDone;
      var modeList = new Array();
      var difficList = new Array();
      var playerLocList = new Array();
      //var heldPickupLocList = new Array();
      var enemyLocList = new Array();
      var pickupLocList = new Array();

      // Get number of rounds
      const sql_roundsNumber = `SELECT RoundsNumber FROM ${process.env.DATABASE}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1;`;
      mysqlConnection.query(sql_roundsNumber, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableExpData', {message: "There's no experiment with such ID", instanceId: `${table.time}_${table.id}`});
        }
        else {
          roundsNumber = results[0]["RoundsNumber"];
        }});
      
      // Get how many rounds were done duing the instance  
      const sql_roundsDone = `SELECT count(*) RoundsDone FROM ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id} where ;`;
      mysqlConnection.query(sql_roundsDone, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          roundsDone = results[0]["RoundsDone"];
        }});

      // Get left rounds data  
      const sql_roundsLeft = `SELECT * FROM ${process.env.DATABASE}.rounds where ExperimentId = '${data.ExperimentID}' ORDER BY RoundNumber ASC;`;

      mysqlConnection.query(sql_roundsLeft, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          for (var i=roundsDone; i<results.length; i++) {
            modeList.push(results[i]["GameMode"]);
            difficList.push(results[i]["Difficulty"]);
          }
        }});
      
      // Get experiment settings  
      const sql_expr_settings = `SELECT * FROM ${process.env.DATABASE}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1 ;`;
      mysqlConnection.query(sql_expr_settings, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          roundDuration = results[0]["RoundDuration"];
          colorBlindness = results[0]["Disability"];
          skin = results[0]["ColorSettings"];  
        }});
      
      // Get players' positions
      const sql_pLoc = `
      WITH all_events AS 
      (select Event, Timestamp ts, PlayerID, CoordX,CoordY from ${process.env.DATABASE}.dda_input_${table.time}_${table.id}
      union all
      select Event, Timestamp ts, PlayerID, CoordX,CoordY from ${process.env.DATABASE}.tracker_input_${table.time}_${table.id}
      ORDER BY 2)
      
      select PlayerID, max_ts, CoordX, CoordY from
      (select max(ts) max_ts, PlayerID from all_events
      Where Event in ("move","jump")
      group by 2) as latest_ts LEFT JOIN (select ts, PlayerID pid, CoordX,CoordY from all_events) as all_e ON (pid = PlayerID and ts = max_ts)`;

      /*socket.emit('newGameSettings', {rSettings: {numberOfPlayers:  numOfPlayers, 
                                                  roundLength:      roundDuration, 
                                                  blindness:        colorBlindness, 
                                                  modes:            modeList,
                                                  skin:             skin,
                                                  difficulties:     difficList
                                                  timestamp:
                                                  pLoc:
                                                  eLoc:
                                                  iLoc:
                                                }, instanceId: `${table.time}_${table.id}`});   */
    
    });

  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    //socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_${table.time}_${table.id} finished the game`);
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id} finished the game`);
  });
});
