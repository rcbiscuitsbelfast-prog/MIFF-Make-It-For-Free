using System;
using System.Collections.Generic;
using MIFF.Pure.Combat;
using MIFF.Pure.RNG;

namespace MIFF.Pure.AI
{
    /// <summary>
    /// Canonical golden tests for AI decisions and damage outcomes under fixed seeds.
    /// Intended for console/headless environments.
    /// </summary>
    public static class GoldenTestSuite
    {
        public static bool RunAll()
        {
            bool ok = true;
            ok &= Test_MoveSelection_TypeAdvantage();
            ok &= Test_Damage_Repeatability();
            return ok;
        }

        private static bool Test_MoveSelection_TypeAdvantage()
        {
            var types = new TypeEffectiveness();
            var manager = new AIManager(types);
            manager.RegisterPolicy(AIPolicy.Balanced("enemy_default"));
            var ai = manager.GetAI("enemy_default");

            var self = new SpiritInstance { Id = 10, Name = "Waterling", TypeTag = "water", Level = 10, MaxHP = 50, CurrentHP = 50 };
            var opp = new SpiritInstance { Id = 99, Name = "Firespawn", TypeTag = "fire", Level = 10, MaxHP = 50, CurrentHP = 50 };

            var moves = new List<MoveData>
            {
                new MoveData{ MoveId = "basic_strike", Name = "Basic Strike", Category = MoveCategory.Physical, Power = 40, Accuracy = 1f, Cost = 0, TypeTag = "neutral" },
                new MoveData{ MoveId = "water_burst", Name = "Water Burst", Category = MoveCategory.Special, Power = 55, Accuracy = 0.95f, Cost = 3, TypeTag = "water" }
            };

            var rng = new RNGProvider(12345);
            var action = ai.SelectAction(self, opp, moves, rng);
            return action.MoveId == "water_burst"; // Expect type-advantaged choice
        }

        private static bool Test_Damage_Repeatability()
        {
            var types = new TypeEffectiveness();
            var calc = new DamageCalculator(types);
            var rng = new RNGProvider(777);

            var self = new SpiritInstance { Id = 1, Level = 8, Attack = 20, SpecialAttack = 24, TypeTag = "water", MaxHP = 40, CurrentHP = 40 };
            var opp = new SpiritInstance { Id = 2, Level = 8, Defense = 18, SpecialDefense = 18, TypeTag = "fire", MaxHP = 40, CurrentHP = 40 };
            var move = new MoveData { MoveId = "water_burst", Name = "Water Burst", Category = MoveCategory.Special, Power = 55, Accuracy = 0.95f, Cost = 3, TypeTag = "water" };

            var d1 = calc.CalculateDamage(self, opp, move, rng, out var b1);
            rng.Reset(777);
            var d2 = calc.CalculateDamage(self, opp, move, rng, out var b2);
            return d1 == d2 && b1.Final == b2.Final;
        }
    }
}

