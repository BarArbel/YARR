using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;
using Project.Networking;
using Event = Project.Networking.Event;
using UnityEngine.SceneManagement;
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

    // Difficulties carried from round to round
    private List<int> PlayerDifficulties; 

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

    // Continued game settings
    private bool IsNewGame;
    private float ContinuedTimestamp;
    private List<float4> PlayerSettings;
    private List<float3> EnemySettings;
    private List<float3> ItemSettings;
    private List<int2> HItemSettings;

    // Sprites
    private List<Sprite> ItemSprites;
    private List<Sprite> ItemSinkSprites;
    private List<Sprite> ColorSprites;
    private List<Sprite> ShapeSprites;
    private List<Sprite> TypeSprites;
    private List<Sprite> EnemySprites;
    private List<Sprite> PowerupSprites;

    // Prefabs
    private List<GameObject> EnemyPrefabs;
    private List<GameObject> PlayerPrefabs;

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
        IsNewGame = true;
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

    public bool ContinueExperiment(JSONObject rSettings)
    {
        ExperimentStarted = false;
        IsNewGame = false;
        // Test json structure
        if (rSettings.list[0].keys[0] != "numberOfPlayers"  ||
            rSettings.list[0].keys[1] != "roundLength"      ||
            rSettings.list[0].keys[2] != "blindness"        ||
            rSettings.list[0].keys[3] != "modes"            ||
            rSettings.list[0].keys[4] != "skin"             ||
            rSettings.list[0].keys[5] != "difficulties"     ||
            rSettings.list[0].keys[6] != "timestamp"        ||
            rSettings.list[0].keys[7] != "pLoc"             ||
            rSettings.list[0].keys[8] != "eLoc"             ||
            rSettings.list[0].keys[9] != "iLoc"             ||
            rSettings.list[0].keys[10] != "hiLoc"           ||
            rSettings.list[0].list[3].Count != rSettings.list[0].list[5].Count)
        {
            return false;
        }

        Debug.Log("Hello ContinueExperiment");
        Debug.Log(rSettings);

        // Experiment properties
        RoundTimer = 0;
        NumberOfRounds = rSettings.list[0].list[3].Count;
        NumberOfPlayers = (int)rSettings.list[0].list[0].n;
        RoundLength = (float)rSettings.list[0].list[1].n;
        BlindnessType = (ColorBlindness)rSettings.list[0].list[2].n - 1;
        RoundsSkins = (Skin)rSettings.list[0].list[4].n - 1;
        ContinuedTimestamp = (float)rSettings.list[0].list[6].n;

        // Test json values
        if (NumberOfRounds < 1 || NumberOfPlayers < 1 || RoundLength == 0)
        {
            return false;
        }

        // Initialize lists of round properties
        RoundsModes = new List<GameMode>();
        RoundsDifficulties = new List<Level>();

        // Initialize list of game object settings
        PlayerSettings = new List<float4>();
        EnemySettings = new List<float3>();
        ItemSettings = new List<float3>();
        HItemSettings = new List<int2>();

        for (int i = 0; i < NumberOfRounds; i++)
        {
            RoundsModes.Add((GameMode)rSettings.list[0].list[3].list[i].n - 1);
            RoundsDifficulties.Add((Level)rSettings.list[0].list[5].list[i].n);
        }

        for (int i=0; i<NumberOfPlayers; i++)
        {
            JSONObject pData = rSettings.list[0].list[7];
            PlayerSettings.Add(new float4(pData.list[0].n, pData.list[1].n, pData.list[2].n, pData.list[3].n));
        }

        for (int i = 0; i < rSettings.list[0].list[8].Count; i++)
        {
            JSONObject eData = rSettings.list[0].list[8];
            EnemySettings.Add(new float3(eData.list[0].n, eData.list[1].n, eData.list[2].n));
        }

        for (int i = 0; i < rSettings.list[0].list[9].Count; i++)
        {
            JSONObject iData = rSettings.list[0].list[9];
            ItemSettings.Add(new float3(iData.list[0].n, iData.list[1].n, iData.list[2].n));
        }

        for (int i = 0; i < rSettings.list[0].list[10].Count; i++)
        {
            JSONObject hiData = rSettings.list[0].list[10];
            HItemSettings.Add(new int2((int)hiData.list[0].n, (int)hiData.list[1].n));
        }

        StartExperimet();
        return true;
    }

    private void StartExperimet()
    {
            InitGameManager(RoundsModes[0], RoundsSkins, RoundsDifficulties[0]);
            InitMode();
            ExperimentStarted = true;
            RoundTimer = RoundLength;
            CurrentRound = 1;
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
        if (CurrentRound == NumberOfRounds && RoundTimer <= 0)
        {
            DataTransformer.sendTracker(Time.realtimeSinceStartup, Event.gameEnded, -1, 0, 0, 0, 0, (int)GetMode());
            DataTransformer.SetDisconnect();
            SceneManager.LoadScene("FinishMenu");
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

        // Initialize lists of Prefabs
        EnemyPrefabs = new List<GameObject>();
        PlayerPrefabs = new List<GameObject>();

        // Initialize object factories lists
        EnemyFactories = new List<ObjectFactory>();
        ItemFactories = new List<ObjectFactory>();
        PowerupFactories = new List<ObjectFactory>();

        // Initialize player difficulties
        PlayerDifficulties = new List<int>();
        for (int i=0; i<NumberOfPlayers; i++)
        {
            PlayerDifficulties.Add((int)difficulty);
        }

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

        // Enemy Prefabs
        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotBlue"));
        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotGreen"));
        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotRed"));
        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotYellow"));
        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotPink"));
        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));

        // Player Prefabs
        switch (RoundsSkins)
        {
            case Skin.Color:
                switch (BlindnessType)
                {
                    case ColorBlindness.Colorful:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/2 - CharacterBLUE"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/1 - CharacterGREEN"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/3 - CharacterRED"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotBlue"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotGreen"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotRed"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    case ColorBlindness.Protanopia:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/2 - CharacterBLUE"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/7 - CharacterYellow"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/3 - CharacterRED"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotBlue"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotYellow"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotRed"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    case ColorBlindness.Tritanopia:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/10 - CharacterPink"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/1 - CharacterGREEN"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/3 - CharacterRED"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotPink"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotGreen"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotRed"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    default:
                        break;
                }
                break;
            case Skin.Shape:
                switch (BlindnessType)
                {
                    case ColorBlindness.Colorful:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/13 - CharacterRED"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/14 - FlagSplitRED"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/15 - FlagTriangleRED"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotRed"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/REDParrotFlagSplit"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/REDParrotFlagTriangle"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    case ColorBlindness.Protanopia:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/16 - CharacterYellow"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/17 - FlagSplitYellow"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/18 - FlagTriangleYellow"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotYellow"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/YellowParrotFlagSplit"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/YellowParrotFlagTriangle"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    case ColorBlindness.Tritanopia:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/19 - CharacterPink"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/20 - FlagSplitPink"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/21 - FlagTrianglePink"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotPink"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/PinkParrotFlagSplit"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/PinkParrotFlagTriangle"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    default:
                        break;
                }
                break;
            case Skin.Type:
                switch (BlindnessType)
                {
                    case ColorBlindness.Colorful:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/4 - CharacterRED"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/5 - WheelsRED"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/6 - SpringRED"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotRed"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/RedParrotWheels"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/RedParrotsSpring"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    case ColorBlindness.Protanopia:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/7 - CharacterYellow"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/8 - WheelsYellow"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/9 - SpringYellow"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotYellow"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/YellowParrotWheels"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/YellowParrotsSpring"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    case ColorBlindness.Tritanopia:
                        // Players
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/10 - CharacterPink"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/11 - WheelsPink"));
                        PlayerPrefabs.Add(Resources.Load<GameObject>("Prefabs/Player/12 - SpringPink"));
                        // Enemies
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotPink"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/PinkParrotWheels"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrots Shape/PinkParrotsSpring"));
                        EnemyPrefabs.Add(Resources.Load<GameObject>("Prefabs/Parrot/ParrotColorful"));
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

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
            bool isNewGame = (!IsNewGame && CurrentRound == 1) ? false : true;

            //  Initialize player factory
            PlayerFactory = gameObject.AddComponent(typeof(PlayerFactory)) as PlayerFactory;
            if (Mode == GameMode.Competitive)
            {
                OthersItemsAmount = 0;
            }
            PlayerFactory.PlayerFactoryInit(SpawnLocation, InitialHealth, MyItemsAmount, OthersItemsAmount,
                                            IsSpriteDirectionRight, HeldItemHeight, NumberOfPlayers,
                                            PlayerPrefabs, RightMovement, LeftMovement, JumpMovement, isNewGame);

            // Initialize Enemy factories            
            GameObject enemyObj; //= Resources.Load<GameObject>("Prefabs/Enemy");
            int lvlsum = 0;
            int lvlMean;
            for (int i=0; i< NumberOfPlayers; i++)
            {
                lvlsum += PlayerDifficulties[i];
            }
            lvlMean = (int)Math.Floor((double)(lvlsum / NumberOfPlayers));
            lvlMean = lvlMean < 2 ? 2 : lvlMean;
            for (int i = 0; i < NumberOfPlayers; i++)
            {
                EnemyFactories.Add(gameObject.AddComponent(typeof(EnemyFactory)) as EnemyFactory);

                // Adaptive
                if (Difficulty == Level.Adaptive)
                {
                    if (Mode == GameMode.Competitive)
                    {
                        /*if (CurrentRound == 1)
                        {
                            PlayerDifficulties[i] = 2;
                        }
                        else
                        {
                            PlayerDifficulties[i] = lvlMean;
                        }*/
                        EnemyFactories[i].FactoryInit(-1, lvlMean, EnemyPrefabs[EnemyPrefabs.Count - 1], EnemySprites[EnemySprites.Count - 1], isNewGame);
                    }
                    if (Mode == GameMode.Cooperative)
                    {
                        enemyObj = EnemyPrefabs[i];
                        Debug.Log(enemyObj + " " + i);
                        EnemyFactories[i].FactoryInit(i + 1, PlayerDifficulties[i], enemyObj, EnemySprites[i], isNewGame);
                    }
                }
                // Static
                else
                {
                    if (Mode == GameMode.Competitive)
                    {
                        enemyObj = EnemyPrefabs[i];
                        EnemyFactories[i].FactoryInit(-1, (int)Difficulty, enemyObj, EnemySprites[EnemySprites.Count - 1], isNewGame);
                    }
                    if (Mode == GameMode.Cooperative)
                    {
                        enemyObj = EnemyPrefabs[i];
                        EnemyFactories[i].FactoryInit(i + 1, (int)Difficulty, enemyObj, EnemySprites[i], isNewGame);
                    }
                }
            }
            

            // Initialize Items   
            for (int i = 0; i < NumberOfPlayers; i++)
            {
                // Adaptive
                if (Difficulty == Level.Adaptive)
                {
                        if (Mode == GameMode.Competitive)
                        {
                        GameObject itemObj = Resources.Load<GameObject>("Prefabs/Food");
                            ItemFactories.Add(gameObject.AddComponent(typeof(ItemFactory)) as ItemFactory);
                            ItemFactories[i].FactoryInit(-1, lvlMean, itemObj, ItemSprites[ItemSprites.Count - 1], isNewGame);
                        }
                        // Cooperative
                        else
                        {
                            GameObject itemObj = Resources.Load<GameObject>("Prefabs/Treasure");
                            ItemFactories.Add(gameObject.AddComponent(typeof(ItemFactory)) as ItemFactory);
                            ItemFactories[i].FactoryInit(i + 1, PlayerDifficulties[i], itemObj, ItemSprites[i], isNewGame);
                        }
                        
                }
                    // Static
                    else
                    {
                        if (Mode == GameMode.Competitive)
                        {
                            GameObject itemObj = Resources.Load<GameObject>("Prefabs/Food");
                            ItemFactories.Add(gameObject.AddComponent(typeof(ItemFactory)) as ItemFactory);
                            ItemFactories[i].FactoryInit(-1, (int)Difficulty, itemObj, ItemSprites[ItemSprites.Count - 1], isNewGame);
                        }
                        // Cooperative
                        else
                        {
                            GameObject itemObj = Resources.Load<GameObject>("Prefabs/Treasure");
                            ItemFactories.Add(gameObject.AddComponent(typeof(ItemFactory)) as ItemFactory);
                            ItemFactories[i].FactoryInit(i + 1, (int)Difficulty, itemObj, ItemSprites[i], isNewGame);
                        }
                    }
            }
            

            //Initilazie Powerups
            if (Mode == GameMode.Competitive)
            {
                GameObject itemObj = Resources.Load<GameObject>("Prefabs/Powerup");
                PowerupFactories.Add(gameObject.AddComponent(typeof(PowerupFactory)) as PowerupFactory);
                PowerupFactories[0].FactoryInit(-1, (int)Difficulty, itemObj, PowerupSprites[0], isNewGame);
            }
            else
            {
                for (int i = 0; i < NumberOfPlayers; i++)
                {
                    GameObject itemObj = Resources.Load<GameObject>("Prefabs/Powerup");
                    PowerupFactories.Add(gameObject.AddComponent(typeof(PowerupFactory)) as PowerupFactory);
                    PowerupFactories[i].FactoryInit(i + 1, (int)Difficulty, itemObj, PowerupSprites[0], isNewGame);
                }
            }

            // Initialize sink
            GameObject sink = GameObject.Find("ItemSink");
            if (sink.GetComponent<ItemSink>().SinkInit(NumberOfPlayers))
            {
                sink.GetComponent<BoxCollider2D>().size = GetItemSinkCollider();
                sink.GetComponent<SpriteRenderer>().sprite = GetItemSinkSprite();
            }

            // Initialize UI
            GameObject canvas = GameObject.Find("Canvas");
            canvas.GetComponent<UI>().UIInit(InitialHealth, Mode, /*DEBUG*/Difficulty, /*DEBUG*/EnemyFactories, /*DEBUG*/ItemFactories, GetPlayerSprites(), NumberOfPlayers);

            if (!isNewGame)
            {
                // Spawn players
                PlayerFactory.ContinuedGameSpawn(PlayerSettings);
                GameObject[] players = GameObject.FindGameObjectsWithTag("Player");

                // Spawn Items
                for (int i = 0; i < ItemSettings.Count; i++)
                {
                    if (Mode == GameMode.Cooperative)
                    {
                        int itemID = (int)ItemSettings[i].x;
                        ItemFactories[itemID - 1].ContinuedGameSpawn(ItemSettings[i]);
                    }
                    else
                    {
                        ItemFactories[0].ContinuedGameSpawn(ItemSettings[i]);
                    }
                }

                // Spawn Enemies
                for (int i = 0; i < EnemySettings.Count; i++)
                {
                    if (Mode == GameMode.Cooperative)
                    {
                        int enemyID = (int)EnemySettings[i].x;
                        EnemyFactories[enemyID - 1].ContinuedGameSpawn(EnemySettings[i]);
                    }
                    else
                    {
                        EnemyFactories[0].ContinuedGameSpawn(EnemySettings[i]);
                    }
                }

                // spawn taken items
                for (int i = 0; i < HItemSettings.Count; i++)
                {
                    GameObject heldItem;

                    if (Mode == GameMode.Cooperative)
                    {
                        int itemID = HItemSettings[i].x;
                        heldItem = ItemFactories[itemID - 1].ContinuedGameSpawn(HItemSettings[i]);
                    }
                    else
                    {
                        heldItem = ItemFactories[0].ContinuedGameSpawn(HItemSettings[i]);
                    }

                    for (int j=0; j< players.Length; j++)
                    {
                        Player playerObj = players[i].GetComponent<Player>();
                        if (playerObj.GetID() == HItemSettings[i].y)
                        {
                            playerObj.ContinuedGameTreasure(heldItem);
                        }
                    }
                }
                    
            }
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
                    //EnemyFactories[player.GetID()-1].FreezeSpawn(false);
                    //ItemFactories[player.GetID() - 1].FreezeSpawn(false);
                    //PowerupFactories[player.GetID() - 1].FreezeSpawn(false);
                    return false;
                }
                else
                {
                    //EnemyFactories[player.GetID()-1].FreezeSpawn(true);
                    //ItemFactories[player.GetID() - 1].FreezeSpawn(true);
                    //PowerupFactories[player.GetID() - 1].FreezeSpawn(true);
                    //Debug.Log("froze spawn for player " + i);
                }
            }

            IsGameLost = true;
            RoundTimer = 0;
            DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.lose, 0, 0, 0, 0, 0, (int)Mode);
            return true;
        }

        return false;
    }

    public void NotificationDDAUpdate(JSONObject calcs)
    {
        Debug.Log(calcs);
        int calcsIndex = (int)calcs.list[0].n;
        int LevelSpawnHeightAndTimer;
        int LevelPrecision;
        int LevelSpeedAndSpawnRate;

        if (Mode == GameMode.Cooperative && calcs.keys[0] == "index" && DDAIndex < calcsIndex)
        {
            
            for (int i = 1; i <= NumberOfPlayers; i++)
            {
                if (EnemyFactories[i].GetID() == ItemFactories[i].GetID() && ItemFactories[i].GetID() == i+1)
                {
                    LevelSpawnHeightAndTimer = (int)calcs.list[1].list[i].n;
                    LevelPrecision =           (int)calcs.list[2].list[i].n;
                    LevelSpeedAndSpawnRate =   (int)calcs.list[3].list[i].n;
                    // Save difficulty updated from DDA 
                   
                    if (!(PlayerDifficulties[i] == 1 && LevelPrecision == -1) && !(PlayerDifficulties[i] == 6 && LevelPrecision == 1))
                    {
                        PlayerDifficulties[i] += LevelPrecision;
                        EnemyFactories[i].SetDDAChanges(LevelSpawnHeightAndTimer, LevelPrecision, LevelSpeedAndSpawnRate);
                        ItemFactories[i].SetDDAChanges(LevelSpawnHeightAndTimer, LevelPrecision, LevelSpeedAndSpawnRate);
                    }
                }
            
            }
        }

        if (Mode == GameMode.Competitive && calcs.keys[0] == "index" && DDAIndex < calcsIndex)
        {
                DDAIndex = calcsIndex;
                for (int i = 0; i < NumberOfPlayers; i++)
                {
                        LevelSpawnHeightAndTimer =  (int)calcs.list[1].list[i].n;
                        LevelPrecision =            (int)calcs.list[2].list[i].n;
                        LevelSpeedAndSpawnRate =    (int)calcs.list[3].list[i].n;

                    // Save difficulty updated from DDA 
                    if (!(PlayerDifficulties[i] == 1 && LevelPrecision == -1) && !(PlayerDifficulties[i] == 6 && LevelPrecision == 1))
                    {
                        PlayerDifficulties[i] += LevelPrecision;
                        Debug.Log(LevelPrecision);
                        EnemyFactories[i].SetDDAChanges(LevelSpawnHeightAndTimer, LevelPrecision, LevelSpeedAndSpawnRate);
                        ItemFactories[i].SetDDAChanges(LevelSpawnHeightAndTimer, LevelPrecision, LevelSpeedAndSpawnRate);
                    }
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
                    DataTransformer.sendTracker(Time.realtimeSinceStartup, Event.playerLocHealth, player, player.GetHealth(), 0, (int)GetMode());
                    break;
                default:
                    break;
            }
        }

        return true;
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
        /*Level lvl;
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
        InitGameManager(gm, Skin.Color, lvl);*/
        //InitGameManager(3, GameMode.Cooperative, Skin.Color, Level.Adaptive);
        //SetMode(3, GameMode.Competitive, Skin.Color, Level.Adaptive);
    }

    // Update is called once per frame
    void Update()
    {
        if (ExperimentStarted)
        {
            if (RoundTimer > 0)
            {
                RoundTimer -= Time.deltaTime;
                //Debug.Log(RoundTimer);
            }
            else
            {
                StartNextRound();
            }
        }
       
    }
}
