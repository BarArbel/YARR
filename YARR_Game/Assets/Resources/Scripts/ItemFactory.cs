using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;

public class ItemFactory : ObjectFactory
{
    protected override void ModifyLevelSettings()
    {
        int level = GetLevel();
        Damage = 0;
        Speed = 0;
        SpawnRateRange = new int2(10, 20);
        switch (level)
        {
            case 0:

            case 1:
                DestroyTimer = -1f;
                SpawnHeightRange = new float2(-3, -2);
                break;
            case 2:
                DestroyTimer = 10f;
                SpawnHeightRange = new float2(-3, 0);
                break;
            case 3:
                DestroyTimer = 7f;
                SpawnHeightRange = new float2(-3, 2);
                break;
            case 4:
                DestroyTimer = 5f;
                SpawnHeightRange = new float2(0, 2);
                break;
            case 5:
                DestroyTimer = 5f;
                SpawnHeightRange = new float2(0, 3.5f);
                break;
            case 6:
                DestroyTimer = 5f;
                SpawnHeightRange = new float2(1, 3.5f);
                break;
            default:
                break;
        }
    }

    protected override void Spawn()
    {
        const int itemLayer = 10;
        // Calculate a random location to spawn at
        Vector3 position = new Vector3(UnityEngine.Random.Range(-10, 10), UnityEngine.Random.Range(SpawnHeightRange.x, SpawnHeightRange.y), 0);

        // Create an item
        GameObject itemObj = Instantiate(GetPrefab(), position, transform.rotation);
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
