using System;

namespace MIFF.Pure.Log
{
    /// <summary>
    /// Minimal result model for actions to log outcomes without engine coupling.
    /// </summary>
    public class BattleResult
    {
        public bool Success { get; set; }
        public int? Damage { get; set; }
        public string? StatusApplied { get; set; }
        public string Summary => Success ? "success" : "fail";
    }

    /// <summary>
    /// Minimal effect descriptor for logging.
    /// </summary>
    public class BattleEffect
    {
        public string EffectId { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? SourceActorId { get; set; }
        public int? TargetActorId { get; set; }
    }
}

