using System;
using System.Collections.Generic;
using MIFF.Pure.RNG;
using MIFF.Pure.BattleLoop;
using MIFF.Pure.Combat;
using MIFF.Pure.AI;

namespace MIFF.Pure.Perf
{
    public static class PerfTestHarness
    {
        public static void Main(string[] args)
        {
            var rng = new RNGProvider(123);

            var types = new TypeEffectiveness();
            var calc = new DamageCalculator(types);
            var logger = new Log.BattleLogger();
            var controller = new BattleLoopController(rng, logger);

            var roster = new Dictionary<int, SpiritInstance>
            {
                {1, new SpiritInstance{ Id=1, SpiritId="a", Name="A", TypeTag="water", Level=10, Attack=20, Defense=15, SpecialAttack=22, SpecialDefense=18, MaxHP=60, CurrentHP=60 }},
                {2, new SpiritInstance{ Id=2, SpiritId="b", Name="B", TypeTag="fire",  Level=10, Attack=18, Defense=16, SpecialAttack=20, SpecialDefense=16, MaxHP=60, CurrentHP=60 }}
            };
            var moves = new Dictionary<string, MoveData>
            {
                {"basic_strike", new MoveData{ MoveId="basic_strike", Name="Basic Strike", Category=MoveCategory.Physical, Power=40, Accuracy=1f, Cost=0, TypeTag="neutral"}},
                {"water_burst",  new MoveData{ MoveId="water_burst",  Name="Water Burst",  Category=MoveCategory.Special,  Power=55, Accuracy=0.95f, Cost=3, TypeTag="water"}}
            };

            using (new PerfTimer("AI select 1000x"))
            {
                var ai = new AI.BattleAI(AI.AIPolicy.Balanced(), types);
                for (int i=0;i<1000;i++)
                {
                    ai.SelectAction(roster[1], roster[2], new List<MoveData>{moves["basic_strike"], moves["water_burst"]}, rng);
                }
            }

            using (new PerfTimer("Damage calc 1000x"))
            {
                for (int i=0;i<1000;i++)
                {
                    calc.CalculateDamage(roster[1], roster[2], moves["water_burst"], rng, out var _);
                }
            }

            using (new PerfTimer("Queue order 1000x"))
            {
                for (int i=0;i<1000;i++)
                {
                    controller.ExecuteTurn(123, () => new List<BattleAction>{
                        new BattleAction{ ActorId=1, TargetId=2, MoveId="basic_strike", Priority=1, Speed=50 },
                        new BattleAction{ ActorId=2, TargetId=1, MoveId="water_burst",  Priority=1, Speed=45 }
                    }, id => roster[id], id => moves[id], calc);
                }
            }
        }
    }
}

