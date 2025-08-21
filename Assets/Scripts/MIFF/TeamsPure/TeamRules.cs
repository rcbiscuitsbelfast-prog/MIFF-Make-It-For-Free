using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Spirits;

namespace MIFF.TeamsPure
{
    /// <summary>
    /// Validates team composition with constraints: size, diversity, synergy.
    /// </summary>
    [Serializable]
    public class TeamRules
    {
        public int maxTeamSize = 6;
        public bool requireTypeDiversity = false;
        public bool enableSyncSynergy = true;

        // Optional: supply spiritID->sync map for synergy checks
        public ValidationResult ValidateTeam(List<SpiritInstance> team, IDictionary<string, int> spiritSync = null)
        {
            team = team ?? new List<SpiritInstance>();
            if (team.Count > maxTeamSize)
                return ValidationResult.Fail(ValidationStatus.TooManyMembers, $"Team has {team.Count}/{maxTeamSize}");

            // Duplicate species check
            var dup = team.GroupBy(s => s.SpeciesID).FirstOrDefault(g => g.Count() > 1);
            if (dup != null)
                return ValidationResult.Fail(ValidationStatus.DuplicateSpecies, $"Duplicate species: {dup.Key}");

            if (requireTypeDiversity)
            {
                var types = new HashSet<string>();
                foreach (var s in team)
                {
                    types.Add(s.SpeciesID); // placeholder; replace with primary type when available
                }
                if (types.Count < Math.Min(team.Count, 3))
                    return ValidationResult.Fail(ValidationStatus.InvalidSynergy, "Insufficient diversity");
            }

            if (enableSyncSynergy && spiritSync != null)
            {
                // Simple synergy: average sync must be >= 10 per member
                double avg = team.Count > 0 ? team.Select(s => spiritSync.TryGetValue(s.InstanceID, out var v) ? v : 0).Average() : 0;
                if (avg < 10 * Math.Max(1, team.Count))
                    return ValidationResult.Fail(ValidationStatus.InvalidSynergy, "Low team sync synergy");
            }

            return ValidationResult.Ok("Team valid");
        }
    }
}

