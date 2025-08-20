using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Battle
{
    /// <summary>
    /// Modular stats system for spirits with buffs/debuffs and temporary modifiers
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritStats
    {
        [Header("Base Stats")]
        public int baseHP = 100;
        public int baseSpeed = 50;
        public int baseAttack = 60;
        public int baseDefense = 40;
        public int baseSpecialAttack = 70;
        public int baseSpecialDefense = 50;
        public int baseAccuracy = 100;
        public int baseEvasion = 100;
        
        [Header("Current Stats")]
        public int currentHP;
        public int maxHP;
        
        [Header("Spirit Type")]
        public SpiritType spiritType = SpiritType.Neutral;
        
        [Header("Level & Experience")]
        public int level = 1;
        public int experience = 0;
        public int experienceToNext = 100;
        
        // Buff/Debuff system
        private Dictionary<StatType, StatModifier> statModifiers = new Dictionary<StatType, StatModifier>();
        private List<StatusEffect> statusEffects = new List<StatusEffect>();
        
        // Events for remixers to hook into
        public event Action<StatType, int, int> OnStatChanged;
        public event Action<StatusEffect> OnStatusEffectAdded;
        public event Action<StatusEffect> OnStatusEffectRemoved;
        public event Action<StatModifier> OnStatModifierAdded;
        public event Action<StatModifier> OnStatModifierRemoved;
        
        public SpiritStats()
        {
            InitializeStats();
        }
        
        /// <summary>
        /// Initialize stats from base values
        /// </summary>
        public void InitializeStats()
        {
            maxHP = CalculateStat(baseHP, StatType.HP);
            currentHP = maxHP;
        }
        
        /// <summary>
        /// Get current stat value including all modifiers
        /// </summary>
        public int GetStat(StatType statType)
        {
            int baseValue = GetBaseStat(statType);
            int modifiedValue = baseValue;
            
            // Apply stat modifiers
            if (statModifiers.ContainsKey(statType))
            {
                var modifier = statModifiers[statType];
                modifiedValue = modifier.ApplyModifier(baseValue);
            }
            
            // Apply status effect modifiers
            foreach (var statusEffect in statusEffects)
            {
                if (statusEffect.affectsStat == statType)
                {
                    modifiedValue = statusEffect.ApplyStatModifier(modifiedValue);
                }
            }
            
            // Ensure minimum values
            modifiedValue = Math.Max(1, modifiedValue);
            
            // Special handling for HP
            if (statType == StatType.HP)
            {
                modifiedValue = Math.Min(modifiedValue, maxHP);
            }
            
            return modifiedValue;
        }
        
        /// <summary>
        /// Get base stat value
        /// </summary>
        public int GetBaseStat(StatType statType)
        {
            return statType switch
            {
                StatType.HP => baseHP,
                StatType.Speed => baseSpeed,
                StatType.Attack => baseAttack,
                StatType.Defense => baseDefense,
                StatType.SpecialAttack => baseSpecialAttack,
                StatType.SpecialDefense => baseSpecialDefense,
                StatType.Accuracy => baseAccuracy,
                StatType.Evasion => baseEvasion,
                _ => 0
            };
        }
        
        /// <summary>
        /// Add a stat modifier (buff/debuff)
        /// </summary>
        public void AddStatModifier(StatModifier modifier)
        {
            if (modifier == null) return;
            
            statModifiers[modifier.statType] = modifier;
            OnStatModifierAdded?.Invoke(modifier);
            
            // Recalculate affected stats
            RecalculateStats(modifier.statType);
        }
        
        /// <summary>
        /// Remove a stat modifier
        /// </summary>
        public void RemoveStatModifier(StatType statType)
        {
            if (statModifiers.ContainsKey(statType))
            {
                var modifier = statModifiers[statType];
                statModifiers.Remove(statType);
                OnStatModifierRemoved?.Invoke(modifier);
                
                // Recalculate affected stats
                RecalculateStats(statType);
            }
        }
        
        /// <summary>
        /// Add a status effect
        /// </summary>
        public void AddStatusEffect(StatusEffect effect)
        {
            if (effect == null) return;
            
            // Check if effect already exists
            var existingEffect = statusEffects.FirstOrDefault(e => e.effectType == effect.effectType);
            if (existingEffect != null)
            {
                // Extend duration or replace if stronger
                if (effect.power > existingEffect.power)
                {
                    statusEffects.Remove(existingEffect);
                    OnStatusEffectRemoved?.Invoke(existingEffect);
                }
                else
                {
                    return; // Don't add weaker effect
                }
            }
            
            statusEffects.Add(effect);
            OnStatusEffectAdded?.Invoke(effect);
            
            // Apply immediate effects
            ApplyStatusEffect(effect);
        }
        
        /// <summary>
        /// Remove a status effect
        /// </summary>
        public void RemoveStatusEffect(StatusEffectType effectType)
        {
            var effect = statusEffects.FirstOrDefault(e => e.effectType == effectType);
            if (effect != null)
            {
                statusEffects.Remove(effect);
                OnStatusEffectRemoved?.Invoke(effect);
                
                // Recalculate all stats
                RecalculateAllStats();
            }
        }
        
        /// <summary>
        /// Process status effects (called each turn)
        /// </summary>
        public void ProcessStatusEffects()
        {
            var effectsToRemove = new List<StatusEffect>();
            
            foreach (var effect in statusEffects)
            {
                effect.duration--;
                
                // Apply turn-based effects
                if (effect.hasTurnEffect)
                {
                    ApplyStatusEffect(effect);
                }
                
                // Remove expired effects
                if (effect.duration <= 0)
                {
                    effectsToRemove.Add(effect);
                }
            }
            
            // Remove expired effects
            foreach (var effect in effectsToRemove)
            {
                statusEffects.Remove(effect);
                OnStatusEffectRemoved?.Invoke(effect);
            }
            
            // Recalculate all stats if effects were removed
            if (effectsToRemove.Count > 0)
            {
                RecalculateAllStats();
            }
        }
        
        /// <summary>
        /// Take damage and update HP
        /// </summary>
        public void TakeDamage(int damage)
        {
            int oldHP = currentHP;
            currentHP = Math.Max(0, currentHP - damage);
            
            OnStatChanged?.Invoke(StatType.HP, oldHP, currentHP);
        }
        
        /// <summary>
        /// Heal HP
        /// </summary>
        public void Heal(int amount)
        {
            int oldHP = currentHP;
            currentHP = Math.Min(maxHP, currentHP + amount);
            
            OnStatChanged?.Invoke(StatType.HP, oldHP, currentHP);
        }
        
        /// <summary>
        /// Check if spirit is fainted
        /// </summary>
        public bool IsFainted => currentHP <= 0;
        
        /// <summary>
        /// Check if spirit is at full HP
        /// </summary>
        public bool IsAtFullHP => currentHP >= maxHP;
        
        /// <summary>
        /// Get HP percentage
        /// </summary>
        public float GetHPPercentage => (float)currentHP / maxHP;
        
        /// <summary>
        /// Calculate stat value including level scaling
        /// </summary>
        private int CalculateStat(int baseStat, StatType statType)
        {
            float levelMultiplier = 1.0f + (level - 1) * 0.1f;
            return Math.Max(1, (int)(baseStat * levelMultiplier));
        }
        
        /// <summary>
        /// Apply status effect to stats
        /// </summary>
        private void ApplyStatusEffect(StatusEffect effect)
        {
            if (effect.affectsStat != StatType.None)
            {
                RecalculateStats(effect.affectsStat);
            }
        }
        
        /// <summary>
        /// Recalculate specific stat
        /// </summary>
        private void RecalculateStats(StatType statType)
        {
            int oldValue = GetStat(statType);
            int newValue = GetStat(statType);
            
            if (oldValue != newValue)
            {
                OnStatChanged?.Invoke(statType, oldValue, newValue);
            }
        }
        
        /// <summary>
        /// Recalculate all stats
        /// </summary>
        private void RecalculateAllStats()
        {
            foreach (StatType statType in Enum.GetValues(typeof(StatType)))
            {
                if (statType != StatType.None)
                {
                    RecalculateStats(statType);
                }
            }
        }
        
        /// <summary>
        /// Get all active stat modifiers
        /// </summary>
        public IEnumerable<StatModifier> GetActiveModifiers() => statModifiers.Values;
        
        /// <summary>
        /// Get all active status effects
        /// </summary>
        public IEnumerable<StatusEffect> GetActiveStatusEffects() => statusEffects;
        
        /// <summary>
        /// Check if spirit has specific status effect
        /// </summary>
        public bool HasStatusEffect(StatusEffectType effectType)
        {
            return statusEffects.Any(e => e.effectType == effectType);
        }
        
        /// <summary>
        /// Get status effect by type
        /// </summary>
        public StatusEffect GetStatusEffect(StatusEffectType effectType)
        {
            return statusEffects.FirstOrDefault(e => e.effectType == effectType);
        }
        
        /// <summary>
        /// Clear all stat modifiers
        /// </summary>
        public void ClearAllModifiers()
        {
            var modifiers = statModifiers.Values.ToList();
            statModifiers.Clear();
            
            foreach (var modifier in modifiers)
            {
                OnStatModifierRemoved?.Invoke(modifier);
            }
            
            RecalculateAllStats();
        }
        
        /// <summary>
        /// Clear all status effects
        /// </summary>
        public void ClearAllStatusEffects()
        {
            var effects = statusEffects.ToList();
            statusEffects.Clear();
            
            foreach (var effect in effects)
            {
                OnStatusEffectRemoved?.Invoke(effect);
            }
            
            RecalculateAllStats();
        }
        
        /// <summary>
        /// Reset stats to base values
        /// </summary>
        public void ResetToBase()
        {
            ClearAllModifiers();
            ClearAllStatusEffects();
            InitializeStats();
        }
        
        /// <summary>
        /// Get stat summary for debugging
        /// </summary>
        public string GetStatSummary()
        {
            return $"HP: {currentHP}/{maxHP} | Speed: {GetStat(StatType.Speed)} | " +
                   $"Attack: {GetStat(StatType.Attack)} | Defense: {GetStat(StatType.Defense)} | " +
                   $"Type: {spiritType} | Level: {level}";
        }
    }
    
    /// <summary>
    /// Types of stats that can be modified
    /// </summary>
    public enum StatType
    {
        None,
        HP,
        Speed,
        Attack,
        Defense,
        SpecialAttack,
        SpecialDefense,
        Accuracy,
        Evasion
    }
    
    /// <summary>
    /// Spirit types for type advantages/disadvantages
    /// </summary>
    public enum SpiritType
    {
        Neutral,
        Fire,
        Water,
        Earth,
        Air,
        Light,
        Dark,
        Electric,
        Ice,
        Nature,
        Psychic,
        Fighting,
        Ghost,
        Dragon,
        Fairy,
        Steel
    }
    
    /// <summary>
    /// Types of status effects
    /// </summary>
    public enum StatusEffectType
    {
        None,
        Burn,
        Freeze,
        Paralyze,
        Poison,
        Sleep,
        Confusion,
        Attract,
        Curse,
        LeechSeed,
        Nightmare,
        PerishSong,
        Taunt,
        Torment,
        Encore,
        Disable
    }
}