using System;
using System.Collections.Generic;

namespace MIFF.Core
{
    [Serializable]
    public struct SimpleVector2
    {
        public float x;
        public float y;
        public SimpleVector2(float x, float y)
        {
            this.x = x;
            this.y = y;
        }
    }

    [Serializable]
    public class GameData
    {
        public static readonly int SchemaVersion = 1;
        public static readonly int MinCompatibleSchemaVersion = 1;

        public DateTime startDate = DateTime.Now;
        public DateTime saveDate = DateTime.Now;
        public float playTime;

        public string areaTitleTrigger;
        public SimpleVector2 playerPosition;
        public SimpleVector2 playerDirection;

        // Spirit Capture Data
        public HashSet<string> capturedSpiritIDs = new HashSet<string>();
        public HashSet<string> discoveredSpiritIDs = new HashSet<string>();
        public Dictionary<string, SpiritCaptureData> spiritCaptureHistory = new Dictionary<string, SpiritCaptureData>();

        // Inventory System
        public Dictionary<string, int> inventoryCounts = new Dictionary<string, int>();

        // Onboarding Flags
        public Dictionary<string, bool> onboardingFlags = new Dictionary<string, bool>();

        // Quest Progress
        public HashSet<string> completedQuests = new HashSet<string>();
        public HashSet<string> activeQuests = new HashSet<string>();
        public Dictionary<string, QuestProgressData> questProgress = new Dictionary<string, QuestProgressData>();

        // Lore Discovery
        public HashSet<string> discoveredLoreEntries = new HashSet<string>();
        public HashSet<string> viewedLoreEntries = new HashSet<string>();

        // Location Tracking
        public HashSet<string> visitedLocationIDs = new HashSet<string>();
        public Dictionary<string, LocationVisitData> locationVisitHistory = new Dictionary<string, LocationVisitData>();

        // Battle Statistics
        public int totalBattlesWon = 0;
        public int totalBattlesLost = 0;
        public int totalSpiritsDefeated = 0;
        public Dictionary<string, BattleStats> spiritBattleStats = new Dictionary<string, BattleStats>();

        // Player Progress
        public int playerLevel = 1;
        public float playerExperience = 0.0f;
        public int totalSpiritsCaptured = 0;
        public int totalSpiritsDiscovered = 0;
        public DateTime firstCaptureDate = DateTime.MinValue;
        public DateTime lastCaptureDate = DateTime.MinValue;

        public void InitializeNewGame()
        {
            startDate = DateTime.Now;
            saveDate = DateTime.Now;
            playTime = 0.0f;

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

            playerLevel = 1;
            playerExperience = 0.0f;
            totalSpiritsCaptured = 0;
            totalSpiritsDiscovered = 0;
            firstCaptureDate = DateTime.MinValue;
            lastCaptureDate = DateTime.MinValue;

            totalBattlesWon = 0;
            totalBattlesLost = 0;
            totalSpiritsDefeated = 0;
        }

        public void AddCapturedSpirit(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID)) return;
            if (capturedSpiritIDs.Add(spiritID))
            {
                totalSpiritsCaptured++;
                if (firstCaptureDate == DateTime.MinValue)
                {
                    firstCaptureDate = DateTime.Now;
                }
                lastCaptureDate = DateTime.Now;
            }
        }

        public void AddDiscoveredSpirit(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID)) return;
            if (discoveredSpiritIDs.Add(spiritID))
            {
                totalSpiritsDiscovered++;
            }
        }

        public bool IsSpiritCaptured(string spiritID)
        {
            return !string.IsNullOrEmpty(spiritID) && capturedSpiritIDs.Contains(spiritID);
        }

        public bool IsSpiritDiscovered(string spiritID)
        {
            return !string.IsNullOrEmpty(spiritID) && discoveredSpiritIDs.Contains(spiritID);
        }

        public float GetCaptureCompletionPercentage()
        {
            if (totalSpiritsDiscovered == 0) return 0.0f;
            return (float)totalSpiritsCaptured / totalSpiritsDiscovered * 100.0f;
        }
    }

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

