using System;
using System.IO;
using System.Collections.Generic;
using System.Text;

namespace MIFF.Core
{
    /// <summary>
    /// Abstracts file I/O operations for save/load system
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SaveStorage
    {
        [Header("Storage Configuration")]
        public string saveDirectory = "Saves";
        public string saveFileExtension = ".save";
        public string backupFileExtension = ".backup";
        public string metadataFileExtension = ".meta";
        public bool enableBackups = true;
        public bool enableCompression = false;
        public bool enableEncryption = false;
        
        [Header("File Management")]
        public int maxBackupFiles = 3;
        public bool autoCreateDirectory = true;
        public bool validateFileIntegrity = true;
        public bool enableFileLocking = false;
        
        [Header("Remix Hooks")]
        public bool enableCustomStorage = true;
        public bool enableCustomValidation = true;
        public bool enableCustomCompression = true;
        public bool enableCustomEncryption = true;
        
        // Events for remixers to hook into
        public event Action<SaveStorage, string> OnFileWritten;
        public event Action<SaveStorage, string> OnFileRead;
        public event Action<SaveStorage, string> OnFileDeleted;
        public event Action<SaveStorage, string> OnFileCorrupted;
        public event Action<SaveStorage, string> OnBackupCreated;
        
        // File locking for concurrent access
        private Dictionary<string, object> fileLocks = new Dictionary<string, object>();
        private readonly object lockObject = new object();
        
        public SaveStorage()
        {
            InitializeStorage();
        }
        
        /// <summary>
        /// Initialize storage system
        /// </summary>
        private void InitializeStorage()
        {
            try
            {
                if (autoCreateDirectory && !Directory.Exists(saveDirectory))
                {
                    Directory.CreateDirectory(saveDirectory);
                    Console.WriteLine($"Created save directory: {saveDirectory}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing storage: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Write data to file
        /// </summary>
        public bool WriteToFile(string path, string data)
        {
            if (string.IsNullOrEmpty(path) || string.IsNullOrEmpty(data))
            {
                Console.WriteLine("Error: Invalid path or data");
                return false;
            }
            
            try
            {
                // Ensure directory exists
                string directory = Path.GetDirectoryName(path);
                if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }
                
                // Acquire file lock if enabled
                if (enableFileLocking)
                {
                    lock (GetFileLock(path))
                    {
                        return PerformWrite(path, data);
                    }
                }
                else
                {
                    return PerformWrite(path, data);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error writing to file {path}: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Perform actual write operation
        /// </summary>
        private bool PerformWrite(string path, string data)
        {
            try
            {
                // Create backup if enabled
                if (enableBackups && File.Exists(path))
                {
                    CreateBackup(path);
                }
                
                // Apply compression if enabled
                if (enableCompression)
                {
                    data = CompressData(data);
                }
                
                // Apply encryption if enabled
                if (enableEncryption)
                {
                    data = EncryptData(data);
                }
                
                // Write data to file
                File.WriteAllText(path, data, Encoding.UTF8);
                
                // Validate file integrity if enabled
                if (validateFileIntegrity)
                {
                    if (!ValidateFileIntegrity(path, data))
                    {
                        Console.WriteLine($"File integrity validation failed for {path}");
                        return false;
                    }
                }
                
                // Trigger event
                OnFileWritten?.Invoke(this, path);
                
                Console.WriteLine($"Successfully wrote to file: {path}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PerformWrite for {path}: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Read data from file
        /// </summary>
        public string ReadFromFile(string path)
        {
            if (string.IsNullOrEmpty(path) || !File.Exists(path))
            {
                Console.WriteLine($"Error: File not found: {path}");
                return null;
            }
            
            try
            {
                // Acquire file lock if enabled
                if (enableFileLocking)
                {
                    lock (GetFileLock(path))
                    {
                        return PerformRead(path);
                    }
                }
                else
                {
                    return PerformRead(path);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading from file {path}: {ex.Message}");
                return null;
            }
        }
        
        /// <summary>
        /// Perform actual read operation
        /// </summary>
        private string PerformRead(string path)
        {
            try
            {
                // Read data from file
                string data = File.ReadAllText(path, Encoding.UTF8);
                
                // Apply decryption if enabled
                if (enableEncryption)
                {
                    data = DecryptData(data);
                }
                
                // Apply decompression if enabled
                if (enableCompression)
                {
                    data = DecompressData(data);
                }
                
                // Validate file integrity if enabled
                if (validateFileIntegrity)
                {
                    if (!ValidateFileIntegrity(path, data))
                    {
                        Console.WriteLine($"File integrity validation failed for {path}");
                        OnFileCorrupted?.Invoke(this, path);
                        return null;
                    }
                }
                
                // Trigger event
                OnFileRead?.Invoke(this, path);
                
                Console.WriteLine($"Successfully read from file: {path}");
                return data;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PerformRead for {path}: {ex.Message}");
                return null;
            }
        }
        
        /// <summary>
        /// Delete file
        /// </summary>
        public bool DeleteFile(string path)
        {
            if (string.IsNullOrEmpty(path) || !File.Exists(path))
            {
                Console.WriteLine($"Error: File not found: {path}");
                return false;
            }
            
            try
            {
                // Acquire file lock if enabled
                if (enableFileLocking)
                {
                    lock (GetFileLock(path))
                    {
                        return PerformDelete(path);
                    }
                }
                else
                {
                    return PerformDelete(path);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting file {path}: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Perform actual delete operation
        /// </summary>
        private bool PerformDelete(string path)
        {
            try
            {
                // Delete the file
                File.Delete(path);
                
                // Clean up file lock
                if (enableFileLocking)
                {
                    lock (lockObject)
                    {
                        fileLocks.Remove(path);
                    }
                }
                
                // Trigger event
                OnFileDeleted?.Invoke(this, path);
                
                Console.WriteLine($"Successfully deleted file: {path}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PerformDelete for {path}: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Get save directory path
        /// </summary>
        public string GetSaveDirectory()
        {
            return Path.GetFullPath(saveDirectory);
        }
        
        /// <summary>
        /// Get full path for save file
        /// </summary>
        public string GetSaveFilePath(string slotID)
        {
            return Path.Combine(saveDirectory, $"{slotID}{saveFileExtension}");
        }
        
        /// <summary>
        /// Get full path for metadata file
        /// </summary>
        public string GetMetadataFilePath(string slotID)
        {
            return Path.Combine(saveDirectory, $"{slotID}{metadataFileExtension}");
        }
        
        /// <summary>
        /// Get full path for backup file
        /// </summary>
        public string GetBackupFilePath(string slotID, int backupIndex = 0)
        {
            string backupName = backupIndex == 0 ? "backup" : $"backup_{backupIndex}";
            return Path.Combine(saveDirectory, $"{slotID}_{backupName}{backupFileExtension}");
        }
        
        /// <summary>
        /// Check if save file exists
        /// </summary>
        public bool SaveFileExists(string slotID)
        {
            string path = GetSaveFilePath(slotID);
            return File.Exists(path);
        }
        
        /// <summary>
        /// Check if metadata file exists
        /// </summary>
        public bool MetadataFileExists(string slotID)
        {
            string path = GetMetadataFilePath(slotID);
            return File.Exists(path);
        }
        
        /// <summary>
        /// List all save files in directory
        /// </summary>
        public List<string> ListSaveFiles()
        {
            var saveFiles = new List<string>();
            
            try
            {
                if (!Directory.Exists(saveDirectory))
                    return saveFiles;
                
                string[] files = Directory.GetFiles(saveDirectory, $"*{saveFileExtension}");
                foreach (string file in files)
                {
                    string fileName = Path.GetFileNameWithoutExtension(file);
                    saveFiles.Add(fileName);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error listing save files: {ex.Message}");
            }
            
            return saveFiles;
        }
        
        /// <summary>
        /// Get file size in bytes
        /// </summary>
        public long GetFileSize(string path)
        {
            try
            {
                if (File.Exists(path))
                {
                    FileInfo fileInfo = new FileInfo(path);
                    return fileInfo.Length;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting file size for {path}: {ex.Message}");
            }
            
            return 0;
        }
        
        /// <summary>
        /// Get file creation time
        /// </summary>
        public DateTime GetFileCreationTime(string path)
        {
            try
            {
                if (File.Exists(path))
                {
                    FileInfo fileInfo = new FileInfo(path);
                    return fileInfo.CreationTime;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting creation time for {path}: {ex.Message}");
            }
            
            return DateTime.MinValue;
        }
        
        /// <summary>
        /// Get file last modified time
        /// </summary>
        public DateTime GetFileLastModifiedTime(string path)
        {
            try
            {
                if (File.Exists(path))
                {
                    FileInfo fileInfo = new FileInfo(path);
                    return fileInfo.LastWriteTime;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting last modified time for {path}: {ex.Message}");
            }
            
            return DateTime.MinValue;
        }
        
        /// <summary>
        /// Create backup of existing file
        /// </summary>
        private void CreateBackup(string originalPath)
        {
            try
            {
                // Rotate existing backups
                for (int i = maxBackupFiles - 1; i > 0; i--)
                {
                    string oldBackup = $"{originalPath}.backup_{i}";
                    string newBackup = $"{originalPath}.backup_{i + 1}";
                    
                    if (File.Exists(oldBackup))
                    {
                        if (i + 1 < maxBackupFiles)
                        {
                            File.Move(oldBackup, newBackup);
                        }
                        else
                        {
                            File.Delete(oldBackup);
                        }
                    }
                }
                
                // Create new backup
                string backupPath = $"{originalPath}.backup_1";
                File.Copy(originalPath, backupPath);
                
                OnBackupCreated?.Invoke(this, backupPath);
                Console.WriteLine($"Created backup: {backupPath}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating backup for {originalPath}: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Get file lock for concurrent access
        /// </summary>
        private object GetFileLock(string path)
        {
            lock (lockObject)
            {
                if (!fileLocks.ContainsKey(path))
                {
                    fileLocks[path] = new object();
                }
                return fileLocks[path];
            }
        }
        
        /// <summary>
        /// Validate file integrity
        /// </summary>
        private bool ValidateFileIntegrity(string path, string data)
        {
            try
            {
                // Basic validation - check if file can be read and contains data
                if (string.IsNullOrEmpty(data))
                    return false;
                
                // Check file size
                long fileSize = GetFileSize(path);
                if (fileSize == 0)
                    return false;
                
                // Additional validation can be added here
                // For example, check file headers, checksums, etc.
                
                return true;
            }
            catch
            {
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
        /// Clean up old backup files
        /// </summary>
        public void CleanupOldBackups()
        {
            try
            {
                if (!Directory.Exists(saveDirectory))
                    return;
                
                string[] backupFiles = Directory.GetFiles(saveDirectory, $"*{backupFileExtension}");
                var backupGroups = new Dictionary<string, List<string>>();
                
                // Group backups by slot ID
                foreach (string backupFile in backupFiles)
                {
                    string fileName = Path.GetFileName(backupFile);
                    string slotID = fileName.Split('_')[0];
                    
                    if (!backupGroups.ContainsKey(slotID))
                        backupGroups[slotID] = new List<string>();
                    
                    backupGroups[slotID].Add(backupFile);
                }
                
                // Clean up excess backups for each slot
                foreach (var kvp in backupGroups)
                {
                    var backups = kvp.Value;
                    if (backups.Count > maxBackupFiles)
                    {
                        // Sort by creation time (oldest first)
                        backups.Sort((a, b) => GetFileCreationTime(a).CompareTo(GetFileCreationTime(b)));
                        
                        // Remove oldest backups
                        int toRemove = backups.Count - maxBackupFiles;
                        for (int i = 0; i < toRemove; i++)
                        {
                            try
                            {
                                File.Delete(backups[i]);
                                Console.WriteLine($"Cleaned up old backup: {backups[i]}");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error cleaning up backup {backups[i]}: {ex.Message}");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error cleaning up old backups: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Get storage statistics
        /// </summary>
        public StorageStats GetStorageStats()
        {
            var stats = new StorageStats();
            
            try
            {
                if (!Directory.Exists(saveDirectory))
                    return stats;
                
                string[] saveFiles = Directory.GetFiles(saveDirectory, $"*{saveFileExtension}");
                string[] backupFiles = Directory.GetFiles(saveDirectory, $"*{backupFileExtension}");
                string[] metadataFiles = Directory.GetFiles(saveDirectory, $"*{metadataFileExtension}");
                
                stats.totalSaveFiles = saveFiles.Length;
                stats.totalBackupFiles = backupFiles.Length;
                stats.totalMetadataFiles = metadataFiles.Length;
                
                long totalSize = 0;
                foreach (string file in saveFiles)
                {
                    totalSize += GetFileSize(file);
                }
                stats.totalSaveSizeBytes = totalSize;
                
                stats.saveDirectory = GetSaveDirectory();
                stats.lastCleanupDate = DateTime.Now; // This could be stored and retrieved
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting storage stats: {ex.Message}");
            }
            
            return stats;
        }
        
        /// <summary>
        /// Get storage summary
        /// </summary>
        public string GetStorageSummary()
        {
            var stats = GetStorageStats();
            string size = FormatFileSize(stats.totalSaveSizeBytes);
            return $"Storage | Saves: {stats.totalSaveFiles} | Backups: {stats.totalBackupFiles} | " +
                   $"Metadata: {stats.totalMetadataFiles} | Total Size: {size}";
        }
        
        /// <summary>
        /// Format file size for display
        /// </summary>
        private string FormatFileSize(long bytes)
        {
            if (bytes < 1024) return $"{bytes} B";
            if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
            if (bytes < 1024 * 1024 * 1024) return $"{bytes / (1024.0 * 1024.0):F1} MB";
            return $"{bytes / (1024.0 * 1024.0 * 1024.0):F1} GB";
        }
    }
    
    /// <summary>
    /// Statistics for save storage
    /// </summary>
    [Serializable]
    public class StorageStats
    {
        public int totalSaveFiles;
        public int totalBackupFiles;
        public int totalMetadataFiles;
        public long totalSaveSizeBytes;
        public string saveDirectory;
        public DateTime lastCleanupDate;
        
        public override string ToString()
        {
            return $"Saves: {totalSaveFiles}, Backups: {totalBackupFiles}, Metadata: {totalMetadataFiles}";
        }
    }
}