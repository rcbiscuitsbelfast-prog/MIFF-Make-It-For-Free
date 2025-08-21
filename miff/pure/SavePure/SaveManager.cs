using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace MIFF.Pure.Save
{
    /// <summary>
    /// Handles JSON save/load with checksum and basic validation.
    /// </summary>
    public class SaveManager
    {
        private readonly SaveValidator _validator = new SaveValidator();

        public void SaveGame(SaveSnapshot snapshot, string path)
        {
            if (snapshot == null) throw new ArgumentNullException(nameof(snapshot));
            snapshot.TimestampUtc = DateTime.UtcNow;
            snapshot.Checksum = ComputeChecksum(snapshot);
            var json = JsonSerializer.Serialize(snapshot, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(path, json);
        }

        public SaveSnapshot LoadGame(string path)
        {
            var json = File.ReadAllText(path);
            var snapshot = JsonSerializer.Deserialize<SaveSnapshot>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                           ?? throw new InvalidDataException("Invalid save data");
            if (!ValidateSnapshot(snapshot))
            {
                throw new InvalidDataException("Save validation failed");
            }
            return snapshot;
        }

        public bool ValidateSnapshot(SaveSnapshot snapshot)
        {
            return _validator.Validate(snapshot, out _);
        }

        private string ComputeChecksum(SaveSnapshot snapshot)
        {
            // Compute checksum from core fields to detect corruption. Exclude existing checksum and timestamp variance.
            var toHash = $"{snapshot.Version}|{snapshot.PlayerId}|{snapshot.ZoneId}|{snapshot.PartyRoster.Count}|{snapshot.Inventory.Count}";
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(toHash));
            return Convert.ToBase64String(bytes);
        }
    }
}

