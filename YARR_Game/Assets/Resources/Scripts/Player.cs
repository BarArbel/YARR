﻿using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;

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

    // Game input
    public KeyCode MoveRightButton;
    public KeyCode MoveLeftButton;
    public KeyCode JumpButton;

    // Movement
    public Vector2 Speed; // NOTE: not in the design
    public Vector2 Direction; // NOTE: not in the design
    public bool IsJumping;     // NOTE: not in the design

    public LayerMask MapLayer;  // NOTE: not in the design. // TODO: Should be removed and be used normally

    //Networking
    private SocketIOComponent socket;
    private SendCooperativeData sendCooperativeData;

    //Getters
    public int  GetID()                     { return ID; }
    public int  GetHealth()                 { return Health; }
    public bool GetIsSpriteDirectionRight() { return IsSpriteDirectionRight; }
    public SocketIOComponent GetSocket()    { return socket; }

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
        // TODO: return OthersItemInventory.ToImmutableArray<Item>();
    }

    public List<Item> GetTotalItemInventory()
    {
        List<Item> totalInventory = new List<Item>(TotalItemInventory);
        return totalInventory;
    }
    //Setters
    public bool SetHealth( )
    {
        if (MaxHealth <= 0 )
        {
            return false;
        }

        Health = MaxHealth;
        return true;
    }

    public bool SetEnemyHit( Enemy enemy)
    {
        if (Health <= 0)
        {
            return false;
        }
        Health-=enemy.GetDamage();
        return true;
    }

    public void PlayerInit(
        KeyCode moveRight, 
        KeyCode moveLeft, 
        KeyCode jump, 
        int id, 
        int health, 
        int myItemsAmount,
        int othersItemsAmount,
        bool isSpriteDirectionRight, 
        float heldItemHeight,
        SendCooperativeData cooperativeData,
        SocketIOComponent socketIO)
    {
        // TODO: nullify inventory and total inventory
        ID = id;
        Health = health;
        MaxHealth = health;
        HeldItemHeight = heldItemHeight;
        IsSpriteDirectionRight = isSpriteDirectionRight;
    
        MoveRightButton = moveRight;
        MoveLeftButton = moveLeft;
        JumpButton = jump;

        // Initialize inventories
        MyItemInventory = new Item[myItemsAmount];
        OthersItemInventory = new Item[othersItemsAmount];
        TotalItemInventory = new List<Item>();

        //Networking
        sendCooperativeData = cooperativeData;
        socket = socketIO;
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

    private void OrderCarriedItems()
    {
        float height = HeldItemHeight;
        int index = 0;
        foreach (Item item in TotalItemInventory)
        {
            item.transform.position = new Vector3(this.transform.position.x, this.transform.position.y + (height * index), 0);
            index++;
        }
    }
    

    void OnTriggerEnter2D(Collider2D collider)
    {
        const int itemLayer = 10;
        const int enemyLayer = 11;
        const int sinkLayer = 12;
        const int playerCollisionLayer = 13;

        switch (collider.gameObject.layer)
        {
            // Check collistion with treasures
            case itemLayer:
                Treasure treasure = collider.GetComponent<Treasure>();
                // Untaken treasure
                if (!treasure.GetIsPickedUp())
                {
                    TakeTreasure(collider.gameObject);
                }
                break;
            // Check collistion with enemies
            case enemyLayer:
                int enemyID = collider.GetComponent<Enemy>().GetID();
                if (enemyID == ID || enemyID == -1)
                {
                    SetEnemyHit(collider.GetComponent<Enemy>());
                }
                break;
            case sinkLayer:
                if (!IsInventoryEmpty(MyItemInventory))
                {
                    for (int i=0; i<MyItemInventory.Length; i++)
                    {
                        if (RemoveItem(MyItemInventory[i]))
                        {
                            collider.GetComponent<ItemSink>().SetScore(gameObject.GetComponent<Player>());
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
            default:                
                break;
        }
    }

    void OnTriggerStay2D(Collider2D collider)
    {
        const int playerCollisionLayer = 13;
        if (collider != null && collider.gameObject.layer == playerCollisionLayer)
        {
            Player otherPlayer = collider.transform.parent.gameObject.GetComponent<Player>();
            Debug.Log(otherPlayer.ID);
            if (OthersItemInventory.Length != 0 && otherPlayer.GetComponent<Player>().GetHealth() == 0)
            {
                FixBoatTime += Time.deltaTime;
                Debug.Log("Time spent: " + FixBoatTime);
            }
            if (FixBoatTime >= 3f)
            {
                FixBoat(otherPlayer.GetComponent<Player>());
            }
        }
    }

    private void HandleInput()      // NOTE: not in the design
    {
        if (Health > 0)
        {
            // Retrieve key presses for movement
            if (Input.GetKey(MoveLeftButton))
            {
                Direction.x = -1f;
            }
            else if (Input.GetKey(MoveRightButton))
            {
                Direction.x = 1f;
            }

            else if (!Input.GetKey(MoveRightButton) && !Input.GetKey(MoveLeftButton))
            {
                Direction.x = 0f;
            }

            // Retrieve key presses for jump
            if (Input.GetKeyDown(JumpButton))
            {

                IsJumping = true;
            }
            else if (!Input.GetKeyDown(JumpButton))
            {

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

        // Jump
        if (IsJumping && IsGrounded(boxCollider2D, MapLayer))
        {

            rigidbody2D.velocity = new Vector2(rigidbody2D.velocity.x, Speed.y);
        }

        if (Health <= 0 && IsGrounded(boxCollider2D, MapLayer)) { rigidbody2D.velocity = new Vector2(0, 0); }
    }

    void FixBoat(Player player)
    {
        FixBoatTime = 0;
        player.SetHealth();
 
    }

    // Start is called before the first frame update
    void Start()
    {
        const int playerLayer = 9;
        Physics2D.IgnoreLayerCollision(playerLayer, playerLayer, true);
    }

    // Update is called once per frame
    void Update()
    {
        HandleInput();
        Movement();
        OrderCarriedItems();
    }
}