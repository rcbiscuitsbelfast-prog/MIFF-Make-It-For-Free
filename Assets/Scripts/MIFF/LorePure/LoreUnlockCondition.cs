using System;
using System.Collections;
using System.Collections.Generic;
using MIFF.Core;
using MIFF.SyncPure;

namespace MIFF.LorePure
{
    public enum LoreConditionType
    {
        QuestFlag,
        SpiritCaptured,
        SyncLevelReached,
        LocationVisited,
        ManualUnlock
    }

    /// <summary>
    /// Describes a single unlock condition. Uses reflection-based adapters to avoid Unity dependencies.
    /// </summary>
    [Serializable]
    public class LoreUnlockCondition
    {
        public LoreConditionType conditionType;
        public string stringValue; // flagID, spiritID, locationID
        public int intValue;       // sync threshold

        public bool IsMet(PlayerContext ctx, LoreEntry entry)
        {
            switch (conditionType)
            {
                case LoreConditionType.QuestFlag:
                    return HasQuestFlag(ctx, string.IsNullOrEmpty(stringValue) ? entry.questID : stringValue);
                case LoreConditionType.SpiritCaptured:
                    return IsSpiritCaptured(ctx, string.IsNullOrEmpty(stringValue) ? entry.relatedSpiritID : stringValue);
                case LoreConditionType.SyncLevelReached:
                    return IsSyncReached(ctx,
                        string.IsNullOrEmpty(stringValue) ? entry.relatedSpiritID : stringValue,
                        intValue > 0 ? intValue : entry.syncThreshold);
                case LoreConditionType.LocationVisited:
                    return IsLocationVisited(ctx, string.IsNullOrEmpty(stringValue) ? entry.locationID : stringValue);
                case LoreConditionType.ManualUnlock:
                default:
                    return false;
            }
        }

        private bool HasQuestFlag(PlayerContext ctx, string flagID)
        {
            if (ctx == null || string.IsNullOrEmpty(flagID)) return false;
            // Prefer a LoreFlagManager/QuestFlagManager if provided
            var lfm = ctx.GetType().GetProperty("LoreFlagManager")?.GetValue(ctx);
            var hasFlagMethod = lfm?.GetType().GetMethod("HasLoreFlag");
            if (hasFlagMethod != null)
            {
                try
                {
                    return (bool)hasFlagMethod.Invoke(lfm, new object[] { flagID });
                }
                catch { }
            }

            // Fallback to GameData.onboardingFlags
            var gd = ctx.GetType().GetProperty("GameData")?.GetValue(ctx);
            var flagsField = gd?.GetType().GetField("onboardingFlags");
            var dict = flagsField?.GetValue(gd) as IDictionary;
            return dict != null && dict.Contains(flagID) && (bool)dict[flagID] == true;
        }

        private bool IsSpiritCaptured(PlayerContext ctx, string spiritID)
        {
            if (ctx == null || string.IsNullOrEmpty(spiritID)) return false;
            var gd = ctx.GetType().GetProperty("GameData")?.GetValue(ctx);
            var setField = gd?.GetType().GetField("capturedSpiritIDs");
            var set = setField?.GetValue(gd) as IEnumerable<string>;
            if (set == null) return false;
            foreach (var s in set) if (s == spiritID) return true;
            return false;
        }

        private bool IsSyncReached(PlayerContext ctx, string spiritID, int threshold)
        {
            if (ctx == null || string.IsNullOrEmpty(spiritID) || threshold <= 0) return false;
            var syncMgr = ctx.GetType().GetProperty("SyncManager")?.GetValue(ctx) as SyncManager;
            if (syncMgr == null) return false;
            return syncMgr.GetSyncLevel(spiritID) >= threshold;
        }

        private bool IsLocationVisited(PlayerContext ctx, string locationID)
        {
            if (ctx == null || string.IsNullOrEmpty(locationID)) return false;
            var gd = ctx.GetType().GetProperty("GameData")?.GetValue(ctx);
            var setField = gd?.GetType().GetField("visitedLocationIDs");
            var set = setField?.GetValue(gd) as IEnumerable<string>;
            if (set == null) return false;
            foreach (var s in set) if (s == locationID) return true;
            return false;
        }
    }
}

