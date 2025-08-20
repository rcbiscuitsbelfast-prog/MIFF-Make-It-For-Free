using MIFF.Core;

namespace MIFF.Items
{
    /// <summary>
    /// Interface for implementing item effects
    /// </summary>
    public interface IItemEffect
    {
        /// <summary>
        /// Apply the item effect
        /// </summary>
        /// <param name="playerContext">Context about the player using the item</param>
        /// <param name="targetContext">Context about the target of the item</param>
        void Apply(PlayerContext playerContext, TargetContext targetContext);
        
        /// <summary>
        /// Get a description of what this effect does
        /// </summary>
        string GetEffectDescription();
        
        /// <summary>
        /// Check if this effect can be applied to the target
        /// </summary>
        bool CanApplyTo(TargetContext targetContext);
    }
}