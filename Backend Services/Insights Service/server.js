const   express       = require('express'),
        app           = express(),
        cors          = require('cors'),
        parser        = require('body-parser'),
        port          = process.env.PORT,
        StudyInsightsCtl = require('./controllers/StudyInsightsController.js'),
        DataAnalysisCtl = require('./controllers/DataAnalysisController.js'),
        ExprInsightsCtl = require('./controllers/ExperimentInsightsController.js');

app.set('port', port);
app.use(cors());
app.use(parser.json({extended : true}));
app.use('/', express.static('./public'));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Request-Method", "POST");
    res.header("HTTP/1.1 200 OK");
    res.set("Content-Type", "application/json");
    next();
});

// /*** Routes ***/
app.post('/analyzeData', DataAnalysisCtl.analyzeData);
app.post('/requestRawData', ExprInsightsCtl.requestRawData);
app.post('/requestAllRawData', StudyInsightsCtl.requestAllRawData);
app.post('/requestStudyInsightBars', StudyInsightsCtl.requestInsightBars);
app.post('/requestExperimentInsightBars', ExprInsightsCtl.requestInsightBars);
app.post('/requestInsightRadar', StudyInsightsCtl.requestInsightRadar);
app.post('/requestInsightMixed', ExprInsightsCtl.requestInsightMixed);
app.post('/requestStudyInsightMirror', StudyInsightsCtl.requestInsightMirror);
app.post('/requestExperimentInsightMirror', ExprInsightsCtl.requestInsightMirror);
app.post('/requestAllInsightMixed', StudyInsightsCtl.requestAllInsightMixed);

app.all('*', (req, res) => {
    res.status(404).send(`{"result": "Failure", "error": "Bad Route"}`);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});