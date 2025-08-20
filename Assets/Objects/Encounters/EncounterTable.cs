using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using NewBark.SpiritBattles;
using NewBark.SpiritBattles.Objects.Creatures;

namespace NewBark.SpiritBattles.Objects.Encounters
{
    [CreateAssetMenu(fileName = "New_EncounterTable", menuName = "Remix/Encounters/Encounter Table", order = 0)]
    public class EncounterTable : ScriptableObject
    {
        public string tableID;
        public EncounterEntry[] encounters;

        [System.Serializable]
        public class EncounterEntry
        {
            public SpiritSpecies species;
            public int minLevel = 1;
            public int maxLevel = 1;
            public float weight = 1f;
            public TerrainType terrain = TerrainType.Grass;
            public TimeOfDay timeOfDay = TimeOfDay.Any;
        }

        public EncounterEntry GetRandomEncounter(TerrainType terrain, TimeOfDay time)
        {
            if (encounters == null || encounters.Length == 0)
            {
                return null;
            }

            IEnumerable<EncounterEntry> filtered = encounters.Where(e =>
                e != null &&
                e.species != null &&
                e.weight > 0f &&
                e.terrain == terrain &&
                (e.timeOfDay == TimeOfDay.Any || e.timeOfDay == time)
            );

            var list = filtered.ToList();
            if (list.Count == 0)
            {
                return null;
            }

            float total = list.Sum(e => Mathf.Max(0f, e.weight));
            if (total <= 0f)
            {
                return null;
            }

            float roll = Random.value * total;
            float acc = 0f;
            foreach (var e in list)
            {
                acc += Mathf.Max(0f, e.weight);
                if (roll <= acc)
                {
                    return e;
                }
            }

            return list[list.Count - 1];
        }
    }
}

