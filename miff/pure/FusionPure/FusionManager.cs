using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.FusionPure
{
    /// <summary>
    /// Pure C# fusion orchestrator using FusionRules.
    /// </summary>
    [Serializable]
    public class FusionManager
    {
        private readonly FusionRules rules = new FusionRules();
        private readonly PlayerContext context;

        public event Action<string> OnFusionPerformed; // newSpiritID

        public FusionManager(PlayerContext ctx)
        {
            context = ctx;
        }

        public FusionRules Rules => rules;

        public bool CanFuse(Spirits.SpiritInstance a, Spirits.SpiritInstance b)
        {
            if (a == null || b == null) return false;
            if (a.InstanceID == b.InstanceID) return false;
            var rule = rules.FindMatch(a.SpeciesID, b.SpeciesID);
            if (rule == null) return false;
            return rules.ConstraintsMet(rule, context, a.InstanceID, b.InstanceID);
        }

        public FusionResult Fuse(Spirits.SpiritInstance a, Spirits.SpiritInstance b)
        {
            if (a == null || b == null) return FusionResult.Fail(FusionStatus.IncompatiblePair, "Missing partner.");
            var rule = rules.FindMatch(a.SpeciesID, b.SpeciesID);
            if (rule == null) return FusionResult.Fail(FusionStatus.IncompatiblePair, "No matching rule.");
            if (!rules.ConstraintsMet(rule, context, a.InstanceID, b.InstanceID))
                return FusionResult.Fail(FusionStatus.IncompatiblePair, "Constraints not met.");

            // Optional: prevent repeat fusion by checking a fusion history via reflection
            if (HasFusedBefore(a, b))
                return FusionResult.Fail(FusionStatus.AlreadyFused, "Pair already fused.");

            // Produce result
            var traits = rules.GetInheritedTraits(rule);
            var result = FusionResult.Ok(rule.resultSpeciesID, traits, "Fusion successful.");

            // Apply lore flags or other hooks via context as needed
            OnFusionPerformed?.Invoke(result.newSpiritID);
            return result;
        }

        private bool HasFusedBefore(Spirits.SpiritInstance a, Spirits.SpiritInstance b)
        {
            // Attempt to read a fusion history list on the instances via reflection
            var histA = a.GetType().GetField("fusionHistory", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)?.GetValue(a) as List<string>;
            var histB = b.GetType().GetField("fusionHistory", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)?.GetValue(b) as List<string>;
            string key = MakePairKey(a, b);
            return (histA != null && histA.Contains(key)) || (histB != null && histB.Contains(key));
        }

        private string MakePairKey(Spirits.SpiritInstance a, Spirits.SpiritInstance b)
        {
            var ids = new List<string> { a.InstanceID, b.InstanceID };
            ids.Sort();
            return string.Join("+", ids);
        }
    }
}

