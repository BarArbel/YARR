using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Project.Networking;
using System;
using SocketIO;

public class SendCooperativeData
{
    private Cooperative coopData = new Cooperative();
    private SocketIOComponent socket;

    public SendCooperativeData(int id,SocketIOComponent Socket)
    {
        coopData.Player = id;
        socket = Socket;
    }


    public void sendPickups(string pickup)
    {
        coopData.Pickups = pickup;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }

    public void sendGiveItemToPlayer()
    {
        Debug.Log("I'm sending " + coopData.Player);
        coopData.GiveItemToPlayer = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }

    public void sendRevivePlayer()
    {
        coopData.RevivePlayer = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }

    public void sendTemporaryLose()
    {
        coopData.TemporaryLose = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }

    public void sendRevived()
    {
        coopData.Revived = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendLose()
    {
        coopData.Lose = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendDropItemScore()
    {
        coopData.DropItemScore = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendGetDamaged()
    {
        coopData.GetDamaged = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendFailPickup()
    {
        coopData.FailPickup = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendBlockDamage()
    {
        coopData.BlockDamage = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendItemSpawn()
    {
        coopData.ItemSpawn = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendEnemySpawn()
    {
        coopData.EnemySpawn = 1;
        socket.Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }


}