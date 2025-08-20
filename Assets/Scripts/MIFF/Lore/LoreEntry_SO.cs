using UnityEngine;
using MIFF.Core;

namespace MIFF.Lore
{
    /// <summary>
    /// ScriptableObject defining individual lore entries for the Codex
    /// </summary>
    [CreateAssetMenu(fileName = "New Lore Entry", menuName = "MIFF/Lore/LoreEntry")]
    public class LoreEntry_SO : ScriptableObject
    {
        [Header("Entry Identity")]
        [SerializeField] private string entryID;
        [SerializeField] private string title;
        [TextArea(3, 6)]
        [SerializeField] private string description;
        [SerializeField] private string category = "General";
        [SerializeField] private int priority = 0;
        
        [Header("Content")]
        [SerializeField] private EmotionCoreType emotionCore = EmotionCoreType.Neutral;
        [SerializeField] private GenreBiasType genreBias = GenreBiasType.Pop;
        [SerializeField] private Sprite illustration;
        [SerializeField] private AudioClip themeSnippet;
        [SerializeField] private Color themeColor = Color.white;
        
        [Header("Unlock Conditions")]
        [SerializeField] private UnlockConditionType unlockCondition = UnlockConditionType.Manual;
        [SerializeField] private string unlockParam = "";
        [SerializeField] private bool isUnlockedByDefault = false;
        
        [Header("Metadata")]
        [SerializeField] private string author = "";
        [SerializeField] private string[] tags = new string[0];
        [SerializeField] private string[] relatedEntries = new string[0];
        
        // Properties
        public string EntryID => entryID;
        public string Title => title;
        public string Description => description;
        public string Category => category;
        public int Priority => priority;
        public EmotionCoreType EmotionCore => emotionCore;
        public GenreBiasType GenreBias => genreBias;
        public Sprite Illustration => illustration;
        public AudioClip ThemeSnippet => themeSnippet;
        public Color ThemeColor => themeColor;
        public UnlockConditionType UnlockCondition => unlockCondition;
        public string UnlockParam => unlockParam;
        public bool IsUnlockedByDefault => isUnlockedByDefault;
        public string Author => author;
        public string[] Tags => tags;
        public string[] RelatedEntries => relatedEntries;
        
        private void OnValidate()
        {
            // Ensure entryID is unique and not empty
            if (string.IsNullOrEmpty(entryID))
            {
                entryID = name.ToLower().Replace(" ", "_");
            }
            
            // Ensure title is not empty
            if (string.IsNullOrEmpty(title))
            {
                title = name;
            }
            
            // Validate unlock conditions
            ValidateUnlockConditions();
            
            // Validate content
            ValidateContent();
        }
        
        /// <summary>
        /// Validate unlock conditions based on type
        /// </summary>
        private void ValidateUnlockConditions()
        {
            switch (unlockCondition)
            {
                case UnlockConditionType.QuestFlag:
                    if (string.IsNullOrEmpty(unlockParam))
                    {
                        Debug.LogWarning($"Lore Entry {entryID}: QuestFlag requires flag ID");
                    }
                    break;
                    
                case UnlockConditionType.SpiritCaptured:
                    if (string.IsNullOrEmpty(unlockParam))
                    {
                        Debug.LogWarning($"Lore Entry {entryID}: SpiritCaptured requires spirit ID");
                    }
                    break;
                    
                case UnlockConditionType.LocationVisited:
                    if (string.IsNullOrEmpty(unlockParam))
                    {
                        Debug.LogWarning($"Lore Entry {entryID}: LocationVisited requires location ID");
                    }
                    break;
                    
                case UnlockConditionType.Manual:
                    // No validation needed
                    break;
                    
                default:
                    Debug.LogWarning($"Lore Entry {entryID}: Unknown unlock condition type");
                    break;
            }
        }
        
        /// <summary>
        /// Validate content requirements
        /// </summary>
        private void ValidateContent()
        {
            if (string.IsNullOrEmpty(description))
            {
                Debug.LogWarning($"Lore Entry {entryID}: Missing description");
            }
            
            if (illustration == null)
            {
                Debug.LogWarning($"Lore Entry {entryID}: Missing illustration");
            }
        }
        
        /// <summary>
        /// Check if this lore entry is unlocked based on game state
        /// </summary>
        public bool CheckUnlockCondition(GameData gameData)
        {
            if (isUnlockedByDefault) return true;
            
            switch (unlockCondition)
            {
                case UnlockConditionType.QuestFlag:
                    return CheckQuestFlagUnlock(gameData);
                    
                case UnlockConditionType.SpiritCaptured:
                    return CheckSpiritCapturedUnlock(gameData);
                    
                case UnlockConditionType.LocationVisited:
                    return CheckLocationVisitedUnlock(gameData);
                    
                case UnlockConditionType.Manual:
                    return true; // Always unlocked
                    
                default:
                    Debug.LogWarning($"Unknown unlock condition type: {unlockCondition}");
                    return false;
            }
        }
        
        /// <summary>
        /// Check quest flag unlock condition
        /// </summary>
        private bool CheckQuestFlagUnlock(GameData gameData)
        {
            if (string.IsNullOrEmpty(unlockParam)) return false;
            
            // Check if the quest flag is set
            return gameData.HasData($"Quest_{unlockParam}_Completed") && 
                   gameData.GetData<bool>($"Quest_{unlockParam}_Completed");
        }
        
        /// <summary>
        /// Check spirit captured unlock condition
        /// </summary>
        private bool CheckSpiritCapturedUnlock(GameData gameData)
        {
            if (string.IsNullOrEmpty(unlockParam)) return false;
            
            // Check if the spirit has been discovered/captured
            if (gameData.HasData("discoveredSpiritIDs"))
            {
                var discoveredSpirits = gameData.GetData<System.Collections.Generic.List<string>>("discoveredSpiritIDs");
                return discoveredSpirits != null && discoveredSpirits.Contains(unlockParam);
            }
            
            return false;
        }
        
        /// <summary>
        /// Check location visited unlock condition
        /// </summary>
        private bool CheckLocationVisitedUnlock(GameData gameData)
        {
            if (string.IsNullOrEmpty(unlockParam)) return false;
            
            // Check if the location has been visited
            if (gameData.HasData("visitedLocationIDs"))
            {
                var visitedLocations = gameData.GetData<System.Collections.Generic.List<string>>("visitedLocationIDs");
                return visitedLocations != null && visitedLocations.Contains(unlockParam);
            }
            
            return false;
        }
        
        /// <summary>
        /// Get unlock condition description
        /// </summary>
        public string GetUnlockConditionDescription()
        {
            switch (unlockCondition)
            {
                case UnlockConditionType.QuestFlag:
                    return $"Complete quest: {unlockParam}";
                    
                case UnlockConditionType.SpiritCaptured:
                    return $"Capture spirit: {unlockParam}";
                    
                case UnlockConditionType.LocationVisited:
                    return $"Visit location: {unlockParam}";
                    
                case UnlockConditionType.Manual:
                    return "Available from the start";
                    
                default:
                    return "Unknown unlock condition";
            }
        }
        
        /// <summary>
        /// Get emotion core description
        /// </summary>
        public string GetEmotionCoreDescription()
        {
            switch (emotionCore)
            {
                case EmotionCoreType.Joy: return "Joy - Bright and uplifting";
                case EmotionCoreType.Melancholy: return "Melancholy - Thoughtful and introspective";
                case EmotionCoreType.Energy: return "Energy - Dynamic and powerful";
                case EmotionCoreType.Calm: return "Calm - Peaceful and serene";
                case EmotionCoreType.Passion: return "Passion - Intense and emotional";
                case EmotionCoreType.Mystery: return "Mystery - Enigmatic and intriguing";
                case EmotionCoreType.Neutral: return "Neutral - Balanced and versatile";
                default: return "Unknown emotion core";
            }
        }
        
        /// <summary>
        /// Get genre bias description
        /// </summary>
        public string GetGenreBiasDescription()
        {
            switch (genreBias)
            {
                case GenreBiasType.Pop: return "Pop - Catchy and accessible";
                case GenreBiasType.Rock: return "Rock - Powerful and energetic";
                case GenreBiasType.Electronic: return "Electronic - Modern and synthetic";
                case GenreBiasType.Classical: return "Classical - Timeless and refined";
                case GenreBiasType.Jazz: return "Jazz - Sophisticated and improvisational";
                case GenreBiasType.Folk: return "Folk - Authentic and traditional";
                case GenreBiasType.HipHop: return "Hip-Hop - Rhythmic and urban";
                case GenreBiasType.Experimental: return "Experimental - Innovative and boundary-pushing";
                default: return "Unknown genre bias";
            }
        }
        
        /// <summary>
        /// Get a summary of the lore entry
        /// </summary>
        public string GetSummary()
        {
            return $"{title} ({category}) - {emotionCore} / {genreBias}";
        }
        
        /// <summary>
        /// Check if entry has audio content
        /// </summary>
        public bool HasAudioContent()
        {
            return themeSnippet != null;
        }
        
        /// <summary>
        /// Check if entry has visual content
        /// </summary>
        public bool HasVisualContent()
        {
            return illustration != null;
        }
        
        /// <summary>
        /// Get entry tags as formatted string
        /// </summary>
        public string GetTagsString()
        {
            if (tags == null || tags.Length == 0) return "";
            return string.Join(", ", tags);
        }
        
        /// <summary>
        /// Check if entry has specific tag
        /// </summary>
        public bool HasTag(string tag)
        {
            if (tags == null) return false;
            return System.Array.Exists(tags, t => t.Equals(tag, System.StringComparison.OrdinalIgnoreCase));
        }
    }
    
    /// <summary>
    /// Types of emotion cores that influence lore content
    /// </summary>
    public enum EmotionCoreType
    {
        Joy,           // Bright and uplifting
        Melancholy,    // Thoughtful and introspective
        Energy,        // Dynamic and powerful
        Calm,          // Peaceful and serene
        Passion,       // Intense and emotional
        Mystery,       // Enigmatic and intriguing
        Neutral        // Balanced and versatile
    }
    
    /// <summary>
    /// Types of genre biases that influence lore content
    /// </summary>
    public enum GenreBiasType
    {
        Pop,           // Catchy and accessible
        Rock,          // Powerful and energetic
        Electronic,    // Modern and synthetic
        Classical,     // Timeless and refined
        Jazz,          // Sophisticated and improvisational
        Folk,          // Authentic and traditional
        HipHop,        // Rhythmic and urban
        Experimental   // Innovative and boundary-pushing
    }
    
    /// <summary>
    /// Types of unlock conditions for lore entries
    /// </summary>
    public enum UnlockConditionType
    {
        QuestFlag,         // Unlocked by completing a quest
        SpiritCaptured,    // Unlocked by capturing a specific spirit
        LocationVisited,   // Unlocked by visiting a specific location
        Manual             // Manually unlocked by design choice
    }
}