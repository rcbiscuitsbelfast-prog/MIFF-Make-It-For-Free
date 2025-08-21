using System;
using System.Collections.Generic;

namespace MIFF.Pure.RNG
{
    /// <summary>
    /// Console-friendly test harness for RNGProvider.
    /// Demonstrates deterministic sequences and replay via seed.
    /// Usage:
    ///   dotnet run -- 12345 5
    ///   (if wired into a console app) or call Main(args) manually for testing.
    /// </summary>
    public static class RNGTestHarness
    {
        public static void Main(string[] args)
        {
            // Args: seed [count]
            int seed = args.Length > 0 && int.TryParse(args[0], out var s) ? s : 12345;
            int count = args.Length > 1 && int.TryParse(args[1], out var c) ? c : 10;

            var rng = new RNGProvider(seed);
            Console.WriteLine($"RNG seed: {rng.GetSeed()} | count: {count}");

            var ints = new List<int>();
            var floats = new List<float>();
            var bools = new List<bool>();

            for (int i = 0; i < count; i++)
            {
                ints.Add(rng.NextInt(0, 100));
                floats.Add(rng.NextFloat(0f, 1f));
                bools.Add(rng.NextBool(0.3f));
            }

            Console.WriteLine("Sequence #1");
            Print("ints", ints);
            Print("floats", floats);
            Print("bools", bools);

            // Replay determinism
            rng.Reset(seed);
            var ints2 = new List<int>();
            var floats2 = new List<float>();
            var bools2 = new List<bool>();
            for (int i = 0; i < count; i++)
            {
                ints2.Add(rng.NextInt(0, 100));
                floats2.Add(rng.NextFloat(0f, 1f));
                bools2.Add(rng.NextBool(0.3f));
            }

            Console.WriteLine("Sequence #2 (replayed)");
            Print("ints", ints2);
            Print("floats", floats2);
            Print("bools", bools2);

            bool equal = AreEqual(ints, ints2) && AreEqual(floats, floats2) && AreEqual(bools, bools2);
            Console.WriteLine(equal ? "Determinism: PASS" : "Determinism: FAIL");
        }

        private static void Print<T>(string label, List<T> values)
        {
            Console.WriteLine($"{label}: [" + string.Join(", ", values) + "]");
        }

        private static bool AreEqual<T>(IReadOnlyList<T> a, IReadOnlyList<T> b)
        {
            if (a.Count != b.Count) return false;
            for (int i = 0; i < a.Count; i++)
            {
                if (!Equals(a[i], b[i])) return false;
            }
            return true;
        }
    }
}

