using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Entities;
using Unity.Mathematics;

public struct PlayerInputComponent : IComponentData {

    public int playerID;

    public KeyCode moveRightButton;
    public KeyCode moveLeftButton;
    public KeyCode jumpButton;
    public float2 direction;
    public Bool jump;
}
