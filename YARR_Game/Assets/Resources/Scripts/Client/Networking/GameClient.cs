using UnityEngine;
using SocketIO;
using UnityEngine.SceneManagement;
namespace Project.Networking
{
    public class GameClient : SocketIOComponent
    {
        private string InstanceID;
        private string InterruptedInstanceID;
        private AsyncOperation asyncLoadLevel;

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
            });


            On("newCorrect", (E) => {
                if (E.data["instanceId"].str == InstanceID)
                {                  
                    DataTransformer.SetExperimentID(E.data["experimentID"].n.ToString());
                    DataTransformer.SetIsInterrupted(false);
                    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationCode(true);
                }               
            });

            On("wrongCode", (E) => {
                if (E.data["instanceId"].str == InstanceID)
                {
                    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationCode(false);
                }
            });

            On("interruptedCorrect", (E) => {
                if (E.data["instanceId"].str == InstanceID)
                {
                    InterruptedInstanceID = E.data["interruptedInstanceId"].str;
                    DataTransformer.SetExperimentID(E.data["experimentID"].str);
                    DataTransformer.SetInterruptedInstanceID(InterruptedInstanceID);
                    DataTransformer.SetIsInterrupted(true); 
                    GameObject.Find("CodeInputField").GetComponent<CodeValidator>().NotificationInterruptedCode(true, InterruptedInstanceID);
                }
            });

            On("newGameScene", (E) => {
                if (E.data["instanceId"].str == InstanceID)
                {
                    DataTransformer.initDDA();
                    SceneManager.LoadScene("Game");
                    DataTransformer.SyncNewScene(E.data);

                }
            });

            On("interrGameScene", (E) => {
                if (E.data["instanceId"].str == InterruptedInstanceID)
                {
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
                SceneManager.LoadScene("ErrorMenu");
            });

        }
    }
}
