using System;
using NewBark.State;
using UnityEngine;

namespace NewBark.Creatures
{
    public static class CreatureFactory
    {
        public static GameData.CreatureEntry CreateCreature(string speciesId, int level, string[] movesOverride = null)
        {
            var sp = SpeciesDatabase.Instance.Get(speciesId);
            if (sp == null)
            {
                Debug.LogWarning("CreatureFactory: species not found: " + speciesId);
                return null;
            }
            var id = Guid.NewGuid().ToString("N");
            var moves = movesOverride ?? sp.allowedMoves;
            var stats = new GameData.StatsEntry
            {
                level = level,
                hp = sp.baseHp + level * 2,
                attack = sp.baseAttack + level,
                defense = sp.baseDefense + level,
                speed = sp.baseSpeed + level
            };
            var ce = new GameData.CreatureEntry
            {
                id = id,
                nameId = sp.nameId,
                speciesId = sp.id,
                isCaptured = false,
                stats = stats,
                moves = moves,
                metadata = Array.Empty<GameData.MetadataEntry>()
            };
            GameManager.Data.creatures.Add(ce);
            return ce;
        }

        public static bool AttemptCapture(GameData.CreatureEntry opponent)
        {
            var sp = SpeciesDatabase.Instance.Get(opponent.speciesId);
            if (sp == null) return false;
            var roll = UnityEngine.Random.Range(0, 100);
            var success = roll < Mathf.Clamp(sp.captureRate, 0, 100);
            if (success)
            {
                opponent.isCaptured = true;
            }
            return success;
        }
    }
}