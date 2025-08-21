using System;
using MIFF.Pure.Combat;

namespace MIFF.Pure.Party
{
    /// <summary>
    /// Console tester for party swaps, KO handling, and healing.
    /// Usage: dotnet run
    /// </summary>
    public static class PartyTestHarness
    {
        public static void Main(string[] args)
        {
            var pm = new PartyManager(3);
            pm.OnRevived += s => Console.WriteLine($"Revived: {s.Name ?? s.SpiritId}");

            var a = new SpiritInstance{ Id=1, SpiritId="sprout", Name="Sprout", MaxHP=30, CurrentHP=30 };
            var b = new SpiritInstance{ Id=2, SpiritId="ember",  Name="Ember",  MaxHP=28, CurrentHP=28 };
            var c = new SpiritInstance{ Id=3, SpiritId="ripple", Name="Ripple", MaxHP=32, CurrentHP=32 };

            pm.AddToParty(a);
            pm.AddToParty(b);
            pm.AddToParty(c);

            Print(pm, "Initial");
            pm.SwapMembers(0, 2);
            Print(pm, "After swap 0<->2");

            pm.HandleKO("ember");
            Print(pm, "After KO ember");

            pm.HealAll();
            Print(pm, "After HealAll");
        }

        private static void Print(PartyManager pm, string title)
        {
            Console.WriteLine($"--- {title} ---");
            for (int i = 0; i < pm.Slots.Count; i++)
            {
                var m = pm.Slots[i].Member;
                Console.WriteLine($"Slot {i}: {(m==null?"(empty)":$"{m.Name} HP {m.CurrentHP}/{m.MaxHP}")}");
            }
        }
    }
}

