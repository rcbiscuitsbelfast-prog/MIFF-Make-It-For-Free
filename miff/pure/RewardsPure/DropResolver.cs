using System;
using System.Linq;
using MIFF.Pure.RNG;

namespace MIFF.Pure.Rewards
{
    /// <summary>
    /// Weighted random selection from a drop table. Deterministic with IRNGProvider.
    /// </summary>
    public class DropResolver
    {
        private readonly IRNGProvider _rng;
        public DropResolver(IRNGProvider rng) { _rng = rng; }

        public string? Resolve(DropTable table)
        {
            if (table == null || table.Entries == null || table.Entries.Count == 0) return null;
            var total = table.Entries.Sum(e => Math.Max(0f, e.Weight));
            if (total <= 0) return null;
            var r = _rng.NextFloat(0f, total);
            float acc = 0f;
            foreach (var e in table.Entries)
            {
                acc += Math.Max(0f, e.Weight);
                if (r <= acc) return e.ItemId;
            }
            return table.Entries[table.Entries.Count - 1].ItemId; // fallback
        }
    }
}

