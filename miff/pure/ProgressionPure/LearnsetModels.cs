using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Pure.Combat;

namespace MIFF.Pure.Progression
{
    public class LearnsetEntry
    {
        public string MoveId { get; set; } = string.Empty;
        public int UnlockLevel { get; set; } = 1;
        public string? Condition { get; set; } // optional tag, e.g., timeOfDay:night
    }

    public class LearnsetManager
    {
        private readonly Dictionary<string, List<LearnsetEntry>> _learnsets = new Dictionary<string, List<LearnsetEntry>>();
        private readonly Dictionary<string, MoveData> _moveDb = new Dictionary<string, MoveData>();

        public void RegisterMoves(IEnumerable<MoveData> moves)
        {
            foreach (var m in moves) _moveDb[m.MoveId] = m;
        }

        public void RegisterLearnset(string spiritId, IEnumerable<LearnsetEntry> entries)
        {
            _learnsets[spiritId] = entries.OrderBy(e => e.UnlockLevel).ToList();
        }

        public List<MoveData> GetAvailableMoves(SpiritInstance spirit)
        {
            if (spirit == null || string.IsNullOrWhiteSpace(spirit.SpiritId)) return new List<MoveData>();
            if (!_learnsets.TryGetValue(spirit.SpiritId, out var list)) return new List<MoveData>();
            var ids = list.Where(e => e.UnlockLevel <= spirit.Level).Select(e => e.MoveId).Distinct();
            var result = new List<MoveData>();
            foreach (var id in ids) if (_moveDb.TryGetValue(id, out var m)) result.Add(m);
            return result;
        }

        public void UnlockMovesOnLevelUp(SpiritInstance spirit)
        {
            // No-op in this simplified model; GetAvailableMoves is level-driven.
            // Extension point: emit events for newly unlocked moves.
        }
    }
}

