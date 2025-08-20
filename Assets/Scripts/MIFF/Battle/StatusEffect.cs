using System;

namespace MIFF.Battle
{
    /// <summary>
    /// Represents a status effect that can be applied to spirits
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class StatusEffect
    {
        [Header("Effect Identity")]
        public string effectID;
        public string displayName;
        public string description;
        public StatusEffectType effectType;
        
        [Header("Effect Properties")]
        public int duration;
        public int maxDuration;
        public int power;
        public bool hasTurnEffect;
        public bool hasEndTurnEffect;
        public bool hasStartTurnEffect;
        
        [Header("Stat Modifications")]
        public StatType affectsStat = StatType.None;
        public float statModifierValue;
        public ModifierType statModifierType = ModifierType.Flat;
        
        [Header("Effect Behavior")]
        public bool isStackable;
        public int maxStacks = 1;
        public int currentStacks = 1;
        public bool isRemovable = true;
        public bool isDispellable = true;
        public bool isContagious;
        public bool preventsActions;
        public bool preventsSwitching;
        
        [Header("Source Information")]
        public string sourceID;
        public ModifierSource sourceType;
        
        // Events for remixers to hook into
        public event Action<StatusEffect> OnEffectApplied;
        public event Action<StatusEffect> OnEffectRemoved;
        public event Action<StatusEffect> OnEffectTriggered;
        public event Action<StatusEffect> OnStackChanged;
        
        public StatusEffect()
        {
            effectID = Guid.NewGuid().ToString();
        }
        
        /// <summary>
        /// Create a new status effect
        /// </summary>
        public StatusEffect(StatusEffectType effectType, int duration, int power = 1)
        {
            this.effectType = effectType;
            this.duration = duration;
            this.maxDuration = duration;
            this.power = power;
            this.effectID = Guid.NewGuid().ToString();
            
            // Set default properties based on effect type
            SetDefaultProperties();
        }
        
        /// <summary>
        /// Set default properties based on effect type
        /// </summary>
        private void SetDefaultProperties()
        {
            switch (effectType)
            {
                case StatusEffectType.Burn:
                    displayName = "Burn";
                    description = "Takes damage each turn and reduces Attack";
                    affectsStat = StatType.Attack;
                    statModifierValue = -0.5f;
                    statModifierType = ModifierType.Multiplier;
                    hasTurnEffect = true;
                    break;
                    
                case StatusEffectType.Freeze:
                    displayName = "Freeze";
                    description = "Cannot take actions until thawed";
                    preventsActions = true;
                    hasEndTurnEffect = true;
                    break;
                    
                case StatusEffectType.Paralyze:
                    displayName = "Paralyze";
                    description = "May not be able to move and reduces Speed";
                    affectsStat = StatType.Speed;
                    statModifierValue = -0.5f;
                    statModifierType = ModifierType.Multiplier;
                    hasStartTurnEffect = true;
                    break;
                    
                case StatusEffectType.Poison:
                    displayName = "Poison";
                    description = "Takes damage each turn";
                    hasTurnEffect = true;
                    break;
                    
                case StatusEffectType.Sleep:
                    displayName = "Sleep";
                    description = "Cannot take actions until awakened";
                    preventsActions = true;
                    hasEndTurnEffect = true;
                    break;
                    
                case StatusEffectType.Confusion:
                    displayName = "Confusion";
                    description = "May attack itself or miss";
                    hasStartTurnEffect = true;
                    break;
                    
                default:
                    displayName = effectType.ToString();
                    description = "Status effect";
                    break;
            }
        }
        
        /// <summary>
        /// Apply stat modifier to a value
        /// </summary>
        public int ApplyStatModifier(int baseValue)
        {
            if (affectsStat == StatType.None) return baseValue;
            
            float modifiedValue = baseValue;
            
            switch (statModifierType)
            {
                case ModifierType.Flat:
                    modifiedValue += statModifierValue * currentStacks;
                    break;
                    
                case ModifierType.Percentage:
                    modifiedValue *= (1.0f + (statModifierValue * currentStacks) / 100.0f);
                    break;
                    
                case ModifierType.Multiplier:
                    modifiedValue *= (1.0f + statModifierValue * currentStacks);
                    break;
                    
                case ModifierType.Set:
                    modifiedValue = (int)statModifierValue;
                    break;
            }
            
            return Math.Max(1, (int)modifiedValue);
        }
        
        /// <summary>
        /// Add a stack to this effect
        /// </summary>
        public bool AddStack()
        {
            if (!isStackable || currentStacks >= maxStacks)
                return false;
            
            currentStacks++;
            OnStackChanged?.Invoke(this);
            return true;
        }
        
        /// <summary>
        /// Remove a stack from this effect
        /// </summary>
        public bool RemoveStack()
        {
            if (currentStacks <= 1)
                return false;
            
            currentStacks--;
            OnStackChanged?.Invoke(this);
            return true;
        }
        
        /// <summary>
        /// Process the effect (called each turn)
        /// </summary>
        public bool ProcessTurn()
        {
            duration--;
            return duration > 0;
        }
        
        /// <summary>
        /// Check if effect has expired
        /// </summary>
        public bool IsExpired => duration <= 0;
        
        /// <summary>
        /// Get remaining duration as percentage
        /// </summary>
        public float GetDurationPercentage => (float)duration / maxDuration;
        
        /// <summary>
        /// Get effect strength (power * stacks)
        /// </summary>
        public int GetEffectivePower => power * currentStacks;
        
        /// <summary>
        /// Get effect description with current values
        /// </summary>
        public string GetDescription()
        {
            string stackInfo = isStackable && maxStacks > 1 ? $" (x{currentStacks})" : "";
            string durationInfo = duration > 0 ? $" for {duration} turns" : "";
            
            return $"{displayName}{stackInfo}: {description}{durationInfo}";
        }
        
        /// <summary>
        /// Get effect summary for debugging
        /// </summary>
        public string GetEffectSummary()
        {
            return $"{effectType} (Power: {power}, Stacks: {currentStacks}) | Duration: {duration}/{maxDuration} | Source: {sourceType}";
        }
        
        /// <summary>
        /// Clone this effect
        /// </summary>
        public StatusEffect Clone()
        {
            return new StatusEffect
            {
                effectID = Guid.NewGuid().ToString(),
                displayName = displayName,
                description = description,
                effectType = effectType,
                duration = duration,
                maxDuration = maxDuration,
                power = power,
                hasTurnEffect = hasTurnEffect,
                hasEndTurnEffect = hasEndTurnEffect,
                hasStartTurnEffect = hasStartTurnEffect,
                affectsStat = affectsStat,
                statModifierValue = statModifierValue,
                statModifierType = statModifierType,
                isStackable = isStackable,
                maxStacks = maxStacks,
                currentStacks = currentStacks,
                isRemovable = isRemovable,
                isDispellable = isDispellable,
                isContagious = isContagious,
                preventsActions = preventsActions,
                preventsSwitching = preventsSwitching,
                sourceID = sourceID,
                sourceType = sourceType
            };
        }
        
        /// <summary>
        /// Check if this effect can be removed
        /// </summary>
        public bool CanBeRemoved => isRemovable && !IsExpired;
        
        /// <summary>
        /// Check if this effect can be dispelled
        /// </summary>
        public bool CanBeDispelled => isDispellable && !IsExpired;
        
        /// <summary>
        /// Check if this effect is beneficial
        /// </summary>
        public bool IsBeneficial => effectType switch
        {
            StatusEffectType.Attract => true,
            StatusEffectType.Encore => true,
            _ => false
        };
        
        /// <summary>
        /// Check if this effect is harmful
        /// </summary>
        public bool IsHarmful => effectType switch
        {
            StatusEffectType.Burn => true,
            StatusEffectType.Freeze => true,
            StatusEffectType.Paralyze => true,
            StatusEffectType.Poison => true,
            StatusEffectType.Sleep => true,
            StatusEffectType.Confusion => true,
            StatusEffectType.Curse => true,
            StatusEffectType.LeechSeed => true,
            StatusEffectType.Nightmare => true,
            StatusEffectType.PerishSong => true,
            StatusEffectType.Taunt => true,
            StatusEffectType.Torment => true,
            StatusEffectType.Disable => true,
            _ => false
        };
        
        /// <summary>
        /// Check if this effect prevents actions
        /// </summary>
        public bool PreventsActions => preventsActions || effectType == StatusEffectType.Freeze || effectType == StatusEffectType.Sleep;
        
        /// <summary>
        /// Check if this effect prevents switching
        /// </summary>
        public bool PreventsSwitching => preventsSwitching || effectType == StatusEffectType.Taunt;
        
        /// <summary>
        /// Get turn damage for effects like Burn and Poison
        /// </summary>
        public int GetTurnDamage()
        {
            return effectType switch
            {
                StatusEffectType.Burn => 1 + (power * currentStacks / 8),
                StatusEffectType.Poison => 1 + (power * currentStacks / 16),
                StatusEffectType.LeechSeed => 1 + (power * currentStacks / 16),
                _ => 0
            };
        }
        
        /// <summary>
        /// Check if this effect should trigger at start of turn
        /// </summary>
        public bool ShouldTriggerAtStart => hasStartTurnEffect || effectType == StatusEffectType.Paralyze || effectType == StatusEffectType.Confusion;
        
        /// <summary>
        /// Check if this effect should trigger during turn
        /// </summary>
        public bool ShouldTriggerDuringTurn => hasTurnEffect || effectType == StatusEffectType.Burn || effectType == StatusEffectType.Poison || effectType == StatusEffectType.LeechSeed;
        
        /// <summary>
        /// Check if this effect should trigger at end of turn
        /// </summary>
        public bool ShouldTriggerAtEnd => hasEndTurnEffect || effectType == StatusEffectType.Freeze || effectType == StatusEffectType.Sleep;
    }
}