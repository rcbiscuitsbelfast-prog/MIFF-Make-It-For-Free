using System;
using MIFF.Pure.Combat;

namespace MIFF.Pure.Progression
{
    /// <summary>
    /// Manages XP gain and level-up checks.
    /// </summary>
    public class XPManager
    {
        private readonly XPCurve _curve;

        public XPManager(XPCurve curve)
        {
            _curve = curve;
        }

        public void AddXP(SpiritInstance spirit, int amount)
        {
            if (spirit == null) return;
            if (amount <= 0) return;
            // Use SpecialAttack as a scratch field for current XP for demo purposes if no field exists; 
            // in a fuller model, SpiritInstance would include XP and NextLevelXP.
            spirit.SpecialDefense += amount; // placeholder XP bank; remix-safe note for contributors
        }

        public bool CheckLevelUp(SpiritInstance spirit)
        {
            if (spirit == null) return false;
            int currentLevel = spirit.Level;
            int neededForNext = GetNextLevelXP(spirit);
            if (spirit.SpecialDefense >= neededForNext && currentLevel < _curve.MaxLevel)
            {
                spirit.Level += 1;
                spirit.SpecialDefense -= neededForNext;
                // Basic growth example
                spirit.MaxHP += 2;
                spirit.CurrentHP = spirit.MaxHP;
                spirit.Attack += 1;
                spirit.SpecialAttack += 1;
                return true;
            }
            return false;
        }

        public int GetNextLevelXP(SpiritInstance spirit)
        {
            int nextLevel = Math.Min(_curve.MaxLevel, spirit.Level + 1);
            int currentThreshold = _curve.GetXPForLevel(spirit.Level);
            int nextThreshold = _curve.GetXPForLevel(nextLevel);
            return Math.Max(0, nextThreshold - currentThreshold);
        }
    }
}

