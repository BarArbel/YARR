using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;
using Project.Networking;
using Event = Project.Networking.Event;
using System;

public class GameManager : MonoBehaviour
{
    public enum GameMode { Cooperative, Competitive };
    public enum Skin { Color, Shape, Type };
    public enum Level { Adaptive, Static1, Static2, Static3, Static4, Static5, Static6 };
    public enum ColorBlindness { Colorful, Protanopia, Tritanopia};
    //DEBUG
    public bool StaticMode = true;
    public bool CoopMode = true;

    //Round settings
    private int NumberOfRounds;
    private List<GameMode> RoundsModes;
    private Skin RoundsSkins;
    private List<Level> RoundsDifficulties;
    private bool ExperimentStarted;

    // Game settings
    private GameMode Mode;
    private int NumberOfPlayers;
    private Level Difficulty;
    private bool IsGameLost;
    private int DDAIndex;
    private Skin SkinType;
    private List<Vector2> ItemSinkColliderSize;
    private int CurrentRound;
    private float RoundLength;
    private float RoundTimer;
    private ColorBlindness BlindnessType;

    // Sprites
    private List<Sprite> ItemSprites;
    private List<Sprite> ItemSinkSprites;
    private List<Sprite> ColorSprites;
    private List<Sprite> ShapeSprites;
    private List<Sprite> TypeSprites;
    private List<Sprite> EnemySprites;
    private List<Sprite> PowerupSprites;

    // Input
    private List<KeyCode> RightMovement;
    private List<KeyCode> LeftMovement;
    private List<KeyCode> JumpMovement;

    // Additional player spawner settings
    private Vector2 SpawnLocation;
    private int InitialHealth;
    private int MyItemsAmount;
    private int OthersItemsAmount;
    private bool IsSpriteDirectionRight;
    private float HeldItemHeight;

    private PlayerFactory PlayerFactory;
    private List<ObjectFactory> ItemFactories;
    private List<ObjectFactory> EnemyFactories;
    private List<ObjectFactory> PowerupFactories;

    public bool InitExperiment(JSONObject rSettings)
    {
        ExperimentStarted = false;
        // Test json structure
        if (rSettings.list[0].keys[0] != "numberOfPlayers"             || 
            rSettings.list[0].keys[1] != "roundLength"                 || 
            rSettings.list[0].keys[2] != "blindness"                   ||
            rSettings.list[0].keys[3] != "modes"                       ||
            rSettings.list[0].keys[4] != "skin"                        ||
            rSettings.list[0].keys[5] != "difficulties"                ||
            rSettings.list[0].list[3].Count != rSettings.list[0].list[5].Count)
        {
            return false;
        }

        Debug.Log("Hello InitExperiment");
        Debug.Log(rSettings);

        // Experiment properties
        RoundTimer = 0;
        NumberOfRounds = rSettings.list[0].list[3].Count;
        NumberOfPlayers = (int)rSettings.list[0].list[0].n;
        RoundLength = (float)rSettings.list[0].list[1].n;
        BlindnessType = (ColorBlindness)rSettings.list[0].list[2].n-1;
        RoundsSkins = (Skin)rSettings.list[0].list[4].n-1;

        // Test json values
        if (NumberOfRounds < 1 || NumberOfPlayers < 1 || RoundLength == 0)
        {
            return false;
        }

        // Initialize lists of round properties
        RoundsModes = new List<GameMode>();
        RoundsDifficulties = new List<Level>();

        for (int i = 0; i < NumberOfRounds; i++)
        {
            RoundsModes.Add((GameMode)rSettings.list[0].list[3].list[i].n-1);
            RoundsDifficulties.Add((Level)rSettings.list[0].list[5].list[i].n);
        }

        StartExperimet();
        return true;
    }

    private void StartExperimet()
    {
        InitGameManager(RoundsModes[0], RoundsSkins, RoundsDifficulties[0]);
        if (GameObject.FindGameObjectsWithTag("Player").Length != 0)
        {
            ExperimentStarted = true;
            RoundTimer = RoundLength;
            CurrentRound = 1;
        }
    }

    private void StartNextRound()
    {

        if (NumberOfRounds > 1 && CurrentRound < NumberOfRounds)
        {
            DataTransformer.sendTracker(Time.realtimeSinceStartup, Event.newRound, -1, 0, 0, 0, 0, (int)GetMode());
            SetMode(RoundsModes[CurrentRound], RoundsSkins, RoundsDifficulties[CurrentRound]);
            if (GameObject.FindGameObjectsWithTag("Player").Length != 0)
            {
                RoundTimer = RoundLength;
                CurrentRound++;
            }
            
        }

    }

    void InitGameManager(GameMode mode, Skin skin, Level difficulty)
    {
        // First Round properties
        Mode = mode;
        SkinType = skin;
        Difficulty = difficulty;
        DDAIndex = -1;

        // Initialize lists of sprites
        ColorSprites = new List<Sprite>();
        ShapeSprites = new List<Sprite>();
        TypeSprites = new List<Sprite>();

        ItemSinkSprites = new List<Sprite>();
        EnemySprites = new List<Sprite>();
        ItemSprites = new List<Sprite>();
        ItemSinkColliderSize = new List<Vector2>();
        PowerupSprites = new List<Sprite>();

        // Initialize object factories lists
        EnemyFactories = new List<ObjectFactory>();
        ItemFactories = new List<ObjectFactory>();
        PowerupFactories = new List<ObjectFactory>();

        // Load ALL possible sprites
        // Player sprites
        ColorSprites.Add(Resources.Load<Sprite>("Sprites/Player1"));
        ColorSprites.Add(Resources.Load<Sprite>("Sprites/Player2"));
        ColorSprites.Add(Resources.Load<Sprite>("Sprites/Player3"));

        // TODO: Add player shape sprites

        // TODO: Add player type sprites

        // Enemy sprites
        EnemySprites.Add(Resources.Load<Sprite>("Sprites/Parrot1"));
        EnemySprites.Add(Resources.Load<Sprite>("Sprites/Parrot2"));
        EnemySprites.Add(Resources.Load<Sprite>("Sprites/Parrot3"));
        EnemySprites.Add(Resources.Load<Sprite>("Sprites/ParrotGeneral"));

        // Item sprites
        ItemSprites.Add(Resources.Load<Sprite>("Sprites/Treasure1"));
        ItemSprites.Add(Resources.Load<Sprite>("Sprites/Treasure2"));
        ItemSprites.Add(Resources.Load<Sprite>("Sprites/Treasure3"));
        ItemSprites.Add(Resources.Load<Sprite>("Sprites/Food"));

        //Powerup sprites
        PowerupSprites.Add(Resources.Load<Sprite>("Sprites/Kraken"));

        // Item sink sprites
        ItemSinkSprites.Add(Resources.Load<Sprite>("Sprites/Gold"));
        ItemSinkColliderSize.Add(new Vector2(4.7f, 1.5f));

        ItemSinkSprites.Add(Resources.Load<Sprite>("Sprites/Kraken"));
        ItemSinkColliderSize.Add(new Vector2(2f, 3f));

        // Initialize lists of buttons
        RightMovement = new List<KeyCode>();
        LeftMovement = new List<KeyCode>();
        JumpMovement = new List<KeyCode>();

        // Load prefered buttons in the order of players
        // Player 1
        RightMovement.Add(KeyCode.RightArrow);
        // Player 2
        RightMovement.Add(KeyCode.D);
        // Player 3
        RightMovement.Add(KeyCode.L);

        // Player 1
        LeftMovement.Add(KeyCode.LeftArrow);
        // Player 2
        LeftMovement.Add(KeyCode.A);
        // Player 3
        LeftMovement.Add(KeyCode.K);

        // Player 1
        JumpMovement.Add(KeyCode.Space);
        // Player 2
        JumpMovement.Add(KeyCode.W);
        // Player 3
        JumpMovement.Add(KeyCode.O);

        // TODO: Add keys dynamically according to input from user

        // Player factory settings
        SpawnLocation = new Vector2(0f, -3f);
        InitialHealth = 3;
        MyItemsAmount = 1;
        OthersItemsAmount = 1;
        IsSpriteDirectionRight = false;
        HeldItemHeight = 0.5f;

        InitMode();
    }

    //Getters
    public GameMode GetMode() { return Mode; }
    public int GetNumberOfPlayers() { return NumberOfPlayers; }
    public Skin GetSkinType() { return SkinType; }
    public Level GetDifficulty() { return Difficulty; }
    public Vector2 GetItemSinkCollider() { return (ItemSinkColliderSize[(int)Mode]); }
    public Sprite GetItemSinkSprite() { return (ItemSinkSprites[(int)Mode]); }
    public List<Sprite> GetPlayerSprites()
    {
        switch (SkinType)
        {
            case Skin.Color:
                return (new List<Sprite>(ColorSprites));
            case Skin.Shape:
                return (new List<Sprite>(ShapeSprites));
            case Skin.Type:
                return (new List<Sprite>(TypeSprites));
            default:
                return (new List<Sprite>(ColorSprites));
        }

    }

    // Setters
    public void SetMode(GameMode mode) { Mode = mode; }
    public void SetSkin(Skin skin) { SkinType = skin; }
    public void SetDifficulty(Level difficulty) { Difficulty = difficulty; }
    public bool SetNumberOfPlayers(int numberOfPlayers)
    {
        if (numberOfPlayers > 0)
        {
            NumberOfPlayers = numberOfPlayers;
            return true;
        }
        return false;
    }

    public void SetMode( GameMode mode, Skin skin, Level difficulty)
    {
        Mode = mode;
        SkinType = skin;
        Difficulty = difficulty;
        InitMode();
    }

    void InitMode()
    {
        IsGameLost = false;
        OthersItemsAmount = 1;
        if (DestroyFactoryMadeObjects() && DestroyFactories() && DestroyUI())
        {
            //  Initialize player factory
            PlayerFactory = gameObject.AddComponent(typeof(PlayerFactory)) as PlayerFactory;
            if (Mode == GameMode.Competitive)
            {
                OthersItemsAmount = 0;
            }
            PlayerFactory.PlayerFactoryInit(SpawnLocation, InitialHealth, MyItemsAmount, OthersItemsAmount,
                                            IsSpriteDirectionRight, HeldItemHeight, NumberOfPlayers,
                                            GetPlayerSprites(), RightMovement, LeftMovement, JumpMovement);

            // Initialize Enemy factories            
            GameObject enemyObj = Resources.Load<GameObject>("Prefabs/Enemy");


            for (int i = 0; i < NumberOfPlayers; i++)
            {
                EnemyFactories.Add(gameObject.AddComponent(typeof(EnemyFactory)) as EnemyFactory);

                if (Mode == GameMode.Competitive)
                {
                    EnemyFactories[i].FactoryInit(-1, (int)Difficulty, enemyObj, EnemySprites[EnemySprites.Count - 1]);
                }
                else
                {
                    EnemyFactories[i].FactoryInit(i + 1, (int)Difficulty, enemyObj, EnemySprites[i]);
                }
             }
            

            // Initialize sink
            GameObject sink = GameObject.Find("ItemSink");
            if (sink.GetComponent<ItemSink>().SinkInit(NumberOfPlayers))
            {
                sink.GetComponent<BoxCollider2D>().size = GetItemSinkCollider();
                sink.GetComponent<SpriteRenderer>().sprite = GetItemSinkSprite();
            }

            // Initialize Items         
            if (Mode == GameMode.Competitive)
            {
                GameObject itemObj = Resources.Load<GameObject>("Prefabs/Food");
                ItemFactories.Add(gameObject.AddComponent(typeof(ItemFactory)) as ItemFactory);
                ItemFactories[0].FactoryInit(-1, (int)Difficulty, itemObj, ItemSprites[ItemSprites.Count-1]);
            }
            else
            {
                for (int i = 0; i < NumberOfPlayers; i++)
                {
                    GameObject itemObj = Resources.Load<GameObject>("Prefabs/Treasure");
                    ItemFactories.Add(gameObject.AddComponent(typeof(ItemFactory)) as ItemFactory);
                    ItemFactories[i].FactoryInit(i + 1, (int)Difficulty, itemObj, ItemSprites[i]);
                }
            }

            //Initilazie Powerups
            if (Mode == GameMode.Competitive)
            {
                GameObject itemObj = Resources.Load<GameObject>("Prefabs/Powerup");
                PowerupFactories.Add(gameObject.AddComponent(typeof(PowerupFactory)) as PowerupFactory);
                PowerupFactories[0].FactoryInit(-1, (int)Difficulty, itemObj, PowerupSprites[0]);
            }
            else
            {
                for (int i = 0; i < NumberOfPlayers; i++)
                {
                    GameObject itemObj = Resources.Load<GameObject>("Prefabs/Powerup");
                    PowerupFactories.Add(gameObject.AddComponent(typeof(PowerupFactory)) as PowerupFactory);
                    PowerupFactories[i].FactoryInit(i + 1, (int)Difficulty, itemObj, PowerupSprites[0]);
                }
            }

            // Initialize UI
            GameObject canvas = GameObject.Find("Canvas");
            canvas.GetComponent<UI>().UIInit(InitialHealth, Mode, /*DEBUG*/Difficulty, /*DEBUG*/EnemyFactories, /*DEBUG*/ItemFactories, GetPlayerSprites(), NumberOfPlayers);

        }
    }

    void InitItemSink()
    {
        GameObject sink = GameObject.Find("ItemSink");
    }

    private bool DestroyFactoryMadeObjects()
    {
        int itemLayer = LayerMask.NameToLayer("Item");
        int enemyLayer = LayerMask.NameToLayer("Enemy");
        int playerLayer = LayerMask.NameToLayer("Player");

        if (itemLayer == -1 || enemyLayer == -1 || playerLayer == -1)
        {
            return false;
        }

        GameObject[] gameObjects = FindObjectsOfType<GameObject>();
        for (int i = 0; i < gameObjects.Length; i++)
        {
            if (gameObjects[i].layer == itemLayer || gameObjects[i].layer == enemyLayer || gameObjects[i].layer == playerLayer)
            {
                Destroy(gameObjects[i]);
            }
        }

        return true;
    }

    private bool DestroyFactories()
    {
        Destroy(PlayerFactory);
        DestroyObjectFactory(EnemyFactories);
        DestroyObjectFactory(ItemFactories);
        DestroyObjectFactory(PowerupFactories);
        return true;
    }

    private bool DestroyUI()
    {
       GameObject canvas = GameObject.Find("Canvas");
       foreach (Transform child in canvas.transform)
        {
            GameObject.Destroy(child.gameObject);
        }
        return true;
    }

    private void DestroyObjectFactory(List<ObjectFactory> objFactories)
    {
        foreach (ObjectFactory factory in objFactories)
        {
            Destroy(factory);
        }
        objFactories.Clear();
    }

    private bool GameLost()
    {
        GameObject[] players = GameObject.FindGameObjectsWithTag("Player");

        if (players.Length > 0 && !IsGameLost)
        {
            for (int i = 0; i < players.Length; i++)
            {
                Player player = players[i].GetComponent<Player>();
                if (player.GetHealth() > 0)
                {
                    EnemyFactories[player.GetID()-1].FreezeSpawn(false);
                    ItemFactories[player.GetID() - 1].FreezeSpawn(false);
                    PowerupFactories[player.GetID() - 1].FreezeSpawn(false);
                    return false;
                }
                else
                {
                    EnemyFactories[player.GetID()-1].FreezeSpawn(true);
                    ItemFactories[player.GetID() - 1].FreezeSpawn(true);
                    PowerupFactories[player.GetID() - 1].FreezeSpawn(true);
                    Debug.Log("froze spawn for player " + i);
                }
            }

            IsGameLost = true;
            DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.lose, 0, 0, 0, 0, 0, (int)Mode);
            return true;
        }

        return false;
    }

    public void NotificationDDAUpdate(JSONObject calcs)
    {
        int calcsIndex = (int)calcs.list[0].n;
        int LevelSpawnHeightAndTimer;
        int LevelPrecision;
        int LevelSpeedAndSpawnRate;

        if (Mode == GameMode.Cooperative && calcs.keys[0] == "index" && DDAIndex < calcsIndex)
        {
            
            for (int i = 0; i < NumberOfPlayers; i++)
            {
                if (EnemyFactories[i].GetID() == ItemFactories[i].GetID() && ItemFactories[i].GetID() == i+1)
                {
                    LevelSpawnHeightAndTimer = (int)calcs.list[1].list[i].n;
                    LevelPrecision = (int)calcs.list[2].list[i].n;
                    LevelSpeedAndSpawnRate = (int)calcs.list[3].list[i].n;

                     
                    EnemyFactories[i].SetDDAChanges(LevelSpawnHeightAndTimer, LevelPrecision, LevelSpeedAndSpawnRate);
                    ItemFactories[i].SetDDAChanges(LevelSpawnHeightAndTimer, LevelPrecision, LevelSpeedAndSpawnRate);
                }
            
            }
        }

        if (Mode == GameMode.Competitive && calcs.keys[0] == "index" && DDAIndex < calcsIndex)
        {

            if (DDAIndex != -2)
            { 
                int sumSpawnHeightAndTimer = 0;
                int sumPrecision = 0;
                int sumSpeedAndSpawnRate = 0;

                DDAIndex = calcsIndex;
           
                for (int i = 0; i < NumberOfPlayers; i++)
                {
                    if (EnemyFactories[i].GetID() == ItemFactories[i].GetID() && ItemFactories[i].GetID() == i + 1)
                    {
                        sumSpawnHeightAndTimer += (int)calcs.list[1].list[i].n;
                        sumPrecision += (int)calcs.list[2].list[i].n;
                        sumSpeedAndSpawnRate += (int)calcs.list[3].list[i].n;
                    }

                }

                if (sumSpawnHeightAndTimer > 0 && sumPrecision > 0 && sumSpeedAndSpawnRate > 0)
                {
                    // Calculate avg
                    LevelSpawnHeightAndTimer = (int)Math.Ceiling((float)sumSpawnHeightAndTimer / (float)NumberOfPlayers);
                    LevelPrecision = (int)Math.Ceiling((float)sumPrecision / (float)NumberOfPlayers);
                    LevelSpeedAndSpawnRate = (int)Math.Ceiling((float)sumSpeedAndSpawnRate / (float)NumberOfPlayers);

                    for (int i = 0; i < NumberOfPlayers; i++)
                    {
                       EnemyFactories[i].SetDDAChanges(LevelSpawnHeightAndTimer, LevelPrecision, LevelSpeedAndSpawnRate);
                       ItemFactories[i].SetDDAChanges(LevelSpawnHeightAndTimer, LevelPrecision, LevelSpeedAndSpawnRate);
                    }

                }
                DDAIndex = -2;

            }


        }

    }

    public bool TrackObjLocation()
    {
        const int itemLayer = 10;
        const int enemyLayer = 11; 
        const int playerLayer = 9;
        float posX;
        float posY;
        GameObject[] gameObjects = FindObjectsOfType<GameObject>();
        for (int i = 0; i < gameObjects.Length; i++)
        {
            switch (gameObjects[i].layer)
            {
                case itemLayer:
                    Treasure item = gameObjects[i].GetComponent<Treasure>();
                    posX = item.transform.position.x;
                    posY = item.transform.position.y;
                    if (item.GetIsPickedUp())
                    {
                        DataTransformer.sendTracker(Time.realtimeSinceStartup, Event.takenItemLoc, item.GetCarrierID(), posX, posY, item.GetID(), 0, (int)GetMode());
                    }
                    else
                    {
                        DataTransformer.sendTracker(Time.realtimeSinceStartup, Event.itemLoc, -1, posX, posY, item.GetID(), 0, (int)GetMode());
                    }
                    break;
                case enemyLayer:
                    Enemy enemy = gameObjects[i].GetComponent<Enemy>();
                    posX = enemy.transform.position.x;
                    posY = enemy.transform.position.y;
                    DataTransformer.sendTracker(Time.realtimeSinceStartup, Event.enemyLoc, -1, posX, posY, 0, enemy.GetID(), (int)GetMode());
                    break;
                case playerLayer:
                    Player player = gameObjects[i].GetComponent<Player>();
                    DataTransformer.sendTracker(Time.realtimeSinceStartup, Event.playerLoc, player, 0, 0, (int)GetMode());
                    break;
                default:
                    break;
            }
        }

        return true;
    }

    //DEBUG CHANGE MODE
    public void DEBUGCHANGEMODE()
    {
        SetMode(GameMode.Competitive, Skin.Color, Level.Static3);
    }

    public void NotificationPlayerDied(int playerID)
    {
        //EnemyFactories[playerID].FreezeSpawn(true);
        GameLost();
    }

    public void NotificationPlayerRevived(int playerID)
    {
        //EnemyFactories[playerID].FreezeSpawn(false);
    }

    // Start is called before the first frame update
    void Start()
    {
        InvokeRepeating("TrackObjLocation", 5.0f, 5.0f);
        //DEBUG
        Level lvl;
        GameMode gm;
        if (StaticMode)
        {
            lvl = Level.Static3;
        }
        else
        {
            lvl = Level.Adaptive;
        }

        if (CoopMode)
        {
            gm = GameMode.Cooperative;
        }
        else
        {
            gm = GameMode.Competitive;
        }

        //DEBUG//
        NumberOfPlayers = 3;
        InitGameManager(gm, Skin.Color, lvl);
        //InitGameManager(3, GameMode.Cooperative, Skin.Color, Level.Adaptive);
        //SetMode(3, GameMode.Competitive, Skin.Color, Level.Adaptive);
    }

    // Update is called once per frame
    void Update()
    {
        if (ExperimentStarted)
        {
            if (RoundTimer != 0)
            {
                RoundTimer -= Time.deltaTime;
            }
            else
            {
                StartNextRound();
            }
        }
       
    }
}
