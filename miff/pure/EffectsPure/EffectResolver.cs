using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Pure.Effects
{
    public class BattleEffectInstance
    {
        public string EffectId { get; set; } = string.Empty;
        public EffectOrder Order { get; set; } = EffectOrder.Buffs;
        public int RemainingTurns { get; set; } = 1;
        public bool Stackable { get; set; } = false;
        public string? ImmunityTag { get; set; }
        public float Value { get; set; } = 0f;
    }

    /// <summary>
    /// Produces an ordered queue of effects for a given phase.
    /// Handles cleanse, overwrite, and immunity tags.
    /// </summary>
    public class EffectResolver
    {
        public List<BattleEffectInstance> ResolveQueue(EffectPhase phase, IEnumerable<BattleEffectInstance> effects, IEnumerable<string> targetImmunities)
        {
            var list = new List<BattleEffectInstance>();
            var immune = new HashSet<string>(targetImmunities ?? Enumerable.Empty<string>());
            foreach (var e in effects ?? Enumerable.Empty<BattleEffectInstance>())
            {
                if (!string.IsNullOrWhiteSpace(e.ImmunityTag) && immune.Contains(e.ImmunityTag))
                {
                    continue; // skip immune
                }
                list.Add(e);
            }

            // cleanse example: remove debuffs at end turn if a cleanup effect is present (placeholder logic)
            if (phase == EffectPhase.EndTurn && list.Any(x => x.EffectId == "cleanse"))
            {
                list = list.Where(x => x.Order != EffectOrder.Debuffs).ToList();
            }

            // overwrite: keep strongest/last value per EffectId (placeholder rule)
            list = list
                .GroupBy(x => x.EffectId)
                .Select(g => g.OrderByDescending(x => Math.Abs(x.Value)).First())
                .ToList();

            // sort by defined order
            list.Sort((a,b) => a.Order.CompareTo(b.Order));
            return list;
        }
    }
}

