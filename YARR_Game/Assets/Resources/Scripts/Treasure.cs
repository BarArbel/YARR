using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Project.Networking;
using Event = Project.Networking.Event;

public class Treasure : Item
{
    private bool DestroyCancelled = false;
    private GameObject Carrier;

    public int GetCarrierID()
    {
        if (Carrier == null)
        {
            return -1;
        }
        return Carrier.GetComponent<Player>().GetID();
    } 

    public int GetGameMode() { return GetID() == -1 ? 1 : 0; }

    virtual public void SetPickedUp(GameObject carrier)
    {
        if (IsPickedUp == false)
        {
            IsPickedUp = true;
            Carrier = carrier;
            transform.localScale *= 0.5f;
           
        }
    }

    override public void SetDisown()
    {
        if (IsPickedUp == true)
        {
            IsPickedUp = false;
            Carrier = null;
            transform.localScale /= 0.5f;
        }
    }

    private void SetDestroy()
    {
        int playerID = GetID() == -1 ? 0 : GetID();
        Destroy(gameObject);
        DataTransformer.sendData(Time.deltaTime, Event.failPickup, playerID, transform.position.x, transform.position.y, GetID(), 0, GetGameMode());
    }

    public void TreasureInit(int id, float destroyTimer)
    {
        int playerID = GetID() == -1 ? 0 : GetID();
        ID = id;
        DestroyTimer = destroyTimer;
        IsPickedUp = false;
        Carrier = null;

        if (DestroyTimer != -1)
        {
            Invoke("SetDestroy", DestroyTimer);
        }

        DataTransformer.sendData(Time.deltaTime, Event.spawn, playerID, transform.position.x, transform.position.y, 0, GetID(), GetGameMode());
    }

    void Update()
    {
        if (!DestroyCancelled && IsPickedUp)
        {
            CancelInvoke();
            DestroyCancelled = true;
        }
    }
}
