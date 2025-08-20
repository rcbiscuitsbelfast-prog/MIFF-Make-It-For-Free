using System;

namespace MIFF.Audio
{
    /// <summary>
    /// Helper class for synchronizing audio stems with musical timing
    /// Calculates bar boundaries and musical grid alignment
    /// </summary>
    [Serializable]
    public class StemSyncHelper
    {
        [Header("Sync Configuration")]
        public bool enablePreciseSync = true;
        public bool enableBarAlignment = true;
        public bool enableBeatAlignment = true;
        public bool enableSubdivisionAlignment = false;
        
        [Header("Musical Settings")]
        public double defaultBPM = 120.0;
        public int defaultTimeSignature = 4; // 4/4 time
        public int defaultSubdivision = 4; // Quarter note subdivision
        public double syncTolerance = 0.001; // 1ms tolerance
        
        [Header("Advanced Options")]
        public bool enableTempoChanges = true;
        public bool enableTimeSignatureChanges = true;
        public bool enableGrooveQuantization = false;
        public double grooveStrength = 0.5;
        
        [Header("Remix Hooks")]
        public bool enableCustomTimeSignatures = true;
        public bool enableCustomSubdivisions = true;
        public bool enableCustomGroovePatterns = true;
        
        // Musical timing calculations
        private double beatsPerBar;
        private double secondsPerBeat;
        private double secondsPerBar;
        
        // Events for remixers to hook into
        public event Action<StemSyncHelper, double> OnBarBoundaryCalculated;
        public event Action<StemSyncHelper, double> OnBeatBoundaryCalculated;
        public event Action<StemSyncHelper, double> OnSubdivisionCalculated;
        
        public StemSyncHelper()
        {
            InitializeSyncHelper();
        }
        
        /// <summary>
        /// Initialize the sync helper
        /// </summary>
        private void InitializeSyncHelper()
        {
            UpdateMusicalTiming(defaultBPM, defaultTimeSignature, defaultSubdivision);
            Console.WriteLine("🎼 StemSyncHelper initialized successfully");
        }
        
        /// <summary>
        /// Calculate the next bar boundary time
        /// </summary>
        public double GetNextBarTime(double currentTime, double bpm)
        {
            try
            {
                if (bpm <= 0)
                {
                    bpm = defaultBPM;
                }
                
                // Update musical timing for this BPM
                UpdateMusicalTiming(bpm, defaultTimeSignature, defaultSubdivision);
                
                // Calculate current position in musical time
                double currentBar = currentTime / secondsPerBar;
                double nextBar = Math.Ceiling(currentBar);
                double nextBarTime = nextBar * secondsPerBar;
                
                // Apply sync tolerance if enabled
                if (enablePreciseSync)
                {
                    nextBarTime = ApplySyncTolerance(nextBarTime, currentTime);
                }
                
                Console.WriteLine($"🎼 Next bar boundary: {nextBarTime:F3}s (BPM: {bpm:F1}, Current: {currentTime:F3}s)");
                OnBarBoundaryCalculated?.Invoke(this, nextBarTime);
                
                return nextBarTime;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error calculating next bar time: {ex.Message}");
                return currentTime + 1.0; // Fallback: 1 second later
            }
        }
        
        /// <summary>
        /// Calculate the next beat boundary time
        /// </summary>
        public double GetNextBeatTime(double currentTime, double bpm)
        {
            try
            {
                if (bpm <= 0)
                {
                    bpm = defaultBPM;
                }
                
                // Update musical timing for this BPM
                UpdateMusicalTiming(bpm, defaultTimeSignature, defaultSubdivision);
                
                // Calculate current position in musical time
                double currentBeat = currentTime / secondsPerBeat;
                double nextBeat = Math.Ceiling(currentBeat);
                double nextBeatTime = nextBeat * secondsPerBeat;
                
                // Apply sync tolerance if enabled
                if (enablePreciseSync)
                {
                    nextBeatTime = ApplySyncTolerance(nextBeatTime, currentTime);
                }
                
                Console.WriteLine($"🎵 Next beat boundary: {nextBeatTime:F3}s (BPM: {bpm:F1}, Current: {currentTime:F3}s)");
                OnBeatBoundaryCalculated?.Invoke(this, nextBeatTime);
                
                return nextBeatTime;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error calculating next beat time: {ex.Message}");
                return currentTime + 0.25; // Fallback: quarter second later
            }
        }
        
        /// <summary>
        /// Calculate the next subdivision boundary time
        /// </summary>
        public double GetNextSubdivisionTime(double currentTime, double bpm, int subdivision = 4)
        {
            try
            {
                if (bpm <= 0)
                {
                    bpm = defaultBPM;
                }
                
                if (subdivision <= 0)
                {
                    subdivision = defaultSubdivision;
                }
                
                // Update musical timing for this BPM and subdivision
                UpdateMusicalTiming(bpm, defaultTimeSignature, subdivision);
                
                // Calculate subdivision timing
                double secondsPerSubdivision = secondsPerBeat / subdivision;
                
                // Calculate current position in subdivision time
                double currentSubdivision = currentTime / secondsPerSubdivision;
                double nextSubdivision = Math.Ceiling(currentSubdivision);
                double nextSubdivisionTime = nextSubdivision * secondsPerSubdivision;
                
                // Apply sync tolerance if enabled
                if (enablePreciseSync)
                {
                    nextSubdivisionTime = ApplySyncTolerance(nextSubdivisionTime, currentTime);
                }
                
                Console.WriteLine($"🎶 Next subdivision boundary: {nextSubdivisionTime:F3}s (BPM: {bpm:F1}, Subdivision: {subdivision}, Current: {currentTime:F3}s)");
                OnSubdivisionCalculated?.Invoke(this, nextSubdivisionTime);
                
                return nextSubdivisionTime;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error calculating next subdivision time: {ex.Message}");
                return currentTime + 0.125; // Fallback: eighth second later
            }
        }
        
        /// <summary>
        /// Get the current musical position
        /// </summary>
        public MusicalPosition GetMusicalPosition(double currentTime, double bpm)
        {
            try
            {
                if (bpm <= 0)
                {
                    bpm = defaultBPM;
                }
                
                // Update musical timing for this BPM
                UpdateMusicalTiming(bpm, defaultTimeSignature, defaultSubdivision);
                
                // Calculate musical position
                double currentBar = currentTime / secondsPerBar;
                double currentBeat = currentTime / secondsPerBeat;
                double currentSubdivision = currentTime / (secondsPerBeat / defaultSubdivision);
                
                var position = new MusicalPosition
                {
                    bar = (int)Math.Floor(currentBar),
                    beat = (int)Math.Floor(currentBeat) % defaultTimeSignature,
                    subdivision = (int)Math.Floor(currentSubdivision) % defaultSubdivision,
                    barProgress = currentBar - Math.Floor(currentBar),
                    beatProgress = currentBeat - Math.Floor(currentBeat),
                    subdivisionProgress = currentSubdivision - Math.Floor(currentSubdivision),
                    bpm = bpm,
                    timeSignature = defaultTimeSignature
                };
                
                return position;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error calculating musical position: {ex.Message}");
                return new MusicalPosition(); // Return default position
            }
        }
        
        /// <summary>
        /// Calculate time offset to align with musical grid
        /// </summary>
        public double CalculateGridAlignment(double currentTime, double bpm, GridAlignmentType alignmentType = GridAlignmentType.Bar)
        {
            try
            {
                double targetTime = alignmentType switch
                {
                    GridAlignmentType.Bar => GetNextBarTime(currentTime, bpm),
                    GridAlignmentType.Beat => GetNextBeatTime(currentTime, bpm),
                    GridAlignmentType.Subdivision => GetNextSubdivisionTime(currentTime, bpm),
                    _ => GetNextBarTime(currentTime, bpm)
                };
                
                double offset = targetTime - currentTime;
                
                Console.WriteLine($"🎯 Grid alignment offset: {offset:F3}s for {alignmentType} alignment");
                return offset;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error calculating grid alignment: {ex.Message}");
                return 0.0;
            }
        }
        
        /// <summary>
        /// Apply groove quantization to timing
        /// </summary>
        public double ApplyGrooveQuantization(double time, double bpm, GroovePattern groovePattern = GroovePattern.None)
        {
            try
            {
                if (!enableGrooveQuantization || groovePattern == GroovePattern.None)
                {
                    return time;
                }
                
                // Get musical position
                var position = GetMusicalPosition(time, bpm);
                
                // Apply groove pattern
                double grooveOffset = GetGrooveOffset(position, groovePattern);
                double quantizedTime = time + grooveOffset;
                
                Console.WriteLine($"🎭 Applied groove quantization: {grooveOffset:F3}s offset");
                return quantizedTime;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error applying groove quantization: {ex.Message}");
                return time;
            }
        }
        
        /// <summary>
        /// Update musical timing calculations
        /// </summary>
        private void UpdateMusicalTiming(double bpm, int timeSignature, int subdivision)
        {
            try
            {
                // Calculate basic timing
                secondsPerBeat = 60.0 / bpm;
                beatsPerBar = timeSignature;
                secondsPerBar = secondsPerBeat * beatsPerBar;
                
                // Validate timing
                if (secondsPerBeat <= 0 || secondsPerBar <= 0)
                {
                    throw new InvalidOperationException("Invalid BPM or time signature");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating musical timing: {ex.Message}");
                // Use fallback values
                secondsPerBeat = 0.5; // 120 BPM equivalent
                beatsPerBar = 4;
                secondsPerBar = 2.0;
            }
        }
        
        /// <summary>
        /// Apply sync tolerance to timing
        /// </summary>
        private double ApplySyncTolerance(double targetTime, double currentTime)
        {
            if (!enablePreciseSync)
                return targetTime;
            
            double timeDiff = targetTime - currentTime;
            
            // If we're very close to the target, snap to it
            if (Math.Abs(timeDiff) < syncTolerance)
            {
                return targetTime;
            }
            
            return targetTime;
        }
        
        /// <summary>
        /// Get groove offset for musical position
        /// </summary>
        private double GetGrooveOffset(MusicalPosition position, GroovePattern pattern)
        {
            try
            {
                double offset = 0.0;
                
                switch (pattern)
                {
                    case GroovePattern.Swing:
                        // Apply swing feel (triplet-based)
                        if (position.subdivision % 2 == 1) // Off-beat subdivisions
                        {
                            offset = secondsPerBeat * 0.33 * grooveStrength;
                        }
                        break;
                        
                    case GroovePattern.Shuffle:
                        // Apply shuffle feel
                        if (position.subdivision % 2 == 1) // Off-beat subdivisions
                        {
                            offset = secondsPerBeat * 0.25 * grooveStrength;
                        }
                        break;
                        
                    case GroovePattern.Latin:
                        // Apply Latin feel (clave-based)
                        if (position.beat == 2 || position.beat == 4)
                        {
                            offset = secondsPerBeat * 0.2 * grooveStrength;
                        }
                        break;
                        
                    case GroovePattern.Funk:
                        // Apply funk feel (syncopated)
                        if (position.subdivision % 2 == 1)
                        {
                            offset = secondsPerBeat * 0.15 * grooveStrength;
                        }
                        break;
                }
                
                return offset;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error calculating groove offset: {ex.Message}");
                return 0.0;
            }
        }
        
        /// <summary>
        /// Get sync helper summary
        /// </summary>
        public string GetSyncHelperSummary()
        {
            return $"Stem Sync Helper | BPM: {defaultBPM:F1} | Time Signature: {defaultTimeSignature}/4 | " +
                   $"Subdivision: {defaultSubdivision} | Precision: {(enablePreciseSync ? "High" : "Standard")}";
        }
    }
    
    /// <summary>
    /// Musical position information
    /// </summary>
    [Serializable]
    public class MusicalPosition
    {
        public int bar;
        public int beat;
        public int subdivision;
        public double barProgress;
        public double beatProgress;
        public double subdivisionProgress;
        public double bpm;
        public int timeSignature;
        
        public override string ToString()
        {
            return $"Bar {bar + 1}, Beat {beat + 1}, Subdivision {subdivision + 1} | " +
                   $"BPM: {bpm:F1}, Time: {timeSignature}/4";
        }
    }
    
    /// <summary>
    /// Grid alignment types
    /// </summary>
    public enum GridAlignmentType
    {
        Bar,
        Beat,
        Subdivision
    }
    
    /// <summary>
    /// Groove patterns for quantization
    /// </summary>
    public enum GroovePattern
    {
        None,
        Swing,
        Shuffle,
        Latin,
        Funk
    }
}