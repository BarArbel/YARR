using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Treasure : Item
{
    private GameObject OwnerObject;


    virtual public void SetPickedUp(bool isPickedUp, GameObject OwnerObject)
    {
        if (isPickedUp == true)
        {
            IsPickedUp = isPickedUp;
            this.OwnerObject = OwnerObject;
            transform.localScale *= 0.5f;
        }
    }

    /*private void FollowOwner()
    {
        if (IsPickedUp)
        {
            if (isForOthers) // TODO: It doesn't matter if it's own or not. the order of treasures should be determined by picking order
            {
                transform.position = new Vector3(OwnerObject.transform.position.x, OwnerObject.transform.position.y + 0.5f, 0);
            }
            else
            {
                transform.position = new Vector3(OwnerObject.transform.position.x, OwnerObject.transform.position.y, 0);
            }
        }
        
    }*/

    void Update()
    {
        // TODO
        //FollowOwner();
    }
}
