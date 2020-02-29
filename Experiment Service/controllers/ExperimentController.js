var mysql  = require('mysql'),

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'yarr!'
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
                for(let i = 0; i < results.length; ++i) {
                    let { experimentId, studyId, details, gameSettings } = results[i];
                    resultStr = resultsStr.concat(`{"experimentId": "${experimentId}", "studyId": "${studyId}",
                        "details": "${details}", "gameSettings": "${gameSettings}"}, `);
                }
                resultsStr = resultsStr.slice(0, -2);
                resultsStr = resultsStr.concat("]}");
                res.status(200).send(resultsStr);
            }
        });
    },

    addExperiment: async(req, res) => {
        const { experimentId, studyId, details, gameSettings } = req.body;

        if(!experimentId || !studyId || !details || !gameSettings) {
            res.status(404).send(`{"result": "Failure", "params": {"experimentId": "${experimentId}", "studyId": "${studyId}",
                "details": "${details}", "gameSettings": "${gameSettings}"}, "msg": "A parameter is missing."}`);
            return;
        }

        connection.query(`INSERT INTO experiments (experimentId, studyId, details, gameSettings) VALUES ("${experimentId}",
            "${studyId}", "${details}", "${gameSettings}")`, (error, results) => {
            if(error) {
                res.status(404).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
            else {
                res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
            }
        });
    },

    updateExperiment: async(req, res) => {
        const { experimentId, details, gameSettings } = req.body;

        if(!ExperimentId) {
            res.status(404).send('{"result": "Faliure", "error": "Experiment ID is required."}');
            return;
        }
        if(!details && !gameSettings) {
            res.status(404).send('{"result": "Faliure", "error": "No parameters to update."}')
        }

        let setStr = "";
        if(details) {
            setStr = `details = "${details}"`;
        }
        if(gameSettings) {
            setStr = setStr.concat(`, gameSettings = "${gameSettings}"`);
        }
        if(setStr.charAt(0) == ',') {
            setStr = setStr.slice(2, setStr.length);
        }

        connection.query(`UPDATE experiments SET ${setStr} WHERE experimentId = "${experimentId}"`, (error, results) => {
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

        connection.query(`DELETE * FROM experiments WHERE experimentId = "${ExperimentId}"`, (error, results) => {
            if(error) {
                res.status(404).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
            }
            else if(results.affectedRows <= 0) {
                res.status(404).send(`{"result": "Failure", "error": "No experiments found."}`);
            }
            else {
                res.status(200).send(`{"result": "Success", "msg": "Experiment: ${experimentId} was deleted"}`);
            }
        });
    }
}
