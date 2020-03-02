using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using System;

#if UNITY_EDITOR

// No support for bool for ECS, need to create a workaround support for blittable bool
[Serializable]
public struct Bool {

    private readonly byte _value;
    public Bool(bool value) { _value = (byte)(value ? 1 : 0); }
    public static implicit operator Bool(bool value) { return new Bool(value); }
    public static implicit operator bool(Bool value) { return value._value != 0; }
}

[CustomPropertyDrawer(typeof(Bool))]
class BoolDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        var field = property.FindPropertyRelative("_value");
        field.intValue = EditorGUI.Toggle(position, label, field.intValue != 0) ? 1 : 0;
    }
}
#endif
