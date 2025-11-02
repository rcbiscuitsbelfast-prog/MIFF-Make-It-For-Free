/**
 * CharacterControllerPure Manager - Character Controller System
 *
 * Comprehensive character controller system with:
 * - Multi-character support
 * - Movement and physics
 * - Animation integration
 * - Performance optimization
 * - Cross-platform compatibility
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { Logger } from '../shared/logging';

const logger = Logger.create('CharacterControllerManager');

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface CharacterControllerConfig {
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
  enableMultiCharacterSupport: boolean;
  enableMovementPhysics: boolean;
  enableAnimationIntegration: boolean;
  enablePerformanceOptimization: boolean;
  enableCrossPlatformCompatibility: boolean;
  enableCollisionDetection: boolean;
  enableInputHandling: boolean;
  enableStateManagement: boolean;
  enableDebugMode: boolean;
  enableProfiling: boolean;
}

export interface CharacterController {
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
  type: ControllerType;
  characters: Character[];
  physics: PhysicsSettings;
  animation: AnimationSettings;
  input: InputSettings;
  performance: ControllerPerformance;
  analytics: ControllerAnalytics;
  version: string;
}

export interface Character {
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
  type: CharacterType;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  state: CharacterState;
  properties: CharacterProperties;
}

export interface Vector3 {
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
  x: number;
  y: number;
  z: number;
}

export interface CharacterState {
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
  current: StateType;
  previous: StateType;
  transitions: StateTransition[];
}

export interface StateTransition {
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
  from: StateType;
  to: StateType;
  condition: TransitionCondition;
  duration: number; // milliseconds
}

export interface TransitionCondition {
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
  type: ConditionType;
  value: any;
  operator: ConditionOperator;
}

export interface CharacterProperties {
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
  health: number;
  maxHealth: number;
  speed: number;
  jumpForce: number;
  mass: number;
  friction: number;
  bounce: number;
}

export interface PhysicsSettings {
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
  gravity: Vector3;
  airResistance: number;
  groundFriction: number;
  collisionLayers: string[];
}

export interface AnimationSettings {
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
  enabled: boolean;
  frameRate: number;
  blendTime: number;
  animations: AnimationClip[];
}

export interface AnimationClip {
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
  duration: number; // milliseconds
  loop: boolean;
  frames: AnimationFrame[];
}

export interface AnimationFrame {
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
  time: number; // milliseconds
}

export interface InputSettings {
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
  enabled: boolean;
  sensitivity: number;
  deadZone: number;
  mappings: InputMapping[];
}

export interface InputMapping {
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
  input: string;
  action: string;
  value: number;
}

export interface ControllerPerformance {
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
  totalCharacters: number;
  activeCharacters: number;
  averageFps: number;
  averageLatency: number; // milliseconds
  memoryUsage: number; // bytes
  cpuUsage: number; // 0-1
}

export interface ControllerAnalytics {
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
  totalControllers: number;
  activeControllers: number;
  totalCharacters: number;
  activeCharacters: number;
  totalMovements: number;
  totalAnimations: number;
  averagePerformance: number; // 0-100
  lastUpdated: Date;
}

export type ControllerType = '2d' | '3d' | 'top_down' | 'side_scroller' | 'custom';
export type ControllerStatus = 'active' | 'inactive' | 'error' | 'maintenance';
export type CharacterType = 'player' | 'npc' | 'enemy' | 'vehicle' | 'custom';
export type CharacterStatus = 'active' | 'inactive' | 'paused' | 'disabled';
export type StateType = 'idle' | 'walking' | 'running' | 'jumping' | 'falling' | 'attacking' | 'custom';
export type ConditionType = 'input' | 'timer' | 'collision' | 'animation' | 'custom';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'custom';

export class CharacterControllerManager {
  
  private config: CharacterControllerConfig;
  private controllers: Map<string, CharacterController> = new Map();
  private isInitialized: boolean = false;
  private startTime: Date;

  constructor(config?: Partial<CharacterControllerConfig>) {
    
    this.startTime = Date.now();

    this.config = {
      enableMultiCharacterSupport: true,
      enableMovementPhysics: true,
      enableAnimationIntegration: true,
      enablePerformanceOptimization: true,
      enableCrossPlatformCompatibility: true,
      enableCollisionDetection: true,
      enableInputHandling: true,
      enableStateManagement: true,
      enableDebugMode: false,
      enableProfiling: false,
      ...config
    };
  }

  /**
   * Initialize the Character Controller
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('CharacterControllerPure' ?? 'unknown', { context: { message: 'Character Controller already initialized' } });
      return;
    }

    try {
      logger.info('CharacterControllerPure', { context: { message: 'Initializing Character Controller...' } });

      // Initialize performance optimizer
      if (this.config.enablePerformanceOptimization ?? false) {
        // PerformanceOptimizer does not require initialization
      }

      // Initialize memory manager
      if (this.config.enableProfiling) {
        // MemoryManager initialization handled internally
      }

      this.isInitialized = true;
      logger.info('CharacterControllerPure', { context: { message: 'Character Controller initialized successfully' } });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      throw error;
    }
  }

  /**
   * Create a new character controller
   */
  async createController(controllerData: Omit<CharacterController, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'analytics'>): Promise<CharacterController> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller: CharacterController = {
        ...controllerData,
        id: this.generateControllerId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        analytics: {
          totalControllers: 0,
          activeControllers: 0,
          totalCharacters: 0,
          activeCharacters: 0,
          totalMovements: 0,
          totalAnimations: 0,
          averagePerformance: 0,
          lastUpdated: new Date()
        }
      };

      this.controllers.set(controller.id, controller);
      this.updateAnalytics();

      logger.info('Character controller created', { controllerId: controller.id, controllerName: controller.name });
      return controller;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      throw error;
    }
  }

  /**
   * Get a character controller by ID
   */
  getController(controllerId: string): CharacterController | null {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    return this.controllers.get(controllerId) || null;
  }

  /**
   * Update a character controller
   */
  async updateController(controllerId: string, updates: Partial<CharacterController>): Promise<CharacterController | null> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return null;
      }

      const updatedController: CharacterController = {
        ...controller,
        ...updates,
        updatedAt: Date.now(),
        version: this.incrementVersion(controller.version)
      };

      this.controllers.set(controllerId, updatedController);
      this.updateAnalytics();

      logger.info('Character controller updated', { controllerId, controllerName: updatedController.name });
      return updatedController;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      throw error;
    }
  }

  /**
   * Delete a character controller
   */
  async deleteController(controllerId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return false;
      }

      this.controllers.delete(controllerId);
      this.updateAnalytics();

      logger.info('Character controller deleted', { controllerId, controllerName: controller.name });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      throw error;
    }
  }

  /**
   * Get all character controllers
   */
  getAllControllers(): CharacterController[] {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    return Array.from(this.controllers.values());
  }

  /**
   * Get controllers by type
   */
  getControllersByType(type: ControllerType): CharacterController[] {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    return Array.from(this.controllers.values()).filter((controller: any) => controller.type === type);
  }

  /**
   * Get controllers by status
   */
  getControllersByStatus(status: ControllerStatus): CharacterController[] {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    return Array.from(this.controllers.values()).filter((controller: any) => controller.status === status);
  }

  /**
   * Add a character to a controller
   */
  async addCharacter(controllerId: string, characterData: Omit<Character, 'id'>): Promise<Character | null> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return null;
      }

      const character: Character = {
        ...characterData,
        id: this.generateCharacterId()
      };

      controller.characters.push(character);
      this.updateAnalytics();

      logger.info('Character added to controller', { controllerId, characterId: character.id, characterName: character.name });
      return character;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      return null;
    }
  }

  /**
   * Remove a character from a controller
   */
  async removeCharacter(controllerId: string, characterId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return false;
      }

      const characterIndex = controller.characters.findIndex(c => c.id === characterId);
      if (characterIndex === -1) {
        logger.warn('Character not found' ?? 'unknown', { controllerId, characterId });
        return false;
      }

      controller.characters.splice(characterIndex, 1);
      this.updateAnalytics();

      logger.info('Character removed from controller', { controllerId, characterId });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      return false;
    }
  }

  /**
   * Update character position
   */
  async updateCharacterPosition(controllerId: string, characterId: string, position: Vector3): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return false;
      }

      const character = controller.characters.find(c => c.id === characterId);
      if (!character) {
        logger.warn('Character not found' ?? 'unknown', { controllerId, characterId });
        return false;
      }

      character.position = position;
      this.updateAnalytics();

      logger.debug('Character position updated', { controllerId, characterId, position });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      return false;
    }
  }

  /**
   * Update character state
   */
  async updateCharacterState(controllerId: string, characterId: string, state: StateType): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return false;
      }

      const character = controller.characters.find(c => c.id === characterId);
      if (!character) {
        logger.warn('Character not found' ?? 'unknown', { controllerId, characterId });
        return false;
      }

      character.state.previous = character.state.current;
      character.state.current = state;
      this.updateAnalytics();

      logger.debug('Character state updated', { controllerId, characterId, state });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      return false;
    }
  }

  /**
   * Move character
   */
  async moveCharacter(controllerId: string, characterId: string, direction: Vector3, speed: number): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return false;
      }

      const character = controller.characters.find(c => c.id === characterId);
      if (!character) {
        logger.warn('Character not found' ?? 'unknown', { controllerId, characterId });
        return false;
      }

      // Calculate new position
      const deltaX = direction.x * speed;
      const deltaY = direction.y * speed;
      const deltaZ = direction.z * speed;

      character.position.x += deltaX;
      character.position.y += deltaY;
      character.position.z += deltaZ;

      // Update velocity
      character.velocity.x = deltaX;
      character.velocity.y = deltaY;
      character.velocity.z = deltaZ;

      this.updateAnalytics();

      logger.debug('Character moved', { controllerId, characterId, direction, speed });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      return false;
    }
  }

  /**
   * Jump character
   */
  async jumpCharacter(controllerId: string, characterId: string, force: number): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return false;
      }

      const character = controller.characters.find(c => c.id === characterId);
      if (!character) {
        logger.warn('Character not found' ?? 'unknown', { controllerId, characterId });
        return false;
      }

      // Apply jump force
      character.velocity.y += force;
      character.state.current = 'jumping';

      this.updateAnalytics();

      logger.debug('Character jumped', { controllerId, characterId, force });
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      return false;
    }
  }

  /**
   * Get character by ID
   */
  getCharacter(controllerId: string, characterId: string): Character | null {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return null;
      }

      return controller.characters.find(c => c.id === characterId) || null;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      return null;
    }
  }

  /**
   * Get characters by type
   */
  getCharactersByType(controllerId: string, type: CharacterType): Character[] {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) {
        logger.warn('Controller not found' ?? 'unknown', { controllerId });
        return [];
      }

      return controller.characters.filter((c: any) => c.type === type);

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error occurred");
      return [];
    }
  }

  /**
   * Generate a unique controller ID
   */
  private generateControllerId(): string {
    return `controller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique character ID
   */
  private generateCharacterId(): string {
    return `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2!]) + 1;
    return `${parts[0!]}.${parts[1!]}.${patch}`;
  }

  /**
   * Update analytics
   */
  private updateAnalytics(): void {
    const controllers = Array.from(this.controllers.values());
    const totalCharacters = controllers.reduce((sum: any, c: any) => sum + c.characters.length, 0);
    const activeCharacters = controllers.reduce((sum: any, c: any) => sum + c.characters.filter((ch: any) => ch.status === 'active').length, 0);

    for (const controller of controllers) {
      controller.analytics = {
        totalControllers: controllers.length,
        activeControllers: controllers.filter((c: any) => c.status === 'active').length,
        totalCharacters: controller.characters.length,
        activeCharacters: controller.characters.filter((ch: any) => ch.status === 'active').length,
        totalMovements: controller.analytics.totalMovements,
        totalAnimations: controller.analytics.totalAnimations,
        averagePerformance: 85, // Simulate performance score
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Get system statistics
   */
  getStatistics(): {
    totalControllers: number;
    activeControllers: number;
    controllersByType: Record<ControllerType, number>;
    controllersByStatus: Record<ControllerStatus, number>;
    totalCharacters: number;
    totalMovements: number;
    totalAnimations: number;
    uptime: number;
  } {
    if (!this.isInitialized) {
      throw new Error('Character Controller not initialized');
    }

    const controllers = Array.from(this.controllers.values());
    const activeControllers = controllers.filter((c: any) => c.status === 'active');
    const totalCharacters = controllers.reduce((sum: any, c: any) => sum + c.characters.length, 0);
    const totalMovements = controllers.reduce((sum: any, c: any) => sum + c.analytics.totalMovements, 0);
    const totalAnimations = controllers.reduce((sum: any, c: any) => sum + c.analytics.totalAnimations, 0);

    const controllersByType: Record<ControllerType, number> = {
      '2d': 0,
      '3d': 0,
      'top_down': 0,
      'side_scroller': 0,
      'custom': 0
    };

    const controllersByStatus: Record<ControllerStatus, number> = {
      active: 0,
      inactive: 0,
      error: 0,
      maintenance: 0
    };

    for (const controller of controllers) {
      controllersByType[controller.type]++;
      controllersByStatus[controller.status]++;
    }

    return {
      totalControllers: controllers.length,
      activeControllers: activeControllers.length,
      controllersByType,
      controllersByStatus,
      totalCharacters,
      totalMovements,
      totalAnimations,
      uptime: new Date() - this.startTime.getTime()
    };
  }

  /**
   * Destroy the Character Controller
   */
  async destroy(): Promise<void> {
    logger.info('CharacterControllerPure', { context: { message: 'Destroying Character Controller...' } });

    this.controllers.clear();
    this.isInitialized = false;

    logger.info('CharacterControllerPure', { context: { message: 'Character Controller destroyed' } });
  }
}

// Export default instance
export const characterControllerManager = new CharacterControllerManager();
export default characterControllerManager;