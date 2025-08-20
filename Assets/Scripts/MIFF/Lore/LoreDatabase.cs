using UnityEngine;
using System.Collections.Generic;
using System.Linq;
using MIFF.Core;

namespace MIFF.Lore
{
    /// <summary>
    /// Central database for all lore entries in the game
    /// </summary>
    public class LoreDatabase : MonoBehaviour
    {
        [Header("Lore Entries")]
        [SerializeField] private List<LoreEntry_SO> allLoreEntries = new List<LoreEntry_SO>();
        
        [Header("Settings")]
        [SerializeField] private bool autoPopulateFromProject = true;
        [SerializeField] private bool validateOnStart = true;
        
        private Dictionary<string, LoreEntry_SO> loreLookup = new Dictionary<string, LoreEntry_SO>();
        private Dictionary<string, List<LoreEntry_SO>> categoryLookup = new Dictionary<string, List<LoreEntry_SO>>();
        private Dictionary<EmotionCoreType, List<LoreEntry_SO>> emotionCoreLookup = new Dictionary<EmotionCoreType, List<LoreEntry_SO>>();
        private Dictionary<GenreBiasType, List<LoreEntry_SO>> genreBiasLookup = new Dictionary<GenreBiasType, List<LoreEntry_SO>>();
        
        public static LoreDatabase Instance { get; private set; }
        
        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                BuildLoreLookups();
            }
            else
            {
                Destroy(gameObject);
            }
        }
        
        private void Start()
        {
            if (validateOnStart)
            {
                ValidateLoreDatabase();
            }
        }
        
        /// <summary>
        /// Build all lookup dictionaries
        /// </summary>
        private void BuildLoreLookups()
        {
            // Clear existing lookups
            loreLookup.Clear();
            categoryLookup.Clear();
            emotionCoreLookup.Clear();
            genreBiasLookup.Clear();
            
            // Build main lookup
            foreach (var entry in allLoreEntries)
            {
                if (entry == null) continue;
                
                // Main lookup by ID
                if (!string.IsNullOrEmpty(entry.EntryID))
                {
                    if (loreLookup.ContainsKey(entry.EntryID))
                    {
                        Debug.LogWarning($"Duplicate lore entry ID found: {entry.EntryID}");
                    }
                    else
                    {
                        loreLookup[entry.EntryID] = entry;
                    }
                }
                
                // Category lookup
                if (!string.IsNullOrEmpty(entry.Category))
                {
                    if (!categoryLookup.ContainsKey(entry.Category))
                    {
                        categoryLookup[entry.Category] = new List<LoreEntry_SO>();
                    }
                    categoryLookup[entry.Category].Add(entry);
                }
                
                // Emotion core lookup
                if (!emotionCoreLookup.ContainsKey(entry.EmotionCore))
                {
                    emotionCoreLookup[entry.EmotionCore] = new List<LoreEntry_SO>();
                }
                emotionCoreLookup[entry.EmotionCore].Add(entry);
                
                // Genre bias lookup
                if (!genreBiasLookup.ContainsKey(entry.GenreBias))
                {
                    genreBiasLookup[entry.GenreBias] = new List<LoreEntry_SO>();
                }
                genreBiasLookup[entry.GenreBias].Add(entry);
            }
            
            Debug.Log($"Built lore database with {loreLookup.Count} entries across {categoryLookup.Count} categories");
        }
        
        /// <summary>
        /// Get lore entry by ID
        /// </summary>
        public LoreEntry_SO GetByID(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            
            return loreLookup.ContainsKey(id) ? loreLookup[id] : null;
        }
        
        /// <summary>
        /// Get all lore entries
        /// </summary>
        public List<LoreEntry_SO> GetAllEntries()
        {
            return new List<LoreEntry_SO>(allLoreEntries);
        }
        
        /// <summary>
        /// Get unlocked lore entries based on game state
        /// </summary>
        public List<LoreEntry_SO> GetUnlockedEntries(GameData gameData)
        {
            if (gameData == null) return new List<LoreEntry_SO>();
            
            var unlockedEntries = new List<LoreEntry_SO>();
            
            foreach (var entry in allLoreEntries)
            {
                if (entry != null && entry.CheckUnlockCondition(gameData))
                {
                    unlockedEntries.Add(entry);
                }
            }
            
            // Sort by priority and then by title
            return unlockedEntries.OrderBy(e => e.Priority).ThenBy(e => e.Title).ToList();
        }
        
        /// <summary>
        /// Get locked lore entries based on game state
        /// </summary>
        public List<LoreEntry_SO> GetLockedEntries(GameData gameData)
        {
            if (gameData == null) return new List<LoreEntry_SO>();
            
            var lockedEntries = new List<LoreEntry_SO>();
            
            foreach (var entry in allLoreEntries)
            {
                if (entry != null && !entry.CheckUnlockCondition(gameData))
                {
                    lockedEntries.Add(entry);
                }
            }
            
            // Sort by priority and then by title
            return lockedEntries.OrderBy(e => e.Priority).ThenBy(e => e.Title).ToList();
        }
        
        /// <summary>
        /// Get entries by category
        /// </summary>
        public List<LoreEntry_SO> GetEntriesByCategory(string category)
        {
            if (string.IsNullOrEmpty(category)) return new List<LoreEntry_SO>();
            
            return categoryLookup.ContainsKey(category) ? 
                new List<LoreEntry_SO>(categoryLookup[category]) : 
                new List<LoreEntry_SO>();
        }
        
        /// <summary>
        /// Get entries by emotion core
        /// </summary>
        public List<LoreEntry_SO> GetEntriesByEmotionCore(EmotionCoreType emotionCore)
        {
            return emotionCoreLookup.ContainsKey(emotionCore) ? 
                new List<LoreEntry_SO>(emotionCoreLookup[emotionCore]) : 
                new List<LoreEntry_SO>();
        }
        
        /// <summary>
        /// Get entries by genre bias
        /// </summary>
        public List<LoreEntry_SO> GetEntriesByGenreBias(GenreBiasType genreBias)
        {
            return genreBiasLookup.ContainsKey(genreBias) ? 
                new List<LoreEntry_SO>(genreBiasLookup[genreBias]) : 
                new List<LoreEntry_SO>();
        }
        
        /// <summary>
        /// Get entries by tag
        /// </summary>
        public List<LoreEntry_SO> GetEntriesByTag(string tag)
        {
            if (string.IsNullOrEmpty(tag)) return new List<LoreEntry_SO>();
            
            var taggedEntries = new List<LoreEntry_SO>();
            
            foreach (var entry in allLoreEntries)
            {
                if (entry != null && entry.HasTag(tag))
                {
                    taggedEntries.Add(entry);
                }
            }
            
            return taggedEntries;
        }
        
        /// <summary>
        /// Get entries by unlock condition type
        /// </summary>
        public List<LoreEntry_SO> GetEntriesByUnlockCondition(UnlockConditionType unlockCondition)
        {
            var conditionEntries = new List<LoreEntry_SO>();
            
            foreach (var entry in allLoreEntries)
            {
                if (entry != null && entry.UnlockCondition == unlockCondition)
                {
                    conditionEntries.Add(entry);
                }
            }
            
            return conditionEntries;
        }
        
        /// <summary>
        /// Search entries by text
        /// </summary>
        public List<LoreEntry_SO> SearchEntries(string searchText)
        {
            if (string.IsNullOrEmpty(searchText)) return new List<LoreEntry_SO>();
            
            var searchResults = new List<LoreEntry_SO>();
            var lowerSearchText = searchText.ToLower();
            
            foreach (var entry in allLoreEntries)
            {
                if (entry == null) continue;
                
                // Search in title, description, category, and tags
                if (entry.Title.ToLower().Contains(lowerSearchText) ||
                    entry.Description.ToLower().Contains(lowerSearchText) ||
                    entry.Category.ToLower().Contains(lowerSearchText) ||
                    entry.GetTagsString().ToLower().Contains(lowerSearchText))
                {
                    searchResults.Add(entry);
                }
            }
            
            return searchResults;
        }
        
        /// <summary>
        /// Get all available categories
        /// </summary>
        public List<string> GetAllCategories()
        {
            return new List<string>(categoryLookup.Keys);
        }
        
        /// <summary>
        /// Get all available emotion cores
        /// </summary>
        public List<EmotionCoreType> GetAllEmotionCores()
        {
            return new List<EmotionCoreType>(emotionCoreLookup.Keys);
        }
        
        /// <summary>
        /// Get all available genre biases
        /// </summary>
        public List<GenreBiasType> GetAllGenreBiases()
        {
            return new List<GenreBiasType>(genreBiasLookup.Keys);
        }
        
        /// <summary>
        /// Add lore entry to database
        /// </summary>
        public void AddLoreEntry(LoreEntry_SO entry)
        {
            if (entry == null) return;
            
            if (!allLoreEntries.Contains(entry))
            {
                allLoreEntries.Add(entry);
                BuildLoreLookups();
                Debug.Log($"Added lore entry: {entry.Title}");
            }
        }
        
        /// <summary>
        /// Remove lore entry from database
        /// </summary>
        public void RemoveLoreEntry(LoreEntry_SO entry)
        {
            if (entry == null) return;
            
            if (allLoreEntries.Contains(entry))
            {
                allLoreEntries.Remove(entry);
                BuildLoreLookups();
                Debug.Log($"Removed lore entry: {entry.Title}");
            }
        }
        
        /// <summary>
        /// Validate the lore database
        /// </summary>
        [ContextMenu("Validate Lore Database")]
        public void ValidateLoreDatabase()
        {
            var issues = new List<string>();
            var duplicateIDs = new HashSet<string>();
            var checkedIDs = new HashSet<string>();
            
            foreach (var entry in allLoreEntries)
            {
                if (entry == null) continue;
                
                // Check for duplicate IDs
                if (string.IsNullOrEmpty(entry.EntryID))
                {
                    issues.Add($"Entry {entry.name}: Missing entry ID");
                }
                else if (checkedIDs.Contains(entry.EntryID))
                {
                    duplicateIDs.Add(entry.EntryID);
                    issues.Add($"Entry {entry.name}: Duplicate ID '{entry.EntryID}'");
                }
                else
                {
                    checkedIDs.Add(entry.EntryID);
                }
                
                // Check for missing title
                if (string.IsNullOrEmpty(entry.Title))
                {
                    issues.Add($"Entry {entry.EntryID}: Missing title");
                }
                
                // Check for missing description
                if (string.IsNullOrEmpty(entry.Description))
                {
                    issues.Add($"Entry {entry.EntryID}: Missing description");
                }
                
                // Check for missing illustration
                if (entry.Illustration == null)
                {
                    issues.Add($"Entry {entry.EntryID}: Missing illustration");
                }
                
                // Check unlock condition parameters
                switch (entry.UnlockCondition)
                {
                    case UnlockConditionType.QuestFlag:
                    case UnlockConditionType.SpiritCaptured:
                    case UnlockConditionType.LocationVisited:
                        if (string.IsNullOrEmpty(entry.UnlockParam))
                        {
                            issues.Add($"Entry {entry.EntryID}: Missing unlock parameter for {entry.UnlockCondition}");
                        }
                        break;
                }
            }
            
            if (issues.Count > 0)
            {
                Debug.LogWarning($"Lore database validation found {issues.Count} issues:\n• " + string.Join("\n• ", issues));
            }
            else
            {
                Debug.Log("All lore entries validated successfully!");
            }
            
            if (duplicateIDs.Count > 0)
            {
                Debug.LogError($"Found {duplicateIDs.Count} duplicate IDs: {string.Join(", ", duplicateIDs)}");
            }
        }
        
        /// <summary>
        /// Auto-populate database from project assets
        /// </summary>
        [ContextMenu("Auto-Populate from Project")]
        public void AutoPopulateFromProject()
        {
            if (!autoPopulateFromProject) return;
            
            // Find all LoreEntry_SO assets in the project
            var loreEntries = Resources.FindObjectsOfTypeAll<LoreEntry_SO>();
            
            // Add any new entries
            foreach (var entry in loreEntries)
            {
                if (entry != null && !allLoreEntries.Contains(entry))
                {
                    allLoreEntries.Add(entry);
                }
            }
            
            // Rebuild lookups
            BuildLoreLookups();
            
            Debug.Log($"Auto-populated lore database with {allLoreEntries.Count} entries");
        }
        
        /// <summary>
        /// Get database statistics
        /// </summary>
        [ContextMenu("Get Database Stats")]
        public void GetDatabaseStats()
        {
            var totalEntries = allLoreEntries.Count;
            var unlockedEntries = GetUnlockedEntries(GameData.Instance);
            var lockedEntries = GetLockedEntries(GameData.Instance);
            
            Debug.Log($"Lore Database Statistics:\n" +
                     $"Total Entries: {totalEntries}\n" +
                     $"Unlocked: {unlockedEntries.Count}\n" +
                     $"Locked: {lockedEntries.Count}\n" +
                     $"Categories: {categoryLookup.Count}\n" +
                     $"Emotion Cores: {emotionCoreLookup.Count}\n" +
                     $"Genre Biases: {genreBiasLookup.Count}");
        }
        
        /// <summary>
        /// Test unlock conditions (for testing)
        /// </summary>
        [ContextMenu("Test Unlock Conditions")]
        public void TestUnlockConditions()
        {
            var gameData = GameData.Instance;
            if (gameData == null)
            {
                Debug.LogWarning("GameData not available for testing unlock conditions");
                return;
            }
            
            var unlockedCount = 0;
            var lockedCount = 0;
            
            foreach (var entry in allLoreEntries)
            {
                if (entry != null)
                {
                    if (entry.CheckUnlockCondition(gameData))
                    {
                        unlockedCount++;
                        Debug.Log($"Entry '{entry.Title}' is UNLOCKED");
                    }
                    else
                    {
                        lockedCount++;
                        Debug.Log($"Entry '{entry.Title}' is LOCKED - {entry.GetUnlockConditionDescription()}");
                    }
                }
            }
            
            Debug.Log($"Unlock test complete: {unlockedCount} unlocked, {lockedCount} locked");
        }
    }
}