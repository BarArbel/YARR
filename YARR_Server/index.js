require('dotenv').config()
const io = require('socket.io')(process.env.PORT || 52300);
const mysqlConnection = require("./connection");
const Table = require('./Classes/Table.js');
const util = require('util');
const spawn = require("child_process").spawn;

const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);
console.log('Server has started');

const tables = [];
const sockets = [];

io.on('connection', async socket => {
  console.log('Connection Made!');

  const table = new Table();
  const thisTableID = table.id;

  tables[thisTableID] = table;

  tables.push(table);
  socket.emit('InstanceId', `${table.time}_${table.id}`);

  socket.on('createTables', async () => {
    //Creating table for each experiment   
    const sql = `CREATE TABLE yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} (
      EventID int unsigned NOT NULL AUTO_INCREMENT,
      Timestamp float NOT NULL,
      Event enum('pickup','giveItem','revivePlayer','temporaryLose','revived','lose','dropItem','getDamaged','blockDamage','failPickup','fallAccidently','individualLose','spawn', 'pressR', 'pressL', 'pressJ', 'reactionToSpawn') NOT NULL,
      PlayerID int unsigned DEFAULT NULL,
      CoordX float DEFAULT NULL,
      CoordY float DEFAULT NULL,
      Item int DEFAULT NULL,
      Enemy int DEFAULT NULL,
      GameMode enum('Cooperative','Competitive') NOT NULL,
      PRIMARY KEY (EventID)
    );`;

    const sql2 = `CREATE TABLE yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} (
      EventID int unsigned NOT NULL AUTO_INCREMENT,
      Timestamp float NOT NULL,
      Event enum('pickup','giveItem','revivePlayer','temporaryLose','revived','lose','dropItem','getDamaged','blockDamage','failPickup','fallAccidently','individualLose','spawn', 'pressR', 'pressL', 'pressJ', 'reactionToSpawn') NOT NULL,
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
      await query(sql2);
      
      socket.broadcast.emit('createTables', { result: `Success`, instanceId: `${ table.time }_${ table.id }`  });
      console.log("Tables Created");
    }
    catch (err) {
      socket.broadcast.emit('createTables', { result: `Failure`, instanceId: `${table.time}_${table.id}` });
      console.log("Failed to create tables");
    }
  });

  socket.on('initDDA', () => {
    const pythonProcess = spawn('python', ["../Difficulty Module/__init__.py", `${table.time}_${table.id}`]);
    if (pythonProcess.pid !== undefined)
      socket.broadcast.emit('initDDA', { result: `Success`, instanceId: `${table.time}_${table.id}` });
    else socket.broadcast.emit('initDDA', { result: `Failure`, instanceId: `${table.time}_${table.id}` });
  })

  //Sending Data to the spesific table
  socket.on('DDAinput', async data => {
    const sql = `INSERT INTO yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id}(Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode) 
      VALUES('${data.Time}','${data.Event + 1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode + 1}');`;
    
    try {
      const result = await query(sql);
      if (result.affectedRows > 0)
        socket.broadcast.emit('DDAinput', `${table.time}_${table.id}`);
    }
    catch (err) {
      console.log("Failed to insert new DDA data");
    }

    console.log("DDA data was added");
  });

  socket.on('TrackerInput', async data => {
    const sql = `INSERT INTO yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
      VALUES('${data.Time}','${data.Event + 1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode + 1}');`;
    try {
      const result = await query(sql);
      if (result.affectedRows > 0)
        socket.broadcast.emit('TrackerInput', `${table.time}_${table.id}`);
    }
    catch (err) {
      console.log("Failed to insert new DDA data");
    }
    console.log("Tracker data was added");
  });

  socket.on('LevelSettings', data => {
    socket.broadcast.emit('LevelSettings', { LvSettings: data.LvSetting, instanceId: data.instanceId });
    console.log('variables sent to game');
  });

  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    delete tables[thisTableID];
    socket.broadcast.emit('message', `table yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} finished the game`);
    socket.broadcast.emit('message', `table yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} finished the game`);
  });
});
