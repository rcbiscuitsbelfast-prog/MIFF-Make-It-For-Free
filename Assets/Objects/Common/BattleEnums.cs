using UnityEngine;

namespace NewBark.SpiritBattles
{
    public enum EmotionCore
    {
        None,
        Joy,
        Sorrow,
        Anger,
        Calm,
        Fear,
        Courage,
        Love,
        Mystery
    }

    public enum GenreBias
    {
        None,
        Pop,
        Rock,
        HipHop,
        EDM,
        Classical,
        Jazz,
        Folk,
        Metal,
        World,
        Experimental
    }

    public enum AffinityType
    {
        Neutral,
        Fire,
        Water,
        Air,
        Earth,
        Light,
        Dark,
        Electric,
        Psychic,
        Nature,
        Sound
    }

    public enum BattleRole
    {
        Balanced,
        Striker,
        Support,
        Tank,
        Control
    }

    public enum MoveType
    {
        Physical,
        Special,
        Status,
        Buff,
        Debuff
    }

    public enum FightStyle
    {
        Balanced,
        Aggressive,
        Defensive,
        Technical,
        Speed
    }

    public enum ItemEffectType
    {
        None,
        HealHP,
        RestoreRhythm,
        CureStatus,
        BuffStat,
        DebuffEnemy,
        Escape,
        Revive
    }
}

