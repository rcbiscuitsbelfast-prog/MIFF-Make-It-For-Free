using System;
using System.Collections.Generic;
using NewBark.Support;

namespace NewBark.State
{
    [Serializable]
    public class GameData
    {
        public static readonly int SchemaVersion = 10;
        public static readonly int MinCompatibleSchemaVersion = 2;

        public DateTime startDate = DateTime.Now;
        public DateTime saveDate = DateTime.Now;
        public float playTime;

        public string areaTitleTrigger;
        public SerializableVector2 playerPosition;
        public SerializableVector2 playerDirection;

        [Serializable]
        public class Settings
        {
            public float musicVolume = 0.8f;
            public float sfxVolume = 0.7f;
            public string language = "en";
            public bool showSubtitles = true;
        }

        public Settings settings = new Settings();

        [Serializable]
        public class QuestEntry
        {
            public string id;
            public int step;
            public string status; // Active | Completed | Failed
        }

        public List<QuestEntry> quests = new List<QuestEntry>();

        [Serializable]
        public class ItemEntry
        {
            public string id;
            public int quantity; // total quantity for stackable items
        }

        // Inventory: persisted as a list of item id + quantity
        public List<ItemEntry> inventory = new List<ItemEntry>();

        [Serializable]
        public class ChoiceEntry
        {
            public string textId;
            public string nextLineId;
            public string startQuestId;
            public string rewardItemId;
            public int rewardQty;
        }

        [Serializable]
        public class LineEntry
        {
            public string id;
            public string textId;
            public ChoiceEntry[] choices;
        }

        [Serializable]
        public class DialogEntry
        {
            public string id;
            public LineEntry[] lines;
        }

        // Dialogs: data-driven branching dialogs with localized text ids
        public List<DialogEntry> dialogs = new List<DialogEntry>();

        [Serializable]
        public class StatsEntry
        {
            public int level;
            public int hp;
            public int attack;
            public int defense;
            public int speed;
        }

        [Serializable]
        public class MetadataEntry
        {
            public string key;
            public string value;
        }

        [Serializable]
        public class CreatureEntry
        {
            public string id; // unique creature id
            public string nameId; // localization id for nickname/default
            public string speciesId;
            public bool isCaptured;
            public StatsEntry stats;
            public string[] moves;
            public MetadataEntry[] metadata;
        }

        // Global collections
        public List<CreatureEntry> creatures = new List<CreatureEntry>();
        public List<string> party = new List<string>(); // ordered list of creature ids

        [Serializable]
        public class LoreEntry
        {
            public string id;
            public string title;
            public string body;
            public string[] tags;
            public string unlockHint;
        }

        [Serializable]
        public class Codex
        {
            public List<string> unlocked = new List<string>();
        }

        // Codex data and optional preload lore database
        public Codex codex = new Codex();
        public List<LoreEntry> loreEntries = new List<LoreEntry>();

        // XP/Level progression (schema v10)
        [Serializable]
        public class XPEntry { public string id; public int xp; }

        [Serializable]
        public class LevelState
        {
            public int level;
            public int xp;
            public int nextLevelXp;
            public SerializableDictionary[] statBoosts; // key/value pairs serialized
            public string[] unlockedSkills;
        }

        [Serializable]
        public class LevelEntry { public string id; public LevelState state; }

        public List<XPEntry> xp = new List<XPEntry>();
        public List<LevelEntry> levels = new List<LevelEntry>();

        [Serializable]
        public class SerializableDictionary
        {
            public string key;
            public string value;
        }
    }
}
