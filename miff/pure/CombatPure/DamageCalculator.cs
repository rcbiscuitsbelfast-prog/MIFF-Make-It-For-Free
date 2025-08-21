using System;
using MIFF.Pure.RNG;

namespace MIFF.Pure.Combat
{
    /// <summary>
    /// Deterministic, seedable damage calculator with extension hooks.
    /// Formula outline (inspired by classic RPGs, remix-safe):
    ///  base = (levelFactor * power * attackStat / defenseStat) + constant
    ///  crit = 1.5x on criticals
    ///  type = TypeEffectiveness(attackType, defenseType)
    ///  variance = uniform in [0.9, 1.0]
    ///  status modifiers applied to attack/defense inputs
    /// result = floor(base * crit * type * variance)
    /// </summary>
    public class DamageCalculator
    {
        private readonly TypeEffectiveness _types;
        public Action<SpiritInstance, SpiritInstance, MoveData, DamageBreakdown>? OnComputed { get; set; }

        public DamageCalculator(TypeEffectiveness types)
        {
            _types = types;
        }

        public int CalculateDamage(SpiritInstance attacker, SpiritInstance defender, MoveData move, IRNGProvider rng,
            out DamageBreakdown breakdown)
        {
            breakdown = new DamageBreakdown();

            if (move.Category == MoveCategory.Status || move.Power <= 0)
            {
                breakdown.Base = 0;
                breakdown.CriticalMultiplier = 1f;
                breakdown.TypeMultiplier = 1f;
                breakdown.VarianceMultiplier = 1f;
                breakdown.Final = 0;
                return 0;
            }

            float attackStat = move.Category == MoveCategory.Physical
                ? attacker.Attack * attacker.AttackMultiplier
                : attacker.SpecialAttack * attacker.SpecialAttackMultiplier;

            float defenseStat = move.Category == MoveCategory.Physical
                ? defender.Defense * defender.DefenseMultiplier
                : defender.SpecialDefense * defender.SpecialDefenseMultiplier;

            defenseStat = Math.Max(1f, defenseStat);

            float levelFactor = 2f + attacker.Level * 0.2f; // simple level scaling
            float constant = 2f;

            float baseDamage = (levelFactor * move.Power * (attackStat / defenseStat)) + constant;

            // Crit chance: baseline 5% + attacker bonus (clamped 0..1)
            float critChance = Math.Clamp(0.05f + attacker.CritChanceBonus, 0f, 1f);
            bool isCrit = rng.NextBool(critChance);
            float critMultiplier = isCrit ? 1.5f : 1f;

            float typeMultiplier = _types.GetMultiplier(move.TypeTag, defender.TypeTag);

            // Variance in [0.9, 1.0]
            float variance = 0.9f + rng.NextFloat(0f, 0.1f);

            float total = baseDamage * critMultiplier * typeMultiplier * variance;

            breakdown.Base = (int)Math.Floor(baseDamage);
            breakdown.CriticalMultiplier = critMultiplier;
            breakdown.TypeMultiplier = typeMultiplier;
            breakdown.VarianceMultiplier = variance;
            breakdown.Final = Math.Max(0, (int)Math.Floor(total));
            breakdown.WasCritical = isCrit;

            OnComputed?.Invoke(attacker, defender, move, breakdown);
            return breakdown.Final;
        }
    }

    public class DamageBreakdown
    {
        public int Base { get; set; }
        public float CriticalMultiplier { get; set; }
        public float TypeMultiplier { get; set; }
        public float VarianceMultiplier { get; set; }
        public int Final { get; set; }
        public bool WasCritical { get; set; }
        public override string ToString()
        {
            return $"base={Base}, crit={CriticalMultiplier:0.00}, type={TypeMultiplier:0.00}, var={VarianceMultiplier:0.00}, final={Final}, crit?={WasCritical}";
        }
    }
}

