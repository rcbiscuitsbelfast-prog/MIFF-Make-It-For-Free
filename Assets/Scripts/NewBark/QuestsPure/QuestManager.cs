using System;
using System.Collections.Generic;
using NewBark.State;
using UnityEngine;
using NewBark.InventoryPure;

namespace NewBark.QuestsPure
{
    public class QuestManager : MonoBehaviour
    {
        public static QuestManager Instance { get; private set; }

        private Dictionary<string, GameData.QuestEntry> idToEntry = new Dictionary<string, GameData.QuestEntry>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("QuestManager initialized (singleton, DontDestroyOnLoad).");
        }

        private void Start()
        {
            RebuildCache();
        }

        public void RebuildCache()
        {
            idToEntry.Clear();
            if (GameManager.Data?.quests == null) return;
            foreach (var q in GameManager.Data.quests)
            {
                idToEntry[q.id] = q;
            }
        }

        public GameData.QuestEntry GetOrCreate(string id)
        {
            if (!idToEntry.TryGetValue(id, out var entry))
            {
                entry = new GameData.QuestEntry {id = id, step = 0, status = "Active"};
                GameManager.Data.quests.Add(entry);
                idToEntry[id] = entry;
            }
            return entry;
        }

        public void SetFlag(string id, int step, string status = null)
        {
            var entry = GetOrCreate(id);
            entry.step = step;
            if (!string.IsNullOrEmpty(status)) entry.status = status;
        }

        public void RewardItem(string itemId, int quantity = 1)
        {
            InventoryManager.Instance.AddItem(itemId, quantity);
            Debug.Log($"Quest Reward: +{quantity} {itemId}");
        }

        public bool IsCompleted(string id)
        {
            return idToEntry.TryGetValue(id, out var e) && e.status == "Completed";
        }

        public bool IsActive(string id)
        {
            return idToEntry.TryGetValue(id, out var e) && e.status == "Active";
        }

        public int GetStep(string id)
        {
            return idToEntry.TryGetValue(id, out var e) ? e.step : -1;
        }

        public IEnumerable<GameData.QuestEntry> GetAll()
        {
            return GameManager.Data.quests;
        }
    }
}