/**
 * Advanced AI System
 * 
 * Enhanced AI decision-making with machine learning algorithms,
 * behavior trees, and advanced decision-making strategies.
 */


export interface AIBehaviorTree {
  id: string;
  name: string;
  root: BehaviorNode;
  conditions: Map<string, (context: any) => boolean>;
  actions: Map<string, (context: any) => Promise<any>>;
}

export interface BehaviorNode {
  type: 'sequence' | 'selector' | 'parallel' | 'condition' | 'action' | 'decorator';
  name: string;
  children?: BehaviorNode[];
  condition?: string;
  action?: string;
  decorator?: (result: any) => any;
  maxExecutions?: number;
  cooldown?: number;
}

export interface AIMemory {
  experiences: AIExperience[];
  patterns: Map<string, number>;
  preferences: Map<string, number>;
  lastUpdate: number;
}

export interface AIExperience {
  id: string;
  context: any;
  action: string;
  result: 'success' | 'failure' | 'partial';
  reward: number;
  timestamp: number;
}

export interface NeuralNetwork {
  layers: number[];
  weights: number[][][];
  biases: number[][];
  activationFunction: (x: number) => number;
}

export class AdvancedAI {
  private behaviorTrees: Map<string, AIBehaviorTree> = new Map();
  private memories: Map<string, AIMemory> = new Map();
  private neuralNetworks: Map<string, NeuralNetwork> = new Map();
  private learningRate: number = 0.1;
  private explorationRate: number = 0.3;

  constructor() {
    this.initializeDefaultBehaviorTrees();
    this.initializeDefaultNeuralNetworks();
  }

  /**
   * Create a new behavior tree
   */
  createBehaviorTree(id: string, name: string, root: BehaviorNode): AIBehaviorTree {
    const tree: AIBehaviorTree = {
      id,
      name,
      root,
      conditions: new Map(),
      actions: new Map()
    };

    this.behaviorTrees.set(id, tree);
    return tree;
  }

  /**
   * Execute a behavior tree
   */
  async executeBehaviorTree(treeId: string, context: any): Promise<any> {
    const tree = this.behaviorTrees.get(treeId);
    if (!tree) {
      throw new Error(`Behavior tree ${treeId} not found`);
    }

    return await this.executeNode(tree.root, context, tree);
  }

  /**
   * Execute a behavior node
   */
  private async executeNode(node: BehaviorNode, context: any, tree: AIBehaviorTree): Promise<any> {
    switch (node.type) {
      case 'sequence':
        return await this.executeSequence(node, context, tree);
      case 'selector':
        return await this.executeSelector(node, context, tree);
      case 'parallel':
        return await this.executeParallel(node, context, tree);
      case 'condition':
        return await this.executeCondition(node, context, tree);
      case 'action':
        return await this.executeAction(node, context, tree);
      case 'decorator':
        return await this.executeDecorator(node, context, tree);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  /**
   * Execute sequence node (all children must succeed)
   */
  private async executeSequence(node: BehaviorNode, context: any, tree: AIBehaviorTree): Promise<any> {
    if (!node.children) return { success: true, result: null };

    for (const child of node.children) {
      const result = await this.executeNode(child, context, tree);
      if (!result.success) {
        return { success: false, result: result.result };
      }
    }

    return { success: true, result: null };
  }

  /**
   * Execute selector node (first successful child wins)
   */
  private async executeSelector(node: BehaviorNode, context: any, tree: AIBehaviorTree): Promise<any> {
    if (!node.children) return { success: false, result: null };

    for (const child of node.children) {
      const result = await this.executeNode(child, context, tree);
      if (result.success) {
        return result;
      }
    }

    return { success: false, result: null };
  }

  /**
   * Execute parallel node (all children run simultaneously)
   */
  private async executeParallel(node: BehaviorNode, context: any, tree: AIBehaviorTree): Promise<any> {
    if (!node.children) return { success: true, result: [] };

    const results = await Promise.all(
      node.children.map(child => this.executeNode(child, context, tree))
    );

    return {
      success: results.every(r => r.success),
      result: results
    };
  }

  /**
   * Execute condition node
   */
  private async executeCondition(node: BehaviorNode, context: any, tree: AIBehaviorTree): Promise<any> {
    if (!node.condition) return { success: false, result: null };

    const condition = tree.conditions.get(node.condition);
    if (!condition) {
      throw new Error(`Condition ${node.condition} not found`);
    }

    const result = condition(context);
    return { success: result, result: result };
  }

  /**
   * Execute action node
   */
  private async executeAction(node: BehaviorNode, context: any, tree: AIBehaviorTree): Promise<any> {
    if (!node.action) return { success: false, result: null };

    const action = tree.actions.get(node.action);
    if (!action) {
      throw new Error(`Action ${node.action} not found`);
    }

    const result = await action(context);
    return { success: true, result };
  }

  /**
   * Execute decorator node
   */
  private async executeDecorator(node: BehaviorNode, context: any, tree: AIBehaviorTree): Promise<any> {
    if (!node.children || node.children.length === 0) {
      return { success: false, result: null };
    }

    const childResult = await this.executeNode(node.children[0], context, tree);
    
    if (node.decorator) {
      return node.decorator(childResult);
    }

    return childResult;
  }

  /**
   * Add condition to behavior tree
   */
  addCondition(treeId: string, conditionId: string, condition: (context: any) => boolean): void {
    const tree = this.behaviorTrees.get(treeId);
    if (!tree) {
      throw new Error(`Behavior tree ${treeId} not found`);
    }

    tree.conditions.set(conditionId, condition);
  }

  /**
   * Add action to behavior tree
   */
  addAction(treeId: string, actionId: string, action: (context: any) => Promise<any>): void {
    const tree = this.behaviorTrees.get(treeId);
    if (!tree) {
      throw new Error(`Behavior tree ${treeId} not found`);
    }

    tree.actions.set(actionId, action);
  }

  /**
   * Learn from experience
   */
  learnFromExperience(aiId: string, experience: AIExperience): void {
    let memory = this.memories.get(aiId);
    if (!memory) {
      memory = {
        experiences: [],
        patterns: new Map(),
        preferences: new Map(),
        lastUpdate: Date.now()
      };
      this.memories.set(aiId, memory);
    }

    memory.experiences.push(experience);
    memory.lastUpdate = Date.now();

    // Update patterns
    const patternKey = `${experience.context.type}-${experience.action}`;
    const currentCount = memory.patterns.get(patternKey) || 0;
    memory.patterns.set(patternKey, currentCount + 1);

    // Update preferences based on reward
    const preferenceKey = experience.action;
    const currentPreference = memory.preferences.get(preferenceKey) || 0;
    const newPreference = currentPreference + (experience.reward * this.learningRate);
    memory.preferences.set(preferenceKey, newPreference);

    // Limit memory size
    if (memory.experiences.length > 1000) {
      memory.experiences = memory.experiences.slice(-500);
    }
  }

  /**
   * Get AI memory
   */
  getMemory(aiId: string): AIMemory | null {
    return this.memories.get(aiId) || null;
  }

  /**
   * Make decision using neural network
   */
  makeNeuralDecision(aiId: string, inputs: number[]): number[] {
    const network = this.neuralNetworks.get(aiId);
    if (!network) {
      // If specific AI network not found, use default
      const defaultNetwork = this.neuralNetworks.get('default');
      if (!defaultNetwork) {
        throw new Error(`Neural network for AI ${aiId} not found and no default network available`);
      }
      return this.forwardPropagate(defaultNetwork, inputs);
    }

    return this.forwardPropagate(network, inputs);
  }

  /**
   * Forward propagate through neural network
   */
  private forwardPropagate(network: NeuralNetwork, inputs: number[]): number[] {
    let currentInputs = [...inputs];

    for (let layer = 0; layer < network.layers.length; layer++) {
      const layerSize = network.layers[layer];
      const layerOutputs: number[] = [];

      for (let neuron = 0; neuron < layerSize; neuron++) {
        let sum = (network.biases[layer] && network.biases[layer][neuron]) || 0;

        for (let input = 0; input < currentInputs.length; input++) {
          const weight = (network.weights[layer] && network.weights[layer][neuron] && network.weights[layer][neuron][input]) || 0;
          sum += currentInputs[input] * weight;
        }

        layerOutputs.push(network.activationFunction(sum));
      }

      currentInputs = layerOutputs;
    }

    return currentInputs;
  }

  /**
   * Train neural network
   */
  trainNeuralNetwork(aiId: string, inputs: number[], expectedOutputs: number[]): void {
    const network = this.neuralNetworks.get(aiId);
    if (!network) {
      throw new Error(`Neural network for AI ${aiId} not found`);
    }

    // Simple backpropagation implementation
    const outputs = this.forwardPropagate(network, inputs);
    const errors = outputs.map((output, index) => expectedOutputs[index] - output);

    // Update weights and biases (simplified)
    for (let layer = 0; layer < network.layers.length; layer++) {
      for (let neuron = 0; neuron < network.layers[layer]; neuron++) {
        for (let weight = 0; weight < network.weights[layer][neuron].length; weight++) {
          network.weights[layer][neuron][weight] += this.learningRate * errors[neuron];
        }
        network.biases[layer][neuron] += this.learningRate * errors[neuron];
      }
    }
  }

  /**
   * Initialize default behavior trees
   */
  private initializeDefaultBehaviorTrees(): void {
    // Combat behavior tree
    /*
    const combatTree = this.createBehaviorTree('combat', 'Combat AI', {
      type: 'selector',
      name: 'Combat Root',
      children: [
        {
          type: 'condition',
          name: 'Check Health',
          condition: 'low_health'
        },
        {
          type: 'action',
          name: 'Heal',
          action: 'heal'
        },
        {
          type: 'condition',
          name: 'Check Advantage',
          condition: 'has_advantage'
        },
        {
          type: 'action',
          name: 'Attack',
          action: 'attack'
        },
        {
          type: 'action',
          name: 'Defend',
          action: 'defend'
        }
      ]
    });
    */

    // Add combat conditions
    this.addCondition('combat', 'low_health', (context) => {
      return context.health < context.maxHealth * 0.3;
    });

    this.addCondition('combat', 'has_advantage', (context) => {
      return context.advantage > 0.6;
    });

    // Add combat actions
    this.addAction('combat', 'heal', async (context) => {
      return { action: 'heal', target: context.self };
    });

    this.addAction('combat', 'attack', async (context) => {
      return { action: 'attack', target: context.enemy };
    });

    this.addAction('combat', 'defend', async (context) => {
      return { action: 'defend', target: context.self };
    });
  }

  /**
   * Initialize default neural networks
   */
  private initializeDefaultNeuralNetworks(): void {
    // Simple neural network for decision making
    const network: NeuralNetwork = {
      layers: [4, 8, 4], // Input: 4 features, Hidden: 8 neurons, Output: 4 actions
      weights: [
        // Layer 0 weights (4 inputs -> 8 hidden)
        Array(8).fill(null).map(() => Array(4).fill(0).map(() => Math.random() - 0.5)),
        // Layer 1 weights (8 hidden -> 4 outputs)
        Array(4).fill(null).map(() => Array(8).fill(0).map(() => Math.random() - 0.5))
      ],
      biases: [
        Array(8).fill(0).map(() => Math.random() - 0.5),
        Array(4).fill(0).map(() => Math.random() - 0.5)
      ],
      activationFunction: (x) => 1 / (1 + Math.exp(-x)) // Sigmoid
    };

    this.neuralNetworks.set('default', network);
  }

  /**
   * Get behavior tree
   */
  getBehaviorTree(treeId: string): AIBehaviorTree | null {
    return this.behaviorTrees.get(treeId) || null;
  }

  /**
   * Get all behavior trees
   */
  getAllBehaviorTrees(): AIBehaviorTree[] {
    return Array.from(this.behaviorTrees.values());
  }

  /**
   * Clear AI memory
   */
  clearMemory(aiId: string): void {
    this.memories.delete(aiId);
  }

  /**
   * Get AI statistics
   */
  getAIStatistics(aiId: string): any {
    const memory = this.memories.get(aiId);
    if (!memory) {
      return {
        experienceCount: 0,
        patternCount: 0,
        preferenceCount: 0,
        lastUpdate: null
      };
    }

    return {
      experienceCount: memory.experiences.length,
      patternCount: memory.patterns.size,
      preferenceCount: memory.preferences.size,
      lastUpdate: memory.lastUpdate,
      topPatterns: Array.from(memory.patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topPreferences: Array.from(memory.preferences.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }
}