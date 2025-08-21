using System;
using System.Collections.Generic;

namespace MIFF.LorePure
{
    /// <summary>
    /// Pure C# lore flag manager.
    /// </summary>
    [Serializable]
    public class LoreFlagManager
    {
        private readonly HashSet<string> flags = new HashSet<string>();

        public void SetLoreFlag(string flagID)
        {
            if (!string.IsNullOrEmpty(flagID)) flags.Add(flagID);
        }

        public bool HasLoreFlag(string flagID)
        {
            return !string.IsNullOrEmpty(flagID) && flags.Contains(flagID);
        }

        public override string ToString()
        {
            return flags.Count == 0 ? "(no lore flags)" : string.Join(", ", flags);
        }
    }
}

