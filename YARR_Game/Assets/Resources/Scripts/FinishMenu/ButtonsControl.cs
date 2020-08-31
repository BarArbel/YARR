using UnityEngine;
using UnityEngine.SceneManagement;

public class ButtonsControl : MonoBehaviour
{

    public void ExitGame()
    {
        Application.Quit();
    }

    public void MoveToStartMenu()
    {        
        Destroy(GameObject.Find("[Network Container]"));
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
