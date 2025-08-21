using System;
using System.Collections.Generic;

namespace MIFF.QuestsPure
{
    /// <summary>
    /// Pure C# global flag store for lore/unlocks.
    /// </summary>
    [Serializable]
    public class QuestFlagManager
    {
        private readonly HashSet<string> flags = new HashSet<string>();

        public void SetFlag(string flagID)
        {
            if (!string.IsNullOrEmpty(flagID)) flags.Add(flagID);
        }

        public bool HasFlag(string flagID)
        {
            return !string.IsNullOrEmpty(flagID) && flags.Contains(flagID);
        }

        public override string ToString()
        {
            return flags.Count == 0 ? "(no flags)" : string.Join(", ", flags);
        }
    }
}

