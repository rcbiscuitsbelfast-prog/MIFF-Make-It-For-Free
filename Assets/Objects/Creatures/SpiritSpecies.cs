using UnityEngine;
using NewBark.SpiritBattles;

namespace NewBark.SpiritBattles.Objects.Creatures
{
    [CreateAssetMenu(fileName = "New_SpiritSpecies", menuName = "Remix/Spirits/Spirit Species", order = 0)]
    public class SpiritSpecies : ScriptableObject
    {
        [Header("Identity")]
        public string spiritID;
        public string displayName;

        [Header("Core Traits")]
        public EmotionCore emotionCore;
        public GenreBias genreBias;
        public AffinityType affinity;
        public BattleRole battleRole;

        [Header("Base Stats")] 
        public int pulse;   // analogous to strength/attack
        public int rhythm;  // analogous to speed/tempo
        public int flow;    // analogous to special/technique
        public int sync;    // analogous to defense/coordination

        [Header("Moveset")]
        public SongMove[] moveSet;

        [Header("Presentation")]
        public Sprite frontSprite;
        public AudioClip cry;
        [TextArea(2, 10)] public string lore;
        public Sprite backSprite;
    }
}

