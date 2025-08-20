using System;

namespace MIFF.Audio
{
    /// <summary>
    /// Individual audio track for playback management
    /// Handles volume, scheduling, and playback state
    /// </summary>
    [Serializable]
    public class AudioTrack
    {
        [Header("Track Configuration")]
        public bool enableLooping = false;
        public bool enableFadeIn = true;
        public bool enableFadeOut = true;
        public bool enableVolumeRamping = true;
        
        [Header("Playback Settings")]
        public float fadeInTime = 0.1f;
        public float fadeOutTime = 0.1f;
        public float volumeRampTime = 0.05f;
        public float maxVolume = 1.0f;
        
        [Header("Remix Hooks")]
        public bool enableCustomFadeCurves = true;
        public bool enableCustomVolumeLogic = true;
        public bool enableCustomPlaybackHooks = true;
        
        // Track identity
        public string trackID;
        public AudioChannel channel;
        public string displayName;
        
        // Playback state
        private bool isPlaying;
        private bool isPaused;
        private bool isScheduled;
        private double startTime;
        private double scheduledTime;
        private double currentTime;
        private double duration;
        
        // Volume control
        private float currentVolume;
        private float targetVolume;
        private float volumeVelocity;
        private bool isVolumeRamping;
        
        // Fade control
        private float fadeStartTime;
        private float fadeEndTime;
        private float fadeStartVolume;
        private float fadeTargetVolume;
        private bool isFading;
        
        // Events for remixers to hook into
        public event Action<AudioTrack> OnPlaybackStarted;
        public event Action<AudioTrack> OnPlaybackStopped;
        public event Action<AudioTrack> OnPlaybackPaused;
        public event Action<AudioTrack> OnPlaybackResumed;
        public event Action<AudioTrack, float> OnVolumeChanged;
        public event Action<AudioTrack, double> OnScheduled;
        
        public AudioTrack(string trackID, AudioChannel channel)
        {
            this.trackID = trackID;
            this.channel = channel;
            this.displayName = trackID;
            
            InitializeTrack();
        }
        
        /// <summary>
        /// Initialize the track
        /// </summary>
        private void InitializeTrack()
        {
            isPlaying = false;
            isPaused = false;
            isScheduled = false;
            startTime = 0.0;
            scheduledTime = 0.0;
            currentTime = 0.0;
            duration = 0.0;
            
            currentVolume = 0.0f;
            targetVolume = 0.0f;
            volumeVelocity = 0.0f;
            isVolumeRamping = false;
            
            fadeStartTime = 0.0f;
            fadeEndTime = 0.0f;
            fadeStartVolume = 0.0f;
            fadeTargetVolume = 0.0f;
            isFading = false;
        }
        
        /// <summary>
        /// Start playback immediately
        /// </summary>
        public bool StartPlayback()
        {
            try
            {
                if (isPlaying)
                {
                    Console.WriteLine($"⚠️ Track {trackID} is already playing");
                    return false;
                }
                
                isPlaying = true;
                isPaused = false;
                isScheduled = false;
                startTime = GetCurrentTime();
                currentTime = 0.0;
                
                // Apply fade in if enabled
                if (enableFadeIn && fadeInTime > 0)
                {
                    StartFadeIn();
                }
                else
                {
                    currentVolume = targetVolume;
                }
                
                Console.WriteLine($"▶️ Started playback: {trackID}");
                OnPlaybackStarted?.Invoke(this);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error starting playback: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Stop playback
        /// </summary>
        public bool StopPlayback()
        {
            try
            {
                if (!isPlaying && !isScheduled)
                {
                    Console.WriteLine($"⚠️ Track {trackID} is not playing");
                    return false;
                }
                
                // Apply fade out if enabled
                if (enableFadeOut && fadeOutTime > 0 && isPlaying)
                {
                    StartFadeOut();
                    return true; // Will stop after fade completes
                }
                
                // Stop immediately
                isPlaying = false;
                isPaused = false;
                isScheduled = false;
                currentTime = 0.0;
                currentVolume = 0.0f;
                
                Console.WriteLine($"⏹️ Stopped playback: {trackID}");
                OnPlaybackStopped?.Invoke(this);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error stopping playback: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Pause playback
        /// </summary>
        public bool PausePlayback()
        {
            try
            {
                if (!isPlaying || isPaused)
                {
                    Console.WriteLine($"⚠️ Track {trackID} is not playing or already paused");
                    return false;
                }
                
                isPaused = true;
                
                Console.WriteLine($"⏸️ Paused playback: {trackID}");
                OnPlaybackPaused?.Invoke(this);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error pausing playback: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Resume playback
        /// </summary>
        public bool ResumePlayback()
        {
            try
            {
                if (!isPaused)
                {
                    Console.WriteLine($"⚠️ Track {trackID} is not paused");
                    return false;
                }
                
                isPaused = false;
                
                Console.WriteLine($"▶️ Resumed playback: {trackID}");
                OnPlaybackResumed?.Invoke(this);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error resuming playback: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Schedule playback for specific time
        /// </summary>
        public bool SchedulePlayback(double time)
        {
            try
            {
                if (time < 0)
                {
                    Console.WriteLine($"❌ Invalid schedule time: {time}");
                    return false;
                }
                
                isScheduled = true;
                scheduledTime = time;
                startTime = 0.0;
                currentTime = 0.0;
                
                Console.WriteLine($"⏰ Scheduled playback: {trackID} at {time:F3}s");
                OnScheduled?.Invoke(this, time);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error scheduling playback: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Set volume with optional ramping
        /// </summary>
        public bool SetVolume(float volume)
        {
            try
            {
                // Validate volume range
                volume = Math.Max(0.0f, Math.Min(maxVolume, volume));
                
                if (Math.Abs(volume - targetVolume) < 0.001f)
                {
                    return true; // No change needed
                }
                
                float oldVolume = targetVolume;
                targetVolume = volume;
                
                // Apply volume ramping if enabled
                if (enableVolumeRamping && volumeRampTime > 0)
                {
                    StartVolumeRamp(oldVolume, volume);
                }
                else
                {
                    currentVolume = volume;
                }
                
                Console.WriteLine($"🔊 Volume set: {trackID} to {volume:F2}");
                OnVolumeChanged?.Invoke(this, volume);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error setting volume: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Update track state
        /// </summary>
        public void UpdateTrack(float deltaTime)
        {
            try
            {
                if (!isPlaying && !isScheduled)
                    return;
                
                // Update current time
                if (isPlaying && !isPaused)
                {
                    currentTime += deltaTime;
                }
                
                // Check if scheduled playback should start
                if (isScheduled && GetCurrentTime() >= scheduledTime)
                {
                    StartPlayback();
                }
                
                // Update volume ramping
                if (isVolumeRamping)
                {
                    UpdateVolumeRamp(deltaTime);
                }
                
                // Update fade effects
                if (isFading)
                {
                    UpdateFade(deltaTime);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating track: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Start fade in effect
        /// </summary>
        private void StartFadeIn()
        {
            try
            {
                fadeStartTime = GetCurrentTime();
                fadeEndTime = fadeStartTime + fadeInTime;
                fadeStartVolume = 0.0f;
                fadeTargetVolume = targetVolume;
                isFading = true;
                
                currentVolume = 0.0f;
                
                Console.WriteLine($"🎭 Started fade in: {trackID} over {fadeInTime:F2}s");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error starting fade in: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Start fade out effect
        /// </summary>
        private void StartFadeOut()
        {
            try
            {
                fadeStartTime = GetCurrentTime();
                fadeEndTime = fadeStartTime + fadeOutTime;
                fadeStartVolume = currentVolume;
                fadeTargetVolume = 0.0f;
                isFading = true;
                
                Console.WriteLine($"🎭 Started fade out: {trackID} over {fadeOutTime:F2}s");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error starting fade out: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Start volume ramp
        /// </summary>
        private void StartVolumeRamp(float fromVolume, float toVolume)
        {
            try
            {
                volumeVelocity = (toVolume - fromVolume) / volumeRampTime;
                isVolumeRamping = true;
                
                Console.WriteLine($"🎚️ Started volume ramp: {trackID} from {fromVolume:F2} to {toVolume:F2}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error starting volume ramp: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update volume ramp
        /// </summary>
        private void UpdateVolumeRamp(float deltaTime)
        {
            try
            {
                if (!isVolumeRamping)
                    return;
                
                currentVolume += volumeVelocity * deltaTime;
                
                // Check if ramp is complete
                if ((volumeVelocity > 0 && currentVolume >= targetVolume) ||
                    (volumeVelocity < 0 && currentVolume <= targetVolume))
                {
                    currentVolume = targetVolume;
                    isVolumeRamping = false;
                    volumeVelocity = 0.0f;
                    
                    Console.WriteLine($"🎚️ Volume ramp complete: {trackID} at {currentVolume:F2}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating volume ramp: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update fade effect
        /// </summary>
        private void UpdateFade(float deltaTime)
        {
            try
            {
                if (!isFading)
                    return;
                
                float currentTime = GetCurrentTime();
                float fadeProgress = (currentTime - fadeStartTime) / (fadeEndTime - fadeStartTime);
                fadeProgress = Math.Max(0.0f, Math.Min(1.0f, fadeProgress));
                
                // Apply fade curve (linear for now, can be extended with custom curves)
                currentVolume = fadeStartVolume + (fadeTargetVolume - fadeStartVolume) * fadeProgress;
                
                // Check if fade is complete
                if (fadeProgress >= 1.0f)
                {
                    currentVolume = fadeTargetVolume;
                    isFading = false;
                    
                    Console.WriteLine($"🎭 Fade complete: {trackID} at {currentVolume:F2}");
                    
                    // If fade out completed, stop the track
                    if (fadeTargetVolume <= 0.001f)
                    {
                        StopPlayback();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating fade: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Get current time (placeholder for actual time system)
        /// </summary>
        private float GetCurrentTime()
        {
            // In a real implementation, this would get the actual DSP time
            // For now, we'll use a simple counter
            return (float)Environment.TickCount / 1000.0f;
        }
        
        /// <summary>
        /// Get track status
        /// </summary>
        public TrackStatus GetTrackStatus()
        {
            return new TrackStatus
            {
                trackID = trackID,
                channel = channel,
                isPlaying = isPlaying,
                isPaused = isPaused,
                isScheduled = isScheduled,
                currentTime = currentTime,
                scheduledTime = scheduledTime,
                currentVolume = currentVolume,
                targetVolume = targetVolume,
                isFading = isFading,
                isVolumeRamping = isVolumeRamping
            };
        }
        
        /// <summary>
        /// Get track summary
        /// </summary>
        public string GetTrackSummary()
        {
            var status = GetTrackStatus();
            string state = status.isScheduled ? "Scheduled" : 
                          status.isPaused ? "Paused" : 
                          status.isPlaying ? "Playing" : "Stopped";
            
            return $"{displayName} ({trackID}) | {channel} | {state} | " +
                   $"Volume: {status.currentVolume:F2} | Time: {status.currentTime:F2}s";
        }
    }
    
    /// <summary>
    /// Track status information
    /// </summary>
    [Serializable]
    public class TrackStatus
    {
        public string trackID;
        public AudioChannel channel;
        public bool isPlaying;
        public bool isPaused;
        public bool isScheduled;
        public double currentTime;
        public double scheduledTime;
        public float currentVolume;
        public float targetVolume;
        public bool isFading;
        public bool isVolumeRamping;
        
        public override string ToString()
        {
            string state = isScheduled ? "Scheduled" : 
                          isPaused ? "Paused" : 
                          isPlaying ? "Playing" : "Stopped";
            
            return $"{trackID} | {channel} | {state} | Volume: {currentVolume:F2}";
        }
    }
}