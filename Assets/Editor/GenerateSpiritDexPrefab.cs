using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

public static class GenerateSpiritDexPrefab
{
    [MenuItem("NewBark/Tools/Generate SpiritDex Prefab")] 
    public static void Generate()
    {
        var root = new GameObject("SpiritDexCanvas");
        var canvas = root.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        root.AddComponent<CanvasScaler>();
        root.AddComponent<GraphicRaycaster>();

        var ui = root.AddComponent<NewBark.UI.SpiritDexUI>();

        // List panel
        var listPanel = CreatePanel(root.transform, "SpiritListPanel", new Vector2(0f, 0f), new Vector2(0.35f, 1f));
        var scrollObj = new GameObject("ScrollView");
        scrollObj.transform.SetParent(listPanel.transform, false);
        var scroll = scrollObj.AddComponent<ScrollRect>();
        var viewport = new GameObject("Viewport").AddComponent<Mask>();
        viewport.transform.SetParent(scrollObj.transform, false);
        viewport.showMaskGraphic = false;
        var viewportRT = viewport.GetComponent<RectTransform>();
        viewportRT.anchorMin = Vector2.zero; viewportRT.anchorMax = Vector2.one; viewportRT.offsetMin = Vector2.zero; viewportRT.offsetMax = Vector2.zero;
        var content = new GameObject("Content").AddComponent<VerticalLayoutGroup>();
        content.transform.SetParent(viewport.transform, false);
        var contentRT = content.GetComponent<RectTransform>();
        contentRT.anchorMin = new Vector2(0, 1); contentRT.anchorMax = new Vector2(1, 1); contentRT.pivot = new Vector2(0.5f, 1);
        scroll.viewport = viewportRT;
        scroll.content = contentRT;

        // Simple list entry button prefab
        var listBtn = CreateListButton(root.transform, "ListEntryButton");

        // Detail panel
        var detail = CreatePanel(root.transform, "SpiritDetailPanel", new Vector2(0.35f, 0f), new Vector2(1f, 1f));
        var name = CreateText(detail.transform, "Name", 22, FontStyle.Bold);
        var row = new GameObject("Row").AddComponent<HorizontalLayoutGroup>();
        row.transform.SetParent(detail.transform, false);
        var front = CreateImage(row.transform, "Front");
        var back = CreateImage(row.transform, "Back");
        var emotion = CreateText(detail.transform, "Emotion", 14, FontStyle.Normal);
        var genre = CreateText(detail.transform, "Genre", 14, FontStyle.Normal);
        var affinity = CreateText(detail.transform, "Affinity", 14, FontStyle.Normal);
        var role = CreateText(detail.transform, "Role", 14, FontStyle.Normal);
        var stats = CreateText(detail.transform, "Stats", 14, FontStyle.Normal);
        var lore = CreateText(detail.transform, "Lore", 14, FontStyle.Normal);
        var playBtn = CreateButton(detail.transform, "PlayCry", "Play Cry");

        // Assign
        ui.spiritListPanel = contentRT;
        ui.listEntryButtonPrefab = listBtn;
        ui.frontImage = front;
        ui.backImage = back;
        ui.nameText = name;
        ui.emotionText = emotion;
        ui.genreText = genre;
        ui.affinityText = affinity;
        ui.roleText = role;
        ui.statsText = stats;
        ui.loreText = lore;
        ui.playCryButton = playBtn;

        // Save
        EnsureFolder("Assets/Prefabs");
        var path = "Assets/Prefabs/SpiritDexCanvas.prefab";
#if UNITY_2018_3_OR_NEWER
        var prefab = PrefabUtility.SaveAsPrefabAsset(root, path);
#else
        var prefab = PrefabUtility.CreatePrefab(path, root);
#endif
        Object.DestroyImmediate(root);
        Selection.activeObject = prefab;
        Debug.Log("SpiritDexCanvas prefab generated at " + path);
    }

    private static GameObject CreatePanel(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        var img = go.AddComponent<Image>();
        img.color = new Color(0, 0, 0, 0.2f);
        var rt = go.GetComponent<RectTransform>();
        rt.anchorMin = anchorMin; rt.anchorMax = anchorMax; rt.offsetMin = Vector2.zero; rt.offsetMax = Vector2.zero;
        return go;
    }

    private static Text CreateText(Transform parent, string name, int size, FontStyle style)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        var txt = go.AddComponent<Text>();
        txt.text = name;
        txt.fontSize = size;
        txt.fontStyle = style;
        txt.color = Color.white;
        var rt = txt.GetComponent<RectTransform>();
        rt.anchorMin = new Vector2(0, 1); rt.anchorMax = new Vector2(1, 1); rt.pivot = new Vector2(0.5f, 1);
        rt.offsetMin = new Vector2(8, -size - 8); rt.offsetMax = new Vector2(-8, 0);
        return txt;
    }

    private static Button CreateButton(Transform parent, string name, string label)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        var img = go.AddComponent<Image>(); img.color = new Color(1, 1, 1, 0.1f);
        var btn = go.AddComponent<Button>();
        var txt = CreateText(go.transform, "Text", 16, FontStyle.Normal);
        txt.text = label;
        var rt = txt.GetComponent<RectTransform>(); rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one; rt.offsetMin = Vector2.zero; rt.offsetMax = Vector2.zero;
        return btn;
    }

    private static Image CreateImage(Transform parent, string name)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        var img = go.AddComponent<Image>();
        var rt = img.GetComponent<RectTransform>(); rt.sizeDelta = new Vector2(96, 96);
        return img;
    }

    private static Button CreateListButton(Transform parent, string name)
    {
        var btn = CreateButton(parent, name, name);
        return btn;
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

