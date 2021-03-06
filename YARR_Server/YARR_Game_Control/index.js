require('dotenv').config()
const io = require('socket.io')(process.env.PORT || 52301);
const { mysqlConnection_platform, mysqlConnection_dda } = require("./connection");
const Table = require('./Classes/Table.js');
const util = require('util');
const randexp = require('randexp').randexp;
const fetch = require('node-fetch');
const query_platform = util.promisify(mysqlConnection_platform.query).bind(mysqlConnection_platform);
const query_dda = util.promisify(mysqlConnection_dda.query).bind(mysqlConnection_dda);


const tables = [];

// Generate a game code for restarting an interrupted game
async function generateInterrGameCode(socket) {
  const pattern = '^[0-9][A-Z0-9]{5}';
  let found = true;
  let gameCode;

  /* generate code here */
  while(found){
    gameCode = randexp(pattern);   
    sql_code_dupe = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.interupted_instances WHERE GameCode = "${gameCode}";`;

    /* Check if code exists, if yes, generate again */
    try {
      let results = await query_platform(sql_code_dupe);

      if(!results.length) {
        found = false;
      }
    }
    catch(err) {
      socket.emit('errorMenu', { 'message' : 'Unable to access the database. #8', 'error': err });
      return;
    }
  }
  return gameCode;
}

// Set a game that stopped abruptly as an interrupted instance
async function setInterruptedGame(instanceId, experimentId, socket) {
  let gameCode
  // Update instance as Interrupted instead of running
  let sql_update_instance = `SET SQL_SAFE_UPDATES=0;
                   UPDATE  ${process.env.DATABASE_PLATFORM}.instances SET Status = "interrupted" where InstanceId = '${instanceId}' ;
                   SET SQL_SAFE_UPDATES=1; ` ;
  try {
    await query_platform(sql_update_instance);
  }
  catch(err) {
    socket.emit('errorMenu', { 'message' : 'Unable to access the database. #9', 'error': err });
    return;
  }
  // Generate game code
  gameCode = await generateInterrGameCode(socket);
  
  // Add instance to interrupted instances
  let sql_add_instance = `INSERT INTO ${process.env.DATABASE_PLATFORM}.interupted_instances (InstanceId, ExperimentId, GameCode)
                                VALUES ('${instanceId}',${parseInt(experimentId)},'${gameCode}');`;
  try {
    await query_platform(sql_add_instance);
  }
  catch(err) {
    socket.emit('errorMenu', { 'message' : 'Unable to access the database. #10', 'error': err });
    return;
  }
}

// Take care of DB access exception
async function exceptionDBAccess(msg, table, err, socket) {
  try{
    await query_platform(`DROP TABLE ${process.env.DATABASE_DDA}.dda_input_${table.time}_${table.id} ;`);
    await query_platform(`DROP TABLE ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} ;`);
  }
  catch (err2) {
    socket.emit('errorMenu', { 'message' : 'Unable to access the database. #1 ' + msg, 'error': err2 });
    return;
  }
  socket.emit('errorMenu', {message: msg, 'error': err});
}

io.on('connection', async socket =>{

  let interruptedInstanceID;
  const table = new Table();
  let refreshIntervalId;
  let experimentId;
  let stillAlive = false;
  let studyId;
  let experimentState = 0;

  tables.push(table);
  socket.emit('instanceId', { id: `${table.time}_${table.id}` });

  async function checkIfInteruppted() {
    if(stillAlive === false && experimentState == 1) {    
      clearInterval(refreshIntervalId);
      experimentState = 0;
      return true;
    }
    else {
      stillAlive = false;
      return false;
    }
  }

  socket.on('createTables', async () => {
    //Creating table for each experiment   
    const sql = `CREATE TABLE ${process.env.DATABASE_DDA}.dda_input_${table.time}_${table.id} (
      EventID int unsigned NOT NULL AUTO_INCREMENT,
      Timestamp float NOT NULL,
      Event enum(
        'pickup','giveItem','revivePlayer','temporaryLose','revived','lose','dropitem','getDamaged','blockDamage','failPickup','fallAccidently','individualLoss','spawn','powerupSpawn','powerupTaken','powerupMissed','win','avoidDamage',
        'enemyLoc','itemLoc','takenItemLoc','playerLocHealth','lvlUp','lvlDown','lvlStay','newRound','gameEnded','playerClickCount','playerResponseTime'
      ) NOT NULL,
      PlayerID int unsigned DEFAULT NULL,
      CoordX float DEFAULT NULL,
      CoordY float DEFAULT NULL,
      Item int DEFAULT NULL,
      Enemy int DEFAULT NULL,
      GameMode enum('Cooperative','Competitive') NOT NULL,
      PRIMARY KEY (EventID)
    );`;

    try {
      await query_dda(sql);
      socket.broadcast.emit('message', `table ${process.env.DATABASE_DDA}.dda_input_${table.time}_${table.id} was created`);
    }
    catch(err) {
      socket.emit('errorMenu', { 'message' : 'Unable to access the database. #2', 'error': err });
      return;
    }

    const sql2 = `CREATE TABLE ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} (
      EventID int unsigned NOT NULL AUTO_INCREMENT,
      Timestamp float NOT NULL,
      Event enum(
        'pickup','giveItem','revivePlayer','temporaryLose','revived','lose','dropitem','getDamaged','blockDamage','failPickup','fallAccidently','individualLoss','spawn','powerupSpawn','powerupTaken','powerupMissed','win','avoidDamage',
        'enemyLoc','itemLoc','takenItemLoc','playerLocHealth','lvlUp','lvlDown','lvlStay','newRound','gameEnded','playerClickCount','playerResponseTime'
      ) NOT NULL,
      PlayerID int unsigned DEFAULT NULL,
      CoordX float DEFAULT NULL,
      CoordY float DEFAULT NULL,
      Item int DEFAULT NULL,
      Enemy int DEFAULT NULL,
      GameMode enum('Cooperative','Competitive') NOT NULL,
      PRIMARY KEY (EventID)
    );`;

    try {
      await query_platform(sql2);
      socket.broadcast.emit('message', `table ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} was created`);
    }
    catch (err) {
      try{
        await query_platform(`DROP TABLE ${process.env.DATABASE_DDA}.dda_input_${table.time}_${table.id} ;`);
      }
      catch (err2) {
        socket.emit('errorMenu', { 'message' : 'Unable to access the database. #3', 'error': err2 });
        return;
      }
      socket.emit('errorMenu', { 'message' : 'Unable to access the database. #4', 'error': err });
      return;
    }
  });

  //Add information about instance
  socket.on('addInstanceMetaData', async data => {
    experimentId = data.ExperimentID;
    const sql1 = `SELECT ExperimentId, StudyId FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = ${parseInt(data.ExperimentID)} LIMIT 1;`;
    mysqlConnection_platform.query(sql1, async (error, results) => {
        if (error || !results.length) {
          exceptionDBAccess("There's no experiment with such ID", table, error, socket)
        }
        else {
          const sql2 = `INSERT INTO ${process.env.DATABASE_PLATFORM}.instances (StudyId, ExperimentId, InstanceId, CreationTimestamp, Status, DDAParity)
          VALUES  (${results[0]["StudyId"]},${results[0]["ExperimentId"]},"${table.time}_${table.id}",${table.time}, "running", false);`;
          studyId = results[0]["StudyId"];
          mysqlConnection_platform.query(sql2, async (error, results) => {
            if (error || !results.length) {
              socket.emit('error', { 'message' : 'Adding instance data failed', 'error': error });
            }});

       } 
    })

    if (experimentState == 0) {
      experimentState = 1;
      // Check if experiment is interrupted
      refreshIntervalId = setInterval( async () => {
          let isInterr = await checkIfInteruppted();
          if (isInterr === true) {
            setInterruptedGame(`${table.time}_${table.id}`, data.ExperimentID, socket);
          }
        }, 30000);
    }
  });

  //Add information about instance
  socket.on('editInstanceMetaData', async data => {
    experimentId = data.ExperimentID;
    interruptedInstanceID = data.InterruptedInstanceID;

    // Update information about interrupted instance
    table.time = interruptedInstanceID.split("_")[0];
    table.id =  interruptedInstanceID.split("_")[1];
    const sql = `SET SQL_SAFE_UPDATES=0;
                 UPDATE  ${process.env.DATABASE_PLATFORM}.instances SET Status = "running" where InstanceId = '${data.InstanceID}' ;
                 SET SQL_SAFE_UPDATES=1; ` ;

    mysqlConnection_platform.query(sql, (error, results) => {
        if (error || !results.length) {
          socket.emit('noAvailableInstance', {message: "There's no instance with such ID", instanceId: `${table.time}_${table.id}`});
        }
        else{
          socket.broadcast.emit('message', `table ${process.env.DATABASE_DDA}.dda_input_${table.time}_${table.id} was created`);
          socket.broadcast.emit('message', `table ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} was created`);
        }
    const sql2 = `SELECT ExperimentId, StudyId FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1;`;
    mysqlConnection_platform.query(sql2, (error, results) => {
      if (error || !results.length) {
        exceptionDBAccess("There's no experiment with such ID", table, error, socket);
      }
      else {
        studyId = results[0]["StudyId"];

     } 
  })
    })

    if (experimentState == 0) {
      experimentState = 1;
      // Check if experiment is interrupted
      refreshIntervalId = setInterval( async () => {
          let isInterr = await checkIfInteruppted();
          if(isInterr === true) {
            setInterruptedGame(`${table.time}_${table.id}`, data.ExperimentID, socket);
          }
        }, 30000);
    }  
  });

  //Sending Data to the Tracker table for experiment analysis
  socket.on('TrackerInput', async data => {
    const sql = `INSERT INTO ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
      VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
      const { err, rows, fields } = await query_platform(sql)
    if(err) {
      exceptionDBAccess("Unable to add tracker data", table, err, socket);
    }

    stillAlive = true;
    socket.broadcast.emit('message', `table ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} updated`);
  });

  //Sending new game code for a verification
  socket.on('newCodeInput', async data => {
    const sql = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.experiments where GameCode = '${data.Code}' LIMIT 1 ;`;
    mysqlConnection_platform.query(sql, (error, results) => {
      if (error || !results.length) {
        socket.emit('wrongCode', {message: "Wrong code", instanceId: `${table.time}_${table.id}`});
      }
      else {
        socket.emit('newCorrect', {experimentID: results[0]["ExperimentId"], instanceId: `${table.time}_${table.id}`});
      }});
  });

  //Sending interrupted game code for a verification
  socket.on('interruptedCodeInput', data => {
    const sql = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.interupted_instances where GameCode = '${data.Code}' LIMIT 1 ;`;
    mysqlConnection_platform.query(sql, (error, results) => {
      if (error || !results.length) {
        socket.emit('wrongCode', {message: "Wrong code", instanceId: `${table.time}_${table.id}`});
      }
      else {
        this.interruptedInstanceID = results[0]["InstanceId"];
        socket.emit('interruptedCorrect', {experimentID: `${results[0]["ExperimentId"]}`, instanceId: `${table.time}_${table.id}`, interruptedInstanceId: results[0]["InstanceId"]});
      }});

  });

  // Add instance ID to the server
  socket.on('initNewGameSettings', data => {
    
    var numOfPlayers = data.NumOfPlayers;
    var roundDuration;
    var colorBlindness;
    var skin;
    var modeList = new Array();
    var difficList = new Array();
    const sql1 = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.rounds where ExperimentId = '${data.ExperimentID}' ORDER BY RoundNumber ASC;`;

    mysqlConnection_platform.query(sql1, (error, results) => {
      if (error || !results.length) {
        exceptionDBAccess("There are no rounds that match this experiment #1", table, error, socket);
      }
      else {
        for (row in results) {
          modeList.push(results[row]["GameMode"]);
          difficList.push(results[row]["Difficulty"]);
        }
      }});
    
    const sql2 = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1 ;`;
    mysqlConnection_platform.query(sql2, (error, results) => {
      if (error || !results.length) {
        exceptionDBAccess("There are no rounds that match this experiment #2", table, error, socket);
      }
      else {
        roundDuration = results[0]["RoundDuration"];
        colorBlindness = results[0]["ColorSettings"];
        skin = results[0]["CharacterType"];

        socket.emit('newGameScene', {rSettings: {numberOfPlayers:  numOfPlayers, 
                                                    roundLength:      roundDuration, 
                                                    blindness:        colorBlindness, 
                                                    modes:            modeList,
                                                    skin:             skin,
                                                    difficulties:     difficList}, instanceId: `${table.time}_${table.id}`});   
      }});
  
  });

  socket.on('SyncNewScene', (data) => {
    socket.emit('newGameSettings', data);
  });

  socket.on('SyncInterruptedScene', (data) => {

    // Delete prev interrupted game code
    const sql_del_gamecode = `DELETE FROM ${process.env.DATABASE_PLATFORM}.interupted_instances WHERE InstanceId = '${table.time}_${table.id}' ;`;
    mysqlConnection_platform.query(sql_del_gamecode, (error, results) => {
      if (error || !results.length) {
        socket.emit('error', { 'message' : 'There are no rounds that match this experiment #3', 'error': error });
      }

    });

    socket.emit('interrGameSettings', data);
  });

  // Add instance ID to the server
  socket.on('initInterrGameSettings', async data => {
    
    // Expected game settings
    let roundsNumber;

    // Actual game settings
    let numOfPlayers = 3;
    let roundDuration;
    let colorBlindness;
    let skin;
    let initTimestamp;
    let roundsDone;
    let modeList = new Array();
    let difficList = new Array();
    let playerLocList = new Array();
    let heldPickupLocList = new Array();
    let enemyLocList = new Array();
    let pickupLocList = new Array();

    try { 
    // Get number of rounds
      let sql_roundsNumber = `SELECT RoundsNumber FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1;`;
      let results = await query_platform(sql_roundsNumber);
      if (!results.length) {
        exceptionDBAccess("There's no experiment with such ID", table, "err", socket);
      }
      else {
        roundsNumber = results[0]["RoundsNumber"];
      }
    
      // Get how many rounds were done duing the instance  
      let sql_roundsDone = `SELECT count(*) RoundsDone FROM ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} where Event = 'newRound';`;
      results = await query_platform(sql_roundsDone);
      if (!results.length) {
        exceptionDBAccess("There are no rounds that match this experiment #4", table, "err", socket);
      }
      else {
        roundsDone = results[0]["RoundsDone"];
      }

      // Get left rounds data  
      let sql_roundsLeft = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.rounds where ExperimentId = '${data.ExperimentID}' 
      and RoundNumber >= ${roundsDone} ORDER BY RoundNumber ASC;`;
      results = await query_platform(sql_roundsLeft);
      if (!results.length) {
        exceptionDBAccess("There are no rounds that match this experiment #5", table, "err", socket);
      }
      else {
        await results.map(row => {
          modeList.push(row["GameMode"]);
          difficList.push(row["Difficulty"]);

        })

      }

      // Get experiment settings  
      let sql_expr_settings = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1 ;`;
      results = await query_platform(sql_expr_settings);
      if (!results.length) {
        exceptionDBAccess("There are no rounds that match this experiment #6", table, "err", socket);
      }
      else {
        roundDuration = results[0]["RoundDuration"];
        colorBlindness = results[0]["Disability"];
        skin = results[0]["ColorSettings"];
      }
      
      // Get players' positions and health (in the item section) and score (in the enemy section)
      let sql_pLoc = `
      SELECT ts,pid,CoordX,CoordY,Item as Health,Enemy as Score FROM
      (select max(Timestamp) ts, PlayerID from 
          (SELECT * FROM ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id}  
            where Timestamp < (select max(timestamp) from ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id})-1) as all_events
      Where playerID != 0 and Event = "playerLocHealth"
      group by 2) as latest_ts LEFT JOIN 
      (SELECT Timestamp, PlayerID pid, CoordX, CoordY, Item, Enemy 
      FROM 
        (SELECT * FROM ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id}  
          where Timestamp < (select max(timestamp) from ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id})-1) as all_events) as all_e  ON ts = Timestamp and PlayerID = pid
      ORDER BY 1;`;

      results = await query_platform(sql_pLoc);
      if (!results.length) {
        exceptionDBAccess("There are no rounds that match this experiment #7", table, "err", socket);
      }
      else {
        await results.map(row => {
          playerLocList.push({ playerID: row["pid"], CoordX: row["CoordX"], CoordY: row["CoordY"], Health: row["Health"], Score: row["Score"] });
        });

        // Ensure players are sorted by their ID
        playerLocList.sort((a, b) => (a.playerID > b.playerID) ? 1 : -1);
        initTimestamp = results[0]["ts"] - 1
      }

      // Get enemies' positions
      let sql_eLoc = `SELECT Timestamp, Event, Enemy, CoordX, CoordY FROM ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} 
                        WHERE Event = "enemyLoc" and Timestamp < ${initTimestamp}+5 and Timestamp >  ${initTimestamp};`;
      
      results = await query_platform(sql_eLoc);

      if (!results.length) {
        enemyLocList.push({ Enemy: 0, CoordX: 0, CoordY: 0 });      }
      else {
        await results.map(row => {
          enemyLocList.push({ Enemy: row["Enemy"], CoordX: row["CoordX"], CoordY: row["CoordY"] });
        });
      }

      // Get items' positions
      let sql_iLoc = `SELECT Timestamp, Event, Item, CoordX, CoordY FROM ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} 
                        WHERE Event = "itemLoc" and Timestamp < ${initTimestamp}+5 and Timestamp >  ${initTimestamp};`;
      
      results = await query_platform(sql_iLoc);
      if (!results.length) {
        pickupLocList.push({ Item: 0, CoordX: 0, CoordY: 0 });
      }
      else {
        await results.map(row => {
          pickupLocList.push({ Item: row["Item"], CoordX: row["CoordX"], CoordY: row["CoordY"] });
        });
      }  

      // Get held items
      let sql_hiLoc = `SELECT Timestamp, Event, PlayerID, Item FROM ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} 
                      WHERE Event = "takenItemLoc" and Timestamp < ${initTimestamp}+5 and Timestamp >  ${initTimestamp};`;
    
      results = await query_platform(sql_hiLoc);
      if (!results.length) {
        heldPickupLocList.push({ Item: 0, playerID: 0 });
      }
      else {
        await results.map(row => {
          heldPickupLocList.push({ Item: row["Item"], playerID: row["PlayerID"] });
        });
      }
    }
    catch (err) {
      exceptionDBAccess("Couldn't retrieve interrupted game data.", table, err, socket);
    }

    socket.emit('interrGameScene', {rSettings: {numberOfPlayers:  numOfPlayers, 
                                                roundLength:      roundDuration, 
                                                blindness:        colorBlindness, 
                                                modes:            modeList,
                                                skin:             skin,
                                                difficulties:     difficList,
                                                timestamp:        initTimestamp,
                                                pLoc:             playerLocList,
                                                eLoc:             enemyLocList,
                                                iLoc:             pickupLocList,
                                                hiLoc:            heldPickupLocList
                                              }, instanceId: `${table.time}_${table.id}`});   
                                              
  });

  socket.on('gameEnded', async () => {
    // insert DDa + Tracker into perma table
    if (experimentState = 1) {
      experimentState = 0;
      clearInterval(refreshIntervalId);

    }

    const instance_id = `${table.time}_${table.id}`
    const dda_table = `${process.env.DATABASE_DDA}.dda_input_${instance_id}`
    const tracker_table = `${process.env.DATABASE_PLATFORM}.tracker_input_${instance_id}`
    const permanent_table = `${process.env.DATABASE_PLATFORM}.raw_data`
    const select_query = `SELECT * FROM `
    const insert_query = `INSERT INTO ${process.env.DATABASE_PLATFORM}.raw_data (InstanceID, ExperimentID, Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode) VALUES ?`
    const drop_query = `DROP TABLE `
    const json = {
      experimentId: experimentId,
      instanceId: `${table.time}_${table.id}`,
      studyId: studyId
    }

    socket.broadcast.emit('gameEnded', `${instance_id}`);

    try {
      let result = await query_platform(`SELECT ExperimentId FROM ${process.env.DATABASE_PLATFORM}.instances WHERE InstanceId = '${instance_id}'`)
      let experiment_id = result[0].ExperimentId
      let values = []

      try {
        let dda_select = await query_dda(select_query + dda_table)

        if (dda_select.length) {
          dda_select.map(row => {
            let { Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode } = row
            values.push([instance_id, experiment_id, Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode])

          })
        }

        let tracker_select = await query_platform(select_query + tracker_table)

        if (tracker_select.length) {
          tracker_select.map(row => {
            let { Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode } = row
            values.push([instance_id, experiment_id, Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode])

          })
        }

        if (values.length) {
          try {
            let insert_result = await query_platform(insert_query, [values])
          }
          catch (insert_error) {
            socket.emit('errorMenu', { 'message' : 'Unable to access the database. #5', 'error': insert_error });
          }
        }
      }
      catch (select_error) {
        socket.emit('errorMenu', { 'message' : 'Unable to access the database. #6', 'error': select_error });
      }

      let dda_drop = query_dda(drop_query + dda_table)

      let tracker_drop = query_platform(drop_query + tracker_table)

    }
    catch (error) {
      socket.emit('errorMenu', { 'message' : 'Unable to access the database. #7', 'error': error });
    }

   let fetch_accomplished = false; 
   while(!fetch_accomplished) {

        // after all queries are done, invoke analyzeData
        fetch('https://yarr-insight-service.herokuapp.com/analyzeData', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(json)
        }).then(res => {
          res.status === 200 && res.json().then(json => {
            
          })
          fetch_accomplished = true;
        }).catch(err => {
          fetch_accomplished = false;
        });
  
    }
  });

  socket.on('disconnect', async () => {
    socket.broadcast.emit('message', `table ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} finished the game`);
    let isInterr = await checkIfInteruppted();
    if(isInterr === true) {
      setInterruptedGame(`${table.time}_${table.id}`, experimentId, socket);
    }
  });
});
