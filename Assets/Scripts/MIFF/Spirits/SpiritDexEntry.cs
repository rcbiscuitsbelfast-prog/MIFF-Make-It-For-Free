using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Spirits
{
    /// <summary>
    /// Represents a complete SpiritDex entry with comprehensive spirit information
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritDexEntry
    {
        [Header("Core Identity")]
        public string spiritID;
        public string spiritName;
        public string speciesID;
        public string displayName;
        public string nickname;
        public string alternateNames;
        
        [Header("Classification")]
        public SpiritType primaryType;
        public SpiritType secondaryType;
        public SpiritRarity rarity;
        public SpiritCategory category;
        public string generation;
        public string region;
        public string habitat;
        
        [Header("Physical Characteristics")]
        public float height;
        public float weight;
        public string colorScheme;
        public string physicalDescription;
        public string[] distinctiveFeatures;
        public string[] accessories;
        public string[] markings;
        
        [Header("Personality & Behavior")]
        public string personality;
        public string[] personalityTraits;
        public string[] likes;
        public string[] dislikes;
        public string[] fears;
        public string[] motivations;
        public string socialBehavior;
        public string battleStyle;
        
        [Header("Lore & Background")]
        public string originStory;
        public string culturalSignificance;
        public string[] legends;
        public string[] myths;
        public string[] historicalEvents;
        public string[] famousOwners;
        public string[] associatedLocations;
        public string[] associatedItems;
        
        [Header("Fandom & Cultural")]
        public string[] fandomTraits;
        public string[] catchphrases;
        public string[] signatureMoves;
        public string[] danceMoves;
        public string[] musicGenres;
        public string[] fashionStyle;
        public string[] socialMediaPresence;
        public string[] fanArtThemes;
        
        [Header("Evolution & Growth")]
        public string[] evolutionPath;
        public string[] evolutionTriggers;
        public string[] evolutionRequirements;
        public string[] evolutionItems;
        public string[] evolutionConditions;
        public string[] evolutionLore;
        public string[] evolutionEffects;
        public string[] evolutionMilestones;
        
        [Header("Battle & Abilities")]
        public string[] abilities;
        public string[] hiddenAbilities;
        public string[] signatureAbilities;
        public string[] moveTypes;
        public string[] moveCategories;
        public string[] moveEffects;
        public string[] battleStrategies;
        public string[] teamCompositions;
        
        [Header("Capture & Collection")]
        public CaptureStatus captureStatus;
        public string[] captureMethods;
        public string[] captureItems;
        public string[] captureConditions;
        public float captureDifficulty;
        public string[] captureLore;
        public string[] captureTips;
        public string[] captureRewards;
        
        [Header("Discovery & Encounter")]
        public DiscoveryStatus discoveryStatus;
        public string[] encounterLocations;
        public string[] encounterConditions;
        public string[] encounterTimes;
        public string[] encounterSeasons;
        public string[] encounterWeather;
        public string[] encounterEvents;
        public string[] encounterRarities;
        
        [Header("Stats & Progression")]
        public int baseLevel;
        public int maxLevel;
        public float experienceRate;
        public string[] statGrowth;
        public string[] statModifiers;
        public string[] statBoosts;
        public string[] statPenalties;
        public string[] statConditions;
        
        [Header("Relationships & Bonds")]
        public string[] compatibleSpirits;
        public string[] rivalSpirits;
        public string[] mentorSpirits;
        public string[] studentSpirits;
        public string[] familySpirits;
        public string[] friendSpirits;
        public string[] enemySpirits;
        public string[] neutralSpirits;
        
        [Header("Training & Development")]
        public string[] trainingMethods;
        public string[] trainingItems;
        public string[] trainingLocations;
        public string[] trainingPartners;
        public string[] trainingChallenges;
        public string[] trainingRewards;
        public string[] trainingMilestones;
        public string[] trainingTips;
        
        [Header("Social & Community")]
        public string[] socialGroups;
        public string[] communityRoles;
        public string[] leadershipPositions;
        public string[] mentorshipRoles;
        public string[] eventParticipation;
        public string[] charityWork;
        public string[] fanInteractions;
        public string[] mediaAppearances;
        
        [Header("Technical Information")]
        public string dataVersion;
        public DateTime lastUpdated;
        public string lastUpdatedBy;
        public string sourceMaterial;
        public string[] references;
        public string[] citations;
        public string[] acknowledgments;
        public string[] contributors;
        
        [Header("Remix & Customization")]
        public bool isRemixable = true;
        public string remixNotes;
        public string[] customTags;
        public Dictionary<string, object> customFields;
        public string[] customCategories;
        public string[] customAttributes;
        public string[] customRules;
        public string[] customLogic;
        
        // Events for remixers to hook into
        public event Action<SpiritDexEntry> OnEntryUpdated;
        public event Action<SpiritDexEntry> OnEntryValidated;
        public event Action<SpiritDexEntry> OnEntryCorrupted;
        public event Action<SpiritDexEntry, string> OnFieldChanged;
        
        public SpiritDexEntry()
        {
            InitializeDefaultValues();
        }
        
        /// <summary>
        /// Create a new SpiritDex entry
        /// </summary>
        public SpiritDexEntry(string spiritID, string spiritName, SpiritType primaryType)
        {
            this.spiritID = spiritID;
            this.spiritName = spiritName;
            this.primaryType = primaryType;
            InitializeDefaultValues();
        }
        
        /// <summary>
        /// Initialize default values for all fields
        /// </summary>
        private void InitializeDefaultValues()
        {
            // Initialize arrays and collections
            distinctiveFeatures = new string[0];
            accessories = new string[0];
            markings = new string[0];
            personalityTraits = new string[0];
            likes = new string[0];
            dislikes = new string[0];
            fears = new string[0];
            motivations = new string[0];
            legends = new string[0];
            myths = new string[0];
            historicalEvents = new string[0];
            famousOwners = new string[0];
            associatedLocations = new string[0];
            associatedItems = new string[0];
            fandomTraits = new string[0];
            catchphrases = new string[0];
            signatureMoves = new string[0];
            danceMoves = new string[0];
            musicGenres = new string[0];
            fashionStyle = new string[0];
            socialMediaPresence = new string[0];
            fanArtThemes = new string[0];
            evolutionPath = new string[0];
            evolutionTriggers = new string[0];
            evolutionRequirements = new string[0];
            evolutionItems = new string[0];
            evolutionConditions = new string[0];
            evolutionLore = new string[0];
            evolutionEffects = new string[0];
            evolutionMilestones = new string[0];
            abilities = new string[0];
            hiddenAbilities = new string[0];
            signatureAbilities = new string[0];
            moveTypes = new string[0];
            moveCategories = new string[0];
            moveEffects = new string[0];
            battleStrategies = new string[0];
            teamCompositions = new string[0];
            captureMethods = new string[0];
            captureItems = new string[0];
            captureConditions = new string[0];
            captureLore = new string[0];
            captureTips = new string[0];
            captureRewards = new string[0];
            encounterLocations = new string[0];
            encounterConditions = new string[0];
            encounterTimes = new string[0];
            encounterSeasons = new string[0];
            encounterWeather = new string[0];
            encounterEvents = new string[0];
            encounterRarities = new string[0];
            statGrowth = new string[0];
            statModifiers = new string[0];
            statBoosts = new string[0];
            statPenalties = new string[0];
            statConditions = new string[0];
            compatibleSpirits = new string[0];
            rivalSpirits = new string[0];
            mentorSpirits = new string[0];
            studentSpirits = new string[0];
            familySpirits = new string[0];
            friendSpirits = new string[0];
            enemySpirits = new string[0];
            neutralSpirits = new string[0];
            trainingMethods = new string[0];
            trainingItems = new string[0];
            trainingLocations = new string[0];
            trainingPartners = new string[0];
            trainingChallenges = new string[0];
            trainingRewards = new string[0];
            trainingMilestones = new string[0];
            trainingTips = new string[0];
            socialGroups = new string[0];
            communityRoles = new string[0];
            leadershipPositions = new string[0];
            mentorshipRoles = new string[0];
            eventParticipation = new string[0];
            charityWork = new string[0];
            fanInteractions = new string[0];
            mediaAppearances = new string[0];
            references = new string[0];
            citations = new string[0];
            acknowledgments = new string[0];
            contributors = new string[0];
            customTags = new string[0];
            customFields = new Dictionary<string, object>();
            customCategories = new string[0];
            customAttributes = new string[0];
            customRules = new string[0];
            customLogic = new string[0];
            
            // Set default values
            rarity = SpiritRarity.Common;
            category = SpiritCategory.Normal;
            captureStatus = CaptureStatus.Unknown;
            discoveryStatus = DiscoveryStatus.Unknown;
            baseLevel = 1;
            maxLevel = 100;
            experienceRate = 1.0f;
            captureDifficulty = 0.5f;
            dataVersion = "1.0";
            lastUpdated = DateTime.Now;
            isRemixable = true;
        }
        
        /// <summary>
        /// Update entry with new data
        /// </summary>
        public void UpdateEntry(SpiritDexEntry newData)
        {
            if (newData == null) return;
            
            try
            {
                // Update core fields
                spiritName = newData.spiritName ?? spiritName;
                displayName = newData.displayName ?? displayName;
                nickname = newData.nickname ?? nickname;
                primaryType = newData.primaryType;
                secondaryType = newData.secondaryType;
                rarity = newData.rarity;
                category = newData.category;
                
                // Update physical characteristics
                height = newData.height > 0 ? newData.height : height;
                weight = newData.weight > 0 ? newData.weight : weight;
                colorScheme = newData.colorScheme ?? colorScheme;
                physicalDescription = newData.physicalDescription ?? physicalDescription;
                
                // Update arrays (only if new data is provided)
                if (newData.distinctiveFeatures != null && newData.distinctiveFeatures.Length > 0)
                    distinctiveFeatures = newData.distinctiveFeatures;
                if (newData.accessories != null && newData.accessories.Length > 0)
                    accessories = newData.accessories;
                if (newData.markings != null && newData.markings.Length > 0)
                    markings = newData.markings;
                
                // Update personality and behavior
                personality = newData.personality ?? personality;
                if (newData.personalityTraits != null && newData.personalityTraits.Length > 0)
                    personalityTraits = newData.personalityTraits;
                if (newData.likes != null && newData.likes.Length > 0)
                    likes = newData.likes;
                if (newData.dislikes != null && newData.dislikes.Length > 0)
                    dislikes = newData.dislikes;
                
                // Update lore and background
                originStory = newData.originStory ?? originStory;
                culturalSignificance = newData.culturalSignificance ?? culturalSignificance;
                if (newData.legends != null && newData.legends.Length > 0)
                    legends = newData.legends;
                if (newData.myths != null && newData.myths.Length > 0)
                    myths = newData.myths;
                
                // Update fandom traits
                if (newData.fandomTraits != null && newData.fandomTraits.Length > 0)
                    fandomTraits = newData.fandomTraits;
                if (newData.catchphrases != null && newData.catchphrases.Length > 0)
                    catchphrases = newData.catchphrases;
                if (newData.signatureMoves != null && newData.signatureMoves.Length > 0)
                    signatureMoves = newData.signatureMoves;
                
                // Update evolution path
                if (newData.evolutionPath != null && newData.evolutionPath.Length > 0)
                    evolutionPath = newData.evolutionPath;
                if (newData.evolutionTriggers != null && newData.evolutionTriggers.Length > 0)
                    evolutionTriggers = newData.evolutionTriggers;
                
                // Update abilities
                if (newData.abilities != null && newData.abilities.Length > 0)
                    abilities = newData.abilities;
                if (newData.hiddenAbilities != null && newData.hiddenAbilities.Length > 0)
                    hiddenAbilities = newData.hiddenAbilities;
                if (newData.signatureAbilities != null && newData.signatureAbilities.Length > 0)
                    signatureAbilities = newData.signatureAbilities;
                
                // Update capture information
                captureStatus = newData.captureStatus;
                captureDifficulty = newData.captureDifficulty > 0 ? newData.captureDifficulty : captureDifficulty;
                if (newData.captureMethods != null && newData.captureMethods.Length > 0)
                    captureMethods = newData.captureMethods;
                if (newData.captureItems != null && newData.captureItems.Length > 0)
                    captureItems = newData.captureItems;
                
                // Update discovery information
                discoveryStatus = newData.discoveryStatus;
                if (newData.encounterLocations != null && newData.encounterLocations.Length > 0)
                    encounterLocations = newData.encounterLocations;
                if (newData.encounterConditions != null && newData.encounterConditions.Length > 0)
                    encounterConditions = newData.encounterConditions;
                
                // Update stats
                baseLevel = newData.baseLevel > 0 ? newData.baseLevel : baseLevel;
                maxLevel = newData.maxLevel > 0 ? newData.maxLevel : maxLevel;
                experienceRate = newData.experienceRate > 0 ? newData.experienceRate : experienceRate;
                
                // Update relationships
                if (newData.compatibleSpirits != null && newData.compatibleSpirits.Length > 0)
                    compatibleSpirits = newData.compatibleSpirits;
                if (newData.rivalSpirits != null && newData.rivalSpirits.Length > 0)
                    rivalSpirits = newData.rivalSpirits;
                if (newData.friendSpirits != null && newData.friendSpirits.Length > 0)
                    friendSpirits = newData.friendSpirits;
                
                // Update training information
                if (newData.trainingMethods != null && newData.trainingMethods.Length > 0)
                    trainingMethods = newData.trainingMethods;
                if (newData.trainingItems != null && newData.trainingItems.Length > 0)
                    trainingItems = newData.trainingItems;
                if (newData.trainingTips != null && newData.trainingTips.Length > 0)
                    trainingTips = newData.trainingTips;
                
                // Update social information
                if (newData.socialGroups != null && newData.socialGroups.Length > 0)
                    socialGroups = newData.socialGroups;
                if (newData.communityRoles != null && newData.communityRoles.Length > 0)
                    communityRoles = newData.communityRoles;
                if (newData.fanInteractions != null && newData.fanInteractions.Length > 0)
                    fanInteractions = newData.fanInteractions;
                
                // Update technical information
                dataVersion = newData.dataVersion ?? dataVersion;
                lastUpdated = DateTime.Now;
                lastUpdatedBy = newData.lastUpdatedBy ?? lastUpdatedBy;
                sourceMaterial = newData.sourceMaterial ?? sourceMaterial;
                
                // Update custom fields
                if (newData.customTags != null && newData.customTags.Length > 0)
                    customTags = newData.customTags;
                if (newData.customFields != null && newData.customFields.Count > 0)
                {
                    foreach (var kvp in newData.customFields)
                    {
                        customFields[kvp.Key] = kvp.Value;
                    }
                }
                
                // Trigger update event
                OnEntryUpdated?.Invoke(this);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating SpiritDex entry: {ex.Message}");
                OnEntryCorrupted?.Invoke(this);
            }
        }
        
        /// <summary>
        /// Set custom field value
        /// </summary>
        public void SetCustomField(string key, object value)
        {
            if (string.IsNullOrEmpty(key)) return;
            
            customFields[key] = value;
            OnFieldChanged?.Invoke(this, key);
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
        /// Add custom tag
        /// </summary>
        public void AddCustomTag(string tag)
        {
            if (string.IsNullOrEmpty(tag)) return;
            
            if (!Array.Exists(customTags, t => t == tag))
            {
                Array.Resize(ref customTags, customTags.Length + 1);
                customTags[customTags.Length - 1] = tag;
                OnFieldChanged?.Invoke(this, "customTags");
            }
        }
        
        /// <summary>
        /// Remove custom tag
        /// </summary>
        public void RemoveCustomTag(string tag)
        {
            if (string.IsNullOrEmpty(tag)) return;
            
            int index = Array.FindIndex(customTags, t => t == tag);
            if (index >= 0)
            {
                var newTags = new string[customTags.Length - 1];
                Array.Copy(customTags, 0, newTags, 0, index);
                Array.Copy(customTags, index + 1, newTags, index, customTags.Length - index - 1);
                customTags = newTags;
                OnFieldChanged?.Invoke(this, "customTags");
            }
        }
        
        /// <summary>
        /// Check if entry has specific tag
        /// </summary>
        public bool HasCustomTag(string tag)
        {
            return Array.Exists(customTags, t => t == tag);
        }
        
        /// <summary>
        /// Get entry summary
        /// </summary>
        public string GetSummary()
        {
            string type = secondaryType != SpiritType.None ? $"{primaryType}/{secondaryType}" : primaryType.ToString();
            string status = $"{captureStatus} | {discoveryStatus}";
            string level = $"Lv.{baseLevel}-{maxLevel}";
            
            return $"{spiritName} ({spiritID}) | {type} | {rarity} | {status} | {level}";
        }
        
        /// <summary>
        /// Get detailed entry information
        /// </summary>
        public string GetDetailedInfo()
        {
            string baseInfo = GetSummary();
            string types = $"\nTypes: {primaryType}";
            if (secondaryType != SpiritType.None)
                types += $"/{secondaryType}";
            types += $"\nRarity: {rarity} | Category: {category}";
            
            string physical = $"\nPhysical: {height:F1}m, {weight:F1}kg | {colorScheme}";
            if (physicalDescription != null)
                physical += $"\nDescription: {physicalDescription}";
            
            string personality = "";
            if (!string.IsNullOrEmpty(this.personality))
                personality = $"\nPersonality: {this.personality}";
            if (personalityTraits.Length > 0)
                personality += $"\nTraits: {string.Join(", ", personalityTraits)}";
            
            string lore = "";
            if (!string.IsNullOrEmpty(originStory))
                lore = $"\nOrigin: {originStory}";
            if (!string.IsNullOrEmpty(culturalSignificance))
                lore += $"\nCultural Significance: {culturalSignificance}";
            
            string abilities = "";
            if (this.abilities.Length > 0)
                abilities = $"\nAbilities: {string.Join(", ", this.abilities)}";
            if (signatureAbilities.Length > 0)
                abilities += $"\nSignature: {string.Join(", ", signatureAbilities)}";
            
            string evolution = "";
            if (evolutionPath.Length > 0)
                evolution = $"\nEvolution Path: {string.Join(" → ", evolutionPath)}";
            if (evolutionTriggers.Length > 0)
                evolution += $"\nTriggers: {string.Join(", ", evolutionTriggers)}";
            
            string capture = $"\nCapture: {captureStatus} | Difficulty: {captureDifficulty:F2}";
            if (captureMethods.Length > 0)
                capture += $"\nMethods: {string.Join(", ", captureMethods)}";
            
            string encounter = $"\nDiscovery: {discoveryStatus}";
            if (encounterLocations.Length > 0)
                encounter += $"\nLocations: {string.Join(", ", encounterLocations)}";
            if (encounterConditions.Length > 0)
                encounter += $"\nConditions: {string.Join(", ", encounterConditions)}";
            
            string stats = $"\nStats: Level {baseLevel}-{maxLevel} | Exp Rate: {experienceRate:F2}";
            if (statGrowth.Length > 0)
                stats += $"\nGrowth: {string.Join(", ", statGrowth)}";
            
            string relationships = "";
            if (compatibleSpirits.Length > 0)
                relationships = $"\nCompatible: {string.Join(", ", compatibleSpirits)}";
            if (rivalSpirits.Length > 0)
                relationships += $"\nRivals: {string.Join(", ", rivalSpirits)}";
            if (friendSpirits.Length > 0)
                relationships += $"\nFriends: {string.Join(", ", friendSpirits)}";
            
            string training = "";
            if (trainingMethods.Length > 0)
                training = $"\nTraining: {string.Join(", ", trainingMethods)}";
            if (trainingTips.Length > 0)
                training += $"\nTips: {string.Join(", ", trainingTips)}";
            
            string social = "";
            if (socialGroups.Length > 0)
                social = $"\nSocial: {string.Join(", ", socialGroups)}";
            if (communityRoles.Length > 0)
                social += $"\nRoles: {string.Join(", ", communityRoles)}";
            
            string fandom = "";
            if (fandomTraits.Length > 0)
                fandom = $"\nFandom: {string.Join(", ", fandomTraits)}";
            if (catchphrases.Length > 0)
                fandom += $"\nCatchphrases: {string.Join(", ", catchphrases)}";
            if (signatureMoves.Length > 0)
                fandom += $"\nSignature Moves: {string.Join(", ", signatureMoves)}";
            
            string custom = "";
            if (customTags.Length > 0)
                custom = $"\nCustom Tags: {string.Join(", ", customTags)}";
            if (customFields.Count > 0)
                custom += $"\nCustom Fields: {customFields.Count} fields";
            
            string technical = $"\nTechnical: v{dataVersion} | Updated: {lastUpdated:yyyy-MM-dd HH:mm:ss}";
            if (!string.IsNullOrEmpty(lastUpdatedBy))
                technical += $" by {lastUpdatedBy}";
            if (!string.IsNullOrEmpty(sourceMaterial))
                technical += $"\nSource: {sourceMaterial}";
            
            return $"{baseInfo}{types}{physical}{personality}{lore}{abilities}{evolution}{capture}{encounter}{stats}{relationships}{training}{social}{fandom}{custom}{technical}";
        }
        
        /// <summary>
        /// Get entry status
        /// </summary>
        public EntryStatus GetStatus()
        {
            if (captureStatus == CaptureStatus.Captured && discoveryStatus == DiscoveryStatus.Discovered)
                return EntryStatus.Complete;
            if (discoveryStatus == DiscoveryStatus.Discovered)
                return EntryStatus.Discovered;
            if (discoveryStatus == DiscoveryStatus.Seen)
                return EntryStatus.Seen;
            return EntryStatus.Unknown;
        }
        
        /// <summary>
        /// Check if entry is complete
        /// </summary>
        public bool IsComplete => GetStatus() == EntryStatus.Complete;
        
        /// <summary>
        /// Check if entry is discovered
        /// </summary>
        public bool IsDiscovered => discoveryStatus == DiscoveryStatus.Discovered;
        
        /// <summary>
        /// Check if entry is captured
        /// </summary>
        public bool IsCaptured => captureStatus == CaptureStatus.Captured;
        
        /// <summary>
        /// Get evolution stage
        /// </summary>
        public int GetEvolutionStage()
        {
            if (evolutionPath == null || evolutionPath.Length == 0)
                return 0;
            
            // Find current spirit in evolution path
            for (int i = 0; i < evolutionPath.Length; i++)
            {
                if (evolutionPath[i] == spiritID)
                    return i + 1;
            }
            
            return 0;
        }
        
        /// <summary>
        /// Get next evolution
        /// </summary>
        public string GetNextEvolution()
        {
            int currentStage = GetEvolutionStage();
            if (currentStage > 0 && currentStage < evolutionPath.Length)
                return evolutionPath[currentStage];
            
            return null;
        }
        
        /// <summary>
        /// Get previous evolution
        /// </summary>
        public string GetPreviousEvolution()
        {
            int currentStage = GetEvolutionStage();
            if (currentStage > 1)
                return evolutionPath[currentStage - 2];
            
            return null;
        }
        
        /// <summary>
        /// Check if can evolve
        /// </summary>
        public bool CanEvolve()
        {
            return GetNextEvolution() != null;
        }
        
        /// <summary>
        /// Check if has evolved
        /// </summary>
        public bool HasEvolved()
        {
            return GetPreviousEvolution() != null;
        }
        
        /// <summary>
        /// Get entry completion percentage
        /// </summary>
        public float GetCompletionPercentage()
        {
            int totalFields = 0;
            int filledFields = 0;
            
            // Count basic fields
            totalFields += 8; // ID, name, types, rarity, category, height, weight, description
            if (!string.IsNullOrEmpty(spiritName)) filledFields++;
            if (primaryType != SpiritType.None) filledFields++;
            if (secondaryType != SpiritType.None) filledFields++;
            if (rarity != SpiritRarity.Common) filledFields++;
            if (category != SpiritCategory.Normal) filledFields++;
            if (height > 0) filledFields++;
            if (weight > 0) filledFields++;
            if (!string.IsNullOrEmpty(physicalDescription)) filledFields++;
            
            // Count array fields (consider filled if has at least one item)
            var arrayFields = new[] { personalityTraits, likes, dislikes, legends, myths, abilities, 
                                     evolutionPath, captureMethods, encounterLocations, trainingMethods, 
                                     socialGroups, fandomTraits, catchphrases, signatureMoves };
            
            foreach (var field in arrayFields)
            {
                totalFields++;
                if (field != null && field.Length > 0) filledFields++;
            }
            
            // Count text fields
            var textFields = new[] { personality, originStory, culturalSignificance, battleStyle, 
                                   socialBehavior, remixNotes };
            
            foreach (var field in textFields)
            {
                totalFields++;
                if (!string.IsNullOrEmpty(field)) filledFields++;
            }
            
            return totalFields > 0 ? (float)filledFields / totalFields * 100.0f : 0.0f;
        }
        
        /// <summary>
        /// Validate entry data
        /// </summary>
        public bool ValidateEntry()
        {
            try
            {
                // Basic validation
                if (string.IsNullOrEmpty(spiritID)) return false;
                if (string.IsNullOrEmpty(spiritName)) return false;
                if (primaryType == SpiritType.None) return false;
                
                // Level validation
                if (baseLevel < 1 || maxLevel < baseLevel) return false;
                if (experienceRate <= 0) return false;
                
                // Capture difficulty validation
                if (captureDifficulty < 0 || captureDifficulty > 1) return false;
                
                // Height and weight validation
                if (height < 0 || weight < 0) return false;
                
                // Array validation
                if (distinctiveFeatures == null || accessories == null || markings == null) return false;
                if (personalityTraits == null || likes == null || dislikes == null) return false;
                if (abilities == null || evolutionPath == null || captureMethods == null) return false;
                
                OnEntryValidated?.Invoke(this);
                return true;
            }
            catch
            {
                OnEntryCorrupted?.Invoke(this);
                return false;
            }
        }
        
        /// <summary>
        /// Clone this entry
        /// </summary>
        public SpiritDexEntry Clone()
        {
            var clone = new SpiritDexEntry(spiritID, spiritName, primaryType);
            
            // Copy all fields
            clone.displayName = displayName;
            clone.nickname = nickname;
            clone.alternateNames = alternateNames;
            clone.speciesID = speciesID;
            clone.secondaryType = secondaryType;
            clone.rarity = rarity;
            clone.category = category;
            clone.generation = generation;
            clone.region = region;
            clone.habitat = habitat;
            clone.height = height;
            clone.weight = weight;
            clone.colorScheme = colorScheme;
            clone.physicalDescription = physicalDescription;
            clone.distinctiveFeatures = (string[])distinctiveFeatures.Clone();
            clone.accessories = (string[])accessories.Clone();
            clone.markings = (string[])markings.Clone();
            clone.personality = personality;
            clone.personalityTraits = (string[])personalityTraits.Clone();
            clone.likes = (string[])likes.Clone();
            clone.dislikes = (string[])dislikes.Clone();
            clone.fears = (string[])fears.Clone();
            clone.motivations = (string[])motivations.Clone();
            clone.socialBehavior = socialBehavior;
            clone.battleStyle = battleStyle;
            clone.originStory = originStory;
            clone.culturalSignificance = culturalSignificance;
            clone.legends = (string[])legends.Clone();
            clone.myths = (string[])myths.Clone();
            clone.historicalEvents = (string[])historicalEvents.Clone();
            clone.famousOwners = (string[])famousOwners.Clone();
            clone.associatedLocations = (string[])associatedLocations.Clone();
            clone.associatedItems = (string[])associatedItems.Clone();
            clone.fandomTraits = (string[])fandomTraits.Clone();
            clone.catchphrases = (string[])catchphrases.Clone();
            clone.signatureMoves = (string[])signatureMoves.Clone();
            clone.danceMoves = (string[])danceMoves.Clone();
            clone.musicGenres = (string[])musicGenres.Clone();
            clone.fashionStyle = (string[])fashionStyle.Clone();
            clone.socialMediaPresence = (string[])socialMediaPresence.Clone();
            clone.fanArtThemes = (string[])fanArtThemes.Clone();
            clone.evolutionPath = (string[])evolutionPath.Clone();
            clone.evolutionTriggers = (string[])evolutionTriggers.Clone();
            clone.evolutionRequirements = (string[])evolutionRequirements.Clone();
            clone.evolutionItems = (string[])evolutionItems.Clone();
            clone.evolutionConditions = (string[])evolutionConditions.Clone();
            clone.evolutionLore = (string[])evolutionLore.Clone();
            clone.evolutionEffects = (string[])evolutionEffects.Clone();
            clone.evolutionMilestones = (string[])evolutionMilestones.Clone();
            clone.abilities = (string[])abilities.Clone();
            clone.hiddenAbilities = (string[])hiddenAbilities.Clone();
            clone.signatureAbilities = (string[])signatureAbilities.Clone();
            clone.moveTypes = (string[])moveTypes.Clone();
            clone.moveCategories = (string[])moveCategories.Clone();
            clone.moveEffects = (string[])moveEffects.Clone();
            clone.battleStrategies = (string[])battleStrategies.Clone();
            clone.teamCompositions = (string[])teamCompositions.Clone();
            clone.captureStatus = captureStatus;
            clone.captureMethods = (string[])captureMethods.Clone();
            clone.captureItems = (string[])captureItems.Clone();
            clone.captureConditions = (string[])captureConditions.Clone();
            clone.captureDifficulty = captureDifficulty;
            clone.captureLore = (string[])captureLore.Clone();
            clone.captureTips = (string[])captureTips.Clone();
            clone.captureRewards = (string[])captureRewards.Clone();
            clone.discoveryStatus = discoveryStatus;
            clone.encounterLocations = (string[])encounterLocations.Clone();
            clone.encounterConditions = (string[])encounterConditions.Clone();
            clone.encounterTimes = (string[])encounterTimes.Clone();
            clone.encounterSeasons = (string[])encounterSeasons.Clone();
            clone.encounterWeather = (string[])encounterWeather.Clone();
            clone.encounterEvents = (string[])encounterEvents.Clone();
            clone.encounterRarities = (string[])encounterRarities.Clone();
            clone.baseLevel = baseLevel;
            clone.maxLevel = maxLevel;
            clone.experienceRate = experienceRate;
            clone.statGrowth = (string[])statGrowth.Clone();
            clone.statModifiers = (string[])statModifiers.Clone();
            clone.statBoosts = (string[])statBoosts.Clone();
            clone.statPenalties = (string[])statPenalties.Clone();
            clone.statConditions = (string[])statConditions.Clone();
            clone.compatibleSpirits = (string[])compatibleSpirits.Clone();
            clone.rivalSpirits = (string[])rivalSpirits.Clone();
            clone.mentorSpirits = (string[])mentorSpirits.Clone();
            clone.studentSpirits = (string[])studentSpirits.Clone();
            clone.familySpirits = (string[])familySpirits.Clone();
            clone.friendSpirits = (string[])friendSpirits.Clone();
            clone.enemySpirits = (string[])enemySpirits.Clone();
            clone.neutralSpirits = (string[])neutralSpirits.Clone();
            clone.trainingMethods = (string[])trainingMethods.Clone();
            clone.trainingItems = (string[])trainingItems.Clone();
            clone.trainingLocations = (string[])trainingLocations.Clone();
            clone.trainingPartners = (string[])trainingPartners.Clone();
            clone.trainingChallenges = (string[])trainingChallenges.Clone();
            clone.trainingRewards = (string[])trainingRewards.Clone();
            clone.trainingMilestones = (string[])trainingMilestones.Clone();
            clone.trainingTips = (string[])trainingTips.Clone();
            clone.socialGroups = (string[])socialGroups.Clone();
            clone.communityRoles = (string[])communityRoles.Clone();
            clone.leadershipPositions = (string[])leadershipPositions.Clone();
            clone.mentorshipRoles = (string[])mentorshipRoles.Clone();
            clone.eventParticipation = (string[])eventParticipation.Clone();
            clone.charityWork = (string[])charityWork.Clone();
            clone.fanInteractions = (string[])fanInteractions.Clone();
            clone.mediaAppearances = (string[])mediaAppearances.Clone();
            clone.dataVersion = dataVersion;
            clone.lastUpdated = lastUpdated;
            clone.lastUpdatedBy = lastUpdatedBy;
            clone.sourceMaterial = sourceMaterial;
            clone.references = (string[])references.Clone();
            clone.citations = (string[])citations.Clone();
            clone.acknowledgments = (string[])acknowledgments.Clone();
            clone.contributors = (string[])contributors.Clone();
            clone.isRemixable = isRemixable;
            clone.remixNotes = remixNotes;
            clone.customTags = (string[])customTags.Clone();
            clone.customFields = new Dictionary<string, object>(customFields);
            clone.customCategories = (string[])customCategories.Clone();
            clone.customAttributes = (string[])customAttributes.Clone();
            clone.customRules = (string[])customRules.Clone();
            clone.customLogic = (string[])customLogic.Clone();
            
            return clone;
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
        Unknown,      // Entry not yet discovered
        Seen,         // Spirit seen but not captured
        Discovered,   // Spirit discovered but not captured
        Complete      // Spirit captured and fully documented
    }
    
    /// <summary>
    /// Capture status of a spirit
    /// </summary>
    public enum CaptureStatus
    {
        Unknown,      // Capture status unknown
        NotCaptured,  // Spirit not yet captured
        Captured,     // Spirit successfully captured
        Failed,       // Capture attempt failed
        Escaped       // Spirit escaped during capture
    }
    
    /// <summary>
    /// Discovery status of a spirit
    /// </summary>
    public enum DiscoveryStatus
    {
        Unknown,      // Discovery status unknown
        NotSeen,      // Spirit not yet seen
        Seen,         // Spirit seen but not discovered
        Discovered    // Spirit fully discovered
    }
    
    /// <summary>
    /// Spirit types for classification
    /// </summary>
    public enum SpiritType
    {
        None,
        Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying,
        Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy,
        // K-pop specific types
        Pop, Rock, HipHop, Electronic, Ballad, Dance, R&B, Jazz, Classical,
        // Custom types for remixers
        Custom1, Custom2, Custom3, Custom4, Custom5
    }
    
    /// <summary>
    /// Spirit rarity levels
    /// </summary>
    public enum SpiritRarity
    {
        Common,       // Very common, easy to find
        Uncommon,     // Somewhat rare, moderate difficulty
        Rare,         // Rare, difficult to find
        Epic,         // Very rare, very difficult
        Legendary,    // Extremely rare, legendary status
        Mythical      // Mythical, almost impossible to find
    }
    
    /// <summary>
    /// Spirit categories for organization
    /// </summary>
    public enum SpiritCategory
    {
        Normal,       // Standard spirits
        Starter,      // Starter spirits for new players
        Evolution,    // Evolved forms
        Regional,     // Region-specific spirits
        Event,        // Event-exclusive spirits
        Seasonal,     // Season-specific spirits
        Special,      // Special condition spirits
        Mythical,     // Mythical and legendary spirits
        Custom        // Custom spirits for remixers
    }
}