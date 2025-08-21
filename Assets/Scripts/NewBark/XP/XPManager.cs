using System.Collections.Generic;
using NewBark.State;
using UnityEngine;

namespace NewBark.XP
{
    public class XPManager : MonoBehaviour
    {
        public static XPManager Instance { get; private set; }

        private Dictionary<string, GameData.XPEntry> idToXp = new Dictionary<string, GameData.XPEntry>();
        private Dictionary<string, GameData.LevelEntry> idToLevel = new Dictionary<string, GameData.LevelEntry>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            RebuildCache();
        }

        public void RebuildCache()
        {
            idToXp.Clear(); idToLevel.Clear();
            if (GameManager.Data?.xp != null)
            {
                foreach (var x in GameManager.Data.xp) idToXp[x.id] = x;
            }
            if (GameManager.Data?.levels != null)
            {
                foreach (var l in GameManager.Data.levels) idToLevel[l.id] = l;
            }
        }

        private GameData.XPEntry GetOrCreateXp(string id)
        {
            if (!idToXp.TryGetValue(id, out var e))
            {
                e = new GameData.XPEntry {id = id, xp = 0};
                GameManager.Data.xp.Add(e);
                idToXp[id] = e;
            }
            return e;
        }

        private GameData.LevelEntry GetOrCreateLevel(string id)
        {
            if (!idToLevel.TryGetValue(id, out var e))
            {
                e = new GameData.LevelEntry {id = id, state = new GameData.LevelState {level = 1, xp = 0, nextLevelXp = 100}};
                GameManager.Data.levels.Add(e);
                idToLevel[id] = e;
            }
            return e;
        }

        public void AddXP(string id, int amount)
        {
            var xp = GetOrCreateXp(id);
            var lvl = GetOrCreateLevel(id);
            xp.xp += amount;
            lvl.state.xp += amount;
            Debug.Log($"XP: {id} +{amount} (total {xp.xp})");
        }

        public int GetLevel(string id)
        {
            return GetOrCreateLevel(id).state.level;
        }

        public bool CheckLevelUp(string id)
        {
            var lvl = GetOrCreateLevel(id).state;
            return lvl.xp >= lvl.nextLevelXp;
        }

        public void ApplyLevelUp(string id)
        {
            var entry = GetOrCreateLevel(id);
            var state = entry.state;
            if (state.xp < state.nextLevelXp) return;
            var next = LevelUpManager.Instance.GetLevel(state.level + 1);
            state.level += 1;
            state.xp -= state.nextLevelXp;
            state.nextLevelXp = next?.nextLevelXp ?? (state.nextLevelXp + 100);
            Debug.Log($"LEVEL UP: {id} -> L{state.level}");
        }
    }
}