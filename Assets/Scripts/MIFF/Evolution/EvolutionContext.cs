using UnityEngine;

namespace MIFF.Evolution
{
    /// <summary>
    /// Context information for evolution checks
    /// </summary>
    [System.Serializable]
    public class EvolutionContext
    {
        [Header("Trigger Information")]
        public string triggeringItemID = "";
        public string battleConditionID = "";
        public string questFlagID = "";
        
        [Header("Battle Context")]
        public bool isInBattle = false;
        public bool battleWon = false;
        public bool noDamageTaken = false;
        public int turnsTaken = 0;
        public float battleDuration = 0f;
        
        [Header("Quest Context")]
        public string completedQuestID = "";
        public bool questCompleted = false;
        
        [Header("Item Context")]
        public string usedItemID = "";
        public bool itemUsed = false;
        
        /// <summary>
        /// Create context for sync threshold evolution
        /// </summary>
        public static EvolutionContext CreateSyncContext()
        {
            return new EvolutionContext();
        }
        
        /// <summary>
        /// Create context for quest flag evolution
        /// </summary>
        public static EvolutionContext CreateQuestContext(string questID)
        {
            return new EvolutionContext
            {
                questFlagID = questID,
                questCompleted = true
            };
        }
        
        /// <summary>
        /// Create context for item use evolution
        /// </summary>
        public static EvolutionContext CreateItemContext(string itemID)
        {
            return new EvolutionContext
            {
                triggeringItemID = itemID,
                usedItemID = itemID,
                itemUsed = true
            };
        }
        
        /// <summary>
        /// Create context for battle condition evolution
        /// </summary>
        public static EvolutionContext CreateBattleContext(string conditionID, bool won, bool noDamage, int turns, float duration)
        {
            return new EvolutionContext
            {
                battleConditionID = conditionID,
                isInBattle = true,
                battleWon = won,
                noDamageTaken = noDamage,
                turnsTaken = turns,
                battleDuration = duration
            };
        }
        
        /// <summary>
        /// Check if a specific battle condition is met
        /// </summary>
        public bool CheckBattleCondition(string conditionID)
        {
            if (battleConditionID != conditionID) return false;
            
            switch (conditionID)
            {
                case "win_without_damage":
                    return battleWon && noDamageTaken;
                    
                case "win_quick_battle":
                    return battleWon && turnsTaken <= 3;
                    
                case "win_perfect_battle":
                    return battleWon && noDamageTaken && turnsTaken <= 2;
                    
                case "survive_long_battle":
                    return battleDuration >= 60f; // 60 seconds
                    
                default:
                    return false;
            }
        }
        
        /// <summary>
        /// Get a description of the current context
        /// </summary>
        public string GetContextDescription()
        {
            if (!string.IsNullOrEmpty(triggeringItemID))
            {
                return $"Item used: {triggeringItemID}";
            }
            
            if (!string.IsNullOrEmpty(battleConditionID))
            {
                return $"Battle condition: {battleConditionID}";
            }
            
            if (!string.IsNullOrEmpty(questFlagID))
            {
                return $"Quest completed: {questFlagID}";
            }
            
            return "Sync threshold reached";
        }
    }
}