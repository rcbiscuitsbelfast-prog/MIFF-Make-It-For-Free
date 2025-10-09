# 🎯 MIFF Quest Template

**Version:** 1.0  
**Last Updated:** 2025-01-08  
**Status:** Ready for Contributors

---

## 📋 **Quest Implementation Guide**

This template provides a standardized way to implement quests in MIFF games, ensuring consistency, testability, and maintainability.

### **How to Use This Template**
1. **Copy this template** to your quest implementation file
2. **Fill out all sections** according to your quest design
3. **Follow MIFF patterns** for managers, schemas, and CLI integration
4. **Include comprehensive tests** for all quest functionality
5. **Update quest registry** when adding new quests

---

## 🎯 **Quest Implementation**

### **Quest Definition**

```typescript
// Quest Schema Definition
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites: string[];
  location: QuestLocation;
  npcs: QuestNPC[];
  items: QuestItem[];
  metadata: QuestMetadata;
}

export enum QuestType {
  MAIN = 'main',
  SIDE = 'side',
  TUTORIAL = 'tutorial',
  COLLECTION = 'collection',
  EXPLORATION = 'exploration',
  COMBAT = 'combat',
  SOCIAL = 'social'
}

export enum QuestStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned'
}

export interface QuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: string;
  count: number;
  current: number;
  completed: boolean;
  optional: boolean;
}

export enum ObjectiveType {
  KILL = 'kill',
  COLLECT = 'collect',
  TALK = 'talk',
  REACH = 'reach',
  USE = 'use',
  CRAFT = 'craft',
  EXPLORE = 'explore'
}

export interface QuestReward {
  type: RewardType;
  itemId?: string;
  amount: number;
  description: string;
}

export enum RewardType {
  EXPERIENCE = 'experience',
  GOLD = 'gold',
  ITEM = 'item',
  SKILL = 'skill',
  UNLOCK = 'unlock'
}

export interface QuestLocation {
  sceneId: string;
  coordinates?: { x: number; y: number; z: number };
  area: string;
  description: string;
}

export interface QuestNPC {
  id: string;
  name: string;
  role: NPCRole;
  dialogue: string[];
  location: QuestLocation;
}

export enum NPCRole {
  QUEST_GIVER = 'quest_giver',
  QUEST_TARGET = 'quest_target',
  QUEST_HELPER = 'quest_helper',
  VENDOR = 'vendor',
  GUIDE = 'guide'
}

export interface QuestItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  required: boolean;
  count: number;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  QUEST_ITEM = 'quest_item',
  KEY = 'key',
  CURRENCY = 'currency'
}

export interface QuestMetadata {
  created: Date;
  updated: Date;
  version: string;
  author: string;
  tags: string[];
  difficulty: DifficultyLevel;
  estimatedDuration: number; // minutes
}

export enum DifficultyLevel {
  TRIVIAL = 'trivial',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}
```

### **Quest Manager Implementation**

```typescript
// QuestManager.ts
import { QuestDefinition, QuestStatus, QuestType } from './QuestSchema.js';

export class QuestManager {
  private quests: Map<string, QuestDefinition> = new Map();
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();
  private questHistory: QuestEvent[] = [];

  constructor() {
    this.initializeQuests();
  }

  /**
   * Initialize all quests from quest definitions
   */
  private initializeQuests(): void {
    // Load quest definitions from quest registry
    const questDefinitions = this.loadQuestDefinitions();
    
    for (const quest of questDefinitions) {
      this.quests.set(quest.id, quest);
    }
  }

  /**
   * Start a quest
   */
  startQuest(questId: string): QuestResult {
    const quest = this.quests.get(questId);
    if (!quest) {
      return { success: false, error: 'Quest not found' };
    }

    if (quest.status !== QuestStatus.AVAILABLE) {
      return { success: false, error: 'Quest not available' };
    }

    // Check prerequisites
    const prerequisitesMet = this.checkPrerequisites(quest);
    if (!prerequisitesMet) {
      return { success: false, error: 'Prerequisites not met' };
    }

    // Start quest
    quest.status = QuestStatus.ACTIVE;
    this.activeQuests.add(questId);
    
    // Log quest event
    this.logQuestEvent({
      questId,
      type: 'quest_started',
      timestamp: new Date(),
      data: { questName: quest.name }
    });

    return { success: true, quest };
  }

  /**
   * Complete a quest
   */
  completeQuest(questId: string): QuestResult {
    const quest = this.quests.get(questId);
    if (!quest) {
      return { success: false, error: 'Quest not found' };
    }

    if (quest.status !== QuestStatus.ACTIVE) {
      return { success: false, error: 'Quest not active' };
    }

    // Check if all objectives are completed
    const allObjectivesComplete = quest.objectives.every(obj => obj.completed);
    if (!allObjectivesComplete) {
      return { success: false, error: 'Not all objectives completed' };
    }

    // Complete quest
    quest.status = QuestStatus.COMPLETED;
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);

    // Give rewards
    const rewards = this.giveRewards(quest.rewards);

    // Log quest event
    this.logQuestEvent({
      questId,
      type: 'quest_completed',
      timestamp: new Date(),
      data: { questName: quest.name, rewards }
    });

    return { success: true, quest, rewards };
  }

  /**
   * Update quest objective progress
   */
  updateObjective(questId: string, objectiveId: string, progress: number): QuestResult {
    const quest = this.quests.get(questId);
    if (!quest) {
      return { success: false, error: 'Quest not found' };
    }

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      return { success: false, error: 'Objective not found' };
    }

    // Update progress
    objective.current = Math.min(objective.current + progress, objective.count);
    objective.completed = objective.current >= objective.count;

    // Log objective update
    this.logQuestEvent({
      questId,
      type: 'objective_updated',
      timestamp: new Date(),
      data: { objectiveId, progress, completed: objective.completed }
    });

    return { success: true, objective };
  }

  /**
   * Get available quests
   */
  getAvailableQuests(): QuestDefinition[] {
    return Array.from(this.quests.values())
      .filter(quest => quest.status === QuestStatus.AVAILABLE);
  }

  /**
   * Get active quests
   */
  getActiveQuests(): QuestDefinition[] {
    return Array.from(this.quests.values())
      .filter(quest => quest.status === QuestStatus.ACTIVE);
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): QuestDefinition | undefined {
    return this.quests.get(questId);
  }

  /**
   * Check if quest is completed
   */
  isQuestCompleted(questId: string): boolean {
    return this.completedQuests.has(questId);
  }

  /**
   * Get quest statistics
   */
  getQuestStats(): QuestStats {
    return {
      total: this.quests.size,
      available: this.getAvailableQuests().length,
      active: this.activeQuests.size,
      completed: this.completedQuests.size,
      byType: this.getQuestsByType(),
      byStatus: this.getQuestsByStatus()
    };
  }

  private checkPrerequisites(quest: QuestDefinition): boolean {
    return quest.prerequisites.every(prereqId => 
      this.completedQuests.has(prereqId)
    );
  }

  private giveRewards(rewards: QuestReward[]): QuestReward[] {
    // Implement reward giving logic
    return rewards;
  }

  private logQuestEvent(event: QuestEvent): void {
    this.questHistory.push(event);
    
    // Keep only last 1000 events
    if (this.questHistory.length > 1000) {
      this.questHistory = this.questHistory.slice(-1000);
    }
  }

  private loadQuestDefinitions(): QuestDefinition[] {
    // Load from quest registry or configuration
    return [];
  }

  private getQuestsByType(): Map<QuestType, number> {
    const counts = new Map<QuestType, number>();
    for (const quest of this.quests.values()) {
      counts.set(quest.type, (counts.get(quest.type) || 0) + 1);
    }
    return counts;
  }

  private getQuestsByStatus(): Map<QuestStatus, number> {
    const counts = new Map<QuestStatus, number>();
    for (const quest of this.quests.values()) {
      counts.set(quest.status, (counts.get(quest.status) || 0) + 1);
    }
    return counts;
  }
}

export interface QuestResult {
  success: boolean;
  quest?: QuestDefinition;
  objective?: QuestObjective;
  rewards?: QuestReward[];
  error?: string;
}

export interface QuestEvent {
  questId: string;
  type: 'quest_started' | 'quest_completed' | 'objective_updated' | 'quest_failed' | 'quest_abandoned';
  timestamp: Date;
  data: any;
}

export interface QuestStats {
  total: number;
  available: number;
  active: number;
  completed: number;
  byType: Map<QuestType, number>;
  byStatus: Map<QuestStatus, number>;
}
```

### **Quest CLI Harness**

```typescript
// questCLI.ts
import { QuestManager } from './QuestManager.js';
import { BaseCLIHarness } from '../shared/cliHarnessTemplate.js';

export class QuestCLI extends BaseCLIHarness {
  private questManager: QuestManager;

  constructor() {
    super();
    this.questManager = new QuestManager();
    this.moduleName = 'QuestSystem';
    this.supportedOperations = [
      'list',
      'start',
      'complete',
      'abandon',
      'status',
      'objectives',
      'rewards',
      'stats'
    ];
  }

  async executeOperation(operation: string, args: string[]): Promise<any> {
    switch (operation) {
      case 'list':
        return await this.listQuests(args);
      case 'start':
        return await this.startQuest(args);
      case 'complete':
        return await this.completeQuest(args);
      case 'abandon':
        return await this.abandonQuest(args);
      case 'status':
        return await this.getQuestStatus(args);
      case 'objectives':
        return await this.getObjectives(args);
      case 'rewards':
        return await this.getRewards(args);
      case 'stats':
        return await this.getStats(args);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async listQuests(args: string[]): Promise<any> {
    const type = args[0] as 'available' | 'active' | 'completed' | 'all';
    
    let quests;
    switch (type) {
      case 'available':
        quests = this.questManager.getAvailableQuests();
        break;
      case 'active':
        quests = this.questManager.getActiveQuests();
        break;
      case 'completed':
        quests = Array.from(this.questManager['completedQuests']);
        break;
      case 'all':
        quests = Array.from(this.questManager['quests'].values());
        break;
      default:
        quests = this.questManager.getAvailableQuests();
    }

    return {
      operation: 'list',
      status: 'ok',
      quests: quests.map(quest => ({
        id: quest.id,
        name: quest.name,
        type: quest.type,
        status: quest.status,
        description: quest.description
      }))
    };
  }

  private async startQuest(args: string[]): Promise<any> {
    const questId = args[0];
    if (!questId) {
      throw new Error('Quest ID required');
    }

    const result = this.questManager.startQuest(questId);
    return {
      operation: 'start',
      status: result.success ? 'ok' : 'error',
      quest: result.quest,
      error: result.error
    };
  }

  private async completeQuest(args: string[]): Promise<any> {
    const questId = args[0];
    if (!questId) {
      throw new Error('Quest ID required');
    }

    const result = this.questManager.completeQuest(questId);
    return {
      operation: 'complete',
      status: result.success ? 'ok' : 'error',
      quest: result.quest,
      rewards: result.rewards,
      error: result.error
    };
  }

  private async abandonQuest(args: string[]): Promise<any> {
    const questId = args[0];
    if (!questId) {
      throw new Error('Quest ID required');
    }

    // Implement quest abandonment logic
    return {
      operation: 'abandon',
      status: 'ok',
      message: `Quest ${questId} abandoned`
    };
  }

  private async getQuestStatus(args: string[]): Promise<any> {
    const questId = args[0];
    if (!questId) {
      throw new Error('Quest ID required');
    }

    const quest = this.questManager.getQuest(questId);
    if (!quest) {
      return {
        operation: 'status',
        status: 'error',
        error: 'Quest not found'
      };
    }

    return {
      operation: 'status',
      status: 'ok',
      quest: {
        id: quest.id,
        name: quest.name,
        status: quest.status,
        objectives: quest.objectives,
        rewards: quest.rewards
      }
    };
  }

  private async getObjectives(args: string[]): Promise<any> {
    const questId = args[0];
    if (!questId) {
      throw new Error('Quest ID required');
    }

    const quest = this.questManager.getQuest(questId);
    if (!quest) {
      return {
        operation: 'objectives',
        status: 'error',
        error: 'Quest not found'
      };
    }

    return {
      operation: 'objectives',
      status: 'ok',
      objectives: quest.objectives
    };
  }

  private async getRewards(args: string[]): Promise<any> {
    const questId = args[0];
    if (!questId) {
      throw new Error('Quest ID required');
    }

    const quest = this.questManager.getQuest(questId);
    if (!quest) {
      return {
        operation: 'rewards',
        status: 'error',
        error: 'Quest not found'
      };
    }

    return {
      operation: 'rewards',
      status: 'ok',
      rewards: quest.rewards
    };
  }

  private async getStats(args: string[]): Promise<any> {
    const stats = this.questManager.getQuestStats();
    return {
      operation: 'stats',
      status: 'ok',
      stats
    };
  }
}
```

### **Quest Test Suite**

```typescript
// QuestManager.test.ts
import { QuestManager } from './QuestManager.js';
import { QuestDefinition, QuestType, QuestStatus } from './QuestSchema.js';

describe('QuestManager', () => {
  let questManager: QuestManager;

  beforeEach(() => {
    questManager = new QuestManager();
  });

  describe('Quest Management', () => {
    it('should start a quest successfully', () => {
      const questId = 'test-quest-1';
      const result = questManager.startQuest(questId);
      
      expect(result.success).toBe(true);
      expect(result.quest).toBeDefined();
      expect(result.quest?.status).toBe(QuestStatus.ACTIVE);
    });

    it('should fail to start non-existent quest', () => {
      const result = questManager.startQuest('non-existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Quest not found');
    });

    it('should complete a quest with all objectives met', () => {
      const questId = 'test-quest-1';
      
      // Start quest
      questManager.startQuest(questId);
      
      // Complete all objectives
      const quest = questManager.getQuest(questId);
      quest?.objectives.forEach(obj => {
        questManager.updateObjective(questId, obj.id, obj.count);
      });
      
      // Complete quest
      const result = questManager.completeQuest(questId);
      
      expect(result.success).toBe(true);
      expect(result.quest?.status).toBe(QuestStatus.COMPLETED);
    });

    it('should fail to complete quest with incomplete objectives', () => {
      const questId = 'test-quest-1';
      
      // Start quest
      questManager.startQuest(questId);
      
      // Try to complete without finishing objectives
      const result = questManager.completeQuest(questId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not all objectives completed');
    });
  });

  describe('Quest Queries', () => {
    it('should return available quests', () => {
      const availableQuests = questManager.getAvailableQuests();
      
      expect(Array.isArray(availableQuests)).toBe(true);
      availableQuests.forEach(quest => {
        expect(quest.status).toBe(QuestStatus.AVAILABLE);
      });
    });

    it('should return active quests', () => {
      const questId = 'test-quest-1';
      questManager.startQuest(questId);
      
      const activeQuests = questManager.getActiveQuests();
      
      expect(activeQuests.length).toBeGreaterThan(0);
      expect(activeQuests.some(q => q.id === questId)).toBe(true);
    });

    it('should check quest completion status', () => {
      const questId = 'test-quest-1';
      
      expect(questManager.isQuestCompleted(questId)).toBe(false);
      
      // Complete quest
      questManager.startQuest(questId);
      const quest = questManager.getQuest(questId);
      quest?.objectives.forEach(obj => {
        questManager.updateObjective(questId, obj.id, obj.count);
      });
      questManager.completeQuest(questId);
      
      expect(questManager.isQuestCompleted(questId)).toBe(true);
    });
  });

  describe('Quest Statistics', () => {
    it('should return quest statistics', () => {
      const stats = questManager.getQuestStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('available');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('byStatus');
    });
  });
});
```

---

## 📚 **Implementation Checklist**

### **Quest Definition**
- [ ] Define quest schema with all required interfaces
- [ ] Create quest type and status enums
- [ ] Define objective and reward structures
- [ ] Include metadata and location information

### **Quest Manager**
- [ ] Implement quest lifecycle management
- [ ] Add objective progress tracking
- [ ] Implement prerequisite checking
- [ ] Add reward distribution system
- [ ] Include quest statistics and queries

### **CLI Integration**
- [ ] Extend BaseCLIHarness for quest operations
- [ ] Implement all required CLI commands
- [ ] Add proper error handling and validation
- [ ] Include help and usage information

### **Testing**
- [ ] Write comprehensive unit tests
- [ ] Test all quest operations
- [ ] Test error conditions and edge cases
- [ ] Include integration tests

### **Documentation**
- [ ] Document all public APIs
- [ ] Include usage examples
- [ ] Add troubleshooting guide
- [ ] Create contributor guidelines

---

## 🎯 **Best Practices**

### **Quest Design**
- **Clear Objectives:** Make quest objectives clear and achievable
- **Meaningful Rewards:** Ensure rewards are proportional to effort
- **Progressive Difficulty:** Start simple and increase complexity
- **Player Choice:** Provide multiple paths to completion when possible

### **Technical Implementation**
- **Idempotent Operations:** Quest operations should be safe to retry
- **State Persistence:** Save quest state regularly
- **Error Handling:** Handle all error conditions gracefully
- **Performance:** Optimize for large numbers of quests

### **Testing Strategy**
- **Unit Tests:** Test individual quest operations
- **Integration Tests:** Test quest interactions with other systems
- **Edge Cases:** Test boundary conditions and error states
- **Performance Tests:** Test with large numbers of quests

---

**🎮 Ready to implement quests in your MIFF game! Follow this template to ensure consistency and quality.**