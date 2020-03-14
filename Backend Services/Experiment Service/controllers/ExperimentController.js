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
      res.status(400).send('{"result": "Failure", "error": "Experiment ID is required."}');
      return;
    }

    connection.query(`SELECT * FROM experiments WHERE ExperimentId = "${ExperimentId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
      } else {
        let {
          res_experimentId,
          res_studyId,
          res_creationDate,
          res_status,
          res_title,
          res_details,
          res_characterType,
          res_colorSettings,
          res_roundsNumber
        } = results[0];
        connection.query(`SELECT * FROM rounds WHERE ExperimentId = "${ExperimentId}"`, (error, results) => {
          if (error) {
            res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
          } else {
            let resStr = `{"result": "Success", "experiment": {"ExperimentId": "${res_experiemntId}", "StudyId": "${res_studyId}",
                          "CreationDate": "${res_creationDate}", "Status": "${res_status}", "Title": "${res_title}",
                          "Details": "${res_details}", "CharacterType": "${res_characterType}",
                          "ColorSettings": "${res_colorSettings}", "RoundsNumber": "${res_roundsNumber}", "Rounds": [`;
            for (let i = 0; i < results.length; ++i) {
              let { res_roundId, res_roundNumber, res_gameMode, res_difficulty } = results[i];
              resStr = resStr.concat(`{"RoundId": "${res_roundId}", "RoundNumber": "${res_roundNumber}",
                                      "GameMode": "${res_gameMode}", "Difficulty": "${res_difficulty}"}, `);
            }
            resStr = resStr.slice(0, -2);
            resStr = resStr.concat("]}}");
            res.status(200).send(resStr);
          }
        });
      }
    });
  },
  
  getAllStudyExperiments: async (req, res) => {
    const { StudyId } = req.query;

    if (!StudyId) {
      res.status(400).send('{"result": "Failure", "error": "Study ID is required."}');
      return;
    }

    connection.query(`SELECT * FROM experiments WHERE StudyId = "${StudyId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
      } else {
        let resStr = `{"result": "Success", "experiments": [`;
        for(let i = 0; i < results.length; ++i) {
          let {
            res_experimentId,
            res_studyId,
            res_creationDate,
            res_status,
            res_title,
            res_details,
            res_characterType,
            res_colorSettings,
            res_roundsNumber
          } = results[i];
          connection.query(`SELECT * FROM rounds WHERE ExperimentId = "${res_experimentId}"`, (roundsError, roundsResults) => {
            if(roundsError) {
              res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(roundsError)}}`);
            } else {
              resStr = resStr.concat(`{"ExperimentId": "${res_experiemntId}", "StudyId": "${res_studyId}",
                                      "CreationDate": "${res_creationDate}", "Status": "${res_status}", "Title": "${res_title}",
                                      "Details": "${res_details}", "CharacterType": "${res_characterType}",
                                      "ColorSettings": "${res_colorSettings}", "RoundsNumber": "${res_roundsNumber}", "Rounds": [`);
              for(let j = 0; j < roundsResults.length; ++j) {
                let { res_roundId, res_roundNumber, res_gameMode, res_difficulty } = roundsResults[j];
                resStr = resStr.concat(`{"RoundId": "${res_roundId}", "RoundNumber": "${res_roundNumber}",
                                        "GameMode": "${res_gameMode}", "Difficulty": "${res_difficulty}"}, `)
              }
              resStr = resStr.slice(0, -2);
              resStr = resStr.concat("]}, ");
            }
          });
        }
        resStr = resStr.slice(0, -2);
        resStr = resStr.concat("]}");
        res.status(200).send(resStr);
      }
    });
  },

  addExperiment: async (req, res) => {
    const {
      StudyId,
      Title,
      Details,
      CharacterType,
      ColorSettings,
      RoundsNumber,
      RoundsSettings
    } = req.body;

    if (!StudyId || !Title || !Details || !CharacterType || !ColorSettings || !RoundsNumber || !RoundsSettings) {
      res.status(400).send(`{"result": "Failure", "params": {"StudyId": "${StudyId}", "Title": "${Title}", "Details": "${Details}",
                            "CharacterType": "${CharacterType}", "ColorSettings": "${ColorSettings}",
                            "RoundsNumber": "${RoundsNumber}", "RoundsSettings": "${RoundsSettings}"},
                            "msg": "A parameter is missing."}`);
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

    connection.query(`INSERT INTO experiments (StudyId, CreationDate, Status, Title, Details, CharacterType, ColorSettings,
                      RoundsNumber) VALUES ("${StudyId}", "${CreationDate}", "${Status}", "${Title}, "${Details}",
                      "${CharacterType}", "${ColorSettings}", "${RoundsNumber}")`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else {
        for(let i = 0; i < RoundsSettings.length; ++i) {
          connection.query(`INSERT INTO rounds (ExperimentId, RoundNumber, GameMode, Difficulty) VALUES (
                            "${results.insertId}", "${i}", "${RoundsSettings[i].GameMode}", "${RoundsSettings[i].Difficulty}")`,
                            (roundsError, roundsResults) => {
            if(roundsError) {
              res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
          });
        }
        res.status(200).send(`{"result": "Success"}`);
      }
    });
  },

  updateExperiment: async (req, res) => {
    const {
      ExperimentId,
      Status,
      Title,
      Details,
      CharacterType,
      ColorSettings
    } = req.body;

    if (!ExperimentId) {
      res.status(400).send('{"result": "Failure", "error": "Experiment ID is required."}');
      return;
    }
    if (!Status && !Title && !Details && !CharacterType && !ColorSettings) {
      res.status(400).send('{"result": "Failure", "error": "No parameters to update."}');
      return;
    }
    if (Status !== "Ready" && (CharacterType || ColorSettings)) {
      res.status(400).send('{"result": "Failure", "error": "Game settings cannot be changed after an experiment as started"}');
      return;
    }

    let setStr = "";
    if (Status) {
      setStr = `Status = "${Status}"`;
    }
    if (Title) {
      setStr = setStr.concat(`, Title = "${Title}"`);
    }
    if (Details) {
      setStr = setStr.concat(`, Details = "${Details}"`);
    }
    if (CharacterType) {
      setStr = setStr.concat(`, CharacterType = "${CharacterType}"`);
    }
    if (ColorSettings) {
      setStr = setStr.concat(`, ColorSettings = "${ColorSettings}"`);
    }
    if (setStr.charAt(0) == ",") {
      setStr = setStr.slice(2, setStr.length);
    }

    connection.query(`UPDATE experiments SET ${setStr} WHERE ExperimentId = "${ExperimentId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (results.affectedRows <= 0) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found or there was nothing to update."}`);
      } else {
        res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
      }
    });
  },

  deleteExperiment: async (req, res) => {
    const { ExperimentId } = req.query;

    if (!ExperimentId) {
      res.status(400).send('{"result": "Failure", "error": "Experiment ID is required."}');
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
