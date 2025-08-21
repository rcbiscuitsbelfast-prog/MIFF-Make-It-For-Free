using NewBark.State;
using UnityEngine;

namespace NewBark.Creatures
{
    public class EncounterManager : MonoBehaviour
    {
        public static EncounterManager Instance { get; private set; }
        private GameData.CreatureEntry _opponent;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("EncounterManager initialized (singleton, DontDestroyOnLoad).");
        }

        public GameData.CreatureEntry StartEncounter(string speciesId, int level)
        {
            _opponent = CreatureFactory.CreateCreature(speciesId, level);
            Debug.Log("Encounter started with species " + speciesId + " lvl " + level);
            return _opponent;
        }

        public bool AttemptCapture()
        {
            if (_opponent == null) return false;
            var success = CreatureFactory.AttemptCapture(_opponent);
            if (success)
            {
                PartyManager.Instance.AddToParty(_opponent.id);
                Debug.Log("Capture success: " + _opponent.id);
            }
            else
            {
                Debug.Log("Capture failed");
            }
            return success;
        }

        public void EndEncounter()
        {
            _opponent = null;
            Debug.Log("Encounter ended");
        }

        public GameData.CreatureEntry GetOpponent()
        {
            return _opponent;
        }
    }
}