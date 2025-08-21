using System;
using System.Collections.Generic;
using NewBark.Support;

namespace NewBark.State
{
    [Serializable]
    public class GameData
    {
        public static readonly int SchemaVersion = 3;
        public static readonly int MinCompatibleSchemaVersion = 2;

        public DateTime startDate = DateTime.Now;
        public DateTime saveDate = DateTime.Now;
        public float playTime;

        public string areaTitleTrigger;
        public SerializableVector2 playerPosition;
        public SerializableVector2 playerDirection;

        [Serializable]
        public class QuestEntry
        {
            public string id;
            public int step;
            public string status; // Active | Completed | Failed
        }

        public List<QuestEntry> quests = new List<QuestEntry>();
    }
}
