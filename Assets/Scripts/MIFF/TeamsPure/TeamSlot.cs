using System;

namespace MIFF.TeamsPure
{
    public enum TeamSlotStatus
    {
        Active,
        Fainted,
        Reserved
    }

    /// <summary>
    /// Represents a slot assignment in a team.
    /// </summary>
    [Serializable]
    public class TeamSlot
    {
        public int slotIndex;
        public string spiritID;
        public TeamSlotStatus status = TeamSlotStatus.Reserved;
        public string positionTag; // leader, support, wildcard, etc.
    }
}

