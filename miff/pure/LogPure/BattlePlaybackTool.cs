using System;
using System.Collections.Generic;
using System.IO;
using MIFF.Pure.BattleLoop;
using MIFF.Pure.Combat;
using MIFF.Pure.RNG;

namespace MIFF.Pure.Log
{
    /// <summary>
    /// Console tool: simulate a simple turn with a seed and print/export the log.
    /// This uses the BattleLoopController ordering and logs phases and mock results.
    /// </summary>
    public static class BattlePlaybackTool
    {
        public static void Main(string[] args)
        {
            int seed = args.Length > 0 && int.TryParse(args[0], out var s) ? s : 12345;
            string? exportPath = args.Length > 1 ? args[1] : null;

            var rng = new RNGProvider(seed);
            var logger = new BattleLogger();

            var controller = new BattleLoopController(rng, logger);

            // Hook into phase changes by driving the phase manager through controller calls
            // For this simple playback: select three hardcoded actions
            List<BattleAction> Selector()
            {
                return new List<BattleAction>
                {
                    new BattleAction { ActorId=1, TargetId=2, MoveId="basic_strike", Priority=1, Speed=50 },
                    new BattleAction { ActorId=2, TargetId=1, MoveId="water_burst",  Priority=1, Speed=50 },
                    new BattleAction { ActorId=3, TargetId=2, MoveId="sap_weaken",   Priority=0, Speed=40 }
                };
            }

            // Manually log phases as controller advances
            // Wire real damage calc with basic spirit roster and moves
            var types = new TypeEffectiveness();
            var calc = new DamageCalculator(types);
            var roster = new Dictionary<int, SpiritInstance>
            {
                {1, new SpiritInstance{ Id=1, Name="Alpha", TypeTag="neutral", Level=10, Attack=20, Defense=15, SpecialAttack=18, SpecialDefense=15, MaxHP=60, CurrentHP=60 }},
                {2, new SpiritInstance{ Id=2, Name="Bravo", TypeTag="fire",    Level=10, Attack=18, Defense=18, SpecialAttack=20, SpecialDefense=18, MaxHP=60, CurrentHP=60 }},
                {3, new SpiritInstance{ Id=3, Name="Charlie",TypeTag="nature",  Level=10, Attack=16, Defense=16, SpecialAttack=16, SpecialDefense=16, MaxHP=60, CurrentHP=60 }}
            };
            var moves = new Dictionary<string, MoveData>
            {
                {"basic_strike", new MoveData{ MoveId="basic_strike", Name="Basic Strike", Category=MoveCategory.Physical, Power=40, Accuracy=1f, Cost=0, TypeTag="neutral"}},
                {"water_burst",  new MoveData{ MoveId="water_burst",  Name="Water Burst",  Category=MoveCategory.Special,  Power=55, Accuracy=0.95f, Cost=3, TypeTag="water"}},
                {"sap_weaken",   new MoveData{ MoveId="sap_weaken",   Name="Sap Weaken",   Category=MoveCategory.Status,   Power=0,  Accuracy=1f,    Cost=2, TypeTag="nature", StatusEffectId="attack_down"}}
            };

            var ordered = controller.ExecuteTurn(
                seed,
                Selector,
                id => roster.TryGetValue(id, out var sp) ? sp : null,
                id => moves.TryGetValue(id, out var mv) ? mv : null,
                calc);

            var log = logger.GetLog();
            BattleLogPrinter.PrintLog(log);

            if (!string.IsNullOrWhiteSpace(exportPath))
            {
                using var sw = new StreamWriter(exportPath);
                foreach (var e in log)
                {
                    sw.WriteLine($"{e.TimestampUtc:o}\tturn={e.TurnNumber}\tactor={e.ActorId}\taction={e.ActionType}\ttarget={e.TargetId}\tresult={e.Result}\tdmg={e.DamageDealt}\tstatus={e.StatusApplied}\tphase={e.Phase}\tnotes={e.DebugNotes}");
                }
            }
        }
    }
}

