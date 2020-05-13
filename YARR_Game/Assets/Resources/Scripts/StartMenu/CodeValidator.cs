using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Text.RegularExpressions;
using Project.Networking;

public class CodeValidator : MonoBehaviour
{
    private GameObject button;

    private string currInputValue;
    private string prevInputValue;
    private readonly int codeLen = 6;
    private readonly Color wrongValueColor = new Color(1f, 0.6470588f, 0.6666667f, 1f);
    private readonly Color correctValueColor = new Color(0.5312541f, 1f, 0.4539427f, 1f);
    private bool isNewCorrect;
    private bool isInterruptedCorrect;

    // Allow only alphanumeric in string
    Regex rgx = new Regex("[^a-zA-Z0-9]");

    bool ValidateText()
    {
        string code = rgx.Replace(currInputValue, "");
        if (code.Length != codeLen)
        {
            // Indicate wrong  game code
            Debug.Log(gameObject.GetComponent<Image>().color);
            gameObject.GetComponent<Image>().color = wrongValueColor;
            isNewCorrect = false;
            isInterruptedCorrect = false;
            button.GetComponent<Button>().interactable = false;
            return false;
        }

        DataTransformer.codeInput(code);
        return true;
    }

    // New game
    public void NotificationCode(bool isCorrectCode)
    {
        if (isCorrectCode)
        {
            gameObject.GetComponent<Image>().color = correctValueColor;
            isNewCorrect = true;
            isInterruptedCorrect = false;
            button.GetComponent<Button>().interactable = true;
        }
        else
        {
            gameObject.GetComponent<Image>().color = wrongValueColor;
            isNewCorrect = false;
            isInterruptedCorrect = false;
            button.GetComponent<Button>().interactable = false;
        }

    }

    // Interrupted game
    public void NotificationInterruptedCode(bool isCorrectCode, string interruptedInstanceID)
    {
        if (isCorrectCode)
        {
            gameObject.GetComponent<Image>().color = correctValueColor;
            isInterruptedCorrect = true;
            isNewCorrect = false;
            button.GetComponent<Button>().interactable = true;
        }

    }

    public void InstantiateGameScene()
    {
        if (isNewCorrect)
        {
            DataTransformer.getInitSettings();
            //InitExperiment(JSONObject rSettings);
        }
        
        if (isInterruptedCorrect)
        {
            //ContinueExperiment(JSONObject rSettings);
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        prevInputValue = gameObject.GetComponent<TMP_InputField>().text;        
        isNewCorrect = false;
        isInterruptedCorrect = false;

        button = FindObjectOfType<Button>().gameObject;
        button.GetComponent<Button>().interactable = false;
    }

    // Update is called once per frame
    void Update()
    {
        currInputValue = gameObject.GetComponent<TMP_InputField>().text;
        if (prevInputValue != currInputValue)
        {
            prevInputValue = currInputValue;
            ValidateText();
            
        }
    }
}
