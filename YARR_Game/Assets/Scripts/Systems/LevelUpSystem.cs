using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Entities;

public class LevelUpSystem : ComponentSystem
{
    protected override void OnUpdate()
    {
        //For every entity change the levelComponent
        ForEach((ref ModeComponent modeComponent) => {
            modeComponent.mode += 1f * Time.deltaTime;
            Debug.Log(modeComponent.mode);
        });
    }
}
