using UnityEngine;
using MIFF.Core;
using MIFF.Evolution;

namespace MIFF.Items.ItemEffects
{
    /// <summary>
    /// Moonlight Amulet item effect - can trigger evolution for compatible spirits
    /// </summary>
    [CreateAssetMenu(fileName = "Moonlight Amulet Effect", menuName = "MIFF/Items/ItemEffects/Moonlight Amulet")]
    public class MoonlightAmuletEffect : ScriptableObject, IItemEffect
    {
        [Header("Evolution Trigger")]
        [SerializeField] private string targetSpiritID = "starter_spirit";
        [SerializeField] private bool showEvolutionPrompt = true;
        
        [Header("Effect Description")]
        [TextArea(3, 5)]
        [SerializeField] private string effectDescription = "A mystical amulet that resonates with your spirit's potential. Use it to unlock evolution when you're ready.";
        
        /// <summary>
        /// Apply the Moonlight Amulet effect
        /// </summary>
        public void Apply(PlayerContext playerContext, TargetContext targetContext)
        {
            if (playerContext == null) return;
            
            Debug.Log("Moonlight Amulet effect applied!");
            
            // Check if evolution is available for the target spirit
            var evolutionManager = EvolutionManager.Instance;
            if (evolutionManager != null)
            {
                // Create evolution context for item use
                var evolutionContext = EvolutionContext.CreateItemContext("moonlight_amulet");
                
                // Try to evolve the target spirit
                bool evolutionTriggered = evolutionManager.GrantEvolutionFromQuest(targetSpiritID, evolutionContext);
                
                if (evolutionTriggered)
                {
                    Debug.Log($"Moonlight Amulet triggered evolution for {targetSpiritID}!");
                    
                    // Set flag that evolution was seen
                    var flagManager = OnboardingFlagManager.Instance;
                    if (flagManager != null)
                    {
                        flagManager.SetFlag("FirstEvolutionSeen", true);
                    }
                }
                else
                {
                    Debug.Log($"Moonlight Amulet could not trigger evolution for {targetSpiritID}");
                }
            }
            else
            {
                Debug.LogWarning("EvolutionManager not found! Cannot apply Moonlight Amulet effect.");
            }
        }
        
        /// <summary>
        /// Get the effect description
        /// </summary>
        public string GetEffectDescription()
        {
            return effectDescription;
        }
        
        /// <summary>
        /// Check if this effect can be applied to the target
        /// </summary>
        public bool CanApplyTo(TargetContext targetContext)
        {
            // Moonlight Amulet can be used on any target
            return true;
        }
        
        /// <summary>
        /// Get the target spirit ID for this amulet
        /// </summary>
        public string GetTargetSpiritID()
        {
            return targetSpiritID;
        }
        
        /// <summary>
        /// Set the target spirit ID
        /// </summary>
        public void SetTargetSpiritID(string spiritID)
        {
            targetSpiritID = spiritID;
        }
        
        /// <summary>
        /// Check if evolution prompt should be shown
        /// </summary>
        public bool ShouldShowEvolutionPrompt()
        {
            return showEvolutionPrompt;
        }
    }
}