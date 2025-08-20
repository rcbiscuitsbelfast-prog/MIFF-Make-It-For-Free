using UnityEngine;
using System.Collections.Generic;

namespace MIFF.Spirits
{
    /// <summary>
    /// Represents an individual spirit instance with stats, sync, and evolution support
    /// </summary>
    [System.Serializable]
    public class SpiritInstance
    {
        [Header("Spirit Identity")]
        [SerializeField] private string instanceID;
        [SerializeField] private string speciesID;
        [SerializeField] private string nickname;
        [SerializeField] private bool isShiny;
        
        [Header("Stats")]
        [SerializeField] private int level = 1;
        [SerializeField] private int currentHP = 100;
        [SerializeField] private int maxHP = 100;
        [SerializeField] private int attack = 50;
        [SerializeField] private int defense = 30;
        [SerializeField] private int speed = 40;
        [SerializeField] private int specialAttack = 45;
        [SerializeField] private int specialDefense = 35;
        
        [Header("Sync & Evolution")]
        [SerializeField] private float currentSync = 0f;
        [SerializeField] private float maxSync = 100f;
        [SerializeField] private bool canEvolve = true;
        [SerializeField] private string currentEvolutionStage = "base";
        
        [Header("Experience")]
        [SerializeField] private int currentExp = 0;
        [SerializeField] private int expToNextLevel = 100;
        
        [Header("Moves")]
        [SerializeField] private List<string> knownMoves = new List<string>();
        [SerializeField] private List<string> equippedMoves = new List<string>();
        
        // Properties
        public string InstanceID => instanceID;
        public string SpeciesID => speciesID;
        public string Nickname => nickname;
        public bool IsShiny => isShiny;
        public int Level => level;
        public int CurrentHP => currentHP;
        public int MaxHP => maxHP;
        public int Attack => attack;
        public int Defense => defense;
        public int Speed => speed;
        public int SpecialAttack => specialAttack;
        public int SpecialDefense => specialDefense;
        public float CurrentSync => currentSync;
        public float MaxSync => maxSync;
        public bool CanEvolve => canEvolve;
        public string CurrentEvolutionStage => currentEvolutionStage;
        public int CurrentExp => currentExp;
        public int ExpToNextLevel => expToNextLevel;
        public List<string> KnownMoves => knownMoves;
        public List<string> EquippedMoves => equippedMoves;
        
        /// <summary>
        /// Constructor for creating a new spirit instance
        /// </summary>
        public SpiritInstance(string speciesID, string nickname = "")
        {
            this.instanceID = System.Guid.NewGuid().ToString();
            this.speciesID = speciesID;
            this.nickname = string.IsNullOrEmpty(nickname) ? speciesID : nickname;
            this.isShiny = Random.Range(0f, 1f) < 0.01f; // 1% chance for shiny
            
            // Initialize with base stats (would come from SpiritSpecies data)
            InitializeBaseStats();
        }
        
        /// <summary>
        /// Initialize base stats for the spirit
        /// </summary>
        private void InitializeBaseStats()
        {
            // These would normally come from SpiritSpecies data
            maxHP = 100;
            currentHP = maxHP;
            attack = 50;
            defense = 30;
            speed = 40;
            specialAttack = 45;
            specialDefense = 35;
            
            // Initialize sync
            currentSync = 0f;
            maxSync = 100f;
            
            // Initialize experience
            currentExp = 0;
            expToNextLevel = 100;
            
            // Initialize moves
            knownMoves = new List<string> { "basic_attack" };
            equippedMoves = new List<string> { "basic_attack" };
        }
        
        /// <summary>
        /// Evolve the spirit to a new species
        /// </summary>
        public void Evolve(string newSpeciesID)
        {
            if (string.IsNullOrEmpty(newSpeciesID)) return;
            
            string oldSpeciesID = speciesID;
            speciesID = newSpeciesID;
            
            Debug.Log($"{nickname} evolved from {oldSpeciesID} to {newSpeciesID}!");
            
            // You could add additional evolution logic here:
            // - Stat increases
            // - Learning new moves
            // - Type changes
            // - Ability unlocks
        }
        
        /// <summary>
        /// Set the evolution stage
        /// </summary>
        public void SetEvolutionStage(string stage)
        {
            if (!string.IsNullOrEmpty(stage))
            {
                currentEvolutionStage = stage;
            }
        }
        
        /// <summary>
        /// Gain experience points
        /// </summary>
        public void GainExperience(int expAmount)
        {
            currentExp += expAmount;
            
            // Check for level up
            while (currentExp >= expToNextLevel)
            {
                LevelUp();
            }
        }
        
        /// <summary>
        /// Level up the spirit
        /// </summary>
        private void LevelUp()
        {
            currentExp -= expToNextLevel;
            level++;
            
            // Increase stats
            maxHP += Random.Range(5, 15);
            attack += Random.Range(2, 8);
            defense += Random.Range(2, 8);
            speed += Random.Range(2, 8);
            specialAttack += Random.Range(2, 8);
            specialDefense += Random.Range(2, 8);
            
            // Restore HP on level up
            currentHP = maxHP;
            
            // Increase exp requirement for next level
            expToNextLevel = Mathf.RoundToInt(expToNextLevel * 1.2f);
            
            Debug.Log($"{nickname} reached level {level}!");
        }
        
        /// <summary>
        /// Gain sync points
        /// </summary>
        public void GainSync(float syncAmount)
        {
            if (!canEvolve) return;
            
            currentSync = Mathf.Min(currentSync + syncAmount, maxSync);
            
            Debug.Log($"{nickname} gained {syncAmount} sync points. Current: {currentSync}/{maxSync}");
        }
        
        /// <summary>
        /// Take damage
        /// </summary>
        public void TakeDamage(int damage)
        {
            currentHP = Mathf.Max(0, currentHP - damage);
            
            if (currentHP <= 0)
            {
                Debug.Log($"{nickname} fainted!");
            }
        }
        
        /// <summary>
        /// Heal the spirit
        /// </summary>
        public void Heal(int healAmount)
        {
            if (currentHP <= 0) return; // Can't heal fainted spirits
            
            currentHP = Mathf.Min(currentHP + healAmount, maxHP);
        }
        
        /// <summary>
        /// Revive the spirit
        /// </summary>
        public void Revive(float hpPercentage = 0.5f)
        {
            if (currentHP > 0) return; // Not fainted
            
            currentHP = Mathf.RoundToInt(maxHP * hpPercentage);
            Debug.Log($"{nickname} was revived with {hpPercentage * 100}% HP!");
        }
        
        /// <summary>
        /// Learn a new move
        /// </summary>
        public bool LearnMove(string moveID)
        {
            if (knownMoves.Contains(moveID))
            {
                Debug.Log($"{nickname} already knows {moveID}");
                return false;
            }
            
            knownMoves.Add(moveID);
            Debug.Log($"{nickname} learned {moveID}!");
            return true;
        }
        
        /// <summary>
        /// Equip a move
        /// </summary>
        public bool EquipMove(string moveID)
        {
            if (!knownMoves.Contains(moveID))
            {
                Debug.Log($"{nickname} doesn't know {moveID}");
                return false;
            }
            
            if (equippedMoves.Contains(moveID))
            {
                Debug.Log($"{nickname} already has {moveID} equipped");
                return false;
            }
            
            // Limit equipped moves (e.g., max 4)
            if (equippedMoves.Count >= 4)
            {
                Debug.Log($"{nickname} can't equip more moves");
                return false;
            }
            
            equippedMoves.Add(moveID);
            Debug.Log($"{nickname} equipped {moveID}!");
            return true;
        }
        
        /// <summary>
        /// Unequip a move
        /// </summary>
        public bool UnequipMove(string moveID)
        {
            if (!equippedMoves.Contains(moveID))
            {
                Debug.Log($"{nickname} doesn't have {moveID} equipped");
                return false;
            }
            
            equippedMoves.Remove(moveID);
            Debug.Log($"{nickname} unequipped {moveID}!");
            return true;
        }
        
        /// <summary>
        /// Check if the spirit is fainted
        /// </summary>
        public bool IsFainted()
        {
            return currentHP <= 0;
        }
        
        /// <summary>
        /// Check if the spirit can battle
        /// </summary>
        public bool CanBattle()
        {
            return !IsFainted() && equippedMoves.Count > 0;
        }
        
        /// <summary>
        /// Get sync percentage
        /// </summary>
        public float GetSyncPercentage()
        {
            return (currentSync / maxSync) * 100f;
        }
        
        /// <summary>
        /// Set nickname
        /// </summary>
        public void SetNickname(string newNickname)
        {
            if (!string.IsNullOrEmpty(newNickname))
            {
                nickname = newNickname;
                Debug.Log($"Spirit renamed to: {nickname}");
            }
        }
        
        /// <summary>
        /// Get a summary of the spirit
        /// </summary>
        public string GetSummary()
        {
            return $"{nickname} (Lv.{level}) - HP: {currentHP}/{maxHP}, Sync: {GetSyncPercentage():F1}%";
        }
    }
}