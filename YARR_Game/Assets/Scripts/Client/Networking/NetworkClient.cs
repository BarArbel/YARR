using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using System;

namespace Project.Networking
{
    public class NetworkClient : SocketIOComponent
    {
        public override void Start()
        {
            base.Start();
            setupEvents();
        }

        public override void Update()
        {
            base.Update();
        }

        private void setupEvents()
        {
            On("open", (E) => {
                Debug.Log("Connection Made To The Server");
                Debug.Log("what is " + this);
            });

            On("disconected", (E) => {
                //string id = E.data["id"].ToString().Trim('"');
                //Destroy(go); //Remove from game
                //serverObjects.Remove(id); //Remove from memory
                Debug.Log("disconected");
            });

        }
    }

    [Serializable]
    public class Cooperative
    {
        public int IdCoop;
        public string TimeStamp;
        public int Player;
        public string Pickups;
        public int GiveItemToPlayer;
        public int RevivePlayer;
        public int TemporaryLose;
        public int Revived;
        public int Lose;
        public int DropItemScore;
        public int GetDamaged;
        public int FailPickup;
        public int BlockDamage;
        public int ItemSpawn;
        public int EnemySpawn;
    }

}
