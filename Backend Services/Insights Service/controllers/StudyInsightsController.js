var mysql = require("mysql");
const util = require('util');

const { HOST, USER, PASSWORD, DATABASE } = process.env

var connection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE
});

connection.connect();
//const query = util.promisify(connection.query).bind(connection);

module.exports = {
  requestInsightMirror: async(req, res) => {
    const { researcherId, studyId} = req.body;

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM researchers WHERE ResearcherId = "${researcherId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId does not exist."}');
        return;
      }
    });
  }

}