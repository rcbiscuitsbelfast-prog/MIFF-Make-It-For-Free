using System;
using System.Collections.Generic;
using MIFF.Pure.Combat;

namespace MIFF.Pure.AI
{
    /// <summary>
    /// Assigns policies and builds AI instances per spirit or profile id.
    /// </summary>
    public class AIManager
    {
        private readonly Dictionary<string, AIPolicy> _policies = new Dictionary<string, AIPolicy>();
        private readonly TypeEffectiveness _types;

        public AIManager(TypeEffectiveness? types = null)
        {
            _types = types ?? new TypeEffectiveness();
        }

        public void RegisterPolicy(AIPolicy policy)
        {
            if (policy == null || string.IsNullOrWhiteSpace(policy.PolicyId)) return;
            _policies[policy.PolicyId] = policy;
        }

        public BattleAI GetAI(string spiritIdOrPolicyId)
        {
            if (!_policies.TryGetValue(spiritIdOrPolicyId ?? "default", out var policy))
            {
                policy = AIPolicy.Balanced(spiritIdOrPolicyId ?? "default");
                _policies[policy.PolicyId] = policy;
            }
            return new BattleAI(policy, _types);
        }
    }
}

