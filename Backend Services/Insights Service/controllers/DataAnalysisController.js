const { query } = require('../database.js');

async function QueryExpBar(experimentId){
  try {
    let sql_percents = `
    INSERT INTO yarr.exp_insights_bar
    select * from (
        select  ExperimentID, GameMode, 
                (sum(ItemTaken)/sum(ItemSpawns))*100 PercentItemsTaken,
                100-((sum(ItemTaken)/sum(ItemSpawns))*100) PercentItemsMissed,
                (sum(EnemyAvoid)/sum(EnemySpawns)*100) PercentEnemiesAvoid,
                (sum(EnemyDamage)/sum(EnemySpawns)*100) PercentEnemiesHit,
                (sum(EnemyBlock)/sum(EnemySpawns)*100) PercentEnemiesBlock
        from
            (select if(Event = 'spawn' and Item!=0, 1,0) ItemSpawns, 
                    if(Event = 'pickup' and Item!=0,1,0) ItemTaken,
                    if(Event = 'spawn' and Enemy!=0, 1,0) EnemySpawns, 
                    if(Event = 'avoidDamage' and Enemy!=0, 1,0) EnemyAvoid,
                    if(Event = 'blockDamage' and Enemy!=0, 1,0) EnemyBlock,
                    if(Event = 'getDamaged' and Enemy!=0, 1,0) EnemyDamage,
                    ExperimentID, GameMode
            from raw_data 
            where ExperimentID = ${experimentId} and GameMode = 'Cooperative') as counter
        group by 1,2    ) coop_sums 
    union all (
    select ExperimentID, GameMode, 
          (sum(ItemTaken)/sum(ItemSpawns))*100 PercentItemsTaken,
          100-((sum(ItemTaken)/sum(ItemSpawns))*100) PercentItemsMissed,
          (sum(EnemyAvoid)/sum(EnemySpawns)*100) PercentEnemiesAvoid,
          (sum(EnemyDamage)/sum(EnemySpawns)*100) PercentEnemiesHit,
          (sum(EnemyBlock)/sum(EnemySpawns)*100) PercentEnemiesBlock
    from
        (select if(Event = 'spawn' and PlayerID!=0, 1,0) ItemSpawns, 
          if(Event = 'pickup' and PlayerID!=0,1,0) ItemTaken,
          if(Event = 'spawn' and PlayerID!=0, 1,0) EnemySpawns, 
          if(Event = 'avoidDamage' and PlayerID!=0, 1,0) EnemyAvoid,
          if(Event = 'blockDamage' and PlayerID!=0, 1,0) EnemyBlock,
          if(Event = 'getDamaged' and PlayerID!=0, 1,0) EnemyDamage,
                    ExperimentID, GameMode
        from raw_data 
        where ExperimentID = ${experimentId} and GameMode = 'Competitive') as counter
        group by 1,2    )
    ON DUPLICATE KEY UPDATE Mode = VALUES(Mode), 
							              PercentItemsTaken = VALUES(PercentItemsTaken), 
                            PercentItemsMissed= VALUES(PercentItemsMissed),
                            PercentEnemiesAvoid = VALUES(PercentEnemiesAvoid),
                            PercentEnemiesHit = VALUES(PercentEnemiesHit),
                            PercentEnemiesBlock = VALUES(PercentEnemiesBlock);`;
    let results = query(sql_percents);

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
    let results = query(`insertGreyGershonBoringQueryHere. Example: SELECT * FROM ModaotEvel`);

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

    let result = await QueryExpBar(experimentId);
    // can check if result's good here
    result = await QueryB();


    results === true? 
    res.status(200).send(`{"result": "Success"}`)
    :
    res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(err)}}`)
  }
}
