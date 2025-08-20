using System.Collections.Generic;
using System.Linq;
using NewBark.SpiritBattles.Objects.Moves;
using UnityEngine;

namespace NewBark.Databases
{
    [CreateAssetMenu(fileName = "MoveDatabase", menuName = "Remix/Databases/Move Database", order = 0)]
    public class MoveDatabase : ScriptableObject
    {
        public SongMove[] moves;
        private Dictionary<string, SongMove> _byId;

        private void OnEnable() { BuildLookup(); }
        private void OnValidate() { BuildLookup(); ValidateUniqueIds(); }

        private void BuildLookup()
        {
            _byId = new Dictionary<string, SongMove>();
            if (moves == null) return;
            foreach (var m in moves)
            {
                if (!m || string.IsNullOrEmpty(m.moveID)) continue;
                if (!_byId.ContainsKey(m.moveID)) _byId.Add(m.moveID, m);
            }
        }

        private void ValidateUniqueIds()
        {
            if (moves == null) return;
            var groups = moves.Where(m => m)
                .GroupBy(m => m.moveID)
                .Where(g => !string.IsNullOrEmpty(g.Key) && g.Count() > 1);
            foreach (var g in groups)
            {
                Debug.LogWarning($"[MoveDatabase] Duplicate moveID '{g.Key}' count={g.Count()}", this);
            }
            if (moves.Any(m => m == null)) Debug.LogWarning("[MoveDatabase] Null SongMove reference found.", this);
        }

        public SongMove GetByID(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            if (_byId == null || _byId.Count == 0) BuildLookup();
            _byId.TryGetValue(id, out var m);
            return m;
        }
    }
}

