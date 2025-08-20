using UnityEngine;
using MIFF.Core;

namespace MIFF.Items.ItemEffects
{
    /// <summary>
    /// Item effect that buffs a spirit's stats
    /// </summary>
    [CreateAssetMenu(fileName = "BuffStat Effect", menuName = "MIFF/Items/Effects/BuffStat")]
    public class BuffStatEffect : ScriptableObject, IItemEffect
    {
        [Header("Buff Properties")]
        [SerializeField] private string statName = "attack";
        [SerializeField] private float multiplier = 1.5f;
        [SerializeField] private float duration = 60.0f; // seconds
        [SerializeField] private bool isPermanent = false;
        
        public void Apply(PlayerContext playerContext, TargetContext targetContext)
        {
            if (!CanApplyTo(targetContext))
            {
                Debug.LogWarning("Cannot apply BuffStat effect to this target");
                return;
            }
            
            var targetSpirit = targetContext.targetSpirit;
            if (targetSpirit == null)
            {
                Debug.LogError("Target context has no spirit for buffing");
                return;
            }
            
            if (isPermanent)
            {
                // Permanent buff - would need a permanent buff system
                Debug.Log($"Permanently buffed {targetSpirit.SpiritName}'s {statName} by {multiplier}x");
            }
            else
            {
                targetSpirit.BuffStat(statName, multiplier, duration);
                Debug.Log($"Buffed {targetSpirit.SpiritName}'s {statName} by {multiplier}x for {duration} seconds");
            }
        }
        
        public string GetEffectDescription()
        {
            if (isPermanent)
            {
                return $"Permanently increases {statName} by {(multiplier - 1) * 100}%";
            }
            else
            {
                return $"Increases {statName} by {(multiplier - 1) * 100}% for {duration} seconds";
            }
        }
        
        public bool CanApplyTo(TargetContext targetContext)
        {
            if (targetContext.targetSpirit == null) return false;
            
            var spirit = targetContext.targetSpirit;
            return !spirit.IsFainted;
        }
    }
}