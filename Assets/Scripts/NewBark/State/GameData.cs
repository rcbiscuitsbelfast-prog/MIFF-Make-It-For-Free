using System;
using NewBark.Support;

namespace NewBark.State
{
    [Serializable]
    public class GameData
    {
        public static readonly int SchemaVersion = 2;
        public static readonly int MinCompatibleSchemaVersion = 2;

        public DateTime startDate = DateTime.Now;
        public DateTime saveDate = DateTime.Now;
        public float playTime;

        public string areaTitleTrigger;
        public SerializableVector2 playerPosition;
        public SerializableVector2 playerDirection;
        // Remix quest/dialog support
        public System.Collections.Generic.Dictionary<string, bool> flags;

        // Quest progress per save
        public System.Collections.Generic.HashSet<string> activeQuestIDs;
        public System.Collections.Generic.HashSet<string> completedQuestIDs;
        // Key: "questID.objectiveID" → bool
        public System.Collections.Generic.Dictionary<string, bool> questObjectiveProgress;

        // Inventory and currency per save
        public System.Collections.Generic.Dictionary<string, int> inventoryCounts;
        public int playerCurrency;

        // SpiritDex: discovered species IDs
        public System.Collections.Generic.HashSet<string> discoveredSpiritIDs;
    }
}
