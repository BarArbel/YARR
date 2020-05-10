const   express       = require('express'),
        app           = express(),
        cors          = require('cors'),
        parser        = require('body-parser'),
        port          = process.env.PORT,
        ExperimentCtl = require('./controllers/ExperimentController.js');

app.set('port', port);
app.use(cors());
app.use(parser.json({extended : true}));
app.use('/', express.static('./public'));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Request-Method", "PUT, DELETE, GET, POST");
    res.header("HTTP/1.1 200 OK");
    res.set("Content-Type", "application/json");
    next();
});

// /*** Routes ***/
// app.get('/getRuntime', runtimeCtl.getAll);
app.post('/getExperiment', ExperimentCtl.getExperiment)
app.post('/getAllStudyExperiments', ExperimentCtl.getAllStudyExperiments)
app.post('/addExperiment', ExperimentCtl.addExperiment)
app.post('/generateGameCode', ExperimentCtl.generateGameCode)
app.post('/stopExperiment', ExperimentCtl.stopExperiment)
app.put('/updateExperiment', ExperimentCtl.updateExperiment)
app.delete('/deleteExperiment', ExperimentCtl.deleteExperiment)

app.all('*', (req, res) => {
    res.status(404).send(`{"result": "Failure", "error": "Bad Route"}`)
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});