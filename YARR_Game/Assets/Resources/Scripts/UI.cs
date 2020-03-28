﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class UI : MonoBehaviour
{

    private GameManager.GameMode Mode;
    private int NumberOfPlayers;
    int InitialHealth;
    List<Sprite> PlayerSprites;
    private GameObject HealthPrefab;
    private List<GameObject> HealthIdicators;
    private List<GameObject> ScoresIdicators;

    public void UIInit( int initialHealth, GameManager.GameMode mode, List<Sprite> playerSprites, int numberOfPlayers) 
    {
        float BotLeftCorner = -10.2f;
        GameObject canvas = GameObject.Find("Canvas");        
        HealthIdicators = new List<GameObject>();
        ScoresIdicators = new List<GameObject>();

        Mode = mode;
        NumberOfPlayers = numberOfPlayers;
        InitialHealth = initialHealth;
        HealthPrefab = Resources.Load<GameObject>("Prefabs/HealthIndicator");
        PlayerSprites = new List<Sprite>(playerSprites);

        for (int i = 0; i< NumberOfPlayers; i++)
        {
            HealthIdicators.Add(Instantiate(HealthPrefab, new Vector3(BotLeftCorner + ((float)i * 1.5f), -4.6f, 0), transform.rotation));

            HealthIdicators[i].transform.SetParent(canvas.transform);
            HealthIdicators[i].GetComponent<Image>().sprite = PlayerSprites[i];
            HealthIdicators[i].GetComponentInChildren<Text>().text = InitialHealth.ToString();
            HealthIdicators[i].GetComponent<RectTransform>().localScale = new Vector3(0.05f, 0.05f, 0.05f);
        }

        if (Mode == GameManager.GameMode.Cooperative)
        {
            ScoresIdicators.Add(new GameObject("Score"));
            InitScoreText(ScoresIdicators[0]);            
            ScoresIdicators[0].transform.position = new Vector3(BotLeftCorner + (((float)NumberOfPlayers + 0.7f) * 1.5f), -5.5f, 0);
            ScoresIdicators[0].GetComponent<Text>().color = new Color(0f, 0f, 0f);
        }
        else
        {
           for (int i = 0; i < NumberOfPlayers; i++)
           {
                ScoresIdicators.Add( new GameObject("Score"));
                InitScoreText(ScoresIdicators[i]);
                ScoresIdicators[i].transform.position = new Vector3(HealthIdicators[i].transform.position.x+0.8f, HealthIdicators[i].transform.position.y-0.2f, 0);
            }
        }
    }

    public void InitScoreText( GameObject score)
    {
        GameObject canvas = GameObject.Find("Canvas");
        score.layer = 5;
        score.transform.SetParent(canvas.transform);

        Text scoreText = score.AddComponent<Text>();
        scoreText.fontSize = 20;
        scoreText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        scoreText.text = "0";
        score.GetComponent<RectTransform>().localScale = new Vector3(0.8f, 0.8f, 0.8f);
    }

    public void SetHealth()
    {
        GameObject[] playerObjs = GameObject.FindGameObjectsWithTag("Player");
        for (int i = 0; i < playerObjs.Length; i++)
        {
            Player player = playerObjs[i].GetComponent<Player>();
            HealthIdicators[player.GetID() - 1].GetComponentInChildren<Text>().text = player.GetHealth().ToString();
        }

    }

    public void SetScore()
    {
        ItemSink sink = GameObject.Find("ItemSink").GetComponent<ItemSink>();
        GameObject[] playerObjs = GameObject.FindGameObjectsWithTag("Player");
        if (Mode == GameManager.GameMode.Competitive)
        {
            for (int i = 0; i < NumberOfPlayers; i++)
            {
                ScoresIdicators[i].GetComponentInChildren<Text>().text = sink.GetPlayerScore(playerObjs[i]).ToString();
            }
        }
        else
        {
            ScoresIdicators[0].GetComponentInChildren<Text>().text = sink.GetScoreSum().ToString();
        }
    }
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        SetHealth();
        SetScore();
    }
}
