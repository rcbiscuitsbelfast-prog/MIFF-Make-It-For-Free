using System;
using System.Collections.Generic;

namespace MIFF.Pure.HUD
{
    public class SpiritHUDState
    {
        public string SpiritId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int CurrentHP { get; set; }
        public int MaxHP { get; set; }
        public List<string> StatusEffects { get; set; } = new List<string>();
        public bool IsKO => CurrentHP <= 0;
    }

    public class TurnHUDState
    {
        public string PhaseName { get; set; } = string.Empty;
        public string? ActiveSpiritId { get; set; }
        public string? ActionPreview { get; set; }
    }

    /// <summary>
    /// Engine-agnostic HUD model for adapters to render.
    /// </summary>
    public class BattleHUDModel
    {
        public List<SpiritHUDState> Player { get; set; } = new List<SpiritHUDState>();
        public List<SpiritHUDState> Opponent { get; set; } = new List<SpiritHUDState>();
        public TurnHUDState Turn { get; set; } = new TurnHUDState();
    }
}

