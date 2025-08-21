using System;
using System.Collections.Generic;
using MIFF.Pure.BattleLoop;

namespace MIFF.Pure.Log
{
    /// <summary>
    /// Collects structured log entries for CLI playback and golden validation.
    /// </summary>
    public class BattleLogger
    {
        private readonly List<BattleLogEntry> _entries = new List<BattleLogEntry>();
        private int _turnCounter = 0;

        public void LogPhaseChange(BattlePhase phase)
        {
            if (phase == BattlePhase.PreTurn) _turnCounter++;
            _entries.Add(new BattleLogEntry
            {
                TimestampUtc = DateTime.UtcNow,
                ActionType = "phase",
                Result = phase.ToString(),
                Phase = phase.ToString(),
                TurnNumber = _turnCounter
            });
        }

        public void LogAction(BattleAction action, BattleResult result)
        {
            _entries.Add(new BattleLogEntry
            {
                TimestampUtc = DateTime.UtcNow,
                ActorId = action.ActorId,
                ActionType = action.MoveId,
                TargetId = action.TargetId,
                Result = result?.Summary ?? "",
                DebugNotes = action.DebugNotes,
                DamageDealt = result?.Damage,
                StatusApplied = result?.StatusApplied,
                TurnNumber = _turnCounter
            });
        }

        public void LogEffectTrigger(BattleEffect effect)
        {
            _entries.Add(new BattleLogEntry
            {
                TimestampUtc = DateTime.UtcNow,
                ActorId = effect.SourceActorId ?? 0,
                TargetId = effect.TargetActorId ?? 0,
                ActionType = "effect",
                Result = effect.EffectId,
                DebugNotes = effect.Description,
                TurnNumber = _turnCounter
            });
        }

        public List<BattleLogEntry> GetLog() => new List<BattleLogEntry>(_entries);
    }
}

