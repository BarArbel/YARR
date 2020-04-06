﻿using System.Collections;
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


    private GameObject Prefab;
    private Sprite Sprite;

    // TODO:
    public void FactoryInit(int id, int level, GameObject prefab, Sprite sprite)
    {
        ID = id;
        Prefab = prefab;
        Sprite = sprite;
        IsDDAInitiated = false;
        SetLevel(level);

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
        DDALevelSpawnHeightAndTimer = heightTimer;
        DDALevelPrecision = precision;
        DDALevelSpeedAndSpawnRate = speedspawn;
        Debug.Log("Player: " + ID + " spawnrate:" + SpawnRateRange );
}

    public IEnumerator StartSpawner()
    {
        while (SpawnRateRange.x != -1)
        {
            int randomNumber = UnityEngine.Random.Range(SpawnRateRange.x, SpawnRateRange.y);
            Invoke("Spawn", randomNumber);
            yield return new WaitForSeconds(randomNumber);
        }
    }

    public void FreezeSpawn (bool trigger)
    {
        int2 freeze = new int2(-1, -1);
        if (trigger && SpawnRateRange.x != freeze.x)
        {
            TempSpawnRate = SpawnRateRange;
            SpawnRateRange = freeze;            
        }
        else if (!trigger && SpawnRateRange.x == freeze.x)
        {
            SpawnRateRange = TempSpawnRate;
        }

    }

    protected abstract void ModifyLevelSettings();
    protected abstract void Spawn();

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {

    }
}
