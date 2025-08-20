using System.Collections.Generic;
using System.Linq;
using NewBark.SpiritBattles.Objects.Creatures;
using UnityEngine;

namespace NewBark.Databases
{
    [CreateAssetMenu(fileName = "SpiritDatabase", menuName = "Remix/Databases/Spirit Database", order = 0)]
    public class SpiritDatabase : ScriptableObject
    {
        public SpiritSpecies[] spirits;

        private Dictionary<string, SpiritSpecies> _byId;

        private void OnEnable()
        {
            BuildLookup();
        }

        private void OnValidate()
        {
            BuildLookup();
            ValidateUniqueIds();
        }

        private void BuildLookup()
        {
            _byId = new Dictionary<string, SpiritSpecies>();
            if (spirits == null) return;
            foreach (var s in spirits)
            {
                if (!s || string.IsNullOrEmpty(s.spiritID)) continue;
                if (!_byId.ContainsKey(s.spiritID))
                {
                    _byId.Add(s.spiritID, s);
                }
            }
        }

        private void ValidateUniqueIds()
        {
            if (spirits == null) return;
            var groups = spirits.Where(s => s)
                .GroupBy(s => s.spiritID)
                .Where(g => !string.IsNullOrEmpty(g.Key) && g.Count() > 1);
            foreach (var g in groups)
            {
                Debug.LogWarning($"[SpiritDatabase] Duplicate spiritID '{g.Key}' count={g.Count()}", this);
            }
            var anyNull = spirits.Any(s => s == null);
            if (anyNull)
            {
                Debug.LogWarning("[SpiritDatabase] Null SpiritSpecies reference found.", this);
            }
        }

        public SpiritSpecies GetByID(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            if (_byId == null || _byId.Count == 0) BuildLookup();
            _byId.TryGetValue(id, out var s);
            return s;
        }
    }
}

