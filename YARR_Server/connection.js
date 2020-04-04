const mysql = require("mysql");

const { HOST, USER, PASSWORD, DATABASE } = process.env

var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "yarrserver",
    multipleStatements: true
});
/*
    host: "localhost",
    user: "root",
    password: "123456",
    database: "yarrserver",

    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
*/ 

mysqlConnection.connect((err) => {
    if(!err){
        console.log("Connected");
    }else{
        console.log(err);
        console.log("Connection Failed");
    }
});

module.exports = mysqlConnection;