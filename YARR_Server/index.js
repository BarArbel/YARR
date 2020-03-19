var io = require('socket.io')(process.env.PORT || 52300);
const mysqlConnection = require("./connection");
var Player = require('./Classes/Player.js');

console.log('Server has started');

var players = [];
var sockets = [];

io.on('connection',function(socket){
    console.log('Connection Made!');

    var player = new Player();
    var thisPlayerID = player.id;

    players[thisPlayerID] = player;
    sockets[thisPlayerID] = socket;

    socket.on('cooperative', function(data){
        var sql = `INSERT INTO yarrserver.cooperative(TimeStamp,Player,Pickups,GiveItemToPlayer,RevivePlayer,TemporaryLose,Revived,Lose,DropItemScore,GetDamaged,FailPickup,BlockDamage,ItemSpawn,EnemySpawn) 
                                              VALUES('${Date()}','${data.Player}','${data.Pickups}','${data.GiveItemToPlayer}','${data.RevivePlayer}','${data.TemporaryLose}','${data.Revived}','${data.Lose}','${data.DropItemScore}','${data.GetDamaged}','${data.FailPickup}','${data.BlockDamage}','${data.ItemSpawn}','${data.EnemySpawn}');`;
        mysqlConnection.query(sql,(err,rows,fields) => {
            if(err) throw err;
            console.log("data was added");
        })
    });
    
    socket.on('competitive', function(data){
       //var sql = "INSERT INTO yarrserver.cooperativemode(Player,Pickups,GiveItemToPlayer,RevivePlayer,TemporaryLose,Revived,Lose,DropItemScore,GetDamaged,FailPickup,BlockDamage,ItemSpawn,EnemySpawn) VALUES(Participant,Pickups,GiveItemToPlayer,RevivePlayer,TemporaryLose,Revived,Lose,DropItemScore,GetDamaged,FailPickup,BlockDamage,ItemSpawn,EnemySpawn);";
        var sql = "INSERT INTO yarrserver.competitive(Player,Pickups) VALUES('Yuval','2');";
        mysqlConnection.query(sql,(err,rows) => {
                if(err) throw err;
                console.log("data was added");
        })
    });

    socket.on('disconnect', function(){
        console.log('A player has disconnected');
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];
        socket.broadcast.emit('disconected',player);
    });
});

