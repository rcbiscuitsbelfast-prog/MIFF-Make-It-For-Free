using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Core
{
    /// <summary>
    /// Represents a save slot with metadata and summary information
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SaveSlot
    {
        [Header("Save Slot Identity")]
        public string slotID;
        public string slotName;
        public string playerName;
        public DateTime creationDate;
        public DateTime lastSaveDate;
        public DateTime lastLoadDate;
        
        [Header("Game Progress Summary")]
        public int playerLevel;
        public float playerExperience;
        public int totalPlayTime;
        public int totalBattlesWon;
        public int totalBattlesLost;
        public int totalSpiritsCaptured;
        public int totalSpiritsDiscovered;
        public int totalQuestsCompleted;
        public int totalLoreEntriesUnlocked;
        
        [Header("Game State")]
        public string currentLocation;
        public string currentArea;
        public string lastVisitedLocation;
        public string activeQuestID;
        public string lastCompletedQuestID;
        public string currentEvolutionQuestID;
        
        [Header("Inventory Summary")]
        public int totalItems;
        public int totalCurrency;
        public int totalCaptureItems;
        public int totalHealingItems;
        public int totalEvolutionItems;
        public string[] rareItems;
        
        [Header("Spirit Collection")]
        public int totalSpiritsInParty;
        public int totalSpiritsInStorage;
        public string[] legendarySpirits;
        public string[] mythicalSpirits;
        public float collectionCompletionPercentage;
        public string strongestSpiritID;
        public int strongestSpiritLevel;
        
        [Header("Achievements & Flags")]
        public int totalAchievementsUnlocked;
        public int totalTutorialsCompleted;
        public bool firstEvolutionCompleted;
        public bool firstLegendaryCaptured;
        public bool firstMythicalEncountered;
        public string[] unlockedAchievements;
        public string[] completedTutorials;
        
        [Header("Technical Information")]
        public string gameVersion;
        public string saveFormatVersion;
        public long fileSizeBytes;
        public bool isCorrupted;
        public string corruptionReason;
        public DateTime lastValidationDate;
        
        [Header("Remix Hooks")]
        public string customData;
        public bool isRemixable = true;
        public string[] customTags;
        public Dictionary<string, object> customFields;
        
        // Events for remixers to hook into
        public event Action<SaveSlot> OnSaveSlotUpdated;
        public event Action<SaveSlot> OnSaveSlotCorrupted;
        public event Action<SaveSlot> OnSaveSlotValidated;
        
        public SaveSlot()
        {
            creationDate = DateTime.Now;
            lastSaveDate = DateTime.MinValue;
            lastLoadDate = DateTime.MinValue;
            rareItems = new string[0];
            legendarySpirits = new string[0];
            mythicalSpirits = new string[0];
            unlockedAchievements = new string[0];
            completedTutorials = new string[0];
            customTags = new string[0];
            customFields = new Dictionary<string, object>();
            isCorrupted = false;
            corruptionReason = "";
        }
        
        /// <summary>
        /// Create a new save slot
        /// </summary>
        public SaveSlot(string slotID, string slotName = "", string playerName = "")
        {
            this.slotID = slotID;
            this.slotName = string.IsNullOrEmpty(slotName) ? $"Save {slotID}" : slotName;
            this.playerName = string.IsNullOrEmpty(playerName) ? "Player" : playerName;
            this.creationDate = DateTime.Now;
            this.lastSaveDate = DateTime.MinValue;
            this.lastLoadDate = DateTime.MinValue;
            this.rareItems = new string[0];
            this.legendarySpirits = new string[0];
            this.mythicalSpirits = new string[0];
            this.unlockedAchievements = new string[0];
            this.completedTutorials = new string[0];
            this.customTags = new string[0];
            this.customFields = new Dictionary<string, object>();
            this.isCorrupted = false;
            this.corruptionReason = "";
        }
        
        /// <summary>
        /// Update save slot with current game data
        /// </summary>
        public void UpdateFromGameData(GameData gameData)
        {
            if (gameData == null) return;
            
            try
            {
                // Update basic progress
                playerLevel = gameData.playerLevel;
                playerExperience = gameData.playerExperience;
                totalPlayTime = (int)gameData.playTime;
                totalBattlesWon = gameData.totalBattlesWon;
                totalBattlesLost = gameData.totalBattlesLost;
                totalSpiritsCaptured = gameData.totalSpiritsCaptured;
                totalSpiritsDiscovered = gameData.totalSpiritsDiscovered;
                
                // Update inventory summary
                totalItems = gameData.inventoryCounts.Values.Sum();
                totalCurrency = gameData.inventoryCounts.ContainsKey("currency") ? gameData.inventoryCounts["currency"] : 0;
                
                // Update spirit collection
                totalSpiritsInParty = 6; // Assuming 6-party system
                totalSpiritsInStorage = gameData.capturedSpiritIDs.Count - totalSpiritsInParty;
                collectionCompletionPercentage = gameData.GetCaptureCompletionPercentage();
                
                // Update achievements and flags
                totalAchievementsUnlocked = gameData.onboardingFlags.Count(f => f.Value);
                totalTutorialsCompleted = gameData.onboardingFlags.Count(f => f.Value);
                firstEvolutionCompleted = gameData.onboardingFlags.ContainsKey("FirstEvolutionSeen") && gameData.onboardingFlags["FirstEvolutionSeen"];
                
                // Update timestamps
                lastSaveDate = DateTime.Now;
                
                // Trigger update event
                OnSaveSlotUpdated?.Invoke(this);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating save slot: {ex.Message}");
                MarkAsCorrupted($"Update error: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Mark save slot as corrupted
        /// </summary>
        public void MarkAsCorrupted(string reason)
        {
            isCorrupted = true;
            corruptionReason = reason;
            lastValidationDate = DateTime.Now;
            
            OnSaveSlotCorrupted?.Invoke(this);
        }
        
        /// <summary>
        /// Mark save slot as valid
        /// </summary>
        public void MarkAsValid()
        {
            isCorrupted = false;
            corruptionReason = "";
            lastValidationDate = DateTime.Now;
            
            OnSaveSlotValidated?.Invoke(this);
        }
        
        /// <summary>
        /// Update last load date
        /// </summary>
        public void UpdateLastLoadDate()
        {
            lastLoadDate = DateTime.Now;
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
                OnSaveSlotUpdated?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Set custom field value
        /// </summary>
        public void SetCustomField(string key, object value)
        {
            if (string.IsNullOrEmpty(key)) return;
            
            if (customFields == null)
                customFields = new Dictionary<string, object>();
            
            customFields[key] = value;
            OnSaveSlotUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Get custom field value
        /// </summary>
        public T GetCustomField<T>(string key, T defaultValue = default(T))
        {
            if (customFields == null || !customFields.ContainsKey(key))
                return defaultValue;
            
            try
            {
                if (customFields[key] is T typedValue)
                    return typedValue;
                
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }
        
        /// <summary>
        /// Get save slot summary
        /// </summary>
        public string GetSummary()
        {
            string status = isCorrupted ? "❌ CORRUPTED" : "✅ VALID";
            string name = !string.IsNullOrEmpty(slotName) ? slotName : $"Save {slotID}";
            string player = !string.IsNullOrEmpty(playerName) ? playerName : "Unknown";
            string level = $"Level {playerLevel}";
            string spirits = $"Spirits: {totalSpiritsCaptured}/{totalSpiritsDiscovered}";
            string completion = $"Completion: {collectionCompletionPercentage:F1}%";
            string time = $"Play Time: {FormatPlayTime(totalPlayTime)}";
            
            return $"{status} | {name} | {player} | {level} | {spirits} | {completion} | {time}";
        }
        
        /// <summary>
        /// Get detailed save slot information
        /// </summary>
        public string GetDetailedInfo()
        {
            string baseInfo = GetSummary();
            string dates = $"\nCreated: {creationDate:yyyy-MM-dd HH:mm:ss}";
            string lastSave = lastSaveDate != DateTime.MinValue ? $"\nLast Saved: {lastSaveDate:yyyy-MM-dd HH:mm:ss}" : "";
            string lastLoad = lastLoadDate != DateTime.MinValue ? $"\nLast Loaded: {lastLoadDate:yyyy-MM-dd HH:mm:ss}" : "";
            
            string progress = $"\nProgress | Level: {playerLevel} | Exp: {playerExperience:F0} | Battles: {totalBattlesWon}W/{totalBattlesLost}L";
            string spirits = $"\nSpirits | Captured: {totalSpiritsCaptured} | Discovered: {totalSpiritsDiscovered} | Party: {totalSpiritsInParty} | Storage: {totalSpiritsInStorage}";
            string inventory = $"\nInventory | Items: {totalItems} | Currency: {totalCurrency} | Capture Items: {totalCaptureItems}";
            string achievements = $"\nAchievements | Unlocked: {totalAchievementsUnlocked} | Tutorials: {totalTutorialsCompleted}";
            
            string technical = $"\nTechnical | Version: {gameVersion} | Format: {saveFormatVersion} | Size: {FormatFileSize(fileSizeBytes)}";
            string validation = $"\nValidation | Corrupted: {isCorrupted} | Last Validated: {lastValidationDate:yyyy-MM-dd HH:mm:ss}";
            
            string custom = customTags.Length > 0 ? $"\nCustom Tags: {string.Join(", ", customTags)}" : "";
            string customData = !string.IsNullOrEmpty(this.customData) ? $"\nCustom Data: {this.customData}" : "";
            
            if (isCorrupted && !string.IsNullOrEmpty(corruptionReason))
            {
                validation += $"\nCorruption Reason: {corruptionReason}";
            }
            
            return $"{baseInfo}{dates}{lastSave}{lastLoad}{progress}{spirits}{inventory}{achievements}{technical}{validation}{custom}{customData}";
        }
        
        /// <summary>
        /// Get save slot status
        /// </summary>
        public SaveSlotStatus GetStatus()
        {
            if (isCorrupted) return SaveSlotStatus.Corrupted;
            if (lastSaveDate == DateTime.MinValue) return SaveSlotStatus.Empty;
            if (lastLoadDate == DateTime.MinValue) return SaveSlotStatus.Unplayed;
            return SaveSlotStatus.Active;
        }
        
        /// <summary>
        /// Check if save slot is empty
        /// </summary>
        public bool IsEmpty => lastSaveDate == DateTime.MinValue;
        
        /// <summary>
        /// Check if save slot is corrupted
        /// </summary>
        public bool IsCorrupted => isCorrupted;
        
        /// <summary>
        /// Check if save slot is valid
        /// </summary>
        public bool IsValid => !isCorrupted;
        
        /// <summary>
        /// Get days since creation
        /// </summary>
        public int DaysSinceCreation => (int)(DateTime.Now - creationDate).TotalDays;
        
        /// <summary>
        /// Get days since last save
        /// </summary>
        public int DaysSinceLastSave => lastSaveDate != DateTime.MinValue ? (int)(DateTime.Now - lastSaveDate).TotalDays : -1;
        
        /// <summary>
        /// Get days since last load
        /// </summary>
        public int DaysSinceLastLoad => lastLoadDate != DateTime.MinValue ? (int)(DateTime.Now - lastLoadDate).TotalDays : -1;
        
        /// <summary>
        /// Get save slot age
        /// </summary>
        public string GetSaveAge()
        {
            int days = DaysSinceCreation;
            if (days == 0) return "Today";
            if (days == 1) return "Yesterday";
            if (days < 7) return $"{days} days ago";
            if (days < 30) return $"{days / 7} weeks ago";
            if (days < 365) return $"{days / 30} months ago";
            return $"{days / 365} years ago";
        }
        
        /// <summary>
        /// Format play time for display
        /// </summary>
        private string FormatPlayTime(int totalSeconds)
        {
            if (totalSeconds < 60) return $"{totalSeconds}s";
            if (totalSeconds < 3600) return $"{totalSeconds / 60}m {totalSeconds % 60}s";
            
            int hours = totalSeconds / 3600;
            int minutes = (totalSeconds % 3600) / 60;
            return $"{hours}h {minutes}m";
        }
        
        /// <summary>
        /// Format file size for display
        /// </summary>
        private string FormatFileSize(long bytes)
        {
            if (bytes < 1024) return $"{bytes} B";
            if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
            if (bytes < 1024 * 1024 * 1024) return $"{bytes / (1024.0 * 1024.0):F1} MB";
            return $"{bytes / (1024.0 * 1024.0 * 1024.0):F1} GB";
        }
        
        /// <summary>
        /// Clone this save slot
        /// </summary>
        public SaveSlot Clone()
        {
            return new SaveSlot
            {
                slotID = slotID,
                slotName = slotName,
                playerName = playerName,
                creationDate = creationDate,
                lastSaveDate = lastSaveDate,
                lastLoadDate = lastLoadDate,
                playerLevel = playerLevel,
                playerExperience = playerExperience,
                totalPlayTime = totalPlayTime,
                totalBattlesWon = totalBattlesWon,
                totalBattlesLost = totalBattlesLost,
                totalSpiritsCaptured = totalSpiritsCaptured,
                totalSpiritsDiscovered = totalSpiritsDiscovered,
                totalQuestsCompleted = totalQuestsCompleted,
                totalLoreEntriesUnlocked = totalLoreEntriesUnlocked,
                currentLocation = currentLocation,
                currentArea = currentArea,
                lastVisitedLocation = lastVisitedLocation,
                activeQuestID = activeQuestID,
                lastCompletedQuestID = lastCompletedQuestID,
                currentEvolutionQuestID = currentEvolutionQuestID,
                totalItems = totalItems,
                totalCurrency = totalCurrency,
                totalCaptureItems = totalCaptureItems,
                totalHealingItems = totalHealingItems,
                totalEvolutionItems = totalEvolutionItems,
                rareItems = (string[])rareItems.Clone(),
                totalSpiritsInParty = totalSpiritsInParty,
                totalSpiritsInStorage = totalSpiritsInStorage,
                legendarySpirits = (string[])legendarySpirits.Clone(),
                mythicalSpirits = (string[])mythicalSpirits.Clone(),
                collectionCompletionPercentage = collectionCompletionPercentage,
                strongestSpiritID = strongestSpiritID,
                strongestSpiritLevel = strongestSpiritLevel,
                totalAchievementsUnlocked = totalAchievementsUnlocked,
                totalTutorialsCompleted = totalTutorialsCompleted,
                firstEvolutionCompleted = firstEvolutionCompleted,
                firstLegendaryCaptured = firstLegendaryCaptured,
                firstMythicalEncountered = firstMythicalEncountered,
                unlockedAchievements = (string[])unlockedAchievements.Clone(),
                completedTutorials = (string[])completedTutorials.Clone(),
                gameVersion = gameVersion,
                saveFormatVersion = saveFormatVersion,
                fileSizeBytes = fileSizeBytes,
                isCorrupted = isCorrupted,
                corruptionReason = corruptionReason,
                lastValidationDate = lastValidationDate,
                customData = customData,
                isRemixable = isRemixable,
                customTags = (string[])customTags.Clone(),
                customFields = new Dictionary<string, object>(customFields)
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
    /// Status of a save slot
    /// </summary>
    public enum SaveSlotStatus
    {
        Empty,       // No save data
        Unplayed,    // Saved but never loaded
        Active,      // Currently in use
        Corrupted    // Save data is corrupted
    }
}