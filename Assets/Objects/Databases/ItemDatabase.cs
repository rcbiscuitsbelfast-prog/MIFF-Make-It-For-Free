using System.Collections.Generic;
using System.Linq;
using NewBark.SpiritBattles.Objects.Items;
using UnityEngine;

namespace NewBark.Databases
{
    [CreateAssetMenu(fileName = "ItemDatabase", menuName = "Remix/Databases/Item Database", order = 0)]
    public class ItemDatabase : ScriptableObject
    {
        public BattleItem[] items;
        private Dictionary<string, BattleItem> _byId;

        private void OnEnable() { BuildLookup(); }
        private void OnValidate() { BuildLookup(); ValidateUniqueIds(); }

        private void BuildLookup()
        {
            _byId = new Dictionary<string, BattleItem>();
            if (items == null) return;
            foreach (var it in items)
            {
                if (!it || string.IsNullOrEmpty(it.itemID)) continue;
                if (!_byId.ContainsKey(it.itemID)) _byId.Add(it.itemID, it);
            }
        }

        private void ValidateUniqueIds()
        {
            if (items == null) return;
            var groups = items.Where(i => i)
                .GroupBy(i => i.itemID)
                .Where(g => !string.IsNullOrEmpty(g.Key) && g.Count() > 1);
            foreach (var g in groups)
            {
                Debug.LogWarning($"[ItemDatabase] Duplicate itemID '{g.Key}' count={g.Count()}", this);
            }
            if (items.Any(i => i == null)) Debug.LogWarning("[ItemDatabase] Null BattleItem reference found.", this);
        }

        public BattleItem GetByID(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            if (_byId == null || _byId.Count == 0) BuildLookup();
            _byId.TryGetValue(id, out var it);
            return it;
        }
    }
}

