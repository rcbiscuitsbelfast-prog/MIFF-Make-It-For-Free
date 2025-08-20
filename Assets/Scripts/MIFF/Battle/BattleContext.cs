using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Battle
{
    /// <summary>
    /// Provides context and utility methods for battle operations
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class BattleContext
    {
        [Header("Battle Information")]
        public string battleID;
        public BattleType battleType = BattleType.Single;
        public BattleMode battleMode = BattleMode.TurnBased;
        public int turnNumber = 0;
        public int maxTurns = 100;
        
        [Header("Teams")]
        public List<BattleSpirit> playerTeam = new List<BattleSpirit>();
        public List<BattleSpirit> enemyTeam = new List<BattleSpirit>();
        public List<BattleSpirit> allSpirits = new List<BattleSpirit>();
        
        [Header("Battle State")]
        public BattlePhase currentPhase = BattlePhase.Preparation;
        public BattleSpirit currentSpirit;
        public BattleSpirit[] activeSpirits = new BattleSpirit[2];
        public bool isPlayerTurn = true;
        public bool isBattleEnded = false;
        
        [Header("Battle Modifiers")]
        public WeatherType weather = WeatherType.Clear;
        public FieldType field = FieldType.Normal;
        public bool isDoubleBattle;
        public bool isTripleBattle;
        public bool isRotationBattle;
        
        [Header("Battle Rules")]
        public bool allowItems = true;
        public bool allowSwitching = true;
        public bool allowMegaEvolution = false;
        public bool allowZMoves = false;
        public bool allowDynamax = false;
        
        [Header("Battle Statistics")]
        public int totalDamageDealt;
        public int totalHealingDone;
        public int totalMovesUsed;
        public int totalStatusEffectsApplied;
        public float averageSyncLevel;
        
        // Events for remixers to hook into
        public event Action<BattleContext> OnBattleStarted;
        public event Action<BattleContext> OnBattleEnded;
        public event Action<BattleContext, int> OnTurnStarted;
        public event Action<BattleContext, int> OnTurnEnded;
        public event Action<BattleContext, BattleSpirit> OnSpiritFainted;
        public event Action<BattleContext, BattleSpirit> OnSpiritSwitched;
        
        public BattleContext()
        {
            battleID = Guid.NewGuid().ToString();
        }
        
        /// <summary>
        /// Initialize the battle context
        /// </summary>
        public void InitializeBattle()
        {
            turnNumber = 0;
            currentPhase = BattlePhase.Preparation;
            isBattleEnded = false;
            currentSpirit = null;
            
            // Initialize all spirits
            foreach (var spirit in allSpirits)
            {
                spirit.InitializeForBattle();
            }
            
            // Set up active spirits
            if (playerTeam.Count > 0)
            {
                activeSpirits[0] = playerTeam[0];
                activeSpirits[0].isActive = true;
            }
            
            if (enemyTeam.Count > 0)
            {
                activeSpirits[1] = enemyTeam[0];
                activeSpirits[1].isActive = true;
            }
            
            // Build all spirits list
            allSpirits.Clear();
            allSpirits.AddRange(playerTeam);
            allSpirits.AddRange(enemyTeam);
            
            // Calculate initial statistics
            CalculateBattleStatistics();
        }
        
        /// <summary>
        /// Start the battle
        /// </summary>
        public void StartBattle()
        {
            currentPhase = BattlePhase.Battle;
            OnBattleStarted?.Invoke(this);
        }
        
        /// <summary>
        /// End the battle
        /// </summary>
        public void EndBattle()
        {
            currentPhase = BattlePhase.Ended;
            isBattleEnded = true;
            OnBattleEnded?.Invoke(this);
        }
        
        /// <summary>
        /// Start a new turn
        /// </summary>
        public void StartTurn()
        {
            turnNumber++;
            OnTurnStarted?.Invoke(this, turnNumber);
        }
        
        /// <summary>
        /// End the current turn
        /// </summary>
        public void EndTurn()
        {
            OnTurnEnded?.Invoke(this, turnNumber);
        }
        
        /// <summary>
        /// Get all spirits in the battle
        /// </summary>
        public List<BattleSpirit> GetAllSpirits()
        {
            return new List<BattleSpirit>(allSpirits);
        }
        
        /// <summary>
        /// Get active spirits
        /// </summary>
        public List<BattleSpirit> GetActiveSpirits()
        {
            return activeSpirits.Where(s => s != null && s.isActive && !s.isFainted).ToList();
        }
        
        /// <summary>
        /// Get fainted spirits
        /// </summary>
        public List<BattleSpirit> GetFaintedSpirits()
        {
            return allSpirits.Where(s => s.isFainted).ToList();
        }
        
        /// <summary>
        /// Get player team spirits
        /// </summary>
        public List<BattleSpirit> GetPlayerTeam()
        {
            return new List<BattleSpirit>(playerTeam);
        }
        
        /// <summary>
        /// Get enemy team spirits
        /// </summary>
        public List<BattleSpirit> GetEnemyTeam()
        {
            return new List<BattleSpirit>(enemyTeam);
        }
        
        /// <summary>
        /// Check if two spirits are on the same team
        /// </summary>
        public bool IsAlly(BattleSpirit spirit1, BattleSpirit spirit2)
        {
            if (spirit1 == null || spirit2 == null) return false;
            
            bool spirit1IsPlayer = playerTeam.Contains(spirit1);
            bool spirit2IsPlayer = playerTeam.Contains(spirit2);
            
            return spirit1IsPlayer == spirit2IsPlayer;
        }
        
        /// <summary>
        /// Check if two spirits are on opposing teams
        /// </summary>
        public bool IsEnemy(BattleSpirit spirit1, BattleSpirit spirit2)
        {
            if (spirit1 == null || spirit2 == null) return false;
            
            bool spirit1IsPlayer = playerTeam.Contains(spirit1);
            bool spirit2IsPlayer = playerTeam.Contains(spirit2);
            
            return spirit1IsPlayer != spirit2IsPlayer;
        }
        
        /// <summary>
        /// Get spirits by team
        /// </summary>
        public List<BattleSpirit> GetSpiritsByTeam(bool isPlayerTeam)
        {
            return isPlayerTeam ? GetPlayerTeam() : GetEnemyTeam();
        }
        
        /// <summary>
        /// Get opponent team
        /// </summary>
        public List<BattleSpirit> GetOpponentTeam(BattleSpirit spirit)
        {
            if (playerTeam.Contains(spirit))
            {
                return GetEnemyTeam();
            }
            else
            {
                return GetPlayerTeam();
            }
        }
        
        /// <summary>
        /// Get ally team
        /// </summary>
        public List<BattleSpirit> GetAllyTeam(BattleSpirit spirit)
        {
            if (playerTeam.Contains(spirit))
            {
                return GetPlayerTeam();
            }
            else
            {
                return GetEnemyTeam();
            }
        }
        
        /// <summary>
        /// Check if battle is over
        /// </summary>
        public bool IsBattleOver()
        {
            bool playerTeamDefeated = playerTeam.All(s => s.isFainted);
            bool enemyTeamDefeated = enemyTeam.All(s => s.isFainted);
            
            return playerTeamDefeated || enemyTeamDefeated || turnNumber >= maxTurns;
        }
        
        /// <summary>
        /// Get battle winner
        /// </summary>
        public BattleWinner GetBattleWinner()
        {
            if (!IsBattleOver()) return BattleWinner.None;
            
            bool playerTeamDefeated = playerTeam.All(s => s.isFainted);
            bool enemyTeamDefeated = enemyTeam.All(s => s.isFainted);
            
            if (playerTeamDefeated && enemyTeamDefeated)
                return BattleWinner.Draw;
            else if (enemyTeamDefeated)
                return BattleWinner.Player;
            else if (playerTeamDefeated)
                return BattleWinner.Enemy;
            else
                return BattleWinner.Draw; // Time limit reached
        }
        
        /// <summary>
        /// Switch active spirit
        /// </summary>
        public bool SwitchActiveSpirit(BattleSpirit oldSpirit, BattleSpirit newSpirit)
        {
            if (oldSpirit == null || newSpirit == null) return false;
            if (newSpirit.isFainted) return false;
            if (newSpirit.isActive) return false;
            
            // Find which team the spirit belongs to
            int teamIndex = -1;
            if (playerTeam.Contains(oldSpirit))
            {
                teamIndex = 0;
            }
            else if (enemyTeam.Contains(oldSpirit))
            {
                teamIndex = 1;
            }
            
            if (teamIndex == -1) return false;
            
            // Deactivate old spirit
            oldSpirit.isActive = false;
            oldSpirit.isSwitching = false;
            
            // Activate new spirit
            newSpirit.isActive = true;
            newSpirit.isSwitching = false;
            
            // Update active spirits array
            activeSpirits[teamIndex] = newSpirit;
            
            // Trigger event
            OnSpiritSwitched?.Invoke(this, newSpirit);
            
            return true;
        }
        
        /// <summary>
        /// Get valid targets for a move
        /// </summary>
        public List<BattleSpirit> GetValidTargets(BattleSpirit user, Move move)
        {
            var validTargets = new List<BattleSpirit>();
            
            foreach (var spirit in allSpirits)
            {
                if (spirit != null && !spirit.isFainted && move.CanTarget(user, spirit, this))
                {
                    validTargets.Add(spirit);
                }
            }
            
            return validTargets;
        }
        
        /// <summary>
        /// Get random target for a move
        /// </summary>
        public BattleSpirit GetRandomTarget(BattleSpirit user, Move move)
        {
            var validTargets = GetValidTargets(user, move);
            if (validTargets.Count == 0) return null;
            
            Random random = new Random();
            int index = random.Next(validTargets.Count);
            return validTargets[index];
        }
        
        /// <summary>
        /// Calculate battle statistics
        /// </summary>
        public void CalculateBattleStatistics()
        {
            totalDamageDealt = 0;
            totalHealingDone = 0;
            totalMovesUsed = 0;
            totalStatusEffectsApplied = 0;
            
            float totalSync = 0;
            int syncCount = 0;
            
            foreach (var spirit in allSpirits)
            {
                if (spirit != null)
                {
                    totalSync += spirit.GetSyncPercentage;
                    syncCount++;
                }
            }
            
            averageSyncLevel = syncCount > 0 ? totalSync / syncCount : 0;
        }
        
        /// <summary>
        /// Get battle summary
        /// </summary>
        public string GetBattleSummary()
        {
            var winner = GetBattleWinner();
            string winnerText = winner switch
            {
                BattleWinner.Player => "Player Victory!",
                BattleWinner.Enemy => "Enemy Victory!",
                BattleWinner.Draw => "Battle Draw!",
                _ => "Battle in Progress"
            };
            
            return $"Battle {battleID} | Turn {turnNumber} | {winnerText} | " +
                   $"Player Team: {playerTeam.Count(s => !s.isFainted)}/{playerTeam.Count} | " +
                   $"Enemy Team: {enemyTeam.Count(s => !s.isFainted)}/{enemyTeam.Count}";
        }
        
        /// <summary>
        /// Get weather effect multiplier
        /// </summary>
        public float GetWeatherEffect(SpiritType spiritType)
        {
            return weather switch
            {
                WeatherType.Sunny when spiritType == SpiritType.Fire => 1.5f,
                WeatherType.Sunny when spiritType == SpiritType.Water => 0.5f,
                WeatherType.Rainy when spiritType == SpiritType.Water => 1.5f,
                WeatherType.Rainy when spiritType == SpiritType.Fire => 0.5f,
                WeatherType.Sandstorm when spiritType == SpiritType.Rock => 1.5f,
                WeatherType.Sandstorm when spiritType == SpiritType.Steel => 1.5f,
                WeatherType.Hail when spiritType == SpiritType.Ice => 1.5f,
                _ => 1.0f
            };
        }
        
        /// <summary>
        /// Get field effect multiplier
        /// </summary>
        public float GetFieldEffect(SpiritType spiritType)
        {
            return field switch
            {
                FieldType.Electric when spiritType == SpiritType.Electric => 1.3f,
                FieldType.Grassy when spiritType == SpiritType.Grass => 1.3f,
                FieldType.Psychic when spiritType == SpiritType.Psychic => 1.3f,
                FieldType.Misty when spiritType == SpiritType.Dragon => 0.5f,
                _ => 1.0f
            };
        }
        
        /// <summary>
        /// Check if weather affects move accuracy
        /// </summary>
        public bool DoesWeatherAffectAccuracy()
        {
            return weather == WeatherType.Sunny || weather == WeatherType.Rainy || weather == WeatherType.Sandstorm;
        }
        
        /// <summary>
        /// Get weather accuracy modifier
        /// </summary>
        public float GetWeatherAccuracyModifier()
        {
            return weather switch
            {
                WeatherType.Sunny => 1.0f,
                WeatherType.Rainy => 0.8f,
                WeatherType.Sandstorm => 0.8f,
                _ => 1.0f
            };
        }
        
        /// <summary>
        /// Add spirit to player team
        /// </summary>
        public void AddToPlayerTeam(BattleSpirit spirit)
        {
            if (spirit != null && !playerTeam.Contains(spirit))
            {
                playerTeam.Add(spirit);
                allSpirits.Add(spirit);
            }
        }
        
        /// <summary>
        /// Add spirit to enemy team
        /// </summary>
        public void AddToEnemyTeam(BattleSpirit spirit)
        {
            if (spirit != null && !enemyTeam.Contains(spirit))
            {
                enemyTeam.Add(spirit);
                allSpirits.Add(spirit);
            }
        }
        
        /// <summary>
        /// Remove spirit from battle
        /// </summary>
        public void RemoveSpirit(BattleSpirit spirit)
        {
            if (spirit == null) return;
            
            playerTeam.Remove(spirit);
            enemyTeam.Remove(spirit);
            allSpirits.Remove(spirit);
            
            // Remove from active spirits if necessary
            for (int i = 0; i < activeSpirits.Length; i++)
            {
                if (activeSpirits[i] == spirit)
                {
                    activeSpirits[i] = null;
                }
            }
        }
        
        /// <summary>
        /// Get battle phase description
        /// </summary>
        public string GetPhaseDescription()
        {
            return currentPhase switch
            {
                BattlePhase.Preparation => "Preparing for battle...",
                BattlePhase.Battle => $"Turn {turnNumber}",
                BattlePhase.Ended => "Battle ended",
                _ => "Unknown phase"
            };
        }
        
        /// <summary>
        /// Check if battle allows specific feature
        /// </summary>
        public bool AllowsFeature(BattleFeature feature)
        {
            return feature switch
            {
                BattleFeature.Items => allowItems,
                BattleFeature.Switching => allowSwitching,
                BattleFeature.MegaEvolution => allowMegaEvolution,
                BattleFeature.ZMoves => allowZMoves,
                BattleFeature.Dynamax => allowDynamax,
                _ => false
            };
        }
    }
    
    /// <summary>
    /// Types of battles
    /// </summary>
    public enum BattleType
    {
        Single,     // 1v1
        Double,     // 2v2
        Triple,     // 3v3
        Rotation,   // Rotation battle
        Multi       // Multi-battle
    }
    
    /// <summary>
    /// Battle modes
    /// </summary>
    public enum BattleMode
    {
        TurnBased,  // Traditional turn-based
        RealTime,   // Real-time action
        Hybrid      // Combination of both
    }
    
    /// <summary>
    /// Battle phases
    /// </summary>
    public enum BattlePhase
    {
        Preparation,
        Battle,
        Ended
    }
    
    /// <summary>
    /// Battle winners
    /// </summary>
    public enum BattleWinner
    {
        None,
        Player,
        Enemy,
        Draw
    }
    
    /// <summary>
    /// Weather types
    /// </summary>
    public enum WeatherType
    {
        Clear,
        Sunny,
        Rainy,
        Sandstorm,
        Hail,
        Fog,
        StrongWinds
    }
    
    /// <summary>
    /// Field types
    /// </summary>
    public enum FieldType
    {
        Normal,
        Electric,
        Grassy,
        Psychic,
        Misty,
        Volcanic,
        Underwater
    }
    
    /// <summary>
    /// Battle features
    /// </summary>
    public enum BattleFeature
    {
        Items,
        Switching,
        MegaEvolution,
        ZMoves,
        Dynamax
    }
}