using System;
using System.Collections.Generic;

namespace MIFF.ChallengesPure
{
    public enum ChallengeOutcome
    {
        Victory,
        Defeat,
        Timeout,
        Forfeit
    }

    [Serializable]
    public class ChallengeResult
    {
        public ChallengeOutcome outcome;
        public Dictionary<string, int> itemRewards = new Dictionary<string, int>();
        public List<string> loreFlags = new List<string>();
        public Dictionary<string, int> syncChanges = new Dictionary<string, int>(); // spiritID -> delta
        public string message;

        public override string ToString()
        {
            return $"{outcome} | items: [{string.Join(", ", itemRewards)}] | flags: [{string.Join(", ", loreFlags)}]";
        }
    }
}

