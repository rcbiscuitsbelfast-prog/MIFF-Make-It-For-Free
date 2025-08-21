using System.Collections.Generic;
using UnityEngine;

namespace NewBark.Localization
{
    public class LocalizationManager : MonoBehaviour
    {
        public static LocalizationManager Instance { get; private set; }

        [Tooltip("Locale code, e.g., en, fr")]
        public string currentLocale = "en";

        private Dictionary<string, string> translations = new Dictionary<string, string>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("LocalizationManager initialized (singleton, DontDestroyOnLoad).");
            LoadLocale(currentLocale);
        }

        public void LoadLocale(string locale)
        {
            currentLocale = locale;
            translations.Clear();
            var textAsset = Resources.Load<TextAsset>("locales/" + locale);
            if (textAsset == null)
            {
                Debug.LogWarning("LocalizationManager: Locale not found: " + locale);
                return;
            }
            try
            {
                var dict = JsonUtility.FromJson<SerializableDictionary>(textAsset.text);
                if (dict != null && dict.keys != null)
                {
                    for (int i = 0; i < dict.keys.Length; i++)
                    {
                        translations[dict.keys[i]] = dict.values[i];
                    }
                }
            }
            catch
            {
                Debug.LogWarning("LocalizationManager: Failed to parse locale JSON for " + locale);
            }
        }

        public string T(string textId)
        {
            if (string.IsNullOrEmpty(textId)) return string.Empty;
            return translations.TryGetValue(textId, out var v) ? v : textId;
        }

        [System.Serializable]
        private class SerializableDictionary
        {
            public string[] keys;
            public string[] values;
        }
    }
}