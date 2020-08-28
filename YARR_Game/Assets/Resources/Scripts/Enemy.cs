using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Project.Networking;
using Event = Project.Networking.Event;
using System;
using System.Linq;
using Random = UnityEngine.Random;

public class Enemy : MonoBehaviour
{
    private int ID;
    private int Damage;
    private float Speed;
    private Transform TargetTransform;
    private double TimeBetweenPathRecalculation;
    private double TimeLeft;
    private double RecalculationsAvailable;
    private Vector3 Direction;

    // Response time properties
    private float ResponseTime;
    private Dictionary<int, float> PlayersDistance1st;
    private Dictionary<int, float> PlayerssDistance2nd;

    public bool EnemyInit(int id, int damage, float speed, double recalculationsAvailable, double timeBetweenPathRecalculation)
    {
        int target;
        int amountOfPlayers = GetAmountOfPlayers();

        // Init response time properties
        ResponseTime = 0;
        PlayersDistance1st = new Dictionary<int, float>();
        PlayerssDistance2nd = new Dictionary<int, float>(); 

        if (amountOfPlayers > 0)
        {
            // Is the game cooperative or competitive?
            target = (id <= 0) ? Random.Range(1, amountOfPlayers+1) : id;
            ID = id;
            Damage = damage;
            Speed = speed;
            TimeBetweenPathRecalculation = timeBetweenPathRecalculation;
            RecalculationsAvailable = recalculationsAvailable;

            // Find the target
            GameObject playerObj = GetPlayerByID(target);
            TargetTransform = playerObj.GetComponent<Transform>();

            // Calculate the direction to the player
            setDirection();

            // Set the timer
            TimeLeft = TimeBetweenPathRecalculation;

            DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.spawn, target, transform.position.x, transform.position.y, 0, id, GetGameMode());
            return true;
        }
        Destroy(gameObject);
        return false;
    }

    public int GetDamage() { return Damage; }
    public int GetID() { return ID; }
    public int GetAmountOfPlayers() { return GameObject.FindGameObjectsWithTag("Player").Length; }
    public int GetGameMode()        { return (ID < 0) ? 1 : 0; }

    public GameObject GetPlayerByID(int ID)
    {
        GameObject[] gameObjects = GameObject.FindGameObjectsWithTag("Player");
        for (int i = 0; i < gameObjects.Length; i++)
        {
            if (gameObjects[i].GetComponent<Player>().GetID() == ID)
            {
                return gameObjects[i];
            }
        }
        return null;
    }

    private void setDirection()
    {
        Direction = (TargetTransform.position - transform.position).normalized;
        if (Direction.x < 0)
        {
            transform.localScale = new Vector3(Mathf.Abs(transform.localScale.x) * -1.0f, transform.localScale.y, transform.localScale.z);
        }
        else if (Direction.x > 0)
        {
            transform.localScale = new Vector3(Mathf.Abs(transform.localScale.x), transform.localScale.y, transform.localScale.z);
        }
    }

    // If get closer to enemy - it's accidental
    // If get further from item - it's accidental 
    private bool IdentifyResponse()
    {

        // Identify first sample
        if (PlayersDistance1st.Count == 0)
        {
            GameObject[] gameObjs = FindObjectsOfType<GameObject>();
            for (int i = 0; i < gameObjs.Length; i++)
            {
                Player playerObj = gameObjs[i].GetComponent<Player>();

                // Get player that matches enemy
                if (gameObjs[i].GetComponent<Player>() != null &&
                    (playerObj.GetID() == ID || GetID() == -1) && playerObj.GetHealth() > 0)
                {
                    PlayersDistance1st.Add(gameObjs[i].GetInstanceID(), Math.Abs(Vector3.Distance(gameObjs[i].transform.position, transform.position)));
                }
            }

            return false;
        }

        // Identify second sample
        if (PlayerssDistance2nd.Count == 0)
        {
            GameObject[] gameObjs = FindObjectsOfType<GameObject>();
            for (int i = 0; i < gameObjs.Length; i++)
            {
                Player playerObj = gameObjs[i].GetComponent<Player>();

                // Check if object was sampled in the first sampling process
                if (PlayersDistance1st.ContainsKey(gameObjs[i].GetInstanceID()))
                {

                    // Get player that matches enemy
                    if (gameObjs[i].GetComponent<Player>() != null &&
                    (playerObj.GetID() == ID || GetID() == -1) && playerObj.GetHealth() > 0)
                    {
                        PlayerssDistance2nd.Add(gameObjs[i].GetInstanceID(), Math.Abs(Vector3.Distance(gameObjs[i].transform.position, transform.position)));
                    }
                }
            }

            // Are they getting further?
            for (int i = 0; i < PlayerssDistance2nd.Count; i++)
            {
                int pInstanceID = PlayerssDistance2nd.Keys.ElementAt(i);
                float item1stDistance = -1f;
                if (PlayersDistance1st.TryGetValue(pInstanceID, out item1stDistance) && item1stDistance > PlayerssDistance2nd[pInstanceID])
                {
                    ResponseIdentified();
                    return true;
                }
            }
        }

        PlayersDistance1st.Clear();
        PlayerssDistance2nd.Clear();

        return false;
    }

    private void ResponseIdentified()
    {
        Debug.Log("Response: " + ResponseTime * 1000);
        DataTransformer.sendTracker(Time.realtimeSinceStartup, Event.playerResponseTime, GetID(),0,0, (int)(ResponseTime*1000), 0, GetGameMode());
        ResponseTime = -1;
    }

    public void Movement()
    {
        // If there are turns left
        if (RecalculationsAvailable != 0)
        {
            TimeLeft -= Time.deltaTime;

            // If it is time to turn
            if (TimeLeft <= 0)
            {
                // Update the direction, turns and reset the turn timer
                setDirection();
                RecalculationsAvailable--;
                TimeLeft = TimeBetweenPathRecalculation;
            }
        }

        // Move toward last saved direction
        transform.position += Direction * Speed * Time.deltaTime;
    }

    private void OnTriggerEnter2D(Collider2D collider)
    {
        
        int playerLayer = LayerMask.NameToLayer("Player");
        
        if (collider.gameObject.layer == playerLayer)
        {
            Destroy(gameObject);
        }
    }

        // Start is called before the first frame update
        void Start()
    {

    }

    void OnBecameInvisible()
    {
        if (RecalculationsAvailable == 0)
        {
            // If out of screen + no turns left, we can destroy it
            DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.avoidDamage, ID, transform.position.x, transform.position.y, 0, GetID(), GetGameMode());
            Destroy(gameObject);
        }
    }

    // Update is called once per frame
    void Update()
    {
        Movement();
        if (ResponseTime != -1)
        {
            ResponseTime += Time.deltaTime;
            IdentifyResponse();
        }
    }
}