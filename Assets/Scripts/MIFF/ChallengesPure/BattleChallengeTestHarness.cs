using System;
using System.Linq;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.ChallengesPure
{
    /// <summary>
    /// Console tester for battle challenges: list/start/complete and apply rewards.
    /// </summary>
    [Serializable]
    public class BattleChallengeTestHarness
    {
        private class HeadlessPlayerContext : PlayerContext
        {
            public object GameData { get; set; }
            public object LoreFlagManager { get; set; }
            public Dictionary<string, int> InventoryCounts { get; } = new Dictionary<string, int>();
            public string CurrentLocationID { get; set; }
            public HeadlessPlayerContext() : base(null) { }
        }

        private readonly ChallengeManager manager = new ChallengeManager();

        public void Run()
        {
            Console.WriteLine("=== Battle Challenge Test Harness ===");
            var ctx = new HeadlessPlayerContext { CurrentLocationID = "arena" };
            SeedChallenges(ctx);

            bool running = true;
            while (running)
            {
                Console.Write("Challenge> ");
                var input = Console.ReadLine();
                if (input == null) continue;
                var parts = input.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                var cmd = parts[0].ToLowerInvariant();
                switch (cmd)
                {
                    case "list":
                        foreach (var c in manager.GetAvailable().Where(c => c.IsAvailable(ctx)))
                        {
                            Console.WriteLine($"- {c.challengeID}: {c.name} | {c.description}");
                        }
                        break;
                    case "start":
                        if (parts.Length > 1) manager.StartChallenge(parts[1]); else Console.WriteLine("Usage: start <challengeID>");
                        break;
                    case "complete":
                        if (parts.Length > 2)
                        {
                            var id = parts[1];
                            var outcome = Enum.Parse<ChallengeOutcome>(parts[2], true);
                            var result = new ChallengeResult { outcome = outcome };
                            ApplyRewards(ctx, id, result);
                            manager.CompleteChallenge(id, result);
                            Console.WriteLine($"Completed {id} with {outcome}");
                        }
                        else Console.WriteLine("Usage: complete <challengeID> <Victory|Defeat|Timeout|Forfeit>");
                        break;
                    case "quit":
                        running = false;
                        break;
                    default:
                        Console.WriteLine("Commands: list, start <id>, complete <id> <result>, quit");
                        break;
                }
            }
        }

        private void SeedChallenges(HeadlessPlayerContext ctx)
        {
            var c = new BattleChallenge
            {
                challengeID = "arena_01",
                name = "Rhythm Rumble",
                description = "Win within 5 turns using only Pop-type spirits.",
                ruleset = new ChallengeRuleset
                {
                    allowedSpiritTypes = { "Pop" },
                    turnLimit = 5,
                    bannedItems = { "revive" },
                    environmentTag = "spotlight"
                },
                rewards = new Dictionary<string, int> { { "potion", 2 }, { "revive", 1 } },
                loreFlagsToSet = new List<string> { "ArenaRookie" },
                requiredLocationID = "arena"
            };
            manager.Register(c);
        }

        private void ApplyRewards(HeadlessPlayerContext ctx, string challengeID, ChallengeResult result)
        {
            if (!manager.IsChallengeComplete(challengeID) && result.outcome == ChallengeOutcome.Victory)
            {
                // Lookup challenge to copy rewards
                var challenge = manager.GetAvailable().FirstOrDefault(x => x.challengeID == challengeID);
                if (challenge != null)
                {
                    foreach (var kv in challenge.rewards)
                    {
                        result.itemRewards[kv.Key] = kv.Value;
                        ctx.InventoryCounts[kv.Key] = ctx.InventoryCounts.TryGetValue(kv.Key, out var c) ? c + kv.Value : kv.Value;
                    }
                    result.loreFlags.AddRange(challenge.loreFlagsToSet);
                }
            }
        }
    }
}

