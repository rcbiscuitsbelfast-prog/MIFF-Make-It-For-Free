using UnityEngine;
using NewBark.SpiritBattles;

namespace NewBark.SpiritBattles.Objects.Moves
{
    [CreateAssetMenu(fileName = "New_SongMove", menuName = "Remix/Moves/Song Move", order = 0)]
    public class SongMove : ScriptableObject
    {
        [Header("Identity")]
        public string moveID;
        public string displayName;

        [Header("Mechanics")] 
        public MoveType moveType;
        public int power;
        public int accuracy;
        [TextArea]
        public string effectDescription;
        public EmotionCore emotionAffinity;

        [Header("Presentation")] 
        public AudioClip moveSound;
        [Tooltip("Optional synced stem that can play over the base battle track")] 
        public AudioClip stemClip;
    }
}

