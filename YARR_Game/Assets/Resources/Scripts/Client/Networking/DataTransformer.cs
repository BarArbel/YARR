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
        static SocketIOComponent GameSocket = GameObject.Find("[Network Container]").GetComponent<GameClient>();
        static DataGameSnapShot data = new DataGameSnapShot();
        static ExperimentSettings settings = new ExperimentSettings();    

        public static void SetExperimentID         (string expID)    { settings.ExperimentID = expID; }
        public static void SetInstanceID           (string instID)   { settings.InstanceID = instID; }
        public static void SeInterruptedInstanceID (string interrID) { settings.InterruptedInstanceID = interrID; }
        public static void SeIsInterrupted(bool isInterr) { settings.IsInterrupted = isInterr; }


        public static void sendDDA(float time,Event eventOccurred, Player player,int item,int enemy,int gameMode)
        {
            data.Time = time;
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
            data.Time = time;
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
            data.Time = time;
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
            data.Time = time;
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

        public static void getInitSettings()
        {
            GameSocket.Emit("createTables");
            DDASocket = GameObject.Find("[Network Container]").GetComponent<DDAClient>();
            DDASocket.Connect();
            GameSocket.Emit("initNewGameSettings", new JSONObject(JsonUtility.ToJson(settings)));
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
    }

public enum Event
    {
        // DDA
        pickup,giveItem,revivePlayer,temporaryLose,revived,lose,dropitem,getDamaged,blockDamage,failPickup,fallAccidently,individualLoss,spawn,powerupSpawn,powerupTaken,powerupMissed,
        // Tracker
        move,jump,lvlUp,lvlDown,lvlStay,enemyRecalcD
    }

}

