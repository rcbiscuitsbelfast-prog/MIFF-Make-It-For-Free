using System.Collections.Generic;
using UnityEngine;
using NewBark.World;

namespace NewBark.WorldLayout
{
    public class MapManager : MonoBehaviour
    {
        public static MapManager Instance { get; private set; }

        public class Zone
        {
            public string id;
            public string name;
            public Rect bounds;
            public string[] tags;
        }

        private readonly Dictionary<string, Zone> idToZone = new Dictionary<string, Zone>();
        public string currentMapName;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("MapManager initialized (singleton, DontDestroyOnLoad).");
        }

        public void LoadMap(string mapName)
        {
            currentMapName = mapName;
            idToZone.Clear();
            Debug.Log("MapManager: loaded map " + mapName + " (stub)");
        }

        public void DefineZone(string id, string name, Rect bounds, string[] tags)
        {
            idToZone[id] = new Zone {id = id, name = name, bounds = bounds, tags = tags};
            Debug.Log($"MapManager: defined zone {id} name={name} bounds={bounds}");
        }

        public Zone GetZone(string id)
        {
            return idToZone.TryGetValue(id, out var z) ? z : null;
        }

        public void LinkTrigger(string id, string onEnter, string onExit)
        {
            if (ZoneTriggerManager.Instance == null)
            {
                Debug.LogWarning("MapManager: ZoneTriggerManager not available");
                return;
            }

            ZoneTriggerManager.Instance.DefineZone(id, onEnter, onExit);
            Debug.Log($"MapManager: linked zone {id} to triggers enter={onEnter} exit={onExit}");
        }
    }
}