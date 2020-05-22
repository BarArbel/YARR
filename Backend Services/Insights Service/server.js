const   express       = require('express'),
        app           = express(),
        cors          = require('cors'),
        parser        = require('body-parser'),
        port          = process.env.PORT,
        StudyInsightsCtl = require('./controllers/StudyInsightsController.js'),
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
app.post('/requestRawData', ExprInsightsCtl.requestRawData);
app.post('/requestAllRawData', StudyInsightsCtl.requestAllRawData);
app.post('/requestInsightBars', StudyInsightsCtl.requestInsightBars);
app.post('/requestInsightRadar', StudyInsightsCtl.requestInsightRadar);
app.post('/requestInsightMixed', ExprInsightsCtl.requestInsightMixed);
app.post('/requestInsightMirror', StudyInsightsCtl.requestInsightMirror);
app.post('/requestAllInsightMixed', StudyInsightsCtl.requestAllInsightMixed);

app.all('*', (req, res) => {
    res.status(404).send(`{"result": "Failure", "error": "Bad Route"}`);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});