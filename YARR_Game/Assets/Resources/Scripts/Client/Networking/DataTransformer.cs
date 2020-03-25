﻿using Project.Networking;
using SocketIO;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Project.Networking
{
    public static class DataTransformer
    {
        static SocketIOComponent socket = GameObject.Find("[Network Container]").GetComponent<NetworkClient>();
        static DataGameSnapShot data = new DataGameSnapShot();
         
        
        public static void sendData(float time,Event eventOccurred, Player player,int item,int enemy,int gameMode)
        {
            data.Time = time;
            data.Event = eventOccurred;
            data.PlayerID = player.GetID();
            data.CoordX = (int)(player.transform.position.x * 1000)/1000;
            data.CoordY = (int)(player.transform.position.x * 1000)/1000;
            data.Item = item;
            data.Enemy = enemy;
            data.GameMode = gameMode;

            socket.Emit("gameSnapshot", new JSONObject(JsonUtility.ToJson(data)));
        }

        public static void sendData(float time, Event eventOccurred, int PlayerID, float CoordX, float CoordY, int item, int enemy, int gameMode)
        {
            data.Time = time;
            data.Event = eventOccurred;
            data.PlayerID = PlayerID;
            data.CoordX = (CoordX * 1000) / 1000;
            data.CoordY = (CoordX * 1000) / 1000;
            data.Item = item;
            data.Enemy = enemy;
            data.GameMode = gameMode;

            socket.Emit("gameSnapshot", new JSONObject(JsonUtility.ToJson(data)));
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
        public int GameMode;
    }

    public enum Event
    {
        pickup,giveItem,revivePlayer,temporaryLose,revived,lose,dropitem,getDamaged,blockDamage,failPickup,fallAccidently,individualLoss,spawn
    }

}

