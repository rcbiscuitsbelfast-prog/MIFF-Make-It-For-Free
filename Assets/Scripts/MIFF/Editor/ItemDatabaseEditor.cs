using UnityEngine;
using UnityEditor;
using MIFF.Items;

namespace MIFF.Editor
{
    /// <summary>
    /// Custom editor for ItemDatabase ScriptableObject
    /// </summary>
    [CustomEditor(typeof(ItemDatabase))]
    public class ItemDatabaseEditor : Editor
    {
        private ItemDatabase itemDatabase;
        private bool showItems = true;
        private bool showTools = true;
        
        private void OnEnable()
        {
            itemDatabase = (ItemDatabase)target;
        }
        
        public override void OnInspectorGUI()
        {
            serializedObject.Update();
            
            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Item Database", EditorStyles.boldLabel);
            EditorGUILayout.Space();
            
            // Items section
            showItems = EditorGUILayout.Foldout(showItems, "Registered Items", true);
            if (showItems)
            {
                EditorGUI.indentLevel++;
                EditorGUILayout.PropertyField(serializedObject.FindProperty("registeredItems"), true);
                EditorGUI.indentLevel--;
            }
            
            EditorGUILayout.Space();
            
            // Tools section
            showTools = EditorGUILayout.Foldout(showTools, "Database Tools", true);
            if (showTools)
            {
                EditorGUI.indentLevel++;
                
                if (GUILayout.Button("Validate All Items"))
                {
                    itemDatabase.ValidateItems();
                }
                
                if (GUILayout.Button("Refresh Lookup"))
                {
                    // This would call a public method to refresh the lookup
                    EditorUtility.SetDirty(itemDatabase);
                }
                
                if (GUILayout.Button("Find All Items in Project"))
                {
                    FindAllItemsInProject();
                }
                
                EditorGUI.indentLevel--;
            }
            
            serializedObject.ApplyModifiedProperties();
        }
        
        /// <summary>
        /// Find all Item_SO assets in the project and add them to the database
        /// </summary>
        private void FindAllItemsInProject()
        {
            var guids = AssetDatabase.FindAssets("t:Item_SO");
            var items = new System.Collections.Generic.List<Item_SO>();
            
            foreach (var guid in guids)
            {
                var path = AssetDatabase.GUIDToAssetPath(guid);
                var item = AssetDatabase.LoadAssetAtPath<Item_SO>(path);
                if (item != null)
                {
                    items.Add(item);
                }
            }
            
            Debug.Log($"Found {items.Count} Item_SO assets in project");
            
            // You could add logic here to automatically register found items
            // For now, just log them
            foreach (var item in items)
            {
                Debug.Log($"Found item: {item.name} (ID: {item.ItemID})");
            }
        }
    }
}