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

    connection.query(`SELECT * FROM Study_Insights_Mirror WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
        return;
      }
    });
  },

  requestInsightRadar: async(req, res) => {
    const { researcherId, studyId} = req.body;

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM Study_Insights_Radar WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
        return;
      }
    });
  },

  requestInsightMixed: async(req, res) => {
    const { researcherId, studyId} = req.body;

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM Study_Insights_Mixed WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
        return;
      }
    });
  },

  requestInsightPie: async(req, res) => {
    const { researcherId, studyId} = req.body;

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM Study_Insights_Pie WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
        return;
      }
    });
  }

}