/**
 * Real Quest System Implementation
 * 
 * Replaces mock quest system with actual quest management functionality
 * for better test fidelity and real-world behavior validation.
 */

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites: string[];
  level: number;
  category: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'reach' | 'talk' | 'custom';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'experience' | 'item' | 'currency' | 'unlock';
  value: string | number;
  amount: number;
}

export class RealQuestSystem {
  private quests: Map<string, Quest> = new Map();
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();
  private eventBus: any;

  constructor(eventBus: any) {
    this.eventBus = eventBus;
    this.initializeDefaultQuests();
  }

  /**
   * Initialize default quests
   */
  private initializeDefaultQuests(): void {
    this.addQuest({
      id: 'tutorial-1',
      title: 'First Steps',
      description: 'Complete your first objective',
      status: 'available',
      objectives: [
        {
          id: 'obj-1',
          description: 'Walk 10 steps',
          type: 'custom',
          target: 'walk',
          current: 0,
          required: 10,
          completed: false
        }
      ],
      rewards: [
        { type: 'experience', value: 'xp', amount: 100 }
      ],
      prerequisites: [],
      level: 1,
      category: 'tutorial'
    });
  }

  /**
   * Add a quest
   */
  addQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
    this.eventBus?.emit('quest-added', { questId: quest.id });
  }

  /**
   * Start a quest
   */
  startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'available') {
      return false;
    }

    // Check prerequisites
    for (const prereq of quest.prerequisites) {
      if (!this.completedQuests.has(prereq)) {
        return false;
      }
    }

    quest.status = 'active';
    this.activeQuests.add(questId);
    this.eventBus?.emit('quest-started', { questId });
    return true;
  }

  /**
   * Complete a quest
   */
  completeQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') {
      return false;
    }

    // Check if all objectives are completed
    const allCompleted = quest.objectives.every(obj => obj.completed);
    if (!allCompleted) {
      return false;
    }

    quest.status = 'completed';
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);
    
    // Give rewards
    this.giveRewards(quest.rewards);
    
    this.eventBus?.emit('quest-completed', { questId, rewards: quest.rewards });
    return true;
  }

  /**
   * Update quest objective
   */
  updateObjective(questId: string, objectiveId: string, progress: number = 1): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') {
      return false;
    }

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      return false;
    }

    objective.current = Math.min(objective.current + progress, objective.required);
    objective.completed = objective.current >= objective.required;
    
    this.eventBus?.emit('quest-objective-updated', { questId, objectiveId, progress });
    
    // Check if quest is ready to complete
    if (quest.objectives.every(obj => obj.completed)) {
      this.completeQuest(questId);
    }
    
    return true;
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): Quest | null {
    return this.quests.get(questId) || null;
  }

  /**
   * Get all quests
   */
  getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  /**
   * Get active quests
   */
  getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests).map(id => this.quests.get(id)!);
  }

  /**
   * Get completed quests
   */
  getCompletedQuests(): Quest[] {
    return Array.from(this.completedQuests).map(id => this.quests.get(id)!);
  }

  /**
   * Give quest rewards
   */
  private giveRewards(rewards: QuestReward[]): void {
    for (const reward of rewards) {
      this.eventBus?.emit('quest-reward-given', { reward });
    }
  }
}

// Export as mock for compatibility
export const realQuestSystem = RealQuestSystem;
export default RealQuestSystem;