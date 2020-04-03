using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;
//using System.Text.Json;
//using System.Text.Json.Serialization;

public class EnemyFactory : ObjectFactory
{
    private int TurnsAvailable;
    private double TimeBetweenPathRecalculation;
    private int LevelSpeedAndSpawn;
    private int LevelPrecision;

    protected override void ModifyLevelSettings()
    {
        int level = GetLevel();
        DestroyTimer = 10f;
        Damage = 1;

        // Level properties initialization 
        int2[] LevelsOf_SpawnRateRange = new int2[] 
        {
            new int2(-1,-1), new int2(8, 10), new int2(6, 8), new int2(4, 6), new int2(2, 4), new int2(2, 3)
        };

        float[] LevelsOf_Speed = { 0, 1f, 1.5f, 2f, 2.5f, 3f };
        int[]   LevelsOf_TurnsAvailable = { 0, 3, 4, 5, 6, 6};
        float[] LevelsOf_TimeBetweenPathRecalculation = { 0, 2.5f, 2f, 1.5f, 1f, 1f};

        // Static
        if (level != 0)
        {
            SpawnRateRange = LevelsOf_SpawnRateRange[level-1];
            Speed = LevelsOf_Speed[level - 1];
            TurnsAvailable = LevelsOf_TurnsAvailable[level - 1];
            TimeBetweenPathRecalculation = LevelsOf_TimeBetweenPathRecalculation[level - 1];

        }
        // Adaptive
        else
        {
            LevelSpeedAndSpawn += calcs.LevelSpeedAndSpawnRate;
            LevelPrecision += calcs.LevelPrecision;

            SpawnRateRange = LevelsOf_SpawnRateRange[LevelSpeedAndSpawn - 1];
            Speed = LevelsOf_Speed[LevelSpeedAndSpawn - 1];
            TurnsAvailable = LevelsOf_TurnsAvailable[LevelPrecision - 1];
            TimeBetweenPathRecalculation = LevelsOf_TimeBetweenPathRecalculation[LevelPrecision - 1];
        }

    }

    protected override void Spawn()
    {
        // Calculate a random side to spawn at
        int enemyLayer = LayerMask.NameToLayer("Enemy"); 
        float spawnX = UnityEngine.Random.value > 0.5 ? -10 : 10;
        Vector3 position = new Vector3(spawnX, UnityEngine.Random.Range(1f, 5f), 0);

        // Create an enemy
        GameObject enemyObj = Instantiate(GetPrefab(), position, transform.rotation);
        enemyObj.transform.SetParent(GameObject.Find("Map").transform);
        enemyObj.layer = enemyLayer;
        enemyObj.GetComponent<Enemy>().EnemyInit(GetID(), Damage, Speed, TurnsAvailable, TimeBetweenPathRecalculation);
        enemyObj.GetComponent<SpriteRenderer>().sprite = GetSprite();

    }

    // Start is called before the first frame update
    void Start()
    {
        StartCoroutine(StartSpawner());
    }

    // Update is called once per frame
    void Update()
    {

    }
}
