using UnityEngine;

namespace NewBark.World
{
    public class WorldEnhancementsManager : MonoBehaviour
    {
        public static WorldEnhancementsManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("WorldEnhancementsManager initialized (singleton, DontDestroyOnLoad).");

            // ensure sub-managers exist
            if (OverlayManager.Instance == null) new GameObject("OverlayManager").AddComponent<OverlayManager>();
            if (LightingManager.Instance == null) new GameObject("LightingManager").AddComponent<LightingManager>();
            if (TimedEventManager.Instance == null) new GameObject("TimedEventManager").AddComponent<TimedEventManager>();
            if (ZoneTriggerManager.Instance == null) new GameObject("ZoneTriggerManager").AddComponent<ZoneTriggerManager>();
        }

        public OverlayManager Overlay => OverlayManager.Instance;
        public LightingManager Lighting => LightingManager.Instance;
        public TimedEventManager Timed => TimedEventManager.Instance;
        public ZoneTriggerManager Zones => ZoneTriggerManager.Instance;
    }
}