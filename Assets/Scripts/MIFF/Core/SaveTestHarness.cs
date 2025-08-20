using System;
using System.Collections.Generic;
using NewBark.State;
using System.Linq; // Added for OrderBy and Where
using System.IO; // Added for File.WriteAllText

namespace MIFF.Core
{
    /// <summary>
    /// Console-based tester for the save/load system
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SaveTestHarness
    {
        [Header("Test Configuration")]
        public bool enableInteractiveMode = true;
        public bool enableAutoTest = false;
        public bool enableVerboseOutput = true;
        public bool enablePerformanceTesting = false;
        public bool enableStressTesting = false;
        
        [Header("Test Settings")]
        public int testIterations = 5;
        public int stressTestCount = 100;
        public float performanceThreshold = 100.0f; // milliseconds
        public bool enableDataValidation = true;
        public bool enableFileIntegrityCheck = true;
        
        [Header("Remix Hooks")]
        public bool enableCustomTests = true;
        public bool enableCustomValidation = true;
        public bool enableCustomMetrics = true;
        
        // Core components
        private SaveManager saveManager;
        private SaveStorage saveStorage;
        private GameData testGameData;
        
        // Test results
        private List<TestResult> testResults;
        private DateTime testStartTime;
        private DateTime testEndTime;
        
        // Events for remixers to hook into
        public event Action<SaveTestHarness, string> OnTestStarted;
        public event Action<SaveTestHarness, string> OnTestCompleted;
        public event Action<SaveTestHarness, TestResult> OnTestResult;
        public event Action<SaveTestHarness, string> OnTestFailed;
        
        public SaveTestHarness()
        {
            InitializeTestHarness();
        }
        
        /// <summary>
        /// Initialize with SaveManager and SaveStorage
        /// </summary>
        public SaveTestHarness(SaveManager manager, SaveStorage storage)
        {
            saveManager = manager;
            saveStorage = storage;
            InitializeTestHarness();
        }
        
        /// <summary>
        /// Initialize the test harness
        /// </summary>
        private void InitializeTestHarness()
        {
            if (saveManager == null)
            {
                saveManager = new SaveManager();
            }
            
            if (saveStorage == null)
            {
                saveStorage = new SaveStorage();
            }
            
            testResults = new List<TestResult>();
            testStartTime = DateTime.MinValue;
            testEndTime = DateTime.MinValue;
            
            // Create sample game data for testing
            CreateSampleGameData();
        }
        
        /// <summary>
        /// Start the interactive test harness
        /// </summary>
        public void StartInteractiveHarness()
        {
            Console.WriteLine("🧪 Save/Load System Test Harness - Interactive Mode");
            Console.WriteLine("Type 'help' for available commands");
            Console.WriteLine("Type 'exit' to quit");
            Console.WriteLine();
            
            bool running = true;
            while (running)
            {
                try
                {
                    Console.Write("SaveTest> ");
                    string input = Console.ReadLine()?.Trim();
                    
                    if (string.IsNullOrEmpty(input)) continue;
                    
                    if (input.ToLower() == "exit" || input.ToLower() == "quit")
                    {
                        running = false;
                        continue;
                    }
                    
                    ProcessCommand(input);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing command: {ex.Message}");
                }
            }
            
            Console.WriteLine("Goodbye! 👋");
        }
        
        /// <summary>
        /// Process test commands
        /// </summary>
        private void ProcessCommand(string command)
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
                    
                case "create":
                    if (args.Length > 0)
                    {
                        CreateSaveSlot(args[0]);
                    }
                    else
                    {
                        Console.WriteLine("Usage: create <slotID>");
                    }
                    break;
                    
                case "save":
                    if (args.Length > 0)
                    {
                        SaveGame(args[0]);
                    }
                    else
                    {
                        Console.WriteLine("Usage: save <slotID>");
                    }
                    break;
                    
                case "load":
                    if (args.Length > 0)
                    {
                        LoadGame(args[0]);
                    }
                    else
                    {
                        Console.WriteLine("Usage: load <slotID>");
                    }
                    break;
                    
                case "delete":
                    if (args.Length > 0)
                    {
                        DeleteSave(args[0]);
                    }
                    else
                    {
                        Console.WriteLine("Usage: delete <slotID>");
                    }
                    break;
                    
                case "list":
                    ListSaveSlots();
                    break;
                    
                case "info":
                    if (args.Length > 0)
                    {
                        ShowSaveSlotInfo(args[0]);
                    }
                    else
                    {
                        ShowSystemInfo();
                    }
                    break;
                    
                case "modify":
                    ModifyGameData();
                    break;
                    
                case "validate":
                    ValidateAllSaves();
                    break;
                    
                case "performance":
                    RunPerformanceTests();
                    break;
                    
                case "stress":
                    RunStressTests();
                    break;
                    
                case "cleanup":
                    CleanupTestData();
                    break;
                    
                case "export":
                    ExportTestResults();
                    break;
                    
                case "reset":
                    ResetTestData();
                    break;
                    
                default:
                    Console.WriteLine($"Unknown command: {cmd}. Type 'help' for available commands.");
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
            Console.WriteLine("📚 Save Test Harness Commands:");
            Console.WriteLine("  test <type>           - Run specific test (basic/performance/stress)");
            Console.WriteLine("  create <slotID>       - Create new save slot");
            Console.WriteLine("  save <slotID>          - Save game to slot");
            Console.WriteLine("  load <slotID>          - Load game from slot");
            Console.WriteLine("  delete <slotID>        - Delete save from slot");
            Console.WriteLine("  list                   - List all save slots");
            Console.WriteLine("  info [slotID]          - Show system or slot information");
            Console.WriteLine("  modify                 - Modify game data for testing");
            Console.WriteLine("  validate               - Validate all save files");
            Console.WriteLine("  performance            - Run performance tests");
            Console.WriteLine("  stress                 - Run stress tests");
            Console.WriteLine("  cleanup                - Clean up test data");
            Console.WriteLine("  export                 - Export test results");
            Console.WriteLine("  reset                  - Reset all test data");
            Console.WriteLine("  help                   - Show this help");
            Console.WriteLine("  exit/quit              - Exit the test harness");
            Console.WriteLine();
            Console.WriteLine("Test Types:");
            Console.WriteLine("  basic      - Basic save/load functionality");
            Console.WriteLine("  performance - Performance and timing tests");
            Console.WriteLine("  stress     - Stress testing with many saves");
        }
        
        /// <summary>
        /// Run all tests
        /// </summary>
        private void RunAllTests()
        {
            Console.WriteLine("🧪 Running all tests...");
            
            testStartTime = DateTime.Now;
            testResults.Clear();
            
            // Basic functionality tests
            RunBasicTests();
            
            // Performance tests
            RunPerformanceTests();
            
            // Stress tests
            RunStressTests();
            
            testEndTime = DateTime.Now;
            
            // Show summary
            ShowTestSummary();
        }
        
        /// <summary>
        /// Run specific test
        /// </summary>
        private void RunSpecificTest(string testType)
        {
            switch (testType.ToLower())
            {
                case "basic":
                    RunBasicTests();
                    break;
                case "performance":
                    RunPerformanceTests();
                    break;
                case "stress":
                    RunStressTests();
                    break;
                default:
                    Console.WriteLine($"Unknown test type: {testType}");
                    break;
            }
        }
        
        /// <summary>
        /// Run basic functionality tests
        /// </summary>
        private void RunBasicTests()
        {
            Console.WriteLine("🔧 Running basic functionality tests...");
            
            // Test 1: Create save slot
            var result1 = new TestResult("Create Save Slot", "Create a new save slot");
            try
            {
                var slot = saveManager.CreateSaveSlot("test_slot", "Test Slot", "TestPlayer");
                result1.success = slot != null;
                result1.duration = 0;
                result1.message = slot != null ? "Save slot created successfully" : "Failed to create save slot";
            }
            catch (Exception ex)
            {
                result1.success = false;
                result1.message = $"Exception: {ex.Message}";
            }
            testResults.Add(result1);
            OnTestResult?.Invoke(this, result1);
            
            // Test 2: Save game
            var result2 = new TestResult("Save Game", "Save game data to slot");
            try
            {
                var startTime = DateTime.Now;
                bool saveResult = saveManager.SaveGame("test_slot", testGameData, "TestPlayer");
                var endTime = DateTime.Now;
                
                result2.success = saveResult;
                result2.duration = (endTime - startTime).TotalMilliseconds;
                result2.message = saveResult ? "Game saved successfully" : "Failed to save game";
            }
            catch (Exception ex)
            {
                result2.success = false;
                result2.message = $"Exception: {ex.Message}";
            }
            testResults.Add(result2);
            OnTestResult?.Invoke(this, result2);
            
            // Test 3: Load game
            var result3 = new TestResult("Load Game", "Load game data from slot");
            try
            {
                var startTime = DateTime.Now;
                var loadedData = saveManager.LoadGame("test_slot");
                var endTime = DateTime.Now;
                
                result3.success = loadedData != null;
                result3.duration = (endTime - startTime).TotalMilliseconds;
                result3.message = loadedData != null ? "Game loaded successfully" : "Failed to load game";
            }
            catch (Exception ex)
            {
                result3.success = false;
                result3.message = $"Exception: {ex.Message}";
            }
            testResults.Add(result3);
            OnTestResult?.Invoke(this, result3);
            
            // Test 4: Data validation
            var result4 = new TestResult("Data Validation", "Validate loaded data integrity");
            try
            {
                var loadedData = saveManager.LoadGame("test_slot");
                if (loadedData != null)
                {
                    bool isValid = ValidateGameData(loadedData);
                    result4.success = isValid;
                    result4.message = isValid ? "Data validation passed" : "Data validation failed";
                }
                else
                {
                    result4.success = false;
                    result4.message = "No data to validate";
                }
            }
            catch (Exception ex)
            {
                result4.success = false;
                result4.message = $"Exception: {ex.Message}";
            }
            testResults.Add(result4);
            OnTestResult?.Invoke(this, result4);
            
            Console.WriteLine("✅ Basic tests completed");
        }
        
        /// <summary>
        /// Run performance tests
        /// </summary>
        private void RunPerformanceTests()
        {
            Console.WriteLine("⚡ Running performance tests...");
            
            // Test save performance
            var saveResult = new TestResult("Save Performance", "Test save operation performance");
            try
            {
                var startTime = DateTime.Now;
                for (int i = 0; i < testIterations; i++)
                {
                    saveManager.SaveGame($"perf_test_{i}", testGameData, "PerfTest");
                }
                var endTime = DateTime.Now;
                
                double totalTime = (endTime - startTime).TotalMilliseconds;
                double avgTime = totalTime / testIterations;
                
                saveResult.success = true;
                saveResult.duration = totalTime;
                saveResult.message = $"Average save time: {avgTime:F2}ms over {testIterations} iterations";
                
                if (avgTime > performanceThreshold)
                {
                    saveResult.message += $" (WARNING: Above threshold of {performanceThreshold}ms)";
                }
            }
            catch (Exception ex)
            {
                saveResult.success = false;
                saveResult.message = $"Exception: {ex.Message}";
            }
            testResults.Add(saveResult);
            OnTestResult?.Invoke(this, saveResult);
            
            // Test load performance
            var loadResult = new TestResult("Load Performance", "Test load operation performance");
            try
            {
                var startTime = DateTime.Now;
                for (int i = 0; i < testIterations; i++)
                {
                    var loadedData = saveManager.LoadGame($"perf_test_{i}");
                }
                var endTime = DateTime.Now;
                
                double totalTime = (endTime - startTime).TotalMilliseconds;
                double avgTime = totalTime / testIterations;
                
                loadResult.success = true;
                loadResult.duration = totalTime;
                loadResult.message = $"Average load time: {avgTime:F2}ms over {testIterations} iterations";
                
                if (avgTime > performanceThreshold)
                {
                    loadResult.message += $" (WARNING: Above threshold of {performanceThreshold}ms)";
                }
            }
            catch (Exception ex)
            {
                loadResult.success = false;
                loadResult.message = $"Exception: {ex.Message}";
            }
            testResults.Add(loadResult);
            OnTestResult?.Invoke(this, loadResult);
            
            Console.WriteLine("✅ Performance tests completed");
        }
        
        /// <summary>
        /// Run stress tests
        /// </summary>
        private void RunStressTests()
        {
            Console.WriteLine("💪 Running stress tests...");
            
            var stressResult = new TestResult("Stress Test", "Test system under load");
            try
            {
                var startTime = DateTime.Now;
                int successfulSaves = 0;
                int successfulLoads = 0;
                
                // Create many save slots
                for (int i = 0; i < stressTestCount; i++)
                {
                    try
                    {
                        bool saveResult = saveManager.SaveGame($"stress_test_{i}", testGameData, "StressTest");
                        if (saveResult) successfulSaves++;
                    }
                    catch
                    {
                        // Count failures silently
                    }
                }
                
                // Load all saves
                for (int i = 0; i < stressTestCount; i++)
                {
                    try
                    {
                        var loadedData = saveManager.LoadGame($"stress_test_{i}");
                        if (loadedData != null) successfulLoads++;
                    }
                    catch
                    {
                        // Count failures silently
                    }
                }
                
                var endTime = DateTime.Now;
                
                stressResult.success = successfulSaves > 0 && successfulLoads > 0;
                stressResult.duration = (endTime - startTime).TotalMilliseconds;
                stressResult.message = $"Stress test completed: {successfulSaves}/{stressTestCount} saves, {successfulLoads}/{stressTestCount} loads";
            }
            catch (Exception ex)
            {
                stressResult.success = false;
                stressResult.message = $"Exception: {ex.Message}";
            }
            testResults.Add(stressResult);
            OnTestResult?.Invoke(this, stressResult);
            
            Console.WriteLine("✅ Stress tests completed");
        }
        
        /// <summary>
        /// Create save slot
        /// </summary>
        private void CreateSaveSlot(string slotID)
        {
            try
            {
                var slot = saveManager.CreateSaveSlot(slotID, $"Test Slot {slotID}", "TestPlayer");
                if (slot != null)
                {
                    Console.WriteLine($"✅ Created save slot: {slotID}");
                    Console.WriteLine(slot.GetSummary());
                }
                else
                {
                    Console.WriteLine($"❌ Failed to create save slot: {slotID}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error creating save slot: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Save game to slot
        /// </summary>
        private void SaveGame(string slotID)
        {
            try
            {
                bool result = saveManager.SaveGame(slotID, testGameData, "TestPlayer");
                if (result)
                {
                    Console.WriteLine($"✅ Game saved successfully to slot: {slotID}");
                }
                else
                {
                    Console.WriteLine($"❌ Failed to save game to slot: {slotID}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error saving game: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Load game from slot
        /// </summary>
        private void LoadGame(string slotID)
        {
            try
            {
                var loadedData = saveManager.LoadGame(slotID);
                if (loadedData != null)
                {
                    Console.WriteLine($"✅ Game loaded successfully from slot: {slotID}");
                    Console.WriteLine($"Player Level: {loadedData.playerLevel}");
                    Console.WriteLine($"Spirits Captured: {loadedData.totalSpiritsCaptured}");
                    Console.WriteLine($"Total Battles: {loadedData.totalBattlesWon + loadedData.totalBattlesLost}");
                }
                else
                {
                    Console.WriteLine($"❌ Failed to load game from slot: {slotID}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error loading game: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Delete save from slot
        /// </summary>
        private void DeleteSave(string slotID)
        {
            try
            {
                bool result = saveManager.DeleteSave(slotID);
                if (result)
                {
                    Console.WriteLine($"✅ Save deleted successfully from slot: {slotID}");
                }
                else
                {
                    Console.WriteLine($"❌ Failed to delete save from slot: {slotID}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error deleting save: {ex.Message}");
            }
        }
        
        /// <summary>
        /// List all save slots
        /// </summary>
        private void ListSaveSlots()
        {
            try
            {
                var slots = saveManager.GetAllSaveSlots();
                if (slots.Count == 0)
                {
                    Console.WriteLine("📭 No save slots found");
                    return;
                }
                
                Console.WriteLine($"📚 Found {slots.Count} save slots:");
                foreach (var slot in slots.OrderBy(s => s.slotID))
                {
                    Console.WriteLine($"  {slot}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error listing save slots: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Show save slot information
        /// </summary>
        private void ShowSaveSlotInfo(string slotID)
        {
            try
            {
                var slot = saveManager.GetSaveSlot(slotID);
                if (slot != null)
                {
                    Console.WriteLine($"📋 Save Slot Information: {slotID}");
                    Console.WriteLine(slot.GetDetailedInfo());
                }
                else
                {
                    Console.WriteLine($"❌ Save slot not found: {slotID}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting save slot info: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Show system information
        /// </summary>
        private void ShowSystemInfo()
        {
            try
            {
                Console.WriteLine("🔧 Save System Information:");
                Console.WriteLine(saveManager.GetSaveManagerSummary());
                Console.WriteLine();
                Console.WriteLine(saveStorage.GetStorageSummary());
                
                var currentSlot = saveManager.GetCurrentSaveSlot();
                if (currentSlot != null)
                {
                    Console.WriteLine();
                    Console.WriteLine("📋 Current Save Slot:");
                    Console.WriteLine(currentSlot.GetSummary());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting system info: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Modify game data for testing
        /// </summary>
        private void ModifyGameData()
        {
            try
            {
                Console.WriteLine("🔧 Modifying game data for testing...");
                
                // Modify various game data fields
                testGameData.playerLevel++;
                testGameData.playerExperience += 100;
                testGameData.totalBattlesWon++;
                testGameData.totalSpiritsCaptured++;
                
                // Add some items
                if (!testGameData.inventoryCounts.ContainsKey("test_item"))
                    testGameData.inventoryCounts["test_item"] = 0;
                testGameData.inventoryCounts["test_item"]++;
                
                // Set some flags
                if (!testGameData.onboardingFlags.ContainsKey("TestFlag"))
                    testGameData.onboardingFlags["TestFlag"] = false;
                testGameData.onboardingFlags["TestFlag"] = true;
                
                Console.WriteLine("✅ Game data modified successfully");
                Console.WriteLine($"New Level: {testGameData.playerLevel}");
                Console.WriteLine($"New Experience: {testGameData.playerExperience}");
                Console.WriteLine($"Battles Won: {testGameData.totalBattlesWon}");
                Console.WriteLine($"Spirits Captured: {testGameData.totalSpiritsCaptured}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error modifying game data: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Validate all saves
        /// </summary>
        private void ValidateAllSaves()
        {
            try
            {
                Console.WriteLine("🔍 Validating all save files...");
                
                var slots = saveManager.GetAllSaveSlots();
                int validCount = 0;
                int corruptedCount = 0;
                
                foreach (var slot in slots)
                {
                    if (slot.IsValid)
                    {
                        validCount++;
                    }
                    else
                    {
                        corruptedCount++;
                        Console.WriteLine($"❌ Corrupted save slot: {slot.slotID} - {slot.corruptionReason}");
                    }
                }
                
                Console.WriteLine($"✅ Validation complete: {validCount} valid, {corruptedCount} corrupted");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error validating saves: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Clean up test data
        /// </summary>
        private void CleanupTestData()
        {
            try
            {
                Console.WriteLine("🧹 Cleaning up test data...");
                
                var slots = saveManager.GetAllSaveSlots();
                int deletedCount = 0;
                
                foreach (var slot in slots)
                {
                    if (slot.slotID.StartsWith("test_") || 
                        slot.slotID.StartsWith("perf_test_") || 
                        slot.slotID.StartsWith("stress_test_"))
                    {
                        if (saveManager.DeleteSave(slot.slotID))
                        {
                            deletedCount++;
                        }
                    }
                }
                
                Console.WriteLine($"✅ Cleanup complete: {deletedCount} test saves deleted");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error cleaning up test data: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Export test results
        /// </summary>
        private void ExportTestResults()
        {
            try
            {
                Console.WriteLine("📤 Exporting test results...");
                
                string export = $"Save System Test Results - {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n";
                export += $"Test Duration: {(testEndTime - testStartTime).TotalSeconds:F2} seconds\n";
                export += $"Total Tests: {testResults.Count}\n\n";
                
                foreach (var result in testResults)
                {
                    string status = result.success ? "✅ PASS" : "❌ FAIL";
                    export += $"{status} | {result.name} | {result.description}\n";
                    export += $"  Duration: {result.duration:F2}ms | Message: {result.message}\n\n";
                }
                
                Console.WriteLine(export);
                Console.WriteLine("✅ Test results exported");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error exporting test results: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Reset all test data
        /// </summary>
        private void ResetTestData()
        {
            try
            {
                Console.WriteLine("🔄 Resetting all test data...");
                
                var slots = saveManager.GetAllSaveSlots();
                foreach (var slot in slots)
                {
                    saveManager.DeleteSave(slot.slotID);
                }
                
                testResults.Clear();
                testStartTime = DateTime.MinValue;
                testEndTime = DateTime.MinValue;
                
                Console.WriteLine("✅ All test data reset");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error resetting test data: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Show test summary
        /// </summary>
        private void ShowTestSummary()
        {
            if (testResults.Count == 0)
            {
                Console.WriteLine("📊 No test results to display");
                return;
            }
            
            Console.WriteLine("📊 Test Summary:");
            Console.WriteLine("================");
            
            int totalTests = testResults.Count;
            int passedTests = testResults.Count(r => r.success);
            int failedTests = totalTests - passedTests;
            double successRate = (double)passedTests / totalTests * 100.0;
            
            double totalDuration = testResults.Sum(r => r.duration);
            double avgDuration = totalDuration / totalTests;
            
            Console.WriteLine($"Total Tests: {totalTests}");
            Console.WriteLine($"Passed: {passedTests}");
            Console.WriteLine($"Failed: {failedTests}");
            Console.WriteLine($"Success Rate: {successRate:F1}%");
            Console.WriteLine($"Total Duration: {totalDuration:F2}ms");
            Console.WriteLine($"Average Duration: {avgDuration:F2}ms");
            
            if (testStartTime != DateTime.MinValue && testEndTime != DateTime.MinValue)
            {
                Console.WriteLine($"Test Run Time: {(testEndTime - testStartTime).TotalSeconds:F2} seconds");
            }
            
            // Show failed tests
            if (failedTests > 0)
            {
                Console.WriteLine("\n❌ Failed Tests:");
                foreach (var result in testResults.Where(r => !r.success))
                {
                    Console.WriteLine($"  - {result.name}: {result.message}");
                }
            }
            
            OnTestCompleted?.Invoke(this, $"Tests completed: {passedTests}/{totalTests} passed");
        }
        
        /// <summary>
        /// Create sample game data for testing
        /// </summary>
        private void CreateSampleGameData()
        {
            testGameData = new GameData();
            testGameData.InitializeNewGame();
            
            // Set some sample data
            testGameData.playerLevel = 5;
            testGameData.playerExperience = 1250;
            testGameData.totalBattlesWon = 12;
            testGameData.totalBattlesLost = 3;
            testGameData.totalSpiritsCaptured = 8;
            testGameData.totalSpiritsDiscovered = 15;
            
            // Add some items
            testGameData.inventoryCounts["healing_potion"] = 5;
            testGameData.inventoryCounts["capture_ball"] = 10;
            testGameData.inventoryCounts["currency"] = 1500;
            
            // Set some flags
            testGameData.onboardingFlags["TutorialCompleted"] = true;
            testGameData.onboardingFlags["FirstBattleWon"] = true;
            testGameData.onboardingFlags["FirstSpiritCaptured"] = true;
            
            // Add some captured spirits
            testGameData.capturedSpiritIDs.Add("starter_spirit");
            testGameData.capturedSpiritIDs.Add("fire_spirit");
            testGameData.capturedSpiritIDs.Add("water_spirit");
            
            // Add some discovered spirits
            testGameData.discoveredSpiritIDs.Add("electric_spirit");
            testGameData.discoveredSpiritIDs.Add("grass_spirit");
            
            Console.WriteLine("✅ Sample game data created for testing");
        }
        
        /// <summary>
        /// Validate game data integrity
        /// </summary>
        private bool ValidateGameData(GameData gameData)
        {
            try
            {
                if (gameData == null) return false;
                
                // Basic validation
                if (gameData.SchemaVersion <= 0) return false;
                if (gameData.playerLevel < 0) return false;
                if (gameData.playerExperience < 0) return false;
                
                // Check for data consistency
                if (gameData.totalSpiritsCaptured > gameData.totalSpiritsDiscovered) return false;
                if (gameData.totalBattlesWon < 0 || gameData.totalBattlesLost < 0) return false;
                
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
    
    /// <summary>
    /// Result of a test operation
    /// </summary>
    [Serializable]
    public class TestResult
    {
        public string name;
        public string description;
        public bool success;
        public string message;
        public double duration;
        public DateTime timestamp;
        
        public TestResult(string name, string description)
        {
            this.name = name;
            this.description = description;
            this.success = false;
            this.message = "";
            this.duration = 0;
            this.timestamp = DateTime.Now;
        }
        
        public override string ToString()
        {
            string status = success ? "✅ PASS" : "❌ FAIL";
            return $"{status} | {name} | {duration:F2}ms | {message}";
        }
    }
}