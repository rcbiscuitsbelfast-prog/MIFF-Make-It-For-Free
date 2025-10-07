import { NPCsManager, NPC } from '../NPCsPure/Manager';
import { QuestsManager } from '../QuestsPure/Manager';
import { CombatManager } from '../CombatCorePure/Manager';
import { EnhancedStatsManager as StatsManager } from '../StatsSystemPure/EnhancedStatsManager';
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
  properties: { [key: string]: unknown };
  children?: WebEntity[];
}

export interface WebComponent {
  type: string;
  data: Record<string, unknown>;
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
  data?: Record<string, unknown>;
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

type CombatData = {
  attacker: string;
  defender: string;
  attackerId: string;
  defenderId: string;
  attackerX?: number;
  attackerY?: number;
  defenderX?: number;
  defenderY?: number;
  attackerStats?: { health?: number };
  defenderStats?: { health?: number };
  [key: string]: unknown;
};

type UIData = { [key: string]: unknown };

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

  simulate(module: string, data: Record<string, unknown>, config: WebBridgeConfig): WebBridgeOutput {
    try {
      let result: unknown;
      switch (module) {
        case 'npcs':
          result = this.npcsManager.simulateNPC(String((data as any).npcId), Number((data as any).duration));
          break;
        case 'combat':
          result = this.combatManager.simulate((data as any).attacker, (data as any).defender);
          break;
        case 'crafting':
          result = (this.craftingManager as any).simulateCraft?.(String((data as any).recipeId), (data as any).ingredients) ?? { crafted: {}, remaining: {}, success: true };
          break;
        case 'loot':
          result = this.lootManager.rollLoot(String((data as any).tableId), Number((data as any).level));
          break;
        case 'economy':
          result = this.economyManager.calculatePrice(String((data as any).itemId), String((data as any).quantity));
          break;
        default:
          return { op: 'simulate', status: 'error', issues: [`Unknown module: ${module}`] };
      }
      return { op: 'simulate', status: 'ok', renderData: this.convertToWebRenderData(result, config) };
    } catch (error) {
      return { op: 'simulate', status: 'error', issues: [error instanceof Error ? error.message : String(error)] };
    }
  }

  render(module: string, data: Record<string, unknown>, config: WebBridgeConfig): WebBridgeOutput {
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
          entities = this.createCombatEntities(data as CombatData, config);
          components = this.createCombatComponents(data as CombatData);
          sprites = ['sword_sprite.png', 'shield_sprite.png', 'effect_particles.png'];
          sounds = ['sword_swing.mp3', 'hit_sound.mp3', 'victory_fanfare.mp3'];
          scripts = ['CombatController.js', 'WeaponSystem.js', 'EffectManager.js'];
          styles = ['combat-ui.css', 'effects.css'];
          break;
        case 'ui':
          entities = this.createUIEntities(data as UIData, config);
          components = this.createUIComponents(data as UIData);
          sprites = ['button_normal.png', 'button_hover.png', 'inventory_bg.png'];
          sounds = ['button_click.mp3', 'menu_open.mp3'];
          scripts = ['UIController.js', 'InventoryUI.js', 'MenuSystem.js'];
          styles = ['ui-styles.css', 'inventory.css', 'menu.css'];
          break;
        default:
          return { op: 'render', status: 'error', issues: [`Unknown module: ${module}`] };
      }

      return { op: 'render', status: 'ok', renderData: { entities, components, sprites, sounds, scripts, styles } };
    } catch (error) {
      return { op: 'render', status: 'error', issues: [error instanceof Error ? error.message : String(error)] };
    }
  }

  interop(module: string, data: Record<string, unknown>, config: WebBridgeConfig): WebBridgeOutput {
    try {
      const convertedData = this.convertFromWeb(data);
      let result: unknown;
      switch (module) {
        case 'npcs':
          result = this.npcsManager.updateNPC(String((convertedData as any).id), convertedData);
          break;
        case 'quests':
          result = this.questsManager.updateQuest(String((convertedData as any).id), convertedData);
          break;
        case 'stats':
          (this.statsManager as any).setStat?.(String((convertedData as any).id), String((convertedData as any).key), Number((convertedData as any).base));
          result = (this.statsManager as any).get?.(String((convertedData as any).id)) ?? null;
          break;
        default:
          return { op: 'interop', status: 'error', issues: [`Unknown module: ${module}`] };
      }
      return { op: 'interop', status: 'ok', renderData: this.convertToWebRenderData(result, config) };
    } catch (error) {
      return { op: 'interop', status: 'error', issues: [error instanceof Error ? error.message : String(error)] };
    }
  }

  private createWebEntity(npc: NPC, config: WebBridgeConfig): WebEntity {
    const entity: WebEntity = {
      id: npc.id,
      type: 'sprite',
      x: npc.location.x * 32,
      y: npc.location.y * 32,
      width: 32,
      height: 32,
      properties: { npcId: npc.id, behavior: npc.behavior.type, faction: npc.faction || 'neutral', hasQuests: npc.questIds.length > 0 }
    };
    if (npc.questIds.length > 0) {
      entity.children = [{ id: `${npc.id}_quest_indicator`, type: 'sprite', x: 24, y: -8, width: 16, height: 16, properties: { questCount: npc.questIds.length, questIds: npc.questIds } }];
    }
    return entity;
  }

  private createNPCComponents(npcs: NPC[]): WebComponent[] {
    return npcs.map(npc => ({ type: 'NPCController', data: { npcId: npc.id, behavior: npc.behavior, movementPattern: npc.movementPattern, questIds: npc.questIds, stats: npc.stats }, enabled: true }));
  }

  private createCombatEntities(data: CombatData, config: WebBridgeConfig): WebEntity[] {
    return [
      { id: data.attackerId, type: 'sprite', x: data.attackerX || 0, y: data.attackerY || 0, width: 64, height: 64, properties: { combatantId: data.attackerId, isAttacker: true, health: data.attackerStats?.health || 100 } },
      { id: data.defenderId, type: 'sprite', x: data.defenderX || 100, y: data.defenderY || 0, width: 64, height: 64, properties: { combatantId: data.defenderId, isAttacker: false, health: data.defenderStats?.health || 100 } }
    ];
  }

  private createCombatComponents(data: CombatData): WebComponent[] {
    return [{ type: 'CombatController', data: { combatData: data } as Record<string, unknown>, enabled: true }];
  }

  private createUIEntities(data: UIData, config: WebBridgeConfig): WebEntity[] {
    return [
      { id: 'inventory_panel', type: 'container', x: 10, y: 10, width: 300, height: 200, properties: { uiType: 'inventory', visible: true }, children: [ { id: 'inventory_title', type: 'text', x: 0, y: 0, properties: { text: 'Inventory', fontSize: '18px', color: '#ffffff' } } ] }
    ];
  }

  private createUIComponents(data: UIData): WebComponent[] {
    return [{ type: 'UIController', data: { uiData: data } as Record<string, unknown>, enabled: true }];
  }

  private convertFromWeb(webData: Record<string, unknown>): Record<string, unknown> {
    return { id: (webData as any).id, ...(webData as any).data };
  }

  private convertToWebRenderData(result: unknown, config: WebBridgeConfig): WebRenderData {
    return { entities: [], components: [], sprites: [], sounds: [], scripts: [], styles: [] };
  }
}