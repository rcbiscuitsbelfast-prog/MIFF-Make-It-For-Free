using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Spirits
{
    /// <summary>
    /// Console-based viewer for SpiritDex entries
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritDexViewer
    {
        [Header("Viewer Configuration")]
        public bool enableColorOutput = true;
        public bool enableDetailedView = false;
        public bool enableInteractiveMode = true;
        public bool enableSearchSuggestions = true;
        public bool enableStatisticsDisplay = true;
        
        [Header("Display Settings")]
        public int maxEntriesPerPage = 10;
        public bool enablePagination = true;
        public bool enableSorting = true;
        public bool enableFiltering = true;
        public string defaultSortBy = "Name";
        
        [Header("Remix Hooks")]
        public bool enableCustomCommands = true;
        public bool enableCustomDisplay = true;
        public bool enableCustomSearch = true;
        
        // Core components
        private SpiritDexManager spiritDexManager;
        private ViewMode currentViewMode;
        private SpiritDexFilter currentFilter;
        private SpiritDexSortCriteria currentSortBy;
        private bool currentSortAscending;
        
        // Events for remixers to hook into
        public event Action<SpiritDexViewer, string> OnViewerCommand;
        public event Action<SpiritDexViewer, SpiritDexEntry> OnEntrySelected;
        public event Action<SpiritDexViewer, ViewMode> OnViewModeChanged;
        
        public SpiritDexViewer()
        {
            InitializeViewer();
        }
        
        /// <summary>
        /// Initialize with SpiritDexManager
        /// </summary>
        public SpiritDexViewer(SpiritDexManager manager)
        {
            spiritDexManager = manager;
            InitializeViewer();
        }
        
        /// <summary>
        /// Initialize the viewer
        /// </summary>
        private void InitializeViewer()
        {
            if (spiritDexManager == null)
            {
                spiritDexManager = new SpiritDexManager();
            }
            
            currentViewMode = ViewMode.All;
            currentFilter = new SpiritDexFilter();
            currentSortBy = SpiritDexSortCriteria.Name;
            currentSortAscending = true;
        }
        
        /// <summary>
        /// Start interactive viewer
        /// </summary>
        public void StartInteractiveViewer()
        {
            Console.WriteLine("🔍 SpiritDex Viewer - Interactive Mode");
            Console.WriteLine("Type 'help' for available commands");
            Console.WriteLine("Type 'exit' to quit");
            Console.WriteLine();
            
            bool running = true;
            while (running)
            {
                try
                {
                    Console.Write("SpiritDex> ");
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
        /// Process viewer commands
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
                    
                case "list":
                    ListEntries(args);
                    break;
                    
                case "view":
                    if (args.Length > 0)
                    {
                        ViewEntry(args[0]);
                    }
                    else
                    {
                        Console.WriteLine("Usage: view <spiritID>");
                    }
                    break;
                    
                case "search":
                    if (args.Length > 0)
                    {
                        SearchEntries(string.Join(" ", args));
                    }
                    else
                    {
                        Console.WriteLine("Usage: search <search term>");
                    }
                    break;
                    
                case "filter":
                    ApplyFilter(args);
                    break;
                    
                case "sort":
                    ApplySort(args);
                    break;
                    
                case "stats":
                    ShowStatistics();
                    break;
                    
                case "mode":
                    if (args.Length > 0)
                    {
                        SetViewMode(args[0]);
                    }
                    else
                    {
                        ShowCurrentMode();
                    }
                    break;
                    
                case "clear":
                    ClearFilters();
                    break;
                    
                case "export":
                    ExportData();
                    break;
                    
                case "validate":
                    ValidateEntries();
                    break;
                    
                default:
                    Console.WriteLine($"Unknown command: {cmd}. Type 'help' for available commands.");
                    break;
            }
            
            // Trigger command event for remixers
            OnViewerCommand?.Invoke(this, command);
        }
        
        /// <summary>
        /// Show help information
        /// </summary>
        private void ShowHelp()
        {
            Console.WriteLine("📚 SpiritDex Viewer Commands:");
            Console.WriteLine("  list [filter]        - List entries with optional filter");
            Console.WriteLine("  view <spiritID>      - View detailed entry information");
            Console.WriteLine("  search <term>        - Search entries by text");
            Console.WriteLine("  filter <criteria>    - Apply filters (type, rarity, etc.)");
            Console.WriteLine("  sort <criteria>      - Sort entries (name, type, rarity, etc.)");
            Console.WriteLine("  stats                - Show SpiritDex statistics");
            Console.WriteLine("  mode <mode>          - Set view mode (all, discovered, captured)");
            Console.WriteLine("  clear                - Clear all filters");
            Console.WriteLine("  export               - Export data to JSON");
            Console.WriteLine("  validate             - Validate all entries");
            Console.WriteLine("  help                 - Show this help");
            Console.WriteLine("  exit/quit            - Exit the viewer");
            Console.WriteLine();
            Console.WriteLine("Filter Examples:");
            Console.WriteLine("  filter type:Pop      - Filter by primary type");
            Console.WriteLine("  filter rarity:Legendary - Filter by rarity");
            Console.WriteLine("  filter category:Starter - Filter by category");
            Console.WriteLine("  filter level:1-10   - Filter by level range");
            Console.WriteLine("  filter tag:evolves  - Filter by custom tag");
            Console.WriteLine();
            Console.WriteLine("Sort Examples:");
            Console.WriteLine("  sort name            - Sort by name (ascending)");
            Console.WriteLine("  sort type desc       - Sort by type (descending)");
            Console.WriteLine("  sort rarity          - Sort by rarity");
            Console.WriteLine("  sort level           - Sort by level");
            Console.WriteLine("  sort completion      - Sort by completion percentage");
        }
        
        /// <summary>
        /// List entries with optional filtering
        /// </summary>
        private void ListEntries(string[] args)
        {
            try
            {
                var entries = GetFilteredEntries();
                
                if (entries.Count == 0)
                {
                    Console.WriteLine("📭 No entries found matching current filters");
                    return;
                }
                
                // Apply sorting
                entries = spiritDexManager.SortSpirits(entries, currentSortBy, currentSortAscending);
                
                // Apply pagination
                if (enablePagination && entries.Count > maxEntriesPerPage)
                {
                    entries = entries.Take(maxEntriesPerPage).ToList();
                    Console.WriteLine($"📄 Showing first {maxEntriesPerPage} entries (use pagination for more)");
                }
                
                Console.WriteLine($"📚 Found {entries.Count} entries:");
                Console.WriteLine("=" * 80);
                
                foreach (var entry in entries)
                {
                    DisplayEntrySummary(entry);
                }
                
                Console.WriteLine("=" * 80);
                Console.WriteLine($"Total entries: {GetFilteredEntries().Count}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error listing entries: {ex.Message}");
            }
        }
        
        /// <summary>
        /// View detailed entry information
        /// </summary>
        private void ViewEntry(string spiritID)
        {
            try
            {
                var entry = spiritDexManager.GetEntryByID(spiritID);
                if (entry == null)
                {
                    // Try searching by name
                    entry = spiritDexManager.GetEntryByName(spiritID);
                }
                
                if (entry == null)
                {
                    Console.WriteLine($"❌ Spirit not found: {spiritID}");
                    return;
                }
                
                DisplayEntryDetailed(entry);
                OnEntrySelected?.Invoke(this, entry);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error viewing entry: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Search entries by text
        /// </summary>
        private void SearchEntries(string searchTerm)
        {
            try
            {
                var results = spiritDexManager.SearchSpirits(searchTerm, maxSearchResults);
                
                if (results.Count == 0)
                {
                    Console.WriteLine($"🔍 No entries found matching: {searchTerm}");
                    return;
                }
                
                Console.WriteLine($"🔍 Found {results.Count} entries matching '{searchTerm}':");
                Console.WriteLine("=" * 80);
                
                foreach (var entry in results)
                {
                    DisplayEntrySummary(entry);
                }
                
                Console.WriteLine("=" * 80);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error searching entries: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Apply filters
        /// </summary>
        private void ApplyFilter(string[] args)
        {
            try
            {
                if (args.Length == 0)
                {
                    ShowCurrentFilters();
                    return;
                }
                
                foreach (string arg in args)
                {
                    string[] parts = arg.Split(':');
                    if (parts.Length != 2) continue;
                    
                    string filterType = parts[0].ToLower();
                    string filterValue = parts[1];
                    
                    switch (filterType)
                    {
                        case "type":
                            if (Enum.TryParse<SpiritType>(filterValue, true, out var type))
                            {
                                currentFilter.primaryType = type;
                                Console.WriteLine($"✅ Filter applied: Primary Type = {type}");
                            }
                            break;
                            
                        case "secondary":
                            if (Enum.TryParse<SpiritType>(filterValue, true, out var secondaryType))
                            {
                                currentFilter.secondaryType = secondaryType;
                                Console.WriteLine($"✅ Filter applied: Secondary Type = {secondaryType}");
                            }
                            break;
                            
                        case "rarity":
                            if (Enum.TryParse<SpiritRarity>(filterValue, true, out var rarity))
                            {
                                currentFilter.rarity = rarity;
                                Console.WriteLine($"✅ Filter applied: Rarity = {rarity}");
                            }
                            break;
                            
                        case "category":
                            if (Enum.TryParse<SpiritCategory>(filterValue, true, out var category))
                            {
                                currentFilter.category = category;
                                Console.WriteLine($"✅ Filter applied: Category = {category}");
                            }
                            break;
                            
                        case "level":
                            string[] levelParts = filterValue.Split('-');
                            if (levelParts.Length == 2)
                            {
                                if (int.TryParse(levelParts[0], out int minLevel))
                                    currentFilter.minLevel = minLevel;
                                if (int.TryParse(levelParts[1], out int maxLevel))
                                    currentFilter.maxLevel = maxLevel;
                                Console.WriteLine($"✅ Filter applied: Level Range = {minLevel}-{maxLevel}");
                            }
                            break;
                            
                        case "tag":
                            currentFilter.customTag = filterValue;
                            Console.WriteLine($"✅ Filter applied: Custom Tag = {filterValue}");
                            break;
                            
                        case "completion":
                            if (float.TryParse(filterValue, out float minCompletion))
                            {
                                currentFilter.minCompletion = minCompletion;
                                Console.WriteLine($"✅ Filter applied: Min Completion = {minCompletion}%");
                            }
                            break;
                            
                        default:
                            Console.WriteLine($"❌ Unknown filter type: {filterType}");
                            break;
                    }
                }
                
                Console.WriteLine("🔍 Current filters applied. Use 'list' to see filtered results.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error applying filters: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Apply sorting
        /// </summary>
        private void ApplySort(string[] args)
        {
            try
            {
                if (args.Length == 0)
                {
                    ShowCurrentSort();
                    return;
                }
                
                string sortBy = args[0];
                bool ascending = true;
                
                if (args.Length > 1 && args[1].ToLower() == "desc")
                {
                    ascending = false;
                }
                
                if (Enum.TryParse<SpiritDexSortCriteria>(sortBy, true, out var sortCriteria))
                {
                    currentSortBy = sortCriteria;
                    currentSortAscending = ascending;
                    Console.WriteLine($"✅ Sort applied: {sortCriteria} {(ascending ? "Ascending" : "Descending")}");
                }
                else
                {
                    Console.WriteLine($"❌ Unknown sort criteria: {sortBy}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error applying sort: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Show statistics
        /// </summary>
        private void ShowStatistics()
        {
            try
            {
                var stats = spiritDexManager.GetStatistics();
                
                Console.WriteLine("📊 SpiritDex Statistics:");
                Console.WriteLine("=" * 50);
                Console.WriteLine($"Total Entries: {stats.totalEntries}");
                Console.WriteLine($"Completed: {stats.completedEntries}");
                Console.WriteLine($"Discovered: {stats.discoveredEntries}");
                Console.WriteLine($"Captured: {stats.capturedEntries}");
                Console.WriteLine($"Average Completion: {stats.averageCompletionPercentage:F1}%");
                Console.WriteLine();
                
                Console.WriteLine("Type Distribution:");
                foreach (var kvp in stats.typeDistribution)
                {
                    Console.WriteLine($"  {kvp.Key}: {kvp.Value:F1}%");
                }
                Console.WriteLine();
                
                Console.WriteLine("Rarity Distribution:");
                foreach (var kvp in stats.rarityDistribution)
                {
                    Console.WriteLine($"  {kvp.Key}: {kvp.Value:F1}%");
                }
                Console.WriteLine();
                
                Console.WriteLine("Category Distribution:");
                foreach (var kvp in stats.entriesByCategory)
                {
                    float percentage = stats.totalEntries > 0 ? (float)kvp.Value / stats.totalEntries * 100.0f : 0.0f;
                    Console.WriteLine($"  {kvp.Key}: {kvp.Value} ({percentage:F1}%)");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error showing statistics: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Set view mode
        /// </summary>
        private void SetViewMode(string mode)
        {
            try
            {
                if (Enum.TryParse<ViewMode>(mode, true, out var viewMode))
                {
                    currentViewMode = viewMode;
                    Console.WriteLine($"✅ View mode set to: {viewMode}");
                    OnViewModeChanged?.Invoke(this, viewMode);
                }
                else
                {
                    Console.WriteLine($"❌ Unknown view mode: {mode}");
                    Console.WriteLine("Available modes: All, Discovered, Captured, Unseen");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting view mode: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Show current mode
        /// </summary>
        private void ShowCurrentMode()
        {
            Console.WriteLine($"🔍 Current view mode: {currentViewMode}");
        }
        
        /// <summary>
        /// Show current filters
        /// </summary>
        private void ShowCurrentFilters()
        {
            Console.WriteLine("🔍 Current filters:");
            Console.WriteLine(currentFilter.ToString());
        }
        
        /// <summary>
        /// Show current sort
        /// </summary>
        private void ShowCurrentSort()
        {
            Console.WriteLine($"📊 Current sort: {currentSortBy} {(currentSortAscending ? "Ascending" : "Descending")}");
        }
        
        /// <summary>
        /// Clear all filters
        /// </summary>
        private void ClearFilters()
        {
            currentFilter = new SpiritDexFilter();
            Console.WriteLine("🧹 All filters cleared");
        }
        
        /// <summary>
        /// Export data
        /// </summary>
        private void ExportData()
        {
            try
            {
                string jsonData = spiritDexManager.ExportToJSON();
                if (!string.IsNullOrEmpty(jsonData))
                {
                    Console.WriteLine("📤 Data exported successfully");
                    Console.WriteLine($"📄 Export size: {jsonData.Length} characters");
                }
                else
                {
                    Console.WriteLine("❌ Failed to export data");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error exporting data: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Validate entries
        /// </summary>
        private void ValidateEntries()
        {
            try
            {
                Console.WriteLine("🔍 Validating all SpiritDex entries...");
                spiritDexManager.ValidateAllEntries();
                Console.WriteLine("✅ Validation complete");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating entries: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Get filtered entries based on current view mode and filters
        /// </summary>
        private List<SpiritDexEntry> GetFilteredEntries()
        {
            var entries = spiritDexManager.GetAllEntries();
            
            // Apply view mode filter
            switch (currentViewMode)
            {
                case ViewMode.Discovered:
                    entries = entries.Where(e => e.IsDiscovered).ToList();
                    break;
                case ViewMode.Captured:
                    entries = entries.Where(e => e.IsCaptured).ToList();
                    break;
                case ViewMode.Unseen:
                    entries = entries.Where(e => !e.IsDiscovered).ToList();
                    break;
            }
            
            // Apply additional filters
            if (currentFilter.primaryType != SpiritType.None ||
                currentFilter.secondaryType != SpiritType.None ||
                currentFilter.rarity != SpiritRarity.Common ||
                currentFilter.category != SpiritCategory.Normal ||
                currentFilter.minLevel > 0 ||
                currentFilter.maxLevel > 0 ||
                !string.IsNullOrEmpty(currentFilter.customTag) ||
                currentFilter.minCompletion > 0)
            {
                entries = spiritDexManager.FilterSpirits(currentFilter);
            }
            
            return entries;
        }
        
        /// <summary>
        /// Display entry summary
        /// </summary>
        private void DisplayEntrySummary(SpiritDexEntry entry)
        {
            string status = GetStatusIcon(entry.GetStatus());
            string type = entry.secondaryType != SpiritType.None ? 
                $"{entry.primaryType}/{entry.secondaryType}" : entry.primaryType.ToString();
            
            Console.WriteLine($"{status} {entry.spiritName} ({entry.spiritID}) | {type} | {entry.rarity} | Lv.{entry.baseLevel}-{entry.maxLevel}");
        }
        
        /// <summary>
        /// Display detailed entry information
        /// </summary>
        private void DisplayEntryDetailed(SpiritDexEntry entry)
        {
            Console.WriteLine("=" * 80);
            Console.WriteLine($"📋 SpiritDex Entry: {entry.spiritName}");
            Console.WriteLine("=" * 80);
            Console.WriteLine(entry.GetDetailedInfo());
            Console.WriteLine("=" * 80);
        }
        
        /// <summary>
        /// Get status icon for display
        /// </summary>
        private string GetStatusIcon(EntryStatus status)
        {
            return status switch
            {
                EntryStatus.Complete => "✅",
                EntryStatus.Discovered => "🔍",
                EntryStatus.Seen => "👁️",
                EntryStatus.Unknown => "❓",
                _ => "❓"
            };
        }
    }
    
    /// <summary>
    /// View modes for SpiritDex
    /// </summary>
    public enum ViewMode
    {
        All,           // Show all entries
        Discovered,    // Show only discovered entries
        Captured,      // Show only captured entries
        Unseen         // Show only unseen entries
    }
}