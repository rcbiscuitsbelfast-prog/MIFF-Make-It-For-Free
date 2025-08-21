using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.LorePure
{
    /// <summary>
    /// Tracks unlocked lore entries and provides query methods.
    /// </summary>
    [Serializable]
    public class LoreCodexManager
    {
        private readonly Dictionary<string, LoreEntry> all = new Dictionary<string, LoreEntry>();
        private readonly HashSet<string> unlocked = new HashSet<string>();

        public void RegisterLore(LoreEntry entry)
        {
            if (entry == null || string.IsNullOrEmpty(entry.loreID)) return;
            all[entry.loreID] = entry;
        }

        public void UnlockLore(string loreID)
        {
            if (string.IsNullOrEmpty(loreID)) return;
            unlocked.Add(loreID);
        }

        public bool IsLoreUnlocked(string loreID)
        {
            return unlocked.Contains(loreID);
        }

        public List<LoreEntry> GetUnlockedLore()
        {
            return unlocked.Select(id => all.TryGetValue(id, out var e) ? e : null).Where(e => e != null).ToList();
        }

        public IEnumerable<LoreEntry> GetAllLore() => all.Values;
    }
}

