﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Project.Utility.Attributes;
using SocketIO;

namespace Project.Networking {
    public class NetworkIdentity : MonoBehaviour {

        [Header("Helpful Values")]
        [SerializeField]
        [GreyOut]
        private string id;
        [SerializeField]
        [GreyOut]
        private bool isControlling;

        private SocketIOComponent socket;

        public void AWake()
        {
            isControlling = false;
        }

        // Update is called once per frame
        public void SetControllerID (string ID)
        {
            id = ID;
            isControlling = (NetworkClient.ClientID == ID) ? true : false; //Check incoming id versues the one we have saved from the server
        }

        public void SetSocketReference(SocketIOComponent Socket)
        {
            socket = Socket;
        }

        public string GetID()
        {
            return id;
        }

        public bool IsControlling()
        {
            return isControlling;
        }

        public SocketIOComponent GetSocket()
        {
            return socket;
        }


    }
}
