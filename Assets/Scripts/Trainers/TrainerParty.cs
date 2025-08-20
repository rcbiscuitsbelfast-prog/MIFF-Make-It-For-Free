using NewBark.SpiritBattles;
using NewBark.SpiritBattles.Objects.Creatures;
using NewBark.SpiritBattles.Objects.Player;
using UnityEngine;

namespace NewBark.Trainers
{
    public enum AIProfile
    {
        Balanced,
        Aggressive,
        Defensive,
        Random
    }

    [CreateAssetMenu(fileName = "New_TrainerParty", menuName = "Remix/Trainers/Trainer Party", order = 0)]
    public class TrainerParty : ScriptableObject
    {
        public string trainerID;
        public string displayName;
        public SpiritSpecies[] spiritRoster;
        public FightStyle fightStyle;
        public AIProfile aiProfile = AIProfile.Balanced;
    }
}

