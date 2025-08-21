using System;
using System.Collections.Generic;

namespace MIFF.Pure.AI
{
    /// <summary>
    /// Behavior weights for deterministic AI decisions.
    /// - Aggression: prefer higher damage / type advantage / kill secure
    /// - Caution: prefer lower cost, avoid risky low-accuracy if present
    /// - Efficiency: weigh move cost versus resource points
    /// Optional: scripted overrides by rule key
    /// </summary>
    [Serializable]
    public class AIPolicy
    {
        public string PolicyId { get; set; } = "default";
        public float Aggression { get; set; } = 1.0f;
        public float Caution { get; set; } = 1.0f;
        public float Efficiency { get; set; } = 1.0f;

        // Optional scripted overrides, e.g., "force_move_if_hp_below:basic_strike:0.2"
        public List<string> OverrideRules { get; set; } = new List<string>();

        public static AIPolicy Balanced(string id = "balanced") => new AIPolicy
        {
            PolicyId = id,
            Aggression = 1.0f,
            Caution = 1.0f,
            Efficiency = 1.0f
        };
    }
}

