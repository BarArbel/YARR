var mysql = require("mysql");
const { HOST, USER, PASSWORD, DATABASE } = process.env
const util = require('util');

var connection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
  multipleStatements: true
});

connection.connect();
const promisify_query = util.promisify(connection.query).bind(connection);

module.exports = {
  connection, promisify_query
}
