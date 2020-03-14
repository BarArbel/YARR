using System.Collections;
using System.Collections.Generic;
using UnityEngine;


namespace Project.Utility
{
    public class Cooldown
    {
        private float length;
        private float currentTime;
        private bool onCooldown;

        public Cooldown(float Legth = 1, bool startWithCooldown = false)
        {
            currentTime = 0;
            length = Legth;
            onCooldown = startWithCooldown;
        }


        public void CooldownUpdate()
        {
            if (onCooldown)
            {
                currentTime += Time.deltaTime;

                if(currentTime >= length)
                {
                    currentTime = 0;
                    onCooldown = false;
                }
            }
        }


        public bool IsOnCooldown()
        {
            return onCooldown;
        }

        public void StartCooldown()
        {
            onCooldown = true;
            currentTime = 0;
        }
    }
}

