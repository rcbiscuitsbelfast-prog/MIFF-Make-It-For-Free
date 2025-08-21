using System;
using System.Collections.Generic;

namespace MIFF.Pure.Save
{
    /// <summary>
    /// Validates save snapshots for required fields, version support, and checksum plausibility.
    /// </summary>
    public class SaveValidator
    {
        private static readonly HashSet<string> SupportedVersions = new HashSet<string> { "v1" };

        public bool Validate(SaveSnapshot snapshot, out List<string> warnings)
        {
            warnings = new List<string>();
            if (snapshot == null) { warnings.Add("snapshot:null"); return false; }
            if (!SupportedVersions.Contains(snapshot.Version)) warnings.Add($"unsupported_version:{snapshot.Version}");
            if (string.IsNullOrWhiteSpace(snapshot.PlayerId)) warnings.Add("missing:playerId");
            if (string.IsNullOrWhiteSpace(snapshot.ZoneId)) warnings.Add("missing:zoneId");
            if (snapshot.PartyRoster == null) warnings.Add("missing:partyRoster");
            if (snapshot.Inventory == null) warnings.Add("missing:inventory");

            // Basic checksum plausibility (not cryptographic verification of entire JSON, but structure-level)
            if (string.IsNullOrWhiteSpace(snapshot.Checksum)) warnings.Add("missing:checksum");

            return warnings.Count == 0;
        }
    }
}

