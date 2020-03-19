const mysql = require("mysql");

var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "yarrserver",
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if(!err){
        console.log("Connected");
    }else{
        console.log(err);
        console.log("Connection Failed");
    }
});

module.exports = mysqlConnection;