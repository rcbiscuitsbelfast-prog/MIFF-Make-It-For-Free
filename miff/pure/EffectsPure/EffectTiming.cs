namespace MIFF.Pure.Effects
{
    public enum EffectPhase
    {
        PreTurn,
        SelectAction,
        ResolveAction,
        EndTurn
    }

    public enum EffectOrder
    {
        Buffs = 0,
        Debuffs = 1,
        Passives = 2
    }
}

