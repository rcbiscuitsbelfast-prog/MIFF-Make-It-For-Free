using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Items
{
    /// <summary>
    /// Registry for all items in the game
    /// </summary>
    [CreateAssetMenu(fileName = "ItemDatabase", menuName = "MIFF/Database/ItemDatabase")]
    public class ItemDatabase : ScriptableObject
    {
        [Header("Item Registry")]
        [SerializeField] private List<Item_SO> registeredItems = new List<Item_SO>();
        
        private Dictionary<string, Item_SO> itemLookup = new Dictionary<string, Item_SO>();
        
        private void OnEnable()
        {
            BuildLookup();
        }
        
        /// <summary>
        /// Build the item lookup dictionary
        /// </summary>
        private void BuildLookup()
        {
            itemLookup.Clear();
            
            foreach (var item in registeredItems)
            {
                if (item != null && !string.IsNullOrEmpty(item.ItemID))
                {
                    if (itemLookup.ContainsKey(item.ItemID))
                    {
                        Debug.LogWarning($"Duplicate item ID found: {item.ItemID}");
                    }
                    else
                    {
                        itemLookup[item.ItemID] = item;
                    }
                }
            }
        }
        
        /// <summary>
        /// Get an item by ID
        /// </summary>
        public Item_SO GetItem(string itemID)
        {
            if (string.IsNullOrEmpty(itemID)) return null;
            
            return itemLookup.ContainsKey(itemID) ? itemLookup[itemID] : null;
        }
        
        /// <summary>
        /// Get all registered items
        /// </summary>
        public List<Item_SO> GetAllItems()
        {
            return new List<Item_SO>(registeredItems);
        }
        
        /// <summary>
        /// Get items by type
        /// </summary>
        public List<Item_SO> GetItemsByType(System.Type effectType)
        {
            return registeredItems.Where(item => 
                item != null && 
                item.ItemEffect != null && 
                item.ItemEffect.GetType() == effectType
            ).ToList();
        }
        
        /// <summary>
        /// Get healing items
        /// </summary>
        public List<Item_SO> GetHealingItems()
        {
            return GetItemsByType(typeof(ItemEffects.HealHPEffect));
        }
        
        /// <summary>
        /// Get revival items
        /// </summary>
        public List<Item_SO> GetRevivalItems()
        {
            return GetItemsByType(typeof(ItemEffects.ReviveEffect));
        }
        
        /// <summary>
        /// Get quest items
        /// </summary>
        public List<Item_SO> GetQuestItems()
        {
            return GetItemsByType(typeof(ItemEffects.QuestFlagEffect));
        }
        
        /// <summary>
        /// Register a new item
        /// </summary>
        public void RegisterItem(Item_SO item)
        {
            if (item == null || string.IsNullOrEmpty(item.ItemID)) return;
            
            if (!registeredItems.Contains(item))
            {
                registeredItems.Add(item);
                BuildLookup();
            }
        }
        
        /// <summary>
        /// Unregister an item
        /// </summary>
        public void UnregisterItem(Item_SO item)
        {
            if (item == null) return;
            
            if (registeredItems.Contains(item))
            {
                registeredItems.Remove(item);
                BuildLookup();
            }
        }
        
        /// <summary>
        /// Validate all registered items
        /// </summary>
        [ContextMenu("Validate Items")]
        public void ValidateItems()
        {
            var issues = new List<string>();
            
            foreach (var item in registeredItems)
            {
                if (item == null) continue;
                
                if (string.IsNullOrEmpty(item.ItemID))
                {
                    issues.Add($"Item '{item.name}' has no ID");
                }
                
                if (string.IsNullOrEmpty(item.DisplayName))
                {
                    issues.Add($"Item '{item.name}' has no display name");
                }
                
                if (item.ItemEffect == null)
                {
                    issues.Add($"Item '{item.name}' has no effect assigned");
                }
            }
            
            if (issues.Count > 0)
            {
                Debug.LogWarning($"Item validation found {issues.Count} issues:\n• " + string.Join("\n• ", issues));
            }
            else
            {
                Debug.Log("All items validated successfully!");
            }
        }
    }
}