using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Spirits;

namespace MIFF.TeamsPure
{
    /// <summary>
    /// Tracks active team and reserves; supports add/remove/swap operations.
    /// </summary>
    [Serializable]
    public class TeamManager
    {
        private readonly List<SpiritInstance> activeTeam = new List<SpiritInstance>();
        private readonly List<SpiritInstance> reserves = new List<SpiritInstance>();
        public int MaxTeamSize { get; set; } = 6;

        public bool AddToTeam(SpiritInstance spirit)
        {
            if (spirit == null) return false;
            if (activeTeam.Count >= MaxTeamSize)
            {
                reserves.Add(spirit);
                return false;
            }
            activeTeam.Add(spirit);
            return true;
        }

        public bool RemoveFromTeam(string spiritID)
        {
            if (string.IsNullOrEmpty(spiritID)) return false;
            int idx = activeTeam.FindIndex(s => s.InstanceID == spiritID);
            if (idx >= 0)
            {
                activeTeam.RemoveAt(idx);
                return true;
            }
            idx = reserves.FindIndex(s => s.InstanceID == spiritID);
            if (idx >= 0)
            {
                reserves.RemoveAt(idx);
                return true;
            }
            return false;
        }

        public bool SwapTeamMembers(int indexA, int indexB)
        {
            if (indexA < 0 || indexA >= activeTeam.Count || indexB < 0 || indexB >= activeTeam.Count) return false;
            var tmp = activeTeam[indexA];
            activeTeam[indexA] = activeTeam[indexB];
            activeTeam[indexB] = tmp;
            return true;
        }

        public List<SpiritInstance> GetActiveTeam()
        {
            return new List<SpiritInstance>(activeTeam);
        }

        public List<SpiritInstance> GetReserves()
        {
            return new List<SpiritInstance>(reserves);
        }
    }
}

