using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Item : MonoBehaviour
{
    private int ID;
    public bool IsPickedUp;
    double DestroyTimer;

    public int GetID() { return ID; }

    virtual public void SetPickedUp(bool isPickedUp)
    {
        IsPickedUp = isPickedUp;
    }

    /*public bool FallToSink()
    {
        if ()
    }*/

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
