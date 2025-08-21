using System.Collections.Generic;

namespace MIFF.LorePure
{
    /// <summary>
    /// Manages lore unlock triggers independent of engine.
    /// </summary>
    public class LoreUnlockManager
    {
        private readonly LoreFlagManager _flags;
        private readonly Dictionary<string, string> _defeatToFlag = new Dictionary<string, string>();
        private readonly Dictionary<string, string> _evolveToFlag = new Dictionary<string, string>();
        private readonly Dictionary<string, string> _discoverToFlag = new Dictionary<string, string>();

        public LoreUnlockManager(LoreFlagManager flags)
        {
            _flags = flags;
        }

        public void RegisterDefeatFlag(string enemyId, string flagId) { _defeatToFlag[enemyId] = flagId; }
        public void RegisterEvolveFlag(string spiritId, string flagId) { _evolveToFlag[spiritId] = flagId; }
        public void RegisterDiscoverFlag(string objectId, string flagId) { _discoverToFlag[objectId] = flagId; }

        public void OnEnemyDefeated(string enemyId) { if (_defeatToFlag.TryGetValue(enemyId, out var f)) _flags.SetLoreFlag(f); }
        public void OnSpiritEvolved(string spiritId) { if (_evolveToFlag.TryGetValue(spiritId, out var f)) _flags.SetLoreFlag(f); }
        public void OnObjectDiscovered(string objectId) { if (_discoverToFlag.TryGetValue(objectId, out var f)) _flags.SetLoreFlag(f); }
    }
}

