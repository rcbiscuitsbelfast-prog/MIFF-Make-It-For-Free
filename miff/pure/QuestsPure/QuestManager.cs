using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.QuestsPure
{
    /// <summary>
    /// Tracks available, active, and completed quests in a pure C# environment.
    /// </summary>
    [Serializable]
    public class QuestManager
    {
        private readonly Dictionary<string, Quest> available = new Dictionary<string, Quest>();
        private readonly Dictionary<string, Quest> active = new Dictionary<string, Quest>();
        private readonly HashSet<string> completed = new HashSet<string>();

        public event Action<Quest> OnQuestStarted;
        public event Action<Quest> OnQuestCompleted;

        public void RegisterQuest(Quest quest)
        {
            if (quest == null || string.IsNullOrEmpty(quest.questID)) return;
            available[quest.questID] = quest;
        }

        public void StartQuest(string questID)
        {
            if (string.IsNullOrEmpty(questID)) return;
            if (completed.Contains(questID)) return;
            if (!available.TryGetValue(questID, out var quest)) return;
            active[questID] = quest;
            OnQuestStarted?.Invoke(quest);
        }

        public void CompleteQuest(string questID)
        {
            if (!active.TryGetValue(questID, out var quest)) return;
            if (!quest.IsComplete()) return;
            active.Remove(questID);
            completed.Add(questID);
            OnQuestCompleted?.Invoke(quest);
        }

        public bool IsQuestActive(string questID) => active.ContainsKey(questID);
        public bool IsQuestComplete(string questID) => completed.Contains(questID);

        public IReadOnlyCollection<Quest> GetActiveQuests() => active.Values;
        public IReadOnlyCollection<string> GetCompletedIds() => completed;
        public IReadOnlyCollection<Quest> GetAvailableQuests() => available.Values;

        public void AddProgress(string questID, ObjectiveType type, string targetID, int amount = 1)
        {
            if (!active.TryGetValue(questID, out var quest) || quest.objectives == null) return;
            foreach (var obj in quest.objectives.Where(o => o.type == type && (string.IsNullOrEmpty(targetID) || o.targetID == targetID)))
            {
                obj.AddProgress(amount);
            }
        }
    }
}

