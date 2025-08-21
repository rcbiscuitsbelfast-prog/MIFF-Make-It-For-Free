using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Core;

namespace MIFF.Overworld
{
    /// <summary>
    /// Pure C# encounter trigger that evaluates random wild encounters.
    /// </summary>
    [Serializable]
    public class EncounterTrigger
    {
        private readonly WorldMap worldMap;
        private readonly Random rng;

        public event Action<string> OnEncounterStarted; // speciesID

        public EncounterTrigger(WorldMap map, int? seed = null)
        {
            worldMap = map ?? throw new ArgumentNullException(nameof(map));
            rng = seed.HasValue ? new Random(seed.Value) : new Random();
        }

        public EncounterResult TryTriggerEncounter(PlayerContext ctx)
        {
            if (ctx == null) return EncounterResult.NoEncounter;

            // PlayerContext from MIFF.Core currently references Unity types; for headless usage,
            // consider introducing a pure C# PlayerState model. We'll use only logical fields here.

            // Determine location
            string locationID = ctx.playerObject != null ? ctx.playerObject.name : "unknown";
            var location = worldMap.GetLocation(locationID);
            if (location == null || location.encounterChance <= 0) return EncounterResult.NoEncounter;

            // Roll encounter chance
            if (rng.NextDouble() > location.encounterChance) return EncounterResult.NoEncounter;

            // Choose species by weight
            if (location.availableEncounters == null || location.availableEncounters.Count == 0)
                return EncounterResult.NoEncounter;

            string speciesID = ChooseByWeight(location.availableEncounters);
            OnEncounterStarted?.Invoke(speciesID);
            return new EncounterResult(true, speciesID, locationID);
        }

        private string ChooseByWeight(List<EncounterEntry> entries)
        {
            int total = entries.Sum(e => Math.Max(1, e.weight));
            int roll = rng.Next(1, total + 1);
            int cumulative = 0;
            foreach (var e in entries)
            {
                cumulative += Math.Max(1, e.weight);
                if (roll <= cumulative) return e.speciesID;
            }
            return entries[entries.Count - 1].speciesID;
        }
    }

    [Serializable]
    public struct EncounterResult
    {
        public bool triggered;
        public string speciesID;
        public string locationID;

        public EncounterResult(bool triggered, string speciesID, string locationID)
        {
            this.triggered = triggered;
            this.speciesID = speciesID;
            this.locationID = locationID;
        }

        public static EncounterResult NoEncounter => new EncounterResult(false, null, null);
    }
}

