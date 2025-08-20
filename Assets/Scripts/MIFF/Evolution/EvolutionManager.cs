using UnityEngine;
using UnityEngine.Events;
using System.Collections.Generic;
using System.Linq;
using MIFF.Spirits;

namespace MIFF.Evolution
{
    /// <summary>
    /// Manages spirit evolution logic and triggers
    /// </summary>
    public class EvolutionManager : MonoBehaviour
    {
        [Header("Evolution Database")]
        [SerializeField] private List<SpiritEvolution_SO> evolutionDatabase = new List<SpiritEvolution_SO>();
        
        [Header("Events")]
        [SerializeField] private UnityEvent<SpiritInstance, SpiritEvolution_SO> onSpiritEvolved;
        [SerializeField] private UnityEvent<SpiritInstance> onEvolutionCheck;
        
        [Header("Settings")]
        [SerializeField] private bool enableEvolution = true;
        [SerializeField] private bool showEvolutionCutscene = true;
        [SerializeField] private float evolutionCheckDelay = 0.5f;
        
        private Dictionary<string, SpiritEvolution_SO> evolutionLookup = new Dictionary<string, SpiritEvolution_SO>();
        private List<SpiritInstance> pendingEvolutions = new List<SpiritInstance>();
        
        public static EvolutionManager Instance { get; private set; }
        
        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                BuildEvolutionLookup();
            }
            else
            {
                Destroy(gameObject);
            }
        }
        
        private void Start()
        {
            // Subscribe to relevant events
            SubscribeToEvents();
        }
        
        /// <summary>
        /// Build the evolution lookup dictionary
        /// </summary>
        private void BuildEvolutionLookup()
        {
            evolutionLookup.Clear();
            
            foreach (var evolution in evolutionDatabase)
            {
                if (evolution != null && !string.IsNullOrEmpty(evolution.BaseSpiritID))
                {
                    if (evolutionLookup.ContainsKey(evolution.BaseSpiritID))
                    {
                        Debug.LogWarning($"Duplicate evolution found for {evolution.BaseSpiritID}");
                    }
                    else
                    {
                        evolutionLookup[evolution.BaseSpiritID] = evolution;
                    }
                }
            }
            
            Debug.Log($"Built evolution lookup with {evolutionLookup.Count} entries");
        }
        
        /// <summary>
        /// Subscribe to relevant events
        /// </summary>
        private void SubscribeToEvents()
        {
            // This would integrate with your existing event systems
            // For now, we'll use the public methods for manual triggering
        }
        
        /// <summary>
        /// Try to evolve a spirit
        /// </summary>
        public bool TryEvolve(SpiritInstance spirit, EvolutionContext context = null)
        {
            if (!enableEvolution || spirit == null) return false;
            
            // Check if spirit can evolve
            if (!spirit.CanEvolve) return false;
            
            // Look up evolution entry
            if (!evolutionLookup.ContainsKey(spirit.SpeciesID))
            {
                return false; // No evolution available
            }
            
            var evolution = evolutionLookup[spirit.SpeciesID];
            
            // Check if evolution requirements are met
            if (!evolution.CheckRequirements(spirit, context))
            {
                return false; // Requirements not met
            }
            
            // Perform evolution
            return PerformEvolution(spirit, evolution);
        }
        
        /// <summary>
        /// Perform the actual evolution
        /// </summary>
        private bool PerformEvolution(SpiritInstance spirit, SpiritEvolution_SO evolution)
        {
            if (spirit == null || evolution == null) return false;
            
            Debug.Log($"Evolution triggered for {spirit.Nickname}: {evolution.GetEvolutionDisplayName()}");
            
            // Store old species ID for reference
            string oldSpeciesID = spirit.SpeciesID;
            
            // Update spirit species
            spirit.Evolve(evolution.EvolvedSpiritID);
            
            // Update evolution stage
            if (evolution.EvolvedSpiritSpecies != null)
            {
                spirit.SetEvolutionStage(evolution.EvolvedSpiritSpecies.EvolutionStage);
            }
            
            // Apply evolution bonuses
            ApplyEvolutionBonuses(spirit, evolution);
            
            // Trigger evolution events
            onSpiritEvolved?.Invoke(spirit, evolution);
            
            // Show evolution cutscene if enabled
            if (showEvolutionCutscene)
            {
                ShowEvolutionCutscene(spirit, evolution);
            }
            
            Debug.Log($"{spirit.Nickname} evolved from {oldSpeciesID} to {spirit.SpeciesID}!");
            
            return true;
        }
        
        /// <summary>
        /// Apply evolution bonuses to the spirit
        /// </summary>
        private void ApplyEvolutionBonuses(SpiritInstance spirit, SpiritEvolution_SO evolution)
        {
            // This would integrate with your stat system
            // For now, we'll just log the evolution
            Debug.Log($"Applied evolution bonuses to {spirit.Nickname}");
            
            // You could:
            // - Increase base stats
            // - Learn new moves
            // - Unlock new abilities
            // - Change type or weaknesses
        }
        
        /// <summary>
        /// Show evolution cutscene
        /// </summary>
        private void ShowEvolutionCutscene(SpiritInstance spirit, SpiritEvolution_SO evolution)
        {
            var cutsceneUI = FindObjectOfType<EvolutionCutsceneUI>();
            if (cutsceneUI != null)
            {
                cutsceneUI.ShowEvolution(spirit, evolution);
            }
            else
            {
                Debug.LogWarning("EvolutionCutsceneUI not found! Cannot show evolution cutscene.");
            }
        }
        
        /// <summary>
        /// Check for evolution after sync gain
        /// </summary>
        public void CheckEvolutionAfterSync(SpiritInstance spirit)
        {
            if (!enableEvolution || spirit == null) return;
            
            var context = EvolutionContext.CreateSyncContext();
            TryEvolve(spirit, context);
        }
        
        /// <summary>
        /// Check for evolution after quest completion
        /// </summary>
        public void CheckEvolutionAfterQuest(string questID)
        {
            if (!enableEvolution) return;
            
            var context = EvolutionContext.CreateQuestContext(questID);
            
            // Check all spirits for quest-based evolution
            var spirits = FindSpiritsForQuestEvolution(questID);
            foreach (var spirit in spirits)
            {
                TryEvolve(spirit, context);
            }
        }
        
        /// <summary>
        /// Check for evolution after item use
        /// </summary>
        public void CheckEvolutionAfterItemUse(string itemID)
        {
            if (!enableEvolution) return;
            
            var context = EvolutionContext.CreateItemContext(itemID);
            
            // Check all spirits for item-based evolution
            var spirits = FindSpiritsForItemEvolution(itemID);
            foreach (var spirit in spirits)
            {
                TryEvolve(spirit, context);
            }
        }
        
        /// <summary>
        /// Check for evolution after battle
        /// </summary>
        public void CheckEvolutionAfterBattle(string conditionID, bool won, bool noDamage, int turns, float duration)
        {
            if (!enableEvolution) return;
            
            var context = EvolutionContext.CreateBattleContext(conditionID, won, noDamage, turns, duration);
            
            // Check all spirits for battle-based evolution
            var spirits = FindSpiritsForBattleEvolution(conditionID);
            foreach (var spirit in spirits)
            {
                TryEvolve(spirit, context);
            }
        }
        
        /// <summary>
        /// Find spirits that can evolve from quest completion
        /// </summary>
        private List<SpiritInstance> FindSpiritsForQuestEvolution(string questID)
        {
            var spirits = new List<SpiritInstance>();
            
            foreach (var evolution in evolutionDatabase)
            {
                if (evolution.TriggerType == EvolutionTrigger.QuestFlag && 
                    evolution.RequiredFlag == questID)
                {
                    // This would integrate with your spirit collection system
                    // For now, return empty list
                }
            }
            
            return spirits;
        }
        
        /// <summary>
        /// Find spirits that can evolve from item use
        /// </summary>
        private List<SpiritInstance> FindSpiritsForItemEvolution(string itemID)
        {
            var spirits = new List<SpiritInstance>();
            
            foreach (var evolution in evolutionDatabase)
            {
                if (evolution.TriggerType == EvolutionTrigger.ItemUse && 
                    evolution.RequiredItemID == itemID)
                {
                    // This would integrate with your spirit collection system
                    // For now, return empty list
                }
            }
            
            return spirits;
        }
        
        /// <summary>
        /// Find spirits that can evolve from battle conditions
        /// </summary>
        private List<SpiritInstance> FindSpiritsForBattleEvolution(string conditionID)
        {
            var spirits = new List<SpiritInstance>();
            
            foreach (var evolution in evolutionDatabase)
            {
                if (evolution.TriggerType == EvolutionTrigger.BattleCondition && 
                    evolution.BattleConditionID == conditionID)
                {
                    // This would integrate with your spirit collection system
                    // For now, return empty list
                }
            }
            
            return spirits;
        }
        
        /// <summary>
        /// Add evolution to database
        /// </summary>
        public void AddEvolution(SpiritEvolution_SO evolution)
        {
            if (evolution == null) return;
            
            if (!evolutionDatabase.Contains(evolution))
            {
                evolutionDatabase.Add(evolution);
                BuildEvolutionLookup();
                Debug.Log($"Added evolution: {evolution.GetEvolutionDisplayName()}");
            }
        }
        
        /// <summary>
        /// Remove evolution from database
        /// </summary>
        public void RemoveEvolution(SpiritEvolution_SO evolution)
        {
            if (evolution == null) return;
            
            if (evolutionDatabase.Contains(evolution))
            {
                evolutionDatabase.Remove(evolution);
                BuildEvolutionLookup();
                Debug.Log($"Removed evolution: {evolution.GetEvolutionDisplayName()}");
            }
        }
        
        /// <summary>
        /// Get evolution for a spirit
        /// </summary>
        public SpiritEvolution_SO GetEvolution(string baseSpiritID)
        {
            return evolutionLookup.ContainsKey(baseSpiritID) ? evolutionLookup[baseSpiritID] : null;
        }
        
        /// <summary>
        /// Get all available evolutions
        /// </summary>
        public List<SpiritEvolution_SO> GetAllEvolutions()
        {
            return new List<SpiritEvolution_SO>(evolutionDatabase);
        }
        
        /// <summary>
        /// Validate evolution database
        /// </summary>
        [ContextMenu("Validate Evolution Database")]
        public void ValidateEvolutionDatabase()
        {
            var issues = new List<string>();
            
            foreach (var evolution in evolutionDatabase)
            {
                if (evolution == null) continue;
                
                if (string.IsNullOrEmpty(evolution.BaseSpiritID))
                {
                    issues.Add($"Evolution {evolution.name}: Missing base spirit ID");
                }
                
                if (string.IsNullOrEmpty(evolution.EvolvedSpiritID))
                {
                    issues.Add($"Evolution {evolution.name}: Missing evolved spirit ID");
                }
                
                if (evolution.EvolvedSpiritSpecies == null)
                {
                    issues.Add($"Evolution {evolution.name}: Missing evolved spirit species reference");
                }
            }
            
            if (issues.Count > 0)
            {
                Debug.LogWarning($"Evolution validation found {issues.Count} issues:\n• " + string.Join("\n• ", issues));
            }
            else
            {
                Debug.Log("All evolutions validated successfully!");
            }
        }
        
        /// <summary>
        /// Force evolution check for all spirits
        /// </summary>
        [ContextMenu("Force Evolution Check")]
        public void ForceEvolutionCheck()
        {
            Debug.Log("Forcing evolution check for all spirits...");
            // This would integrate with your spirit collection system
        }
    }
}