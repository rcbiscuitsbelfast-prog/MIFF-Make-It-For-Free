export type QuestChain = {
  id: string;
  name: string;
  description: string;
  quests: string[];
  prerequisites: string[];
  rewards: QuestChainReward[];
  metadata: Record<string, any>;
};

export type QuestChainReward = {
  type: 'xp' | 'item' | 'currency' | 'unlock';
  id?: string;
  amount?: number;
  description: string;
};

export type ChainProgress = {
  chainId: string;
  completedQuests: string[];
  currentQuest?: string;
  progress: number; // 0-100
  status: 'locked' | 'available' | 'active' | 'completed';
  unlockedAt?: number;
  completedAt?: number;
};

export type ChainValidationResult = {
  op: 'validateChain';
  status: 'ok' | 'error';
  chainId: string;
  issues: string[];
  warnings: string[];
  isValid: boolean;
};

export type ChainExportResult = {
  op: 'exportChain';
  status: 'ok';
  format: string;
  data: any;
  exportedAt: string;
};

export class ChainManager {
  private chains = new Map<string, QuestChain>();
  private progress = new Map<string, ChainProgress>();
  private questDependencies = new Map<string, string[]>(); // questId -> chainIds

  // Chain Management
  createChain(chain: QuestChain): ChainValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Validate chain structure
    if (!chain.id || chain.id.trim() === '') {
      issues.push('Chain ID is required');
    }

    if (!chain.name || chain.name.trim() === '') {
      issues.push('Chain name is required');
    }

    if (!chain.quests || chain.quests.length === 0) {
      issues.push('Chain must have at least one quest');
    }

    // Validate quest dependencies
    for (const questId of chain.quests) {
      if (this.questDependencies.has(questId)) {
        const existingChains = this.questDependencies.get(questId)!;
        warnings.push(`Quest ${questId} is already part of chains: ${existingChains.join(', ')}`);
      }
    }

    // Check for circular dependencies
    if (this.hasCircularDependency(chain)) {
      issues.push('Circular dependency detected in chain prerequisites');
    }

    const isValid = issues.length === 0;

    if (isValid) {
      this.chains.set(chain.id, { ...chain });
      
      // Update quest dependencies
      for (const questId of chain.quests) {
        if (!this.questDependencies.has(questId)) {
          this.questDependencies.set(questId, []);
        }
        this.questDependencies.get(questId)!.push(chain.id);
      }

      // Initialize progress
      this.progress.set(chain.id, {
        chainId: chain.id,
        completedQuests: [],
        progress: 0,
        status: chain.prerequisites.length === 0 ? 'available' : 'locked'
      });
    }

    return {
      op: 'validateChain',
      status: isValid ? 'ok' : 'error',
      chainId: chain.id,
      issues,
      warnings,
      isValid
    };
  }

  // Progress Management
  updateProgress(chainId: string, questId: string, completed: boolean): ChainProgress | null {
    const chain = this.chains.get(chainId);
    const progress = this.progress.get(chainId);
    
    if (!chain || !progress) {
      return null;
    }

    if (completed && !progress.completedQuests.includes(questId)) {
      progress.completedQuests.push(questId);
    } else if (!completed && progress.completedQuests.includes(questId)) {
      progress.completedQuests = progress.completedQuests.filter(id => id !== questId);
    }

    // Update progress percentage
    progress.progress = Math.round((progress.completedQuests.length / chain.quests.length) * 100);

    // Update status
    if (progress.progress === 100) {
      progress.status = 'completed';
      progress.completedAt = Date.now();
    } else if (progress.status === 'locked' && this.arePrerequisitesMet(chain)) {
      progress.status = 'available';
      progress.unlockedAt = Date.now();
    } else if (progress.status === 'available' && progress.completedQuests.length > 0) {
      progress.status = 'active';
    }

    // Set current quest
    const remainingQuests = chain.quests.filter(q => !progress.completedQuests.includes(q));
    progress.currentQuest = remainingQuests[0];

    return { ...progress };
  }

  // Chain Queries
  getChain(chainId: string): QuestChain | null {
    return this.chains.get(chainId) || null;
  }

  getProgress(chainId: string): ChainProgress | null {
    return this.progress.get(chainId) || null;
  }

  getAllChains(): QuestChain[] {
    return Array.from(this.chains.values());
  }

  getAvailableChains(): QuestChain[] {
    return this.getAllChains().filter(chain => {
      const progress = this.progress.get(chain.id);
      return progress?.status === 'available' || progress?.status === 'active';
    });
  }

  getChainsByQuest(questId: string): QuestChain[] {
    const chainIds = this.questDependencies.get(questId) || [];
    return chainIds.map(id => this.chains.get(id)).filter(Boolean) as QuestChain[];
  }

  // Validation and Export
  validateAllChains(): ChainValidationResult[] {
    const results: ChainValidationResult[] = [];
    
    for (const chain of this.chains.values()) {
      const result = this.createChain(chain); // Re-validate
      results.push(result);
    }

    return results;
  }

  exportChain(chainId: string, format: 'json' | 'yaml' | 'csv' = 'json'): ChainExportResult {
    const chain = this.chains.get(chainId);
    const progress = this.progress.get(chainId);

    if (!chain) {
      throw new Error(`Chain not found: ${chainId}`);
    }

    const exportData = {
      chain,
      progress,
      exportedAt: Date.now().toISOString(),
      version: '1.0.0'
    };

    let data: any;
    switch (format) {
      case 'json':
        data = exportData;
        break;
      case 'yaml':
        data = this.convertToYAML(exportData);
        break;
      case 'csv':
        data = this.convertToCSV(chain, progress);
        break;
      default:
        data = exportData;
    }

    return {
      op: 'exportChain',
      status: 'ok',
      format,
      data,
      exportedAt: Date.now().toISOString()
    };
  }

  // Private Helper Methods
  private hasCircularDependency(chain: QuestChain): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (chainId: string): boolean => {
      if (recursionStack.has(chainId)) return true;
      if (visited.has(chainId)) return false;

      visited.add(chainId);
      recursionStack.add(chainId);

      const chain = this.chains.get(chainId);
      if (chain) {
        for (const prereq of chain.prerequisites) {
          if (hasCycle(prereq)) return true;
        }
      }

      recursionStack.delete(chainId);
      return false;
    };

    return hasCycle(chain.id);
  }

  private arePrerequisitesMet(chain: QuestChain): boolean {
    return chain.prerequisites.every(prereqId => {
      const prereqProgress = this.progress.get(prereqId);
      return prereqProgress?.status === 'completed';
    });
  }

  private convertToYAML(data: any): string {
    // Simple YAML conversion - in production, use a proper YAML library
    return `chain:
  id: ${data.chain.id}
  name: ${data.chain.name}
  description: ${data.chain.description}
  quests: [${data.chain.quests.join(', ')}]
  prerequisites: [${data.chain.prerequisites.join(', ')}]
progress:
  chainId: ${data.progress.chainId}
  completedQuests: [${data.progress.completedQuests.join(', ')}]
  progress: ${data.progress.progress}
  status: ${data.progress.status}
exportedAt: ${data.exportedAt}`;
  }

  private convertToCSV(chain: QuestChain, progress: ChainProgress | undefined): string {
    let csv = 'Quest ID,Quest Name,Status,Completed\n';
    
    for (const questId of chain.quests) {
      const isCompleted = progress?.completedQuests.includes(questId) || false;
      csv += `${questId},${questId.replace(/_/g, ' ').toUpperCase()},${isCompleted ? 'Completed' : 'Pending'},${isCompleted}\n`;
    }

    return csv;
  }

  // Statistics
  getChainStatistics(): {
    totalChains: number;
    completedChains: number;
    activeChains: number;
    lockedChains: number;
    averageProgress: number;
  } {
    const chains = Array.from(this.progress.values());
    const totalChains = chains.length;
    const completedChains = chains.filter(p => p.status === 'completed').length;
    const activeChains = chains.filter(p => p.status === 'active').length;
    const lockedChains = chains.filter(p => p.status === 'locked').length;
    const averageProgress = chains.length > 0 
      ? chains.reduce((sum, p) => sum + p.progress, 0) / chains.length 
      : 0;

    return {
      totalChains,
      completedChains,
      activeChains,
      lockedChains,
      averageProgress: Math.round(averageProgress * 100) / 100
    };
  }
}