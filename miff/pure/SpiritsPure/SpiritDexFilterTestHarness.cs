using System;
using System.Collections.Generic;
using MIFF.Spirits;

namespace MIFF.SpiritsPure
{
    /// <summary>
    /// Console tester for SpiritDex filtering and sorting.
    /// </summary>
    [Serializable]
    public class SpiritDexFilterTestHarness
    {
        public void Run()
        {
            Console.WriteLine("=== SpiritDex Filter/Sort Test Harness ===");
            var entries = SeedEntries();

            var syncMap = new Dictionary<string, int>
            {
                ["sparkling_idol"] = 35,
                ["groove_spirit"] = 10,
                ["echo_wisp"] = 55
            };
            var unlockedLore = new HashSet<string> { "lore_sparkling_idol" };

            var filter = new SpiritDexFilter { type = SpiritType.Pop, captured = true, minSync = 20 };
            var filtered = filter.Apply(entries, syncMap, unlockedLore);
            Console.WriteLine("Filtered:");
            foreach (var e in filtered) Console.WriteLine("- " + e.GetSummary());

            var sorter = new SpiritDexSorter();
            var sorted = sorter.Sort(filtered, SortOption.SyncDesc, syncMap, null);
            Console.WriteLine("\nSorted by Sync Desc:");
            foreach (var e in sorted) Console.WriteLine("- " + e.spiritName + " (sync=" + syncMap[e.spiritID] + ")");
        }

        private List<SpiritDexEntry> SeedEntries()
        {
            return new List<SpiritDexEntry>
            {
                new SpiritDexEntry("sparkling_idol", "Sparkling Idol", SpiritType.Pop) { captureStatus = CaptureStatus.Captured, rarity = SpiritRarity.Epic },
                new SpiritDexEntry("groove_spirit", "Groove Spirit", SpiritType.Pop) { captureStatus = CaptureStatus.NotCaptured, rarity = SpiritRarity.Uncommon },
                new SpiritDexEntry("echo_wisp", "Echo Wisp", SpiritType.Electronic) { captureStatus = CaptureStatus.Captured, rarity = SpiritRarity.Rare }
            };
        }
    }
}

