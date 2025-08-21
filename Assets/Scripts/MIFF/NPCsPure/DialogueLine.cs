using System;
using System.Collections.Generic;

namespace MIFF.NPCsPure
{
    /// <summary>
    /// A single line of dialogue with optional choices and conditions.
    /// </summary>
    [Serializable]
    public class DialogueLine
    {
        public string speaker;
        public string text;
        public string choiceID; // identifier for branching
        public List<DialogueChoice> choices = new List<DialogueChoice>();

        // Optional metadata
        public string voiceID;
        public string emotion;
        public List<string> loreTags = new List<string>();
        public List<FlagCondition> conditions = new List<FlagCondition>();
    }

    [Serializable]
    public class DialogueChoice
    {
        public string text;
        public string leadsToChoiceID; // next branch id
        public List<FlagCondition> conditions = new List<FlagCondition>();
        public List<string> setFlags = new List<string>(); // flags to set on choose
    }

    [Serializable]
    public class FlagCondition
    {
        public string flagID;
        public bool requiredState = true;
    }
}

