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
