using System;

namespace MIFF.Economy
{
    /// <summary>
    /// Tracks player currency in a pure C# environment.
    /// </summary>
    [Serializable]
    public class CurrencyManager
    {
        private int balance;

        public CurrencyManager(int startingBalance = 0)
        {
            balance = Math.Max(0, startingBalance);
        }

        public int GetBalance() => balance;

        public void AddCurrency(int amount)
        {
            if (amount <= 0) return;
            balance = checked(balance + amount);
        }

        public bool SpendCurrency(int amount)
        {
            if (amount <= 0) return true;
            if (balance < amount) return false;
            balance -= amount;
            return true;
        }
    }
}

