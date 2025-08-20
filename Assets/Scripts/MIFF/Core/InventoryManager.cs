using UnityEngine;
using UnityEngine.Events;
using System.Collections.Generic;
using System.Linq;
using MIFF.Items;

namespace MIFF.Core
{
    /// <summary>
    /// Manages player inventory and provides interface to GameData.inventoryCounts
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        [Header("Events")]
        [SerializeField] private UnityEvent<Dictionary<string, int>> onInventoryChanged;
        [SerializeField] private UnityEvent<string, int> onItemAdded;
        [SerializeField] private UnityEvent<string, int> onItemRemoved;
        
        [Header("References")]
        [SerializeField] private ItemDatabase itemDatabase;
        
        private Dictionary<string, int> inventoryCounts = new Dictionary<string, int>();
        
        public static InventoryManager Instance { get; private set; }
        
        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                LoadInventory();
            }
            else
            {
                Destroy(gameObject);
            }
        }
        
        private void Start()
        {
            if (itemDatabase == null)
            {
                itemDatabase = FindObjectOfType<ItemDatabase>();
            }
        }
        
        /// <summary>
        /// Add items to inventory
        /// </summary>
        public void AddItem(string itemID, int amount = 1)
        {
            if (amount <= 0) return;
            
            if (inventoryCounts.ContainsKey(itemID))
            {
                inventoryCounts[itemID] += amount;
            }
            else
            {
                inventoryCounts[itemID] = amount;
            }
            
            SaveInventory();
            onItemAdded?.Invoke(itemID, amount);
            onInventoryChanged?.Invoke(new Dictionary<string, int>(inventoryCounts));
            
            Debug.Log($"Added {amount}x {itemID} to inventory. Total: {inventoryCounts[itemID]}");
        }
        
        /// <summary>
        /// Remove items from inventory
        /// </summary>
        public bool RemoveItem(string itemID, int amount = 1)
        {
            if (amount <= 0) return false;
            
            if (!inventoryCounts.ContainsKey(itemID) || inventoryCounts[itemID] < amount)
            {
                Debug.LogWarning($"Cannot remove {amount}x {itemID}. Only {GetItemCount(itemID)} available.");
                return false;
            }
            
            inventoryCounts[itemID] -= amount;
            
            if (inventoryCounts[itemID] <= 0)
            {
                inventoryCounts.Remove(itemID);
            }
            
            SaveInventory();
            onItemRemoved?.Invoke(itemID, amount);
            onInventoryChanged?.Invoke(new Dictionary<string, int>(inventoryCounts));
            
            Debug.Log($"Removed {amount}x {itemID} from inventory. Remaining: {GetItemCount(itemID)}");
            return true;
        }
        
        /// <summary>
        /// Get the count of a specific item
        /// </summary>
        public int GetItemCount(string itemID)
        {
            return inventoryCounts.ContainsKey(itemID) ? inventoryCounts[itemID] : 0;
        }
        
        /// <summary>
        /// Get all items with their counts
        /// </summary>
        public IEnumerable<(Item_SO, int)> GetAllItems()
        {
            if (itemDatabase == null) return Enumerable.Empty<(Item_SO, int)>();
            
            return inventoryCounts.Select(kvp => 
            {
                var item = itemDatabase.GetItem(kvp.Key);
                return (item, kvp.Value);
            }).Where(tuple => tuple.Item1 != null);
        }
        
        /// <summary>
        /// Check if player has a specific item
        /// </summary>
        public bool HasItem(string itemID, int amount = 1)
        {
            return GetItemCount(itemID) >= amount;
        }
        
        /// <summary>
        /// Get items usable in battle
        /// </summary>
        public IEnumerable<(Item_SO, int)> GetBattleUsableItems()
        {
            return GetAllItems().Where(tuple => tuple.Item1.IsBattleUsable);
        }
        
        /// <summary>
        /// Get items usable in overworld
        /// </summary>
        public IEnumerable<(Item_SO, int)> GetOverworldUsableItems()
        {
            return GetAllItems().Where(tuple => tuple.Item1.IsOverworldUsable);
        }
        
        /// <summary>
        /// Load inventory from GameData
        /// </summary>
        private void LoadInventory()
        {
            // For now, we'll use PlayerPrefs as a simple persistence solution
            // This can be replaced with your GameData system when ready
            var inventoryJson = PlayerPrefs.GetString("MIFF_Inventory", "{}");
            try
            {
                var savedInventory = JsonUtility.FromJson<Dictionary<string, int>>(inventoryJson);
                if (savedInventory != null)
                {
                    inventoryCounts = new Dictionary<string, int>(savedInventory);
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"Failed to load inventory: {e.Message}");
                inventoryCounts = new Dictionary<string, int>();
            }
        }
        
        /// <summary>
        /// Save inventory to GameData
        /// </summary>
        private void SaveInventory()
        {
            try
            {
                var inventoryJson = JsonUtility.ToJson(inventoryCounts);
                PlayerPrefs.SetString("MIFF_Inventory", inventoryJson);
                PlayerPrefs.Save();
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Failed to save inventory: {e.Message}");
            }
        }
        
        /// <summary>
        /// Clear all inventory (for testing/debugging)
        /// </summary>
        [ContextMenu("Clear Inventory")]
        public void ClearInventory()
        {
            inventoryCounts.Clear();
            SaveInventory();
            onInventoryChanged?.Invoke(new Dictionary<string, int>(inventoryCounts));
        }
        
        /// <summary>
        /// Add test items (for testing/debugging)
        /// </summary>
        [ContextMenu("Add Test Items")]
        public void AddTestItems()
        {
            AddItem("potion", 5);
            AddItem("revive", 2);
            AddItem("quest_key", 1);
        }
    }
}