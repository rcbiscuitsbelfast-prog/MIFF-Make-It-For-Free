using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Spirits;

namespace MIFF.TeamsPure
{
    /// <summary>
    /// Console tester for team management and validation.
    /// </summary>
    [Serializable]
    public class TeamManagementTestHarness
    {
        private SpiritInstance MakeSpirit(string speciesID, string name, int level)
        {
            var s = new SpiritInstance(speciesID);
            s.SetNickname(name);
            for (int i = 1; i < level; i++) s.GainExperience(1000);
            return s;
        }

        public void Run()
        {
            Console.WriteLine("=== Team Management Test Harness ===");
            var manager = new TeamManager();
            var rules = new TeamRules();
            var sync = new Dictionary<string, int>();

            var a = MakeSpirit("sparkling_idol", "Idol A", 10);
            var b = MakeSpirit("groove_spirit", "Groove B", 9);
            var c = MakeSpirit("echo_wisp", "Echo C", 8);

            sync[a.InstanceID] = 12;
            sync[b.InstanceID] = 11;
            sync[c.InstanceID] = 10;

            manager.AddToTeam(a);
            manager.AddToTeam(b);
            manager.AddToTeam(c);

            PrintTeam(manager.GetActiveTeam());
            var result = rules.ValidateTeam(manager.GetActiveTeam(), sync);
            Console.WriteLine("Validation: " + result);

            // Swap
            manager.SwapTeamMembers(0, 2);
            PrintTeam(manager.GetActiveTeam());

            // Remove
            manager.RemoveFromTeam(b.InstanceID);
            PrintTeam(manager.GetActiveTeam());
        }

        private void PrintTeam(List<SpiritInstance> team)
        {
            Console.WriteLine("Team:");
            for (int i = 0; i < team.Count; i++)
            {
                var s = team[i];
                Console.WriteLine($"  [{i}] {s.Nickname} ({s.SpeciesID}) Lv.{s.Level}");
            }
        }
    }
}

