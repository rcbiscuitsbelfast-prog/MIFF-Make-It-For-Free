using UnityEngine;

namespace MIFF.Quests
{
    /// <summary>
    /// Context information for quest checking and reward granting
    /// </summary>
    [System.Serializable]
    public class QuestContext
    {
        [Header("Quest Information")]
        public string questID = "";
        public string questTitle = "";
        public bool isQuestCompleted = false;
        
        [Header("Battle Context")]
        public float battleSync = 0f;
        public bool battleWon = false;
        public string battleID = "";
        public int battleTurns = 0;
        public float battleDuration = 0f;
        
        [Header("Player Context")]
        public int highestSpiritLevel = 1;
        public int totalSpirits = 0;
        public float totalSync = 0f;
        
        [Header("Item Context")]
        public string lastCollectedItem = "";
        public int itemsCollectedThisSession = 0;
        
        [Header("Session Context")]
        public float sessionDuration = 0f;
        public int battlesFought = 0;
        public int questsCompleted = 0;
        
        /// <summary>
        /// Create context for battle sync quest
        /// </summary>
        public static QuestContext CreateBattleSyncContext(string questID, float sync, bool won, string battleID)
        {
            return new QuestContext
            {
                questID = questID,
                battleSync = sync,
                battleWon = won,
                battleID = battleID
            };
        }
        
        /// <summary>
        /// Create context for quest flag quest
        /// </summary>
        public static QuestContext CreateQuestFlagContext(string questID, string flagID)
        {
            return new QuestContext
            {
                questID = questID
            };
        }
        
        /// <summary>
        /// Create context for item collection quest
        /// </summary>
        public static QuestContext CreateItemCollectionContext(string questID, string itemID)
        {
            return new QuestContext
            {
                questID = questID,
                lastCollectedItem = itemID,
                itemsCollectedThisSession = 1
            };
        }
        
        /// <summary>
        /// Create context for battle victory quest
        /// </summary>
        public static QuestContext CreateBattleVictoryContext(string questID, string battleID, int turns, float duration)
        {
            return new QuestContext
            {
                questID = questID,
                battleID = battleID,
                battleWon = true,
                battleTurns = turns,
                battleDuration = duration
            };
        }
        
        /// <summary>
        /// Create context for spirit level quest
        /// </summary>
        public static QuestContext CreateSpiritLevelContext(string questID, int level)
        {
            return new QuestContext
            {
                questID = questID,
                highestSpiritLevel = level
            };
        }
        
        /// <summary>
        /// Create general quest context
        /// </summary>
        public static QuestContext CreateGeneralContext(string questID, string questTitle = "")
        {
            return new QuestContext
            {
                questID = questID,
                questTitle = questTitle
            };
        }
        
        /// <summary>
        /// Update battle context
        /// </summary>
        public void UpdateBattleContext(float sync, bool won, string battleID, int turns, float duration)
        {
            battleSync = sync;
            battleWon = won;
            this.battleID = battleID;
            battleTurns = turns;
            battleDuration = duration;
            battlesFought++;
        }
        
        /// <summary>
        /// Update player context
        /// </summary>
        public void UpdatePlayerContext(int spiritLevel, int totalSpirits, float totalSync)
        {
            if (spiritLevel > highestSpiritLevel)
            {
                highestSpiritLevel = spiritLevel;
            }
            
            this.totalSpirits = totalSpirits;
            this.totalSync = totalSync;
        }
        
        /// <summary>
        /// Update item context
        /// </summary>
        public void UpdateItemContext(string itemID)
        {
            lastCollectedItem = itemID;
            itemsCollectedThisSession++;
        }
        
        /// <summary>
        /// Mark quest as completed
        /// </summary>
        public void MarkCompleted()
        {
            isQuestCompleted = true;
            questsCompleted++;
        }
        
        /// <summary>
        /// Get a description of the current context
        /// </summary>
        public string GetContextDescription()
        {
            var descriptions = new System.Collections.Generic.List<string>();
            
            if (battleSync > 0)
            {
                descriptions.Add($"Battle sync: {battleSync:F1}%");
            }
            
            if (!string.IsNullOrEmpty(battleID))
            {
                descriptions.Add($"Battle: {battleID}");
            }
            
            if (highestSpiritLevel > 1)
            {
                descriptions.Add($"Highest level: {highestSpiritLevel}");
            }
            
            if (!string.IsNullOrEmpty(lastCollectedItem))
            {
                descriptions.Add($"Last item: {lastCollectedItem}");
            }
            
            if (descriptions.Count > 0)
            {
                return string.Join(", ", descriptions);
            }
            
            return "No specific context";
        }
        
        /// <summary>
        /// Get quest progress summary
        /// </summary>
        public string GetProgressSummary()
        {
            var progress = new System.Collections.Generic.List<string>();
            
            if (battlesFought > 0)
            {
                progress.Add($"{battlesFought} battles fought");
            }
            
            if (questsCompleted > 0)
            {
                progress.Add($"{questsCompleted} quests completed");
            }
            
            if (itemsCollectedThisSession > 0)
            {
                progress.Add($"{itemsCollectedThisSession} items collected");
            }
            
            if (progress.Count > 0)
            {
                return string.Join(", ", progress);
            }
            
            return "No progress yet";
        }
    }
}