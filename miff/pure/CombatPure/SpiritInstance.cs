using System;

namespace MIFF.Pure.Combat
{
    /// <summary>
    /// Minimal battle-relevant snapshot of a spirit used for calculations.
    /// Extend as needed; keep pure and engine-independent.
    /// </summary>
    public class SpiritInstance
    {
        public int Id { get; set; }
        public string? SpiritId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string TypeTag { get; set; } = "neutral";

        // Core stats (example set). Values are expected to be non-negative.
        public int Level { get; set; } = 1;
        public int Attack { get; set; } = 10;
        public int Defense { get; set; } = 10;
        public int SpecialAttack { get; set; } = 10;
        public int SpecialDefense { get; set; } = 10;

        // HP pool for threshold checks
        public int MaxHP { get; set; } = 50;
        public int CurrentHP { get; set; } = 50;

        // Simple resource points for move costs (PP/energy)
        public int ResourcePoints { get; set; } = 10;

        // Status modifiers (temporary)
        public float AttackMultiplier { get; set; } = 1f;
        public float DefenseMultiplier { get; set; } = 1f;
        public float SpecialAttackMultiplier { get; set; } = 1f;
        public float SpecialDefenseMultiplier { get; set; } = 1f;

        // Critical chance bonus (additive, 0..1)
        public float CritChanceBonus { get; set; } = 0f;
    }
}

