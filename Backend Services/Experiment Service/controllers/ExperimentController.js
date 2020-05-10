var mysql = require("mysql");
const util = require('util');
var fetch = require("node-fetch");
var CodeGenerator = require('node-code-generator');
var generator = new CodeGenerator();

const { HOST, USER, PASSWORD, DATABASE } = process.env

var connection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE
});

connection.connect();
const query = util.promisify(connection.query).bind(connection);

async function verifyRequest(req) {
  const { userInfo, bearerKey } = req.body
  let verified = false;
  const json = {
    userInfo: userInfo,
    bearerKey: bearerKey
  }

  await fetch('https://yarr-user-management.herokuapp.com/verifyRequest', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json)
  }).then(res => res.json())
    .then(json => {
      if (json.result === "Success") {
        verified = true;
      }
      else {
        verified = false;
      }
    })
    .catch(err => { verified = false });

  return verified;
}

module.exports = {
  getExperiment: async (req, res) => {
    const { experimentId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

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
          RoundsNumber,
          RoundDuration,
          Disability,
          CharacterType,
          ColorSettings
        } = results[0];
        connection.query(`SELECT * FROM rounds WHERE ExperimentId = "${ExperimentId}"`, (error, results) => {
          if (error) {
            res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
          } else {
            let resStr = `{"result": "Success", "experiment": {"ExperimentId": "${ExperimentId}", "StudyId": "${StudyId}",
                          "CreationDate": "${CreationDate}", "Status": "${Status}", "Title": "${Title}",
                          "Details": "${Details}", "Disability": "${Disability}", "CharacterType": "${CharacterType}",
                          "ColorSettings": "${ColorSettings}", "RoundsNumber": "${RoundsNumber}",
                          "RoundDuration": "${RoundDuration}", "Rounds": [`;
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
  
  getInteruptedInstances: async (req, res) => {
    const { experimentId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!experimentId) {
      res.status(400).send('{"result": "Failure", "error": "Experiment ID is required."}');
      return;
    }

    connection.query(`SELECT * FROM interupted_instances WHERE ExperimentId = "${experimentId}"`, (error, results) => {
      if (error)
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);

      else if (!results.length)
        res.status(400).send(`{"result": "Failure", "error": "No instances found."}`);

      else
        res.status(200).send(`{"result": "Success", "instances": ${results}}`);      
    });
  },

  getAllStudyExperiments: async (req, res) => {
    const { studyId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

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
          RoundsNumber,
          RoundDuration,
          Disability,
          CharacterType,
          ColorSettings
        } = results[i];
        const roundsResults = await query(`SELECT * FROM rounds WHERE ExperimentId = "${ExperimentId}"`);
        resStr = resStr.concat(`{"ExperimentId": "${ExperimentId}", "StudyId": "${StudyId}",
                                      "CreationDate": "${CreationDate}", "Status": "${Status}", "Title": "${Title}",
                                      "Details": "${Details}", "Disability": "${Disability}", "CharacterType": "${CharacterType}",
                                      "ColorSettings": "${ColorSettings}", "RoundsNumber": "${RoundsNumber}",
                                      "RoundDuration": "${RoundDuration}", "Rounds": [`);
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
      roundsNumber,
      roundDuration,
      roundsSettings,
      disability,
      characterType,
      colorSettings
    } = req.body;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    let errorMsg = false

    if (studyId === undefined || !title || !details || characterType === undefined || !colorSettings === undefined
        || !roundsNumber || !roundsSettings || !roundDuration || disability === undefined) {
      res.status(400).send(`{"result": "Failure", "params": {"StudyId": "${studyId}", "Title": "${title}", "Details": "${details}",
                            "CharacterType": "${characterType}", "ColorSettings": "${colorSettings}",
                            "RoundsNumber": "${roundsNumber}", "RoundsSettings": "${roundsSettings}"},
                            "RoundDuration": "${roundDuration}", "Disability": "${disability}",
                            "error": "A parameter is missing."}`);
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
                      RoundsNumber, RoundDuration, Disability) VALUES (${studyId}, "${creationDate}", "${status}", "${title}",
                      "${details}", ${characterType}, ${colorSettings}, ${roundsNumber}, ${roundDuration}, ${disability})`,
                      (error, results) => {
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
      disability,
      characterType,
      colorSettings
    } = req.body;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!experimentId) {
      res.status(400).send('{"result": "Failure", "error": "Experiment ID is required."}');
      return;
    }
    if (!status && !title && !details && !disability && !characterType && !colorSettings) {
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
    if (disability) {
      setStr = setStr.concat(`, Disability = "${disability}"`);
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
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

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
        res.status(200).send(`{"result": "Success", "error": "Experiment: ${experimentId} was deleted"}`);
      }
    });
  },

  generateGameCode: async (req, res) => {
    const { experimentId, userInfo } = req.body;
    const pattern = '******';
    const howMany = 1;
    const options = { alphanumericRegex: /^[A-Z]\*(?!\+)/g };
    let found = false;
    let gameCode;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (experimentId === undefined || userInfo === undefined) {
      res.status(400).send(`{"result": "Failure", "error": "ExperimentId is required"}`);
      return;
    }

    /* check if experimentId exists in resreacher's data OR if gameCode already exists */
    try {
      let queryRes = await query(`SELECT * FROM main_view WHERE ResearcherId = ${userInfo.researcherId} AND ExperimentId = ${experimentId}`);
      if(!queryRes.length) {
        res.status(400).send(`{"result": "Failure", "error": "ExperimentId does not exist for this researcher"}`);
        return;
      }
      queryRes = await query(`SELECT * FROM game_codes WHERE ExperimentId = ${experimentId}`);
      
      /* code already exists for this experiment */
      if(queryRes.length){
        res.status(400).send(`{"result": "Failure", "error": "Game code already exists for this experiment"}`);
        return;
      }
    }
    catch(error) {
      res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      return;
    }

    /* generate code here */
    while(!found){
      let codes = generator.generateCodes(pattern, howMany, options);
      gameCode = codes[0];
      /* Check if code exists, if yes, generate again */
      try {
        let results = await query(`SELECT * FROM game_codes WHERE GameCode = "${gameCode}"`);
        if(!results.length) {
          found = true;
        }
      }
      catch(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
        return;
      }
    }

    connection.query(`INSERT INTO game_codes (GameCode, ExperimentId) VALUES ("${gameCode}", ${experimentId})`,
      (error, results) => {
        if (error) {
          res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
          return;
        }

        else if (results.affectedRows > 0){
          connection.query(`UPDATE experiments SET Status = "Running" WHERE ExperimentId = ${experimentId}`,
            (error, results) => {
              if (error) {
                res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
                return;
              }
              else if (results.affectedRows > 0) {
                res.status(200).send(`{"result": "Success", "gameCode": "${gameCode}"}`);
              }
              else res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
          );
        }
        else res.status(400).send(`{"result": "Failure", "error": "Failed to insert to database"}`);
      }
    );
  },

  stopExperiment: async (req, res) => {
    const { experimentId, userInfo } = req.body;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (experimentId === undefined || userInfo === undefined) {
      res.status(400).send(`{"result": "Failure", "error": "ExperimentId is required"}`);
      return;
    }

    /* check if experimentId exists in resreacher's data OR if gameCode already exists */
    try {
      let queryRes = await query(`SELECT * FROM main_view WHERE ResearcherId = ${userInfo.researcherId} AND ExperimentId = ${experimentId}`);
      if (!queryRes.length) {
        res.status(400).send(`{"result": "Failure", "error": "ExperimentId does not exist for this researcher"}`);
        return;
      }
    }
    catch (error) {
      res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      return;
    }

    connection.query(`DELETE FROM game_codes WHERE ExperimentId = ${experimentId}`,
      (error, results) => {
        if (error) {
          res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
          return;
        }

        else if (results.affectedRows > 0) {
          connection.query(`UPDATE experiments SET Status = "Stopped" WHERE ExperimentId = ${experimentId}`,
            (error, results) => {
              if (error) {
                res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
                return;
              }
              else if (results.affectedRows > 0) {
                res.status(200).send(`{"result": "Success"}`);
              }
              else res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
          );
        }
        else res.status(400).send(`{"result": "Failure", "error": "Experiment is not running or does not exists"}`);
      }
    );

  }
}
