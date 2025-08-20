using UnityEngine;
using UnityEngine.UI;
using MIFF.Core;
using MIFF.Items;

namespace MIFF.Tutorials
{
    /// <summary>
    /// Helper script for testing the tutorial system
    /// </summary>
    public class TutorialTestHelper : MonoBehaviour
    {
        [Header("Test Controls")]
        [SerializeField] private Button addItemButton;
        [SerializeField] private Button startBattleButton;
        [SerializeField] private Button resetFlagsButton;
        [SerializeField] private Button forceTutorialButton;
        
        [Header("Test Items")]
        [SerializeField] private string testItemID = "potion";
        [SerializeField] private int testItemAmount = 1;
        
        private InventoryManager inventoryManager;
        private OnboardingFlagManager flagManager;
        private BattleController battleController;
        private TutorialTrigger_ItemUsage tutorialTrigger;
        
        private void Start()
        {
            inventoryManager = InventoryManager.Instance;
            flagManager = OnboardingFlagManager.Instance;
            battleController = FindObjectOfType<BattleController>();
            tutorialTrigger = FindObjectOfType<TutorialTrigger_ItemUsage>();
            
            SetupTestButtons();
        }
        
        /// <summary>
        /// Setup test button listeners
        /// </summary>
        private void SetupTestButtons()
        {
            if (addItemButton != null)
                addItemButton.onClick.AddListener(AddTestItem);
            
            if (startBattleButton != null)
                startBattleButton.onClick.AddListener(StartTestBattle);
            
            if (resetFlagsButton != null)
                resetFlagsButton.onClick.AddListener(ResetAllFlags);
            
            if (forceTutorialButton != null)
                forceTutorialButton.onClick.AddListener(ForceTutorial);
        }
        
        /// <summary>
        /// Add a test item to trigger tutorial
        /// </summary>
        public void AddTestItem()
        {
            if (inventoryManager == null)
            {
                Debug.LogError("InventoryManager not found!");
                return;
            }
            
            inventoryManager.AddItem(testItemID, testItemAmount);
            Debug.Log($"Added {testItemAmount}x {testItemID} to inventory");
        }
        
        /// <summary>
        /// Start a test battle
        /// </summary>
        public void StartTestBattle()
        {
            if (battleController == null)
            {
                Debug.LogError("BattleController not found!");
                return;
            }
            
            battleController.StartBattle(soloMode: false);
            Debug.Log("Started test battle");
        }
        
        /// <summary>
        /// Reset all onboarding flags
        /// </summary>
        public void ResetAllFlags()
        {
            if (flagManager == null)
            {
                Debug.LogError("OnboardingFlagManager not found!");
                return;
            }
            
            flagManager.ResetAllFlags();
            Debug.Log("Reset all onboarding flags");
        }
        
        /// <summary>
        /// Force trigger the tutorial
        /// </summary>
        public void ForceTutorial()
        {
            if (tutorialTrigger == null)
            {
                Debug.LogError("TutorialTrigger_ItemUsage not found!");
                return;
            }
            
            tutorialTrigger.ForceTriggerTutorial();
            Debug.Log("Forced tutorial trigger");
        }
        
        /// <summary>
        /// Simulate purchasing an item from store
        /// </summary>
        [ContextMenu("Simulate Store Purchase")]
        public void SimulateStorePurchase()
        {
            if (inventoryManager == null) return;
            
            // Simulate getting a healing item
            inventoryManager.AddItem("potion", 2);
            inventoryManager.AddItem("revive", 1);
            
            Debug.Log("Simulated store purchase - added potion and revive");
        }
        
        /// <summary>
        /// Simulate battle reward
        /// </summary>
        [ContextMenu("Simulate Battle Reward")]
        public void SimulateBattleReward()
        {
            if (inventoryManager == null) return;
            
            // Simulate getting items from battle
            inventoryManager.AddItem("quest_key", 1);
            
            Debug.Log("Simulated battle reward - added quest key");
        }
        
        /// <summary>
        /// Test tutorial in battle context
        /// </summary>
        [ContextMenu("Test Battle Tutorial")]
        public void TestBattleTutorial()
        {
            if (battleController == null) return;
            
            // Reset flags first
            if (flagManager != null)
            {
                flagManager.ResetFlag("ItemUsageTutorialCompleted");
            }
            
            // Add items
            if (inventoryManager != null)
            {
                inventoryManager.AddItem("potion", 1);
            }
            
            // Start battle
            battleController.StartBattle(soloMode: false);
            
            Debug.Log("Testing battle tutorial context");
        }
        
        /// <summary>
        /// Test tutorial in overworld context
        /// </summary>
        [ContextMenu("Test Overworld Tutorial")]
        public void TestOverworldTutorial()
        {
            // Reset flags first
            if (flagManager != null)
            {
                flagManager.ResetFlag("ItemUsageTutorialCompleted");
            }
            
            // Add items
            if (inventoryManager != null)
            {
                inventoryManager.AddItem("potion", 1);
            }
            
            Debug.Log("Testing overworld tutorial context");
        }
        
        /// <summary>
        /// Log current system state
        /// </summary>
        [ContextMenu("Log System State")]
        public void LogSystemState()
        {
            Debug.Log("=== Tutorial System State ===");
            
            if (flagManager != null)
            {
                Debug.Log($"ItemUsageTutorialCompleted: {flagManager.GetFlag("ItemUsageTutorialCompleted")}");
            }
            else
            {
                Debug.Log("OnboardingFlagManager: Not found");
            }
            
            if (inventoryManager != null)
            {
                var items = inventoryManager.GetAllItems();
                Debug.Log($"Inventory items: {items.Count()}");
                foreach (var (item, count) in items)
                {
                    Debug.Log($"  {item.DisplayName}: {count}");
                }
            }
            else
            {
                Debug.Log("InventoryManager: Not found");
            }
            
            if (battleController != null)
            {
                Debug.Log($"Battle active: {battleController.IsBattleActive}");
                Debug.Log($"Player turn: {battleController.IsPlayerTurn}");
                Debug.Log($"Solo mode: {battleController.IsSoloMode}");
            }
            else
            {
                Debug.Log("BattleController: Not found");
            }
            
            if (tutorialTrigger != null)
            {
                Debug.Log("TutorialTrigger: Found");
            }
            else
            {
                Debug.Log("TutorialTrigger: Not found");
            }
        }
    }
}