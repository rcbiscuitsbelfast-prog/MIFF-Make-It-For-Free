using System;
using System.IO;
using UnityEngine;

namespace NewBark.State
{
    public static class SaveManager
    {
        private const string SaveFilePrefix = "newbark-gamedata_v";
        private const string SaveFileSuffix = ".sav";

        private static string GetSaveFileName(int schemaVersion)
        {
            return Path.Combine(Application.persistentDataPath, SaveFilePrefix + schemaVersion + SaveFileSuffix);
        }

        private static string GetSaveFileName()
        {
            return GetSaveFileName(GameData.SchemaVersion);
        }

        private static string FindSaveFileName()
        {
            for (var i = GameData.SchemaVersion; i >= GameData.MinCompatibleSchemaVersion; i--)
            {
                var fileName = GetSaveFileName(i);

                if (File.Exists(fileName))
                {
                    return fileName;
                }
            }

            return null;
        }

        public static void Save(GameData data)
{
    var json = JsonUtility.ToJson(data);
    File.WriteAllText(GetSaveFileName(), json);
    Debug.Log("Game SAVED. " + GetPlayTime(data));
}

        public static GameData Load()
{
    var fileName = FindSaveFileName();
    if (fileName == null) return null;

    var json = File.ReadAllText(fileName);
    if (string.IsNullOrEmpty(json))
    {
        return null;
    }

    var data = JsonUtility.FromJson<GameData>(json);
    if (data == null)
    {
        Debug.LogWarning("SaveManager: JSON parse returned null. Returning null data.");
        return null;
    }

    // Migration hook: initialize quests for schema < 3
// If the persisted file name indicates an older schema or quests is null, ensure non-null list.
if (data.quests == null)
{
    data.quests = new System.Collections.Generic.List<GameData.QuestEntry>();
    Debug.Log("SaveManager: Migrated GameData to schema v3 - initialized empty QuestState.");
}
// Migration hook: initialize inventory for schema < 4
if (data.inventory == null)
{
    data.inventory = new System.Collections.Generic.List<GameData.ItemEntry>();
    Debug.Log("SaveManager: Migrated GameData to schema v4 - initialized empty Inventory.");
}
// Migration hook: initialize dialogs for schema < 5
if (data.dialogs == null)
{
    data.dialogs = new System.Collections.Generic.List<GameData.DialogEntry>();
    Debug.Log("SaveManager: Migrated GameData to schema v5 - initialized empty Dialogs store.");
}
// Migration hook: initialize creatures/party for schema < 6
if (data.creatures == null)
{
    data.creatures = new System.Collections.Generic.List<GameData.CreatureEntry>();
}
if (data.party == null)
{
    data.party = new System.Collections.Generic.List<string>();
}
// Migration hook: initialize codex for schema < 7
if (data.codex == null)
{
    data.codex = new GameData.Codex();
}
if (data.codex.unlocked == null)
{
    data.codex.unlocked = new System.Collections.Generic.List<string>();
}

Debug.Log("Game LOADED. ");
return data;
}

        private static string GetPlayTime(GameData data)
        {
            var t = TimeSpan.FromSeconds(data.playTime);
            return "Play time: " + string.Format(
                       "{0:D2} hours, {1:D2} minutes, {2:D2} seconds, {3:D3} ms",
                       t.Hours,
                       t.Minutes,
                       t.Seconds,
                       t.Milliseconds
                   );
        }
    }
}
