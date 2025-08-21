using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.NPCsPure
{
    /// <summary>
    /// Console tester for NPC interactions.
    /// </summary>
    [Serializable]
    public class NPCInteractionTestHarness
    {
        private class HeadlessPlayerContext : PlayerContext
        {
            public object GameData { get; set; }
            public object QuestManager { get; set; }
            public Dictionary<string, int> InventoryCounts { get; } = new Dictionary<string, int>();
            public HeadlessPlayerContext() : base(null) { }
        }

        private readonly NPCManager manager = new NPCManager();

        public void Run()
        {
            Console.WriteLine("=== NPC Interaction Test Harness ===");
            var ctx = new HeadlessPlayerContext();
            SeedNPCs();

            bool running = true;
            while (running)
            {
                Console.Write("NPC> ");
                var input = Console.ReadLine();
                if (input == null) continue;
                var parts = input.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                var cmd = parts[0].ToLowerInvariant();
                switch (cmd)
                {
                    case "interact":
                        if (parts.Length > 1)
                        {
                            var res = manager.InteractWithNPC(parts[1], ctx);
                            Console.WriteLine(res);
                            foreach (var line in res.playedLines)
                            {
                                Console.WriteLine($"{line.speaker}: {line.text}");
                            }
                        }
                        else Console.WriteLine("Usage: interact <npcID>");
                        break;
                    case "quit":
                        running = false;
                        break;
                    default:
                        Console.WriteLine("Commands: interact <npcID>, quit");
                        break;
                }
            }
        }

        private void SeedNPCs()
        {
            var npc = new NPC
            {
                npcID = "mentor",
                name = "Rhythm Mentor",
                interactionType = InteractionType.Dialogue,
                dialogueLines = new List<DialogueLine>
                {
                    new DialogueLine { speaker = "Mentor", text = "Welcome to Harmony Town!", choiceID = "intro" },
                    new DialogueLine { speaker = "Mentor", text = "Here, take this potion.", choices = { new DialogueChoice { text = "Thanks!", setFlags = { "MetMentor" } } } }
                },
                itemsToGive = new Dictionary<string, int> { { "potion", 1 } },
                loreFlagsToSet = new List<string> { "MentorMet" }
            };
            manager.RegisterNPC(npc, "town");
        }
    }
}

