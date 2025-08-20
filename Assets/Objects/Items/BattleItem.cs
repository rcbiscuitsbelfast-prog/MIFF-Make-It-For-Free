using UnityEngine;
using NewBark.SpiritBattles;

namespace NewBark.SpiritBattles.Objects.Items
{
    [CreateAssetMenu(fileName = "New_BattleItem", menuName = "Remix/Items/Battle Item", order = 0)]
    public class BattleItem : ScriptableObject
    {
        [Header("Identity")] 
        public string itemID;
        public string displayName;
        [TextArea]
        public string description;

        [Header("Presentation")] 
        public Sprite icon;

        [Header("Effect")] 
        public ItemEffectType effectType;
        public int effectValue;
    }
}

