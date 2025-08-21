using System;
using MIFF.Core;
using MIFF.ItemsPure;

namespace MIFF.ItemsPure
{
    /// <summary>
    /// Console tester for item usage in battle/overworld contexts.
    /// </summary>
    [Serializable]
    public class ItemUsageTestHarness
    {
        // Minimal headless PlayerContext stub to satisfy APIs
        private class HeadlessPlayerContext : PlayerContext
        {
            public object GameData { get; set; }
            public HeadlessPlayerContext() : base(null) { }
        }

        public void Run()
        {
            Console.WriteLine("=== Item Usage Test Harness ===");

            var ctx = new HeadlessPlayerContext();
            var manager = new ItemUsageManager(ctx);

            // Create a sample spirit (Unity-dependent class, but usable in console)
            var spirit = new Spirits.SpiritInstance("sparkling_idol");
            Console.WriteLine($"Target: {spirit.GetSummary()}");

            // Register items
            var potion = new Item
            {
                itemID = "potion",
                name = "Potion",
                type = ItemType.Consumable,
                targetRule = "NotFainted",
                effect = new ItemEffect { effectType = ItemEffectType.Heal, amount = 30 }
            };
            manager.RegisterItem(potion);

            var revive = new Item
            {
                itemID = "revive",
                name = "Revive",
                type = ItemType.Consumable,
                targetRule = "FaintedOnly",
                effect = new ItemEffect { effectType = ItemEffectType.Revive, amount = 50 }
            };
            manager.RegisterItem(revive);

            var evolve = new Item
            {
                itemID = "moon_amulet",
                name = "Moonlight Amulet",
                type = ItemType.EvolutionItem,
                targetRule = "NotFainted",
                effect = new ItemEffect { effectType = ItemEffectType.Evolve, param = "sparkling_idol_stage2" }
            };
            manager.RegisterItem(evolve);

            // Simulate damage
            spirit.TakeDamage(60);
            Console.WriteLine($"After damage: {spirit.GetSummary()}");

            // Use potion
            var r1 = manager.UseItem("potion", spirit);
            Console.WriteLine($"Use potion -> {r1}");
            Console.WriteLine(spirit.GetSummary());

            // Faint and use revive
            spirit.TakeDamage(999);
            Console.WriteLine($"After faint: {spirit.GetSummary()}");
            var r2 = manager.UseItem("revive", spirit);
            Console.WriteLine($"Use revive -> {r2}");
            Console.WriteLine(spirit.GetSummary());

            // Evolve
            var r3 = manager.UseItem("moon_amulet", spirit);
            Console.WriteLine($"Use amulet -> {r3}");
        }
    }
}

