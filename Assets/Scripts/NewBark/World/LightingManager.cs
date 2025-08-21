using UnityEngine;

namespace NewBark.World
{
    public class LightingManager : MonoBehaviour
    {
        public static LightingManager Instance { get; private set; }
        public Color ambientColor = Color.white;
        public float directionalIntensity = 1f;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("LightingManager initialized (singleton, DontDestroyOnLoad).");
        }

        public void SetAmbient(Color color)
        {
            ambientColor = color;
            RenderSettings.ambientLight = color;
            Debug.Log("Lighting: ambient set to " + color);
        }

        public void SetDirectionalIntensity(float intensity)
        {
            directionalIntensity = intensity;
            Debug.Log("Lighting: directional intensity set to " + intensity);
        }

        public void ApplyPreset(string preset)
        {
            if (preset == "day") SetAmbient(Color.white);
            else if (preset == "dusk") SetAmbient(new Color(1f, 0.8f, 0.6f));
            else if (preset == "night") SetAmbient(new Color(0.2f, 0.2f, 0.35f));
            Debug.Log("Lighting preset: " + preset);
        }
    }
}