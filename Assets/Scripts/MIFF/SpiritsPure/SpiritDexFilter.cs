using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Spirits;

namespace MIFF.SpiritsPure
{
    /// <summary>
    /// Pure C# filter for SpiritDex entries.
    /// </summary>
    [Serializable]
    public class SpiritDexFilter
    {
        public SpiritType? type;
        public bool? captured;                 // true=captured only, false=not captured only, null=any
        public int? minSync;                   // optional; requires external sync map supplied to Apply
        public int? maxSync;
        public bool? loreUnlocked;             // optional flag; requires external unlocked set supplied to Apply
        public bool? hasEvolved;               // true=has evolved, false=base-only

        public List<SpiritDexEntry> Apply(List<SpiritDexEntry> entries,
                                          IDictionary<string, int> spiritIdToSync = null,
                                          ISet<string> unlockedLoreIds = null)
        {
            IEnumerable<SpiritDexEntry> q = entries ?? new List<SpiritDexEntry>();

            if (type.HasValue && type.Value != SpiritType.None)
                q = q.Where(e => e.primaryType == type.Value || e.secondaryType == type.Value);

            if (captured.HasValue)
                q = q.Where(e => e.IsCaptured == captured.Value);

            if (hasEvolved.HasValue)
                q = q.Where(e => hasEvolved.Value ? e.HasEvolved() : !e.HasEvolved());

            if (minSync.HasValue || maxSync.HasValue)
            {
                int lo = minSync ?? int.MinValue;
                int hi = maxSync ?? int.MaxValue;
                if (spiritIdToSync != null)
                {
                    q = q.Where(e => spiritIdToSync.TryGetValue(e.spiritID, out var s) && s >= lo && s <= hi);
                }
                else
                {
                    // Without sync map, nothing to filter by
                    q = Enumerable.Empty<SpiritDexEntry>();
                }
            }

            if (loreUnlocked.HasValue)
            {
                if (unlockedLoreIds != null)
                {
                    q = q.Where(e => loreUnlocked.Value == unlockedLoreIds.Contains($"lore_{e.spiritID}"));
                }
                else
                {
                    // No lore map; leave unchanged
                }
            }

            return q.ToList();
        }

        public override string ToString()
        {
            return $"type={type}, captured={captured}, sync=[{minSync}-{maxSync}], lore={loreUnlocked}, evolved={hasEvolved}";
        }
    }
}

