using System;
using System.Collections.Generic;
using UnityEngine;

namespace NewBark.Lore
{
    [Serializable]
    public class LoreDataList
    {
        public GameDataEntry[] entries;

        [Serializable]
        public class GameDataEntry
        {
            public string id;
            public string title;
            public string body;
            public string[] tags;
            public string unlockHint;
        }
    }

    public class LoreDatabase : MonoBehaviour
    {
        public static LoreDatabase Instance { get; private set; }
        private Dictionary<string, LoreDataList.GameDataEntry> idToLore = new Dictionary<string, LoreDataList.GameDataEntry>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            LoadFromResources("lore/lore");
        }

        public void LoadFromResources(string path)
        {
            idToLore.Clear();
            var asset = Resources.Load<TextAsset>(path);
            if (asset == null)
            {
                Debug.LogWarning("LoreDatabase: lore JSON not found at Resources/" + path + ".json");
                return;
            }
            try
            {
                var list = JsonUtility.FromJson<LoreDataList>(asset.text);
                if (list != null && list.entries != null)
                {
                    foreach (var e in list.entries)
                    {
                        idToLore[e.id] = e;
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning("LoreDatabase: failed to parse lore JSON: " + e.Message);
            }
        }

        public LoreDataList.GameDataEntry Get(string id)
        {
            return idToLore.TryGetValue(id, out var e) ? e : null;
        }

        public IEnumerable<LoreDataList.GameDataEntry> All()
        {
            return idToLore.Values;
        }
    }
}