using System;
using System.Collections.Generic;

namespace MIFF.Economy
{
    /// <summary>
    /// Represents an item available in a store with pricing and availability.
    /// </summary>
    [Serializable]
    public class StoreItem
    {
        public string itemID;
        public string name;
        public int price;
        public string description;
        public int quantityAvailable = -1; // -1 means unlimited
        public List<string> tags = new List<string>();

        public StoreItem Clone()
        {
            return new StoreItem
            {
                itemID = itemID,
                name = name,
                price = price,
                description = description,
                quantityAvailable = quantityAvailable,
                tags = new List<string>(tags)
            };
        }
    }
}

