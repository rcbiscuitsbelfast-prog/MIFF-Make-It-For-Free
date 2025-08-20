using UnityEngine;
using MIFF.Core;

namespace MIFF.Items
{
    /// <summary>
    /// ScriptableObject for defining item properties and behavior
    /// </summary>
    [CreateAssetMenu(fileName = "New Item", menuName = "MIFF/Items/Item")]
    public class Item_SO : ScriptableObject
    {
        [Header("Item Identity")]
        [SerializeField] private string itemID;
        [SerializeField] private string displayName;
        [TextArea(3, 5)]
        [SerializeField] private string description;
        
        [Header("Visual")]
        [SerializeField] private Sprite icon;
        [SerializeField] private Color itemColor = Color.white;
        
        [Header("Properties")]
        [SerializeField] private int cost = 0;
        [SerializeField] private bool isBattleUsable = true;
        [SerializeField] private bool isOverworldUsable = true;
        [SerializeField] private bool isConsumable = true;
        
        [Header("Effects")]
        [SerializeField] private IItemEffect itemEffect;
        
        // Properties for external access
        public string ItemID => itemID;
        public string DisplayName => displayName;
        public string Description => description;
        public Sprite Icon => icon;
        public Color ItemColor => itemColor;
        public int Cost => cost;
        public bool IsBattleUsable => isBattleUsable;
        public bool IsOverworldUsable => isOverworldUsable;
        public bool IsConsumable => isConsumable;
        public IItemEffect ItemEffect => itemEffect;
        
        private void OnValidate()
        {
            // Ensure itemID is unique and not empty
            if (string.IsNullOrEmpty(itemID))
            {
                itemID = name.ToLower().Replace(" ", "_");
            }
            
            // Ensure displayName is not empty
            if (string.IsNullOrEmpty(displayName))
            {
                displayName = name;
            }
        }
        
        /// <summary>
        /// Use the item with the given context
        /// </summary>
        public bool UseItem(PlayerContext playerContext, TargetContext targetContext)
        {
            if (itemEffect == null)
            {
                Debug.LogWarning($"Item {itemID} has no effect assigned!");
                return false;
            }
            
            try
            {
                itemEffect.Apply(playerContext, targetContext);
                return true;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Error applying item effect for {itemID}: {e.Message}");
                return false;
            }
        }
    }
}