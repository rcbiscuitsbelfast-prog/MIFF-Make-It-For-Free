using System;

namespace MIFF.Pure.BattleLoop
{
    /// <summary>
    /// Describes a single battle action chosen for a turn.
    /// Designed to be engine-agnostic and deterministic when ordered by ActionQueue.
    /// </summary>
    public class BattleAction
    {
        public int ActorId { get; set; }
        public int TargetId { get; set; }
        public string MoveId { get; set; } = string.Empty;
        public int Priority { get; set; }
        public int Speed { get; set; }

        // Optional metadata
        public ActionSource Source { get; set; } = ActionSource.Unknown;
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
        public string? DebugNotes { get; set; }

        // Internal tiebreaker assigned by ActionQueue for deterministic ordering.
        internal float? TieBreakerKey { get; set; }

        public override string ToString()
        {
            return $"Actor={ActorId} Target={TargetId} Move={MoveId} Pri={Priority} Spd={Speed} Src={Source}";
        }
    }

    public enum ActionSource
    {
        Unknown = 0,
        Player = 1,
        AI = 2
    }
}

