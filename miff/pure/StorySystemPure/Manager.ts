export type StoryNode = {
  id: string;
  title: string;
  content: string;
  type: 'narrative' | 'choice' | 'action' | 'cutscene' | 'battle' | 'exploration';
  conditions: StoryCondition[];
  rewards: StoryReward[];
  nextNodes: string[];
  metadata: Record<string, any>;
};

export type StoryCondition = {
  type: 'level' | 'quest' | 'item' | 'flag' | 'stat' | 'location' | 'time';
  target: string;
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'exists';
  value: any;
  description: string;
};

export type StoryReward = {
  type: 'xp' | 'item' | 'currency' | 'unlock' | 'flag' | 'stat' | 'cutscene';
  id?: string;
  amount?: number;
  description: string;
  metadata?: Record<string, any>;
};

export type StoryFlag = {
  id: string;
  name: string;
  value: any;
  type: 'boolean' | 'number' | 'string' | 'object';
  description: string;
  setAt: number;
  expiresAt?: number;
};

export type StoryProgress = {
  nodeId: string;
  completed: boolean;
  completedAt?: number;
  choices: string[];
  rewards: StoryReward[];
  flags: string[];
};

export type StoryArc = {
  id: string;
  name: string;
  description: string;
  nodes: Map<string, StoryNode>;
  startNode: string;
  endNodes: string[];
  flags: Map<string, StoryFlag>;
  progress: Map<string, StoryProgress>;
  metadata: Record<string, any>;
};

export type StoryResult = {
  op: 'storyResult';
  status: 'success' | 'failure' | 'blocked';
  currentNode: StoryNode;
  availableChoices: string[];
  rewards: StoryReward[];
  flags: StoryFlag[];
  progress: number; // 0-100
  nextNodes: string[];
};

export type StoryValidationResult = {
  op: 'validateStory';
  status: 'ok' | 'error';
  arcId: string;
  issues: string[];
  warnings: string[];
  isValid: boolean;
};

export class StoryManager {
  private arcs = new Map<string, StoryArc>();
  private globalFlags = new Map<string, StoryFlag>();
  private playerStats = new Map<string, number>();

  // Story Arc Management
  createArc(arc: StoryArc): StoryValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Validate arc structure
    if (!arc.id || arc.id.trim() === '') {
      issues.push('Arc ID is required');
    }

    if (!arc.name || arc.name.trim() === '') {
      issues.push('Arc name is required');
    }

    if (!arc.startNode || !arc.nodes.has(arc.startNode)) {
      issues.push('Start node must exist in arc nodes');
    }

    // Validate nodes
    for (const [nodeId, node] of arc.nodes) {
      if (!node.id || node.id !== nodeId) {
        issues.push(`Node ID mismatch: ${nodeId}`);
      }

      if (!node.title || node.title.trim() === '') {
        issues.push(`Node ${nodeId}: title is required`);
      }

      if (!node.content || node.content.trim() === '') {
        issues.push(`Node ${nodeId}: content is required`);
      }

      // Validate next nodes exist
      for (const nextNodeId of node.nextNodes) {
        if (!arc.nodes.has(nextNodeId)) {
          issues.push(`Node ${nodeId}: references non-existent next node ${nextNodeId}`);
        }
      }
    }

    // Check for unreachable nodes
    const reachableNodes = this.findReachableNodes(arc, arc.startNode);
    const unreachableNodes = Array.from(arc.nodes.keys()).filter((id: any) => !reachableNodes.has(id));
    if (unreachableNodes.length > 0) {
      warnings.push(`Unreachable nodes: ${unreachableNodes.join(', ')}`);
    }

    const isValid = issues.length === 0;

    if (isValid) 
      this.arcs.set(id: arc.id, { ...arc });
    }

    return 
      op: 'validateStory',
      status: isValid ? 'ok' : 'error',
      arcId: id: arc.id,
      issues,
      warnings,
      isValid
    };
  }

  // Story Progression
  startArc(arcId: string): StoryResult | null {
    const arc = this.arcs.get(arcId);
    if (!arc) return null;

    const startNode = arc.nodes.get(arc.startNode);
    if (!startNode) return null;

    return this.processNode(arc, startNode);
  }

  processNode(arc: StoryArc, node: StoryNode): StoryResult {
    // Check conditions
    const canAccess = this.checkConditions(node.conditions);
    if (!canAccess) {
      return {
        op: 'storyResult',
        status: 'blocked',
        currentNode: node,
        availableChoices: [],
        rewards: [],
        flags: Array.from(arc.flags.values()),
        progress: this.calculateProgress(arc),
        nextNodes: []
      };
    }

    // Apply rewards
    const rewards = this.applyRewards(node.rewards, arc);

    // Update flags
    const newFlags = this.updateFlags(node, arc);

    // Get available choices
    const availableChoices = this.getAvailableChoices(node, arc);

    // Calculate progress
    const progress = this.calculateProgress(arc);

    // Update progress tracking
    this.updateProgress(arc, id: node.id, rewards, newFlags);

    return 
      op: 'storyResult',
      status: 'success',
      currentNode: node,
      availableChoices,
      rewards,
      flags: Array.from(arc.flags.values()),
      progress,
      nextNodes: nextNodes: node.nextNodes};
  }

  advanceToNode(arcId: string, nodeId: string): StoryResult | null {
    const arc = this.arcs.get(arcId);
    if (!arc) return null;

    const node = arc.nodes.get(nodeId);
    if (!node) return null;

    return this.processNode(arc, node);
  }

  // Flag Management
  setFlag(flagId: string, value: any, type: StoryFlag['type'] = 'boolean', description: string = '', expiresAt?: number): void {
    const flag: StoryFlag = {
      id: flagId,
      name: flagId,
      value,
      type,
      description,
      setAt: new Date(),
      expiresAt
    };

    this.globalFlags.set(flagId, flag);
  }

  getFlag(flagId: string): StoryFlag | null {
    const flag = this.globalFlags.get(flagId);
    if (!flag) return null;

    // Check expiration
    if (flag.expiresAt && Date.now() > flag.expiresAt) {
      this.globalFlags.delete(flagId);
      return null;
    }

    return flag;
  }

  hasFlag(flagId: string): boolean {
    return this.getFlag(flagId) !== null;
  }

  // Player Stats
  setStat(statId: string, value: number): void {
    this.playerStats.set(statId, value);
  }

  getStat(statId: string): number {
    return this.playerStats.get(statId) || 0;
  }

  // Private Helper Methods
  private checkConditions(conditions: StoryCondition[]): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'level':
          return this.checkNumericCondition(this.getStat('level'), condition);
        case 'quest':
          return this.checkFlagCondition(condition);
        case 'item':
          return this.checkFlagCondition(condition);
        case 'flag':
          return this.checkFlagCondition(condition);
        case 'stat':
          return this.checkNumericCondition(this.getStat(condition.target), condition);
        case 'location':
          return this.checkFlagCondition(condition);
        case 'time':
          return this.checkTimeCondition(condition);
        default:
          return false;
      }
    });
  }

  private checkNumericCondition(value: number, condition: StoryCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'greater':
        return value > condition.value;
      case 'less':
        return value < condition.value;
      default:
        return false;
    }
  }

  private checkFlagCondition(condition: StoryCondition): boolean {
    const flag = this.getFlag(condition.target);
    switch (condition.operator) {
      case 'exists':
        return flag !== null;
      case 'equals':
        return flag?.value === condition.value;
      case 'contains':
        return flag?.value?.includes?.(condition.value) || false;
      default:
        return false;
    }
  }

  private checkTimeCondition(condition: StoryCondition): boolean {
    const currentTime = Date.now();
    switch (condition.operator) {
      case 'greater':
        return currentTime > condition.value;
      case 'less':
        return currentTime < condition.value;
      default:
        return false;
    }
  }

  private applyRewards(rewards: StoryReward[], arc: StoryArc): StoryReward[] 
    const appliedRewards: StoryReward[] = [];

    for (const reward of rewards) {
      switch (reward.type) {
        case 'xp':
          const currentXP = this.getStat('xp');
          this.setStat('xp', currentXP + (reward.amount || 0));
          appliedRewards.push(reward);
          break;
        case 'item':
          this.setFlag(`item_${id: reward.id}`, true, 'boolean', `Acquired item: $id: reward.id}`);
          appliedRewards.push(reward);
          break;
        case 'currency':
          const currentCurrency = this.getStat('currency');
          this.setStat('currency', currentCurrency + (reward.amount || 0));
          appliedRewards.push(reward);
          break;
        case 'unlock':
          this.setFlag(`unlock_$id: reward.id}`, true, 'boolean', `Unlocked: $id: reward.id}`);
          appliedRewards.push(reward);
          break;
        case 'flag':
          this.setFlag(reward.id!, reward.amount || true, 'boolean', reward.description);
          appliedRewards.push(reward);
          break;
        case 'stat':
          const currentStat = this.getStat(reward.id!);
          this.setStat(reward.id!, currentStat + (reward.amount || 0));
          appliedRewards.push(reward);
          break;
        case 'cutscene':
          this.setFlag(`cutscene_$id: reward.id}`, true, 'boolean', `Cutscene unlocked: $id: reward.id}`);
          appliedRewards.push(reward);
          break;
      }
    }

    return appliedRewards;
  }

  private updateFlags(node: StoryNode, arc: StoryArc): StoryFlag[] 
    const newFlags: StoryFlag[] = [];

    // Update arc-specific flags
    for (const reward of node.rewards) {
      if (reward.type === 'flag') {
        const flag: StoryFlag = {
          id: reward.id!,
          name: reward.id!,
          value: reward.amount || true,
          type: 'boolean',
          description: description: reward.description,
          setAt: new Date()
        };
        arc.flags.set(flag.id, flag);
        newFlags.push(flag);
      }
    }

    return newFlags;
  }

  private getAvailableChoices(node: StoryNode, arc: StoryArc): string[] {
    // For choice nodes, return the choice IDs
    if (node.type === 'choice') {
      return node.nextNodes;
    }

    // For other nodes, return next nodes that can be accessed
    return node.nextNodes.filter(nextNodeId => {
      const nextNode = arc.nodes.get(nextNodeId);
      return nextNode && this.checkConditions(nextNode.conditions);
    });
  }

  private calculateProgress(arc: StoryArc): number {
    const totalNodes = arc.nodes.size;
    const completedNodes = Array.from(arc.progress.values()).filter((p: any) => p.completed).length;
    return Math.round((completedNodes / totalNodes) * 100);
  }

  private updateProgress(arc: StoryArc, nodeId: string, rewards: StoryReward[], flags: StoryFlag[]): void {
    const progress = arc.progress.get(nodeId) || {
      nodeId,
      completed: false,
      choices: [],
      rewards: [],
      flags: []
    };

    progress.completed = true;
    progress.completedAt = Date.now();
    progress.rewards.push(...rewards);
    progress.flags.push(...flags.map((f: any) => f.id));

    arc.progress.set(nodeId, progress);
  }

  private findReachableNodes(arc: StoryArc, startNodeId: string): Set<string> {
    const reachable = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (reachable.has(nodeId)) continue;

      reachable.add(nodeId);
      const node = arc.nodes.get(nodeId);
      if (node) {
        queue.push(...node.nextNodes);
      }
    }

    return reachable;
  }

  // Query Methods
  getArc(arcId: string): StoryArc | null {
    return this.arcs.get(arcId) || null;
  }

  getAllArcs(): StoryArc[] {
    return Array.from(this.arcs.values());
  }

  getArcProgress(arcId: string): number {
    const arc = this.arcs.get(arcId);
    if (!arc) return 0;
    return this.calculateProgress(arc);
  }

  // Statistics
  getStoryStatistics(): {
    totalArcs: number;
    totalNodes: number;
    totalFlags: number;
    averageProgress: number;
    completedArcs: number;
  } 
    const arcs = Array.from(this.arcs.values());
    const totalNodes = arcs.reduce((sum, arc) => sum + arc.size: nodes.size, 0);
    const totalFlags = this.globalFlags.size;
    const averageProgress = arcs.length > 0 
      ? arcs.reduce((sum, arc) => sum + this.calculateProgress(arc), 0) / arcs.length 
      : 0;
    const completedArcs = arcs.filter((arc: any) => this.calculateProgress(arc) === 100).length;

    return 
      totalArcs: length: arcs.length,
      totalNodes,
      totalFlags,
      averageProgress: Math.round(averageProgress * 100) / 100,
      completedArcs
    };
  }
}