using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using System.Linq;
using MIFF.Core;
using MIFF.Items;

namespace MIFF.UI
{
    /// <summary>
    /// Controls the bag UI for both overworld and battle use
    /// </summary>
    public class BagUIController : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject bagPanel;
        [SerializeField] private GameObject bagItemSlotPrefab;
        [SerializeField] private Transform contentParent;
        [SerializeField] private Button closeButton;
        
        [Header("Context")]
        [SerializeField] private bool isInBattle = false;
        [SerializeField] private bool isSoloMode = false;
        
        [Header("Battle Integration")]
        [SerializeField] private BattleController battleController;
        
        private List<BagItemSlot> activeSlots = new List<BagItemSlot>();
        private InventoryManager inventoryManager;
        
        private void Start()
        {
            if (closeButton != null)
                closeButton.onClick.AddListener(HideBag);
            
            inventoryManager = InventoryManager.Instance;
            if (inventoryManager != null)
            {
                inventoryManager.onInventoryChanged.AddListener(RefreshBag);
            }
        }
        
        /// <summary>
        /// Show the bag UI
        /// </summary>
        public void ShowBag()
        {
            if (bagPanel != null)
                bagPanel.SetActive(true);
            
            RefreshBag();
        }
        
        /// <summary>
        /// Hide the bag UI
        /// </summary>
        public void HideBag()
        {
            if (bagPanel != null)
                bagPanel.SetActive(false);
        }
        
        /// <summary>
        /// Refresh the bag contents
        /// </summary>
        public void RefreshBag()
        {
            if (inventoryManager == null) return;
            
            ClearBag();
            
            // Get items based on context
            IEnumerable<(Item_SO, int)> items;
            if (isInBattle)
            {
                items = inventoryManager.GetBattleUsableItems();
                
                // Disable bag if solo mode and no usable items
                if (isSoloMode && !items.Any())
                {
                    DisableBagInSoloMode();
                    return;
                }
            }
            else
            {
                items = inventoryManager.GetOverworldUsableItems();
            }
            
            PopulateBag(items);
        }
        
        /// <summary>
        /// Clear all bag slots
        /// </summary>
        private void ClearBag()
        {
            foreach (var slot in activeSlots)
            {
                if (slot != null)
                    Destroy(slot.gameObject);
            }
            activeSlots.Clear();
        }
        
        /// <summary>
        /// Populate bag with items
        /// </summary>
        private void PopulateBag(IEnumerable<(Item_SO, int)> items)
        {
            if (bagItemSlotPrefab == null || contentParent == null) return;
            
            foreach (var (item, count) in items)
            {
                if (item == null) continue;
                
                var slotObj = Instantiate(bagItemSlotPrefab, contentParent);
                var slot = slotObj.GetComponent<BagItemSlot>();
                
                if (slot != null)
                {
                    slot.Setup(item, count, isInBattle ? BagContext.Battle : BagContext.Overworld);
                    slot.OnUseItem += HandleItemUse;
                    activeSlots.Add(slot);
                }
            }
        }
        
        /// <summary>
        /// Handle item usage from bag slots
        /// </summary>
        private void HandleItemUse(Item_SO item, int amount)
        {
            if (inventoryManager == null) return;
            
            if (isInBattle)
            {
                HandleBattleItemUse(item, amount);
            }
            else
            {
                HandleOverworldItemUse(item, amount);
            }
        }
        
        /// <summary>
        /// Handle item usage in battle
        /// </summary>
        private void HandleBattleItemUse(Item_SO item, int amount)
        {
            if (battleController != null)
            {
                // This would integrate with your battle system
                // battleController.ReceivePlayerAction(item);
                Debug.Log($"Battle item use: {item.DisplayName}");
            }
            
            // Remove item from inventory
            inventoryManager.RemoveItem(item.ItemID, amount);
            
            // Hide bag after use in battle
            HideBag();
        }
        
        /// <summary>
        /// Handle item usage in overworld
        /// </summary>
        private void HandleOverworldItemUse(Item_SO item, int amount)
        {
            // Create player and target contexts
            var player = FindObjectOfType<PlayerController>();
            if (player != null)
            {
                var playerContext = new PlayerContext(player.gameObject, false, false);
                var targetContext = new TargetContext(player.transform.position, "player");
                
                // Apply item effect
                if (item.UseItem(playerContext, targetContext))
                {
                    // Remove item if consumable
                    if (item.IsConsumable)
                    {
                        inventoryManager.RemoveItem(item.ItemID, amount);
                    }
                    
                    Debug.Log($"Used {item.DisplayName} in overworld");
                }
            }
        }
        
        /// <summary>
        /// Disable bag in solo mode when no usable items remain
        /// </summary>
        private void DisableBagInSoloMode()
        {
            if (bagPanel != null)
                bagPanel.SetActive(false);
            
            Debug.Log("Bag disabled in solo mode - no usable items remaining");
        }
        
        /// <summary>
        /// Set the battle context
        /// </summary>
        public void SetBattleContext(bool inBattle, bool soloMode = false)
        {
            isInBattle = inBattle;
            isSoloMode = soloMode;
        }
        
        /// <summary>
        /// Set the battle controller reference
        /// </summary>
        public void SetBattleController(BattleController controller)
        {
            battleController = controller;
        }
    }
    
    public enum BagContext
    {
        Overworld,
        Battle
    }
}