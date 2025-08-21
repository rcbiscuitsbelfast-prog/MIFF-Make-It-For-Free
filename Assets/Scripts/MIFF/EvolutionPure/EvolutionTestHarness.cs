using System;
using MIFF.Core;

namespace MIFF.EvolutionPure
{
    /// <summary>
    /// Console tester for evolution checks and execution.
    /// </summary>
    [Serializable]
    public class EvolutionTestHarness
    {
        private class HeadlessPlayerContext : PlayerContext
        {
            public object GameData { get; set; }
            public string CurrentLocationID { get; set; }
            public HeadlessPlayerContext() : base(null) { }
        }

        public void Run()
        {
            Console.WriteLine("=== Evolution Test Harness ===");

            var ctx = new HeadlessPlayerContext { CurrentLocationID = "forest" };
            var evo = new EvolutionManager(ctx);

            // Register species evolution data
            var data = new SpeciesEvolutionData
            {
                speciesID = "sparkling_idol",
                evolutionTargetID = "sparkling_idol_stage2",
                conditions =
                {
                    new EvolutionCondition { conditionType = EvolutionConditionType.LevelAtLeast, intValue = 5 },
                    new EvolutionCondition { conditionType = EvolutionConditionType.SyncAtLeast, intValue = 20 },
                    new EvolutionCondition { conditionType = EvolutionConditionType.AtLocation, stringValue = "forest" }
                }
            };
            evo.RegisterSpeciesEvolution(data);

            var spirit = new Spirits.SpiritInstance("sparkling_idol");
            Console.WriteLine($"Before: {spirit.SpeciesID} | {spirit.GetSummary()}");

            // Simulate growth
            spirit.GainExperience(1000); // likely multiple levels
            spirit.GainSync(50);

            Console.WriteLine($"Can evolve? {evo.CanEvolve(spirit)} -> target: {evo.GetEvolutionTarget(spirit) ?? "<none>"}");
            var result = evo.EvolveSpirit(spirit);
            Console.WriteLine($"Evolve result: {result}");
            Console.WriteLine($"After: {spirit.SpeciesID} | {spirit.GetSummary()}");
        }
    }
}

