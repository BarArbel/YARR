var mysql = require("mysql");

const { HOST, USER, PASSWORD, DATABASE } = process.env

var connection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE
});

connection.connect();

module.exports = {
  getExperiment: async (req, res) => {
    const { ExperimentId } = req.query;

    if (!ExperimentId) {
      res.status(400).send('{"result": "Faliure", "error": "Experiment ID is required."}');
      return;
    }

    connection.query(`SELECT * FROM experiments WHERE ExperimentId = "${ExperimentId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
      } else {
        let {res_experimentId, res_studyId, res_creationDate, res_status, res_details, res_gameSettings} = results[0];
        res.status(200).send(`{"result": "Success", "experiment": {"ExperimentId": "${res_experimentId}",
                              "StudyId": "${res_studyId}", "CreationDate": "${res_creationDate}", "Status": "${res_status}",
                              "Details": "${res_details}", "GameSettings": "${res_gameSettings}"}}`);
      }
    });
  },

  getAllStudyExperiments: async (req, res) => {
    const { StudyId } = req.query;

    if (!StudyId) {
      res.status(400).send('{"result": "Faliure", "error": "Study ID is required."}');
      return;
    }

    connection.query(`SELECT * FROM experiments WHERE StudyId = "${StudyId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
      } else {
        let resultsStr = '{"result": "Success", "experiments": [';
        let i;
        for (i = 0; i < results.length; ++i) {
          let {res_experimentId, res_studyId, res_creationDate, res_status, res_details, res_gameSettings } = results[i];
          resultsStr = resultsStr.concat(`{"ExperimentId": "${res_experimentId}", "StudyId": "${res_studyId}",
                                          "CreationDate": "${res_creationDate}", "Status": "${res_status}",
                                          "Details": "${res_details}", "GameSettings": "${res_gameSettings}"}, `);
        }
        resultsStr = resultsStr.slice(0, -2);
        resultsStr = resultsStr.concat("]}");
        res.status(200).send(resultsStr);
      }
    });
  },

  addExperiment: async (req, res) => {
    const { ExperimentId, StudyId, Details, GameSettings } = req.body;

    if (!ExperimentId || !StudyId || !Details || !GameSettings) {
      res.status(400).send(`{"result": "Failure", "params": {"ExperimentId": "${ExperimentId}", "StudyId": "${StudyId}",
                            "Details": "${Details}", "GameSettings": "${GameSettings}"}, "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM studies WHERE studyId = "${StudyId}"`, (error, results) => {
      if (error || !result.length) {
        res.status(400).send('{"result": "Failure", "error": "Study does not exist."}');
        return;
      }
    });

    let date = new Date();
    let CreationDate = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear();
    let Status = "Ready";

    connection.query(`INSERT INTO experiments (ExperimentId, StudyId, CreationDate, Status, Details, GameSettings) VALUES
                      ("${ExperimentId}", "${StudyId}", "${CreationDate}", "${Status}", "${Details}", "${GameSettings}")`,
                      (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else {
        res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
      }
    });
  },

  updateExperiment: async (req, res) => {
    const { ExperimentId, Status, Details, GameSettings } = req.body;

    if (!ExperimentId) {
      res.status(400).send('{"result": "Faliure", "error": "Experiment ID is required."}');
      return;
    }
    if (!Status && !Details && !GameSettings) {
      res.status(400).send('{"result": "Faliure", "error": "No parameters to update."}');
      return;
    }

    let setStr = "";
    if (Status) {
      setStr = `Status = "${Status}"`;
    }
    if (Details) {
      setStr = setStr.concat(`, Details = "${Details}"`);
    }
    if (GameSettings) {
      setStr = setStr.concat(`, GameSettings = "${GameSettings}"`);
    }
    if (setStr.charAt(0) == ",") {
      setStr = setStr.slice(2, setStr.length);
    }

    connection.query(`UPDATE experiments SET ${setStr} WHERE ExperimentId = "${ExperimentId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (results.affectedRows <= 0) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
      } else {
        res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
      }
    });
  },

  deleteExperiment: async (req, res) => {
    const { ExperimentId } = req.query;

    if (!ExperimentId) {
      res.status(400).send('{"result": "Faliure", "error": "Experiment ID is required."}');
      return;
    }

    connection.query(`DELETE FROM experiments WHERE ExperimentId = "${ExperimentId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (results.affectedRows <= 0) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
      } else {
        res.status(200).send(`{"result": "Success", "msg": "Experiment: ${ExperimentId} was deleted"}`);
      }
    });
  }
};
