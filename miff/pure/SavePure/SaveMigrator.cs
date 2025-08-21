using System;
using System.Collections.Generic;

namespace MIFF.Pure.Save
{
    /// <summary>
    /// Scaffolding for migrating older save snapshots to current version.
    /// </summary>
    public static class SaveMigrator
    {
        public static SaveSnapshot MigrateToCurrent(SaveSnapshot snapshot, out List<string> warnings)
        {
            warnings = new List<string>();
            if (snapshot.Version == "v1") return snapshot; // current

            // Example upgrade path: v0 -> v1
            if (snapshot.Version == "v0")
            {
                snapshot.Version = "v1";
                if (string.IsNullOrWhiteSpace(snapshot.ZoneId))
                {
                    snapshot.ZoneId = "newhaven";
                    warnings.Add("added_default_zone:newhaven");
                }
                return snapshot;
            }

            warnings.Add($"unknown_version:{snapshot.Version}");
            return snapshot;
        }
    }
}

