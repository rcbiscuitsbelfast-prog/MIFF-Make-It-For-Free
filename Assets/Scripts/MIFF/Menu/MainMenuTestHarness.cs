using System;
using System.Linq;
using MIFF.Core;

namespace MIFF.Menu
{
    /// <summary>
    /// Console-based tester for the main menu and navigation system.
    /// </summary>
    [Serializable]
    public class MainMenuTestHarness
    {
        private readonly SaveManager saveManager;
        private readonly SaveSlotSelector slotSelector;
        private readonly SceneNavigator navigator;
        private readonly MainMenuController controller;

        public MainMenuTestHarness()
        {
            saveManager = new SaveManager();
            slotSelector = new SaveSlotSelector(saveManager);
            navigator = new SceneNavigator();
            controller = new MainMenuController(saveManager, slotSelector, navigator);

            // Wire controller events to simple console output
            controller.OnNewGame += () =>
            {
                Console.WriteLine("[MainMenu] New Game selected -> Loading Overworld...");
                navigator.LoadScene("Overworld");
            };

            controller.OnContinueGame += slotID =>
            {
                Console.WriteLine($"[MainMenu] Continue selected (slot: {slotID}) -> Loading Overworld...");
                navigator.LoadScene("Overworld");
            };

            controller.OnOpenSettings += () => Console.WriteLine("[MainMenu] Settings opened");
            controller.OnExit += () => Console.WriteLine("[MainMenu] Exit confirmed");

            navigator.OnLoadScene += scene => Console.WriteLine($"[Navigator] LoadScene: {scene}");
            navigator.OnReturnToMenu += () => Console.WriteLine("[Navigator] ReturnToMenu");
        }

        public void Run()
        {
            Console.WriteLine("=== Main Menu Test Harness ===");
            Console.WriteLine("Commands: new, continue, settings, exit, slots, select <id>, next, prev, confirm, back, menu, scene <id>, return, help, quit");

            // Ensure some test data exists
            EnsureSampleSaves();

            bool running = true;
            while (running)
            {
                Console.Write("MainMenu> ");
                var input = Console.ReadLine();
                if (input == null) continue;
                var parts = input.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                var cmd = parts[0].ToLowerInvariant();
                var args = parts.Skip(1).ToArray();

                switch (cmd)
                {
                    case "new":
                        controller.NewGame();
                        break;
                    case "continue":
                        var slots = controller.Continue();
                        Console.WriteLine(slots.Count == 0 ? "(no slots)" : string.Join(", ", slots));
                        break;
                    case "settings":
                        controller.OpenSettings();
                        break;
                    case "exit":
                        controller.ConfirmExit();
                        controller.Exit();
                        break;
                    case "slots":
                        slotSelector.Refresh();
                        var list = slotSelector.GetSlots();
                        Console.WriteLine(list.Count == 0 ? "(no slots)" : string.Join(", ", list));
                        Console.WriteLine($"Current: {slotSelector.GetCurrentSelection() ?? "<none>"}");
                        break;
                    case "select":
                        if (args.Length > 0) controller.SelectSaveSlot(args[0]);
                        else Console.WriteLine("Usage: select <slotID>");
                        break;
                    case "next":
                        slotSelector.Next();
                        Console.WriteLine($"Current: {slotSelector.GetCurrentSelection() ?? "<none>"}");
                        break;
                    case "prev":
                        slotSelector.Previous();
                        Console.WriteLine($"Current: {slotSelector.GetCurrentSelection() ?? "<none>"}");
                        break;
                    case "confirm":
                        slotSelector.ConfirmCurrent();
                        break;
                    case "menu":
                        controller.GoToMain();
                        Console.WriteLine("State: Main");
                        break;
                    case "scene":
                        if (args.Length > 0) navigator.LoadScene(args[0]);
                        else Console.WriteLine("Usage: scene <sceneID>");
                        break;
                    case "return":
                        navigator.ReturnToMenu();
                        break;
                    case "help":
                        Console.WriteLine("Commands: new, continue, settings, exit, slots, select <id>, next, prev, confirm, back, menu, scene <id>, return, help, quit");
                        break;
                    case "quit":
                        running = false;
                        break;
                    default:
                        Console.WriteLine("Unknown command. Type 'help'.");
                        break;
                }
            }

            Console.WriteLine("Bye.");
        }

        private void EnsureSampleSaves()
        {
            // If there are no slots, create a few sample ones using the SaveManager API.
            if (saveManager.ListSaveSlots().Count == 0)
            {
                var data = new GameData();
                data.InitializeNewGame();
                data.playerLevel = 3;
                saveManager.SaveGame("slot1", data, "PlayerOne");
                data.playerLevel = 7;
                saveManager.SaveGame("slot2", data, "PlayerTwo");
            }
        }
    }
}

