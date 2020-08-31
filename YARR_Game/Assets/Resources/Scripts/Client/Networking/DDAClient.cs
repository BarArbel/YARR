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

            On("connectionConfirmed", (E) => {
                DataTransformer.getInitSettings();
            });

            On("setInstanceID", (E) => {
                InstanceID = E.data["instanceId"].str;
            });


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
