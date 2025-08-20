using System.Linq;
using UnityEditor;
using UnityEngine;

public static class CreateRemixFolders
{
    private static readonly string[] RequiredFolders =
    {
        "Assets/Objects",
        "Assets/Objects/Creatures",
        "Assets/Objects/Creatures/SpiritSpecies",
        "Assets/Objects/Creatures/SpiritInstances",
        "Assets/Objects/Moves",
        "Assets/Objects/Moves/SongMoves",
        "Assets/Objects/Player",
        "Assets/Objects/Player/PlayerProfiles",
        "Assets/Objects/Items",
        "Assets/Objects/Items/BattleItems",
        "Assets/Objects/Encounters",
        "Assets/Objects/Encounters/EncounterTables"
    };

    [MenuItem("NewBark/Tools/Create Remix-Safe Folder Structure")]
    public static void CreateFolders()
    {
        int created = 0;
        foreach (var path in RequiredFolders)
        {
            created += EnsureFolder(path) ? 1 : 0;
        }

        AssetDatabase.Refresh();
        Debug.Log($"Remix-Safe folder structure ensured. Newly created: {created}, Total ensured: {RequiredFolders.Length}");
    }

    private static bool EnsureFolder(string folderPath)
    {
        if (AssetDatabase.IsValidFolder(folderPath))
        {
            return false;
        }

        var parts = folderPath.Split('/')
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .ToArray();

        if (parts.Length == 0 || parts[0] != "Assets")
        {
            Debug.LogError($"Invalid folder path: '{folderPath}'. Must start with 'Assets/'.");
            return false;
        }

        string current = "Assets";
        for (int i = 1; i < parts.Length; i++)
        {
            string next = parts[i];
            string combined = $"{current}/{next}";

            if (!AssetDatabase.IsValidFolder(combined))
            {
                AssetDatabase.CreateFolder(current, next);
            }

            current = combined;
        }

        return true;
    }
}

