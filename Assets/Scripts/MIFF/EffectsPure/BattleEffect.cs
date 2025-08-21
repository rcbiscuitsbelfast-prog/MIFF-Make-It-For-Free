using System;

namespace MIFF.EffectsPure
{
	[Flags]
	public enum EffectTrigger
	{
		None = 0,
		OnApply = 1 << 0,
		OnRemove = 1 << 1,
		OnTick = 1 << 2,
		OnHit = 1 << 3,
		OnCast = 1 << 4,
		OnCrit = 1 << 5
	}

	public enum EffectType
	{
		StatModifier,
		DamageOverTime,
		Heal,
		Stun,
		Shield,
		Custom
	}

	public enum TargetStat
	{
		HP,
		ATK,
		DEF,
		SPD,
		SPATK,
		SPDEF,
		ACC,
		EVA,
		Custom
	}

	public enum ModifierType
	{
		Flat,
		Percent
	}

	/// <summary>
	/// Pure C# battle effect definition (data-only). Instances track runtime state separately.
	/// </summary>
	[Serializable]
	public class BattleEffect
	{
		public string effectID;
		public string name;
		public string description;

		// Duration can be real-time seconds or turn-based ticks (use one or both)
		public float durationSeconds; // <= 0 means unused
		public int durationTurns; // <= 0 means unused

		public bool stackable = true;
		public int maxStacks = 5;
		public bool refreshOnStack = true;

		public EffectTrigger triggers = EffectTrigger.OnApply | EffectTrigger.OnTick | EffectTrigger.OnRemove;
		public EffectType effectType = EffectType.StatModifier;
		public TargetStat targetStat = TargetStat.Custom;
		public ModifierType modifierType = ModifierType.Flat;
		public float value; // meaning depends on type/modifier

		public BattleEffect Clone()
		{
			return new BattleEffect
			{
				effectID = effectID,
				name = name,
				description = description,
				durationSeconds = durationSeconds,
				durationTurns = durationTurns,
				stackable = stackable,
				maxStacks = maxStacks,
				refreshOnStack = refreshOnStack,
				triggers = triggers,
				effectType = effectType,
				targetStat = targetStat,
				modifierType = modifierType,
				value = value
			};
		}
	}
}

