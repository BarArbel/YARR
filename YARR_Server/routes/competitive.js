const mysqlConnection = require("../connection");

mysqlConnection.query("SELECT * from competitive", (err,rows,fields) => {
    if(!err){
        res.send(rows);
    }else{
        console.log(err);
    }
})    

//var sql = "INSERT INTO yarrserver.cooperativemode(Player,Pickups,GiveItemToPlayer,RevivePlayer,TemporaryLose,Revived,Lose,DropItemScore,GetDamaged,FailPickup,BlockDamage,ItemSpawn,EnemySpawn) VALUES(Participant,Pickups,GiveItemToPlayer,RevivePlayer,TemporaryLose,Revived,Lose,DropItemScore,GetDamaged,FailPickup,BlockDamage,ItemSpawn,EnemySpawn);";
var sql = "INSERT INTO yarrserver.competitive(Player,Pickups) VALUES('Yuval','2');";
mysqlConnection.query(sql,(err,rows,fields) => {
        if(!err){
            res.send(rows);
        }else{
            console.log(err);
        }
})

module.exports = Router;