using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.LorePure
{
    /// <summary>
    /// Pure C# lore entry with unlock logic.
    /// </summary>
    [Serializable]
    public class LoreEntry
    {
        public string loreID;
        public string title;
        public string text;

        public LoreUnlockCondition unlockCondition = new LoreUnlockCondition();

        // Optional metadata
        public string relatedSpiritID;
        public string locationID;
        public string questID;
        public int syncThreshold;

        public bool IsUnlocked(PlayerContext ctx)
        {
            return unlockCondition != null && unlockCondition.IsMet(ctx, this);
        }
    }
}

