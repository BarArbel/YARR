using Unity.Mathematics;
using Unity.Entities;
using UnityEngine;

[UpdateBefore(typeof(PlayerMovementSystem))]
class PlayerInputSystem : ComponentSystem {
   
    protected override void OnUpdate() {

        ForEach((ref PlayerInputComponent playerInputComponent) => {

            // Retrieve key presses
            if (Input.GetKey(playerInputComponent.moveLeftButton))
                playerInputComponent.direction.x = -1f;
            else if (Input.GetKey(playerInputComponent.moveRightButton))
                playerInputComponent.direction.x = 1f;

            if (Input.GetKey(playerInputComponent.jumpButton))
                playerInputComponent.jump = true;
        });
    }
}