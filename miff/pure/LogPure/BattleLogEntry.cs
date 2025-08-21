using System;

namespace MIFF.Pure.Log
{
    /// <summary>
    /// Immutable representation of a single battle log entry for CLI playback.
    /// </summary>
    public class BattleLogEntry
    {
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
        public int ActorId { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public int TargetId { get; set; }
        public string Result { get; set; } = string.Empty;
        public string? DebugNotes { get; set; }

        // Optional extensions
        public string? Phase { get; set; }
        public int? DamageDealt { get; set; }
        public string? StatusApplied { get; set; }
        public int? TurnNumber { get; set; }
    }
}

