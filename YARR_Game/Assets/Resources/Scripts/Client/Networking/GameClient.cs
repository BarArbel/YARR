using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using System;
using UnityEngine.SceneManagement;
namespace Project.Networking
{
    public class GameClient : SocketIOComponent
    {
        string InstanceID;
        string InterruptedInstanceID;
        AsyncOperation asyncLoadLevel;

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
            On("instanceId", (E) => {
                InstanceID = E.data["id"].str;
                DataTransformer.SetInstanceID(InstanceID);
                Debug.Log("My table number is: " + InstanceID);
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
                    DataTransformer.SetExperimentID(E.data["experimentID"].n.ToString());
                    DataTransformer.SetIsInterrupted(false);
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
                    InterruptedInstanceID = E.data["interruptedInstanceId"].str;
                    Debug.Log("Interrupted instanceID: " + InterruptedInstanceID);
                    Debug.Log("Experiment ID:" + E.data["experimentID"].str);
                    DataTransformer.SetExperimentID(E.data["experimentID"].str);
                    DataTransformer.SetInterruptedInstanceID(InterruptedInstanceID);
                    DataTransformer.SetIsInterrupted(true); 
                    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationInterruptedCode(true, InterruptedInstanceID);
                }
            });

            On("newGameScene", (E) => {
                if (E.data["instanceId"].str == InstanceID)
                {
                    Debug.Log(E);
                    DataTransformer.initDDA();
                    SceneManager.LoadScene("Game");
                    DataTransformer.SyncNewScene(E.data);

                }
            });

            On("interrGameScene", (E) => {
                if (E.data["instanceId"].str == InterruptedInstanceID)
                {
                    Debug.Log(E);
                    DataTransformer.initDDA();
                    SceneManager.LoadScene("Game");
                    DataTransformer.SyncInterruptedScene(E.data);

                }
            });

            On("newGameSettings", (E) => {
                if (E.data["instanceId"].str == InstanceID)
                {
                    FindObjectOfType<GameManager>().InitExperiment(E.data);
                }
            });

            On("interrGameSettings", (E) => {
                if (E.data["instanceId"].str == InterruptedInstanceID)
                {
                    FindObjectOfType<GameManager>().InitInterrExperiment(E.data);

                }
            });

            On("errorMenu", (E) => {
                SceneManager.LoadScene("Game");
            });

        }
    }
}
