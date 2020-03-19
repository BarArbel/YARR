const express = require("express");
const bodyParser = require("body-parser");

const cooperativeRoutes = require("./routes/cooperative");
const competitiveRoutes = require("./routes/competitive");

var app = express();
app.use(bodyParser.json());

app.use("/cooperative", cooperativeRoutes);
app.use("/competitive", competitiveRoutes);


app.listen(3000)