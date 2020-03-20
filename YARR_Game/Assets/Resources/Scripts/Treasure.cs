using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Treasure : Item
{
    private GameObject Carrier;

    virtual public void SetPickedUp(bool isPickedUp, GameObject carrier)
    {
        if (isPickedUp == true && IsPickedUp == false)
        {
            IsPickedUp = isPickedUp;
            Carrier = carrier;
            transform.localScale *= 0.5f;
        }
    }

    public void TreasureInit(int id, float destroyTimer)
    {
        ID = id;
        DestroyTimer = destroyTimer;
        IsPickedUp = false;
    }

    void Update()
    {
        // TODO
        //FollowOwner();
    }
}
