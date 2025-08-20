using NewBark.Battle.Audio;
using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(BattleAudioManager))]
public class BattleAudioDebugger : Editor
{
    public override void OnInspectorGUI()
    {
        base.OnInspectorGUI();

        var mgr = (BattleAudioManager)target;
        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Battle Audio Debugger", EditorStyles.boldLabel);

        using (new EditorGUILayout.HorizontalScope())
        {
            if (GUILayout.Button("Play Base Track") && Application.isPlaying)
            {
                var clip = EditorGUILayout.ObjectField(null, typeof(AudioClip), false) as AudioClip;
            }
        }

        // Simple buttons to exercise stem playback
        using (new EditorGUILayout.HorizontalScope())
        {
            if (GUILayout.Button("Play Test Stem") && Application.isPlaying)
            {
                var clip = GetFirstAudioClip();
                if (clip) mgr.PlayMoveStem(clip);
            }

            if (GUILayout.Button("Stop Stems") && Application.isPlaying)
            {
                mgr.StopStems();
            }
        }
    }

    private AudioClip GetFirstAudioClip()
    {
        var guids = AssetDatabase.FindAssets("t:AudioClip");
        if (guids.Length == 0) return null;
        var path = AssetDatabase.GUIDToAssetPath(guids[0]);
        return AssetDatabase.LoadAssetAtPath<AudioClip>(path);
    }
}

