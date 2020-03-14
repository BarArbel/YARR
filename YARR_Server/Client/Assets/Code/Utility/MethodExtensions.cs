using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Project.Utility {
    public static class MethodExtensions
    {
        public static float TwoDecimals(this float Value)
        {
            return Mathf.Round(Value * 1000.0f) / 1000.0f;
        }


    }

}