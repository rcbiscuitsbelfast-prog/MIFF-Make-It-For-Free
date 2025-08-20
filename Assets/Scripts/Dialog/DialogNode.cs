using UnityEngine;

namespace NewBark.DialogTrees
{
    [System.Serializable]
    public class DialogNode
    {
        public string nodeID;
        [TextArea(2, 6)] public string text;
        public DialogChoice[] choices;
        public DialogEffect[] effects;
    }

    [System.Serializable]
    public class DialogChoice
    {
        public string choiceText;
        public string nextNodeID;
        public ConditionType condition;
        public string conditionFlagID;
    }

    [System.Serializable]
    public class DialogEffect
    {
        public EffectType effectType;
        public string targetID;
        public int amount;
    }

    public enum ConditionType
    {
        None,
        FlagTrue,
        FlagFalse
    }

    public enum EffectType
    {
        None,
        StartQuest,
        CompleteObjective,
        GiveItem,
        SetFlag
    }
}

