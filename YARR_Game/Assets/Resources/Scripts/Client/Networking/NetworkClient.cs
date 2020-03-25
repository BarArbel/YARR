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
                Debug.Log("disconected");
            });

        }
    }

    [Serializable]
    public class Cooperative
    {
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

    [Serializable]
    public class Competitive
    {
        public string TimeStamp;
        public int Player;
        public string Pickups;
        public int DropItemScore;
        public int FailPickup;
        public int GetDamaged;
        public int IndividualLoss;
        public int ItemSpawn;
        public int EnemySpawn;
    }
}
