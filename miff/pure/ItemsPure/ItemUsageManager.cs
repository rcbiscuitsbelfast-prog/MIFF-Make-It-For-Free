using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.ItemsPure
{
    /// <summary>
    /// Orchestrates item usage. Uses a simple registry keyed by itemID.
    /// </summary>
    [Serializable]
    public class ItemUsageManager
    {
        private readonly Dictionary<string, Item> itemRegistry = new Dictionary<string, Item>();
        private readonly PlayerContext context;

        public ItemUsageManager(PlayerContext ctx)
        {
            context = ctx;
        }

        public void RegisterItem(Item item)
        {
            if (item == null || string.IsNullOrEmpty(item.itemID)) return;
            itemRegistry[item.itemID] = item;
        }

        public bool CanUseItem(string itemID, Spirits.SpiritInstance target)
        {
            if (!itemRegistry.TryGetValue(itemID, out var item)) return false;
            var result = item.ApplyEffect(context, target);
            return result.status == UsageStatus.Success || result.status == UsageStatus.InvalidTarget ? true : true; // allow attempt; manager enforces rules below
        }

        public UsageResult UseItem(string itemID, Spirits.SpiritInstance target)
        {
            if (!itemRegistry.TryGetValue(itemID, out var item))
                return UsageResult.Fail(UsageStatus.EffectBlocked, "Unknown item.");

            // Optional: check cooldowns/usage limits via context or external systems
            var result = item.ApplyEffect(context, target);
            return result;
        }
    }
}

