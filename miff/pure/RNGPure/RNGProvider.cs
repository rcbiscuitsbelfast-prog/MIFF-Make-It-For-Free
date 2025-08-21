using System;

namespace MIFF.Pure.RNG
{
    /// <summary>
    /// Deterministic, seedable RNG provider for modular gameplay systems.
    /// - Pure C# (no UnityEngine dependencies)
    /// - Thread-unsafe by design; create one instance per consumer or guard externally
    /// - Extension hooks via protected virtual methods for custom distributions
    /// </summary>
    public class RNGProvider : IRNGProvider
    {
        private int _seed;
        private Random _random;

        /// <summary>
        /// Constructs a new RNG provider with the given seed.
        /// </summary>
        public RNGProvider(int seed)
        {
            _seed = seed;
            _random = new Random(seed);
        }

        public int NextInt(int minInclusive, int maxExclusive)
        {
            if (maxExclusive <= minInclusive)
            {
                throw new ArgumentException("maxExclusive must be greater than minInclusive");
            }
            return _random.Next(minInclusive, maxExclusive);
        }

        public float NextFloat(float minInclusive, float maxExclusive)
        {
            if (maxExclusive <= minInclusive)
            {
                throw new ArgumentException("maxExclusive must be greater than minInclusive");
            }

            // System.Random.NextSingle exists in newer runtimes; use NextDouble for broad compatibility
            var unit = (float)_random.NextDouble(); // [0,1)
            return minInclusive + unit * (maxExclusive - minInclusive);
        }

        public bool NextBool(float probability = 0.5f)
        {
            if (probability <= 0f) return false;
            if (probability >= 1f) return true;
            var roll = (float)_random.NextDouble();
            return roll < probability;
        }

        public int GetSeed() => _seed;

        public void Reset(int seed)
        {
            _seed = seed;
            _random = new Random(seed);
        }

        /// <summary>
        /// Hook for custom shuffling that uses the provider.
        /// Example usage: derived classes or utilities can call NextInt/NextFloat.
        /// </summary>
        protected virtual void OnBeforeNext() { /* extension point */ }
    }
}

