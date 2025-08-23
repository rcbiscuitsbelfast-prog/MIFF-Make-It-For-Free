import { NPCsManager, NPC } from '../NPCsPure/Manager';
import { QuestsManager } from '../QuestsPure/Manager';
import { CombatManager } from '../CombatCorePure/Manager';
import { StatsManager } from '../StatsSystemPure/Manager';
import { CraftingManager } from '../CraftingPure/Manager';
import { LootTablesManager } from '../LootTablesPure/Manager';
import { EconomyManager } from '../EconomyPure/Manager';

export interface WebEntity {
  id: string;
  type: 'sprite' | 'text' | 'group' | 'container';
  x: number;
  y: number;
  width?: number;
  height?: number;
  properties: { [key: string]: any };
  children?: WebEntity[];
}

export interface WebComponent {
  type: string;
  data: any;
  enabled: boolean;
}

export interface WebRenderData {
  entities: WebEntity[];
  components: WebComponent[];
  sprites: string[];
  sounds: string[];
  scripts: string[];
  styles: string[];
}

export interface WebBridgeOperation {
  op: 'simulate' | 'render' | 'interop' | 'dump';
  module: string;
  data?: any;
  config?: WebBridgeConfig;
}

export interface WebBridgeConfig {
  renderer: 'phaser' | 'canvas' | 'dom';
  targetVersion: string; // Phaser version (e.g., "3.60")
  assetPath: string; // Path to web assets
  scriptPath: string; // Path to JavaScript files
  stylePath: string; // Path to CSS files
  useWebGL: boolean; // Use WebGL or Canvas rendering
}

export interface WebBridgeOutput {
  op: string;
  status: 'ok' | 'error';
  renderData?: WebRenderData;
  issues?: string[];
}

export class WebBridge {
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

  simulate(module: string, data: any, config: WebBridgeConfig): WebBridgeOutput {
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
        renderData: this.convertToWebRenderData(result, config)
      };
    } catch (error) {
      return {
        op: 'simulate',
        status: 'error',
        issues: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  render(module: string, data: any, config: WebBridgeConfig): WebBridgeOutput {
    try {
      let entities: WebEntity[] = [];
      let components: WebComponent[] = [];
      let sprites: string[] = [];
      let sounds: string[] = [];
      let scripts: string[] = [];
      let styles: string[] = [];

      switch (module) {
        case 'npcs':
          const npcs = this.npcsManager.listNPCs();
          if (npcs.status === 'ok' && npcs.result) {
            entities = (npcs.result as NPC[]).map(npc => this.createWebEntity(npc, config));
            components = this.createNPCComponents(npcs.result as NPC[]);
            sprites = ['npc_sprite.png', 'quest_icon.png', 'merchant_icon.png'];
            sounds = ['npc_greeting.mp3', 'quest_accept.mp3'];
            scripts = ['NPCController.js', 'QuestSystem.js', 'MerchantUI.js'];
            styles = ['npc-styles.css', 'quest-ui.css'];
          }
          break;
        case 'combat':
          entities = this.createCombatEntities(data, config);
          components = this.createCombatComponents(data);
          sprites = ['sword_sprite.png', 'shield_sprite.png', 'effect_particles.png'];
          sounds = ['sword_swing.mp3', 'hit_sound.mp3', 'victory_fanfare.mp3'];
          scripts = ['CombatController.js', 'WeaponSystem.js', 'EffectManager.js'];
          styles = ['combat-ui.css', 'effects.css'];
          break;
        case 'ui':
          entities = this.createUIEntities(data, config);
          components = this.createUIComponents(data);
          sprites = ['button_normal.png', 'button_hover.png', 'inventory_bg.png'];
          sounds = ['button_click.mp3', 'menu_open.mp3'];
          scripts = ['UIController.js', 'InventoryUI.js', 'MenuSystem.js'];
          styles = ['ui-styles.css', 'inventory.css', 'menu.css'];
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
          sprites,
          sounds,
          scripts,
          styles
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

  interop(module: string, data: any, config: WebBridgeConfig): WebBridgeOutput {
    try {
      // Handle web-specific data conversion
      const convertedData = this.convertFromWeb(data);
      
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
        renderData: this.convertToWebRenderData(result, config)
      };
    } catch (error) {
      return {
        op: 'interop',
        status: 'error',
        issues: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  private createWebEntity(npc: NPC, config: WebBridgeConfig): WebEntity {
    const entity: WebEntity = {
      id: npc.id,
      type: 'sprite',
      x: npc.location.x * 32, // Convert to pixel coordinates
      y: npc.location.y * 32,
      width: 32,
      height: 32,
      properties: {
        npcId: npc.id,
        behavior: npc.behavior.type,
        faction: npc.faction || 'neutral',
        hasQuests: npc.questIds.length > 0
      }
    };

    // Add quest indicators as children if NPC has quests
    if (npc.questIds.length > 0) {
      entity.children = [{
        id: `${npc.id}_quest_indicator`,
        type: 'sprite',
        x: 24,
        y: -8,
        width: 16,
        height: 16,
        properties: {
          questCount: npc.questIds.length,
          questIds: npc.questIds
        }
      }];
    }

    return entity;
  }

  private createNPCComponents(npcs: NPC[]): WebComponent[] {
    return npcs.map(npc => ({
      type: 'NPCController',
      data: {
        npcId: npc.id,
        behavior: npc.behavior,
        movementPattern: npc.movementPattern,
        questIds: npc.questIds,
        stats: npc.stats
      },
      enabled: true
    }));
  }

  private createCombatEntities(data: any, config: WebBridgeConfig): WebEntity[] {
    return [
      {
        id: data.attackerId,
        type: 'sprite',
        x: data.attackerX || 0,
        y: data.attackerY || 0,
        width: 64,
        height: 64,
        properties: {
          combatantId: data.attackerId,
          isAttacker: true,
          health: data.attackerStats?.health || 100
        }
      },
      {
        id: data.defenderId,
        type: 'sprite',
        x: data.defenderX || 100,
        y: data.defenderY || 0,
        width: 64,
        height: 64,
        properties: {
          combatantId: data.defenderId,
          isAttacker: false,
          health: data.defenderStats?.health || 100
        }
      }
    ];
  }

  private createCombatComponents(data: any): WebComponent[] {
    return [
      {
        type: 'CombatController',
        data: { combatData: data },
        enabled: true
      }
    ];
  }

  private createUIEntities(data: any, config: WebBridgeConfig): WebEntity[] {
    return [
      {
        id: 'inventory_panel',
        type: 'container',
        x: 10,
        y: 10,
        width: 300,
        height: 200,
        properties: {
          uiType: 'inventory',
          visible: true
        },
        children: [
          {
            id: 'inventory_title',
            type: 'text',
            x: 0,
            y: 0,
            properties: {
              text: 'Inventory',
              fontSize: '18px',
              color: '#ffffff'
            }
          }
        ]
      }
    ];
  }

  private createUIComponents(data: any): WebComponent[] {
    return [
      {
        type: 'UIController',
        data: { uiData: data },
        enabled: true
      }
    ];
  }

  private convertFromWeb(webData: any): any {
    // Convert web-specific data back to MIFF format
    return {
      id: webData.id,
      ...webData.data
    };
  }

  private convertToWebRenderData(result: any, config: WebBridgeConfig): WebRenderData {
    return {
      entities: [],
      components: [],
      sprites: [],
      sounds: [],
      scripts: [],
      styles: []
    };
  }
}