using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Item : MonoBehaviour
{
    protected int ID;
    protected bool IsPickedUp;
    protected float DestroyTimer;

    public int  GetID()         { return ID; }
    public bool GetIsPickedUp() { return IsPickedUp; }

    virtual public void SetPickedUp()
    {
        IsPickedUp = true;
    }

    virtual public void SetDisown()
    {
        IsPickedUp = false;
    }

    public bool FallToSink()
    {
        Destroy(gameObject);
        return true;
    }


    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }
}
