const   express      = require('express'),
        app          = express(),
        cors         = require('cors'),
        parser       = require('body-parser'),
        port         = process.env.PORT,
        StudyCtl     = require('./controllers/StudyController');

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
app.get('/getStudy', StudyCtl.getStudy);
app.put('/updateStudy', StudyCtl.getStudy);
app.get('/getAllStudies', StudyCtl.getAllStudies);
app.post('/addStudy', StudyCtl.addStudy);

app.all('*', (req, res) => {
    res.status(404).send(`{"result": "Failure", "error": "Bad Route"}`)
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});