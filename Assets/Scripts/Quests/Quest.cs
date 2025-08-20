using UnityEngine;

namespace NewBark.Quests
{
    [CreateAssetMenu(fileName = "New_Quest", menuName = "Remix/Quests/Quest", order = 0)]
    public class Quest : ScriptableObject
    {
        public string questID;
        public string title;
        public string description;
        public QuestObjective[] objectives;
        public QuestReward[] rewards;
    }

    [System.Serializable]
    public class QuestObjective
    {
        public string objectiveID;
        public ObjectiveType type;
        public string targetID;
        public bool isComplete;
    }

    [System.Serializable]
    public class QuestReward
    {
        public RewardType type;
        public string targetID;
        public int amount;
    }

    public enum ObjectiveType
    {
        TalkTo,
        DefeatTrainer,
        CollectItem,
        GoToArea,
        SetFlag
    }

    public enum RewardType
    {
        Item,
        Spirit,
        Flag,
        Money
    }
}

