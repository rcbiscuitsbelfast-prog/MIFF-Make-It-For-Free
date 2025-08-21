using System;
using System.Collections.Generic;
using MIFF.Pure.Combat;
using MIFF.Pure.RNG;

namespace MIFF.Pure.AI
{
    /// <summary>
    /// Console-friendly tester: simulates AI selection with a seed, prints reasoning/choice, and runs golden tests.
    /// Usage: dotnet run -- 12345
    /// </summary>
    public static class AITestHarness
    {
        public static void Main(string[] args)
        {
            int seed = args.Length > 0 && int.TryParse(args[0], out var s) ? s : 12345;
            var rng = new RNGProvider(seed);
            var types = new TypeEffectiveness();
            var manager = new AIManager(types);
            var policy = AIPolicy.Balanced("enemy_default");
            manager.RegisterPolicy(policy);
            var ai = manager.GetAI("enemy_default");

            var self = new SpiritInstance { Id = 10, Name = "Waterling", TypeTag = "water", Level = 10, MaxHP = 50, CurrentHP = 50, ResourcePoints = 5, Attack = 18, SpecialAttack = 22 };
            var opp = new SpiritInstance { Id = 99, Name = "Firespawn", TypeTag = "fire", Level = 10, MaxHP = 50, CurrentHP = 12 };

            var moves = new List<MoveData>
            {
                new MoveData{ MoveId = "basic_strike", Name = "Basic Strike", Category = MoveCategory.Physical, Power = 40, Accuracy = 1f, Cost = 0, TypeTag = "neutral" },
                new MoveData{ MoveId = "water_burst", Name = "Water Burst", Category = MoveCategory.Special, Power = 55, Accuracy = 0.95f, Cost = 3, TypeTag = "water" },
                new MoveData{ MoveId = "sap_weaken", Name = "Sap Weaken", Category = MoveCategory.Status, Power = 0, Accuracy = 1f, Cost = 2, TypeTag = "nature", StatusEffectId = "attack_down" }
            };

            var action = ai.SelectAction(self, opp, moves, rng);
            Console.WriteLine($"Seed={seed} | Selected move: {action.MoveId} | Notes: {action.DebugNotes}");

            bool gold = GoldenTestSuite.RunAll();
            Console.WriteLine(gold ? "Golden tests: PASS" : "Golden tests: FAIL");
        }
    }
}

