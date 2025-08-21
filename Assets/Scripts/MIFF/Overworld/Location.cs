using System;
using System.Collections.Generic;

namespace MIFF.Overworld
{
    /// <summary>
    /// Describes a location in the overworld and its encounter/lore/quest data.
    /// Pure C# POCO, safe for headless testing.
    /// </summary>
    [Serializable]
    public class Location
    {
        public string locationID;
        public string name;
        public string description;
        public float encounterChance; // 0.0 to 1.0

        // Optional content hooks
        public List<EncounterEntry> availableEncounters = new List<EncounterEntry>();
        public List<string> loreUnlockIDs = new List<string>();
        public List<string> questTriggerIDs = new List<string>();

        public override string ToString()
        {
            return $"{name} ({locationID}) - {description}";
        }
    }

    /// <summary>
    /// Weighted encounter entry for random selection.
    /// </summary>
    [Serializable]
    public class EncounterEntry
    {
        public string speciesID;
        public string displayName;
        public int weight = 1;
    }
}

