using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Entities;
using Unity.Mathematics;

[UpdateBefore(typeof(PhysicsSystem))]
class PlayerMovementSystem : ComponentSystem {

    protected override void OnUpdate() {

        // Get elapsed time
        float dt = Time.deltaTime;

        ForEach((ref PlayerInputComponent playerInputComponent, ref PlayerMovementComponent playerMovementComponent, ref RigidBodyComponent rigidBodyComponent ) => {

            rigidBodyComponent.velocity = playerMovementComponent.speed * playerInputComponent.direction;
        });
    }
}