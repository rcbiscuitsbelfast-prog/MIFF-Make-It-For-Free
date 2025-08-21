using System;
using System.Collections.Generic;

namespace MIFF.Overworld
{
    /// <summary>
    /// Simple graph-based overworld map connecting locations by ID.
    /// </summary>
    [Serializable]
    public class WorldMap
    {
        private readonly Dictionary<string, Location> idToLocation = new Dictionary<string, Location>();
        private readonly Dictionary<string, List<string>> adjacency = new Dictionary<string, List<string>>();

        public void AddLocation(Location loc)
        {
            if (loc == null || string.IsNullOrEmpty(loc.locationID)) return;
            idToLocation[loc.locationID] = loc;
            if (!adjacency.ContainsKey(loc.locationID))
                adjacency[loc.locationID] = new List<string>();
        }

        public void Connect(string fromLocationID, string toLocationID, bool bidirectional = true)
        {
            if (string.IsNullOrEmpty(fromLocationID) || string.IsNullOrEmpty(toLocationID)) return;
            if (!adjacency.ContainsKey(fromLocationID)) adjacency[fromLocationID] = new List<string>();
            if (!adjacency.ContainsKey(toLocationID)) adjacency[toLocationID] = new List<string>();
            if (!adjacency[fromLocationID].Contains(toLocationID)) adjacency[fromLocationID].Add(toLocationID);
            if (bidirectional && !adjacency[toLocationID].Contains(fromLocationID)) adjacency[toLocationID].Add(fromLocationID);
        }

        public IReadOnlyList<string> GetAdjacentLocations(string locationID)
        {
            if (string.IsNullOrEmpty(locationID) || !adjacency.ContainsKey(locationID))
                return Array.Empty<string>();
            return adjacency[locationID];
        }

        public Location GetLocation(string locationID)
        {
            if (string.IsNullOrEmpty(locationID)) return null;
            return idToLocation.TryGetValue(locationID, out var loc) ? loc : null;
        }
    }
}

