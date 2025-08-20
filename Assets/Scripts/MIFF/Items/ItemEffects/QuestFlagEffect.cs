using UnityEngine;
using MIFF.Core;

namespace MIFF.Items.ItemEffects
{
    /// <summary>
    /// Item effect that sets quest flags or progresses quests
    /// </summary>
    [CreateAssetMenu(fileName = "QuestFlag Effect", menuName = "MIFF/Items/Effects/QuestFlag")]
    public class QuestFlagEffect : ScriptableObject, IItemEffect
    {
        [Header("Quest Properties")]
        [SerializeField] private string questID;
        [SerializeField] private string flagName;
        [SerializeField] private bool flagValue = true;
        [SerializeField] private bool advanceQuest = false;
        [SerializeField] private string questStepID;
        
        public void Apply(PlayerContext playerContext, TargetContext targetContext)
        {
            // This would integrate with your quest system
            // For now, we'll just log the action
            
            if (advanceQuest && !string.IsNullOrEmpty(questStepID))
            {
                Debug.Log($"Advanced quest {questID} to step {questStepID}");
                // QuestManager.Instance?.AdvanceQuest(questID, questStepID);
            }
            
            if (!string.IsNullOrEmpty(flagName))
            {
                Debug.Log($"Set quest flag {questID}.{flagName} to {flagValue}");
                // QuestManager.Instance?.SetQuestFlag(questID, flagName, flagValue);
            }
            
            // Could also trigger quest events, update UI, etc.
        }
        
        public string GetEffectDescription()
        {
            if (advanceQuest)
            {
                return $"Advances quest '{questID}' to the next step";
            }
            else
            {
                return $"Sets quest flag '{questID}.{flagName}' to {flagValue}";
            }
        }
        
        public bool CanApplyTo(TargetContext targetContext)
        {
            // Quest items can typically be used anywhere
            return true;
        }
    }
}