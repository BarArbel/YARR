using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Project.Networking;
using Event = Project.Networking.Event;

public class Powerup : Item
{
    enum type { NewBoat, RainbowFruit };

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
            //transform.localScale *= 0.5f;

        }
    }

    //override public void SetDisown()
    //{
    //    if (IsPickedUp == true)
    //    {
    //        IsPickedUp = false;
    //        Carrier = null;
    //        transform.localScale /= 0.5f;
    //    }
    //}

    private void SetDestroy()
    {
        int playerID = GetID() == -1 ? 0 : GetID();
        Destroy(gameObject);
        DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.powerupMissed, playerID, transform.position.x, transform.position.y, GetID(), 0, GetGameMode());
    }

    public void PowerupInit(int id, float destroyTimer)
    {
        ID = id;
        DestroyTimer = destroyTimer;
        IsPickedUp = false;
        Carrier = null;

        if (DestroyTimer != -1)
        {
            Invoke("SetDestroy", DestroyTimer);
        }

        DataTransformer.sendDDA(Time.realtimeSinceStartup, Event.powerupSpawn, 0, transform.position.x, transform.position.y, GetID(), 0, GetGameMode());
    }

    //private void OnTriggerEnter2D(Collider2D collision)
    //{
    //    CancelInvoke();
    //    Destroy(this.gameObject);
    //}

    void Update()
    {
        if (!DestroyCancelled && IsPickedUp)
        {
            CancelInvoke();
            DestroyCancelled = true;
        }
    }
}
