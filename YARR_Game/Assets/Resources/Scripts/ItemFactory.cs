using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;
using Project.Networking;
using Event = Project.Networking.Event;

public class ItemFactory : ObjectFactory
{

    private int LevelTimerAndSpawn;

    /*DEBUG*/
    public override System.String GETLEVELSTRING()
    {
        return "P:" + GetID().ToString() + " tmr:" + LevelTimerAndSpawn.ToString() + " spn:" + LevelTimerAndSpawn.ToString() +  "\n";
    }

    protected override void ModifyLevelSettings()
    {
        int level = GetLevel();
        Damage = 0;
        Speed = 0;
        SpawnRateRange = new int2(10, 20);

        // Level properties initialization 
        float[] LevelsOf_DestroyTimer = { -1f, 10f, 7f, 5f, 5f, 5f };
        float2[] LevelsOf_SpawnHeightRange = new float2[]
        {
            new float2(-3, -2), new float2(-3, 0), new float2(-3, 2), new float2(0, 2), new float2(0, 3.5f), new float2(1, 3.5f)
        };

        // Static Competitive/Cooperative
        if (level != 0)
        {
            DestroyTimer = LevelsOf_DestroyTimer[level - 1];
            SpawnHeightRange = LevelsOf_SpawnHeightRange[level - 1];
        }
        // Adaptive 
        else
        {
            if (!IsDDAInitiated)
            {
                IsDDAInitiated = true;
                LevelTimerAndSpawn = 3;
            }

            if (!(LevelTimerAndSpawn == 1 && DDALevelSpawnHeightAndTimer == -1) && !(LevelTimerAndSpawn == 6 && DDALevelSpawnHeightAndTimer == 1))
            {
                int mode = GetID() == -1 ? 1 : 0;
                LevelTimerAndSpawn += DDALevelSpawnHeightAndTimer;
                Event evnt = DDALevelSpawnHeightAndTimer > 0 ? Event.lvlUp : (DDALevelSpawnHeightAndTimer < 0 ? Event.lvlDown : Event.lvlStay);
                DataTransformer.sendTracker(Time.realtimeSinceStartup, evnt, GetID(), 0, 0, 0, GetID(), mode);

            }

            DestroyTimer = LevelsOf_DestroyTimer[LevelTimerAndSpawn - 1];
            SpawnHeightRange = LevelsOf_SpawnHeightRange[LevelTimerAndSpawn - 1];
        }
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

    // Start is called before the first frame update
    void Start()
    {
        StartCoroutine(StartSpawner());
    }

    // Update is called once per frame
    void Update()
    {
        // TODO
    }
}
