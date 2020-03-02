using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Entities;
using Unity.Transforms;

class PositionToWorldTransformSystem : ComponentSystem {

    protected override void OnUpdate() {

        ForEach((ref Position Position, ref PositionComponent positionComponent) => {

            Position.Value.x = positionComponent.coords.x;
            Position.Value.y = positionComponent.coords.y;
        });
    }
}