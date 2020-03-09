const   express      = require('express'),
        app          = express(),
        cors         = require('cors'),
        parser       = require('body-parser'),
        port         = process.env.PORT,
        UserCtl      = require('./controllers/UserController.js')

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
app.get('/getResearcher', UserCtl.getResearcher);
app.post('/addResearcher', UserCtl.addResearcher);
// app.put('/updateResearcher', UserCtl.updateResearcher);
// app.delete('/deleteResearcher', UserCtl.deleteResearcher);
app.post('/verifyResearcher', UserCtl.verifyResearcher);

app.all('*', (req, res) => {
    res.status(404).send(`{"result": "Failure", "error": "Bad Route"}`)
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});