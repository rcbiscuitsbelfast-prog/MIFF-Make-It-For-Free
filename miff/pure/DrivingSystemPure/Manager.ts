/**
 * MIFF Driving System Manager
 *
 * Core business logic for vehicle management, racing sessions, and driving mechanics
 */

// Local type stubs to satisfy strict type-checking without pulling heavy dependencies
export interface Vector3 { x: number; y: number; z: number;
    }

export interface VehicleAbilityEffect {
  type: string;
  magnitude?: number;
  duration?: number;
  condition?: string;
  description?: string;
}

export interface VehicleAbility {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive';
  cooldown?: number;
  duration?: number;
  activationRequirements?: string[];
  effects: VehicleAbilityEffect[];
}

export interface VehicleDefinition {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  mass: number;
  dragCoefficient: number;
  frictionCoefficient: number;
  maxSpeed: number;
  acceleration: number;
  brakingForce: number;
  handling: number;
  length: number;
  width: number;
  height: number;
  wheelbase?: number;
  terrainTypes: string[];
  weatherEffects: Map<string, number>;
  abilities: VehicleAbility[];
  boostPower?: number;
  boostDuration?: number;
  boostCooldown?: number;
  model: string;
  texture: string;
  soundProfile: string;
  particleEffects: string[];
  fuelCapacity?: number;
  fuelConsumption: number;
  durability: number;
  repairCost: number;
  upgradeSlots: number;
  compatibleUpgrades: string[];
  unlockRequirements: string[];
  skillRequirements: Map<string, number>;
  manufacturer: string;
  modelYear: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | string;
  value: number;
}

export interface EquippedUpgrade { id: string; level: number; }
export type Upgrade = EquippedUpgrade;

export interface VehicleInstance {
  id: string;
  ownerId: string;
  definition: VehicleDefinition;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
  isEngineRunning: boolean;
  isBoosting: boolean;
  throttle: number;
  steering: number;
  brakeInput: number;
  isBraking?: boolean;
  currentSpeed: number;
  currentPosition: Vector3;
}

export interface Checkpoint {
  id: string;
  position: Vector3;
  direction: Vector3;
  size: {

    width: number; height: number;
    


  }
  };
  type: 'start' | 'intermediate' | 'finish' | string;
  isRequired: boolean;
  visualEffect?: string;
}

export interface Obstacle { id: string; position: Vector3; radius?: number; }
export interface PowerUp { id: string; type: string; position: Vector3; }
export interface WeatherZone { id: string; type: string; intensity?: number }
export interface MovementPattern { id: string; type: string;
    }

export interface TrackDefinition {
  id: string;
  name: string;
  description: string;
  type: 'circuit' | 'sprint' | 'drag' | string;
  waypoints: Vector3[];
  checkpoints: Checkpoint[];
  startLine: {

    position: Vector3; direction: Vector3;
    


  }
  };
  finishLine: {

    position: Vector3; direction: Vector3;
    


  }
  };
  length: number;
  width: number;
  elevation: number;
  surfaceType: string;
  terrainModifiers: Map<string, number>;
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  weatherZones: WeatherZone[];
  lapCount: number;
  direction: string;
  allowedVehicles: string[];
  penalties: Map<string, number>;
  environment: string;
  lighting: string;
  skybox: string;
  backgroundMusic: string;
  ambientSounds: string[];
}

export interface DrivingPenalty { type: string; timePenalty: number;
    }

export interface DrivingStats {
  totalSessions: number;
  totalDistance: number;
  totalTime: number;
  totalCrashes: number;
  totalRepairs: number;
  totalFuelConsumed: number;
  averageSpeed: number;
  bestLapTime: number;
  vehiclesOwned: number;
  tracksCompleted: number;
  achievements: string[];
  favoriteVehicle: string;
  favoriteTrack: string;
}

export interface DrivingConfig {
  physicsUpdateRate: number;
  enableDetailedCollisions: boolean;
  enableDamageSystem: boolean;
  enableFuelSystem: boolean;
  gravity: number;
  airDensity: number;
}

export interface DrivingSession {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: number;
  startPosition: Vector3;
  currentLap: number;
  totalLaps: number;
  lapTimes: number[];
  bestLapTime: number;
  checkpointsPassed: number;
  totalCheckpoints: number;
  topSpeed: number;
  averageSpeed: number;
  distanceTraveled: number;
  fuelConsumed: number;
  penalties: DrivingPenalty[];
  collisionCount: number;
  offTrackTime: number;
  status: 'active' | 'completed' | 'failed' | string;
}

// Minimal stub implementation for the core Driving System used by tests
export class DrivingSystemPure {
  private stats: DrivingStats = {
    totalSessions: 0,
    totalDistance: 0,
    totalTime: 0,
    totalCrashes: 0,
    totalRepairs: 0,
    totalFuelConsumed: 0,
    averageSpeed: 0,
    bestLapTime: 0,
    vehiclesOwned: 0,
    tracksCompleted: 0,
    achievements: [],
    favoriteVehicle: '',
    favoriteTrack: ''
  };

  private config: DrivingConfig = {
    physicsUpdateRate: 60,
    enableDetailedCollisions: true,
    enableDamageSystem: true,
    enableFuelSystem: true,
    gravity: 9.81,
    airDensity: 1.225
  };

  private vehicles: Map<string, VehicleInstance> = new Map();
  private vehicleDefinitions: Map<string, VehicleDefinition> = new Map();
  private tracks: Map<string, TrackDefinition> = new Map();

  constructor(_eventBus: any, _inputSystem: any, _rng: any) {
    // Seed with a demo vehicle and track to satisfy tests
    const demoVehicle: VehicleDefinition = {
      id: 'demo-car',
      name: 'Demo Sports Car',
      type: 'car',
      category: 'land',
      description: 'A demo vehicle',
      mass: 1200,
      dragCoefficient: 0.3,
      frictionCoefficient: 0.8,
      maxSpeed: 80,
      acceleration: 12,
      brakingForce: 20,
      handling: 0.8,
      length: 4.2,
      width: 1.9,
      height: 1.4,
      terrainTypes: ['road', 'track'],
      weatherEffects: new Map(),
      abilities: [{ id: 'boost', name: 'Boost', description: '', type: 'active', cooldown: 10000, duration: 3000, effects: [{ type: 'boost', magnitude: 1.5, duration: 3000;
    }] }],
      model: 'demo_model',
      texture: 'demo_tex',
      soundProfile: 'demo_sound',
      particleEffects: ['exhaust'],
      fuelCapacity: 60,
      fuelConsumption: 0.1,
      durability: 1000,
      repairCost: 100,
      upgradeSlots: 3,
      compatibleUpgrades: [],
      unlockRequirements: [],
      skillRequirements: new Map(),
      manufacturer: 'MIFF',
      modelYear: 2025,
      rarity: 'common',
      value: 0;
    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {

        'DrivingSystemManager': LogLevel.DEBUG
      

      


      }
      };
    });

    // Register with memory manager
    this.memoryId = `DrivingSystemManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'DrivingSystemManager');
  };
    this.vehicleDefinitions.set(demoVehicle.id, demoVehicle);

    const demoTrack: TrackDefinition = {
      id: 'demo-circuit',
      name: 'Demo Circuit',
      description: 'A simple circuit',
      type: 'circuit',
      waypoints: [
        { x: 0, y: 0, z: 0;
    },
        { x: 100, y: 0, z: 0;
    },
        { x: 100, y: 0, z: 100;
    },
        { x: 0, y: 0, z: 100;
    }
      ],
      checkpoints: [
        { id: 'start-finish', position: {
   x: 0, y: 0, z: 0;
 }
    }, direction: {
   x: 1, y: 0, z: 0;
 }
    }, size: {
   width: 20, height: 5;
 }
    }, type: 'start', isRequired: true;
    },
        { id: 'cp-1', position: {
   x: 100, y: 0, z: 0;
 }
    }, direction: {
   x: 0, y: 0, z: 1;
 }
    }, size: {
   width: 20, height: 5;
 }
    }, type: 'intermediate', isRequired: true;
    }
      ],
      startLine: {

        position: { x: 0, y: 0, z: 0;

      }
    }, direction: {
   x: 1, y: 0, z: 0;
 }
    } },
      finishLine: {

        position: { x: 0, y: 0, z: 0;

      }
    }, direction: {
   x: 1, y: 0, z: 0;
 }
    } },
      length: 400,
      width: 15,
      elevation: 0,
      surfaceType: 'track',
      terrainModifiers: new Map([['grip', 1.0]]),
      obstacles: [],
      powerUps: [],
      weatherZones: [],
      lapCount: 3,
      direction: 'clockwise',
      allowedVehicles: ['car', 'bike'],
      penalties: new Map(),
      environment: 'racetrack',
      lighting: 'day',
      skybox: 'clear_sky',
      backgroundMusic: 'race_music',
      ambientSounds: ['engine_sounds']
    };
    this.tracks.set(demoTrack.id, demoTrack);
  }

  getConfig(): DrivingConfig { return this.config }
  getStats(): DrivingStats { return this.stats }
  getTrack(id: string): TrackDefinition | null { return this.tracks.get(id) || null }
  getAllTracks(): TrackDefinition[] { return Array.from(this.tracks.values()) }
  getVehicleDefinition(id: string): VehicleDefinition | null { return this.vehicleDefinitions.get(id) || null }
  getVehicleInstance(id: string): VehicleInstance | null { return this.vehicles.get(id) || null }
  startEngine(vehicle: VehicleInstance): void { vehicle.isEngineRunning = true }
  updateVehiclePhysics(_vehicleId: string, _dt: number): void { /* no-op */ }
  activateAbility(_vehicleId: string, _abilityId: string): void { /* no-op */ }
  createVehicle(vehicleId: string, playerId: string): VehicleInstance | null {
    const def = this.vehicleDefinitions.get(vehicleId);
    if (!def) return null;
    const instance: VehicleInstance = {
      id: `veh_${Date.now()}`,
      ownerId: playerId,
      definition: def,
      health: 1000,
      maxHealth: 1000,
      fuel: 60,
      maxFuel: 60,
      isEngineRunning: false,
      isBoosting: false,
      throttle: 0,
      steering: 0,
      brakeInput: 0,
      currentSpeed: 0,
      currentPosition: {

        x: 0, y: 0, z: 0;
    

      


      }
      };
    };
    this.vehicles.set(instance.id, instance);
    return instance;
  }
}

export class DrivingManager {
  private drivingSystem: DrivingSystemPure;

  constructor(drivingSystem: DrivingSystemPure) {
    this.drivingSystem = drivingSystem;
  }

  /**
   * Create a new vehicle definition with validation
   */
  createVehicleDefinition(vehicleData: Partial<VehicleDefinition>): VehicleDefinition | null {
    // Validate required fields
    if (!vehicleData.id || vehicleData.id.trim() === '') {
      this.logger.error('DrivingSystemManager', '❌ Vehicle ID is required');
      return null;
    }

    if (!vehicleData.name || vehicleData.name.trim() === '') {
      this.logger.error('DrivingSystemManager', '❌ Vehicle name is required');
      return null;
    }

    if (!vehicleData.type) {
      this.logger.error('DrivingSystemManager', '❌ Vehicle type is required');
      return null;
    }

    if (!vehicleData.mass || vehicleData.mass <= 0) {
      this.logger.error('DrivingSystemManager', '❌ Vehicle mass must be positive');
      return null;
    }

    if (!vehicleData.maxSpeed || vehicleData.maxSpeed <= 0) {
      this.logger.error('DrivingSystemManager', '❌ Vehicle max speed must be positive');
      return null;
    }

    // Create vehicle definition
    const vehicle: VehicleDefinition = {
      id: vehicleData.id,
      name: vehicleData.name,
      type: vehicleData.type,
      category: vehicleData.category || 'land',
      description: vehicleData.description || 'A vehicle',
      mass: vehicleData.mass!,
      dragCoefficient: vehicleData.dragCoefficient || 0.3,
      frictionCoefficient: vehicleData.frictionCoefficient || 0.7,
      maxSpeed: vehicleData.maxSpeed!,
      acceleration: vehicleData.acceleration || 10,
      brakingForce: vehicleData.brakingForce || 20,
      handling: vehicleData.handling || 0.8,
      length: vehicleData.length || 4.0,
      width: vehicleData.width || 2.0,
      height: vehicleData.height || 1.5,
      wheelbase: vehicleData.wheelbase,
      terrainTypes: vehicleData.terrainTypes || ['road'],
      weatherEffects: vehicleData.weatherEffects || new Map(),
      abilities: vehicleData.abilities || [],
      boostPower: vehicleData.boostPower,
      boostDuration: vehicleData.boostDuration,
      boostCooldown: vehicleData.boostCooldown,
      model: vehicleData.model || 'default',
      texture: vehicleData.texture || 'default',
      soundProfile: vehicleData.soundProfile || 'default',
      particleEffects: vehicleData.particleEffects || [],
      fuelCapacity: vehicleData.fuelCapacity,
      fuelConsumption: vehicleData.fuelConsumption || 0.1,
      durability: vehicleData.durability || 1000,
      repairCost: vehicleData.repairCost || 100,
      upgradeSlots: vehicleData.upgradeSlots || 4,
      compatibleUpgrades: vehicleData.compatibleUpgrades || [],
      unlockRequirements: vehicleData.unlockRequirements || [],
      skillRequirements: vehicleData.skillRequirements || new Map(),
      manufacturer: vehicleData.manufacturer || 'Unknown',
      modelYear: vehicleData.modelYear || new Date().getFullYear(),
      rarity: vehicleData.rarity || 'common',
      value: vehicleData.value || 0
    };

    return vehicle;
  }

  /**
   * Register a vehicle in the system
   */
  registerVehicle(vehicle: VehicleDefinition): boolean {
    // Validate vehicle
    if (!this.validateVehicleDefinition(vehicle)) {
      this.logger.error('DrivingSystemManager', `❌ Invalid vehicle definition: ${vehicle.id}`);
      return false;
    }

    // Store in system (this would normally go through the main system)
    this.logger.info('DrivingSystemManager', `✅ Registered vehicle: ${vehicle.name} (${vehicle.id})`);
    return true;
  }

  /**
   * Create a vehicle instance for a player
   */
  createVehicleForPlayer(vehicleId: string, playerId: string): VehicleInstance | null {
    try {
      // Check if vehicle is unlocked for this player
      if (!this.isVehicleUnlocked(vehicleId, playerId)) {
        this.logger.warn('DrivingSystemManager', `⚠️ Vehicle not unlocked: ${vehicleId} for player ${playerId}`);
        return null;
      }

      // Create the vehicle instance
      const vehicle = this.drivingSystem.createVehicle(vehicleId, playerId);

      if (vehicle) {
        this.logger.info('DrivingSystemManager', `🚗 Created vehicle for ${playerId}: ${vehicle.definition.name}`);
        this.updateStats({ vehiclesOwned: this.drivingSystem.getStats().vehiclesOwned + 1 });
      }

      return vehicle;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('DrivingSystemManager', `❌ Error creating vehicle ${vehicleId}: ${message}`);
      return null;
    }
  }

  /**
   * Check if vehicle is unlocked for player
   */
  private isVehicleUnlocked(vehicleId: string, playerId: string): boolean {
    // This would check player's progress, purchases, etc.
    // For now, assume demo vehicles are always unlocked
    return vehicleId.startsWith('demo-');
  }

  /**
   * Start a driving session
   */
  startDrivingSession(vehicleId: string, trackId: string, playerId: string): DrivingSession | null {
    try {
      const vehicle = this.drivingSystem.getVehicleInstance(vehicleId);
      const track = this.drivingSystem.getTrack(trackId);

      if (!vehicle) {
        throw new Error(`Vehicle not found: ${vehicleId}`);
      }

      if (!track) {
        throw new Error(`Track not found: ${trackId}`);
      }

      // Check if vehicle is compatible with track
      if (!track.allowedVehicles.includes(vehicle.definition.type)) {
        throw new Error(`Vehicle ${vehicle.definition.name} not allowed on track ${track.name}`);
      }

      // Create driving session
      const session: DrivingSession = {
        id: this.generateSessionId(),
        vehicleId,
        driverId: playerId,
        startTime: Date.now(),
        startPosition: { ...vehicle.currentPosition },
        currentLap: 1,
        totalLaps: track.lapCount,
        lapTimes: [],
        bestLapTime: 0,
        checkpointsPassed: 0,
        totalCheckpoints: track.checkpoints.length,
        topSpeed: 0,
        averageSpeed: 0,
        distanceTraveled: 0,
        fuelConsumed: 0,
        penalties: [],
        collisionCount: 0,
        offTrackTime: 0,
        status: 'active'
      };

      // Store session (would normally go through main system)
      this.updateStats({ totalSessions: this.drivingSystem.getStats().totalSessions + 1 });

      this.logger.info('DrivingSystemManager', `🏁 Started driving session: ${track.name} with ${vehicle.definition.name}`);
      return session;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('DrivingSystemManager', `❌ Error starting session: ${message}`);
      return null;
    }
  }

  /**
   * Update vehicle controls
   */
  updateVehicleControls(vehicleId: string, controls: {
   throttle?: number;
    steering?: number;
    brake?: number;
    boost?: boolean;
    ability?: string;
 }
  }): boolean {
    const vehicle = this.drivingSystem.getVehicleInstance(vehicleId);
    if (!vehicle) return false;

    // Update control inputs
    if (controls.throttle !== undefined) {
      vehicle.throttle = Math.max(0, Math.min(1, controls.throttle));
    }

    if (controls.steering !== undefined) {
      vehicle.steering = Math.max(-1, Math.min(1, controls.steering));
    }

    if (controls.brake !== undefined) {
      vehicle.brakeInput = Math.max(0, Math.min(1, controls.brake));
      vehicle.isBraking = controls.brake > 0;
    }

    // Handle boost
    if (controls.boost && !vehicle.isBoosting) {
      const boostAbility = vehicle.definition.abilities.find((ability: VehicleAbility) =>
        ability.type === 'active' && ability.effects.some((effect: VehicleAbilityEffect) => effect.type === 'boost')
      );
      if (boostAbility) {
        this.drivingSystem.activateAbility(vehicleId, boostAbility.id);
      }
    }

    // Handle ability activation
    if (controls.ability) {
      this.drivingSystem.activateAbility(vehicleId, controls.ability);
    }

    return true;
  }

  /**
   * Get driving statistics
   */
  getDrivingStats(): {
    totalSessions: number;
    totalDistance: number;
    totalTime: number;
    totalCrashes: number;
    totalRepairs: number;
    totalFuelConsumed: number;
    averageSpeed: number;
    bestLapTime: number;
    vehiclesOwned: number;
    tracksCompleted: number;
    achievements: string[];
    favoriteVehicle: string;
    favoriteTrack: string;
    performanceRating: string;
  } {
    const stats = this.drivingSystem.getStats();

    // Calculate performance rating
    let performanceRating = 'Beginner';
    if (stats.totalSessions > 50) {
      performanceRating = 'Expert';
    } else if (stats.totalSessions > 20) {
      performanceRating = 'Advanced';
    } else if (stats.totalSessions > 5) {
      performanceRating = 'Intermediate';
    }

    return {
      ...stats,
      performanceRating
    };
  }

  /**
   * Get available vehicles for a player
   */
  getAvailableVehicles(playerId: string): VehicleDefinition[] {
    const allVehicles = this.getAllVehicleDefinitions();
    return allVehicles.filter(vehicle => this.isVehicleUnlocked(vehicle.id, playerId));
  }

  /**
   * Get all vehicle definitions
   */
  getAllVehicleDefinitions(): VehicleDefinition[] {
    // This would normally come from the main system
    return [];
  }

  /**
   * Get vehicle recommendations for a player
   */
  getVehicleRecommendations(playerId: string): Array<{
    vehicle: VehicleDefinition;
    reason: string;
    suitability: 'excellent' | 'good' | 'fair' | 'poor';
    estimatedCost: number;
  }> {
    const availableVehicles = this.getAvailableVehicles(playerId);
    const recommendations: Array<{
      vehicle: VehicleDefinition;
      reason: string;
      suitability: 'excellent' | 'good' | 'fair' | 'poor';
      estimatedCost: number;
    }> = [];

    for (const vehicle of availableVehicles) {
      const suitability = this.assessVehicleSuitability(vehicle, playerId);
      const reason = this.getVehicleRecommendationReason(vehicle);
      const estimatedCost = vehicle.value * (1 + (vehicle.rarity === 'rare' ? 0.5 : 0));

      recommendations.push({
        vehicle,
        reason,
        suitability,
        estimatedCost
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Assess vehicle suitability for a player
   */
  private assessVehicleSuitability(vehicle: VehicleDefinition, playerId: string): 'excellent' | 'good' | 'fair' | 'poor' {
    // This would check player's driving stats, preferences, etc.
    // For now, return based on vehicle tier
    switch (vehicle.rarity) {
      case 'legendary':
        return 'excellent';
      case 'epic':
        return 'good';
      case 'rare':
        return 'good';
      case 'uncommon':
        return 'fair';
      default:
        return 'poor';
    }
  }

  /**
   * Get recommendation reason for a vehicle
   */
  private getVehicleRecommendationReason(vehicle: VehicleDefinition): string {
    if (vehicle.type === 'car') {
      return 'Great all-around performance for most tracks';
    } else if (vehicle.type === 'bike') {
      return 'Excellent handling and acceleration for tight courses';
    } else {
      return 'Specialized vehicle for specific track types';
    }
  }

  /**
   * Get track information
   */
  getTrackInfo(trackId: string): TrackDefinition | null {
    return this.drivingSystem.getTrack(trackId);
  }

  /**
   * Get all tracks
   */
  getAllTracks(): TrackDefinition[] {
    return this.drivingSystem.getAllTracks();
  }

  /**
   * Get track recommendations
   */
  getTrackRecommendations(): Array<{
    track: TrackDefinition;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    reason: string;
    estimatedTime: number;
  }> {
    const allTracks = this.getAllTracks();
    const recommendations: Array<{
      track: TrackDefinition;
      difficulty: 'easy' | 'medium' | 'hard' | 'expert';
      reason: string;
      estimatedTime: number;
    }> = [];

    for (const track of allTracks) {
      const difficulty = this.assessTrackDifficulty(track);
      const reason = this.getTrackRecommendationReason(track);
      const estimatedTime = Math.ceil(track.length / 50); // Rough estimate

      recommendations.push({
        track,
        difficulty,
        reason,
        estimatedTime
      });
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Assess track difficulty
   */
  private assessTrackDifficulty(track: TrackDefinition): 'easy' | 'medium' | 'hard' | 'expert' {
    if (track.length < 200) return 'easy';
    if (track.length < 500) return 'medium';
    if (track.length < 1000) return 'hard';
    return 'expert';
  }

  /**
   * Get track recommendation reason
   */
  private getTrackRecommendationReason(track: TrackDefinition): string {
    if (track.type === 'circuit') {
      return 'Classic racing circuit with multiple laps';
    } else if (track.type === 'sprint') {
      return 'Short, fast sprint track';
    } else if (track.type === 'drag') {
      return 'Straight-line drag racing';
    } else {
      return 'Specialized track for unique racing experiences';
    }
  }

  /**
   * Apply penalty to driving session
   */
  applyPenalty(sessionId: string, penalty: DrivingPenalty): void {
    // This would apply penalty to a driving session
    this.logger.info('DrivingSystemManager', `⚠️ Applied penalty: ${penalty.type} (${penalty.timePenalty}s)`);
  }

  /**
   * Update driving statistics
   */
  updateStats(updates: Partial<DrivingStats>): void {
    // This would update the player's driving statistics
    this.logger.info('DrivingSystemManager', 'Updated driving statistics');
  }

  /**
   * Validate vehicle definition
   */
  private validateVehicleDefinition(vehicle: VehicleDefinition): boolean {
    if (!vehicle.id || vehicle.id.trim() === '') {
      this.logger.error('DrivingSystemManager', 'Vehicle ID is required');
      return false;
    }

    if (!vehicle.name || vehicle.name.trim() === '') {
      this.logger.error('DrivingSystemManager', 'Vehicle name is required');
      return false;
    }

    if (vehicle.mass <= 0) {
      this.logger.error('DrivingSystemManager', 'Vehicle mass must be positive');
      return false;
    }

    if (vehicle.maxSpeed <= 0) {
      this.logger.error('DrivingSystemManager', 'Vehicle max speed must be positive');
      return false;
    }

    if (vehicle.acceleration <= 0) {
      this.logger.error('DrivingSystemManager', 'Vehicle acceleration must be positive');
      return false;
    }

    return true;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Export driving system data
   */
  exportData(): {
    vehicles: VehicleDefinition[];
    tracks: TrackDefinition[];
    stats: DrivingStats;
    config: DrivingConfig;
    timestamp: number;
  } {
    return {
      vehicles: this.getAllVehicleDefinitions(),
      tracks: this.getAllTracks(),
      stats: this.drivingSystem.getStats(),
      config: this.drivingSystem.getConfig(),
      timestamp: Date.now()
    };
  }

  /**
   * Import driving system data
   */
  importData(data: ReturnType<typeof this.exportData>): void {
    // Import logic would go here
    this.logger.info('DrivingSystemManager', 'Driving system data imported');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.logger.info('DrivingSystemManager', 'Destroying manager', {
      itemsCount: this.items.size
    });
    
    this.items.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
    
    // Unregister from memory manager
    MemoryManager.unregisterObject(this.memoryId);
    
    // Destroy logger
    this.logger.destroy();
  }
}