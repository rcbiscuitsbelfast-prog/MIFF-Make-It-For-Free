using UnityEngine;
using UnityEngine.Events;
using System.Linq;
using MIFF.Core;
using MIFF.Items;
using MIFF.UI;

namespace MIFF.Tutorials
{
    /// <summary>
    /// Triggers item usage tutorial when player first obtains usable items
    /// </summary>
    public class TutorialTrigger_ItemUsage : MonoBehaviour
    {
        [Header("Tutorial Settings")]
        [SerializeField] private bool enableOverworldTrigger = true;
        [SerializeField] private bool enableBattleTrigger = true;
        [SerializeField] private float tutorialDelay = 1.0f; // Delay before showing tutorial
        
        [Header("UI References")]
        [SerializeField] private ItemUsageTutorialUI tutorialUI;
        [SerializeField] private InventoryButton inventoryButton; // For highlighting
        
        [Header("Events")]
        [SerializeField] private UnityEvent onTutorialTriggered;
        [SerializeField] private UnityEvent onTutorialCompleted;
        
        private bool hasTriggeredTutorial = false;
        private bool isTutorialActive = false;
        private InventoryManager inventoryManager;
        private OnboardingFlagManager flagManager;
        
        private void Start()
        {
            inventoryManager = InventoryManager.Instance;
            flagManager = OnboardingFlagManager.Instance;
            
            if (inventoryManager != null)
            {
                inventoryManager.onInventoryChanged.AddListener(OnInventoryChanged);
            }
            
            if (flagManager != null)
            {
                flagManager.onFlagChanged.AddListener(OnFlagChanged);
            }
            
            // Find inventory button if not assigned
            if (inventoryButton == null)
            {
                inventoryButton = FindObjectOfType<InventoryButton>();
            }
            
            // Find tutorial UI if not assigned
            if (tutorialUI == null)
            {
                tutorialUI = FindObjectOfType<ItemUsageTutorialUI>();
            }
        }
        
        /// <summary>
        /// Handle inventory changes
        /// </summary>
        private void OnInventoryChanged(Dictionary<string, int> inventory)
        {
            if (hasTriggeredTutorial || isTutorialActive) return;
            
            // Check if player has usable items
            if (HasUsableItems())
            {
                // Check if tutorial hasn't been completed
                if (flagManager != null && !flagManager.GetFlag("ItemUsageTutorialCompleted"))
                {
                    // Trigger tutorial with delay
                    Invoke(nameof(TriggerTutorial), tutorialDelay);
                }
            }
        }
        
        /// <summary>
        /// Handle flag changes
        /// </summary>
        private void OnFlagChanged(string flagID, bool value)
        {
            if (flagID == "ItemUsageTutorialCompleted" && value)
            {
                hasTriggeredTutorial = true;
                onTutorialCompleted?.Invoke();
            }
        }
        
        /// <summary>
        /// Check if player has any usable items
        /// </summary>
        private bool HasUsableItems()
        {
            if (inventoryManager == null) return false;
            
            var battleItems = inventoryManager.GetBattleUsableItems();
            var overworldItems = inventoryManager.GetOverworldUsableItems();
            
            return battleItems.Any() || overworldItems.Any();
        }
        
        /// <summary>
        /// Trigger the item usage tutorial
        /// </summary>
        public void TriggerTutorial()
        {
            if (hasTriggeredTutorial || isTutorialActive) return;
            
            // Check if tutorial hasn't been completed
            if (flagManager != null && flagManager.GetFlag("ItemUsageTutorialCompleted"))
            {
                hasTriggeredTutorial = true;
                return;
            }
            
            // Check if we have usable items
            if (!HasUsableItems()) return;
            
            // Determine tutorial context
            TutorialContext context = DetermineTutorialContext();
            
            // Show tutorial
            ShowTutorial(context);
            
            onTutorialTriggered?.Invoke();
        }
        
        /// <summary>
        /// Determine the context for the tutorial
        /// </summary>
        private TutorialContext DetermineTutorialContext()
        {
            // Check if we're in battle
            var battleController = FindObjectOfType<BattleController>();
            if (battleController != null && battleController.IsBattleActive)
            {
                return TutorialContext.Battle;
            }
            
            // Check if we have battle-usable items (suggest battle context)
            if (inventoryManager != null)
            {
                var battleItems = inventoryManager.GetBattleUsableItems();
                if (battleItems.Any())
                {
                    return TutorialContext.Battle;
                }
            }
            
            return TutorialContext.Overworld;
        }
        
        /// <summary>
        /// Show the tutorial UI
        /// </summary>
        private void ShowTutorial(TutorialContext context)
        {
            if (tutorialUI == null)
            {
                Debug.LogWarning("ItemUsageTutorialUI not found! Cannot show tutorial.");
                return;
            }
            
            isTutorialActive = true;
            
            // Pause gameplay if needed
            PauseGameplay();
            
            // Show tutorial with appropriate context
            tutorialUI.ShowTutorial(context);
            
            // Highlight inventory button if available
            if (inventoryButton != null)
            {
                // This would integrate with your highlighting system
                // For now, just log the action
                Debug.Log("Highlighting inventory button for tutorial");
            }
        }
        
        /// <summary>
        /// Pause gameplay during tutorial
        /// </summary>
        private void PauseGameplay()
        {
            // This would integrate with your pause system
            // For now, just log the action
            Debug.Log("Pausing gameplay for item usage tutorial");
            
            // You could also:
            // - Set Time.timeScale = 0
            // - Disable player input
            // - Pause other game systems
        }
        
        /// <summary>
        /// Resume gameplay after tutorial
        /// </summary>
        private void ResumeGameplay()
        {
            // This would integrate with your pause system
            Debug.Log("Resuming gameplay after item usage tutorial");
            
            // You could also:
            // - Set Time.timeScale = 1
            // - Re-enable player input
            // - Resume other game systems
        }
        
        /// <summary>
        /// Complete the tutorial
        /// </summary>
        public void CompleteTutorial()
        {
            if (!isTutorialActive) return;
            
            isTutorialActive = false;
            hasTriggeredTutorial = true;
            
            // Set the completion flag
            if (flagManager != null)
            {
                flagManager.SetFlag("ItemUsageTutorialCompleted", true);
            }
            
            // Resume gameplay
            ResumeGameplay();
            
            onTutorialCompleted?.Invoke();
            
            Debug.Log("Item usage tutorial completed");
        }
        
        /// <summary>
        /// Skip the tutorial
        /// </summary>
        public void SkipTutorial()
        {
            if (!isTutorialActive) return;
            
            isTutorialActive = false;
            hasTriggeredTutorial = true;
            
            // Set the completion flag (even when skipped)
            if (flagManager != null)
            {
                flagManager.SetFlag("ItemUsageTutorialCompleted", true);
            }
            
            // Resume gameplay
            ResumeGameplay();
            
            onTutorialCompleted?.Invoke();
            
            Debug.Log("Item usage tutorial skipped");
        }
        
        /// <summary>
        /// Force trigger tutorial (for testing)
        /// </summary>
        [ContextMenu("Force Trigger Tutorial")]
        public void ForceTriggerTutorial()
        {
            hasTriggeredTutorial = false;
            TriggerTutorial();
        }
        
        /// <summary>
        /// Reset tutorial state (for testing)
        /// </summary>
        [ContextMenu("Reset Tutorial State")]
        public void ResetTutorialState()
        {
            hasTriggeredTutorial = false;
            isTutorialActive = false;
            
            if (flagManager != null)
            {
                flagManager.ResetFlag("ItemUsageTutorialCompleted");
            }
        }
    }
    
    /// <summary>
    /// Context for the tutorial
    /// </summary>
    public enum TutorialContext
    {
        Overworld,
        Battle
    }
}