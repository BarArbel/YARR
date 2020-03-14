using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using System;
using Project.Player;
using Project.Scriptable;

namespace Project.Networking
{
    public class NetworkClient : SocketIOComponent
    {
        [Header("Network Client")]
        [SerializeField]
        private Transform networkContainer;
        [SerializeField]
        private GameObject playerPrefab;
        [SerializeField]
        private SeverObjects serverSpawnables;

        public static string ClientID { get; private set; }

        private Dictionary<string, NetworkIdentity> serverObjects;

        public override void Start()
        {
            base.Start();
            initialize();
            setupEvents();
        }

        public override void Update()
        {
            base.Update();
        }

        private void initialize()
        {
            serverObjects = new Dictionary<string, NetworkIdentity>();
        }

        private void setupEvents()
        {
            On("open", (E) => {
                Debug.Log("Connection Made To The Server");
            });

            On("register", (E) => {
                ClientID = E.data["id"].ToString().Trim('"');
                
                Debug.LogFormat("Our client's ID ({0})", ClientID);
            });

            On("spawn", (E) => {
                //Handling all spawning all players
                //Passed Data
                string id = E.data["id"].ToString().Trim('"');

                GameObject go = Instantiate(playerPrefab, networkContainer);
                go.name = string.Format("Player ({0})", id);
                NetworkIdentity ni = go.GetComponent<NetworkIdentity>();
                ni.SetControllerID(id);
                ni.SetSocketReference(this);
                serverObjects.Add(id, ni);
            });

            On("disconected", (E) => {
                string id = E.data["id"].ToString().Trim('"');

                GameObject go = serverObjects[id].gameObject;
                Destroy(go); //Remove from game
                serverObjects.Remove(id); //Remove from memory
                Debug.Log("disconected");
            });

            On("updatePosition", (E) => {
                string id = E.data["id"].ToString().Trim('"');
                float x = E.data["position"]["x"].f;
                float y = E.data["position"]["y"].f;

                NetworkIdentity ni = serverObjects[id];
                ni.transform.position = new Vector3(x, y, 0);
            });

            On("updateRotation", (E) => {
                string id = E.data["id"].ToString().Trim('"');
                float tankRotation = E.data["tankRotation"].f;
                float barrelRotation = E.data["barrelRotation"].f;

                NetworkIdentity ni = serverObjects[id];
                ni.transform.localEulerAngles = new Vector3(0, 0, tankRotation);
                ni.GetComponent<PlayerManager>().SetRotation(barrelRotation);
            });

            On("serverSpawn", (E) => {
                string name = E.data["name"].str;
                string id = E.data["id"].ToString().Trim('"');
                float x = E.data["position"]["x"].f;
                float y = E.data["position"]["y"].f;
                Debug.LogFormat("Server wants us to spawn a '{0}", name);

                if (!serverObjects.ContainsKey(id))
                {
                    ServerObjectData sod = serverSpawnables.GetObjectByName(name);
                    var spwanedObject = Instantiate(sod.Prefab, networkContainer);
                    spwanedObject.transform.position = new Vector3(x, y, 0);
                    var ni = spwanedObject.GetComponent<NetworkIdentity>();
                    ni.SetControllerID(id);
                    ni.SetSocketReference(this);

                    //If bullet applay direction as well
                    if(name == "Bullet")
                    {
                        float directionX = E.data["direction"]["x"].f;
                        float directionY = E.data["direction"]["y"].f;

                        float rot = Mathf.Atan2(directionY, directionX) * Mathf.Rad2Deg;
                        Vector3 currentRotation = new Vector3(0, 0, rot - 90);
                        spwanedObject.transform.rotation = Quaternion.Euler(currentRotation);
                    }

                    serverObjects.Add(id, ni);
                }

            });

            On("serverUnspawn", (E) => {
                string id = E.data["id"].ToString().Trim('"');
                NetworkIdentity ni = serverObjects[id];
                serverObjects.Remove(id);
                DestroyImmediate(ni.gameObject);
            });

        }
    }

    [Serializable]
    public class Player
    {
        public string id;
        public Position position;

    }

    [Serializable]
    public class Position
    {
        public float x;
        public float y;
    }

    [Serializable]
    public class PlayerRotation
    {
        public float tankRotation;
        public float barrelRotation;
    }

    [Serializable]
    public class BulletData
    {
        public string id;
        public Position position;
        public Position direction;
    }

}
