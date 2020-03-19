using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ItemSink : Singleton
{
    private int[] PlayerScores;
    private int SingleScoreValue;

    // Getters
    public int GetPlayerScore (GameObject gameObj)
    {
        return PlayerScores[gameObj.GetComponent<Player>().GetID()];
    }

    public int GetScoreSum ()
    {
        int ScoreSum = 0;
        for (int i=1; i< PlayerScores.Length; i++)
        {
            ScoreSum += PlayerScores[i];
        }
        return ScoreSum;
    }

    public bool SinkInit ()
    {
        GameObject[] gameObjects = GameObject.FindGameObjectsWithTag("Player");
        if (gameObjects == null)
        {
            return false;
        }

        SingleScoreValue = 5;
        PlayerScores = new int[gameObjects.Length+1];
        return true;
    }

    // Setters
    public bool SetScore (Player player)
    {
        if (PlayerScores.Length == 0)
        {
            return false;
        }

        PlayerScores[player.GetID()] += SingleScoreValue;
        return true;
    }

    void OnTriggerEnter2D(Collider2D collider)
    {
        const int playerLayer = 9;
        GameObject gameObj = collider.gameObject;

        // If it's the player, take item out and put in item sink
        if (gameObj.layer == playerLayer)
        {
            Player player = gameObj.GetComponent<Player>();
            Item[] myItemInventory = player.GetMyItemInventory();
            for (int i=0; i< myItemInventory.Length; i++)
            {
                if (myItemInventory[i] != null && myItemInventory[i].GetID() != -1)
                {
                    player.RemoveItem(myItemInventory[i]);
                    SetScore(player);
                    // TODO: destroy item
                    break;
                }
            }
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        SinkInit();
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
