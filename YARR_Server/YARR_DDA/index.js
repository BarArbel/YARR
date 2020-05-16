require('dotenv').config()
const io = require('socket.io')(process.env.PORT);
const mysqlConnection = require("./connection");
const Table = require('./Classes/Table.js');
const util = require('util');

const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);

console.log('Server has started');

const tables = [];
var tableTimeId;
const sockets = [];

io.on('connection', async socket =>{
  console.log('Connection Made!');
  socket.emit('connectionConfirmed');

  // Initiate DDA calculations and get Instance ID from the game client
  socket.on('initDDA', data => {
    tableTimeId = data.InstanceID;
    const sql = `SET SQL_SAFE_UPDATES=0;
                 UPDATE  ${process.env.DATABASE}.instances SET DDAParity = true  where InstanceId = '${tableTimeId}' ;
                 SET SQL_SAFE_UPDATES=1;   `;
    console.log(sql);
    mysqlConnection.query(sql, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('cantUpdate', {message: "Couldn't update the instances table", instanceId: `${tableTimeId}`});
        }
      else {
        // TODO: Finish initlevel and numof players code
        //const { InitLevel, NumOfPlayers } = data;
        // DEBUG:
        NumOfPlayers = 3;
        InitLevel = 2;
        const pythonProcess = spawn('python', ["Difficulty Module/__init__.py", `${tableTimeId}`, InitLevel, NumOfPlayers]);
        if (pythonProcess.pid !== undefined)
          socket.broadcast.emit('initDDA', { result: `Success`, instanceId: `${tableTimeId}` });
        else socket.broadcast.emit('initDDA', { result: `Failure`, instanceId: `${tableTimeId}` });
      }});

    console.log(tableTimeId);
  });

  //Sending Data to the DDA table for game difficulty analysis
  socket.on('DDAinput', async data => {
    const sql = `INSERT INTO ${process.env.DATABASE}.DDA_Input_${tableTimeId}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
    VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
    
    const { err, rows, fields } = await query(sql);
    if(err) throw err;
    console.log("data was added");
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_${tableTimeId} updated`);
  });

  // Update game difficulty
  socket.on('LevelSettings', data => {
    socket.broadcast.emit('LevelSettings', { LvSettings: data, instanceId: `${tableTimeId}` });
    console.log('variables sent to game');
  });

  socket.on('gameEnded', () => {
    socket.broadcast.emit('gameEnded', `${tableTimeId}`);
  });

  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    //delete tables[thisTableID];
    socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_${tableTimeId} finished the game`);
  });
});
