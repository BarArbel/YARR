using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour
{
    private int ID;
    private int Damage;
    private float Speed;
    //public double TurnRate; // TODO: need to think about how using it
    private Transform TargetTransform;
    private double TimeBetweenPathRecalculation;
    private double TimeLeft;
    private double RecalculationsAvailable;
    private Vector3 direction;

    public bool EnemyInit(int id, int damage, float speed, double recalculationsAvailable, double timeBetweenPathRecalculation)
    {
        int amountOfPlayers = GetAmountOfPlayers();
        if (amountOfPlayers > 0)
        {
            ID = (id <= 0) ? Random.Range(1, amountOfPlayers) : id;

            Damage = damage;
            Speed = speed;
            TimeBetweenPathRecalculation = timeBetweenPathRecalculation;
            RecalculationsAvailable = recalculationsAvailable;

            // Find the target
            GameObject playerObj = GetPlayerByID(ID);
            TargetTransform = playerObj.GetComponent<Transform>();

            // Calculate the direction to the player
            direction = (TargetTransform.position - transform.position).normalized;

            // Set the timer
            TimeLeft = TimeBetweenPathRecalculation;
            return true;
        }
        Destroy(gameObject);
        return false;
    }

    public int GetDamage() { return Damage; }
    public int GetAmountOfPlayers() { return GameObject.FindGameObjectsWithTag("Player").Length; }

    public GameObject GetPlayerByID(int ID)

    {
        GameObject[] gameObjects = GameObject.FindGameObjectsWithTag("Player");
        for (int i=0; i<gameObjects.Length; i++)
        {
            if (gameObjects[i].GetComponent<Player>().GetID() == ID)
            {
                return gameObjects[i];
            }
        }
        return null;
    }


    public void Movement()
    {
        // If there are turns left
        if (RecalculationsAvailable != 0)
        {
            TimeLeft -= Time.deltaTime;

            // If it is time to turn
            if (TimeLeft <= 0)
            {
                // Update the direction, turns and reset the turn timer
                // TODO: turn sprite
                direction = (TargetTransform.position - transform.position).normalized;
                RecalculationsAvailable--;
                TimeLeft = TimeBetweenPathRecalculation;
            }
        }

        // Move toward last saved direction
        transform.position += direction * Speed * Time.deltaTime;
    }

    // Start is called before the first frame update
    void Start()
    {

    }

    void OnBecameInvisible()
    {
        if (RecalculationsAvailable == 0)
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
