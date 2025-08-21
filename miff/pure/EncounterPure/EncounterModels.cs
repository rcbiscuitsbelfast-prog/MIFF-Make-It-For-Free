using System;
using System.Collections.Generic;

namespace MIFF.Pure.Encounter
{
    public enum TriggerType
    {
        ZoneEntry,
        TileType,
        TimeOfDay
    }

    public class EncounterTableEntry
    {
        public string ZoneId { get; set; } = string.Empty;
        public string SpiritId { get; set; } = string.Empty;
        public int Weight { get; set; } = 1;
        public int MinLevel { get; set; } = 1;
        public int MaxLevel { get; set; } = 1;
    }

    public class EncounterTable
    {
        public string ZoneId { get; set; } = string.Empty;
        public List<EncounterTableEntry> Entries { get; set; } = new List<EncounterTableEntry>();
    }

    public class EncounterTrigger
    {
        public TriggerType TriggerType { get; set; }
        public Dictionary<string, string> TriggerParams { get; set; } = new Dictionary<string, string>();
        public string ZoneId { get; set; } = string.Empty;
    }

    public class PlayerState
    {
        public string ZoneId { get; set; } = string.Empty;
        public string TileType { get; set; } = "road"; // e.g., grass/road/cave
        public string TimeOfDay { get; set; } = "day"; // e.g., day/night
        public int StepsSinceLastEncounter { get; set; } = 0;
    }

    public class EncounterResult
    {
        public bool Triggered { get; set; }
        public string? ZoneId { get; set; }
        public string? SpiritId { get; set; }
        public int Level { get; set; }
    }
}

