using UnityEngine;
using MIFF.Spirits;

namespace MIFF.Evolution
{
    /// <summary>
    /// ScriptableObject defining evolution requirements and triggers for spirits
    /// </summary>
    [CreateAssetMenu(fileName = "New Evolution", menuName = "MIFF/Spirits/SpiritEvolution")]
    public class SpiritEvolution_SO : ScriptableObject
    {
        [Header("Evolution Identity")]
        [SerializeField] private string evolutionID;
        [SerializeField] private string baseSpiritID;
        [SerializeField] private string evolvedSpiritID;
        
        [Header("Evolution Trigger")]
        [SerializeField] private EvolutionTrigger triggerType;
        
        [Header("Trigger Requirements")]
        [SerializeField] private float requiredSync = 50.0f; // For SyncThreshold
        [SerializeField] private string requiredFlag = ""; // For QuestFlag
        [SerializeField] private string requiredItemID = ""; // For ItemUse
        [SerializeField] private string battleConditionID = ""; // For BattleCondition
        
        [Header("Evolution Details")]
        [SerializeField] private SpiritSpecies evolvedSpiritSpecies;
        [TextArea(3, 6)]
        [SerializeField] private string evolutionLoreText;
        [SerializeField] private AudioClip evolutionSFX;
        [SerializeField] private AudioClip evolutionMusic;
        
        [Header("Visual Effects")]
        [SerializeField] private Color evolutionColor = Color.white;
        [SerializeField] private float evolutionDuration = 3.0f;
        [SerializeField] private bool showParticles = true;
        
        // Properties for external access
        public string EvolutionID => evolutionID;
        public string BaseSpiritID => baseSpiritID;
        public string EvolvedSpiritID => evolvedSpiritID;
        public EvolutionTrigger TriggerType => triggerType;
        public float RequiredSync => requiredSync;
        public string RequiredFlag => requiredFlag;
        public string RequiredItemID => requiredItemID;
        public string BattleConditionID => battleConditionID;
        public SpiritSpecies EvolvedSpiritSpecies => evolvedSpiritSpecies;
        public string EvolutionLoreText => evolutionLoreText;
        public AudioClip EvolutionSFX => evolutionSFX;
        public AudioClip EvolutionMusic => evolutionMusic;
        public Color EvolutionColor => evolutionColor;
        public float EvolutionDuration => evolutionDuration;
        public bool ShowParticles => showParticles;
        
        private void OnValidate()
        {
            // Ensure evolutionID is unique and not empty
            if (string.IsNullOrEmpty(evolutionID))
            {
                evolutionID = $"{baseSpiritID}_to_{evolvedSpiritID}";
            }
            
            // Ensure evolvedSpiritSpecies is assigned
            if (evolvedSpiritSpecies == null)
            {
                Debug.LogWarning($"Evolution {evolutionID}: EvolvedSpiritSpecies not assigned!");
            }
            
            // Validate trigger-specific requirements
            ValidateTriggerRequirements();
        }
        
        /// <summary>
        /// Validate requirements based on trigger type
        /// </summary>
        private void ValidateTriggerRequirements()
        {
            switch (triggerType)
            {
                case EvolutionTrigger.SyncThreshold:
                    if (requiredSync <= 0)
                    {
                        Debug.LogWarning($"Evolution {evolutionID}: SyncThreshold requires positive sync value");
                    }
                    break;
                    
                case EvolutionTrigger.QuestFlag:
                    if (string.IsNullOrEmpty(requiredFlag))
                    {
                        Debug.LogWarning($"Evolution {evolutionID}: QuestFlag requires flag name");
                    }
                    break;
                    
                case EvolutionTrigger.ItemUse:
                    if (string.IsNullOrEmpty(requiredItemID))
                    {
                        Debug.LogWarning($"Evolution {evolutionID}: ItemUse requires item ID");
                    }
                    break;
                    
                case EvolutionTrigger.BattleCondition:
                    if (string.IsNullOrEmpty(battleConditionID))
                    {
                        Debug.LogWarning($"Evolution {evolutionID}: BattleCondition requires condition ID");
                    }
                    break;
            }
        }
        
        /// <summary>
        /// Check if evolution requirements are met
        /// </summary>
        public bool CheckRequirements(SpiritInstance spirit, EvolutionContext context)
        {
            if (spirit == null) return false;
            
            // Check if this is the correct base spirit
            if (spirit.SpeciesID != baseSpiritID) return false;
            
            // Check trigger-specific requirements
            switch (triggerType)
            {
                case EvolutionTrigger.SyncThreshold:
                    return CheckSyncRequirement(spirit);
                    
                case EvolutionTrigger.QuestFlag:
                    return CheckQuestFlagRequirement();
                    
                case EvolutionTrigger.ItemUse:
                    return CheckItemRequirement(context);
                    
                case EvolutionTrigger.BattleCondition:
                    return CheckBattleConditionRequirement(context);
                    
                default:
                    Debug.LogWarning($"Unknown evolution trigger type: {triggerType}");
                    return false;
            }
        }
        
        /// <summary>
        /// Check sync threshold requirement
        /// </summary>
        private bool CheckSyncRequirement(SpiritInstance spirit)
        {
            return spirit.CurrentSync >= requiredSync;
        }
        
        /// <summary>
        /// Check quest flag requirement
        /// </summary>
        private bool CheckQuestFlagRequirement()
        {
            if (string.IsNullOrEmpty(requiredFlag)) return false;
            
            var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
            return flagManager != null && flagManager.GetFlag(requiredFlag);
        }
        
        /// <summary>
        /// Check item requirement
        /// </summary>
        private bool CheckItemRequirement(EvolutionContext context)
        {
            if (string.IsNullOrEmpty(requiredItemID)) return false;
            
            return context.TriggeringItemID == requiredItemID;
        }
        
        /// <summary>
        /// Check battle condition requirement
        /// </summary>
        private bool CheckBattleConditionRequirement(EvolutionContext context)
        {
            if (string.IsNullOrEmpty(battleConditionID)) return false;
            
            return context.BattleConditionID == battleConditionID;
        }
        
        /// <summary>
        /// Get a description of the evolution requirements
        /// </summary>
        public string GetRequirementDescription()
        {
            switch (triggerType)
            {
                case EvolutionTrigger.SyncThreshold:
                    return $"Reach {requiredSync}% sync with your spirit";
                    
                case EvolutionTrigger.QuestFlag:
                    return $"Complete the quest: {requiredFlag}";
                    
                case EvolutionTrigger.ItemUse:
                    return $"Use the {requiredItemID} item";
                    
                case EvolutionTrigger.BattleCondition:
                    return $"Meet battle condition: {battleConditionID}";
                    
                default:
                    return "Unknown evolution requirement";
            }
        }
        
        /// <summary>
        /// Get evolution display name
        /// </summary>
        public string GetEvolutionDisplayName()
        {
            if (evolvedSpiritSpecies != null)
            {
                return $"{baseSpiritID} → {evolvedSpiritSpecies.SpeciesName}";
            }
            
            return $"{baseSpiritID} → {evolvedSpiritID}";
        }
    }
    
    /// <summary>
    /// Types of evolution triggers
    /// </summary>
    public enum EvolutionTrigger
    {
        SyncThreshold,    // Evolve when sync reaches threshold
        QuestFlag,        // Evolve when quest flag is set
        ItemUse,          // Evolve when specific item is used
        BattleCondition   // Evolve when battle condition is met
    }
}