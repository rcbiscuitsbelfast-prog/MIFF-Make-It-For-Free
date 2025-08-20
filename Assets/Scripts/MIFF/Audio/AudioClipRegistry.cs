using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Audio
{
    /// <summary>
    /// Registry for mapping string IDs to AudioClip references
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class AudioClipRegistry
    {
        [Header("Registry Configuration")]
        public bool enableAutoValidation = true;
        public bool enableDuplicatePrevention = true;
        public bool enableMetadataTracking = true;
        public bool enableRemixHooks = true;
        
        [Header("Audio Management")]
        public bool enableAudioCompression = false;
        public bool enableAudioCaching = true;
        public bool enableStreaming = false;
        public int maxRegisteredClips = 1000;
        
        [Header("Remix Hooks")]
        public bool enableCustomValidation = true;
        public bool enableCustomMetadata = true;
        public bool enableCustomCategories = true;
        
        // Core storage
        private Dictionary<string, AudioClipData> audioClips;
        private Dictionary<AudioChannel, List<string>> channelIndex;
        private Dictionary<string, List<string>> categoryIndex;
        private Dictionary<double, List<string>> bpmIndex;
        
        // Statistics and tracking
        private RegistryStats statistics;
        private DateTime lastUpdated;
        private string lastUpdatedBy;
        
        // Events for remixers to hook into
        public event Action<AudioClipRegistry, AudioClipData> OnClipRegistered;
        public event Action<AudioClipRegistry, AudioClipData> OnClipRemoved;
        public event Action<AudioClipRegistry, AudioClipData> OnClipUpdated;
        public event Action<AudioClipRegistry, string> OnValidationError;
        
        public AudioClipRegistry()
        {
            InitializeRegistry();
        }
        
        /// <summary>
        /// Initialize the registry
        /// </summary>
        private void InitializeRegistry()
        {
            audioClips = new Dictionary<string, AudioClipData>();
            channelIndex = new Dictionary<AudioChannel, List<string>>();
            categoryIndex = new Dictionary<string, List<string>>();
            bpmIndex = new Dictionary<double, List<string>>();
            
            statistics = new RegistryStats();
            lastUpdated = DateTime.Now;
            lastUpdatedBy = "System";
            
            // Initialize indices
            InitializeIndices();
            
            Console.WriteLine("🎵 AudioClipRegistry initialized successfully");
        }
        
        /// <summary>
        /// Initialize search and filter indices
        /// </summary>
        private void InitializeIndices()
        {
            // Initialize channel index
            foreach (AudioChannel channel in Enum.GetValues(typeof(AudioChannel)))
            {
                channelIndex[channel] = new List<string>();
            }
            
            // Initialize category index with common categories
            var commonCategories = new[] { "BGM", "SFX", "Stem", "Voice", "Ambient", "UI", "Battle", "Menu" };
            foreach (var category in commonCategories)
            {
                categoryIndex[category] = new List<string>();
            }
        }
        
        /// <summary>
        /// Register a new audio clip
        /// </summary>
        public bool RegisterAudioClip(string clipID, string displayName, AudioChannel channel, double bpm = 0.0)
        {
            if (string.IsNullOrEmpty(clipID) || string.IsNullOrEmpty(displayName))
            {
                Console.WriteLine("❌ Invalid clip ID or display name");
                return false;
            }
            
            try
            {
                // Check if clip already exists
                if (audioClips.ContainsKey(clipID))
                {
                    if (enableDuplicatePrevention)
                    {
                        Console.WriteLine($"⚠️ Audio clip already exists: {clipID}");
                        return false;
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ Updating existing audio clip: {clipID}");
                        return UpdateAudioClip(clipID, displayName, channel, bpm);
                    }
                }
                
                // Check registry capacity
                if (audioClips.Count >= maxRegisteredClips)
                {
                    Console.WriteLine($"❌ Registry capacity reached ({maxRegisteredClips})");
                    return false;
                }
                
                // Create audio clip data
                var clipData = new AudioClipData(clipID, displayName, channel, bpm)
                {
                    registrationDate = DateTime.Now,
                    lastUpdatedBy = lastUpdatedBy
                };
                
                // Validate if enabled
                if (enableAutoValidation && !ValidateAudioClip(clipData))
                {
                    Console.WriteLine($"❌ Audio clip validation failed: {clipID}");
                    return false;
                }
                
                // Add to main storage
                audioClips[clipID] = clipData;
                
                // Update indices
                UpdateChannelIndex(clipData);
                UpdateCategoryIndex(clipData);
                UpdateBPMIndex(clipData);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                lastUpdatedBy = "System";
                
                // Trigger event
                OnClipRegistered?.Invoke(this, clipData);
                
                Console.WriteLine($"🎵 Registered audio clip: {displayName} ({clipID}) | Channel: {channel} | BPM: {bpm:F1}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error registering audio clip: {ex.Message}");
                OnValidationError?.Invoke(this, $"Error registering audio clip: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Update existing audio clip
        /// </summary>
        public bool UpdateAudioClip(string clipID, string displayName, AudioChannel channel, double bpm = 0.0)
        {
            if (string.IsNullOrEmpty(clipID) || !audioClips.ContainsKey(clipID))
            {
                Console.WriteLine($"❌ Audio clip not found: {clipID}");
                return false;
            }
            
            try
            {
                var existingClip = audioClips[clipID];
                
                // Update clip data
                existingClip.displayName = displayName;
                existingClip.channel = channel;
                existingClip.bpm = bpm;
                existingClip.lastUpdated = DateTime.Now;
                existingClip.lastUpdatedBy = lastUpdatedBy;
                
                // Validate if enabled
                if (enableAutoValidation && !ValidateAudioClip(existingClip))
                {
                    Console.WriteLine($"❌ Audio clip validation failed after update: {clipID}");
                    return false;
                }
                
                // Update indices
                UpdateChannelIndex(existingClip);
                UpdateCategoryIndex(existingClip);
                UpdateBPMIndex(existingClip);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                
                // Trigger event
                OnClipUpdated?.Invoke(this, existingClip);
                
                Console.WriteLine($"🎵 Updated audio clip: {displayName} ({clipID})");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating audio clip: {ex.Message}");
                OnValidationError?.Invoke(this, $"Error updating audio clip: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Remove audio clip
        /// </summary>
        public bool RemoveAudioClip(string clipID)
        {
            if (string.IsNullOrEmpty(clipID) || !audioClips.ContainsKey(clipID))
            {
                Console.WriteLine($"❌ Audio clip not found: {clipID}");
                return false;
            }
            
            try
            {
                var clipData = audioClips[clipID];
                
                // Remove from main storage
                audioClips.Remove(clipID);
                
                // Remove from indices
                RemoveFromChannelIndex(clipData);
                RemoveFromCategoryIndex(clipData);
                RemoveFromBPMIndex(clipData);
                
                // Update statistics
                UpdateStatistics();
                
                // Update timestamps
                lastUpdated = DateTime.Now;
                lastUpdatedBy = "System";
                
                // Trigger event
                OnClipRemoved?.Invoke(this, clipData);
                
                Console.WriteLine($"🎵 Removed audio clip: {clipData.displayName} ({clipID})");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error removing audio clip: {ex.Message}");
                OnValidationError?.Invoke(this, $"Error removing audio clip: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Check if audio clip exists
        /// </summary>
        public bool HasAudioClip(string clipID)
        {
            return !string.IsNullOrEmpty(clipID) && audioClips.ContainsKey(clipID);
        }
        
        /// <summary>
        /// Get audio clip by ID
        /// </summary>
        public AudioClipData GetAudioClip(string clipID)
        {
            if (string.IsNullOrEmpty(clipID) || !audioClips.ContainsKey(clipID))
                return null;
            
            return audioClips[clipID];
        }
        
        /// <summary>
        /// Get all audio clips
        /// </summary>
        public List<AudioClipData> GetAllAudioClips()
        {
            return audioClips.Values.ToList();
        }
        
        /// <summary>
        /// Get audio clips by channel
        /// </summary>
        public List<AudioClipData> GetAudioClipsByChannel(AudioChannel channel)
        {
            if (!channelIndex.ContainsKey(channel))
                return new List<AudioClipData>();
            
            var clipIDs = channelIndex[channel];
            return clipIDs.Select(id => audioClips[id]).ToList();
        }
        
        /// <summary>
        /// Get audio clips by category
        /// </summary>
        public List<AudioClipData> GetAudioClipsByCategory(string category)
        {
            if (string.IsNullOrEmpty(category) || !categoryIndex.ContainsKey(category))
                return new List<AudioClipData>();
            
            var clipIDs = categoryIndex[category];
            return clipIDs.Select(id => audioClips[id]).ToList();
        }
        
        /// <summary>
        /// Get audio clips by BPM
        /// </summary>
        public List<AudioClipData> GetAudioClipsByBPM(double bpm, double tolerance = 5.0)
        {
            var results = new List<AudioClipData>();
            
            foreach (var kvp in bpmIndex)
            {
                if (Math.Abs(kvp.Key - bpm) <= tolerance)
                {
                    var clipIDs = kvp.Value;
                    results.AddRange(clipIDs.Select(id => audioClips[id]));
                }
            }
            
            return results;
        }
        
        /// <summary>
        /// Search audio clips by text
        /// </summary>
        public List<AudioClipData> SearchAudioClips(string searchTerm, int maxResults = -1)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return new List<AudioClipData>();
            
            try
            {
                var results = new List<AudioClipData>();
                searchTerm = searchTerm.ToLower();
                
                // Search in various fields
                foreach (var clip in audioClips.Values)
                {
                    bool matches = false;
                    
                    // Search in core fields
                    if (clip.clipID.ToLower().Contains(searchTerm) ||
                        clip.displayName.ToLower().Contains(searchTerm))
                    {
                        matches = true;
                    }
                    
                    // Search in category
                    if (!matches && clip.category?.ToLower().Contains(searchTerm) == true)
                    {
                        matches = true;
                    }
                    
                    // Search in tags
                    if (!matches && clip.tags.Any(t => t.ToLower().Contains(searchTerm)))
                    {
                        matches = true;
                    }
                    
                    if (matches)
                    {
                        results.Add(clip);
                        
                        // Check max results
                        if (maxResults > 0 && results.Count >= maxResults)
                            break;
                    }
                }
                
                return results;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error searching audio clips: {ex.Message}");
                return new List<AudioClipData>();
            }
        }
        
        /// <summary>
        /// Get total number of registered clips
        /// </summary>
        public int GetTotalClips()
        {
            return audioClips.Count;
        }
        
        /// <summary>
        /// Get registry statistics
        /// </summary>
        public RegistryStats GetStatistics()
        {
            UpdateStatistics();
            return statistics;
        }
        
        /// <summary>
        /// Update channel index
        /// </summary>
        private void UpdateChannelIndex(AudioClipData clipData)
        {
            try
            {
                // Remove old entries
                RemoveFromChannelIndex(clipData);
                
                // Add to channel
                if (channelIndex.ContainsKey(clipData.channel))
                {
                    if (!channelIndex[clipData.channel].Contains(clipData.clipID))
                        channelIndex[clipData.channel].Add(clipData.clipID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating channel index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Remove from channel index
        /// </summary>
        private void RemoveFromChannelIndex(AudioClipData clipData)
        {
            try
            {
                if (channelIndex.ContainsKey(clipData.channel))
                {
                    channelIndex[clipData.channel].Remove(clipData.clipID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error removing from channel index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update category index
        /// </summary>
        private void UpdateCategoryIndex(AudioClipData clipData)
        {
            try
            {
                // Remove old entries
                RemoveFromCategoryIndex(clipData);
                
                // Add to category
                if (!string.IsNullOrEmpty(clipData.category))
                {
                    if (!categoryIndex.ContainsKey(clipData.category))
                        categoryIndex[clipData.category] = new List<string>();
                    
                    if (!categoryIndex[clipData.category].Contains(clipData.clipID))
                        categoryIndex[clipData.category].Add(clipData.clipID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating category index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Remove from category index
        /// </summary>
        private void RemoveFromCategoryIndex(AudioClipData clipData)
        {
            try
            {
                if (!string.IsNullOrEmpty(clipData.category) && categoryIndex.ContainsKey(clipData.category))
                {
                    categoryIndex[clipData.category].Remove(clipData.clipID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error removing from category index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update BPM index
        /// </summary>
        private void UpdateBPMIndex(AudioClipData clipData)
        {
            try
            {
                // Remove old entries
                RemoveFromBPMIndex(clipData);
                
                // Add to BPM
                if (clipData.bpm > 0)
                {
                    if (!bpmIndex.ContainsKey(clipData.bpm))
                        bpmIndex[clipData.bpm] = new List<string>();
                    
                    if (!bpmIndex[clipData.bpm].Contains(clipData.clipID))
                        bpmIndex[clipData.bpm].Add(clipData.clipID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating BPM index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Remove from BPM index
        /// </summary>
        private void RemoveFromBPMIndex(AudioClipData clipData)
        {
            try
            {
                if (clipData.bpm > 0 && bpmIndex.ContainsKey(clipData.bpm))
                {
                    bpmIndex[clipData.bpm].Remove(clipData.clipID);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error removing from BPM index: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Update statistics
        /// </summary>
        private void UpdateStatistics()
        {
            if (!enableMetadataTracking) return;
            
            try
            {
                statistics.totalClips = audioClips.Count;
                statistics.clipsByChannel = new Dictionary<AudioChannel, int>();
                statistics.clipsByCategory = new Dictionary<string, int>();
                statistics.clipsByBPM = new Dictionary<double, int>();
                
                // Count by channel
                foreach (var kvp in channelIndex)
                {
                    statistics.clipsByChannel[kvp.Key] = kvp.Value.Count;
                }
                
                // Count by category
                foreach (var kvp in categoryIndex)
                {
                    statistics.clipsByCategory[kvp.Key] = kvp.Value.Count;
                }
                
                // Count by BPM
                foreach (var kvp in bpmIndex)
                {
                    statistics.clipsByBPM[kvp.Key] = kvp.Value.Count;
                }
                
                // Calculate channel distribution
                statistics.channelDistribution = new Dictionary<AudioChannel, float>();
                foreach (var kvp in statistics.clipsByChannel)
                {
                    statistics.channelDistribution[kvp.Key] = (float)kvp.Value / statistics.totalClips * 100.0f;
                }
                
                statistics.lastUpdated = DateTime.Now;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating statistics: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Validate audio clip data
        /// </summary>
        private bool ValidateAudioClip(AudioClipData clipData)
        {
            try
            {
                // Basic validation
                if (string.IsNullOrEmpty(clipData.clipID)) return false;
                if (string.IsNullOrEmpty(clipData.displayName)) return false;
                
                // BPM validation
                if (clipData.bpm < 0) return false;
                if (clipData.bpm > 300) return false; // Reasonable BPM range
                
                // Category validation
                if (!string.IsNullOrEmpty(clipData.category))
                {
                    if (clipData.category.Length > 50) return false; // Reasonable length
                }
                
                return true;
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Get registry summary
        /// </summary>
        public string GetRegistrySummary()
        {
            var stats = GetStatistics();
            return $"Audio Registry | Clips: {stats.totalClips} | " +
                   $"Channels: {stats.clipsByChannel.Count} | Categories: {stats.clipsByCategory.Count} | " +
                   $"BPMs: {stats.clipsByBPM.Count}";
        }
    }
    
    /// <summary>
    /// Audio clip data structure
    /// </summary>
    [Serializable]
    public class AudioClipData
    {
        public string clipID;
        public string displayName;
        public AudioChannel channel;
        public double bpm;
        public string category;
        public List<string> tags;
        public DateTime registrationDate;
        public DateTime lastUpdated;
        public string lastUpdatedBy;
        
        public AudioClipData(string clipID, string displayName, AudioChannel channel, double bpm)
        {
            this.clipID = clipID;
            this.displayName = displayName;
            this.channel = channel;
            this.bpm = bpm;
            this.category = GetDefaultCategory(channel);
            this.tags = new List<string>();
            this.registrationDate = DateTime.Now;
            this.lastUpdated = DateTime.Now;
            this.lastUpdatedBy = "System";
        }
        
        /// <summary>
        /// Get default category based on channel
        /// </summary>
        private string GetDefaultCategory(AudioChannel channel)
        {
            return channel switch
            {
                AudioChannel.BGM => "BGM",
                AudioChannel.SFX => "SFX",
                AudioChannel.Stem => "Stem",
                _ => "Unknown"
            };
        }
        
        /// <summary>
        /// Add custom tag
        /// </summary>
        public void AddTag(string tag)
        {
            if (!string.IsNullOrEmpty(tag) && !tags.Contains(tag))
            {
                tags.Add(tag);
            }
        }
        
        /// <summary>
        /// Remove custom tag
        /// </summary>
        public void RemoveTag(string tag)
        {
            tags.Remove(tag);
        }
        
        /// <summary>
        /// Check if has tag
        /// </summary>
        public bool HasTag(string tag)
        {
            return tags.Contains(tag);
        }
        
        public override string ToString()
        {
            return $"{displayName} ({clipID}) | {channel} | BPM: {bpm:F1}";
        }
    }
    
    /// <summary>
    /// Statistics for AudioClipRegistry
    /// </summary>
    [Serializable]
    public class RegistryStats
    {
        public int totalClips;
        
        public Dictionary<AudioChannel, int> clipsByChannel;
        public Dictionary<string, int> clipsByCategory;
        public Dictionary<double, int> clipsByBPM;
        
        public Dictionary<AudioChannel, float> channelDistribution;
        
        public DateTime lastUpdated;
        
        public override string ToString()
        {
            return $"Total Clips: {totalClips}";
        }
    }
}