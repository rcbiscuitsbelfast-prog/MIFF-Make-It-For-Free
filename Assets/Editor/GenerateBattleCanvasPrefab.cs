using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

public static class GenerateBattleCanvasPrefab
{
    [MenuItem("NewBark/Tools/Generate Battle Canvas Prefab")] 
    public static void Generate()
    {
        var root = new GameObject("BattleCanvas");
        var canvas = root.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        root.AddComponent<CanvasScaler>();
        root.AddComponent<GraphicRaycaster>();

        var controller = root.AddComponent<NewBark.Battle.BattleUIController>();

        // Command Panel
        var commandPanel = CreatePanel(root.transform, "CommandPanel");
        var fightBtn = CreateButton(commandPanel.transform, "Fight");
        var bagBtn = CreateButton(commandPanel.transform, "Bag");
        var switchBtn = CreateButton(commandPanel.transform, "Switch");
        var runBtn = CreateButton(commandPanel.transform, "Run");
        LayoutHorizontally(commandPanel);

        // Move Panel
        var movePanel = CreatePanel(root.transform, "MovePanel");
        var moveList = new GameObject("MoveList").AddComponent<VerticalLayoutGroup>();
        moveList.transform.SetParent(movePanel.transform, false);

        // Spirit Panel
        var spiritPanel = CreatePanel(root.transform, "SpiritPanel");
        var spiritList = new GameObject("SpiritList").AddComponent<VerticalLayoutGroup>();
        spiritList.transform.SetParent(spiritPanel.transform, false);

        // Item Panel
        var itemPanel = CreatePanel(root.transform, "ItemPanel");
        var itemList = new GameObject("ItemList").AddComponent<VerticalLayoutGroup>();
        itemList.transform.SetParent(itemPanel.transform, false);

        // Assign refs
        controller.commandPanel = commandPanel;
        controller.movePanel = movePanel;
        controller.spiritPanel = spiritPanel;
        controller.itemPanel = itemPanel;
        controller.fightButton = fightBtn;
        controller.bagButton = bagBtn;
        controller.switchButton = switchBtn;
        controller.runButton = runBtn;
        controller.moveListParent = moveList.transform;
        controller.spiritListParent = spiritList.transform;
        controller.itemListParent = itemList.transform;

        // Create a simple list button prefab in-scene (user can replace with a proper prefab)
        var btnPrefab = CreateButton(root.transform, "ListButtonPrefab");
        controller.listButtonPrefab = btnPrefab;

        // Save as prefab
        var path = "Assets/Prefabs/BattleCanvas.prefab";
        EnsureFolder("Assets/Prefabs");
#if UNITY_2018_3_OR_NEWER
        var prefab = PrefabUtility.SaveAsPrefabAsset(root, path);
#else
        var prefab = PrefabUtility.CreatePrefab(path, root);
#endif
        Object.DestroyImmediate(root);
        Selection.activeObject = prefab;
        Debug.Log("BattleCanvas prefab generated at " + path);
    }

    private static GameObject CreatePanel(Transform parent, string name)
    {
        var panel = new GameObject(name);
        panel.transform.SetParent(parent, false);
        var img = panel.AddComponent<Image>();
        img.color = new Color(0, 0, 0, 0.33f);
        var rt = panel.GetComponent<RectTransform>();
        rt.anchorMin = new Vector2(0f, 0f);
        rt.anchorMax = new Vector2(1f, 0.3f);
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
        panel.AddComponent<HorizontalLayoutGroup>();
        return panel;
    }

    private static Button CreateButton(Transform parent, string label)
    {
        var go = new GameObject(label);
        go.transform.SetParent(parent, false);
        var img = go.AddComponent<Image>();
        img.color = new Color(1, 1, 1, 0.1f);
        var btn = go.AddComponent<Button>();
        var txtGo = new GameObject("Text");
        txtGo.transform.SetParent(go.transform, false);
        var txt = txtGo.AddComponent<Text>();
        txt.text = label;
        txt.alignment = TextAnchor.MiddleCenter;
        txt.color = Color.white;
        var rt = txt.GetComponent<RectTransform>();
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
        return btn;
    }

    private static void LayoutHorizontally(GameObject panel)
    {
        var layout = panel.GetComponent<HorizontalLayoutGroup>();
        if (layout)
        {
            layout.childForceExpandHeight = true;
            layout.childForceExpandWidth = true;
            layout.spacing = 8f;
            layout.padding = new RectOffset(8, 8, 8, 8);
        }
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

