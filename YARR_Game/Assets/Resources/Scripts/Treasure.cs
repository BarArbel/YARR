using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Treasure : Item
{
    private int ID;
    private GameObject Carrier;


    virtual public void SetPickedUp(bool isPickedUp, GameObject carrier)
    {
        if (isPickedUp == true)
        {
            IsPickedUp = isPickedUp;
            this.Carrier = carrier;
            transform.localScale *= 0.5f;
        }
    }

    public void TreasureInit(int id)
    {
        // TODO
        ID = 1;
    }

    void Update()
    {
        // TODO
        //FollowOwner();
    }
}
