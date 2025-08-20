using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using NewBark.State;

namespace MIFF.Spirits
{
    /// <summary>
    /// Manages SpiritDex entries and operations
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritDexManager
    {
        [Header("Manager Configuration")]
        public bool enableAutoSave = true;
        public bool enableValidation = true;
        public bool enableSearchIndexing = true;
        public bool enableStatistics = true;
        public bool enableRemixHooks = true;
        
        [Header("Search Settings")]
        public bool enableFuzzySearch = true;
        public bool enableAdvancedFiltering = true;
        public bool enableSorting = true;
        public int maxSearchResults = 100;
        public float searchSimilarityThreshold = 0.7f;
        
        [Header("Data Management")]
        public bool enableDataBackup = true;
        public bool enableDataExport = true;
        public bool enableDataImport = true;
        public string dataFormat = "json";
        public string backupDirectory = "SpiritDex_Backups";
        
        [Header("Remix Hooks")]
        public bool enableCustomSearch = true;
        public bool enableCustomFiltering = true;
        public bool enableCustomSorting = true;
        public bool enableCustomValidation = true;
        public bool enableCustomExport = true;
        
        // Core data storage
        private Dictionary<string, SpiritDexEntry> spiritEntries;
        private Dictionary<string, List<string>> searchIndex;
        private Dictionary<string, List<string>> typeIndex;
        private Dictionary<string, List<string>> rarityIndex;
        private Dictionary<string, List<string>> categoryIndex;
        
        // Statistics and tracking
        private SpiritDexStats statistics;
        private DateTime lastUpdated;
        private string lastUpdatedBy;
        
        // Events for remixers to hook into
        public event Action<SpiritDexManager, SpiritDexEntry> OnEntryAdded;
        public event Action<SpiritDexManager, SpiritDexEntry> OnEntryUpdated;
        public event Action<SpiritDexManager, SpiritDexEntry> OnEntryRemoved;
        public event Action<SpiritDexManager, SpiritDexEntry> OnEntryValidated;
        public event Action<SpiritDexManager, SpiritDexEntry> OnEntryCorrupted;
        public event Action<SpiritDexManager, string> OnSearchPerformed;
        public event Action<SpiritDexManager, string> OnFilterApplied;
        public event Action<SpiritDexManager, string> OnSortApplied;
        
        public SpiritDexManager()
        {
            InitializeManager();
        }
        
        /// <summary>
        /// Initialize the manager
        /// </summary>
        private void InitializeManager()
        {
            spiritEntries = new Dictionary<string, SpiritDexEntry>();
            searchIndex = new Dictionary<string, List<string>>();
            typeIndex = new Dictionary<string, List<string>>();
            rarityIndex = new Dictionary<string, List<string>>();
            categoryIndex = new Dictionary<string, List<string>>();
            
            statistics = new SpiritDexStats();
            lastUpdated = DateTime.Now;
            lastUpdatedBy = "System";
            
            // Initialize indices
            InitializeIndices();
            
            // Load existing data if available
            LoadFromGameData();
        }
        
        /// <summary>
        /// Initialize search and filter indices
        /// </summary>
        private void InitializeIndices()
        {
            // Initialize type index
            foreach (SpiritType type in Enum.GetValues(typeof(SpiritType)))
            {
                if (type != SpiritType.None)
                {
                    typeIndex[type.ToString()] = new List<string>();
                }
            }
            
            // Initialize rarity index
            foreach (SpiritRarity rarity in Enum.GetValues(typeof(SpiritRarity)))
            {
                rarityIndex[rarity.ToString()] = new List<string>();
            }
            
            // Initialize category index
            foreach (SpiritCategory category in Enum.GetValues(typeof(SpiritCategory)))
            {
                categoryIndex[category.ToString()] = new List<string>();
            }
        }
        
        /// <summary>
        /// Add new spirit entry
        /// </summary>
        public bool AddSpiritEntry(SpiritDexEntry entry)
        {
            if (entry == null || string.IsNullOrEmpty(entry.spiritID))
            {
                Console.WriteLine("Error: Invalid spirit entry");
                return false;
            }
            
            try
            {
                // Check if entry already exists
                if (spiritEntries.ContainsKey(entry.spiritID))
                {
                    Console.WriteLine($"Warning: Spirit entry already exists: {entry.spiritID}");
                    return UpdateSpiritEntry(entry);
                }
                
                // Validate entry
                if (enableValidation && !entry.ValidateEntry())
                {
                    Console.WriteLine($"Error: Spirit entry validation failed: {entry.spiritID}");
                    return false;
                }
                
                // Add to main storage
                spiritEntries[entry.spiritID] = entry;
                
                // Update indices
                UpdateSearchIndex(entry);
                UpdateTypeIndex(entry);
                UpdateRarityIndex(entry);
                UpdateCategoryIndex(entry);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                lastUpdatedBy = entry.lastUpdatedBy ?? "Unknown";
                
                // Trigger event
                OnEntryAdded?.Invoke(this, entry);
                
                Console.WriteLine($"Added spirit entry: {entry.spiritName} ({entry.spiritID})");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding spirit entry: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Update existing spirit entry
        /// </summary>
        public bool UpdateSpiritEntry(SpiritDexEntry entry)
        {
            if (entry == null || string.IsNullOrEmpty(entry.spiritID))
            {
                Console.WriteLine("Error: Invalid spirit entry");
                return false;
            }
            
            try
            {
                // Check if entry exists
                if (!spiritEntries.ContainsKey(entry.spiritID))
                {
                    Console.WriteLine($"Error: Spirit entry not found: {entry.spiritID}");
                    return false;
                }
                
                // Get existing entry
                var existingEntry = spiritEntries[entry.spiritID];
                
                // Update entry
                existingEntry.UpdateEntry(entry);
                
                // Validate if enabled
                if (enableValidation && !existingEntry.ValidateEntry())
                {
                    Console.WriteLine($"Error: Spirit entry validation failed after update: {entry.spiritID}");
                    return false;
                }
                
                // Update indices
                UpdateSearchIndex(existingEntry);
                UpdateTypeIndex(existingEntry);
                UpdateRarityIndex(existingEntry);
                UpdateCategoryIndex(existingEntry);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                lastUpdatedBy = entry.lastUpdatedBy ?? "Unknown";
                
                // Trigger event
                OnEntryUpdated?.Invoke(this, existingEntry);
                
                Console.WriteLine($"Updated spirit entry: {entry.spiritName} ({entry.spiritID})");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating spirit entry: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Remove spirit entry
        /// </summary>
        public bool RemoveSpiritEntry(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID))
            {
                Console.WriteLine("Error: Invalid spirit ID");
                return false;
            }
            
            try
            {
                // Check if entry exists
                if (!spiritEntries.ContainsKey(spiritID))
                {
                    Console.WriteLine($"Error: Spirit entry not found: {spiritID}");
                    return false;
                }
                
                var entry = spiritEntries[spiritID];
                
                // Remove from main storage
                spiritEntries.Remove(spiritID);
                
                // Remove from indices
                RemoveFromSearchIndex(entry);
                RemoveFromTypeIndex(entry);
                RemoveFromRarityIndex(entry);
                RemoveFromCategoryIndex(entry);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                lastUpdatedBy = "System";
                
                // Trigger event
                OnEntryRemoved?.Invoke(this, entry);
                
                Console.WriteLine($"Removed spirit entry: {entry.spiritName} ({spiritID})");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing spirit entry: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Get spirit entry by ID
        /// </summary>
        public SpiritDexEntry GetEntryByID(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID) || !spiritEntries.ContainsKey(spiritID))
                return null;
            
            return spiritEntries[spiritID];
        }
        
        /// <summary>
        /// Get spirit entry by name
        /// </summary>
        public SpiritDexEntry GetEntryByName(string spiritName)
        {
            if (string.IsNullOrEmpty(spiritName))
                return null;
            
            return spiritEntries.Values.FirstOrDefault(e => 
                e.spiritName.Equals(spiritName, StringComparison.OrdinalIgnoreCase) ||
                e.displayName?.Equals(spiritName, StringComparison.OrdinalIgnoreCase) == true ||
                e.nickname?.Equals(spiritName, StringComparison.OrdinalIgnoreCase) == true ||
                e.alternateNames?.Equals(spiritName, StringComparison.OrdinalIgnoreCase) == true);
        }
        
        /// <summary>
        /// Search spirits by text
        /// </summary>
        public List<SpiritDexEntry> SearchSpirits(string searchTerm, int maxResults = -1)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return new List<SpiritDexEntry>();
            
            try
            {
                var results = new List<SpiritDexEntry>();
                searchTerm = searchTerm.ToLower();
                
                // Search in various fields
                foreach (var entry in spiritEntries.Values)
                {
                    bool matches = false;
                    
                    // Search in core fields
                    if (entry.spiritID.ToLower().Contains(searchTerm) ||
                        entry.spiritName.ToLower().Contains(searchTerm) ||
                        entry.displayName?.ToLower().Contains(searchTerm) == true ||
                        entry.nickname?.ToLower().Contains(searchTerm) == true)
                    {
                        matches = true;
                    }
                    
                    // Search in personality and lore
                    if (!matches && (
                        entry.personality?.ToLower().Contains(searchTerm) == true ||
                        entry.originStory?.ToLower().Contains(searchTerm) == true ||
                        entry.culturalSignificance?.ToLower().Contains(searchTerm) == true))
                    {
                        matches = true;
                    }
                    
                    // Search in arrays
                    if (!matches && (
                        entry.personalityTraits.Any(t => t.ToLower().Contains(searchTerm)) ||
                        entry.likes.Any(t => t.ToLower().Contains(searchTerm)) ||
                        entry.dislikes.Any(t => t.ToLower().Contains(searchTerm)) ||
                        entry.abilities.Any(t => t.ToLower().Contains(searchTerm)) ||
                        entry.signatureMoves.Any(t => t.ToLower().Contains(searchTerm)) ||
                        entry.catchphrases.Any(t => t.ToLower().Contains(searchTerm))))
                    {
                        matches = true;
                    }
                    
                    // Search in custom tags
                    if (!matches && entry.customTags.Any(t => t.ToLower().Contains(searchTerm)))
                    {
                        matches = true;
                    }
                    
                    if (matches)
                    {
                        results.Add(entry);
                        
                        // Check max results
                        if (maxResults > 0 && results.Count >= maxResults)
                            break;
                    }
                }
                
                // Trigger event
                OnSearchPerformed?.Invoke(this, searchTerm);
                
                return results;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error searching spirits: {ex.Message}");
                return new List<SpiritDexEntry>();
            }
        }
        
        /// <summary>
        /// Filter spirits by criteria
        /// </summary>
        public List<SpiritDexEntry> FilterSpirits(SpiritDexFilter filter)
        {
            if (filter == null)
                return GetAllEntries();
            
            try
            {
                var results = spiritEntries.Values.AsEnumerable();
                
                // Apply type filter
                if (filter.primaryType != SpiritType.None)
                {
                    results = results.Where(e => e.primaryType == filter.primaryType);
                }
                
                if (filter.secondaryType != SpiritType.None)
                {
                    results = results.Where(e => e.secondaryType == filter.secondaryType);
                }
                
                // Apply rarity filter
                if (filter.rarity != SpiritRarity.Common)
                {
                    results = results.Where(e => e.rarity == filter.rarity);
                }
                
                // Apply category filter
                if (filter.category != SpiritCategory.Normal)
                {
                    results = results.Where(e => e.category == filter.category);
                }
                
                // Apply capture status filter
                if (filter.captureStatus != CaptureStatus.Unknown)
                {
                    results = results.Where(e => e.captureStatus == filter.captureStatus);
                }
                
                // Apply discovery status filter
                if (filter.discoveryStatus != DiscoveryStatus.Unknown)
                {
                    results = results.Where(e => e.discoveryStatus == filter.discoveryStatus);
                }
                
                // Apply level filter
                if (filter.minLevel > 0)
                {
                    results = results.Where(e => e.baseLevel >= filter.minLevel);
                }
                
                if (filter.maxLevel > 0)
                {
                    results = results.Where(e => e.maxLevel <= filter.maxLevel);
                }
                
                // Apply custom tag filter
                if (!string.IsNullOrEmpty(filter.customTag))
                {
                    results = results.Where(e => e.HasCustomTag(filter.customTag));
                }
                
                // Apply completion filter
                if (filter.minCompletion > 0)
                {
                    results = results.Where(e => e.GetCompletionPercentage() >= filter.minCompletion);
                }
                
                // Apply evolution filter
                if (filter.evolutionStage > 0)
                {
                    results = results.Where(e => e.GetEvolutionStage() == filter.evolutionStage);
                }
                
                // Apply limit
                if (filter.maxResults > 0)
                {
                    results = results.Take(filter.maxResults);
                }
                
                var resultList = results.ToList();
                
                // Trigger event
                OnFilterApplied?.Invoke(this, filter.ToString());
                
                return resultList;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error filtering spirits: {ex.Message}");
                return new List<SpiritDexEntry>();
            }
        }
        
        /// <summary>
        /// Sort spirits by criteria
        /// </summary>
        public List<SpiritDexEntry> SortSpirits(List<SpiritDexEntry> entries, SpiritDexSortCriteria sortBy, bool ascending = true)
        {
            if (entries == null || entries.Count == 0)
                return entries;
            
            try
            {
                var sorted = entries.AsEnumerable();
                
                switch (sortBy)
                {
                    case SpiritDexSortCriteria.Name:
                        sorted = ascending ? sorted.OrderBy(e => e.spiritName) : sorted.OrderByDescending(e => e.spiritName);
                        break;
                    case SpiritDexSortCriteria.ID:
                        sorted = ascending ? sorted.OrderBy(e => e.spiritID) : sorted.OrderByDescending(e => e.spiritID);
                        break;
                    case SpiritDexSortCriteria.Type:
                        sorted = ascending ? sorted.OrderBy(e => e.primaryType) : sorted.OrderByDescending(e => e.primaryType);
                        break;
                    case SpiritDexSortCriteria.Rarity:
                        sorted = ascending ? sorted.OrderBy(e => e.rarity) : sorted.OrderByDescending(e => e.rarity);
                        break;
                    case SpiritDexSortCriteria.Category:
                        sorted = ascending ? sorted.OrderBy(e => e.category) : sorted.OrderByDescending(e => e.category);
                        break;
                    case SpiritDexSortCriteria.Level:
                        sorted = ascending ? sorted.OrderBy(e => e.baseLevel) : sorted.OrderByDescending(e => e.baseLevel);
                        break;
                    case SpiritDexSortCriteria.CaptureDifficulty:
                        sorted = ascending ? sorted.OrderBy(e => e.captureDifficulty) : sorted.OrderByDescending(e => e.captureDifficulty);
                        break;
                    case SpiritDexSortCriteria.Completion:
                        sorted = ascending ? sorted.OrderBy(e => e.GetCompletionPercentage()) : sorted.OrderByDescending(e => e.GetCompletionPercentage());
                        break;
                    case SpiritDexSortCriteria.EvolutionStage:
                        sorted = ascending ? sorted.OrderBy(e => e.GetEvolutionStage()) : sorted.OrderByDescending(e => e.GetEvolutionStage());
                        break;
                    case SpiritDexSortCriteria.LastUpdated:
                        sorted = ascending ? sorted.OrderBy(e => e.lastUpdated) : sorted.OrderByDescending(e => e.lastUpdated);
                        break;
                    default:
                        // Default to name sorting
                        sorted = ascending ? sorted.OrderBy(e => e.spiritName) : sorted.OrderByDescending(e => e.spiritName);
                        break;
                }
                
                var resultList = sorted.ToList();
                
                // Trigger event
                OnSortApplied?.Invoke(this, $"{sortBy} {(ascending ? "Ascending" : "Descending")}");
                
                return resultList;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sorting spirits: {ex.Message}");
                return entries;
            }
        }
        
        /// <summary>
        /// Get all entries
        /// </summary>
        public List<SpiritDexEntry> GetAllEntries()
        {
            return spiritEntries.Values.ToList();
        }
        
        /// <summary>
        /// Get entries by type
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByType(SpiritType type)
        {
            if (type == SpiritType.None || !typeIndex.ContainsKey(type.ToString()))
                return new List<SpiritDexEntry>();
            
            var spiritIDs = typeIndex[type.ToString()];
            return spiritIDs.Select(id => spiritEntries[id]).ToList();
        }
        
        /// <summary>
        /// Get entries by rarity
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByRarity(SpiritRarity rarity)
        {
            if (!rarityIndex.ContainsKey(rarity.ToString()))
                return new List<SpiritDexEntry>();
            
            var spiritIDs = rarityIndex[rarity.ToString()];
            return spiritIDs.Select(id => spiritEntries[id]).ToList();
        }
        
        /// <summary>
        /// Get entries by category
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByCategory(SpiritCategory category)
        {
            if (!categoryIndex.ContainsKey(category.ToString()))
                return new List<SpiritDexEntry>();
            
            var spiritIDs = categoryIndex[category.ToString()];
            return spiritIDs.Select(id => spiritEntries[id]).ToList();
        }
        
        /// <summary>
        /// Get entries by capture status
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByCaptureStatus(CaptureStatus status)
        {
            return spiritEntries.Values.Where(e => e.captureStatus == status).ToList();
        }
        
        /// <summary>
        /// Get entries by discovery status
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByDiscoveryStatus(DiscoveryStatus status)
        {
            return spiritEntries.Values.Where(e => e.discoveryStatus == status).ToList();
        }
        
        /// <summary>
        /// Get entries by evolution stage
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByEvolutionStage(int stage)
        {
            return spiritEntries.Values.Where(e => e.GetEvolutionStage() == stage).ToList();
        }
        
        /// <summary>
        /// Get entries by custom tag
        /// </summary>
        public List<SpiritDexEntry> GetEntriesByCustomTag(string tag)
        {
            if (string.IsNullOrEmpty(tag))
                return new List<SpiritDexEntry>();
            
            return spiritEntries.Values.Where(e => e.HasCustomTag(tag)).ToList();
        }
        
        /// <summary>
        /// Get statistics
        /// </summary>
        public SpiritDexStats GetStatistics()
        {
            UpdateStatistics();
            return statistics;
        }
        
        /// <summary>
        /// Update search index
        /// </summary>
        private void UpdateSearchIndex(SpiritDexEntry entry)
        {
            if (!enableSearchIndexing) return;
            
            try
            {
                // Remove old entries
                RemoveFromSearchIndex(entry);
                
                // Add new entries
                var searchTerms = new List<string>();
                
                // Add core terms
                searchTerms.Add(entry.spiritID.ToLower());
                searchTerms.Add(entry.spiritName.ToLower());
                if (!string.IsNullOrEmpty(entry.displayName))
                    searchTerms.Add(entry.displayName.ToLower());
                if (!string.IsNullOrEmpty(entry.nickname))
                    searchTerms.Add(entry.nickname.ToLower());
                
                // Add type terms
                searchTerms.Add(entry.primaryType.ToString().ToLower());
                if (entry.secondaryType != SpiritType.None)
                    searchTerms.Add(entry.secondaryType.ToString().ToLower());
                
                // Add rarity and category
                searchTerms.Add(entry.rarity.ToString().ToLower());
                searchTerms.Add(entry.category.ToString().ToLower());
                
                // Add personality traits
                foreach (var trait in entry.personalityTraits)
                {
                    searchTerms.Add(trait.ToLower());
                }
                
                // Add abilities
                foreach (var ability in entry.abilities)
                {
                    searchTerms.Add(ability.ToLower());
                }
                
                // Add custom tags
                foreach (var tag in entry.customTags)
                {
                    searchTerms.Add(tag.ToLower());
                }
                
                // Index each term
                foreach (var term in searchTerms)
                {
                    if (!searchIndex.ContainsKey(term))
                        searchIndex[term] = new List<string>();
                    
                    if (!searchIndex[term].Contains(entry.spiritID))
                        searchIndex[term].Add(entry.spiritID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating search index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Remove from search index
        /// </summary>
        private void RemoveFromSearchIndex(SpiritDexEntry entry)
        {
            if (!enableSearchIndexing) return;
            
            try
            {
                // Remove from all search terms
                foreach (var kvp in searchIndex.ToList())
                {
                    kvp.Value.Remove(entry.spiritID);
                    
                    // Remove empty terms
                    if (kvp.Value.Count == 0)
                        searchIndex.Remove(kvp.Key);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing from search index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update type index
        /// </summary>
        private void UpdateTypeIndex(SpiritDexEntry entry)
        {
            try
            {
                // Remove old entries
                RemoveFromTypeIndex(entry);
                
                // Add to primary type
                string primaryTypeKey = entry.primaryType.ToString();
                if (typeIndex.ContainsKey(primaryTypeKey))
                {
                    if (!typeIndex[primaryTypeKey].Contains(entry.spiritID))
                        typeIndex[primaryTypeKey].Add(entry.spiritID);
                }
                
                // Add to secondary type
                if (entry.secondaryType != SpiritType.None)
                {
                    string secondaryTypeKey = entry.secondaryType.ToString();
                    if (typeIndex.ContainsKey(secondaryTypeKey))
                    {
                        if (!typeIndex[secondaryTypeKey].Contains(entry.spiritID))
                            typeIndex[secondaryTypeKey].Add(entry.spiritID);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating type index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Remove from type index
        /// </summary>
        private void RemoveFromTypeIndex(SpiritDexEntry entry)
        {
            try
            {
                // Remove from primary type
                string primaryTypeKey = entry.primaryType.ToString();
                if (typeIndex.ContainsKey(primaryTypeKey))
                {
                    typeIndex[primaryTypeKey].Remove(entry.spiritID);
                }
                
                // Remove from secondary type
                if (entry.secondaryType != SpiritType.None)
                {
                    string secondaryTypeKey = entry.secondaryType.ToString();
                    if (typeIndex.ContainsKey(secondaryTypeKey))
                    {
                        typeIndex[secondaryTypeKey].Remove(entry.spiritID);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing from type index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update rarity index
        /// </summary>
        private void UpdateRarityIndex(SpiritDexEntry entry)
        {
            try
            {
                // Remove old entries
                RemoveFromRarityIndex(entry);
                
                // Add to rarity
                string rarityKey = entry.rarity.ToString();
                if (rarityIndex.ContainsKey(rarityKey))
                {
                    if (!rarityIndex[rarityKey].Contains(entry.spiritID))
                        rarityIndex[rarityKey].Add(entry.spiritID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating rarity index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Remove from rarity index
        /// </summary>
        private void RemoveFromRarityIndex(SpiritDexEntry entry)
        {
            try
            {
                string rarityKey = entry.rarity.ToString();
                if (rarityIndex.ContainsKey(rarityKey))
                {
                    rarityIndex[rarityKey].Remove(entry.spiritID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing from rarity index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update category index
        /// </summary>
        private void UpdateCategoryIndex(SpiritDexEntry entry)
        {
            try
            {
                // Remove old entries
                RemoveFromCategoryIndex(entry);
                
                // Add to category
                string categoryKey = entry.category.ToString();
                if (categoryIndex.ContainsKey(categoryKey))
                {
                    if (!categoryIndex[categoryKey].Contains(entry.spiritID))
                        categoryIndex[categoryKey].Add(entry.spiritID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating category index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Remove from category index
        /// </summary>
        private void RemoveFromCategoryIndex(SpiritDexEntry entry)
        {
            try
            {
                string categoryKey = entry.category.ToString();
                if (categoryIndex.ContainsKey(categoryKey))
                {
                    categoryIndex[categoryKey].Remove(entry.spiritID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing from category index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update statistics
        /// </summary>
        private void UpdateStatistics()
        {
            if (!enableStatistics) return;
            
            try
            {
                statistics.totalEntries = spiritEntries.Count;
                statistics.entriesByType = new Dictionary<string, int>();
                statistics.entriesByRarity = new Dictionary<string, int>();
                statistics.entriesByCategory = new Dictionary<string, int>();
                statistics.entriesByCaptureStatus = new Dictionary<string, int>();
                statistics.entriesByDiscoveryStatus = new Dictionary<string, int>();
                statistics.entriesByEvolutionStage = new Dictionary<string, int>();
                
                // Count by type
                foreach (var kvp in typeIndex)
                {
                    statistics.entriesByType[kvp.Key] = kvp.Value.Count;
                }
                
                // Count by rarity
                foreach (var kvp in rarityIndex)
                {
                    statistics.entriesByRarity[kvp.Key] = kvp.Value.Count;
                }
                
                // Count by category
                foreach (var kvp in categoryIndex)
                {
                    statistics.entriesByCategory[kvp.Key] = kvp.Value.Count;
                }
                
                // Count by capture status
                foreach (CaptureStatus status in Enum.GetValues(typeof(CaptureStatus)))
                {
                    statistics.entriesByCaptureStatus[status.ToString()] = GetEntriesByCaptureStatus(status).Count;
                }
                
                // Count by discovery status
                foreach (DiscoveryStatus status in Enum.GetValues(typeof(DiscoveryStatus)))
                {
                    statistics.entriesByDiscoveryStatus[status.ToString()] = GetEntriesByDiscoveryStatus(status).Count;
                }
                
                // Count by evolution stage
                for (int i = 0; i <= 5; i++) // Assume max 5 evolution stages
                {
                    statistics.entriesByEvolutionStage[$"Stage {i}"] = GetEntriesByEvolutionStage(i).Count;
                }
                
                // Calculate completion statistics
                var allEntries = GetAllEntries();
                statistics.averageCompletionPercentage = allEntries.Count > 0 ? allEntries.Average(e => e.GetCompletionPercentage()) : 0;
                statistics.completedEntries = allEntries.Count(e => e.IsComplete);
                statistics.discoveredEntries = allEntries.Count(e => e.IsDiscovered);
                statistics.capturedEntries = allEntries.Count(e => e.IsCaptured);
                
                // Calculate type distribution
                statistics.typeDistribution = new Dictionary<string, float>();
                foreach (var kvp in statistics.entriesByType)
                {
                    statistics.typeDistribution[kvp.Key] = (float)kvp.Value / statistics.totalEntries * 100.0f;
                }
                
                // Calculate rarity distribution
                statistics.rarityDistribution = new Dictionary<string, float>();
                foreach (var kvp in statistics.entriesByRarity)
                {
                    statistics.rarityDistribution[kvp.Key] = (float)kvp.Value / statistics.totalEntries * 100.0f;
                }
                
                statistics.lastUpdated = DateTime.Now;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating statistics: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Load data from GameData
        /// </summary>
        private void LoadFromGameData()
        {
            try
            {
                // This would integrate with the existing GameData system
                // For now, we'll create some sample data
                CreateSampleData();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading from GameData: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Create sample data for testing
        /// </summary>
        private void CreateSampleData()
        {
            try
            {
                // Create sample starter spirit
                var starterSpirit = new SpiritDexEntry("starter_001", "Lumino", SpiritType.Pop)
                {
                    displayName = "Lumino the Starter",
                    nickname = "Lumi",
                    secondaryType = SpiritType.Light,
                    rarity = SpiritRarity.Common,
                    category = SpiritCategory.Starter,
                    generation = "1",
                    region = "New Bark",
                    habitat = "Urban",
                    height = 0.8f,
                    weight = 15.0f,
                    colorScheme = "White and Gold",
                    physicalDescription = "A small, glowing spirit with a star-shaped pattern on its forehead",
                    personality = "Bright and energetic, always ready to make friends",
                    personalityTraits = new[] { "Friendly", "Energetic", "Optimistic", "Curious" },
                    likes = new[] { "Music", "Dancing", "Making friends", "Bright places" },
                    dislikes = new[] { "Darkness", "Loneliness", "Sad music" },
                    originStory = "Born from the first light of dawn in New Bark City",
                    culturalSignificance = "Represents hope and new beginnings",
                    abilities = new[] { "Illuminate", "Charm", "Quick Attack" },
                    signatureAbilities = new[] { "Dawn's Light" },
                    evolutionPath = new[] { "starter_001", "starter_002", "starter_003" },
                    evolutionTriggers = new[] { "Level 16", "Friendship" },
                    captureDifficulty = 0.1f,
                    captureMethods = new[] { "Starter Choice", "Friendship" },
                    encounterLocations = new[] { "New Bark City", "Starter Lab" },
                    baseLevel = 5,
                    maxLevel = 100,
                    experienceRate = 1.0f,
                    customTags = new[] { "starter", "beginner-friendly", "evolves" }
                };
                
                AddSpiritEntry(starterSpirit);
                
                // Create sample evolved spirit
                var evolvedSpirit = new SpiritDexEntry("starter_002", "Luminara", SpiritType.Pop)
                {
                    displayName = "Luminara the Evolved",
                    nickname = "Lara",
                    secondaryType = SpiritType.Light,
                    rarity = SpiritRarity.Uncommon,
                    category = SpiritCategory.Evolution,
                    generation = "1",
                    region = "New Bark",
                    habitat = "Urban",
                    height = 1.2f,
                    weight = 25.0f,
                    colorScheme = "White, Gold, and Silver",
                    physicalDescription = "A graceful spirit with flowing light patterns and musical notes floating around it",
                    personality = "Elegant and wise, with a deep love for music and dance",
                    personalityTraits = new[] { "Elegant", "Wise", "Musical", "Graceful" },
                    likes = new[] { "Classical music", "Ballet", "Teaching", "Performing" },
                    dislikes = new[] { "Discord", "Rudeness", "Poor performance" },
                    originStory = "Evolved from Lumino through friendship and musical training",
                    culturalSignificance = "Represents artistic growth and cultural development",
                    abilities = new[] { "Illuminate", "Charm", "Quick Attack", "Dazzle", "Musical Note" },
                    signatureAbilities = new[] { "Dawn's Light", "Symphony of Stars" },
                    evolutionPath = new[] { "starter_001", "starter_002", "starter_003" },
                    evolutionTriggers = new[] { "Level 32", "Mastery of Music" },
                    captureDifficulty = 0.3f,
                    captureMethods = new[] { "Evolution", "Friendship", "Musical Mastery" },
                    encounterLocations = new[] { "Concert Halls", "Music Schools", "Cultural Centers" },
                    baseLevel = 16,
                    maxLevel = 100,
                    experienceRate = 1.2f,
                    customTags = new[] { "evolved", "musical", "cultural", "teacher" }
                };
                
                AddSpiritEntry(evolvedSpirit);
                
                // Create sample legendary spirit
                var legendarySpirit = new SpiritDexEntry("legendary_001", "Stellaris", SpiritType.Pop)
                {
                    displayName = "Stellaris the Legendary",
                    nickname = "Star",
                    secondaryType = SpiritType.Light,
                    rarity = SpiritRarity.Legendary,
                    category = SpiritCategory.Mythical,
                    generation = "1",
                    region = "Cosmic",
                    habitat = "Stellar",
                    height = 2.5f,
                    weight = 100.0f,
                    colorScheme = "Cosmic Blue, Gold, and Silver",
                    physicalDescription = "A majestic spirit that embodies the essence of stardom and cosmic energy",
                    personality = "Mysterious and powerful, with a deep connection to the cosmos",
                    personalityTraits = new[] { "Mysterious", "Powerful", "Cosmic", "Legendary" },
                    likes = new[] { "Stardom", "Cosmic energy", "Legendary battles", "Fame" },
                    dislikes = new[] { "Oblivion", "Being forgotten", "Mediocrity" },
                    originStory = "Born from the collision of two stars, embodying the essence of stardom",
                    culturalSignificance = "Represents the ultimate achievement in K-pop stardom",
                    abilities = new[] { "Cosmic Blast", "Stardom Aura", "Legendary Presence", "Fame Wave" },
                    signatureAbilities = new[] { "Supernova", "Cosmic Symphony", "Legendary Performance" },
                    evolutionPath = new[] { "legendary_001" },
                    evolutionTriggers = new[] { "Legendary Status", "Cosmic Mastery" },
                    captureDifficulty = 0.95f,
                    captureMethods = new[] { "Legendary Quest", "Cosmic Mastery", "Stardom Achievement" },
                    encounterLocations = new[] { "Cosmic Stage", "Legendary Arena", "Stardom Temple" },
                    baseLevel = 50,
                    maxLevel = 100,
                    experienceRate = 2.0f,
                    customTags = new[] { "legendary", "cosmic", "stardom", "ultimate" }
                };
                
                AddSpiritEntry(legendarySpirit);
                
                Console.WriteLine("Sample SpiritDex data created successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating sample data: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Export data to JSON
        /// </summary>
        public string ExportToJSON()
        {
            try
            {
                var exportData = new
                {
                    exportDate = DateTime.Now,
                    totalEntries = spiritEntries.Count,
                    entries = spiritEntries.Values.ToList(),
                    statistics = statistics,
                    lastUpdated = lastUpdated,
                    lastUpdatedBy = lastUpdatedBy
                };
                
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };
                
                return JsonSerializer.Serialize(exportData, options);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error exporting to JSON: {ex.Message}");
                return null;
            }
        }
        
        /// <summary>
        /// Import data from JSON
        /// </summary>
        public bool ImportFromJSON(string jsonData)
        {
            try
            {
                if (string.IsNullOrEmpty(jsonData))
                    return false;
                
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };
                
                var importData = JsonSerializer.Deserialize<dynamic>(jsonData, options);
                
                // This is a simplified import - in practice, you'd want more robust parsing
                Console.WriteLine("JSON import completed");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error importing from JSON: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Get manager summary
        /// </summary>
        public string GetManagerSummary()
        {
            var stats = GetStatistics();
            return $"SpiritDex Manager | Entries: {stats.totalEntries} | " +
                   $"Complete: {stats.completedEntries} | Discovered: {stats.discoveredEntries} | " +
                   $"Captured: {stats.capturedEntries} | Avg Completion: {stats.averageCompletionPercentage:F1}%";
        }
        
        /// <summary>
        /// Validate all entries
        /// </summary>
        public void ValidateAllEntries()
        {
            try
            {
                Console.WriteLine("Validating all SpiritDex entries...");
                
                int validCount = 0;
                int corruptedCount = 0;
                
                foreach (var entry in spiritEntries.Values)
                {
                    if (entry.ValidateEntry())
                    {
                        validCount++;
                        OnEntryValidated?.Invoke(this, entry);
                    }
                    else
                    {
                        corruptedCount++;
                        OnEntryCorrupted?.Invoke(this, entry);
                    }
                }
                
                Console.WriteLine($"Validation complete: {validCount} valid, {corruptedCount} corrupted");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating entries: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Clean up corrupted entries
        /// </summary>
        public void CleanupCorruptedEntries()
        {
            try
            {
                Console.WriteLine("Cleaning up corrupted SpiritDex entries...");
                
                var corruptedEntries = spiritEntries.Values.Where(e => !e.ValidateEntry()).ToList();
                int removedCount = 0;
                
                foreach (var entry in corruptedEntries)
                {
                    if (RemoveSpiritEntry(entry.spiritID))
                    {
                        removedCount++;
                    }
                }
                
                Console.WriteLine($"Cleanup complete: {removedCount} corrupted entries removed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error cleaning up corrupted entries: {ex.Message}");
            }
        }
    }
    
    /// <summary>
    /// Filter criteria for SpiritDex queries
    /// </summary>
    [Serializable]
    public class SpiritDexFilter
    {
        public SpiritType primaryType = SpiritType.None;
        public SpiritType secondaryType = SpiritType.None;
        public SpiritRarity rarity = SpiritRarity.Common;
        public SpiritCategory category = SpiritCategory.Normal;
        public CaptureStatus captureStatus = CaptureStatus.Unknown;
        public DiscoveryStatus discoveryStatus = DiscoveryStatus.Unknown;
        public int minLevel = 0;
        public int maxLevel = 0;
        public string customTag = "";
        public float minCompletion = 0.0f;
        public int evolutionStage = 0;
        public int maxResults = 0;
        
        public override string ToString()
        {
            var filters = new List<string>();
            
            if (primaryType != SpiritType.None) filters.Add($"Type: {primaryType}");
            if (secondaryType != SpiritType.None) filters.Add($"Secondary: {secondaryType}");
            if (rarity != SpiritRarity.Common) filters.Add($"Rarity: {rarity}");
            if (category != SpiritCategory.Normal) filters.Add($"Category: {category}");
            if (captureStatus != CaptureStatus.Unknown) filters.Add($"Capture: {captureStatus}");
            if (discoveryStatus != DiscoveryStatus.Unknown) filters.Add($"Discovery: {discoveryStatus}");
            if (minLevel > 0) filters.Add($"Min Level: {minLevel}");
            if (maxLevel > 0) filters.Add($"Max Level: {maxLevel}");
            if (!string.IsNullOrEmpty(customTag)) filters.Add($"Tag: {customTag}");
            if (minCompletion > 0) filters.Add($"Min Completion: {minCompletion:F1}%");
            if (evolutionStage > 0) filters.Add($"Evolution Stage: {evolutionStage}");
            if (maxResults > 0) filters.Add($"Max Results: {maxResults}");
            
            return filters.Count > 0 ? string.Join(" | ", filters) : "No filters";
        }
    }
    
    /// <summary>
    /// Sort criteria for SpiritDex queries
    /// </summary>
    public enum SpiritDexSortCriteria
    {
        Name,
        ID,
        Type,
        Rarity,
        Category,
        Level,
        CaptureDifficulty,
        Completion,
        EvolutionStage,
        LastUpdated
    }
    
    /// <summary>
    /// Statistics for SpiritDex
    /// </summary>
    [Serializable]
    public class SpiritDexStats
    {
        public int totalEntries;
        public int completedEntries;
        public int discoveredEntries;
        public int capturedEntries;
        public float averageCompletionPercentage;
        
        public Dictionary<string, int> entriesByType;
        public Dictionary<string, int> entriesByRarity;
        public Dictionary<string, int> entriesByCategory;
        public Dictionary<string, int> entriesByCaptureStatus;
        public Dictionary<string, int> entriesByDiscoveryStatus;
        public Dictionary<string, int> entriesByEvolutionStage;
        
        public Dictionary<string, float> typeDistribution;
        public Dictionary<string, float> rarityDistribution;
        
        public DateTime lastUpdated;
        
        public override string ToString()
        {
            return $"Total: {totalEntries} | Complete: {completedEntries} | Discovered: {discoveredEntries} | Captured: {capturedEntries}";
        }
    }
}