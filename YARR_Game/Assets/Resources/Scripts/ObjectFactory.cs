using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;
using System;

public abstract class ObjectFactory : MonoBehaviour
{
    // DDA Properties
    protected int DDALevelSpawnHeightAndTimer;
    protected int DDALevelPrecision;
    protected int DDALevelSpeedAndSpawnRate;
    protected bool IsDDAInitiated;

    private int ID;
    private int Level;
    private int2 TempSpawnRate;

    protected int2 SpawnRateRange;
    protected float DestroyTimer;
    protected float2 SpawnHeightRange;
    protected float Speed;
    protected int Damage;

    // Game-Experiment settings
    protected bool IsNewGame;

    private GameObject Prefab;
    private Sprite Sprite;

    public void FactoryInit(int id, int level, GameObject prefab, Sprite sprite, bool isNewGame)
    {
        ID = id;
        Prefab = prefab;
        Sprite = sprite;
        IsDDAInitiated = false;
        SetLevel(level);
        IsNewGame = isNewGame;

    }

    // Getters
    public int          GetID()                 { return ID; }
    public int          GetLevel()              { return Level; }
    public int2         GetSpawnRateRange()     { return SpawnRateRange; }
    public float        GetDestroyTimer()       { return DestroyTimer; }
    public float2       GetSpawnHeightRange()   { return SpawnHeightRange; }
    public float        GetSpeed()              { return Speed; }
    public float        GetDamage()             { return Damage; }
    public GameObject   GetPrefab()             { return Prefab; }
    public Sprite       GetSprite()             { return Sprite; }

    // Setters
    public void SetLevel(int level)
    {
        Level = level;
        ModifyLevelSettings();
    }

    public void SetDDAChanges(int heightTimer, int precision, int speedspawn )
    {
        Debug.Log("does it change:" + precision);
        DDALevelSpawnHeightAndTimer = heightTimer;
        DDALevelPrecision = precision;
        DDALevelSpeedAndSpawnRate = speedspawn;
        ModifyLevelSettings();
    }

    public IEnumerator StartSpawner()
    {
        while (true)
        {
            while (SpawnRateRange.x == -1)
            {
                yield return null;
            }
                int randomNumber = UnityEngine.Random.Range(SpawnRateRange.x, SpawnRateRange.y);
                Invoke("Spawn", randomNumber);
                yield return new WaitForSeconds(randomNumber);
            
        }
    }

    public void FreezeSpawn (bool trigger)
    {
        int2 freeze = new int2(-1, -1);

        if (trigger && SpawnRateRange.x != -1)
        {
            TempSpawnRate = SpawnRateRange;
            SpawnRateRange.x = freeze.x;
        }
        else
        {
            SpawnRateRange = TempSpawnRate;
        }

    }

    protected abstract void ModifyLevelSettings();
    protected abstract void Spawn();
    public abstract GameObject ContinuedGameSpawn(float3 objectSettings);
    public virtual GameObject ContinuedGameSpawn(int2 objectSettings) { return null; }
    /*DEBUG*/
    public abstract System.String GETLEVELSTRING();

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {

    }
}
