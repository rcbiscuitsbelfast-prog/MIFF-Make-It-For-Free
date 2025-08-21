using System;
using System.Collections.Generic;
using System.Text;
using MIFF.Pure.RNG;
using MIFF.Pure.Combat;
using MIFF.Pure.Log;

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
        private readonly BattleLogger? _logger;

        public BattleLoopController(IRNGProvider rng, BattleLogger? logger = null)
        {
            _rng = rng;
            _logger = logger;
            _phaseManager.OnPhaseChanged += (from, to) =>
            {
                _log.Add($"Phase: {from} -> {to}");
                _logger?.LogPhaseChange(to);
            };
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
        public List<BattleAction> ExecuteTurn(
            int seed,
            Func<List<BattleAction>> selectActions,
            Func<int, SpiritInstance>? resolveSpiritById = null,
            Func<string, MoveData>? resolveMoveById = null,
            DamageCalculator? damageCalculator = null)
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

                BattleResult? result = null;
                if (resolveSpiritById != null && resolveMoveById != null && damageCalculator != null)
                {
                    var actor = resolveSpiritById(a.ActorId);
                    var target = resolveSpiritById(a.TargetId);
                    var move = resolveMoveById(a.MoveId);
                    if (actor != null && target != null && move != null)
                    {
                        var dmg = damageCalculator.CalculateDamage(actor, target, move, _rng, out var breakdown);
                        a.DebugNotes = breakdown.ToString();
                        result = new BattleResult { Success = true, Damage = dmg, StatusApplied = move.Category == MoveCategory.Status ? move.StatusEffectId : null };
                    }
                }

                if (result == null)
                {
                    result = new BattleResult { Success = true };
                }

                _logger?.LogAction(a, result);
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

