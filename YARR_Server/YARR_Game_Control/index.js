require('dotenv').config()
//const fetch = require("node-fetch");
const io = require('socket.io')(process.env.PORT || 52301);
const { mysqlConnection_platform, mysqlConnection_dda } = require("./connection");
const Table = require('./Classes/Table.js');
const util = require('util');
const randexp = require('randexp').randexp;
const fetch = require('node-fetch');
const query_platform = util.promisify(mysqlConnection_platform.query).bind(mysqlConnection_platform);
const query_dda = util.promisify(mysqlConnection_dda.query).bind(mysqlConnection_dda);

console.log('Server has started');

const tables = [];

// Generate a game code for restarting an interrupted game
async function generateInterrGameCode() {
  const pattern = '^[0-9][A-Z0-9]{5}';
  let found = true;
  let gameCode;

  /* generate code here */
  while(found){
    gameCode = randexp(pattern);   
    sql_code_dupe = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.interupted_instances WHERE GameCode = "${gameCode}";`;
    console.log(sql_code_dupe);
    /* Check if code exists, if yes, generate again */
    try {
      let results = await query_platform(sql_code_dupe);
      console.log("results: " + results);
      if(!results.length) {
        found = false;
      }
    }
    catch(err) {
      //What to do?
      return;
    }
  }
  return gameCode;
}

// Set a game that stopped abruptly as an interrupted instance
async function setInterruptedGame(instanceId, experimentId) {
  console.log("I'm trying to take care of interruption:");
  let gameCode
  // Update instance as Interrupted instead of running
  let sql_update_instance = `SET SQL_SAFE_UPDATES=0;
                   UPDATE  ${process.env.DATABASE_PLATFORM}.instances SET Status = "interrupted" where InstanceId = '${instanceId}' ;
                   SET SQL_SAFE_UPDATES=1; ` ;
  try {
    await query_platform(sql_update_instance);
  }
  catch(err) {
    throw err;
  }
  // Generate game code
  gameCode = await generateInterrGameCode();
  console.log("wow what a great code: " + gameCode);
  
  // Add instance to interrupted instances
  // MIRI HERE IS A BIG SCREAMING COMMANTz
  let sql_add_instance = `INSERT INTO ${process.env.DATABASE_PLATFORM}.interupted_instances (InstanceId, ExperimentId, GameCode)
                                VALUES ('${instanceId}',${parseInt(experimentId)},'${gameCode}');`;
  try {
    await query_platform(sql_add_instance);
  }
  catch(err) {
    throw err;
  }
  // TODO: Notify DDA? close module?
}

io.on('connection', async socket =>{
  console.log('Connection Made!');
  let interruptedInstanceID;
  const table = new Table();
  let refreshIntervalId;
  let experimentId;
  let stillAlive = false;
  let studyId;

  tables.push(table);
  socket.emit('instanceId', { id: `${table.time}_${table.id}` });

  async function checkIfInteruppted() {
    if(stillAlive === false) {
      console.log(`instance: ${table.time}_${table.id} is dead`);      
      clearInterval(refreshIntervalId);
      console.log("returning true");
      return true;
    }
    else {
      console.log(`alive and well...`);
      console.log(`changing StillAlive to false: ${stillAlive}`);
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
      console.log("dda table created");
      socket.broadcast.emit('message', `table ${process.env.DATABASE_DDA}.dda_input_${table.time}_${table.id} was created`);
    }
    catch(err) {
      throw err;
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
      console.log("tracker table created");
      socket.broadcast.emit('message', `table ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} was created`);
    }
    catch (err) {
      throw err;
    }
  });

  //Add information about instance
  socket.on('addInstanceMetaData', async data => {
    experimentId = data.ExperimentID;
    const sql1 = `SELECT ExperimentId, StudyId FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = ${parseInt(data.ExperimentID)} LIMIT 1;`;
    console.log(sql1);
    console.log(data);
    mysqlConnection_platform.query(sql1, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableExpData', {message: "There's no experiment with such ID", instanceId: `${table.time}_${table.id}`});
        }
        else {
          const sql2 = `INSERT INTO ${process.env.DATABASE_PLATFORM}.instances (StudyId, ExperimentId, InstanceId, CreationTimestamp, Status, DDAParity)
          VALUES  (${results[0]["StudyId"]},${results[0]["ExperimentId"]},"${table.time}_${table.id}",${table.time}, "running", false);`;
          console.log(sql2);
          studyId = results[0]["StudyId"];
          mysqlConnection_platform.query(sql2, (error, results) => {
            if (error || !results.length) {
              // TODO: Take care of exception
              socket.emit('unableToAddInstanceData', {message: "Adding instance data failed", instanceId: `${table.time}_${table.id}`});
            }});

       } 
    })

    // Check if experiment is interrupted
    refreshIntervalId = setInterval( async () => {
      console.log(`checking stillAlive: ${stillAlive}`);
      let isInterr = await checkIfInteruppted();
      console.log("is it interrupted?" + isInterr);
      if (isInterr === true) {
        console.log("THE GAME IS VERY MUCH INTERRUPTED");
        setInterruptedGame(`${table.time}_${table.id}`, data.ExperimentID);
      }
    }, 30000);
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
    console.log(sql);
    mysqlConnection_platform.query(sql, (error, results) => {
        if (error || !results.length) {
          // TODO: Take care of exception
          socket.emit('noAvailableInstance', {message: "There's no instance with such ID", instanceId: `${table.time}_${table.id}`});
        }
        else{
          socket.broadcast.emit('message', `table ${process.env.DATABASE_DDA}.dda_input_${table.time}_${table.id} was created`);
          socket.broadcast.emit('message', `table ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} was created`);
        }
    const sql2 = `SELECT ExperimentId, StudyId FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1;`;
    mysqlConnection_platform.query(sql2, (error, results) => {
      if (error || !results.length) {
        // TODO: Take care of exception
        socket.emit('noAvailableExpData', {message: "There's no experiment with such ID", instanceId: `${table.time}_${table.id}`});
      }
      else {
        studyId = results[0]["StudyId"];

     } 
  })
    })

    // Check if experiment is interrupted
    refreshIntervalId = setInterval( async () => {
      let isInterr = await checkIfInteruppted();
      if(isInterr === true) {
        console.log("THE GAME IS VERY MUCH INTERRUPTED");
        setInterruptedGame(`${table.time}_${table.id}`, data.ExperimentID);
      }
    }, 30000);
  });

  //Sending Data to the Tracker table for experiment analysis
  socket.on('TrackerInput', async data => {
    const sql = `INSERT INTO ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id}(Timestamp,Event,PlayerID,CoordX,CoordY,Item,Enemy,GameMode) 
      VALUES('${data.Time}','${data.Event+1}','${data.PlayerID}','${data.CoordX}','${data.CoordY}','${data.Item}','${data.Enemy}','${data.GameMode+1}');`;
    const { err, rows, fields } = await query_platform(sql)
    if(err) throw err;
    console.log("data was added");
    console.log("changing StillAlive to true");
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
        console.log("correct new game");
        console.log(results[0]["ExperimentId"]);
        console.log("Provided game code is correct. " + data.Code + "\nInstanceID: " + table.id);
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
        console.log("correct interrupted game");
        this.interruptedInstanceID = results[0]["InstanceId"];
        console.log(results[0]["ExperimentId"]);
        console.log("Provided game code is correct. " + data.Code + "\nInstanceID: " + table.id);
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
        // TODO: Take care of exception
        socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
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
        // TODO: Take care of exception
        socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
      }
      else {
        roundDuration = results[0]["RoundDuration"];
        colorBlindness = results[0]["Disability"];
        skin = results[0]["ColorSettings"];

        socket.emit('newGameScene', {rSettings: {numberOfPlayers:  numOfPlayers, 
                                                    roundLength:      roundDuration, 
                                                    blindness:        colorBlindness, 
                                                    modes:            modeList,
                                                    skin:             skin,
                                                    difficulties:     difficList}, instanceId: `${table.time}_${table.id}`});   
      }});
  
  });

  socket.on('SyncNewScene', (data) => {
    console.log("SyncNewScene");
    console.log(data);
    //socket.broadcast.emit('newGameSettings', {fuckyou: "fuckoff"});
    socket.emit('newGameSettings', data);
  });

  socket.on('SyncInterruptedScene', (data) => {
    console.log("SyncInterruptedScene");
    console.log(data);

    // Delete prev interrupted game code
    const sql_del_gamecode = `DELETE FROM ${process.env.DATABASE_PLATFORM}.interupted_instances WHERE InstanceId = '${table.time}_${table.id}' ;`;
    mysqlConnection_platform.query(sql_del_gamecode, (error, results) => {
      if (error || !results.length) {
        // TODO: Take care of exception
        socket.emit('noAvailableRoundData', {message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}`});
      }
    console.log(sql_del_gamecode);
    });

    //socket.broadcast.emit('newGameSettings', {fuckyou: "fuckoff"});
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

    console.log(data);
    try { 
    // Get number of rounds
      let sql_roundsNumber = `SELECT RoundsNumber FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1;`;
      let results = await query_platform(sql_roundsNumber);
      if (!results.length) {
        // TODO: Take care of exception
        console.log(sql_roundsNumber);
        socket.emit('noAvailableExpData', { message: "There's no experiment with such ID", instanceId: `${table.time}_${table.id}` });
      }
      else {
        roundsNumber = results[0]["RoundsNumber"];
        console.log(roundsNumber);
      }
    
      // Get how many rounds were done duing the instance  
      let sql_roundsDone = `SELECT count(*) RoundsDone FROM ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} where Event = 'newRound';`;
      results = await query_platform(sql_roundsDone);
      if (!results.length) {
        // TODO: Take care of exception
        console.log(sql_roundsDone);
        socket.emit('noAvailableRoundData', { message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}` });
      }
      else {
        roundsDone = results[0]["RoundsDone"];
        console.log(roundsDone);
      }

      // Get left rounds data  
      let sql_roundsLeft = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.rounds where ExperimentId = '${data.ExperimentID}' 
      and RoundNumber >= ${roundsDone} ORDER BY RoundNumber ASC;`;
      results = await query_platform(sql_roundsLeft);
      if (!results.length) {
        // TODO: Take care of exception
        console.log(sql_roundsLeft);
        socket.emit('noAvailableRoundData', { message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}` });
      }
      else {
        await results.map(row => {
          modeList.push(row["GameMode"]);
          difficList.push(row["Difficulty"]);

        })

        console.log(modeList);
        console.log(difficList);
      }

      // Get experiment settings  
      let sql_expr_settings = `SELECT * FROM ${process.env.DATABASE_PLATFORM}.experiments where ExperimentId = '${data.ExperimentID}' LIMIT 1 ;`;
      results = await query_platform(sql_expr_settings);
      if (!results.length) {
        // TODO: Take care of exception
        console.log(sql_expr_settings);
        socket.emit('noAvailableRoundData', { message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}` });
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
      console.log("PLOCPLOCPLOCPLOCPLOCPLOCPLOCPLOCPLOCPLOCPLOCPLOCPLOCPLOCPLOC\n" + sql_pLoc);
      results = await query_platform(sql_pLoc);
      if (!results.length) {
        // TODO: Take care of exception
        console.log(sql_pLoc);
        socket.emit('noAvailableRoundData', { message: "There are no rounds that match this experiment", instanceId: `${table.time}_${table.id}` });
      }
      else {
        await results.map(row => {
          playerLocList.push({ playerID: row["pid"], CoordX: row["CoordX"], CoordY: row["CoordY"], Health: row["Health"], Score: row["Score"] });
        });

        // Ensure players are sorted by their ID
        playerLocList.sort((a, b) => (a.playerID > b.playerID) ? 1 : -1);
        console.log(playerLocList);
        initTimestamp = results[0]["ts"] - 1
      }

      // Get enemies' positions
      let sql_eLoc = `SELECT Timestamp, Event, Enemy, CoordX, CoordY FROM ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} 
                        WHERE Event = "enemyLoc" and Timestamp < ${initTimestamp}+5 and Timestamp >  ${initTimestamp};`;
      
      results = await query_platform(sql_eLoc);

      if (!results.length) {
        // TODO: Take care of exception
        console.log(sql_eLoc);
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
        // TODO: Take care of exception
        console.log(sql_iLoc);
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
        // TODO: Take care of exception
        console.log(sql_hiLoc);
        heldPickupLocList.push({ Item: 0, playerID: 0 });
      }
      else {
        await results.map(row => {
          heldPickupLocList.push({ Item: row["Item"], playerID: row["PlayerID"] });
          console.log("bleh bluh" + sql_hiLoc);
          console.log(heldPickupLocList);
        });
      }
    }
    catch (err) {console.log("fuck");}
    console.log(  {numberOfPlayers:  numOfPlayers, 
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
    });

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
    clearInterval(refreshIntervalId);
    console.log("game ended")

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
    console.log("emit")

    try {
      let result = await query_platform(`SELECT ExperimentId FROM ${process.env.DATABASE_PLATFORM}.instances WHERE InstanceId = '${instance_id}'`)
      let experiment_id = result[0].ExperimentId
      let values = []
      console.log("1")

      try {
        let dda_select = await query_dda(select_query + dda_table)
        console.log("2")

        if (dda_select.length) {
          dda_select.map(row => {
            let { Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode } = row
            values.push([instance_id, experiment_id, Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode])
          })
        }

        let tracker_select = await query_platform(select_query + tracker_table)
        console.log("3")

        if (tracker_select.length) {
          tracker_select.map(row => {
            let { Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode } = row
            values.push([instance_id, experiment_id, Timestamp, Event, PlayerID, CoordX, CoordY, Item, Enemy, GameMode])
          })
        }

        if (values.length) {
          try {
            let insert_result = await query_platform(insert_query, [values])
            console.log("4")
            if (!insert_result.affectedRows) {
              console.log(`no new rows inserted to ${permanent_table}`)
            }
          }
          catch (insert_error) {
            console.log(insert_error)
          }
        }
      }
      catch (select_error) {
        console.log(select_error)
      }

      let dda_drop = query_dda(drop_query + dda_table)
      console.log("5")

      let tracker_drop = query_platform(drop_query + tracker_table)
      console.log("6")

    }
    catch (error) {
      console.log(error)
    }

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
        if (json.result === "Success") {
          console.log("here! good")
        }
        else {
          console.log("here! bad")
          console.log(json);

        }
      })
    })
      .catch(err => {
        console.log("here! very bad")
      });
  });

  socket.on('disconnect', async () => {
    console.log('A player has disconnected');
    //socket.broadcast.emit('message', `table ${process.env.DATABASE}.DDA_Input_${table.time}_${table.id} finished the game`);
    socket.broadcast.emit('message', `table ${process.env.DATABASE_PLATFORM}.tracker_input_${table.time}_${table.id} finished the game`);
    let isInterr = await checkIfInteruppted();
    if(isInterr === true) {
      console.log("THE GAME IS VERY MUCH INTERRUPTED");
      console.log("expid: " + experimentId);
      console.log("instid: "+ table.id);
      setInterruptedGame(`${table.time}_${table.id}`, experimentId);
    }
  });
});
