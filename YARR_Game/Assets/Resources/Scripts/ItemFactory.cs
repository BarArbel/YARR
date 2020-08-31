﻿using UnityEngine;
using Unity.Mathematics;

public class ItemFactory : ObjectFactory
{

    private int LevelTimerAndSpawn;

    /*DEBUG*/
    public override System.String GETLEVELSTRING()
    {
        return "P:" + GetID().ToString() + " tmr:" + LevelTimerAndSpawn.ToString() + " spn:" + LevelTimerAndSpawn.ToString() +  "\n";
    }

    // Here the change happens according to DDA decisions 
    protected override void ModifyLevelSettings()
    {
        // What are levels? PlayerDifficIndexes[i] aka Difficulty indexes from round to round
        int level = GetLevels();
        int startingDifficulty = GetStartingDifficulty();
        Damage = 0;
        Speed = 0;
        SpawnRateRange = new int2(10, 20);

        // Level properties initialization 
        float[] LevelsOf_DestroyTimer = { -1f, 10f, 7f, 5f, 5f, 5f };
        float2[] LevelsOf_SpawnHeightRange = new float2[]
        {
            new float2(-3, -2), new float2(-3, 0), new float2(-3, 2), new float2(0, 2), new float2(0, 3.5f), new float2(1, 3.5f)
        };

        // general level = Difficulty indexes carried from round to round
        if (level - 1 < 1)
        {
            DestroyTimer = LevelsOf_DestroyTimer[0];
            SpawnHeightRange = LevelsOf_SpawnHeightRange[0];
        }
        else
        {
            DestroyTimer = LevelsOf_DestroyTimer[level - 1];
            SpawnHeightRange = LevelsOf_SpawnHeightRange[level - 1];
        }

        LevelTimerAndSpawn = level;
    }

    protected override void Spawn()
    {
        int itemLayer = LayerMask.NameToLayer("Item"); 
        // Calculate a random location to spawn at
        Vector3 position = new Vector3(UnityEngine.Random.Range(-10, 10), UnityEngine.Random.Range(SpawnHeightRange.x, SpawnHeightRange.y), 0);

        // Create an item
        GameObject itemObj = Instantiate(GetPrefab(), position, transform.rotation);
        itemObj.transform.SetParent(GameObject.Find("Map").transform);
        itemObj.layer = itemLayer;
        itemObj.GetComponent<SpriteRenderer>().sprite = GetSprite();
        itemObj.GetComponent<Treasure>().TreasureInit(GetID(), DestroyTimer);
    }

    public override GameObject ContinuedGameSpawn(float3 objectSettings)
    {
        int itemLayer = LayerMask.NameToLayer("Item");
        // Calculate a random location to spawn at
        Vector3 position = new Vector3(objectSettings.y, objectSettings.z, 0);

        // Create an item
        GameObject itemObj = Instantiate(GetPrefab(), position, transform.rotation);
        itemObj.transform.SetParent(GameObject.Find("Map").transform);
        itemObj.layer = itemLayer;
        itemObj.GetComponent<SpriteRenderer>().sprite = GetSprite();
        itemObj.GetComponent<Treasure>().TreasureInit(GetID(), DestroyTimer);
        return itemObj;
    }

    public override GameObject ContinuedGameSpawn(int2 objectSettings)
    {
        int itemLayer = LayerMask.NameToLayer("Item");
        // Calculate a random location to spawn at
        Vector3 position = new Vector3(0, 0, 0);

        // Create an item
        GameObject itemObj = Instantiate(GetPrefab(), position, transform.rotation);
        itemObj.transform.SetParent(GameObject.Find("Map").transform);
        itemObj.layer = itemLayer;
        itemObj.GetComponent<SpriteRenderer>().sprite = GetSprite();
        itemObj.GetComponent<Treasure>().TreasureInit(GetID(), DestroyTimer);
        return itemObj;
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
