using System;
using System.Collections.Generic;
using MIFF.Core;
using MIFF.SyncPure;

namespace MIFF.FusionPure
{
    /// <summary>
    /// Describes fusion compatibility and outcomes.
    /// Provides a simple registry of valid pairs and optional constraints (sync, flags, items).
    /// </summary>
    [Serializable]
    public class FusionRules
    {
        public class FusionPairRule
        {
            public string speciesA;
            public string speciesB;
            public string resultSpeciesID;
            public int minCombinedSync = 0;           // sum of sync levels required
            public List<string> requiredFlags = new List<string>();
            public List<string> requiredItems = new List<string>();
            public List<string> inheritedTraits = new List<string>();
        }

        private readonly List<FusionPairRule> pairRules = new List<FusionPairRule>();

        public void AddPairRule(FusionPairRule rule)
        {
            if (rule != null) pairRules.Add(rule);
        }

        public FusionPairRule FindMatch(string speciesA, string speciesB)
        {
            foreach (var r in pairRules)
            {
                if ((r.speciesA == speciesA && r.speciesB == speciesB) || (r.speciesA == speciesB && r.speciesB == speciesA))
                    return r;
            }
            return null;
        }

        public bool ConstraintsMet(FusionPairRule rule, PlayerContext ctx, string spiritIDA, string spiritIDB)
        {
            if (rule == null) return false;
            // Sync check via SyncManager on context (optional)
            var syncMgr = ctx?.GetType().GetProperty("SyncManager")?.GetValue(ctx) as SyncManager;
            int combinedSync = 0;
            if (syncMgr != null)
            {
                combinedSync = syncMgr.GetSyncLevel(spiritIDA) + syncMgr.GetSyncLevel(spiritIDB);
                if (combinedSync < rule.minCombinedSync) return false;
            }

            // Flag check via LoreFlagManager or GameData.onboardingFlags
            foreach (var f in rule.requiredFlags)
            {
                bool ok = false;
                var lfm = ctx?.GetType().GetProperty("LoreFlagManager")?.GetValue(ctx);
                var has = lfm?.GetType().GetMethod("HasLoreFlag");
                if (has != null)
                {
                    try { ok = (bool)has.Invoke(lfm, new object[] { f }); } catch { ok = false; }
                }
                if (!ok)
                {
                    var gd = ctx?.GetType().GetProperty("GameData")?.GetValue(ctx);
                    var flagsField = gd?.GetType().GetField("onboardingFlags");
                    var dict = flagsField?.GetValue(gd) as System.Collections.IDictionary;
                    ok = dict != null && dict.Contains(f) && (bool)dict[f] == true;
                }
                if (!ok) return false;
            }

            // Item check via inventory adapter
            var inv = Economy.PlayerAdapters.GetInventory(ctx);
            foreach (var item in rule.requiredItems)
            {
                if (inv == null || inv.GetCount(item) <= 0) return false;
            }

            return true;
        }

        public IReadOnlyList<string> GetInheritedTraits(FusionPairRule rule)
        {
            return rule?.inheritedTraits ?? new List<string>();
        }
    }
}

