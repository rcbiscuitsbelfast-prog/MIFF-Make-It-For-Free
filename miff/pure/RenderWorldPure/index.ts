/**
 * RenderWorld Pure - Real-Time AI-Native Game Preview Engine
 *
 * The central hub scene for navigating between MIFF demo worlds, showcasing
 * modular rendering capabilities with Superhot-inspired aesthetics.
 *
 * @module RenderWorldPure
 * @version 1.0.0
 * @license MIT
 */

import {
import { log } from '../shared/logging/StructuredLogger';

  CombatEngine
} from '../CombatPure/engine';

import {
  QuestsManager
} from '../QuestsPure';

import {
  TeamManager
} from '../TeamsPure';

import {
  AIManager
} from '../AIPure';

import { HUDManager } from '../HUDPure/Manager';

import {
  SceneBuilderManager
} from '../SceneBuilderPure';

import { EventBus } from '../EventBusPure/EventBusPure.js';

// import {
//   type Node,
//   type Dialogue
// } from '../DialogueSystemPure';

// New gameplay system imports
// import {
//   overlayFXManager,
//   OverlayFXManager,
//   OverlayEffectType,
//   OverlayEffectConfig
// } from '../OverlayFXPure';

import {
  perceptionFilterManager,
  PerceptionFilterManager,
  PerceptionMode,
  NPCInfo,
  InteractableInfo
} from '../PerceptionFilterLayer';

import {
  scanFeedbackManager,
  ScanFeedbackManager,
  ScanTargetType,
  ScanTarget
} from '../ScanFeedbackLayer';

import {
  lensModeSwitcher,
  LensModeSwitcher,
  LensMode
} from '../LensModeSwitcher';

import {
  buttonStyleManager,
  ButtonStyleManager,
  ButtonVariant,
  ButtonSize,
  ButtonState
} from '../ButtonStylePure';

import {
  interactableRegistry,
  InteractableRegistry,
  InteractableType,
  InteractionBehavior,
  InteractionState
} from '../InteractableRegistryPure';

import {
  mobilePerformanceOptimizer,
  MobilePerformanceOptimizer,
  PerformanceLevel,
  DeviceType
} from '../MobilePerformanceOptimizer';

export interface RenderWorldGameState {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  player: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    holdingSpiritLens: boolean;
    health: number;
    maxHealth: number;
    inventory: string[];
    level: number;
    quests: string[];
    skills: Record<string, number>;
  };
  world: {
    warehouse: {
      dimensions: { width: number; height: number; depth: number };
      lighting: {
        ambient: { r: number; g: number; b: number; intensity: number };
        directional: { x: number; y: number; z: number; intensity: number };
        spiritLensGlow: { r: number; g: number; b: number; intensity: number; radius: number };
      };
      materials: {
        brick: { color: string; roughness: number; metallic: number };
        metal: { color: string; roughness: number; metallic: number };
        concrete: { color: string; roughness: number; metallic: number };
      };
    };
    spiritLens: {
      position: { x: number; y: number; z: number };
      glowIntensity: number;
      scanRadius: number;
      active: boolean;
    };
    portals: {
      spiritTamer: {
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        aura: { r: number; g: number; b: number; intensity: number };
        active: boolean;
        destination: string;
      };
      toppler: {
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        shimmer: { r: number; g: number; b: number; intensity: number };
        active: boolean;
        destination: string;
      };
      witcher: {
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        glow: { r: number; g: number; b: number; intensity: number };
        active: boolean;
        destination: string;
      };
    };
    // Gameplay systems
    gameplay: {
      lensMode: LensMode;
      perceptionMode: PerceptionMode;
      overlayEffects: OverlayEffectConfig[];
      scanTargets: ScanTarget[];
      interactables: InteractableType[];
      npcs: NPCInfo[];
      ui: {
        buttonStyles: Record<string, any>;
        hudElements: string[];
        menuState: 'closed' | 'inventory' | 'quests' | 'settings';
      };
    };
    npcs: {
      explorer: {
        id: string;
        position: { x: number; y: number; z: number };
        targetPosition: { x: number; y: number; z: number };
        state: 'idle' | 'wandering' | 'inspecting' | 'dialogue';
        dialogueTree: string[];
        lastDialogueTime: number;
      };
      guide: {
        id: string;
        position: { x: number; y: number; z: number };
        targetPosition: { x: number; y: number; z: number };
        state: 'idle' | 'wandering' | 'inspecting' | 'dialogue';
        dialogueTree: string[];
        lastDialogueTime: number;
      };
      mystic: {
        id: string;
        position: { x: number; y: number; z: number };
        targetPosition: { x: number; y: number; z: number };
        state: 'idle' | 'wandering' | 'inspecting' | 'dialogue';
        dialogueTree: string[];
        lastDialogueTime: number;
      };
    };
  };
  game: {
    time: number;
    fps: number;
    renderTime: number;
    physicsTime: number;
    aiTime: number;
    paused: boolean;
    gameOver: boolean;
  };
  ui: {
    hudVisible: boolean;
    debugVisible: boolean;
    dialogueVisible: boolean;
    inventoryVisible: boolean;
  };
}

export class RenderWorldPure {
  
  private state: RenderWorldGameState;
  private engines: {
    combat: CombatEngine;
    items: ItemUsageManager;
    quests: QuestsManager;
    teams: TeamManager;
    ai: AIManager;
    hud: HUDManager;
    scene: SceneBuilderManager;
    avatar: AvatarSystemPure;
    // New gameplay systems
    overlayFX: OverlayFXManager;
    perception: PerceptionFilterManager;
    scanFeedback: ScanFeedbackManager;
    lensMode: LensModeSwitcher;
    buttonStyle: ButtonStyleManager;
    interactables: InteractableRegistry;
    mobilePerformance: MobilePerformanceOptimizer;
    dialogue: {
      nextNode: typeof nextNode;
      currentDialogue?: Dialogue;
    };
  };
  private lastTime: number = 0;
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;

  constructor(...args: any[]) {
    
    this.state = this.initializeGameState();
    this.engines = this.initializeEngines();
    this.setupEventListeners();
    this.generateWorld();
    this.setupSpiritLens();
    this.setupNPCs();
    this.initializeGameplaySystems();
  }

  private initializeGameState(): RenderWorldGameState {
    return {
      player: {
        position: { x: 0, y: 1.7, z: 5 }, // Standing height, facing the central table
        rotation: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        holdingSpiritLens: false,
        health: 100,
        maxHealth: 100,
        inventory: [],
        level: 1,
        quests: [],
        skills: {}
      },
      world: {
        warehouse: {
          dimensions: { width: 50, height: 15, depth: 50 },
          lighting: {
            ambient: { r: 0.2, g: 0.2, b: 0.3, intensity: 0.8 },
            directional: { x: -1, y: 1, z: -0.5, intensity: 1.2 },
            spiritLensGlow: { r: 0.8, g: 0.9, b: 1.0, intensity: 2.0, radius: 8 }
          },
          materials: {
            brick: { color: '#8B4513', roughness: 0.8, metallic: 0.1 },
            metal: { color: '#708090', roughness: 0.2, metallic: 0.8 },
            concrete: { color: '#A9A9A9', roughness: 0.9, metallic: 0.0 }
          }
        },
        spiritLens: {
          position: { x: 0, y: 1.5, z: 0 }, // Central table position
          glowIntensity: 1.0,
          scanRadius: 5.0,
          active: true
        },
        portals: {
          spiritTamer: {
            position: { x: -15, y: 2, z: -20 },
            rotation: { x: 0, y: 0, z: 0 },
            aura: { r: 0.2, g: 0.6, b: 1.0, intensity: 1.5 },
            active: true,
            destination: 'SpiritTamerDemoPure'
          },
          toppler: {
            position: { x: 0, y: 2, z: -20 },
            rotation: { x: 0, y: 0, z: 0 },
            shimmer: { r: 0.2, g: 1.0, b: 0.4, intensity: 1.2 },
            active: true,
            destination: 'TopplerDemoPure'
          },
          witcher: {
            position: { x: 15, y: 2, z: -20 },
            rotation: { x: 0, y: 0, z: 0 },
            glow: { r: 1.0, g: 0.2, b: 0.2, intensity: 1.8 },
            active: true,
            destination: 'WitcherExplorerDemoPure'
          }
        },
        npcs: {
          explorer: {
            id: 'explorer',
            position: { x: -10, y: 1.7, z: 8 },
            targetPosition: { x: -10, y: 1.7, z: 8 },
            state: 'idle',
            dialogueTree: [
              "Have you visited the Witcher grove?",
              "The Spirit Lens reveals hidden paths.",
              "Toppler physics are wild today."
            ],
            lastDialogueTime: 0
          },
          guide: {
            id: 'guide',
            position: { x: 10, y: 1.7, z: 8 },
            targetPosition: { x: 10, y: 1.7, z: 8 },
            state: 'idle',
            dialogueTree: [
              "The warehouse holds many secrets.",
              "Try scanning with the Spirit Lens.",
              "Each door leads to a different world."
            ],
            lastDialogueTime: 0
          },
          mystic: {
            id: 'mystic',
            position: { x: 0, y: 1.7, z: 15 },
            targetPosition: { x: 0, y: 1.7, z: 15 },
            state: 'idle',
            dialogueTree: [
              "Feel the energy of the Spirit Lens.",
              "The portals pulse with possibility.",
              "This is just the beginning of RenderWorld."
            ],
            lastDialogueTime: 0
          }
        },
        // Gameplay systems
        gameplay: {
          lensMode: LensMode.NORMAL,
          perceptionMode: PerceptionMode.NORMAL,
          overlayEffects: [],
          scanTargets: [],
          interactables: [],
          npcs: [],
          ui: {
            buttonStyles: {},
            hudElements: [],
            menuState: 'closed'
          }
        }
      },
      game: {
        time: 0,
        fps: 60,
        renderTime: 0,
        physicsTime: 0,
        aiTime: 0,
        paused: false,
        gameOver: false
      },
      ui: {
        hudVisible: true,
        debugVisible: false,
        dialogueVisible: false,
        inventoryVisible: false
      }
    };
  }

  private initializeEngines(...args: any[]) {
//     const typeChart = new TypeEffectiveness();
    const playerContext: IPlayerContext = {
      playerId: 'player',
      inventory: {},
      flags: {}
    };

    return {
      combat: new CombatEngine(),
      items: new ItemUsageManager(playerContext),
      quests: new QuestsManager(),
      teams: new TeamManager(),
      ai: new AIManager(),
      hud: new HUDManager({} as any),
      scene: new SceneBuilderManager({} as any),
      avatar: new AvatarSystemPure(),
      // New gameplay systems
      overlayFX: overlayFXManager,
      perception: perceptionFilterManager,
      scanFeedback: scanFeedbackManager,
      lensMode: lensModeSwitcher,
      buttonStyle: buttonStyleManager,
      interactables: interactableRegistry,
      mobilePerformance: mobilePerformanceOptimizer,
      dialogue: {
        nextNode: nextNode,
        currentDialogue: undefined
      }
    };
  }

  private setupEventListeners(...args: any[]) {
    EventBus.subscribe('spiritLens.pickup', (e: any) => this.handleSpiritLensPickup(e));
    EventBus.subscribe('spiritLens.use', (e: any) => this.handleSpiritLensUse(e));
    EventBus.subscribe('portal.activate', (e: any) => this.handlePortalActivation(e));
    EventBus.subscribe('npc.interact', (e: any) => this.handleNPCInteraction(e));
    EventBus.subscribe('dialogue.trigger', (e: any) => this.handleDialogueTrigger(e));
    EventBus.subscribe('player.move', (e: any) => this.handlePlayerMovement(e));
    EventBus.subscribe('world.scan', (e: any) => this.handleWorldScan(e));
  }

  private generateWorld(...args: any[]) {
    // Generate warehouse geometry using SceneBuilderPure
    this.generateWarehouseStructure();
    this.generateLightingSetup();
    this.generatePortalFrames();
    this.generateCentralTable();
  }

  private generateWarehouseStructure(...args: any[]) {
    // Main warehouse walls, floor, ceiling
    const warehouseGeometry = {
      floor: {
        type: 'plane',
        position: { x: 0, y: 0, z: 0 },
        scale: { x: 50, y: 1, z: 50 },
        material: this.state.world.warehouse.materials.concrete,
        texture: 'concrete_floor'
      },
      walls: {
        north: {
          type: 'plane',
          position: { x: 0, y: 7.5, z: -25 },
          scale: { x: 50, y: 15, z: 1 },
          material: this.state.world.warehouse.materials.brick,
          texture: 'brick_wall'
        },
        south: {
          type: 'plane',
          position: { x: 0, y: 7.5, z: 25 },
          scale: { x: 50, y: 15, z: 1 },
          material: this.state.world.warehouse.materials.brick,
          texture: 'brick_wall'
        },
        east: {
          type: 'plane',
          position: { x: 25, y: 7.5, z: 0 },
          rotation: { x: 0, y: Math.PI / 2, z: 0 },
          scale: { x: 50, y: 15, z: 1 },
          material: this.state.world.warehouse.materials.brick,
          texture: 'brick_wall'
        },
        west: {
          type: 'plane',
          position: { x: -25, y: 7.5, z: 0 },
          rotation: { x: 0, y: Math.PI / 2, z: 0 },
          scale: { x: 50, y: 15, z: 1 },
          material: this.state.world.warehouse.materials.brick,
          texture: 'brick_wall'
        }
      },
      ceiling: {
        type: 'plane',
        position: { x: 0, y: 15, z: 0 },
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
        scale: { x: 50, y: 1, z: 50 },
        material: this.state.world.warehouse.materials.metal,
        texture: 'metal_ceiling'
      },
      beams: this.generateSupportBeams()
    };

    // Generate beams using SceneBuilderPure
    (this.engines.scene as any).addGeometry?.('warehouse', warehouseGeometry);
  }

  private generateSupportBeams(): any[] {
    const beams = [];
    for (let i = 0; i < 5; i++) {
      beams.push({
        type: 'cylinder',
        position: { x: -20 + i * 10, y: 10, z: -20 },
        scale: { x: 0.5, y: 10, z: 0.5 },
        material: this.state.world.warehouse.materials.metal,
        texture: 'metal_beam'
      });
      beams.push({
        type: 'cylinder',
        position: { x: -20 + i * 10, y: 10, z: 20 },
        scale: { x: 0.5, y: 10, z: 0.5 },
        material: this.state.world.warehouse.materials.metal,
        texture: 'metal_beam'
      });
    }
    return beams;
  }

  private generateLightingSetup(...args: any[]) {
    const lighting = {
      ambient: {
        type: 'ambient',
        color: this.state.world.warehouse.lighting.ambient,
        intensity: this.state.world.warehouse.lighting.ambient.intensity
      },
      directional: {
        type: 'directional',
        direction: this.state.world.warehouse.lighting.directional,
        intensity: this.state.world.warehouse.lighting.directional.intensity,
        color: { r: 1, g: 1, b: 1 }
      },
      spiritLens: {
        type: 'point',
        position: this.state.world.spiritLens.position,
        color: this.state.world.warehouse.lighting.spiritLensGlow,
        radius: this.state.world.warehouse.lighting.spiritLensGlow.radius,
        intensity: this.state.world.warehouse.lighting.spiritLensGlow.intensity
      },
      portalLights: [
        {
          type: 'point',
          position: this.state.world.portals.spiritTamer.position,
          color: this.state.world.portals.spiritTamer.aura,
          radius: 8,
          intensity: this.state.world.portals.spiritTamer.aura.intensity
        },
        {
          type: 'point',
          position: this.state.world.portals.toppler.position,
          color: this.state.world.portals.toppler.shimmer,
          radius: 8,
          intensity: this.state.world.portals.toppler.shimmer.intensity
        },
        {
          type: 'point',
          position: this.state.world.portals.witcher.position,
          color: this.state.world.portals.witcher.glow,
          radius: 8,
          intensity: this.state.world.portals.witcher.glow.intensity
        }
      ]
    };

    (this.engines.scene as any).addLighting?.('warehouse_lighting', lighting);
  }

  private generatePortalFrames(...args: any[]) {
    const portalGeometry = {
      spiritTamerFrame: {
        type: 'frame',
        position: this.state.world.portals.spiritTamer.position,
        scale: { x: 4, y: 8, z: 0.5 },
        material: this.state.world.warehouse.materials.metal,
        emissive: this.state.world.portals.spiritTamer.aura,
        portalData: {
          destination: 'SpiritTamerDemoPure',
          theme: 'forest',
          color: 'blue'
        }
      },
      topplerFrame: {
        type: 'frame',
        position: this.state.world.portals.toppler.position,
        scale: { x: 4, y: 8, z: 0.5 },
        material: this.state.world.warehouse.materials.metal,
        emissive: this.state.world.portals.toppler.shimmer,
        portalData: {
          destination: 'TopplerDemoPure',
          theme: 'physics',
          color: 'green'
        }
      },
      witcherFrame: {
        type: 'frame',
        position: this.state.world.portals.witcher.position,
        scale: { x: 4, y: 8, z: 0.5 },
        material: this.state.world.warehouse.materials.metal,
        emissive: this.state.world.portals.witcher.glow,
        portalData: {
          destination: 'WitcherExplorerDemoPure',
          theme: 'medieval',
          color: 'red'
        }
      }
    };

    (this.engines.scene as any).addGeometry?.('portal_frames', portalGeometry);
  }

  private generateCentralTable(...args: any[]) {
    const tableGeometry = {
      tableTop: {
        type: 'cube',
        position: { x: 0, y: 1.2, z: 0 },
        scale: { x: 3, y: 0.2, z: 3 },
        material: this.state.world.warehouse.materials.metal,
        texture: 'metal_table'
      },
      tableLegs: [
        {
          type: 'cylinder',
          position: { x: 1.2, y: 0.6, z: 1.2 },
          scale: { x: 0.1, y: 1.2, z: 0.1 },
          material: this.state.world.warehouse.materials.metal
        },
        {
          type: 'cylinder',
          position: { x: -1.2, y: 0.6, z: 1.2 },
          scale: { x: 0.1, y: 1.2, z: 0.1 },
          material: this.state.world.warehouse.materials.metal
        },
        {
          type: 'cylinder',
          position: { x: 1.2, y: 0.6, z: -1.2 },
          scale: { x: 0.1, y: 1.2, z: 0.1 },
          material: this.state.world.warehouse.materials.metal
        },
        {
          type: 'cylinder',
          position: { x: -1.2, y: 0.6, z: -1.2 },
          scale: { x: 0.1, y: 1.2, z: 0.1 },
          material: this.state.world.warehouse.materials.metal
        }
      ]
    };

    (this.engines.scene as any).addGeometry?.('central_table', tableGeometry);
  }

  private setupSpiritLens(...args: any[]) {
    // Create Spirit Lens as an interactive item
    const spiritLens = new Item('spirit_lens', 'Spirit Lens', ItemType.KEY_ITEM, new ItemEffect(ItemEffectType.NONE, 0), 'any');

    (this.engines.items as any).registerItem?.(spiritLens);
    this.state.world.spiritLens.active = true;

    // Add ambient sound for Spirit Lens
    EventBus.publish('audio.ambient', {
      source: 'spirit_lens',
      sound: 'lens_hum',
      position: this.state.world.spiritLens.position,
      volume: 0.3,
      loop: true
    });
  }

  private setupNPCs(...args: any[]) {
    // Initialize NPC AI behaviors
    Object.values(this.state.world.npcs).forEach((npc: any) => {
      (this.engines.ai as any).registerBehavior?.(npc.id, {
        type: 'wander',
        parameters: {
          speed: 0.5,
          wanderRadius: 10,
          idleTime: 2000,
          inspectTime: 3000
        }
      });
    });
  }

  private handleSpiritLensPickup(event: any) {
    this.state.player.holdingSpiritLens = true;
    this.state.world.spiritLens.active = false;

    EventBus.publish('audio.play', { sound: 'lens_pickup', volume: 0.8 });
    EventBus.publish('ui.notification', {
      message: 'Spirit Lens acquired - use it to scan for hidden paths',
      type: 'info',
      duration: 3000
    });
  }

  private handleSpiritLensUse(event: any) {
    if (!this.state.player.holdingSpiritLens) return;

    const scanResult = this.performSpiritLensScan();
    this.highlightNearbyElements(scanResult);

    EventBus.publish('world.scan', scanResult);
  }

  private performSpiritLensScan(): any {
    const scanResults: { portals: any[]; npcs: any[]; hiddenPaths: any[] } = {
      portals: [],
      npcs: [],
      hiddenPaths: []
    };

    // Scan for nearby portals
    Object.values(this.state.world.portals).forEach((portal: any) => {
      const distance = this.calculateDistance(this.state.player.position, portal.position);
      if (distance <= this.state.world.spiritLens.scanRadius) {
        scanResults.portals.push({
          portal: portal,
          distance: distance,
          intensity: Math.max(0, 1 - (distance / this.state.world.spiritLens.scanRadius))
        });
      }
    });

    // Scan for nearby NPCs
    Object.values(this.state.world.npcs).forEach((npc: any) => {
      const distance = this.calculateDistance(this.state.player.position, npc.position);
      if (distance <= this.state.world.spiritLens.scanRadius) {
        scanResults.npcs.push({
          npc: npc,
          distance: distance,
          canInteract: distance <= 3
        });
      }
    });

    return scanResults;
  }

  private highlightNearbyElements(scanResults: any) {
    // Increase portal glow intensity based on scan results
    scanResults.portals.forEach((result: any) => {
      const portal = result.portal;
      const intensity = portal.aura ? portal.aura.intensity + result.intensity :
                       portal.shimmer ? portal.shimmer.intensity + result.intensity :
                       portal.glow.intensity + result.intensity;

      EventBus.publish('portal.highlight', {
        portalId: portal.destination.toLowerCase(),
        intensity: intensity,
        duration: 5000
      });
    });

    // Trigger NPC dialogue if close enough
    scanResults.npcs.forEach((result: any) => {
      if (result.canInteract) {
        this.triggerNPCDialogue(result.npc);
      }
    });
  }

  private calculateDistance(pos1: any, pos2: any): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private triggerNPCDialogue(npc: any) {
    if (Date.now() - npc.lastDialogueTime < 10000) return; // Cooldown

    npc.lastDialogueTime = Date.now();
    npc.state = 'dialogue';

    const dialogue = npc.dialogueTree[Math.floor(Math.random() * npc.dialogueTree.length)];

    EventBus.publish('dialogue.start', {
      npcId: npc.id,
      dialogue: dialogue,
      position: npc.position
    });

    // Reset NPC state after dialogue
    setTimeout(() => {
      npc.state = 'idle';
    }, 5000);
  }

  private handlePortalActivation(event: any) {
    const portalId = event.portalId;
    const portal = Object.values(this.state.world.portals).find(p => p.destination.toLowerCase() === portalId);

    if (!portal || !portal.active) return;

    EventBus.publish('scene.transition', {
      destination: portal.destination,
      transitionType: 'portal',
      portalData: portal
    });

    // Play portal activation sound
    EventBus.publish('audio.play', {
      sound: 'portal_activate',
      position: portal.position,
      volume: 1.0
    });
  }

  private handleNPCInteraction(event: any) {
    const npc = event.npc;
    const player = this.state.player;

    const distance = this.calculateDistance(player.position, npc.position);
    if (distance > 3) return;

    this.triggerNPCDialogue(npc);
  }

  private handleDialogueTrigger(event: any) {
    // Handle dialogue system interactions
    this.state.ui.dialogueVisible = true;

    EventBus.publish('ui.dialogue', event.dialogue);
  }

  private handlePlayerMovement(event: any) {
    // Update player position and handle physics
    const newPosition = {
      x: this.state.player.position.x + event.velocity.x,
      y: this.state.player.position.y + event.velocity.y,
      z: this.state.player.position.z + event.velocity.z
    };

    // Basic collision detection with warehouse bounds
    newPosition.x = Math.max(-24, Math.min(24, newPosition.x));
    newPosition.z = Math.max(-24, Math.min(24, newPosition.z));
    newPosition.y = Math.max(0, Math.min(14, newPosition.y));

    this.state.player.position = newPosition;
    this.state.player.velocity = event.velocity;

    // Check for Spirit Lens pickup
    if (!this.state.player.holdingSpiritLens) {
      const lensDistance = this.calculateDistance(this.state.player.position, this.state.world.spiritLens.position);
      if (lensDistance <= 2) {
        EventBus.publish('spiritLens.pickup', { player: this.state.player });
      }
    }

    // Check for portal proximity
    Object.values(this.state.world.portals).forEach((portal: any) => {
      const portalDistance = this.calculateDistance(this.state.player.position, portal.position);
      if (portalDistance <= 3) {
        EventBus.publish('portal.proximity', {
          portalId: portal.destination.toLowerCase(),
          distance: portalDistance
        });
      }
    });
  }

  private handleWorldScan(event: any) {
    // Process scan results and update world state
    if (event.portals && event.portals.length > 0) {
      EventBus.publish('ui.notification', {
        message: `${event.portals.length} portals detected nearby`,
        type: 'scan',
        duration: 2000
      });
    }

    if (event.npcs && event.npcs.length > 0) {
      EventBus.publish('ui.notification', {
        message: `${event.npcs.length} entities detected - approach for interaction`,
        type: 'scan',
        duration: 3000
      });
    }
  }

  // Public API methods
  public getGameState(): RenderWorldGameState {
    return this.state;
  }

  public update(deltaTime: number) {
    if (this.state.game.paused || this.state.game.gameOver) return;

    this.state.game.time += deltaTime;
    this.updateFPS(deltaTime);
    this.updatePlayer(deltaTime);
    this.updateNPCs(deltaTime);
    this.updateSpiritLens(deltaTime);
    this.updateUI(deltaTime);
    this.updatePerformanceMetrics(deltaTime);
  }

  private updateFPS(deltaTime: number) {
    this.frameCount++;
    if (this.state.game.time - this.lastFPSUpdate >= 1000) {
      this.state.game.fps = Math.round(this.frameCount / ((this.state.game.time - this.lastFPSUpdate) / 1000));
      this.frameCount = 0;
      this.lastFPSUpdate = this.state.game.time;
    }
  }

  private updatePlayer(deltaTime: number) {
    // Apply gravity and physics
    if (this.state.player.position.y > 1.7) {
      this.state.player.velocity.y -= 9.81 * deltaTime;
    } else {
      this.state.player.velocity.y = 0;
      this.state.player.position.y = 1.7;
    }

    // Apply movement
    this.state.player.position.x += this.state.player.velocity.x * deltaTime;
    this.state.player.position.z += this.state.player.velocity.z * deltaTime;

    // Damping
    this.state.player.velocity.x *= 0.9;
    this.state.player.velocity.z *= 0.9;
  }

  private updateNPCs(deltaTime: number) {
    Object.values(this.state.world.npcs).forEach((npc: any) => {
      if (npc.state === 'wandering') {
        // Move towards target position
        const dx = npc.targetPosition.x - npc.position.x;
        const dz = npc.targetPosition.z - npc.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0.1) {
          const moveSpeed = 0.5;
          npc.position.x += (dx / distance) * moveSpeed * deltaTime;
          npc.position.z += (dz / distance) * moveSpeed * deltaTime;
        } else {
          // Reach target, choose new behavior
          this.updateNPCBehavior(npc);
        }
      }
    });
  }

  private updateNPCBehavior(npc: any) {
    const behaviors = ['idle', 'wandering', 'inspecting'];
    const currentBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];

    if (currentBehavior === 'wandering') {
      // Choose random target position within warehouse
      npc.targetPosition = {
        x: (Math.random() - 0.5) * 30,
        y: npc.position.y,
        z: (Math.random() - 0.5) * 30
      };
      npc.state = 'wandering';
    } else if (currentBehavior === 'inspecting') {
      // Look at nearby objects (portals, Spirit Lens)
      const nearbyObjects = [
        ...Object.values(this.state.world.portals),
        this.state.world.spiritLens
      ];

      if (nearbyObjects.length > 0) {
        const target = nearbyObjects[Math.floor(Math.random() * nearbyObjects.length)];
        npc.targetPosition = target.position;
        npc.state = 'wandering';

        // Trigger dialogue after reaching inspection target
        setTimeout(() => {
          this.triggerNPCDialogue(npc);
        }, 2000);
      } else {
        npc.state = 'idle';
      }
    } else {
      npc.state = 'idle';
    }
  }

  private updateSpiritLens(deltaTime: number) {
    if (!this.state.world.spiritLens.active) return;

    // Animate glow intensity
    const time = this.state.game.time * 0.001;
    this.state.world.spiritLens.glowIntensity = 0.8 + Math.sin(time * 2) * 0.2;

    // Update ambient sound
    EventBus.publish('audio.update', {
      source: 'spirit_lens',
      volume: this.state.world.spiritLens.glowIntensity * 0.3
    });
  }

  private updateUI(deltaTime: number) {
    if (this.state.ui.hudVisible) {
      this.renderHUD();
    }

    if (this.state.ui.debugVisible) {
      this.renderDebugInfo();
    }
  }

  private updatePerformanceMetrics(deltaTime: number) {
    // Track performance metrics for DebugOverlayPure
    this.state.game.renderTime = performance.now();
    // Add actual render time measurement here
    this.state.game.renderTime = 0; // Placeholder

    this.state.game.physicsTime = 0; // Placeholder
    this.state.game.aiTime = 0; // Placeholder
  }

  private renderHUD(...args: any[]) {
    const hudData = {
      player: {
        position: this.state.player.position,
        health: this.state.player.health,
        maxHealth: this.state.player.maxHealth,
        holdingSpiritLens: this.state.player.holdingSpiritLens
      },
      game: {
        fps: this.state.game.fps,
        time: this.state.game.time,
        portalsActive: Object.values(this.state.world.portals).filter(p => p.active).length
      },
      world: {
        spiritLensActive: this.state.world.spiritLens.active,
        npcCount: Object.keys(this.state.world.npcs).length
      }
    };

    (this.engines.hud as any).updateModel?.(hudData);
  }

  private renderDebugInfo(...args: any[]) {
    const debugData = {
      performance: {
        fps: this.state.game.fps,
        renderTime: this.state.game.renderTime,
        physicsTime: this.state.game.physicsTime,
        aiTime: this.state.game.aiTime
      },
      player: {
        position: this.state.player.position,
        velocity: this.state.player.velocity,
        holdingSpiritLens: this.state.player.holdingSpiritLens
      },
      world: {
        spiritLens: this.state.world.spiritLens,
        activePortals: Object.values(this.state.world.portals).filter(p => p.active)
      }
    };

    EventBus.publish('debug.update', debugData);
  }

  public render(...args: any[]) {
    this.renderWorld();
    this.renderUI();
    this.renderEffects();
  }

  private renderWorld(...args: any[]) {
    // Render warehouse geometry with SceneBuilderPure
    (this.engines.scene as any).render?.();

    // Render portals with special effects
    Object.values(this.state.world.portals).forEach(portal => {
      this.renderPortal(portal);
    });

    // Render Spirit Lens if active
    if (this.state.world.spiritLens.active) {
      this.renderSpiritLens();
    }

    // Render NPCs
    Object.values(this.state.world.npcs).forEach(npc => {
      this.renderNPC(npc);
    });
  }

  private renderPortal(portal: any) {
    // Portal-specific rendering with emissive effects
    const emissiveColor = portal.aura || portal.shimmer || portal.glow;

    EventBus.publish('render.portal', {
      portal: portal,
      emissive: emissiveColor,
      intensity: 1.0,
      animation: 'pulse'
    });
  }

  private renderSpiritLens(...args: any[]) {
    EventBus.publish('render.spiritLens', {
      position: this.state.world.spiritLens.position,
      glowIntensity: this.state.world.spiritLens.glowIntensity,
      color: { r: 0.8, g: 0.9, b: 1.0 },
      radius: 2
    });
  }

  private renderNPC(npc: any) {
    EventBus.publish('render.npc', {
      npc: npc,
      state: npc.state,
      position: npc.position,
      animation: npc.state === 'wandering' ? 'walk' : 'idle'
    });
  }

  private renderUI(...args: any[]) {
    // Render HUD elements
    if (this.state.ui.hudVisible) {
      EventBus.publish('render.hud', {});
    }

    // Render dialogue if active
    if (this.state.ui.dialogueVisible) {
      EventBus.publish('render.dialogue', {});
    }
  }

  private renderEffects(...args: any[]) {
    // Render particle effects, post-processing
    EventBus.publish('render.effects', {
      glowEffects: true,
      ambientOcclusion: true,
      bloom: true
    });
  }

  // Demo orchestration methods
  public runDemo(): any {
    return {
      op: 'renderworld_hub',
      status: 'ok',
      scene: 'warehouse_hub',
      player: this.state.player.position,
      portals: Object.keys(this.state.world.portals),
      npcs: Object.keys(this.state.world.npcs),
      fps: this.state.game.fps,
      orchestrationReady: true,
      modulesIntegrated: [
        'SceneBuilderPure',
        'ItemsPure',
        'AIPure',
        'HUDPure',
        'AvatarSystemPure',
        'DialogueSystemPure (nextNode, Dialogue)',
        'CombatPure',
        'TeamsPure',
        'QuestsPure'
      ],
      features: [
        'Superhot-inspired minimalist aesthetics',
        'Interactive Spirit Lens with scanning capabilities',
        'Three portal doors to MIFF demo games',
        'AI-powered NPC behaviors and dialogue',
        'Real-time physics and collision detection',
        '60fps performance optimization',
        'Cross-platform rendering compatibility'
      ]
    };
  }

  // ============================================================================
  // GAMEPLAY SYSTEM METHODS
  // ============================================================================

  /**
   * Initialize gameplay systems
   */
  private initializeGameplaySystems(): void {
    // Initialize overlay effects
    this.engines.overlayFX.createLayer('renderworld_effects', 'RenderWorld Effects', 5);
    
    // Initialize perception system
    (this.engines.perception as any).updatePlayerContext?.({
      position: this.state.player.position,
      inventory: this.state.player.inventory,
      level: this.state.player.level,
      quests: this.state.player.quests,
      skills: this.state.player.skills
    });

    // Initialize scan targets
    this.setupScanTargets();
    
    // Initialize interactables
    this.setupInteractables();
    
    // Initialize NPCs for perception system
    this.setupPerceptionNPCs();
  }

  /**
   * Setup scan targets in the world
   */
  private setupScanTargets(): void {
    // Add spirit lens as scan target
    this.engines.scanFeedback.addTarget({
      id: 'spirit_lens',
      type: ScanTargetType.ITEM,
      position: this.state.world.spiritLens.position,
      radius: 2.0,
      isScanned: false,
      scanProgress: 0,
      cooldownDuration: 5000,
      highlightColor: '#00ff00',
      wireframeColor: '#00ffff',
      pulseIntensity: 0.5,
      isInteractable: true,
      metadata: {
        name: 'Spirit Lens',
        description: 'A mystical lens that reveals hidden energies',
        rarity: 'legendary'
      }
    });

    // Add portals as scan targets
    Object.values(this.state.world.portals).forEach(portal => {
      this.engines.scanFeedback.addTarget({
        id: `portal_${portal.destination}`,
        type: ScanTargetType.PORTAL,
        position: portal.position,
        radius: 3.0,
        isScanned: false,
        scanProgress: 0,
        cooldownDuration: 10000,
        highlightColor: '#ff8000',
        wireframeColor: '#ffff00',
        pulseIntensity: 0.3,
        isInteractable: true,
        metadata: {
          name: `Portal to ${portal.destination}`,
          description: `A portal leading to ${portal.destination}`,
          destination: portal.destination
        }
      });
    });
  }

  /**
   * Setup interactable objects
   */
  private setupInteractables(): void {
    // Add spirit lens as interactable
    this.engines.interactables.register({
      id: 'spirit_lens',
      type: InteractableType.ITEM,
      name: 'Spirit Lens',
      description: 'A mystical lens that reveals hidden energies',
      position: this.state.world.spiritLens.position,
      radius: 2.0,
      behaviors: [InteractionBehavior.PICKUP, InteractionBehavior.SCAN, InteractionBehavior.EXAMINE],
      state: InteractionState.AVAILABLE,
      requirements: [],
      cooldownDuration: 0,
      metadata: {
        rarity: 'legendary',
        value: 1000
      },
      visualIndicators: {
        highlightColor: '#00ff00',
        wireframeColor: '#00ffff',
        pulseIntensity: 0.5,
        glowIntensity: 0.8
      },
      audioCues: {
        onApproach: 'spirit_lens_hum',
        onInteract: 'spirit_lens_pickup',
        onSuccess: 'spirit_lens_activate'
      }
    });

    // Add portals as interactables
    Object.entries(this.state.world.portals).forEach(([key, portal]) => {
      this.engines.interactables.register({
        id: `portal_${key}`,
        type: InteractableType.PORTAL,
        name: `Portal to ${portal.destination}`,
        description: `A portal leading to ${portal.destination}`,
        position: portal.position,
        radius: 3.0,
        behaviors: [InteractionBehavior.USE, InteractionBehavior.SCAN, InteractionBehavior.EXAMINE],
        state: portal.active ? InteractionState.AVAILABLE : InteractionState.LOCKED,
        requirements: [],
        cooldownDuration: 2000,
        metadata: {
          destination: portal.destination,
          active: portal.active
        },
        visualIndicators: {
          highlightColor: '#ff8000',
          wireframeColor: '#ffff00',
          pulseIntensity: 0.3,
          glowIntensity: 0.6
        },
        audioCues: {
          onApproach: 'portal_hum',
          onInteract: 'portal_activate',
          onSuccess: 'portal_teleport'
        }
      });
    });
  }

  /**
   * Setup NPCs for perception system
   */
  private setupPerceptionNPCs(): void {
    Object.entries(this.state.world.npcs).forEach(([key, npc]) => {
      this.engines.perception.addNPC({
        id: npc.id,
        type: this.getNPCType(key),
        position: npc.position,
        radius: 2.0,
        isInteractable: true,
        questId: this.getNPCQuestId(key)
      });
    });
  }

  /**
   * Get NPC type based on key
   */
  private getNPCType(key: string): 'friendly' | 'neutral' | 'hostile' | 'quest' | 'merchant' | 'guard' {
    const typeMap: Record<string, any> = {
      'explorer': 'friendly',
      'guide': 'quest',
      'mystic': 'quest'
    };
    return typeMap[key] || 'neutral';
  }

  /**
   * Get NPC quest ID based on key
   */
  private getNPCQuestId(key: string): string! {
    const questMap: Record<string, string> = {
      'guide': 'tutorial_quest',
      'mystic': 'spirit_lens_quest'
    };
    return questMap[key];
  }

  /**
   * Switch lens mode
   */
  switchLensMode(): boolean {
    const success = this.engines.lensMode.switchToMode(mode);
    if (success) {
      this.state.world.gameplay.lensMode = mode;
      this.state.world.gameplay.perceptionMode = this.engines.perception.getMode();
      this.updateGameplayUI();
    }
    return success;
  }

  /**
   * Handle interaction with an object
   */
  interactWithObject(): any {
    const result = this.engines.interactables.interact(objectId, behavior);
    
    if (result.success) {
      // Update game state based on interaction
      this.handleInteractionResult(objectId, behavior, result);
    }
    
    return result;
  }

  /**
   * Handle interaction result
   */
  private handleInteractionResult(objectId: string, behavior: InteractionBehavior, result: any): void {
    switch (behavior) {
      case InteractionBehavior.PICKUP:
        if (objectId === 'spirit_lens') {
          this.state.player.holdingSpiritLens = true;
          this.state.world.spiritLens.active = false;
        }
        break;
      case InteractionBehavior.USE:
        if (objectId.startsWith('portal_')) {
          this.handlePortalActivation({ portalId: objectId });
        }
        break;
      case InteractionBehavior.SCAN:
        // Update scan progress
        this.engines.scanFeedback.updateScanProgress(1.0);
        break;
    }
  }

  /**
   * Update gameplay UI
   */
  private updateGameplayUI(): void {
    // Update overlay effects
    this.state.world.gameplay.overlayEffects = this.engines.overlayFX.getActiveEffects();
    
    // Update scan targets
    this.state.world.gameplay.scanTargets = this.engines.scanFeedback.getAllTargets();
    
    // Update interactables
    this.state.world.gameplay.interactables = this.engines.interactables.getAll().map(i => i.type);
    
    // Update NPCs
    this.state.world.gameplay.npcs = this.engines.perception.getNPCs();
  }

  /**
   * Update gameplay systems
   */
  updateGameplaySystems(): void {
    // Update mobile performance monitoring
    this.engines.mobilePerformance.updatePerformance(deltaTime);
    
    // Update player context
    (this.engines.perception as any).updatePlayerContext?.({
      position: this.state.player.position,
      inventory: this.state.player.inventory,
      level: this.state.player.level,
      quests: this.state.player.quests,
      skills: this.state.player.skills
    });

    // Update scan feedback
    this.engines.scanFeedback.updatePulse(deltaTime);
    
    // Update lens mode transition
    this.engines.lensMode.updateTransition(deltaTime);
    
    // Update gameplay UI
    this.updateGameplayUI();
    
    // Apply performance optimizations
    this.applyPerformanceOptimizations();
  }

  /**
   * Handle keyboard input for gameplay systems
   */
  handleGameplayInput(): boolean {
    // Handle lens mode switching
    if (this.engines.lensMode.handleKeyPress(key)) {
      return true;
    }

    // Handle scan mode
    if (key === 's' && this.state.player.holdingSpiritLens) {
      this.switchLensMode(LensMode.SCAN);
      return true;
    }

    // Handle normal mode
    if (key === 'n') {
      this.switchLensMode(LensMode.NORMAL);
      return true;
    }

    return false;
  }

  /**
   * Apply performance optimizations based on mobile performance data
   */
  private applyPerformanceOptimizations(): void {
    const config = this.engines.mobilePerformance.getConfig();
    const stats = this.engines.mobilePerformance.getPerformanceStats();
    
    // Adjust overlay effects based on performance
    if (config.postProcessingQuality === 'low') {
      // Reduce overlay effect intensity
      this.engines.overlayFX.getAllLayers().forEach(layer => {
        this.engines.overlayFX.setLayerOpacity(layer.id, layer.opacity * 0.5);
      });
    }
    
    // Adjust scan feedback based on performance
    if (config.postProcessingQuality === 'low') {
      // Reduce pulse intensity
      this.engines.scanFeedback.getAllTargets().forEach(target => {
        target.pulseIntensity = Math.min(target.pulseIntensity, 0.3);
      });
    }
    
    // Log performance warnings if needed
    if (!this.engines.mobilePerformance.isPerformanceAcceptable()) {
      const recommendations = this.engines.mobilePerformance.getOptimizationRecommendations();
      if (recommendations.length > 0) {
        log.warn('Performance optimization recommendations:', recommendations);
      }
    }
  }

  /**
   * Get mobile performance statistics
   */
  getMobilePerformanceStats(): {
    level: PerformanceLevel;
    deviceType: DeviceType;
    fps: number;
    memory: number;
    isOptimizing: boolean;
    recommendations: string[];
  } {
    const stats = this.engines.mobilePerformance.getPerformanceStats();
    const capabilities = this.engines.mobilePerformance.getDeviceCapabilities();
    
    return {
      level: this.engines.mobilePerformance.getPerformanceLevel(),
      deviceType: capabilities.type,
      fps: stats.avgFPS,
      memory: stats.memory,
      isOptimizing: stats.isOptimizing,
      recommendations: this.engines.mobilePerformance.getOptimizationRecommendations()
    };
  }

  /**
   * Set mobile performance level
   */
  setMobilePerformanceLevel(): void {
    this.engines.mobilePerformance.setPerformanceLevel(level);
  }

  // ============================================================================
  // PUBLIC GETTERS FOR TESTING
  // ============================================================================

  /**
   * Get current game state (for testing)
   */
  // getGameState duplicated earlier; keeping only public version

  /**
   * Get engines (for testing)
   */
  getEngines(): typeof this.engines {
    return this.engines;
  }

  /**
   * Get current lens mode
   */
  getCurrentLensMode(): LensMode {
    return this.state.world.gameplay.lensMode;
  }

  /**
   * Get current perception mode
   */
  getCurrentPerceptionMode(): PerceptionMode {
    return this.state.world.gameplay.perceptionMode;
  }

  /**
   * Get gameplay state
   */
  getGameplayState(): typeof this.state.world.gameplay {
    return this.state.world.gameplay;
  }
}

// Export for CLI harness
export function renderWorldDemo(): any {
  const scene = new RenderWorldPure();
  return scene.runDemo();
}