var fetch = require("node-fetch");
const { connection, promisify_query } = require('../database.js');
const { query } = require("express");

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
      res.status(204).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_mirror WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"
      ORDER BY study_insights_mirror.AxisTime DESC`, (error, results) => {
      if(error || !results.length) {
        res.status(204).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
      }
      else {
        let types = [];
        let dataSets = [];

        results.map(line => {
          !types.find(element => { return element === line.BreakdownType }) && types.push(line.BreakdownType);
          return null;
        })

        for (let i = 0; i < types.length; ++i) {
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
          for (let j = 0; j < tempData[0].time; j += 1) {
            let tempFiltered = tempData.filter(element => parseInt(element.time) === j);

            if (!tempFiltered || !tempFiltered.length) {
              continue;
            }

            if (!dataSet.length) {
              switch (tempNames.length) {
                case 1: {
                  dataSet.push({
                    types: types[i],
                    time: 0,
                    [tempNames[0]]: 0,
                    names: tempNames
                  });
                  break;
                }

                case 2: {
                  dataSet.push({
                    types: types[i],
                    time: 0,
                    [tempNames[0]]: 0,
                    [tempNames[1]]: 0,
                    names: tempNames
                  });
                  break;
                }

                case 3: {
                  dataSet.push({
                    types: types[i],
                    time: 0,
                    [tempNames[0]]: 0,
                    [tempNames[1]]: 0,
                    [tempNames[2]]: 0,
                    names: tempNames
                  });
                  break;
                }
              }
            }

            switch (tempFiltered.length) {
              case 1: {
                dataSet.push({
                  types: types[i],
                  time: parseInt(tempFiltered[0].time),
                  [tempFiltered[0].BreakdownName]: tempFiltered[0].value,
                  names: tempNames
                });
                break;
              }

              case 2: {
                dataSet.push({
                  types: types[i],
                  time: parseInt(tempFiltered[0].time),
                  [tempFiltered[0].BreakdownName]: tempFiltered[0].value,
                  [tempFiltered[1].BreakdownName]: tempFiltered[1].value,
                  names: tempNames
                });
                break;
              }

              case 3: {
                dataSet.push({
                  types: types[i],
                  time: parseInt(tempFiltered[0].time),
                  [tempFiltered[0].BreakdownName]: tempFiltered[0].value,
                  [tempFiltered[1].BreakdownName]: tempFiltered[1].value,
                  [tempFiltered[2].BreakdownName]: tempFiltered[2].value,
                  names: tempNames
                });
                break;
              }
            }
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
      res.status(204).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    try{
      const radar_result = await promisify_query(`SELECT * FROM study_insights_radar WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`);
      if(!radar_result.length) {
        res.status(204).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
        return;
      }
      else {
        let data = [];
        let title_result;
        for(let i = 0; i < radar_result.length; ++i) {
          title_result = await promisify_query(`SELECT Title FROM experiments WHERE ExperimentId = "${radar_result[i].ExperimentId}"`);
          if(!title_result.length) {
            res.status(204).send('{"result": "Failure", "error": "ExperimentId does not exist."}')
            return;
          }
          else {
            data.push({
              experiment: title_result[0].Title,
              highest: parseInt(radar_result[i].HighestEngagement),
              mean: parseInt(radar_result[i].MeanEngagement),
              median: parseInt(radar_result[i].MedianEngagement),
              mode: parseInt(radar_result[i].ModeEngagement),
              range: parseInt(radar_result[i].RangeEngagement)
            })
          }
        }
        res.status(200).send(`{"result": "Success", "data": ${JSON.stringify(data)}}`);
        return;
      }
    }
    catch(err){
      res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(err)}}`);
      return;
    }
  },

  requestAllInsightMixed: async (req, res) => {
    const { researcherId, studyId } = req.query;
    const verified = await verifyRequest(req);
    if (!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if (!researcherId || !studyId) {
      res.status(204).send(`{"result": "Failure", "params": {"researcherId": "${researcherId}",
          "studyId": "${studyId}"},
          "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_mixed WHERE ResearcherId = "${researcherId}" AND StudyId = "${studyId}"`, (error, results) => {
      if (error || !results.length) {
        res.status(204).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
      }
      else {
        let dataSets = [];
        let experimentNames = [];
        let names = ["Difficulty", "ResponseTime"];
        let tempResults = results;
        let experiments = "";
        let experimentIds = [];
        for(i = 0; i < tempResults.length; ++i) {
          if(!experimentIds.includes(tempResults[i].ExperimentId)) {
            experimentIds.push(tempResults[i].ExperimentId);
            experiments = experiments.concat(`ExperimentId = ${tempResults[i].ExperimentId} OR `);
          }
        }
        // Remove the last " OR " from the string
        experiments = experiments.slice(0, -4);
        let title_query = "SELECT ExperimentId, Title FROM experiments WHERE" + experiments;
        connection.query(title_query, (error, title_res) => {
          if (error || !title_res.length) {
            res.status(204).send('{"result": "Failure", "error": "ExperimentId does not exist."}');
          }
          else {
            while(tempResults.length) {
              let data = [];
              let filteredResults = tempResults.filter(line => line.ExperimentId === title_res[0].ExperimentId);
              tempResults = tempResults.filter(line => line.ExperimentId !== title_res[0].ExperimentId);
              experimentNames.push(title_res[0].Title);
              title_res = title_res.filter(line => line.ExperimentId !== title_res[0].ExperimentId);
              filteredResults = filteredResults.sort((a, b) => parseInt(a.TimeAxis) - parseInt(b.TimeAxis));
              let currDiff = 0;
              filteredResults.map(line => {
                currDiff += parseInt(line.DifficultyChange);
                data.push({ time: line.TimeAxis, ResponseTime: line.ResponseTime, Difficulty: currDiff, experimentTitle: title_res[0].Title });
              });

              dataSets.push(data);
            }
            res.status(200).send(`{"result": "Success", "dataSets": ${JSON.stringify(dataSets)}, "experimentNames": ${JSON.stringify(experimentNames)}, "names": ${JSON.stringify(names)}}`);
          }
        });
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
      res.status(204).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "StudyId": "${studyId}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM study_insights_bar WHERE ResearcherId = "${researcherId}" AND studyId = "${studyId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(204).send('{"result": "Failure", "error": "ResearcherId or StudyId does not exist."}');
      }

      else {
        let data;

        if(results.length > 1){
          const { Mode } = results[0];
          const coopIndex = Mode === "Coopertive" ? 0 : 1
          const coopData = results[coopIndex];
          const compData = results[1 - coopIndex];
  
          data = [
            { name: "Coop Items", Captured: coopData.PercentItemsCaptured, Missed: coopData.PercentItemsMissed }, 
            { name: "Comp Items", Captured: compData.PercentItemsCaptured, Missed: compData.PercentItemsMissed }, 
            { name: "Coop Enemies", Avoid: coopData.PercentEnemiesAvoid, Hit: coopData.PercentEnemiesHit, Blocked: coopData.PercentEnemiesBlock }, 
            { name: "Comp Enemies", Avoid: compData.PercentEnemiesAvoid, Hit: compData.PercentEnemiesHit, Blocked: compData.PercentEnemiesBlock }, 
          ];
        }

        /* Only one mode played */
        else {
          const { Mode } = results[0];
          const tempData = results[0];
          if(Mode === "Cooperative") {
            data = [
              { name: "Coop Items", Captured: tempData.PercentItemsCaptured, Missed: tempData.PercentItemsMissed },
              { name: "Coop Enemies", Avoid: tempData.PercentEnemiesAvoid, Hit: tempData.PercentEnemiesHit, Blocked: tempData.PercentEnemiesBlock },
            ];
          }
          else {
            data = [
              { name: "Comp Items", Captured: tempData.PercentItemsCaptured, Missed: tempData.PercentItemsMissed },
              { name: "Comp Enemies", Avoid: tempData.PercentEnemiesAvoid, Hit: tempData.PercentEnemiesHit, Blocked: tempData.PercentEnemiesBlock },
            ];
          }
        }

        res.status(200).send(`{"result": "Success", "data": ${JSON.stringify(data)}}`);
      }
    });
  },

  requestAllRawData: async(req, res) => {
    const { studyId } = req.query;
    const verified = await verifyRequest(req);
    
    if(!verified) {
      res.status(403).send('{"result": "Faliure", "error": "Unauthorized request"}');
      return;
    }

    if(!studyId) {
      res.status(204).send(`{"result": "Failure", "params": {"StudyId": "${studyId}"}, "msg": "A parameter is missing."}`);
      return;
    }

    const sql = `SELECT  Title, InstanceID, GameMode, Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy
                FROM yarr.raw_data LEFT JOIN (SELECT sid,eid,Title FROM 
                (SELECT StudyId sid, ExperimentId eid FROM yarr.main_view) AS mv 
                LEFT JOIN yarr.experiments ON ExperimentId = eid) exp_data ON ExperimentID = eid WHERE sid = ${studyId};`

    connection.query(sql, (error, results) => {
      if (error || !results.length) {
        res.status(204).send('{"result": "Failure", "error": "No insights for StudyId exist."}');
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