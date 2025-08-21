using UnityEngine;
using UnityEngine.Audio;

namespace NewBark.Audio
{
    public class AudioMixerManager : MonoBehaviour
    {
        public static AudioMixerManager Instance { get; private set; }

        [Header("Mixer Source")]
        public AudioMixer mixer; // assign via inspector or auto-load
        [Tooltip("Resources path to load the AudioMixer if not assigned (e.g., Audio/MainMixer)")]
        public string resourcesPath = "Audio/MainMixer";

        [Header("Exposed Parameter Names")] public string musicParam = "MusicVolume";
        public string sfxParam = "SFXVolume";

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            if (mixer == null && !string.IsNullOrEmpty(resourcesPath))
            {
                mixer = Resources.Load<AudioMixer>(resourcesPath);
                if (mixer == null)
                {
                    Debug.LogWarning("AudioMixerManager: Could not load AudioMixer at Resources/" + resourcesPath);
                }
            }
        }

        public void SetMusicVolume(float linear)
        {
            SetVolume(musicParam, linear);
        }

        public void SetSfxVolume(float linear)
        {
            SetVolume(sfxParam, linear);
        }

        public void SetVolume(string parameter, float linear)
        {
            if (mixer == null)
            {
                Debug.LogWarning("AudioMixerManager: mixer is null; cannot set volume for " + parameter);
                return;
            }

            var db = LinearToDecibels(Mathf.Clamp01(linear));
            mixer.SetFloat(parameter, db);
        }

        public static float LinearToDecibels(float linear)
        {
            // Map 0..1 linear volume to decibels with floor at -80 dB
            if (linear <= 0.0001f)
            {
                return -80f;
            }

            return 20f * Mathf.Log10(linear);
        }
    }
}