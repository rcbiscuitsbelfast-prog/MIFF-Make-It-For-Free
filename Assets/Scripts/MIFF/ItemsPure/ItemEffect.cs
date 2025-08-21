using System;
using MIFF.Core;
using MIFF.ItemsPure;

namespace MIFF.ItemsPure
{
    public enum ItemEffectType
    {
        None,
        Heal,
        Revive,
        BuffAttack,
        BuffDefense,
        SyncBoost,
        Evolve,
        UnlockFlag
    }

    /// <summary>
    /// Describes effect parameters and applies logic to a target.
    /// Pure C#; callers can extend via inheritance or switch on ItemEffectType.
    /// </summary>
    [Serializable]
    public class ItemEffect
    {
        public ItemEffectType effectType = ItemEffectType.None;
        public int amount = 0;           // heal, revive %, buff amount, etc.
        public string param = null;      // evolution speciesID, unlock flag key, etc.
        public int cooldownSeconds = 0;  // optional
        public int maxUses = -1;         // optional (-1 unlimited)

        public UsageResult Apply(PlayerContext ctx, Spirits.SpiritInstance target)
        {
            if (target == null)
                return UsageResult.Fail(UsageStatus.InvalidTarget, "No target.");

            switch (effectType)
            {
                case ItemEffectType.Heal:
                    return ApplyHeal(target);
                case ItemEffectType.Revive:
                    return ApplyRevive(target);
                case ItemEffectType.BuffAttack:
                    return UsageResult.Ok("Attack buff applied (placeholder).");
                case ItemEffectType.BuffDefense:
                    return UsageResult.Ok("Defense buff applied (placeholder).");
                case ItemEffectType.SyncBoost:
                    return ApplySync(target);
                case ItemEffectType.Evolve:
                    return ApplyEvolve(target);
                case ItemEffectType.UnlockFlag:
                    return ApplyUnlock(ctx);
                default:
                    return UsageResult.Fail(UsageStatus.EffectBlocked, "Unsupported effect.");
            }
        }

        private UsageResult ApplyHeal(Spirits.SpiritInstance target)
        {
            // Note: SpiritInstance has Heal(int) but is Unity-dependent; still callable in pure C#.
            int before = target.CurrentHP;
            target.Heal(Math.Max(0, amount));
            int after = target.CurrentHP;
            return after > before ? UsageResult.Ok($"Healed {after - before} HP.") : UsageResult.Fail(UsageStatus.AlreadyUsed, "No effect.");
        }

        private UsageResult ApplyRevive(Spirits.SpiritInstance target)
        {
            if (!target.IsFainted())
                return UsageResult.Fail(UsageStatus.InvalidTarget, "Target is not fainted.");
            float pct = Math.Clamp(amount, 1, 100) / 100f;
            target.Revive(pct);
            return UsageResult.Ok($"Revived to {amount}% HP.");
        }

        private UsageResult ApplySync(Spirits.SpiritInstance target)
        {
            // SpiritInstance GainSync(float) depends on Unity Mathf; but signatures are callable in .NET.
            target.GainSync(Math.Max(0, amount));
            return UsageResult.Ok("Sync increased.");
        }

        private UsageResult ApplyEvolve(Spirits.SpiritInstance target)
        {
            if (string.IsNullOrEmpty(param))
                return UsageResult.Fail(UsageStatus.InvalidTarget, "Missing evolution target.");
            if (!target.CanEvolve)
                return UsageResult.Fail(UsageStatus.EffectBlocked, "Cannot evolve.");
            target.Evolve(param);
            return UsageResult.Ok($"Evolved to {param}.");
        }

        private UsageResult ApplyUnlock(PlayerContext ctx)
        {
            if (ctx == null || string.IsNullOrEmpty(param))
                return UsageResult.Fail(UsageStatus.InvalidTarget, "Missing context or flag key.");
            // Use GameData onboarding flags if available via reflection
            var gameData = ctx.GetType().GetProperty("GameData")?.GetValue(ctx);
            var flagsProp = gameData?.GetType().GetField("onboardingFlags");
            if (flagsProp == null) return UsageResult.Ok("Unlocked (no flags present).");
            var dict = flagsProp.GetValue(gameData) as System.Collections.IDictionary;
            dict?[param] = true;
            return UsageResult.Ok($"Unlocked flag {param}.");
        }
    }
}

