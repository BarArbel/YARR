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

        IEnumerator LoadGame(JSONObject data)
        {
            asyncLoadLevel = SceneManager.LoadSceneAsync("Game", LoadSceneMode.Single);
            while (!asyncLoadLevel.isDone)
            {
                Debug.Log("Loading the Scene");
                yield return null;
            }
            Debug.Log(data);
            FindObjectOfType<GameManager>().InitExperiment(data);
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
                Debug.Log(E.data["instanceId"].str);
                Debug.Log(InstanceID);
                if (E.data["instanceId"].str == InstanceID)
                {
                    InterruptedInstanceID = E.data["interruptedInstanceId"].str;
                    Debug.Log("Interrupted instanceID: " + InterruptedInstanceID);
                    DataTransformer.SetExperimentID(E.data["experimentID"].str);
                    DataTransformer.SetInterruptedInstanceID(InterruptedInstanceID);
                    DataTransformer.SetIsInterrupted(true); 
                    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationInterruptedCode(true, InterruptedInstanceID);
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

            On("newGameSettings", (E) => {
                if (E.data["instanceId"].str == InstanceID)
                {                    
                    Debug.Log(E);
                    //LoadGame(E.data);
                    DataTransformer.initDDA();
                    SceneManager.LoadScene("Game");
                    //while (FindObjectOfType<GameManager>() == null) { }
                    // TODO: Make this func get called V
                    FindObjectOfType<GameManager>().InitExperiment(E.data);

                }
            });

        }
    }
}
