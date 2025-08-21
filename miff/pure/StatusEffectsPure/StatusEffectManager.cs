using System;
using System.Collections.Generic;

namespace MIFF.Pure.StatusEffects
{
    public class StatusEffectInstance
    {
        public string Id { get; set; } = string.Empty;
        public float Value { get; set; }
        public StackRule Rule { get; set; } = StackRule.Replace;
        public EffectTimer Timer { get; set; } = new EffectTimer(1);
        public bool IsDebuff { get; set; }
    }

    /// <summary>
    /// Applies, stacks, ticks, and cleanses status effects.
    /// </summary>
    public class StatusEffectManager
    {
        private readonly Dictionary<string, StatusEffectInstance> _idToEffect = new Dictionary<string, StatusEffectInstance>();

        public void Apply(StatusEffectInstance effect)
        {
            if (effect == null || string.IsNullOrWhiteSpace(effect.Id)) return;
            if (_idToEffect.TryGetValue(effect.Id, out var existing))
            {
                existing.Value = BuffStackRules.Combine(effect.Rule, existing.Value, effect.Value);
                existing.Timer = effect.Timer; // reset/replace duration by default
            }
            else
            {
                _idToEffect[effect.Id] = effect;
            }
        }

        public void Cleanse(Predicate<StatusEffectInstance> predicate)
        {
            var toRemove = new List<string>();
            foreach (var kv in _idToEffect)
            {
                if (predicate(kv.Value)) toRemove.Add(kv.Key);
            }
            foreach (var key in toRemove) _idToEffect.Remove(key);
        }

        public void TickAll()
        {
            var toRemove = new List<string>();
            foreach (var kv in _idToEffect)
            {
                if (kv.Value.Timer.Tick()) toRemove.Add(kv.Key);
            }
            foreach (var key in toRemove) _idToEffect.Remove(key);
        }

        public IReadOnlyCollection<StatusEffectInstance> GetAll() => _idToEffect.Values;
    }
}

