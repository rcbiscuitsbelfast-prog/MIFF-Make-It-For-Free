using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Pure.Log
{
    /// <summary>
    /// Compares a generated log against a golden reference for order and value equality.
    /// </summary>
    public static class GoldenLogValidator
    {
        public class Diff
        {
            public int Index { get; set; }
            public string Field { get; set; } = string.Empty;
            public string? Expected { get; set; }
            public string? Actual { get; set; }
        }

        public static bool Compare(List<BattleLogEntry> actual, List<BattleLogEntry> expected, out List<Diff> diffs)
        {
            diffs = new List<Diff>();
            int max = Math.Max(actual?.Count ?? 0, expected?.Count ?? 0);
            for (int i = 0; i < max; i++)
            {
                var a = (actual != null && i < actual.Count) ? actual[i] : null;
                var e = (expected != null && i < expected.Count) ? expected[i] : null;

                if (a == null || e == null)
                {
                    diffs.Add(new Diff { Index = i, Field = "entry", Expected = e == null ? null : "present", Actual = a == null ? null : "present" });
                    continue;
                }

                CompareField(diffs, i, "TurnNumber", e.TurnNumber?.ToString(), a.TurnNumber?.ToString());
                CompareField(diffs, i, "Phase", e.Phase, a.Phase);
                CompareField(diffs, i, "ActorId", e.ActorId.ToString(), a.ActorId.ToString());
                CompareField(diffs, i, "ActionType", e.ActionType, a.ActionType);
                CompareField(diffs, i, "TargetId", e.TargetId.ToString(), a.TargetId.ToString());
                CompareField(diffs, i, "Result", e.Result, a.Result);
                CompareField(diffs, i, "DamageDealt", e.DamageDealt?.ToString(), a.DamageDealt?.ToString());
                CompareField(diffs, i, "StatusApplied", e.StatusApplied, a.StatusApplied);
            }
            return diffs.Count == 0;
        }

        private static void CompareField(List<Diff> diffs, int index, string field, string? expected, string? actual)
        {
            if (!string.Equals(expected ?? string.Empty, actual ?? string.Empty, StringComparison.Ordinal))
            {
                diffs.Add(new Diff { Index = index, Field = field, Expected = expected, Actual = actual });
            }
        }
    }
}

