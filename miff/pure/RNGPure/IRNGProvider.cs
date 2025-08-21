using System;

namespace MIFF.Pure.RNG
{
    /// <summary>
    /// Contract for a deterministic, seedable random number provider.
    /// Pure C#; engine-independent for headless/CLI testing and DI.
    /// </summary>
    public interface IRNGProvider
    {
        /// <summary>
        /// Returns the next integer in [min, max) using deterministic sequence.
        /// </summary>
        int NextInt(int minInclusive, int maxExclusive);

        /// <summary>
        /// Returns the next float in [min, max) using deterministic sequence.
        /// </summary>
        float NextFloat(float minInclusive, float maxExclusive);

        /// <summary>
        /// Returns true with the given probability (0..1).
        /// </summary>
        bool NextBool(float probability = 0.5f);

        /// <summary>
        /// Returns the current seed used for this provider.
        /// </summary>
        int GetSeed();

        /// <summary>
        /// Resets the sequence with a new seed. Useful for golden test replay.
        /// </summary>
        void Reset(int seed);
    }
}

