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

            var controller = new BattleLoopController(rng);

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
            logger.LogPhaseChange(BattlePhase.PreTurn);
            var ordered = controller.ExecuteTurn(seed, Selector);
            logger.LogPhaseChange(BattlePhase.SelectAction);
            logger.LogPhaseChange(BattlePhase.ResolveAction);
            logger.LogPhaseChange(BattlePhase.EndTurn);

            // Mock results (in a full integration, wire from DamageCalculator outcomes)
            foreach (var a in ordered)
            {
                var result = new BattleResult { Success = true, Damage = a.MoveId == "sap_weaken" ? 0 : 12, StatusApplied = a.MoveId == "sap_weaken" ? "attack_down" : null };
                logger.LogAction(a, result);
            }

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

