using System.Collections.Generic;
using System.Linq;
using NewBark.State;
using UnityEngine;

namespace NewBark.Quests
{
    public class QuestManager : MonoBehaviour
    {
        // Simple registries (designers drag in assets or we can load via Addressables)
        public List<Quest> availableQuests = new List<Quest>();

        // Active/completed tracking in memory; persisted via GameData flags
        private readonly HashSet<string> _active = new HashSet<string>();
        private readonly HashSet<string> _completed = new HashSet<string>();

        private void Awake()
        {
            LoadStateFromGameData();
        }

        public void StartQuest(string questID)
        {
            if (string.IsNullOrEmpty(questID) || _completed.Contains(questID) || _active.Contains(questID)) return;
            _active.Add(questID);
            SaveStateToGameData();
        }

        public void CompleteObjective(string objectiveID)
        {
            if (string.IsNullOrEmpty(objectiveID)) return;

            foreach (var q in GetActiveQuestAssets())
            {
                var obj = q.objectives?.FirstOrDefault(o => o.objectiveID == objectiveID);
                if (obj != null)
                {
                    obj.isComplete = true;
                }
            }

            SaveStateToGameData();
        }

        public void CheckQuestCompletion(string questID)
        {
            if (!_active.Contains(questID)) return;
            var q = availableQuests.FirstOrDefault(x => x && x.questID == questID);
            if (!q) return;

            bool allDone = q.objectives != null && q.objectives.All(o => o.isComplete);
            if (allDone)
            {
                GrantRewards(questID);
                _active.Remove(questID);
                _completed.Add(questID);
                SaveStateToGameData();
            }
        }

        public void GrantRewards(string questID)
        {
            var q = availableQuests.FirstOrDefault(x => x && x.questID == questID);
            if (!q || q.rewards == null) return;

            foreach (var r in q.rewards)
            {
                switch (r.type)
                {
                    case RewardType.Flag:
                        SetFlag(r.targetID, true);
                        break;
                    case RewardType.Money:
                        // Extend GameData with currency if needed
                        break;
                    case RewardType.Item:
                    case RewardType.Spirit:
                        // Hook into inventory/party systems when implemented
                        break;
                }
            }
        }

        private IEnumerable<Quest> GetActiveQuestAssets()
        {
            return availableQuests.Where(q => q && _active.Contains(q.questID));
        }

        private void LoadStateFromGameData()
        {
            var data = GameManager.Data;
            if (data == null) return;

            if (data.flags != null)
            {
                foreach (var kv in data.flags)
                {
                    if (kv.Key.StartsWith("quest_completed:"))
                    {
                        _completed.Add(kv.Key.Substring("quest_completed:".Length));
                    }
                    if (kv.Key.StartsWith("quest_active:"))
                    {
                        _active.Add(kv.Key.Substring("quest_active:".Length));
                    }
                }
            }
        }

        private void SaveStateToGameData()
        {
            var data = GameManager.Data;
            if (data == null) return;
            if (data.flags == null) data.flags = new Dictionary<string, bool>();

            // Clear old quest keys
            var keys = data.flags.Keys.ToList();
            foreach (var k in keys)
            {
                if (k.StartsWith("quest_completed:") || k.StartsWith("quest_active:"))
                {
                    data.flags.Remove(k);
                }
            }

            foreach (var id in _completed)
            {
                data.flags[$"quest_completed:{id}"] = true;
            }
            foreach (var id in _active)
            {
                data.flags[$"quest_active:{id}"] = true;
            }
        }

        public IEnumerable<Quest> GetActiveQuests()
        {
            return availableQuests.Where(q => q && _active.Contains(q.questID));
        }

        public bool GetFlag(string flagId)
        {
            var data = GameManager.Data;
            if (data == null) return false;
            if (data.flags != null && data.flags.TryGetValue(flagId, out var v))
            {
                return v;
            }
            return false;
        }

        public void SetFlag(string flagId, bool value)
        {
            var data = GameManager.Data;
            if (data == null) return;
            if (data.flags == null) data.flags = new Dictionary<string, bool>();
            data.flags[flagId] = value;
        }
    }
}

