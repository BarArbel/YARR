using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;
using System.Text.RegularExpressions;
using Project.Networking;

public class ButtonsControl : MonoBehaviour
{

    public void ExitGame()
    {
        Application.Quit();
    }

    public void MoveToStartMenu()
    {
        SceneManager.LoadScene("StartMenu");
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
