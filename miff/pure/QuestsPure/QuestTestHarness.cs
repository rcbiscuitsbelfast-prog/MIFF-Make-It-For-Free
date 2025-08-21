using System;
using System.Linq;

namespace MIFF.QuestsPure
{
    /// <summary>
    /// Console tester for the pure C# quest system.
    /// </summary>
    [Serializable]
    public class QuestTestHarness
    {
        private readonly QuestManager manager = new QuestManager();
        private readonly QuestFlagManager flags = new QuestFlagManager();

        public void Run()
        {
            Console.WriteLine("=== Quest Test Harness ===");
            SeedQuests();

            bool running = true;
            while (running)
            {
                Console.Write("Quest> ");
                var input = Console.ReadLine();
                if (input == null) continue;
                var parts = input.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                var cmd = parts[0].ToLowerInvariant();
                var args = parts.Skip(1).ToArray();

                switch (cmd)
                {
                    case "avail":
                        foreach (var q in manager.GetAvailableQuests()) Console.WriteLine(q);
                        break;
                    case "active":
                        foreach (var q in manager.GetActiveQuests())
                        {
                            Console.WriteLine(q);
                            foreach (var o in q.objectives) Console.WriteLine("  - " + o);
                        }
                        break;
                    case "start":
                        if (args.Length > 0) manager.StartQuest(args[0]); else Console.WriteLine("Usage: start <questID>");
                        break;
                    case "prog":
                        if (args.Length >= 3)
                        {
                            var type = Enum.Parse<ObjectiveType>(args[0], true);
                            var target = args[1];
                            var amt = int.Parse(args[2]);
                            // For simplicity, update all active quests
                            foreach (var q in manager.GetActiveQuests()) manager.AddProgress(q.questID, type, target, amt);
                        }
                        else Console.WriteLine("Usage: prog <ObjectiveType> <targetID> <amount>");
                        break;
                    case "complete":
                        if (args.Length > 0) manager.CompleteQuest(args[0]); else Console.WriteLine("Usage: complete <questID>");
                        break;
                    case "flags":
                        Console.WriteLine(flags.ToString());
                        break;
                    case "help":
                        Console.WriteLine("Commands: avail, active, start <id>, prog <type> <target> <amt>, complete <id>, flags, help, quit");
                        break;
                    case "quit":
                        running = false;
                        break;
                    default:
                        Console.WriteLine("Unknown command. Type 'help'.");
                        break;
                }
            }
        }

        private void SeedQuests()
        {
            var q = new Quest
            {
                questID = "echo_001",
                name = "Echoes of the Alley",
                description = "Find the whispers and prove your rhythm.",
            };
            q.objectives.Add(new QuestObjective { type = ObjectiveType.VisitLocation, targetID = "alley", requiredCount = 1 });
            q.objectives.Add(new QuestObjective { type = ObjectiveType.CaptureSpirit, targetID = "echo_wisp", requiredCount = 1 });
            q.loreFlagsToSet.Add("EchoesFound");
            q.itemRewards["potion"] = 2;

            manager.RegisterQuest(q);
        }
    }
}

