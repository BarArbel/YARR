using System.Linq;
using System;
using System.Collections.Generic;
using UnityEngine;
using Project.Networking;
using Event = Project.Networking.Event;
using System.Collections;


public class Player : MonoBehaviour
{
    // Player properties
    private int ID;
    private int Health;
    private int MaxHealth;
    private float HeldItemHeight;
    private bool IsSpriteDirectionRight = false;
    private Item[] MyItemInventory;
    private Item[] OthersItemInventory;
    private List<Item> TotalItemInventory;
    private float FixBoatTime;
    private int immuneTimer;
    private int ClickCounter;
    private Transform InventoryPlaceHolder;

    //Animation
    private Animator animator;

    // Identify accidental fall
    private bool FallSamplesReady;
    private Dictionary<int, float> EnemiesDistance1st;
    private Dictionary<int, float> EnemiesDistance2nd;
    private Dictionary<int, float> ItemsDistance1st;
    private Dictionary<int, float> ItemsDistance2nd;

    // Game input
    public string MovementAxis;
    public string JumpButton;

    // Movement
    public Vector2 Speed; 
    public Vector2 Direction; 
    public bool IsJumping;     
    public LayerMask MapLayer;


    //Getters
    public int  GetID()                     { return ID; }
    public int  GetHealth()                 { return Health; }
    public bool GetIsSpriteDirectionRight() { return IsSpriteDirectionRight; }
    public int  GetGameMode()               { return OthersItemInventory.Length == 0 ? 1 : 0;  }
    public int  GetClickCounter ()          { return ClickCounter; }

    public Item[] GetMyItemInventory()
    {
        Item[] inventory = new Item[MyItemInventory.Length];
        MyItemInventory.CopyTo(inventory, 0);
        return inventory;
    }

    public Item[] GetOthersItemInventory()
    {
        Item[] inventory = new Item[OthersItemInventory.Length];
        OthersItemInventory.CopyTo(inventory, 0);
        return inventory;
    }

    public List<Item> GetTotalItemInventory()
    {
        List<Item> totalInventory = new List<Item>(TotalItemInventory);
        return totalInventory;
    }
    //Setters
    public void ResetClickCounter () { ClickCounter = 0; }
    public bool SetHealth( )
    {
        if (MaxHealth <= 0 )
        {
            return false;
        }

        animator.SetBool("Dead", false);
        Health = MaxHealth;
        this.GetComponent<Transform>().Rotate(0, 0, -180, Space.Self);
        return true;
    }

    public bool SetHealth(int health)
    {

        if (MaxHealth <= 0 || health > MaxHealth)
        {
            return false;
        }

        Health = health;

        return true;
    }

    public bool SetEnemyHit( Enemy enemy)
    {
        float spriteBrightness;
        Player player = gameObject.GetComponent<Player>();
        if (Health <= 0 || immuneTimer > 0)
        {
            return false;
        }
        Health-=enemy.GetDamage();
        spriteBrightness = (float)Health / (float)MaxHealth;
        DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.getDamaged, player, 0, enemy.GetID(), GetGameMode());

        if (Health == 0)
        {
            animator.SetBool("Dead",true);
            FindObjectOfType<GameManager>().NotificationPlayerDied(GetID());
            if (GetGameMode() == 0)
            {              
                DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.temporaryLose, player, 0, 0, GetGameMode());   
            }
            else
            {
                DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.individualLoss, player, 0, 0, GetGameMode());
            }
        }
        return true;
    }

    public void PlayerInit(
        string Movment, 
        string Jump, 
        int id, 
        int health, 
        int myItemsAmount,
        int othersItemsAmount,
        bool isSpriteDirectionRight, 
        float heldItemHeight)
    {
        ID = id;
        Health = health;
        MaxHealth = health;
        HeldItemHeight = heldItemHeight;
        IsSpriteDirectionRight = isSpriteDirectionRight;

        MovementAxis = Movment;
        JumpButton = Jump;

        // Initialize inventories
        MyItemInventory = new Item[myItemsAmount];
        OthersItemInventory = new Item[othersItemsAmount];
        TotalItemInventory = new List<Item>();
        InventoryPlaceHolder = this.gameObject.transform.Find("InventoryPlaceHolder");

        // Initialize accidental fall parameters
        FallSamplesReady = false;
        EnemiesDistance1st = new Dictionary<int, float>();
        EnemiesDistance2nd = new Dictionary<int, float>();
        ItemsDistance1st = new Dictionary<int, float>();
        ItemsDistance2nd = new Dictionary<int, float>();

        // Initialize Animator
        animator = GetComponent<Animator>();
    }

    // Food ID = -1
    public bool HoldItem( Item item )
    {
        int itemID = item.GetID();
        Item[] inventory;
        bool freeSlot = false;

        if (itemID != ID && itemID != -1)
        {
            inventory = OthersItemInventory;
        }
        else
        {
            inventory = MyItemInventory;
        }

        if (inventory.Length <= 0)
        {
            return freeSlot;
        }

        for (int i = 0; i < inventory.Length; i++)
        {
            if (inventory[i] == null)
            {
                freeSlot = true;
                inventory[i] = item;
                TotalItemInventory.Add(item);
                break;
            }
        }

        return freeSlot;
    }

    public bool RemoveItem( Item item )
    {

        Item[] inventory;
        bool shouldDestroyItem = false;
        int itemID = item.GetID();
        if (itemID != ID && itemID != -1)
        {
            inventory = OthersItemInventory;
        }
        else
        {
            inventory = MyItemInventory;
            shouldDestroyItem = true;
        }

        if (inventory.Length <= 0)
        {
            return false;
        }

        for (int i = 0; i < inventory.Length; i++)
        {
            if (inventory[i] != null && inventory[i].GetID() == itemID )
            {
                inventory[i] = null;
                TotalItemInventory.RemoveAt(TotalItemInventory.IndexOf(item));
                if (shouldDestroyItem)
                {
                    item.FallToSink();
                }
                return true;
            }
        }

        return false;
    }

    private bool IsInventoryEmpty ( Item[] inventory )
    {
        if (inventory.Length <= 0)
        {
            return false;
        }

        for (int i = 0; i < inventory.Length; i++)
        {
            if (inventory[i] != null)
            {
                return false;
            }
        }

        return true;
    }

    private bool IsInventoryFull(Item[] inventory)
    {
        if (inventory.Length == 0)
        {
            return true;
        }

        for (int i = 0; i < inventory.Length; i++)
        {
            if (inventory[i] == null)
            {
                return false;
            }
        }

        return true;
    }

    private void TakeTreasure(GameObject gameObject)
    {
        Treasure treasure = gameObject.GetComponent<Treasure>();        
        if(HoldItem(treasure))
        {           
            treasure.SetPickedUp(this.gameObject);
        }
    }

    public void ContinuedGameTreasure(GameObject gameObject)
    {
        TakeTreasure(gameObject);
    }

    private void OrderCarriedItems()
    {
        float height = HeldItemHeight;
        int index = 0;
        foreach (Item item in TotalItemInventory)
        {
            item.transform.position = new Vector3(InventoryPlaceHolder.position.x, InventoryPlaceHolder.position.y + (height * index), 0);
            index++;
        }
    }
    

    private void OnTriggerEnter2D(Collider2D collider)
    {
        const int itemLayer = 10;
        const int enemyLayer = 11;
        const int sinkLayer = 12;
        const int playerCollisionLayer = 13;
        const int dontCollideLayer = 14;
        const int powerupLayer = 15;

        Player playerObj = gameObject.GetComponent<Player>();
        int gameMode = GetGameMode();
        switch (collider.gameObject.layer)
        {
            // Check collistion with treasures
            case itemLayer:
                Treasure treasure = collider.GetComponent<Treasure>();
                // Untaken treasure
                if (!treasure.GetIsPickedUp())
                {
                    TakeTreasure(collider.gameObject);                 
                    DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.pickup, playerObj, treasure.GetID(), 0, gameMode);
                }
                break;
            // Check collistion with enemies
            case enemyLayer:
                int enemyID = collider.GetComponent<Enemy>().GetID();
                collider.gameObject.layer = dontCollideLayer;
                if (enemyID == ID || enemyID == -1)
                {
                    SetEnemyHit(collider.GetComponent<Enemy>());
                }
                else
                {
                    DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.blockDamage, playerObj, 0, enemyID, gameMode);
                }
                break;
            case sinkLayer:
                if (!IsInventoryEmpty(MyItemInventory))
                {
                    for (int i=0; i<MyItemInventory.Length; i++)
                    {
                        int itemID = MyItemInventory[i].GetID();
                        if (RemoveItem(MyItemInventory[i]))
                        {
                            collider.GetComponent<ItemSink>().SetScore(playerObj);
                            DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.dropitem, playerObj, itemID, 0, gameMode);
                            break;
                        }
                    }
                }  
                break;
            case playerCollisionLayer:
                Player otherPlayer = collider.transform.parent.gameObject.GetComponent<Player>();
                if (!IsInventoryEmpty(OthersItemInventory))
                {
                    if (!otherPlayer.IsInventoryFull(otherPlayer.GetMyItemInventory()))
                    {
                        for (int i = 0; i < OthersItemInventory.Length; i++)
                        {
                            if (OthersItemInventory[i].GetID() == otherPlayer.GetID())
                            {
                                // Give item to other player
                                OthersItemInventory[i].SetDisown();
                                OrderCarriedItems();
                                otherPlayer.TakeTreasure(OthersItemInventory[i].gameObject);
                                RemoveItem(OthersItemInventory[i]);
                                DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.giveItem, playerObj, otherPlayer.GetID(), 0, gameMode);
                            }
                        }
                    }
                }
                // If it's a cooperative mode AND if the other player needs revival 
                if (OthersItemInventory.Length != 0 && otherPlayer.GetComponent<Player>().GetHealth() == 0)
                {
                    FixBoatTime = 0;
                    
                }
                break;

            case powerupLayer:

                if(gameMode == 1)
                {
                    // Competitive mode
                    immuneTimer = 5;
                    collider.GetComponent<Powerup>().SetPickedUp();
                    gameObject.GetComponentsInChildren<Animator>()[1].SetBool("Aura", true);
                    Destroy(collider.gameObject);
                    StartCoroutine(Countdown());
                }
                else
                {
                    // Cooperative mode
                    collider.GetComponent<Powerup>().SetPickedUp();
                    Destroy(collider.gameObject);
                    GameObject[] gameObjects = GameObject.FindGameObjectsWithTag("Player");
                    foreach (var g in gameObjects)
                    {
                        g.GetComponent<Player>().SetHealth();
                        
                    }
                }
                DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.powerupTaken, playerObj, 0, 0, gameMode);
                break;
            
            default:                
                break;
        }
    }

    void OnTriggerStay2D(Collider2D collider)
    {
        int playerCollisionLayer = LayerMask.NameToLayer("pCollision");
        if (collider != null && collider.gameObject.layer == playerCollisionLayer && FixBoatTime >=0)
        {
            Player otherPlayer = collider.transform.parent.gameObject.GetComponent<Player>();
            if (OthersItemInventory.Length != 0 && otherPlayer.GetComponent<Player>().GetHealth() == 0)
            {
                FixBoatTime += Time.deltaTime;
            }
            if (FixBoatTime >= 3f)
            {
                FixBoat(otherPlayer.GetComponent<Player>());
            }
        }
    }

    private void HandleInput()  
    {
       
        if (Health > 0)
        {          
            // Retrieve key presses for movement
            if (Input.GetAxis(MovementAxis) < -0.5)
            {
                Direction.x = -1f;
                // Click counter
                ClickCounter++;
            }
            else if (Input.GetAxis(MovementAxis) > 0.5)
            {
                Direction.x = 1f;
                // Click counter
                ClickCounter++;
            }
            else
            {
                Direction.x = 0f;
            }

            // Retrieve key presses for jump
            if (Input.GetAxis(JumpButton) > 0.5)
            {                
                IsJumping = true;
                // Click counter
                ClickCounter++;
            }
            else if (Input.GetAxis(JumpButton) < 0.5)
            {
                animator.SetBool("Jump", IsJumping);
                IsJumping = false;
            }

        }
    }

    private bool IsGrounded(BoxCollider2D collider, LayerMask mapLayer)
    {
        float extraHeight = 0.1f;
        float distToGround = collider.bounds.extents.y;
        RaycastHit2D boxCastHit2D = Physics2D.BoxCast(collider.bounds.center, collider.bounds.size, 0f, Vector2.down, extraHeight, mapLayer);

        return (boxCastHit2D.collider != null);
    }

    private void Movement()
    {
        int spriteDirection = 1;
        Rigidbody2D rigidbody2D = GetComponent<Rigidbody2D>();
        BoxCollider2D boxCollider2D = GetComponent<BoxCollider2D>();

        int gameMode = GetGameMode();
        Player playerObj = gameObject.GetComponent<Player>();

        // Flip player according to movement direction
        if (IsSpriteDirectionRight == false)
        {
            spriteDirection = -1;
        }
        if (Direction.x != 0)
        {
            transform.localScale = new Vector3(spriteDirection * Direction.x * Mathf.Abs(transform.localScale.x),
                                               transform.localScale.y,
                                               transform.localScale.z);
        }

        // Left & Right movement
        rigidbody2D.velocity = new Vector2(Speed.x * Direction.x, rigidbody2D.velocity.y);
        animator.SetFloat("Speed", Math.Abs(rigidbody2D.velocity.x));

        // Jump
        if (IsJumping && IsGrounded(boxCollider2D, MapLayer))
        {
            animator.SetBool("Jump", IsJumping);
            rigidbody2D.velocity = new Vector2(rigidbody2D.velocity.x, Speed.y);
        }

        if (Health <= 0 && IsGrounded(boxCollider2D, MapLayer)) { rigidbody2D.velocity = new Vector2(0, 0); }
    }

    private void FixBoat(Player player)
    {
        player.SetHealth();
        DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.revivePlayer, gameObject.GetComponent<Player>(), 0, 0, GetGameMode());
        DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.revived, ID, transform.position.x, transform.position.y, 0, 0, GetGameMode());

    }

    private void AccidentalFallIdentified()
    {
        DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.fallAccidently, gameObject.GetComponent<Player>(), 0, 0, GetGameMode());
        // Clear lists for future identifications
        EnemiesDistance1st.Clear();
        EnemiesDistance2nd.Clear();
        ItemsDistance1st.Clear();
        ItemsDistance2nd.Clear();
        FallSamplesReady = false;
    }

    // If get closer to enemy - it's accidental
    // If get further from item - it's accidental 
    private bool IdentifyFall()
    {

        // Identify first falling samples
        if (gameObject.GetComponent<Rigidbody2D>().velocity.y < -9.1 && !IsJumping && EnemiesDistance1st.Count == 0 && ItemsDistance1st.Count == 0)
        {
            GameObject[] gameObjs = FindObjectsOfType<GameObject>();
            for (int i = 0; i < gameObjs.Length; i++)
            {
                Enemy enemyObj = gameObjs[i].GetComponent<Enemy>();
                Item itemObj = gameObjs[i].GetComponent<Item>();

                // An enemy that can deal damage to player
                if (enemyObj != null && (enemyObj.GetID() == ID || enemyObj.GetID() == -1) )
                {
                    EnemiesDistance1st.Add(gameObjs[i].GetInstanceID(), Math.Abs(Vector3.Distance(gameObjs[i].transform.position, transform.position)));
                }

                // An Item that should be obtained by player
                if (gameObjs[i].GetComponent<Item>() != null && 
                    ((itemObj.GetID() == ID || itemObj.GetID() == -1) && IsInventoryEmpty(MyItemInventory) || 
                        ((itemObj.GetID() != ID && itemObj.GetID() != -1) && IsInventoryEmpty(OthersItemInventory)) ) )
                {
                    ItemsDistance1st.Add(gameObjs[i].GetInstanceID(), Math.Abs(Vector3.Distance(gameObjs[i].transform.position, transform.position)));
                }
            }

            return false;
        }

        // Identify second falling samples
        if (gameObject.GetComponent<Rigidbody2D>().velocity.y < -9.2 && !IsJumping && EnemiesDistance1st.Count > 0 && ItemsDistance1st.Count > 0 && EnemiesDistance2nd.Count == 0 && ItemsDistance2nd.Count == 0)
        {
            GameObject[] gameObjs = FindObjectsOfType<GameObject>();
            for (int i = 0; i < gameObjs.Length; i++)
            {
                Enemy enemyObj = gameObjs[i].GetComponent<Enemy>();
                Item itemObj = gameObjs[i].GetComponent<Item>();

                // Check if object was sampled in the first sampling process
                if (EnemiesDistance1st.ContainsKey(gameObjs[i].GetInstanceID()) || ItemsDistance1st.ContainsKey(gameObjs[i].GetInstanceID()))
                {
                    // An enemy that can deal damage to player
                    if (enemyObj != null && (enemyObj.GetID() == ID || enemyObj.GetID() == -1))
                    {
                        EnemiesDistance2nd.Add(gameObjs[i].GetInstanceID(), Math.Abs(Vector3.Distance(gameObjs[i].transform.position, transform.position)));
                    }

                    // An Item that should be obtained by player
                    if (gameObjs[i].GetComponent<Item>() != null &&
                        ((itemObj.GetID() == ID || itemObj.GetID() == -1) && IsInventoryEmpty(MyItemInventory) ||
                            ((itemObj.GetID() != ID && itemObj.GetID() != -1) && IsInventoryEmpty(OthersItemInventory))))
                    {
                        ItemsDistance2nd.Add(gameObjs[i].GetInstanceID(), Math.Abs(Vector3.Distance(gameObjs[i].transform.position, transform.position)));
                    }
                }
            }

            if (EnemiesDistance2nd.Count != 0 || ItemsDistance2nd.Count != 0)
            {
                FallSamplesReady = true;
            }
            else if (EnemiesDistance2nd.Count == 0 && ItemsDistance2nd.Count == 0)
            {
                EnemiesDistance1st.Clear();
                ItemsDistance1st.Clear();
                FallSamplesReady = false;

                return false;
            }
            
        }

        // There are two samples to compare
        if (FallSamplesReady)
        {
            for (int i=0; i< EnemiesDistance2nd.Count; i++)
            {
                int enemyInstanceID = EnemiesDistance2nd.Keys.ElementAt(i);
                float enemy1stDistance = -1f;
                if (EnemiesDistance1st.TryGetValue(enemyInstanceID, out enemy1stDistance) && enemy1stDistance > EnemiesDistance2nd[enemyInstanceID])
                {
                    AccidentalFallIdentified();
                    return true;
                }                 
            }

            for (int i = 0; i < ItemsDistance2nd.Count; i++)
            {
                int itemInstanceID = ItemsDistance2nd.Keys.ElementAt(i);
                float item1stDistance = -1f;
                if (EnemiesDistance1st.TryGetValue(itemInstanceID, out item1stDistance) && item1stDistance < EnemiesDistance2nd[itemInstanceID])
                {
                    AccidentalFallIdentified();
                    return true;
                }
            }
        }

        EnemiesDistance1st.Clear();
        EnemiesDistance2nd.Clear();
        ItemsDistance1st.Clear();
        ItemsDistance2nd.Clear();
        FallSamplesReady = false;
        return false;
    }

    // Countdown for protection aura
    private IEnumerator Countdown()
    {
        while(immuneTimer > 0)
        {
            yield return new WaitForSeconds(1f);

            immuneTimer--;
        }
        gameObject.GetComponentsInChildren<Animator>()[1].SetBool("Aura", false);
    }

    // Start is called before the first frame update
    void Start()
    {
        int playerLayer = LayerMask.NameToLayer("Player"); 
        Physics2D.IgnoreLayerCollision(playerLayer, playerLayer, true);
        ClickCounter = 0;
    }

    // Update is called once per frame
    void Update()
    {
        HandleInput();
        Movement();
        OrderCarriedItems();
        IdentifyFall();
    }
}
