import { EntityID, StatBlock  } from '../shared/ConsolidatedSchema';

export interface NPC {
  id: EntityID;
  name: string;
  stats: StatBlock;
  behavior: NPBehavior;
  location: NPCLocation;
  questIds: EntityID[];
  movementPattern: MovementPattern;
  dialogueTree?: DialogueNode;
  inventory?: EntityID[];
  faction?: string;
  reputation?: number;
}

export interface NPBehavior {
  type: 'passive' | 'aggressive' | 'friendly' | 'merchant' | 'quest_giver';
  aggression: number; // 0-100
  curiosity: number; // 0-100
  loyalty: number; // 0-100
  schedule?: DailySchedule;
}

export interface NPCLocation {
  zoneId: EntityID;
  x: number;
  y: number;
  z?: number;
  waypoints?: Array<{x: number, y: number, z?: number}>;
}

export interface MovementPattern {
  type: 'idle' | 'patrol' | 'follow' | 'wander';
  speed: number;
  range?: number;
  targetId?: EntityID; // for follow pattern
}

export interface DailySchedule {
  activities: Array<{
    time: string; // "HH:MM"
    activity: string;
    location?: NPCLocation;
  }>;
}

export interface DialogueNode {
  id: string;
  text: string;
  options?: Array<{
    text: string;
    nextNodeId: string;
    condition?: DialogueCondition;
    action?: DialogueAction;
  }>;
}

export interface DialogueCondition {
  type: 'quest_complete' | 'reputation' | 'item_owned' | 'stat_check';
  target: string;
  value: any;
}

export interface DialogueAction {
  type: 'give_quest' | 'give_item' | 'change_reputation' | 'teleport';
  target: string;
  value: any;
}

export interface NPCOperation {
  op: 'create' | 'update' | 'delete' | 'get' | 'list' | 'simulate';
  npcId?: EntityID;
  npc?: NPC;
  filter?: NPCFilter;
  simulation?: NPCSimulation;
}

export interface NPCFilter {
  zoneId?: EntityID;
  behaviorType?: string;
  faction?: string;
  hasQuest?: boolean;
}

export interface NPCSimulation {
  duration: number; // seconds
  events: string[];
  interactions: NPCInteraction[];
}

export interface NPCInteraction {
  type: 'dialogue' | 'combat' | 'trade' | 'quest';
  targetId: EntityID;
  result: 'success' | 'failure' | 'neutral';
  timestamp: number;
}

export interface NPCOutput {
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: string[];
  [key: string]: unknown;
}

export class NPCsManager {
  private npcs: Map<EntityID, NPC> = new Map();

  constructor() {
    this.loadDefaultNPCs();
  }

  private loadDefaultNPCs(): void {
    // Add some default NPCs for testing
    const defaultNPCs: NPC[] = [
      {
        id: 'npc_001' as EntityID,
        name: 'Elder Oak',
        stats: [
          { key: 'health', base: 100;
    },
          { key: 'mana', base: 50;
    },
          { key: 'strength', base: 15;
    },
          { key: 'wisdom', base: 20;
    }
        ],
        behavior: {

          type: 'quest_giver',
          aggression: 0,
          curiosity: 80,
          loyalty: 90,
          schedule: {
            activities: [
              { time: '06:00', activity: 'meditation', location: { zoneId: 'zone_village' as EntityID, x: 10, y: 15;

        }
    } },
              { time: '12:00', activity: 'counseling', location: {
   zoneId: 'zone_village' as EntityID, x: 10, y: 15;
 }
    } },
              { time: '18:00', activity: 'evening_walk', location: {
   zoneId: 'zone_forest' as EntityID, x: 5, y: 8;
 }
    } }
            ]
          }
        },
        location: {

          zoneId: 'zone_village' as EntityID, x: 10, y: 15;

        }
    },
        questIds: ['quest_tutorial' as EntityID],
        movementPattern: {

          type: 'idle', speed: 1;

        }
    },
        faction: 'village_elders',
        reputation: 100;
    },
      {
        id: 'npc_002' as EntityID,
        name: 'Merchant Sarah',
        stats: [
          { key: 'health', base: 80;
    },
          { key: 'mana', base: 30;
    },
          { key: 'strength', base: 8;
    },
          { key: 'wisdom', base: 15;
    }
        ],
        behavior: {
        type: 'merchant',
        aggression: 10,
        curiosity: 60,
        loyalty: 70;

        
      
      }
    },
        location: {

          zoneId: 'zone_market' as EntityID, x: 25, y: 12;

        }
    },
        questIds: [],
        movementPattern: {

          type: 'patrol', speed: 2, range: 5;

        }
    },
        faction: 'merchants',
        reputation: 75;
    }
    ];

    defaultNPCs.forEach(npc => this.npcs.set(npc.id, npc));
  }

  createNPC(npc: NPC): NPCOutput {
    if (this.npcs.has(npc.id)) {
      return {
        op: 'create',
        status: 'error',
        issues: [`NPC with ID ${npc.id} already exists`]
      };
    }
    // Validate minimal fields
    if (!npc.name) {
      return { op: 'create', status: 'error', issues: ['name missing'] };
    }
    if (!npc.stats || (Array.isArray(npc.stats) && npc.stats.length === 0)) {
      return { op: 'create', status: 'error', issues: ['stats missing'] };
    }
    if (!npc.location || !npc.location.zoneId) {
      return { op: 'create', status: 'error', issues: ['location missing'] };
    }
    if (!npc.behavior) {
      npc.behavior = { type: 'passive', aggression: 0, curiosity: 50, loyalty: 50;
    } as any;
    }
    if (!npc.movementPattern) {
      npc.movementPattern = { type: 'idle', speed: 1;
    };
    }
    if (!npc.questIds) npc.questIds = [];

    this.npcs.set(npc.id, npc);
    return {
      op: 'create',
      status: 'ok',
      result: npc;
    };
  }

  updateNPC(npcId: EntityID, updates: Partial<NPC>): NPCOutput {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        op: 'update',
        status: 'error',
        issues: [`NPC with ID ${npcId} not found`]
      };
    }

    const updatedNPC = { ...npc, ...updates };
    this.npcs.set(npcId, updatedNPC);
    return {
      op: 'update',
      status: 'ok',
      result: updatedNPC;
    };
  }

  deleteNPC(npcId: EntityID): NPCOutput {
    if (!this.npcs.has(npcId)) {
      // idempotent delete returns ok
      return {
        op: 'delete',
        status: 'ok'
      };
    }

    this.npcs.delete(npcId);
    return {
      op: 'delete',
      status: 'ok'
    };
  }

  getNPC(npcId: EntityID): NPCOutput {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        op: 'get',
        status: 'error',
        issues: [`NPC with ID ${npcId} not found`]
      };
    }

    return {
      op: 'get',
      status: 'ok',
      result: npc;
    };
  }

  listNPCs(filter?: NPCFilter): NPCOutput {
    let npcs = Array.from(this.npcs.values());

    if (filter) {
      npcs = npcs.filter(npc => {
        if (filter.zoneId && npc.location.zoneId !== filter.zoneId) return false;
        if (filter.behaviorType && npc.behavior.type !== filter.behaviorType) return false;
        if (filter.faction && npc.faction !== filter.faction) return false;
        if (filter.hasQuest !== undefined) {
          const hasQuest = npc.questIds.length > 0;
          if (filter.hasQuest !== hasQuest) return false;
        }
        return true;
      });
    }

    return {
      op: 'list',
      status: 'ok',
      result: npcs;
    };
  }

  simulateNPC(npcId: EntityID, duration: number): NPCOutput {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        op: 'simulate',
        status: 'error',
        issues: [`NPC with ID ${npcId} not found`]
      };
    }

    const simulation: NPCSimulation = {
      duration,
      events: [],
      interactions: []
    };

    // Simulate NPC behavior based on their type and schedule
    const currentHour = Math.floor((Date.now() % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (npc.behavior.schedule) {
      const currentActivity = npc.behavior.schedule.activities.find(
        activity => parseInt(activity.time.split(':')[0]) === currentHour
      );
      
      if (currentActivity) {
        simulation.events.push(`${npc.name} is ${currentActivity.activity}`);
      }
    }

    // Simulate interactions based on behavior type
    switch (npc.behavior.type) {
      case 'quest_giver':
        simulation.events.push(`${npc.name} is available for quests`);
        break;
      case 'merchant':
        simulation.events.push(`${npc.name} is open for business`);
        break;
      case 'aggressive':
        simulation.events.push(`${npc.name} is patrolling aggressively`);
        break;
      default:
        simulation.events.push(`${npc.name} is going about their day`);
    }

    // Simulate movement based on pattern
    switch (npc.movementPattern.type) {
      case 'patrol':
        simulation.events.push(`${npc.name} is patrolling their area`);
        break;
      case 'wander':
        simulation.events.push(`${npc.name} is wandering around`);
        break;
      case 'follow':
        simulation.events.push(`${npc.name} is following their target`);
        break;
      default:
        simulation.events.push(`${npc.name} is staying in place`);
    }

    return {
      op: 'simulate',
      status: 'ok',
      result: simulation;
    };
  }

  /**
   * Update NPC location
   */
  updateNPCLocation(npcId: EntityID, x: number, y: number, z?: number): NPCOutput {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        op: 'update_location',
        status: 'error',
        issues: [`NPC with ID ${npcId} not found`]
      };
    }

    npc.location.x = x;
    npc.location.y = y;
    if (z !== undefined) npc.location.z = z;

    this.npcs.set(npcId, npc);
    return {
      op: 'update_location',
      status: 'ok',
      result: npc;
    };
  }

  /**
   * Add quest to NPC
   */
  addQuestToNPC(npcId: EntityID, questId: EntityID): NPCOutput {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        op: 'add_quest',
        status: 'error',
        issues: [`NPC with ID ${npcId} not found`]
      };
    }

    if (npc.questIds.includes(questId)) {
      return {
        op: 'add_quest',
        status: 'error',
        issues: [`NPC ${npcId} already has quest ${questId}`]
      };
    }

    npc.questIds.push(questId);
    this.npcs.set(npcId, npc);
    return {
      op: 'add_quest',
      status: 'ok',
      result: npc;
    };
  }

  /**
   * Remove quest from NPC
   */
  removeQuestFromNPC(npcId: EntityID, questId: EntityID): NPCOutput {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        op: 'remove_quest',
        status: 'error',
        issues: [`NPC with ID ${npcId} not found`]
      };
    }

    const index = npc.questIds.indexOf(questId);
    if (index === -1) {
      return {
        op: 'remove_quest',
        status: 'error',
        issues: [`NPC ${npcId} does not have quest ${questId}`]
      };
    }

    npc.questIds.splice(index, 1);
    this.npcs.set(npcId, npc);
    return {
      op: 'remove_quest',
      status: 'ok',
      result: npc;
    };
  }

  /**
   * Update NPC behavior
   */
  updateNPCBehavior(npcId: EntityID, behavior: Partial<NPBehavior>): NPCOutput {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        op: 'update_behavior',
        status: 'error',
        issues: [`NPC with ID ${npcId} not found`]
      };
    }

    npc.behavior = { ...npc.behavior, ...behavior };
    this.npcs.set(npcId, npc);
    return {
      op: 'update_behavior',
      status: 'ok',
      result: npc;
    };
  }

  /**
   * Update NPC reputation
   */
  updateNPCReputation(npcId: EntityID, reputation: number): NPCOutput {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        op: 'update_reputation',
        status: 'error',
        issues: [`NPC with ID ${npcId} not found`]
      };
    }

    npc.reputation = Math.max(0, Math.min(100, reputation));
    this.npcs.set(npcId, npc);
    return {
      op: 'update_reputation',
      status: 'ok',
      result: npc;
    };
  }

  /**
   * Get NPCs by behavior type
   */
  getNPCsByBehavior(behaviorType: string): NPCOutput {
    const npcs = Array.from(this.npcs.values()).filter(npc => npc.behavior.type === behaviorType);
    return {
      op: 'get_by_behavior',
      status: 'ok',
      result: npcs;
    };
  }

  /**
   * Get NPCs by reputation range
   */
  getNPCsByReputation(minRep: number, maxRep: number): NPCOutput {
    const npcs = Array.from(this.npcs.values()).filter(npc => {
      const rep = npc.reputation || 0;
      return rep >= minRep && rep <= maxRep;
    });
    return {
      op: 'get_by_reputation',
      status: 'ok',
      result: npcs;
    };
  }

  /**
   * Get NPC statistics
   */
  getNPCStats(): NPCOutput {
    const npcs = Array.from(this.npcs.values());
    const stats = {
      total: npcs.length,
      byBehavior: {} as Record<string, number>,
      byFaction: {} as Record<string, number>,
      withQuests: npcs.filter(npc => npc.questIds.length > 0).length,
      averageReputation: npcs.reduce((sum, npc) => sum + (npc.reputation || 0), 0) / npcs.length,
      totalQuests: npcs.reduce((sum, npc) => sum + npc.questIds.length, 0)
    };

    npcs.forEach(npc => {
      stats.byBehavior[npc.behavior.type] = (stats.byBehavior[npc.behavior.type] || 0) + 1;
      if (npc.faction) {
        stats.byFaction[npc.faction] = (stats.byFaction[npc.faction] || 0) + 1;
      }
    });

    return {
      op: 'stats',
      status: 'ok',
      result: stats;
    };
  }

  /**
   * Export NPCs in various formats
   */
  exportNPCs(format: 'json' | 'manifest' | 'summary' | 'quests' = 'json'): NPCOutput {
    const npcs = Array.from(this.npcs.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: {

            npcs, total: npcs.length 

          


          }
          };
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {

            schema: 'miff.npcs.export.v1',
            npcs,
            exportedAt: new Date().toISOString(),
            total: npcs.length
          

          


          }
          };
        };
      
      case 'summary':
        const stats = this.getNPCStats();
        return {
          op: 'export',
          status: 'ok',
          result: {

            summary: stats.result,
            npcs: npcs.map(npc => ({
              id: npc.id,
              name: npc.name,
              behavior: npc.behavior.type,
              faction: npc.faction,
              questCount: npc.questIds.length,
              reputation: npc.reputation

          }
            }))
          }
        };
      
      case 'quests':
        const questNPCs = npcs.filter(npc => npc.questIds.length > 0);
        return {
          op: 'export',
          status: 'ok',
          result: {
        questNPCs: questNPCs.map(npc => ({
              id: npc.id,
        name: npc.name,
        questIds: npc.questIds,
        location: npc.location

          
      
      }
            })),
            total: questNPCs.length
          }
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
   * Reset all NPCs to default state
   */
  resetNPCs(): NPCOutput {
    this.npcs.clear();
    this.loadDefaultNPCs();
    return {
      op: 'reset',
      status: 'ok',
      result: {

        message: 'All NPCs reset to default state' 

      


      }
      };
    };
  }

  // Integration methods for QuestsPure and MovementPure
  getNPCsWithQuests(): NPC[] {
    return Array.from(this.npcs.values()).filter(npc => npc.questIds.length > 0);
  }

  getNPCsInZone(zoneId: EntityID): NPC[] {
    return Array.from(this.npcs.values()).filter(npc => npc.location.zoneId === zoneId);
  }

  getNPCsByFaction(faction: string): NPC[] {
    return Array.from(this.npcs.values()).filter(npc => npc.faction === faction);
  }
}