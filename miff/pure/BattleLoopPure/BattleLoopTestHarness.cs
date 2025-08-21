using System;
using System.Collections.Generic;
using MIFF.Pure.RNG;

namespace MIFF.Pure.BattleLoop
{
    /// <summary>
    /// Console-friendly test harness to exercise the deterministic battle loop for one turn.
    /// It prints ordered actions and phase transitions, then replays with the same seed to validate determinism.
    /// Usage: dotnet run -- 12345
    /// </summary>
    public static class BattleLoopTestHarness
    {
        public static void Main(string[] args)
        {
            int seed = args.Length > 0 && int.TryParse(args[0], out var s) ? s : 12345;
            var rng = new RNGProvider(seed);
            var controller = new BattleLoopController(rng);

            Func<List<BattleAction>> selector = () => new List<BattleAction>
            {
                new BattleAction { ActorId = 1, TargetId = 2, MoveId = "quick_slash", Priority = 1, Speed = 50, Source = ActionSource.Player },
                new BattleAction { ActorId = 2, TargetId = 1, MoveId = "heavy_blow",  Priority = 1, Speed = 50, Source = ActionSource.AI },
                new BattleAction { ActorId = 3, TargetId = 2, MoveId = "guard",        Priority = 0, Speed = 40, Source = ActionSource.AI }
            };

            var ordered1 = controller.ExecuteTurn(seed, selector);
            Console.WriteLine("--- First Run ---");
            Console.WriteLine(controller.PrintBattleLog());

            var snapshot1 = string.Join("|", ordered1);

            var ordered2 = controller.ExecuteTurn(seed, selector);
            Console.WriteLine("--- Replay Run ---");
            Console.WriteLine(controller.PrintBattleLog());

            var snapshot2 = string.Join("|", ordered2);
            Console.WriteLine(snapshot1 == snapshot2 ? "Determinism: PASS" : "Determinism: FAIL");
        }
    }
}

