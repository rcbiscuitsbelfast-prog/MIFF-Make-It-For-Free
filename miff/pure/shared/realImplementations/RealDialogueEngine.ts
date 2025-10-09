/**
 * Real Dialogue Engine Implementation
 * 
 * Replaces mock dialogue engine with actual dialogue processing logic
 * for production use in MIFF framework.
 */

export interface DialogueNode {
  id: string;
  text: string;
  speaker: string;
  choices?: DialogueChoice[];
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
  nextNode?: string;
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNode: string;
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
}

export interface DialogueCondition {
  type: 'flag' | 'item' | 'stat' | 'custom';
  key: string;
  operator: 'equals' | 'greater' | 'less' | 'contains';
  value: any;
}

export interface DialogueEffect {
  type: 'set_flag' | 'add_item' | 'modify_stat' | 'trigger_event';
  key: string;
  value: any;
}

export interface DialogueState {
  currentNode: string;
  visitedNodes: Set<string>;
  flags: Map<string, any>;
  variables: Map<string, any>;
  history: DialogueNode[];
}

export class RealDialogueEngine {
  private dialogues: Map<string, DialogueNode[]> = new Map();
  private currentState: DialogueState | null = null;
  private eventEmitter: any;

  constructor(eventEmitter?: any) {
    this.eventEmitter = eventEmitter;
  }

  /**
   * Start a dialogue conversation
   */
  async startDialogue(dialogueId: string, initialContext?: any): Promise<DialogueNode> {
    const dialogue = this.dialogues.get(dialogueId);
    if (!dialogue || dialogue.length === 0) {
      throw new Error(`Dialogue not found: ${dialogueId}`);
    }

    this.currentState = {
      currentNode: dialogue[0].id,
      visitedNodes: new Set(),
      flags: new Map(),
      variables: new Map(),
      history: []
    };

    // Apply initial context
    if (initialContext) {
      Object.entries(initialContext).forEach(([key, value]) => {
        this.currentState!.variables.set(key, value);
      });
    }

    const firstNode = dialogue[0];
    await this.processNode(firstNode);
    
    return firstNode;
  }

  /**
   * Process player choice and advance dialogue
   */
  async makeChoice(choiceId: string): Promise<DialogueNode | null> {
    if (!this.currentState) {
      throw new Error('No active dialogue');
    }

    const currentNode = this.getCurrentNode();
    if (!currentNode?.choices) {
      throw new Error('No choices available in current node');
    }

    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (!choice) {
      throw new Error(`Choice not found: ${choiceId}`);
    }

    // Check choice conditions
    if (choice.conditions && !this.evaluateConditions(choice.conditions)) {
      throw new Error('Choice conditions not met');
    }

    // Apply choice effects
    if (choice.effects) {
      await this.applyEffects(choice.effects);
    }

    // Move to next node
    const nextNode = this.findNode(choice.nextNode);
    if (nextNode) {
      this.currentState.currentNode = nextNode.id;
      await this.processNode(nextNode);
      return nextNode;
    }

    return null; // End of dialogue
  }

  /**
   * Get current dialogue node
   */
  getCurrentNode(): DialogueNode | null {
    if (!this.currentState) return null;
    
    return this.findNode(this.currentState.currentNode);
  }

  /**
   * Check if dialogue has ended
   */
  isDialogueEnded(): boolean {
    const currentNode = this.getCurrentNode();
    return !currentNode || (!currentNode.choices && !currentNode.nextNode);
  }

  /**
   * Load dialogue data from configuration
   */
  loadDialogue(dialogueId: string, nodes: DialogueNode[]): void {
    this.dialogues.set(dialogueId, nodes);
  }

  /**
   * Get dialogue state for saving/loading
   */
  getState(): DialogueState | null {
    return this.currentState ? { ...this.currentState } : null;
  }

  /**
   * Restore dialogue state
   */
  setState(state: DialogueState): void {
    this.currentState = state;
  }

  private async processNode(node: DialogueNode): Promise<void> {
    if (!this.currentState) return;

    // Mark node as visited
    this.currentState.visitedNodes.add(node.id);
    this.currentState.history.push(node);

    // Check node conditions
    if (node.conditions && !this.evaluateConditions(node.conditions)) {
      // Skip to next node if conditions not met
      if (node.nextNode) {
        const nextNode = this.findNode(node.nextNode);
        if (nextNode) {
          this.currentState.currentNode = nextNode.id;
          await this.processNode(nextNode);
        }
      }
      return;
    }

    // Apply node effects
    if (node.effects) {
      await this.applyEffects(node.effects);
    }

    // Emit dialogue event
    if (this.eventEmitter) {
      this.eventEmitter.emit('dialogue_node', {
        node,
        state: this.currentState
      });
    }
  }

  private evaluateConditions(conditions: DialogueCondition[]): boolean {
    return conditions.every(condition => this.evaluateCondition(condition));
  }

  private evaluateCondition(condition: DialogueCondition): boolean {
    if (!this.currentState) return false;

    let actualValue: any;

    switch (condition.type) {
      case 'flag':
        actualValue = this.currentState.flags.get(condition.key);
        break;
      case 'item':
        // Would check inventory system
        actualValue = this.currentState.variables.get(`item_${condition.key}`);
        break;
      case 'stat':
        actualValue = this.currentState.variables.get(`stat_${condition.key}`);
        break;
      case 'custom':
        actualValue = this.currentState.variables.get(condition.key);
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'equals':
        return actualValue === condition.value;
      case 'greater':
        return actualValue > condition.value;
      case 'less':
        return actualValue < condition.value;
      case 'contains':
        return Array.isArray(actualValue) && actualValue.includes(condition.value);
      default:
        return false;
    }
  }

  private async applyEffects(effects: DialogueEffect[]): Promise<void> {
    for (const effect of effects) {
      await this.applyEffect(effect);
    }
  }

  private async applyEffect(effect: DialogueEffect): Promise<void> {
    if (!this.currentState) return;

    switch (effect.type) {
      case 'set_flag':
        this.currentState.flags.set(effect.key, effect.value);
        break;
      case 'add_item':
        // Would integrate with inventory system
        this.currentState.variables.set(`item_${effect.key}`, effect.value);
        if (this.eventEmitter) {
          this.eventEmitter.emit('item_added', { item: effect.key, quantity: effect.value });
        }
        break;
      case 'modify_stat':
        const currentStat = this.currentState.variables.get(`stat_${effect.key}`) || 0;
        this.currentState.variables.set(`stat_${effect.key}`, currentStat + effect.value);
        break;
      case 'trigger_event':
        if (this.eventEmitter) {
          this.eventEmitter.emit(effect.key, effect.value);
        }
        break;
    }
  }

  private findNode(nodeId: string): DialogueNode | null {
    for (const dialogue of this.dialogues.values()) {
      const node = dialogue.find(n => n.id === nodeId);
      if (node) return node;
    }
    return null;
  }
}

// Export for use in place of mockDialogueEngine
export const realDialogueEngine = new RealDialogueEngine();