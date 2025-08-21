using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.EffectsPure
{
    /// <summary>
    /// Aggregates active modifiers for a stat from multiple effects.
    /// Supports flat and percent, additive and multiplicative stacking.
    /// </summary>
    [Serializable]
    public class StatModifierAggregator
    {
        private readonly List<(ModifierType type, float value)> additive = new List<(ModifierType, float)>();
        private readonly List<(ModifierType type, float value)> multiplicative = new List<(ModifierType, float)>();

        public void Clear()
        {
            additive.Clear();
            multiplicative.Clear();
        }

        public void Add(ModifierType type, float value, bool isMultiplicative)
        {
            if (isMultiplicative) multiplicative.Add((type, value));
            else additive.Add((type, value));
        }

        public float Apply(float baseValue)
        {
            float flatAdd = additive.Where(a => a.type == ModifierType.Flat).Sum(a => a.value);
            float pctAdd = additive.Where(a => a.type == ModifierType.Percent).Sum(a => a.value);
            float result = baseValue + flatAdd;
            result *= (1f + pctAdd);
            foreach (var m in multiplicative)
            {
                if (m.type == ModifierType.Flat) result += m.value;
                else result *= (1f + m.value);
            }
            return result;
        }
    }
}

