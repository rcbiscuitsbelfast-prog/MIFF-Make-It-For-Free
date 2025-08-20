using UnityEngine;
using UnityEngine.UI;
using MIFF.Core;

namespace MIFF.UI
{
    /// <summary>
    /// Button component for opening the inventory/bag
    /// </summary>
    public class InventoryButton : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private Button button;
        [SerializeField] private BagUIController bagUI;
        
        [Header("Context")]
        [SerializeField] private bool isInBattle = false;
        
        private void Start()
        {
            if (button == null)
                button = GetComponent<Button>();
            
            if (button != null)
                button.onClick.AddListener(OnInventoryClicked);
            
            if (bagUI == null)
                bagUI = FindObjectOfType<BagUIController>();
        }
        
        /// <summary>
        /// Handle inventory button click
        /// </summary>
        private void OnInventoryClicked()
        {
            if (bagUI != null)
            {
                bagUI.ShowBag();
            }
            else
            {
                Debug.LogWarning("No BagUIController found for inventory button");
            }
        }
        
        /// <summary>
        /// Set the battle context
        /// </summary>
        public void SetBattleContext(bool inBattle)
        {
            isInBattle = inBattle;
        }
        
        /// <summary>
        /// Set the bag UI reference
        /// </summary>
        public void SetBagUI(BagUIController ui)
        {
            bagUI = ui;
        }
    }
}