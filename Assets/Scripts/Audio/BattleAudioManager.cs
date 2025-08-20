using System.Collections;
using NewBark.Audio;
using UnityEngine;

namespace NewBark.Battle.Audio
{
    public class BattleAudioManager : MonoBehaviour
    {
        public const string BASE_TRACK_GROUP = "BGM";
        public const string STEM_TRACK_GROUP = "Stem";

        [Header("References")] 
        public AudioController audioController; // optional; if null, tries GameManager.Audio

        [Header("Mixing")] 
        [Range(0f, 1f)] public float stemVolume = 0.5f;

        [Header("Beat Sync")] 
        public bool beatSyncEnabled = true;
        public float bpm = 120f;
        public int beatsPerBar = 4;

        private AudioSource _stemSource;

        private void Awake()
        {
            if (!audioController)
            {
                // Try to resolve from GameManager if available in this project
                var gmAudio = FindObjectOfType<AudioController>();
                audioController = gmAudio;
            }

            _stemSource = CreateAudioSource(STEM_TRACK_GROUP + "_Channel");
            _stemSource.loop = false;
            _stemSource.playOnAwake = false;
            _stemSource.volume = stemVolume;
        }

        private AudioSource CreateAudioSource(string goName)
        {
            var go = new GameObject(goName);
            go.transform.SetParent(transform);
            return go.AddComponent<AudioSource>();
        }

        private void OnValidate()
        {
            if (_stemSource)
            {
                _stemSource.volume = stemVolume;
            }
        }

        public void PlayBaseTrack(AudioClip baseClip)
        {
            if (!audioController || baseClip == null)
            {
                return;
            }

            // Ensure BGM loops
            audioController.BgmChannel.loop = true;
            audioController.PlayBgmTransition(baseClip);
        }

        public void PlayMoveStem(AudioClip stemClip)
        {
            if (stemClip == null)
            {
                return;
            }

            _stemSource.clip = stemClip;
            _stemSource.loop = false;

            if (!beatSyncEnabled || audioController == null || !audioController.BgmChannel.isPlaying)
            {
                _stemSource.Play();
                return;
            }

            double delay = CalculateDelayToNextBar(audioController.BgmChannel);
            _stemSource.PlayScheduled(AudioSettings.dspTime + delay);
        }

        public void StopStems()
        {
            if (_stemSource)
            {
                _stemSource.Stop();
                _stemSource.clip = null;
            }
        }

        private double CalculateDelayToNextBar(AudioSource baseSource)
        {
            if (bpm <= 0 || beatsPerBar <= 0)
            {
                return 0.0;
            }

            double barLen = 60.0 / bpm * beatsPerBar;
            double t = baseSource.time; // seconds since BGM started
            double untilNext = barLen - (t % barLen);
            if (untilNext < 0.001) untilNext = 0.0;
            return untilNext;
        }
    }
}

