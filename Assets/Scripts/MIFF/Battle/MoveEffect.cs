using System;

namespace MIFF.Battle
{
    /// <summary>
    /// Represents an effect that can be applied by a move
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class MoveEffect
    {
        [Header("Effect Identity")]
        public string effectID;
        public string displayName;
        public string description;
        public MoveEffectType effectType;
        
        [Header("Effect Properties")]
        public int chance = 100; // Percentage chance to apply
        public int duration = 1;
        public int power = 1;
        public bool affectsUser;
        public bool affectsTarget = true;
        public bool affectsAllies;
        public bool affectsEnemies;
        
        [Header("Stat Modifications")]
        public StatType affectsStat = StatType.None;
        public float statModifierValue;
        public ModifierType statModifierType = ModifierType.Flat;
        
        [Header("Status Effects")]
        public StatusEffectType statusEffectType = StatusEffectType.None;
        public int statusEffectDuration = 3;
        public int statusEffectPower = 1;
        
        [Header("Damage & Healing")]
        public int damageAmount;
        public int healingAmount;
        public bool isPercentageBased;
        public bool healsUser;
        public bool damagesUser;
        
        [Header("Special Effects")]
        public bool flinchesTarget;
        public bool confusesTarget;
        public bool putsToSleep;
        public bool freezesTarget;
        public bool paralyzesTarget;
        public bool poisonsTarget;
        public bool burnsTarget;
        
        [Header("Remix Hooks")]
        public string customEffectScript;
        public bool isRemixable = true;
        
        // Events for remixers to hook into
        public event Action<MoveEffect, BattleContext> OnEffectApplied;
        public event Action<MoveEffect, BattleContext, BattleSpirit> OnEffectTargeted;
        
        public MoveEffect()
        {
            effectID = Guid.NewGuid().ToString();
        }
        
        /// <summary>
        /// Create a new move effect
        /// </summary>
        public MoveEffect(MoveEffectType effectType, int chance = 100)
        {
            this.effectType = effectType;
            this.chance = chance;
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
                case MoveEffectType.StatBoost:
                    displayName = "Stat Boost";
                    description = "Increases a stat";
                    affectsUser = true;
                    affectsTarget = false;
                    break;
                    
                case MoveEffectType.StatDebuff:
                    displayName = "Stat Debuff";
                    description = "Decreases a stat";
                    affectsTarget = true;
                    affectsUser = false;
                    break;
                    
                case MoveEffectType.StatusInflict:
                    displayName = "Status Inflict";
                    description = "Applies a status condition";
                    affectsTarget = true;
                    affectsUser = false;
                    break;
                    
                case MoveEffectType.Heal:
                    displayName = "Heal";
                    description = "Restores HP";
                    affectsUser = true;
                    affectsTarget = false;
                    break;
                    
                case MoveEffectType.Drain:
                    displayName = "Drain";
                    description = "Steals HP from target";
                    affectsUser = true;
                    affectsTarget = true;
                    break;
                    
                case MoveEffectType.Flinch:
                    displayName = "Flinch";
                    description = "May cause target to flinch";
                    affectsTarget = true;
                    affectsUser = false;
                    flinchesTarget = true;
                    break;
                    
                case MoveEffectType.Confuse:
                    displayName = "Confuse";
                    description = "May confuse the target";
                    affectsTarget = true;
                    affectsUser = false;
                    confusesTarget = true;
                    break;
                    
                case MoveEffectType.Sleep:
                    displayName = "Sleep";
                    description = "May put target to sleep";
                    affectsTarget = true;
                    affectsUser = false;
                    putsToSleep = true;
                    break;
                    
                case MoveEffectType.Freeze:
                    displayName = "Freeze";
                    description = "May freeze the target";
                    affectsTarget = true;
                    affectsUser = false;
                    freezesTarget = true;
                    break;
                    
                case MoveEffectType.Paralyze:
                    displayName = "Paralyze";
                    description = "May paralyze the target";
                    affectsTarget = true;
                    affectsUser = false;
                    paralyzesTarget = true;
                    break;
                    
                case MoveEffectType.Poison:
                    displayName = "Poison";
                    description = "May poison the target";
                    affectsTarget = true;
                    affectsUser = false;
                    poisonsTarget = true;
                    break;
                    
                case MoveEffectType.Burn:
                    displayName = "Burn";
                    description = "May burn the target";
                    affectsTarget = true;
                    affectsUser = false;
                    burnsTarget = true;
                    break;
                    
                default:
                    displayName = effectType.ToString();
                    description = "Move effect";
                    break;
            }
        }
        
        /// <summary>
        /// Check if effect should be applied based on chance
        /// </summary>
        public bool ShouldApply()
        {
            if (chance >= 100) return true;
            
            Random random = new Random();
            return random.Next(1, 101) <= chance;
        }
        
        /// <summary>
        /// Apply the effect to a target
        /// </summary>
        public void ApplyEffect(BattleSpirit user, BattleSpirit target, BattleContext context)
        {
            if (!ShouldApply()) return;
            
            // Apply stat modifications
            if (affectsStat != StatType.None && statModifierValue != 0)
            {
                ApplyStatModification(target);
            }
            
            // Apply status effects
            if (statusEffectType != StatusEffectType.None)
            {
                ApplyStatusEffect(target);
            }
            
            // Apply healing
            if (healingAmount > 0)
            {
                ApplyHealing(user, target);
            }
            
            // Apply damage
            if (damageAmount > 0)
            {
                ApplyDamage(user, target);
            }
            
            // Apply special effects
            ApplySpecialEffects(target);
            
            // Trigger events
            OnEffectApplied?.Invoke(this, context);
            OnEffectTargeted?.Invoke(this, context, target);
        }
        
        /// <summary>
        /// Apply stat modification
        /// </summary>
        private void ApplyStatModification(BattleSpirit target)
        {
            var modifier = new StatModifier
            {
                statType = affectsStat,
                modifierType = statModifierType,
                value = statModifierValue,
                duration = duration,
                displayName = displayName,
                description = description,
                sourceType = ModifierSource.Move
            };
            
            target.Stats.AddStatModifier(modifier);
        }
        
        /// <summary>
        /// Apply status effect
        /// </summary>
        private void ApplyStatusEffect(BattleSpirit target)
        {
            var statusEffect = new StatusEffect(statusEffectType, statusEffectDuration, statusEffectPower)
            {
                sourceType = ModifierSource.Move
            };
            
            target.Stats.AddStatusEffect(statusEffect);
        }
        
        /// <summary>
        /// Apply healing
        /// </summary>
        private void ApplyHealing(BattleSpirit user, BattleSpirit target)
        {
            int healAmount = healingAmount;
            
            if (isPercentageBased)
            {
                healAmount = (int)(target.Stats.maxHP * (healingAmount / 100.0f));
            }
            
            if (healsUser)
            {
                user.Stats.Heal(healAmount);
            }
            else if (affectsTarget)
            {
                target.Stats.Heal(healAmount);
            }
        }
        
        /// <summary>
        /// Apply damage
        /// </summary>
        private void ApplyDamage(BattleSpirit user, BattleSpirit target)
        {
            int damage = damageAmount;
            
            if (isPercentageBased)
            {
                damage = (int)(target.Stats.currentHP * (damageAmount / 100.0f));
            }
            
            if (damagesUser)
            {
                user.Stats.TakeDamage(damage);
            }
            else if (affectsTarget)
            {
                target.Stats.TakeDamage(damage);
            }
        }
        
        /// <summary>
        /// Apply special effects
        /// </summary>
        private void ApplySpecialEffects(BattleSpirit target)
        {
            if (flinchesTarget)
            {
                // Apply flinch status (prevents actions for one turn)
                var flinchEffect = new StatusEffect(StatusEffectType.Disable, 1, 1)
                {
                    displayName = "Flinch",
                    description = "Cannot take actions this turn",
                    preventsActions = true,
                    sourceType = ModifierSource.Move
                };
                target.Stats.AddStatusEffect(flinchEffect);
            }
            
            if (confusesTarget)
            {
                var confuseEffect = new StatusEffect(StatusEffectType.Confusion, 3, 1)
                {
                    sourceType = ModifierSource.Move
                };
                target.Stats.AddStatusEffect(confuseEffect);
            }
            
            if (putsToSleep)
            {
                var sleepEffect = new StatusEffect(StatusEffectType.Sleep, 3, 1)
                {
                    sourceType = ModifierSource.Move
                };
                target.Stats.AddStatusEffect(sleepEffect);
            }
            
            if (freezesTarget)
            {
                var freezeEffect = new StatusEffect(StatusEffectType.Freeze, 3, 1)
                {
                    sourceType = ModifierSource.Move
                };
                target.Stats.AddStatusEffect(freezeEffect);
            }
            
            if (paralyzesTarget)
            {
                var paralyzeEffect = new StatusEffect(StatusEffectType.Paralyze, 3, 1)
                {
                    sourceType = ModifierSource.Move
                };
                target.Stats.AddStatusEffect(paralyzeEffect);
            }
            
            if (poisonsTarget)
            {
                var poisonEffect = new StatusEffect(StatusEffectType.Poison, 3, 1)
                {
                    sourceType = ModifierSource.Move
                };
                target.Stats.AddStatusEffect(poisonEffect);
            }
            
            if (burnsTarget)
            {
                var burnEffect = new StatusEffect(StatusEffectType.Burn, 3, 1)
                {
                    sourceType = ModifierSource.Move
                };
                target.Stats.AddStatusEffect(burnEffect);
            }
        }
        
        /// <summary>
        /// Get effect description
        /// </summary>
        public string GetDescription()
        {
            string chanceInfo = chance < 100 ? $" ({chance}% chance)" : "";
            string durationInfo = duration > 1 ? $" for {duration} turns" : "";
            
            return $"{displayName}{chanceInfo}: {description}{durationInfo}";
        }
        
        /// <summary>
        /// Get effect summary for debugging
        /// </summary>
        public string GetEffectSummary()
        {
            return $"{effectType} | Chance: {chance}% | Duration: {duration} | Power: {power} | Target: {(affectsTarget ? "Yes" : "No")} | User: {(affectsUser ? "Yes" : "No")}";
        }
        
        /// <summary>
        /// Clone this effect
        /// </summary>
        public MoveEffect Clone()
        {
            return new MoveEffect
            {
                effectID = Guid.NewGuid().ToString(),
                displayName = displayName,
                description = description,
                effectType = effectType,
                chance = chance,
                duration = duration,
                power = power,
                affectsUser = affectsUser,
                affectsTarget = affectsTarget,
                affectsAllies = affectsAllies,
                affectsEnemies = affectsEnemies,
                affectsStat = affectsStat,
                statModifierValue = statModifierValue,
                statModifierType = statModifierType,
                statusEffectType = statusEffectType,
                statusEffectDuration = statusEffectDuration,
                statusEffectPower = statusEffectPower,
                damageAmount = damageAmount,
                healingAmount = healingAmount,
                isPercentageBased = isPercentageBased,
                healsUser = healsUser,
                damagesUser = damagesUser,
                flinchesTarget = flinchesTarget,
                confusesTarget = confusesTarget,
                putsToSleep = putsToSleep,
                freezesTarget = freezesTarget,
                paralyzesTarget = paralyzesTarget,
                poisonsTarget = poisonsTarget,
                burnsTarget = burnsTarget,
                customEffectScript = customEffectScript,
                isRemixable = isRemixable
            };
        }
        
        /// <summary>
        /// Check if effect is beneficial
        /// </summary>
        public bool IsBeneficial => effectType switch
        {
            MoveEffectType.StatBoost => true,
            MoveEffectType.Heal => true,
            MoveEffectType.Drain => true,
            _ => false
        };
        
        /// <summary>
        /// Check if effect is harmful
        /// </summary>
        public bool IsHarmful => effectType switch
        {
            MoveEffectType.StatDebuff => true,
            MoveEffectType.StatusInflict => true,
            MoveEffectType.Damage => true,
            _ => false
        };
        
        /// <summary>
        /// Check if effect is neutral
        /// </summary>
        public bool IsNeutral => !IsBeneficial && !IsHarmful;
    }
    
    /// <summary>
    /// Types of move effects
    /// </summary>
    public enum MoveEffectType
    {
        None,
        StatBoost,      // Increase stats
        StatDebuff,     // Decrease stats
        StatusInflict,  // Apply status conditions
        Heal,           // Restore HP
        Drain,          // Steal HP
        Damage,         // Deal damage
        Flinch,         // Prevent actions
        Confuse,        // Cause confusion
        Sleep,          // Put to sleep
        Freeze,         // Freeze target
        Paralyze,       // Paralyze target
        Poison,         // Poison target
        Burn,           // Burn target
        Custom          // Custom effect for remixers
    }
}