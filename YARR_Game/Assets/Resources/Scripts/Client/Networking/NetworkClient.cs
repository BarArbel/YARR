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

            On("ExperimentID", (E) => {
                Debug.Log("My table number is: " + E.data);
                DataTransformer.createTable();
            });

        }
    }
}
