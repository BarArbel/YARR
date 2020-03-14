using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public abstract class ObjectFactory : MonoBehaviour
{
    public float SpawnRate;

    protected abstract void Spawn();

    // Start is called before the first frame update
    void Start()
    {
        // TODO
    }

    // Update is called once per frame
    void Update()
    {
        // TODO
    }
}
