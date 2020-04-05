require('dotenv').config()
var io = require('socket.io')(process.env.PORT || 52300);
const mysqlConnection = require("./connection");
var Table = require('./Classes/Table.js');

console.log('Server has started');

var tables = [];
var sockets = [];

io.on('connection',function(socket){
    console.log('Connection Made!');

    var table = new Table();
    var thisTableID = table.id;

    tables[thisTableID] = table;

    tables.push(table);
    socket.emit('ExperimentID',table);
    
    socket.on('createTables', function(){
        //Creating table for each experiment

        var sql = `CREATE TABLE yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} (
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

        mysqlConnection.query(sql,(err,rows,fields) => {
            if(err) throw err;
            console.log("data was added");
            socket.broadcast.emit('message', `table yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} was created`);
        })
        
        var sql = `CREATE TABLE yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} (
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

        mysqlConnection.query(sql,(err,rows,fields) => {
            if(err) throw err;
            console.log("data was added");
            socket.broadcast.emit('message', `table yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} was created`);
        })



    });

    //Sending Data to the spesific table
    socket.on('DDAinput', function(data){
        var sql = `INSERT INTO yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
                                              VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
        mysqlConnection.query(sql,(err,rows,fields) => {
            if(err) throw err;
            console.log("data was added");
        })
        socket.broadcast.emit('message', `table yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} updated`);
    });

    socket.on('TrackerInput', function(data){
        var sql = `INSERT INTO yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
                                              VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
        mysqlConnection.query(sql,(err,rows,fields) => {
            if(err) throw err;
            console.log("data was added");
        })
        socket.broadcast.emit('message', `table yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} updated`);
    });


    socket.on('disconnect', function(){
        console.log('A player has disconnected');
        delete tables[thisTableID];
        socket.broadcast.emit('message', `table yarrserver.DDA_Input_ExperimentID_${table.time}_${table.id} finished the game`);
        socket.broadcast.emit('message', `table yarrserver.Tracker_Input_ExperimentID_${table.time}_${table.id} finished the game`);
    });
});
