var mysql = require('mysql');

const { HOST, USER, PASSWORD, DATABASE } = process.env

var connection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE
});

connection.connect();

async function verifyRequest(userInfo, bearerKey){
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
  getStudy: async(req, res) => {
    const { StudyId } = req.query;

    if(!StudyId) {
      res.status(400).send('{"result": "Faliure", "error": "Study ID is required."}');
      return;
    }

    connection.query(`SELECT * FROM studies WHERE StudyId = "${StudyId}"`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      }
      else if(!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "No studies found."}`);
      }
      else {
        let { res_studyId, res_ResearcherId, res_title, res_studyQuestions, res_description } = results[0];
        res.status(200).send(`{"result": "Success", "study": {"StudyId": "${res_studyId}", "ResearcherId": "${res_ResearcherId}",
          "Title": "${res_title}", "StudyQuestions": "${res_studyQuestions}", "Description": "${res_description}"}}`);
      }
    });
  },

  getAllResearcherStudies: async(req, res) => {
    const { ResearcherId } = req.query;

    if(!ResearcherId) {
      res.status(400).send('{"result": "Faliure", "error": "ResearcherId is required."}');
      return;
    }
    connection.query(`SELECT * FROM studies WHERE ResearcherId = ${ResearcherId}`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      }
      else if(!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "No studies found."}`);
      }
      else {
        let resultsStr = '{"result": "Success", "studies": ['
        let i;
        for(i = 0; i < results.length; ++i) {
          let { StudyId, ResearcherId, Title, StudyQuestions, Description } = results[i];
          resultsStr = resultsStr.concat(`{"StudyId": "${StudyId}", "ResearcherId": "${ResearcherId}", "Title": "${Title}",
            "StudyQuestions": "${StudyQuestions}", "Description": "${Description}"}, `);
        }
        resultsStr = resultsStr.slice(0, -2);
        resultsStr = resultsStr.concat("]}");
        res.status(200).send(resultsStr);
      }
    });
  },

  addStudy: async(req, res) => {
    const { ResearcherId, Title, StudyQuestions, Description } = req.body;

    if(!ResearcherId || !Title || !StudyQuestions || !Description) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${ResearcherId}",
        "Title": "${Title}", "StudyQuestions": "${StudyQuestions}", "Description": "${Description}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM researchers WHERE ResearcherId = "${ResearcherId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId does not exist."}');
        return;
      }
    });

    connection.query(`INSERT INTO studies (ResearcherId, Title, StudyQuestions, Description) VALUES ("${ResearcherId}", 
      "${Title}", "${StudyQuestions}", "${Description}")`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      }
      else {
        res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
      }
    });
  },

  updateStudy: async(req, res) => {
    const { StudyId, Title, StudyQuestions, Description } = req.body;

    if(!StudyId) {
      res.status(400).send('{"result": "Faliure", "error": "Study ID is required."}');
      return;
    }
    if(!Title && !StudyQuestions && !Description) {
      res.status(400).send('{"result": "Faliure", "error": "No parameters to update."}')
      return;
    }

    let setStr = "";
    if(Title) {
      setStr = `Title = "${Title}"`;
    }
    if(StudyQuestions) {
      setStr = setStr.concat(`, StudyQuestions = "${StudyQuestions}"`);
    }
    if(Description) {
      setStr = setStr.concat(`, Description = "${Description}"`);
    }
    if(setStr.charAt(0) == ',') {
      setStr = setStr.slice(2, setStr.length);
    }

    connection.query(`UPDATE studies SET ${setStr} WHERE StudyId = "${StudyId}"`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      }
      else if(results.affectedRows <= 0) {
        res.status(400).send(`{"result": "Failure", "error": "No studies found or there was nothing to update."}`);
      }
      else {
        res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
      }
    });
  },

  deleteStudy: async(req, res) => {
    const { StudiesId } = req.query;

    if(!StudiesId) {
      res.status(400).send('{"result": "Faliure", "error": "Study ID is required."}');
      return;
    }

    connection.query(`DELETE FROM studies WHERE StudyId = "${StudyId}"`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
        return;
      }
      else if(results.affectedRows <= 0) {
        res.status(400).send(`{"result": "Failure", "error": "No studies found."}`);
        return;
      }
      else {
        connection.query(`DELETE FROM experiments WHERE StudyId = "${StudyId}"`, (error, results) => {
          if(error) {
            res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
          }
          else {
            res.status(200).send(`{"result": "Success", "msg": "Study: ${StudyId} experiments were deleted"}`);
          }
        });
      }
    });

    
  }
}
