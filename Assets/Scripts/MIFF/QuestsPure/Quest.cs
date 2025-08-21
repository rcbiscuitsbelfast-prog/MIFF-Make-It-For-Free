using System;
using System.Collections.Generic;

namespace MIFF.QuestsPure
{
    /// <summary>
    /// Pure C# quest data: multi-step objectives and rewards hooks.
    /// </summary>
    [Serializable]
    public class Quest
    {
        public string questID;
        public string name;
        public string description;

        public List<QuestObjective> objectives = new List<QuestObjective>();

        // Optional rewards/hooks
        public List<string> loreFlagsToSet = new List<string>();
        public List<string> spiritUnlockIDs = new List<string>();
        public Dictionary<string, int> itemRewards = new Dictionary<string, int>();
        public string evolutionTriggerSpeciesID; // optional species to evolve

        public bool IsComplete()
        {
            if (objectives == null || objectives.Count == 0) return false;
            foreach (var o in objectives)
            {
                if (o == null || !o.isComplete) return false;
            }
            return true;
        }

        public override string ToString()
        {
            return $"[{questID}] {name}: {description}";
        }
    }
}

