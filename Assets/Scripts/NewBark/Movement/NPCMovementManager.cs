using System.Collections.Generic;
using UnityEngine;

namespace NewBark.Movement
{
    public enum MovementPattern
    {
        Idle,
        Patrol,
        Follow,
        Flee
    }

    public class NPCMovementManager : MonoBehaviour
    {
        public static NPCMovementManager Instance { get; private set; }

        private class NPC
        {
            public string id;
            public MovementPattern pattern;
            public List<Vector2> waypoints = new List<Vector2>();
            public string followTargetId;
        }

        private readonly Dictionary<string, NPC> npcs = new Dictionary<string, NPC>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("NPCMovementManager initialized (singleton, DontDestroyOnLoad).");
        }

        public void AssignMovement(string npcId, MovementPattern pattern)
        {
            GetOrCreate(npcId).pattern = pattern;
            Debug.Log($"NPC {npcId} pattern set to {pattern}");
        }

        public void SetWaypoints(string npcId, List<Vector2> points)
        {
            GetOrCreate(npcId).waypoints = points;
            Debug.Log($"NPC {npcId} waypoints set: {points.Count}");
        }

        public void SetFollowTarget(string npcId, string targetId)
        {
            GetOrCreate(npcId).followTargetId = targetId;
            Debug.Log($"NPC {npcId} follow target set to {targetId}");
        }

        public void SimulateTick(float delta)
        {
            foreach (var kv in npcs)
            {
                var npc = kv.Value;
                // Stubbed movement logic
                switch (npc.pattern)
                {
                    case MovementPattern.Idle:
                        break;
                    case MovementPattern.Patrol:
                        // TODO: step through waypoints
                        break;
                    case MovementPattern.Follow:
                        // TODO: move towards follow target
                        break;
                    case MovementPattern.Flee:
                        // TODO: move away from a threat
                        break;
                }
            }
        }

        private NPC GetOrCreate(string id)
        {
            if (!npcs.TryGetValue(id, out var npc))
            {
                npc = new NPC {id = id, pattern = MovementPattern.Idle};
                npcs[id] = npc;
            }
            return npc;
        }
    }
}