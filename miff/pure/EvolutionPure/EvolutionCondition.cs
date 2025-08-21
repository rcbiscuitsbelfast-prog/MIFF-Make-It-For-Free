using System;
using MIFF.Core;

namespace MIFF.EvolutionPure
{
    public enum EvolutionConditionType
    {
        LevelAtLeast,
        RequiresItem,
        SyncAtLeast,
        LoreFlag,
        TimeOfDay,
        AtLocation
    }

    /// <summary>
    /// A single evolution condition with simple parameters.
    /// Extend by subclassing or adding new types and parameter usage.
    /// </summary>
    [Serializable]
    public class EvolutionCondition
    {
        public EvolutionConditionType conditionType;
        public int intValue;        // level threshold, sync threshold, hour, etc.
        public string stringValue;  // itemID, flagID, locationID, time segment, etc.

        public bool IsMet(Spirits.SpiritInstance spirit, PlayerContext ctx)
        {
            switch (conditionType)
            {
                case EvolutionConditionType.LevelAtLeast:
                    return spirit != null && spirit.Level >= intValue;
                case EvolutionConditionType.RequiresItem:
                    // Read inventory via adapter
                    var inv = Economy.PlayerAdapters.GetInventory(ctx);
                    return inv != null && inv.GetCount(stringValue) > 0;
                case EvolutionConditionType.SyncAtLeast:
                    return spirit != null && spirit.GetSyncPercentage() >= intValue;
                case EvolutionConditionType.LoreFlag:
                    return CheckFlag(ctx, stringValue);
                case EvolutionConditionType.TimeOfDay:
                    return CheckTimeOfDay(intValue);
                case EvolutionConditionType.AtLocation:
                    return CheckLocation(ctx, stringValue);
                default:
                    return false;
            }
        }

        private bool CheckFlag(PlayerContext ctx, string flagKey)
        {
            if (ctx == null || string.IsNullOrEmpty(flagKey)) return false;
            var gameData = ctx.GetType().GetProperty("GameData")?.GetValue(ctx);
            var flagsField = gameData?.GetType().GetField("onboardingFlags");
            if (flagsField == null) return false;
            var dict = flagsField.GetValue(gameData) as System.Collections.IDictionary;
            return dict != null && dict.Contains(flagKey) && (bool)dict[flagKey] == true;
        }

        private bool CheckTimeOfDay(int hourMin)
        {
            // Simple example: current hour >= hourMin
            return DateTime.Now.Hour >= hourMin;
        }

        private bool CheckLocation(PlayerContext ctx, string locationID)
        {
            if (ctx == null || string.IsNullOrEmpty(locationID)) return false;
            // Reflect a CurrentLocationID string on context if provided by host game
            var prop = ctx.GetType().GetProperty("CurrentLocationID");
            var val = prop?.GetValue(ctx) as string;
            return val == locationID;
        }
    }
}

