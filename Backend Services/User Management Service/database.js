var mysql = require("mysql");
const { HOST, USER, PASSWORD, DATABASE } = process.env
const util = require('util');

var connection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE
});

connection.connect();
const query = util.promisify(connection.query).bind(connection);

module.exports = {
  connection, query
}
