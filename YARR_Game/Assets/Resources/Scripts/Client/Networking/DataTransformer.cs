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
        static SocketIOComponent DDASocket = GameObject.Find("[Network Container]").GetComponent<DDAClient>();
        static SocketIOComponent GameSocket = GameObject.Find("[Network Container]").GetComponent<GameClient>();
        static DataGameSnapShot data = new DataGameSnapShot();
        static GameCode gameCode = new GameCode();    
        
        public static void createTables()
        {
            GameSocket.Emit("createTables");
        }

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

        public static void codeInput(String userInput)
        {
            gameCode.code = userInput;
            GameSocket.Emit("codeInput", new JSONObject(JsonUtility.ToJson(gameCode)));
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
    public class GameCode
    {
        public String code;
    }

public enum Event
    {
        // DDA
        pickup,giveItem,revivePlayer,temporaryLose,revived,lose,dropitem,getDamaged,blockDamage,failPickup,fallAccidently,individualLoss,spawn,powerupSpawn,powerupTaken,powerupMissed,
        // Tracker
        move,jump,lvlUp,lvlDown,lvlStay,enemyRecalcD
    }

}

