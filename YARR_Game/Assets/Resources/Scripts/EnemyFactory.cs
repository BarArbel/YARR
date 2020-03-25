using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;

public class EnemyFactory : ObjectFactory
{
    private int TurnsAvailable;
    private double TimeBetweenPathRecalculation;

    protected override void ModifyLevelSettings()
    {
        int2[] LevelsOf_SpawnRateRange = new int2[] 
        {
            new int2(-1,-1), new int2(8, 10), new int2(6, 8), new int2(4, 6), new int2(2, 4), new int2(2, 3)
        };

        float[] LevelsOf_Speed = { 0, 1f, 1.5f, 2f, 2.5f, 3f };
        int[]   LevelsOf_TurnsAvailable = { 0, 3, 4, 5, 6, 6};
        float[] LevelsOf_TimeBetweenPathRecalculation = { 0, 2.5f, 2f, 1.5f, 1f, 1f};

        // Is this Legit or is this recursion 
        int level = GetLevel();
        DestroyTimer = 10f;
        Damage = 1;
        
        switch (level)
        {
            // Adaptive
            case 0:

            // Static
            case 1:
                SpawnRateRange = new int2(-1,-1);
                Speed = 0;
                TurnsAvailable = 0;
                TimeBetweenPathRecalculation = 0;
                break;
            case 2:
                SpawnRateRange = new int2(8, 10);
                Speed = 1f;
                TurnsAvailable = 3;
                TimeBetweenPathRecalculation = 2.5;
                break;
            case 3:
                SpawnRateRange = new int2(6, 8);
                Speed = 1f;
                TurnsAvailable = 4;
                TimeBetweenPathRecalculation = 2;
                break;
            case 4:
                SpawnRateRange = new int2(4, 6);
                Speed = 2f;
                TurnsAvailable = 5;
                TimeBetweenPathRecalculation = 1.5;
                break;
            case 5:
                SpawnRateRange = new int2(2, 4);
                Speed = 2.5f;
                TurnsAvailable = 6;
                TimeBetweenPathRecalculation = 1;
                break;
            case 6:
                SpawnRateRange = new int2(2, 3);
                Speed = 3f;
                TurnsAvailable = 6;
                TimeBetweenPathRecalculation = 1;
                break;
            default:
                break;
        }
    }

    protected override void Spawn()
    {
        // Calculate a random side to spawn at
        const int enemyLayer = 11;
        float spawnX = UnityEngine.Random.value > 0.5 ? -10 : 10;
        Vector3 position = new Vector3(spawnX, 5, 0);

        // Create an enemy
        GameObject enemyObj = Instantiate(GetPrefab(), position, transform.rotation);
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
