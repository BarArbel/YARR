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
// WHAT IS THIS EVEN
app.get('/requestInsightMirror', StudyInsightsCtl.requestInsightMirror)
app.get('/requestInsightRadar', StudyInsightsCtl.requestInsightRadar)
app.get('/requestInsightMixed', StudyInsightsCtl.requestInsightMixed)
app.get('/requestInsightPie', StudyInsightsCtl.requestInsightPie)

// WHAT AM I DOING 


app.all('*', (req, res) => {
    res.status(404).send(`{"result": "Failure", "error": "Bad Route"}`)
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});