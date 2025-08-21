using System;
using System.Collections.Generic;
using MIFF.Pure.RNG;

namespace MIFF.Pure.Encounter
{
    /// <summary>
    /// Console tester for encounter triggering and selection.
    /// Usage: dotnet run -- 12345
    /// </summary>
    public static class EncounterTestHarness
    {
        public static void Main(string[] args)
        {
            int seed = args.Length > 0 && int.TryParse(args[0], out var s) ? s : 12345;
            var rng = new RNGProvider(seed);
            var controller = new EncounterController();

            controller.RegisterTable(new EncounterTable
            {
                ZoneId = "newhaven",
                Entries = new List<EncounterTableEntry>
                {
                    new EncounterTableEntry{ ZoneId="newhaven", SpiritId="sprout",  Weight=60, MinLevel=2, MaxLevel=4 },
                    new EncounterTableEntry{ ZoneId="newhaven", SpiritId="ember",   Weight=30, MinLevel=3, MaxLevel=5 },
                    new EncounterTableEntry{ ZoneId="newhaven", SpiritId="ripple",  Weight=10, MinLevel=4, MaxLevel=6 }
                }
            });

            controller.RegisterTrigger(new EncounterTrigger{ ZoneId="newhaven", TriggerType=TriggerType.TileType, TriggerParams = { ["tile"] = "grass" } });
            controller.RegisterTrigger(new EncounterTrigger{ ZoneId="newhaven", TriggerType=TriggerType.TimeOfDay, TriggerParams = { ["time"] = "night" } });

            var state = new PlayerState{ ZoneId="newhaven", TileType="grass", TimeOfDay="day", StepsSinceLastEncounter=5 };
            var result = controller.CheckForEncounter(state, rng);
            Console.WriteLine(result.Triggered ? $"Encounter! zone={result.ZoneId} spirit={result.SpiritId} lvl={result.Level}" : "No encounter");
        }
    }
}

