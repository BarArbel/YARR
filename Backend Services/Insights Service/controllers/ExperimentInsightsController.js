var fetch = require("node-fetch");
const { connection } = require('../database.js');

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
  requestInsightMixed: async (req, res) => {
    const { researcherId, experimentId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!researcherId || !experimentId) {
      res.status(400).send(`{"result": "Failure", "params": {"researcherId": "${researcherId}",
          "experimentId": "${experimentId}"},
          "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_mixed WHERE ResearcherId = "${researcherId}" AND ExperimentId = "${experimentId}"`, (error, results) => {
      if (error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or ExperimentId does not exist."}');
      }
      else {
        let tempRes = results.sort((a, b) => parseInt(a.TimeAxis) - parseInt(b.TimeAxis));
        let data = [{ time: 0, ResponseTime: 0, Difficulty: 0 }];
        let names = ["Difficulty", "ResponseTime"];
        let currDiff = 0;
        tempRes.map(line => {
          currDiff += parseInt(line.DifficultyChange);
          data.push({ time: line.TimeAxis, ResponseTime: line.ResponseTime, Difficulty: currDiff });
        });

        res.status(200).send(`{"result": "Success", "data": ${JSON.stringify(data)}, "names": ${JSON.stringify(names)}}`);
      }
    });
  },

  requestRawData: async (req, res) => {
    const { experimentId } = req.query;
    const verified = await verifyRequest(req);

    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!experimentId) {
      res.status(400).send(`{"result": "Failure", "params": {"ExperimentId": "${experimentId}"}, "msg": "A parameter is missing."}`);
      return;
    }

    const sql = `SELECT Title, InstanceID, GameMode, Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy
                FROM yarr.raw_data LEFT JOIN experiments ON raw_data.ExperimentID = experiments.ExperimentId 
                WHERE experiments.ExperimentId = ${experimentId};`

    connection.query(sql, (error, results) => {
      if (error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "No insights for ExperimentId exist."}');
      }

      else {
        let data = [
          ["ExperimentTitle", "InstanceID", "GameMode", "Timestamp", "Event", "PlayerID", "CoordX", "CoordY", "Item", "Enemy"]
        ];

        results.map(line => {
          const {
            InstanceID,
            Event,
            PlayerID,
            CoordX,
            CoordY,
            Item,
            Enemy,
            GameMode,
            Title,
            Timestamp
          } = line;
          data.push([Title, InstanceID, GameMode, Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy]);
        });

        res.status(200).send(`{"result": "Success", "data": ${JSON.stringify(data)}}`);
      }
    });
  }
}
