using System;
using System.Collections.Generic;
using System.Threading;
using System.Linq; // Added for .Skip()

namespace MIFF.Audio
{
    /// <summary>
    /// Console-based tester for the audio system
    /// Provides interactive testing and automated test scenarios
    /// </summary>
    [Serializable]
    public class AudioTestHarness
    {
        [Header("Test Configuration")]
        public bool enableInteractiveMode = true;
        public bool enableAutomatedTests = true;
        public bool enablePerformanceTests = true;
        public bool enableStressTests = false;
        
        [Header("Test Parameters")]
        public int testIterations = 5;
        public float testDuration = 10.0f;
        public int maxConcurrentTests = 8;
        public bool enableRealTimeUpdates = true;
        
        [Header("Remix Hooks")]
        public bool enableCustomTests = true;
        public bool enableCustomMetrics = true;
        public bool enableCustomValidation = true;
        
        // Core components
        private AudioManager audioManager;
        private StemSyncHelper stemSyncHelper;
        private List<TestResult> testResults;
        private bool isRunning;
        
        // Events for remixers to hook into
        public event Action<AudioTestHarness, string> OnTestStarted;
        public event Action<AudioTestHarness, string> OnTestCompleted;
        public event Action<AudioTestHarness, TestResult> OnTestResult;
        public event Action<AudioTestHarness, string> OnTestFailed;
        
        public AudioTestHarness()
        {
            InitializeTestHarness();
        }
        
        /// <summary>
        /// Initialize the test harness
        /// </summary>
        private void InitializeTestHarness()
        {
            audioManager = AudioManager.Instance;
            stemSyncHelper = new StemSyncHelper();
            testResults = new List<TestResult>();
            isRunning = false;
            
            Console.WriteLine("🧪 AudioTestHarness initialized successfully");
        }
        
        /// <summary>
        /// Start interactive testing mode
        /// </summary>
        public void StartInteractiveHarness()
        {
            if (!enableInteractiveMode)
            {
                Console.WriteLine("❌ Interactive mode is disabled");
                return;
            }
            
            Console.WriteLine("🎮 Audio Test Harness - Interactive Mode");
            Console.WriteLine("Type 'help' for available commands");
            Console.WriteLine("Type 'exit' to quit");
            Console.WriteLine();
            
            bool running = true;
            while (running)
            {
                try
                {
                    Console.Write("AudioTest> ");
                    string input = Console.ReadLine()?.Trim();
                    
                    if (string.IsNullOrEmpty(input)) continue;
                    
                    if (input.ToLower() == "exit" || input.ToLower() == "quit")
                    {
                        running = false;
                        continue;
                    }
                    
                    ProcessTestCommand(input);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error processing command: {ex.Message}");
                }
            }
            
            Console.WriteLine("Goodbye! 👋");
        }
        
        /// <summary>
        /// Process test commands
        /// </summary>
        private void ProcessTestCommand(string command)
        {
            string[] parts = command.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) return;
            
            string cmd = parts[0].ToLower();
            string[] args = parts.Skip(1).ToArray();
            
            switch (cmd)
            {
                case "help":
                    ShowHelp();
                    break;
                    
                case "play":
                    if (args.Length > 0)
                    {
                        PlayAudio(args[0], args.Length > 1 ? args[1] : "bgm");
                    }
                    else
                    {
                        Console.WriteLine("Usage: play <audioID> [channel]");
                    }
                    break;
                    
                case "stop":
                    if (args.Length > 0)
                    {
                        StopAudio(args[0]);
                    }
                    else
                    {
                        StopAllAudio();
                    }
                    break;
                    
                case "volume":
                    if (args.Length >= 2)
                    {
                        SetVolume(args[0], args[1]);
                    }
                    else
                    {
                        ShowVolumeInfo();
                    }
                    break;
                    
                case "stem":
                    if (args.Length >= 2)
                    {
                        PlayStem(args[0], args[1]);
                    }
                    else
                    {
                        Console.WriteLine("Usage: stem <stemID> <bpm>");
                    }
                    break;
                    
                case "status":
                    ShowAudioStatus();
                    break;
                    
                case "sync":
                    if (args.Length >= 2)
                    {
                        TestStemSync(args[0], args[1]);
                    }
                    else
                    {
                        Console.WriteLine("Usage: sync <time> <bpm>");
                    }
                    break;
                    
                case "test":
                    if (args.Length > 0)
                    {
                        RunSpecificTest(args[0]);
                    }
                    else
                    {
                        RunAllTests();
                    }
                    break;
                    
                case "results":
                    ShowTestResults();
                    break;
                    
                case "clear":
                    ClearTestResults();
                    break;
                    
                case "registry":
                    ShowRegistryInfo();
                    break;
                    
                default:
                    Console.WriteLine($"❌ Unknown command: {cmd}. Type 'help' for available commands.");
                    break;
            }
            
            // Trigger command event for remixers
            OnTestStarted?.Invoke(this, command);
        }
        
        /// <summary>
        /// Show help information
        /// </summary>
        private void ShowHelp()
        {
            Console.WriteLine("🎵 Audio Test Harness Commands:");
            Console.WriteLine("  play <audioID> [channel]  - Play audio clip");
            Console.WriteLine("  stop [audioID]             - Stop audio (or all if no ID)");
            Console.WriteLine("  volume <channel> <value>   - Set channel volume");
            Console.WriteLine("  stem <stemID> <bpm>        - Play stem with BPM sync");
            Console.WriteLine("  status                     - Show audio system status");
            Console.WriteLine("  sync <time> <bpm>          - Test stem synchronization");
            Console.WriteLine("  test [testName]            - Run tests (all or specific)");
            Console.WriteLine("  results                    - Show test results");
            Console.WriteLine("  clear                      - Clear test results");
            Console.WriteLine("  registry                   - Show audio registry info");
            Console.WriteLine("  help                       - Show this help");
            Console.WriteLine("  exit/quit                  - Exit the harness");
            Console.WriteLine();
            Console.WriteLine("Examples:");
            Console.WriteLine("  play bgm_main_theme        - Play main theme BGM");
            Console.WriteLine("  play sfx_button_click sfx  - Play button click SFX");
            Console.WriteLine("  stem stem_drums 120        - Play drum stem at 120 BPM");
            Console.WriteLine("  volume bgm 0.5             - Set BGM volume to 50%");
            Console.WriteLine("  sync 2.5 140               - Test sync at 2.5s, 140 BPM");
        }
        
        /// <summary>
        /// Play audio clip
        /// </summary>
        private void PlayAudio(string audioID, string channel)
        {
            try
            {
                bool success = false;
                
                switch (channel.ToLower())
                {
                    case "bgm":
                        success = audioManager.PlayBGM(audioID);
                        break;
                    case "sfx":
                        success = audioManager.PlaySFX(audioID);
                        break;
                    case "stem":
                        success = audioManager.PlayStemSynced(audioID, GetCurrentTime());
                        break;
                    default:
                        Console.WriteLine($"❌ Unknown channel: {channel}");
                        return;
                }
                
                if (success)
                {
                    Console.WriteLine($"✅ Started playing {audioID} on {channel} channel");
                }
                else
                {
                    Console.WriteLine($"❌ Failed to play {audioID} on {channel} channel");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error playing audio: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Stop specific audio
        /// </summary>
        private void StopAudio(string audioID)
        {
            try
            {
                // For now, we'll stop all audio since individual stop isn't implemented
                // In a full implementation, you'd track individual tracks
                Console.WriteLine($"⏹️ Stopping audio: {audioID}");
                audioManager.StopAllAudio();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error stopping audio: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Stop all audio
        /// </summary>
        private void StopAllAudio()
        {
            try
            {
                Console.WriteLine("🔇 Stopping all audio");
                audioManager.StopAllAudio();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error stopping all audio: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Set volume for channel
        /// </summary>
        private void SetVolume(string channel, string value)
        {
            try
            {
                if (!float.TryParse(value, out float volume))
                {
                    Console.WriteLine($"❌ Invalid volume value: {value}");
                    return;
                }
                
                if (!Enum.TryParse<AudioChannel>(channel, true, out var audioChannel))
                {
                    Console.WriteLine($"❌ Invalid channel: {channel}");
                    return;
                }
                
                bool success = audioManager.SetVolume(audioChannel, volume);
                
                if (success)
                {
                    Console.WriteLine($"✅ Set {channel} volume to {volume:F2}");
                }
                else
                {
                    Console.WriteLine($"❌ Failed to set {channel} volume");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error setting volume: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Show volume information
        /// </summary>
        private void ShowVolumeInfo()
        {
            try
            {
                var status = audioManager.GetAudioStatus();
                Console.WriteLine("🔊 Volume Information:");
                Console.WriteLine($"  Master: {status.masterVolume:F2}");
                Console.WriteLine($"  BGM: {status.channelVolumes[AudioChannel.BGM]:F2}");
                Console.WriteLine($"  SFX: {status.channelVolumes[AudioChannel.SFX]:F2}");
                Console.WriteLine($"  Stem: {status.channelVolumes[AudioChannel.Stem]:F2}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting volume info: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Play stem with BPM sync
        /// </summary>
        private void PlayStem(string stemID, string bpm)
        {
            try
            {
                if (!double.TryParse(bpm, out double bpmValue))
                {
                    Console.WriteLine($"❌ Invalid BPM value: {bpm}");
                    return;
                }
                
                double currentTime = GetCurrentTime();
                bool success = audioManager.PlayStemSynced(stemID, currentTime);
                
                if (success)
                {
                    Console.WriteLine($"✅ Scheduled stem {stemID} at {currentTime:F3}s with {bpmValue:F1} BPM");
                }
                else
                {
                    Console.WriteLine($"❌ Failed to schedule stem {stemID}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error playing stem: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Show audio system status
        /// </summary>
        private void ShowAudioStatus()
        {
            try
            {
                var status = audioManager.GetAudioStatus();
                Console.WriteLine("📊 Audio System Status:");
                Console.WriteLine($"  Audio Enabled: {status.isAudioEnabled}");
                Console.WriteLine($"  Current BGM: {status.currentBGM ?? "None"}");
                Console.WriteLine($"  Active SFX: {status.activeSFXCount}");
                Console.WriteLine($"  Active Stems: {status.activeStemsCount}");
                Console.WriteLine($"  Total Tracks: {status.totalActiveTracks}");
                Console.WriteLine($"  Last Update: {status.lastUpdate:HH:mm:ss}");
                Console.WriteLine();
                Console.WriteLine(audioManager.GetAudioManagerSummary());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting audio status: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Test stem synchronization
        /// </summary>
        private void TestStemSync(string time, string bpm)
        {
            try
            {
                if (!double.TryParse(time, out double timeValue))
                {
                    Console.WriteLine($"❌ Invalid time value: {time}");
                    return;
                }
                
                if (!double.TryParse(bpm, out double bpmValue))
                {
                    Console.WriteLine($"❌ Invalid BPM value: {bpm}");
                    return;
                }
                
                Console.WriteLine($"🎼 Testing stem sync at {timeValue:F3}s with {bpmValue:F1} BPM");
                
                double nextBarTime = stemSyncHelper.GetNextBarTime(timeValue, bpmValue);
                double nextBeatTime = stemSyncHelper.GetNextBeatTime(timeValue, bpmValue);
                double nextSubdivisionTime = stemSyncHelper.GetNextSubdivisionTime(timeValue, bpmValue);
                
                Console.WriteLine($"  Next Bar: {nextBarTime:F3}s (offset: {nextBarTime - timeValue:F3}s)");
                Console.WriteLine($"  Next Beat: {nextBeatTime:F3}s (offset: {nextBeatTime - timeValue:F3}s)");
                Console.WriteLine($"  Next Subdivision: {nextSubdivisionTime:F3}s (offset: {nextSubdivisionTime - timeValue:F3}s)");
                
                var position = stemSyncHelper.GetMusicalPosition(timeValue, bpmValue);
                Console.WriteLine($"  Musical Position: {position}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error testing stem sync: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Run specific test
        /// </summary>
        private void RunSpecificTest(string testName)
        {
            try
            {
                Console.WriteLine($"🧪 Running test: {testName}");
                OnTestStarted?.Invoke(this, testName);
                
                bool success = false;
                string result = "";
                
                switch (testName.ToLower())
                {
                    case "bgm":
                        success = RunBGMTest();
                        result = "BGM playback test";
                        break;
                    case "sfx":
                        success = RunSFXTest();
                        result = "SFX playback test";
                        break;
                    case "stem":
                        success = RunStemTest();
                        result = "Stem sync test";
                        break;
                    case "volume":
                        success = RunVolumeTest();
                        result = "Volume control test";
                        break;
                    case "sync":
                        success = RunSyncTest();
                        result = "Synchronization test";
                        break;
                    case "performance":
                        success = RunPerformanceTest();
                        result = "Performance test";
                        break;
                    default:
                        Console.WriteLine($"❌ Unknown test: {testName}");
                        return;
                }
                
                var testResult = new TestResult
                {
                    testName = testName,
                    success = success,
                    result = result,
                    timestamp = DateTime.Now
                };
                
                testResults.Add(testResult);
                
                if (success)
                {
                    Console.WriteLine($"✅ {result} completed successfully");
                    OnTestCompleted?.Invoke(this, testName);
                }
                else
                {
                    Console.WriteLine($"❌ {result} failed");
                    OnTestFailed?.Invoke(this, testName);
                }
                
                OnTestResult?.Invoke(this, testResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error running test {testName}: {ex.Message}");
                OnTestFailed?.Invoke(this, testName);
            }
        }
        
        /// <summary>
        /// Run all tests
        /// </summary>
        private void RunAllTests()
        {
            try
            {
                Console.WriteLine("🧪 Running all tests...");
                
                string[] testNames = { "bgm", "sfx", "stem", "volume", "sync", "performance" };
                
                foreach (string testName in testNames)
                {
                    RunSpecificTest(testName);
                    Thread.Sleep(1000); // Brief pause between tests
                }
                
                Console.WriteLine("✅ All tests completed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error running all tests: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Run BGM test
        /// </summary>
        private bool RunBGMTest()
        {
            try
            {
                Console.WriteLine("  Testing BGM playback...");
                
                // Test BGM playback
                bool success1 = audioManager.PlayBGM("bgm_main_theme");
                Thread.Sleep(1000);
                
                // Test BGM switching
                bool success2 = audioManager.PlayBGM("bgm_battle_intense");
                Thread.Sleep(1000);
                
                // Stop BGM
                bool success3 = audioManager.StopBGM();
                
                return success1 && success2 && success3;
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Run SFX test
        /// </summary>
        private bool RunSFXTest()
        {
            try
            {
                Console.WriteLine("  Testing SFX playback...");
                
                // Test multiple SFX
                bool success1 = audioManager.PlaySFX("sfx_button_click");
                bool success2 = audioManager.PlaySFX("sfx_spirit_attack");
                bool success3 = audioManager.PlaySFX("sfx_evolution");
                
                Thread.Sleep(2000);
                
                return success1 && success2 && success3;
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Run stem test
        /// </summary>
        private bool RunStemTest()
        {
            try
            {
                Console.WriteLine("  Testing stem synchronization...");
                
                double currentTime = GetCurrentTime();
                bool success1 = audioManager.PlayStemSynced("stem_drums", currentTime);
                bool success2 = audioManager.PlayStemSynced("stem_bass", currentTime + 0.5);
                
                Thread.Sleep(2000);
                
                return success1 && success2;
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Run volume test
        /// </summary>
        private bool RunVolumeTest()
        {
            try
            {
                Console.WriteLine("  Testing volume control...");
                
                bool success1 = audioManager.SetVolume(AudioChannel.BGM, 0.5f);
                bool success2 = audioManager.SetVolume(AudioChannel.SFX, 0.7f);
                bool success3 = audioManager.SetMasterVolume(0.8f);
                
                return success1 && success2 && success3;
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Run sync test
        /// </summary>
        private bool RunSyncTest()
        {
            try
            {
                Console.WriteLine("  Testing synchronization...");
                
                double currentTime = GetCurrentTime();
                double nextBar = stemSyncHelper.GetNextBarTime(currentTime, 120.0);
                double nextBeat = stemSyncHelper.GetNextBeatTime(currentTime, 120.0);
                
                bool success = nextBar > currentTime && nextBeat > currentTime;
                
                return success;
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Run performance test
        /// </summary>
        private bool RunPerformanceTest()
        {
            try
            {
                Console.WriteLine("  Testing performance...");
                
                var startTime = DateTime.Now;
                
                // Perform multiple operations
                for (int i = 0; i < 100; i++)
                {
                    stemSyncHelper.GetNextBarTime(i * 0.1, 120.0 + (i % 20));
                }
                
                var endTime = DateTime.Now;
                var duration = endTime - startTime;
                
                Console.WriteLine($"    Performance: 100 operations in {duration.TotalMilliseconds:F2}ms");
                
                return duration.TotalMilliseconds < 1000; // Should complete in under 1 second
            }
            catch
            {
                return false;
            }
        }
        
        /// <summary>
        /// Show test results
        /// </summary>
        private void ShowTestResults()
        {
            try
            {
                if (testResults.Count == 0)
                {
                    Console.WriteLine("📊 No test results available");
                    return;
                }
                
                Console.WriteLine($"📊 Test Results ({testResults.Count} tests):");
                Console.WriteLine("=" * 60);
                
                int passed = 0;
                int failed = 0;
                
                foreach (var result in testResults)
                {
                    string status = result.success ? "✅ PASS" : "❌ FAIL";
                    Console.WriteLine($"{status} | {result.testName} | {result.result} | {result.timestamp:HH:mm:ss}");
                    
                    if (result.success) passed++;
                    else failed++;
                }
                
                Console.WriteLine("=" * 60);
                Console.WriteLine($"Summary: {passed} passed, {failed} failed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error showing test results: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Clear test results
        /// </summary>
        private void ClearTestResults()
        {
            try
            {
                testResults.Clear();
                Console.WriteLine("🧹 Test results cleared");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error clearing test results: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Show registry information
        /// </summary>
        private void ShowRegistryInfo()
        {
            try
            {
                // This would show information about the audio registry
                // For now, we'll show a placeholder
                Console.WriteLine("📚 Audio Registry Information:");
                Console.WriteLine("  (Registry info display not implemented in this version)");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error showing registry info: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Get current time (placeholder)
        /// </summary>
        private double GetCurrentTime()
        {
            // In a real implementation, this would get the actual DSP time
            return Environment.TickCount / 1000.0;
        }
        
        /// <summary>
        /// Get test harness summary
        /// </summary>
        public string GetTestHarnessSummary()
        {
            return $"Audio Test Harness | Tests Run: {testResults.Count} | " +
                   $"Interactive: {(enableInteractiveMode ? "Yes" : "No")} | " +
                   $"Automated: {(enableAutomatedTests ? "Yes" : "No")}";
        }
    }
    
    /// <summary>
    /// Test result information
    /// </summary>
    [Serializable]
    public class TestResult
    {
        public string testName;
        public bool success;
        public string result;
        public DateTime timestamp;
        
        public override string ToString()
        {
            string status = success ? "PASS" : "FAIL";
            return $"{testName}: {status} | {result} | {timestamp:HH:mm:ss}";
        }
    }
}