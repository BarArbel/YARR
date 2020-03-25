using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

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

    private GameObject PlayerPrefab;
    private List<Sprite> PlayerSprites;
    private List<KeyCode> RightMovement;
    private List<KeyCode> LeftMovement;
    private List<KeyCode> JumpMovement;

    public void PlayerFactoryInit( 
        Vector2 coords, 
        int initialHealth, 
        int myItemsAmount, 
        int otherItemsAmount, 
        bool spriteDirection, 
        float itemHeight,
        int numberOfPlayers,
        List<Sprite> playerSprites,
        List<KeyCode> rightMovement,
        List<KeyCode> leftMovement,
        List<KeyCode> jumpMovement
        )
    {
        Coords = coords;
        InitialHealth = initialHealth;
        MyItemsAmount = myItemsAmount;
        OthersItemsAmount = otherItemsAmount;
        IsSpriteDirectionRight = spriteDirection;
        HeldItemHeight = itemHeight;
        NumberOfPlayers = numberOfPlayers;

        PlayerSprites = new List<Sprite>(playerSprites);
        RightMovement = new List<KeyCode>(rightMovement);
        LeftMovement = new List<KeyCode>(leftMovement);
        JumpMovement = new List<KeyCode>(jumpMovement);

        // Unchangable initializations
        PlayerCounter = 0;
        PlayerPrefab = Resources.Load<GameObject>("Prefabs/Player");

    }

    protected void Spawn()
    {
        for (int i = 0; i < NumberOfPlayers; i++)
        {
            PlayerCounter++;
            GameObject playerObj = Instantiate(PlayerPrefab);
            Player player = playerObj.GetComponent<Player>();

            // TODO: Init player sprite, transform, rotation, etc.            
            playerObj.tag = "Player";
            playerObj.GetComponent<SpriteRenderer>().sprite = PlayerSprites[i];

            // Init player properties
            player.PlayerInit(RightMovement[i], LeftMovement[i], JumpMovement[i], PlayerCounter, InitialHealth, MyItemsAmount, OthersItemsAmount, IsSpriteDirectionRight, HeldItemHeight);
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        Spawn();
    }

    // Update is called once per frame
    void Update()
    {

    }
}
