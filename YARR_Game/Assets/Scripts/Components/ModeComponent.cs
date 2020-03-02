using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Entities;
using Unity.Mathematics;

public struct ModeComponent : IComponentData {

    public float mode;
    public float2 mapSize;
}
