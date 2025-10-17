/**
 * PerceptionFilterLayer - Contextual Overlay System
 * 
 * Provides contextual overlays for scan mode, danger zones, NPC auras, and other
 * perception-based visual enhancements that help players understand their environment.
 * 
 * @module PerceptionFilterLayer
 * @version 1.0.0
 * @license MIT
 */

import { OverlayFXManager, OverlayEffectType, OverlayEffectConfig, overlayFXManager } from '../OverlayFXPure';

export enum PerceptionMode {
  NORMAL = 'normal',
  SCAN = 'scan',
  DANGER = 'danger',
  INTERACT = 'interact',
  QUEST = 'quest',
  STEALTH = 'stealth'
}

export interface PerceptionConfig {
  mode: PerceptionMode;
  intensity: number; // 0-1
  duration?: number; // milliseconds
  autoSwitch?: boolean; // automatically switch based on context
  contextTriggers?: ContextTrigger[];
}

export interface ContextTrigger {
  type: 'proximity' | 'combat' | 'quest' | 'interaction' | 'stealth';
  threshold: number;
  targetMode: PerceptionMode;
  cooldown?: number; // milliseconds
}

export interface NPCInfo {
  id: string;
  type: 'friendly' | 'neutral' | 'hostile' | 'quest' | 'merchant' | 'guard';
  position: { x: number; y: number; z: number };
  radius: number;
  isInteractable: boolean;
  questId?: string;
}

export interface InteractableInfo {
  id: string;
  type: 'item' | 'door' | 'chest' | 'lever' | 'terminal' | 'portal';
  position: { x: number; y: number; z: number };
  radius: number;
  isHighlighted: boolean;
  isLocked: boolean;
  requiredItem?: string;
}

export class PerceptionFilterManager {
  private overlayManager: OverlayFXManager;
  private currentMode: PerceptionMode = PerceptionMode.NORMAL;
  private config: PerceptionConfig;
  private npcs: Map<string, NPCInfo> = new Map();
  private interactables: Map<string, InteractableInfo> = new Map();
  private playerPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private isInCombat: boolean = false;
  private activeQuests: Set<string> = new Set();

  constructor(overlayManager: OverlayFXManager) {
    this.overlayManager = overlayManager;
    this.config = {
      mode: PerceptionMode.NORMAL,
      intensity: 1.0,
      autoSwitch: true,
      contextTriggers: [
        {
          type: 'combat',
          threshold: 0.5,
          targetMode: PerceptionMode.DANGER,
          cooldown: 2000
        },
        {
          type: 'quest',
          threshold: 0.3,
          targetMode: PerceptionMode.QUEST,
          cooldown: 1000
        }
      ]
    };
  }

  /**
   * Set the current perception mode
   */
  setMode(mode: PerceptionMode): void {
    this.currentMode = mode;
    this.config.mode = mode;
    this.applyModeEffects();
  }

  /**
   * Get the current perception mode
   */
  getMode(): PerceptionMode {
    return this.currentMode;
  }

  /**
   * Update player position for proximity calculations
   */
  updatePlayerPosition(position: { x: number; y: number; z: number }): void {
    this.playerPosition = position;
    this.updateContextualOverlays();
  }

  /**
   * Add an NPC to the perception system
   */
  addNPC(npc: NPCInfo): void {
    this.npcs.set(npc.id, npc);
    this.updateContextualOverlays();
  }

  /**
   * Remove an NPC from the perception system
   */
  removeNPC(npcId: string): void {
    this.npcs.delete(npcId);
    this.overlayManager.removeEffect(`npc_aura_${npcId}`, OverlayEffectType.VIGNETTE);
    this.updateContextualOverlays();
  }

  /**
   * Add an interactable object
   */
  addInteractable(interactable: InteractableInfo): void {
    this.interactables.set(interactable.id, interactable);
    this.updateContextualOverlays();
  }

  /**
   * Remove an interactable object
   */
  removeInteractable(interactableId: string): void {
    this.interactables.delete(interactableId);
    this.overlayManager.removeEffect(`interactable_${interactableId}`, OverlayEffectType.CHROMATIC_ABERRATION);
    this.updateContextualOverlays();
  }

  /**
   * Set combat state
   */
  setCombatState(inCombat: boolean): void {
    this.isInCombat = inCombat;
    this.updateContextualOverlays();
  }

  /**
   * Add active quest
   */
  addActiveQuest(questId: string): void {
    this.activeQuests.add(questId);
    this.updateContextualOverlays();
  }

  /**
   * Remove active quest
   */
  removeActiveQuest(questId: string): void {
    this.activeQuests.delete(questId);
    this.updateContextualOverlays();
  }

  /**
   * Apply effects based on current mode
   */
  private applyModeEffects(): void {
    // Clear existing mode effects
    this.overlayManager.removeEffect('perception_mode', OverlayEffectType.CHROMATIC_ABERRATION);
    this.overlayManager.removeEffect('perception_mode', OverlayEffectType.SCAN_LINES);
    this.overlayManager.removeEffect('perception_mode', OverlayEffectType.COLOR_SHIFT);
    this.overlayManager.removeEffect('perception_mode', OverlayEffectType.VIGNETTE);

    switch (this.currentMode) {
      case SCAN:
        this.applyScanMode();
        break;
      case DANGER:
        this.applyDangerMode();
        break;
      case INTERACT:
        this.applyInteractMode();
        break;
      case QUEST:
        this.applyQuestMode();
        break;
      case STEALTH:
        this.applyStealthMode();
        break;
      case NORMAL:
      default:
        this.applyNormalMode();
        break;
    }
  }

  /**
   * Apply scan mode effects
   */
  private applyScanMode(): void {
    this.overlayManager.createLayer('perception_mode', 'Perception Mode', 20);
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.CHROMATIC_ABERRATION,
      intensity: 0.4,
      color: '#00ff00'
    });
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.SCAN_LINES,
      intensity: 0.6
    });
  }

  /**
   * Apply danger mode effects
   */
  private applyDangerMode(): void {
    this.overlayManager.createLayer('perception_mode', 'Perception Mode', 20);
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.COLOR_SHIFT,
      intensity: 0.5,
      color: '#ff0000'
    });
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.DISTORTION,
      intensity: 0.3
    });
  }

  /**
   * Apply interact mode effects
   */
  private applyInteractMode(): void {
    this.overlayManager.createLayer('perception_mode', 'Perception Mode', 20);
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.CHROMATIC_ABERRATION,
      intensity: 0.2,
      color: '#0080ff'
    });
  }

  /**
   * Apply quest mode effects
   */
  private applyQuestMode(): void {
    this.overlayManager.createLayer('perception_mode', 'Perception Mode', 20);
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.COLOR_SHIFT,
      intensity: 0.3,
      color: '#ffff00'
    });
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.VIGNETTE,
      intensity: 0.2,
      color: '#ffff00',
      radius: 0.9
    });
  }

  /**
   * Apply stealth mode effects
   */
  private applyStealthMode(): void {
    this.overlayManager.createLayer('perception_mode', 'Perception Mode', 20);
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.BLUR,
      intensity: 0.3
    });
    this.overlayManager.addEffect('perception_mode', {
      type: OverlayEffectType.COLOR_SHIFT,
      intensity: 0.4,
      color: '#800080'
    });
  }

  /**
   * Apply normal mode (no special effects)
   */
  private applyNormalMode(): void {
    // Normal mode has no special overlay effects
  }

  /**
   * Update contextual overlays based on current state
   */
  private updateContextualOverlays(): void {
    if (!this.config.autoSwitch) return;

    // Check for combat
    if (this.isInCombat && this.currentMode !== PerceptionMode.DANGER) {
      this.setMode(PerceptionMode.DANGER);
      return;
    }

    // Check for quest-related NPCs nearby
    const nearbyQuestNPCs = this.getNearbyNPCs(5.0).filter((npc: any) => 
      npc.type === 'quest' || this.activeQuests.has(npc.questId || '')
    );
    
    if (nearbyQuestNPCs.length > 0 && this.currentMode !== PerceptionMode.QUEST) {
      this.setMode(PerceptionMode.QUEST);
      return;
    }

    // Check for interactables nearby
    const nearbyInteractables = this.getNearbyInteractables(3.0);
    if (nearbyInteractables.length > 0 && this.currentMode !== PerceptionMode.INTERACT) {
      this.setMode(PerceptionMode.INTERACT);
      return;
    }

    // Return to normal if no special context
    if (this.currentMode !== PerceptionMode.NORMAL && 
        !this.isInCombat && 
        nearbyQuestNPCs.length === 0 && 
        nearbyInteractables.length === 0) {
      this.setMode(PerceptionMode.NORMAL);
    }
  }

  /**
   * Get NPCs within a certain radius
   */
  private getNearbyNPCs(radius: number): NPCInfo[] {
    const nearby: NPCInfo[] = [];
    
    for (const npc of this.npcs.values()) {
      const distance = this.calculateDistance(this.playerPosition, npc.position);
      if (distance <= radius) {
        nearby.push(npc);
      }
    }
    
    return nearby;
  }

  /**
   * Get interactables within a certain radius
   */
  private getNearbyInteractables(radius: number): InteractableInfo[] {
    const nearby: InteractableInfo[] = [];
    
    for (const interactable of this.interactables.values()) {
      const distance = this.calculateDistance(this.playerPosition, interactable.position);
      if (distance <= radius) {
        nearby.push(interactable);
      }
    }
    
    return nearby;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get current configuration
   */
  getConfig(): PerceptionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<PerceptionConfig>): void {
    this.config = { ...this.config, ...updates };
    this.applyModeEffects();
  }

  /**
   * Get all active NPCs
   */
  getNPCs(): NPCInfo[] {
    return Array.from(this.npcs.values());
  }

  /**
   * Get all interactables
   */
  getInteractables(): InteractableInfo[] {
    return Array.from(this.interactables.values());
  }
}

// Export default instance
export const perceptionFilterManager = new PerceptionFilterManager(overlayFXManager);