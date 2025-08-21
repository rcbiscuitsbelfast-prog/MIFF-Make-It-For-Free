using System;

namespace MIFF.SyncPure
{
    /// <summary>
    /// Built-in triggers that may grant sync.
    /// </summary>
    [Serializable]
    public enum SyncTrigger
    {
        BattleWin,
        ItemUsage,
        DialogueChoice,
        RhythmChallengeSuccess
    }

    /// <summary>
    /// Optional payload for a sync event (extensible).
    /// </summary>
    [Serializable]
    public class SyncEvent
    {
        public SyncTrigger trigger;
        public int magnitude = 1;     // base sync gain for the event
        public string tag;            // optional tag (e.g., itemID, dialogue choiceID)
        public string loreUnlockID;   // optional lore unlock
        public string evolutionHint;  // optional evolution hint/species
    }
}

