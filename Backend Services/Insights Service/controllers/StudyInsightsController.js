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
  requestInsightMirror: async(req, res) => {
    const { researcherId, studyId } = req.query;

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM Study_Insights_Mirror WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
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

    if (!researcherId || !studyId ) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM Study_Insights_Radar WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
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