using System;
using System.Collections.Generic;
using MIFF.Spirits;

namespace MIFF.BattleAIPure
{
    /// <summary>
    /// Console-based tester to simulate AI move selection and compare profiles.
    /// </summary>
    [Serializable]
    public class AITestHarness
    {
        private SpiritInstance MakeSpirit(string speciesID, string name, int level)
        {
            var s = new SpiritInstance(speciesID);
            s.SetNickname(name);
            // Simulate level
            for (int i = 1; i < level; i++) s.GainExperience(1000);
            // Simulate known moves by name strings
            s.KnownMoves.Add("power_strike");
            s.KnownMoves.Add("guard_boost");
            s.KnownMoves.Add("heal_pulse");
            return s;
        }

        public void Run()
        {
            Console.WriteLine("=== AI Test Harness ===");

            var aggr = AIDecisionProfile.CreateDefault("aggr", AIDecisionStyle.Aggressive);
            var def = AIDecisionProfile.CreateDefault("def", AIDecisionStyle.Defensive);
            var trick = AIDecisionProfile.CreateDefault("trick", AIDecisionStyle.Trickster);

            var aiAgg = new BattleAIController(aggr);
            var aiDef = new BattleAIController(def);
            var aiTrk = new BattleAIController(trick);

            var self = MakeSpirit("sparkling_idol", "Idol A", 10);
            var opp = MakeSpirit("groove_spirit", "Groove B", 9);

            Console.WriteLine("Aggressive select: " + aiAgg.SelectMove(self, opp));
            Console.WriteLine("Defensive select: " + aiDef.SelectMove(self, opp));
            Console.WriteLine("Trickster select: " + aiTrk.SelectMove(self, opp));

            Console.WriteLine("Threat level of opponent: " + aiAgg.EvaluateThreatLevel(opp));
        }
    }
}

