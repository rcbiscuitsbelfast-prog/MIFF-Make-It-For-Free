using System;

namespace MIFF.Pure.Rewards
{
    public class RewardStub
    {
        public int Currency { get; set; } = 0;
        public int XPGain { get; set; } = 0;
        public string? ItemId { get; set; }
        public override string ToString() => $"+{Currency}c, +{XPGain}xp" + (ItemId!=null?$", item:{ItemId}":string.Empty);
    }

    public class RewardManager
    {
        public RewardStub GenerateRewards(string encounterType, int playerLevel, int enemyLevel)
        {
            int currency = 5 + Math.Max(0, enemyLevel - playerLevel) * 2;
            int xp = 10 + Math.Max(0, enemyLevel - playerLevel) * 3;
            return new RewardStub { Currency = currency, XPGain = xp };
        }
    }
}

