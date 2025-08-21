using System;
using System.Collections.Generic;
using MIFF.Pure.Combat;

namespace MIFF.Pure.Progression
{
    public enum EvolutionType
    {
        Level,
        Item,
        QuestFlag
    }

    public class EvolutionCondition
    {
        public EvolutionType Type { get; set; }
        public int RequiredLevel { get; set; } = 0;
        public string? ItemId { get; set; }
        public string? FlagId { get; set; }
        public string ResultSpiritId { get; set; } = string.Empty;
    }

    public class EvolutionManager
    {
        private readonly Dictionary<string, EvolutionCondition> _bySpirit = new Dictionary<string, EvolutionCondition>();
        private readonly HashSet<string> _flags = new HashSet<string>();
        private readonly HashSet<string> _items = new HashSet<string>();

        public void RegisterEvolution(string baseSpiritId, EvolutionCondition condition)
        {
            _bySpirit[baseSpiritId] = condition;
        }

        public void AddFlag(string flagId) { if (!string.IsNullOrWhiteSpace(flagId)) _flags.Add(flagId); }
        public void AddItem(string itemId) { if (!string.IsNullOrWhiteSpace(itemId)) _items.Add(itemId); }

        public bool CheckEvolution(SpiritInstance spirit)
        {
            if (spirit == null || string.IsNullOrWhiteSpace(spirit.SpiritId)) return false;
            if (!_bySpirit.TryGetValue(spirit.SpiritId, out var cond)) return false;
            switch (cond.Type)
            {
                case EvolutionType.Level: return spirit.Level >= cond.RequiredLevel;
                case EvolutionType.Item: return cond.ItemId != null && _items.Contains(cond.ItemId);
                case EvolutionType.QuestFlag: return cond.FlagId != null && _flags.Contains(cond.FlagId);
                default: return false;
            }
        }

        public SpiritInstance EvolveSpirit(SpiritInstance spirit)
        {
            if (!CheckEvolution(spirit)) return spirit;
            var cond = _bySpirit[spirit.SpiritId!];
            return new SpiritInstance
            {
                Id = spirit.Id,
                SpiritId = cond.ResultSpiritId,
                Name = cond.ResultSpiritId,
                Level = spirit.Level,
                TypeTag = spirit.TypeTag,
                MaxHP = spirit.MaxHP + 5,
                CurrentHP = spirit.MaxHP + 5,
                Attack = spirit.Attack + 2,
                Defense = spirit.Defense + 2,
                SpecialAttack = spirit.SpecialAttack + 2,
                SpecialDefense = spirit.SpecialDefense + 2
            };
        }
    }
}

