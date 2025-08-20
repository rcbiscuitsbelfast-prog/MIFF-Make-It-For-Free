using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Spirits
{
    /// <summary>
    /// Console-based viewer for testing the SpiritDex system
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class SpiritDexViewer
    {
        [Header("Viewer Configuration")]
        public bool enableColorOutput = true;
        public bool enableDetailedView = false;
        public bool enableStatistics = true;
        public bool enableSearch = true;
        public bool enableFiltering = true;
        public bool enableExport = true;
        
        [Header("Display Settings")]
        public int entriesPerPage = 10;
        public bool showPageNumbers = true;
        public bool showProgressBars = true;
        public bool showRarityColors = true;
        public bool showTypeIcons = true;
        
        [Header("Remix Hooks")]
        public bool enableCustomDisplay = true;
        public bool enableCustomFilters = true;
        public bool enableCustomCommands = true;
        
        // Reference to SpiritDexManager
        private SpiritDexManager spiritDexManager;
        private SpiritDatabase spiritDatabase;
        
        // Current view state
        private List<SpiritDexEntry> currentEntries;
        private int currentPage = 0;
        private SpiritDexFilter currentFilter;
        private string currentSearchTerm = "";
        private ViewMode currentViewMode = ViewMode.All;
        
        // Events for remixers to hook into
        public event Action<SpiritDexViewer, string> OnViewerCommand;
        public event Action<SpiritDexViewer, SpiritDexEntry> OnEntrySelected;
        public event Action<SpiritDexViewer, ViewMode> OnViewModeChanged;
        
        public SpiritDexViewer()
        {
            InitializeViewer();
        }
        
        /// <summary>
        /// Initialize with SpiritDexManager and SpiritDatabase
        /// </summary>
        public SpiritDexViewer(SpiritDexManager dexManager, SpiritDatabase database)
        {
            spiritDexManager = dexManager;
            spiritDatabase = database;
            InitializeViewer();
        }
        
        /// <summary>
        /// Initialize the viewer
        /// </summary>
        private void InitializeViewer()
        {
            currentEntries = new List<SpiritDexEntry>();
            currentFilter = new SpiritDexFilter();
            currentViewMode = ViewMode.All;
        }
        
        /// <summary>
        /// Start the interactive viewer
        /// </summary>
        public void StartInteractiveViewer()
        {
            Console.WriteLine("🎮 SpiritDex Viewer - Interactive Mode");
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
                    ShowSpiritList();
                    break;
                    
                case "show":
                    if (args.Length > 0)
                    {
                        ShowSpiritDetails(args[0]);
                    }
                    else
                    {
                        Console.WriteLine("Usage: show <spiritID>");
                    }
                    break;
                    
                case "filter":
                    ApplyFilter(args);
                    break;
                    
                case "search":
                    if (args.Length > 0)
                    {
                        SearchSpirits(string.Join(" ", args));
                    }
                    else
                    {
                        Console.WriteLine("Usage: search <search term>");
                    }
                    break;
                    
                case "stats":
                    ShowStatistics();
                    break;
                    
                case "export":
                    ExportData();
                    break;
                    
                case "clear":
                    ClearFilter();
                    break;
                    
                case "page":
                    if (args.Length > 0 && int.TryParse(args[0], out int page))
                    {
                        GoToPage(page);
                    }
                    else
                    {
                        Console.WriteLine("Usage: page <page number>");
                    }
                    break;
                    
                case "mode":
                    if (args.Length > 0)
                    {
                        SetViewMode(args[0]);
                    }
                    else
                    {
                        ShowCurrentViewMode();
                    }
                    break;
                    
                case "refresh":
                    RefreshView();
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
            Console.WriteLine("  list                    - Show current spirit list");
            Console.WriteLine("  show <spiritID>         - Show detailed spirit information");
            Console.WriteLine("  filter <criteria>       - Apply filters to the list");
            Console.WriteLine("  search <term>           - Search spirits by name or ID");
            Console.WriteLine("  stats                   - Show SpiritDex statistics");
            Console.WriteLine("  export                  - Export current data");
            Console.WriteLine("  clear                   - Clear current filters");
            Console.WriteLine("  page <number>           - Go to specific page");
            Console.WriteLine("  mode <mode>             - Set view mode (all/discovered/captured/unseen)");
            Console.WriteLine("  refresh                 - Refresh the current view");
            Console.WriteLine("  help                    - Show this help");
            Console.WriteLine("  exit/quit               - Exit the viewer");
            Console.WriteLine();
            Console.WriteLine("Filter Examples:");
            Console.WriteLine("  filter discovered:true");
            Console.WriteLine("  filter captured:false type:Fire");
            Console.WriteLine("  filter rarity:Legendary location:MoonlightAlley");
        }
        
        /// <summary>
        /// Show the current spirit list
        /// </summary>
        private void ShowSpiritList()
        {
            if (spiritDexManager == null)
            {
                Console.WriteLine("❌ SpiritDexManager not available");
                return;
            }
            
            // Get entries based on current view mode
            currentEntries = GetEntriesForCurrentMode();
            
            if (currentEntries.Count == 0)
            {
                Console.WriteLine("📭 No spirits found matching current criteria");
                return;
            }
            
            // Apply current filter
            if (currentFilter != null)
            {
                currentEntries = spiritDexManager.FilterSpirits(currentFilter);
            }
            
            // Apply search term
            if (!string.IsNullOrEmpty(currentSearchTerm))
            {
                currentEntries = currentEntries.Where(e => 
                    e.spiritName.Contains(currentSearchTerm, StringComparison.OrdinalIgnoreCase) ||
                    e.spiritID.Contains(currentSearchTerm, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }
            
            // Show header
            Console.WriteLine($"📖 SpiritDex - {currentViewMode} View");
            Console.WriteLine($"Found {currentEntries.Count} spirits");
            Console.WriteLine();
            
            // Show entries
            int startIndex = currentPage * entriesPerPage;
            int endIndex = Math.Min(startIndex + entriesPerPage, currentEntries.Count);
            
            for (int i = startIndex; i < endIndex; i++)
            {
                var entry = currentEntries[i];
                ShowSpiritEntry(entry, i + 1);
            }
            
            // Show pagination
            if (showPageNumbers && currentEntries.Count > entriesPerPage)
            {
                int totalPages = (currentEntries.Count + entriesPerPage - 1) / entriesPerPage;
                Console.WriteLine();
                Console.WriteLine($"📄 Page {currentPage + 1} of {totalPages}");
                Console.WriteLine($"Use 'page <number>' to navigate");
            }
        }
        
        /// <summary>
        /// Show a single spirit entry
        /// </summary>
        private void ShowSpiritEntry(SpiritDexEntry entry, int index)
        {
            string indexStr = $"{index:D3}";
            string status = GetStatusIcon(entry.GetStatus());
            string typeIcon = GetTypeIcon(entry.primaryType);
            string rarityColor = GetRarityColor(entry.rarity);
            
            string line = $"{indexStr} {status} {typeIcon} {entry.spiritName} ({entry.spiritID})";
            
            if (showRarityColors)
            {
                line += $" [{rarityColor}{entry.rarity}";
                if (entry.secondaryType != SpiritType.None)
                {
                    line += $" | {entry.secondaryType}";
                }
                line += "]";
            }
            
            if (entry.isCaptured)
            {
                line += " ✅";
            }
            else if (entry.isDiscovered)
            {
                line += " 🔍";
            }
            
            if (entry.syncLevel > 0)
            {
                line += $" | Sync: {entry.syncLevel:F1}%";
            }
            
            Console.WriteLine(line);
        }
        
        /// <summary>
        /// Show detailed spirit information
        /// </summary>
        private void ShowSpiritDetails(string spiritID)
        {
            if (spiritDexManager == null)
            {
                Console.WriteLine("❌ SpiritDexManager not available");
                return;
            }
            
            var entry = spiritDexManager.GetEntry(spiritID);
            if (entry == null)
            {
                Console.WriteLine($"❌ Spirit not found: {spiritID}");
                return;
            }
            
            Console.WriteLine("🔍 Spirit Details");
            Console.WriteLine("==================");
            Console.WriteLine(entry.GetDetailedInfo());
            
            // Show species information if available
            if (spiritDatabase != null && !string.IsNullOrEmpty(entry.speciesID))
            {
                var species = spiritDatabase.GetSpecies(entry.speciesID);
                if (species != null)
                {
                    Console.WriteLine();
                    Console.WriteLine("📚 Species Information");
                    Console.WriteLine("======================");
                    Console.WriteLine($"Species: {species.speciesName}");
                    Console.WriteLine($"Description: {species.description}");
                    Console.WriteLine($"Category: {species.category}");
                    Console.WriteLine($"Height: {species.height:F1}m");
                    Console.WriteLine($"Weight: {species.weight:F1}kg");
                }
            }
            
            // Trigger selection event
            OnEntrySelected?.Invoke(this, entry);
        }
        
        /// <summary>
        /// Apply filters to the spirit list
        /// </summary>
        private void ApplyFilter(string[] args)
        {
            if (currentFilter == null)
            {
                currentFilter = new SpiritDexFilter();
            }
            
            foreach (string arg in args)
            {
                string[] parts = arg.Split(':');
                if (parts.Length == 2)
                {
                    string key = parts[0].ToLower();
                    string value = parts[1];
                    
                    switch (key)
                    {
                        case "discovered":
                            if (bool.TryParse(value, out bool discovered))
                            {
                                currentFilter.discovered = discovered;
                            }
                            break;
                            
                        case "captured":
                            if (bool.TryParse(value, out bool captured))
                            {
                                currentFilter.captured = captured;
                            }
                            break;
                            
                        case "type":
                            if (Enum.TryParse<SpiritType>(value, true, out SpiritType type))
                            {
                                currentFilter.type = type;
                            }
                            break;
                            
                        case "rarity":
                            if (Enum.TryParse<SpiritRarity>(value, true, out SpiritRarity rarity))
                            {
                                currentFilter.rarity = rarity;
                            }
                            break;
                            
                        case "location":
                            currentFilter.location = value;
                            break;
                            
                        case "minencounters":
                            if (int.TryParse(value, out int minEncounters))
                            {
                                currentFilter.minEncounters = minEncounters;
                            }
                            break;
                            
                        case "minbattles":
                            if (int.TryParse(value, out int minBattles))
                            {
                                currentFilter.minBattles = minBattles;
                            }
                            break;
                            
                        default:
                            Console.WriteLine($"Unknown filter key: {key}");
                            break;
                    }
                }
            }
            
            Console.WriteLine("🔍 Filter applied. Use 'list' to see results.");
            currentPage = 0; // Reset to first page
        }
        
        /// <summary>
        /// Search spirits by term
        /// </summary>
        private void SearchSpirits(string searchTerm)
        {
            currentSearchTerm = searchTerm;
            currentPage = 0;
            
            Console.WriteLine($"🔍 Searching for: {searchTerm}");
            ShowSpiritList();
        }
        
        /// <summary>
        /// Show SpiritDex statistics
        /// </summary>
        private void ShowStatistics()
        {
            if (spiritDexManager == null)
            {
                Console.WriteLine("❌ SpiritDexManager not available");
                return;
            }
            
            var stats = spiritDexManager.GetStatistics();
            
            Console.WriteLine("📊 SpiritDex Statistics");
            Console.WriteLine("========================");
            Console.WriteLine($"Total Spirits Seen: {stats.totalSpiritsSeen}");
            Console.WriteLine($"Total Spirits Discovered: {stats.totalSpiritsDiscovered}");
            Console.WriteLine($"Total Spirits Captured: {stats.totalSpiritsCaptured}");
            Console.WriteLine($"Discovery Rate: {stats.discoveryPercentage:F1}%");
            Console.WriteLine($"Capture Rate: {stats.completionPercentage:F1}%");
            
            if (stats.firstDiscoveryDate != DateTime.MinValue)
            {
                Console.WriteLine($"First Discovery: {stats.firstDiscoveryDate:yyyy-MM-dd HH:mm:ss}");
            }
            
            if (stats.lastDiscoveryDate != DateTime.MinValue)
            {
                Console.WriteLine($"Last Discovery: {stats.lastDiscoveryDate:yyyy-MM-dd HH:mm:ss}");
            }
            
            if (stats.firstCaptureDate != DateTime.MinValue)
            {
                Console.WriteLine($"First Capture: {stats.firstCaptureDate:yyyy-MM-dd HH:mm:ss}");
            }
            
            if (stats.lastCaptureDate != DateTime.MinValue)
            {
                Console.WriteLine($"Last Capture: {stats.lastCaptureDate:yyyy-MM-dd HH:mm:ss}");
            }
        }
        
        /// <summary>
        /// Export current data
        /// </summary>
        private void ExportData()
        {
            if (spiritDexManager == null)
            {
                Console.WriteLine("❌ SpiritDexManager not available");
                return;
            }
            
            string export = spiritDexManager.ExportData();
            Console.WriteLine("📤 SpiritDex Export");
            Console.WriteLine("====================");
            Console.WriteLine(export);
        }
        
        /// <summary>
        /// Clear current filters
        /// </summary>
        private void ClearFilter()
        {
            currentFilter = new SpiritDexFilter();
            currentSearchTerm = "";
            currentPage = 0;
            Console.WriteLine("🧹 Filters cleared");
        }
        
        /// <summary>
        /// Go to specific page
        /// </summary>
        private void GoToPage(int page)
        {
            if (currentEntries == null || currentEntries.Count == 0)
            {
                Console.WriteLine("❌ No entries to paginate");
                return;
            }
            
            int totalPages = (currentEntries.Count + entriesPerPage - 1) / entriesPerPage;
            if (page < 0 || page >= totalPages)
            {
                Console.WriteLine($"❌ Invalid page number. Valid range: 0-{totalPages - 1}");
                return;
            }
            
            currentPage = page;
            ShowSpiritList();
        }
        
        /// <summary>
        /// Set view mode
        /// </summary>
        private void SetViewMode(string mode)
        {
            switch (mode.ToLower())
            {
                case "all":
                    currentViewMode = ViewMode.All;
                    break;
                case "discovered":
                    currentViewMode = ViewMode.Discovered;
                    break;
                case "captured":
                    currentViewMode = ViewMode.Captured;
                    break;
                case "unseen":
                    currentViewMode = ViewMode.Unseen;
                    break;
                default:
                    Console.WriteLine($"❌ Unknown view mode: {mode}");
                    return;
            }
            
            currentPage = 0;
            Console.WriteLine($"👁️ View mode changed to: {currentViewMode}");
            
            // Trigger view mode change event
            OnViewModeChanged?.Invoke(this, currentViewMode);
        }
        
        /// <summary>
        /// Show current view mode
        /// </summary>
        private void ShowCurrentViewMode()
        {
            Console.WriteLine($"👁️ Current view mode: {currentViewMode}");
        }
        
        /// <summary>
        /// Refresh the current view
        /// </summary>
        private void RefreshView()
        {
            Console.WriteLine("🔄 Refreshing view...");
            ShowSpiritList();
        }
        
        /// <summary>
        /// Get entries for current view mode
        /// </summary>
        private List<SpiritDexEntry> GetEntriesForCurrentMode()
        {
            if (spiritDexManager == null) return new List<SpiritDexEntry>();
            
            return currentViewMode switch
            {
                ViewMode.All => spiritDexManager.GetDexEntries(),
                ViewMode.Discovered => spiritDexManager.GetEntriesByDiscoveryStatus(true),
                ViewMode.Captured => spiritDexManager.GetEntriesByCaptureStatus(true),
                ViewMode.Unseen => spiritDexManager.GetEntriesByDiscoveryStatus(false),
                _ => spiritDexManager.GetDexEntries()
            };
        }
        
        /// <summary>
        /// Get status icon for entry
        /// </summary>
        private string GetStatusIcon(EntryStatus status)
        {
            return status switch
            {
                EntryStatus.Captured => "✅",
                EntryStatus.Discovered => "🔍",
                EntryStatus.Unseen => "❓",
                _ => "❓"
            };
        }
        
        /// <summary>
        /// Get type icon for spirit
        /// </summary>
        private string GetTypeIcon(SpiritType type)
        {
            return type switch
            {
                SpiritType.Fire => "🔥",
                SpiritType.Water => "💧",
                SpiritType.Electric => "⚡",
                SpiritType.Grass => "🌱",
                SpiritType.Ice => "❄️",
                SpiritType.Fighting => "👊",
                SpiritType.Poison => "☠️",
                SpiritType.Ground => "🌍",
                SpiritType.Flying => "🦅",
                SpiritType.Psychic => "🔮",
                SpiritType.Bug => "🐛",
                SpiritType.Rock => "🪨",
                SpiritType.Ghost => "👻",
                SpiritType.Dragon => "🐉",
                SpiritType.Dark => "🌑",
                SpiritType.Steel => "⚙️",
                SpiritType.Fairy => "🧚",
                _ => "⭐"
            };
        }
        
        /// <summary>
        /// Get rarity color string
        /// </summary>
        private string GetRarityColor(SpiritRarity rarity)
        {
            return rarity switch
            {
                SpiritRarity.Common => "Common",
                SpiritRarity.Uncommon => "Uncommon",
                SpiritRarity.Rare => "Rare",
                SpiritRarity.Epic => "Epic",
                SpiritRarity.Legendary => "Legendary",
                SpiritRarity.Mythical => "Mythical",
                _ => "Common"
            };
        }
    }
    
    /// <summary>
    /// View modes for the SpiritDex viewer
    /// </summary>
    public enum ViewMode
    {
        All,           // Show all spirits
        Discovered,    // Show only discovered spirits
        Captured,      // Show only captured spirits
        Unseen         // Show only unseen spirits
    }
}