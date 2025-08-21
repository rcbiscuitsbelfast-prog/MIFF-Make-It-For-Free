using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Core;

namespace MIFF.Economy
{
    /// <summary>
    /// Pure C# store manager handling inventories and transactions.
    /// Integrates with a currency manager and a simple inventory map in PlayerContext via extension.
    /// </summary>
    [Serializable]
    public class StoreManager
    {
        private readonly Dictionary<string, List<StoreItem>> storeCatalog = new Dictionary<string, List<StoreItem>>();

        // Events for extension by contributors
        public event Action<string, StoreItem, int> OnItemPurchased; // storeID, item, price
        public event Action<string, StoreItem, int> OnItemSold;      // storeID, item, price

        /// <summary>
        /// Register or replace inventory for a store.
        /// </summary>
        public void SetStoreInventory(string storeID, IEnumerable<StoreItem> items)
        {
            if (string.IsNullOrEmpty(storeID)) return;
            storeCatalog[storeID] = items?.Select(i => i?.Clone()).Where(i => i != null).ToList() ?? new List<StoreItem>();
        }

        public List<StoreItem> GetAvailableItems(string storeID)
        {
            if (string.IsNullOrEmpty(storeID)) return new List<StoreItem>();
            if (!storeCatalog.TryGetValue(storeID, out var list)) return new List<StoreItem>();
            // Return clones to prevent external mutation
            return list.Select(i => i.Clone()).ToList();
        }

        public TransactionResult BuyItem(string itemID, PlayerContext ctx, string storeID = "default")
        {
            if (!storeCatalog.TryGetValue(storeID, out var list))
                return TransactionResult.Fail(TransactionStatus.ItemUnavailable, "Store not found.");

            var entry = list.FirstOrDefault(i => i.itemID == itemID);
            if (entry == null)
                return TransactionResult.Fail(TransactionStatus.ItemUnavailable, "Item not in store.");

            // Resolve currency manager and inventory from PlayerContext (headless-friendly via adapters)
            var currency = PlayerAdapters.GetCurrencyManager(ctx);
            var inventory = PlayerAdapters.GetInventory(ctx);
            if (currency == null || inventory == null)
                return TransactionResult.Fail(TransactionStatus.ItemUnavailable, "Missing currency or inventory adapter.");

            if (!currency.SpendCurrency(entry.price))
                return TransactionResult.Fail(TransactionStatus.InsufficientFunds, "Not enough currency.");

            // Optional stock
            if (entry.quantityAvailable == 0)
                return TransactionResult.Fail(TransactionStatus.ItemUnavailable, "Item out of stock.");

            if (entry.quantityAvailable > 0)
                entry.quantityAvailable--;

            // Add to inventory
            inventory.AddOrIncrement(entry.itemID, 1);
            OnItemPurchased?.Invoke(storeID, entry.Clone(), entry.price);
            return TransactionResult.Ok($"Bought {entry.name} for {entry.price}");
        }

        public TransactionResult SellItem(string itemID, PlayerContext ctx, string storeID = "default")
        {
            if (!storeCatalog.TryGetValue(storeID, out var list))
                return TransactionResult.Fail(TransactionStatus.ItemUnavailable, "Store not found.");

            var entry = list.FirstOrDefault(i => i.itemID == itemID);
            if (entry == null)
                return TransactionResult.Fail(TransactionStatus.ItemUnavailable, "Store does not buy this item.");

            var currency = PlayerAdapters.GetCurrencyManager(ctx);
            var inventory = PlayerAdapters.GetInventory(ctx);
            if (currency == null || inventory == null)
                return TransactionResult.Fail(TransactionStatus.ItemUnavailable, "Missing currency or inventory adapter.");

            if (!inventory.DecrementOrRemove(itemID, 1))
                return TransactionResult.Fail(TransactionStatus.ItemUnavailable, "You don't have this item.");

            // Simple rule: sell price is half of buy price
            int sellPrice = Math.Max(0, entry.price / 2);
            currency.AddCurrency(sellPrice);
            if (entry.quantityAvailable >= 0) entry.quantityAvailable++;
            OnItemSold?.Invoke(storeID, entry.Clone(), sellPrice);
            return TransactionResult.Ok($"Sold {entry.name} for {sellPrice}");
        }
    }

    /// <summary>
    /// Adapters to bridge PlayerContext into pure C# currency and inventory abstractions.
    /// Replace these with integrations to your real systems.
    /// </summary>
    public static class PlayerAdapters
    {
        // Minimal inventory abstraction for headless testing
        public interface IInventory
        {
            void AddOrIncrement(string itemID, int amount);
            bool DecrementOrRemove(string itemID, int amount);
            int GetCount(string itemID);
        }

        public class DictionaryInventory : IInventory
        {
            private readonly Dictionary<string, int> counts;
            public DictionaryInventory(Dictionary<string, int> counts)
            {
                this.counts = counts ?? new Dictionary<string, int>();
            }
            public void AddOrIncrement(string itemID, int amount)
            {
                if (amount <= 0) return;
                counts[itemID] = (counts.TryGetValue(itemID, out var c) ? c : 0) + amount;
            }
            public bool DecrementOrRemove(string itemID, int amount)
            {
                if (!counts.TryGetValue(itemID, out var c) || c < amount) return false;
                c -= amount;
                if (c <= 0) counts.Remove(itemID); else counts[itemID] = c;
                return true;
            }
            public int GetCount(string itemID) => counts.TryGetValue(itemID, out var c) ? c : 0;
        }

        public static CurrencyManager GetCurrencyManager(PlayerContext ctx)
        {
            // Demo adapter: expect a CurrencyManager instance to be stored in custom fields or replace with your own binding.
            return ctx != null ? ctx.GetType().GetProperty("CurrencyManager")?.GetValue(ctx) as CurrencyManager : null;
        }

        public static IInventory GetInventory(PlayerContext ctx)
        {
            // Demo adapter: look for a Dictionary<string,int> named "InventoryCounts" on ctx; else null.
            var dict = ctx != null ? ctx.GetType().GetProperty("InventoryCounts")?.GetValue(ctx) as Dictionary<string, int> : null;
            return dict != null ? new DictionaryInventory(dict) : null;
        }
    }
}

