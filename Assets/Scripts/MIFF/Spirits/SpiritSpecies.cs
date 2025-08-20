using UnityEngine;
using System.Collections.Generic;

namespace MIFF.Spirits
{
    /// <summary>
    /// ScriptableObject defining the base data for a spirit species
    /// </summary>
    [CreateAssetMenu(fileName = "New Spirit Species", menuName = "MIFF/Spirits/SpiritSpecies")]
    public class SpiritSpecies : ScriptableObject
    {
        [Header("Species Identity")]
        [SerializeField] private string speciesID;
        [SerializeField] private string speciesName;
        [TextArea(3, 5)]
        [SerializeField] private string description;
        [SerializeField] private string category = "Normal";
        
        [Header("Visual")]
        [SerializeField] private Sprite frontSprite;
        [SerializeField] private Sprite backSprite;
        [SerializeField] private Sprite iconSprite;
        [SerializeField] private Color speciesColor = Color.white;
        
        [Header("Base Stats")]
        [SerializeField] private int baseHP = 100;
        [SerializeField] private int baseAttack = 50;
        [SerializeField] private int baseDefense = 30;
        [SerializeField] private int baseSpeed = 40;
        [SerializeField] private int baseSpecialAttack = 45;
        [SerializeField] private int baseSpecialDefense = 35;
        
        [Header("Growth")]
        [SerializeField] private int baseExpYield = 50;
        [SerializeField] private float syncGrowthRate = 1.0f;
        [SerializeField] private bool canEvolve = true;
        [SerializeField] private string evolutionStage = "base";
        
        [Header("Moves")]
        [SerializeField] private List<LearnableMove> learnableMoves = new List<LearnableMove>();
        [SerializeField] private List<string> startingMoves = new List<string>();
        
        [Header("Type & Weaknesses")]
        [SerializeField] private List<SpiritType> types = new List<SpiritType>();
        [SerializeField] private List<SpiritType> weaknesses = new List<SpiritType>();
        [SerializeField] private List<SpiritType> resistances = new List<SpiritType>();
        
        // Properties
        public string SpeciesID => speciesID;
        public string SpeciesName => speciesName;
        public string Description => description;
        public string Category => category;
        public Sprite FrontSprite => frontSprite;
        public Sprite BackSprite => backSprite;
        public Sprite IconSprite => iconSprite;
        public Color SpeciesColor => speciesColor;
        public int BaseHP => baseHP;
        public int BaseAttack => baseAttack;
        public int BaseDefense => baseDefense;
        public int BaseSpeed => baseSpeed;
        public int BaseSpecialAttack => baseSpecialAttack;
        public int BaseSpecialDefense => baseSpecialDefense;
        public int BaseExpYield => baseExpYield;
        public float SyncGrowthRate => syncGrowthRate;
        public bool CanEvolve => canEvolve;
        public string EvolutionStage => evolutionStage;
        public List<LearnableMove> LearnableMoves => learnableMoves;
        public List<string> StartingMoves => startingMoves;
        public List<SpiritType> Types => types;
        public List<SpiritType> Weaknesses => weaknesses;
        public List<SpiritType> Resistances => resistances;
        
        private void OnValidate()
        {
            // Ensure speciesID is unique and not empty
            if (string.IsNullOrEmpty(speciesID))
            {
                speciesID = name.ToLower().Replace(" ", "_");
            }
            
            // Ensure speciesName is not empty
            if (string.IsNullOrEmpty(speciesName))
            {
                speciesName = name;
            }
            
            // Ensure at least one type
            if (types.Count == 0)
            {
                types.Add(SpiritType.Normal);
            }
        }
        
        /// <summary>
        /// Get stat at a specific level
        /// </summary>
        public int GetStatAtLevel(StatType statType, int level)
        {
            int baseStat = GetBaseStat(statType);
            return Mathf.RoundToInt(baseStat + (baseStat * 0.1f * (level - 1)));
        }
        
        /// <summary>
        /// Get base stat value
        /// </summary>
        private int GetBaseStat(StatType statType)
        {
            switch (statType)
            {
                case StatType.HP: return baseHP;
                case StatType.Attack: return baseAttack;
                case StatType.Defense: return baseDefense;
                case StatType.Speed: return baseSpeed;
                case StatType.SpecialAttack: return baseSpecialAttack;
                case StatType.SpecialDefense: return baseSpecialDefense;
                default: return 0;
            }
        }
        
        /// <summary>
        /// Check if this species is weak to a specific type
        /// </summary>
        public bool IsWeakTo(SpiritType type)
        {
            return weaknesses.Contains(type);
        }
        
        /// <summary>
        /// Check if this species resists a specific type
        /// </summary>
        public bool Resists(SpiritType type)
        {
            return resistances.Contains(type);
        }
        
        /// <summary>
        /// Get type effectiveness multiplier
        /// </summary>
        public float GetTypeEffectiveness(SpiritType attackType)
        {
            if (IsWeakTo(attackType)) return 2.0f;
            if (Resists(attackType)) return 0.5f;
            return 1.0f;
        }
        
        /// <summary>
        /// Get moves that can be learned at a specific level
        /// </summary>
        public List<string> GetMovesAtLevel(int level)
        {
            var moves = new List<string>();
            
            foreach (var learnableMove in learnableMoves)
            {
                if (learnableMove.learnLevel <= level)
                {
                    moves.Add(learnableMove.moveID);
                }
            }
            
            return moves;
        }
        
        /// <summary>
        /// Check if this species can learn a specific move
        /// </summary>
        public bool CanLearnMove(string moveID)
        {
            foreach (var learnableMove in learnableMoves)
            {
                if (learnableMove.moveID == moveID)
                {
                    return true;
                }
            }
            return false;
        }
        
        /// <summary>
        /// Get a summary of the species
        /// </summary>
        public string GetSummary()
        {
            return $"{speciesName} ({category}) - HP: {baseHP}, ATK: {baseAttack}, DEF: {baseDefense}, SPD: {baseSpeed}";
        }
    }
    
    /// <summary>
    /// Types of stats
    /// </summary>
    public enum StatType
    {
        HP,
        Attack,
        Defense,
        Speed,
        SpecialAttack,
        SpecialDefense
    }
    
    /// <summary>
    /// Spirit types for type effectiveness
    /// </summary>
    public enum SpiritType
    {
        Normal,
        Fire,
        Water,
        Electric,
        Grass,
        Ice,
        Fighting,
        Poison,
        Ground,
        Flying,
        Psychic,
        Bug,
        Rock,
        Ghost,
        Dragon,
        Dark,
        Steel,
        Fairy
    }
    
    /// <summary>
    /// Move that can be learned by a spirit
    /// </summary>
    [System.Serializable]
    public class LearnableMove
    {
        public string moveID;
        public int learnLevel;
        [TextArea(2, 3)]
        public string description;
    }
}