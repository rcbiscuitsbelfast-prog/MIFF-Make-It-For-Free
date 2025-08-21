using System;

namespace MIFF.Pure.StatusEffects
{
    /// <summary>
    /// Turn or time based effect timer. Engine-independent.
    /// </summary>
    public class EffectTimer
    {
        public int RemainingTurns { get; private set; }

        public EffectTimer(int turns)
        {
            RemainingTurns = Math.Max(0, turns);
        }

        public bool Tick()
        {
            if (RemainingTurns == 0) return true;
            RemainingTurns = Math.Max(0, RemainingTurns - 1);
            return RemainingTurns == 0;
        }
    }
}

