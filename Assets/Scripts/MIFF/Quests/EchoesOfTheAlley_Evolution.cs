using UnityEngine;
using MIFF.Quests;

namespace MIFF.Quests
{
    /// <summary>
    /// Echoes of the Alley - First Evolution Quest
    /// 
    /// This quest introduces players to the evolution system through a combination of:
    /// - Battle sync achievement
    /// - Quest flag completion
    /// - Evolution reward
    /// - Moonlight Amulet item reward
    /// 
    /// The quest is designed to be non-coder friendly and fully data-driven.
    /// </summary>
    [CreateAssetMenu(fileName = "EchoesOfTheAlley_Evolution", menuName = "MIFF/Quests/Echoes of the Alley Evolution")]
    public class EchoesOfTheAlley_Evolution : QuestObjective_SO
    {
        private void Awake()
        {
            // Set quest identity
            questID = "echoes_of_the_alley_evolution";
            questTitle = "Echoes of the Alley";
            questDescription = "The mysterious Moonlight Alley holds secrets of evolution. Prove your worth through battle or complete the dance challenge to unlock your spirit's true potential.";
            questCategory = "Tutorial";
            questPriority = 1;
            
            // Set triggers (either battle sync OR quest flag)
            requireAllTriggers = false; // Only one trigger needs to be met
            
            // Trigger 1: Battle sync threshold
            var battleSyncTrigger = new QuestTrigger
            {
                triggerType = QuestTriggerType.BattleSync,
                battleSyncThreshold = 75.0f
            };
            
            // Trigger 2: Quest flag (alternative path)
            var questFlagTrigger = new QuestTrigger
            {
                triggerType = QuestTriggerType.QuestFlag,
                questFlagID = "WonDanceBattle_Stage1"
            };
            
            // Add triggers to quest
            triggers.Add(battleSyncTrigger);
            triggers.Add(questFlagTrigger);
            
            // Set rewards
            // Reward 1: Evolution
            var evolutionReward = new QuestReward
            {
                rewardType = QuestRewardType.Evolution,
                evolutionTargetSpeciesID = "starter_spirit_evolved"
            };
            
            // Reward 2: Moonlight Amulet item
            var itemReward = new QuestReward
            {
                rewardType = QuestRewardType.Item,
                itemID = "moonlight_amulet",
                itemAmount = 1
            };
            
            // Add rewards to quest
            rewards.Add(evolutionReward);
            rewards.Add(itemReward);
            
            // Set onboarding flags
            flagsToSet.Add("FirstEvolutionSeen");
            flagsToSet.Add("EchoesOfTheAlley_Completed");
            
            // Quest state
            isRepeatable = false;
            isHidden = false;
            prerequisiteQuestID = ""; // No prerequisites for first evolution quest
        }
        
        /// <summary>
        /// Get quest summary for display
        /// </summary>
        public string GetQuestSummary()
        {
            return "Echoes of the Alley - First Evolution Quest";
        }
        
        /// <summary>
        /// Get quest description for display
        /// </summary>
        public string GetQuestDescription()
        {
            return "The mysterious Moonlight Alley holds secrets of evolution. Prove your worth through battle or complete the dance challenge to unlock your spirit's true potential.";
        }
        
        /// <summary>
        /// Get quest requirements description
        /// </summary>
        public string GetQuestRequirementsDescription()
        {
            return "Reach 75% battle sync OR complete the Stage 1 dance battle";
        }
        
        /// <summary>
        /// Get quest rewards description
        /// </summary>
        public string GetQuestRewardsDescription()
        {
            return "Evolve your starter spirit + Receive Moonlight Amulet";
        }
        
        /// <summary>
        /// Check if quest is available (for non-coder customization)
        /// </summary>
        public bool IsQuestAvailable()
        {
            // Check if this is the first time playing
            var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
            if (flagManager == null) return true;
            
            // Don't show if already completed
            if (flagManager.GetFlag("EchoesOfTheAlley_Completed"))
            {
                return false;
            }
            
            // Don't show if evolution already seen
            if (flagManager.GetFlag("FirstEvolutionSeen"))
            {
                return false;
            }
            
            return true;
        }
        
        /// <summary>
        /// Get quest difficulty rating (for non-coder customization)
        /// </summary>
        public string GetQuestDifficulty()
        {
            return "Beginner";
        }
        
        /// <summary>
        /// Get estimated completion time (for non-coder customization)
        /// </summary>
        public string GetEstimatedTime()
        {
            return "5-10 minutes";
        }
        
        /// <summary>
        /// Get quest category (for non-coder customization)
        /// </summary>
        public string GetQuestCategory()
        {
            return "Tutorial";
        }
        
        /// <summary>
        /// Get quest tags (for non-coder customization)
        /// </summary>
        public string[] GetQuestTags()
        {
            return new string[] { "tutorial", "evolution", "battle", "dance", "moonlight_alley" };
        }
        
        /// <summary>
        /// Get quest lore (for non-coder customization)
        /// </summary>
        public string GetQuestLore()
        {
            return "Moonlight Alley is said to be a place where spirits gather under the pale light of the moon. " +
                   "Those who prove their worth through battle or dance may unlock the secrets of evolution hidden within its ancient walls. " +
                   "The alley whispers of bonds formed and potential unlocked, waiting for the right spirit and trainer to discover its mysteries.";
        }
        
        /// <summary>
        /// Get quest hints (for non-coder customization)
        /// </summary>
        public string[] GetQuestHints()
        {
            return new string[]
            {
                "Focus on building sync with your spirit during battles",
                "Try different battle strategies to increase your sync percentage",
                "The dance challenge offers an alternative path to evolution",
                "Keep your spirit healthy to maintain high sync levels"
            };
        }
        
        /// <summary>
        /// Get quest completion message (for non-coder customization)
        /// </summary>
        public string GetQuestCompletionMessage()
        {
            return "Congratulations! You've unlocked the secrets of Moonlight Alley and witnessed your first evolution. " +
                   "Your bond with your spirit has grown stronger, revealing new potential. " +
                   "The Moonlight Amulet you received can be used to trigger future evolutions. " +
                   "Continue exploring to discover more evolution paths and unlock your spirits' true power!";
        }
        
        /// <summary>
        /// Get quest failure message (for non-coder customization)
        /// </summary>
        public string GetQuestFailureMessage()
        {
            return "Don't give up! Evolution requires patience and strong bonds. " +
                   "Keep practicing your battle skills and building sync with your spirit. " +
                   "The secrets of Moonlight Alley will reveal themselves when you're ready.";
        }
        
        /// <summary>
        /// Get quest progress tracking (for non-coder customization)
        /// </summary>
        public string GetQuestProgressTracking()
        {
            return "Track your progress: Battle sync percentage and dance battle completion status";
        }
        
        /// <summary>
        /// Get quest rewards breakdown (for non-coder customization)
        /// </summary>
        public string GetQuestRewardsBreakdown()
        {
            return "1. Evolution: Your starter spirit evolves to its next form\n" +
                   "2. Moonlight Amulet: A special item that can trigger future evolutions\n" +
                   "3. Experience: Gain valuable experience with the evolution system\n" +
                   "4. Achievement: Unlock the 'First Evolution' milestone";
        }
    }
}