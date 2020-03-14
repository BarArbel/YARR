using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour
{
    public int Damage;
    public int Speed;
    public double TurnRate; // TODO: need to think about how using it
    private Transform TargetTransform;
    public double TimeToTurn;
    private double TimeLeftToTurn;
    public double TurnsLeft;
    private Vector3 direction;

    public int GetDamage() { return Damage; }

    public void Movement()
    {
        // If there are turns left
        if (TurnsLeft != 0)
        {
            TimeLeftToTurn -= Time.deltaTime;

            // If it is time to turn
            if (TimeLeftToTurn <= 0)
            {
                // Update the direction, turns and reset the turn timer
                direction = (TargetTransform.position - transform.position).normalized;
                TurnsLeft--;
                TimeLeftToTurn = TimeToTurn;
            }
        }

        // Move toward last saved direction
        transform.position += direction * Speed * Time.deltaTime;
    }


    // Start is called before the first frame update
    void Start()
    {
        // Obtain a random player as target
        GameObject[] gameObjects = GameObject.FindGameObjectsWithTag("Player");
        int index = UnityEngine.Random.Range(0, gameObjects.Length);
        TargetTransform = gameObjects[index].GetComponent<Transform>();

        // Calculate the direction to that player
        direction = (TargetTransform.position - transform.position).normalized;

        // Set the timer
        TimeLeftToTurn = TimeToTurn;
    }

    void OnBecameInvisible()
    {
        if (TurnsLeft == 0)
        {
            // If out of screen + no turns left, we can destroy it
            Destroy(gameObject);
        }
    }

    // Update is called once per frame
    void Update()
    {
        Movement();
    }
}
