using System;

namespace MIFF.Pure.Combat
{
    public enum MoveCategory
    {
        Status = 0,
        Physical = 1,
        Special = 2
    }

    /// <summary>
    /// Remix-safe move metadata. Pure C# container type.
    /// </summary>
    public class MoveData
    {
        public string MoveId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public MoveCategory Category { get; set; }
        public int Power { get; set; } = 0; // 0 for status moves
        public float Accuracy { get; set; } = 1.0f; // 0..1
        public int Cost { get; set; } = 0;
        public string TypeTag { get; set; } = "neutral";

        // Optional hooks for future systems
        public string? StatusEffectId { get; set; }
        public string? AnimationTag { get; set; }
    }
}

