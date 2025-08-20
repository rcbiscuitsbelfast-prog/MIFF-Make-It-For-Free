using UnityEngine;
using NewBark.SpiritBattles;
using NewBark.SpiritBattles.Objects.Moves;

namespace NewBark.SpiritBattles.Objects.Player
{
    [CreateAssetMenu(fileName = "New_PlayerProfile", menuName = "Remix/Player/Player Profile", order = 0)]
    public class PlayerProfile : ScriptableObject
    {
        [Header("Identity")] 
        public string profileID;
        public string displayName;

        [Header("Style & Stats")] 
        public FightStyle fightStyle;
        public int HP;
        public int rhythm;
        public int sync;

        [Header("Signature")] 
        public SongMove[] signatureMoves;

        [Header("Presentation")] 
        public Sprite avatarSprite;
    }
}

