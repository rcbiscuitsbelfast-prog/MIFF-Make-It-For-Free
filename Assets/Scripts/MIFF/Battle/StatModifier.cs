using System;

namespace MIFF.Battle
{
    /// <summary>
    /// Represents a temporary stat modification (buff/debuff)
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class StatModifier
    {
        [Header("Modifier Identity")]
        public string modifierID;
        public string displayName;
        public string description;
        
        [Header("Modifier Properties")]
        public StatType statType;
        public ModifierType modifierType;
        public float value;
        public int duration;
        public int maxDuration;
        
        [Header("Modifier Behavior")]
        public bool isStackable;
        public int maxStacks = 1;
        public int currentStacks = 1;
        public bool isRemovable = true;
        public bool isDispellable = true;
        
        [Header("Source Information")]
        public string sourceID;
        public ModifierSource sourceType;
        
        // Events for remixers to hook into
        public event Action<StatModifier> OnModifierApplied;
        public event Action<StatModifier> OnModifierRemoved;
        public event Action<StatModifier> OnStackChanged;
        
        public StatModifier()
        {
            modifierID = Guid.NewGuid().ToString();
        }
        
        /// <summary>
        /// Create a new stat modifier
        /// </summary>
        public StatModifier(StatType statType, ModifierType modifierType, float value, int duration)
        {
            this.statType = statType;
            this.modifierType = modifierType;
            this.value = value;
            this.duration = duration;
            this.maxDuration = duration;
            this.modifierID = Guid.NewGuid().ToString();
        }
        
        /// <summary>
        /// Apply the modifier to a base stat value
        /// </summary>
        public int ApplyModifier(int baseValue)
        {
            float modifiedValue = baseValue;
            
            switch (modifierType)
            {
                case ModifierType.Flat:
                    modifiedValue += value * currentStacks;
                    break;
                    
                case ModifierType.Percentage:
                    modifiedValue *= (1.0f + (value * currentStacks) / 100.0f);
                    break;
                    
                case ModifierType.Multiplier:
                    modifiedValue *= (1.0f + value * currentStacks);
                    break;
                    
                case ModifierType.Set:
                    modifiedValue = (int)value;
                    break;
            }
            
            return Math.Max(1, (int)modifiedValue);
        }
        
        /// <summary>
        /// Add a stack to this modifier
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
        /// Remove a stack from this modifier
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
        /// Process the modifier (called each turn)
        /// </summary>
        public bool ProcessTurn()
        {
            duration--;
            return duration > 0;
        }
        
        /// <summary>
        /// Check if modifier has expired
        /// </summary>
        public bool IsExpired => duration <= 0;
        
        /// <summary>
        /// Get remaining duration as percentage
        /// </summary>
        public float GetDurationPercentage => (float)duration / maxDuration;
        
        /// <summary>
        /// Get modifier strength (value * stacks)
        /// </summary>
        public float GetEffectiveValue => value * currentStacks;
        
        /// <summary>
        /// Get modifier description with current values
        /// </summary>
        public string GetDescription()
        {
            string stackInfo = isStackable && maxStacks > 1 ? $" (x{currentStacks})" : "";
            string durationInfo = duration > 0 ? $" for {duration} turns" : "";
            
            return $"{displayName}{stackInfo}: {description}{durationInfo}";
        }
        
        /// <summary>
        /// Get modifier summary for debugging
        /// </summary>
        public string GetModifierSummary()
        {
            return $"{statType} {modifierType}: {value} (x{currentStacks}) | Duration: {duration}/{maxDuration} | Source: {sourceType}";
        }
        
        /// <summary>
        /// Clone this modifier
        /// </summary>
        public StatModifier Clone()
        {
            return new StatModifier
            {
                modifierID = Guid.NewGuid().ToString(),
                displayName = displayName,
                description = description,
                statType = statType,
                modifierType = modifierType,
                value = value,
                duration = duration,
                maxDuration = maxDuration,
                isStackable = isStackable,
                maxStacks = maxStacks,
                currentStacks = currentStacks,
                isRemovable = isRemovable,
                isDispellable = isDispellable,
                sourceID = sourceID,
                sourceType = sourceType
            };
        }
        
        /// <summary>
        /// Check if this modifier can be removed
        /// </summary>
        public bool CanBeRemoved => isRemovable && !IsExpired;
        
        /// <summary>
        /// Check if this modifier can be dispelled
        /// </summary>
        public bool CanBeDispelled => isDispellable && !IsExpired;
        
        /// <summary>
        /// Check if this modifier is beneficial
        /// </summary>
        public bool IsBeneficial => (modifierType == ModifierType.Flat && value > 0) ||
                                   (modifierType == ModifierType.Percentage && value > 0) ||
                                   (modifierType == ModifierType.Multiplier && value > 0);
        
        /// <summary>
        /// Check if this modifier is harmful
        /// </summary>
        public bool IsHarmful => (modifierType == ModifierType.Flat && value < 0) ||
                                 (modifierType == ModifierType.Percentage && value < 0) ||
                                 (modifierType == ModifierType.Multiplier && value < 0);
    }
    
    /// <summary>
    /// Types of stat modifiers
    /// </summary>
    public enum ModifierType
    {
        Flat,           // Add/subtract flat value
        Percentage,     // Add/subtract percentage
        Multiplier,     // Multiply by factor
        Set             // Set to specific value
    }
    
    /// <summary>
    /// Source types for modifiers
    /// </summary>
    public enum ModifierSource
    {
        None,
        Move,           // Applied by a move
        Item,           // Applied by an item
        Ability,        // Applied by an ability
        StatusEffect,   // Applied by a status effect
        Environment,    // Applied by environment
        Weather,        // Applied by weather
        Field,          // Applied by field effect
        Trainer,        // Applied by trainer
        Evolution,      // Applied by evolution
        Custom          // Custom source for remixers
    }
}