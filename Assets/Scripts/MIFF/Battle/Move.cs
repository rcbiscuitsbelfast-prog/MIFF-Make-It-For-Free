using System;
using System.Collections.Generic;
using System.Linq; // Added for .Any() and .Where()
using UnityEngine; // Added for [Header]

namespace MIFF.Battle
{
    /// <summary>
    /// Defines a move that spirits can use in battle
    /// Includes targeting rules, effects, and lore hooks for remixers
    /// </summary>
    [Serializable]
    public class Move
    {
        [Header("Move Identity")]
        public string moveID;
        public string displayName;
        public string description;
        public string loreDescription;
        
        [Header("Move Properties")]
        public MoveType moveType;
        public SpiritType spiritType = SpiritType.Neutral;
        public int power;
        public int accuracy;
        public int powerPoints;
        public int maxPowerPoints;
        public int priority;
        
        [Header("Targeting Rules")]
        public TargetType targetType = TargetType.SingleEnemy;
        public int maxTargets = 1;
        public bool canHitSelf;
        public bool canHitAllies;
        public bool canHitEnemies = true;
        public bool requiresTarget = true;
        
        [Header("Move Effects")]
        public List<MoveEffect> effects = new List<MoveEffect>();
        public float criticalHitChance = 0.0625f; // 1/16 default
        public bool alwaysHits;
        public bool neverMisses;
        public bool bypassesProtection;
        
        [Header("Category & Classification")]
        public MoveCategory category = MoveCategory.Physical;
        public MoveClassification classification = MoveClassification.Damage;
        public string[] tags = new string[0];
        
        [Header("Lore & Flavor")]
        public string artist; // K-pop artist inspiration
        public string song; // Song inspiration
        public string[] keywords = new string[0];
        public bool isSignatureMove;
        public bool isLegendaryMove;
        
        [Header("Remix Hooks")]
        public string customEffectScript;
        public string[] requiredMods = new string[0];
        public bool isRemixable = true;
        
        // Events for remixers to hook into
        public event Action<Move, BattleContext> OnMoveUsed;
        public event Action<Move, BattleContext, bool> OnMoveHit;
        public event Action<Move, BattleContext, int> OnDamageDealt;
        public event Action<Move, BattleContext, MoveEffect> OnEffectApplied;
        
        public Move()
        {
            moveID = Guid.NewGuid().ToString();
            maxPowerPoints = powerPoints;
        }
        
        /// <summary>
        /// Create a new move
        /// </summary>
        public Move(string name, MoveType moveType, int power, int accuracy, int powerPoints)
        {
            this.displayName = name;
            this.moveType = moveType;
            this.power = power;
            this.accuracy = accuracy;
            this.powerPoints = powerPoints;
            this.maxPowerPoints = powerPoints;
            this.moveID = Guid.NewGuid().ToString();
        }
        
        /// <summary>
        /// Check if move can be used
        /// </summary>
        public bool CanUse()
        {
            return powerPoints > 0;
        }
        
        /// <summary>
        /// Use the move (consume PP)
        /// </summary>
        public void Use()
        {
            if (powerPoints > 0)
            {
                powerPoints--;
            }
        }
        
        /// <summary>
        /// Restore PP
        /// </summary>
        public void RestorePP(int amount)
        {
            powerPoints = Math.Min(maxPowerPoints, powerPoints + amount);
        }
        
        /// <summary>
        /// Restore all PP
        /// </summary>
        public void RestoreAllPP()
        {
            powerPoints = maxPowerPoints;
        }
        
        /// <summary>
        /// Check if move hits based on accuracy
        /// </summary>
        public bool CheckHit(int userAccuracy, int targetEvasion)
        {
            if (alwaysHits || neverMisses) return true;
            
            // Calculate hit chance
            float hitChance = (float)accuracy * userAccuracy / (targetEvasion * 100.0f);
            
            // Apply random factor
            Random random = new Random();
            return random.NextDouble() < hitChance;
        }
        
        /// <summary>
        /// Check if move is a critical hit
        /// </summary>
        public bool CheckCriticalHit()
        {
            Random random = new Random();
            return random.NextDouble() < criticalHitChance;
        }
        
        /// <summary>
        /// Get move description with current PP
        /// </summary>
        public string GetDescription()
        {
            string ppInfo = $"PP: {powerPoints}/{maxPowerPoints}";
            string powerInfo = power > 0 ? $" | Power: {power}" : "";
            string accuracyInfo = accuracy > 0 ? $" | Accuracy: {accuracy}%" : "";
            
            return $"{displayName} - {description} | {ppInfo}{powerInfo}{accuracyInfo}";
        }
        
        /// <summary>
        /// Get move summary for debugging
        /// </summary>
        public string GetMoveSummary()
        {
            return $"{displayName} ({moveType}) | Power: {power} | Accuracy: {accuracy}% | PP: {powerPoints}/{maxPowerPoints} | Target: {targetType}";
        }
        
        /// <summary>
        /// Check if move can target specific spirit
        /// </summary>
        public bool CanTarget(BattleSpirit user, BattleSpirit target, BattleContext context)
        {
            if (target == null) return false;
            
            // Check if target is valid based on target type
            switch (targetType)
            {
                case TargetType.Self:
                    return target == user;
                    
                case TargetType.SingleAlly:
                    return context.IsAlly(user, target) && target != user;
                    
                case TargetType.AllAllies:
                    return context.IsAlly(user, target);
                    
                case TargetType.SingleEnemy:
                    return context.IsEnemy(user, target);
                    
                case TargetType.AllEnemies:
                    return context.IsEnemy(user, target);
                    
                case TargetType.AllSpirits:
                    return true;
                    
                case TargetType.RandomEnemy:
                    return context.IsEnemy(user, target);
                    
                case TargetType.RandomAlly:
                    return context.IsAlly(user, target);
                    
                default:
                    return false;
            }
        }
        
        /// <summary>
        /// Get valid targets for this move
        /// </summary>
        public List<BattleSpirit> GetValidTargets(BattleSpirit user, BattleContext context)
        {
            var validTargets = new List<BattleSpirit>();
            
            foreach (var spirit in context.GetAllSpirits())
            {
                if (CanTarget(user, spirit, context))
                {
                    validTargets.Add(spirit);
                }
            }
            
            return validTargets;
        }
        
        /// <summary>
        /// Add an effect to this move
        /// </summary>
        public void AddEffect(MoveEffect effect)
        {
            if (effect != null && !effects.Contains(effect))
            {
                effects.Add(effect);
            }
        }
        
        /// <summary>
        /// Remove an effect from this move
        /// </summary>
        public void RemoveEffect(MoveEffect effect)
        {
            if (effects.Contains(effect))
            {
                effects.Remove(effect);
            }
        }
        
        /// <summary>
        /// Check if move has specific effect type
        /// </summary>
        public bool HasEffect(MoveEffectType effectType)
        {
            return effects.Any(e => e.effectType == effectType);
        }
        
        /// <summary>
        /// Get effects by type
        /// </summary>
        public List<MoveEffect> GetEffectsByType(MoveEffectType effectType)
        {
            return effects.Where(e => e.effectType == effectType).ToList();
        }
        
        /// <summary>
        /// Check if move is super effective against target
        /// </summary>
        public float GetTypeEffectiveness(BattleSpirit target)
        {
            if (spiritType == SpiritType.Neutral || target.Stats.spiritType == SpiritType.Neutral)
                return 1.0f;
            
            // Type effectiveness chart (simplified)
            var effectiveness = GetTypeEffectiveness(spiritType, target.Stats.spiritType);
            return effectiveness;
        }
        
        /// <summary>
        /// Get type effectiveness between two types
        /// </summary>
        private float GetTypeEffectiveness(SpiritType attackType, SpiritType defenseType)
        {
            // This is a simplified type chart - remixers can extend this
            var typeChart = new Dictionary<SpiritType, Dictionary<SpiritType, float>>
            {
                { SpiritType.Fire, new Dictionary<SpiritType, float> { { SpiritType.Grass, 2.0f }, { SpiritType.Ice, 2.0f }, { SpiritType.Water, 0.5f } } },
                { SpiritType.Water, new Dictionary<SpiritType, float> { { SpiritType.Fire, 2.0f }, { SpiritType.Ground, 2.0f }, { SpiritType.Grass, 0.5f } } },
                { SpiritType.Grass, new Dictionary<SpiritType, float> { { SpiritType.Water, 2.0f }, { SpiritType.Ground, 2.0f }, { SpiritType.Fire, 0.5f } } },
                { SpiritType.Electric, new Dictionary<SpiritType, float> { { SpiritType.Water, 2.0f }, { SpiritType.Flying, 2.0f }, { SpiritType.Ground, 0.0f } } },
                { SpiritType.Ice, new Dictionary<SpiritType, float> { { SpiritType.Grass, 2.0f }, { SpiritType.Ground, 2.0f }, { SpiritType.Fire, 0.5f } } },
                { SpiritType.Fighting, new Dictionary<SpiritType, float> { { SpiritType.Normal, 2.0f }, { SpiritType.Ice, 2.0f }, { SpiritType.Flying, 0.5f } } },
                { SpiritType.Poison, new Dictionary<SpiritType, float> { { SpiritType.Grass, 2.0f }, { SpiritType.Fairy, 0.5f } } },
                { SpiritType.Ground, new Dictionary<SpiritType, float> { { SpiritType.Fire, 2.0f }, { SpiritType.Electric, 2.0f }, { SpiritType.Grass, 0.5f } } },
                { SpiritType.Flying, new Dictionary<SpiritType, float> { { SpiritType.Grass, 2.0f }, { SpiritType.Fighting, 2.0f }, { SpiritType.Electric, 0.5f } } },
                { SpiritType.Psychic, new Dictionary<SpiritType, float> { { SpiritType.Fighting, 2.0f }, { SpiritType.Poison, 2.0f }, { SpiritType.Dark, 0.5f } } },
                { SpiritType.Bug, new Dictionary<SpiritType, float> { { SpiritType.Grass, 2.0f }, { SpiritType.Psychic, 2.0f }, { SpiritType.Fire, 0.5f } } },
                { SpiritType.Rock, new Dictionary<SpiritType, float> { { SpiritType.Fire, 2.0f }, { SpiritType.Ice, 2.0f }, { SpiritType.Fighting, 0.5f } } },
                { SpiritType.Ghost, new Dictionary<SpiritType, float> { { SpiritType.Psychic, 2.0f }, { SpiritType.Ghost, 2.0f }, { SpiritType.Normal, 0.0f } } },
                { SpiritType.Dragon, new Dictionary<SpiritType, float> { { SpiritType.Dragon, 2.0f }, { SpiritType.Fairy, 0.5f } } },
                { SpiritType.Dark, new Dictionary<SpiritType, float> { { SpiritType.Psychic, 2.0f }, { SpiritType.Ghost, 2.0f }, { SpiritType.Fighting, 0.5f } } },
                { SpiritType.Steel, new Dictionary<SpiritType, float> { { SpiritType.Ice, 2.0f }, { SpiritType.Rock, 2.0f }, { SpiritType.Fire, 0.5f } } },
                { SpiritType.Fairy, new Dictionary<SpiritType, float> { { SpiritType.Fighting, 2.0f }, { SpiritType.Dragon, 2.0f }, { SpiritType.Poison, 0.5f } } }
            };
            
            if (typeChart.ContainsKey(attackType) && typeChart[attackType].ContainsKey(defenseType))
            {
                return typeChart[attackType][defenseType];
            }
            
            return 1.0f; // Neutral effectiveness
        }
        
        /// <summary>
        /// Clone this move
        /// </summary>
        public Move Clone()
        {
            var clonedMove = new Move
            {
                moveID = Guid.NewGuid().ToString(),
                displayName = displayName,
                description = description,
                loreDescription = loreDescription,
                moveType = moveType,
                spiritType = spiritType,
                power = power,
                accuracy = accuracy,
                powerPoints = powerPoints,
                maxPowerPoints = maxPowerPoints,
                priority = priority,
                targetType = targetType,
                maxTargets = maxTargets,
                canHitSelf = canHitSelf,
                canHitAllies = canHitAllies,
                canHitEnemies = canHitEnemies,
                requiresTarget = requiresTarget,
                criticalHitChance = criticalHitChance,
                alwaysHits = alwaysHits,
                neverMisses = neverMisses,
                bypassesProtection = bypassesProtection,
                category = category,
                classification = classification,
                tags = (string[])tags.Clone(),
                artist = artist,
                song = song,
                keywords = (string[])keywords.Clone(),
                isSignatureMove = isSignatureMove,
                isLegendaryMove = isLegendaryMove,
                customEffectScript = customEffectScript,
                requiredMods = (string[])requiredMods.Clone(),
                isRemixable = isRemixable
            };
            
            // Clone effects
            foreach (var effect in effects)
            {
                clonedMove.effects.Add(effect.Clone());
            }
            
            return clonedMove;
        }
        
        /// <summary>
        /// Check if move is physical
        /// </summary>
        public bool IsPhysical => category == MoveCategory.Physical;
        
        /// <summary>
        /// Check if move is special
        /// </summary>
        public bool IsSpecial => category == MoveCategory.Special;
        
        /// <summary>
        /// Check if move is status
        /// </summary>
        public bool IsStatus => category == MoveCategory.Status;
        
        /// <summary>
        /// Check if move deals damage
        /// </summary>
        public bool DealsDamage => classification == MoveClassification.Damage;
        
        /// <summary>
        /// Check if move is healing
        /// </summary>
        public bool IsHealing => classification == MoveClassification.Healing;
        
        /// <summary>
        /// Check if move is support
        /// </summary>
        public bool IsSupport => classification == MoveClassification.Support;
    }
    
    /// <summary>
    /// Types of moves
    /// </summary>
    public enum MoveType
    {
        Normal,
        Fire,
        Water,
        Electric,
        Grass,
        Ice,
        Fighting,
        Poison,
        Ground,
        Flying,
        Psychic,
        Bug,
        Rock,
        Ghost,
        Dragon,
        Dark,
        Steel,
        Fairy
    }
    
    /// <summary>
    /// Move categories
    /// </summary>
    public enum MoveCategory
    {
        Physical,   // Uses Attack/Defense
        Special,    // Uses Special Attack/Special Defense
        Status      // No damage, only effects
    }
    
    /// <summary>
    /// Move classifications
    /// </summary>
    public enum MoveClassification
    {
        Damage,     // Deals damage
        Healing,    // Restores HP
        Support,    // Buffs/debuffs
        Utility     // Other effects
    }
    
    /// <summary>
    /// Target types for moves
    /// </summary>
    public enum TargetType
    {
        None,
        Self,
        SingleAlly,
        AllAllies,
        SingleEnemy,
        AllEnemies,
        AllSpirits,
        RandomEnemy,
        RandomAlly
    }
}