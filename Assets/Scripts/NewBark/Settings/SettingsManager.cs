using System;
using NewBark.State;
using UnityEngine;

namespace NewBark.Settings
{
    public class SettingsManager : MonoBehaviour
    {
        public static SettingsManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("SettingsManager initialized (singleton, DontDestroyOnLoad).");
        }

        public object GetSetting(string key)
        {
            var s = GameManager.Data.settings;
            switch (key)
            {
                case nameof(GameData.Settings.musicVolume): return s.musicVolume;
                case nameof(GameData.Settings.sfxVolume): return s.sfxVolume;
                case nameof(GameData.Settings.language): return s.language;
                case nameof(GameData.Settings.showSubtitles): return s.showSubtitles;
                default: return null;
            }
        }

        public void SetSetting(string key, object value)
        {
            var s = GameManager.Data.settings;
            try
            {
                switch (key)
                {
                    case nameof(GameData.Settings.musicVolume): s.musicVolume = Convert.ToSingle(value); break;
                    case nameof(GameData.Settings.sfxVolume): s.sfxVolume = Convert.ToSingle(value); break;
                    case nameof(GameData.Settings.language): s.language = Convert.ToString(value); break;
                    case nameof(GameData.Settings.showSubtitles): s.showSubtitles = Convert.ToBoolean(value); break;
                    default: Debug.LogWarning("Unknown setting: " + key); break;
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning("SettingsManager: failed to set setting '" + key + "': " + e.Message);
            }
        }

        public void ApplySettings()
        {
            // Optional: hook into audio/localization subsystems in future
            Debug.Log("SettingsManager: ApplySettings called");
        }
    }
}