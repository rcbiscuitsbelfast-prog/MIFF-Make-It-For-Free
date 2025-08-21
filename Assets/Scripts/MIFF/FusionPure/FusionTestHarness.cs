using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.FusionPure
{
    /// <summary>
    /// Console tester for spirit fusion.
    /// </summary>
    [Serializable]
    public class FusionTestHarness
    {
        private class HeadlessPlayerContext : PlayerContext
        {
            public object GameData { get; set; }
            public object LoreFlagManager { get; set; }
            public object SyncManager { get; set; }
            public Dictionary<string, int> InventoryCounts { get; } = new Dictionary<string, int>();
            public HeadlessPlayerContext() : base(null) { }
        }

        public void Run()
        {
            Console.WriteLine("=== Fusion Test Harness ===");
            var ctx = new HeadlessPlayerContext();
            var manager = new FusionManager(ctx);

            // Define a rule
            manager.Rules.AddPairRule(new FusionRules.FusionPairRule
            {
                speciesA = "sparkling_idol",
                speciesB = "groove_spirit",
                resultSpeciesID = "harmonic_muse",
                minCombinedSync = 10,
                requiredFlags = new List<string>(),
                requiredItems = new List<string> { "fusion_charm" },
                inheritedTraits = new List<string> { "rhythm_boost", "shine" }
            });

            // Provide required item
            ctx.InventoryCounts["fusion_charm"] = 1;

            // Create two sample spirits
            var a = new Spirits.SpiritInstance("sparkling_idol");
            var b = new Spirits.SpiritInstance("groove_spirit");

            Console.WriteLine($"Can fuse? {manager.CanFuse(a, b)}");
            var result = manager.Fuse(a, b);
            Console.WriteLine(result);
        }
    }
}

