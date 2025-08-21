using System;
using System.Collections.Generic;

namespace MIFF.Pure.Combat
{
    /// <summary>
    /// Lightweight type effectiveness lookup. Remix-safe; uses string tags.
    /// Default chart supports neutral interactions. Extend via constructor.
    /// </summary>
    public class TypeEffectiveness
    {
        private readonly Dictionary<(string attack, string defense), float> _chart;

        public TypeEffectiveness(Dictionary<(string attack, string defense), float>? chart = null)
        {
            _chart = chart ?? BuildDefaultChart();
        }

        public float GetMultiplier(string attackType, string defenseType)
        {
            if (string.IsNullOrWhiteSpace(attackType) || string.IsNullOrWhiteSpace(defenseType))
            {
                return 1f;
            }
            var key = (attackType.ToLowerInvariant(), defenseType.ToLowerInvariant());
            if (_chart.TryGetValue(key, out var m)) return m;
            return 1f;
        }

        private static Dictionary<(string attack, string defense), float> BuildDefaultChart()
        {
            var dict = new Dictionary<(string, string), float>();

            // Neutral baseline
            dict[("neutral", "neutral")] = 1f;

            // Example: water > fire, fire > nature, nature > water (rock-paper-like)
            dict[("water", "fire")] = 2f;
            dict[("fire", "nature")] = 2f;
            dict[("nature", "water")] = 2f;

            // Resistances (0.5x)
            dict[("fire", "water")] = 0.5f;
            dict[("nature", "fire")] = 0.5f;
            dict[("water", "nature")] = 0.5f;

            // Immunity example
            dict[("ghost", "normal")] = 0f;

            return dict;
        }
    }
}

