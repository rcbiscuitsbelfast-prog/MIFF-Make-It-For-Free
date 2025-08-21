using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Pure.HUD
{
    /// <summary>
    /// CLI-friendly printer for the BattleHUDModel.
    /// </summary>
    public static class BattleStatePrinter
    {
        public static void PrintHUD(BattleHUDModel model)
        {
            if (model == null)
            {
                Console.WriteLine("(no HUD)");
                return;
            }

            Console.WriteLine("=== Player ===");
            foreach (var s in model.Player)
            {
                Console.WriteLine(FormatSpirit(s));
            }

            Console.WriteLine("=== Opponent ===");
            foreach (var s in model.Opponent)
            {
                Console.WriteLine(FormatSpirit(s));
            }

            Console.WriteLine($"Phase: {model.Turn.PhaseName} | Active: {model.Turn.ActiveSpiritId ?? "-"} | Action: {model.Turn.ActionPreview ?? "-"}");
        }

        private static string FormatSpirit(SpiritHUDState s)
        {
            var bar = RenderHPBar(s.CurrentHP, s.MaxHP, 20);
            var status = s.StatusEffects != null && s.StatusEffects.Any() ? string.Join(",", s.StatusEffects) : "-";
            return $"{s.Name} ({s.SpiritId}) HP {s.CurrentHP}/{s.MaxHP} {bar} status[{status}]";
        }

        private static string RenderHPBar(int hp, int max, int width)
        {
            if (max <= 0) max = 1;
            hp = Math.Max(0, Math.Min(max, hp));
            int filled = (int)Math.Round((double)hp / max * width);
            return "[" + new string('#', filled) + new string('-', width - filled) + "]";
        }
    }
}

