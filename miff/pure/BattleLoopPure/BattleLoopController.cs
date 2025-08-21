using System;
using System.Collections.Generic;
using System.Text;
using MIFF.Pure.RNG;

namespace MIFF.Pure.BattleLoop
{
    /// <summary>
    /// Orchestrates a single deterministic turn: phase progression, action collection, ordering, resolution.
    /// Integrates with IRNGProvider for deterministic ordering and future calculations.
    /// </summary>
    public class BattleLoopController
    {
        private readonly IRNGProvider _rng;
        private readonly BattlePhaseManager _phaseManager = new BattlePhaseManager();
        private readonly List<string> _log = new List<string>();

        public BattleLoopController(IRNGProvider rng)
        {
            _rng = rng;
            _phaseManager.OnPhaseChanged += (from, to) => _log.Add($"Phase: {from} -> {to}");
            _phaseManager.OnPhaseEntered += phase => { /* extension hook */ };
        }

        /// <summary>
        /// Advances one phase and records the transition.
        /// </summary>
        public void AdvancePhase()
        {
            _phaseManager.Advance();
        }

        /// <summary>
        /// Executes a full turn deterministically given a seed.
        /// Collects actions via the provided selector delegate (player/AI).
        /// </summary>
        public List<BattleAction> ExecuteTurn(int seed, Func<List<BattleAction>> selectActions)
        {
            _rng.Reset(seed);
            _log.Clear();
            _log.Add($"Seed reset: {seed}");

            // PreTurn
            _phaseManager.Advance();

            // SelectAction
            var actions = selectActions?.Invoke() ?? new List<BattleAction>();
            _phaseManager.Advance();

            // ResolveAction: order actions deterministically
            var queue = new ActionQueue(_rng);
            foreach (var action in actions)
            {
                queue.EnqueueAction(action);
            }
            var ordered = queue.GetOrderedActions();
            _log.Add($"Ordered {ordered.Count} actions");
            foreach (var a in ordered)
            {
                _log.Add($"Execute: {a}");
            }
            _phaseManager.Advance();

            // EndTurn
            _phaseManager.Advance();

            return ordered;
        }

        public string PrintBattleLog()
        {
            var sb = new StringBuilder();
            foreach (var line in _log)
            {
                sb.AppendLine(line);
            }
            return sb.ToString();
        }
    }
}

