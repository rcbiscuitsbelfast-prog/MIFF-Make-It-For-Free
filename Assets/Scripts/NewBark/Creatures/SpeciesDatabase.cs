using System;
using System.Collections.Generic;
using UnityEngine;

namespace NewBark.Creatures
{
    [Serializable]
    public class Species
    {
        public string id;
        public string nameId;
        public int baseHp;
        public int baseAttack;
        public int baseDefense;
        public int baseSpeed;
        public int captureRate; // 0..100
        public string[] allowedMoves;
    }

    public class SpeciesDatabase : MonoBehaviour
    {
        public static SpeciesDatabase Instance { get; private set; }
        private Dictionary<string, Species> idToSpecies = new Dictionary<string, Species>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Load();
        }

        public void Load()
        {
            idToSpecies.Clear();
            var asset = Resources.Load<TextAsset>("species/species");
            if (asset == null)
            {
                Debug.LogWarning("SpeciesDatabase: species JSON not found at Resources/species/species.json");
                return;
            }
            try
            {
                var list = JsonUtility.FromJson<SpeciesList>(asset.text);
                if (list != null && list.species != null)
                {
                    foreach (var s in list.species)
                    {
                        idToSpecies[s.id] = s;
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning("SpeciesDatabase: failed to parse species JSON: " + e.Message);
            }
        }

        public Species Get(string id)
        {
            return idToSpecies.TryGetValue(id, out var s) ? s : null;
        }

        [Serializable]
        private class SpeciesList
        {
            public Species[] species;
        }
    }
}