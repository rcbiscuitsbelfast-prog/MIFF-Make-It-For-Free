using System.Collections.Generic;
using System.Linq;
using NewBark.State;
using UnityEngine;

namespace NewBark.Creatures
{
    public class PartyManager : MonoBehaviour
    {
        public static PartyManager Instance { get; private set; }
        public int maxPartySize = 6;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("PartyManager initialized (singleton, DontDestroyOnLoad).");
        }

        public IEnumerable<GameData.CreatureEntry> GetParty()
        {
            foreach (var id in GameManager.Data.party)
            {
                var c = GameManager.Data.creatures.FirstOrDefault(x => x.id == id);
                if (c != null) yield return c;
            }
        }

        public bool AddToParty(string creatureId)
        {
            if (GameManager.Data.party.Count >= maxPartySize)
            {
                Debug.Log("Party full. Send to storage (not implemented).");
                return false;
            }
            if (!GameManager.Data.party.Contains(creatureId))
            {
                GameManager.Data.party.Add(creatureId);
                Debug.Log("Party: added " + creatureId);
                return true;
            }
            return false;
        }

        public bool RemoveFromParty(string creatureId)
        {
            var removed = GameManager.Data.party.Remove(creatureId);
            if (removed)
            {
                Debug.Log("Party: removed " + creatureId);
            }
            return removed;
        }

        public bool SwapPartySlots(int a, int b)
        {
            var party = GameManager.Data.party;
            if (a < 0 || b < 0 || a >= party.Count || b >= party.Count) return false;
            (party[a], party[b]) = (party[b], party[a]);
            Debug.Log($"Party: swapped slots {a} <-> {b}");
            return true;
        }
    }
}