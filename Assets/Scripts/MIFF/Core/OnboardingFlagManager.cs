using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Core
{
    /// <summary>
    /// Manages onboarding progress flags stored in GameData
    /// </summary>
    public class OnboardingFlagManager : MonoBehaviour
    {
        [Header("Default Flags")]
        [SerializeField] private List<OnboardingFlag> defaultFlags = new List<OnboardingFlag>();
        
        [Header("Events")]
        [SerializeField] private UnityEngine.Events.UnityEvent<string, bool> onFlagChanged;
        
        private Dictionary<string, bool> flags = new Dictionary<string, bool>();
        
        public static OnboardingFlagManager Instance { get; private set; }
        
        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeFlags();
            }
            else
            {
                Destroy(gameObject);
            }
        }
        
        private void Start()
        {
            LoadFlags();
        }
        
        /// <summary>
        /// Initialize default flags
        /// </summary>
        private void InitializeFlags()
        {
            // Add default flags
            defaultFlags.Add(new OnboardingFlag
            {
                flagID = "ItemUsageTutorialCompleted",
                defaultValue = false,
                description = "Player has completed the item usage tutorial"
            });
            
            defaultFlags.Add(new OnboardingFlag
            {
                flagID = "BattleBasicsTutorialCompleted",
                defaultValue = false,
                description = "Player has completed the battle basics tutorial"
            });
            
            defaultFlags.Add(new OnboardingFlag
            {
                flagID = "SpiritSwitchingTutorialCompleted",
                defaultValue = false,
                description = "Player has completed the spirit switching tutorial"
            });
            
            defaultFlags.Add(new OnboardingFlag
            {
                flagID = "QuestSystemTutorialCompleted",
                defaultValue = false,
                description = "Player has completed the quest system tutorial"
            });
        }
        
        /// <summary>
        /// Set a flag value
        /// </summary>
        public void SetFlag(string flagID, bool value)
        {
            if (string.IsNullOrEmpty(flagID)) return;
            
            bool oldValue = GetFlag(flagID);
            flags[flagID] = value;
            
            // Only trigger event if value actually changed
            if (oldValue != value)
            {
                onFlagChanged?.Invoke(flagID, value);
                SaveFlags();
                
                Debug.Log($"Onboarding flag '{flagID}' set to {value}");
            }
        }
        
        /// <summary>
        /// Get a flag value
        /// </summary>
        public bool GetFlag(string flagID)
        {
            if (string.IsNullOrEmpty(flagID)) return false;
            
            if (flags.ContainsKey(flagID))
            {
                return flags[flagID];
            }
            
            // Return default value if not set
            var defaultFlag = defaultFlags.FirstOrDefault(f => f.flagID == flagID);
            return defaultFlag?.defaultValue ?? false;
        }
        
        /// <summary>
        /// Check if all required flags are set
        /// </summary>
        public bool AreFlagsSet(params string[] requiredFlags)
        {
            foreach (var flagID in requiredFlags)
            {
                if (!GetFlag(flagID))
                {
                    return false;
                }
            }
            return true;
        }
        
        /// <summary>
        /// Get all available flag IDs
        /// </summary>
        public List<string> GetAllFlagIDs()
        {
            return flags.Keys.ToList();
        }
        
        /// <summary>
        /// Reset all flags to default values
        /// </summary>
        [ContextMenu("Reset All Flags")]
        public void ResetAllFlags()
        {
            flags.Clear();
            foreach (var defaultFlag in defaultFlags)
            {
                flags[defaultFlag.flagID] = defaultFlag.defaultValue;
            }
            SaveFlags();
            
            Debug.Log("All onboarding flags reset to defaults");
        }
        
        /// <summary>
        /// Reset a specific flag to default
        /// </summary>
        public void ResetFlag(string flagID)
        {
            var defaultFlag = defaultFlags.FirstOrDefault(f => f.flagID == flagID);
            if (defaultFlag != null)
            {
                SetFlag(flagID, defaultFlag.defaultValue);
            }
        }
        
        /// <summary>
        /// Load flags from GameData
        /// </summary>
        private void LoadFlags()
        {
            // For now, use PlayerPrefs as a simple persistence solution
            // This can be replaced with your GameData system when ready
            var flagsJson = PlayerPrefs.GetString("MIFF_OnboardingFlags", "{}");
            try
            {
                var savedFlags = JsonUtility.FromJson<Dictionary<string, bool>>(flagsJson);
                if (savedFlags != null)
                {
                    flags = new Dictionary<string, bool>(savedFlags);
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"Failed to load onboarding flags: {e.Message}");
                flags = new Dictionary<string, bool>();
            }
            
            // Ensure all default flags exist
            foreach (var defaultFlag in defaultFlags)
            {
                if (!flags.ContainsKey(defaultFlag.flagID))
                {
                    flags[defaultFlag.flagID] = defaultFlag.defaultValue;
                }
            }
        }
        
        /// <summary>
        /// Save flags to GameData
        /// </summary>
        private void SaveFlags()
        {
            try
            {
                var flagsJson = JsonUtility.ToJson(flags);
                PlayerPrefs.SetString("MIFF_OnboardingFlags", flagsJson);
                PlayerPrefs.Save();
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Failed to save onboarding flags: {e.Message}");
            }
        }
        
        /// <summary>
        /// Get flag info for debugging
        /// </summary>
        [ContextMenu("Log All Flags")]
        public void LogAllFlags()
        {
            Debug.Log("=== Onboarding Flags ===");
            foreach (var flag in flags)
            {
                var defaultFlag = defaultFlags.FirstOrDefault(f => f.flagID == flag.Key);
                var description = defaultFlag?.description ?? "No description";
                Debug.Log($"'{flag.Key}': {flag.Value} - {description}");
            }
        }
    }
    
    /// <summary>
    /// Serializable onboarding flag definition
    /// </summary>
    [System.Serializable]
    public class OnboardingFlag
    {
        public string flagID;
        public bool defaultValue;
        [TextArea(2, 4)]
        public string description;
    }
}