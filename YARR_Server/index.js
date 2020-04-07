require('dotenv').config()
const io = require('socket.io')(process.env.PORT || 52300);
const mysqlConnection = require("./connection");
const Table = require('./Classes/Table.js');

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
  socket.emit('ExperimentID', table);
  
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

    const { err, rows, fields } = await query(sql);
    if(err) throw err;
    console.log("data was added");
    socket.broadcast.emit('message', `table yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} was created`);

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

    const { err, rows, fields } = await query(sql2);
    if(err) throw err;
    console.log("data was added");
    socket.broadcast.emit('message', `table yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} was created`);
  });

  //Sending Data to the spesific table
  socket.on('DDAinput', async data => {
    const sql = `INSERT INTO yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
      VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
    
    const { err, rows, fields } = await query(sql);
    if(err) throw err;
    console.log("data was added");
    socket.broadcast.emit('message', `table yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} updated`);
  });

  socket.on('TrackerInput', async data => {
    const sql = `INSERT INTO yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
      VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
    const { err, rows, fields } = await query(sql)
    if(err) throw err;
    console.log("data was added");
    socket.broadcast.emit('message', `table yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} updated`);
  });

  socket.on('variables', data => {
    socket.broadcast.emit('variables', data);
    console.log('variables sent to game');
  });

  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    delete tables[thisTableID];
    socket.broadcast.emit('message', `table yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} finished the game`);
    socket.broadcast.emit('message', `table yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} finished the game`);
  });
});
