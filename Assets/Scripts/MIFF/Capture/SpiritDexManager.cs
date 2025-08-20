using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Capture
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
        public DateTime firstCaptureDate;
        public DateTime lastCaptureDate;
        
        [Header("SpiritDex Features")]
        public bool enableAutoDiscovery = true;
        public bool enableCaptureTracking = true;
        public bool enableDiscoveryTracking = true;
        public bool enableStatistics = true;
        
        [Header("Remix Hooks")]
        public bool enableCustomEntries = true;
        public bool enableCustomCategories = true;
        public bool enableCustomFilters = true;
        
        // Events for remixers to hook into
        public event Action<SpiritDexManager, string> OnSpiritDiscovered;
        public event Action<SpiritDexManager, string> OnSpiritCaptured;
        public event Action<SpiritDexManager, string> OnSpiritSeen;
        public event Action<SpiritDexManager, SpiritDexEntry> OnEntryUpdated;
        public event Action<SpiritDexManager> OnSpiritDexUpdated;
        
        public SpiritDexManager()
        {
            InitializeSpiritDex();
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
            
            firstCaptureDate = DateTime.MinValue;
            lastCaptureDate = DateTime.MinValue;
        }
        
        /// <summary>
        /// Register a spirit as discovered
        /// </summary>
        public bool RegisterDiscovery(string spiritID, string spiritName = "", SpiritRarity rarity = SpiritRarity.Common)
        {
            if (string.IsNullOrEmpty(spiritID)) return false;
            
            try
            {
                // Check if already discovered
                if (discoveredSpiritIDs.Contains(spiritID))
                {
                    return false; // Already discovered
                }
                
                // Add to discovered set
                discoveredSpiritIDs.Add(spiritID);
                
                // Create or update entry
                if (!spiritEntries.ContainsKey(spiritID))
                {
                    spiritEntries[spiritID] = new SpiritDexEntry
                    {
                        spiritID = spiritID,
                        spiritName = spiritName,
                        rarity = rarity,
                        firstSeenDate = DateTime.Now,
                        discoveryDate = DateTime.Now
                    };
                }
                else
                {
                    var entry = spiritEntries[spiritID];
                    entry.discoveryDate = DateTime.Now;
                    entry.isDiscovered = true;
                }
                
                // Update statistics
                if (enableStatistics)
                {
                    totalSpiritsDiscovered++;
                }
                
                // Trigger event
                OnSpiritDiscovered?.Invoke(this, spiritID);
                
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
        public bool RegisterCapture(string spiritID, string spiritName = "", SpiritRarity rarity = SpiritRarity.Common)
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
                    RegisterDiscovery(spiritID, spiritName, rarity);
                }
                
                // Update entry
                if (spiritEntries.ContainsKey(spiritID))
                {
                    var entry = spiritEntries[spiritID];
                    entry.isCaptured = true;
                    entry.captureDate = DateTime.Now;
                    entry.captureCount++;
                    
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
        public bool RegisterSighting(string spiritID, string spiritName = "", SpiritRarity rarity = SpiritRarity.Common)
        {
            if (string.IsNullOrEmpty(spiritID)) return false;
            
            try
            {
                // Create or update entry
                if (!spiritEntries.ContainsKey(spiritID))
                {
                    spiritEntries[spiritID] = new SpiritDexEntry
                    {
                        spiritID = spiritID,
                        spiritName = spiritName,
                        rarity = rarity,
                        firstSeenDate = DateTime.Now,
                        sightingCount = 1
                    };
                }
                else
                {
                    var entry = spiritEntries[spiritID];
                    entry.sightingCount++;
                    entry.lastSeenDate = DateTime.Now;
                }
                
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
        public List<SpiritDexEntry> GetAllEntries()
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
        /// Get entries by rarity
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByRarity(SpiritRarity rarity)
        {
            return spiritEntries.Values.Where(e => e.rarity == rarity).ToList();
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
            if (filter == null) return GetAllEntries();
            
            var query = spiritEntries.Values.AsQueryable();
            
            if (filter.discovered.HasValue)
                query = query.Where(e => e.isDiscovered == filter.discovered.Value);
            
            if (filter.captured.HasValue)
                query = query.Where(e => e.isCaptured == filter.captured.Value);
            
            if (filter.rarity.HasValue)
                query = query.Where(e => e.rarity == filter.rarity.Value);
            
            if (filter.minSightings > 0)
                query = query.Where(e => e.sightingCount >= filter.minSightings);
            
            if (filter.minCaptures > 0)
                query = query.Where(e => e.captureCount >= filter.minCaptures);
            
            return query.ToList();
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
            var entries = GetAllEntries();
            
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
    
    /// <summary>
    /// Filter for SpiritDex queries
    /// </summary>
    [Serializable]
    public class SpiritDexFilter
    {
        public bool? discovered;
        public bool? captured;
        public SpiritRarity? rarity;
        public int minSightings;
        public int minCaptures;
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
        public DateTime firstCaptureDate;
        public DateTime lastCaptureDate;
        
        public override string ToString()
        {
            return $"Seen: {totalSpiritsSeen}, Discovered: {totalSpiritsDiscovered}, " +
                   $"Captured: {totalSpiritsCaptured}, Completion: {completionPercentage:F1}%";
        }
    }
}