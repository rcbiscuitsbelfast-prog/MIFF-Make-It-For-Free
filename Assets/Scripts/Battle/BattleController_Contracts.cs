using NewBark.SpiritBattles.Objects.Creatures;
using NewBark.SpiritBattles.Objects.Moves;

namespace NewBark.Battle
{
    public struct BattleContext
    {
        public bool IsRival;
        public int PlayerSpiritCount;
        public int EnemySpiritCount;
    }

    public struct MoveResult
    {
        public bool UserIsPlayer;
        public SongMove Move;
        public int Damage;
    }
}

