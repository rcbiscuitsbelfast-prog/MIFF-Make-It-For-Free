using NewBark.Battle.Audio;
using NewBark.SpiritBattles.Objects.Moves;
using UnityEngine;

namespace NewBark.Battle
{
    // Minimal placeholder BattleController to demonstrate audio hook.
    public class BattleController : MonoBehaviour
    {
        [Header("Audio")] 
        public BattleAudioManager battleAudioManager;
        public AudioClip baseBattleTrack;

        private void Start()
        {
            if (battleAudioManager && baseBattleTrack)
            {
                battleAudioManager.PlayBaseTrack(baseBattleTrack);
            }
        }

        // This method illustrates where to call after a move resolves.
        public void OnMoveResolved(SongMove currentMove)
        {
            if (!battleAudioManager || currentMove == null) return;

            if (currentMove.stemClip != null)
            {
                battleAudioManager.PlayMoveStem(currentMove.stemClip);
            }
        }
    }
}

