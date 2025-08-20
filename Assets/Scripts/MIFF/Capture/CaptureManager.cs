using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.Capture
{
    /// <summary>
    /// Manages spirit capture attempts after battle
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class CaptureManager
    {
        [Header("Capture Configuration")]
        public float baseCaptureChance = 0.3f;           // Base 30% chance
        public float maxCaptureChance = 0.95f;           // Maximum 95% chance
        public float minCaptureChance = 0.05f;           // Minimum 5% chance
        public float criticalCaptureChance = 0.15f;      // 15% chance for critical capture
        
        [Header("Capture Modifiers")]
        public float hpModifier = 0.5f;                  // HP affects capture chance
        public float rarityModifier = 0.3f;              // Rarity affects capture chance
        public float levelModifier = 0.2f;               // Level affects capture chance
        public float statusModifier = 0.25f;             // Status effects affect capture chance
        
        [Header("Player Modifiers")]
        public float playerLevelBonus = 0.1f;            // Player level bonus
        public float captureItemBonus = 0.2f;            // Capture item bonus
        public float skillBonus = 0.15f;                 // Player skill bonus
        public float luckBonus = 0.1f;                   // Luck-based bonus
        
        [Header("Capture Features")]
        public bool enableCriticalCaptures = true;
        public bool enableRarityScaling = true;
        public bool enableLevelScaling = true;
        public bool enableStatusEffects = true;
        public bool enablePlayerBonuses = true;
        
        [Header("Remix Hooks")]
        public bool enableCustomCaptureRules = true;
        public bool enableCustomModifiers = true;
        public bool enableCustomEvents = true;
        
        // Events for remixers to hook into
        public event Action<CaptureManager, CaptureResult> OnCaptureAttempted;
        public event Action<CaptureManager, CaptureResult> OnCaptureSucceeded;
        public event Action<CaptureManager, CaptureResult> OnCaptureFailed;
        public event Action<CaptureManager, CaptureResult> OnCriticalCapture;
        public event Action<CaptureManager, string> OnSpiritAlreadyCaptured;
        
        // Random number generator
        private Random random;
        
        public CaptureManager()
        {
            random = new Random();
            InitializeCaptureManager();
        }
        
        /// <summary>
        /// Initialize the capture manager
        /// </summary>
        private void InitializeCaptureManager()
        {
            // Validate configuration
            baseCaptureChance = Math.Max(minCaptureChance, Math.Min(maxCaptureChance, baseCaptureChance));
            criticalCaptureChance = Math.Max(0.0f, Math.Min(1.0f, criticalCaptureChance));
            
            // Ensure modifiers are reasonable
            hpModifier = Math.Max(0.0f, hpModifier);
            rarityModifier = Math.Max(0.0f, rarityModifier);
            levelModifier = Math.Max(0.0f, levelModifier);
            statusModifier = Math.Max(0.0f, statusModifier);
            
            playerLevelBonus = Math.Max(0.0f, playerLevelBonus);
            captureItemBonus = Math.Max(0.0f, captureItemBonus);
            skillBonus = Math.Max(0.0f, skillBonus);
            luckBonus = Math.Max(0.0f, luckBonus);
        }
        
        /// <summary>
        /// Attempt to capture a spirit after battle
        /// </summary>
        public CaptureResult TryCapture(SpiritInstance target, PlayerContext ctx)
        {
            if (target == null || ctx == null)
            {
                return CaptureResult.Fail("", "", 0.0f, "Invalid target or context");
            }
            
            try
            {
                // Check if already captured
                var spiritDexManager = SpiritDexManager.Instance;
                if (spiritDexManager != null && spiritDexManager.IsCaptured(target.SpiritID))
                {
                    var result = CaptureResult.AlreadyCaptured(target.SpiritID, target.Nickname);
                    OnSpiritAlreadyCaptured?.Invoke(this, target.SpiritID);
                    return result;
                }
                
                // Calculate capture chance
                float captureChance = CalculateCaptureChance(target, ctx);
                
                // Check for critical capture
                bool isCriticalCapture = false;
                if (enableCriticalCaptures && random.NextDouble() < criticalCaptureChance)
                {
                    isCriticalCapture = true;
                    captureChance = Math.Min(maxCaptureChance, captureChance * 1.5f);
                }
                
                // Determine capture success
                bool captureSuccess = random.NextDouble() < captureChance;
                
                // Create capture result
                CaptureResult result;
                if (captureSuccess)
                {
                    result = CaptureResult.Success(target.SpiritID, target.Nickname, captureChance, isCriticalCapture);
                    
                    // Register capture in SpiritDex
                    if (spiritDexManager != null)
                    {
                        spiritDexManager.RegisterCapture(target.SpiritID, target.Nickname, target.Rarity);
                    }
                    
                    // Trigger success event
                    OnCaptureSucceeded?.Invoke(this, result);
                    
                    if (isCriticalCapture)
                    {
                        OnCriticalCapture?.Invoke(this, result);
                    }
                }
                else
                {
                    result = CaptureResult.Fail(target.SpiritID, target.Nickname, captureChance, "Capture attempt failed");
                    OnCaptureFailed?.Invoke(this, result);
                }
                
                // Set additional result data
                result.SetCaptureDuration(0.0f); // Could be expanded for timing
                if (isCriticalCapture)
                {
                    result.MarkAsCritical();
                }
                
                // Trigger general capture attempt event
                OnCaptureAttempted?.Invoke(this, result);
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during capture attempt: {ex.Message}");
                return CaptureResult.Fail(target.SpiritID, target.Nickname, 0.0f, $"Capture error: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Calculate capture chance based on various factors
        /// </summary>
        private float CalculateCaptureChance(SpiritInstance target, PlayerContext ctx)
        {
            float chance = baseCaptureChance;
            
            // HP modifier (lower HP = higher chance)
            if (enableStatusEffects && target.CurrentHP > 0)
            {
                float hpPercentage = (float)target.CurrentHP / target.MaxHP;
                float hpBonus = (1.0f - hpPercentage) * hpModifier;
                chance += hpBonus;
            }
            
            // Rarity modifier (rarer = harder to capture)
            if (enableRarityScaling && target.Rarity != SpiritRarity.Common)
            {
                float rarityPenalty = GetRarityPenalty(target.Rarity) * rarityModifier;
                chance -= rarityPenalty;
            }
            
            // Level modifier (higher level = harder to capture)
            if (enableLevelScaling && target.Level > 1)
            {
                float levelPenalty = (target.Level - 1) * 0.02f * levelModifier;
                chance -= levelPenalty;
            }
            
            // Status effects modifier
            if (enableStatusEffects && target.HasStatusEffects)
            {
                float statusBonus = GetStatusEffectBonus(target) * statusModifier;
                chance += statusBonus;
            }
            
            // Player bonuses
            if (enablePlayerBonuses)
            {
                // Player level bonus
                if (ctx.PlayerLevel > 1)
                {
                    float levelBonus = Math.Min(ctx.PlayerLevel * 0.01f, 0.5f) * playerLevelBonus;
                    chance += levelBonus;
                }
                
                // Capture item bonus
                if (ctx.HasCaptureItem)
                {
                    chance += captureItemBonus;
                }
                
                // Skill bonus (could be based on previous captures)
                if (ctx.CaptureSkill > 0)
                {
                    float skillBonus = Math.Min(ctx.CaptureSkill * 0.02f, 0.5f) * this.skillBonus;
                    chance += skillBonus;
                }
                
                // Luck bonus
                if (ctx.Luck > 0)
                {
                    float luckBonus = Math.Min(ctx.Luck * 0.01f, 0.3f) * this.luckBonus;
                    chance += luckBonus;
                }
            }
            
            // Apply bounds
            chance = Math.Max(minCaptureChance, Math.Min(maxCaptureChance, chance));
            
            return chance;
        }
        
        /// <summary>
        /// Get rarity penalty for capture chance
        /// </summary>
        private float GetRarityPenalty(SpiritRarity rarity)
        {
            return rarity switch
            {
                SpiritRarity.Common => 0.0f,
                SpiritRarity.Uncommon => 0.1f,
                SpiritRarity.Rare => 0.2f,
                SpiritRarity.Epic => 0.3f,
                SpiritRarity.Legendary => 0.4f,
                SpiritRarity.Mythical => 0.5f,
                _ => 0.0f
            };
        }
        
        /// <summary>
        /// Get status effect bonus for capture chance
        /// </summary>
        private float GetStatusEffectBonus(SpiritInstance target)
        {
            float bonus = 0.0f;
            
            // Add bonuses for various status effects that make capture easier
            if (target.IsAsleep) bonus += 0.2f;
            if (target.IsFrozen) bonus += 0.15f;
            if (target.IsParalyzed) bonus += 0.1f;
            if (target.IsPoisoned) bonus += 0.05f;
            if (target.IsConfused) bonus += 0.1f;
            
            return Math.Min(bonus, 0.5f); // Cap at 50% bonus
        }
        
        /// <summary>
        /// Get capture chance without attempting capture
        /// </summary>
        public float GetCaptureChance(SpiritInstance target, PlayerContext ctx)
        {
            if (target == null || ctx == null) return 0.0f;
            
            return CalculateCaptureChance(target, ctx);
        }
        
        /// <summary>
        /// Get capture chance with critical capture possibility
        /// </summary>
        public (float baseChance, float criticalChance) GetCaptureChances(SpiritInstance target, PlayerContext ctx)
        {
            if (target == null || ctx == null) return (0.0f, 0.0f);
            
            float baseChance = CalculateCaptureChance(target, ctx);
            float criticalChance = Math.Min(maxCaptureChance, baseChance * 1.5f);
            
            return (baseChance, criticalChance);
        }
        
        /// <summary>
        /// Get capture statistics for a spirit
        /// </summary>
        public CaptureStats GetCaptureStats(SpiritInstance target)
        {
            if (target == null) return null;
            
            var spiritDexManager = SpiritDexManager.Instance;
            if (spiritDexManager == null) return null;
            
            var entry = spiritDexManager.GetEntry(target.SpiritID);
            if (entry == null) return null;
            
            return new CaptureStats
            {
                spiritID = target.SpiritID,
                spiritName = target.Nickname,
                totalAttempts = entry.totalCaptureAttempts,
                successfulCaptures = entry.captureCount,
                averageChance = entry.averageCaptureChance,
                firstCaptureDate = entry.firstCaptureDate,
                lastCaptureDate = entry.lastCaptureDate,
                wasFirstCapture = entry.wasFirstCapture
            };
        }
        
        /// <summary>
        /// Get capture manager summary
        /// </summary>
        public string GetCaptureManagerSummary()
        {
            return $"Capture Manager | Base Chance: {baseCaptureChance:P1} | " +
                   $"Max Chance: {maxCaptureChance:P1} | Critical: {criticalCaptureChance:P1} | " +
                   $"HP Mod: {hpModifier:F2} | Rarity Mod: {rarityModifier:F2}";
        }
        
        /// <summary>
        /// Reset capture manager to defaults
        /// </summary>
        public void ResetToDefaults()
        {
            baseCaptureChance = 0.3f;
            maxCaptureChance = 0.95f;
            minCaptureChance = 0.05f;
            criticalCaptureChance = 0.15f;
            
            hpModifier = 0.5f;
            rarityModifier = 0.3f;
            levelModifier = 0.2f;
            statusModifier = 0.25f;
            
            playerLevelBonus = 0.1f;
            captureItemBonus = 0.2f;
            skillBonus = 0.15f;
            luckBonus = 0.1f;
            
            InitializeCaptureManager();
        }
        
        /// <summary>
        /// Set custom capture chance (for testing/remixing)
        /// </summary>
        public void SetCustomCaptureChance(float chance)
        {
            if (enableCustomCaptureRules)
            {
                baseCaptureChance = Math.Max(minCaptureChance, Math.Min(maxCaptureChance, chance));
            }
        }
        
        /// <summary>
        /// Add custom modifier (for remixers)
        /// </summary>
        public void AddCustomModifier(string modifierName, float value)
        {
            if (enableCustomModifiers)
            {
                // This could be expanded to store custom modifiers
                Console.WriteLine($"Custom modifier added: {modifierName} = {value}");
            }
        }
    }
    
    /// <summary>
    /// Statistics for spirit capture attempts
    /// </summary>
    [Serializable]
    public class CaptureStats
    {
        public string spiritID;
        public string spiritName;
        public int totalAttempts;
        public int successfulCaptures;
        public float averageChance;
        public DateTime firstCaptureDate;
        public DateTime lastCaptureDate;
        public bool wasFirstCapture;
        
        public float SuccessRate => totalAttempts > 0 ? (float)successfulCaptures / totalAttempts : 0.0f;
        
        public override string ToString()
        {
            return $"{spiritName} | Attempts: {totalAttempts} | Captures: {successfulCaptures} | " +
                   $"Success Rate: {SuccessRate:P1} | Avg Chance: {averageChance:P1}";
        }
    }
}