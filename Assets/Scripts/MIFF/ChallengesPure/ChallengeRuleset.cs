using System;
using System.Collections.Generic;

namespace MIFF.ChallengesPure
{
    public enum ChallengeRuleType
    {
        SpiritTypeRestriction,
        TurnLimit,
        ItemBan,
        EnvironmentalEffect
    }

    /// <summary>
    /// Describes a set of simple challenge rules. Extend or specialize as needed.
    /// </summary>
    [Serializable]
    public class ChallengeRuleset
    {
        public List<string> allowedSpiritTypes = new List<string>();
        public int turnLimit = 0; // 0 = no limit
        public List<string> bannedItems = new List<string>();
        public string environmentTag; // e.g., "rain", "spotlight", etc.

        public bool IsCompliant(IEnumerable<string> partySpiritTypes, IEnumerable<string> items)
        {
            // Type restrictions
            if (allowedSpiritTypes != null && allowedSpiritTypes.Count > 0 && partySpiritTypes != null)
            {
                foreach (var t in partySpiritTypes)
                {
                    if (!allowedSpiritTypes.Contains(t)) return false;
                }
            }

            // Item bans
            if (bannedItems != null && items != null)
            {
                foreach (var it in items)
                {
                    if (bannedItems.Contains(it)) return false;
                }
            }

            return true;
        }
    }
}

