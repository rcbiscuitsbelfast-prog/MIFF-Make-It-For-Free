/**
 * DialoguePure.ts
 * 
 * Inspired by Crystal Space's CEL scripting and jMonkeyEngine dialog utilities.
 * Provides pure, remix-safe dialogue and narrative systems for MIFF games.
 * 
 * Attribution: Crystal Space (LGPL) - CEL scripting language patterns
 * Attribution: jMonkeyEngine (BSD License) - dialog system utilities
 */

export interface DialogueNode {
  id: string;
  type: 'text' | 'choice' | 'condition' | 'action' | 'branch' | 'end';
  content?: string;
  choices?: DialogueChoice[];
  conditions?: DialogueCondition[];
  actions?: DialogueAction[];
  next?: string | string[];
  metadata?: Record<string, any>;
}

export interface DialogueChoice {
  id: string;
  text: string;
  condition?: DialogueCondition;
  action?: DialogueAction;
  next: string;
  metadata?: Record<string, any>;
}

export interface DialogueCondition {
  type: 'variable' | 'flag' | 'inventory' | 'quest' | 'script';
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'exists';
  target: string;
  value?: any;
  script?: string; // CEL-like script for complex conditions
}

export interface DialogueAction {
  type: 'set_variable' | 'set_flag' | 'add_item' | 'remove_item' | 'start_quest' | 'complete_quest' | 'play_sound' | 'script';
  target: string;
  value?: any;
  script?: string; // CEL-like script for complex actions
}

export interface DialogueTree {
  id: string;
  name: string;
  version: string;
  nodes: Map<string, DialogueNode>;
  variables: Map<string, any>;
  flags: Set<string>;
  metadata?: Record<string, any>;
}

export interface DialogueContext {
  variables: Map<string, any>;
  flags: Set<string>;
  inventory: Set<string>;
  quests: Map<string, { status: 'active' | 'completed' | 'failed'; progress: number }>;
  history: string[];
  currentNode?: string;
}

export interface DialogueResult {
  node: DialogueNode;
  choices?: DialogueChoice[];
  canContinue: boolean;
  isEnd: boolean;
  context: DialogueContext;
}

export class DialogueParser {
  private static parseCELScript(script: string): any {
    // Simplified CEL-like parser stub
    // In a full implementation, this would parse Crystal Space's CEL syntax
    const tokens = script.split(/\s+/);
    const result: any = { type: 'script', tokens };
    
    // Basic variable assignment: var = value
    if (tokens.length >= 3 && tokens[1] === '=') {
      return {
        type: 'assignment',
        variable: tokens[0],
        value: tokens.slice(2).join(' ')
      };
    }
    
    // Basic condition: if (condition) action
    if (tokens[0] === 'if' && tokens.includes('(') && tokens.includes(')')) {
      const conditionStart = tokens.indexOf('(') + 1;
      const conditionEnd = tokens.indexOf(')');
      const condition = tokens.slice(conditionStart, conditionEnd).join(' ');
      
      return {
        type: 'condition',
        condition,
        action: tokens.slice(conditionEnd + 1).join(' ')
      };
    }
    
    return result;
  }

  static parseCondition(condition: DialogueCondition): boolean {
    if (condition.script) {
      const parsed = this.parseCELScript(condition.script);
      // Simplified evaluation - in full implementation would use proper CEL interpreter
      return parsed.type === 'condition';
    }

    // Basic condition evaluation
    switch (condition.type) {
      case 'variable':
        return this.evaluateVariableCondition(condition);
      case 'flag':
        return this.evaluateFlagCondition(condition);
      case 'inventory':
        return this.evaluateInventoryCondition(condition);
      case 'quest':
        return this.evaluateQuestCondition(condition);
      default:
        return false;
    }
  }

  private static evaluateVariableCondition(condition: DialogueCondition): boolean {
    // This would be evaluated against the current context
    // For now, return a simple boolean based on the condition
    return condition.operator === 'exists' || condition.operator === 'equals';
  }

  private static evaluateFlagCondition(condition: DialogueCondition): boolean {
    return condition.operator === 'exists';
  }

  private static evaluateInventoryCondition(condition: DialogueCondition): boolean {
    return condition.operator === 'contains';
  }

  private static evaluateQuestCondition(condition: DialogueCondition): boolean {
    return condition.operator === 'equals';
  }

  static executeAction(action: DialogueAction, context: DialogueContext): void {
    if (action.script) {
      const parsed = this.parseCELScript(action.script);
      // Execute CEL-like script
      this.executeCELScript(parsed, context);
      return;
    }

    switch (action.type) {
      case 'set_variable':
        context.variables.set(action.target, action.value);
        break;
      case 'set_flag':
        if (action.value) {
          context.flags.add(action.target);
        } else {
          context.flags.delete(action.target);
        }
        break;
      case 'add_item':
        context.inventory.add(action.target);
        break;
      case 'remove_item':
        context.inventory.delete(action.target);
        break;
      case 'start_quest':
        context.quests.set(action.target, { status: 'active', progress: 0 });
        break;
      case 'complete_quest':
        const quest = context.quests.get(action.target);
        if (quest) {
          quest.status = 'completed';
          quest.progress = 100;
        }
        break;
      case 'play_sound':
        // Would trigger audio system
        console.log(`[DialoguePure] Playing sound: ${action.target}`);
        break;
    }
  }

  private static executeCELScript(parsed: any, context: DialogueContext): void {
    switch (parsed.type) {
      case 'assignment':
        context.variables.set(parsed.variable, parsed.value);
        break;
      case 'condition':
        // Execute conditional action
        console.log(`[DialoguePure] Executing conditional action: ${parsed.action}`);
        break;
      default:
        console.log(`[DialoguePure] Executing script: ${JSON.stringify(parsed)}`);
    }
  }
}

export class DialogueEngine {
  private tree: DialogueTree;
  private context: DialogueContext;

  constructor(tree: DialogueTree) {
    this.tree = tree;
    this.context = {
      variables: new Map(tree.variables),
      flags: new Set(tree.flags),
      inventory: new Set(),
      quests: new Map(),
      history: []
    };
  }

  start(startNodeId: string = 'start'): DialogueResult | null {
    const startNode = this.tree.nodes.get(startNodeId);
    if (!startNode) {
      console.error(`[DialoguePure] Start node not found: ${startNodeId}`);
      return null;
    }

    this.context.currentNode = startNodeId;
    return this.processNode(startNode);
  }

  continue(): DialogueResult | null {
    if (!this.context.currentNode) {
      return null;
    }

    const currentNode = this.tree.nodes.get(this.context.currentNode);
    if (!currentNode) {
      return null;
    }

    return this.processNode(currentNode);
  }

  selectChoice(choiceId: string): DialogueResult | null {
    const currentNode = this.tree.nodes.get(this.context.currentNode!);
    if (!currentNode) {
      return null;
    }

    const choice = currentNode.choices?.find(c => c.id === choiceId);
    if (!choice) {
      return null;
    }

    // Execute choice action
    if (choice.action) {
      DialogueParser.executeAction(choice.action, this.context);
    }

    // Move to next node
    this.context.currentNode = choice.next;
    this.context.history.push(choiceId);

    const nextNode = this.tree.nodes.get(choice.next);
    if (nextNode) {
      return this.processNode(nextNode);
    }

    return null;
  }

  private processNode(node: DialogueNode): DialogueResult {
    // Execute node actions
    if (node.actions) {
      node.actions.forEach(action => {
        DialogueParser.executeAction(action, this.context);
      });
    }

    // Check conditions
    if (node.conditions) {
      const allConditionsMet = node.conditions.every(condition => 
        DialogueParser.parseCondition(condition)
      );

      if (!allConditionsMet) {
        // Find fallback or end dialogue
        return this.handleConditionFailure(node);
      }
    }

    // Determine next node
    let nextNodeId: string | undefined;
    if (node.next) {
      if (Array.isArray(node.next)) {
        // Branch based on conditions or random selection
        nextNodeId = this.selectNextBranch(node.next);
      } else {
        nextNodeId = node.next;
      }
    }

    // Update context
    this.context.currentNode = nextNodeId;
    if (node.content) {
      this.context.history.push(node.content);
    }

    // Return result
    const result: DialogueResult = {
      node,
      canContinue: !!nextNodeId && nextNodeId !== 'end',
      isEnd: !nextNodeId || nextNodeId === 'end',
      context: { ...this.context }
    };

    if (node.type === 'choice' && node.choices) {
      // Filter choices based on conditions
      result.choices = node.choices.filter(choice => {
        if (!choice.condition) return true;
        return DialogueParser.parseCondition(choice.condition);
      });
    }

    return result;
  }

  private handleConditionFailure(node: DialogueNode): DialogueResult {
    // Find fallback node or end dialogue
    const fallbackNode = this.tree.nodes.get('fallback') || this.tree.nodes.get('end');
    
    return {
      node: fallbackNode || node,
      canContinue: false,
      isEnd: true,
      context: { ...this.context }
    };
  }

  private selectNextBranch(branches: string[]): string {
    // Simple random selection - could be enhanced with weighted selection
    const rand = (global as any).__DP_RAND__ ? (global as any).__DP_RAND__() : Math.random();
    return branches[Math.floor(rand * branches.length)];
  }

  getContext(): DialogueContext {
    return { ...this.context };
  }

  setVariable(name: string, value: any): void {
    this.context.variables.set(name, value);
  }

  getVariable(name: string): any {
    return this.context.variables.get(name);
  }

  setFlag(name: string, value: boolean = true): void {
    if (value) {
      this.context.flags.add(name);
    } else {
      this.context.flags.delete(name);
    }
  }

  hasFlag(name: string): boolean {
    return this.context.flags.has(name);
  }

  addToInventory(itemId: string): void {
    this.context.inventory.add(itemId);
  }

  removeFromInventory(itemId: string): void {
    this.context.inventory.delete(itemId);
  }

  hasItem(itemId: string): boolean {
    return this.context.inventory.has(itemId);
  }

  getDialogueHistory(): string[] {
    return [...this.context.history];
  }

  // Serialization
  serialize(): string {
    const serializableTree = {
      ...this.tree,
      nodes: Object.fromEntries(this.tree.nodes),
      variables: Object.fromEntries(this.tree.variables),
      flags: Array.from(this.tree.flags)
    };

    return JSON.stringify(serializableTree, null, 2);
  }

  static deserialize(data: string): DialogueTree {
    const parsed = JSON.parse(data);
    
    return {
      ...parsed,
      nodes: new Map(Object.entries(parsed.nodes || {})),
      variables: new Map(Object.entries(parsed.variables || {})),
      flags: new Set(parsed.flags || [])
    };
  }
}

// CLI interface
export function createDialogueEngine(treeData: string): DialogueEngine {
  const tree = DialogueEngine.deserialize(treeData);
  return new DialogueEngine(tree);
}

// Export for CLI usage
export default DialogueEngine;