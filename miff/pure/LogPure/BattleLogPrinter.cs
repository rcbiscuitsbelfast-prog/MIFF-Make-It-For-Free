using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Pure.Log
{
    /// <summary>
    /// Formats a battle log for CLI readability with turns, actions, and outcomes.
    /// </summary>
    public static class BattleLogPrinter
    {
        public static void PrintLog(List<BattleLogEntry> log)
        {
            if (log == null || log.Count == 0)
            {
                Console.WriteLine("(no log)");
                return;
            }

            int? currentTurn = null;
            foreach (var e in log.OrderBy(e => e.TimestampUtc))
            {
                if (e.TurnNumber != null && e.TurnNumber != currentTurn)
                {
                    currentTurn = e.TurnNumber;
                    Console.WriteLine($"\n=== Turn {currentTurn} ===");
                }

                if (e.ActionType == "phase")
                {
                    Console.WriteLine($"[Phase] {e.Result}");
                    continue;
                }

                var parts = new List<string>();
                parts.Add($"Actor {e.ActorId}");
                parts.Add($"uses {e.ActionType}");
                if (e.TargetId != 0) parts.Add($"on {e.TargetId}");
                parts.Add($"→ {e.Result}");
                if (e.DamageDealt.HasValue) parts.Add($"dmg {e.DamageDealt.Value}");
                if (!string.IsNullOrEmpty(e.StatusApplied)) parts.Add($"status {e.StatusApplied}");
                if (!string.IsNullOrEmpty(e.DebugNotes)) parts.Add($"({e.DebugNotes})");

                Console.WriteLine(string.Join(" ", parts));
            }
        }
    }
}

