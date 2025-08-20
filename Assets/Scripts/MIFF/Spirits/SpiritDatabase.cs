using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Spirits
{
    /// <summary>
    /// Database for SpiritSpecies metadata and lookup
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritDatabase
    {
        [Header("Database Configuration")]
        public bool enableAutoPopulation = true;
        public bool enableValidation = true;
        public bool enableStatistics = true;
        
        // Core data storage
        private Dictionary<string, SpiritSpecies> speciesDatabase;
        private Dictionary<string, List<string>> typeIndex;
        private Dictionary<string, List<string>> rarityIndex;
        private Dictionary<string, List<string>> categoryIndex;
        
        // Statistics and tracking
        private DatabaseStats statistics;
        private DateTime lastUpdated;
        
        // Events for remixers to hook into
        public event Action<SpiritDatabase, SpiritSpecies> OnSpeciesAdded;
        public event Action<SpiritDatabase, SpiritSpecies> OnSpeciesRemoved;
        public event Action<SpiritDatabase, SpiritSpecies> OnSpeciesUpdated;
        
        public SpiritDatabase()
        {
            InitializeDatabase();
        }
        
        /// <summary>
        /// Initialize the database
        /// </summary>
        private void InitializeDatabase()
        {
            speciesDatabase = new Dictionary<string, SpiritSpecies>();
            typeIndex = new Dictionary<string, List<string>>();
            rarityIndex = new Dictionary<string, List<string>>();
            categoryIndex = new Dictionary<string, List<string>>();
            
            statistics = new DatabaseStats();
            lastUpdated = DateTime.Now;
            
            // Initialize indices
            InitializeIndices();
            
            // Populate with sample data if enabled
            if (enableAutoPopulation)
            {
                PopulateSampleData();
            }
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
        /// Add new species
        /// </summary>
        public bool AddSpecies(SpiritSpecies species)
        {
            if (species == null || string.IsNullOrEmpty(species.speciesID))
            {
                Console.WriteLine("Error: Invalid species data");
                return false;
            }
            
            try
            {
                // Check if species already exists
                if (speciesDatabase.ContainsKey(species.speciesID))
                {
                    Console.WriteLine($"Warning: Species already exists: {species.speciesID}");
                    return UpdateSpecies(species);
                }
                
                // Validate species
                if (enableValidation && !ValidateSpecies(species))
                {
                    Console.WriteLine($"Error: Species validation failed: {species.speciesID}");
                    return false;
                }
                
                // Add to main storage
                speciesDatabase[species.speciesID] = species;
                
                // Update indices
                UpdateTypeIndex(species);
                UpdateRarityIndex(species);
                UpdateCategoryIndex(species);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                
                // Trigger event
                OnSpeciesAdded?.Invoke(this, species);
                
                Console.WriteLine($"Added species: {species.speciesName} ({species.speciesID})");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding species: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Update existing species
        /// </summary>
        public bool UpdateSpecies(SpiritSpecies species)
        {
            if (species == null || string.IsNullOrEmpty(species.speciesID))
            {
                Console.WriteLine("Error: Invalid species data");
                return false;
            }
            
            try
            {
                // Check if species exists
                if (!speciesDatabase.ContainsKey(species.speciesID))
                {
                    Console.WriteLine($"Error: Species not found: {species.speciesID}");
                    return false;
                }
                
                // Get existing species
                var existingSpecies = speciesDatabase[species.speciesID];
                
                // Update species
                existingSpecies.UpdateSpecies(species);
                
                // Validate if enabled
                if (enableValidation && !ValidateSpecies(existingSpecies))
                {
                    Console.WriteLine($"Error: Species validation failed after update: {species.speciesID}");
                    return false;
                }
                
                // Update indices
                UpdateTypeIndex(existingSpecies);
                UpdateRarityIndex(existingSpecies);
                UpdateCategoryIndex(existingSpecies);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                
                // Trigger event
                OnSpeciesUpdated?.Invoke(this, existingSpecies);
                
                Console.WriteLine($"Updated species: {species.speciesName} ({species.speciesID})");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating species: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Remove species
        /// </summary>
        public bool RemoveSpecies(string speciesID)
        {
            if (string.IsNullOrEmpty(speciesID))
            {
                Console.WriteLine("Error: Invalid species ID");
                return false;
            }
            
            try
            {
                // Check if species exists
                if (!speciesDatabase.ContainsKey(speciesID))
                {
                    Console.WriteLine($"Error: Species not found: {speciesID}");
                    return false;
                }
                
                var species = speciesDatabase[speciesID];
                
                // Remove from main storage
                speciesDatabase.Remove(speciesID);
                
                // Remove from indices
                RemoveFromTypeIndex(species);
                RemoveFromRarityIndex(species);
                RemoveFromCategoryIndex(species);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                
                // Trigger event
                OnSpeciesRemoved?.Invoke(this, species);
                
                Console.WriteLine($"Removed species: {species.speciesName} ({speciesID})");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing species: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Get species by ID
        /// </summary>
        public SpiritSpecies GetSpeciesByID(string speciesID)
        {
            if (string.IsNullOrEmpty(speciesID) || !speciesDatabase.ContainsKey(speciesID))
                return null;
            
            return speciesDatabase[speciesID];
        }
        
        /// <summary>
        /// Get species by name
        /// </summary>
        public SpiritSpecies GetSpeciesByName(string speciesName)
        {
            if (string.IsNullOrEmpty(speciesName))
                return null;
            
            return speciesDatabase.Values.FirstOrDefault(s => 
                s.speciesName.Equals(speciesName, StringComparison.OrdinalIgnoreCase) ||
                s.displayName?.Equals(speciesName, StringComparison.OrdinalIgnoreCase) == true);
        }
        
        /// <summary>
        /// Get all species
        /// </summary>
        public List<SpiritSpecies> GetAllSpecies()
        {
            return speciesDatabase.Values.ToList();
        }
        
        /// <summary>
        /// Get species by type
        /// </summary>
        public List<SpiritSpecies> GetSpeciesByType(SpiritType type)
        {
            if (type == SpiritType.None || !typeIndex.ContainsKey(type.ToString()))
                return new List<SpiritSpecies>();
            
            var speciesIDs = typeIndex[type.ToString()];
            return speciesIDs.Select(id => speciesDatabase[id]).ToList();
        }
        
        /// <summary>
        /// Get species by rarity
        /// </summary>
        public List<SpiritSpecies> GetSpeciesByRarity(SpiritRarity rarity)
        {
            if (!rarityIndex.ContainsKey(rarity.ToString()))
                return new List<SpiritSpecies>();
            
            var speciesIDs = rarityIndex[rarity.ToString()];
            return speciesIDs.Select(id => speciesDatabase[id]).ToList();
        }
        
        /// <summary>
        /// Get species by category
        /// </summary>
        public List<SpiritSpecies> GetSpeciesByCategory(SpiritCategory category)
        {
            if (!categoryIndex.ContainsKey(category.ToString()))
                return new List<SpiritSpecies>();
            
            var speciesIDs = categoryIndex[category.ToString()];
            return speciesIDs.Select(id => speciesDatabase[id]).ToList();
        }
        
        /// <summary>
        /// Search species by text
        /// </summary>
        public List<SpiritSpecies> SearchSpecies(string searchTerm, int maxResults = -1)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return new List<SpiritSpecies>();
            
            try
            {
                var results = new List<SpiritSpecies>();
                searchTerm = searchTerm.ToLower();
                
                // Search in various fields
                foreach (var species in speciesDatabase.Values)
                {
                    bool matches = false;
                    
                    // Search in core fields
                    if (species.speciesID.ToLower().Contains(searchTerm) ||
                        species.speciesName.ToLower().Contains(searchTerm) ||
                        species.displayName?.ToLower().Contains(searchTerm) == true)
                    {
                        matches = true;
                    }
                    
                    // Search in description and lore
                    if (!matches && (
                        species.description?.ToLower().Contains(searchTerm) == true ||
                        species.lore?.ToLower().Contains(searchTerm) == true))
                    {
                        matches = true;
                    }
                    
                    // Search in abilities
                    if (!matches && species.abilities.Any(a => a.ToLower().Contains(searchTerm)))
                    {
                        matches = true;
                    }
                    
                    // Search in custom tags
                    if (!matches && species.customTags.Any(t => t.ToLower().Contains(searchTerm)))
                    {
                        matches = true;
                    }
                    
                    if (matches)
                    {
                        results.Add(species);
                        
                        // Check max results
                        if (maxResults > 0 && results.Count >= maxResults)
                            break;
                    }
                }
                
                return results;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error searching species: {ex.Message}");
                return new List<SpiritSpecies>();
            }
        }
        
        /// <summary>
        /// Get statistics
        /// </summary>
        public DatabaseStats GetStatistics()
        {
            UpdateStatistics();
            return statistics;
        }
        
        /// <summary>
        /// Update type index
        /// </summary>
        private void UpdateTypeIndex(SpiritSpecies species)
        {
            try
            {
                // Remove old entries
                RemoveFromTypeIndex(species);
                
                // Add to primary type
                string primaryTypeKey = species.primaryType.ToString();
                if (typeIndex.ContainsKey(primaryTypeKey))
                {
                    if (!typeIndex[primaryTypeKey].Contains(species.speciesID))
                        typeIndex[primaryTypeKey].Add(species.speciesID);
                }
                
                // Add to secondary type
                if (species.secondaryType != SpiritType.None)
                {
                    string secondaryTypeKey = species.secondaryType.ToString();
                    if (typeIndex.ContainsKey(secondaryTypeKey))
                    {
                        if (!typeIndex[secondaryTypeKey].Contains(species.speciesID))
                            typeIndex[secondaryTypeKey].Add(species.speciesID);
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
        private void RemoveFromTypeIndex(SpiritSpecies species)
        {
            try
            {
                // Remove from primary type
                string primaryTypeKey = species.primaryType.ToString();
                if (typeIndex.ContainsKey(primaryTypeKey))
                {
                    typeIndex[primaryTypeKey].Remove(species.speciesID);
                }
                
                // Remove from secondary type
                if (species.secondaryType != SpiritType.None)
                {
                    string secondaryTypeKey = species.secondaryType.ToString();
                    if (typeIndex.ContainsKey(secondaryTypeKey))
                    {
                        typeIndex[secondaryTypeKey].Remove(species.speciesID);
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
        private void UpdateRarityIndex(SpiritSpecies species)
        {
            try
            {
                // Remove old entries
                RemoveFromRarityIndex(species);
                
                // Add to rarity
                string rarityKey = species.rarity.ToString();
                if (rarityIndex.ContainsKey(rarityKey))
                {
                    if (!rarityIndex[rarityKey].Contains(species.speciesID))
                        rarityIndex[rarityKey].Add(species.speciesID);
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
        private void RemoveFromRarityIndex(SpiritSpecies species)
        {
            try
            {
                string rarityKey = species.rarity.ToString();
                if (rarityIndex.ContainsKey(rarityKey))
                {
                    rarityIndex[rarityKey].Remove(species.speciesID);
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
        private void UpdateCategoryIndex(SpiritSpecies species)
        {
            try
            {
                // Remove old entries
                RemoveFromCategoryIndex(species);
                
                // Add to category
                string categoryKey = species.category.ToString();
                if (categoryIndex.ContainsKey(categoryKey))
                {
                    if (!categoryIndex[categoryKey].Contains(species.speciesID))
                        categoryIndex[categoryKey].Add(species.speciesID);
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
        private void RemoveFromCategoryIndex(SpiritSpecies species)
        {
            try
            {
                string categoryKey = species.category.ToString();
                if (categoryIndex.ContainsKey(categoryKey))
                {
                    categoryIndex[categoryKey].Remove(species.speciesID);
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
                statistics.totalSpecies = speciesDatabase.Count;
                statistics.speciesByType = new Dictionary<string, int>();
                statistics.speciesByRarity = new Dictionary<string, int>();
                statistics.speciesByCategory = new Dictionary<string, int>();
                
                // Count by type
                foreach (var kvp in typeIndex)
                {
                    statistics.speciesByType[kvp.Key] = kvp.Value.Count;
                }
                
                // Count by rarity
                foreach (var kvp in rarityIndex)
                {
                    statistics.speciesByRarity[kvp.Key] = kvp.Value.Count;
                }
                
                // Count by category
                foreach (var kvp in categoryIndex)
                {
                    statistics.speciesByCategory[kvp.Key] = kvp.Value.Count;
                }
                
                // Calculate type distribution
                statistics.typeDistribution = new Dictionary<string, float>();
                foreach (var kvp in statistics.speciesByType)
                {
                    statistics.typeDistribution[kvp.Key] = (float)kvp.Value / statistics.totalSpecies * 100.0f;
                }
                
                // Calculate rarity distribution
                statistics.rarityDistribution = new Dictionary<string, float>();
                foreach (var kvp in statistics.speciesByRarity)
                {
                    statistics.rarityDistribution[kvp.Key] = (float)kvp.Value / statistics.totalSpecies * 100.0f;
                }
                
                statistics.lastUpdated = DateTime.Now;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating statistics: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Validate species data
        /// </summary>
        private bool ValidateSpecies(SpiritSpecies species)
        {
            try
            {
                // Basic validation
                if (string.IsNullOrEmpty(species.speciesID)) return false;
                if (string.IsNullOrEmpty(species.speciesName)) return false;
                if (species.primaryType == SpiritType.None) return false;
                
                // Level validation
                if (species.baseLevel < 1 || species.maxLevel < species.baseLevel) return false;
                if (species.experienceRate <= 0) return false;
                
                // Stats validation
                if (species.baseHP < 0 || species.baseAttack < 0 || species.baseDefense < 0) return false;
                if (species.baseSpeed < 0 || species.baseSpecialAttack < 0 || species.baseSpecialDefense < 0) return false;
                
                // Array validation
                if (species.abilities == null || species.moves == null) return false;
                
                return true;
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Populate with sample data
        /// </summary>
        private void PopulateSampleData()
        {
            try
            {
                // Create sample starter species
                var starterSpecies = new SpiritSpecies("starter_001", "Lumino", SpiritType.Pop)
                {
                    displayName = "Lumino the Starter",
                    description = "A bright and energetic starter spirit that embodies the essence of K-pop",
                    lore = "Born from the first light of dawn in New Bark City, Lumino represents hope and new beginnings",
                    secondaryType = SpiritType.Light,
                    rarity = SpiritRarity.Common,
                    category = SpiritCategory.Starter,
                    generation = "1",
                    region = "New Bark",
                    habitat = "Urban",
                    height = 0.8f,
                    weight = 15.0f,
                    baseLevel = 5,
                    maxLevel = 100,
                    experienceRate = 1.0f,
                    baseHP = 45,
                    baseAttack = 49,
                    baseDefense = 49,
                    baseSpeed = 45,
                    baseSpecialAttack = 65,
                    baseSpecialDefense = 65,
                    abilities = new[] { "Illuminate", "Charm", "Quick Attack" },
                    moves = new[] { "Tackle", "Growl", "Light Screen", "Confuse Ray" },
                    evolutionPath = new[] { "starter_001", "starter_002", "starter_003" },
                    evolutionLevel = 16,
                    customTags = new[] { "starter", "beginner-friendly", "evolves" }
                };
                
                AddSpecies(starterSpecies);
                
                // Create sample evolved species
                var evolvedSpecies = new SpiritSpecies("starter_002", "Luminara", SpiritType.Pop)
                {
                    displayName = "Luminara the Evolved",
                    description = "An elegant evolved form of Lumino with enhanced musical abilities",
                    lore = "Evolved through friendship and musical training, Luminara represents artistic growth",
                    secondaryType = SpiritType.Light,
                    rarity = SpiritRarity.Uncommon,
                    category = SpiritCategory.Evolution,
                    generation = "1",
                    region = "New Bark",
                    habitat = "Urban",
                    height = 1.2f,
                    weight = 25.0f,
                    baseLevel = 16,
                    maxLevel = 100,
                    experienceRate = 1.2f,
                    baseHP = 60,
                    baseAttack = 62,
                    baseDefense = 63,
                    baseSpeed = 60,
                    baseSpecialAttack = 80,
                    baseSpecialDefense = 80,
                    abilities = new[] { "Illuminate", "Charm", "Quick Attack", "Dazzle", "Musical Note" },
                    moves = new[] { "Tackle", "Growl", "Light Screen", "Confuse Ray", "Dazzling Gleam", "Sing" },
                    evolutionPath = new[] { "starter_001", "starter_002", "starter_003" },
                    evolutionLevel = 32,
                    customTags = new[] { "evolved", "musical", "cultural", "teacher" }
                };
                
                AddSpecies(evolvedSpecies);
                
                // Create sample legendary species
                var legendarySpecies = new SpiritSpecies("legendary_001", "Stellaris", SpiritType.Pop)
                {
                    displayName = "Stellaris the Legendary",
                    description = "A majestic legendary spirit that embodies the essence of stardom",
                    lore = "Born from the collision of two stars, Stellaris represents ultimate achievement in K-pop",
                    secondaryType = SpiritType.Light,
                    rarity = SpiritRarity.Legendary,
                    category = SpiritCategory.Mythical,
                    generation = "1",
                    region = "Cosmic",
                    habitat = "Stellar",
                    height = 2.5f,
                    weight = 100.0f,
                    baseLevel = 50,
                    maxLevel = 100,
                    experienceRate = 2.0f,
                    baseHP = 100,
                    baseAttack = 100,
                    baseDefense = 100,
                    baseSpeed = 100,
                    baseSpecialAttack = 150,
                    baseSpecialDefense = 150,
                    abilities = new[] { "Cosmic Blast", "Stardom Aura", "Legendary Presence", "Fame Wave" },
                    moves = new[] { "Cosmic Power", "Stardom Strike", "Legendary Performance", "Supernova" },
                    evolutionPath = new[] { "legendary_001" },
                    evolutionLevel = 0,
                    customTags = new[] { "legendary", "cosmic", "stardom", "ultimate" }
                };
                
                AddSpecies(legendarySpecies);
                
                Console.WriteLine("Sample SpiritDatabase data created successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating sample data: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Get database summary
        /// </summary>
        public string GetDatabaseSummary()
        {
            var stats = GetStatistics();
            return $"Spirit Database | Species: {stats.totalSpecies} | " +
                   $"Types: {stats.speciesByType.Count} | Rarities: {stats.speciesByRarity.Count} | " +
                   $"Categories: {stats.speciesByCategory.Count}";
        }
    }
    
    /// <summary>
    /// Statistics for SpiritDatabase
    /// </summary>
    [Serializable]
    public class DatabaseStats
    {
        public int totalSpecies;
        
        public Dictionary<string, int> speciesByType;
        public Dictionary<string, int> speciesByRarity;
        public Dictionary<string, int> speciesByCategory;
        
        public Dictionary<string, float> typeDistribution;
        public Dictionary<string, float> rarityDistribution;
        
        public DateTime lastUpdated;
        
        public override string ToString()
        {
            return $"Total Species: {totalSpecies}";
        }
    }
}