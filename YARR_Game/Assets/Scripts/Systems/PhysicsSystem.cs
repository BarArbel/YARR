using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;

class PhysicsSystem : ComponentSystem {


    protected override void OnUpdate() {

        // Get elapsed time
        float dt = Time.deltaTime;

        ForEach((ref RigidBodyComponent rigidBodyComponent, ref PositionComponent positionComponent, ref ColliderComponent colliderComponent, ref ModeComponent modeComponent) => {

            // Only update moving objects
            if (rigidBodyComponent.velocity.x != 0f || rigidBodyComponent.velocity.y != 0f) {

                positionComponent.coords += rigidBodyComponent.velocity * dt;
                bool collided = false;

                // Check first if we are outside the map
                // No need to check collision with other objects if already outside the map
                if (!InsideMap(positionComponent.coords, colliderComponent.size, modeComponent.mapSize)) {

                    //EntityQuery m_Group = GetEntityQuery(ComponentType.ReadOnly<ColliderComponent>());

                    var entityManager = World.Active.GetOrCreateManager<EntityManager>();
                    NativeArray<Entity> allEntities = entityManager.GetAllEntities();
                    foreach (var entity in allEntities) { 
                        entityManager.GetComponentData<ColliderComponent>(entity);
                        //GetComponentData<T>
                    }
                    allEntities.Dispose();
                }
            }
        });
    }

    // Checks if the colliders at position posA and size sizeA overlaps 
    // with the square at position posB and size sizeB
    // TODO: Make this function look.... prettier. 
    static bool CollidersOverlap(float2 posA, float2 sizeA, float2 posB, float2 sizeB) {

        // Assuming the pivot of an object will always remain in the center & colliders will never be diagonal  
        float2 p1A = new float2(posA.x - (sizeA.x / 2), posA.y + (sizeA.y / 2));
        float2 p2A = new float2(posA.x + (sizeA.x / 2), posA.y + (sizeA.y / 2));
        float2 p3A = new float2(posA.x - (sizeA.x / 2), posA.y - (sizeA.y / 2));

        float2 p1B = new float2(posB.x - (sizeB.x / 2), posB.y + (sizeB.y / 2));
        float2 p2B = new float2(posB.x + (sizeB.x / 2), posB.y + (sizeB.y / 2));
        float2 p3B = new float2(posB.x - (sizeB.x / 2), posB.y - (sizeB.y / 2));

        return !((p1A.y < p3B.y || p1B.y < p3A.y) && (p2A.x < p1B.x || p2B.x < p1A.x));
    }

    // TODO: Make this function look.... prettier. 
    static bool InsideMap(float2 pos, float2 size, float2 mapSize) {

        // Assuming the pivot of an object will always remain in the center & colliders will never be diagonal  
        float2 p1Map = new float2( -(mapSize.x / 2),   (mapSize.y / 2));
        float2 p2Map = new float2(  (mapSize.x / 2),   (mapSize.y / 2));
        float2 p3Map = new float2( -(mapSize.x / 2),  -(mapSize.y / 2));

        float2 p1 = new float2(pos.x - (size.x / 2), pos.y + (size.y / 2));
        float2 p2 = new float2(pos.x + (size.x / 2), pos.y + (size.y / 2));
        float2 p3 = new float2(pos.x - (size.x / 2), pos.y - (size.y / 2));

        return (mapSize.x > size.x && mapSize.y > size.y && p1.x >= p1Map.x && p2.x <= p2Map.x && p3.y >= p3Map.y && p1.y < p1Map.y );
    }
}
