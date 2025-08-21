using System;
using System.Collections.Generic;

namespace MIFF.BattleAIPure
{
    /// <summary>
    /// Assigns and provides AI controllers per profile.
    /// </summary>
    [Serializable]
    public class AIManager
    {
        private readonly Dictionary<string, AIDecisionProfile> profiles = new Dictionary<string, AIDecisionProfile>();

        public void RegisterProfile(AIDecisionProfile profile)
        {
            if (profile == null || string.IsNullOrEmpty(profile.profileID)) return;
            profiles[profile.profileID] = profile;
        }

        public BattleAIController GetAIController(string profileID)
        {
            if (!profiles.TryGetValue(profileID, out var p))
            {
                p = AIDecisionProfile.CreateDefault(profileID ?? "default", AIDecisionStyle.Balanced);
                profiles[p.profileID] = p;
            }
            return new BattleAIController(p);
        }
    }
}

