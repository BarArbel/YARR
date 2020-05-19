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
      const sql = `SELECT * FROM ${process.env.DATABASE}.experiments where GameCode = '${data.Code}' LIMIT 1 ;`;
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
    socket.on('interruptedCodeInput', data => {
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
          socket.emit('interruptedCorrect', {experimentID: `${results[0]["ExperimentId"]}`, instanceId: `${table.time}_${table.id}`, interruptedInstanceId: results[0]["InstanceId"]});
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

          socket.emit('newGameScene', {rSettings: {numberOfPlayers:  numOfPlayers, 
                                                      roundLength:      roundDuration, 
                                                      blindness:        colorBlindness, 
                                                      modes:            modeList,
                                                      skin:             skin,
                                                      difficulties:     difficList}, instanceId: `${table.time}_${table.id}`});   
        }});
    
    });

    socket.on('SyncNewScene', (data) => {
      console.log("SyncNewScene");
      console.log(data);
      //socket.broadcast.emit('newGameSettings', {fuckyou: "fuckoff"});
      socket.broadcast.emit('newGameSettings', data);
    });

    // Add instance ID to the server
    socket.on('initInterrGameSettings', async data => {
      
      // Expected game settings
      let roundsNumber;

      // Actual game settings
      let numOfPlayers = 3;
      let roundDuration;
      let colorBlindness;
      let skin;
      let initTimestamp;
      let roundsDone;
      let modeList = new Array();
      let difficList = new Array();
      let playerLocList = new Array();
      let heldPickupLocList = new Array();
      let enemyLocList = new Array();
      let pickupLocList = new Array();
      //TODO: async all of that shit 

      console.log(data);
      try { 
      // Get number of rounds
      let sql_roundsNumber = `SELECT RoundsNumber FROM ${process.env.DATABASE}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1;`;
      await mysqlConnection.query(sql_roundsNumber, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          console.log(error);
          console.log(sql_roundsNumber);
          socket.emit('noAvailableExpData', {message: "There's no experiment with such ID", instanceId: `${table.time}_${table.id}`});
        }
        else {
          roundsNumber = results[0]["RoundsNumber"];
          console.log(roundsNumber);
        }});
      
      // Get how many rounds were done duing the instance  
      let sql_roundsDone = `SELECT count(*) RoundsDone FROM ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id} where Event = 'newRound';`;
      await mysqlConnection.query(sql_roundsDone, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          console.log(error);
          console.log(sql_roundsDone);
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          roundsDone = results[0]["RoundsDone"];
          console.log(roundsDone);
        }});

      // Get left rounds data  
      let sql_roundsLeft = `SELECT * FROM ${process.env.DATABASE}.rounds where ExperimentId = '${data.ExperimentID}' ORDER BY RoundNumber ASC;`;

      await mysqlConnection.query(sql_roundsLeft, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          console.log(error);
          console.log(sql_roundsLeft);
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          for (var i=roundsDone; i<results.length; i++) {
            modeList.push(results[i]["GameMode"]);
            difficList.push(results[i]["Difficulty"]);
          }
          console.log(modeList);
          console.log(difficList);
        }});
      
      // Get experiment settings  
      let sql_expr_settings = `SELECT * FROM ${process.env.DATABASE}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1 ;`;
      await mysqlConnection.query(sql_expr_settings, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          console.log(error);
          console.log(sql_expr_settings);
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          roundDuration = results[0]["RoundDuration"];
          colorBlindness = results[0]["Disability"];
          skin = results[0]["ColorSettings"];  
        }});
      
      // Get players' positions
      let sql_pLoc = `
      WITH all_events AS 
      (SELECT * FROM ${process.env.DATABASE}.dda_input_${table.time}_${table.id}  
        where Timestamp < (select max(timestamp) from ${process.env.DATABASE}.dda_input_${table.time}_${table.id})-1)

      SELECT ts,pid,CoordX,CoordY FROM
      (select max(Timestamp) ts, PlayerID from all_events
      Where playerID != 0 and Event = "playerLoc"
      group by 2) as latest_ts LEFT JOIN (SELECT Timestamp, PlayerID pid, CoordX, CoordY FROM all_events) as all_e  ON ts = Timestamp and PlayerID = pid
      ORDER BY 1;`;
      
      await mysqlConnection.query(sql_pLoc, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          console.log(error);
          console.log(sql_pLoc);
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          for (var row in results) {
            playerLocList.push({playerID: results[row]["pid"], CoordX: results[row]["CoordX"], CoordY: results[row]["CoordY"]});
          }
          initTimestamp = results[0]["ts"]-1
          console.log(playerLocList);
          console.log(initTimestamp);
        }});

      // Get enemies' positions
      let sql_eLoc = `SELECT Timestamp, Event, Enemy, CoordX, CoordY FROM ${process.env.DATABASE}.dda_input_${table.time}_${table.id} 
                        WHERE Event = "enemyLoc" and Timestamp < ${initTimestamp}+5 and Timestamp >  ${initTimestamp};`;
      
      await mysqlConnection.query(sql_eLoc, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          console.log(error);
          console.log(sql_eLoc);
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          for (var row in results) {
            enemyLocList.push({Enemy: results[row]["Enemy"], CoordX: results[row]["CoordX"], CoordY: results[row]["CoordY"]});
          }
        }});

      // Get items' positions
      let sql_iLoc = `SELECT Timestamp, Event, Item, CoordX, CoordY FROM ${process.env.DATABASE}.dda_input_${table.time}_${table.id} 
                        WHERE Event = "itemLoc" and Timestamp < ${initTimestamp}+5 and Timestamp >  ${initTimestamp};`;
      
      await mysqlConnection.query(sql_iLoc, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          console.log(error);
          console.log(sql_iLoc);
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          for (var row in results) {
            pickupLocList.push({Item: results[row]["Item"], CoordX: results[row]["CoordX"], CoordY: results[row]["CoordY"]});
          }
        }});  

        // Get held items
        let sql_hiLoc = `SELECT Timestamp, Event, PlayerID, Item FROM ${process.env.DATABASE}.dda_input_${table.time}_${table.id} 
                        WHERE Event = "takenItemLoc" and Timestamp < ${initTimestamp}+5 and Timestamp >  ${initTimestamp};`;
      
      await mysqlConnection.query(sql_hiLoc, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          console.log(error);
          console.log(sql_hiLoc);
          socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
        }
        else {
          for (var row in results) {
            heldPickupLocList.push({Item: results[row]["Item"], playerID: results[row]["pid"]});
            console.log(heldPickupLocList);
          }
        }});  
      }
      catch (err) {console.log("fuck");}
      console.log(  {numberOfPlayers:  numOfPlayers, 
                    roundLength:      roundDuration, 
                    blindness:        colorBlindness, 
                    modes:            modeList,
                    skin:             skin,
                    difficulties:     difficList,
                    timestamp:        initTimestamp,
                    pLoc:             playerLocList,
                    eLoc:             enemyLocList,
                    iLoc:             pickupLocList,
                    hiLoc:            heldPickupLocList
      });
      socket.emit('interrGameSettings', {rSettings: {numberOfPlayers:  numOfPlayers, 
                                                  roundLength:      roundDuration, 
                                                  blindness:        colorBlindness, 
                                                  modes:            modeList,
                                                  skin:             skin,
                                                  difficulties:     difficList,
                                                  timestamp:        initTimestamp,
                                                  pLoc:             playerLocList,
                                                  eLoc:             enemyLocList,
                                                  iLoc:             pickupLocList,
                                                  hiLoc:            heldPickupLocList
                                                }, instanceId: `${table.time}_${table.id}`});   
                                                
    });

  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    //socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_${table.time}_${table.id} finished the game`);
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_${table.time}_${table.id} finished the game`);
  });
});
