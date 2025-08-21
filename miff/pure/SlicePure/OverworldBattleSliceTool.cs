using System;
using System.Collections.Generic;
using MIFF.Pure.RNG;
using MIFF.Pure.Log;
using MIFF.Pure.BattleLoop;
using MIFF.Pure.Combat;
using MIFF.Pure.Encounter;

namespace MIFF.Pure.Slice
{
    /// <summary>
    /// CLI vertical slice for M1: Overworld (encounter) → Battle (one turn) with logging.
    /// Usage: dotnet run -- 12345
    /// </summary>
    public static class OverworldBattleSliceTool
    {
        public static void Main(string[] args)
        {
            int seed = args.Length > 0 && int.TryParse(args[0], out var s) ? s : 12345;
            var rng = new RNGProvider(seed);

            // 1) Setup Encounter table and triggers for Newhaven
            var enc = new EncounterController();
            enc.RegisterTable(new EncounterTable
            {
                ZoneId = "newhaven",
                Entries = new List<EncounterTableEntry>
                {
                    new EncounterTableEntry{ ZoneId="newhaven", SpiritId="ember",  Weight=40, MinLevel=3, MaxLevel=5 },
                    new EncounterTableEntry{ ZoneId="newhaven", SpiritId="ripple", Weight=35, MinLevel=3, MaxLevel=5 },
                    new EncounterTableEntry{ ZoneId="newhaven", SpiritId="sprout", Weight=25, MinLevel=2, MaxLevel=4 }
                }
            });
            enc.RegisterTrigger(new EncounterTrigger{ ZoneId="newhaven", TriggerType=TriggerType.TileType, TriggerParams={ ["tile"] = "grass" } });

            var state = new PlayerState{ ZoneId="newhaven", TileType="grass", TimeOfDay="day", StepsSinceLastEncounter=0 };

            Console.WriteLine($"Seed={seed} | Newhaven roam...");
            EncounterResult result;
            int steps = 0;
            do
            {
                steps++;
                state.StepsSinceLastEncounter++;
                result = enc.CheckForEncounter(state, rng);
            } while (!result.Triggered && steps < 50);

            if (!result.Triggered)
            {
                Console.WriteLine("No encounter within 50 steps.");
                return;
            }

            Console.WriteLine($"Encounter! zone={result.ZoneId} spirit={result.SpiritId} lvl={result.Level}");

            // 2) Build simple battle: player vs encountered spirit
            var logger = new BattleLogger();
            var controller = new BattleLoopController(rng, logger);
            var types = new TypeEffectiveness();
            var calc = new DamageCalculator(types);

            // Roster mapping: ids 1001=player, 2001=wild
            var roster = new Dictionary<int, SpiritInstance>
            {
                {1001, CreatePlayerSpirit("waterling", type:"water", level: 6)},
                {2001, CreateWildSpirit(result.SpiritId!, result.Level)}
            };

            var moves = new Dictionary<string, MoveData>
            {
                {"basic_strike", new MoveData{ MoveId="basic_strike", Name="Basic Strike", Category=MoveCategory.Physical, Power=40, Accuracy=1f, Cost=0, TypeTag="neutral"}},
                {"water_burst",  new MoveData{ MoveId="water_burst",  Name="Water Burst",  Category=MoveCategory.Special,  Power=55, Accuracy=0.95f, Cost=3, TypeTag="water"}},
                {"ember_dart",   new MoveData{ MoveId="ember_dart",   Name="Ember Dart",   Category=MoveCategory.Special,  Power=50, Accuracy=0.95f, Cost=2, TypeTag="fire"}},
                {"sap_weaken",   new MoveData{ MoveId="sap_weaken",   Name="Sap Weaken",   Category=MoveCategory.Status,   Power=0,  Accuracy=1f,    Cost=2, TypeTag="nature", StatusEffectId="attack_down"}}
            };

            List<BattleAction> Selector()
            {
                // Simple policy: player uses type-advantaged move if available; wild uses element-appropriate
                var enemy = roster[2001];
                var playerMove = enemy.TypeTag == "fire" && moves.ContainsKey("water_burst") ? "water_burst" : "basic_strike";
                var enemyMove = enemy.TypeTag switch
                {
                    "fire" => "ember_dart",
                    "nature" => "sap_weaken",
                    _ => "basic_strike"
                };
                return new List<BattleAction>
                {
                    new BattleAction{ ActorId=1001, TargetId=2001, MoveId=playerMove, Priority=1, Speed=50, Source=ActionSource.Player },
                    new BattleAction{ ActorId=2001, TargetId=1001, MoveId=enemyMove,  Priority=1, Speed=45, Source=ActionSource.AI }
                };
            }

            controller.ExecuteTurn(
                seed,
                Selector,
                id => roster.TryGetValue(id, out var sp) ? sp : null,
                id => moves.TryGetValue(id, out var mv) ? mv : null,
                calc);

            var log = logger.GetLog();
            BattleLogPrinter.PrintLog(log);
        }

        private static SpiritInstance CreatePlayerSpirit(string spiritId, string type, int level)
        {
            return new SpiritInstance
            {
                Id = 1001,
                SpiritId = spiritId,
                Name = spiritId,
                TypeTag = type,
                Level = level,
                Attack = 20 + level,
                Defense = 16 + level/2,
                SpecialAttack = 22 + level,
                SpecialDefense = 18 + level/2,
                MaxHP = 60 + level * 2,
                CurrentHP = 60 + level * 2
            };
        }

        private static SpiritInstance CreateWildSpirit(string spiritId, int level)
        {
            // Map spiritId to a rough type
            string type = spiritId switch
            {
                "ember" => "fire",
                "ripple" => "water",
                "sprout" => "nature",
                _ => "neutral"
            };
            return new SpiritInstance
            {
                Id = 2001,
                SpiritId = spiritId,
                Name = spiritId,
                TypeTag = type,
                Level = level,
                Attack = 18 + level,
                Defense = 16 + level/2,
                SpecialAttack = 18 + level,
                SpecialDefense = 16 + level/2,
                MaxHP = 55 + level * 2,
                CurrentHP = 55 + level * 2
            };
        }
    }
}

