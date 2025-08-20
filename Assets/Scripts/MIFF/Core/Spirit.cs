using UnityEngine;

namespace MIFF.Core
{
    /// <summary>
    /// Basic spirit class for item effects and battle integration
    /// </summary>
    public class Spirit : MonoBehaviour
    {
        [Header("Spirit Stats")]
        [SerializeField] private string spiritName;
        [SerializeField] private int maxHP = 100;
        [SerializeField] private int currentHP = 100;
        [SerializeField] private int attack = 50;
        [SerializeField] private int defense = 30;
        [SerializeField] private int speed = 40;
        
        [Header("Status")]
        [SerializeField] private bool isFainted = false;
        [SerializeField] private bool isRevived = false;
        
        // Properties
        public string SpiritName => spiritName;
        public int MaxHP => maxHP;
        public int CurrentHP => currentHP;
        public int Attack => attack;
        public int Defense => defense;
        public int Speed => speed;
        public bool IsFainted => isFainted;
        public bool IsRevived => isRevived;
        
        /// <summary>
        /// Heal the spirit by the specified amount
        /// </summary>
        public void Heal(int amount)
        {
            if (isFainted) return;
            
            currentHP = Mathf.Min(currentHP + amount, maxHP);
            UpdateStatus();
        }
        
        /// <summary>
        /// Revive the spirit with specified HP percentage
        /// </summary>
        public void Revive(float hpPercentage = 0.5f)
        {
            if (!isFainted) return;
            
            isFainted = false;
            isRevived = true;
            currentHP = Mathf.RoundToInt(maxHP * hpPercentage);
            UpdateStatus();
        }
        
        /// <summary>
        /// Take damage and update status
        /// </summary>
        public void TakeDamage(int damage)
        {
            currentHP = Mathf.Max(0, currentHP - damage);
            UpdateStatus();
        }
        
        /// <summary>
        /// Update the spirit's status based on current HP
        /// </summary>
        private void UpdateStatus()
        {
            if (currentHP <= 0)
            {
                isFainted = true;
                currentHP = 0;
            }
        }
        
        /// <summary>
        /// Apply a stat buff
        /// </summary>
        public void BuffStat(string statName, float multiplier, float duration)
        {
            // This would be implemented with a buff system
            Debug.Log($"Buffing {statName} by {multiplier}x for {duration} seconds");
        }
    }
}