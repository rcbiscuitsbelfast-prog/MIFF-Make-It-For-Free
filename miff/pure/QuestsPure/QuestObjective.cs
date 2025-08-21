using System;

namespace MIFF.QuestsPure
{
    public enum ObjectiveType
    {
        CaptureSpirit,
        VisitLocation,
        WinBattle,
        UseItem,
        TalkToNPC
    }

    /// <summary>
    /// Pure C# quest objective with simple progress tracking.
    /// </summary>
    [Serializable]
    public class QuestObjective
    {
        public ObjectiveType type;
        public string targetID;       // spiritID/locationID/itemID/npcID
        public int requiredCount = 1; // total needed
        public int currentCount = 0;  // progress
        public bool isComplete = false;

        public void AddProgress(int amount = 1)
        {
            if (isComplete) return;
            currentCount += Math.Max(0, amount);
            if (currentCount >= requiredCount)
            {
                currentCount = requiredCount;
                isComplete = true;
            }
        }

        public override string ToString()
        {
            string target = string.IsNullOrEmpty(targetID) ? "-" : targetID;
            string bar = requiredCount > 1 ? $"{currentCount}/{requiredCount}" : (isComplete ? "✓" : "✗");
            return $"{type}({target}) {bar}";
        }
    }
}

