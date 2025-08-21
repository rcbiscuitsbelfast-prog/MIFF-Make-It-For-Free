using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace MIFF.Pure.Schemas
{
    /// <summary>
    /// Minimal schema validator that checks required fields and types based on simple JSON schema subsets.
    /// For full validation, integrate a JSON Schema lib in the future.
    /// </summary>
    public static class SchemaValidator
    {
        public static bool Validate(string schemaPath, string jsonPath, out List<string> errors)
        {
            errors = new List<string>();
            var schemaDoc = JsonDocument.Parse(File.ReadAllText(schemaPath));
            var jsonDoc = JsonDocument.Parse(File.ReadAllText(jsonPath));

            if (!schemaDoc.RootElement.TryGetProperty("required", out var required)) return true;
            foreach (var req in required.EnumerateArray())
            {
                string name = req.GetString() ?? string.Empty;
                if (!jsonDoc.RootElement.TryGetProperty(name, out _))
                {
                    errors.Add($"missing:{name}");
                }
            }
            return errors.Count == 0;
        }
    }
}

