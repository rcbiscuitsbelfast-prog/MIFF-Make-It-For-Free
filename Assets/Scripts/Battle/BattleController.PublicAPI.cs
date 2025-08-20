using NewBark.SpiritBattles.Objects.Creatures;

namespace NewBark.Battle
{
    public partial class BattleController
    {
        public SpiritSpecies GetCurrentPlayerSpirit()
        {
            return GetCurrentPlayerSpiritInternal();
        }

        public int GetPlayerSpiritHP(int index)
        {
            if (_playerSpiritHP == null || index < 0 || index >= _playerSpiritHP.Length) return 0;
            return _playerSpiritHP[index];
        }

        public int PlayerSpiritCount => playerSpirits?.Length ?? 0;
        public bool MustSwitchSpirit => mustSwitchSpirit;

        private SpiritSpecies GetCurrentPlayerSpiritInternal()
        {
            return GetCurrentPlayerSpirit();
        }
    }
}

