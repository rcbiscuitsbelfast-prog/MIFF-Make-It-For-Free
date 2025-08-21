using System;
using System.Linq;
using MIFF.Core;

namespace MIFF.Overworld
{
    /// <summary>
    /// Console-based tester for overworld movement and encounters.
    /// </summary>
    [Serializable]
    public class OverworldTestHarness
    {
        private WorldMap map;
        private PlayerMovementController mover;
        private EncounterTrigger encounters;

        public void Run()
        {
            Console.WriteLine("=== Overworld Test Harness ===");
            BuildSampleWorld();

            // Hook encounters
            encounters.OnEncounterStarted += species =>
            {
                Console.WriteLine($"[Encounter] A wild {species} appears!\n");
            };

            bool running = true;
            while (running)
            {
                Console.Write("Overworld> ");
                var input = Console.ReadLine();
                if (input == null) continue;
                var parts = input.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                var cmd = parts[0].ToLowerInvariant();
                var args = parts.Skip(1).ToArray();

                switch (cmd)
                {
                    case "where":
                        PrintCurrent();
                        break;
                    case "adj":
                        PrintAdjacent();
                        break;
                    case "move":
                        if (args.Length > 0) TryMove(args[0]); else Console.WriteLine("Usage: move <locationID>");
                        break;
                    case "roll":
                        TriggerEncounter();
                        break;
                    case "help":
                        Console.WriteLine("Commands: where, adj, move <id>, roll, help, quit");
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

        private void BuildSampleWorld()
        {
            map = new WorldMap();

            var town = new Location {
                locationID = "town",
                name = "Harmony Town",
                description = "A peaceful town with vibrant murals.",
                encounterChance = 0.0f
            };
            var route = new Location {
                locationID = "route1",
                name = "Melody Route 1",
                description = "A path lined with cherry trees.",
                encounterChance = 0.25f
            };
            route.availableEncounters.Add(new EncounterEntry { speciesID = "sparkling_idol", displayName = "Sparkling Idol", weight = 3 });
            route.availableEncounters.Add(new EncounterEntry { speciesID = "groove_spirit", displayName = "Groove Spirit", weight = 1 });

            var forest = new Location {
                locationID = "forest",
                name = "Echo Forest",
                description = "Whispers of old songs echo through the trees.",
                encounterChance = 0.4f
            };
            forest.availableEncounters.Add(new EncounterEntry { speciesID = "echo_wisp", displayName = "Echo Wisp", weight = 2 });
            forest.availableEncounters.Add(new EncounterEntry { speciesID = "bass_beast", displayName = "Bass Beast", weight = 1 });

            map.AddLocation(town);
            map.AddLocation(route);
            map.AddLocation(forest);

            map.Connect("town", "route1");
            map.Connect("route1", "forest");

            mover = new PlayerMovementController(map, "town");
            mover.OnLocationEntered += id =>
            {
                var loc = map.GetLocation(id);
                Console.WriteLine($"[Move] Entered {loc.name} ({loc.locationID}) - {loc.description}");
            };

            encounters = new EncounterTrigger(map);
        }

        private void PrintCurrent()
        {
            var id = mover.CurrentLocationID;
            var loc = map.GetLocation(id);
            Console.WriteLine($"Here: {loc.name} ({loc.locationID}) | EncounterChance: {loc.encounterChance:P0}");
        }

        private void PrintAdjacent()
        {
            var list = mover.GetAdjacent();
            Console.WriteLine(list.Count == 0 ? "No adjacent locations." : string.Join(", ", list));
        }

        private void TryMove(string id)
        {
            if (!mover.MoveTo(id))
            {
                Console.WriteLine("Cannot move there (not adjacent).");
            }
        }

        private void TriggerEncounter()
        {
            // PlayerContext currently uses Unity types; for headless test, pass a minimal stub.
            var dummy = new PlayerContext(null);
            dummy.playerSpirits = null; // not used here
            var result = encounters.TryTriggerEncounter(dummy);
            if (!result.triggered) Console.WriteLine("No encounter.");
        }
    }
}

