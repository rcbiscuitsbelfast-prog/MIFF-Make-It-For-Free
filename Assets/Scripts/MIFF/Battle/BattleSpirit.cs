using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Battle
{
    /// <summary>
    /// Represents a spirit in battle with stats, moves, and battle state
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class BattleSpirit
    {
        [Header("Spirit Identity")]
        public string spiritID;
        public string nickname;
        public string speciesID;
        public string trainerID;
        
        [Header("Battle State")]
        public bool isActive;
        public bool isFainted;
        public bool isSwitching;
        public bool hasMovedThisTurn;
        public bool hasUsedItemThisTurn;
        public int turnsActive;
        public int turnsSinceLastMove;
        
        [Header("Stats & Status")]
        public SpiritStats stats;
        public List<Move> moves = new List<Move>();
        public Move lastUsedMove;
        public BattleSpirit lastAttackedBy;
        public int lastDamageTaken;
        
        [Header("Battle Modifiers")]
        public float syncMultiplier = 1.0f;
        public float bondMultiplier = 1.0f;
        public float weatherMultiplier = 1.0f;
        public float fieldMultiplier = 1.0f;
        public float typeAdvantageMultiplier = 1.0f;
        
        [Header("AI & Behavior")]
        public bool isAI;
        public string aiPersonality;
        public float aggressionLevel = 0.5f;
        public float defensiveLevel = 0.5f;
        public float supportLevel = 0.5f;
        
        // Events for remixers to hook into
        public event Action<BattleSpirit> OnSpiritFainted;
        public event Action<BattleSpirit, Move> OnMoveUsed;
        public event Action<BattleSpirit, int> OnDamageTaken;
        public event Action<BattleSpirit, int> OnHealed;
        public event Action<BattleSpirit, StatModifier> OnStatModified;
        public event Action<BattleSpirit, StatusEffect> OnStatusEffectApplied;
        public event Action<BattleSpirit> OnTurnStarted;
        public event Action<BattleSpirit> OnTurnEnded;
        
        public BattleSpirit()
        {
            spiritID = Guid.NewGuid().ToString();
            stats = new SpiritStats();
        }
        
        /// <summary>
        /// Create a new battle spirit
        /// </summary>
        public BattleSpirit(string speciesID, string nickname = "")
        {
            this.speciesID = speciesID;
            this.nickname = string.IsNullOrEmpty(nickname) ? speciesID : nickname;
            this.spiritID = Guid.NewGuid().ToString();
            this.stats = new SpiritStats();
        }
        
        /// <summary>
        /// Initialize the spirit for battle
        /// </summary>
        public void InitializeForBattle()
        {
            isActive = false;
            isFainted = false;
            isSwitching = false;
            hasMovedThisTurn = false;
            hasUsedItemThisTurn = false;
            turnsActive = 0;
            turnsSinceLastMove = 0;
            
            // Reset stats to base values
            stats.ResetToBase();
            
            // Restore all PP for moves
            foreach (var move in moves)
            {
                move.RestoreAllPP();
            }
        }
        
        /// <summary>
        /// Start the spirit's turn
        /// </summary>
        public void StartTurn()
        {
            if (isFainted) return;
            
            turnsActive++;
            hasMovedThisTurn = false;
            hasUsedItemThisTurn = false;
            
            // Process status effects
            stats.ProcessStatusEffects();
            
            // Apply turn-based effects
            ApplyTurnBasedEffects();
            
            OnTurnStarted?.Invoke(this);
        }
        
        /// <summary>
        /// End the spirit's turn
        /// </summary>
        public void EndTurn()
        {
            if (isFainted) return;
            
            // Process end-of-turn effects
            ProcessEndTurnEffects();
            
            OnTurnEnded?.Invoke(this);
        }
        
        /// <summary>
        /// Use a move
        /// </summary>
        public bool UseMove(Move move, BattleSpirit target, BattleContext context)
        {
            if (!CanUseMove(move)) return false;
            
            // Use the move
            move.Use();
            lastUsedMove = move;
            hasMovedThisTurn = true;
            turnsSinceLastMove = 0;
            
            // Trigger move events
            OnMoveUsed?.Invoke(this, move);
            move.OnMoveUsed?.Invoke(move, context);
            
            return true;
        }
        
        /// <summary>
        /// Check if spirit can use a move
        /// </summary>
        public bool CanUseMove(Move move)
        {
            if (isFainted) return false;
            if (hasMovedThisTurn) return false;
            if (!move.CanUse()) return false;
            if (stats.HasStatusEffect(StatusEffectType.Sleep)) return false;
            if (stats.HasStatusEffect(StatusEffectType.Freeze)) return false;
            if (stats.HasStatusEffect(StatusEffectType.Disable)) return false;
            
            return true;
        }
        
        /// <summary>
        /// Take damage
        /// </summary>
        public void TakeDamage(int damage, BattleSpirit attacker = null)
        {
            if (isFainted) return;
            
            int oldHP = stats.currentHP;
            stats.TakeDamage(damage);
            lastDamageTaken = damage;
            lastAttackedBy = attacker;
            
            // Check if fainted
            if (stats.IsFainted)
            {
                Faint();
            }
            
            OnDamageTaken?.Invoke(this, damage);
        }
        
        /// <summary>
        /// Heal the spirit
        /// </summary>
        public void Heal(int amount)
        {
            if (isFainted) return;
            
            int oldHP = stats.currentHP;
            stats.Heal(amount);
            
            OnHealed?.Invoke(this, amount);
        }
        
        /// <summary>
        /// Faint the spirit
        /// </summary>
        public void Faint()
        {
            if (isFainted) return;
            
            isFainted = true;
            isActive = false;
            
            // Clear all status effects and modifiers
            stats.ClearAllStatusEffects();
            stats.ClearAllModifiers();
            
            OnSpiritFainted?.Invoke(this);
        }
        
        /// <summary>
        /// Revive the spirit
        /// </summary>
        public void Revive(int hpPercentage = 50)
        {
            if (!isFainted) return;
            
            isFainted = false;
            int healAmount = (int)(stats.maxHP * (hpPercentage / 100.0f));
            stats.Heal(healAmount);
            
            // Clear all status effects and modifiers
            stats.ClearAllStatusEffects();
            stats.ClearAllModifiers();
        }
        
        /// <summary>
        /// Switch the spirit
        /// </summary>
        public void Switch()
        {
            isSwitching = true;
            isActive = false;
            
            // Clear switching status at end of turn
            // This will be handled by the battle controller
        }
        
        /// <summary>
        /// Get available moves
        /// </summary>
        public List<Move> GetAvailableMoves()
        {
            return moves.Where(m => m.CanUse() && !m.displayName.Contains("Struggle")).ToList();
        }
        
        /// <summary>
        /// Get best move against target (for AI)
        /// </summary>
        public Move GetBestMove(BattleSpirit target, BattleContext context)
        {
            if (!isAI) return null;
            
            var availableMoves = GetAvailableMoves();
            if (availableMoves.Count == 0) return null;
            
            // Simple AI: choose move with highest power and type effectiveness
            Move bestMove = null;
            float bestScore = -1;
            
            foreach (var move in availableMoves)
            {
                float score = CalculateMoveScore(move, target, context);
                if (score > bestScore)
                {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            return bestMove;
        }
        
        /// <summary>
        /// Calculate move score for AI decision making
        /// </summary>
        private float CalculateMoveScore(Move move, BattleSpirit target, BattleContext context)
        {
            float score = 0;
            
            // Base power
            score += move.power;
            
            // Type effectiveness
            float typeEffectiveness = move.GetTypeEffectiveness(target);
            score += (typeEffectiveness - 1.0f) * 50; // Bonus for super effective
            
            // STAB (Same Type Attack Bonus)
            if (move.spiritType == stats.spiritType)
            {
                score += 25;
            }
            
            // Accuracy bonus
            score += move.accuracy * 0.1f;
            
            // Priority bonus
            score += move.priority * 10;
            
            // AI personality adjustments
            if (aggressionLevel > 0.7f && move.DealsDamage)
            {
                score += 20;
            }
            
            if (defensiveLevel > 0.7f && move.IsSupport)
            {
                score += 20;
            }
            
            if (supportLevel > 0.7f && move.IsHealing)
            {
                score += 20;
            }
            
            return score;
        }
        
        /// <summary>
        /// Apply turn-based effects
        /// </summary>
        private void ApplyTurnBasedEffects()
        {
            // Apply status effect damage
            foreach (var statusEffect in stats.GetActiveStatusEffects())
            {
                if (statusEffect.ShouldTriggerDuringTurn)
                {
                    int damage = statusEffect.GetTurnDamage();
                    if (damage > 0)
                    {
                        TakeDamage(damage);
                    }
                }
            }
            
            // Apply other turn-based effects
            // This can be extended by remixers
        }
        
        /// <summary>
        /// Process end-of-turn effects
        /// </summary>
        private void ProcessEndTurnEffects()
        {
            // Process status effects that trigger at end of turn
            foreach (var statusEffect in stats.GetActiveStatusEffects())
            {
                if (statusEffect.ShouldTriggerAtEnd)
                {
                    // Handle end-of-turn effects
                    // This can be extended by remixers
                }
            }
        }
        
        /// <summary>
        /// Get spirit summary for debugging
        /// </summary>
        public string GetSpiritSummary()
        {
            string status = isFainted ? "FAINTED" : (isActive ? "ACTIVE" : "INACTIVE");
            string moveInfo = moves.Count > 0 ? $" | Moves: {moves.Count}" : "";
            string aiInfo = isAI ? $" | AI: {aiPersonality}" : "";
            
            return $"{nickname} ({speciesID}) | {status} | {stats.GetStatSummary()}{moveInfo}{aiInfo}";
        }
        
        /// <summary>
        /// Get battle-ready status
        /// </summary>
        public bool IsBattleReady => !isFainted && stats.currentHP > 0;
        
        /// <summary>
        /// Get sync percentage
        /// </summary>
        public float GetSyncPercentage => syncMultiplier * 100.0f;
        
        /// <summary>
        /// Get bond percentage
        /// </summary>
        public float GetBondPercentage => bondMultiplier * 100.0f;
        
        /// <summary>
        /// Check if spirit has specific move
        /// </summary>
        public bool HasMove(string moveName)
        {
            return moves.Any(m => m.displayName.Equals(moveName, StringComparison.OrdinalIgnoreCase));
        }
        
        /// <summary>
        /// Check if spirit has move type
        /// </summary>
        public bool HasMoveType(MoveType moveType)
        {
            return moves.Any(m => m.moveType == moveType);
        }
        
        /// <summary>
        /// Get moves by type
        /// </summary>
        public List<Move> GetMovesByType(MoveType moveType)
        {
            return moves.Where(m => m.moveType == moveType).ToList();
        }
        
        /// <summary>
        /// Get moves by category
        /// </summary>
        public List<Move> GetMovesByCategory(MoveCategory category)
        {
            return moves.Where(m => m.category == category).ToList();
        }
        
        /// <summary>
        /// Get moves by classification
        /// </summary>
        public List<Move> GetMovesByClassification(MoveClassification classification)
        {
            return moves.Where(m => m.classification == classification).ToList();
        }
        
        /// <summary>
        /// Add a move to the spirit
        /// </summary>
        public void AddMove(Move move)
        {
            if (move != null && !moves.Contains(move))
            {
                moves.Add(move);
            }
        }
        
        /// <summary>
        /// Remove a move from the spirit
        /// </summary>
        public void RemoveMove(Move move)
        {
            if (moves.Contains(move))
            {
                moves.Remove(move);
            }
        }
        
        /// <summary>
        /// Replace a move
        /// </summary>
        public void ReplaceMove(Move oldMove, Move newMove)
        {
            if (moves.Contains(oldMove) && newMove != null)
            {
                int index = moves.IndexOf(oldMove);
                moves[index] = newMove;
            }
        }
        
        /// <summary>
        /// Get total move count
        /// </summary>
        public int MoveCount => moves.Count;
        
        /// <summary>
        /// Check if spirit can learn more moves
        /// </summary>
        public bool CanLearnMoreMoves => moves.Count < 4; // Standard limit
        
        /// <summary>
        /// Get spirit's primary type
        /// </summary>
        public SpiritType PrimaryType => stats.spiritType;
        
        /// <summary>
        /// Check if spirit is weak to a type
        /// </summary>
        public bool IsWeakTo(SpiritType type)
        {
            // This is a simplified check - remixers can extend this
            return false;
        }
        
        /// <summary>
        /// Check if spirit resists a type
        /// </summary>
        public bool Resists(SpiritType type)
        {
            // This is a simplified check - remixers can extend this
            return false;
        }
        
        /// <summary>
        /// Check if spirit is immune to a type
        /// </summary>
        public bool IsImmuneTo(SpiritType type)
        {
            // This is a simplified check - remixers can extend this
            return false;
        }
    }
}