using UnityEngine;
using UnityEngine.Events;
using MIFF.Core;
using MIFF.Items;

namespace MIFF.Battle
{
    /// <summary>
    /// Basic battle controller for item integration
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
        
        [Header("References")]
        [SerializeField] private BagUIController bagUI;
        
        public bool IsBattleActive => isBattleActive;
        public bool IsPlayerTurn => isPlayerTurn;
        public bool IsSoloMode => isSoloMode;
        
        private void Start()
        {
            if (bagUI != null)
            {
                bagUI.SetBattleController(this);
                bagUI.SetBattleContext(true, isSoloMode);
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
            
            Debug.Log($"Turn advanced. Player turn: {isPlayerTurn}");
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
    }
}