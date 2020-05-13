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


  //Sending Data to the DDA table for game difficulty analysis
  socket.on('DDAinput', async data => {
    const sql = `INSERT INTO ${process.env.DATABASE}.DDA_Input_ExperimentID_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
      VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
    
    const { err, rows, fields } = await query(sql);
    if(err) throw err;
    console.log("data was added");
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_ExperimentID_${table.time}_${table.id} updated`);
  });

  // Update game difficulty
  socket.on('LevelSettings', data => {
    socket.broadcast.emit('LevelSettings', { LvSettings: data, instanceId: `${table.time}_${table.id}` });
    console.log('variables sent to game');
  });

  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    delete tables[thisTableID];
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_ExperimentID_${table.time}_${table.id} finished the game`);
    //socket.broadcast.emit('message', `table ${process.env.DATABASE}.Tracker_Input_ExperimentID_${table.time}_${table.id} finished the game`);
  });
});
