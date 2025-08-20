using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;
using TMPro;
using MIFF.Items;

namespace MIFF.UI
{
    /// <summary>
    /// Individual item slot in the bag UI
    /// </summary>
    public class BagItemSlot : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private Image itemIcon;
        [SerializeField] private TextMeshProUGUI itemNameText;
        [SerializeField] private TextMeshProUGUI itemCountText;
        [SerializeField] private Button useButton;
        [SerializeField] private Button infoButton;
        
        [Header("Visual")]
        [SerializeField] private Color normalColor = Color.white;
        [SerializeField] private Color disabledColor = Color.gray;
        
        private Item_SO currentItem;
        private int currentCount;
        private BagContext currentContext;
        
        // Events
        public UnityEvent<Item_SO, int> OnUseItem;
        public UnityEvent<Item_SO> OnShowInfo;
        
        private void Start()
        {
            if (useButton != null)
                useButton.onClick.AddListener(OnUseClicked);
            
            if (infoButton != null)
                infoButton.onClick.AddListener(OnInfoClicked);
        }
        
        /// <summary>
        /// Setup the slot with item data
        /// </summary>
        public void Setup(Item_SO item, int count, BagContext context)
        {
            currentItem = item;
            currentCount = count;
            currentContext = context;
            
            UpdateVisuals();
            UpdateButtonStates();
        }
        
        /// <summary>
        /// Update the visual elements of the slot
        /// </summary>
        private void UpdateVisuals()
        {
            if (currentItem == null) return;
            
            // Update icon
            if (itemIcon != null)
            {
                itemIcon.sprite = currentItem.Icon;
                itemIcon.color = currentItem.ItemColor;
            }
            
            // Update name
            if (itemNameText != null)
            {
                itemNameText.text = currentItem.DisplayName;
            }
            
            // Update count
            if (itemCountText != null)
            {
                itemCountText.text = $"x{currentCount}";
                itemCountText.gameObject.SetActive(currentCount > 1);
            }
        }
        
        /// <summary>
        /// Update button states based on context and item
        /// </summary>
        private void UpdateButtonStates()
        {
            if (useButton == null) return;
            
            bool canUse = currentItem != null && currentCount > 0;
            
            if (currentContext == BagContext.Battle)
            {
                canUse &= currentItem.IsBattleUsable;
            }
            else
            {
                canUse &= currentItem.IsOverworldUsable;
            }
            
            useButton.interactable = canUse;
            
            // Update button color
            var buttonImage = useButton.GetComponent<Image>();
            if (buttonImage != null)
            {
                buttonImage.color = canUse ? normalColor : disabledColor;
            }
        }
        
        /// <summary>
        /// Handle use button click
        /// </summary>
        private void OnUseClicked()
        {
            if (currentItem != null && currentCount > 0)
            {
                OnUseItem?.Invoke(currentItem, 1);
            }
        }
        
        /// <summary>
        /// Handle info button click
        /// </summary>
        private void OnInfoClicked()
        {
            if (currentItem != null)
            {
                OnShowInfo?.Invoke(currentItem);
            }
        }
        
        /// <summary>
        /// Update the item count (for when inventory changes)
        /// </summary>
        public void UpdateCount(int newCount)
        {
            currentCount = newCount;
            UpdateVisuals();
            UpdateButtonStates();
        }
        
        /// <summary>
        /// Get the current item
        /// </summary>
        public Item_SO GetCurrentItem()
        {
            return currentItem;
        }
        
        /// <summary>
        /// Get the current count
        /// </summary>
        public int GetCurrentCount()
        {
            return currentCount;
        }
    }
}