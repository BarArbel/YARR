const { query } = require('../database.js');

async function ExpQueries(experimentId, InstanceId){
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
            from yarr.raw_data 
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
        from yarr.raw_data 
        where ExperimentID = ${experimentId} and GameMode = 'Competitive') as counter
        group by 1,2    )
    ON DUPLICATE KEY UPDATE Mode = VALUES(Mode), 
							              PercentItemsTaken = VALUES(PercentItemsTaken), 
                            PercentItemsMissed= VALUES(PercentItemsMissed),
                            PercentEnemiesAvoid = VALUES(PercentEnemiesAvoid),
                            PercentEnemiesHit = VALUES(PercentEnemiesHit),
                            PercentEnemiesBlock = VALUES(PercentEnemiesBlock);`;
    console.log(sql_percents);
    let results = await query(sql_percents);


    let sql_eng_lvls = `INSERT INTO yarr.exp_insights_mirror
    WITH eng AS 
    (SELECT ResearcherId, StudyId, ExperimentId, InstanceId, AxisTime, AxisEngagement, GameMode, CharacterType
	FROM 
		(SELECT ResearcherId, raw.StudyId, raw.ExperimentId, raw.InstanceId, FLOOR(Timestamp) AxisTime, Item AxisEngagement, GameMode, CharacterType
		FROM
		  (SELECT * 
		  FROM yarr.raw_data_view  
		  Where Event = 'playerClickCount' AND ExperimentID = ${experimentId} ) raw LEFT JOIN yarr.experiments ON raw.StudyId = experiments.StudyId
		#GROUP BY 1,2,3,4,5,7,8    
		ORDER BY 3    ) aeng 
    GROUP BY 1,2,3,4,6,5,7,8)
    
    SELECT ResearcherId, StudyId, ExperimentId, InstanceId, AxisTime, FLOOR(AVG(AxisEngagement)) AxisEngagement, BreakdownType, BreakdownName
    FROM
        (SELECT ResearcherId, StudyId, ExperimentId, InstanceId, AxisTime, AxisEngagement, "mode" BreakdownType, "competitive" BreakdownName
        FROM eng
        WHERE GameMode = 'Competitive'
        GROUP BY 1,2,3,4,6,5,7,8
          UNION ALL
        SELECT ResearcherId, StudyId, ExperimentId, InstanceId, AxisTime, AxisEngagement, "mode" BreakdownType, "cooperative" BreakdownName
        FROM eng
        WHERE GameMode = 'Cooperative'
        GROUP BY  1,2,3,4,6,5,7,8
          UNION ALL
        SELECT ResearcherId, StudyId, ExperimentId, InstanceId, AxisTime, AxisEngagement, "skin" BreakdownType, "color" BreakdownName
        FROM eng
        WHERE CharacterType = 1
        GROUP BY 1,2,3,4,6,5,7,8
          UNION ALL
        SELECT ResearcherId, StudyId, ExperimentId, InstanceId, AxisTime, AxisEngagement, "skin" BreakdownType, "shape" BreakdownName
        FROM eng
        WHERE CharacterType = 2
        GROUP BY 1,2,3,4,6,5,7,8
          UNION ALL
        SELECT ResearcherId, StudyId, ExperimentId, InstanceId, AxisTime, AxisEngagement, "skin" BreakdownType, "type" BreakdownName
        FROM eng
        WHERE CharacterType = 3
        GROUP BY  1,2,3,4,6,5,7,8) all_eng
    GROUP BY 1,2,3,4,5,7,8
    ORDER BY AxisTime
    ON DUPLICATE KEY UPDATE AxisEngagement= VALUES(AxisEngagement);`;
    console.log(sql_eng_lvls);
    results = await query(sql_eng_lvls);


    let sql_eng_percent = `INSERT INTO yarr.engagement_levels 
    WITH death_timers AS
    (SELECT pid, DeathStart, min(DeathEnd) DeathEnd, gm
    FROM
        (SELECT pid, DeathStart, gm, IF(evnts_strtend.DeathEnd is NULL,evnts.DeathEnd,evnts_strtend.DeathEnd) DeathEnd, GameMode
        FROM
            (SELECT pid, DeathStart, gm, IF(PlayerID is NULL,0,PlayerID) PlayerID, DeathEnd 
            FROM
              (SELECT * FROM
                (SELECT PlayerID pid, IF(Event = 'individualLoss' OR Event = 'temporaryLose',Timestamp,0) DeathStart, GameMode gm
                FROM yarr.raw_data_view 
                WHERE InstanceID = '${InstanceId}'
                ORDER BY 1) as evnts_strt
              WHERE pid != 0 AND DeathStart != 0) as evnts_strt
            LEFT JOIN  (SELECT *
                  FROM
                    (SELECT PlayerID, IF(Event = 'revived',Timestamp,0) DeathEnd, GameMode
                    FROM yarr.raw_data_view 
                    WHERE InstanceID = '${InstanceId}'
                    ORDER BY 1) as evnts
                  WHERE DeathEnd != 0) as evnts_end
            ON pid = evnts_end.PlayerID   )    evnts_strtend
        LEFT JOIN (	SELECT * 
              FROM
                (SELECT PlayerID, IF(Event = 'newRound',Timestamp,0) DeathEnd, GameMode
                FROM yarr.raw_data_view 
                WHERE InstanceID = '${InstanceId}'
                ORDER BY 1) as evnts_round
              WHERE DeathEnd != 0 ) as evnts ON evnts.PlayerID = evnts_strtend.PlayerID  and gm = GameMode ) as strtend
    GROUP BY 1,2,4  ),
    
    no_death AS
    (SELECT *
    FROM
      (SELECT * 
      FROM yarr.raw_data_view  
      WHERE InstanceID = '${InstanceId}' )  inst_evnts 
    LEFT JOIN death_timers ON PlayerID = pid 
    WHERE NOT(PlayerID = pid AND Event = 'playerClickCount' AND Timestamp >= DeathStart AND Timestamp <= DeathEnd)  ),       
    
    eng AS
    (SELECT ResearcherId, StudyId, ExperimentID, InstanceId, PlayerID, (Last_click_including_death/round_Id)*100 engagement_percent, round_id
    FROM (
        SELECT ResearcherId, StudyId, ExperimentID, InstanceId, PlayerID, max(Timestamp) Last_click_including_death , round_id
        FROM
            (SELECT rdv.ResearcherId, rdv.StudyId, rdv.ExperimentID, rdv.InstanceId, rdv.PlayerID,rdv.Event,rdv.Timestamp , 
                (SELECT MIN(Timestamp) 
                FROM no_death tbl 
                WHERE tbl.Timestamp > rdv.Timestamp AND tbl.Event in ('newRound','gameEnded') 
                AND tbl.InstanceID = '${InstanceId}' and rdv.Item!=0) as round_id
            FROM no_death as rdv
            WHERE rdv.InstanceID = '${InstanceId}' AND rdv.Event = 'playerClickCount' ) as rnd
        Group by 1,2,3,4,5,7 HAVING round_id - max(Timestamp) > 5
      ) as evnts)
        
    SELECT raw.researcherId, raw.StudyId, raw.ExperimentID, raw.InstanceId, raw.PlayerID, 
        IF(engagement_percent is null /*AND raw.PlayerID != 0*/,100,engagement_percent) engagement_percent, 
         round_id
    FROM
      (SELECT * FROM yarr.raw_data_view     
      WHERE InstanceID = '${InstanceId}' AND Event in ('newRound','gameEnded','playerClickCount')) as raw
    Left join eng ON raw.PlayerID = eng.PlayerID   
    GROUP BY 1,2,3,4,5,6,7
    ORDER BY 5,7
    ON DUPLICATE KEY UPDATE engagement_percent = VALUES(engagement_percent);`;
    console.log(sql_eng_percent);
    results = await query(sql_eng_percent);


    // do stuff with results
    //insert query should be here
    // results = query(`anotherQueryRightHeeeyah`);

    //etc....
  }
  catch (err) {
    // DO WE PICNIC NOW OR WE PICNIC LATER?!?!?!?
    return false;
  }

  // if all is well
  return true;
}

async function StudyQueries(studyId) {
  try {
    let sql_percents = `
    INSERT INTO yarr.study_insights_bar
    select * from
    (select * from (
        select  ResearcherId, StudyId, GameMode, 
                (sum(ItemTaken)/sum(ItemSpawns))*100 PercentItemsCaptured,
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
                    ResearcherId, StudyId, GameMode
            from yarr.raw_data_view 
            where StudyId = ${studyId} and GameMode = 'Cooperative') as counter
        group by 1,2    ) coop_sums 
    union all 
    (select ResearcherId, StudyId, GameMode, 
    (sum(ItemTaken)/sum(ItemSpawns))*100 PercentItemsCaptured,
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
                ResearcherId, StudyId, GameMode
     from yarr.raw_data_view 
     where StudyId = ${studyId} and GameMode = 'Competitive') as counter
    group by 1,2    )) as new
    ON DUPLICATE KEY UPDATE Mode = VALUES(Mode), 
							PercentItemsCaptured = VALUES(PercentItemsCaptured), 
                            PercentItemsMissed= VALUES(PercentItemsMissed),
                            PercentEnemiesAvoid = VALUES(PercentEnemiesAvoid),
                            PercentEnemiesHit = VALUES(PercentEnemiesHit),
                            PercentEnemiesBlock = VALUES(PercentEnemiesBlock);`;
    let results = await query(sql_percents);

    let sql_eng_lvls = `INSERT INTO yarr.study_insights_mirror
    WITH eng AS 
    (SELECT ResearcherId, StudyId, AxisTime, AxisEngagement, GameMode, CharacterType
	FROM 
		(SELECT ResearcherId, raw.StudyId, FLOOR(Timestamp) AxisTime, Item AxisEngagement, GameMode, CharacterType
		FROM
		  (SELECT * 
		  FROM yarr.raw_data_view  
		  Where Event = 'playerClickCount' AND StudyId = ${studyId}) raw LEFT JOIN yarr.experiments ON raw.StudyId = experiments.StudyId
		ORDER BY 3    ) aeng 
    GROUP BY 1,2,3,4,6,5)
    
    SELECT ResearcherId, StudyId, AxisTime, FLOOR(AVG(AxisEngagement)) AxisEngagement, BreakdownType, BreakdownName
    FROM
        (SELECT ResearcherId, StudyId, AxisTime, AxisEngagement, "mode" BreakdownType, "competitive" BreakdownName
        FROM eng
        WHERE GameMode = 'Competitive'
        GROUP BY 1,2,3,4,6,5
          UNION ALL
        SELECT ResearcherId, StudyId, AxisTime, AxisEngagement, "mode" BreakdownType, "cooperative" BreakdownName
        FROM eng
        WHERE GameMode = 'Cooperative'
        GROUP BY  1,2,3,4,6,5
          UNION ALL
        SELECT ResearcherId, StudyId, AxisTime, AxisEngagement, "skin" BreakdownType, "color" BreakdownName
        FROM eng
        WHERE CharacterType = 1
        GROUP BY 1,2,3,4,6,5
          UNION ALL
        SELECT ResearcherId, StudyId, AxisTime, AxisEngagement, "skin" BreakdownType, "shape" BreakdownName
        FROM eng
        WHERE CharacterType = 2
        GROUP BY 1,2,3,4,6,5
          UNION ALL
        SELECT ResearcherId, StudyId, AxisTime, AxisEngagement, "skin" BreakdownType, "type" BreakdownName
        FROM eng
        WHERE CharacterType = 3
        GROUP BY  1,2,3,4,6,5) all_eng
    GROUP BY 1,2,3,5
    ORDER BY AxisTime
    ON DUPLICATE KEY UPDATE AxisEngagement= VALUES(AxisEngagement);`;
    results = await query(sql_eng_lvls);

    let sql_eng_stats = `SET @rowindex := -1;
    INSERT INTO yarr.study_insights_radar
    WITH full_exp AS
    (SELECT *
    FROM
        (SELECT *
        from yarr.raw_data_view
        LEFT JOIN (	SELECT ExperimentId eid, Title, RoundsNumber, RoundDuration, Disability, CharacterType, ColorSettings 
              FROM yarr.experiments) as exps ON ExperimentId = exps.eid ) as exp_ext
    LEFT JOIN (SELECT RoundId, ExperimentId expid, RoundNumber, GameMode gm, Difficulty  FROM yarr.rounds) rnds ON rnds.expid = eid ),
    
    full_rounds AS
    (SELECT *
    FROM
        (SELECT *
        from yarr.rounds
        LEFT JOIN (	SELECT ExperimentId eid, StudyId, RoundsNumber
              FROM yarr.experiments WHERE StudyId = ${studyId}) as exps ON ExperimentId = exps.eid ) as exp_ext
    WHERE eid is not null ),
    
    i AS (
      SELECT
        @rowindex := @rowindex + 1 AS rowindex,
        engagement_percent
      FROM
        yarr.engagement_levels
      ORDER BY
        engagement_percent
    )
    
    select ResearcherId, StudyId,eid ExperimentId, Title ExperimentTitle, 
    MAX(engagement_percent) HighestEngagement, 
    AVG(engagement_percent) MeanEngagement,
    (SELECT
      AVG(i.engagement_percent) AS median
    FROM
      i
    WHERE studyId = ${studyId}
      AND i.rowindex IN (FLOOR(@rowindex / 2) , CEIL(@rowindex / 2))) MedianEngagement,
    (SELECT engagement_percent
    FROM (SELECT engagement_percent,count(*) occurs
          FROM yarr.engagement_levels
          where studyId = ${studyId}
          GROUP BY 1
          LIMIT 1
         ) as oc) ModeEngagement,
    MAX(engagement_percent)-MIN(engagement_percent) RangeEngagement,
    (select count(*) 
    from full_rounds
    where GameMode = 2) RoundsAmountComp,
    (select count(*) 
    from full_rounds
    where GameMode = 1)RoundsAmountCoop ,     
    RoundDuration, RoundsNumber, CharacterType, Disability, ColorSettings
    from full_exp
    LEFT JOIN (select Playerid pid, engagement_percent from yarr.engagement_levels where studyId = ${studyId}) as el on pid = full_exp.playerId
    where studyId = ${studyId}
    group by 1,2,3,4,7,8,10,11,14,15,16
    ON DUPLICATE KEY UPDATE ExperimentTitle = VALUES(ExperimentTitle),
    HighestEngagement = VALUES(HighestEngagement),
    MeanEngagement = VALUES(MeanEngagement),
    MedianEngagement = VALUES(MedianEngagement),
    ModeEngagement = VALUES(ModeEngagement),
    RangeEngagement = VALUES(RangeEngagement),
    RoundDuration = VALUES(RoundDuration),
    RoundsNumber = VALUES(RoundsNumber), 
    RoundsAmountComp = VALUES(RoundsAmountComp),
    RoundsAmountCoop = VALUES(RoundsAmountCoop),
    CharacterType = VALUES(CharacterType),
    Disability = VALUES(Disability),
    ColorSettings = VALUES(ColorSettings);`;
    
    results = await query(sql_eng_stats);

    let sql_clk_stats = `INSERT INTO yarr.study_insights_mixed
    WITH full_exp AS
    (SELECT *
    FROM
        (SELECT *
        from yarr.raw_data_view
        LEFT JOIN (	SELECT ExperimentId eid, Title, RoundsNumber, RoundDuration, Disability, CharacterType, ColorSettings 
              FROM yarr.experiments WHERE studyId = ${studyId}) as exps ON ExperimentId = exps.eid 
              WHERE studyId = ${studyId} ) as exp_ext )
    
    SELECT 
    ResearcherId,
    StudyId,
    ExperimentId,
    Title ExperimentTitle,
    FLOOR(Timestamp) TimeAxis,
    FLOOR(AVG(IF(Event = 'playerClickCount',Item,0))) Clicks,
    FLOOR(AVG(IF(Event = 'playerResponseTime',Item/100,0))) ResponseTime,
    If(Event = 'lvlUp',1,IF(Event = 'lvlDown',-1,0)) DifficultyChange
    FROM full_exp
    GROUP BY 1,2,3,4,5,8
    ON DUPLICATE KEY UPDATE Clicks = VALUES(Clicks),
    ResponseTime = VALUES(ResponseTime),
    DifficultyChange = VALUES(DifficultyChange);`;
    
    results = await query(sql_clk_stats);
    // do stuff with results
    //insert query should be here
    // results = query(`anotherQueryRightHeeeyah`);

    //etc....
  }
  catch (err) {
    console.log(err)
    // shit hits the fans. actual fans, people, who cheer for the SQL Queen.
    return false;
  }

  // if all is well
  return true;
}

module.exports = {
  analyzeData: async (req, res) => {
    console.log(req.body);
    const { instanceId, experimentId, studyId } = req.body;

    if (!instanceId || !experimentId || !studyId) {
      res.status(204).send(`{"result": "Failure", "params": {"instanceId": "${instanceId}",
          "experimentId": "${experimentId}"}, "studyId": "${studyId}"},
          "msg": "A parameter is missing."}`);
      return;
    }

    let result = await ExpQueries(experimentId, instanceId);
    // can check if result's good here
    result = await StudyQueries(studyId);


    result === true? 
    res.status(200).send(`{"result": "Success"}`)
    :
    res.status(204).send(`{"result": "Failure"}`)
  }
}
