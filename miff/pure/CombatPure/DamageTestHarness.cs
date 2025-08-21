using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using MIFF.Pure.RNG;

namespace MIFF.Pure.Combat
{
    /// <summary>
    /// Console-friendly harness for damage calculation repeatability.
    /// Loads sample moves JSON, simulates one calculation twice with same seed, prints breakdowns.
    /// Usage: dotnet run -- 12345
    /// </summary>
    public static class DamageTestHarness
    {
        public static void Main(string[] args)
        {
            int seed = args.Length > 0 && int.TryParse(args[0], out var s) ? s : 12345;
            var rng = new RNGProvider(seed);

            var attacker = new SpiritInstance
            {
                Id = 1, Name = "Attacker", TypeTag = "water", Level = 10,
                Attack = 22, Defense = 14, SpecialAttack = 28, SpecialDefense = 16,
                AttackMultiplier = 1.0f, SpecialAttackMultiplier = 1.0f, CritChanceBonus = 0.1f
            };

            var defender = new SpiritInstance
            {
                Id = 2, Name = "Defender", TypeTag = "fire", Level = 10,
                Attack = 18, Defense = 20, SpecialAttack = 18, SpecialDefense = 18,
                DefenseMultiplier = 1.0f, SpecialDefenseMultiplier = 1.0f
            };

            var movesPath = Path.Combine("miff", "pure", "CombatPure", "Fixtures", "SampleMoves.json");
            var json = File.ReadAllText(movesPath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var moves = JsonSerializer.Deserialize<MoveData[]>(json, options) ?? Array.Empty<MoveData>();
            var move = moves.First(m => m.MoveId == "water_burst");

            var types = new TypeEffectiveness();
            var calc = new DamageCalculator(types);

            var d1 = calc.CalculateDamage(attacker, defender, move, rng, out var b1);
            Console.WriteLine("--- First Calculation ---");
            Console.WriteLine(b1.ToString());

            rng.Reset(seed);
            var d2 = calc.CalculateDamage(attacker, defender, move, rng, out var b2);
            Console.WriteLine("--- Replay Calculation ---");
            Console.WriteLine(b2.ToString());

            Console.WriteLine(d1 == d2 && b1.Final == b2.Final ? "Determinism: PASS" : "Determinism: FAIL");

            // Edge cases
            var zeroPower = moves.First(m => m.MoveId == "sap_weaken");
            var d3 = calc.CalculateDamage(attacker, defender, zeroPower, rng, out var b3);
            Console.WriteLine("--- Status Move (Zero Power) ---");
            Console.WriteLine(b3.ToString());
        }
    }
}

