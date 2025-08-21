using System;
using System.Collections.Generic;
using MIFF.Pure.Combat;

namespace MIFF.Pure.Save
{
    /// <summary>
    /// Versioned, remix-safe save snapshot. Keep it engine-agnostic and serializable.
    /// </summary>
    public class SaveSnapshot
    {
        public string Version { get; set; } = "v1";
        public string PlayerId { get; set; } = string.Empty;
        public string ZoneId { get; set; } = "newhaven";
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
        public string? Checksum { get; set; }

        public List<SpiritInstance> PartyRoster { get; set; } = new List<SpiritInstance>();
        public Dictionary<string, int> Inventory { get; set; } = new Dictionary<string, int>();
    }
}

