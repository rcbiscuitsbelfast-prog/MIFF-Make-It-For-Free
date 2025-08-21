using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Spirits;

namespace MIFF.SpiritsPure
{
    /// <summary>
    /// Pure C# sorter for SpiritDex entries.
    /// </summary>
    [Serializable]
    public class SpiritDexSorter
    {
        public List<SpiritDexEntry> Sort(List<SpiritDexEntry> entries, SortOption option,
                                         IDictionary<string, int> spiritIdToSync = null,
                                         IDictionary<string, DateTime> spiritIdToCaptureDate = null)
        {
            IEnumerable<SpiritDexEntry> q = entries ?? new List<SpiritDexEntry>();

            switch (option)
            {
                case SortOption.AlphabeticalAsc:
                    q = q.OrderBy(e => e.spiritName);
                    break;
                case SortOption.AlphabeticalDesc:
                    q = q.OrderByDescending(e => e.spiritName);
                    break;
                case SortOption.SyncAsc:
                    q = q.OrderBy(e => GetSync(spiritIdToSync, e.spiritID));
                    break;
                case SortOption.SyncDesc:
                    q = q.OrderByDescending(e => GetSync(spiritIdToSync, e.spiritID));
                    break;
                case SortOption.RarityAsc:
                    q = q.OrderBy(e => e.rarity);
                    break;
                case SortOption.RarityDesc:
                    q = q.OrderByDescending(e => e.rarity);
                    break;
                default:
                    q = q.OrderBy(e => e.spiritName);
                    break;
            }

            return q.ToList();
        }

        private int GetSync(IDictionary<string, int> map, string id)
        {
            return map != null && map.TryGetValue(id, out var s) ? s : 0;
        }
    }
}

