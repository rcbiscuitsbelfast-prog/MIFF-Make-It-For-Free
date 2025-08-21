using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Pure.RNG;

namespace MIFF.Pure.Encounter
{
    /// <summary>
    /// Engine-agnostic encounter controller for Newhaven.
    /// Supports zone/tile/time triggers and weighted selection with level scaling.
    /// </summary>
    public class EncounterController
    {
        private readonly Dictionary<string, EncounterTable> _tablesByZone = new Dictionary<string, EncounterTable>();
        private readonly List<EncounterTrigger> _triggers = new List<EncounterTrigger>();

        public void RegisterTable(EncounterTable table)
        {
            if (table == null || string.IsNullOrWhiteSpace(table.ZoneId)) return;
            _tablesByZone[table.ZoneId] = table;
        }

        public void RegisterTrigger(EncounterTrigger trigger)
        {
            if (trigger == null) return;
            _triggers.Add(trigger);
        }

        public EncounterResult CheckForEncounter(PlayerState state, IRNGProvider rng)
        {
            // Determine if any trigger matches current state
            var matching = _triggers.Where(t => Matches(t, state)).ToList();
            if (matching.Count == 0) return new EncounterResult { Triggered = false };

            // Chance gate: simple rate based on steps (example: 4% + 0.3% per step)
            float chance = Math.Clamp(0.04f + 0.003f * state.StepsSinceLastEncounter, 0.04f, 0.2f);
            if (!rng.NextBool(chance))
            {
                return new EncounterResult { Triggered = false };
            }

            string zone = state.ZoneId;
            if (!_tablesByZone.TryGetValue(zone, out var table) || table.Entries.Count == 0)
            {
                return new EncounterResult { Triggered = false };
            }

            // Weighted selection
            int total = table.Entries.Sum(e => Math.Max(1, e.Weight));
            int roll = rng.NextInt(0, total);
            EncounterTableEntry? selected = null;
            int acc = 0;
            foreach (var e in table.Entries)
            {
                acc += Math.Max(1, e.Weight);
                if (roll < acc) { selected = e; break; }
            }
            if (selected == null)
            {
                return new EncounterResult { Triggered = false };
            }

            int lvl = rng.NextInt(selected.MinLevel, selected.MaxLevel + 1);
            return new EncounterResult
            {
                Triggered = true,
                ZoneId = zone,
                SpiritId = selected.SpiritId,
                Level = lvl
            };
        }

        private static bool Matches(EncounterTrigger t, PlayerState s)
        {
            if (!string.Equals(t.ZoneId, s.ZoneId, StringComparison.OrdinalIgnoreCase)) return false;
            switch (t.TriggerType)
            {
                case TriggerType.ZoneEntry:
                    return true;
                case TriggerType.TileType:
                    return t.TriggerParams.TryGetValue("tile", out var tile) && string.Equals(tile, s.TileType, StringComparison.OrdinalIgnoreCase);
                case TriggerType.TimeOfDay:
                    return t.TriggerParams.TryGetValue("time", out var time) && string.Equals(time, s.TimeOfDay, StringComparison.OrdinalIgnoreCase);
                default:
                    return false;
            }
        }
    }
}

