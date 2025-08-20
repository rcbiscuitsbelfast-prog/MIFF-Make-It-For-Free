using System.Linq;
using UnityEditor;
using UnityEngine;
using NewBark.SpiritBattles;
using NewBark.SpiritBattles.Objects.Moves;
using NewBark.SpiritBattles.Objects.Creatures;
using NewBark.SpiritBattles.Objects.Player;

public static class GenerateSampleSpiritAssets
{
    private const string MovesPath = "Assets/Objects/Moves/SongMoves";
    private const string SpeciesPath = "Assets/Objects/Creatures/SpiritSpecies";
    private const string ProfilesPath = "Assets/Objects/Player/PlayerProfiles";

    [MenuItem("NewBark/Tools/Generate Sample Spirit Assets")] 
    public static void Generate()
    {
        EnsureFolder(MovesPath);
        EnsureFolder(SpeciesPath);
        EnsureFolder(ProfilesPath);

        // Placeholder assets for sprites and audio
        var placeholderSprite = GetAnyAsset<Sprite>();
        var placeholderClip = GetAnyAsset<AudioClip>();

        // 1) SongMoves
        var echoJab = CreateMove("Echo_Jab", "Echo Jab", MoveType.Verse, 20, 95, null, EmotionCore.Joy, placeholderClip);
        var syncShield = CreateMove("Sync_Shield", "Sync Shield", MoveType.Bridge, 0, 100, "Boost Sync", EmotionCore.Longing, placeholderClip);
        var bassKick = CreateMove("Bass_Kick", "Bass Kick", MoveType.Chorus, 40, 90, null, EmotionCore.Rage, placeholderClip);
        var dropCrash = CreateMove("Drop_Crash", "Drop Crash", MoveType.Drop, 70, 85, null, EmotionCore.Mischief, placeholderClip);
        var mistVeil = CreateMove("Mist_Veil", "Mist Veil", MoveType.Bridge, 0, 100, "Evasion Boost", EmotionCore.Fear, placeholderClip);
        var emotionTune = CreateMove("Emotion_Tune", "Emotion Tune", MoveType.Verse, 25, 95, "Heal Spirit", EmotionCore.Joy, placeholderClip);

        // 2) SpiritSpecies
        var sori = CreateSpecies(
            id: "Sori",
            display: "Sori",
            core: EmotionCore.Longing,
            genre: GenreBias.Ballad,
            affinity: AffinityType.Moon,
            role: BattleRole.Support,
            pulse: 50, rhythm: 60, flow: 70, sync: 80,
            moves: new[] { echoJab, emotionTune },
            sprite: placeholderSprite,
            cry: placeholderClip
        );

        var dropbit = CreateSpecies(
            id: "Dropbit",
            display: "Dropbit",
            core: EmotionCore.Mischief,
            genre: GenreBias.EDM,
            affinity: AffinityType.Neon,
            role: BattleRole.Debuff,
            pulse: 40, rhythm: 85, flow: 50, sync: 60,
            moves: new[] { bassKick, dropCrash },
            sprite: placeholderSprite,
            cry: placeholderClip
        );

        var sogeum = CreateSpecies(
            id: "Sogeum",
            display: "Sogeum",
            core: EmotionCore.Fear,
            genre: GenreBias.Ambient,
            affinity: AffinityType.Wind,
            role: BattleRole.Evasion,
            pulse: 45, rhythm: 60, flow: 75, sync: 65,
            moves: new[] { mistVeil, syncShield },
            sprite: placeholderSprite,
            cry: placeholderClip
        );

        // 3) PlayerProfile
        CreateProfile(
            id: "Juno",
            display: "Juno",
            style: FightStyle.Pulsecaster,
            hp: 100, rhythm: 70, sync: 60,
            signatures: new[] { echoJab, syncShield },
            avatar: placeholderSprite
        );

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("Sample spirit assets created/updated.");
    }

    private static T GetAnyAsset<T>() where T : Object
    {
        var guids = AssetDatabase.FindAssets($"t:{typeof(T).Name}");
        if (guids != null && guids.Length > 0)
        {
            var path = AssetDatabase.GUIDToAssetPath(guids[0]);
            return AssetDatabase.LoadAssetAtPath<T>(path);
        }

        return null;
    }

    private static void EnsureFolder(string path)
    {
        if (AssetDatabase.IsValidFolder(path)) return;
        var parts = path.Split('/')
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .ToArray();
        string current = "Assets";
        for (int i = 1; i < parts.Length; i++)
        {
            var next = parts[i];
            var combined = $"{current}/{next}";
            if (!AssetDatabase.IsValidFolder(combined))
            {
                AssetDatabase.CreateFolder(current, next);
            }
            current = combined;
        }
    }

    private static SongMove CreateMove(string id, string name, MoveType type, int power, int accuracy, string effect, EmotionCore emo, AudioClip clip)
    {
        var asset = ScriptableObject.CreateInstance<SongMove>();
        asset.moveID = id;
        asset.displayName = name;
        asset.moveType = type;
        asset.power = power;
        asset.accuracy = accuracy;
        asset.effectDescription = effect;
        asset.emotionAffinity = emo;
        asset.moveSound = clip;

        var path = $"{MovesPath}/{SanitizeFileName(name)}.asset";
        var existing = AssetDatabase.LoadAssetAtPath<SongMove>(path);
        if (existing == null)
        {
            AssetDatabase.CreateAsset(asset, path);
        }
        else
        {
            EditorUtility.CopySerialized(asset, existing);
            Object.DestroyImmediate(asset);
            asset = existing;
        }

        return asset;
    }

    private static SpiritSpecies CreateSpecies(string id, string display, EmotionCore core, GenreBias genre, AffinityType affinity, BattleRole role,
        int pulse, int rhythm, int flow, int sync, SongMove[] moves, Sprite sprite, AudioClip cry)
    {
        var asset = ScriptableObject.CreateInstance<SpiritSpecies>();
        asset.spiritID = id;
        asset.displayName = display;
        asset.emotionCore = core;
        asset.genreBias = genre;
        asset.affinity = affinity;
        asset.battleRole = role;
        asset.pulse = pulse;
        asset.rhythm = rhythm;
        asset.flow = flow;
        asset.sync = sync;
        asset.moveSet = moves;
        asset.frontSprite = sprite;
        asset.cry = cry;

        var path = $"{SpeciesPath}/{SanitizeFileName(display)}.asset";
        var existing = AssetDatabase.LoadAssetAtPath<SpiritSpecies>(path);
        if (existing == null)
        {
            AssetDatabase.CreateAsset(asset, path);
        }
        else
        {
            EditorUtility.CopySerialized(asset, existing);
            Object.DestroyImmediate(asset);
            asset = existing;
        }

        return asset;
    }

    private static PlayerProfile CreateProfile(string id, string display, FightStyle style, int hp, int rhythm, int sync, SongMove[] signatures, Sprite avatar)
    {
        var asset = ScriptableObject.CreateInstance<PlayerProfile>();
        asset.profileID = id;
        asset.displayName = display;
        asset.fightStyle = style;
        asset.HP = hp;
        asset.rhythm = rhythm;
        asset.sync = sync;
        asset.signatureMoves = signatures;
        asset.avatarSprite = avatar;

        var path = $"{ProfilesPath}/{SanitizeFileName(display)}.asset";
        var existing = AssetDatabase.LoadAssetAtPath<PlayerProfile>(path);
        if (existing == null)
        {
            AssetDatabase.CreateAsset(asset, path);
        }
        else
        {
            EditorUtility.CopySerialized(asset, existing);
            Object.DestroyImmediate(asset);
            asset = existing;
        }

        return asset;
    }

    private static string SanitizeFileName(string name)
    {
        foreach (char c in System.IO.Path.GetInvalidFileNameChars())
        {
            name = name.Replace(c.ToString(), "_");
        }
        return name;
    }
}

