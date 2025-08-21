using System;
using System.Collections.Generic;

namespace MIFF.Pure.Progression
{
    public enum XPCurveType
    {
        Linear,
        Exponential,
        Custom
    }

    /// <summary>
    /// Defines XP thresholds per level using a chosen scaling model.
    /// </summary>
    public class XPCurve
    {
        public XPCurveType Type { get; set; } = XPCurveType.Linear;
        public int MaxLevel { get; set; } = 100;
        public int BaseXP { get; set; } = 100; // baseline for linear
        public float Exponent { get; set; } = 1.5f; // for exponential
        public Dictionary<int, int> CustomThresholds { get; set; } = new Dictionary<int, int>();

        public int GetXPForLevel(int level)
        {
            level = Math.Max(1, Math.Min(MaxLevel, level));
            switch (Type)
            {
                case XPCurveType.Linear:
                    return BaseXP * (level - 1);
                case XPCurveType.Exponential:
                    return (int)Math.Floor(BaseXP * Math.Pow(level - 1, Exponent));
                case XPCurveType.Custom:
                    return CustomThresholds.TryGetValue(level, out var v) ? v : 0;
                default:
                    return 0;
            }
        }
    }
}

