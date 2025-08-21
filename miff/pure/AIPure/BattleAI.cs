using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Pure.Combat;
using MIFF.Pure.RNG;

namespace MIFF.Pure.AI
{
    /// <summary>
    /// Deterministic, test-friendly AI move selector.
    /// Scores available moves using policy-guided heuristics, with RNG used only for deterministic tie-breaking when needed.
    /// </summary>
    public class BattleAI
    {
        private readonly AIPolicy _policy;
        private readonly TypeEffectiveness _types;
        private readonly DamageCalculator _damageCalculator;

        public BattleAI(AIPolicy policy, TypeEffectiveness types)
        {
            _policy = policy ?? AIPolicy.Balanced();
            _types = types ?? new TypeEffectiveness();
            _damageCalculator = new DamageCalculator(_types);
        }

        public BattleAction SelectAction(SpiritInstance self, SpiritInstance opponent, List<MoveData> availableMoves, IRNGProvider rng)
        {
            if (self == null || opponent == null || availableMoves == null || availableMoves.Count == 0)
            {
                return new BattleAction { ActorId = self?.Id ?? -1, TargetId = opponent?.Id ?? -1, MoveId = "wait", Priority = 0, Speed = 0, Source = ActionSource.AI };
            }

            // Evaluate all moves
            var scored = new List<(MoveData move, float score)>();
            foreach (var move in availableMoves)
            {
                float score = 0f;

                // Skip unaffordable moves
                if (self.ResourcePoints < move.Cost)
                {
                    // Penalize heavily but still allow selection if nothing else available
                    score -= 10f * _policy.Efficiency;
                }

                // Type advantage factor
                float typeMul = _types.GetMultiplier(move.TypeTag, opponent.TypeTag);
                score += (typeMul - 1f) * 2.0f * _policy.Aggression; // +2 per 1.0 advantage

                // Expected damage estimate (deterministic; use mean variance 0.95 and non-crit expectation 1.0)
                // We avoid calling RNG here; for golden tests we keep evaluation deterministic.
                var fakeRng = new DeterministicRngForEstimate();
                _ = _damageCalculator.CalculateDamage(self, opponent, move, fakeRng, out var bd);
                float expected = bd.Base * bd.TypeMultiplier * 0.95f; // simple expectation without crits
                score += expected / 50f * _policy.Aggression;

                // HP thresholds: if opponent low, prefer kill-secure
                float oppHpRatio = opponent.MaxHP > 0 ? (float)opponent.CurrentHP / opponent.MaxHP : 1f;
                if (oppHpRatio < 0.25f)
                {
                    // If expected >= remaining HP, strong bonus
                    if (expected >= opponent.CurrentHP)
                    {
                        score += 5f * _policy.Aggression;
                    }
                }

                // Caution: penalize low accuracy
                if (move.Accuracy < 0.8f)
                {
                    score -= (0.8f - move.Accuracy) * 2.0f * _policy.Caution;
                }

                // Efficiency: prefer lower cost when scores close
                score -= move.Cost * 0.1f * _policy.Efficiency;

                scored.Add((move, score));
            }

            // Choose best; apply deterministic tie-breaker using rng if needed
            float bestScore = scored.Max(s => s.score);
            var bestMoves = scored.Where(s => Math.Abs(s.score - bestScore) < 0.0001f).Select(s => s.move).ToList();
            MoveData chosen;
            if (bestMoves.Count == 1)
            {
                chosen = bestMoves[0];
            }
            else
            {
                // Tie-break via deterministic RNG
                int idx = rng.NextInt(0, bestMoves.Count);
                chosen = bestMoves[idx];
            }

            return new BattleAction
            {
                ActorId = self.Id,
                TargetId = opponent.Id,
                MoveId = chosen.MoveId,
                Priority = 0,
                Speed = self.Level, // simple baseline until a speed stat exists
                Source = ActionSource.AI,
                DebugNotes = $"score={bestScore:0.00}"
            };
        }

        /// <summary>
        /// Minimal deterministic RNG shim for expected value calculation without randomness.
        /// Always returns middle-of-range outcomes so evaluation is stable.
        /// </summary>
        private class DeterministicRngForEstimate : IRNGProvider
        {
            public int GetSeed() => 0;
            public void Reset(int seed) { }
            public bool NextBool(float probability = 0.5f) => false; // ignore crits
            public float NextFloat(float minInclusive, float maxExclusive) => (minInclusive + maxExclusive) * 0.5f;
            public int NextInt(int minInclusive, int maxExclusive) => (minInclusive + maxExclusive) / 2;
        }
    }
}

