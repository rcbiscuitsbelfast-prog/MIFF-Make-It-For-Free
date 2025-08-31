/**
 * AISystemPure.ts - Event-driven AI system with scriptable behaviors
 * 
 * MIFF Framework - Make It For Free
 * License: AGPL-3.0 (remix-safe, see LICENSE.md)
 * 
 * Inspired by Crystal Space's CEL (Crystal Entity Layer) and Delta Engine's behavior system.
 * Provides event-driven AI with support for state machines, goal-oriented behavior, and scripting.
 * 
 * Usage:
 *   const aiSystem = new AISystemPure(dependencies);
 *   const agent = aiSystem.createAgent('enemy', { maxHealth: 100 });
 *   aiSystem.setGoal(agent.id, 'patrol', { waypoints: [...] });
 * 
 * Remix Safety:
 *   - AI behaviors are data-driven and scriptable
 *   - No hardcoded game logic - everything is configurable
 *   - Event-driven design allows hot-swapping of behaviors
 *   - Built-in debugging and introspection tools
 */

import { BaseMIFFSystem, type SystemDependencies } from '../../miff/pure } from './eventbus_pure';

/**
 * AI agent state and properties
 */
export interface AIAgent {
  id: string;
  name: string;
  entityId?: string;  // Link to ECS entity if applicable
  state: string;
  previousState: string;
  stateData: Record<string, any>;
  properties: Record<string, any>;
  goals: AIGoal[];
  currentGoal?: AIGoal;
  blackboard: Record<string, any>;  // Shared data storage
  enabled: boolean;
  lastUpdate: number;
}

/**
 * AI goal definition
 */
export interface AIGoal {
  id: string;
  type: string;
  priority: number;
  status: 'inactive' | 'active' | 'completed' | 'failed';
  data: Record<string, any>;
  conditions?: AICondition[];
  actions?: AIAction[];
  timeout?: number;
  startTime?: number;
}

/**
 * AI condition for goal activation or state transitions
 */
export interface AICondition {
  type: string;
  params: Record<string, any>;
  negate?: boolean;
}

/**
 * AI action to perform
 */
export interface AIAction {
  type: string;
  params: Record<string, any>;
  delay?: number;
  repeat?: boolean;
}

/**
 * State machine definition for AI behavior
 */
export interface AIStateMachine {
  id: string;
  states: Record<string, AIState>;
  initialState: string;
  globalTransitions?: AITransition[];
}

/**
 * Individual state in the state machine
 */
export interface AIState {
  id: string;
  enter?: AIAction[];
  update?: AIAction[];
  exit?: AIAction[];
  transitions: AITransition[];
  timeout?: number;
}

/**
 * State transition definition
 */
export interface AITransition {
  targetState: string;
  conditions: AICondition[];
  actions?: AIAction[];
}

/**
 * AI behavior script (for runtime scripting)
 */
export interface AIScript {
  id: string;
  name: string;
  code: string;
  language: 'javascript' | 'lua' | 'json';
  compiled?: Function;
  lastCompiled?: number;
}

/**
 * Main AI system managing agents, behaviors, and state machines
 */
export class AISystemPure extends BaseMIFFSystem {
  readonly name = 'AISystemPure';
  readonly version = '1.0.0';

  private agents = new Map<string, AIAgent>();
  private stateMachines = new Map<string, AIStateMachine>();
  private actionHandlers = new Map<string, (agent: AIAgent, params: any) => Promise<boolean>>();
  private conditionHandlers = new Map<string, (agent: AIAgent, params: any) => boolean>();
  private scripts = new Map<string, AIScript>();
  private updateInterval: number = 100; // Update every 100ms
  private lastUpdate: number = 0;

  constructor(dependencies: SystemDependencies) {
    super(dependencies);
    this.registerBuiltinHandlers();
  }

  async init(): Promise<void> {
    console.log('Initializing AI System');

    // Subscribe to game events that might affect AI
    this.subscribe('entity.destroyed', (data) => {
      this.removeAgentByEntity(data.entityId);
    });

    this.subscribe('game.pause', () => {
      this.pauseAllAgents();
    });

    this.subscribe('game.resume', () => {
      this.resumeAllAgents();
    });

    this.emit('system.initialized', { system: this.name });
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down AI System');
    this.agents.clear();
    this.stateMachines.clear();
    this.scripts.clear();
    this.emit('system.shutdown', { system: this.name });
  }

  update(deltaTime: number): void {
    const currentTime = Date.now();
    
    // Throttle updates to avoid excessive processing
    if (currentTime - this.lastUpdate < this.updateInterval) {
      return;
    }

    for (const agent of Array.from(this.agents.values())) {
      if (agent.enabled) {
        this.updateAgent(agent, deltaTime);
      }
    }

    this.lastUpdate = currentTime;
  }

  /**
   * Create a new AI agent
   */
  createAgent(
    name: string, 
    properties: Record<string, any> = {},
    entityId?: string
  ): AIAgent {
    const agent: AIAgent = {
      id: this.generateId(),
      name,
      entityId,
      state: 'idle',
      previousState: 'idle',
      stateData: {},
      properties: { ...properties },
      goals: [],
      blackboard: {},
      enabled: true,
      lastUpdate: Date.now()
    };

    this.agents.set(agent.id, agent);
    
    this.emit('ai.agent.created', {
      agentId: agent.id,
      name: agent.name,
      entityId: entityId
    });

    return agent;
  }

  /**
   * Remove an AI agent
   */
  removeAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.emit('ai.agent.removed', { agentId, name: agent.name });
    }
  }

  /**
   * Remove agent by associated entity ID
   */
  removeAgentByEntity(entityId: string): void {
    for (const [id, agent] of Array.from(this.agents.entries())) {
      if (agent.entityId === entityId) {
        this.removeAgent(id);
        break;
      }
    }
  }

  /**
   * Get an agent by ID
   */
  getAgent(agentId: string): AIAgent | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all agents
   */
  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Set an agent's state
   */
  setState(agentId: string, newState: string, stateData: Record<string, any> = {}): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const oldState = agent.state;
    agent.previousState = oldState;
    agent.state = newState;
    agent.stateData = { ...stateData };

    this.emit('ai.state.changed', {
      agentId,
      oldState,
      newState,
      stateData
    });
  }

  /**
   * Add a goal to an agent
   */
  setGoal(agentId: string, goalType: string, goalData: Record<string, any>, priority: number = 1): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const goal: AIGoal = {
      id: this.generateId(),
      type: goalType,
      priority,
      status: 'inactive',
      data: goalData,
      startTime: Date.now()
    };

    agent.goals.push(goal);
    agent.goals.sort((a, b) => b.priority - a.priority); // Higher priority first

    // Set as current goal if it's the highest priority
    if (!agent.currentGoal || goal.priority > agent.currentGoal.priority) {
      this.activateGoal(agent, goal);
    }

    this.emit('ai.goal.set', {
      agentId,
      goalId: goal.id,
      goalType,
      priority
    });
  }

  /**
   * Complete a goal
   */
  completeGoal(agentId: string, goalId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const goalIndex = agent.goals.findIndex(g => g.id === goalId);
    if (goalIndex >= 0) {
      const goal = agent.goals[goalIndex];
      goal.status = 'completed';
      agent.goals.splice(goalIndex, 1);

      // If this was the current goal, find the next one
      if (agent.currentGoal?.id === goalId) {
        agent.currentGoal = undefined;
        this.selectNextGoal(agent);
      }

      this.emit('ai.goal.completed', {
        agentId,
        goalId,
        goalType: goal.type
      });
    }
  }

  /**
   * Register a state machine for AI behavior
   */
  registerStateMachine(stateMachine: AIStateMachine): void {
    this.stateMachines.set(stateMachine.id, stateMachine);
    
    this.emit('ai.statemachine.registered', {
      stateMachineId: stateMachine.id,
      states: Object.keys(stateMachine.states)
    });
  }

  /**
   * Apply a state machine to an agent
   */
  applyStateMachine(agentId: string, stateMachineId: string): void {
    const agent = this.agents.get(agentId);
    const stateMachine = this.stateMachines.get(stateMachineId);
    
    if (!agent || !stateMachine) return;

    agent.properties.stateMachine = stateMachineId;
    this.setState(agentId, stateMachine.initialState);

    this.emit('ai.statemachine.applied', {
      agentId,
      stateMachineId
    });
  }

  /**
   * Register an action handler
   */
  registerAction(actionType: string, handler: (agent: AIAgent, params: any) => Promise<boolean>): void {
    this.actionHandlers.set(actionType, handler);
    console.log(`Registered AI action handler: ${actionType}`);
  }

  /**
   * Register a condition handler
   */
  registerCondition(conditionType: string, handler: (agent: AIAgent, params: any) => boolean): void {
    this.conditionHandlers.set(conditionType, handler);
    console.log(`Registered AI condition handler: ${conditionType}`);
  }

  /**
   * Execute an AI action
   */
  async executeAction(agent: AIAgent, action: AIAction): Promise<boolean> {
    const handler = this.actionHandlers.get(action.type);
    if (!handler) {
      console.warn(`No handler for AI action: ${action.type}`);
      return false;
    }

    try {
      const result = await handler(agent, action.params);
      
      this.emit('ai.action.executed', {
        agentId: agent.id,
        actionType: action.type,
        success: result
      });

      return result;
    } catch (error) {
      console.error(`Error executing AI action ${action.type}:`, error);
      return false;
    }
  }

  /**
   * Evaluate an AI condition
   */
  evaluateCondition(agent: AIAgent, condition: AICondition): boolean {
    const handler = this.conditionHandlers.get(condition.type);
    if (!handler) {
      console.warn(`No handler for AI condition: ${condition.type}`);
      return false;
    }

    try {
      const result = handler(agent, condition.params);
      return condition.negate ? !result : result;
    } catch (error) {
      console.error(`Error evaluating AI condition ${condition.type}:`, error);
      return false;
    }
  }

  /**
   * Load and compile an AI script
   */
  loadScript(script: AIScript): void {
    try {
      if (script.language === 'javascript') {
        // Simple JavaScript compilation (in production, use a proper sandbox)
        script.compiled = new Function('agent', 'ai', 'eventBus', script.code);
        script.lastCompiled = Date.now();
        
        this.scripts.set(script.id, script);
        
        this.emit('ai.script.loaded', {
          scriptId: script.id,
          name: script.name
        });
      } else {
        throw new Error(`Unsupported script language: ${script.language}`);
      }
    } catch (error) {
      console.error(`Failed to compile AI script ${script.id}:`, error);
      this.emit('ai.script.error', {
        scriptId: script.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Execute an AI script on an agent
   */
  executeScript(agentId: string, scriptId: string): void {
    const agent = this.agents.get(agentId);
    const script = this.scripts.get(scriptId);
    
    if (!agent || !script || !script.compiled) return;

    try {
      script.compiled(agent, this, this.eventBus);
      
      this.emit('ai.script.executed', {
        agentId,
        scriptId
      });
    } catch (error) {
      console.error(`Error executing AI script ${scriptId} on agent ${agentId}:`, error);
    }
  }

  /**
   * Update an individual agent
   */
  private updateAgent(agent: AIAgent, deltaTime: number): void {
    // Update current goal
    if (agent.currentGoal) {
      this.updateGoal(agent, agent.currentGoal);
    }

    // Process state machine if assigned
    if (agent.properties.stateMachine) {
      this.processStateMachine(agent);
    }

    agent.lastUpdate = Date.now();
  }

  /**
   * Update a goal
   */
  private updateGoal(agent: AIAgent, goal: AIGoal): void {
    // Check for timeout
    if (goal.timeout && goal.startTime) {
      const elapsed = Date.now() - goal.startTime;
      if (elapsed > goal.timeout) {
        goal.status = 'failed';
        this.emit('ai.goal.timeout', {
          agentId: agent.id,
          goalId: goal.id
        });
        return;
      }
    }

    // Execute goal actions if any
    if (goal.actions) {
      for (const action of goal.actions) {
        this.executeAction(agent, action);
      }
    }
  }

  /**
   * Process state machine transitions
   */
  private processStateMachine(agent: AIAgent): void {
    const stateMachine = this.stateMachines.get(agent.properties.stateMachine);
    if (!stateMachine) return;

    const currentState = stateMachine.states[agent.state];
    if (!currentState) return;

    // Check transitions
    for (const transition of currentState.transitions) {
      const canTransition = transition.conditions.every(condition => 
        this.evaluateCondition(agent, condition)
      );

      if (canTransition) {
        this.performStateTransition(agent, transition.targetState, transition.actions);
        break;
      }
    }

    // Execute current state update actions
    if (currentState.update) {
      for (const action of currentState.update) {
        this.executeAction(agent, action);
      }
    }
  }

  /**
   * Perform a state transition
   */
  private performStateTransition(agent: AIAgent, targetState: string, actions?: AIAction[]): void {
    const stateMachine = this.stateMachines.get(agent.properties.stateMachine);
    if (!stateMachine) return;

    const currentState = stateMachine.states[agent.state];
    const newState = stateMachine.states[targetState];

    if (!newState) return;

    // Execute exit actions from current state
    if (currentState?.exit) {
      for (const action of currentState.exit) {
        this.executeAction(agent, action);
      }
    }

    // Execute transition actions
    if (actions) {
      for (const action of actions) {
        this.executeAction(agent, action);
      }
    }

    // Change state
    this.setState(agent.id, targetState);

    // Execute enter actions for new state
    if (newState.enter) {
      for (const action of newState.enter) {
        this.executeAction(agent, action);
      }
    }
  }

  /**
   * Activate a goal as the current goal
   */
  private activateGoal(agent: AIAgent, goal: AIGoal): void {
    if (agent.currentGoal) {
      agent.currentGoal.status = 'inactive';
    }

    agent.currentGoal = goal;
    goal.status = 'active';

    this.emit('ai.goal.activated', {
      agentId: agent.id,
      goalId: goal.id,
      goalType: goal.type
    });
  }

  /**
   * Select the next highest priority goal
   */
  private selectNextGoal(agent: AIAgent): void {
    const availableGoals = agent.goals.filter(g => g.status === 'inactive');
    if (availableGoals.length > 0) {
      const nextGoal = availableGoals[0]; // Already sorted by priority
      this.activateGoal(agent, nextGoal);
    }
  }

  /**
   * Pause all agents
   */
  private pauseAllAgents(): void {
    for (const agent of Array.from(this.agents.values())) {
      agent.enabled = false;
    }
  }

  /**
   * Resume all agents
   */
  private resumeAllAgents(): void {
    for (const agent of Array.from(this.agents.values())) {
      agent.enabled = true;
    }
  }

  /**
   * Register built-in action and condition handlers
   */
  private registerBuiltinHandlers(): void {
    // Built-in actions
    this.registerAction('wait', async (agent, params) => {
      const duration = params.duration || 1000;
      agent.blackboard.waitUntil = Date.now() + duration;
      return true;
    });

    this.registerAction('log', async (agent, params) => {
      console.log(`AI Agent ${agent.name}: ${params.message || 'No message'}`);
      return true;
    });

    this.registerAction('setState', async (agent, params) => {
      this.setState(agent.id, params.state, params.data || {});
      return true;
    });

    this.registerAction('emit', async (agent, params) => {
      this.emit(params.event, {
        agentId: agent.id,
        ...params.data
      });
      return true;
    });

    // Built-in conditions
    this.registerCondition('always', () => true);
    this.registerCondition('never', () => false);

    this.registerCondition('waitFinished', (agent) => {
      const waitUntil = agent.blackboard.waitUntil;
      return !waitUntil || Date.now() >= waitUntil;
    });

    this.registerCondition('hasProperty', (agent, params) => {
      return agent.properties.hasOwnProperty(params.property);
    });

    this.registerCondition('propertyEquals', (agent, params) => {
      return agent.properties[params.property] === params.value;
    });

    this.registerCondition('stateIs', (agent, params) => {
      return agent.state === params.state;
    });

    this.registerCondition('hasGoal', (agent, params) => {
      return agent.goals.some(goal => goal.type === params.goalType);
    });
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get system configuration for debugging
   */
  getConfig(): Record<string, any> {
    return {
      ...super.getConfig(),
      agentCount: this.agents.size,
      stateMachineCount: this.stateMachines.size,
      actionHandlerCount: this.actionHandlers.size,
      conditionHandlerCount: this.conditionHandlers.size,
      scriptCount: this.scripts.size,
      updateInterval: this.updateInterval
    };
  }

  /**
   * Get debug information about all agents
   */
  getDebugInfo(): Record<string, any> {
    const agents: Record<string, any> = {};
    
    for (const [id, agent] of Array.from(this.agents.entries())) {
      agents[id] = {
        name: agent.name,
        state: agent.state,
        previousState: agent.previousState,
        enabled: agent.enabled,
        goalCount: agent.goals.length,
        currentGoal: agent.currentGoal?.type || null,
        properties: Object.keys(agent.properties),
        blackboardKeys: Object.keys(agent.blackboard)
      };
    }

    return {
      agents,
      registeredActions: Array.from(this.actionHandlers.keys()),
      registeredConditions: Array.from(this.conditionHandlers.keys()),
      stateMachines: Array.from(this.stateMachines.keys())
    };
  }
}