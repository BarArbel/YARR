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

    /*DEBUG*/
    public override System.String GETLEVELSTRING()
    {
        return "P:" + GetID().ToString() + " spd:" + LevelSpeedAndSpawn.ToString() + " spn:" + LevelSpeedAndSpawn.ToString() + " prsn:" + LevelPrecision.ToString() + "\n";
    }

    // Here the change happens according to DDA decisions 
    protected override void ModifyLevelSettings()
    {
        // What are levels? PlayerDifficIndexes[i] aka Difficulty indexes from round to round
        List<int> levels = GetLevels();
        Debug.Log("enemy factory levels = " + levels[2] + levels[2] + levels[1] + " player = " + GetID());
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

        // TODO: write this better
        if (levels[2] - 1 < 0)
        {
            SpawnRateRange = LevelsOf_SpawnRateRange[0];
            Speed = LevelsOf_Speed[0];
        }
        else
        {
            SpawnRateRange = LevelsOf_SpawnRateRange[levels[2] - 1];
            Speed = LevelsOf_Speed[levels[2] - 1];
        }

        if (levels[1] - 1 < 0)
        {
            TurnsAvailable = LevelsOf_TurnsAvailable[0];
            TimeBetweenPathRecalculation = LevelsOf_TimeBetweenPathRecalculation[0];
        }
        else
        {
            TurnsAvailable = LevelsOf_TurnsAvailable[levels[1] - 1];
            TimeBetweenPathRecalculation = LevelsOf_TimeBetweenPathRecalculation[levels[1] - 1];
        }

        LevelPrecision = levels[1];
        LevelSpeedAndSpawn = levels[2];
        // TODO: Do we need this?
        /*if (!IsLevelModified)
        {
            IsLevelModified = true;
            LevelSpeedAndSpawn = 2;
            LevelPrecision = 2;
        }*/
    }

    protected override void Spawn()
    {
        if (Speed > 0)
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
            //enemyObj.GetComponent<SpriteRenderer>().sprite = GetSprite();
        }
    }


    public override GameObject ContinuedGameSpawn(float3 objectSettings)
    {
        if (Speed > 0)
        {
            // Calculate a random side to spawn at
            int enemyLayer = LayerMask.NameToLayer("Enemy");
            Vector3 position = new Vector3(objectSettings.y, objectSettings.z, 0);

            // Create an enemy
            GameObject enemyObj = Instantiate(GetPrefab(), position, transform.rotation);
            enemyObj.transform.SetParent(GameObject.Find("Map").transform);
            enemyObj.layer = enemyLayer;
            enemyObj.GetComponent<Enemy>().EnemyInit(GetID(), Damage, Speed, TurnsAvailable, TimeBetweenPathRecalculation);
            enemyObj.GetComponent<SpriteRenderer>().sprite = GetSprite();
            return enemyObj;
        }
        return null;
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
