var mysql  = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'yarr'
});

connection.connect();

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
        let { res_studyId, res_userName, res_title, res_studyQuestions, res_description } = results[0];
        res.status(200).send(`{"result": "Success", "study": {"StudyId": "${res_studyId}", "UserName": "${res_userName}",
          "Title": "${res_title}", "StudyQuestions": "${res_studyQuestions}", "Description": "${res_description}"}}`);
      }
    });
  },

  getAllResearcherStudies: async(req, res) => {
    const { UserName } = req.query;

    if(!UserName) {
      res.status(400).send('{"result": "Faliure", "error": "User name is required."}');
      return;
    }

    connection.query(`SELECT * FROM studies WHERE UserName = "${UserName}"`, (error, results) => {
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
          let { res_studyId, res_userName, res_title, res_studyQuestions, res_description } = results[i];
          resultsStr = resultsStr.concat(`{"StudyId": "${res_studyId}", "UserName": "${res_userName}", "Title": "${res_title}",
            "StudyQuestions": "${res_studyQuestions}", "Description": "${res_description}"}, `);
        }
        resultsStr = resultsStr.slice(0, -2);
        resultsStr = resultsStr.concat("]}");
        res.status(200).send(resultsStr);
      }
    });
  },

  addStudy: async(req, res) => {
    const { StudyId, UserName, Title, StudyQuestions, Description } = req.body;

    if(!StudyId || !UserName || !Title || !StudyQuestions || !Description) {
      res.status(400).send(`{"result": "Failure", "params": {"StudyId": "${StudyId}", "UserName": "${UserName}",
        "Title": "${Title}", "StudyQuestions": "${StudyQuestions}", "Description": "${Description}"},
        "msg": "A parameter is missing."}`);
      return;
    }

    connection.query(`SELECT * FROM researchers WHERE UserName = "${UserName}"`, (error, results) => {
      if(error) {
        res.status(400).send('{"result": "Failure", "error": "User does not exist."}');
        return;
      }
    });

    connection.query(`INSERT INTO studies (StudyId, UserName, Title, StudyQuestions, Description) VALUES ("${StudyId}",
      "${UserName}", "${Title}", "${StudyQuestions}", "${Description}")`, (error, results) => {
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
        res.status(400).send(`{"result": "Failure", "error": "No studies found."}`);
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
        res.status(200).send(`{"result": "Success", "msg": "Study: ${StudyId} was deleted"}`);
      }
    });

    connection.query(`DELETE FROM experiments WHERE StudyId = "${StudyId}"`, (error, results) => {
      if(error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      }
      else {
        res.status(200).send(`{"result": "Success", "msg": "Study: ${StudyId} experiments were deleted"}`);
      }
    });
  }
}
