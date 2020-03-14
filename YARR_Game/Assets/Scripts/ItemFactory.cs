using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ItemFactory : ObjectFactory
{
    List<Vector2> coords;
    public float SpawnTimer;
    bool Enabled;
    public GameObject[] Spawnee;

    protected override void Spawn()
    {
        // Create a random item in a random position 
        Vector3 randomPosition = new Vector3(UnityEngine.Random.Range(-10, 10), UnityEngine.Random.Range(-4,4), 0);
        int itemIndex = UnityEngine.Random.Range(0, Spawnee.Length);
        Instantiate(Spawnee[itemIndex], randomPosition, transform.rotation);
    }

    // Start is called before the first frame update
    void Start()
    {
        // Invoke the spawning routine from SpawnTimer every SpawnRate
        Debug.Log("Start Spawning");
        InvokeRepeating("Spawn", SpawnTimer, SpawnRate);
    }

    // Update is called once per frame
    void Update()
    {
        // TODO
    }
}
