using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Pure.RNG;

namespace MIFF.Pure.BattleLoop
{
    /// <summary>
    /// Holds and deterministically orders actions for the current turn.
    /// Ordering precedence:
    ///  1) Priority (desc)
    ///  2) Speed (desc)
    ///  3) Tie-breaker: per-actor/per-action stable key generated from RNG seed
    /// </summary>
    public class ActionQueue
    {
        private readonly List<BattleAction> _pending = new List<BattleAction>();
        private readonly IRNGProvider _rng;

        public ActionQueue(IRNGProvider rng)
        {
            _rng = rng;
        }

        public void EnqueueAction(BattleAction action)
        {
            if (action == null) throw new ArgumentNullException(nameof(action));
            // Assign a deterministic tie-breaker using the RNG
            // Consumers that need strict reproducibility should set/Reset the RNG seed before building the queue
            action.TieBreakerKey = _rng.NextFloat(0f, 1f);
            _pending.Add(action);
        }

        public List<BattleAction> GetOrderedActions()
        {
            return _pending
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.Speed)
                .ThenBy(a => a.TieBreakerKey ?? 0f)
                .ThenBy(a => a.ActorId) // final stability guard
                .ToList();
        }
    }
}

