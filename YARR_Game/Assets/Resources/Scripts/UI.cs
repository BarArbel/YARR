using System.Collections;
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
    private bool IsUIInit;
    private GameObject countdownDisplay;
    private int countdownTime;

    // UI Debug
    public GameObject DebugIndicator;
    public List<ObjectFactory> EnemyFactories;
    public List<ObjectFactory> ItemFactories;
    public Text debugText;
    public GameManager.Level Difficulty;

    public void UIInit( int initialHealth, GameManager.GameMode mode, /*DEBUG*/GameManager.Level difficulty, /*DEBUG*/List<ObjectFactory> enemyFactories, /*DEBUG*/List<ObjectFactory> itemFactories, List<Sprite> playerSprites, int numberOfPlayers) 
    {
        float BotLeftCorner = -10.2f;
        GameObject canvas = GameObject.Find("Canvas");        
        HealthIdicators = new List<GameObject>();
        ScoresIdicators = new List<GameObject>();

        IsUIInit = true;
        Mode = mode;
        NumberOfPlayers = numberOfPlayers;
        InitialHealth = initialHealth;
        HealthPrefab = Resources.Load<GameObject>("Prefabs/HealthIndicator");
        PlayerSprites = new List<Sprite>(playerSprites);

        countdownDisplay = Instantiate(Resources.Load<GameObject>("Prefabs/countdownDisplay"), new Vector3(0, 0, 0), transform.rotation);
        countdownDisplay.transform.SetParent(canvas.transform);
        countdownDisplay.GetComponent<RectTransform>().localScale = new Vector3(1, 1, 1);
        
        CountDownStart();

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

        // UI Debug
        DebugIndicator = new GameObject("DEBUGMODE");
        Difficulty = difficulty;
        DebugIndicator.layer = 5;
        DebugIndicator.transform.SetParent(canvas.transform);
        DebugIndicator.transform.position = new Vector3(-8.3f, 2.7f, 0);
        debugText = DebugIndicator.AddComponent<Text>();
        RectTransform rt = DebugIndicator.GetComponent<RectTransform>();
        rt.sizeDelta = new Vector2(200, 200);
        debugText.fontSize = 12;
        debugText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        debugText.text = "DEBUG \n" + Mode.ToString() + "\n" + Difficulty.ToString();
        debugText.GetComponent<RectTransform>().localScale = new Vector3(0.8f, 0.8f, 0.8f);

        EnemyFactories = enemyFactories;
        ItemFactories = itemFactories;
    }

    public void InitScoreText( GameObject score)
    {
        GameObject canvas = GameObject.Find("Canvas");
        score.layer = 5;
        score.transform.SetParent(canvas.transform);

        Text scoreText = score.AddComponent<Text>();
        scoreText.fontSize = 18;
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
    /*DEBUG*/
    void SETDEBUGLEVELS()
    {
        debugText.text = "DEBUG \n" + Mode.ToString() + "\n" + Difficulty.ToString() + "\n";

        for (int i=0; i< EnemyFactories.Count; i++)
        {
            debugText.text = debugText.text + EnemyFactories[i].GETLEVELSTRING();
        }

        for (int i = 0; i < ItemFactories.Count; i++)
        {
            debugText.text = debugText.text + ItemFactories[i].GETLEVELSTRING();
        }
    }

    public void CountDownStart()
    {
        countdownTime = 6;
        StartCoroutine(CountdownToStart());
    }

    IEnumerator CountdownToStart()
    {
        Time.timeScale = 0;
        float pauseTime = Time.realtimeSinceStartup + countdownTime;
        while (Time.realtimeSinceStartup < pauseTime - 1)
        {
            countdownDisplay.GetComponent<Text>().text = ((int)(pauseTime - Time.realtimeSinceStartup)).ToString();
            yield return 0;
        }
        Time.timeScale = 1;

        countdownDisplay.GetComponent<Text>().text = "GO!";

        yield return new WaitForSeconds(1f);

        countdownDisplay.gameObject.SetActive(false);
    }

    public void CountDownFinish()
    {
        countdownTime = 10;
        StartCoroutine(CountdownToFinish());
    }

    IEnumerator CountdownToFinish()
    {
        countdownDisplay.gameObject.SetActive(true);
        while (countdownTime > 0)
        {
            countdownDisplay.GetComponent<Text>().text = countdownTime.ToString();
            yield return new WaitForSeconds(1f);
            countdownTime--;
        }

        countdownDisplay.GetComponent<Text>().fontSize = 100;
        countdownDisplay.GetComponent<Text>().text = "Finished";

        yield return new WaitForSeconds(1f);
        countdownDisplay.GetComponent<Text>().fontSize = 300;
        countdownDisplay.gameObject.SetActive(false);
    }

    // Start is called before the first frame update
    void Start()
    {
        IsUIInit = false;
    }

    // Update is called once per frame
    void Update()
    {
        if (IsUIInit == true)
        {


            SetHealth();
            SetScore();
            /*DEBUG*/
            if (Difficulty == GameManager.Level.Adaptive)
            {
                SETDEBUGLEVELS();
            }
        }
        
    }
}
