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
const query = util.promisify(connection.query).bind(connection);

async function verifyRequest(userInfo, bearerKey) {
  let retVal = false;
  const json = {
    userInfo: userInfo,
    bearerKey: bearerKey
  }

  await fetch('http://localhost:3001/verifyRequest', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json)
  }).theמ(res => res.json())
    .then(json => {
      if (json.result === "Success") {
        retVal = true;
      }
      else {
        retVal = false;
      }
    })
    .catch(err => { retVal = false });

  return retVal;
}

module.exports = {
  getExperiment: async (req, res) => {
    const { experimentId } = req.query;

    if (!experimentId) {
      res.status(400).send('{"result": "Failure", "error": "Experiment ID is required."}');
      return;
    }

    connection.query(`SELECT * FROM experiments WHERE ExperimentId = "${experimentId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
      } else {
        let {
          ExperimentId,
          StudyId,
          CreationDate,
          Status,
          Title,
          Details,
          CharacterType,
          ColorSettings,
          RoundsNumber
        } = results[0];
        connection.query(`SELECT * FROM rounds WHERE ExperimentId = "${ExperimentId}"`, (error, results) => {
          if (error) {
            res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
          } else {
            let resStr = `{"result": "Success", "experiment": {"ExperimentId": "${ExperimentId}", "StudyId": "${StudyId}",
                          "CreationDate": "${CreationDate}", "Status": "${Status}", "Title": "${Title}",
                          "Details": "${Details}", "CharacterType": "${CharacterType}",
                          "ColorSettings": "${ColorSettings}", "RoundsNumber": "${RoundsNumber}", "Rounds": [`;
            for (let i = 0; i < results.length; ++i) {
              let { RoundId, RoundNumber, GameMode, Difficulty } = results[i];
              resStr = resStr.concat(`{"RoundId": "${RoundId}", "RoundNumber": "${RoundNumber}",
                                      "GameMode": "${GameMode}", "Difficulty": "${Difficulty}"}, `);
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
    const { studyId } = req.query;
    let resStr;

    if (!studyId) {
      res.status(400).send('{"result": "Failure", "error": "Study ID is required."}');
      return;
    }

    try {
      const results = await query(`SELECT * FROM experiments WHERE StudyId = "${studyId}"`);
      if (!results.length){
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
        return;
      }

      resStr = `{"result": "Success", "experiments": [`;
      for (let i = 0; i < results.length; ++i) {
        let {
          ExperimentId,
          StudyId,
          CreationDate,
          Status,
          Title,
          Details,
          CharacterType,
          ColorSettings,
          RoundsNumber
        } = results[i];
        const roundsResults = await query(`SELECT * FROM rounds WHERE ExperimentId = "${ExperimentId}"`);
        resStr = resStr.concat(`{"ExperimentId": "${ExperimentId}", "StudyId": "${StudyId}",
                                      "CreationDate": "${CreationDate}", "Status": "${Status}", "Title": "${Title}",
                                      "Details": "${Details}", "CharacterType": "${CharacterType}",
                                      "ColorSettings": "${ColorSettings}", "RoundsNumber": "${RoundsNumber}", "Rounds": [`);
        for (let j = 0; j < roundsResults.length; ++j) {
          let { RoundId, RoundNumber, GameMode, Difficulty } = roundsResults[j];
          resStr = resStr.concat(`{"RoundId": "${RoundId}", "RoundNumber": "${RoundNumber}",
                  "GameMode": "${GameMode}", "Difficulty": "${Difficulty}"}, `);
        }
        resStr = resStr.slice(0, -2);
        resStr = resStr.concat("]}, ");
      }
    }
    catch(err){
      res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(roundsError)}}`);
      return;
    }

    resStr = resStr.slice(0, -2);
    resStr = resStr.concat("]}");
    res.status(200).send(resStr);
  },

  addExperiment: async (req, res) => {
    const {
      studyId,
      title,
      details,
      characterType,
      colorSettings,
      roundsNumber,
      roundsSettings
    } = req.body;

    let errorMsg = false

    if (studyId === undefined || !title || !details || characterType === undefined || !colorSettings === undefined
        || !roundsNumber || !roundsSettings) {
      res.status(400).send(`{"result": "Failure", "params": {"StudyId": "${studyId}", "Title": "${title}", "Details": "${details}",
                            "CharacterType": "${characterType}", "ColorSettings": "${colorSettings}",
                            "RoundsNumber": "${roundsNumber}", "RoundsSettings": "${roundsSettings}"},
                            "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM studies WHERE studyId = "${studyId}"`, (error, results) => {
      if (error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "Study does not exist."}');
        return;
      }
    });

    let date = new Date();
    let day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
    let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    let creationDate = `${day}/${month}/${date.getFullYear()}`;
    let status = "Ready";

    connection.query(`INSERT INTO experiments (StudyId, CreationDate, Status, Title, Details, CharacterType, ColorSettings,
                      RoundsNumber) VALUES (${studyId}, "${creationDate}", "${status}", "${title}", "${details}",
                      "${characterType}", "${colorSettings}", ${roundsNumber})`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
        return;
      } 
      else {
        for (let i = 0; i < roundsSettings.length && !errorMsg; ++i) {
          connection.query(`INSERT INTO rounds (ExperimentId, RoundNumber, GameMode, Difficulty) VALUES (
                          "${results.insertId}", "${i}", "${roundsSettings[i].GameMode}", "${roundsSettings[i].Difficulty}")`,
                            (roundsError, results) => {
            if(roundsError) {
              console.log(roundsError)
              errorMsg = true;
            }
          });
        }
        errorMsg ? res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(roundsError)}}`) : res.status(200).send(`{"result": "Success"}`);
      }
    });
  },

  updateExperiment: async (req, res) => {
    const {
      experimentId,
      status,
      title,
      details,
      characterType,
      colorSettings
    } = req.body;

    if (!experimentId) {
      res.status(400).send('{"result": "Failure", "error": "Experiment ID is required."}');
      return;
    }
    if (!status && !title && !details && !characterType && !colorSettings) {
      res.status(400).send('{"result": "Failure", "error": "No parameters to update."}');
      return;
    }

    let setStr = "";
    if (status) {
      setStr = `Status = "${status}"`;
    }
    if (title) {
      setStr = setStr.concat(`, Title = "${title}"`);
    }
    if (details) {
      setStr = setStr.concat(`, Details = "${details}"`);
    }
    if (characterType) {
      setStr = setStr.concat(`, CharacterType = "${characterType}"`);
    }
    if (colorSettings) {
      setStr = setStr.concat(`, ColorSettings = "${colorSettings}"`);
    }
    if (setStr.charAt(0) === ",") {
      setStr = setStr.slice(2, setStr.length);
    }

    connection.query(`UPDATE experiments SET ${setStr} WHERE ExperimentId = "${experimentId}"`, (error, results) => {
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
    const { experimentId } = req.query;

    if (!experimentId) {
      res.status(400).send('{"result": "Failure", "error": "Experiment ID is required."}');
      return;
    }

    connection.query(`DELETE FROM experiments WHERE ExperimentId = "${experimentId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      } else if (results.affectedRows <= 0) {
        res.status(400).send(`{"result": "Failure", "error": "No experiments found."}`);
      } else {
        res.status(200).send(`{"result": "Success", "msg": "Experiment: ${experimentId} was deleted"}`);
      }
    });
  }
};
