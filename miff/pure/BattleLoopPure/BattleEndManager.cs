using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Pure.Log;

namespace MIFF.Pure.BattleLoop
{
    public enum BattleOutcome { Ongoing, PlayerWin, PlayerLose, Escaped }

    public class BattleResult
    {
        public BattleOutcome Outcome { get; set; } = BattleOutcome.Ongoing;
        public string Summary => Outcome.ToString();
        public string? RewardSummary { get; set; }
    }

    public class EscapeLogic
    {
        public bool TryEscape(int playerSpeed, int enemySpeed, Func<int,int,int> nextInt)
        {
            // Simple chance: if player faster -> high chance, else low
            int chance = playerSpeed > enemySpeed ? 75 : 30; // percent
            int roll = nextInt(0, 100);
            return roll < chance;
        }
    }

    public class BattleEndManager
    {
        public BattleOutcome CheckOutcome(IEnumerable<int> playerHPs, IEnumerable<int> enemyHPs)
        {
            bool allPlayerKO = playerHPs != null && playerHPs.All(hp => hp <= 0);
            bool allEnemyKO = enemyHPs != null && enemyHPs.All(hp => hp <= 0);
            if (allEnemyKO) return BattleOutcome.PlayerWin;
            if (allPlayerKO) return BattleOutcome.PlayerLose;
            return BattleOutcome.Ongoing;
        }
    }
}

