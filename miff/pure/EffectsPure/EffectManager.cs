using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.EffectsPure
{
    /// <summary>
    /// Manages active effects per entity (referenced by string entityID) in pure C#.
    /// Provides real-time and turn-based update hooks.
    /// </summary>
    [Serializable]
    public class EffectManager
    {
        public class ActiveEffect
        {
            public BattleEffect definition;
            public int stacks = 1;
            public float remainingSeconds;
            public int remainingTurns;
        }

        private readonly Dictionary<string, List<ActiveEffect>> entityEffects = new Dictionary<string, List<ActiveEffect>>();

        // Events
        public event Action<string, BattleEffect, ActiveEffect> OnEffectApplied;
        public event Action<string, BattleEffect, ActiveEffect> OnEffectRefreshed;
        public event Action<string, BattleEffect, ActiveEffect> OnEffectExpired;
        public event Action<string, BattleEffect, ActiveEffect> OnEffectRemoved;
        public event Action<string, BattleEffect, ActiveEffect> OnEffectTick;

        public IReadOnlyList<ActiveEffect> GetEffects(string entityID)
        {
            return entityEffects.TryGetValue(entityID, out var list) ? list : new List<ActiveEffect>();
        }

        public void ApplyEffect(string entityID, BattleEffect effect)
        {
            if (string.IsNullOrEmpty(entityID) || effect == null) return;
            if (!entityEffects.TryGetValue(entityID, out var list))
            {
                list = new List<ActiveEffect>();
                entityEffects[entityID] = list;
            }

            var existing = list.FirstOrDefault(e => e.definition.effectID == effect.effectID);
            if (existing != null)
            {
                if (effect.stackable && existing.stacks < effect.maxStacks)
                {
                    existing.stacks++;
                    if (effect.refreshOnStack)
                    {
                        existing.remainingSeconds = effect.durationSeconds;
                        existing.remainingTurns = effect.durationTurns;
                    }
                    OnEffectRefreshed?.Invoke(entityID, effect, existing);
                }
                else
                {
                    // refresh duration anyway if configured
                    if (effect.refreshOnStack)
                    {
                        existing.remainingSeconds = effect.durationSeconds;
                        existing.remainingTurns = effect.durationTurns;
                        OnEffectRefreshed?.Invoke(entityID, effect, existing);
                    }
                }
            }
            else
            {
                var active = new ActiveEffect
                {
                    definition = effect.Clone(),
                    stacks = 1,
                    remainingSeconds = effect.durationSeconds,
                    remainingTurns = effect.durationTurns
                };
                list.Add(active);
                OnEffectApplied?.Invoke(entityID, active.definition, active);
            }
        }

        public void RemoveEffect(string entityID, string effectID)
        {
            if (!entityEffects.TryGetValue(entityID, out var list)) return;
            var idx = list.FindIndex(e => e.definition.effectID == effectID);
            if (idx >= 0)
            {
                var active = list[idx];
                list.RemoveAt(idx);
                OnEffectRemoved?.Invoke(entityID, active.definition, active);
            }
        }

        // Real-time update (seconds)
        public void UpdateRealtime(string entityID, float deltaTime)
        {
            if (!entityEffects.TryGetValue(entityID, out var list)) return;
            for (int i = list.Count - 1; i >= 0; i--)
            {
                var e = list[i];
                if (e.definition.durationSeconds > 0)
                {
                    e.remainingSeconds -= deltaTime;
                    OnEffectTick?.Invoke(entityID, e.definition, e);
                    if (e.remainingSeconds <= 0)
                    {
                        list.RemoveAt(i);
                        OnEffectExpired?.Invoke(entityID, e.definition, e);
                    }
                }
            }
        }

        // Turn-based tick
        public void TickTurn(string entityID)
        {
            if (!entityEffects.TryGetValue(entityID, out var list)) return;
            for (int i = list.Count - 1; i >= 0; i--)
            {
                var e = list[i];
                if (e.definition.durationTurns > 0)
                {
                    e.remainingTurns -= 1;
                    OnEffectTick?.Invoke(entityID, e.definition, e);
                    if (e.remainingTurns <= 0)
                    {
                        list.RemoveAt(i);
                        OnEffectExpired?.Invoke(entityID, e.definition, e);
                    }
                }
            }
        }

        // Hooks for integration: call these from collision/animation/cast/move systems
        public void TriggerOnHit(string entityID)
        {
            Broadcast(entityID, EffectTrigger.OnHit);
        }

        public void TriggerOnCast(string entityID)
        {
            Broadcast(entityID, EffectTrigger.OnCast);
        }

        public void TriggerOnApply(string entityID)
        {
            Broadcast(entityID, EffectTrigger.OnApply);
        }

        private void Broadcast(string entityID, EffectTrigger trigger)
        {
            if (!entityEffects.TryGetValue(entityID, out var list)) return;
            foreach (var e in list)
            {
                if ((e.definition.triggers & trigger) != 0)
                {
                    OnEffectTick?.Invoke(entityID, e.definition, e);
                }
            }
        }
    }
}

