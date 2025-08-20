using UnityEngine;
using UnityEngine.Events;
using MIFF.Core;
using MIFF.Items;
using MIFF.Tutorials;
using System.Linq;

namespace MIFF.Battle
{
    /// <summary>
    /// Basic battle controller for item integration with tutorial support
    /// </summary>
    public class BattleController : MonoBehaviour
    {
        [Header("Battle State")]
        [SerializeField] private bool isBattleActive = false;
        [SerializeField] private bool isPlayerTurn = false;
        [SerializeField] private bool isSoloMode = false;
        
        [Header("Events")]
        [SerializeField] private UnityEvent<Item_SO> onItemUsed;
        [SerializeField] private UnityEvent onTurnAdvanced;
        [SerializeField] private UnityEvent onPlayerTurnStarted;
        
        [Header("References")]
        [SerializeField] private BagUIController bagUI;
        [SerializeField] private TutorialTrigger_ItemUsage tutorialTrigger;
        
        [Header("Tutorial Integration")]
        [SerializeField] private bool enableBattleTutorial = true;
        
        public bool IsBattleActive => isBattleActive;
        public bool IsPlayerTurn => isPlayerTurn;
        public bool IsSoloMode => isSoloMode;
        
        private OnboardingFlagManager flagManager;
        private InventoryManager inventoryManager;
        
        private void Start()
        {
            flagManager = OnboardingFlagManager.Instance;
            inventoryManager = InventoryManager.Instance;
            
            if (bagUI != null)
            {
                bagUI.SetBattleController(this);
                bagUI.SetBattleContext(true, isSoloMode);
            }
            
            // Find tutorial trigger if not assigned
            if (tutorialTrigger == null)
            {
                tutorialTrigger = FindObjectOfType<TutorialTrigger_ItemUsage>();
            }
        }
        
        /// <summary>
        /// Start a battle
        /// </summary>
        public void StartBattle(bool soloMode = false)
        {
            isBattleActive = true;
            isSoloMode = soloMode;
            isPlayerTurn = true;
            
            if (bagUI != null)
            {
                bagUI.SetBattleContext(true, soloMode);
            }
            
            Debug.Log($"Battle started. Solo mode: {soloMode}");
            
            // Check for tutorial trigger on first player turn
            CheckForTutorialTrigger();
        }
        
        /// <summary>
        /// End the current battle
        /// </summary>
        public void EndBattle()
        {
            isBattleActive = false;
            isPlayerTurn = false;
            
            if (bagUI != null)
            {
                bagUI.SetBattleContext(false, false);
            }
            
            Debug.Log("Battle ended");
        }
        
        /// <summary>
        /// Start player turn
        /// </summary>
        public void StartPlayerTurn()
        {
            isPlayerTurn = true;
            onPlayerTurnStarted?.Invoke();
            
            Debug.Log("Player turn started");
            
            // Check for tutorial trigger on player turn
            CheckForTutorialTrigger();
        }
        
        /// <summary>
        /// End player turn
        /// </summary>
        public void EndPlayerTurn()
        {
            isPlayerTurn = false;
            Debug.Log("Player turn ended");
        }
        
        /// <summary>
        /// Receive a player action (item use)
        /// </summary>
        public void ReceivePlayerAction(Item_SO item)
        {
            if (!isBattleActive || !isPlayerTurn) return;
            
            Debug.Log($"Player used {item.DisplayName} in battle");
            
            onItemUsed?.Invoke(item);
            
            // Advance turn
            AdvanceTurn();
        }
        
        /// <summary>
        /// Advance to the next turn
        /// </summary>
        public void AdvanceTurn()
        {
            isPlayerTurn = !isPlayerTurn;
            onTurnAdvanced?.Invoke();
            
            if (isPlayerTurn)
            {
                StartPlayerTurn();
            }
            else
            {
                EndPlayerTurn();
            }
            
            Debug.Log($"Turn advanced. Player turn: {isPlayerTurn}");
        }
        
        /// <summary>
        /// Check if tutorial should be triggered
        /// </summary>
        private void CheckForTutorialTrigger()
        {
            if (!enableBattleTutorial) return;
            if (tutorialTrigger == null) return;
            if (flagManager == null) return;
            
            // Check if tutorial hasn't been completed
            if (flagManager.GetFlag("ItemUsageTutorialCompleted"))
            {
                return; // Tutorial already completed
            }
            
            // Check if player has usable items
            if (inventoryManager != null && HasUsableItems())
            {
                // Trigger tutorial in battle context
                Debug.Log("Triggering item usage tutorial in battle context");
                tutorialTrigger.TriggerTutorial();
            }
        }
        
        /// <summary>
        /// Check if player has usable items
        /// </summary>
        private bool HasUsableItems()
        {
            if (inventoryManager == null) return false;
            
            var battleItems = inventoryManager.GetBattleUsableItems();
            return battleItems.Any();
        }
        
        /// <summary>
        /// Set solo mode
        /// </summary>
        public void SetSoloMode(bool solo)
        {
            isSoloMode = solo;
            
            if (bagUI != null)
            {
                bagUI.SetBattleContext(isBattleActive, solo);
            }
        }
        
        /// <summary>
        /// Check if items can be used
        /// </summary>
        public bool CanUseItems()
        {
            return isBattleActive && isPlayerTurn;
        }
        
        /// <summary>
        /// Force start player turn (for testing)
        /// </summary>
        [ContextMenu("Force Start Player Turn")]
        public void ForceStartPlayerTurn()
        {
            StartPlayerTurn();
        }
        
        /// <summary>
        /// Force end player turn (for testing)
        /// </summary>
        [ContextMenu("Force End Player Turn")]
        public void ForceEndPlayerTurn()
        {
            EndPlayerTurn();
        }
    }
}