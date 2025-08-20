using System;
using System.Collections.Generic;
using NewBark.Support;

namespace NewBark.State
{
    [Serializable]
    public class GameData
    {
        public static readonly int SchemaVersion = 3;
        public static readonly int MinCompatibleSchemaVersion = 2;

        public DateTime startDate = DateTime.Now;
        public DateTime saveDate = DateTime.Now;
        public float playTime;

        public string areaTitleTrigger;
        public SerializableVector2 playerPosition;
        public SerializableVector2 playerDirection;
        
        // MIFF Framework - Spirit Capture System
        [Header("Spirit Capture Data")]
        public HashSet<string> capturedSpiritIDs = new HashSet<string>();
        public HashSet<string> discoveredSpiritIDs = new HashSet<string>();
        public Dictionary<string, SpiritCaptureData> spiritCaptureHistory = new Dictionary<string, SpiritCaptureData>();
        
        // MIFF Framework - Inventory System
        [Header("Inventory System")]
        public Dictionary<string, int> inventoryCounts = new Dictionary<string, int>();
        
        // MIFF Framework - Onboarding Flags
        [Header("Onboarding Flags")]
        public Dictionary<string, bool> onboardingFlags = new Dictionary<string, bool>();
        
        // MIFF Framework - Quest Progress
        [Header("Quest Progress")]
        public HashSet<string> completedQuests = new HashSet<string>();
        public HashSet<string> activeQuests = new HashSet<string>();
        public Dictionary<string, QuestProgressData> questProgress = new Dictionary<string, QuestProgressData>();
        
        // MIFF Framework - Lore Discovery
        [Header("Lore Discovery")]
        public HashSet<string> discoveredLoreEntries = new HashSet<string>();
        public HashSet<string> viewedLoreEntries = new HashSet<string>();
        
        // MIFF Framework - Location Tracking
        [Header("Location Tracking")]
        public HashSet<string> visitedLocationIDs = new HashSet<string>();
        public Dictionary<string, LocationVisitData> locationVisitHistory = new Dictionary<string, LocationVisitData>();
        
        // MIFF Framework - Battle Statistics
        [Header("Battle Statistics")]
        public int totalBattlesWon = 0;
        public int totalBattlesLost = 0;
        public int totalSpiritsDefeated = 0;
        public Dictionary<string, BattleStats> spiritBattleStats = new Dictionary<string, BattleStats>();
        
        // MIFF Framework - Player Progress
        [Header("Player Progress")]
        public int playerLevel = 1;
        public float playerExperience = 0.0f;
        public int totalSpiritsCaptured = 0;
        public int totalSpiritsDiscovered = 0;
        public DateTime firstCaptureDate = DateTime.MinValue;
        public DateTime lastCaptureDate = DateTime.MinValue;
        
        /// <summary>
        /// Initialize default values for new game
        /// </summary>
        public void InitializeNewGame()
        {
            startDate = DateTime.Now;
            saveDate = DateTime.Now;
            playTime = 0.0f;
            
            // Clear all collections
            capturedSpiritIDs.Clear();
            discoveredSpiritIDs.Clear();
            spiritCaptureHistory.Clear();
            inventoryCounts.Clear();
            onboardingFlags.Clear();
            completedQuests.Clear();
            activeQuests.Clear();
            questProgress.Clear();
            discoveredLoreEntries.Clear();
            viewedLoreEntries.Clear();
            visitedLocationIDs.Clear();
            locationVisitHistory.Clear();
            spiritBattleStats.Clear();
            
            // Reset player progress
            playerLevel = 1;
            playerExperience = 0.0f;
            totalSpiritsCaptured = 0;
            totalSpiritsDiscovered = 0;
            firstCaptureDate = DateTime.MinValue;
            lastCaptureDate = DateTime.MinValue;
            
            // Reset battle stats
            totalBattlesWon = 0;
            totalBattlesLost = 0;
            totalSpiritsDefeated = 0;
        }
        
        /// <summary>
        /// Add a captured spirit
        /// </summary>
        public void AddCapturedSpirit(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID)) return;
            
            capturedSpiritIDs.Add(spiritID);
            totalSpiritsCaptured++;
            
            if (firstCaptureDate == DateTime.MinValue)
            {
                firstCaptureDate = DateTime.Now;
            }
            lastCaptureDate = DateTime.Now;
        }
        
        /// <summary>
        /// Add a discovered spirit
        /// </summary>
        public void AddDiscoveredSpirit(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID)) return;
            
            discoveredSpiritIDs.Add(spiritID);
            totalSpiritsDiscovered++;
        }
        
        /// <summary>
        /// Check if spirit is captured
        /// </summary>
        public bool IsSpiritCaptured(string spiritID)
        {
            return !string.IsNullOrEmpty(spiritID) && capturedSpiritIDs.Contains(spiritID);
        }
        
        /// <summary>
        /// Check if spirit is discovered
        /// </summary>
        public bool IsSpiritDiscovered(string spiritID)
        {
            return !string.IsNullOrEmpty(spiritID) && discoveredSpiritIDs.Contains(spiritID);
        }
        
        /// <summary>
        /// Get capture completion percentage
        /// </summary>
        public float GetCaptureCompletionPercentage()
        {
            if (totalSpiritsDiscovered == 0) return 0.0f;
            return (float)totalSpiritsCaptured / totalSpiritsDiscovered * 100.0f;
        }
        
        /// <summary>
        /// Get game data summary
        /// </summary>
        public string GetGameDataSummary()
        {
            return $"Game Data | Level: {playerLevel} | Spirits: {totalSpiritsCaptured}/{totalSpiritsDiscovered} | " +
                   $"Completion: {GetCaptureCompletionPercentage():F1}% | Battles: {totalBattlesWon}W/{totalBattlesLost}L";
        }
    }
    
    /// <summary>
    /// Data for spirit capture history
    /// </summary>
    [Serializable]
    public class SpiritCaptureData
    {
        public string spiritID;
        public DateTime firstSeenDate;
        public DateTime discoveryDate;
        public DateTime captureDate;
        public int sightingCount;
        public int captureAttempts;
        public float averageCaptureChance;
        public bool wasFirstCapture;
        
        public SpiritCaptureData()
        {
            firstSeenDate = DateTime.Now;
            discoveryDate = DateTime.MinValue;
            captureDate = DateTime.MinValue;
            sightingCount = 0;
            captureAttempts = 0;
            averageCaptureChance = 0.0f;
            wasFirstCapture = false;
        }
    }
    
    /// <summary>
    /// Data for quest progress tracking
    /// </summary>
    [Serializable]
    public class QuestProgressData
    {
        public string questID;
        public DateTime startDate;
        public DateTime lastUpdatedDate;
        public bool isCompleted;
        public Dictionary<string, int> objectiveProgress = new Dictionary<string, int>();
        public List<string> completedObjectives = new List<string>();
        
        public QuestProgressData()
        {
            startDate = DateTime.Now;
            lastUpdatedDate = DateTime.Now;
            isCompleted = false;
        }
    }
    
    /// <summary>
    /// Data for location visit tracking
    /// </summary>
    [Serializable]
    public class LocationVisitData
    {
        public string locationID;
        public DateTime firstVisitDate;
        public DateTime lastVisitDate;
        public int visitCount;
        public bool isUnlocked;
        
        public LocationVisitData()
        {
            firstVisitDate = DateTime.Now;
            lastVisitDate = DateTime.Now;
            visitCount = 1;
            isUnlocked = true;
        }
    }
    
    /// <summary>
    /// Data for battle statistics
    /// </summary>
    [Serializable]
    public class BattleStats
    {
        public string spiritID;
        public int battlesWon;
        public int battlesLost;
        public int timesDefeated;
        public DateTime firstBattleDate;
        public DateTime lastBattleDate;
        public float winRate;
        
        public BattleStats()
        {
            battlesWon = 0;
            battlesLost = 0;
            timesDefeated = 0;
            firstBattleDate = DateTime.Now;
            lastBattleDate = DateTime.Now;
            winRate = 0.0f;
        }
        
        public void UpdateWinRate()
        {
            int totalBattles = battlesWon + battlesLost;
            winRate = totalBattles > 0 ? (float)battlesWon / totalBattles : 0.0f;
        }
    }
}
