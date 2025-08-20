using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;
using TMPro;
using System.Collections.Generic;
using System.Linq;
using MIFF.Lore;
using MIFF.Core;

namespace MIFF.UI
{
    /// <summary>
    /// Main UI component for browsing lore entries in the Codex
    /// </summary>
    public class LoreCodexUI : MonoBehaviour
    {
        [Header("UI Panels")]
        [SerializeField] private GameObject codexPanel;
        [SerializeField] private GameObject listPanel;
        [SerializeField] private GameObject detailPanel;
        
        [Header("List Panel")]
        [SerializeField] private Transform listContentParent;
        [SerializeField] private GameObject listItemPrefab;
        [SerializeField] private TMP_InputField searchInput;
        [SerializeField] private TMP_Dropdown categoryFilter;
        [SerializeField] private TMP_Dropdown emotionCoreFilter;
        [SerializeField] private TMP_Dropdown genreBiasFilter;
        [SerializeField] private Button clearFiltersButton;
        
        [Header("Detail Panel")]
        [SerializeField] private TextMeshProUGUI detailTitle;
        [SerializeField] private TextMeshProUGUI detailDescription;
        [SerializeField] private Image detailIllustration;
        [SerializeField] private Image detailEmotionCoreIcon;
        [SerializeField] private Image detailGenreBiasIcon;
        [SerializeField] private TextMeshProUGUI detailCategory;
        [SerializeField] private TextMeshProUGUI detailTags;
        [SerializeField] private Button audioButton;
        [SerializeField] private Button closeDetailButton;
        
        [Header("Audio")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip pageTurnSound;
        [SerializeField] private AudioClip unlockSound;
        
        [Header("Events")]
        [SerializeField] private UnityEvent<LoreEntry_SO> onLoreEntrySelected;
        [SerializeField] private UnityEvent onLoreCodexOpened;
        [SerializeField] private UnityEvent onLoreCodexClosed;
        
        [Header("Settings")]
        [SerializeField] private bool showLockedEntries = false;
        [SerializeField] private bool autoRefreshOnUnlock = true;
        [SerializeField] private float refreshDelay = 0.1f;
        
        private LoreDatabase loreDatabase;
        private LoreIconMapping iconMapping;
        private List<LoreEntry_SO> currentEntries = new List<LoreEntry_SO>();
        private List<LoreEntry_SO> filteredEntries = new List<LoreEntry_SO>();
        private LoreEntry_SO selectedEntry;
        private bool isCodexOpen = false;
        
        private void Start()
        {
            InitializeUI();
            SetupEventListeners();
            
            // Hide panels initially
            if (codexPanel != null)
                codexPanel.SetActive(false);
            
            if (detailPanel != null)
                detailPanel.SetActive(false);
        }
        
        private void Update()
        {
            // Handle keyboard shortcuts
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (detailPanel.activeSelf)
                {
                    CloseDetailPanel();
                }
                else if (isCodexOpen)
                {
                    CloseCodex();
                }
            }
        }
        
        /// <summary>
        /// Initialize UI components
        /// </summary>
        private void InitializeUI()
        {
            // Get references
            loreDatabase = LoreDatabase.Instance;
            iconMapping = Resources.Load<LoreIconMapping>("LoreIconMapping");
            
            if (loreDatabase == null)
            {
                Debug.LogError("LoreDatabase not found! Please add one to the scene.");
            }
            
            if (iconMapping == null)
            {
                Debug.LogWarning("LoreIconMapping not found in Resources! Some icons may not display correctly.");
            }
            
            // Setup filters
            SetupFilterDropdowns();
        }
        
        /// <summary>
        /// Setup event listeners
        /// </summary>
        private void SetupEventListeners()
        {
            if (searchInput != null)
                searchInput.onValueChanged.AddListener(OnSearchInputChanged);
            
            if (categoryFilter != null)
                categoryFilter.onValueChanged.AddListener(OnCategoryFilterChanged);
            
            if (emotionCoreFilter != null)
                emotionCoreFilter.onValueChanged.AddListener(OnEmotionCoreFilterChanged);
            
            if (genreBiasFilter != null)
                genreBiasFilter.onValueChanged.AddListener(OnGenreBiasFilterChanged);
            
            if (clearFiltersButton != null)
                clearFiltersButton.onClick.AddListener(ClearAllFilters);
            
            if (audioButton != null)
                audioButton.onClick.AddListener(OnAudioButtonClicked);
            
            if (closeDetailButton != null)
                closeDetailButton.onClick.AddListener(CloseDetailPanel);
        }
        
        /// <summary>
        /// Setup filter dropdowns
        /// </summary>
        private void SetupFilterDropdowns()
        {
            if (loreDatabase == null) return;
            
            // Category filter
            if (categoryFilter != null)
            {
                categoryFilter.ClearOptions();
                var categories = new List<string> { "All Categories" };
                categories.AddRange(loreDatabase.GetAllCategories());
                categoryFilter.AddOptions(categories);
            }
            
            // Emotion core filter
            if (emotionCoreFilter != null)
            {
                emotionCoreFilter.ClearOptions();
                var emotionCores = new List<string> { "All Emotion Cores" };
                emotionCores.AddRange(System.Enum.GetNames(typeof(EmotionCoreType)));
                emotionCoreFilter.AddOptions(emotionCores);
            }
            
            // Genre bias filter
            if (genreBiasFilter != null)
            {
                genreBiasFilter.ClearOptions();
                var genreBiases = new List<string> { "All Genre Biases" };
                genreBiases.AddRange(System.Enum.GetNames(typeof(GenreBiasType)));
                genreBiasFilter.AddOptions(genreBiases);
            }
        }
        
        /// <summary>
        /// Open the lore codex
        /// </summary>
        public void OpenCodex()
        {
            if (isCodexOpen) return;
            
            isCodexOpen = true;
            
            if (codexPanel != null)
                codexPanel.SetActive(true);
            
            RefreshLoreList();
            onLoreCodexOpened?.Invoke();
            
            // Play page turn sound
            if (audioSource != null && pageTurnSound != null)
            {
                audioSource.PlayOneShot(pageTurnSound);
            }
        }
        
        /// <summary>
        /// Close the lore codex
        /// </summary>
        public void CloseCodex()
        {
            if (!isCodexOpen) return;
            
            isCodexOpen = false;
            
            if (codexPanel != null)
                codexPanel.SetActive(false);
            
            if (detailPanel != null)
                detailPanel.SetActive(false);
            
            onLoreCodexClosed?.Invoke();
        }
        
        /// <summary>
        /// Refresh the lore list
        /// </summary>
        public void RefreshLoreList()
        {
            if (loreDatabase == null) return;
            
            // Get current entries
            var gameData = GameData.Instance;
            currentEntries = loreDatabase.GetUnlockedEntries(gameData);
            
            // Apply filters
            ApplyFilters();
            
            // Populate list
            PopulateListPanel();
        }
        
        /// <summary>
        /// Apply current filters to entries
        /// </summary>
        private void ApplyFilters()
        {
            filteredEntries = new List<LoreEntry_SO>(currentEntries);
            
            // Apply search filter
            if (!string.IsNullOrEmpty(searchInput?.text))
            {
                var searchResults = loreDatabase.SearchEntries(searchInput.text);
                filteredEntries = filteredEntries.Intersect(searchResults).ToList();
            }
            
            // Apply category filter
            if (categoryFilter != null && categoryFilter.value > 0)
            {
                var selectedCategory = categoryFilter.options[categoryFilter.value].text;
                filteredEntries = filteredEntries.Where(e => e.Category == selectedCategory).ToList();
            }
            
            // Apply emotion core filter
            if (emotionCoreFilter != null && emotionCoreFilter.value > 0)
            {
                var selectedEmotionCore = (EmotionCoreType)(emotionCoreFilter.value - 1);
                filteredEntries = filteredEntries.Where(e => e.EmotionCore == selectedEmotionCore).ToList();
            }
            
            // Apply genre bias filter
            if (genreBiasFilter != null && genreBiasFilter.value > 0)
            {
                var selectedGenreBias = (GenreBiasType)(genreBiasFilter.value - 1);
                filteredEntries = filteredEntries.Where(e => e.GenreBias == selectedGenreBias).ToList();
            }
        }
        
        /// <summary>
        /// Populate the list panel with filtered entries
        /// </summary>
        private void PopulateListPanel()
        {
            if (listContentParent == null) return;
            
            // Clear existing items
            foreach (Transform child in listContentParent)
            {
                Destroy(child.gameObject);
            }
            
            // Create list items
            foreach (var entry in filteredEntries)
            {
                CreateListItem(entry);
            }
            
            // Show empty state if no entries
            if (filteredEntries.Count == 0)
            {
                ShowEmptyState();
            }
        }
        
        /// <summary>
        /// Create a list item for a lore entry
        /// </summary>
        private void CreateListItem(LoreEntry_SO entry)
        {
            if (listItemPrefab == null || listContentParent == null) return;
            
            var listItem = Instantiate(listItemPrefab, listContentParent);
            var listItemComponent = listItem.GetComponent<LoreListItem>();
            
            if (listItemComponent != null)
            {
                listItemComponent.Setup(entry, iconMapping);
                listItemComponent.OnEntryClicked.AddListener(() => OnLoreEntryClicked(entry));
            }
        }
        
        /// <summary>
        /// Show empty state message
        /// </summary>
        private void ShowEmptyState()
        {
            // This would show a "no entries found" message
            Debug.Log("No lore entries found matching current filters");
        }
        
        /// <summary>
        /// Handle lore entry click
        /// </summary>
        private void OnLoreEntryClicked(LoreEntry_SO entry)
        {
            if (entry == null) return;
            
            selectedEntry = entry;
            ShowDetailPanel(entry);
            onLoreEntrySelected?.Invoke(entry);
            
            // Mark as viewed in GameData
            MarkEntryAsViewed(entry);
        }
        
        /// <summary>
        /// Show detail panel for selected entry
        /// </summary>
        private void ShowDetailPanel(LoreEntry_SO entry)
        {
            if (detailPanel == null || entry == null) return;
            
            // Set entry details
            if (detailTitle != null)
                detailTitle.text = entry.Title;
            
            if (detailDescription != null)
                detailDescription.text = entry.Description;
            
            if (detailIllustration != null)
                detailIllustration.sprite = entry.Illustration;
            
            if (detailCategory != null)
                detailCategory.text = entry.Category;
            
            if (detailTags != null)
                detailTags.text = entry.GetTagsString();
            
            // Set emotion core icon
            if (detailEmotionCoreIcon != null && iconMapping != null)
            {
                detailEmotionCoreIcon.sprite = iconMapping.GetEmotionCoreIcon(entry.EmotionCore);
            }
            
            // Set genre bias icon
            if (detailGenreBiasIcon != null && iconMapping != null)
            {
                detailGenreBiasIcon.sprite = iconMapping.GetGenreBiasIcon(entry.GenreBias);
            }
            
            // Setup audio button
            if (audioButton != null)
            {
                audioButton.gameObject.SetActive(entry.HasAudioContent());
                audioButton.interactable = entry.HasAudioContent();
            }
            
            // Show the panel
            detailPanel.SetActive(true);
        }
        
        /// <summary>
        /// Close the detail panel
        /// </summary>
        private void CloseDetailPanel()
        {
            if (detailPanel != null)
                detailPanel.SetActive(false);
            
            selectedEntry = null;
        }
        
        /// <summary>
        /// Handle audio button click
        /// </summary>
        private void OnAudioButtonClicked()
        {
            if (selectedEntry == null || !selectedEntry.HasAudioContent()) return;
            
            if (audioSource != null && selectedEntry.ThemeSnippet != null)
            {
                audioSource.PlayOneShot(selectedEntry.ThemeSnippet);
            }
        }
        
        /// <summary>
        /// Mark entry as viewed in GameData
        /// </summary>
        private void MarkEntryAsViewed(LoreEntry_SO entry)
        {
            if (entry == null) return;
            
            var gameData = GameData.Instance;
            if (gameData != null)
            {
                var viewedEntries = gameData.GetData<List<string>>("viewedLoreEntryIDs") ?? new List<string>();
                
                if (!viewedEntries.Contains(entry.EntryID))
                {
                    viewedEntries.Add(entry.EntryID);
                    gameData.SetData("viewedLoreEntryIDs", viewedEntries);
                }
            }
        }
        
        /// <summary>
        /// Handle search input change
        /// </summary>
        private void OnSearchInputChanged(string searchText)
        {
            ApplyFilters();
            PopulateListPanel();
        }
        
        /// <summary>
        /// Handle category filter change
        /// </summary>
        private void OnCategoryFilterChanged(int value)
        {
            ApplyFilters();
            PopulateListPanel();
        }
        
        /// <summary>
        /// Handle emotion core filter change
        /// </summary>
        private void OnEmotionCoreFilterChanged(int value)
        {
            ApplyFilters();
            PopulateListPanel();
        }
        
        /// <summary>
        /// Handle genre bias filter change
        /// </summary>
        private void OnGenreBiasFilterChanged(int value)
        {
            ApplyFilters();
            PopulateListPanel();
        }
        
        /// <summary>
        /// Clear all filters
        /// </summary>
        private void ClearAllFilters()
        {
            if (searchInput != null)
                searchInput.text = "";
            
            if (categoryFilter != null)
                categoryFilter.value = 0;
            
            if (emotionCoreFilter != null)
                emotionCoreFilter.value = 0;
            
            if (genreBiasFilter != null)
                genreBiasFilter.value = 0;
            
            ApplyFilters();
            PopulateListPanel();
        }
        
        /// <summary>
        /// Check if codex is open
        /// </summary>
        public bool IsCodexOpen => isCodexOpen;
        
        /// <summary>
        /// Get current selected entry
        /// </summary>
        public LoreEntry_SO SelectedEntry => selectedEntry;
        
        /// <summary>
        /// Get current filtered entries count
        /// </summary>
        public int FilteredEntriesCount => filteredEntries.Count;
        
        /// <summary>
        /// Get total unlocked entries count
        /// </summary>
        public int TotalUnlockedEntriesCount => currentEntries.Count;
        
        /// <summary>
        /// Force refresh (for testing)
        /// </summary>
        [ContextMenu("Force Refresh")]
        public void ForceRefresh()
        {
            RefreshLoreList();
        }
        
        /// <summary>
        /// Test codex open/close (for testing)
        /// </summary>
        [ContextMenu("Test Codex Toggle")]
        public void TestCodexToggle()
        {
            if (isCodexOpen)
            {
                CloseCodex();
            }
            else
            {
                OpenCodex();
            }
        }
        
        /// <summary>
        /// Get codex statistics (for testing)
        /// </summary>
        [ContextMenu("Get Codex Stats")]
        public void GetCodexStats()
        {
            Debug.Log($"Lore Codex Statistics:\n" +
                     $"Total Unlocked: {TotalUnlockedEntriesCount}\n" +
                     $"Currently Filtered: {FilteredEntriesCount}\n" +
                     $"Is Open: {IsCodexOpen}\n" +
                     $"Selected Entry: {(SelectedEntry != null ? SelectedEntry.Title : "None")}");
        }
    }
}