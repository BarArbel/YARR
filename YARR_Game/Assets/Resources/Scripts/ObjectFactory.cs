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
    protected bool IsLevelModified;

    private int ID;
    private List<int> Levels;
    private int2 TempSpawnRate;

    protected int2 SpawnRateRange;
    protected float DestroyTimer;
    protected float2 SpawnHeightRange;
    protected float Speed;
    protected int Damage;

    // Game-Experiment settings
    protected bool IsNewGame;
    protected bool IsStatic;

    private GameObject Prefab;
    private Sprite Sprite;

    protected int StartingDifficulty;


    public void FactoryInit(int id, List<int> levels, GameObject prefab, Sprite sprite, bool isNewGame, bool isStatic)
    {
        ID = id;
        Prefab = prefab;
        Sprite = sprite;
        IsLevelModified = false;
        SetLevels(levels);
        IsNewGame = isNewGame;
        IsStatic = isStatic;

    }
  
    public void FactoryInit(int id, List<int> levels, int startingDifficulty, GameObject prefab, Sprite sprite, bool isNewGame, bool isStatic)
    {
        ID = id;
        Prefab = prefab;
        Sprite = sprite;
        IsLevelModified = false;
        SetStartingDifficulty(startingDifficulty);
        SetLevels(levels);
        IsNewGame = isNewGame;
        IsStatic = isStatic;

    }

    // Getters
    public int          GetID()                 { return ID; }
    public List<int>    GetLevels()              { return Levels; }
   
    public int          GetStartingDifficulty() { return StartingDifficulty; }
    public int2         GetSpawnRateRange()     { return SpawnRateRange; }
    public float        GetDestroyTimer()       { return DestroyTimer; }
    public float2       GetSpawnHeightRange()   { return SpawnHeightRange; }
    public float        GetSpeed()              { return Speed; }
    public float        GetDamage()             { return Damage; }
    public GameObject   GetPrefab()             { return Prefab; }
    public Sprite       GetSprite()             { return Sprite; }

    // Setters
    public void SetLevels(List<int> levels)
    {
        Levels = levels;
        ModifyLevelSettings();
    }
    public void ModifyLevels(int LevelGeneral)
    {
        Levels[0] += LevelGeneral;
        Levels[1] += LevelGeneral;
        Levels[2] += LevelGeneral;
        ModifyLevelSettings();
    }

    public void SetStartingDifficulty(int difficulty)
    {
        StartingDifficulty = difficulty;
    }

    public void SetDDAChanges(int LevelGeneral)
    {
        // TODO: delete these variables since we don't use them anymore
        /*DDALevelSpawnHeightAndTimer = heightTimer;
        DDALevelPrecision = precision;
        DDALevelSpeedAndSpawnRate = speedspawn;*/

        if (!IsStatic)
        {
            ModifyLevels(LevelGeneral);
        }
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
