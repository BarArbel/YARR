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

  const table = new Table();
  const thisTableID = table.id;

  tables[thisTableID] = table;

  tables.push(table);
  socket.emit('instanceId', {id: table.time+'_'+table.id});
  
  socket.on('createTables', async () => {
    //Creating table for each experiment   
    const sql = `CREATE TABLE ${process.env.DATABASE}.DDA_Input_ExperimentID_${table.time}_${table.id} (
      EventID int unsigned NOT NULL AUTO_INCREMENT,
      Timestamp float NOT NULL,
      Event enum(
        'pickup','giveItem','revivePlayer','temporaryLose','revived','lose','dropitem','getDamaged','blockDamage','failPickup','fallAccidently','individualLoss','spawn','powerupSpawn','powerupTaken','powerupMissed',
        'move','jump','lvlUp','lvlDown','lvlStay','enemyRecalcD'
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
      socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_ExperimentID_${table.time}_${table.id} was created`);
    }
    catch(err) {
      throw err;
    }

    const sql2 = `CREATE TABLE ${process.env.DATABASE}.Tracker_Input_ExperimentID_${table.time}_${table.id} (
      EventID int unsigned NOT NULL AUTO_INCREMENT,
      Timestamp float NOT NULL,
      Event enum(
        'pickup','giveItem','revivePlayer','temporaryLose','revived','lose','dropitem','getDamaged','blockDamage','failPickup','fallAccidently','individualLoss','spawn','powerupSpawn','powerupTaken','powerupMissed',
        'move','jump','lvlUp','lvlDown','lvlStay','enemyRecalcD'
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
      socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_ExperimentID_${table.time}_${table.id} was created`);
    }
    catch (err) {
      throw err;
    }
  });

  //Sending Data to the Tracker table for experiment analysis
  socket.on('TrackerInput', async data => {
    const sql = `INSERT INTO ${process.env.DATABASE}.Tracker_Input_ExperimentID_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
      VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
    const { err, rows, fields } = await query(sql)
    if(err) throw err;
    console.log("data was added");
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_ExperimentID_${table.time}_${table.id} updated`);
  });

    //Sending new game code for a verification
    socket.on('newCodeInput', async data => {
      const sql = `SELECT * FROM ${process.env.DATABASE}.game_codes where code = '${data.code}' LIMIT 1 ;`;
      mysqlConnection.query(sql, (error, results) => {
        if (error || !results.length) {
          socket.emit('wrongCode', {message: "Wrong code", instanceId: `${table.time}_${table.id}`});
          //res.status(400).send('{"result": "Failure", "error": "Provided game code is incorrect."}');
        }
        else {
          console.log(results[0]["ExperimentId"]);
          console.log("Provided game code is correct. " + data.code + "\nInstanceID: " + table.id);
          socket.emit('newCorrect', {experimentID: results[0]["ExperimentId"], instanceId: `${table.time}_${table.id}`});
        }});
    });

    //Sending interrupted game code for a verification
    socket.on('interruptedCodeInput', async data => {
      const sql = `SELECT * FROM ${process.env.DATABASE}.interupted_instances where GameCode = '${data.code}' LIMIT 1 ;`;
      mysqlConnection.query(sql, (error, results) => {
        if (error || !results.length) {
          socket.emit('wrongCode', {message: "Wrong code", instanceId: `${table.time}_${table.id}`});
        }
        else {
          console.log(results[0]["ExperimentId"]);
          console.log("Provided game code is correct. " + data.code + "\nInstanceID: " + table.id);
          //socket.emit('interruptedCorrect', {experimentID: results[0]["ExperimentId"], instanceId: `${table.time}_${table.id}`});
        }});
        //console.log("wowzer");
        //socket.emit('correctCode',  "wowzer" );
    });

    // Add instance ID to the server
    socket.on('addInstanceID', data => {
      socket.broadcast.emit('variables', data);
      console.log('variables sent to game');
    });

  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    delete tables[thisTableID];
    //socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_ExperimentID_${table.time}_${table.id} finished the game`);
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_ExperimentID_${table.time}_${table.id} finished the game`);
  });
});
