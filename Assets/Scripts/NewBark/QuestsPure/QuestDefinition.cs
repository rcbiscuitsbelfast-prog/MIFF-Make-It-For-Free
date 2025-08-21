using System;
using UnityEngine;

namespace NewBark.QuestsPure
{
    [CreateAssetMenu(fileName = "Untitled_Quest", menuName = "NewBark/Quest Definition")]
    public class QuestDefinition : ScriptableObject
    {
        [Header("Identity")] public string id;
        public string title;
        [TextArea] public string description;
        public string zone;
        public string npcTrigger;
        public string codexUnlock;

        [Serializable]
        public class QuestStep
        {
            public string id;
            [TextArea] public string description;
        }

        [Serializable]
        public class QuestCondition
        {
            public string type; // e.g., "HasItem", "QuestCompleted"
            public string key;
            public string value;
        }

        [Serializable]
        public class QuestReward
        {
            public string type; // e.g., "Item", "XP"
            public string key;
            public int amount;
        }

        public QuestStep[] steps;
        public QuestCondition[] conditions;
        public QuestReward[] rewards;
    }
}