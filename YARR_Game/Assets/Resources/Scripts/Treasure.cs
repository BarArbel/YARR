using System.Collections;
using System.Collections.Generic;
using UnityEngine;

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
        Destroy(gameObject);
    }

    public void TreasureInit(int id, float destroyTimer)
    {
        ID = id;
        DestroyTimer = destroyTimer;
        IsPickedUp = false;
        Carrier = null;

        if (DestroyTimer != -1)
        {
            Invoke("SetDestroy", DestroyTimer);
        }
        
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
