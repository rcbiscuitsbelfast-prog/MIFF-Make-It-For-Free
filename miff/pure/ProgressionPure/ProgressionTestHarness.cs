using System;
using System.Collections.Generic;
using MIFF.Pure.Combat;

namespace MIFF.Pure.Progression
{
    /// <summary>
    /// Console tester for XP, learnsets, and evolution.
    /// </summary>
    public static class ProgressionTestHarness
    {
        public static void Main(string[] args)
        {
            var curve = new XPCurve{ Type=XPCurveType.Linear, BaseXP=50, MaxLevel=10 };
            var xp = new XPManager(curve);

            var spirit = new SpiritInstance{ Id=1, SpiritId="sprout", Name="Sprout", Level=3, MaxHP=30, CurrentHP=30, Attack=12, Defense=10, SpecialAttack=11, SpecialDefense=0 };

            var learn = new LearnsetManager();
            learn.RegisterMoves(new []
            {
                new MoveData{ MoveId="basic_strike", Name="Basic Strike", Category=MoveCategory.Physical, Power=40, Accuracy=1f, Cost=0, TypeTag="neutral" },
                new MoveData{ MoveId="leaf_cut", Name="Leaf Cut", Category=MoveCategory.Physical, Power=50, Accuracy=0.95f, Cost=2, TypeTag="nature" }
            });
            learn.RegisterLearnset("sprout", new []
            {
                new LearnsetEntry{ MoveId="basic_strike", UnlockLevel=1 },
                new LearnsetEntry{ MoveId="leaf_cut", UnlockLevel=4 }
            });

            var evo = new EvolutionManager();
            evo.RegisterEvolution("sprout", new EvolutionCondition{ Type=EvolutionType.Level, RequiredLevel=5, ResultSpiritId="bloom" });

            Console.WriteLine($"Before: Level {spirit.Level}, Moves: {string.Join(",", learn.GetAvailableMoves(spirit).ConvertAll(m=>m.MoveId))}");

            xp.AddXP(spirit, 120);
            while (xp.CheckLevelUp(spirit))
            {
                Console.WriteLine($"Level Up! -> {spirit.Level}");
                learn.UnlockMovesOnLevelUp(spirit);
            }

            Console.WriteLine($"After XP: Level {spirit.Level}, Moves: {string.Join(",", learn.GetAvailableMoves(spirit).ConvertAll(m=>m.MoveId))}");

            var canEvolve = evo.CheckEvolution(spirit);
            Console.WriteLine($"Can evolve? {canEvolve}");
            if (canEvolve)
            {
                spirit = evo.EvolveSpirit(spirit);
                Console.WriteLine($"Evolved into {spirit.SpiritId} at Level {spirit.Level}");
            }
        }
    }
}

