using System;
using System.Collections.Generic;
using UnityEngine;

namespace NewBark.XP
{
    [Serializable]
    public class LevelCurve
    {
        public Entry[] levels;

        [Serializable]
        public class Entry
        {
            public int level;
            public int nextLevelXp;
            public StatBoost[] statBoosts;
            public string[] unlockedSkills;
        }

        [Serializable]
        public class StatBoost
        {
            public string stat;
            public int amount;
        }
    }

    public class LevelUpManager : MonoBehaviour
    {
        public static LevelUpManager Instance { get; private set; }
        private Dictionary<int, LevelCurve.Entry> levelMap = new Dictionary<int, LevelCurve.Entry>();
        public string resourcesPath = "levels/level_curve";

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            LoadCurve();
        }

        public void LoadCurve()
        {
            levelMap.Clear();
            var asset = Resources.Load<TextAsset>(resourcesPath);
            if (asset == null)
            {
                Debug.LogWarning("LevelUpManager: curve not found at Resources/" + resourcesPath + ".json");
                return;
            }

            try
            {
                var curve = JsonUtility.FromJson<LevelCurve>(asset.text);
                if (curve?.levels != null)
                {
                    foreach (var e in curve.levels)
                    {
                        levelMap[e.level] = e;
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning("LevelUpManager: failed to parse curve: " + e.Message);
            }
        }

        public LevelCurve.Entry GetLevel(int level)
        {
            return levelMap.TryGetValue(level, out var e) ? e : null;
        }
    }
}