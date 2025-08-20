using System;

namespace MIFF.Spirits
{
    /// <summary>
    /// Individual entry in the SpiritDex for tracking spirit information
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritDexEntry
    {
        [Header("Spirit Identity")]
        public string spiritID;
        public string spiritName;
        public string speciesID;
        
        [Header("Discovery Status")]
        public bool isDiscovered = false;
        public bool isCaptured = false;
        public DateTime firstSeenDate;
        public DateTime discoveryDate;
        public DateTime captureDate;
        public DateTime lastSeenDate;
        
        [Header("Location Tracking")]
        public string lastSeenLocation = "";
        public string discoveryLocation = "";
        public string captureLocation = "";
        public int locationVisitCount = 0;
        
        [Header("Spirit Progress")]
        public float syncLevel = 0.0f;
        public int encounterCount = 0;
        public int battleCount = 0;
        public int winCount = 0;
        public int lossCount = 0;
        
        [Header("Lore & Content")]
        public bool loreUnlocked = false;
        public bool evolutionUnlocked = false;
        public bool specialMovesUnlocked = false;
        public string[] unlockedAbilities = new string[0];
        public string[] unlockedMoves = new string[0];
        
        [Header("Spirit Information")]
        public SpiritType primaryType = SpiritType.Normal;
        public SpiritType secondaryType = SpiritType.None;
        public SpiritRarity rarity = SpiritRarity.Common;
        public int baseLevel = 1;
        public int currentLevel = 1;
        
        [Header("Stats & Abilities")]
        public int baseHP = 100;
        public int baseAttack = 50;
        public int baseDefense = 50;
        public int baseSpeed = 50;
        public int baseSpecialAttack = 50;
        public int baseSpecialDefense = 50;
        
        [Header("Evolution Status")]
        public string evolutionStage = "Base";
        public bool canEvolve = false;
        public string[] evolutionRequirements = new string[0];
        public bool evolutionRequirementsMet = false;
        
        [Header("Remix Hooks")]
        public string customData = "";
        public bool isRemixable = true;
        public string[] customTags = new string[0];
        
        // Events for remixers to hook into
        public event Action<SpiritDexEntry> OnEntryUpdated;
        public event Action<SpiritDexEntry> OnSpiritDiscovered;
        public event Action<SpiritDexEntry> OnSpiritCaptured;
        public event Action<SpiritDexEntry> OnLoreUnlocked;
        public event Action<SpiritDexEntry> OnEvolutionUnlocked;
        
        public SpiritDexEntry()
        {
            firstSeenDate = DateTime.Now;
            discoveryDate = DateTime.MinValue;
            captureDate = DateTime.MinValue;
            lastSeenDate = DateTime.MinValue;
        }
        
        /// <summary>
        /// Create a new SpiritDex entry
        /// </summary>
        public SpiritDexEntry(string spiritID, string spiritName = "", string speciesID = "")
        {
            this.spiritID = spiritID;
            this.spiritName = spiritName;
            this.speciesID = speciesID;
            this.firstSeenDate = DateTime.Now;
            this.discoveryDate = DateTime.MinValue;
            this.captureDate = DateTime.MinValue;
            this.lastSeenDate = DateTime.MinValue;
        }
        
        /// <summary>
        /// Mark spirit as discovered
        /// </summary>
        public void MarkAsDiscovered(string location = "")
        {
            if (!isDiscovered)
            {
                isDiscovered = true;
                discoveryDate = DateTime.Now;
                discoveryLocation = location;
                OnSpiritDiscovered?.Invoke(this);
                OnEntryUpdated?.Invoke(this);
            }
            else
            {
                // Update last seen information
                lastSeenDate = DateTime.Now;
                lastSeenLocation = location;
                locationVisitCount++;
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Mark spirit as captured
        /// </summary>
        public void MarkAsCaptured(string location = "")
        {
            if (!isCaptured)
            {
                isCaptured = true;
                captureDate = DateTime.Now;
                captureLocation = location;
                OnSpiritCaptured?.Invoke(this);
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Record an encounter
        /// </summary>
        public void RecordEncounter(string location = "")
        {
            encounterCount++;
            lastSeenDate = DateTime.Now;
            lastSeenLocation = location;
            
            // Auto-discover if not already discovered
            if (!isDiscovered)
            {
                MarkAsDiscovered(location);
            }
            
            OnEntryUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Record a battle result
        /// </summary>
        public void RecordBattle(bool won, string location = "")
        {
            battleCount++;
            if (won)
            {
                winCount++;
            }
            else
            {
                lossCount++;
            }
            
            lastSeenDate = DateTime.Now;
            lastSeenLocation = location;
            
            // Auto-discover if not already discovered
            if (!isDiscovered)
            {
                MarkAsDiscovered(location);
            }
            
            OnEntryUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Update sync level
        /// </summary>
        public void UpdateSyncLevel(float newSyncLevel)
        {
            syncLevel = Math.Max(0.0f, Math.Min(100.0f, newSyncLevel));
            OnEntryUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Unlock lore content
        /// </summary>
        public void UnlockLore()
        {
            if (!loreUnlocked)
            {
                loreUnlocked = true;
                OnLoreUnlocked?.Invoke(this);
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Unlock evolution content
        /// </summary>
        public void UnlockEvolution()
        {
            if (!evolutionUnlocked)
            {
                evolutionUnlocked = true;
                OnEvolutionUnlocked?.Invoke(this);
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Add unlocked ability
        /// </summary>
        public void AddUnlockedAbility(string ability)
        {
            if (string.IsNullOrEmpty(ability)) return;
            
            if (unlockedAbilities == null)
                unlockedAbilities = new string[0];
            
            if (!Array.Exists(unlockedAbilities, a => a == ability))
            {
                Array.Resize(ref unlockedAbilities, unlockedAbilities.Length + 1);
                unlockedAbilities[unlockedAbilities.Length - 1] = ability;
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Add unlocked move
        /// </summary>
        public void AddUnlockedMove(string move)
        {
            if (string.IsNullOrEmpty(move)) return;
            
            if (unlockedMoves == null)
                unlockedMoves = new string[0];
            
            if (!Array.Exists(unlockedMoves, m => m == move))
            {
                Array.Resize(ref unlockedMoves, unlockedMoves.Length + 1);
                unlockedMoves[unlockedMoves.Length - 1] = move;
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Add custom tag
        /// </summary>
        public void AddCustomTag(string tag)
        {
            if (string.IsNullOrEmpty(tag)) return;
            
            if (customTags == null)
                customTags = new string[0];
            
            if (!Array.Exists(customTags, t => t == tag))
            {
                Array.Resize(ref customTags, customTags.Length + 1);
                customTags[customTags.Length - 1] = tag;
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Get entry summary
        /// </summary>
        public string GetSummary()
        {
            string status = isCaptured ? "✅ CAPTURED" : (isDiscovered ? "🔍 DISCOVERED" : "❓ UNSEEN");
            string typeInfo = $" | Type: {primaryType}";
            if (secondaryType != SpiritType.None)
                typeInfo += $"/{secondaryType}";
            
            string rarityInfo = $" | Rarity: {rarity}";
            string encounters = encounterCount > 0 ? $" | Encounters: {encounterCount}" : "";
            string battles = battleCount > 0 ? $" | Battles: {winCount}W/{lossCount}L" : "";
            string sync = syncLevel > 0 ? $" | Sync: {syncLevel:F1}%" : "";
            
            return $"{status} | {spiritName} ({spiritID}){typeInfo}{rarityInfo}{encounters}{battles}{sync}";
        }
        
        /// <summary>
        /// Get detailed entry information
        /// </summary>
        public string GetDetailedInfo()
        {
            string baseInfo = GetSummary();
            string location = !string.IsNullOrEmpty(lastSeenLocation) ? $"\nLast Seen: {lastSeenLocation}" : "";
            string discovery = isDiscovered ? $"\nDiscovered: {discoveryDate:yyyy-MM-dd HH:mm:ss} at {discoveryLocation}" : "";
            string capture = isCaptured ? $"\nCaptured: {captureDate:yyyy-MM-dd HH:mm:ss} at {captureLocation}" : "";
            
            string stats = $"\nBase Stats | HP: {baseHP} | ATK: {baseAttack} | DEF: {baseDefense} | SPD: {baseSpeed} | SP.ATK: {baseSpecialAttack} | SP.DEF: {baseSpecialDefense}";
            string level = $"\nLevel: {currentLevel}/{baseLevel}";
            string evolution = $"\nEvolution Stage: {evolutionStage}";
            string canEvolve = this.canEvolve ? " | Can Evolve: Yes" : " | Can Evolve: No";
            
            string abilities = unlockedAbilities.Length > 0 ? $"\nUnlocked Abilities: {string.Join(", ", unlockedAbilities)}" : "";
            string moves = unlockedMoves.Length > 0 ? $"\nUnlocked Moves: {string.Join(", ", unlockedMoves)}" : "";
            string tags = customTags.Length > 0 ? $"\nCustom Tags: {string.Join(", ", customTags)}" : "";
            
            string content = $"\nContent Unlocked | Lore: {(loreUnlocked ? "Yes" : "No")} | Evolution: {(evolutionUnlocked ? "Yes" : "No")} | Special Moves: {(specialMovesUnlocked ? "Yes" : "No")}";
            
            return $"{baseInfo}{location}{discovery}{capture}{stats}{level}{evolution}{canEvolve}{abilities}{moves}{tags}{content}";
        }
        
        /// <summary>
        /// Get entry status
        /// </summary>
        public EntryStatus GetStatus()
        {
            if (isCaptured) return EntryStatus.Captured;
            if (isDiscovered) return EntryStatus.Discovered;
            return EntryStatus.Unseen;
        }
        
        /// <summary>
        /// Get completion status
        /// </summary>
        public CompletionStatus GetCompletionStatus()
        {
            if (isCaptured && loreUnlocked && evolutionUnlocked) return CompletionStatus.Complete;
            if (isCaptured) return CompletionStatus.Captured;
            if (isDiscovered) return CompletionStatus.Discovered;
            return CompletionStatus.Unseen;
        }
        
        /// <summary>
        /// Check if entry is complete
        /// </summary>
        public bool IsComplete => isCaptured && loreUnlocked && evolutionUnlocked;
        
        /// <summary>
        /// Check if entry is discovered but not captured
        /// </summary>
        public bool IsDiscoveredOnly => isDiscovered && !isCaptured;
        
        /// <summary>
        /// Check if entry is completely unseen
        /// </summary>
        public bool IsUnseen => !isDiscovered && !isCaptured;
        
        /// <summary>
        /// Get days since first seen
        /// </summary>
        public int DaysSinceFirstSeen => (int)(DateTime.Now - firstSeenDate).TotalDays;
        
        /// <summary>
        /// Get days since discovery
        /// </summary>
        public int DaysSinceDiscovery => isDiscovered ? (int)(DateTime.Now - discoveryDate).TotalDays : -1;
        
        /// <summary>
        /// Get days since capture
        /// </summary>
        public int DaysSinceCapture => isCaptured ? (int)(DateTime.Now - captureDate).TotalDays : -1;
        
        /// <summary>
        /// Get days since last seen
        /// </summary>
        public int DaysSinceLastSeen => lastSeenDate != DateTime.MinValue ? (int)(DateTime.Now - lastSeenDate).TotalDays : -1;
        
        /// <summary>
        /// Get win rate percentage
        /// </summary>
        public float GetWinRate()
        {
            if (battleCount == 0) return 0.0f;
            return (float)winCount / battleCount * 100.0f;
        }
        
        /// <summary>
        /// Get completion percentage
        /// </summary>
        public float GetCompletionPercentage()
        {
            int totalContent = 3; // Discovered, Captured, Lore Unlocked
            int completedContent = 0;
            
            if (isDiscovered) completedContent++;
            if (isCaptured) completedContent++;
            if (loreUnlocked) completedContent++;
            
            return (float)completedContent / totalContent * 100.0f;
        }
        
        /// <summary>
        /// Clone this entry
        /// </summary>
        public SpiritDexEntry Clone()
        {
            return new SpiritDexEntry
            {
                spiritID = spiritID,
                spiritName = spiritName,
                speciesID = speciesID,
                isDiscovered = isDiscovered,
                isCaptured = isCaptured,
                firstSeenDate = firstSeenDate,
                discoveryDate = discoveryDate,
                captureDate = captureDate,
                lastSeenDate = lastSeenDate,
                lastSeenLocation = lastSeenLocation,
                discoveryLocation = discoveryLocation,
                captureLocation = captureLocation,
                locationVisitCount = locationVisitCount,
                syncLevel = syncLevel,
                encounterCount = encounterCount,
                battleCount = battleCount,
                winCount = winCount,
                lossCount = lossCount,
                loreUnlocked = loreUnlocked,
                evolutionUnlocked = evolutionUnlocked,
                specialMovesUnlocked = specialMovesUnlocked,
                unlockedAbilities = (string[])unlockedAbilities.Clone(),
                unlockedMoves = (string[])unlockedMoves.Clone(),
                primaryType = primaryType,
                secondaryType = secondaryType,
                rarity = rarity,
                baseLevel = baseLevel,
                currentLevel = currentLevel,
                baseHP = baseHP,
                baseAttack = baseAttack,
                baseDefense = baseDefense,
                baseSpeed = baseSpeed,
                baseSpecialAttack = baseSpecialAttack,
                baseSpecialDefense = baseSpecialDefense,
                evolutionStage = evolutionStage,
                canEvolve = canEvolve,
                evolutionRequirements = (string[])evolutionRequirements.Clone(),
                evolutionRequirementsMet = evolutionRequirementsMet,
                customData = customData,
                isRemixable = isRemixable,
                customTags = (string[])customTags.Clone()
            };
        }
        
        /// <summary>
        /// Override ToString for easy display
        /// </summary>
        public override string ToString()
        {
            return GetSummary();
        }
    }
    
    /// <summary>
    /// Status of a SpiritDex entry
    /// </summary>
    public enum EntryStatus
    {
        Unseen,      // Never encountered
        Discovered,  // Seen but not captured
        Captured     // Successfully captured
    }
    
    /// <summary>
    /// Completion status for SpiritDex entries
    /// </summary>
    public enum CompletionStatus
    {
        Unseen,      // 0% complete
        Discovered,  // 33% complete
        Captured     // 66% complete
        // Complete would be 100% (Captured + Lore + Evolution)
    }
    
    /// <summary>
    /// Spirit types for classification
    /// </summary>
    public enum SpiritType
    {
        None,
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
    /// Spirit rarity levels
    /// </summary>
    public enum SpiritRarity
    {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary,
        Mythical
    }
}