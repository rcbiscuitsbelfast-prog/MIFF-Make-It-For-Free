using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.ChallengesPure
{
    /// <summary>
    /// Pure C# battle challenge definition with availability logic.
    /// </summary>
    [Serializable]
    public class BattleChallenge
    {
        public string challengeID;
        public string name;
        public string description;

        public List<string> opponentTeam = new List<string>(); // list of speciesIDs
        public ChallengeRuleset ruleset = new ChallengeRuleset();
        public Dictionary<string, int> rewards = new Dictionary<string, int>();

        // Optional hooks
        public List<string> loreFlagsToSet = new List<string>();
        public Dictionary<string, int> syncBoosts = new Dictionary<string, int>(); // spiritID -> delta

        // Availability conditions (simple examples via reflection adapters)
        public List<string> requiredFlags = new List<string>();
        public string requiredLocationID;

        public bool IsAvailable(PlayerContext ctx)
        {
            if (ctx == null) return true;
            // Check flags
            foreach (var f in requiredFlags)
            {
                bool ok = false;
                var lfm = ctx.GetType().GetProperty("LoreFlagManager")?.GetValue(ctx);
                var has = lfm?.GetType().GetMethod("HasLoreFlag");
                if (has != null)
                {
                    try { ok = (bool)has.Invoke(lfm, new object[] { f }); } catch { ok = false; }
                }
                if (!ok)
                {
                    var gd = ctx.GetType().GetProperty("GameData")?.GetValue(ctx);
                    var flagsField = gd?.GetType().GetField("onboardingFlags");
                    var dict = flagsField?.GetValue(gd) as System.Collections.IDictionary;
                    ok = dict != null && dict.Contains(f) && (bool)dict[f] == true;
                }
                if (!ok) return false;
            }

            // Check location
            if (!string.IsNullOrEmpty(requiredLocationID))
            {
                var prop = ctx.GetType().GetProperty("CurrentLocationID");
                var loc = prop?.GetValue(ctx) as string;
                if (loc != requiredLocationID) return false;
            }

            return true;
        }
    }
}

