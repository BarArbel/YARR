using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Text.RegularExpressions;
using Project.Networking;

public class CodeValidator : MonoBehaviour
{
    private string currInputValue;
    private string prevInputValue;
    private readonly int codeLen = 6;
    private readonly Color wrongValueColor = new Color(1f, 0.6470588f, 0.6666667f, 1f);
    private readonly Color correctValueColor = new Color(0.5312541f, 1f, 0.4539427f, 1f);

    // Allow only alphanumeric in string
    Regex rgx = new Regex("[^a-zA-Z0-9]");

    bool ValidateText()
    {
        string code = rgx.Replace(currInputValue, "");
        if (code.Length != codeLen)
        {
            // Indicate wrong  game code
            //gameObject.GetComponent<TMP_InputField>().transition = wrongValueColor;
            Debug.Log(gameObject.GetComponent<Image>().color);
            gameObject.GetComponent<Image>().color = wrongValueColor;
            Debug.Log(code);
            Debug.Log(gameObject.GetComponent<Image>().color);
            return false;
        }

        DataTransformer.codeInput(code);
        return true;
    }

    public void NotificationCorrectText()
    {
        gameObject.GetComponent<Image>().color = correctValueColor;
    }

    // Start is called before the first frame update
    void Start()
    {
        prevInputValue = gameObject.GetComponent<TMP_InputField>().text;        

    }

    // Update is called once per frame
    void Update()
    {
        currInputValue = gameObject.GetComponent<TMP_InputField>().text;
        if (prevInputValue != currInputValue && currInputValue.Length == codeLen)
        {
            prevInputValue = currInputValue;
            ValidateText();
            
        }
    }
}
