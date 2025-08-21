using System;
using System.Collections.Generic;

namespace MIFF.Pure.HUD
{
    /// <summary>
    /// Console tester for HUD model and printer.
    /// </summary>
    public static class HUDTestHarness
    {
        public static void Main(string[] args)
        {
            var hud = new BattleHUDModel
            {
                Player = new List<SpiritHUDState>
                {
                    new SpiritHUDState{ SpiritId="waterling", Name="Waterling", CurrentHP=52, MaxHP=60 },
                    new SpiritHUDState{ SpiritId="sprout", Name="Sprout", CurrentHP=0, MaxHP=30, StatusEffects = new List<string>{"poison"} }
                },
                Opponent = new List<SpiritHUDState>
                {
                    new SpiritHUDState{ SpiritId="ember", Name="Ember", CurrentHP=28, MaxHP=45 }
                },
                Turn = new TurnHUDState{ PhaseName="SelectAction", ActiveSpiritId="waterling", ActionPreview="water_burst -> ember" }
            };

            Console.WriteLine("--- Before Resolve ---");
            BattleStatePrinter.PrintHUD(hud);

            // Simulate damage resolution
            hud.Turn.PhaseName = "ResolveAction";
            hud.Opponent[0].CurrentHP -= 14;
            if (hud.Opponent[0].CurrentHP < 0) hud.Opponent[0].CurrentHP = 0;

            Console.WriteLine("\n--- After Resolve ---");
            BattleStatePrinter.PrintHUD(hud);
        }
    }
}

