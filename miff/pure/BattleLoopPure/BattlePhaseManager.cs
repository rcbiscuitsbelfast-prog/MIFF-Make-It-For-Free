using System;

namespace MIFF.Pure.BattleLoop
{
    /// <summary>
    /// Manages phase transitions for a single turn. Emits events and supports hooks.
    /// Phases: PreTurn → SelectAction → ResolveAction → EndTurn
    /// </summary>
    public class BattlePhaseManager
    {
        public BattlePhase Current { get; private set; } = BattlePhase.PreTurn;

        // Events for observers (logging, effects, UI adapters)
        public event Action<BattlePhase, BattlePhase>? OnPhaseChanged;
        public event Action<BattlePhase>? OnPhaseEntered;

        /// <summary>
        /// Advances to the next phase in the fixed order.
        /// </summary>
        public BattlePhase Advance()
        {
            var previous = Current;
            Current = GetNextPhase(Current);
            OnPhaseChanged?.Invoke(previous, Current);
            OnPhaseEntered?.Invoke(Current);
            return Current;
        }

        public static BattlePhase GetNextPhase(BattlePhase phase)
        {
            switch (phase)
            {
                case BattlePhase.PreTurn: return BattlePhase.SelectAction;
                case BattlePhase.SelectAction: return BattlePhase.ResolveAction;
                case BattlePhase.ResolveAction: return BattlePhase.EndTurn;
                case BattlePhase.EndTurn: return BattlePhase.PreTurn;
                default: return BattlePhase.PreTurn;
            }
        }
    }

    public enum BattlePhase
    {
        PreTurn = 0,
        SelectAction = 1,
        ResolveAction = 2,
        EndTurn = 3
    }
}

