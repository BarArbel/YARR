using Project.Networking;
using SocketIO;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Project.Networking
{
    public static class DataTransformer
    {
        static SocketIOComponent DDASocket;
        static SocketIOComponent GameSocket = null;
        static DataGameSnapShot data = new DataGameSnapShot();
        static ExperimentSettings settings = new ExperimentSettings();

        public static void SetInstanceID(string instID)
        {
            settings.InstanceID = instID;
            settings.Code = "";
            settings.ExperimentID = "";
            settings.InterruptedInstanceID = "";
            settings.IsInterrupted = false;
            settings.InitTimestamp = 0f;
            settings.TimeSpentBeforeGameStart = 0f;
            settings.InitLevel = 0;
            settings.NumOfPlayers = 0;
        }

        public static void SetExperimentID         (string expID)     { settings.ExperimentID = expID; }        
        public static void SetInterruptedInstanceID (string interrID) { settings.InterruptedInstanceID = interrID; }
        public static void SetIsInterrupted         (bool isInterr)   { settings.IsInterrupted = isInterr; }
        public static void SetInitTimestamp        (float time)       { settings.InitTimestamp = time; }
        public static void SetTimeSpent            (float time)       { settings.TimeSpentBeforeGameStart = time; }
        public static void SetGameConnection ()
        {
            if (GameSocket == null || GameSocket.IsConnected == false)
            {
                GameSocket = GameObject.Find("[Network Container]").GetComponent<GameClient>();
                Debug.Log("SetGameConnection");
                GameSocket.Connect();
            }           
        }
        public static void SetDisconnect ()
        {
            if (DDASocket.IsConnected)
            {
                DDASocket.Emit("gameEnded");
                Debug.Log("game ended");
                DDASocket.Close();
            }
            if (GameSocket.IsConnected && !DDASocket.IsConnected)
            {
                GameSocket.Emit("gameEnded");
                Debug.Log("game ended");
                GameSocket.Close();
                GameSocket = null;
            }
        }


        public static void sendDDA(float time,Event eventOccurred, Player player,int item,int enemy,int gameMode)
        {
            data.Time = settings.InitTimestamp+time-settings.TimeSpentBeforeGameStart;
            data.Event = eventOccurred;
            data.PlayerID = player.GetID();
            data.CoordX = player.transform.position.x;
            data.CoordY = player.transform.position.y;
            data.Item = item;
            data.Enemy = enemy;
            data.GameMode = (GameManager.GameMode)gameMode;

            DDASocket.Emit("DDAinput", new JSONObject(JsonUtility.ToJson(data)));
        }

        public static void sendDDA(float time, Event eventOccurred, int PlayerID, float CoordX, float CoordY, int item, int enemy, int gameMode)
        {
            data.Time = settings.InitTimestamp+time - settings.TimeSpentBeforeGameStart;
            data.Event = eventOccurred;
            data.PlayerID = PlayerID;
            data.CoordX = CoordX;
            data.CoordY = CoordY;
            data.Item = item;
            data.Enemy = enemy;
            data.GameMode = (GameManager.GameMode)gameMode;

            DDASocket.Emit("DDAinput", new JSONObject(JsonUtility.ToJson(data)));
        }

        public static void sendTracker(float time, Event eventOccurred, Player player, int item, int enemy, int gameMode)
        {
            data.Time = settings.InitTimestamp+time - settings.TimeSpentBeforeGameStart;
            data.Event = eventOccurred;
            data.PlayerID = player.GetID();
            data.CoordX = player.transform.position.x;
            data.CoordY = player.transform.position.y;
            data.Item = item;
            data.Enemy = enemy;
            data.GameMode = (GameManager.GameMode)gameMode;

            GameSocket.Emit("TrackerInput", new JSONObject(JsonUtility.ToJson(data)));
        }

        public static void sendTracker(float time, Event eventOccurred, int PlayerID, float CoordX, float CoordY, int item, int enemy, int gameMode)
        {
            data.Time = settings.InitTimestamp+time - settings.TimeSpentBeforeGameStart;
            data.Event = eventOccurred;
            data.PlayerID = PlayerID;
            data.CoordX = CoordX;
            data.CoordY = CoordY;
            data.Item = item;
            data.Enemy = enemy;
            data.GameMode = (GameManager.GameMode)gameMode;

            GameSocket.Emit("TrackerInput", new JSONObject(JsonUtility.ToJson(data)));
        }

        public static void codeInput(string userInput)
        {
            settings.Code = userInput;
            // Check if it's a new game or not
            // [0-9] An interrupted game
            // [A-Z] A new game
            if (Char.IsLetter(userInput[0]))
            {
                GameSocket.Emit("newCodeInput", new JSONObject(JsonUtility.ToJson(settings)));
            }
            else if (Char.IsDigit(userInput[0]))
            {
                GameSocket.Emit("interruptedCodeInput", new JSONObject(JsonUtility.ToJson(settings)));
            }


        }

        public static void initDDAConnection()
        {
            SetInitTimestamp(0);
            settings.NumOfPlayers = 3;
            settings.InitLevel = 3;
            // New game
            if (!settings.IsInterrupted)
            {
                GameSocket.Emit("createTables");
                GameSocket.Emit("addInstanceMetaData", new JSONObject(JsonUtility.ToJson(settings)));
            }
            // Interrupted game
            else if (settings.InterruptedInstanceID != null)
            {
                settings.InstanceID = settings.InterruptedInstanceID;
                GameSocket.Emit("editInstanceMetaData", new JSONObject(JsonUtility.ToJson(settings)));
            }
            DDASocket = GameObject.Find("[Network Container]").GetComponent<DDAClient>();
            DDASocket.Connect();
        }

        public static void getInitSettings()
        {
            DDASocket.Emit("sendInstanceID", new JSONObject(JsonUtility.ToJson(settings)));
            if (!settings.IsInterrupted)
            {
                GameSocket.Emit("initNewGameSettings", new JSONObject(JsonUtility.ToJson(settings)));
            }
            else
            {
                GameSocket.Emit("initInterrGameSettings", new JSONObject(JsonUtility.ToJson(settings)));
            }
        }

        public static void initDDA()
        {
            DDASocket.Emit("initDDA", new JSONObject(JsonUtility.ToJson(settings)));
        }

        public static void SyncNewScene(JSONObject E)
        {
            Debug.Log("SyncNewScene" + E);
            GameSocket.Emit("SyncNewScene", E);
        }

        public static void SyncInterruptedScene(JSONObject E)
        {
            Debug.Log("SyncInterruptedScene" + E);
            GameSocket.Emit("SyncInterruptedScene", E);
        }
    }


    [Serializable]
    public class DataGameSnapShot
    {
        public Event Event;
        public float Time;
        public int PlayerID;
        public float CoordX;
        public float CoordY;
        public int Item;
        public int Enemy;
        public GameManager.GameMode GameMode;
    }

    [Serializable]  
    public class ExperimentSettings
    {
        public string Code;
        public string ExperimentID;
        public string InstanceID;
        public string InterruptedInstanceID;
        public bool IsInterrupted;
        public float InitTimestamp;
        public float TimeSpentBeforeGameStart;
        public int InitLevel;
        public int NumOfPlayers;
    }

public enum Event
    {
        // DDA
        pickup,giveItem,revivePlayer,temporaryLose,revived,lose,dropitem,getDamaged,blockDamage,failPickup,fallAccidently,individualLoss,spawn,powerupSpawn,powerupTaken,powerupMissed,win,avoidDamage,
        // Tracker
        enemyLoc,itemLoc,takenItemLoc,playerLocHealth,lvlUp,lvlDown,lvlStay,newRound,gameEnded,playerClickCount,playerResponseTime
    }
}

