var mysql = require("mysql");
var fetch = require("node-fetch");
const { HOST, USER, PASSWORD, DATABASE } = process.env

var connection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE
});

connection.connect();

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
  requestInsightMirror: async(req, res) => {
    const { researcherId, studyId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_mirror WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
      }
      else {
        let resultsStr = '{"result": "Success", "data": ['
        let i;
        for (i = 0; i < results.length; ++i) {
          let { StudyId, ResearcherId, AxisTime, AxisEngagement, BreakdownType, BreakdownName} = results[i];
          resultsStr = resultsStr.concat(`{"StudyId": "${StudyId}", "ResearcherId": "${ResearcherId}", "AxisTime": "${AxisTime}",
            "AxisEngagement": "${AxisEngagement}", "BreakdownType": "${BreakdownType}", "BreakdownName": "${BreakdownName}"}, `);
        }
        resultsStr = resultsStr.slice(0, -2);
        resultsStr = resultsStr.concat("]}");
        res.status(200).send(resultsStr);
      }
    });
  },

  requestInsightRadar: async(req, res) => {
    const { researcherId, studyId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_radar WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if (error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
      }
      else {
        let resultsStr = '{"result": "Success", "data": ['
        for (let i = 0; i < results.length; ++i) {
          let { 
            ExperimentTitle,
            HighestEngagement, 
            MeanEngagement, 
            MedianEngagement, 
            ModeEngagement, 
            RangeEngagement,
            RoundDuration,
            RoundsNumber,
            RoundsAmountComp,
            RoundsAmountCoop,
            CharacterType,
            Disability,
            ColorSettings
          } = results[i];
          resultsStr = resultsStr.concat(`{
            "ExperimentTitle": "${ExperimentTitle}",
            "HighestEngagement": "${HighestEngagement}",
            "MeanEngagement": "${MeanEngagement}",
            "MedianEngagement": "${MedianEngagement}",
            "ModeEngagement": "${ModeEngagement}",
            "RangeEngagement": "${RangeEngagement}",
            "RoundDuration": "${RoundDuration}",
            "RoundsNumber": "${RoundsNumber}",
            "RoundsAmountComp": "${RoundsAmountComp}",
            "RoundsAmountCoop": "${RoundsAmountCoop}",
            "CharacterType": "${CharacterType}",
            "Disability": "${Disability}",
            "ColorSettings": "${ColorSettings}"
          }, `);
        }
        resultsStr = resultsStr.slice(0, -2);
        resultsStr = resultsStr.concat("]}");
        res.status(200).send(resultsStr);
      }
    });
  },

  requestInsightMixed: async(req, res) => {
    const { researcherId, studyId} = req.body;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_mixed WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
        return;
      }
    });
  },

  requestInsightPie: async(req, res) => {
    const { researcherId, studyId} = req.body;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_pie WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
        return;
      }
    });
  }

}