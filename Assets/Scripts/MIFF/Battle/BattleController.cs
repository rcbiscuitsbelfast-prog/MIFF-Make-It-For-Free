using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Capture;
using MIFF.Core;

namespace MIFF.Battle
{
    /// <summary>
    /// Main controller for battle management, coordinates all battle systems
    /// Designed to be remix-safe and extensible for contributors
    /// </summary>
    [Serializable]
    public class BattleController
    {
        [Header("Battle Systems")]
        public BattleContext battleContext;
        public TurnManager turnManager;
        public MoveResolver moveResolver;
        
        [Header("Battle State")]
        public BattlePhase currentPhase = BattlePhase.Preparation;
        public bool isBattleActive = false;
        public bool isPaused = false;
        public bool isAutoBattle = false;
        
        [Header("Battle Flow")]
        public float turnDelay = 1.0f;
        public bool enableAnimations = true;
        public bool enableSoundEffects = true;
        public bool enableParticleEffects = true;
        
        [Header("AI Settings")]
        public bool enableAI = true;
        public float aiDecisionDelay = 1.0f;
        public bool aiUsesRandomMoves = false;
        
        [Header("Remix Hooks")]
        public bool enableCustomBattleRules = true;
        public bool enableEvolutionTriggers = true;
        public bool enableQuestTriggers = true;
        public bool enableLoreUnlocks = true;
        public bool enableCaptureSystem = true;
        
        [Header("Capture System")]
        public CaptureManager captureManager;
        public bool autoAttemptCapture = true;
        public bool captureOnlyWildSpirits = true;
        public float captureAttemptDelay = 2.0f;
        
        // Events for remixers to hook into
        public event Action<BattleController> OnBattleStarted;
        public event Action<BattleController> OnBattleEnded;
        public event Action<BattleController, int> OnTurnStarted;
        public event Action<BattleController, int> OnTurnEnded;
        public event Action<BattleController, BattleSpirit> OnSpiritFainted;
        public event Action<BattleController, BattleSpirit> OnSpiritSwitched;
        public event Action<BattleController, Move, BattleSpirit, BattleSpirit> OnMoveUsed;
        public event Action<BattleController, BattleSpirit> OnEvolutionTriggered;
        public event Action<BattleController, CaptureResult> OnCaptureAttempted;
        public event Action<BattleController, CaptureResult> OnCaptureSucceeded;
        public event Action<BattleController, CaptureResult> OnCaptureFailed;
        public event Action<BattleController, string> OnSpiritAlreadyCaptured;
        
        private Random random;
        
        public BattleController()
        {
            random = new Random();
            InitializeBattleSystems();
        }
        
        /// <summary>
        /// Initialize battle systems
        /// </summary>
        private void InitializeBattleSystems()
        {
            // Create battle context
            battleContext = new BattleContext();
            
            // Create turn manager
            turnManager = new TurnManager(battleContext);
            
            // Create move resolver
            moveResolver = new MoveResolver();
            
            // Initialize capture system
            InitializeCaptureSystem();
            
            // Subscribe to events
            SubscribeToEvents();
        }
        
        /// <summary>
        /// Subscribe to battle system events
        /// </summary>
        private void SubscribeToEvents()
        {
            if (battleContext != null)
            {
                battleContext.OnBattleStarted += OnBattleContextStarted;
                battleContext.OnBattleEnded += OnBattleContextEnded;
                battleContext.OnTurnStarted += OnBattleContextTurnStarted;
                battleContext.OnTurnEnded += OnBattleContextTurnEnded;
                battleContext.OnSpiritFainted += OnBattleContextSpiritFainted;
                battleContext.OnSpiritSwitched += OnBattleContextSpiritSwitched;
            }
            
            if (turnManager != null)
            {
                turnManager.OnTurnStarted += OnTurnManagerTurnStarted;
                turnManager.OnTurnEnded += OnTurnManagerTurnEnded;
                turnManager.OnActionCompleted += OnTurnManagerActionCompleted;
            }
            
            if (moveResolver != null)
            {
                moveResolver.OnMoveResolved += OnMoveResolverMoveResolved;
                moveResolver.OnDamageCalculated += OnMoveResolverDamageCalculated;
            }
        }
        
        /// <summary>
        /// Start a new battle
        /// </summary>
        public bool StartBattle(List<BattleSpirit> playerTeam, List<BattleSpirit> enemyTeam, BattleType battleType = BattleType.Single)
        {
            if (isBattleActive) return false;
            if (playerTeam == null || playerTeam.Count == 0) return false;
            if (enemyTeam == null || enemyTeam.Count == 0) return false;
            
            try
            {
                // Set up battle context
                battleContext.battleType = battleType;
                battleContext.playerTeam.Clear();
                battleContext.enemyTeam.Clear();
                
                // Add spirits to teams
                foreach (var spirit in playerTeam)
                {
                    battleContext.AddToPlayerTeam(spirit);
                }
                
                foreach (var spirit in enemyTeam)
                {
                    battleContext.AddToEnemyTeam(spirit);
                }
                
                // Initialize battle
                battleContext.InitializeBattle();
                turnManager.InitializeBattle();
                
                // Start battle
                battleContext.StartBattle();
                isBattleActive = true;
                currentPhase = BattlePhase.Battle;
                
                // Trigger battle started event
                OnBattleStarted?.Invoke(this);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error starting battle: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// End the current battle
        /// </summary>
        public void EndBattle()
        {
            if (!isBattleActive) return;
            
            try
            {
                // End battle in context
                battleContext.EndBattle();
                
                // Clean up battle state
                isBattleActive = false;
                currentPhase = BattlePhase.Ended;
                
                // Trigger battle ended event
                OnBattleEnded?.Invoke(this);
                
                // Process battle results
                ProcessBattleResults();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error ending battle: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Process battle results
        /// </summary>
        private void ProcessBattleResults()
        {
            var winner = battleContext.GetBattleWinner();
            
            switch (winner)
            {
                case BattleWinner.Player:
                    ProcessPlayerVictory();
                    break;
                    
                case BattleWinner.Enemy:
                    ProcessEnemyVictory();
                    break;
                    
                case BattleWinner.Draw:
                    ProcessBattleDraw();
                    break;
            }
        }
        
        /// <summary>
        /// Process player victory
        /// </summary>
        private void ProcessPlayerVictory()
        {
            // Award experience, items, etc.
            // This can be extended by remixers
            
            // Check for evolution triggers
            if (enableEvolutionTriggers)
            {
                CheckEvolutionTriggers();
            }
            
            // Check for quest completion
            if (enableQuestTriggers)
            {
                CheckQuestTriggers();
            }
            
            // Check for lore unlocks
            if (enableLoreUnlocks)
            {
                CheckLoreUnlocks();
            }
        }
        
        /// <summary>
        /// Process enemy victory
        /// </summary>
        private void ProcessEnemyVictory()
        {
            // Handle defeat consequences
            // This can be extended by remixers
        }
        
        /// <summary>
        /// Process battle draw
        /// </summary>
        private void ProcessBattleDraw()
        {
            // Handle draw consequences
            // This can be extended by remixers
        }
        
        /// <summary>
        /// Start a new turn
        /// </summary>
        public void StartTurn()
        {
            if (!isBattleActive || isPaused) return;
            
            try
            {
                // Start turn in context
                battleContext.StartTurn();
                
                // Start turn in turn manager
                turnManager.StartTurn();
                
                // Trigger turn started event
                OnTurnStarted?.Invoke(this, battleContext.turnNumber);
                
                // Process AI actions
                if (enableAI)
                {
                    ProcessAIActions();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error starting turn: {ex.Message}");
            }
        }
        
        /// <summary>
        /// End the current turn
        /// </summary>
        public void EndTurn()
        {
            if (!isBattleActive || isPaused) return;
            
            try
            {
                // End turn in turn manager
                turnManager.EndTurn();
                
                // End turn in context
                battleContext.EndTurn();
                
                // Trigger turn ended event
                OnTurnEnded?.Invoke(this, battleContext.turnNumber);
                
                // Check if battle is over
                if (battleContext.IsBattleOver())
                {
                    EndBattle();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error ending turn: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Process AI actions for the current turn
        /// </summary>
        private void ProcessAIActions()
        {
            var aiActions = turnManager.GetCompletedActions().Where(a => a.actionType == TurnActionType.AI).ToList();
            
            foreach (var action in aiActions)
            {
                if (action.move != null && action.target != null)
                {
                    // Resolve the move
                    var result = moveResolver.ResolveMove(action.move, action.spirit, action.target, battleContext);
                    
                    // Trigger move used event
                    OnMoveUsed?.Invoke(this, action.move, action.spirit, action.target);
                }
            }
        }
        
        /// <summary>
        /// Set player action for a spirit
        /// </summary>
        public bool SetPlayerAction(BattleSpirit spirit, Move move, BattleSpirit target)
        {
            if (!isBattleActive || isPaused) return false;
            if (spirit == null || move == null || target == null) return false;
            
            try
            {
                return turnManager.SetPlayerAction(spirit, move, target);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting player action: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Process the next action in the turn queue
        /// </summary>
        public bool ProcessNextAction()
        {
            if (!isBattleActive || isPaused) return false;
            
            try
            {
                return turnManager.ProcessNextAction();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing action: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Check if turn is complete
        /// </summary>
        public bool IsTurnComplete()
        {
            return turnManager?.IsTurnComplete() ?? true;
        }
        
        /// <summary>
        /// Pause the battle
        /// </summary>
        public void PauseBattle()
        {
            isPaused = true;
        }
        
        /// <summary>
        /// Resume the battle
        /// </summary>
        public void ResumeBattle()
        {
            isPaused = false;
        }
        
        /// <summary>
        /// Toggle auto battle mode
        /// </summary>
        public void ToggleAutoBattle()
        {
            isAutoBattle = !isAutoBattle;
        }
        
        /// <summary>
        /// Switch active spirit
        /// </summary>
        public bool SwitchSpirit(BattleSpirit oldSpirit, BattleSpirit newSpirit)
        {
            if (!isBattleActive || isPaused) return false;
            if (oldSpirit == null || newSpirit == null) return false;
            
            try
            {
                return battleContext.SwitchActiveSpirit(oldSpirit, newSpirit);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error switching spirit: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Use an item in battle
        /// </summary>
        public bool UseItem(string itemID, BattleSpirit target)
        {
            if (!isBattleActive || isPaused) return false;
            if (string.IsNullOrEmpty(itemID) || target == null) return false;
            
            try
            {
                // Item usage logic would be implemented here
                // For now, just return success
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error using item: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Check for evolution triggers
        /// </summary>
        private void CheckEvolutionTriggers()
        {
            // This would integrate with the EvolutionManager
            // For now, just trigger the event
            foreach (var spirit in battleContext.GetPlayerTeam())
            {
                if (spirit != null && !spirit.isFainted)
                {
                    OnEvolutionTriggered?.Invoke(this, spirit);
                }
            }
        }
        
        /// <summary>
        /// Check for quest triggers
        /// </summary>
        private void CheckQuestTriggers()
        {
            // This would integrate with the QuestManager
            // For now, just log the check
            Console.WriteLine("Checking quest triggers...");
        }
        
        /// <summary>
        /// Check for lore unlocks
        /// </summary>
        private void CheckLoreUnlocks()
        {
            // This would integrate with the LoreDatabase
            // For now, just log the check
            Console.WriteLine("Checking lore unlocks...");
        }
        
        /// <summary>
        /// Get battle status
        /// </summary>
        public string GetBattleStatus()
        {
            if (!isBattleActive)
                return "Battle not active";
            
            string status = $"Battle {battleContext.battleID} | Turn {battleContext.turnNumber} | Phase: {currentPhase}";
            
            if (isPaused)
                status += " | PAUSED";
            
            if (isAutoBattle)
                status += " | AUTO";
            
            return status;
        }
        
        /// <summary>
        /// Get battle summary
        /// </summary>
        public string GetBattleSummary()
        {
            if (battleContext == null)
                return "No battle context";
            
            return battleContext.GetBattleSummary();
        }
        
        /// <summary>
        /// Get turn status
        /// </summary>
        public string GetTurnStatus()
        {
            if (turnManager == null)
                return "No turn manager";
            
            return turnManager.GetTurnStatus();
        }
        
        /// <summary>
        /// Get active spirits
        /// </summary>
        public List<BattleSpirit> GetActiveSpirits()
        {
            return battleContext?.GetActiveSpirits() ?? new List<BattleSpirit>();
        }
        
        /// <summary>
        /// Get player team
        /// </summary>
        public List<BattleSpirit> GetPlayerTeam()
        {
            return battleContext?.GetPlayerTeam() ?? new List<BattleSpirit>();
        }
        
        /// <summary>
        /// Get enemy team
        /// </summary>
        public List<BattleSpirit> GetEnemyTeam()
        {
            return battleContext?.GetEnemyTeam() ?? new List<BattleSpirit>();
        }
        
        /// <summary>
        /// Check if battle is over
        /// </summary>
        public bool IsBattleOver()
        {
            return battleContext?.IsBattleOver() ?? true;
        }
        
        /// <summary>
        /// Get battle winner
        /// </summary>
        public BattleWinner GetBattleWinner()
        {
            return battleContext?.GetBattleWinner() ?? BattleWinner.None;
        }
        
        // Event handlers for battle system events
        
        private void OnBattleContextStarted(BattleContext context)
        {
            // Battle context started event
        }
        
        private void OnBattleContextEnded(BattleContext context)
        {
            // Battle context ended event
        }
        
        private void OnBattleContextTurnStarted(BattleContext context, int turnNumber)
        {
            // Battle context turn started event
        }
        
        private void OnBattleContextTurnEnded(BattleContext context, int turnNumber)
        {
            // Battle context turn ended event
        }
        
        private void OnBattleContextSpiritFainted(BattleContext context, BattleSpirit spirit)
        {
            // Battle context spirit fainted event
            OnSpiritFainted?.Invoke(this, spirit);
        }
        
        private void OnBattleContextSpiritSwitched(BattleContext context, BattleSpirit spirit)
        {
            // Battle context spirit switched event
            OnSpiritSwitched?.Invoke(this, spirit);
        }
        
        private void OnTurnManagerTurnStarted(TurnManager turnManager, int turnNumber)
        {
            // Turn manager turn started event
        }
        
        private void OnTurnManagerTurnEnded(TurnManager turnManager, int turnNumber)
        {
            // Turn manager turn ended event
        }
        
        private void OnTurnManagerActionCompleted(TurnManager turnManager, TurnAction action)
        {
            // Turn manager action completed event
        }
        
        private void OnMoveResolverMoveResolved(MoveResolver resolver, Move move, BattleSpirit user, BattleSpirit target)
        {
            // Move resolver move resolved event
        }
        
        private void OnMoveResolverDamageCalculated(MoveResolver resolver, Move move, BattleSpirit user, BattleSpirit target, int damage)
        {
            // Move resolver damage calculated event
        }
        
        /// <summary>
        /// Initialize capture system
        /// </summary>
        private void InitializeCaptureSystem()
        {
            if (enableCaptureSystem)
            {
                captureManager = new CaptureManager();
                
                // Subscribe to capture events
                if (captureManager != null)
                {
                    captureManager.OnCaptureAttempted += OnCaptureManagerAttempted;
                    captureManager.OnCaptureSucceeded += OnCaptureManagerSucceeded;
                    captureManager.OnCaptureFailed += OnCaptureManagerFailed;
                    captureManager.OnSpiritAlreadyCaptured += OnCaptureManagerAlreadyCaptured;
                }
            }
        }
        
        /// <summary>
        /// Attempt to capture a spirit after battle
        /// </summary>
        public CaptureResult AttemptCapture(BattleSpirit target, PlayerContext playerContext)
        {
            if (!enableCaptureSystem || captureManager == null || target == null || playerContext == null)
            {
                return CaptureResult.Fail("", "", 0.0f, "Capture system disabled or invalid parameters");
            }
            
            try
            {
                // Check if this is a wild spirit (if captureOnlyWildSpirits is enabled)
                if (captureOnlyWildSpirits && !IsWildSpirit(target))
                {
                    return CaptureResult.Fail(target.SpiritID, target.Nickname, 0.0f, "Can only capture wild spirits");
                }
                
                // Convert BattleSpirit to SpiritInstance for capture
                var spiritInstance = ConvertToSpiritInstance(target);
                
                // Attempt capture
                var result = captureManager.TryCapture(spiritInstance, playerContext);
                
                // Process capture result
                ProcessCaptureResult(result);
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during capture attempt: {ex.Message}");
                return CaptureResult.Fail(target.SpiritID, target.Nickname, 0.0f, $"Capture error: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Check if a spirit is a wild spirit
        /// </summary>
        private bool IsWildSpirit(BattleSpirit spirit)
        {
            if (spirit == null) return false;
            
            // Wild spirits typically don't have a trainer ID or have a special wild trainer ID
            return string.IsNullOrEmpty(spirit.TrainerID) || spirit.TrainerID == "WILD" || spirit.TrainerID == "WILD_SPIRIT";
        }
        
        /// <summary>
        /// Convert BattleSpirit to SpiritInstance for capture system
        /// </summary>
        private SpiritInstance ConvertToSpiritInstance(BattleSpirit battleSpirit)
        {
            if (battleSpirit == null) return null;
            
            // Create a new SpiritInstance with battle data
            var spiritInstance = new SpiritInstance
            {
                SpiritID = battleSpirit.SpiritID,
                Nickname = battleSpirit.Nickname,
                Level = battleSpirit.Level,
                CurrentHP = battleSpirit.CurrentHP,
                MaxHP = battleSpirit.MaxHP,
                Rarity = SpiritRarity.Common // Default, could be enhanced
            };
            
            // Copy status effects if available
            if (battleSpirit.HasStatusEffects)
            {
                // This would need to be implemented based on your status effect system
                // spiritInstance.SetStatusEffect(...);
            }
            
            return spiritInstance;
        }
        
        /// <summary>
        /// Process capture result and trigger appropriate events
        /// </summary>
        private void ProcessCaptureResult(CaptureResult result)
        {
            if (result == null) return;
            
            // Trigger capture events
            OnCaptureAttempted?.Invoke(this, result);
            
            if (result.IsSuccess)
            {
                OnCaptureSucceeded?.Invoke(this, result);
                
                // Add to player's party if capture was successful
                AddCapturedSpiritToParty(result);
            }
            else if (result.IsAlreadyCaptured)
            {
                OnSpiritAlreadyCaptured?.Invoke(this, result.spiritID);
            }
            else
            {
                OnCaptureFailed?.Invoke(this, result);
            }
        }
        
        /// <summary>
        /// Add captured spirit to player's party
        /// </summary>
        private void AddCapturedSpiritToParty(CaptureResult result)
        {
            if (result == null || !result.IsSuccess) return;
            
            // This would integrate with your party management system
            // For now, we'll just log the capture
            Console.WriteLine($"Spirit {result.spiritName} ({result.spiritID}) captured successfully!");
            
            // You could add logic here to:
            // 1. Add to player's party
            // 2. Update inventory
            // 3. Trigger tutorials
            // 4. Update quest progress
            // 5. Show capture celebration UI
        }
        
        /// <summary>
        /// Auto-attempt capture after wild battle ends
        /// </summary>
        public void AutoAttemptCaptureAfterBattle(PlayerContext playerContext)
        {
            if (!autoAttemptCapture || !enableCaptureSystem) return;
            
            // Find defeated wild spirits
            var defeatedWildSpirits = GetDefeatedWildSpirits();
            
            foreach (var spirit in defeatedWildSpirits)
            {
                // Attempt capture with delay
                var result = AttemptCapture(spirit, playerContext);
                
                // Process result
                ProcessCaptureResult(result);
            }
        }
        
        /// <summary>
        /// Get list of defeated wild spirits
        /// </summary>
        private List<BattleSpirit> GetDefeatedWildSpirits()
        {
            var wildSpirits = new List<BattleSpirit>();
            
            if (battleContext?.enemyTeam == null) return wildSpirits;
            
            foreach (var spirit in battleContext.enemyTeam)
            {
                if (IsWildSpirit(spirit) && spirit.IsFainted)
                {
                    wildSpirits.Add(spirit);
                }
            }
            
            return wildSpirits;
        }
        
        /// <summary>
        /// Get capture statistics for a spirit
        /// </summary>
        public CaptureStats GetCaptureStats(BattleSpirit spirit)
        {
            if (!enableCaptureSystem || captureManager == null || spirit == null) return null;
            
            var spiritInstance = ConvertToSpiritInstance(spirit);
            return captureManager.GetCaptureStats(spiritInstance);
        }
        
        /// <summary>
        /// Get capture chance for a spirit
        /// </summary>
        public float GetCaptureChance(BattleSpirit spirit, PlayerContext playerContext)
        {
            if (!enableCaptureSystem || captureManager == null || spirit == null || playerContext == null) return 0.0f;
            
            var spiritInstance = ConvertToSpiritInstance(spirit);
            return captureManager.GetCaptureChance(spiritInstance, playerContext);
        }
        
        // Capture event handlers
        
        private void OnCaptureManagerAttempted(CaptureManager manager, CaptureResult result)
        {
            // Capture manager attempted event
        }
        
        private void OnCaptureManagerSucceeded(CaptureManager manager, CaptureResult result)
        {
            // Capture manager succeeded event
        }
        
        private void OnCaptureManagerFailed(CaptureManager manager, CaptureResult result)
        {
            // Capture manager failed event
        }
        
        private void OnCaptureManagerAlreadyCaptured(CaptureManager manager, string spiritID)
        {
            // Capture manager already captured event
        }
        
        /// <summary>
        /// Get battle controller summary for debugging
        /// </summary>
        public string GetBattleControllerSummary()
        {
            string status = isBattleActive ? "Active" : "Inactive";
            string phase = currentPhase.ToString();
            string turn = battleContext?.turnNumber.ToString() ?? "N/A";
            string paused = isPaused ? " | PAUSED" : "";
            string auto = isAutoBattle ? " | AUTO" : "";
            string capture = enableCaptureSystem ? " | Capture: ON" : " | Capture: OFF";
            
            return $"Battle Controller | Status: {status} | Phase: {phase} | Turn: {turn}{paused}{auto}{capture}";
        }
    }
}