using UnityEngine;
using SocketIO;
using UnityEngine.SceneManagement;

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

            On("setInstanceID", (E) => {
                InstanceID = E.data["instanceId"].str;
            });

            On("disconected", (E) => {
                Debug.Log("disconected");
            });

            /*On("ExperimentID", (E) => {
                Debug.Log("My table number is: " + E.data);
                DataTransformer.createTables();
            });*/

            On("LevelSettings", (E) => {
                if (E.data["instanceId"].str == InstanceID)
                {
                    FindObjectOfType<GameManager>().NotificationDDAUpdate(E.data["LvSettings"]);
                }
            });

            On("errorMenu", (E) => {
                SceneManager.LoadScene("ErrorMenu");
            });

        }
    }
}
