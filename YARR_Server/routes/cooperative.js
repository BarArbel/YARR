const mysqlConnection = require("../connection");

mysqlConnection.query("SELECT * from cooperative", (err,rows,fields) => {
    if(!err){
        res.send(rows);
    }else{
        console.log(err);
    }
})

//var sql = "INSERT INTO yarrserver.cooperativemode(Participant,Pickups,GiveItemToPlayer,RevivePlayer,TemporaryLose,Revived,Lose,DropItemScore,GetDamaged,FailPickup,BlockDamage,ItemSpawn,EnemySpawn) VALUES(Participant,Pickups,GiveItemToPlayer,RevivePlayer,TemporaryLose,Revived,Lose,DropItemScore,GetDamaged,FailPickup,BlockDamage,ItemSpawn,EnemySpawn);";
var sql = "INSERT INTO yarrserver.cooperative(Participant,Pickups) VALUES('Yuval','3');";
mysqlConnection.query(sql,(err,rows,fields) => {
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
})

module.exports = Router;