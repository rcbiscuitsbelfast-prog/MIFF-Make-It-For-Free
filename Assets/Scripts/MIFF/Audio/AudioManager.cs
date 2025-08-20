using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Audio
{
    /// <summary>
    /// Central audio manager for K-pop spirit battle game
    /// Manages BGM, SFX, and stem playback with remix-safe architecture
    /// </summary>
    [Serializable]
    public class AudioManager
    {
        [Header("Audio Configuration")]
        public bool enableAudio = true;
        public bool enableStemSync = true;
        public bool enableFadeEffects = true;
        public bool enableCrossfade = true;
        
        [Header("Volume Settings")]
        public float masterVolume = 1.0f;
        public float bgmVolume = 0.8f;
        public float sfxVolume = 1.0f;
        public float stemVolume = 0.9f;
        
        [Header("Audio Quality")]
        public bool enableHighQuality = true;
        public bool enableCompression = false;
        public int maxConcurrentSFX = 16;
        public int maxConcurrentStems = 8;
        
        [Header("Remix Hooks")]
        public bool enableCustomAudioProcessors = true;
        public bool enableCustomFadeCurves = true;
        public bool enableCustomStemLogic = true;
        
        // Singleton instance
        private static AudioManager _instance;
        public static AudioManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new AudioManager();
                }
                return _instance;
            }
        }
        
        // Core components
        private AudioClipRegistry audioRegistry;
        private Dictionary<AudioChannel, float> channelVolumes;
        private Dictionary<string, AudioTrack> activeTracks;
        private Queue<AudioRequest> audioQueue;
        private StemSyncHelper stemSyncHelper;
        
        // Audio state tracking
        private string currentBGM;
        private List<string> activeSFX;
        private List<string> activeStems;
        private bool isAudioEnabled;
        private DateTime lastAudioUpdate;
        
        // Events for remixers to hook into
        public event Action<AudioManager, string> OnBGMStarted;
        public event Action<AudioManager, string> OnBGMStopped;
        public event Action<AudioManager, string> OnSFXPlayed;
        public event Action<AudioManager, string> OnStemPlayed;
        public event Action<AudioManager, AudioChannel, float> OnVolumeChanged;
        public event Action<AudioManager, string> OnAudioError;
        
        public AudioManager()
        {
            InitializeAudioManager();
        }
        
        /// <summary>
        /// Initialize the audio manager
        /// </summary>
        private void InitializeAudioManager()
        {
            audioRegistry = new AudioClipRegistry();
            stemSyncHelper = new StemSyncHelper();
            
            // Initialize channel volumes
            channelVolumes = new Dictionary<AudioChannel, float>
            {
                { AudioChannel.BGM, bgmVolume },
                { AudioChannel.SFX, sfxVolume },
                { AudioChannel.Stem, stemVolume }
            };
            
            // Initialize tracking collections
            activeTracks = new Dictionary<string, AudioTrack>();
            audioQueue = new Queue<AudioRequest>();
            activeSFX = new List<string>();
            activeStems = new List<string>();
            
            isAudioEnabled = enableAudio;
            lastAudioUpdate = DateTime.Now;
            
            // Populate registry with sample audio
            PopulateSampleAudio();
            
            Console.WriteLine("🎵 AudioManager initialized successfully");
        }
        
        /// <summary>
        /// Play background music track
        /// </summary>
        public bool PlayBGM(string trackID)
        {
            if (!isAudioEnabled || string.IsNullOrEmpty(trackID))
            {
                Console.WriteLine($"❌ Cannot play BGM: {trackID}");
                return false;
            }
            
            try
            {
                // Check if track exists in registry
                if (!audioRegistry.HasAudioClip(trackID))
                {
                    Console.WriteLine($"❌ BGM track not found: {trackID}");
                    OnAudioError?.Invoke(this, $"BGM track not found: {trackID}");
                    return false;
                }
                
                // Stop current BGM if playing
                if (!string.IsNullOrEmpty(currentBGM))
                {
                    StopBGM();
                }
                
                // Start new BGM
                currentBGM = trackID;
                var track = new AudioTrack(trackID, AudioChannel.BGM);
                activeTracks[trackID] = track;
                
                // Apply volume
                float finalVolume = masterVolume * channelVolumes[AudioChannel.BGM];
                track.SetVolume(finalVolume);
                
                // Start playback
                track.StartPlayback();
                
                Console.WriteLine($"🎵 Playing BGM: {trackID} at volume {finalVolume:F2}");
                OnBGMStarted?.Invoke(this, trackID);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error playing BGM {trackID}: {ex.Message}");
                OnAudioError?.Invoke(this, $"Error playing BGM {trackID}: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Stop current background music
        /// </summary>
        public bool StopBGM()
        {
            if (string.IsNullOrEmpty(currentBGM))
            {
                Console.WriteLine("❌ No BGM currently playing");
                return false;
            }
            
            try
            {
                string stoppedTrack = currentBGM;
                
                // Stop the track
                if (activeTracks.ContainsKey(currentBGM))
                {
                    activeTracks[currentBGM].StopPlayback();
                    activeTracks.Remove(currentBGM);
                }
                
                currentBGM = null;
                
                Console.WriteLine($"🎵 Stopped BGM: {stoppedTrack}");
                OnBGMStopped?.Invoke(this, stoppedTrack);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error stopping BGM: {ex.Message}");
                OnAudioError?.Invoke(this, $"Error stopping BGM: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Play sound effect
        /// </summary>
        public bool PlaySFX(string sfxID)
        {
            if (!isAudioEnabled || string.IsNullOrEmpty(sfxID))
            {
                Console.WriteLine($"❌ Cannot play SFX: {sfxID}");
                return false;
            }
            
            try
            {
                // Check if SFX exists in registry
                if (!audioRegistry.HasAudioClip(sfxID))
                {
                    Console.WriteLine($"❌ SFX not found: {sfxID}");
                    OnAudioError?.Invoke(this, $"SFX not found: {sfxID}");
                    return false;
                }
                
                // Check concurrent SFX limit
                if (activeSFX.Count >= maxConcurrentSFX)
                {
                    Console.WriteLine($"⚠️ Max concurrent SFX reached, removing oldest: {activeSFX[0]}");
                    activeSFX.RemoveAt(0);
                }
                
                // Create and start SFX track
                var track = new AudioTrack(sfxID, AudioChannel.SFX);
                activeTracks[sfxID] = track;
                activeSFX.Add(sfxID);
                
                // Apply volume
                float finalVolume = masterVolume * channelVolumes[AudioChannel.SFX];
                track.SetVolume(finalVolume);
                
                // Start playback
                track.StartPlayback();
                
                Console.WriteLine($"🔊 Playing SFX: {sfxID} at volume {finalVolume:F2}");
                OnSFXPlayed?.Invoke(this, sfxID);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error playing SFX {sfxID}: {ex.Message}");
                OnAudioError?.Invoke(this, $"Error playing SFX {sfxID}: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Play stem with precise timing synchronization
        /// </summary>
        public bool PlayStemSynced(string stemID, double dspTime)
        {
            if (!isAudioEnabled || !enableStemSync || string.IsNullOrEmpty(stemID))
            {
                Console.WriteLine($"❌ Cannot play stem: {stemID}");
                return false;
            }
            
            try
            {
                // Check if stem exists in registry
                if (!audioRegistry.HasAudioClip(stemID))
                {
                    Console.WriteLine($"❌ Stem not found: {stemID}");
                    OnAudioError?.Invoke(this, $"Stem not found: {stemID}");
                    return false;
                }
                
                // Check concurrent stem limit
                if (activeStems.Count >= maxConcurrentStems)
                {
                    Console.WriteLine($"⚠️ Max concurrent stems reached, removing oldest: {activeStems[0]}");
                    activeStems.RemoveAt(0);
                }
                
                // Calculate actual start time
                double actualStartTime = stemSyncHelper.GetNextBarTime(dspTime, 120.0); // Default BPM
                
                // Create and schedule stem track
                var track = new AudioTrack(stemID, AudioChannel.Stem);
                track.SchedulePlayback(actualStartTime);
                activeTracks[stemID] = track;
                activeStems.Add(stemID);
                
                // Apply volume
                float finalVolume = masterVolume * channelVolumes[AudioChannel.Stem];
                track.SetVolume(finalVolume);
                
                Console.WriteLine($"🎼 Scheduled stem: {stemID} at {actualStartTime:F3}s (volume: {finalVolume:F2})");
                OnStemPlayed?.Invoke(this, stemID);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error playing stem {stemID}: {ex.Message}");
                OnAudioError?.Invoke(this, $"Error playing stem {stemID}: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Set volume for specific audio channel
        /// </summary>
        public bool SetVolume(AudioChannel channel, float volume)
        {
            try
            {
                // Validate volume range
                volume = Math.Max(0.0f, Math.Min(1.0f, volume));
                
                // Update channel volume
                channelVolumes[channel] = volume;
                
                // Update master volume for specific channel
                switch (channel)
                {
                    case AudioChannel.BGM:
                        bgmVolume = volume;
                        break;
                    case AudioChannel.SFX:
                        sfxVolume = volume;
                        break;
                    case AudioChannel.Stem:
                        stemVolume = volume;
                        break;
                }
                
                // Update active tracks for this channel
                UpdateChannelVolume(channel);
                
                Console.WriteLine($"🔊 {channel} volume set to {volume:F2}");
                OnVolumeChanged?.Invoke(this, channel, volume);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error setting {channel} volume: {ex.Message}");
                OnAudioError?.Invoke(this, $"Error setting {channel} volume: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Set master volume
        /// </summary>
        public bool SetMasterVolume(float volume)
        {
            try
            {
                // Validate volume range
                volume = Math.Max(0.0f, Math.Min(1.0f, volume));
                
                masterVolume = volume;
                
                // Update all active tracks
                foreach (var track in activeTracks.Values)
                {
                    float channelVolume = channelVolumes[track.Channel];
                    float finalVolume = masterVolume * channelVolume;
                    track.SetVolume(finalVolume);
                }
                
                Console.WriteLine($"🔊 Master volume set to {volume:F2}");
                OnVolumeChanged?.Invoke(this, AudioChannel.BGM, volume); // Trigger event for master change
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error setting master volume: {ex.Message}");
                OnAudioError?.Invoke(this, $"Error setting master volume: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Stop all audio
        /// </summary>
        public bool StopAllAudio()
        {
            try
            {
                // Stop all active tracks
                foreach (var track in activeTracks.Values)
                {
                    track.StopPlayback();
                }
                
                // Clear tracking collections
                activeTracks.Clear();
                activeSFX.Clear();
                activeStems.Clear();
                currentBGM = null;
                
                Console.WriteLine("🔇 All audio stopped");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error stopping all audio: {ex.Message}");
                OnAudioError?.Invoke(this, $"Error stopping all audio: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Get current audio status
        /// </summary>
        public AudioStatus GetAudioStatus()
        {
            return new AudioStatus
            {
                isAudioEnabled = isAudioEnabled,
                masterVolume = masterVolume,
                channelVolumes = new Dictionary<AudioChannel, float>(channelVolumes),
                currentBGM = currentBGM,
                activeSFXCount = activeSFX.Count,
                activeStemsCount = activeStems.Count,
                totalActiveTracks = activeTracks.Count,
                lastUpdate = lastAudioUpdate
            };
        }
        
        /// <summary>
        /// Update channel volume for active tracks
        /// </summary>
        private void UpdateChannelVolume(AudioChannel channel)
        {
            foreach (var track in activeTracks.Values)
            {
                if (track.Channel == channel)
                {
                    float finalVolume = masterVolume * channelVolumes[channel];
                    track.SetVolume(finalVolume);
                }
            }
        }
        
        /// <summary>
        /// Populate registry with sample audio
        /// </summary>
        private void PopulateSampleAudio()
        {
            try
            {
                // Sample BGM tracks
                audioRegistry.RegisterAudioClip("bgm_main_theme", "Main Theme", AudioChannel.BGM, 120.0);
                audioRegistry.RegisterAudioClip("bgm_battle_intense", "Battle Intense", AudioChannel.BGM, 140.0);
                audioRegistry.RegisterAudioClip("bgm_victory", "Victory Fanfare", AudioChannel.BGM, 100.0);
                audioRegistry.RegisterAudioClip("bgm_defeat", "Defeat Melody", AudioChannel.BGM, 80.0);
                
                // Sample SFX
                audioRegistry.RegisterAudioClip("sfx_button_click", "Button Click", AudioChannel.SFX, 0.0);
                audioRegistry.RegisterAudioClip("sfx_spirit_attack", "Spirit Attack", AudioChannel.SFX, 0.0);
                audioRegistry.RegisterAudioClip("sfx_spirit_hit", "Spirit Hit", AudioChannel.SFX, 0.0);
                audioRegistry.RegisterAudioClip("sfx_evolution", "Evolution", AudioChannel.SFX, 0.0);
                audioRegistry.RegisterAudioClip("sfx_capture", "Capture", AudioChannel.SFX, 0.0);
                
                // Sample stems
                audioRegistry.RegisterAudioClip("stem_drums", "Drum Stem", AudioChannel.Stem, 120.0);
                audioRegistry.RegisterAudioClip("stem_bass", "Bass Stem", AudioChannel.Stem, 120.0);
                audioRegistry.RegisterAudioClip("stem_melody", "Melody Stem", AudioChannel.Stem, 120.0);
                audioRegistry.RegisterAudioClip("stem_harmony", "Harmony Stem", AudioChannel.Stem, 120.0);
                
                Console.WriteLine($"🎵 Registered {audioRegistry.GetTotalClips()} audio clips");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error populating sample audio: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Process audio queue
        /// </summary>
        public void ProcessAudioQueue()
        {
            try
            {
                while (audioQueue.Count > 0)
                {
                    var request = audioQueue.Dequeue();
                    
                    switch (request.Channel)
                    {
                        case AudioChannel.BGM:
                            PlayBGM(request.AudioID);
                            break;
                        case AudioChannel.SFX:
                            PlaySFX(request.AudioID);
                            break;
                        case AudioChannel.Stem:
                            PlayStemSynced(request.AudioID, request.ScheduledTime);
                            break;
                    }
                }
                
                lastAudioUpdate = DateTime.Now;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error processing audio queue: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Queue audio request for later processing
        /// </summary>
        public void QueueAudioRequest(AudioRequest request)
        {
            if (request != null)
            {
                audioQueue.Enqueue(request);
            }
        }
        
        /// <summary>
        /// Get audio manager summary
        /// </summary>
        public string GetAudioManagerSummary()
        {
            var status = GetAudioStatus();
            return $"Audio Manager | BGM: {status.currentBGM ?? "None"} | " +
                   $"SFX: {status.activeSFXCount} | Stems: {status.activeStemsCount} | " +
                   $"Master: {status.masterVolume:F2} | Total Tracks: {status.totalActiveTracks}";
        }
    }
    
    /// <summary>
    /// Audio status information
    /// </summary>
    [Serializable]
    public class AudioStatus
    {
        public bool isAudioEnabled;
        public float masterVolume;
        public Dictionary<AudioChannel, float> channelVolumes;
        public string currentBGM;
        public int activeSFXCount;
        public int activeStemsCount;
        public int totalActiveTracks;
        public DateTime lastUpdate;
        
        public override string ToString()
        {
            return $"Audio Enabled: {isAudioEnabled}, Master: {masterVolume:F2}, " +
                   $"BGM: {currentBGM ?? "None"}, SFX: {activeSFXCount}, Stems: {activeStemsCount}";
        }
    }
    
    /// <summary>
    /// Audio request for queuing
    /// </summary>
    [Serializable]
    public class AudioRequest
    {
        public string AudioID;
        public AudioChannel Channel;
        public double ScheduledTime;
        public float Volume;
        public bool Loop;
        
        public AudioRequest(string audioID, AudioChannel channel, double scheduledTime = 0.0, float volume = 1.0f, bool loop = false)
        {
            AudioID = audioID;
            Channel = channel;
            ScheduledTime = scheduledTime;
            Volume = volume;
            Loop = loop;
        }
    }
}