using System.Collections.Generic;
using NewBark.State;
using UnityEngine;

namespace NewBark.InventoryPure
{
    public class InventoryManager : MonoBehaviour
    {
        public static InventoryManager Instance { get; private set; }

        private Dictionary<string, GameData.ItemEntry> idToItem = new Dictionary<string, GameData.ItemEntry>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("InventoryManager initialized (singleton, DontDestroyOnLoad).");
            RebuildCache();
        }

        public void RebuildCache()
        {
            idToItem.Clear();
            if (GameManager.Data?.inventory == null) return;
            foreach (var item in GameManager.Data.inventory)
            {
                idToItem[item.id] = item;
            }
        }

        public GameData.ItemEntry GetOrCreate(string id)
        {
            if (!idToItem.TryGetValue(id, out var entry))
            {
                entry = new GameData.ItemEntry { id = id, quantity = 0 };
                GameManager.Data.inventory.Add(entry);
                idToItem[id] = entry;
            }
            return entry;
        }

        public void AddItem(string id, int quantity = 1)
        {
            var entry = GetOrCreate(id);
            entry.quantity += Mathf.Max(0, quantity);
            Debug.Log($"Inventory: +{quantity} {id} (total={entry.quantity})");
        }

        public bool RemoveItem(string id, int quantity = 1)
        {
            if (!idToItem.TryGetValue(id, out var entry)) return false;
            if (entry.quantity < quantity) return false;
            entry.quantity -= quantity;
            Debug.Log($"Inventory: -{quantity} {id} (total={entry.quantity})");
            return true;
        }

        public int GetQuantity(string id)
        {
            return idToItem.TryGetValue(id, out var entry) ? entry.quantity : 0;
        }

        public IEnumerable<GameData.ItemEntry> GetAll()
        {
            return GameManager.Data.inventory;
        }
    }
}