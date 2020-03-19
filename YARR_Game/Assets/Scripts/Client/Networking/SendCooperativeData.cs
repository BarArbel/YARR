using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Project.Networking;


public class SendCooperativeData : MonoBehaviour
{
    private static Cooperative coopData;
    private static Player player;
    private void Start()
    {
        player = gameObject.GetComponent<Player>();
        coopData = new Cooperative();
    }

    private void sendPickups(string pickup)
    {
        coopData.Player = player.GetID();
        coopData.Pickups = pickup;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }

    public void sendGiveItemToPlayer()
    {
        coopData.Player = player.GetID();
        coopData.GiveItemToPlayer = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }

    public void sendRevivePlayer()
    {
        coopData.Player = player.GetID();
        coopData.RevivePlayer = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }

    public void sendTemporaryLose()
    {
        coopData.Player = player.GetID();
        coopData.TemporaryLose = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }

    public void sendRevived()
    {
        coopData.Player = player.GetID();
        coopData.Revived = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendLose()
    {
        coopData.Player = player.GetID();
        coopData.Lose = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendDropItemScore()
    {
        coopData.Player = player.GetID();
        coopData.DropItemScore = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendGetDamaged()
    {
        coopData.Player = player.GetID();
        coopData.GetDamaged = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendFailPickup()
    {
        coopData.Player = player.GetID();
        coopData.FailPickup = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendBlockDamage()
    {
        coopData.Player = player.GetID();
        coopData.BlockDamage = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendItemSpawn()
    {
        coopData.Player = player.GetID();
        coopData.ItemSpawn = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
    public void sendEnemySpawn()
    {
        coopData.Player = player.GetID();
        coopData.EnemySpawn = 1;
        player.GetSocket().Emit("cooperative", new JSONObject(JsonUtility.ToJson(coopData)));
    }
}