const mysql = require("mysql");

const { HOST, USER, PASSWORD, DATABASE } = process.env

var mysqlConnection = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
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