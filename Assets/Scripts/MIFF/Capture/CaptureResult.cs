using System;

namespace MIFF.Capture
{
    /// <summary>
    /// Result of a spirit capture attempt
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class CaptureResult
    {
        [Header("Capture Result")]
        public CaptureStatus status;
        public string message;
        public string debugInfo;
        
        [Header("Capture Details")]
        public string spiritID;
        public string spiritName;
        public int attemptsMade;
        public float captureChance;
        public bool wasCriticalCapture;
        
        [Header("Timing")]
        public DateTime captureTime;
        public float captureDuration;
        
        [Header("Remix Hooks")]
        public string customCaptureData;
        public bool isRemixable = true;
        
        // Events for remixers to hook into
        public event Action<CaptureResult> OnCaptureResultProcessed;
        
        public CaptureResult()
        {
            captureTime = DateTime.Now;
        }
        
        /// <summary>
        /// Create a new capture result
        /// </summary>
        public CaptureResult(CaptureStatus status, string message = "")
        {
            this.status = status;
            this.message = message;
            this.captureTime = DateTime.Now;
        }
        
        /// <summary>
        /// Create a successful capture result
        /// </summary>
        public static CaptureResult Success(string spiritID, string spiritName, float captureChance, bool wasCritical = false)
        {
            return new CaptureResult(CaptureStatus.Success, "Spirit captured successfully!")
            {
                spiritID = spiritID,
                spiritName = spiritName,
                captureChance = captureChance,
                wasCriticalCapture = wasCritical
            };
        }
        
        /// <summary>
        /// Create a failed capture result
        /// </summary>
        public static CaptureResult Fail(string spiritID, string spiritName, float captureChance, string reason = "")
        {
            return new CaptureResult(CaptureStatus.Fail, reason)
            {
                spiritID = spiritID,
                spiritName = spiritName,
                captureChance = captureChance
            };
        }
        
        /// <summary>
        /// Create an already captured result
        /// </summary>
        public static CaptureResult AlreadyCaptured(string spiritID, string spiritName)
        {
            return new CaptureResult(CaptureStatus.AlreadyCaptured, "Spirit already captured!")
            {
                spiritID = spiritID,
                spiritName = spiritName
            };
        }
        
        /// <summary>
        /// Get result summary
        /// </summary>
        public string GetSummary()
        {
            string result = status switch
            {
                CaptureStatus.Success => "✅ CAPTURED",
                CaptureStatus.Fail => "❌ FAILED",
                CaptureStatus.AlreadyCaptured => "🔄 ALREADY CAPTURED",
                _ => "❓ UNKNOWN"
            };
            
            string critical = wasCriticalCapture ? " (CRITICAL!)" : "";
            string chance = captureChance > 0 ? $" | Chance: {captureChance:P1}" : "";
            string attempts = attemptsMade > 0 ? $" | Attempts: {attemptsMade}" : "";
            
            return $"{result}{critical} | {spiritName} | {message}{chance}{attempts}";
        }
        
        /// <summary>
        /// Get detailed result information
        /// </summary>
        public string GetDetailedInfo()
        {
            string baseInfo = GetSummary();
            string debug = !string.IsNullOrEmpty(debugInfo) ? $"\nDebug: {debugInfo}" : "";
            string custom = !string.IsNullOrEmpty(customCaptureData) ? $"\nCustom: {customCaptureData}" : "";
            string time = $"\nTime: {captureTime:yyyy-MM-dd HH:mm:ss}";
            string duration = captureDuration > 0 ? $"\nDuration: {captureDuration:F2}s" : "";
            
            return $"{baseInfo}{debug}{custom}{time}{duration}";
        }
        
        /// <summary>
        /// Check if capture was successful
        /// </summary>
        public bool IsSuccess => status == CaptureStatus.Success;
        
        /// <summary>
        /// Check if capture failed
        /// </summary>
        public bool IsFailure => status == CaptureStatus.Fail;
        
        /// <summary>
        /// Check if spirit was already captured
        /// </summary>
        public bool IsAlreadyCaptured => status == CaptureStatus.AlreadyCaptured;
        
        /// <summary>
        /// Check if this was a critical capture
        /// </summary>
        public bool IsCriticalCapture => wasCriticalCapture;
        
        /// <summary>
        /// Get capture status description
        /// </summary>
        public string GetStatusDescription()
        {
            return status switch
            {
                CaptureStatus.Success => "Successfully captured the spirit!",
                CaptureStatus.Fail => "Failed to capture the spirit.",
                CaptureStatus.AlreadyCaptured => "This spirit is already captured.",
                _ => "Unknown capture status."
            };
        }
        
        /// <summary>
        /// Add debug information
        /// </summary>
        public void AddDebugInfo(string info)
        {
            if (string.IsNullOrEmpty(debugInfo))
            {
                debugInfo = info;
            }
            else
            {
                debugInfo += $"; {info}";
            }
        }
        
        /// <summary>
        /// Set capture duration
        /// </summary>
        public void SetCaptureDuration(float duration)
        {
            captureDuration = duration;
        }
        
        /// <summary>
        /// Increment attempt counter
        /// </summary>
        public void IncrementAttempts()
        {
            attemptsMade++;
        }
        
        /// <summary>
        /// Mark as critical capture
        /// </summary>
        public void MarkAsCritical()
        {
            wasCriticalCapture = true;
        }
        
        /// <summary>
        /// Clone this capture result
        /// </summary>
        public CaptureResult Clone()
        {
            return new CaptureResult
            {
                status = status,
                message = message,
                debugInfo = debugInfo,
                spiritID = spiritID,
                spiritName = spiritName,
                attemptsMade = attemptsMade,
                captureChance = captureChance,
                wasCriticalCapture = wasCriticalCapture,
                captureTime = captureTime,
                captureDuration = captureDuration,
                customCaptureData = customCaptureData,
                isRemixable = isRemixable
            };
        }
        
        /// <summary>
        /// Process the capture result (triggers events)
        /// </summary>
        public void ProcessResult()
        {
            OnCaptureResultProcessed?.Invoke(this);
        }
    }
    
    /// <summary>
    /// Status of a capture attempt
    /// </summary>
    public enum CaptureStatus
    {
        None,
        Success,           // Spirit was captured
        Fail,              // Capture attempt failed
        AlreadyCaptured    // Spirit was already captured
    }
}