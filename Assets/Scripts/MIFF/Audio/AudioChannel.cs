namespace MIFF.Audio
{
    /// <summary>
    /// Audio channel types for the K-pop spirit battle game
    /// Designed to be extensible for remixers
    /// </summary>
    public enum AudioChannel
    {
        /// <summary>
        /// Background Music - Continuous music tracks
        /// </summary>
        BGM,
        
        /// <summary>
        /// Sound Effects - Short audio clips for actions
        /// </summary>
        SFX,
        
        /// <summary>
        /// Stems - Individual instrument tracks for synchronization
        /// </summary>
        Stem,
        
        /// <summary>
        /// Voice - Character dialogue and vocals
        /// </summary>
        Voice,
        
        /// <summary>
        /// Ambient - Environmental and atmospheric sounds
        /// </summary>
        Ambient,
        
        /// <summary>
        /// User Interface - Menu and UI interaction sounds
        /// </summary>
        UI,
        
        /// <summary>
        /// Battle - Combat and battle-specific audio
        /// </summary>
        Battle,
        
        /// <summary>
        /// Menu - Menu navigation and selection sounds
        /// </summary>
        Menu,
        
        /// <summary>
        /// Custom1 - Remixer-defined channel
        /// </summary>
        Custom1,
        
        /// <summary>
        /// Custom2 - Remixer-defined channel
        /// </summary>
        Custom2,
        
        /// <summary>
        /// Custom3 - Remixer-defined channel
        /// </summary>
        Custom3
    }
}