using System.Collections.Generic;
using System.Linq;
using NewBark.State;
using UnityEngine;

namespace NewBark.Lore
{
    public class CodexManager : MonoBehaviour
    {
        public static CodexManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("CodexManager initialized (singleton, DontDestroyOnLoad).");
        }

        public void LoadLoreDatabase(string resourcesPath)
        {
            LoreDatabase.Instance.LoadFromResources(resourcesPath);
        }

        public void UnlockLore(string id)
        {
            if (!GameManager.Data.codex.unlocked.Contains(id))
            {
                GameManager.Data.codex.unlocked.Add(id);
                Debug.Log("Codex: unlocked " + id);
            }
        }

        public bool IsUnlocked(string id)
        {
            return GameManager.Data.codex.unlocked.Contains(id);
        }

        public IEnumerable<GameData.LoreEntry> GetUnlockedLore()
        {
            // prefer preloaded lore entries if present, fallback to database entries
            var ids = GameManager.Data.codex.unlocked;
            var preload = GameManager.Data.loreEntries.ToDictionary(e => e.id, e => e);
            foreach (var id in ids)
            {
                if (preload.TryGetValue(id, out var le))
                {
                    yield return le;
                    continue;
                }
                var db = LoreDatabase.Instance.Get(id);
                if (db != null)
                {
                    yield return new GameData.LoreEntry
                    {
                        id = db.id,
                        title = db.title,
                        body = db.body,
                        tags = db.tags,
                        unlockHint = db.unlockHint
                    };
                }
            }
        }
    }
}