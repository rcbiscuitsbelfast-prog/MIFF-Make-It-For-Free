using System;
using System.Collections.Generic;
using System.Linq;
using NewBark.State;

namespace MIFF.Spirits
{
    /// <summary>
    /// Manages the SpiritDex - tracks discovered and captured spirits
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritDexManager
    {
        [Header("SpiritDex Data")]
        public Dictionary<string, SpiritDexEntry> spiritEntries = new Dictionary<string, SpiritDexEntry>();
        public HashSet<string> discoveredSpiritIDs = new HashSet<string>();
        public HashSet<string> capturedSpiritIDs = new HashSet<string>();
        
        [Header("SpiritDex Statistics")]
        public int totalSpiritsDiscovered;
        public int totalSpiritsCaptured;
        public int totalSpiritsSeen;
        public DateTime firstDiscoveryDate;
        public DateTime lastDiscoveryDate;
        public DateTime firstCaptureDate;
        public DateTime lastCaptureDate;
        
        [Header("SpiritDex Features")]
        public bool enableAutoDiscovery = true;
        public bool enableCaptureTracking = true;
        public bool enableDiscoveryTracking = true;
        public bool enableStatistics = true;
        public bool enableLocationTracking = true;
        public bool enableProgressTracking = true;
        
        [Header("Remix Hooks")]
        public bool enableCustomEntries = true;
        public bool enableCustomCategories = true;
        public bool enableCustomFilters = true;
        public bool enableCustomEvents = true;
        
        // Events for remixers to hook into
        public event Action<SpiritDexManager, string> OnSpiritDiscovered;
        public event Action<SpiritDexManager, string> OnSpiritCaptured;
        public event Action<SpiritDexManager, string> OnSpiritSeen;
        public event Action<SpiritDexManager, SpiritDexEntry> OnEntryUpdated;
        public event Action<SpiritDexManager> OnSpiritDexUpdated;
        public event Action<SpiritDexManager, string> OnLoreUnlocked;
        public event Action<SpiritDexManager, string> OnEvolutionUnlocked;
        
        // Reference to GameData for persistence
        private GameData gameData;
        
        public SpiritDexManager()
        {
            InitializeSpiritDex();
        }
        
        /// <summary>
        /// Initialize with GameData reference
        /// </summary>
        public SpiritDexManager(GameData data)
        {
            gameData = data;
            InitializeSpiritDex();
            LoadFromGameData();
        }
        
        /// <summary>
        /// Initialize the SpiritDex
        /// </summary>
        private void InitializeSpiritDex()
        {
            spiritEntries.Clear();
            discoveredSpiritIDs.Clear();
            capturedSpiritIDs.Clear();
            
            totalSpiritsDiscovered = 0;
            totalSpiritsCaptured = 0;
            totalSpiritsSeen = 0;
            
            firstDiscoveryDate = DateTime.MinValue;
            lastDiscoveryDate = DateTime.MinValue;
            firstCaptureDate = DateTime.MinValue;
            lastCaptureDate = DateTime.MinValue;
        }
        
        /// <summary>
        /// Load data from GameData
        /// </summary>
        private void LoadFromGameData()
        {
            if (gameData == null) return;
            
            try
            {
                // Load discovered spirits
                foreach (var spiritID in gameData.discoveredSpiritIDs)
                {
                    discoveredSpiritIDs.Add(spiritID);
                    if (!spiritEntries.ContainsKey(spiritID))
                    {
                        spiritEntries[spiritID] = new SpiritDexEntry(spiritID);
                    }
                    spiritEntries[spiritID].MarkAsDiscovered();
                }
                
                // Load captured spirits
                foreach (var spiritID in gameData.capturedSpiritIDs)
                {
                    capturedSpiritIDs.Add(spiritID);
                    if (!spiritEntries.ContainsKey(spiritID))
                    {
                        spiritEntries[spiritID] = new SpiritDexEntry(spiritID);
                    }
                    spiritEntries[spiritID].MarkAsCaptured();
                }
                
                // Load capture history
                foreach (var kvp in gameData.spiritCaptureHistory)
                {
                    var spiritID = kvp.Key;
                    var captureData = kvp.Value;
                    
                    if (spiritEntries.ContainsKey(spiritID))
                    {
                        var entry = spiritEntries[spiritID];
                        entry.firstSeenDate = captureData.firstSeenDate;
                        entry.discoveryDate = captureData.discoveryDate;
                        entry.captureDate = captureData.captureDate;
                        entry.encounterCount = captureData.sightingCount;
                        entry.averageCaptureChance = captureData.averageCaptureChance;
                    }
                }
                
                UpdateStatistics();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading SpiritDex from GameData: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Save data to GameData
        /// </summary>
        public void SaveToGameData()
        {
            if (gameData == null) return;
            
            try
            {
                // Update GameData collections
                gameData.discoveredSpiritIDs.Clear();
                gameData.capturedSpiritIDs.Clear();
                gameData.spiritCaptureHistory.Clear();
                
                foreach (var spiritID in discoveredSpiritIDs)
                {
                    gameData.discoveredSpiritIDs.Add(spiritID);
                }
                
                foreach (var spiritID in capturedSpiritIDs)
                {
                    gameData.capturedSpiritIDs.Add(spiritID);
                }
                
                // Update capture history
                foreach (var kvp in spiritEntries)
                {
                    var spiritID = kvp.Key;
                    var entry = kvp.Value;
                    
                    if (entry.isDiscovered || entry.isCaptured)
                    {
                        var captureData = new SpiritCaptureData
                        {
                            spiritID = spiritID,
                            firstSeenDate = entry.firstSeenDate,
                            discoveryDate = entry.discoveryDate,
                            captureDate = entry.captureDate,
                            sightingCount = entry.encounterCount,
                            averageCaptureChance = entry.averageCaptureChance,
                            wasFirstCapture = entry.isCaptured && !entry.isDiscovered
                        };
                        
                        gameData.spiritCaptureHistory[spiritID] = captureData;
                    }
                }
                
                // Update player progress
                gameData.totalSpiritsDiscovered = totalSpiritsDiscovered;
                gameData.totalSpiritsCaptured = totalSpiritsCaptured;
                
                if (firstDiscoveryDate != DateTime.MinValue)
                {
                    gameData.firstCaptureDate = firstDiscoveryDate;
                }
                if (lastDiscoveryDate != DateTime.MinValue)
                {
                    gameData.lastCaptureDate = lastDiscoveryDate;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving SpiritDex to GameData: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Register a spirit as discovered
        /// </summary>
        public bool RegisterDiscovery(string spiritID, string spiritName = "", string location = "")
        {
            if (string.IsNullOrEmpty(spiritID)) return false;
            
            try
            {
                // Check if already discovered
                if (discoveredSpiritIDs.Contains(spiritID))
                {
                    // Update existing entry
                    if (spiritEntries.ContainsKey(spiritID))
                    {
                        spiritEntries[spiritID].MarkAsDiscovered(location);
                    }
                    return false; // Already discovered
                }
                
                // Add to discovered set
                discoveredSpiritIDs.Add(spiritID);
                
                // Create or update entry
                if (!spiritEntries.ContainsKey(spiritID))
                {
                    spiritEntries[spiritID] = new SpiritDexEntry(spiritID, spiritName);
                }
                
                spiritEntries[spiritID].MarkAsDiscovered(location);
                
                // Update statistics
                if (enableStatistics)
                {
                    totalSpiritsDiscovered++;
                    lastDiscoveryDate = DateTime.Now;
                    
                    if (firstDiscoveryDate == DateTime.MinValue)
                    {
                        firstDiscoveryDate = DateTime.Now;
                    }
                }
                
                // Trigger event
                OnSpiritDiscovered?.Invoke(this, spiritID);
                
                // Save to GameData
                SaveToGameData();
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error registering discovery: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Register a spirit as captured
        /// </summary>
        public bool RegisterCapture(string spiritID, string spiritName = "", string location = "")
        {
            if (string.IsNullOrEmpty(spiritID)) return false;
            
            try
            {
                // Check if already captured
                if (capturedSpiritIDs.Contains(spiritID))
                {
                    return false; // Already captured
                }
                
                // Add to captured set
                capturedSpiritIDs.Add(spiritID);
                
                // Ensure spirit is discovered
                if (!discoveredSpiritIDs.Contains(spiritID))
                {
                    RegisterDiscovery(spiritID, spiritName, location);
                }
                
                // Update entry
                if (spiritEntries.ContainsKey(spiritID))
                {
                    spiritEntries[spiritID].MarkAsCaptured(location);
                    
                    // Update statistics
                    if (enableStatistics)
                    {
                        totalSpiritsCaptured++;
                        lastCaptureDate = DateTime.Now;
                        
                        if (firstCaptureDate == DateTime.MinValue)
                        {
                            firstCaptureDate = DateTime.Now;
                        }
                    }
                }
                
                // Trigger event
                OnSpiritCaptured?.Invoke(this, spiritID);
                
                // Save to GameData
                SaveToGameData();
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error registering capture: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Register a spirit as seen (encountered in battle)
        /// </summary>
        public bool RegisterSighting(string spiritID, string spiritName = "", string location = "")
        {
            if (string.IsNullOrEmpty(spiritID)) return false;
            
            try
            {
                // Create or update entry
                if (!spiritEntries.ContainsKey(spiritID))
                {
                    spiritEntries[spiritID] = new SpiritDexEntry(spiritID, spiritName);
                }
                
                spiritEntries[spiritID].RecordEncounter(location);
                
                // Update statistics
                if (enableStatistics)
                {
                    totalSpiritsSeen++;
                }
                
                // Trigger event
                OnSpiritSeen?.Invoke(this, spiritID);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error registering sighting: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Check if a spirit has been discovered
        /// </summary>
        public bool IsDiscovered(string spiritID)
        {
            return !string.IsNullOrEmpty(spiritID) && discoveredSpiritIDs.Contains(spiritID);
        }
        
        /// <summary>
        /// Check if a spirit has been captured
        /// </summary>
        public bool IsCaptured(string spiritID)
        {
            return !string.IsNullOrEmpty(spiritID) && capturedSpiritIDs.Contains(spiritID);
        }
        
        /// <summary>
        /// Check if a spirit has been seen
        /// </summary>
        public bool IsSeen(string spiritID)
        {
            return !string.IsNullOrEmpty(spiritID) && spiritEntries.ContainsKey(spiritID);
        }
        
        /// <summary>
        /// Get list of discovered spirit IDs
        /// </summary>
        public List<string> GetDiscoveredList()
        {
            return new List<string>(discoveredSpiritIDs);
        }
        
        /// <summary>
        /// Get list of captured spirit IDs
        /// </summary>
        public List<string> GetCapturedList()
        {
            return new List<string>(capturedSpiritIDs);
        }
        
        /// <summary>
        /// Get list of all seen spirit IDs
        /// </summary>
        public List<string> GetSeenList()
        {
            return new List<string>(spiritEntries.Keys);
        }
        
        /// <summary>
        /// Get SpiritDex entry for a spirit
        /// </summary>
        public SpiritDexEntry GetEntry(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID) || !spiritEntries.ContainsKey(spiritID))
                return null;
            
            return spiritEntries[spiritID];
        }
        
        /// <summary>
        /// Get all SpiritDex entries
        /// </summary>
        public List<SpiritDexEntry> GetDexEntries()
        {
            return new List<SpiritDexEntry>(spiritEntries.Values);
        }
        
        /// <summary>
        /// Get entries by discovery status
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByDiscoveryStatus(bool discovered)
        {
            return spiritEntries.Values.Where(e => e.isDiscovered == discovered).ToList();
        }
        
        /// <summary>
        /// Get entries by capture status
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByCaptureStatus(bool captured)
        {
            return spiritEntries.Values.Where(e => e.isCaptured == captured).ToList();
        }
        
        /// <summary>
        /// Get entries by type
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByType(SpiritType type)
        {
            return spiritEntries.Values.Where(e => e.primaryType == type || e.secondaryType == type).ToList();
        }
        
        /// <summary>
        /// Get entries by rarity
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByRarity(SpiritRarity rarity)
        {
            return spiritEntries.Values.Where(e => e.rarity == rarity).ToList();
        }
        
        /// <summary>
        /// Get entries by location
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByLocation(string location)
        {
            if (string.IsNullOrEmpty(location)) return new List<SpiritDexEntry>();
            
            return spiritEntries.Values
                .Where(e => !string.IsNullOrEmpty(e.lastSeenLocation) && 
                           e.lastSeenLocation.Contains(location, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        
        /// <summary>
        /// Get completion percentage
        /// </summary>
        public float GetCompletionPercentage()
        {
            if (totalSpiritsDiscovered == 0) return 0.0f;
            
            return (float)totalSpiritsCaptured / totalSpiritsDiscovered * 100.0f;
        }
        
        /// <summary>
        /// Get discovery percentage
        /// </summary>
        public float GetDiscoveryPercentage()
        {
            if (totalSpiritsSeen == 0) return 0.0f;
            
            return (float)totalSpiritsDiscovered / totalSpiritsSeen * 100.0f;
        }
        
        /// <summary>
        /// Get SpiritDex statistics
        /// </summary>
        public SpiritDexStats GetStatistics()
        {
            return new SpiritDexStats
            {
                totalSpiritsSeen = totalSpiritsSeen,
                totalSpiritsDiscovered = totalSpiritsDiscovered,
                totalSpiritsCaptured = totalSpiritsCaptured,
                completionPercentage = GetCompletionPercentage(),
                discoveryPercentage = GetDiscoveryPercentage(),
                firstDiscoveryDate = firstDiscoveryDate,
                lastDiscoveryDate = lastDiscoveryDate,
                firstCaptureDate = firstCaptureDate,
                lastCaptureDate = lastCaptureDate
            };
        }
        
        /// <summary>
        /// Search spirits by name
        /// </summary>
        public List<SpiritDexEntry> SearchByName(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return new List<SpiritDexEntry>();
            
            return spiritEntries.Values
                .Where(e => !string.IsNullOrEmpty(e.spiritName) && 
                           e.spiritName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        
        /// <summary>
        /// Search spirits by ID
        /// </summary>
        public List<SpiritDexEntry> SearchByID(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return new List<SpiritDexEntry>();
            
            return spiritEntries.Values
                .Where(e => !string.IsNullOrEmpty(e.spiritID) && 
                           e.spiritID.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        
        /// <summary>
        /// Filter spirits by multiple criteria
        /// </summary>
        public List<SpiritDexEntry> FilterSpirits(SpiritDexFilter filter)
        {
            if (filter == null) return GetDexEntries();
            
            var query = spiritEntries.Values.AsQueryable();
            
            if (filter.discovered.HasValue)
                query = query.Where(e => e.isDiscovered == filter.discovered.Value);
            
            if (filter.captured.HasValue)
                query = query.Where(e => e.isCaptured == filter.captured.Value);
            
            if (filter.type.HasValue)
                query = query.Where(e => e.primaryType == filter.type.Value || e.secondaryType == filter.type.Value);
            
            if (filter.rarity.HasValue)
                query = query.Where(e => e.rarity == filter.rarity.Value);
            
            if (filter.minEncounters > 0)
                query = query.Where(e => e.encounterCount >= filter.minEncounters);
            
            if (filter.minBattles > 0)
                query = query.Where(e => e.battleCount >= filter.minBattles);
            
            if (!string.IsNullOrEmpty(filter.location))
                query = query.Where(e => !string.IsNullOrEmpty(e.lastSeenLocation) && 
                                       e.lastSeenLocation.Contains(filter.location, StringComparison.OrdinalIgnoreCase));
            
            return query.ToList();
        }
        
        /// <summary>
        /// Update statistics
        /// </summary>
        private void UpdateStatistics()
        {
            totalSpiritsDiscovered = discoveredSpiritIDs.Count;
            totalSpiritsCaptured = capturedSpiritIDs.Count;
            totalSpiritsSeen = spiritEntries.Count;
        }
        
        /// <summary>
        /// Clear all data (for testing/reset)
        /// </summary>
        public void ClearAllData()
        {
            InitializeSpiritDex();
            OnSpiritDexUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Get SpiritDex summary
        /// </summary>
        public string GetSpiritDexSummary()
        {
            return $"SpiritDex | Seen: {totalSpiritsSeen} | Discovered: {totalSpiritsDiscovered} | " +
                   $"Captured: {totalSpiritsCaptured} | Completion: {GetCompletionPercentage():F1}%";
        }
        
        /// <summary>
        /// Export SpiritDex data
        /// </summary>
        public string ExportData()
        {
            var stats = GetStatistics();
            var entries = GetDexEntries();
            
            string export = $"SpiritDex Export - {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n";
            export += $"Statistics: {stats}\n\n";
            export += "Entries:\n";
            
            foreach (var entry in entries.OrderBy(e => e.spiritID))
            {
                export += $"- {entry}\n";
            }
            
            return export;
        }
    }
    
    /// <summary>
    /// Filter for SpiritDex queries
    /// </summary>
    [Serializable]
    public class SpiritDexFilter
    {
        public bool? discovered;
        public bool? captured;
        public SpiritType? type;
        public SpiritRarity? rarity;
        public int minEncounters;
        public int minBattles;
        public string location;
        public string searchTerm;
    }
    
    /// <summary>
    /// Statistics for the SpiritDex
    /// </summary>
    [Serializable]
    public class SpiritDexStats
    {
        public int totalSpiritsSeen;
        public int totalSpiritsDiscovered;
        public int totalSpiritsCaptured;
        public float completionPercentage;
        public float discoveryPercentage;
        public DateTime firstDiscoveryDate;
        public DateTime lastDiscoveryDate;
        public DateTime firstCaptureDate;
        public DateTime lastCaptureDate;
        
        public override string ToString()
        {
            return $"Seen: {totalSpiritsSeen}, Discovered: {totalSpiritsDiscovered}, " +
                   $"Captured: {totalSpiritsCaptured}, Completion: {completionPercentage:F1}%";
        }
    }
}