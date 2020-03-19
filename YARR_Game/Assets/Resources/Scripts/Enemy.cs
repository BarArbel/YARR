using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour
{
    private int ID;
    private int Damage;
    private float Speed;
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
            setDirection();

            // Set the timer
            TimeLeft = TimeBetweenPathRecalculation;
            return true;
        }
        Destroy(gameObject);
        return false;
    }

    public int GetDamage() { return Damage; }
    public int GetID() { return ID; }
    public int GetAmountOfPlayers() { return GameObject.FindGameObjectsWithTag("Player").Length; }

    public GameObject GetPlayerByID(int ID)
    {
        GameObject[] gameObjects = GameObject.FindGameObjectsWithTag("Player");
        for (int i = 0; i < gameObjects.Length; i++)
        {
            if (gameObjects[i].GetComponent<Player>().GetID() == ID)
            {
                return gameObjects[i];
            }
        }
        return null;
    }

    private void setDirection()
    {
        direction = (TargetTransform.position - transform.position).normalized;
        if (direction.x < 0)
        {
            transform.localScale = new Vector3(Mathf.Abs(transform.localScale.x) * -1.0f, transform.localScale.y, transform.localScale.z);
        }
        else if (direction.x > 0)
        {
            transform.localScale = new Vector3(Mathf.Abs(transform.localScale.x), transform.localScale.y, transform.localScale.z);
        }
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
                setDirection();
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