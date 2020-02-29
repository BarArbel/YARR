var mysql  = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'yarr'
});

connection.connect();

module.exports = {
    getExperiment: async(req, res) => {
        const { ExperimentId } = req.query;

        if(!ExperimentId) {
            res.status(404).send('{"result": "Faliure", "error": "Experiment ID is required."}');
            return;
        }

        connection.query(`SELECT * FROM experiments WHERE experimentId = "${ExperimentId}"`, (error, results) => {
            if(error) {
                res.status(404).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
            else if(!results.length) {
                res.status(404).send(`{"result": "Failure", "error": "No experiments found."}`);
            }
            else {
                let { experimentId, studyId, details, gameSettings } = results[0];
                res.status(200).send(`{"result": "Success", "experiment": {"experimentId": "${experimentId}",
                    "studyId": "${studyId}", "details": "${details}", "gameSettings": "${gameSettings}"}}`);
            }
        });
    },

    getAllStudyExperiments: async(req, res) => {
        const { StudyId } = req.query;

        if(!StudyId) {
            res.status(404).send('{"result": "Faliure", "error": "Study ID is required."}');
            return;
        }

        connection.query(`SELECT * FROM experiments WHERE studyId = "${StudyId}"`, (error, results) => {
            if(error) {
                res.status(404).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
            else if(!results.length) {
                res.status(404).send(`{"result": "Failure", "error": "No experiments found."}`);
            }
            else {
                let resultsStr = '{"result": "Success", "experiments": ['
                let i;
                for(i = 0; i < results.length; ++i) {
                    let { experimentId, studyId, details, gameSettings } = results[i];
                    resultsStr = resultsStr.concat(`{"experimentId": "${experimentId}", "studyId": "${studyId}",
                        "details": "${details}", "gameSettings": "${gameSettings}"}, `);
                }
                resultsStr = resultsStr.slice(0, -2);
                resultsStr = resultsStr.concat("]}");
                res.status(200).send(resultsStr);
                //res.status(200).send(results);
            }
        });
    },

    addExperiment: async(req, res) => {
        const { ExperimentId, StudyId, Details, GameSettings } = req.body;

        if(!ExperimentId || !StudyId || !Details || !GameSettings) {
            res.status(404).send(`{"result": "Failure", "params": {"experimentId": "${ExperimentId}", "studyId": "${StudyId}",
                "details": "${Details}", "gameSettings": "${GameSettings}"}, "msg": "A parameter is missing."}`);
            return;
        }

        connection.query(`INSERT INTO experiments (experimentId, studyId, details, gameSettings) VALUES ("${ExperimentId}",
            "${StudyId}", "${Details}", "${GameSettings}")`, (error, results) => {
            if(error) {
                res.status(404).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
            else {
                res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
            }
        });
    },

    updateExperiment: async(req, res) => {
        const { ExperimentId, Details, GameSettings } = req.body;

        if(!ExperimentId) {
            res.status(404).send('{"result": "Faliure", "error": "Experiment ID is required."}');
            return;
        }
        if(!Details && !GameSettings) {
            res.status(404).send('{"result": "Faliure", "error": "No parameters to update."}')
        }

        let setStr = "";
        if(Details) {
            setStr = `details = "${Details}"`;
        }
        if(GameSettings) {
            setStr = setStr.concat(`, gameSettings = "${GameSettings}"`);
        }
        if(setStr.charAt(0) == ',') {
            setStr = setStr.slice(2, setStr.length);
        }

        connection.query(`UPDATE experiments SET ${setStr} WHERE experimentId = "${ExperimentId}"`, (error, results) => {
            if(error) {
                res.status(404).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
            else if(results.affectedRows <= 0) {
                res.status(404).send(`{"result": "Failure", "error": "No experiments found."}`);
            }
            else {
                res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
            }
        });
    },

    deleteExperiment: async(req, res) => {
        const { ExperimentId } = req.query;

        if(!ExperimentId) {
            res.status(404).send('{"result": "Faliure", "error": "Experiment ID is required."}');
            return;
        }

        connection.query(`DELETE FROM experiments WHERE experimentId = "${ExperimentId}"`, (error, results) => {
            if(error) {
                res.status(404).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
            else if(results.affectedRows <= 0) {
                res.status(404).send(`{"result": "Failure", "error": "No experiments found."}`);
            }
            else {
                res.status(200).send(`{"result": "Success", "msg": "Experiment: ${ExperimentId} was deleted"}`);
            }
        });
    }
}
