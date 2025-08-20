using UnityEngine;
using System.Collections.Generic;
using MIFF.Lore;

namespace MIFF.Lore
{
    /// <summary>
    /// Maps emotion cores and genre biases to their visual icons
    /// Icons stored in Resources for easy contributor replacement
    /// </summary>
    [CreateAssetMenu(fileName = "Lore Icon Mapping", menuName = "MIFF/Lore/LoreIconMapping")]
    public class LoreIconMapping : ScriptableObject
    {
        [Header("Emotion Core Icons")]
        [SerializeField] private Sprite joyIcon;
        [SerializeField] private Sprite melancholyIcon;
        [SerializeField] private Sprite energyIcon;
        [SerializeField] private Sprite calmIcon;
        [SerializeField] private Sprite passionIcon;
        [SerializeField] private Sprite mysteryIcon;
        [SerializeField] private Sprite neutralIcon;
        
        [Header("Genre Bias Icons")]
        [SerializeField] private Sprite popIcon;
        [SerializeField] private Sprite rockIcon;
        [SerializeField] private Sprite electronicIcon;
        [SerializeField] private Sprite classicalIcon;
        [SerializeField] private Sprite jazzIcon;
        [SerializeField] private Sprite folkIcon;
        [SerializeField] private Sprite hipHopIcon;
        [SerializeField] private Sprite experimentalIcon;
        
        [Header("Default Icons")]
        [SerializeField] private Sprite defaultEmotionIcon;
        [SerializeField] private Sprite defaultGenreIcon;
        
        [Header("Icon Settings")]
        [SerializeField] private Color defaultIconColor = Color.white;
        [SerializeField] private Vector2 defaultIconSize = new Vector2(32, 32);
        
        private Dictionary<EmotionCoreType, Sprite> emotionIconLookup;
        private Dictionary<GenreBiasType, Sprite> genreIconLookup;
        
        private void OnEnable()
        {
            BuildIconLookups();
        }
        
        /// <summary>
        /// Build the icon lookup dictionaries
        /// </summary>
        private void BuildIconLookups()
        {
            // Build emotion core icon lookup
            emotionIconLookup = new Dictionary<EmotionCoreType, Sprite>
            {
                { EmotionCoreType.Joy, joyIcon },
                { EmotionCoreType.Melancholy, melancholyIcon },
                { EmotionCoreType.Energy, energyIcon },
                { EmotionCoreType.Calm, calmIcon },
                { EmotionCoreType.Passion, passionIcon },
                { EmotionCoreType.Mystery, mysteryIcon },
                { EmotionCoreType.Neutral, neutralIcon }
            };
            
            // Build genre bias icon lookup
            genreIconLookup = new Dictionary<GenreBiasType, Sprite>
            {
                { GenreBiasType.Pop, popIcon },
                { GenreBiasType.Rock, rockIcon },
                { GenreBiasType.Electronic, electronicIcon },
                { GenreBiasType.Classical, classicalIcon },
                { GenreBiasType.Jazz, jazzIcon },
                { GenreBiasType.Folk, folkIcon },
                { GenreBiasType.HipHop, hipHopIcon },
                { GenreBiasType.Experimental, experimentalIcon }
            };
        }
        
        /// <summary>
        /// Get icon for emotion core type
        /// </summary>
        public Sprite GetEmotionCoreIcon(EmotionCoreType emotionCore)
        {
            if (emotionIconLookup == null)
            {
                BuildIconLookups();
            }
            
            if (emotionIconLookup.ContainsKey(emotionCore) && emotionIconLookup[emotionCore] != null)
            {
                return emotionIconLookup[emotionCore];
            }
            
            return defaultEmotionIcon;
        }
        
        /// <summary>
        /// Get icon for genre bias type
        /// </summary>
        public Sprite GetGenreBiasIcon(GenreBiasType genreBias)
        {
            if (genreIconLookup == null)
            {
                BuildIconLookups();
            }
            
            if (genreIconLookup.ContainsKey(genreBias) && genreIconLookup[genreBias] != null)
            {
                return genreIconLookup[genreBias];
            }
            
            return defaultGenreIcon;
        }
        
        /// <summary>
        /// Get default icon color
        /// </summary>
        public Color GetDefaultIconColor()
        {
            return defaultIconColor;
        }
        
        /// <summary>
        /// Get default icon size
        /// </summary>
        public Vector2 GetDefaultIconSize()
        {
            return defaultIconSize;
        }
        
        /// <summary>
        /// Check if emotion core icon exists
        /// </summary>
        public bool HasEmotionCoreIcon(EmotionCoreType emotionCore)
        {
            if (emotionIconLookup == null)
            {
                BuildIconLookups();
            }
            
            return emotionIconLookup.ContainsKey(emotionCore) && emotionIconLookup[emotionCore] != null;
        }
        
        /// <summary>
        /// Check if genre bias icon exists
        /// </summary>
        public bool HasGenreBiasIcon(GenreBiasType genreBias)
        {
            if (genreIconLookup == null)
            {
                BuildIconLookups();
            }
            
            return genreIconLookup.ContainsKey(genreBias) && genreIconLookup[genreBias] != null;
        }
        
        /// <summary>
        /// Get all emotion core icons
        /// </summary>
        public Dictionary<EmotionCoreType, Sprite> GetAllEmotionCoreIcons()
        {
            if (emotionIconLookup == null)
            {
                BuildIconLookups();
            }
            
            return new Dictionary<EmotionCoreType, Sprite>(emotionIconLookup);
        }
        
        /// <summary>
        /// Get all genre bias icons
        /// </summary>
        public Dictionary<GenreBiasType, Sprite> GetAllGenreBiasIcons()
        {
            if (genreIconLookup == null)
            {
                BuildIconLookups();
            }
            
            return new Dictionary<GenreBiasType, Sprite>(genreIconLookup);
        }
        
        /// <summary>
        /// Validate icon mapping
        /// </summary>
        [ContextMenu("Validate Icon Mapping")]
        public void ValidateIconMapping()
        {
            var issues = new List<string>();
            
            // Check emotion core icons
            foreach (var emotionCore in System.Enum.GetValues(typeof(EmotionCoreType)))
            {
                var emotionType = (EmotionCoreType)emotionCore;
                if (!HasEmotionCoreIcon(emotionType))
                {
                    issues.Add($"Missing icon for emotion core: {emotionType}");
                }
            }
            
            // Check genre bias icons
            foreach (var genreBias in System.Enum.GetValues(typeof(GenreBiasType)))
            {
                var genreType = (GenreBiasType)genreBias;
                if (!HasGenreBiasIcon(genreType))
                {
                    issues.Add($"Missing icon for genre bias: {genreType}");
                }
            }
            
            // Check default icons
            if (defaultEmotionIcon == null)
            {
                issues.Add("Missing default emotion icon");
            }
            
            if (defaultGenreIcon == null)
            {
                issues.Add("Missing default genre icon");
            }
            
            if (issues.Count > 0)
            {
                Debug.LogWarning($"Icon mapping validation found {issues.Count} issues:\n• " + string.Join("\n• ", issues));
            }
            else
            {
                Debug.Log("All icons mapped successfully!");
            }
        }
        
        /// <summary>
        /// Get icon mapping statistics
        /// </summary>
        [ContextMenu("Get Icon Mapping Stats")]
        public void GetIconMappingStats()
        {
            var emotionIconCount = 0;
            var genreIconCount = 0;
            
            foreach (var emotionCore in System.Enum.GetValues(typeof(EmotionCoreType)))
            {
                var emotionType = (EmotionCoreType)emotionCore;
                if (HasEmotionCoreIcon(emotionType))
                {
                    emotionIconCount++;
                }
            }
            
            foreach (var genreBias in System.Enum.GetValues(typeof(GenreBiasType)))
            {
                var genreType = (GenreBiasType)genreBias;
                if (HasGenreBiasIcon(genreType))
                {
                    genreIconCount++;
                }
            }
            
            Debug.Log($"Icon Mapping Statistics:\n" +
                     $"Emotion Core Icons: {emotionIconCount}/{System.Enum.GetValues(typeof(EmotionCoreType)).Length}\n" +
                     $"Genre Bias Icons: {genreIconCount}/{System.Enum.GetValues(typeof(GenreBiasType)).Length}\n" +
                     $"Default Emotion Icon: {(defaultEmotionIcon != null ? "Present" : "Missing")}\n" +
                     $"Default Genre Icon: {(defaultGenreIcon != null ? "Present" : "Missing")}");
        }
        
        /// <summary>
        /// Set emotion core icon
        /// </summary>
        public void SetEmotionCoreIcon(EmotionCoreType emotionCore, Sprite icon)
        {
            if (emotionIconLookup == null)
            {
                BuildIconLookups();
            }
            
            emotionIconLookup[emotionCore] = icon;
            
            // Update the serialized field
            switch (emotionCore)
            {
                case EmotionCoreType.Joy: joyIcon = icon; break;
                case EmotionCoreType.Melancholy: melancholyIcon = icon; break;
                case EmotionCoreType.Energy: energyIcon = icon; break;
                case EmotionCoreType.Calm: calmIcon = icon; break;
                case EmotionCoreType.Passion: passionIcon = icon; break;
                case EmotionCoreType.Mystery: mysteryIcon = icon; break;
                case EmotionCoreType.Neutral: neutralIcon = icon; break;
            }
        }
        
        /// <summary>
        /// Set genre bias icon
        /// </summary>
        public void SetGenreBiasIcon(GenreBiasType genreBias, Sprite icon)
        {
            if (genreIconLookup == null)
            {
                BuildIconLookups();
            }
            
            genreIconLookup[genreBias] = icon;
            
            // Update the serialized field
            switch (genreBias)
            {
                case GenreBiasType.Pop: popIcon = icon; break;
                case GenreBiasType.Rock: rockIcon = icon; break;
                case GenreBiasType.Electronic: electronicIcon = icon; break;
                case GenreBiasType.Classical: classicalIcon = icon; break;
                case GenreBiasType.Jazz: jazzIcon = icon; break;
                case GenreBiasType.Folk: folkIcon = icon; break;
                case GenreBiasType.HipHop: hipHopIcon = icon; break;
                case GenreBiasType.Experimental: experimentalIcon = icon; break;
            }
        }
        
        /// <summary>
        /// Load icons from Resources folder
        /// </summary>
        [ContextMenu("Load Icons from Resources")]
        public void LoadIconsFromResources()
        {
            // Load emotion core icons
            joyIcon = LoadIconFromResources("EmotionCore/Joy");
            melancholyIcon = LoadIconFromResources("EmotionCore/Melancholy");
            energyIcon = LoadIconFromResources("EmotionCore/Energy");
            calmIcon = LoadIconFromResources("EmotionCore/Calm");
            passionIcon = LoadIconFromResources("EmotionCore/Passion");
            mysteryIcon = LoadIconFromResources("EmotionCore/Mystery");
            neutralIcon = LoadIconFromResources("EmotionCore/Neutral");
            
            // Load genre bias icons
            popIcon = LoadIconFromResources("GenreBias/Pop");
            rockIcon = LoadIconFromResources("GenreBias/Rock");
            electronicIcon = LoadIconFromResources("GenreBias/Electronic");
            classicalIcon = LoadIconFromResources("GenreBias/Classical");
            jazzIcon = LoadIconFromResources("GenreBias/Jazz");
            folkIcon = LoadIconFromResources("GenreBias/Folk");
            hipHopIcon = LoadIconFromResources("GenreBias/HipHop");
            experimentalIcon = LoadIconFromResources("GenreBias/Experimental");
            
            // Load default icons
            defaultEmotionIcon = LoadIconFromResources("Default/DefaultEmotion");
            defaultGenreIcon = LoadIconFromResources("Default/DefaultGenre");
            
            // Rebuild lookups
            BuildIconLookups();
            
            Debug.Log("Icons loaded from Resources folder");
        }
        
        /// <summary>
        /// Load icon from Resources folder
        /// </summary>
        private Sprite LoadIconFromResources(string path)
        {
            var sprite = Resources.Load<Sprite>(path);
            if (sprite == null)
            {
                Debug.LogWarning($"Could not load icon from Resources/{path}");
            }
            return sprite;
        }
    }
}