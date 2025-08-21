using System;
using System.Collections.Generic;

namespace MIFF.Pure.Rewards
{
    [Serializable]
    public class DropEntry
    {
        public string ItemId { get; set; } = string.Empty;
        public float Weight { get; set; }
    }

    [Serializable]
    public class DropTable
    {
        public List<DropEntry> Entries { get; set; } = new List<DropEntry>();
    }
}

