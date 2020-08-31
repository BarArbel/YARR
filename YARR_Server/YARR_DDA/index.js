require('dotenv').config()
const io = require('socket.io')(process.env.PORT || 52300);
const { mysqlConnection_platform, mysqlConnection_dda } = require("./connection");
const util = require('util');
const spawn = require("child_process").spawn;

const query_platform = util.promisify(mysqlConnection_platform.query).bind(mysqlConnection_platform);
const query_dda = util.promisify(mysqlConnection_dda.query).bind(mysqlConnection_dda);



// Take care of DB access exception
async function exceptionDBAccess(msg, table, err, socket) {
  try{
    await query_platform(`DROP TABLE ${process.env.DATABASE_DDA}.dda_input_${table.time}_${table.id} ;`);
    await query_platform(`DROP TABLE ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} ;`);
  }
  catch (err2) {
    socket.emit('errorMenu', { 'message' : 'Unable to access the database.', 'error': err2 });
    return;
  }
  socket.emit('errorMenu', {message: msg, 'error': err});
}

io.on('connection', async socket =>{
  let tableTimeId;
  socket.emit('connectionConfirmed');

  // Get Instance ID from the game client
  socket.on('sendInstanceID', data => {
    tableTimeId = data.InstanceID;
    const sql = `SET SQL_SAFE_UPDATES=0;
                 UPDATE  ${process.env.DATABASE_PLATFORM}.instances SET DDAParity = true  where InstanceId = '${tableTimeId}' ;
                 SET SQL_SAFE_UPDATES=1;   `;

    mysqlConnection_platform.query(sql, (error, results) => {
        if (error || !results.length) {
          socket.emit('errorMenu', { "message" : "Couldn't update the instances table.", "error": error });
        }
        else {
          socket.emit('setInstanceID', {instanceId: `${tableTimeId}`});
        }
      });

  });

  // Initiate DDA calculations
  socket.on('initDDA', async data => {
    let initLevel = data.InitLevel;
    let numOfPlayers = data.NumOfPlayers;

    const pythonProcess = spawn(`${process.env.PYTHON}`, ["Difficulty Module/__init__.py", `${tableTimeId}`, initLevel, numOfPlayers]);
    
    pythonProcess.stdout.on('data', (chunk) => {
      console.log(chunk.toString('utf8'));
    });

    pythonProcess.stderr.on('data', (chunk) => {
      console.log(chunk.toString('utf8'));
    });

    if (pythonProcess.pid !== undefined)
      socket.broadcast.emit('initDDA', { result: `Success`, instanceId: `${tableTimeId}` });
    else socket.broadcast.emit('initDDA', { result: `Failure`, instanceId: `${tableTimeId}` });
  })

  //Sending Data to the DDA table for game difficulty analysis
  socket.on('DDAinput', async data => {
    const sql = `INSERT INTO ${process.env.DATABASE_DDA}.dda_input_${tableTimeId}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
    VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
    
    const { err, rows, fields } = await query_dda(sql);
    if(err) {
      exceptionDBAccess("Unable to insert data.", tableTimeId, err, socket)
    }
    socket.broadcast.emit('DDAupdate', `${tableTimeId}`);
  });

  // Update game difficulty
  socket.on('LevelSettings', data => {
    socket.broadcast.emit('LevelSettings', data);
  });

  socket.on('gameEnded', () => {
    // insert DDa + Tracker into perma table
    socket.broadcast.emit('gameEnded', `${tableTimeId}`);
  });

  socket.on('disconnect', () => {
    //delete tables[thisTableID];
    socket.broadcast.emit('DDAupdate', `table ${process.env.DATABASE}.dda_input_${tableTimeId} finished the game`);
  });
});
