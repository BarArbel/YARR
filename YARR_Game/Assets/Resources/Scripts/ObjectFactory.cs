using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;
using System;

public abstract class ObjectFactory : MonoBehaviour
{
    [Serializable]
    public class DDACalcs
    {
        public int LevelSpawnHeightAndTimer;
        public int LevelPrecision;
        public int LevelSpeedAndSpawnRate;
    }

    private int ID;
    private int Level;

    protected int2 SpawnRateRange;
    protected float DestroyTimer;
    protected float2 SpawnHeightRange;
    protected float Speed;
    protected int Damage;

    protected DDACalcs calcs;


    private GameObject Prefab;
    private Sprite Sprite;

    // TODO:
    public void FactoryInit(int id, int level, GameObject prefab, Sprite sprite)
    {
        ID = id;
        Prefab = prefab;
        Sprite = sprite;
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

    public IEnumerator StartSpawner()
    {
        while (SpawnRateRange.x != -1)
        {
            int randomNumber = UnityEngine.Random.Range(SpawnRateRange.x, SpawnRateRange.y);
            Invoke("Spawn", randomNumber);
            yield return new WaitForSeconds(randomNumber);
        }
    }

    protected void SetDDAChanges(string calc)
    {
        calcs = JsonUtility.FromJson<DDACalcs>(calc);
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
