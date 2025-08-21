using System;
using System.IO;
using MIFF.Pure.Combat;

namespace MIFF.Pure.Save
{
    /// <summary>
    /// Console tester for save/load v1.
    /// </summary>
    public static class SaveLoadTestHarness
    {
        public static void Main(string[] args)
        {
            string path = args.Length > 0 ? args[0] : "./save_sample.json";
            var snapshot = new SaveSnapshot
            {
                Version = "v1",
                PlayerId = "player_001",
                ZoneId = "newhaven"
            };
            snapshot.PartyRoster.Add(new SpiritInstance{ Id=1, SpiritId="sprout", Name="Sprout", MaxHP=30, CurrentHP=28 });
            snapshot.Inventory["potion"] = 2;

            var mgr = new SaveManager();
            mgr.SaveGame(snapshot, path);
            Console.WriteLine($"Saved to {Path.GetFullPath(path)}");

            var loaded = mgr.LoadGame(path);
            Console.WriteLine($"Loaded Player={loaded.PlayerId} Zone={loaded.ZoneId} Roster={loaded.PartyRoster.Count} Items={loaded.Inventory.Count}");
        }
    }
}

