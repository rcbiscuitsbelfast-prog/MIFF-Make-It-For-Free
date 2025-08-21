using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Spirits;
using MIFF.Battle;

namespace MIFF.BattleAIPure
{
    /// <summary>
    /// Pure C# AI controller choosing moves based on stats, type matchups, and status, guided by a profile.
    /// </summary>
    [Serializable]
    public class BattleAIController
    {
        private readonly AIDecisionProfile profile;

        public BattleAIController(AIDecisionProfile profile)
        {
            this.profile = profile ?? AIDecisionProfile.CreateDefault("default", AIDecisionStyle.Balanced);
        }

        public string SelectMove(SpiritInstance self, SpiritInstance opponent)
        {
            if (self == null || opponent == null) return null;
            // In this pure C# layer we don't have concrete Move lists bound; emulate via tags stored in custom fields.
            // Expect a custom field "knownMoves" as List<string> of moveIDs, and a map moveID->Move in another adapter if needed.
            var moves = self.KnownMoves; // fallback to property
            if (moves == null || moves.Count == 0) return null;

            // Score moves using simplified heuristics
            var scored = new List<(string moveID, float score)>();
            foreach (var moveID in moves)
            {
                float score = BaseMoveScore(self, opponent, moveID);
                // Apply profile weights
                score *= GetProfileWeightForMove(moveID);
                scored.Add((moveID, score));
            }

            var best = scored.OrderByDescending(s => s.score).FirstOrDefault();
            return best.moveID;
        }

        public float EvaluateThreatLevel(SpiritInstance opponent)
        {
            if (opponent == null) return 0f;
            // Basic heuristic: combine level and current HP ratio
            float hpRatio = opponent.MaxHP > 0 ? (float)opponent.CurrentHP / opponent.MaxHP : 1f;
            return opponent.Level * (0.5f + 0.5f * hpRatio);
        }

        private float BaseMoveScore(SpiritInstance self, SpiritInstance opp, string moveID)
        {
            // Without full Move data, approximate from names: moves containing keywords are categorized.
            string id = moveID?.ToLower() ?? "";
            bool isHeal = id.Contains("heal") || id.Contains("rest") || id.Contains("cure");
            bool isBuff = id.Contains("up") || id.Contains("boost") || id.Contains("guard") || id.Contains("shield");
            bool isDebuff = id.Contains("down") || id.Contains("weaken") || id.Contains("break");

            float score = 1f;

            // Damage preference based on offensive stats
            score += self.Attack / 50f + self.SpecialAttack / 50f;

            // Heal if low HP
            if (isHeal && self.CurrentHP < self.MaxHP * 0.4f)
                score += 2.0f;

            // Buff early if healthy
            if ((isBuff || isDebuff) && self.CurrentHP > self.MaxHP * 0.6f)
                score += 0.8f;

            // Very simple type bias: prefer moves matching self primary type string in ID
            var typeStr = self.SpeciesID?.ToLower() ?? string.Empty;
            if (!string.IsNullOrEmpty(typeStr) && id.Contains(typeStr))
                score += 0.5f;

            return score;
        }

        private float GetProfileWeightForMove(string moveID)
        {
            string key = "damage";
            string id = moveID?.ToLower() ?? "";
            if (id.Contains("heal")) key = "healing";
            else if (id.Contains("boost") || id.Contains("guard") || id.Contains("weaken") || id.Contains("break")) key = "support";

            return profile.movePriorityWeights.TryGetValue(key, out var w) ? w : 1.0f;
        }
    }
}

