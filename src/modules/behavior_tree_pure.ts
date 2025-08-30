/**
 * BehaviorTreePure.ts - Advanced behavior tree implementation
 * 
 * MIFF Framework - Make It For Free
 * License: AGPL-3.0 (remix-safe, see LICENSE.md)
 * 
 * Inspired by Crystal Space's CEL behavior tree system with modern improvements.
 * Provides a complete behavior tree implementation with composite nodes, decorators,
 * and visual editor compatibility.
 * 
 * Usage:
 *   const tree = new BehaviorTree('guardAI');
 *   const root = new SequenceNode('patrol');
 *   tree.setRoot(root);
 *   const result = tree.execute(agent, deltaTime);
 * 
 * Remix Safety:
 *   - Behavior trees are serializable JSON structures
 *   - Nodes are composable and reusable
 *   - Visual editor integration points included
 *   - Hot-reloadable behavior definitions
 */

import { AIAgent } from './ai_system_pure';

// remix-safe-start: Core behavior interfaces
export interface AIBehavior {
  execute(agent: AIAgent, deltaTime: number, context?: ExecutionContext): BehaviorResult;
}

export enum BehaviorResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  RUNNING = 'RUNNING',
  ABORTED = 'ABORTED'
}
// remix-safe-end

/**
 * Base behavior tree node interface
 * All nodes must implement this interface
 */
export interface BehaviorTreeNode {
  id: string;
  name: string;
  nodeType: NodeType;
  children?: BehaviorTreeNode[];
  config?: Record<string, any>;
  
  /**
   * Execute this node
   * @param agent - The AI agent context
   * @param deltaTime - Time since last update
   * @param context - Shared execution context
   */
  execute(agent: AIAgent, deltaTime: number, context: ExecutionContext): BehaviorResult;
  
  /**
   * Reset node state (called when tree is restarted)
   */
  reset?(): void;
  
  /**
   * Validate node configuration
   */
  validate?(): string[]; // Returns array of error messages
  
  /**
   * Get visual editor metadata
   */
  getEditorMetadata?(): NodeEditorMetadata;
}

/**
 * Node types for behavior tree composition
 */
export enum NodeType {
  // Composite nodes (have children)
  SEQUENCE = 'sequence',
  SELECTOR = 'selector', 
  PARALLEL = 'parallel',
  
  // Decorator nodes (modify single child)
  INVERTER = 'inverter',
  REPEATER = 'repeater',
  RETRY = 'retry',
  TIMEOUT = 'timeout',
  COOLDOWN = 'cooldown',
  
  // Leaf nodes (actions and conditions)
  ACTION = 'action',
  CONDITION = 'condition',
  WAIT = 'wait',
  
  // Custom/extensible
  CUSTOM = 'custom'
}

/**
 * Execution context passed between nodes
 */
export interface ExecutionContext {
  sharedData: Map<string, any>;
  executionStack: string[]; // Track execution path for debugging
  startTime: number;
  maxExecutionTime: number;
  aborted: boolean;
}

/**
 * Visual editor metadata for behavior tree nodes
 */
export interface NodeEditorMetadata {
  displayName: string;
  description: string;
  category: string;
  color: string;
  icon?: string;
  inputs?: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    options?: string[];
    defaultValue?: any;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
  }>;
}

/**
 * Serializable behavior tree definition
 * Can be loaded from JSON for visual editor integration
 */
export interface BehaviorTreeDefinition {
  id: string;
  name: string;
  version: string;
  description?: string;
  root: SerializedNode;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Serialized node format for JSON storage
 */
export interface SerializedNode {
  id: string;
  name: string;
  nodeType: NodeType;
  config?: Record<string, any>;
  children?: SerializedNode[];
}

/**
 * Main behavior tree implementation
 * Integrates with AISystemPure as a complex behavior
 */
export class BehaviorTree implements AIBehavior {
  id: string;
  name: string;
  description?: string;
  
  private root: BehaviorTreeNode | null = null;
  private variables = new Map<string, any>();
  private executionStats = {
    totalExecutions: 0,
    successCount: 0,
    failureCount: 0,
    avgExecutionTime: 0
  };

  constructor(id: string, name?: string) {
    this.id = id;
    this.name = name || id;
  }

  /**
   * Set the root node of the behavior tree
   */
  setRoot(root: BehaviorTreeNode): void {
    this.root = root;
  }

  /**
   * Execute the behavior tree
   * Implements AIBehavior interface
   */
  execute(agent: AIAgent, deltaTime: number): BehaviorResult {
    if (!this.root) {
      console.warn(`Behavior tree '${this.id}' has no root node`);
      return BehaviorResult.FAILURE;
    }

    const startTime = performance.now();
    
    const context: ExecutionContext = {
      sharedData: new Map(),
      executionStack: [],
      startTime,
      maxExecutionTime: 50, // 50ms max execution time
      aborted: false
    };

    // Copy tree variables to shared context
    for (const [key, value] of this.variables.entries()) {
      context.sharedData.set(key, value);
    }

    let result: BehaviorResult;
    
    try {
      result = this.root.execute(agent, deltaTime, context);
    } catch (error) {
      console.error(`Error executing behavior tree '${this.id}':`, error);
      result = BehaviorResult.FAILURE;
    }

    // remix-safe-start: Execution statistics tracking
    const executionTime = performance.now() - startTime;
    this.executionStats.totalExecutions++;
    
    if (result === BehaviorResult.SUCCESS) {
      this.executionStats.successCount++;
    } else if (result === BehaviorResult.FAILURE) {
      this.executionStats.failureCount++;
    }

    // Update average execution time
    this.executionStats.avgExecutionTime = 
      (this.executionStats.avgExecutionTime * (this.executionStats.totalExecutions - 1) + executionTime) / 
      this.executionStats.totalExecutions;
    // remix-safe-end

    return result;
  }

  /**
   * Get execution statistics for monitoring and debugging
   */
  getExecutionStats() {
    return { ...this.executionStats };
  }

  /**
   * Set a variable that can be accessed by behavior tree nodes
   */
  setVariable(key: string, value: any): void {
    this.variables.set(key, value);
  }

  /**
   * Get a variable value
   */
  getVariable(key: string): any {
    return this.variables.get(key);
  }

  /**
   * Clear all variables
   */
  clearVariables(): void {
    this.variables.clear();
  }
}