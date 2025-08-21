using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Core;

namespace MIFF.EvolutionPure
{
    /// <summary>
    /// Pure C# evolution manager using a registry of species evolution data.
    /// </summary>
    [Serializable]
    public class EvolutionManager
    {
        private readonly Dictionary<string, SpeciesEvolutionData> speciesData = new Dictionary<string, SpeciesEvolutionData>();
        private readonly PlayerContext context;

        public EvolutionManager(PlayerContext ctx)
        {
            context = ctx;
        }

        public void RegisterSpeciesEvolution(SpeciesEvolutionData data)
        {
            if (data == null || string.IsNullOrEmpty(data.speciesID)) return;
            speciesData[data.speciesID] = data.Clone();
        }

        public bool CanEvolve(Spirits.SpiritInstance spirit)
        {
            return GetEvolutionTarget(spirit) != null;
        }

        public string GetEvolutionTarget(Spirits.SpiritInstance spirit)
        {
            if (spirit == null || !spirit.CanEvolve) return null;
            if (!speciesData.TryGetValue(spirit.SpeciesID, out var data)) return null;
            if (string.IsNullOrEmpty(data.evolutionTargetID)) return null;
            if (data.conditions == null || data.conditions.Count == 0) return data.evolutionTargetID;
            return data.conditions.All(c => c.IsMet(spirit, context)) ? data.evolutionTargetID : null;
        }

        public EvolutionResult EvolveSpirit(Spirits.SpiritInstance spirit)
        {
            if (spirit == null)
                return EvolutionResult.Fail(EvolutionStatus.ConditionsNotMet, "No spirit.");

            var target = GetEvolutionTarget(spirit);
            if (target == null)
                return EvolutionResult.Fail(EvolutionStatus.ConditionsNotMet, "Conditions not met or no target.");

            if (spirit.SpeciesID == target)
                return EvolutionResult.Fail(EvolutionStatus.AlreadyEvolved, "Already evolved.");

            spirit.Evolve(target);
            return EvolutionResult.Ok(target, $"Evolved to {target}");
        }
    }

    /// <summary>
    /// Holds per-species evolution data (target + conditions) in a pure C# format.
    /// </summary>
    [Serializable]
    public class SpeciesEvolutionData
    {
        public string speciesID;
        public string evolutionTargetID;
        public List<EvolutionCondition> conditions = new List<EvolutionCondition>();

        public SpeciesEvolutionData Clone()
        {
            return new SpeciesEvolutionData
            {
                speciesID = speciesID,
                evolutionTargetID = evolutionTargetID,
                conditions = new List<EvolutionCondition>(conditions ?? new List<EvolutionCondition>())
            };
        }
    }
}

