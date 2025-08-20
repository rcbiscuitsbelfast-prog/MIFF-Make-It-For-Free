using UnityEngine;
using MIFF.Core;

namespace MIFF.Items.ItemEffects
{
    /// <summary>
    /// Item effect that revives a fainted spirit
    /// </summary>
    [CreateAssetMenu(fileName = "Revive Effect", menuName = "MIFF/Items/Effects/Revive")]
    public class ReviveEffect : ScriptableObject, IItemEffect
    {
        [Header("Revival Properties")]
        [SerializeField] private float reviveHPPercentage = 0.5f;
        [SerializeField] private bool reviveToFull = false;
        
        public void Apply(PlayerContext playerContext, TargetContext targetContext)
        {
            if (!CanApplyTo(targetContext))
            {
                Debug.LogWarning("Cannot apply Revive effect to this target");
                return;
            }
            
            var targetSpirit = targetContext.targetSpirit;
            if (targetSpirit == null)
            {
                Debug.LogError("Target context has no spirit for revival");
                return;
            }
            
            float hpPercentage = reviveToFull ? 1.0f : reviveHPPercentage;
            targetSpirit.Revive(hpPercentage);
            
            Debug.Log($"Revived {targetSpirit.SpiritName} with {hpPercentage * 100}% HP");
        }
        
        public string GetEffectDescription()
        {
            if (reviveToFull)
            {
                return "Revives a fainted spirit with full HP";
            }
            else
            {
                return $"Revives a fainted spirit with {reviveHPPercentage * 100}% HP";
            }
        }
        
        public bool CanApplyTo(TargetContext targetContext)
        {
            if (targetContext.targetSpirit == null) return false;
            
            return targetContext.targetSpirit.IsFainted;
        }
    }
}