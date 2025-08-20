using NewBark.Battle;
using NewBark.SpiritBattles;
using NewBark.SpiritBattles.Objects.Encounters;
using NewBark.UI;
using UnityEngine;

namespace NewBark.Encounters
{
    [RequireComponent(typeof(Collider2D))]
    public class EncounterTrigger : MonoBehaviour
    {
        [Header("Encounter")] 
        public EncounterTable encounterTable;
        public TerrainType terrain = TerrainType.Grass;
        public bool isActive = true;

        [Header("Integrations (optional)")] 
        public BattleController battleController;
        public TransitionController transitionController;

        private void Reset()
        {
            var col = GetComponent<Collider2D>();
            col.isTrigger = true;
        }

        private void Awake()
        {
            if (!battleController)
            {
                battleController = FindObjectOfType<BattleController>();
            }
            if (!transitionController)
            {
                transitionController = FindObjectOfType<TransitionController>();
            }
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (!isActive || !other || !other.CompareTag("Player"))
            {
                return;
            }

            TryStartEncounter();
        }

        private void TryStartEncounter()
        {
            if (!encounterTable || battleController == null)
            {
                return;
            }

            var time = GetCurrentTimeOfDay();
            var entry = encounterTable.GetRandomEncounter(terrain, time);
            if (entry == null)
            {
                return;
            }

            isActive = false; // prevent re-triggering immediately

            if (transitionController)
            {
                transitionController.TransitionOut();
            }

            battleController.StartBattle(encounterTable, isRival: false);

            if (transitionController)
            {
                transitionController.TransitionIn();
            }
        }

        private TimeOfDay GetCurrentTimeOfDay()
        {
            int hour = System.DateTime.Now.Hour;
            if (hour >= 6 && hour < 18)
            {
                return TimeOfDay.Day;
            }
            return TimeOfDay.Night;
        }
    }
}

