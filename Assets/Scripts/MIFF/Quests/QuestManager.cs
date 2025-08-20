using UnityEngine;
using UnityEngine.Events;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Quests
{
    /// <summary>
    /// Manages quest objectives, triggers, and rewards
    /// </summary>
    public class QuestManager : MonoBehaviour
    {
        [Header("Quest Database")]
        [SerializeField] private List<QuestObjective_SO> questDatabase = new List<QuestObjective_SO>();
        
        [Header("Active Quests")]
        [SerializeField] private List<ActiveQuest> activeQuests = new List<ActiveQuest>();
        
        [Header("Events")]
        [SerializeField] private UnityEvent<QuestObjective_SO> onQuestStarted;
        [SerializeField] private UnityEvent<QuestObjective_SO> onQuestCompleted;
        [SerializeField] private UnityEvent<QuestObjective_SO> onQuestFailed;
        
        [Header("Settings")]
        [SerializeField] private bool autoCheckQuests = true;
        [SerializeField] private float questCheckInterval = 1.0f;
        
        private Dictionary<string, QuestObjective_SO> questLookup = new Dictionary<string, QuestObjective_SO>();
        private float lastQuestCheck = 0f;
        
        public static QuestManager Instance { get; private set; }
        
        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                BuildQuestLookup();
            }
            else
            {
                Destroy(gameObject);
            }
        }
        
        private void Start()
        {
            // Initialize quest system
            InitializeQuests();
        }
        
        private void Update()
        {
            if (autoCheckQuests && Time.time - lastQuestCheck >= questCheckInterval)
            {
                CheckAllQuests();
                lastQuestCheck = Time.time;
            }
        }
        
        /// <summary>
        /// Build the quest lookup dictionary
        /// </summary>
        private void BuildQuestLookup()
        {
            questLookup.Clear();
            
            foreach (var quest in questDatabase)
            {
                if (quest != null && !string.IsNullOrEmpty(quest.QuestID))
                {
                    if (questLookup.ContainsKey(quest.QuestID))
                    {
                        Debug.LogWarning($"Duplicate quest found: {quest.QuestID}");
                    }
                    else
                    {
                        questLookup[quest.QuestID] = quest;
                    }
                }
            }
            
            Debug.Log($"Built quest lookup with {questLookup.Count} entries");
        }
        
        /// <summary>
        /// Initialize quest system
        /// </summary>
        private void InitializeQuests()
        {
            // Start any quests that don't require triggers
            foreach (var quest in questDatabase)
            {
                if (quest != null && quest.Triggers.Count == 0)
                {
                    StartQuest(quest);
                }
            }
        }
        
        /// <summary>
        /// Start a quest
        /// </summary>
        public bool StartQuest(QuestObjective_SO quest)
        {
            if (quest == null) return false;
            
            // Check if quest is already active
            if (activeQuests.Any(q => q.QuestID == quest.QuestID))
            {
                Debug.Log($"Quest {quest.QuestID} is already active");
                return false;
            }
            
            // Check if quest prerequisites are met
            var context = QuestContext.CreateGeneralContext(quest.QuestID, quest.QuestTitle);
            if (!quest.CheckRequirements(context))
            {
                Debug.Log($"Quest {quest.QuestID} prerequisites not met");
                return false;
            }
            
            // Create active quest
            var activeQuest = new ActiveQuest(quest);
            activeQuests.Add(activeQuest);
            
            Debug.Log($"Started quest: {quest.QuestTitle}");
            onQuestStarted?.Invoke(quest);
            
            return true;
        }
        
        /// <summary>
        /// Start quest by ID
        /// </summary>
        public bool StartQuest(string questID)
        {
            if (!questLookup.ContainsKey(questID)) return false;
            
            return StartQuest(questLookup[questID]);
        }
        
        /// <summary>
        /// Complete a quest
        /// </summary>
        public bool CompleteQuest(string questID)
        {
            var activeQuest = activeQuests.FirstOrDefault(q => q.QuestID == questID);
            if (activeQuest == null) return false;
            
            var quest = activeQuest.QuestObjective;
            
            // Grant rewards
            var context = QuestContext.CreateGeneralContext(questID, quest.QuestTitle);
            quest.GrantRewards(context);
            
            // Remove from active quests
            activeQuests.Remove(activeQuest);
            
            Debug.Log($"Completed quest: {quest.QuestTitle}");
            onQuestCompleted?.Invoke(quest);
            
            return true;
        }
        
        /// <summary>
        /// Check all active quests
        /// </summary>
        public void CheckAllQuests()
        {
            var completedQuests = new List<ActiveQuest>();
            
            foreach (var activeQuest in activeQuests)
            {
                if (activeQuest == null || activeQuest.QuestObjective == null) continue;
                
                var quest = activeQuest.QuestObjective;
                var context = CreateQuestContext(quest);
                
                if (quest.CheckRequirements(context))
                {
                    // Quest requirements met, complete it
                    completedQuests.Add(activeQuest);
                }
            }
            
            // Complete all finished quests
            foreach (var completedQuest in completedQuests)
            {
                CompleteQuest(completedQuest.QuestID);
            }
        }
        
        /// <summary>
        /// Create quest context for checking requirements
        /// </summary>
        private QuestContext CreateQuestContext(QuestObjective_SO quest)
        {
            var context = QuestContext.CreateGeneralContext(quest.QuestID, quest.QuestTitle);
            
            // This would integrate with your game state systems
            // For now, we'll use placeholder values
            
            return context;
        }
        
        /// <summary>
        /// Trigger quest check for battle sync
        /// </summary>
        public void CheckQuestBattleSync(string battleID, float sync, bool won)
        {
            var context = QuestContext.CreateBattleSyncContext("", sync, won, battleID);
            
            foreach (var activeQuest in activeQuests)
            {
                if (activeQuest == null || activeQuest.QuestObjective == null) continue;
                
                var quest = activeQuest.QuestObjective;
                if (quest.CheckRequirements(context))
                {
                    CompleteQuest(quest.QuestID);
                }
            }
        }
        
        /// <summary>
        /// Trigger quest check for item collection
        /// </summary>
        public void CheckQuestItemCollection(string itemID)
        {
            var context = QuestContext.CreateItemCollectionContext("", itemID);
            
            foreach (var activeQuest in activeQuests)
            {
                if (activeQuest == null || activeQuest.QuestObjective == null) continue;
                
                var quest = activeQuest.QuestObjective;
                if (quest.CheckRequirements(context))
                {
                    CompleteQuest(quest.QuestID);
                }
            }
        }
        
        /// <summary>
        /// Trigger quest check for battle victory
        /// </summary>
        public void CheckQuestBattleVictory(string battleID, int turns, float duration)
        {
            var context = QuestContext.CreateBattleVictoryContext("", battleID, turns, duration);
            
            foreach (var activeQuest in activeQuests)
            {
                if (activeQuest == null || activeQuest.QuestObjective == null) continue;
                
                var quest = activeQuest.QuestObjective;
                if (quest.CheckRequirements(context))
                {
                    CompleteQuest(quest.QuestID);
                }
            }
        }
        
        /// <summary>
        /// Trigger quest check for spirit level
        /// </summary>
        public void CheckQuestSpiritLevel(int level)
        {
            var context = QuestContext.CreateSpiritLevelContext("", level);
            
            foreach (var activeQuest in activeQuests)
            {
                if (activeQuest == null || activeQuest.QuestObjective == null) continue;
                
                var quest = activeQuest.QuestObjective;
                if (quest.CheckRequirements(context))
                {
                    CompleteQuest(quest.QuestID);
                }
            }
        }
        
        /// <summary>
        /// Add quest to database
        /// </summary>
        public void AddQuest(QuestObjective_SO quest)
        {
            if (quest == null) return;
            
            if (!questDatabase.Contains(quest))
            {
                questDatabase.Add(quest);
                BuildQuestLookup();
                Debug.Log($"Added quest: {quest.QuestTitle}");
            }
        }
        
        /// <summary>
        /// Remove quest from database
        /// </summary>
        public void RemoveQuest(QuestObjective_SO quest)
        {
            if (quest == null) return;
            
            if (questDatabase.Contains(quest))
            {
                questDatabase.Remove(quest);
                BuildQuestLookup();
                Debug.Log($"Removed quest: {quest.QuestTitle}");
            }
        }
        
        /// <summary>
        /// Get quest by ID
        /// </summary>
        public QuestObjective_SO GetQuest(string questID)
        {
            return questLookup.ContainsKey(questID) ? questLookup[questID] : questID;
        }
        
        /// <summary>
        /// Get all available quests
        /// </summary>
        public List<QuestObjective_SO> GetAllQuests()
        {
            return new List<QuestObjective_SO>(questDatabase);
        }
        
        /// <summary>
        /// Get all active quests
        /// </summary>
        public List<ActiveQuest> GetActiveQuests()
        {
            return new List<ActiveQuest>(activeQuests);
        }
        
        /// <summary>
        /// Check if quest is active
        /// </summary>
        public bool IsQuestActive(string questID)
        {
            return activeQuests.Any(q => q.QuestID == questID);
        }
        
        /// <summary>
        /// Check if quest is completed
        /// </summary>
        public bool IsQuestCompleted(string questID)
        {
            var flagManager = MIFF.Core.OnboardingFlagManager.Instance;
            return flagManager != null && flagManager.GetFlag($"Quest_{questID}_Completed");
        }
        
        /// <summary>
        /// Validate quest database
        /// </summary>
        [ContextMenu("Validate Quest Database")]
        public void ValidateQuestDatabase()
        {
            var issues = new List<string>();
            
            foreach (var quest in questDatabase)
            {
                if (quest == null) continue;
                
                if (string.IsNullOrEmpty(quest.QuestID))
                {
                    issues.Add($"Quest {quest.name}: Missing quest ID");
                }
                
                if (string.IsNullOrEmpty(quest.QuestTitle))
                {
                    issues.Add($"Quest {quest.name}: Missing quest title");
                }
            }
            
            if (issues.Count > 0)
            {
                Debug.LogWarning($"Quest validation found {issues.Count} issues:\n• " + string.Join("\n• ", issues));
            }
            else
            {
                Debug.Log("All quests validated successfully!");
            }
        }
        
        /// <summary>
        /// Force quest check (for testing)
        /// </summary>
        [ContextMenu("Force Quest Check")]
        public void ForceQuestCheck()
        {
            Debug.Log("Forcing quest check...");
            CheckAllQuests();
        }
        
        /// <summary>
        /// Start test quest (for testing)
        /// </summary>
        [ContextMenu("Start Test Quest")]
        public void StartTestQuest()
        {
            if (questDatabase.Count > 0)
            {
                StartQuest(questDatabase[0]);
            }
        }
    }
    
    /// <summary>
    /// Represents an active quest instance
    /// </summary>
    [System.Serializable]
    public class ActiveQuest
    {
        [SerializeField] private string questID;
        [SerializeField] private QuestObjective_SO questObjective;
        [SerializeField] private float startTime;
        [SerializeField] private bool isCompleted;
        
        public string QuestID => questID;
        public QuestObjective_SO QuestObjective => questObjective;
        public float StartTime => startTime;
        public bool IsCompleted => isCompleted;
        
        public ActiveQuest(QuestObjective_SO quest)
        {
            questID = quest.QuestID;
            questObjective = quest;
            startTime = Time.time;
            isCompleted = false;
        }
        
        /// <summary>
        /// Mark quest as completed
        /// </summary>
        public void MarkCompleted()
        {
            isCompleted = true;
        }
        
        /// <summary>
        /// Get quest duration
        /// </summary>
        public float GetDuration()
        {
            return Time.time - startTime;
        }
        
        /// <summary>
        /// Get quest summary
        /// </summary>
        public string GetSummary()
        {
            return $"{questObjective.QuestTitle} - Started: {startTime:F1}s ago";
        }
    }
}