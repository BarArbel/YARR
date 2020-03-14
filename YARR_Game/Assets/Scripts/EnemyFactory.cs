using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnemyFactory : ObjectFactory
{
    Vector2 coords;
    double Height;
    public float SpawnTimer;
    public GameObject Spawnee;
    protected override void Spawn()
    {
        // Create an enemy
        // Calculate a random side to spawn at
        float spawnX = UnityEngine.Random.value > 0.5 ? -10 : 10;
        Vector3 position = new Vector3(spawnX, 5, 0);
        Instantiate(Spawnee, position, transform.rotation);
    }

    // Start is called before the first frame update
    void Start()
    {
        InvokeRepeating("Spawn", SpawnTimer, SpawnRate);
    }

    // Update is called once per frame
    void Update()
    {
        // TODO
    }
}
