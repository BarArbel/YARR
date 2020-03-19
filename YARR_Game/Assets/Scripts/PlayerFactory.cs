using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using SocketIO;
using Project.Networking;

public class PlayerFactory : ObjectFactory
{
    public enum Skin { Color, Shape, Type };

    private Vector2 Coords;
    private Skin SkinType;
    private int InitialHealth;
    private int MyItemsAmount;
    private int OthersItemsAmount;
    private bool IsSpriteDirectionRight;
    private float HeldItemHeight;
    private int NumberOfPlayers;
    private int PlayerCounter;

    private List<KeyCode> RightMovement;
    private List<KeyCode> LeftMovement;
    private List<KeyCode> JumpMovement;

    public GameObject PlayerPrefab;

    private SendCooperativeData sendCooperativeData;
    private SocketIOComponent socketIO; 

    private void PlayerFactoryInit()
    {
        Coords = new Vector3(0f, -3f, 0f);
        SkinType = Skin.Color;
        InitialHealth = 4;
        MyItemsAmount = 1;
        OthersItemsAmount = 3;
        IsSpriteDirectionRight = false;
        HeldItemHeight = 0.5f;

        NumberOfPlayers = 2;
        PlayerCounter = 0;

        RightMovement = new List<KeyCode>();
        LeftMovement = new List<KeyCode>();
        JumpMovement = new List<KeyCode>();

        RightMovement.Add(KeyCode.RightArrow);
        RightMovement.Add(KeyCode.D);

        Debug.Log(RightMovement.ToString());

        LeftMovement.Add(KeyCode.LeftArrow);
        LeftMovement.Add(KeyCode.A);

        JumpMovement.Add(KeyCode.Space);
        JumpMovement.Add(KeyCode.W);

        sendCooperativeData = new SendCooperativeData();
        socketIO = GameObject.Find("[Network Container]").GetComponent<NetworkClient>();
    }

    protected override void Spawn()
    {
        for (int i = 0; i < NumberOfPlayers; i++)
        {
            PlayerCounter++;
            GameObject playerObj = Instantiate(PlayerPrefab);
            Player player = playerObj.GetComponent<Player>();

            // TODO: Init player sprite, transform, rotation, etc.
            //playerObj.GetComponent<SpriteRenderer>().sprite = Resources.Load("path") as Sprite;
            //playerObj.
            // Init player properties
            player.PlayerInit(RightMovement[i], LeftMovement[i], JumpMovement[i], PlayerCounter, InitialHealth, MyItemsAmount, OthersItemsAmount, IsSpriteDirectionRight, HeldItemHeight,sendCooperativeData,socketIO);
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        PlayerFactoryInit();
        Spawn();
    }

    // Update is called once per frame
    void Update()
    {
        // TODO
    }
}
