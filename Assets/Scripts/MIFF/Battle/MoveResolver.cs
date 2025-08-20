using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Battle
{
    /// <summary>
    /// Calculates damage, applies effects, and resolves targeting for moves
    /// Modular design for future expansion and remixers
    /// </summary>
    [Serializable]
    public class MoveResolver
    {
        [Header("Damage Calculation")]
        public bool enableCriticalHits = true;
        public bool enableTypeEffectiveness = true;
        public bool enableSTAB = true;
        public bool enableWeatherEffects = true;
        public bool enableFieldEffects = true;
        
        [Header("Effect Application")]
        public bool enableStatusEffects = true;
        public bool enableStatModifiers = true;
        public bool enableSpecialEffects = true;
        public bool enableLoreHooks = true;
        
        [Header("Randomization")]
        public bool enableRandomization = true;
        public float damageVariation = 0.15f; // ±15% damage variation
        public Random random;
        
        // Events for remixers to hook into
        public event Action<MoveResolver, Move, BattleSpirit, BattleSpirit> OnMoveResolved;
        public event Action<MoveResolver, Move, BattleSpirit, BattleSpirit, int> OnDamageCalculated;
        public event Action<MoveResolver, Move, BattleSpirit, BattleSpirit, bool> OnMoveHit;
        public event Action<MoveResolver, Move, BattleSpirit, BattleSpirit, MoveEffect> OnEffectApplied;
        
        public MoveResolver()
        {
            random = new Random();
        }
        
        /// <summary>
        /// Resolve a move execution
        /// </summary>
        public MoveResolutionResult ResolveMove(Move move, BattleSpirit user, BattleSpirit target, BattleContext context)
        {
            if (move == null || user == null || target == null || context == null)
            {
                return new MoveResolutionResult { success = false, message = "Invalid parameters" };
            }
            
            var result = new MoveResolutionResult
            {
                move = move,
                user = user,
                target = target,
                context = context,
                success = true
            };
            
            // Check if move can hit
            if (!CheckMoveHit(move, user, target, context))
            {
                result.success = false;
                result.message = "Move missed!";
                OnMoveHit?.Invoke(this, move, user, target, false);
                return result;
            }
            
            OnMoveHit?.Invoke(this, move, user, target, true);
            
            // Calculate and apply damage
            if (move.DealsDamage)
            {
                int damage = CalculateDamage(move, user, target, context);
                result.damageDealt = damage;
                result.isCriticalHit = move.CheckCriticalHit();
                
                // Apply damage
                target.TakeDamage(damage, user);
                
                OnDamageCalculated?.Invoke(this, move, user, target, damage);
            }
            
            // Apply move effects
            if (enableStatusEffects || enableStatModifiers || enableSpecialEffects)
            {
                ApplyMoveEffects(move, user, target, context, result);
            }
            
            // Apply lore hooks
            if (enableLoreHooks)
            {
                ApplyLoreHooks(move, user, target, context, result);
            }
            
            // Trigger move resolution event
            OnMoveResolved?.Invoke(this, move, user, target);
            
            return result;
        }
        
        /// <summary>
        /// Check if a move hits the target
        /// </summary>
        private bool CheckMoveHit(Move move, BattleSpirit user, BattleSpirit target, BattleContext context)
        {
            if (move.alwaysHits || move.neverMisses) return true;
            
            // Get accuracy and evasion stats
            int userAccuracy = user.Stats.GetStat(StatType.Accuracy);
            int targetEvasion = target.Stats.GetStat(StatType.Evasion);
            
            // Apply weather effects
            if (enableWeatherEffects && context.DoesWeatherAffectAccuracy())
            {
                userAccuracy = (int)(userAccuracy * context.GetWeatherAccuracyModifier());
            }
            
            // Calculate hit chance
            float hitChance = (float)move.accuracy * userAccuracy / (targetEvasion * 100.0f);
            
            // Apply random factor
            if (enableRandomization)
            {
                return random.NextDouble() < hitChance;
            }
            
            return hitChance >= 0.5f; // Deterministic fallback
        }
        
        /// <summary>
        /// Calculate damage for a move
        /// </summary>
        private int CalculateDamage(Move move, BattleSpirit user, BattleSpirit target, BattleContext context)
        {
            if (move.power <= 0) return 0;
            
            // Base damage calculation
            float damage = CalculateBaseDamage(move, user, target);
            
            // Apply type effectiveness
            if (enableTypeEffectiveness)
            {
                float typeEffectiveness = move.GetTypeEffectiveness(target);
                damage *= typeEffectiveness;
                
                // Add effectiveness message
                if (typeEffectiveness > 1.5f)
                {
                    // Super effective
                }
                else if (typeEffectiveness < 0.5f)
                {
                    // Not very effective
                }
            }
            
            // Apply STAB (Same Type Attack Bonus)
            if (enableSTAB && move.spiritType == user.Stats.spiritType)
            {
                damage *= 1.5f;
            }
            
            // Apply weather effects
            if (enableWeatherEffects)
            {
                float weatherMultiplier = context.GetWeatherEffect(move.spiritType);
                damage *= weatherMultiplier;
            }
        
            // Apply field effects
            if (enableFieldEffects)
            {
                float fieldMultiplier = context.GetFieldEffect(move.spiritType);
                damage *= fieldMultiplier;
            }
            
            // Apply critical hit
            if (enableCriticalHits && move.CheckCriticalHit())
            {
                damage *= 1.5f;
            }
            
            // Apply damage variation
            if (enableRandomization)
            {
                float variation = 1.0f + (float)(random.NextDouble() - 0.5) * damageVariation * 2;
                damage *= variation;
            }
            
            // Ensure minimum damage
            damage = Math.Max(1, damage);
            
            return (int)damage;
        }
        
        /// <summary>
        /// Calculate base damage for a move
        /// </summary>
        private float CalculateBaseDamage(Move move, BattleSpirit user, BattleSpirit target)
        {
            float attack, defense;
            
            if (move.IsPhysical)
            {
                attack = user.Stats.GetStat(StatType.Attack);
                defense = target.Stats.GetStat(StatType.Defense);
            }
            else if (move.IsSpecial)
            {
                attack = user.Stats.GetStat(StatType.SpecialAttack);
                defense = target.Stats.GetStat(StatType.SpecialDefense);
            }
            else
            {
                // Status moves don't deal damage
                return 0;
            }
            
            // Standard damage formula
            float level = user.Stats.level;
            float power = move.power;
            
            float damage = ((2 * level / 5 + 2) * power * attack / defense) / 50 + 2;
            
            return damage;
        }
        
        /// <summary>
        /// Apply move effects to the target
        /// </summary>
        private void ApplyMoveEffects(Move move, BattleSpirit user, BattleSpirit target, BattleContext context, MoveResolutionResult result)
        {
            if (move.effects == null || move.effects.Count == 0) return;
            
            foreach (var effect in move.effects)
            {
                if (effect == null) continue;
                
                // Check if effect should be applied
                if (!effect.ShouldApply()) continue;
                
                // Apply the effect
                effect.ApplyEffect(user, target, context);
                
                // Record the effect in the result
                result.appliedEffects.Add(effect);
                
                // Trigger effect applied event
                OnEffectApplied?.Invoke(this, move, user, target, effect);
            }
        }
        
        /// <summary>
        /// Apply lore hooks for the move
        /// </summary>
        private void ApplyLoreHooks(Move move, BattleSpirit user, BattleSpirit target, BattleContext context, MoveResolutionResult result)
        {
            // This is where remixers can hook into lore systems
            // For example, triggering evolution, unlocking lore entries, etc.
            
            // Check for signature move bonuses
            if (move.isSignatureMove && user.speciesID.Contains(move.artist?.ToLower()))
            {
                // Signature move bonus
                result.loreBonuses.Add("Signature Move Bonus");
            }
            
            // Check for legendary move effects
            if (move.isLegendaryMove)
            {
                // Legendary move effects
                result.loreBonuses.Add("Legendary Move Effect");
            }
            
            // Check for K-pop synergy
            if (!string.IsNullOrEmpty(move.artist) && !string.IsNullOrEmpty(move.song))
            {
                // K-pop synergy effects
                result.loreBonuses.Add("K-pop Synergy");
            }
        }
        
        /// <summary>
        /// Resolve multiple targets for a move
        /// </summary>
        public List<MoveResolutionResult> ResolveMoveMultiTarget(Move move, BattleSpirit user, List<BattleSpirit> targets, BattleContext context)
        {
            var results = new List<MoveResolutionResult>();
            
            foreach (var target in targets)
            {
                var result = ResolveMove(move, user, target, context);
                results.Add(result);
            }
            
            return results;
        }
        
        /// <summary>
        /// Resolve a move with random targeting
        /// </summary>
        public MoveResolutionResult ResolveMoveRandomTarget(Move move, BattleSpirit user, BattleContext context)
        {
            var validTargets = context.GetValidTargets(user, move);
            if (validTargets.Count == 0)
            {
                return new MoveResolutionResult { success = false, message = "No valid targets" };
            }
            
            // Select random target
            int randomIndex = random.Next(validTargets.Count);
            var target = validTargets[randomIndex];
            
            return ResolveMove(move, user, target, context);
        }
        
        /// <summary>
        /// Calculate potential damage without applying it
        /// </summary>
        public int CalculatePotentialDamage(Move move, BattleSpirit user, BattleSpirit target, BattleContext context)
        {
            if (move == null || user == null || target == null || !move.DealsDamage)
                return 0;
            
            return CalculateDamage(move, user, target, context);
        }
        
        /// <summary>
        /// Get move effectiveness against a target
        /// </summary>
        public MoveEffectiveness GetMoveEffectiveness(Move move, BattleSpirit target)
        {
            if (move == null || target == null) return MoveEffectiveness.Normal;
            
            float effectiveness = move.GetTypeEffectiveness(target);
            
            if (effectiveness >= 2.0f)
                return MoveEffectiveness.SuperEffective;
            else if (effectiveness >= 1.5f)
                return MoveEffectiveness.Effective;
            else if (effectiveness >= 0.5f)
                return MoveEffectiveness.Normal;
            else if (effectiveness > 0.0f)
                return MoveEffectiveness.NotVeryEffective;
            else
                return MoveEffectiveness.NoEffect;
        }
        
        /// <summary>
        /// Check if a move can be used against a target
        /// </summary>
        public bool CanMoveHitTarget(Move move, BattleSpirit user, BattleSpirit target, BattleContext context)
        {
            if (move == null || user == null || target == null || context == null)
                return false;
            
            // Check basic targeting rules
            if (!move.CanTarget(user, target, context))
                return false;
            
            // Check if target is fainted
            if (target.isFainted)
                return false;
            
            // Check if target is switching
            if (target.isSwitching)
                return false;
            
            return true;
        }
        
        /// <summary>
        /// Get all valid targets for a move
        /// </summary>
        public List<BattleSpirit> GetValidTargets(Move move, BattleSpirit user, BattleContext context)
        {
            if (move == null || user == null || context == null)
                return new List<BattleSpirit>();
            
            return context.GetValidTargets(user, move);
        }
        
        /// <summary>
        /// Get move resolution summary
        /// </summary>
        public string GetMoveResolutionSummary(MoveResolutionResult result)
        {
            if (result == null) return "No result";
            
            string summary = $"{result.move?.displayName} used by {result.user?.nickname}";
            
            if (result.success)
            {
                if (result.damageDealt > 0)
                {
                    summary += $" | Damage: {result.damageDealt}";
                    if (result.isCriticalHit)
                        summary += " (Critical!)";
                }
                
                if (result.appliedEffects.Count > 0)
                {
                    summary += $" | Effects: {result.appliedEffects.Count}";
                }
                
                if (result.loreBonuses.Count > 0)
                {
                    summary += $" | Bonuses: {string.Join(", ", result.loreBonuses)}";
                }
            }
            else
            {
                summary += $" | Failed: {result.message}";
            }
            
            return summary;
        }
    }
    
    /// <summary>
    /// Result of a move resolution
    /// </summary>
    [Serializable]
    public class MoveResolutionResult
    {
        [Header("Move Information")]
        public Move move;
        public BattleSpirit user;
        public BattleSpirit target;
        public BattleContext context;
        
        [Header("Resolution Results")]
        public bool success;
        public string message = "";
        public int damageDealt;
        public bool isCriticalHit;
        
        [Header("Applied Effects")]
        public List<MoveEffect> appliedEffects = new List<MoveEffect>();
        public List<string> loreBonuses = new List<string>();
        
        [Header("Timing")]
        public float resolutionTime;
        public bool wasInterrupted;
        
        public MoveResolutionResult()
        {
            appliedEffects = new List<MoveEffect>();
            loreBonuses = new List<string>();
        }
        
        /// <summary>
        /// Get result summary
        /// </summary>
        public string GetSummary()
        {
            string status = success ? "Success" : "Failed";
            string damage = damageDealt > 0 ? $" | Damage: {damageDealt}" : "";
            string effects = appliedEffects.Count > 0 ? $" | Effects: {appliedEffects.Count}" : "";
            
            return $"{status}{damage}{effects} | {message}";
        }
        
        /// <summary>
        /// Check if any effects were applied
        /// </summary>
        public bool HasEffects => appliedEffects.Count > 0;
        
        /// <summary>
        /// Check if any lore bonuses were applied
        /// </summary>
        public bool HasLoreBonuses => loreBonuses.Count > 0;
        
        /// <summary>
        /// Get total effect count
        /// </summary>
        public int TotalEffectCount => appliedEffects.Count + loreBonuses.Count;
    }
    
    /// <summary>
    /// Move effectiveness levels
    /// </summary>
    public enum MoveEffectiveness
    {
        NoEffect,
        NotVeryEffective,
        Normal,
        Effective,
        SuperEffective
    }
}