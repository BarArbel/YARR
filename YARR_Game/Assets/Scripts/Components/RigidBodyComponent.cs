using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Entities;
using Unity.Mathematics;

public struct RigidBodyComponent : IComponentData {

    public float2 velocity;
}