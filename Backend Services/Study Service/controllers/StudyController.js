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
    const { studyId } = req.query;

    if (!studyId) {
      res.status(400).send('{"result": "Faliure", "error": "Study ID is required."}');
      return;
    }

    connection.query(`SELECT * FROM studies WHERE StudyId = "${studyId}"`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      }
      else if(!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "No studies found."}`);
      }
      else {
        let { StudyId, ResearcherId, Title, StudyQuestions, Description } = results[0];
        res.status(200).send(`{"result": "Success", "study": {"StudyId": "${StudyId}", "ResearcherId": "${ResearcherId}",
          "Title": "${Title}", "StudyQuestions": "${StudyQuestions}", "Description": "${Description}"}}`);
      }
    });
  },

  getAllResearcherStudies: async(req, res) => {
    const { researcherId } = req.query;

    if (!researcherId) {
      res.status(400).send('{"result": "Faliure", "error": "ResearcherId is required."}');
      return;
    }
    connection.query(`SELECT * FROM studies WHERE ResearcherId = ${researcherId}`, (error, results) => {
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
    const { researcherId, title, studyQuestions, description } = req.body;

    if (!researcherId || !title || !studyQuestions || !description) {
      res.status(400).send(`{"result": "Failure", "params": {"ResearcherId": "${researcherId}",
        "Title": "${title}", "StudyQuestions": "${studyQuestions}", "Description": "${description}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM researchers WHERE ResearcherId = "${researcherId}"`, (error, results) => {
      if(error || !results.length) {
        res.status(400).send('{"result": "Failure", "error": "ResearcherId does not exist."}');
        return;
      }
    });

    connection.query(`INSERT INTO studies (ResearcherId, Title, StudyQuestions, Description) VALUES ("${researcherId}", 
      "${title}", "${studyQuestions}", "${description}")`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      }
      else {
        res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
      }
    });
  },

  updateStudy: async(req, res) => {
    const { studyId, title, studyQuestions, description } = req.body;

    if(!studyId) {
      res.status(400).send('{"result": "Faliure", "error": "Study ID is required."}');
      return;
    }
    if(!title && !studyQuestions && !description) {
      res.status(400).send('{"result": "Faliure", "error": "No parameters to update."}')
      return;
    }

    let setStr = "";
    if(title) {
      setStr = `Title = "${title}"`;
    }
    if(studyQuestions) {
      setStr = setStr.concat(`, StudyQuestions = "${studyQuestions}"`);
    }
    if(description) {
      setStr = setStr.concat(`, Description = "${description}"`);
    }
    if(setStr.charAt(0) == ',') {
      setStr = setStr.slice(2, setStr.length);
    }

    connection.query(`UPDATE studies SET ${setStr} WHERE StudyId = "${studyId}"`, (error, results) => {
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
    const { studiesId } = req.query;

    if (!studiesId) {
      res.status(400).send('{"result": "Faliure", "error": "Study ID is required."}');
      return;
    }

    connection.query(`DELETE FROM studies WHERE StudyId = "${studiesId}"`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
        return;
      }
      else if(results.affectedRows <= 0) {
        res.status(400).send(`{"result": "Failure", "error": "No studies found."}`);
        return;
      }
      else {
        connection.query(`DELETE FROM experiments WHERE StudyId = "${studiesId}"`, (error, results) => {
          if(error) {
            res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
          }
          else {
            res.status(200).send(`{"result": "Success", "msg": "Study: ${studiesId} experiments were deleted"}`);
          }
        });
      }
    });
  }
}
