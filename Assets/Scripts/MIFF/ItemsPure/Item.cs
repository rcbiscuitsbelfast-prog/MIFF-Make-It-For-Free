using System;
using MIFF.Core;

namespace MIFF.ItemsPure
{
    public enum ItemType
    {
        Consumable,
        KeyItem,
        Equipment,
        EvolutionItem
    }

    /// <summary>
    /// Pure C# item definition with modular effect and target rules.
    /// </summary>
    [Serializable]
    public class Item
    {
        public string itemID;
        public string name;
        public ItemType type;
        public ItemEffect effect = new ItemEffect();
        public string targetRule = "Any"; // e.g., Any, NotFainted, FaintedOnly, InBattleOnly, OverworldOnly

        public UsageResult ApplyEffect(PlayerContext ctx, Spirits.SpiritInstance target)
        {
            // Simple target checks (extend as needed)
            if (targetRule == "FaintedOnly" && (target == null || !target.IsFainted()))
                return UsageResult.Fail(UsageStatus.InvalidTarget, "Target must be fainted.");
            if (targetRule == "NotFainted" && (target == null || target.IsFainted()))
                return UsageResult.Fail(UsageStatus.InvalidTarget, "Target must be conscious.");

            return effect != null ? effect.Apply(ctx, target) : UsageResult.Fail(UsageStatus.EffectBlocked, "No effect configured.");
        }
    }
}

