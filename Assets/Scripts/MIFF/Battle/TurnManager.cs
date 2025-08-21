using System;
using System.Collections.Generic;
using System.Linq;

namespace MIFF.Battle
{
    /// <summary>
    /// Manages turn order, active spirits, and turn progression
    /// Supports player input and AI decision hooks for remixers
    /// </summary>
    [Serializable]
    public class TurnManager
    {
        [Header("Turn Management")]
        public int currentTurnIndex = 0;
        public List<TurnAction> turnQueue = new List<TurnAction>();
        public List<TurnAction> completedActions = new List<TurnAction>();
        public bool isTurnInProgress = false;
        
        [Header("Turn Order")]
        public TurnOrderType turnOrderType = TurnOrderType.SpeedBased;
        public bool allowPriorityMoves = true;
        public bool allowInterrupts = true;
        public int maxActionsPerTurn = 2;
        
        [Header("AI Integration")]
        public bool enableAI = true;
        public float aiDecisionDelay = 1.0f;
        public bool aiUsesRandomMoves = false;
        public float aiAggressionMultiplier = 1.0f;
        
        // Events for remixers to hook into
        public event Action<TurnManager, int> OnTurnStarted;
        public event Action<TurnManager, int> OnTurnEnded;
        public event Action<TurnManager, TurnAction> OnActionQueued;
        public event Action<TurnManager, TurnAction> OnActionCompleted;
        public event Action<TurnManager, TurnAction> OnActionInterrupted;
        
        private BattleContext battleContext;
        private Random random;
        
        public TurnManager(BattleContext context)
        {
            battleContext = context;
            random = new Random();
        }
        
        /// <summary>
        /// Initialize turn manager for a new battle
        /// </summary>
        public void InitializeBattle()
        {
            currentTurnIndex = 0;
            turnQueue.Clear();
            completedActions.Clear();
            isTurnInProgress = false;
            
            // Subscribe to battle events
            if (battleContext != null)
            {
                battleContext.OnBattleStarted += OnBattleStarted;
                battleContext.OnBattleEnded += OnBattleEnded;
            }
        }
        
        /// <summary>
        /// Start a new turn
        /// </summary>
        public void StartTurn()
        {
            if (isTurnInProgress) return;
            
            currentTurnIndex++;
            isTurnInProgress = true;
            turnQueue.Clear();
            completedActions.Clear();
            
            // Build turn queue based on turn order type
            BuildTurnQueue();
            
            OnTurnStarted?.Invoke(this, currentTurnIndex);
        }
        
        /// <summary>
        /// End the current turn
        /// </summary>
        public void EndTurn()
        {
            if (!isTurnInProgress) return;
            
            isTurnInProgress = false;
            
            // Process any remaining actions
            ProcessRemainingActions();
            
            OnTurnEnded?.Invoke(this, currentTurnIndex);
        }
        
        /// <summary>
        /// Build the turn queue for the current turn
        /// </summary>
        private void BuildTurnQueue()
        {
            var activeSpirits = battleContext.GetActiveSpirits();
            if (activeSpirits.Count == 0) return;
            
            switch (turnOrderType)
            {
                case TurnOrderType.SpeedBased:
                    BuildSpeedBasedQueue(activeSpirits);
                    break;
                    
                case TurnOrderType.PlayerFirst:
                    BuildPlayerFirstQueue(activeSpirits);
                    break;
                    
                case TurnOrderType.EnemyFirst:
                    BuildEnemyFirstQueue(activeSpirits);
                    break;
                    
                case TurnOrderType.Random:
                    BuildRandomQueue(activeSpirits);
                    break;
                    
                case TurnOrderType.PriorityBased:
                    BuildPriorityBasedQueue(activeSpirits);
                    break;
            }
        }
        
        /// <summary>
        /// Build speed-based turn queue
        /// </summary>
        private void BuildSpeedBasedQueue(List<BattleSpirit> activeSpirits)
        {
            // Sort by speed (highest first)
            var sortedSpirits = activeSpirits.OrderByDescending(s => s.Stats.GetStat(StatType.Speed)).ToList();
            
            foreach (var spirit in sortedSpirits)
            {
                if (spirit.isAI)
                {
                    // AI spirits get their actions automatically
                    var aiAction = GenerateAIAction(spirit);
                    if (aiAction != null)
                    {
                        QueueAction(aiAction);
                    }
                }
                else
                {
                    // Player spirits wait for input
                    var playerAction = new TurnAction
                    {
                        spirit = spirit,
                        actionType = TurnActionType.WaitingForInput,
                        priority = 0
                    };
                    QueueAction(playerAction);
                }
            }
        }
        
        /// <summary>
        /// Build player-first turn queue
        /// </summary>
        private void BuildPlayerFirstQueue(List<BattleSpirit> activeSpirits)
        {
            var playerSpirits = activeSpirits.Where(s => !s.isAI).ToList();
            var enemySpirits = activeSpirits.Where(s => s.isAI).ToList();
            
            // Add player spirits first
            foreach (var spirit in playerSpirits)
            {
                var playerAction = new TurnAction
                {
                    spirit = spirit,
                    actionType = TurnActionType.WaitingForInput,
                    priority = 0
                };
                QueueAction(playerAction);
            }
            
            // Add enemy spirits
            foreach (var spirit in enemySpirits)
            {
                var aiAction = GenerateAIAction(spirit);
                if (aiAction != null)
                {
                    QueueAction(aiAction);
                }
            }
        }
        
        /// <summary>
        /// Build enemy-first turn queue
        /// </summary>
        private void BuildEnemyFirstQueue(List<BattleSpirit> activeSpirits)
        {
            var playerSpirits = activeSpirits.Where(s => !s.isAI).ToList();
            var enemySpirits = activeSpirits.Where(s => s.isAI).ToList();
            
            // Add enemy spirits first
            foreach (var spirit in enemySpirits)
            {
                var aiAction = GenerateAIAction(spirit);
                if (aiAction != null)
                {
                    QueueAction(aiAction);
                }
            }
            
            // Add player spirits
            foreach (var spirit in playerSpirits)
            {
                var playerAction = new TurnAction
                {
                    spirit = spirit,
                    actionType = TurnActionType.WaitingForInput,
                    priority = 0
                };
                QueueAction(playerAction);
            }
        }
        
        /// <summary>
        /// Build random turn queue
        /// </summary>
        private void BuildRandomQueue(List<BattleSpirit> activeSpirits)
        {
            var shuffledSpirits = activeSpirits.OrderBy(x => random.Next()).ToList();
            
            foreach (var spirit in shuffledSpirits)
            {
                if (spirit.isAI)
                {
                    var aiAction = GenerateAIAction(spirit);
                    if (aiAction != null)
                    {
                        QueueAction(aiAction);
                    }
                }
                else
                {
                    var playerAction = new TurnAction
                    {
                        spirit = spirit,
                        actionType = TurnActionType.WaitingForInput,
                        priority = 0
                    };
                    QueueAction(playerAction);
                }
            }
        }
        
        /// <summary>
        /// Build priority-based turn queue
        /// </summary>
        private void BuildPriorityBasedQueue(List<BattleSpirit> activeSpirits)
        {
            var actions = new List<TurnAction>();
            
            foreach (var spirit in activeSpirits)
            {
                if (spirit.isAI)
                {
                    var aiAction = GenerateAIAction(spirit);
                    if (aiAction != null)
                    {
                        actions.Add(aiAction);
                    }
                }
                else
                {
                    var playerAction = new TurnAction
                    {
                        spirit = spirit,
                        actionType = TurnActionType.WaitingForInput,
                        priority = 0
                    };
                    actions.Add(playerAction);
                }
            }
            
            // Sort by priority (highest first), then by speed
            var sortedActions = actions.OrderByDescending(a => a.priority)
                                     .ThenByDescending(a => a.spirit.Stats.GetStat(StatType.Speed))
                                     .ToList();
            
            foreach (var action in sortedActions)
            {
                QueueAction(action);
            }
        }
        
        /// <summary>
        /// Generate AI action for a spirit
        /// </summary>
        private TurnAction GenerateAIAction(BattleSpirit spirit)
        {
            if (!enableAI || spirit == null || spirit.isFainted) return null;
            
            var action = new TurnAction
            {
                spirit = spirit,
                actionType = TurnActionType.AI,
                priority = 0
            };
            
            // Get best move against a random target
            var availableMoves = spirit.GetAvailableMoves();
            if (availableMoves.Count == 0) return null;
            
            if (aiUsesRandomMoves)
            {
                // Random move selection
                int randomIndex = random.Next(availableMoves.Count);
                action.move = availableMoves[randomIndex];
            }
            else
            {
                // AI chooses best move
                var activeEnemies = battleContext.GetOpponentTeam(spirit).Where(s => !s.isFainted).ToList();
                if (activeEnemies.Count > 0)
                {
                    var target = activeEnemies[random.Next(activeEnemies.Count)];
                    action.move = spirit.GetBestMove(target, battleContext);
                    action.target = target;
                }
            }
            
            // Set priority based on move
            if (action.move != null)
            {
                action.priority = action.move.priority;
            }
            
            return action;
        }
        
        /// <summary>
        /// Queue an action for the current turn
        /// </summary>
        public void QueueAction(TurnAction action)
        {
            if (action == null) return;
            
            turnQueue.Add(action);
            OnActionQueued?.Invoke(this, action);
        }
        
        /// <summary>
        /// Set player action for a spirit
        /// </summary>
        public bool SetPlayerAction(BattleSpirit spirit, Move move, BattleSpirit target)
        {
            if (spirit == null || move == null) return false;
            
            // Find the waiting action for this spirit
            var waitingAction = turnQueue.FirstOrDefault(a => a.spirit == spirit && a.actionType == TurnActionType.WaitingForInput);
            if (waitingAction == null) return false;
            
            // Update the action
            waitingAction.actionType = TurnActionType.Player;
            waitingAction.move = move;
            waitingAction.target = target;
            waitingAction.priority = move.priority;
            
            return true;
        }
        
        /// <summary>
        /// Process the next action in the queue
        /// </summary>
        public bool ProcessNextAction()
        {
            if (turnQueue.Count == 0) return false;
            
            var action = turnQueue[0];
            turnQueue.RemoveAt(0);
            
            if (action.actionType == TurnActionType.WaitingForInput)
            {
                // Still waiting for player input
                return false;
            }
            
            // Execute the action
            bool success = ExecuteAction(action);
            
            if (success)
            {
                completedActions.Add(action);
                OnActionCompleted?.Invoke(this, action);
            }
            
            return success;
        }
        
        /// <summary>
        /// Execute a turn action
        /// </summary>
        private bool ExecuteAction(TurnAction action)
        {
            if (action.spirit == null || action.spirit.isFainted) return false;
            
            switch (action.actionType)
            {
                case TurnActionType.Player:
                case TurnActionType.AI:
                    return ExecuteMoveAction(action);
                    
                case TurnActionType.Item:
                    return ExecuteItemAction(action);
                    
                case TurnActionType.Switch:
                    return ExecuteSwitchAction(action);
                    
                default:
                    return false;
            }
        }
        
        /// <summary>
        /// Execute a move action
        /// </summary>
        private bool ExecuteMoveAction(TurnAction action)
        {
            if (action.move == null || action.target == null) return false;
            
            // Check if spirit can use the move
            if (!action.spirit.CanUseMove(action.move)) return false;
            
            // Use the move
            bool moveUsed = action.spirit.UseMove(action.move, action.target, battleContext);
            
            if (moveUsed)
            {
                // Move effects will be handled by MoveResolver
                return true;
            }
            
            return false;
        }

        // Extension hook: allow pure C# AI controller to execute a turn using SpiritInstances
        public bool ExecuteAITurn(MIFF.BattleAIPure.BattleAIController ai,
                                  MIFF.Spirits.SpiritInstance self,
                                  MIFF.Spirits.SpiritInstance opponent)
        {
            if (ai == null || self == null || opponent == null) return false;
            var chosenMoveId = ai.SelectMove(self, opponent);
            return !string.IsNullOrEmpty(chosenMoveId);
        }
        
        /// <summary>
        /// Execute an item action
        /// </summary>
        private bool ExecuteItemAction(TurnAction action)
        {
            // Item usage logic would be implemented here
            // For now, just return success
            return true;
        }
        
        /// <summary>
        /// Execute a switch action
        /// </summary>
        private bool ExecuteSwitchAction(TurnAction action)
        {
            if (action.target == null) return false;
            
            // Switch the spirit
            return battleContext.SwitchActiveSpirit(action.spirit, action.target);
        }
        
        /// <summary>
        /// Process any remaining actions in the queue
        /// </summary>
        private void ProcessRemainingActions()
        {
            while (turnQueue.Count > 0)
            {
                ProcessNextAction();
            }
        }
        
        /// <summary>
        /// Check if all actions for the turn are complete
        /// </summary>
        public bool IsTurnComplete()
        {
            return turnQueue.Count == 0 || turnQueue.All(a => a.actionType == TurnActionType.WaitingForInput);
        }
        
        /// <summary>
        /// Get current turn status
        /// </summary>
        public string GetTurnStatus()
        {
            int queuedActions = turnQueue.Count;
            int completedActions = this.completedActions.Count;
            int waitingForInput = turnQueue.Count(a => a.actionType == TurnActionType.WaitingForInput);
            
            return $"Turn {currentTurnIndex} | Actions: {completedActions}/{queuedActions + completedActions} | Waiting: {waitingForInput}";
        }
        
        /// <summary>
        /// Get actions waiting for player input
        /// </summary>
        public List<TurnAction> GetActionsWaitingForInput()
        {
            return turnQueue.Where(a => a.actionType == TurnActionType.WaitingForInput).ToList();
        }
        
        /// <summary>
        /// Get completed actions for the current turn
        /// </summary>
        public List<TurnAction> GetCompletedActions()
        {
            return new List<TurnAction>(completedActions);
        }
        
        /// <summary>
        /// Interrupt current action (for priority moves, etc.)
        /// </summary>
        public bool InterruptAction(TurnAction interruptingAction)
        {
            if (!allowInterrupts) return false;
            
            // Find the action to interrupt
            var actionToInterrupt = turnQueue.FirstOrDefault();
            if (actionToInterrupt == null) return false;
            
            // Interrupt the action
            turnQueue.RemoveAt(0);
            OnActionInterrupted?.Invoke(this, actionToInterrupt);
            
            // Add the interrupting action at the front
            turnQueue.Insert(0, interruptingAction);
            
            return true;
        }
        
        /// <summary>
        /// Handle battle started event
        /// </summary>
        private void OnBattleStarted(BattleContext context)
        {
            InitializeBattle();
        }
        
        /// <summary>
        /// Handle battle ended event
        /// </summary>
        private void OnBattleEnded(BattleContext context)
        {
            // Clean up turn manager
            turnQueue.Clear();
            completedActions.Clear();
            isTurnInProgress = false;
        }
        
        /// <summary>
        /// Get turn manager summary for debugging
        /// </summary>
        public string GetTurnManagerSummary()
        {
            return $"Turn Manager | Turn: {currentTurnIndex} | Queue: {turnQueue.Count} | " +
                   $"Completed: {completedActions.Count} | In Progress: {isTurnInProgress} | " +
                   $"Order Type: {turnOrderType}";
        }
    }
    
    /// <summary>
    /// Represents a single action in a turn
    /// </summary>
    [Serializable]
    public class TurnAction
    {
        [Header("Action Identity")]
        public string actionID;
        public BattleSpirit spirit;
        public TurnActionType actionType;
        public int priority;
        
        [Header("Action Details")]
        public Move move;
        public BattleSpirit target;
        public string itemID;
        public int itemAmount;
        
        [Header("Timing")]
        public float delay;
        public bool isInterruptible = true;
        public bool hasBeenProcessed = false;
        
        public TurnAction()
        {
            actionID = Guid.NewGuid().ToString();
        }
        
        /// <summary>
        /// Get action description
        /// </summary>
        public string GetDescription()
        {
            string actionText = actionType switch
            {
                TurnActionType.Player => "Player Action",
                TurnActionType.AI => "AI Action",
                TurnActionType.Item => "Item Use",
                TurnActionType.Switch => "Switch",
                TurnActionType.WaitingForInput => "Waiting for Input",
                _ => "Unknown Action"
            };
            
            string details = "";
            if (move != null)
            {
                details = $" | {move.displayName}";
                if (target != null)
                {
                    details += $" → {target.nickname}";
                }
            }
            
            return $"{spirit?.nickname}: {actionText}{details}";
        }
        
        /// <summary>
        /// Check if action is ready to execute
        /// </summary>
        public bool IsReadyToExecute()
        {
            if (spirit == null || spirit.isFainted) return false;
            
            switch (actionType)
            {
                case TurnActionType.Player:
                case TurnActionType.AI:
                    return move != null && target != null;
                    
                case TurnActionType.Item:
                    return !string.IsNullOrEmpty(itemID);
                    
                case TurnActionType.Switch:
                    return target != null;
                    
                case TurnActionType.WaitingForInput:
                    return false;
                    
                default:
                    return false;
            }
        }
    }
    
    /// <summary>
    /// Types of turn actions
    /// </summary>
    public enum TurnActionType
    {
        None,
        Player,         // Player-controlled action
        AI,             // AI-controlled action
        Item,           // Item usage
        Switch,         // Spirit switching
        WaitingForInput // Waiting for player input
    }
    
    /// <summary>
    /// Types of turn order
    /// </summary>
    public enum TurnOrderType
    {
        SpeedBased,     // Based on spirit speed
        PlayerFirst,    // Player spirits go first
        EnemyFirst,     // Enemy spirits go first
        Random,         // Random order
        PriorityBased   // Based on move priority
    }
}