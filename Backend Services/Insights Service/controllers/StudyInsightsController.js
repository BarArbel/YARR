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
        let types = [];
        let dataSets = [];

        results.map(line => {
          !types.find(element => { return element === line.BreakdownType }) && types.push(line.BreakdownType);
          return null;
        })

        for (let i = 0; i < types.length; ++i){
          const filteredData = results.filter(element => { return element.BreakdownType === types[i] });
          const tempData = [];
          const tempNames = [];
          filteredData.map(element => {
            tempData.push({ 
              time: parseInt(element.AxisTime), 
              value: parseInt(element.AxisEngagement), 
              BreakdownName: element.BreakdownName 
            });
            !tempNames.find(name => name === element.BreakdownName) && tempNames.push(element.BreakdownName);
            return null;
          });

          let dataSet = [];
          
          for (let j = 3; dataSet.length < tempData.length / tempNames.length; j += 3) {
            let tempFiltered = tempData.filter(element => parseInt(element.time) === j);
            let tempNames = []
            tempFiltered.map(line => { 
              tempNames.push(line.BreakdownName);
              return null;
            });

            if (!tempFiltered || !tempFiltered.length) {
              continue;
            }
  
            if (!dataSet.length) {
              dataSet.push({
                type: types[i],
                time: 0,
                [tempFiltered[0].BreakdownName]: 0,
                [tempFiltered[1].BreakdownName]: 0,
                names: tempNames
              });
            }
  
            dataSet.push({
              type: types[i],
              time: parseInt(tempFiltered[0].time),
              [tempFiltered[0].BreakdownName]: tempFiltered[0].value,
              [tempFiltered[1].BreakdownName]: tempFiltered[1].value,
              names: tempNames
            });
          }

          dataSets.push(dataSet);
        }

        res.status(200).send(`{"result": "Success", "types": ${JSON.stringify(types)}, "dataSets": ${JSON.stringify(dataSets)}}`);
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
        let data = []
        results.map(line => {
          data.push({
            experiment: line.ExperimentTitle,
            highest: parseInt(line.HighestEngagement),
            mean: parseInt(line.MeanEngagement),
            median: parseInt(line.MedianEngagement),
            mode: parseInt(line.ModeEngagement),
            range: parseInt(line.RangeEngagement)
          });
          return null;
        });
        res.status(200).send(`{"result": "Success", "data": ${JSON.stringify(data)}}`);
      }
    });
  },

  requestAllInsightMixed: async (req, res) => {
    const { researcherId, studyId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!researcherId || !studyId) {
      res.status(400).send(`{"result": "Failure", "params": {"researcherId": "${researcherId}",
          "studyId": "${studyId}"},
          "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_mixed WHERE ResearcherId = "${researcherId}" AND StudyId = "${studyId}"`, (error, results) => {
      if (error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
      }
      else {
        let dataSets = [];
        let experimentNames = [];
        let names = ["Difficulty", "ResponseTime"];
        let tempResults = results;
        while(tempResults.length) {
          let data = [];
          let filteredResults = tempResults.filter(line => line.ExperimentTitle === tempResults[0].ExperimentTitle);
          tempResults = tempResults.filter(line => line.ExperimentTitle !== tempResults[0].ExperimentTitle);
          experimentNames.push(filteredResults[0].ExperimentTitle);
          filteredResults = filteredResults.sort((a, b) => parseInt(a.TimeAxis) - parseInt(b.TimeAxis));
          let currDiff = 0;
          filteredResults.map(line => {
            currDiff += parseInt(line.DifficultyChange);
            data.push({ time: line.TimeAxis, ResponseTime: line.ResponseTime, Difficulty: currDiff, experimentTitle: line.ExperimentTitle });
          });

          dataSets.push(data);
        }
        res.status(200).send(`{"result": "Success", "dataSets": ${JSON.stringify(dataSets)}, "experimentNames": ${JSON.stringify(experimentNames)}, "names": ${JSON.stringify(names)}}`);
      }
    });
  },

  requestInsightBars: async(req, res) => {
    const { researcherId, studyId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!researcherId || !studyId) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_bar WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
      }

      else {
        const { Mode } = results[0];
        const coopIndex = Mode === "coop" ? 0 : 1
        const coopData = results[coopIndex];
        const compData = results[1 - coopIndex];

        let data = [
          { name: "Coop Items", Taken: coopData.PercentItemsTaken, Missed: coopData.PercentItemsMissed }, 
          { name: "Comp Items", Taken: compData.PercentItemsTaken, Missed: compData.PercentItemsMissed }, 
          { name: "Coop Enemies", Avoid: coopData.PercentEnemiesAvoid, Hit: coopData.PercentEnemiesHit, Blocked: coopData.PercentEnemiesBlock }, 
          { name: "Comp Enemies", Avoid: compData.PercentEnemiesAvoid, Hit: compData.PercentEnemiesHit, Blocked: compData.PercentEnemiesBlock }, 
        ];

        res.status(200).send(`{"result": "Success", "data": ${JSON.stringify(data)}}`);
      }
    });
  }

}