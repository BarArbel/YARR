using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using System;

namespace Project.Networking
{
    public class DDAClient : SocketIOComponent
    {
        string InstanceID;

        public override void Start()
        {
            base.Start();
            DontDestroyOnLoad(gameObject);
            setupEvents();
        }

        public override void Update()
        {
            base.Update();
        }

        private void setupEvents()
        {
            On("open", (E) => {
                //Debug.Log("Connection Made To The Server");
                Debug.Log("what is " + this);
            });

            On("connectionConfirmed", (E) => {
                DataTransformer.getInitSettings();
            });

            On("disconected", (E) => {
                Debug.Log("disconected");
            });

            /*On("ExperimentID", (E) => {
                Debug.Log("My table number is: " + E.data);
                DataTransformer.createTables();
            });*/

            On("LevelSettings", (E) => {
                FindObjectOfType<GameManager>().NotificationDDAUpdate(E.data);
            });

        }
    }
}
