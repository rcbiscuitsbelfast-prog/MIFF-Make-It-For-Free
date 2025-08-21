using UnityEngine;

namespace NewBark.World
{
    public class OverlayManager : MonoBehaviour
    {
        public static OverlayManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("OverlayManager initialized (singleton, DontDestroyOnLoad).");
        }

        public void FadeIn(float duration)
        {
            Debug.Log($"Overlay FadeIn {duration}s");
        }

        public void FadeOut(float duration)
        {
            Debug.Log($"Overlay FadeOut {duration}s");
        }

        public void Tint(Color color, float duration)
        {
            Debug.Log($"Overlay Tint {color} {duration}s");
        }

        public void Flash(Color color, float duration)
        {
            Debug.Log($"Overlay Flash {color} {duration}s");
        }
    }
}