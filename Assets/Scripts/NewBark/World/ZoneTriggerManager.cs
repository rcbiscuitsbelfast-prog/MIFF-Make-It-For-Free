using System.Collections.Generic;
using UnityEngine;

namespace NewBark.World
{
    public class ZoneTriggerManager : MonoBehaviour
    {
        public static ZoneTriggerManager Instance { get; private set; }

        private class Zone
        {
            public string id;
            public string onEnter;
            public string onExit;
        }

        private readonly Dictionary<string, Zone> zones = new Dictionary<string, Zone>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("ZoneTriggerManager initialized (singleton, DontDestroyOnLoad).");
        }

        public void DefineZone(string id, string onEnter, string onExit)
        {
            zones[id] = new Zone {id = id, onEnter = onEnter, onExit = onExit};
            Debug.Log($"Zone defined: {id} enter={onEnter} exit={onExit}");
        }

        public void EnterZone(string id)
        {
            if (zones.TryGetValue(id, out var z))
            {
                Debug.Log($"Zone enter: {id} -> trigger '{z.onEnter}'");
            }
        }

        public void ExitZone(string id)
        {
            if (zones.TryGetValue(id, out var z))
            {
                Debug.Log($"Zone exit: {id} -> trigger '{z.onExit}'");
            }
        }
    }
}