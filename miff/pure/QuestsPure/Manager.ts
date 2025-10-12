/**
 * QuestsPure Manager
 * 
 * Comprehensive quest management system including quest creation, progression tracking,
 * step validation, reward distribution, and quest chain management.
 */

export interface QuestStep {
  id: string;
  type: 'kill' | 'collect' | 'deliver' | 'talk' | 'explore' | 'craft' | 'custom';
  description: string;
  target?: string; // Target ID (enemy, item, NPC, location)
  quantity?: number; // Required quantity
  completed: boolean;
  metadata?: Record<string, any>;
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'skill' | 'reputation';
  id?: string; // Item ID or skill ID
  amount: number;
  metadata?: Record<string, any>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'active' | 'completed' | 'failed' | 'abandoned';
  steps: QuestStep[];
  rewards: QuestReward[];
  prerequisites?: string[]; // Quest IDs that must be completed first
  level?: number; // Recommended level
  category?: string; // Quest category (main, side, daily, etc.)
  giver?: string; // NPC ID who gives the quest
  timeLimit?: number; // Time limit in seconds (optional)
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  metadata?: Record<string, any>;
}

export interface QuestProgress {
  questId: string;
  currentStep: number;
  completedSteps: number;
  totalSteps: number;
  progress: number; // 0-100
  timeSpent: number; // Time in seconds
}

export interface QuestStats {
  totalQuests: number;
  availableQuests: number;
  activeQuests: number;
  completedQuests: number;
  failedQuests: number;
  questsByCategory: Record<string, number>;
  averageCompletionTime: number;
  totalExperienceRewarded: number;
  totalGoldRewarded: number;
}

export interface QuestFilter {
  status?: string;
  category?: string;
  giver?: string;
  level?: number;
  hasPrerequisites?: boolean;
}

export interface QuestOutput {
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: string[];
  [key: string]: unknown;
}

export class QuestsManager {
  private quests: Map<string, Quest> = new Map();
  private activeQuests: Set<string> = new Set();
  private questProgress: Map<string, QuestProgress> = new Map();

  constructor() {
    this.initializeDefaultQuests();
  }

  private initializeDefaultQuests() {
    const defaultQuests: Quest[] = [
      {
        id: 'tutorial_quest',
        title: 'First Steps',
        description: 'Learn the basics of the game',
        status: 'available',
        steps: [
          {
            id: 'talk_to_elder',
            type: 'talk',
            description: 'Talk to Elder Oak',
            target: 'npc_001',
            completed: false;
    },
          {
            id: 'collect_herbs',
            type: 'collect',
            description: 'Collect 5 healing herbs',
            target: 'healing_herb',
            quantity: 5,
            completed: false;
    }
        ],
        rewards: [
          { type: 'experience', amount: 100;
    },
          { type: 'gold', amount: 50;
    },
          { type: 'item', id: 'health_potion', amount: 3;
    }
        ],
        level: 1,
        category: 'tutorial',
        giver: 'npc_001',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'main_quest_1',
        title: 'The Ancient Artifact',
        description: 'Find the lost artifact in the dungeon',
        status: 'available',
        steps: [
          {
            id: 'enter_dungeon',
            type: 'explore',
            description: 'Enter the ancient dungeon',
            target: 'dungeon_entrance',
            completed: false;
    },
          {
            id: 'defeat_guardian',
            type: 'kill',
            description: 'Defeat the dungeon guardian',
            target: 'dungeon_guardian',
            completed: false;
    },
          {
            id: 'retrieve_artifact',
            type: 'collect',
            description: 'Retrieve the ancient artifact',
            target: 'ancient_artifact',
            quantity: 1,
            completed: false;
    }
        ],
        rewards: [
          { type: 'experience', amount: 500;
    },
          { type: 'gold', amount: 200;
    },
          { type: 'item', id: 'ancient_sword', amount: 1;
    }
        ],
        prerequisites: ['tutorial_quest'],
        level: 5,
        category: 'main',
        giver: 'npc_001',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    defaultQuests.forEach(quest => this.quests.set(quest.id, quest));
  }

  /**
   * Create a new quest
   */
  createQuest(quest: Quest): QuestOutput {
    if (this.quests.has(quest.id)) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Quest ${quest.id} already exists`]
      };
    }

    const newQuest: Quest = {
      ...quest,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.quests.set(quest.id, newQuest);
    return {
      op: 'create',
      status: 'ok',
      result: newQuest;
    };
  }

  /**
   * Update quest
   */
  updateQuest(questId: string, updates: Partial<Quest>): QuestOutput {
    const quest = this.quests.get(questId);
    if (!quest) {
      return {
        op: 'update',
        status: 'error',
        issues: [`Quest ${questId} not found`]
      };
    }

    const updatedQuest = {
      ...quest,
      ...updates,
      updatedAt: Date.now()
    };

    this.quests.set(questId, updatedQuest);
    return {
      op: 'update',
      status: 'ok',
      result: updatedQuest;
    };
  }

  /**
   * Delete quest
   */
  deleteQuest(questId: string): QuestOutput {
    if (!this.quests.has(questId)) {
      return {
        op: 'delete',
        status: 'error',
        issues: [`Quest ${questId} not found`]
      };
    }

    this.quests.delete(questId);
    this.activeQuests.delete(questId);
    this.questProgress.delete(questId);
    return {
      op: 'delete',
      status: 'ok'
    };
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): QuestOutput {
    const quest = this.quests.get(questId);
    if (!quest) {
      return {
        op: 'get',
        status: 'error',
        issues: [`Quest ${questId} not found`]
      };
    }

    return {
      op: 'get',
      status: 'ok',
      result: quest;
    };
  }

  /**
   * List quests with optional filtering
   */
  listQuests(filter?: QuestFilter): QuestOutput {
    let quests = Array.from(this.quests.values());

    if (filter) {
      quests = quests.filter(quest => {
        if (filter.status && quest.status !== filter.status) return false;
        if (filter.category && quest.category !== filter.category) return false;
        if (filter.giver && quest.giver !== filter.giver) return false;
        if (filter.level && quest.level && quest.level > filter.level) return false;
        if (filter.hasPrerequisites !== undefined) {
          const hasPrereqs = quest.prerequisites && quest.prerequisites.length > 0;
          if (filter.hasPrerequisites !== hasPrereqs) return false;
        }
        return true;
      });
    }

    return {
      op: 'list',
      status: 'ok',
      result: quests;
    };
  }

  /**
   * Start a quest
   */
  startQuest(questId: string): QuestOutput {
    const quest = this.quests.get(questId);
    if (!quest) {
      return {
        op: 'start',
        status: 'error',
        issues: [`Quest ${questId} not found`]
      };
    }

    if (quest.status !== 'available') {
      return {
        op: 'start',
        status: 'error',
        issues: [`Quest ${questId} is not available (status: ${quest.status})`]
      };
    }

    // Check prerequisites
    if (quest.prerequisites) {
      for (const prereqId of quest.prerequisites) {
        const prereq = this.quests.get(prereqId);
        if (!prereq || prereq.status !== 'completed') {
          return {
            op: 'start',
            status: 'error',
            issues: [`Prerequisite quest ${prereqId} not completed`]
          };
        }
      }
    }

    // Update quest status
    quest.status = 'active';
    quest.updatedAt = Date.now();
    this.quests.set(questId, quest);
    this.activeQuests.add(questId);

    // Initialize progress
    const progress: QuestProgress = {
      questId,
      currentStep: 0,
      completedSteps: 0,
      totalSteps: quest.steps.length,
      progress: 0,
      timeSpent: 0;
    };
    this.questProgress.set(questId, progress);

    return {
      op: 'start',
      status: 'ok',
      result: quest;
    };
  }

  /**
   * Complete a quest
   */
  completeQuest(questId: string): QuestOutput {
    const quest = this.quests.get(questId);
    if (!quest) {
      return {
        op: 'complete',
        status: 'error',
        issues: [`Quest ${questId} not found`]
      };
    }

    if (quest.status !== 'active') {
      return {
        op: 'complete',
        status: 'error',
        issues: [`Quest ${questId} is not active (status: ${quest.status})`]
      };
    }

    // Check if all steps are completed
    const allStepsCompleted = quest.steps.every(step => step.completed);
    if (!allStepsCompleted) {
      return {
        op: 'complete',
        status: 'error',
        issues: [`Not all quest steps are completed`]
      };
    }

    // Update quest status
    quest.status = 'completed';
    quest.completedAt = Date.now();
    quest.updatedAt = Date.now();
    this.quests.set(questId, quest);
    this.activeQuests.delete(questId);

    // Update progress
    const progress = this.questProgress.get(questId);
    if (progress) {
      progress.progress = 100;
      this.questProgress.set(questId, progress);
    }

    return {
      op: 'complete',
      status: 'ok',
      result: quest;
    };
  }

  /**
   * Update quest progress
   */
  updateQuestProgress(questId: string, stepId: string, completed: boolean): QuestOutput {
    const quest = this.quests.get(questId);
    if (!quest) {
      return {
        op: 'progress',
        status: 'error',
        issues: [`Quest ${questId} not found`]
      };
    }

    const step = quest.steps.find(s => s.id === stepId);
    if (!step) {
      return {
        op: 'progress',
        status: 'error',
        issues: [`Quest step ${stepId} not found`]
      };
    }

    step.completed = completed;
    quest.updatedAt = Date.now();
    this.quests.set(questId, quest);

    // Update progress tracking
    const progress = this.questProgress.get(questId);
    if (progress) {
      const completedSteps = quest.steps.filter(s => s.completed).length;
      progress.completedSteps = completedSteps;
      progress.progress = (completedSteps / quest.steps.length) * 100;
      this.questProgress.set(questId, progress);
    }

    return {
      op: 'progress',
      status: 'ok',
      result: progress;
    };
  }

  /**
   * Get quest statistics
   */
  getQuestStats(): QuestOutput {
    const quests = Array.from(this.quests.values());
    const stats: QuestStats = {
      totalQuests: quests.length,
      availableQuests: quests.filter(q => q.status === 'available').length,
      activeQuests: quests.filter(q => q.status === 'active').length,
      completedQuests: quests.filter(q => q.status === 'completed').length,
      failedQuests: quests.filter(q => q.status === 'failed').length,
      questsByCategory: {},
      averageCompletionTime: 0,
      totalExperienceRewarded: 0,
      totalGoldRewarded: 0;
    };

    // Calculate category distribution
    quests.forEach(quest => {
      if (quest.category) {
        stats.questsByCategory[quest.category] = (stats.questsByCategory[quest.category] || 0) + 1;
      }
    });

    // Calculate rewards
    quests.forEach(quest => {
      quest.rewards.forEach(reward => {
        if (reward.type === 'experience') {
          stats.totalExperienceRewarded += reward.amount;
        } else if (reward.type === 'gold') {
          stats.totalGoldRewarded += reward.amount;
        }
      });
    });

    return {
      op: 'stats',
      status: 'ok',
      result: stats as any
    };
  }

  /**
   * Export quests in various formats
   */
  exportQuests(format: 'json' | 'manifest' | 'summary' | 'active' = 'json'): QuestOutput {
    const quests = Array.from(this.quests.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: {

            quests, total: quests.length 

          


          }
          };
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {

            schema: 'miff.quests.export.v1',
            quests,
            progress: Array.from(this.questProgress.values()),
            exportedAt: new Date().toISOString(),
            total: quests.length
          

          


          }
          };
        };
      
      case 'summary':
        const stats = this.getQuestStats();
        return {
          op: 'export',
          status: 'ok',
          result: JSON.stringify({
            summary: stats.result,
            quests: quests.map(quest => ({
              id: quest.id,
              title: quest.title,
              status: quest.status,
              category: quest.category,
              level: quest.level,
              progress: this.questProgress.get(quest.id)?.progress || 0
            }))
          })
        };
      
      case 'active':
        const activeQuests = quests.filter(q => q.status === 'active');
        return {
          op: 'export',
          status: 'ok',
          result: JSON.stringify({
            activeQuests: activeQuests.map(quest => ({
              quest,
              progress: this.questProgress.get(quest.id)
            })),
            total: activeQuests.length
          })
        };
      
      default:
        return {
          op: 'export',
          status: 'error',
          issues: [`Unknown export format: ${format}`]
        };
    }
  }

  /**
   * Reset all quests
   */
  resetQuests(): QuestOutput {
    this.quests.clear();
    this.activeQuests.clear();
    this.questProgress.clear();
    this.initializeDefaultQuests();
    return {
      op: 'reset',
      status: 'ok',
      result: {

        message: 'All quests reset to default state' 

      


      }
      };
    };
  }
}