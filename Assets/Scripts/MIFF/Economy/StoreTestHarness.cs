using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Core;

namespace MIFF.Economy
{
    /// <summary>
    /// Console-based tester for the store and economy system.
    /// </summary>
    [Serializable]
    public class StoreTestHarness
    {
        private readonly StoreManager store = new StoreManager();
        private readonly CurrencyManager currency = new CurrencyManager(500);

        // Minimal headless PlayerContext stub using reflection adapters
        private class HeadlessPlayerContext : PlayerContext
        {
            public CurrencyManager CurrencyManager { get; }
            public Dictionary<string, int> InventoryCounts { get; } = new Dictionary<string, int>();
            public HeadlessPlayerContext(CurrencyManager cm) : base(null)
            {
                CurrencyManager = cm;
            }
        }

        public void Run()
        {
            Console.WriteLine("=== Store Test Harness ===");
            SeedStore();

            var ctx = new HeadlessPlayerContext(currency);

            bool running = true;
            while (running)
            {
                Console.Write("Store> ");
                var input = Console.ReadLine();
                if (input == null) continue;
                var parts = input.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                var cmd = parts[0].ToLowerInvariant();
                var args = parts.Skip(1).ToArray();

                switch (cmd)
                {
                    case "list":
                        ListItems();
                        break;
                    case "buy":
                        if (args.Length > 0) Console.WriteLine(store.BuyItem(args[0], ctx));
                        else Console.WriteLine("Usage: buy <itemID>");
                        break;
                    case "sell":
                        if (args.Length > 0) Console.WriteLine(store.SellItem(args[0], ctx));
                        else Console.WriteLine("Usage: sell <itemID>");
                        break;
                    case "bal":
                        Console.WriteLine($"Balance: {currency.GetBalance()}");
                        break;
                    case "inv":
                        Console.WriteLine(ctx.InventoryCounts.Count == 0 ? "(empty)" : string.Join(", ", ctx.InventoryCounts.Select(kv => $"{kv.Key}x{kv.Value}")));
                        break;
                    case "help":
                        Console.WriteLine("Commands: list, buy <id>, sell <id>, bal, inv, help, quit");
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

        private void SeedStore()
        {
            var items = new List<StoreItem>
            {
                new StoreItem { itemID = "potion", name = "Potion", price = 100, description = "Restores HP", quantityAvailable = -1, tags = { "consumable" } },
                new StoreItem { itemID = "revive", name = "Revive", price = 300, description = "Revives a fainted spirit", quantityAvailable = 5, tags = { "consumable", "rare" } },
                new StoreItem { itemID = "amulet", name = "Moonlight Amulet", price = 800, description = "A mysterious charm.", quantityAvailable = 1, tags = { "gear", "rare" } }
            };
            store.SetStoreInventory("default", items);
        }

        private void ListItems()
        {
            var list = store.GetAvailableItems("default");
            if (list.Count == 0)
            {
                Console.WriteLine("(no items)");
                return;
            }
            foreach (var it in list)
            {
                string stock = it.quantityAvailable < 0 ? "∞" : it.quantityAvailable.ToString();
                Console.WriteLine($"- {it.itemID} | {it.name} | {it.price} | stock: {stock} | {string.Join("/", it.tags)}");
            }
        }
    }
}

