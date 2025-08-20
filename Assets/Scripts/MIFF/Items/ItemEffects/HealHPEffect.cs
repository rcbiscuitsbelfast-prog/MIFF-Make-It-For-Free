using UnityEngine;
using MIFF.Core;

namespace MIFF.Items.ItemEffects
{
    /// <summary>
    /// Item effect that heals a spirit's HP
    /// </summary>
    [CreateAssetMenu(fileName = "HealHP Effect", menuName = "MIFF/Items/Effects/HealHP")]
    public class HealHPEffect : ScriptableObject, IItemEffect
    {
        [Header("Healing Properties")]
        [SerializeField] private int healAmount = 50;
        [SerializeField] private bool healToFull = false;
        [SerializeField] private float healPercentage = 0.0f; // 0.0 = fixed amount, >0.0 = percentage of max HP
        
        public void Apply(PlayerContext playerContext, TargetContext targetContext)
        {
            if (!CanApplyTo(targetContext))
            {
                Debug.LogWarning("Cannot apply HealHP effect to this target");
                return;
            }
            
            var targetSpirit = targetContext.targetSpirit;
            if (targetSpirit == null)
            {
                Debug.LogError("Target context has no spirit for healing");
                return;
            }
            
            int healValue = healAmount;
            
            if (healPercentage > 0.0f)
            {
                healValue = Mathf.RoundToInt(targetSpirit.MaxHP * healPercentage);
            }
            else if (healToFull)
            {
                healValue = targetSpirit.MaxHP - targetSpirit.CurrentHP;
            }
            
            if (healValue > 0)
            {
                targetSpirit.Heal(healValue);
                Debug.Log($"Healed {targetSpirit.SpiritName} by {healValue} HP");
            }
        }
        
        public string GetEffectDescription()
        {
            if (healToFull)
            {
                return "Restores HP to maximum";
            }
            else if (healPercentage > 0.0f)
            {
                return $"Restores {healPercentage * 100}% of max HP";
            }
            else
            {
                return $"Restores {healAmount} HP";
            }
        }
        
        public bool CanApplyTo(TargetContext targetContext)
        {
            if (targetContext.targetSpirit == null) return false;
            
            var spirit = targetContext.targetSpirit;
            return !spirit.IsFainted && spirit.CurrentHP < spirit.MaxHP;
        }
    }
}