using Project.Networking;
using SocketIO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SendCompetitiveData
{
    private Competitive compData = new Competitive();
    private SocketIOComponent socket;

    public SendCompetitiveData(int id, SocketIOComponent Socket)
    {
        compData.Player = id;
        socket = Socket;
    }

    public void sendPickups(string pickup)
    {
        compData.Pickups = pickup;
        socket.Emit("competitive", new JSONObject(JsonUtility.ToJson(compData)));
    }

    public void sendDropItemScore()
    {
        compData.DropItemScore = 1;
        socket.Emit("competitive", new JSONObject(JsonUtility.ToJson(compData)));
    }
    public void sendGetDamaged()
    {
        compData.GetDamaged = 1;
        socket.Emit("competitive", new JSONObject(JsonUtility.ToJson(compData)));
    }
    public void sendFailPickup()
    {
        compData.FailPickup = 1;
        socket.Emit("competitive", new JSONObject(JsonUtility.ToJson(compData)));
    }

    public void sendIndividualLoss()
    {
        compData.IndividualLoss = 1;
        socket.Emit("competitive", new JSONObject(JsonUtility.ToJson(compData)));
    }

    public void sendItemSpawn()
    {
        compData.ItemSpawn = 1;
        socket.Emit("competitive", new JSONObject(JsonUtility.ToJson(compData)));
    }
    public void sendEnemySpawn()
    {
        compData.EnemySpawn = 1;
        socket.Emit("competitive", new JSONObject(JsonUtility.ToJson(compData)));
    }




    
}
