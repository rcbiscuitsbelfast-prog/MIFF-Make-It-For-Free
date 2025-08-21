using System;
using System.Collections.Generic;

namespace MIFF.SyncPure
{
    /// <summary>
    /// Tracks sync levels per spirit and emits change events.
    /// </summary>
    [Serializable]
    public class SyncManager
    {
        private readonly Dictionary<string, int> spiritSync = new Dictionary<string, int>();
        private readonly Dictionary<string, List<int>> spiritThresholds = new Dictionary<string, List<int>>();

        public event Action<string, int> OnSyncLevelChanged; // (spiritID, newLevel)

        public int GetSyncLevel(string spiritID)
        {
            return spiritSync.TryGetValue(spiritID, out var level) ? level : 0;
        }

        public void IncreaseSync(string spiritID, int amount)
        {
            if (string.IsNullOrEmpty(spiritID) || amount <= 0) return;
            int current = GetSyncLevel(spiritID);
            int next = checked(current + amount);
            spiritSync[spiritID] = next;
            OnSyncLevelChanged?.Invoke(spiritID, next);
        }

        public void ResetSync(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID)) return;
            spiritSync[spiritID] = 0;
            OnSyncLevelChanged?.Invoke(spiritID, 0);
        }

        public void SetThresholds(string spiritID, IEnumerable<int> thresholds)
        {
            if (string.IsNullOrEmpty(spiritID)) return;
            spiritThresholds[spiritID] = thresholds != null ? new List<int>(thresholds) : new List<int>();
            spiritThresholds[spiritID].Sort();
        }

        public IReadOnlyList<int> GetThresholds(string spiritID)
        {
            return spiritThresholds.TryGetValue(spiritID, out var list) ? list : new List<int>();
        }
    }
}

