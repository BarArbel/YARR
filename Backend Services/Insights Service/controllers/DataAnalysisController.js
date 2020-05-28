const { query } = require('../database.js');

async function QueryA(){
  try {
    let results = query(`insertQueryHereSQLQueenAverageDickCarryGoMidz`);

    // do stuff with results
    //insert query should be here
    results = query(`anotherQueryRightHeeeyah`);

    //etc....
  }
  catch (err) {
    // DO WE PICNIC NOW OR WE PICNIC LATER?!?!?!?
    return false;
  }

  // if all is well
  return true;
}

async function QueryB() {
  try {
    let results = query(`insertQueryHereSQLQueenAverageDickCarryGoMidz`);

    // do stuff with results
    //insert query should be here
    results = query(`anotherQueryRightHeeeyah`);

    //etc....
  }
  catch (err) {
    // shit hits the fans. actual fans, people, who cheer for the SQL Queen.
    return false;
  }

  // if all is well
  return true;
}

module.exports = {
  analyzeData: async (req, res) => {
    const { instanceId, experimentId } = req.body;

    if (!instanceId || !experimentId) {
      res.status(400).send(`{"result": "Failure", "params": {"instanceId": "${instanceId}",
          "experimentId": "${experimentId}"},
          "msg": "A parameter is missing."}`);
      return;
    }

    let result = await QueryA();
    // can check if result's good here
    result = await QueryB();


    results === true? 
    res.status(200).send(`{"result": "Success"}`)
    :
    res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(err)}}`)
  }
}
