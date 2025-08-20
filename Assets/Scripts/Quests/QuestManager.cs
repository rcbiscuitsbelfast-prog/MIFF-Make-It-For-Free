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
            if (string.IsNullOrEmpty(questID)) return;
            var data = GameManager.Data;
            if (data == null) return;
            if (data.completedQuestIDs != null && data.completedQuestIDs.Contains(questID)) return;
            if (data.activeQuestIDs == null) data.activeQuestIDs = new System.Collections.Generic.HashSet<string>();
            if (data.activeQuestIDs.Contains(questID)) return;
            data.activeQuestIDs.Add(questID);

            // Reset objective progress for this quest
            var q = availableQuests.FirstOrDefault(x => x && x.questID == questID);
            if (!q) { SaveStateToGameData(); return; }
            if (data.questObjectiveProgress == null) data.questObjectiveProgress = new System.Collections.Generic.Dictionary<string, bool>();
            if (q.objectives != null)
            {
                foreach (var obj in q.objectives)
                {
                    var key = questID + "." + obj.objectiveID;
                    data.questObjectiveProgress[key] = false;
                }
            }
            SaveStateToGameData();
        }

        public void CompleteObjective(string questID, string objectiveID)
        {
            if (string.IsNullOrEmpty(questID) || string.IsNullOrEmpty(objectiveID)) return;
            var data = GameManager.Data;
            if (data == null) return;
            if (data.questObjectiveProgress == null) data.questObjectiveProgress = new System.Collections.Generic.Dictionary<string, bool>();
            var key = questID + "." + objectiveID;
            data.questObjectiveProgress[key] = true;
            SaveStateToGameData();
            CheckQuestCompletion(questID);
        }

        public void CheckQuestCompletion(string questID)
        {
            var data = GameManager.Data;
            if (data == null || data.activeQuestIDs == null || !data.activeQuestIDs.Contains(questID)) return;
            var q = availableQuests.FirstOrDefault(x => x && x.questID == questID);
            if (!q) return;

            bool allDone = true;
            if (q.objectives != null && q.objectives.Length > 0)
            {
                foreach (var obj in q.objectives)
                {
                    var key = questID + "." + obj.objectiveID;
                    bool done = data.questObjectiveProgress != null && data.questObjectiveProgress.TryGetValue(key, out var v) && v;
                    if (!done) { allDone = false; break; }
                }
            }

            if (allDone)
            {
                CompleteQuest(questID);
            }
        }

        public void CompleteQuest(string questID)
        {
            var data = GameManager.Data;
            if (data == null) return;
            if (data.activeQuestIDs != null) data.activeQuestIDs.Remove(questID);
            if (data.completedQuestIDs == null) data.completedQuestIDs = new System.Collections.Generic.HashSet<string>();
            data.completedQuestIDs.Add(questID);
            GrantRewards(questID);
            SaveStateToGameData();
        }

        public System.Action<string> OnRewardGranted;

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
                        OnRewardGranted?.Invoke($"Flag:{r.targetID}");
                        break;
                    case RewardType.Money:
                        var data = GameManager.Data;
                        if (data != null) data.playerCurrency += r.amount;
                        OnRewardGranted?.Invoke($"Money:{r.amount}");
                        break;
                    case RewardType.Item:
                        GiveItem(r.targetID, r.amount);
                        OnRewardGranted?.Invoke($"Item:{r.targetID}:{r.amount}");
                        break;
                    case RewardType.Spirit:
                        DiscoverSpirit(r.targetID);
                        OnRewardGranted?.Invoke($"Spirit:{r.targetID}");
                        break;
                }
            }
        }

        public void GiveItem(string itemID, int amount)
        {
            if (string.IsNullOrEmpty(itemID) || amount <= 0) return;
            var data = GameManager.Data; if (data == null) return;
            if (data.inventoryCounts == null) data.inventoryCounts = new System.Collections.Generic.Dictionary<string, int>();
            if (!data.inventoryCounts.ContainsKey(itemID)) data.inventoryCounts[itemID] = 0;
            data.inventoryCounts[itemID] += amount;
        }

        public void DiscoverSpirit(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID)) return;
            var data = GameManager.Data; if (data == null) return;
            if (data.discoveredSpiritIDs == null) data.discoveredSpiritIDs = new System.Collections.Generic.HashSet<string>();
            data.discoveredSpiritIDs.Add(spiritID);
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

