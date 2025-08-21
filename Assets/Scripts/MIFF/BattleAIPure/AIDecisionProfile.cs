using System;
using System.Collections.Generic;

namespace MIFF.BattleAIPure
{
    public enum AIDecisionStyle
    {
        Aggressive,
        Defensive,
        Balanced,
        Trickster
    }

    /// <summary>
    /// Defines AI behavior style and optional weights/preferences.
    /// </summary>
    [Serializable]
    public class AIDecisionProfile
    {
        public string profileID;
        public AIDecisionStyle style = AIDecisionStyle.Balanced;
        public Dictionary<string, float> movePriorityWeights = new Dictionary<string, float>
        {
            { "damage", 1.0f },
            { "healing", 0.5f },
            { "support", 0.6f }
        };
        public List<string> preferredTypes = new List<string>(); // use SpiritType name strings

        public static AIDecisionProfile CreateDefault(string id, AIDecisionStyle style)
        {
            var p = new AIDecisionProfile { profileID = id, style = style };
            switch (style)
            {
                case AIDecisionStyle.Aggressive:
                    p.movePriorityWeights["damage"] = 1.3f;
                    p.movePriorityWeights["healing"] = 0.3f;
                    p.movePriorityWeights["support"] = 0.5f;
                    break;
                case AIDecisionStyle.Defensive:
                    p.movePriorityWeights["damage"] = 0.8f;
                    p.movePriorityWeights["healing"] = 1.2f;
                    p.movePriorityWeights["support"] = 1.0f;
                    break;
                case AIDecisionStyle.Trickster:
                    p.movePriorityWeights["damage"] = 0.9f;
                    p.movePriorityWeights["healing"] = 0.6f;
                    p.movePriorityWeights["support"] = 1.3f;
                    break;
            }
            return p;
        }
    }
}

