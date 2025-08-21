using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace MIFF.Core
{
    /// <summary>
    /// Handles serialization and deserialization of GameData
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SaveManager
    {
        public bool enableAutoSave = false;
        public bool enableSaveValidation = true;
        public bool enableSaveCompression = false;
        public bool enableSaveEncryption = false;
        public bool enableSaveBackups = true;
        public bool enableSaveMetadata = true;
        
        public int maxSaveSlots = 10;
        public string defaultSlotID = "slot1";
        public string autoSaveSlotID = "autosave";
        public float autoSaveInterval = 300.0f; // 5 minutes
        public bool enableQuickSave = true;
        public string quickSaveSlotID = "quicksave";
        
        public bool enablePrettyPrint = false;
        public bool enableIndentation = true;
        public bool enableNullHandling = true;
        public bool enableTypeInfo = false;
        
        public bool enableCustomSerialization = true;
        public bool enableCustomValidation = true;
        public bool enableCustomCompression = true;
        public bool enableCustomEncryption = true;
        
        // Events for remixers to hook into
        public event Action<SaveManager, string> OnGameSaved;
        public event Action<SaveManager, string> OnGameLoaded;
        public event Action<SaveManager, string> OnSaveDeleted;
        public event Action<SaveManager, string> OnSaveCorrupted;
        public event Action<SaveManager, SaveSlot> OnSaveSlotCreated;
        public event Action<SaveManager, SaveSlot> OnSaveSlotUpdated;
        
        // Core components
        private SaveStorage saveStorage;
        private Dictionary<string, SaveSlot> saveSlots;
        private SaveSlot currentSaveSlot;
        private DateTime lastAutoSave;
        private GameData currentGameData;
        
        // JSON serialization options
        private JsonSerializerOptions jsonOptions;
        
        public SaveManager()
        {
            InitializeSaveManager();
        }
        
        /// <summary>
        /// Initialize with SaveStorage
        /// </summary>
        public SaveManager(SaveStorage storage)
        {
            saveStorage = storage;
            InitializeSaveManager();
        }
        
        /// <summary>
        /// Initialize the save manager
        /// </summary>
        private void InitializeSaveManager()
        {
            if (saveStorage == null)
            {
                saveStorage = new SaveStorage();
            }
            
            saveSlots = new Dictionary<string, SaveSlot>();
            currentSaveSlot = null;
            lastAutoSave = DateTime.MinValue;
            
            // Configure JSON serialization options
            jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = enableIndentation,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                IgnoreNullValues = !enableNullHandling,
                IncludeFields = true,
                MaxDepth = 64
            };
            
            // Load existing save slots
            LoadSaveSlots();
        }

        /// <summary>
        /// Set the current in-memory GameData used by parameterless SaveGame
        /// </summary>
        public void SetCurrentGameData(GameData gameData)
        {
            currentGameData = gameData;
        }

        /// <summary>
        /// Save game using the internally set current GameData
        /// </summary>
        public bool SaveGame(string slotID)
        {
            if (currentGameData == null)
            {
                Console.WriteLine("Error: No current GameData set. Call SetCurrentGameData first or use SaveGame(slotID, gameData).");
                return false;
            }
            return SaveGame(slotID, currentGameData, string.Empty);
        }
        
        /// <summary>
        /// Save game to specified slot
        /// </summary>
        public bool SaveGame(string slotID, GameData gameData, string playerName = "")
        {
            if (string.IsNullOrEmpty(slotID) || gameData == null)
            {
                Console.WriteLine("Error: Invalid slot ID or game data");
                return false;
            }
            
            try
            {
                // Create or update save slot
                SaveSlot saveSlot = GetOrCreateSaveSlot(slotID, playerName);
                
                // Update save slot with current game data
                saveSlot.UpdateFromGameData(gameData);
                
                // Set technical information
                saveSlot.gameVersion = "1.0.0"; // This could come from game config
                saveSlot.saveFormatVersion = "1.0";
                saveSlot.lastSaveDate = DateTime.Now;
                
                // Serialize game data
                string serializedData = SerializeGameData(gameData);
                if (string.IsNullOrEmpty(serializedData))
                {
                    Console.WriteLine("Error: Failed to serialize game data");
                    return false;
                }
                
                // Write save file
                string savePath = saveStorage.GetSaveFilePath(slotID);
                if (!saveStorage.WriteToFile(savePath, serializedData))
                {
                    Console.WriteLine("Error: Failed to write save file");
                    return false;
                }
                
                // Update file size
                saveSlot.fileSizeBytes = saveStorage.GetFileSize(savePath);
                
                // Save metadata if enabled
                if (enableSaveMetadata)
                {
                    SaveMetadata(slotID, saveSlot);
                }
                
                // Update current save slot
                currentSaveSlot = saveSlot;
                
                // Trigger event
                OnGameSaved?.Invoke(this, slotID);
                OnSaveSlotUpdated?.Invoke(this, saveSlot);
                
                Console.WriteLine($"Game saved successfully to slot: {slotID}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving game: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Load game from specified slot
        /// </summary>
        public GameData LoadGame(string slotID)
        {
            if (string.IsNullOrEmpty(slotID))
            {
                Console.WriteLine("Error: Invalid slot ID");
                return null;
            }
            
            try
            {
                // Check if save file exists
                if (!saveStorage.SaveFileExists(slotID))
                {
                    Console.WriteLine($"Error: Save file not found for slot: {slotID}");
                    return null;
                }
                
                // Read save file
                string savePath = saveStorage.GetSaveFilePath(slotID);
                string serializedData = saveStorage.ReadFromFile(savePath);
                
                if (string.IsNullOrEmpty(serializedData))
                {
                    Console.WriteLine("Error: Failed to read save file");
                    return null;
                }
                
                // Deserialize game data
                GameData gameData = DeserializeGameData(serializedData);
                if (gameData == null)
                {
                    Console.WriteLine("Error: Failed to deserialize game data");
                    return null;
                }
                
                // Validate loaded data if enabled
                if (enableSaveValidation)
                {
                    if (!ValidateGameData(gameData))
                    {
                        Console.WriteLine("Error: Loaded game data validation failed");
                        return null;
                    }
                }
                
                // Update save slot
                if (saveSlots.ContainsKey(slotID))
                {
                    var saveSlot = saveSlots[slotID];
                    saveSlot.UpdateLastLoadDate();
                    currentSaveSlot = saveSlot;
                    
                    OnSaveSlotUpdated?.Invoke(this, saveSlot);
                }
                
                // Cache as current GameData and trigger event
                currentGameData = gameData;
                OnGameLoaded?.Invoke(this, slotID);
                
                Console.WriteLine($"Game loaded successfully from slot: {slotID}");
                return gameData;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading game: {ex.Message}");
                return null;
            }
        }
        
        /// <summary>
        /// Delete save from specified slot
        /// </summary>
        public bool DeleteSave(string slotID)
        {
            if (string.IsNullOrEmpty(slotID))
            {
                Console.WriteLine("Error: Invalid slot ID");
                return false;
            }
            
            try
            {
                // Check if save file exists
                if (!saveStorage.SaveFileExists(slotID))
                {
                    Console.WriteLine($"Error: Save file not found for slot: {slotID}");
                    return false;
                }
                
                // Delete save file
                string savePath = saveStorage.GetSaveFilePath(slotID);
                if (!saveStorage.DeleteFile(savePath))
                {
                    Console.WriteLine("Error: Failed to delete save file");
                    return false;
                }
                
                // Delete metadata file if it exists
                if (enableSaveMetadata && saveStorage.MetadataFileExists(slotID))
                {
                    string metadataPath = saveStorage.GetMetadataFilePath(slotID);
                    saveStorage.DeleteFile(metadataPath);
                }
                
                // Remove from save slots
                if (saveSlots.ContainsKey(slotID))
                {
                    saveSlots.Remove(slotID);
                }
                
                // Clear current save slot if it was the deleted one
                if (currentSaveSlot?.slotID == slotID)
                {
                    currentSaveSlot = null;
                }
                
                // Trigger event
                OnSaveDeleted?.Invoke(this, slotID);
                
                Console.WriteLine($"Save deleted successfully from slot: {slotID}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting save: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// List all available save slots
        /// </summary>
        public List<string> ListSaveSlots()
        {
            return saveSlots.Keys.ToList();
        }
        
        /// <summary>
        /// Get save slot information
        /// </summary>
        public SaveSlot GetSaveSlot(string slotID)
        {
            if (string.IsNullOrEmpty(slotID) || !saveSlots.ContainsKey(slotID))
                return null;
            
            return saveSlots[slotID];
        }
        
        /// <summary>
        /// Get all save slots
        /// </summary>
        public List<SaveSlot> GetAllSaveSlots()
        {
            return saveSlots.Values.ToList();
        }
        
        /// <summary>
        /// Get current save slot
        /// </summary>
        public SaveSlot GetCurrentSaveSlot()
        {
            return currentSaveSlot;
        }
        
        /// <summary>
        /// Create new save slot
        /// </summary>
        public SaveSlot CreateSaveSlot(string slotID, string slotName = "", string playerName = "")
        {
            if (string.IsNullOrEmpty(slotID))
            {
                Console.WriteLine("Error: Invalid slot ID");
                return null;
            }
            
            // Check if slot already exists
            if (saveSlots.ContainsKey(slotID))
            {
                Console.WriteLine($"Error: Save slot already exists: {slotID}");
                return saveSlots[slotID];
            }
            
            // Check if we've reached the maximum number of slots
            if (saveSlots.Count >= maxSaveSlots)
            {
                Console.WriteLine($"Error: Maximum number of save slots reached ({maxSaveSlots})");
                return null;
            }
            
            try
            {
                // Create new save slot
                var saveSlot = new SaveSlot(slotID, slotName, playerName);
                saveSlots[slotID] = saveSlot;
                
                // Trigger event
                OnSaveSlotCreated?.Invoke(this, saveSlot);
                
                Console.WriteLine($"Created new save slot: {slotID}");
                return saveSlot;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating save slot: {ex.Message}");
                return null;
            }
        }
        
        /// <summary>
        /// Quick save game
        /// </summary>
        public bool QuickSave(GameData gameData)
        {
            if (!enableQuickSave)
            {
                Console.WriteLine("Quick save is disabled");
                return false;
            }
            
            return SaveGame(quickSaveSlotID, gameData);
        }
        
        /// <summary>
        /// Auto save game
        /// </summary>
        public bool AutoSave(GameData gameData)
        {
            if (!enableAutoSave)
            {
                return false;
            }
            
            // Check if enough time has passed since last auto save
            if ((DateTime.Now - lastAutoSave).TotalSeconds < autoSaveInterval)
            {
                return false;
            }
            
            bool result = SaveGame(autoSaveSlotID, gameData);
            if (result)
            {
                lastAutoSave = DateTime.Now;
            }
            
            return result;
        }
        
        /// <summary>
        /// Check if auto save is due
        /// </summary>
        public bool IsAutoSaveDue()
        {
            if (!enableAutoSave)
                return false;
            
            return (DateTime.Now - lastAutoSave).TotalSeconds >= autoSaveInterval;
        }
        
        /// <summary>
        /// Get or create save slot
        /// </summary>
        private SaveSlot GetOrCreateSaveSlot(string slotID, string playerName)
        {
            if (saveSlots.ContainsKey(slotID))
            {
                return saveSlots[slotID];
            }
            
            return CreateSaveSlot(slotID, "", playerName);
        }
        
        /// <summary>
        /// Serialize game data to JSON
        /// </summary>
        private string SerializeGameData(GameData gameData)
        {
            try
            {
                if (enableCustomSerialization)
                {
                    // Custom serialization logic can be implemented here
                    // For now, use standard JSON serialization
                }
                
                string json = JsonSerializer.Serialize(gameData, jsonOptions);
                
                // Apply compression if enabled
                if (enableSaveCompression)
                {
                    json = CompressData(json);
                }
                
                // Apply encryption if enabled
                if (enableSaveEncryption)
                {
                    json = EncryptData(json);
                }
                
                return json;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error serializing game data: {ex.Message}");
                return null;
            }
        }
        
        /// <summary>
        /// Deserialize game data from JSON
        /// </summary>
        private GameData DeserializeGameData(string serializedData)
        {
            try
            {
                string json = serializedData;
                
                // Apply decryption if enabled
                if (enableSaveEncryption)
                {
                    json = DecryptData(json);
                }
                
                // Apply decompression if enabled
                if (enableSaveCompression)
                {
                    json = DecompressData(json);
                }
                
                if (enableCustomSerialization)
                {
                    // Custom deserialization logic can be implemented here
                    // For now, use standard JSON deserialization
                }
                
                var gameData = JsonSerializer.Deserialize<GameData>(json, jsonOptions);
                return gameData;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deserializing game data: {ex.Message}");
                return null;
            }
        }
        
        /// <summary>
        /// Save metadata for a save slot
        /// </summary>
        private bool SaveMetadata(string slotID, SaveSlot saveSlot)
        {
            try
            {
                string metadataPath = saveStorage.GetMetadataFilePath(slotID);
                string metadataJson = JsonSerializer.Serialize(saveSlot, jsonOptions);
                
                return saveStorage.WriteToFile(metadataPath, metadataJson);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving metadata: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Load metadata for a save slot
        /// </summary>
        private SaveSlot LoadMetadata(string slotID)
        {
            try
            {
                if (!saveStorage.MetadataFileExists(slotID))
                    return null;
                
                string metadataPath = saveStorage.GetMetadataFilePath(slotID);
                string metadataJson = saveStorage.ReadFromFile(metadataPath);
                
                if (string.IsNullOrEmpty(metadataJson))
                    return null;
                
                var saveSlot = JsonSerializer.Deserialize<SaveSlot>(metadataJson, jsonOptions);
                return saveSlot;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading metadata: {ex.Message}");
                return null;
            }
        }
        
        /// <summary>
        /// Load all existing save slots
        /// </summary>
        private void LoadSaveSlots()
        {
            try
            {
                // Get list of save files
                var saveFiles = saveStorage.ListSaveFiles();
                
                foreach (string slotID in saveFiles)
                {
                    // Load metadata if available
                    SaveSlot saveSlot = LoadMetadata(slotID);
                    
                    if (saveSlot == null)
                    {
                        // Create basic save slot from file info
                        saveSlot = new SaveSlot(slotID);
                        saveSlot.lastSaveDate = saveStorage.GetFileLastModifiedTime(saveStorage.GetSaveFilePath(slotID));
                        saveSlot.fileSizeBytes = saveStorage.GetFileSize(saveStorage.GetSaveFilePath(slotID));
                    }
                    
                    saveSlots[slotID] = saveSlot;
                }
                
                Console.WriteLine($"Loaded {saveSlots.Count} save slots");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading save slots: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Validate loaded game data
        /// </summary>
        private bool ValidateGameData(GameData gameData)
        {
            try
            {
                if (gameData == null)
                    return false;
                
                // Basic validation
                if (GameData.SchemaVersion <= 0)
                    return false;
                
                if (enableCustomValidation)
                {
                    // Custom validation logic can be implemented here
                    // For example, check for required fields, validate ranges, etc.
                }
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating game data: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Compress data (placeholder for custom compression)
        /// </summary>
        private string CompressData(string data)
        {
            if (enableCustomCompression)
            {
                // Custom compression logic can be implemented here
                // For now, return data as-is
                return data;
            }
            
            return data;
        }
        
        /// <summary>
        /// Decompress data (placeholder for custom decompression)
        /// </summary>
        private string DecompressData(string data)
        {
            if (enableCustomCompression)
            {
                // Custom decompression logic can be implemented here
                // For now, return data as-is
                return data;
            }
            
            return data;
        }
        
        /// <summary>
        /// Encrypt data (placeholder for custom encryption)
        /// </summary>
        private string EncryptData(string data)
        {
            if (enableCustomEncryption)
            {
                // Custom encryption logic can be implemented here
                // For now, return data as-is
                return data;
            }
            
            return data;
        }
        
        /// <summary>
        /// Decrypt data (placeholder for custom decryption)
        /// </summary>
        private string DecryptData(string data)
        {
            if (enableCustomEncryption)
            {
                // Custom decryption logic can be implemented here
                // For now, return data as-is
                return data;
            }
            
            return data;
        }
        
        /// <summary>
        /// Get save manager summary
        /// </summary>
        public string GetSaveManagerSummary()
        {
            var slots = GetAllSaveSlots();
            int totalSlots = slots.Count;
            int validSlots = slots.Count(s => s.IsValid);
            int corruptedSlots = slots.Count(s => s.IsCorrupted);
            
            string current = currentSaveSlot != null ? $" | Current: {currentSaveSlot.slotID}" : "";
            string autoSave = enableAutoSave ? " | AutoSave: ON" : " | AutoSave: OFF";
            string quickSave = enableQuickSave ? " | QuickSave: ON" : " | QuickSave: OFF";
            
            return $"Save Manager | Slots: {totalSlots} | Valid: {validSlots} | Corrupted: {corruptedSlots}{current}{autoSave}{quickSave}";
        }
        
        /// <summary>
        /// Export save manager data
        /// </summary>
        public string ExportSaveManagerData()
        {
            var slots = GetAllSaveSlots();
            var storage = saveStorage.GetStorageStats();
            
            string export = $"Save Manager Export - {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n";
            export += $"Configuration: AutoSave={enableAutoSave}, QuickSave={enableQuickSave}, MaxSlots={maxSaveSlots}\n";
            export += $"Storage: {storage}\n\n";
            export += "Save Slots:\n";
            
            foreach (var slot in slots.OrderBy(s => s.slotID))
            {
                export += $"- {slot}\n";
            }
            
            return export;
        }
        
        /// <summary>
        /// Clean up old backups
        /// </summary>
        public void CleanupOldBackups()
        {
            if (saveStorage != null)
            {
                saveStorage.CleanupOldBackups();
            }
        }
    }
}