using System;
using MIFF.SyncPure;

namespace MIFF.SyncPure
{
    /// <summary>
    /// Console tester for sync gains and threshold effects.
    /// </summary>
    [Serializable]
    public class SyncTestHarness
    {
        public void Run()
        {
            Console.WriteLine("=== Sync Test Harness ===");
            var sync = new SyncManager();
            var challenge = new SyncChallenge { difficulty = 2 };
            string spiritID = "sparkling_idol";
            sync.SetThresholds(spiritID, new[] { 20, 50, 100 });

            sync.OnSyncLevelChanged += (id, level) =>
            {
                Console.WriteLine($"Sync changed for {id}: {level}");
                foreach (var th in sync.GetThresholds(id))
                {
                    if (level == th) Console.WriteLine($"Threshold reached: {th}! Consider lore/evolution/stat boost.");
                }
            };

            // Simulate rhythm success
            int gain = challenge.EvaluatePerformance(0.85);
            Console.WriteLine($"Rhythm gain: {gain}");
            sync.IncreaseSync(spiritID, gain);

            // Simulate battle win event
            var evt = new SyncEvent { trigger = SyncTrigger.BattleWin, magnitude = 15 };
            sync.IncreaseSync(spiritID, evt.magnitude);

            // Reset test
            Console.WriteLine("Resetting...");
            sync.ResetSync(spiritID);
        }
    }
}

