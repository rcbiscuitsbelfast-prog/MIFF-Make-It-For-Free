using UnityEngine;
using System.Collections.Generic;

namespace MIFF.Quests
{
    /// <summary>
    /// ScriptableObject defining quest objectives and rewards
    /// </summary>
    [CreateAssetMenu(fileName = "New Quest Objective", menuName = "MIFF/Quests/QuestObjective")]
    public class QuestObjective_SO : ScriptableObject
    {
        [Header("Quest Identity")]
        [SerializeField] private string questID;
        [SerializeField] private string questTitle;
        [TextArea(3, 5)]
        [SerializeField] private string questDescription;
        [SerializeField] private string questCategory = "Main";
        [SerializeField] private int questPriority = 0;
        
        [Header("Trigger Conditions")]
        [SerializeField] private List<QuestTrigger> triggers = new List<QuestTrigger>();
        [SerializeField] private bool requireAllTriggers = true;
        
        [Header("Rewards")]
        [SerializeField] private List<QuestReward> rewards = new List<QuestReward>();
        [SerializeField] private bool grantAllRewards = true;
        
        [Header("Onboarding Flags")]
        [SerializeField] private List<string> flagsToSet = new List<string>();
        [SerializeField] private List<string> flagsToCheck = new List<string>();
        
        [Header("Quest State")]
        [SerializeField] private bool isRepeatable = false;
        [SerializeField] private bool isHidden = false;
        [SerializeField] private string prerequisiteQuestID = "";
        
        // Properties
        public string QuestID => questID;
        public string QuestTitle => questTitle;
        public string QuestDescription => questDescription;
        public string QuestCategory => questCategory;
        public int QuestPriority => questPriority;
        public List<QuestTrigger> Triggers => triggers;
        public bool RequireAllTriggers => requireAllTriggers;
        public List<QuestReward> Rewards => rewards;
        public bool GrantAllRewards => grantAllRewards;
        public List<string> FlagsToSet => flagsToSet;
        public List<string> FlagsToCheck => flagsToCheck;
        public bool IsRepeatable => isRepeatable;
        public bool IsHidden => isHidden;
        public string PrerequisiteQuestID => prerequisiteQuestID;
        
        private void OnValidate()
        {
            // Ensure questID is unique and not empty
            if (string.IsNullOrEmpty(questID))
            {
                questID = name.ToLower().Replace(" ", "_");
            }
            
            // Ensure questTitle is not empty
            if (string.IsNullOrEmpty(questTitle))
            {
                questTitle = name;
            }
            
            // Validate triggers
            ValidateTriggers();
            
            // Validate rewards
            ValidateRewards();
        }
        
        /// <summary>
        /// Validate quest triggers
        /// </summary>
        private void ValidateTriggers()
        {
            foreach (var trigger in triggers)
            {
                if (trigger == null) continue;
                
                switch (trigger.triggerType)
                {
                    case QuestTriggerType.BattleSync:
                        if (trigger.battleSyncThreshold <= 0)
                        {
                            Debug.LogWarning($"Quest {questID}: BattleSync threshold must be positive");
                        }
                        break;
                        
                    case QuestTriggerType.QuestFlag:
                        if (string.IsNullOrEmpty(trigger.questFlagID))
                        {
                            Debug.LogWarning($"Quest {questID}: QuestFlag requires flag ID");
                        }
                        break;
                        
                    case QuestTriggerType.ItemCollected:
                        if (string.IsNullOrEmpty(trigger.itemID))
                        {
                            Debug.LogWarning($"Quest {questID}: ItemCollected requires item ID");
                        }
                        break;
                        
                    case QuestTriggerType.BattleWon:
                        if (string.IsNullOrEmpty(trigger.battleID))
                        {
                            Debug.LogWarning($"Quest {questID}: BattleWon requires battle ID");
                        }
                        break;
                        
                    case QuestTriggerType.SpiritLevel:
                        if (trigger.spiritLevelThreshold <= 0)
                        {
                            Debug.LogWarning($"Quest {questID}: SpiritLevel threshold must be positive");
                        }
                        break;
                }
            }
        }
        
        /// <summary>
        /// Validate quest rewards
        /// </summary>
        private void ValidateRewards()
        {
            foreach (var reward in rewards)
            {
                if (reward == null) continue;
                
                switch (reward.rewardType)
                {
                    case QuestRewardType.Evolution:
                        if (string.IsNullOrEmpty(reward.evolutionTargetSpeciesID))
                        {
                            Debug.LogWarning($"Quest {questID}: Evolution reward requires target species ID");
                        }
                        break;
                        
                    case QuestRewardType.Item:
                        if (string.IsNullOrEmpty(reward.itemID))
                        {
                            Debug.LogWarning($"Quest {questID}: Item reward requires item ID");
                        }
                        if (reward.itemAmount <= 0)
                        {
                            Debug.LogWarning($"Quest {questID}: Item reward amount must be positive");
                        }
                        break;
                        
                    case QuestRewardType.Experience:
                        if (reward.experienceAmount <= 0)
                        {
                            Debug.LogWarning($"Quest {questID}: Experience reward amount must be positive");
                        }
                        break;
                        
                    case QuestTriggerType.SyncPoints:
                        if (reward.syncPointsAmount <= 0)
                        {
                            Debug.LogWarning($"Quest {questID}: SyncPoints reward amount must be positive");
                        }
                        break;
                }
            }
        }
        
        /// <summary>
        /// Check if quest requirements are met
        /// </summary>
        public bool CheckRequirements(QuestContext context)
        {
            if (context == null) return false;
            
            // Check prerequisite quest
            if (!string.IsNullOrEmpty(prerequisiteQuestID))
            {
                var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
                if (flagManager == null || !flagManager.GetFlag($"Quest_{prerequisiteQuestID}_Completed"))
                {
                    return false; // Prerequisite not met
                }
            }
            
            // Check required flags
            foreach (var flagID in flagsToCheck)
            {
                var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
                if (flagManager == null || !flagManager.GetFlag(flagID))
                {
                    return false; // Required flag not set
                }
            }
            
            // Check triggers
            if (triggers.Count == 0) return true; // No triggers required
            
            if (requireAllTriggers)
            {
                // All triggers must be met
                foreach (var trigger in triggers)
                {
                    if (!trigger.CheckTrigger(context))
                    {
                        return false;
                    }
                }
                return true;
            }
            else
            {
                // At least one trigger must be met
                foreach (var trigger in triggers)
                {
                    if (trigger.CheckTrigger(context))
                    {
                        return true;
                    }
                }
                return false;
            }
        }
        
        /// <summary>
        /// Grant all quest rewards
        /// </summary>
        public void GrantRewards(QuestContext context)
        {
            if (context == null) return;
            
            foreach (var reward in rewards)
            {
                if (reward != null)
                {
                    reward.GrantReward(context);
                }
            }
            
            // Set completion flags
            SetCompletionFlags();
        }
        
        /// <summary>
        /// Set quest completion flags
        /// </summary>
        private void SetCompletionFlags()
        {
            var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
            if (flagManager == null) return;
            
            // Set quest completion flag
            flagManager.SetFlag($"Quest_{questID}_Completed", true);
            
            // Set custom flags
            foreach (var flagID in flagsToSet)
            {
                flagManager.SetFlag(flagID, true);
            }
        }
        
        /// <summary>
        /// Get quest summary
        /// </summary>
        public string GetQuestSummary()
        {
            return $"{questTitle} ({questCategory}) - Priority: {questPriority}";
        }
        
        /// <summary>
        /// Get quest status description
        /// </summary>
        public string GetQuestStatusDescription()
        {
            var status = new List<string>();
            
            if (triggers.Count > 0)
            {
                var triggerDesc = requireAllTriggers ? "All" : "Any";
                status.Add($"Requires {triggerDesc} triggers");
            }
            
            if (rewards.Count > 0)
            {
                var rewardDesc = grantAllRewards ? "All" : "Any";
                status.Add($"Grants {rewardDesc} rewards");
            }
            
            if (flagsToSet.Count > 0)
            {
                status.Add($"Sets {flagsToSet.Count} flags");
            }
            
            return string.Join(", ", status);
        }
    }
    
    /// <summary>
    /// Types of quest triggers
    /// </summary>
    public enum QuestTriggerType
    {
        BattleSync,      // Battle sync reaches threshold
        QuestFlag,       // Specific quest flag is set
        ItemCollected,   // Specific item is collected
        BattleWon,       // Specific battle is won
        SpiritLevel      // Spirit reaches level threshold
    }
    
    /// <summary>
    /// Types of quest rewards
    /// </summary>
    public enum QuestRewardType
    {
        Evolution,       // Grant evolution to spirit
        Item,            // Grant item to inventory
        Experience,      // Grant experience points
        SyncPoints       // Grant sync points
    }
    
    /// <summary>
    /// Quest trigger condition
    /// </summary>
    [System.Serializable]
    public class QuestTrigger
    {
        [Header("Trigger Type")]
        public QuestTriggerType triggerType;
        
        [Header("Trigger Parameters")]
        public float battleSyncThreshold = 50.0f;
        public string questFlagID = "";
        public string itemID = "";
        public string battleID = "";
        public int spiritLevelThreshold = 10;
        
        /// <summary>
        /// Check if trigger condition is met
        /// </summary>
        public bool CheckTrigger(QuestContext context)
        {
            if (context == null) return false;
            
            switch (triggerType)
            {
                case QuestTriggerType.BattleSync:
                    return context.battleSync >= battleSyncThreshold;
                    
                case QuestTriggerType.QuestFlag:
                    var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
                    return flagManager != null && flagManager.GetFlag(questFlagID);
                    
                case QuestTriggerType.ItemCollected:
                    var inventoryManager = MIFF.Items.InventoryManager.Instance;
                    return inventoryManager != null && inventoryManager.GetItemCount(itemID) > 0;
                    
                case QuestTriggerType.BattleWon:
                    var flagManager2 = MIFF.Core.OnboardingFlagManager.Instance;
                    return flagManager2 != null && flagManager2.GetFlag($"Battle_{battleID}_Won");
                    
                case QuestTriggerType.SpiritLevel:
                    return context.highestSpiritLevel >= spiritLevelThreshold;
                    
                default:
                    return false;
            }
        }
        
        /// <summary>
        /// Get trigger description
        /// </summary>
        public string GetTriggerDescription()
        {
            switch (triggerType)
            {
                case QuestTriggerType.BattleSync:
                    return $"Reach {battleSyncThreshold}% battle sync";
                    
                case QuestTriggerType.QuestFlag:
                    return $"Complete quest: {questFlagID}";
                    
                case QuestTriggerType.ItemCollected:
                    return $"Collect item: {itemID}";
                    
                case QuestTriggerType.BattleWon:
                    return $"Win battle: {battleID}";
                    
                case QuestTriggerType.SpiritLevel:
                    return $"Reach level {spiritLevelThreshold} with any spirit";
                    
                default:
                    return "Unknown trigger";
            }
        }
    }
    
    /// <summary>
    /// Quest reward
    /// </summary>
    [System.Serializable]
    public class QuestReward
    {
        [Header("Reward Type")]
        public QuestRewardType rewardType;
        
        [Header("Reward Parameters")]
        public string evolutionTargetSpeciesID = "";
        public string itemID = "";
        public int itemAmount = 1;
        public int experienceAmount = 100;
        public float syncPointsAmount = 25.0f;
        
        /// <summary>
        /// Grant the reward
        /// </summary>
        public void GrantReward(QuestContext context)
        {
            if (context == null) return;
            
            switch (rewardType)
            {
                case QuestRewardType.Evolution:
                    var evolutionManager = MIFF.Evolution.EvolutionManager.Instance;
                    if (evolutionManager != null)
                    {
                        var questContext = MIFF.Evolution.EvolutionContext.CreateQuestContext(context.questID);
                        evolutionManager.GrantEvolutionFromQuest(evolutionTargetSpeciesID, questContext);
                    }
                    break;
                    
                case QuestRewardType.Item:
                    var inventoryManager = MIFF.Items.InventoryManager.Instance;
                    if (inventoryManager != null)
                    {
                        inventoryManager.AddItem(itemID, itemAmount);
                    }
                    break;
                    
                case QuestRewardType.Experience:
                    // This would integrate with your experience system
                    Debug.Log($"Granted {experienceAmount} experience points");
                    break;
                    
                case QuestRewardType.SyncPoints:
                    // This would integrate with your sync system
                    Debug.Log($"Granted {syncPointsAmount} sync points");
                    break;
            }
        }
        
        /// <summary>
        /// Get reward description
        /// </summary>
        public string GetRewardDescription()
        {
            switch (rewardType)
            {
                case QuestRewardType.Evolution:
                    return $"Evolve to {evolutionTargetSpeciesID}";
                    
                case QuestRewardType.Item:
                    return $"{itemAmount}x {itemID}";
                    
                case QuestRewardType.Experience:
                    return $"{experienceAmount} experience points";
                    
                case QuestRewardType.SyncPoints:
                    return $"{syncPointsAmount} sync points";
                    
                default:
                    return "Unknown reward";
            }
        }
    }
}