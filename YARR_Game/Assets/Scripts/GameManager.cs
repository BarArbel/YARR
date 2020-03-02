using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Entities;
using Unity.Transforms;
using Unity.Collections;
using Unity.Rendering;
using UnityEngine.Rendering;
using Unity.Mathematics;

public class GameManager : MonoBehaviour {

    public Mesh platformMesh;
    public Material platformMaterial;

    public Mesh groundMesh;
    public Material groundMaterial;

    public Mesh playerMesh;
    public Material playerMaterial;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    public static void AfterSceneLoad() {

        // Is the <GameManager> thing is correct?
        GameManager gameManager = GameObject.Find("GameManager").GetComponent<GameManager>();

        // Create or get EntityManager
        EntityManager manager = World.Active.GetOrCreateManager<EntityManager>();

        // Create the shared mesh renderer for platforms
        RenderMesh platformRenderer = new RenderMesh {

            mesh = gameManager.platformMesh,
            material = gameManager.platformMaterial,
            subMesh = 0,
            castShadows = ShadowCastingMode.Off,
            receiveShadows = false
        };

        // Create the shared mesh renderer for ground
        RenderMesh groundRenderer = new RenderMesh {

            mesh = gameManager.groundMesh,
            material = gameManager.groundMaterial,
            subMesh = 0,
            castShadows = ShadowCastingMode.Off, // the ground does not cast any shadow
            receiveShadows = false
        };

        // Create the shared mesh renderer for player
        RenderMesh playerRenderer = new RenderMesh {

            mesh = gameManager.playerMesh,
            material = gameManager.playerMaterial,
            subMesh = 0,
            castShadows = ShadowCastingMode.Off,
            receiveShadows = false
        };

        // Mode entity
        int width = 20, height = 8;
        Entity modeEntity = manager.CreateEntity(typeof(ModeComponent));
        manager.SetComponentData(modeEntity, new ModeComponent { mode = 1, mapSize = new float2(height, width) });

        // Platform archetype
        EntityArchetype platformArchetype = manager.CreateArchetype(
            typeof(PositionComponent),
            typeof(Position),
            typeof(RenderMesh),
            typeof(ColliderComponent));

        // Ground archetype
        EntityArchetype groundArchetype = manager.CreateArchetype(
            typeof(PositionComponent),
            typeof(Position),
            typeof(RenderMesh),
            typeof(ColliderComponent));

        // Player archetype 
        EntityArchetype playerArchetype = manager.CreateArchetype(
            typeof(PlayerInputComponent),
            typeof(PlayerMovementComponent),
            typeof(RigidBodyComponent),
            typeof(PositionComponent),
            typeof(Position),
            typeof(RenderMesh),
            typeof(ColliderComponent));

        // Ground entity
        /*int x = 0, y = 0;
        Entity groundEntity = manager.CreateEntity(groundArchetype);
        manager.SetComponentData(groundEntity, new PositionComponent { coords = new float2(x, y) });
        manager.SetSharedComponentData(groundEntity, groundRenderer);*/

        // Fill our level
        for (int x = 0; x < width; x++) { 
        
            for (int y = 1; y < height; y++) { 
            
                // Platform entity
                if ((x % 2 == 1 && y % 2 == 0) || (x % 2 == 0 && y % 2 == 1)) { 
                
                    Entity platformEntity = manager.CreateEntity(platformArchetype);
                    manager.SetComponentData(platformEntity, new PositionComponent { coords = new float2(x, y) });
                    manager.SetComponentData(platformEntity, new ColliderComponent { size = new float2(3f, 1f) });
                    manager.SetSharedComponentData(platformEntity, platformRenderer);
                }
            }

            // Ground entity
            Entity groundEntity = manager.CreateEntity(groundArchetype);
            manager.SetComponentData(groundEntity, new PositionComponent { coords = new float2(x, 0) });
            manager.SetComponentData(groundEntity, new ColliderComponent { size = new float2(1f, 1f) });
            manager.SetSharedComponentData(groundEntity, groundRenderer);
        }

        // Create player entity
        Entity playerEntity = manager.CreateEntity(playerArchetype);
        manager.SetComponentData(playerEntity, new PositionComponent { coords = new float2(0f, 0f) });
        manager.SetComponentData(playerEntity, new PlayerMovementComponent { speed = 4f });
        manager.SetComponentData(playerEntity, new PlayerInputComponent {
            playerID = 1,
            moveRightButton = KeyCode.RightArrow,
            moveLeftButton = KeyCode.LeftArrow,
            jumpButton = KeyCode.Space
        });
        manager.SetComponentData(playerEntity, new ColliderComponent { size = new float2(1f, 1f) });
        manager.SetSharedComponentData(playerEntity, playerRenderer);

    }
}
