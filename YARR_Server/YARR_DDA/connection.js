const mysql = require("mysql");

const { HOST_PLATFORM, HOST_DDA, USER, PASSWORD, DATABASE_PLATFORM, DATABASE_DDA, PORT_DDA, PORT_PLATFORM } = process.env

var mysqlConnection_platform = mysql.createConnection({
  host: HOST_PLATFORM,
  port: PORT_PLATFORM,
  user: USER,
  password: PASSWORD,
  database: DATABASE_PLATFORM,
  multipleStatements: true
});

mysqlConnection_platform.connect((err) => {
    if(!err){
        console.log("Connected to platform DB");
    }else{
        console.log(err);
        console.log("Connection to platform DB failed");
    }
});

var mysqlConnection_dda = mysql.createConnection({
  host: HOST_DDA,
  port: PORT_DDA,
  user: USER,
  password: PASSWORD,
  database: DATABASE_DDA,
  multipleStatements: true
});

mysqlConnection_dda.connect((err) => {
  if(!err){
      console.log("Connected to DDA DB");
  }else{
      console.log(err);
      console.log("Connection to DDA DB failed");
  }
});

module.exports = {
  mysqlConnection_platform,
  mysqlConnection_dda
};