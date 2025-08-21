using System;
using System.Linq;
using MIFF.Core;
using MIFF.SyncPure;

namespace MIFF.LorePure
{
    /// <summary>
    /// Console tester for lore unlock conditions and codex.
    /// </summary>
    [Serializable]
    public class LoreUnlockTestHarness
    {
        private class HeadlessPlayerContext : PlayerContext
        {
            public object GameData { get; set; }
            public SyncManager SyncManager { get; set; }
            public LoreFlagManager LoreFlagManager { get; set; } = new LoreFlagManager();
            public HeadlessPlayerContext() : base(null) { }
        }

        private readonly LoreCodexManager codex = new LoreCodexManager();

        public void Run()
        {
            Console.WriteLine("=== Lore Unlock Test Harness ===");
            var ctx = new HeadlessPlayerContext { SyncManager = new SyncManager() };
            SeedGameData(ctx);
            SeedLore(ctx);

            bool running = true;
            while (running)
            {
                Console.Write("Lore> ");
                var input = Console.ReadLine();
                if (input == null) continue;
                var parts = input.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                var cmd = parts[0].ToLowerInvariant();
                switch (cmd)
                {
                    case "gain":
                        if (parts.Length >= 3)
                        {
                            string spirit = parts[1];
                            int amount = int.Parse(parts[2]);
                            ctx.SyncManager.IncreaseSync(spirit, amount);
                            Console.WriteLine($"Sync[{spirit}] = {ctx.SyncManager.GetSyncLevel(spirit)}");
                        }
                        else Console.WriteLine("Usage: gain <spiritID> <amount>");
                        break;
                    case "flag":
                        if (parts.Length >= 2)
                        {
                            ctx.LoreFlagManager.SetLoreFlag(parts[1]);
                            Console.WriteLine("Set lore flag: " + parts[1]);
                        }
                        else Console.WriteLine("Usage: flag <flagID>");
                        break;
                    case "check":
                        CheckUnlocks(ctx);
                        break;
                    case "list":
                        foreach (var e in codex.GetUnlockedLore()) Console.WriteLine($"- {e.loreID}: {e.title}");
                        break;
                    case "quit":
                        running = false;
                        break;
                    default:
                        Console.WriteLine("Commands: gain <spirit> <amt>, flag <id>, check, list, quit");
                        break;
                }
            }
        }

        private void SeedGameData(HeadlessPlayerContext ctx)
        {
            // Minimal dynamic GameData with required collections
            var gd = new
            {
                capturedSpiritIDs = new System.Collections.Generic.HashSet<string> { "sparkling_idol" },
                onboardingFlags = new System.Collections.Generic.Dictionary<string, bool>(),
                visitedLocationIDs = new System.Collections.Generic.HashSet<string> { "town" }
            };
            ctx.GameData = gd;
        }

        private void SeedLore(HeadlessPlayerContext ctx)
        {
            var l1 = new LoreEntry
            {
                loreID = "lore_sync_20",
                title = "Resonant Beginnings",
                text = "Your bond begins to hum with energy.",
                relatedSpiritID = "sparkling_idol",
                syncThreshold = 20,
                unlockCondition = new LoreUnlockCondition { conditionType = LoreConditionType.SyncLevelReached }
            };
            codex.RegisterLore(l1);

            var l2 = new LoreEntry
            {
                loreID = "lore_flag_intro",
                title = "Mentor's Tale",
                text = "A mentor shares the history of Harmony Town.",
                unlockCondition = new LoreUnlockCondition { conditionType = LoreConditionType.QuestFlag, stringValue = "MentorMet" }
            };
            codex.RegisterLore(l2);
        }

        private void CheckUnlocks(HeadlessPlayerContext ctx)
        {
            foreach (var e in codex.GetAllLore())
            {
                if (e.IsUnlocked(ctx))
                {
                    codex.UnlockLore(e.loreID);
                    Console.WriteLine($"Unlocked lore: {e.loreID} - {e.title}");
                }
            }
        }
    }
}

