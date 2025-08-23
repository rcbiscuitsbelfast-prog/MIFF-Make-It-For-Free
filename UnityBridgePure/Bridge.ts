import { NPCsManager, NPC } from '../NPCsPure/Manager';
import { QuestsManager } from '../QuestsPure/Manager';
import { CombatManager } from '../CombatCorePure/Manager';
import { StatsManager } from '../StatsSystemPure/Manager';
import { CraftingManager } from '../CraftingPure/Manager';
import { LootTablesManager } from '../LootTablesPure/Manager';
import { EconomyManager } from '../EconomyPure/Manager';

export interface UnityEntity {
  id: string;
  gameObject: any; // Unity GameObject reference
  transform: any; // Unity Transform component
  components: { [key: string]: any }; // Unity components
}

export interface UnityComponent {
  type: string;
  data: any;
  enabled: boolean;
}

export interface UnityRenderData {
  entities: UnityEntity[];
  components: UnityComponent[];
  prefabs: string[];
  scenes: string[];
  scripts: string[];
}

export interface UnityBridgeOperation {
  op: 'simulate' | 'render' | 'interop' | 'dump';
  module: string;
  data?: any;
  config?: UnityBridgeConfig;
}

export interface UnityBridgeConfig {
  targetVersion: string; // Unity version (e.g., "2022.3")
  useECS: boolean; // Use ECS or MonoBehaviour
  prefabPath: string; // Path to prefab assets
  scriptPath: string; // Path to script assets
  scenePath: string; // Path to scene assets
}

export interface UnityBridgeOutput {
  op: string;
  status: 'ok' | 'error';
  renderData?: UnityRenderData;
  issues?: string[];
}

export class UnityBridge {
  private npcsManager: NPCsManager;
  private questsManager: QuestsManager;
  private combatManager: CombatManager;
  private statsManager: StatsManager;
  private craftingManager: CraftingManager;
  private lootManager: LootTablesManager;
  private economyManager: EconomyManager;

  constructor() {
    this.npcsManager = new NPCsManager();
    this.questsManager = new QuestsManager();
    this.combatManager = new CombatManager();
    this.statsManager = new StatsManager();
    this.craftingManager = new CraftingManager();
    this.lootManager = new LootTablesManager();
    this.economyManager = new EconomyManager();
  }

  simulate(module: string, data: any, config: UnityBridgeConfig): UnityBridgeOutput {
    try {
      let result: any;
      
      switch (module) {
        case 'npcs':
          result = this.npcsManager.simulateNPC(data.npcId, data.duration);
          break;
        case 'combat':
          result = this.combatManager.simulate(data.attacker, data.defender);
          break;
        case 'crafting':
          result = this.craftingManager.simulateCraft(data.recipeId, data.ingredients);
          break;
        case 'loot':
          result = this.lootManager.rollLoot(data.tableId, data.level);
          break;
        case 'economy':
          result = this.economyManager.calculatePrice(data.itemId, data.quantity);
          break;
        default:
          return {
            op: 'simulate',
            status: 'error',
            issues: [`Unknown module: ${module}`]
          };
      }

      return {
        op: 'simulate',
        status: 'ok',
        renderData: this.convertToUnityRenderData(result, config)
      };
    } catch (error) {
      return {
        op: 'simulate',
        status: 'error',
        issues: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  render(module: string, data: any, config: UnityBridgeConfig): UnityBridgeOutput {
    try {
      let entities: UnityEntity[] = [];
      let components: UnityComponent[] = [];
      let prefabs: string[] = [];
      let scripts: string[] = [];

      switch (module) {
        case 'npcs':
          const npcs = this.npcsManager.listNPCs();
          if (npcs.status === 'ok' && npcs.result) {
            entities = (npcs.result as NPC[]).map(npc => this.createUnityEntity(npc, config));
            components = this.createNPCComponents(npcs.result as NPC[]);
            prefabs = ['NPCPrefab', 'QuestGiverPrefab', 'MerchantPrefab'];
            scripts = ['NPCController', 'QuestGiver', 'MerchantBehavior'];
          }
          break;
        case 'combat':
          entities = this.createCombatEntities(data, config);
          components = this.createCombatComponents(data);
          prefabs = ['CombatantPrefab', 'WeaponPrefab', 'EffectPrefab'];
          scripts = ['CombatController', 'WeaponSystem', 'EffectManager'];
          break;
        case 'world':
          entities = this.createWorldEntities(data, config);
          components = this.createWorldComponents(data);
          prefabs = ['ZonePrefab', 'ItemPrefab', 'InteractablePrefab'];
          scripts = ['ZoneController', 'ItemSystem', 'InteractionManager'];
          break;
        default:
          return {
            op: 'render',
            status: 'error',
            issues: [`Unknown module: ${module}`]
          };
      }

      return {
        op: 'render',
        status: 'ok',
        renderData: {
          entities,
          components,
          prefabs,
          scenes: ['MainScene', 'CombatScene', 'WorldScene'],
          scripts
        }
      };
    } catch (error) {
      return {
        op: 'render',
        status: 'error',
        issues: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  interop(module: string, data: any, config: UnityBridgeConfig): UnityBridgeOutput {
    try {
      // Handle Unity-specific data conversion
      const convertedData = this.convertFromUnity(data);
      
      let result: any;
      switch (module) {
        case 'npcs':
          result = this.npcsManager.updateNPC(convertedData.id, convertedData);
          break;
        case 'quests':
          result = this.questsManager.updateQuest(convertedData.id, convertedData);
          break;
        case 'stats':
          this.statsManager.setStat(convertedData.id, convertedData.key, convertedData.base);
          result = this.statsManager.get(convertedData.id);
          break;
        default:
          return {
            op: 'interop',
            status: 'error',
            issues: [`Unknown module: ${module}`]
          };
      }

      return {
        op: 'interop',
        status: 'ok',
        renderData: this.convertToUnityRenderData(result, config)
      };
    } catch (error) {
      return {
        op: 'interop',
        status: 'error',
        issues: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  private createUnityEntity(npc: NPC, config: UnityBridgeConfig): UnityEntity {
    return {
      id: npc.id,
      gameObject: `GameObject_${npc.id}`,
      transform: {
        position: { x: npc.location.x, y: npc.location.y, z: npc.location.z || 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      },
      components: {
        NPCController: { npcId: npc.id, behavior: npc.behavior },
        Transform: { position: npc.location },
        Stats: { stats: npc.stats }
      }
    };
  }

  private createNPCComponents(npcs: NPC[]): UnityComponent[] {
    return npcs.map(npc => ({
      type: 'NPCController',
      data: {
        npcId: npc.id,
        behavior: npc.behavior,
        movementPattern: npc.movementPattern,
        questIds: npc.questIds
      },
      enabled: true
    }));
  }

  private createCombatEntities(data: any, config: UnityBridgeConfig): UnityEntity[] {
    return [
      {
        id: data.attackerId,
        gameObject: `Combatant_${data.attackerId}`,
        transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
        components: {
          CombatController: { combatantId: data.attackerId, isAttacker: true },
          Stats: { stats: data.attackerStats }
        }
      }
    ];
  }

  private createCombatComponents(data: any): UnityComponent[] {
    return [
      {
        type: 'CombatController',
        data: { combatData: data },
        enabled: true
      }
    ];
  }

  private createWorldEntities(data: any, config: UnityBridgeConfig): UnityEntity[] {
    return data.zones?.map((zone: any) => ({
      id: zone.id,
      gameObject: `Zone_${zone.id}`,
      transform: { position: { x: zone.x, y: zone.y, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      components: {
        ZoneController: { zoneId: zone.id, zoneData: zone }
      }
    })) || [];
  }

  private createWorldComponents(data: any): UnityComponent[] {
    return [
      {
        type: 'ZoneController',
        data: { worldData: data },
        enabled: true
      }
    ];
  }

  private convertFromUnity(unityData: any): any {
    // Convert Unity-specific data back to MIFF format
    return {
      id: unityData.id,
      ...unityData.data
    };
  }

  private convertToUnityRenderData(result: any, config: UnityBridgeConfig): UnityRenderData {
    return {
      entities: [],
      components: [],
      prefabs: [],
      scenes: [],
      scripts: []
    };
  }
}