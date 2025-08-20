using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Spirits
{
    /// <summary>
    /// Database for looking up SpiritSpecies by ID
    /// Provides metadata for SpiritDexViewer
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritDatabase
    {
        [Header("Database Configuration")]
        public bool enableAutoPopulation = true;
        public bool enableValidation = true;
        public bool enableSearch = true;
        public bool enableFiltering = true;
        public bool enableCaching = true;
        
        [Header("Database Content")]
        public Dictionary<string, SpiritSpecies> speciesDatabase = new Dictionary<string, SpiritSpecies>();
        public Dictionary<string, SpiritType> typeDatabase = new Dictionary<string, SpiritType>();
        public Dictionary<string, SpiritRarity> rarityDatabase = new Dictionary<string, SpiritRarity>();
        
        [Header("Database Statistics")]
        public int totalSpecies = 0;
        public int totalTypes = 0;
        public int totalRarities = 0;
        public DateTime lastUpdated = DateTime.Now;
        
        [Header("Remix Hooks")]
        public bool enableCustomSpecies = true;
        public bool enableCustomTypes = true;
        public bool enableCustomRarities = true;
        public bool enableCustomValidation = true;
        
        // Events for remixers to hook into
        public event Action<SpiritDatabase, string> OnSpeciesAdded;
        public event Action<SpiritDatabase, string> OnSpeciesRemoved;
        public event Action<SpiritDatabase, string> OnSpeciesUpdated;
        public event Action<SpiritDatabase> OnDatabaseUpdated;
        
        public SpiritDatabase()
        {
            InitializeDatabase();
        }
        
        /// <summary>
        /// Initialize the database
        /// </summary>
        private void InitializeDatabase()
        {
            speciesDatabase.Clear();
            typeDatabase.Clear();
            rarityDatabase.Clear();
            
            totalSpecies = 0;
            totalTypes = 0;
            totalRarities = 0;
            lastUpdated = DateTime.Now;
            
            // Populate default types
            PopulateDefaultTypes();
            
            // Populate default rarities
            PopulateDefaultRarities();
            
            // Populate with sample species if auto-population is enabled
            if (enableAutoPopulation)
            {
                PopulateSampleSpecies();
            }
        }
        
        /// <summary>
        /// Populate default spirit types
        /// </summary>
        private void PopulateDefaultTypes()
        {
            var types = Enum.GetValues(typeof(SpiritType));
            foreach (SpiritType type in types)
            {
                if (type != SpiritType.None)
                {
                    typeDatabase[type.ToString()] = type;
                }
            }
            totalTypes = typeDatabase.Count;
        }
        
        /// <summary>
        /// Populate default spirit rarities
        /// </summary>
        private void PopulateDefaultRarities()
        {
            var rarities = Enum.GetValues(typeof(SpiritRarity));
            foreach (SpiritRarity rarity in rarities)
            {
                rarityDatabase[rarity.ToString()] = rarity;
            }
            totalRarities = rarityDatabase.Count;
        }
        
        /// <summary>
        /// Populate with sample species for testing
        /// </summary>
        private void PopulateSampleSpecies()
        {
            // Starter Spirit
            AddSpecies(new SpiritSpecies
            {
                speciesID = "starter_spirit",
                speciesName = "Starter Spirit",
                description = "A friendly spirit that accompanies new trainers on their journey.",
                category = "Starter",
                height = 0.7f,
                weight = 9.0f,
                primaryType = SpiritType.Normal,
                secondaryType = SpiritType.None,
                baseRarity = SpiritRarity.Common,
                baseHP = 100,
                baseAttack = 55,
                baseDefense = 50,
                baseSpeed = 60,
                baseSpecialAttack = 45,
                baseSpecialDefense = 50,
                evolutionStage = "Base",
                canEvolve = true,
                evolutionRequirements = new string[] { "Level 20", "High Sync" }
            });
            
            // Fire Spirit
            AddSpecies(new SpiritSpecies
            {
                speciesID = "fire_spirit",
                speciesName = "Fire Spirit",
                description = "A passionate spirit with the power of flames.",
                category = "Elemental",
                height = 0.8f,
                weight = 12.0f,
                primaryType = SpiritType.Fire,
                secondaryType = SpiritType.None,
                baseRarity = SpiritRarity.Uncommon,
                baseHP = 90,
                baseAttack = 70,
                baseDefense = 45,
                baseSpeed = 75,
                baseSpecialAttack = 80,
                baseSpecialDefense = 45,
                evolutionStage = "Base",
                canEvolve = true,
                evolutionRequirements = new string[] { "Level 25", "Fire Stone" }
            });
            
            // Water Spirit
            AddSpecies(new SpiritSpecies
            {
                speciesID = "water_spirit",
                speciesName = "Water Spirit",
                description = "A flowing spirit that adapts to any situation.",
                category = "Elemental",
                height = 0.9f,
                weight = 15.0f,
                primaryType = SpiritType.Water,
                secondaryType = SpiritType.None,
                baseRarity = SpiritRarity.Uncommon,
                baseHP = 110,
                baseAttack = 50,
                baseDefense = 60,
                baseSpeed = 55,
                baseSpecialAttack = 65,
                baseSpecialDefense = 70,
                evolutionStage = "Base",
                canEvolve = true,
                evolutionRequirements = new string[] { "Level 25", "Water Stone" }
            });
            
            // Electric Spirit
            AddSpecies(new SpiritSpecies
            {
                speciesID = "electric_spirit",
                speciesName = "Electric Spirit",
                description = "A lightning-fast spirit full of energy.",
                category = "Elemental",
                height = 0.6f,
                weight = 8.0f,
                primaryType = SpiritType.Electric,
                secondaryType = SpiritType.None,
                baseRarity = SpiritRarity.Uncommon,
                baseHP = 80,
                baseAttack = 60,
                baseDefense = 40,
                baseSpeed = 90,
                baseSpecialAttack = 85,
                baseSpecialDefense = 40,
                evolutionStage = "Base",
                canEvolve = true,
                evolutionRequirements = new string[] { "Level 25", "Thunder Stone" }
            });
            
            // Legendary Spirit
            AddSpecies(new SpiritSpecies
            {
                speciesID = "legendary_spirit",
                speciesName = "Legendary Spirit",
                description = "A mythical spirit of immense power and rarity.",
                category = "Legendary",
                height = 1.5f,
                weight = 50.0f,
                primaryType = SpiritType.Dragon,
                secondaryType = SpiritType.Psychic,
                baseRarity = SpiritRarity.Legendary,
                baseHP = 150,
                baseAttack = 120,
                baseDefense = 100,
                baseSpeed = 110,
                baseSpecialAttack = 130,
                baseSpecialDefense = 100,
                evolutionStage = "Final",
                canEvolve = false,
                evolutionRequirements = new string[] { "Cannot Evolve" }
            });
        }
        
        /// <summary>
        /// Add a new species to the database
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
                    Console.WriteLine($"Species {species.speciesID} already exists. Updating...");
                    speciesDatabase[species.speciesID] = species;
                    OnSpeciesUpdated?.Invoke(this, species.speciesID);
                }
                else
                {
                    speciesDatabase[species.speciesID] = species;
                    totalSpecies++;
                    OnSpeciesAdded?.Invoke(this, species.speciesID);
                }
                
                lastUpdated = DateTime.Now;
                OnDatabaseUpdated?.Invoke(this);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding species: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Remove a species from the database
        /// </summary>
        public bool RemoveSpecies(string speciesID)
        {
            if (string.IsNullOrEmpty(speciesID) || !speciesDatabase.ContainsKey(speciesID))
            {
                return false;
            }
            
            try
            {
                speciesDatabase.Remove(speciesID);
                totalSpecies--;
                lastUpdated = DateTime.Now;
                
                OnSpeciesRemoved?.Invoke(this, speciesID);
                OnDatabaseUpdated?.Invoke(this);
                
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
        public SpiritSpecies GetSpecies(string speciesID)
        {
            if (string.IsNullOrEmpty(speciesID) || !speciesDatabase.ContainsKey(speciesID))
                return null;
            
            return speciesDatabase[speciesID];
        }
        
        /// <summary>
        /// Get all species
        /// </summary>
        public List<SpiritSpecies> GetAllSpecies()
        {
            return new List<SpiritSpecies>(speciesDatabase.Values);
        }
        
        /// <summary>
        /// Get species by type
        /// </summary>
        public List<SpiritSpecies> GetSpeciesByType(SpiritType type)
        {
            return speciesDatabase.Values
                .Where(s => s.primaryType == type || s.secondaryType == type)
                .ToList();
        }
        
        /// <summary>
        /// Get species by rarity
        /// </summary>
        public List<SpiritSpecies> GetSpeciesByRarity(SpiritRarity rarity)
        {
            return speciesDatabase.Values
                .Where(s => s.baseRarity == rarity)
                .ToList();
        }
        
        /// <summary>
        /// Get species by category
        /// </summary>
        public List<SpiritSpecies> GetSpeciesByCategory(string category)
        {
            if (string.IsNullOrEmpty(category)) return new List<SpiritSpecies>();
            
            return speciesDatabase.Values
                .Where(s => !string.IsNullOrEmpty(s.category) && 
                           s.category.Contains(category, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        
        /// <summary>
        /// Search species by name
        /// </summary>
        public List<SpiritSpecies> SearchSpeciesByName(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return new List<SpiritSpecies>();
            
            return speciesDatabase.Values
                .Where(s => !string.IsNullOrEmpty(s.speciesName) && 
                           s.speciesName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        
        /// <summary>
        /// Search species by description
        /// </summary>
        public List<SpiritSpecies> SearchSpeciesByDescription(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return new List<SpiritSpecies>();
            
            return speciesDatabase.Values
                .Where(s => !string.IsNullOrEmpty(s.description) && 
                           s.description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        
        /// <summary>
        /// Get species that can evolve
        /// </summary>
        public List<SpiritSpecies> GetEvolvableSpecies()
        {
            return speciesDatabase.Values
                .Where(s => s.canEvolve)
                .ToList();
        }
        
        /// <summary>
        /// Get species by evolution stage
        /// </summary>
        public List<SpiritSpecies> GetSpeciesByEvolutionStage(string stage)
        {
            if (string.IsNullOrEmpty(stage)) return new List<SpiritSpecies>();
            
            return speciesDatabase.Values
                .Where(s => !string.IsNullOrEmpty(s.evolutionStage) && 
                           s.evolutionStage.Contains(stage, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
        
        /// <summary>
        /// Get species with specific stat requirements
        /// </summary>
        public List<SpiritSpecies> GetSpeciesByStatRequirement(int minStat, string statType)
        {
            return speciesDatabase.Values.Where(s =>
            {
                int statValue = statType.ToLower() switch
                {
                    "hp" => s.baseHP,
                    "attack" => s.baseAttack,
                    "defense" => s.baseDefense,
                    "speed" => s.baseSpeed,
                    "specialattack" => s.baseSpecialAttack,
                    "specialdefense" => s.baseSpecialDefense,
                    _ => 0
                };
                
                return statValue >= minStat;
            }).ToList();
        }
        
        /// <summary>
        /// Get database statistics
        /// </summary>
        public DatabaseStats GetDatabaseStats()
        {
            return new DatabaseStats
            {
                totalSpecies = totalSpecies,
                totalTypes = totalTypes,
                totalRarities = totalRarities,
                lastUpdated = lastUpdated,
                typeDistribution = GetTypeDistribution(),
                rarityDistribution = GetRarityDistribution(),
                categoryDistribution = GetCategoryDistribution()
            };
        }
        
        /// <summary>
        /// Get type distribution
        /// </summary>
        private Dictionary<SpiritType, int> GetTypeDistribution()
        {
            var distribution = new Dictionary<SpiritType, int>();
            
            foreach (var species in speciesDatabase.Values)
            {
                if (distribution.ContainsKey(species.primaryType))
                    distribution[species.primaryType]++;
                else
                    distribution[species.primaryType] = 1;
                
                if (species.secondaryType != SpiritType.None)
                {
                    if (distribution.ContainsKey(species.secondaryType))
                        distribution[species.secondaryType]++;
                    else
                        distribution[species.secondaryType] = 1;
                }
            }
            
            return distribution;
        }
        
        /// <summary>
        /// Get rarity distribution
        /// </summary>
        private Dictionary<SpiritRarity, int> GetRarityDistribution()
        {
            var distribution = new Dictionary<SpiritRarity, int>();
            
            foreach (var species in speciesDatabase.Values)
            {
                if (distribution.ContainsKey(species.baseRarity))
                    distribution[species.baseRarity]++;
                else
                    distribution[species.baseRarity] = 1;
            }
            
            return distribution;
        }
        
        /// <summary>
        /// Get category distribution
        /// </summary>
        private Dictionary<string, int> GetCategoryDistribution()
        {
            var distribution = new Dictionary<string, int>();
            
            foreach (var species in speciesDatabase.Values)
            {
                string category = string.IsNullOrEmpty(species.category) ? "Unknown" : species.category;
                
                if (distribution.ContainsKey(category))
                    distribution[category]++;
                else
                    distribution[category] = 1;
            }
            
            return distribution;
        }
        
        /// <summary>
        /// Validate species data
        /// </summary>
        public List<string> ValidateSpecies(SpiritSpecies species)
        {
            var errors = new List<string>();
            
            if (species == null)
            {
                errors.Add("Species is null");
                return errors;
            }
            
            if (string.IsNullOrEmpty(species.speciesID))
                errors.Add("Species ID is missing");
            
            if (string.IsNullOrEmpty(species.speciesName))
                errors.Add("Species name is missing");
            
            if (species.baseHP <= 0)
                errors.Add("Base HP must be greater than 0");
            
            if (species.baseAttack <= 0)
                errors.Add("Base Attack must be greater than 0");
            
            if (species.baseDefense <= 0)
                errors.Add("Base Defense must be greater than 0");
            
            if (species.baseSpeed <= 0)
                errors.Add("Base Speed must be greater than 0");
            
            if (species.baseSpecialAttack <= 0)
                errors.Add("Base Special Attack must be greater than 0");
            
            if (species.baseSpecialDefense <= 0)
                errors.Add("Base Special Defense must be greater than 0");
            
            if (species.height <= 0)
                errors.Add("Height must be greater than 0");
            
            if (species.weight <= 0)
                errors.Add("Weight must be greater than 0");
            
            return errors;
        }
        
        /// <summary>
        /// Export database to string
        /// </summary>
        public string ExportDatabase()
        {
            var stats = GetDatabaseStats();
            var species = GetAllSpecies();
            
            string export = $"Spirit Database Export - {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n";
            export += $"Statistics: {stats}\n\n";
            export += "Species:\n";
            
            foreach (var s in species.OrderBy(sp => sp.speciesID))
            {
                export += $"- {s.speciesName} ({s.speciesID}) | Type: {s.primaryType}";
                if (s.secondaryType != SpiritType.None)
                    export += $"/{s.secondaryType}";
                export += $" | Rarity: {s.baseRarity} | Category: {s.category}\n";
            }
            
            return export;
        }
        
        /// <summary>
        /// Clear all data (for testing/reset)
        /// </summary>
        public void ClearAllData()
        {
            speciesDatabase.Clear();
            totalSpecies = 0;
            lastUpdated = DateTime.Now;
            OnDatabaseUpdated?.Invoke(this);
        }
        
        /// <summary>
        /// Get database summary
        /// </summary>
        public string GetDatabaseSummary()
        {
            return $"Spirit Database | Species: {totalSpecies} | Types: {totalTypes} | " +
                   $"Rarities: {totalRarities} | Last Updated: {lastUpdated:yyyy-MM-dd HH:mm}";
        }
    }
    
    /// <summary>
    /// Statistics for the Spirit Database
    /// </summary>
    [Serializable]
    public class DatabaseStats
    {
        public int totalSpecies;
        public int totalTypes;
        public int totalRarities;
        public DateTime lastUpdated;
        public Dictionary<SpiritType, int> typeDistribution;
        public Dictionary<SpiritRarity, int> rarityDistribution;
        public Dictionary<string, int> categoryDistribution;
        
        public override string ToString()
        {
            return $"Species: {totalSpecies}, Types: {totalTypes}, Rarities: {totalRarities}";
        }
    }
}