using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using Unity.Mathematics;

public class PlayerFactory : MonoBehaviour
{
    private Vector2 Coords;
    private int InitialHealth;
    private int MyItemsAmount;
    private int OthersItemsAmount;
    private bool IsSpriteDirectionRight;
    private float HeldItemHeight;
    private int NumberOfPlayers;
    private int PlayerCounter;
    private bool IsNewGame;

    private List<GameObject> PlayerPrefab;
    private List<Sprite> PlayerSprites;
    private List<string> Movement;
    private List<string> Jump;

    public void PlayerFactoryInit( 
        Vector2 coords, 
        int initialHealth, 
        int myItemsAmount, 
        int otherItemsAmount, 
        bool spriteDirection, 
        float itemHeight,
        int numberOfPlayers,
        List<GameObject> PlayerPrefabs,
        List<string> Movement,
        List<string> Jump,
        bool isNewGame
        )
    {
        Coords = coords;
        InitialHealth = initialHealth;
        MyItemsAmount = myItemsAmount;
        OthersItemsAmount = otherItemsAmount;
        IsSpriteDirectionRight = spriteDirection;
        HeldItemHeight = itemHeight;
        NumberOfPlayers = numberOfPlayers;
        IsNewGame = isNewGame;

        //PlayerSprites = new List<Sprite>(playerSprites);
        this.Movement = new List<string>(Movement);
        this.Jump = new List<string>(Jump);

        // Unchangable initializations
        PlayerCounter = 0;
        PlayerPrefab = new List<GameObject>(PlayerPrefabs);//Resources.Load<GameObject>("Prefabs/Player");

    }

    protected void Spawn()
    {
        for (int i = 0; i < NumberOfPlayers; i++)
        {
            PlayerCounter++;
            GameObject playerObj = Instantiate(PlayerPrefab[i]);
            Player player = playerObj.GetComponent<Player>();
            player.transform.SetParent(GameObject.Find("Map").transform);
            playerObj.transform.position = new Vector3(2,-5f,0);
            playerObj.tag = "Player";
            //playerObj.GetComponent<SpriteRenderer>().sprite = PlayerSprites[i];

            // Init player properties
            player.PlayerInit(Movement[i], Jump[i], PlayerCounter, InitialHealth, MyItemsAmount, OthersItemsAmount, IsSpriteDirectionRight, HeldItemHeight);
        }
    }

    public void ContinuedGameSpawn(List<float4> playerSettings)
    {
        if (!IsNewGame)
        {
            for (int i = 0; i < playerSettings.Count; i++)
            {
                int playerID = (int)playerSettings[i].x;
                
                GameObject playerObj = Instantiate(PlayerPrefab[playerID-1]);
                Player player = playerObj.GetComponent<Player>();
                
                // Init player properties
                //player.PlayerInit(RightMovement[i], LeftMovement[i], JumpMovement[i], playerID, InitialHealth, MyItemsAmount, OthersItemsAmount, IsSpriteDirectionRight, HeldItemHeight);
                //checkfor keyboard
                player.PlayerInit(Movement[i],Jump[i], playerID, InitialHealth, MyItemsAmount, OthersItemsAmount, IsSpriteDirectionRight, HeldItemHeight);

                

                player.transform.SetParent(GameObject.Find("Map").transform);
                // Init player health
                player.SetHealth((int)playerSettings[i].w);
                // Init player position
                playerObj.transform.position = new Vector3(playerSettings[i].y, playerSettings[i].z, 0);

                playerObj.tag = "Player";

                //playerObj.GetComponent<SpriteRenderer>().sprite = PlayerSprites[playerID];
                //playerObj.GetComponent<SpriteRenderer>().sprite = PlayerSprites[i];

            }
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        if (IsNewGame)
        {
            Spawn();
        }
        
    }

    // Update is called once per frame
    void Update()
    {

    }
}
