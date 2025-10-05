/**
 * InteractableRegistryPure - Interactable Object Management System
 * 
 * Maps interactable objects to behaviors (pickup, talk, scan, etc.) and manages
 * interaction states, requirements, and feedback.
 * 
 * @module InteractableRegistryPure
 * @version 1.0.0
 * @license MIT
 */

export enum InteractableType {
  ITEM = 'item',
  NPC = 'npc',
  DOOR = 'door',
  CHEST = 'chest',
  LEVER = 'lever',
  TERMINAL = 'terminal',
  PORTAL = 'portal',
  CONTAINER = 'container',
  MACHINE = 'machine',
  DECORATION = 'decoration'
}

export enum InteractionBehavior {
  PICKUP = 'pickup',
  TALK = 'talk',
  SCAN = 'scan',
  USE = 'use',
  EXAMINE = 'examine',
  OPEN = 'open',
  CLOSE = 'close',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  CRAFT = 'craft',
  TRADE = 'trade',
  QUEST = 'quest'
}

export enum InteractionState {
  AVAILABLE = 'available',
  LOCKED = 'locked',
  USED = 'used',
  BROKEN = 'broken',
  HIDDEN = 'hidden',
  COOLDOWN = 'cooldown'
}

export interface InteractionRequirement {
  type: 'item' | 'level' | 'quest' | 'skill' | 'key' | 'custom';
  value: string | number;
  operator: 'equals' | 'greater_than' | 'less_than' | 'has' | 'not_has';
  description: string;
}

export interface InteractableObject {
  id: string;
  type: InteractableType;
  name: string;
  description: string;
  position: { x: number; y: number; z: number };
  radius: number;
  behaviors: InteractionBehavior[];
  state: InteractionState;
  requirements: InteractionRequirement[];
  cooldownDuration: number; // milliseconds
  lastUsed?: number; // timestamp
  metadata: Record<string, any>;
  visualIndicators: {
    highlightColor: string;
    wireframeColor: string;
    pulseIntensity: number;
    glowIntensity: number;
  };
  audioCues: {
    onApproach?: string;
    onInteract?: string;
    onSuccess?: string;
    onFailure?: string;
  };
}

export interface InteractionResult {
  success: boolean;
  message: string;
  data?: any;
  newState?: InteractionState;
  cooldownStart?: number;
  requirementsMet: boolean;
  missingRequirements: InteractionRequirement[];
}

export class InteractableRegistry {
  private interactables: Map<string, InteractableObject> = new Map();
  private playerContext: {
    position: { x: number; y: number; z: number };
    inventory: string[];
    level: number;
    quests: string[];
    skills: Record<string, number>;
  } = {
    position: { x: 0, y: 0, z: 0 },
    inventory: [],
    level: 1,
    quests: [],
    skills: {}
  };

  /**
   * Register an interactable object
   */
  register(interactable: InteractableObject): void {
    this.interactables.set(interactable.id, interactable);
  }

  /**
   * Unregister an interactable object
   */
  unregister(id: string): boolean {
    return this.interactables.delete(id);
  }

  /**
   * Get an interactable object by ID
   */
  get(id: string): InteractableObject | undefined {
    return this.interactables.get(id);
  }

  /**
   * Get all interactable objects
   */
  getAll(): InteractableObject[] {
    return Array.from(this.interactables.values());
  }

  /**
   * Get interactables within a certain radius of a position
   */
  getNearby(position: { x: number; y: number; z: number }, radius: number): InteractableObject[] {
    const nearby: InteractableObject[] = [];
    
    for (const interactable of this.interactables.values()) {
      const distance = this.calculateDistance(position, interactable.position);
      if (distance <= radius) {
        nearby.push(interactable);
      }
    }
    
    return nearby;
  }

  /**
   * Get interactables of a specific type
   */
  getByType(type: InteractableType): InteractableObject[] {
    return Array.from(this.interactables.values()).filter(i => i.type === type);
  }

  /**
   * Get interactables with a specific behavior
   */
  getByBehavior(behavior: InteractionBehavior): InteractableObject[] {
    return Array.from(this.interactables.values()).filter(i => 
      i.behaviors.includes(behavior)
    );
  }

  /**
   * Attempt to interact with an object
   */
  interact(id: string, behavior: InteractionBehavior): InteractionResult {
    const interactable = this.interactables.get(id);
    if (!interactable) {
      return {
        success: false,
        message: 'Interactable not found',
        requirementsMet: false,
        missingRequirements: []
      };
    }

    // Check if behavior is supported
    if (!interactable.behaviors.includes(behavior)) {
      return {
        success: false,
        message: `Behavior ${behavior} not supported by ${interactable.name}`,
        requirementsMet: false,
        missingRequirements: []
      };
    }

    // Check state
    if (interactable.state === InteractionState.LOCKED) {
      return {
        success: false,
        message: `${interactable.name} is locked`,
        requirementsMet: false,
        missingRequirements: []
      };
    }

    if (interactable.state === InteractionState.USED) {
      return {
        success: false,
        message: `${interactable.name} has already been used`,
        requirementsMet: false,
        missingRequirements: []
      };
    }

    if (interactable.state === InteractionState.BROKEN) {
      return {
        success: false,
        message: `${interactable.name} is broken`,
        requirementsMet: false,
        missingRequirements: []
      };
    }

    if (interactable.state === InteractionState.HIDDEN) {
      return {
        success: false,
        message: `${interactable.name} is not visible`,
        requirementsMet: false,
        missingRequirements: []
      };
    }

    // Check cooldown
    if (interactable.state === InteractionState.COOLDOWN) {
      const timeSinceLastUse = Date.now() - (interactable.lastUsed || 0);
      if (timeSinceLastUse < interactable.cooldownDuration) {
        const remainingTime = interactable.cooldownDuration - timeSinceLastUse;
        return {
          success: false,
          message: `${interactable.name} is on cooldown for ${Math.ceil(remainingTime / 1000)} seconds`,
          requirementsMet: false,
          missingRequirements: []
        };
      }
    }

    // Check requirements
    const requirementsCheck = this.checkRequirements(interactable.requirements);
    if (!requirementsCheck.met) {
      return {
        success: false,
        message: `Requirements not met for ${interactable.name}`,
        requirementsMet: false,
        missingRequirements: requirementsCheck.missing
      };
    }

    // Execute interaction
    const result = this.executeInteraction(interactable, behavior);
    
    // Update state if successful
    if (result.success) {
      interactable.lastUsed = Date.now();
      if (result.newState) {
        interactable.state = result.newState;
      }
    }

    return result;
  }

  /**
   * Check if requirements are met
   */
  private checkRequirements(requirements: InteractionRequirement[]): {
    met: boolean;
    missing: InteractionRequirement[];
  } {
    const missing: InteractionRequirement[] = [];
    
    for (const requirement of requirements) {
      if (!this.checkRequirement(requirement)) {
        missing.push(requirement);
      }
    }
    
    return {
      met: missing.length === 0,
      missing
    };
  }

  /**
   * Check a single requirement
   */
  private checkRequirement(requirement: InteractionRequirement): boolean {
    switch (requirement.type) {
      case 'item':
        return this.playerContext.inventory.includes(requirement.value as string);
      
      case 'level':
        return this.compareValues(
          this.playerContext.level,
          requirement.value as number,
          requirement.operator
        );
      
      case 'quest':
        return this.playerContext.quests.includes(requirement.value as string);
      
      case 'skill':
        const skillLevel = this.playerContext.skills[requirement.value as string] || 0;
        return this.compareValues(skillLevel, requirement.value as number, requirement.operator);
      
      case 'key':
        return this.playerContext.inventory.includes(requirement.value as string);
      
      case 'custom':
        // Custom requirements would need to be implemented by the game
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Compare values based on operator
   */
  private compareValues(actual: number, required: number, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return actual === required;
      case 'greater_than':
        return actual > required;
      case 'less_than':
        return actual < required;
      case 'has':
        return actual > 0;
      case 'not_has':
        return actual === 0;
      default:
        return false;
    }
  }

  /**
   * Execute the actual interaction
   */
  private executeInteraction(
    interactable: InteractableObject,
    behavior: InteractionBehavior
  ): InteractionResult {
    switch (behavior) {
      case InteractionBehavior.PICKUP:
        return this.executePickup(interactable);
      
      case InteractionBehavior.TALK:
        return this.executeTalk(interactable);
      
      case InteractionBehavior.SCAN:
        return this.executeScan(interactable);
      
      case InteractionBehavior.USE:
        return this.executeUse(interactable);
      
      case InteractionBehavior.EXAMINE:
        return this.executeExamine(interactable);
      
      case InteractionBehavior.OPEN:
        return this.executeOpen(interactable);
      
      case InteractionBehavior.CLOSE:
        return this.executeClose(interactable);
      
      case InteractionBehavior.ACTIVATE:
        return this.executeActivate(interactable);
      
      case InteractionBehavior.DEACTIVATE:
        return this.executeDeactivate(interactable);
      
      case InteractionBehavior.CRAFT:
        return this.executeCraft(interactable);
      
      case InteractionBehavior.TRADE:
        return this.executeTrade(interactable);
      
      case InteractionBehavior.QUEST:
        return this.executeQuest(interactable);
      
      default:
        return {
          success: false,
          message: `Unknown behavior: ${behavior}`,
          requirementsMet: true,
          missingRequirements: []
        };
    }
  }

  /**
   * Execute pickup behavior
   */
  private executePickup(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Picked up ${interactable.name}`,
      data: { itemId: interactable.id },
      newState: InteractionState.USED,
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute talk behavior
   */
  private executeTalk(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Talking to ${interactable.name}`,
      data: { npcId: interactable.id },
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute scan behavior
   */
  private executeScan(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Scanned ${interactable.name}`,
      data: { 
        scanData: interactable.metadata,
        type: interactable.type
      },
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute use behavior
   */
  private executeUse(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Used ${interactable.name}`,
      data: { interactableId: interactable.id },
      newState: InteractionState.USED,
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute examine behavior
   */
  private executeExamine(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Examined ${interactable.name}: ${interactable.description}`,
      data: { 
        description: interactable.description,
        metadata: interactable.metadata
      },
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute open behavior
   */
  private executeOpen(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Opened ${interactable.name}`,
      data: { interactableId: interactable.id },
      newState: InteractionState.USED,
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute close behavior
   */
  private executeClose(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Closed ${interactable.name}`,
      data: { interactableId: interactable.id },
      newState: InteractionState.AVAILABLE,
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute activate behavior
   */
  private executeActivate(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Activated ${interactable.name}`,
      data: { interactableId: interactable.id },
      newState: InteractionState.USED,
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute deactivate behavior
   */
  private executeDeactivate(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Deactivated ${interactable.name}`,
      data: { interactableId: interactable.id },
      newState: InteractionState.AVAILABLE,
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute craft behavior
   */
  private executeCraft(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Crafted at ${interactable.name}`,
      data: { interactableId: interactable.id },
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute trade behavior
   */
  private executeTrade(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Trading with ${interactable.name}`,
      data: { npcId: interactable.id },
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Execute quest behavior
   */
  private executeQuest(interactable: InteractableObject): InteractionResult {
    return {
      success: true,
      message: `Quest interaction with ${interactable.name}`,
      data: { 
        questId: interactable.metadata.questId,
        npcId: interactable.id
      },
      requirementsMet: true,
      missingRequirements: []
    };
  }

  /**
   * Update player context
   */
  updatePlayerContext(context: Partial<typeof this.playerContext>): void {
    this.playerContext = { ...this.playerContext, ...context };
  }

  /**
   * Get player context
   */
  getPlayerContext(): typeof this.playerContext {
    return { ...this.playerContext };
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    pos1: { x: number; y: number; z: number },
    pos2: { x: number; y: number; z: number }
  ): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Clear all interactables
   */
  clear(): void {
    this.interactables.clear();
  }

  /**
   * Get interactable count
   */
  getCount(): number {
    return this.interactables.size;
  }

  /**
   * Export interactable data
   */
  exportData(): Record<string, any> {
    const data: Record<string, any> = {
      playerContext: this.playerContext,
      interactables: {}
    };
    
    for (const [id, interactable] of this.interactables) {
      data.interactables[id] = interactable;
    }
    
    return data;
  }

  /**
   * Import interactable data
   */
  importData(data: Record<string, any>): void {
    this.clear();
    
    if (data.playerContext) {
      this.playerContext = { ...this.playerContext, ...data.playerContext };
    }
    
    if (data.interactables) {
      for (const [id, interactable] of Object.entries(data.interactables)) {
        this.interactables.set(id, interactable as InteractableObject);
      }
    }
  }
}

// Export default instance
export const interactableRegistry = new InteractableRegistry();