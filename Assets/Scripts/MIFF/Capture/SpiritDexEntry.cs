using System;

namespace MIFF.Capture
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
        public SpiritRarity rarity = SpiritRarity.Common;
        
        [Header("Discovery Status")]
        public bool isDiscovered = false;
        public bool isCaptured = false;
        public DateTime firstSeenDate;
        public DateTime discoveryDate;
        public DateTime captureDate;
        
        [Header("Encounter Tracking")]
        public int sightingCount = 0;
        public int captureCount = 0;
        public int battleCount = 0;
        public DateTime lastSeenDate;
        public DateTime lastBattleDate;
        
        [Header("Spirit Information")]
        public string description = "";
        public string habitat = "";
        public string[] abilities = new string[0];
        public string[] moves = new string[0];
        public string[] types = new string[0];
        
        [Header("Capture History")]
        public DateTime firstCaptureDate;
        public DateTime lastCaptureDate;
        public int totalCaptureAttempts = 0;
        public float averageCaptureChance = 0.0f;
        public bool wasFirstCapture = false;
        
        [Header("Remix Hooks")]
        public string customData = "";
        public bool isRemixable = true;
        
        // Events for remixers to hook into
        public event Action<SpiritDexEntry> OnEntryUpdated;
        public event Action<SpiritDexEntry> OnSpiritDiscovered;
        public event Action<SpiritDexEntry> OnSpiritCaptured;
        
        public SpiritDexEntry()
        {
            firstSeenDate = DateTime.Now;
            discoveryDate = DateTime.MinValue;
            captureDate = DateTime.MinValue;
            lastSeenDate = DateTime.MinValue;
            lastBattleDate = DateTime.MinValue;
            firstCaptureDate = DateTime.MinValue;
            lastCaptureDate = DateTime.MinValue;
        }
        
        /// <summary>
        /// Create a new SpiritDex entry
        /// </summary>
        public SpiritDexEntry(string spiritID, string spiritName = "", SpiritRarity rarity = SpiritRarity.Common)
        {
            this.spiritID = spiritID;
            this.spiritName = spiritName;
            this.rarity = rarity;
            this.firstSeenDate = DateTime.Now;
            this.discoveryDate = DateTime.MinValue;
            this.captureDate = DateTime.MinValue;
            this.lastSeenDate = DateTime.MinValue;
            this.lastBattleDate = DateTime.MinValue;
            this.firstCaptureDate = DateTime.MinValue;
            this.lastCaptureDate = DateTime.MinValue;
        }
        
        /// <summary>
        /// Mark spirit as discovered
        /// </summary>
        public void MarkAsDiscovered()
        {
            if (!isDiscovered)
            {
                isDiscovered = true;
                discoveryDate = DateTime.Now;
                OnSpiritDiscovered?.Invoke(this);
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Mark spirit as captured
        /// </summary>
        public void MarkAsCaptured()
        {
            if (!isCaptured)
            {
                isCaptured = true;
                captureDate = DateTime.Now;
                captureCount++;
                
                if (firstCaptureDate == DateTime.MinValue)
                {
                    firstCaptureDate = DateTime.Now;
                    wasFirstCapture = true;
                }
                
                lastCaptureDate = DateTime.Now;
                
                OnSpiritCaptured?.Invoke(this);
                OnEntryUpdated?.Invoke(this);
            }
            else
            {
                // Already captured, just increment count
                captureCount++;
                lastCaptureDate = DateTime.Now;
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Record a sighting
        /// </summary>
        public void RecordSighting()
        {
            sightingCount++;
            lastSeenDate = DateTime.Now;
            
            // Auto-discover if not already discovered
            if (!isDiscovered)
            {
                MarkAsDiscovered();
            }
            
            OnEntryUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Record a battle
        /// </summary>
        public void RecordBattle()
        {
            battleCount++;
            lastBattleDate = DateTime.Now;
            
            // Auto-discover if not already discovered
            if (!isDiscovered)
            {
                MarkAsDiscovered();
            }
            
            OnEntryUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Record a capture attempt
        /// </summary>
        public void RecordCaptureAttempt(float captureChance)
        {
            totalCaptureAttempts++;
            
            // Update average capture chance
            if (totalCaptureAttempts == 1)
            {
                averageCaptureChance = captureChance;
            }
            else
            {
                averageCaptureChance = ((averageCaptureChance * (totalCaptureAttempts - 1)) + captureChance) / totalCaptureAttempts;
            }
            
            OnEntryUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Get entry summary
        /// </summary>
        public string GetSummary()
        {
            string status = isCaptured ? "✅ CAPTURED" : (isDiscovered ? "🔍 DISCOVERED" : "❓ UNSEEN");
            string rarityInfo = $" | Rarity: {rarity}";
            string sightings = sightingCount > 0 ? $" | Sightings: {sightingCount}" : "";
            string captures = captureCount > 0 ? $" | Captures: {captureCount}" : "";
            
            return $"{status} | {spiritName} ({spiritID}){rarityInfo}{sightings}{captures}";
        }
        
        /// <summary>
        /// Get detailed entry information
        /// </summary>
        public string GetDetailedInfo()
        {
            string baseInfo = GetSummary();
            string description = !string.IsNullOrEmpty(this.description) ? $"\nDescription: {this.description}" : "";
            string habitat = !string.IsNullOrEmpty(this.habitat) ? $"\nHabitat: {this.habitat}" : "";
            string abilities = this.abilities.Length > 0 ? $"\nAbilities: {string.Join(", ", this.abilities)}" : "";
            string moves = this.moves.Length > 0 ? $"\nMoves: {string.Join(", ", this.moves)}" : "";
            string types = this.types.Length > 0 ? $"\nTypes: {string.Join(", ", this.types)}" : "";
            
            string dates = $"\nFirst Seen: {firstSeenDate:yyyy-MM-dd HH:mm:ss}";
            if (isDiscovered) dates += $"\nDiscovered: {discoveryDate:yyyy-MM-dd HH:mm:ss}";
            if (isCaptured) dates += $"\nFirst Captured: {firstCaptureDate:yyyy-MM-dd HH:mm:ss}";
            if (lastSeenDate != DateTime.MinValue) dates += $"\nLast Seen: {lastSeenDate:yyyy-MM-dd HH:mm:ss}";
            if (lastBattleDate != DateTime.MinValue) dates += $"\nLast Battle: {lastBattleDate:yyyy-MM-dd HH:mm:ss}";
            
            string stats = $"\nSightings: {sightingCount}";
            string battles = battleCount > 0 ? $"\nBattles: {battleCount}" : "";
            string captureAttempts = totalCaptureAttempts > 0 ? $"\nCapture Attempts: {totalCaptureAttempts}" : "";
            string avgChance = averageCaptureChance > 0 ? $"\nAverage Capture Chance: {averageCaptureChance:P1}" : "";
            
            return $"{baseInfo}{description}{habitat}{abilities}{moves}{types}{dates}{stats}{battles}{captureAttempts}{avgChance}";
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
            if (isCaptured) return CompletionStatus.Complete;
            if (isDiscovered) return CompletionStatus.Discovered;
            return CompletionStatus.Unseen;
        }
        
        /// <summary>
        /// Check if entry is complete
        /// </summary>
        public bool IsComplete => isCaptured;
        
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
        /// Get rarity multiplier for capture calculations
        /// </summary>
        public float GetRarityMultiplier()
        {
            return rarity switch
            {
                SpiritRarity.Common => 1.0f,
                SpiritRarity.Uncommon => 0.8f,
                SpiritRarity.Rare => 0.6f,
                SpiritRarity.Epic => 0.4f,
                SpiritRarity.Legendary => 0.2f,
                SpiritRarity.Mythical => 0.1f,
                _ => 1.0f
            };
        }
        
        /// <summary>
        /// Get rarity color (for UI display)
        /// </summary>
        public string GetRarityColor()
        {
            return rarity switch
            {
                SpiritRarity.Common => "#FFFFFF",      // White
                SpiritRarity.Uncommon => "#00FF00",    // Green
                SpiritRarity.Rare => "#0080FF",        // Blue
                SpiritRarity.Epic => "#8000FF",        // Purple
                SpiritRarity.Legendary => "#FF8000",   // Orange
                SpiritRarity.Mythical => "#FF0080",    // Pink
                _ => "#FFFFFF"                         // Default white
            };
        }
        
        /// <summary>
        /// Get rarity description
        /// </summary>
        public string GetRarityDescription()
        {
            return rarity switch
            {
                SpiritRarity.Common => "Common spirit, easily found",
                SpiritRarity.Uncommon => "Uncommon spirit, moderately rare",
                SpiritRarity.Rare => "Rare spirit, difficult to find",
                SpiritRarity.Epic => "Epic spirit, very rare and powerful",
                SpiritRarity.Legendary => "Legendary spirit, extremely rare",
                SpiritRarity.Mythical => "Mythical spirit, almost never seen",
                _ => "Unknown rarity"
            };
        }
        
        /// <summary>
        /// Add ability to spirit
        /// </summary>
        public void AddAbility(string ability)
        {
            if (string.IsNullOrEmpty(ability)) return;
            
            if (abilities == null)
                abilities = new string[0];
            
            if (!Array.Exists(abilities, a => a == ability))
            {
                Array.Resize(ref abilities, abilities.Length + 1);
                abilities[abilities.Length - 1] = ability;
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Add move to spirit
        /// </summary>
        public void AddMove(string move)
        {
            if (string.IsNullOrEmpty(move)) return;
            
            if (moves == null)
                moves = new string[0];
            
            if (!Array.Exists(moves, m => m == move))
            {
                Array.Resize(ref moves, moves.Length + 1);
                moves[moves.Length - 1] = move;
                OnEntryUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Add type to spirit
        /// </summary>
        public void AddType(string type)
        {
            if (string.IsNullOrEmpty(type)) return;
            
            if (types == null)
                types = new string[0];
            
            if (!Array.Exists(types, t => t == type))
            {
                Array.Resize(ref types, types.Length + 1);
                types[types.Length - 1] = type;
                OnEntryUpdated?.Invoke(this);
            }
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
                rarity = rarity,
                isDiscovered = isDiscovered,
                isCaptured = isCaptured,
                firstSeenDate = firstSeenDate,
                discoveryDate = discoveryDate,
                captureDate = captureDate,
                sightingCount = sightingCount,
                captureCount = captureCount,
                battleCount = battleCount,
                lastSeenDate = lastSeenDate,
                lastBattleDate = lastBattleDate,
                description = description,
                habitat = habitat,
                abilities = (string[])abilities.Clone(),
                moves = (string[])moves.Clone(),
                types = (string[])types.Clone(),
                firstCaptureDate = firstCaptureDate,
                lastCaptureDate = lastCaptureDate,
                totalCaptureAttempts = totalCaptureAttempts,
                averageCaptureChance = averageCaptureChance,
                wasFirstCapture = wasFirstCapture,
                customData = customData,
                isRemixable = isRemixable
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
        Discovered,  // 50% complete
        Complete     // 100% complete
    }
}