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

    virtual public void SetPickedUp(bool isPickedUp)
    {
        IsPickedUp = isPickedUp;
    }

    public bool FallToSink()
    {
        Destroy(gameObject);
        return true;
    }

    public void DestroyBlink()
    {
        // TODO
    }

    // Start is called before the first frame update
    void Start()
    {
        // TODO
    }

    // Update is called once per frame
    void Update()
    {
        // TODO
    }
}
