using System.Linq;
using NewBark.Databases;
using UnityEditor;
using UnityEngine;

public static class RegistryValidator
{
    [MenuItem("MIFF/Generate Databases")] 
    public static void GenerateDatabases()
    {
        EnsureFolder("Assets/Objects/Databases");
        Generate<SpiritDatabase>("Assets/Objects/Databases/SpiritDatabase.asset", FindAssetsOfType<NewBark.SpiritBattles.Objects.Creatures.SpiritSpecies>());
        Generate<MoveDatabase>("Assets/Objects/Databases/MoveDatabase.asset", FindAssetsOfType<NewBark.SpiritBattles.Objects.Moves.SongMove>());
        Generate<ItemDatabase>("Assets/Objects/Databases/ItemDatabase.asset", FindAssetsOfType<NewBark.SpiritBattles.Objects.Items.BattleItem>());
        AssetDatabase.SaveAssets();
        Debug.Log("Databases generated.");
    }

    [MenuItem("MIFF/Validate Databases")] 
    public static void ValidateDatabases()
    {
        var spiritDb = LoadOrNull<SpiritDatabase>("Assets/Objects/Databases/SpiritDatabase.asset");
        var moveDb = LoadOrNull<MoveDatabase>("Assets/Objects/Databases/MoveDatabase.asset");
        var itemDb = LoadOrNull<ItemDatabase>("Assets/Objects/Databases/ItemDatabase.asset");
        // Trigger OnValidate by minor change
        if (spiritDb) EditorUtility.SetDirty(spiritDb);
        if (moveDb) EditorUtility.SetDirty(moveDb);
        if (itemDb) EditorUtility.SetDirty(itemDb);
        AssetDatabase.SaveAssets();
        Debug.Log("Databases validated (check Console for warnings).");
    }

    private static void Generate<TDb>(string path, Object[] assets) where TDb : ScriptableObject
    {
        var db = LoadOrCreate<TDb>(path);
        if (db is SpiritDatabase sdb)
        {
            sdb.spirits = assets.Cast<NewBark.SpiritBattles.Objects.Creatures.SpiritSpecies>().ToArray();
        }
        else if (db is MoveDatabase mdb)
        {
            mdb.moves = assets.Cast<NewBark.SpiritBattles.Objects.Moves.SongMove>().ToArray();
        }
        else if (db is ItemDatabase idb)
        {
            idb.items = assets.Cast<NewBark.SpiritBattles.Objects.Items.BattleItem>().ToArray();
        }
        EditorUtility.SetDirty(db);
    }

    private static TDb LoadOrCreate<TDb>(string path) where TDb : ScriptableObject
    {
        var db = AssetDatabase.LoadAssetAtPath<TDb>(path);
        if (!db)
        {
            db = ScriptableObject.CreateInstance<TDb>();
            AssetDatabase.CreateAsset(db, path);
        }
        return db;
    }

    private static TDb LoadOrNull<TDb>(string path) where TDb : ScriptableObject
    {
        return AssetDatabase.LoadAssetAtPath<TDb>(path);
    }

    private static Object[] FindAssetsOfType<T>() where T : Object
    {
        var guids = AssetDatabase.FindAssets($"t:{typeof(T).Name}");
        return guids.Select(g => AssetDatabase.LoadAssetAtPath<Object>(AssetDatabase.GUIDToAssetPath(g))).ToArray();
    }

    private static void EnsureFolder(string folder)
    {
        if (AssetDatabase.IsValidFolder(folder)) return;
        var parts = folder.Split('/');
        var current = "Assets";
        for (int i = 1; i < parts.Length; i++)
        {
            var next = parts[i];
            var combined = current + "/" + next;
            if (!AssetDatabase.IsValidFolder(combined))
            {
                AssetDatabase.CreateFolder(current, next);
            }
            current = combined;
        }
    }
}

