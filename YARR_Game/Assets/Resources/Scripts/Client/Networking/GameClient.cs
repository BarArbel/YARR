using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using System;

namespace Project.Networking
{
    public class GameClient : SocketIOComponent
    {
        string InstanceID;
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
            On("instanceId", (E) => {
                InstanceID = E.data["id"].str;
                Debug.Log("My table number is: " + InstanceID);
                DataTransformer.createTables();
            });

            On("disconected", (E) => {

                Debug.Log("disconected");

            });

            On("open", (E) => {

                Debug.Log("Connection Made To The Server");

            });

            On("newCorrect", (E) => {
                Debug.Log("Correct");
                if (E.data["instanceId"].str == InstanceID)
                {                  
                    Debug.Log(E.data["instanceID"]);
                    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationCode(true);
                }               
            });

            On("wrongCode", (E) => {
                Debug.Log("Incorrect");
                if (E.data["instanceId"].str == InstanceID)
                {
                    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationCode(false);
                }
            });

            On("interruptedCorrect", (E) => {
                Debug.Log("Correct");
                if (E.data["instanceId"].str == InstanceID)
                {
                    Debug.Log(E.data["instanceID"]);
                    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationInterruptedCode(true);
                }
            });

            // This piece of code is a curse. Don't awaken the spirit of the abyss please.
            //On("correctCode", (E) => {
            //    //if (E.data == InstanceID)
            //    Debug.Log("fuck");
            //    /*Debug.Log("What's going on" + E);
            //    Debug.Log(E.data["instanceID"]);
            //    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationCorrectText();*/
            //});

            On("startExperiment", (E) => {

                FindObjectOfType<GameManager>().InitExperiment(E.data);
            });

        }
    }
}
