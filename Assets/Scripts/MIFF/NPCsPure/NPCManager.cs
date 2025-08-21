using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.NPCsPure
{
    /// <summary>
    /// Pure C# NPC registry, optionally grouped by location.
    /// </summary>
    [Serializable]
    public class NPCManager
    {
        private readonly Dictionary<string, NPC> npcs = new Dictionary<string, NPC>();
        private readonly Dictionary<string, List<string>> locationToNpcIds = new Dictionary<string, List<string>>();

        public void RegisterNPC(NPC npc, string locationID = null)
        {
            if (npc == null || string.IsNullOrEmpty(npc.npcID)) return;
            npcs[npc.npcID] = npc;
            if (!string.IsNullOrEmpty(locationID))
            {
                if (!locationToNpcIds.ContainsKey(locationID)) locationToNpcIds[locationID] = new List<string>();
                if (!locationToNpcIds[locationID].Contains(npc.npcID)) locationToNpcIds[locationID].Add(npc.npcID);
            }
        }

        public NPC GetNPC(string npcID)
        {
            return string.IsNullOrEmpty(npcID) ? null : (npcs.TryGetValue(npcID, out var npc) ? npc : null);
        }

        public InteractionResult InteractWithNPC(string npcID, PlayerContext ctx)
        {
            var npc = GetNPC(npcID);
            return npc != null ? npc.Interact(ctx) : new InteractionResult { success = false, message = "NPC not found" };
        }

        public IReadOnlyList<string> GetNPCsAtLocation(string locationID)
        {
            if (string.IsNullOrEmpty(locationID) || !locationToNpcIds.ContainsKey(locationID)) return Array.Empty<string>();
            return locationToNpcIds[locationID];
        }
    }
}

