using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Mathematics;

public class GameManager : MonoBehaviour
{
    public enum GameMode { Cooperative, Competitive };
    public enum Skin { Color, Shape, Type };
    public enum Level { Adaptive, Static1, Static2, Static3, Static4, Static5, Static6 };

    // Game settings
    private GameMode Mode;
    private int NumberOfPlayers;
    private Level Difficulty;

    private Skin SkinType;
    private List<Vector2> ItemSinkColliderSize;

    // Sprites
    private List<Sprite> ItemSprites;
    private List<Sprite> ItemSinkSprites;
    private List<Sprite> ColorSprites;
    private List<Sprite> ShapeSprites;
    private List<Sprite> TypeSprites;
    private List<Sprite> EnemySprites;

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

    void InitGameManager(int numberOfPlayers, GameMode mode, Skin skin, Level difficulty)
    {
        // First Round properties
        NumberOfPlayers = numberOfPlayers;
        Mode = mode;
        SkinType = skin;
        Difficulty = difficulty;

        // Initialize lists of sprites
        ColorSprites = new List<Sprite>();
        ShapeSprites = new List<Sprite>();
        TypeSprites = new List<Sprite>();

        ItemSinkSprites = new List<Sprite>();
        EnemySprites = new List<Sprite>();
        ItemSprites = new List<Sprite>();
        ItemSinkColliderSize = new List<Vector2>();

        // Initialize object factories lists
        EnemyFactories = new List<ObjectFactory>();
        ItemFactories = new List<ObjectFactory>();

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

        // Player 1
        LeftMovement.Add(KeyCode.LeftArrow);
        // Player 2
        LeftMovement.Add(KeyCode.A);

        // Player 1
        JumpMovement.Add(KeyCode.Space);
        // Player 2
        JumpMovement.Add(KeyCode.W);

        // TODO: Add keys dynamically according to input from user

        // Player factory settings
        SpawnLocation = new Vector2(0f, -3f);
        InitialHealth = 4;
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

    void InitMode()
    {
        OthersItemsAmount = 1;
        if (DestroyFactoryMadeObjects() && DestroyFactories())
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

        if (itemLayer == -1 || enemyLayer == -1)
        {
            return false;
        }

        GameObject[] gameObjects = GameObject.FindGameObjectsWithTag("Untagged");
        for (int i = 0; i < gameObjects.Length; i++)
        {
            if (gameObjects[i].layer == itemLayer || gameObjects[i].layer == enemyLayer)
            {
                Destroy(gameObjects[i]);
            }
        }

        gameObjects = GameObject.FindGameObjectsWithTag("Player");
        for (int i = 0; i < gameObjects.Length; i++)
        {
            Destroy(gameObjects[i]);
        }

        return true;
    }

    private bool DestroyFactories()
    {
        Destroy(PlayerFactory);
        DestroyObjectFactory(EnemyFactories);
        DestroyObjectFactory(ItemFactories);
        return true;
    }

    private void DestroyObjectFactory(List<ObjectFactory> objFactories)
    {
        foreach (ObjectFactory factory in objFactories)
        {
            objFactories.RemoveAt(objFactories.IndexOf(factory));
            Destroy(factory);
        }
    }
        

    // Start is called before the first frame update
    void Start()
    {
        InitGameManager(2, GameMode.Cooperative, Skin.Color, Level.Static6);
    }

    // Update is called once per frame
    void Update()
    {

    }
}
