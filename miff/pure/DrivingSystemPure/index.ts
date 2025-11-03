/**
 * DrivingSystemPure
 *
 * Lightweight but fully functional driving simulation core used by MIFF tests.
 * Provides in-memory management of vehicle definitions, vehicle instances,
 * physics updates, ability handling, track metadata, and driving statistics.
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface VehicleEffect {
  id?: string;
  type: string;
  magnitude: number;
  duration: number;
  condition?: string;
  description?: string;
}

export interface VehicleAbility {
  id: string;
  name: string;
  description?: string;
  type: 'active' | 'passive';
  cooldown: number;
  duration: number;
  activationRequirements?: string[];
  effects: VehicleEffect[];
}

export interface Upgrade {
  id: string;
  name: string;
  type: string;
  description?: string;
  modifiers: Record<string, number>;
}

export interface ActiveEffectState {
  id: string;
  type: string;
  magnitude: number;
  expiresAt: number;
}

export interface VehicleDefinition {
  id: string;
  name: string;
  type: string;
  category?: string;
  description?: string;
  mass: number;
  dragCoefficient: number;
  frictionCoefficient: number;
  maxSpeed: number;
  acceleration: number;
  brakingForce: number;
  handling: number;
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  terrainTypes: string[];
  weatherEffects: Map<string, number>;
  abilities: VehicleAbility[];
  boostPower?: number;
  boostDuration?: number;
  boostCooldown?: number;
  model?: string;
  texture?: string;
  soundProfile?: string;
  particleEffects?: string[];
  fuelCapacity?: number;
  fuelConsumption?: number;
  durability?: number;
  repairCost?: number;
  upgradeSlots?: number;
  compatibleUpgrades?: string[];
  unlockRequirements?: string[];
  skillRequirements?: Map<string, number>;
  manufacturer?: string;
  modelYear?: number;
  rarity?: string;
  value?: number;
}

export interface VehicleInstance {
  id: string;
  definition: VehicleDefinition;
  ownerId: string;
  health: number;
  maxHealth: number;
  damageTaken: number;
  currentPosition: Vector3;
  currentVelocity: Vector3;
  currentRotation: Vector3;
  currentSpeed: number;
  throttle: number;
  brakeInput: number;
  steering: number;
  fuel: number;
  maxFuel: number;
  fuelConsumed: number;
  isEngineRunning: boolean;
  isBoosting: boolean;
  boostMultiplier: number;
  boostEndTime: number;
  activeEffects: Map<string, ActiveEffectState>;
  abilityCooldowns: Map<string, number>;
  currentTerrain: string;
  terrainModifiers: Map<string, number>;
  rpm: number;
  gear: number;
  sessionId?: string;
}

export interface Checkpoint {
  id: string;
  position: Vector3;
  direction: Vector3;
  size: { width: number; height: number };
  type: string;
  isRequired?: boolean;
  visualEffect?: string;
}

export interface Obstacle {
  id: string;
  position: Vector3;
  size: Vector3;
  type: string;
  effect?: string;
  damage?: number;
}

export interface PowerUp {
  id: string;
  type: string;
  duration: number;
  position: Vector3;
  effect?: string;
}

export interface WeatherZone {
  id: string;
  type: string;
  intensity: number;
  effect: string;
  duration: number;
  area: Vector3[];
}

export interface MovementPattern {
  id: string;
  name: string;
  type: string;
  points: Vector3[];
}

export interface DrivingPenalty {
  type: string;
  timePenalty: number;
  description?: string;
}

export interface TrackLine {
  position: Vector3;
  direction: Vector3;
}

export interface TrackDefinition {
  id: string;
  name: string;
  description?: string;
  type: 'circuit' | 'sprint' | 'drag' | string;
  waypoints: Vector3[];
  checkpoints: Checkpoint[];
  startLine: TrackLine;
  finishLine: TrackLine;
  length: number;
  width: number;
  elevation: number;
  surfaceType: string;
  terrainModifiers: Map<string, number>;
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  weatherZones: WeatherZone[];
  lapCount: number;
  direction: 'clockwise' | 'counter-clockwise' | string;
  allowedVehicles: string[];
  penalties: Map<string, number>;
  environment?: string;
  lighting?: string;
  skybox?: string;
  backgroundMusic?: string;
  ambientSounds?: string[];
}

export interface DrivingSession {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: Date;
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
  completed: boolean;
}

export interface DrivingConfig {
  physicsUpdateRate: number;
  enableDetailedCollisions: boolean;
  enableDamageSystem: boolean;
  enableFuelSystem: boolean;
  gravity: number;
  airDensity: number;
  collisionDamageMultiplier: number;
  fuelConsumptionMultiplier: number;
}

export interface DrivingStats {
  totalSessions: number;
  totalDistance: number;
  totalTime: number;
  totalCrashes: number;
  totalRepairs: number;
  totalFuelConsumed: number;
  vehiclesOwned: number;
  averageSpeed: number;
}

export interface EventBusLike {
  publish?(event: string, payload: unknown): void;
  emit?(event: string, payload: unknown): void;
  on?(event: string, handler: (...args: unknown[]) => void): void;
}

export interface InputSystemLike {
  /** Optional stub for input polling */
  getAxis?(_axis: string): number;
  /** Optional stub for action checking */
  isActionActive?(_actionId: string): boolean;
}

export interface RNGLike {
  nextFloat(): number;
}

const DEFAULT_TERRAIN_EFFECTS: Record<string, number> = {
  ice: -0.35,
  gravel: -0.2,
  sand: -0.25,
  mud: -0.4,
  rain: -0.15,
  snow: -0.2
};

export class DrivingSystemPure {
  public rng: RNGLike | null;

  private readonly eventBus: EventBusLike | null;
  private readonly inputSystem: InputSystemLike | null;
  private config: DrivingConfig;
  private stats: DrivingStats;
  private readonly vehicleDefinitions: Map<string, VehicleDefinition> = new Map();
  private readonly trackDefinitions: Map<string, TrackDefinition> = new Map();
  private readonly vehicles: Map<string, VehicleInstance> = new Map();
  private vehicleCounter = 0;

  constructor(eventBus?: EventBusLike | null, inputSystem?: InputSystemLike | null, rng?: RNGLike | null) {
    this.eventBus = eventBus ?? null;
    this.inputSystem = inputSystem ?? null;
    this.rng = rng ?? null;
    this.config = this.createDefaultConfig();
    this.stats = this.createInitialStats();
    this.initializeDefaultVehicles();
    this.initializeDefaultTracks();
  }

  /** Retrieve a snapshot of the current configuration */
  getConfig(): DrivingConfig {
    return { ...this.config };
  }

  /** Update configuration with partial overrides */
  updateConfig(partialConfig: Partial<DrivingConfig>): void {
    this.config = {
      ...this.config,
      ...partialConfig,
      physicsUpdateRate: partialConfig.physicsUpdateRate && partialConfig.physicsUpdateRate > 0
        ? partialConfig.physicsUpdateRate
        : this.config.physicsUpdateRate
    };
  }

  /** Retrieve a snapshot of driving statistics */
  getStats(): DrivingStats {
    return { ...this.stats };
  }

  /** Replace or merge driving statistics */
  updateStats(partialStats: Partial<DrivingStats>): void {
    this.stats = {
      ...this.stats,
      ...partialStats
    };

    if (this.stats.totalTime > 0) {
      this.stats.averageSpeed = this.stats.totalDistance / this.stats.totalTime;
    } else {
      this.stats.averageSpeed = 0;
    }
  }

  /** Reset internal statistics */
  resetStats(): void {
    this.stats = this.createInitialStats();
  }

  /** Retrieve a vehicle definition by ID */
  getVehicleDefinition(id: string): VehicleDefinition | null {
    const definition = this.vehicleDefinitions.get(id);
    return definition ? this.cloneVehicleDefinition(definition) : null;
  }

  /** Retrieve all vehicle definitions */
  getAllVehicleDefinitions(): VehicleDefinition[] {
    return Array.from(this.vehicleDefinitions.values()).map(def => this.cloneVehicleDefinition(def));
  }

  /** Retrieve a vehicle instance by internal ID */
  getVehicleInstance(id: string): VehicleInstance | null {
    return this.vehicles.get(id) ?? null;
  }

  /** Create a new vehicle instance for an owner */
  createVehicle(vehicleId: string, ownerId: string): VehicleInstance | null {
    const definitionTemplate = this.vehicleDefinitions.get(vehicleId);
    if (!definitionTemplate) {
      return null;
    }

    const definition = this.cloneVehicleDefinition(definitionTemplate);
    const maxHealth = definition.durability ?? 1000;
    const maxFuel = definition.fuelCapacity ?? 60;

    const vehicle: VehicleInstance = {
      id: this.generateVehicleId(vehicleId),
      definition,
      ownerId,
      health: maxHealth,
      maxHealth,
      damageTaken: 0,
      currentPosition: { x: 0, y: 0, z: 0 },
      currentVelocity: { x: 0, y: 0, z: 0 },
      currentRotation: { x: 0, y: 0, z: 0 },
      currentSpeed: 0,
      throttle: 0,
      brakeInput: 0,
      steering: 0,
      fuel: maxFuel,
      maxFuel,
      fuelConsumed: 0,
      isEngineRunning: false,
      isBoosting: false,
      boostMultiplier: 1,
      boostEndTime: 0,
      activeEffects: new Map(),
      abilityCooldowns: new Map(),
      currentTerrain: 'road',
      terrainModifiers: new Map(),
      rpm: 0,
      gear: 0,
      sessionId: undefined
    };

    this.vehicles.set(vehicle.id, vehicle);
    this.stats.vehiclesOwned = this.vehicles.size;

    this.publishEvent('driving:vehicle-created', {
      vehicleId: vehicle.id,
      vehicleType: definition.id,
      ownerId
    });

    return vehicle;
  }

  /** Start a vehicle's engine */
  startEngine(vehicle: VehicleInstance | null): boolean {
    const resolved = this.resolveVehicle(vehicle);
    if (!resolved) {
      return false;
    }

    if (resolved.health <= 0 || resolved.fuel <= 0) {
      return false;
    }

    resolved.isEngineRunning = true;
    resolved.throttle = Math.max(resolved.throttle, 0.15);
    resolved.gear = Math.max(resolved.gear, 1);
    this.stats.totalSessions += 1;

    this.publishEvent('driving:engine-started', {
      vehicleId: resolved.id,
      vehicleType: resolved.definition.id,
      ownerId: resolved.ownerId
    });

    return true;
  }

  /** Stop the vehicle's engine */
  stopEngine(vehicle: VehicleInstance | null): void {
    const resolved = this.resolveVehicle(vehicle);
    if (!resolved) {
      return;
    }

    resolved.isEngineRunning = false;
    resolved.throttle = 0;

    this.publishEvent('driving:engine-stopped', {
      vehicleId: resolved.id,
      vehicleType: resolved.definition.id
    });
  }

  /** Update vehicle physics for a delta time (seconds) */
  updateVehiclePhysics(vehicleId: string, deltaTime: number): void {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      return;
    }

    if (vehicle.isEngineRunning && vehicle.fuel <= 0) {
      vehicle.isEngineRunning = false;
      vehicle.throttle = 0;
      this.publishEvent('driving:engine-stopped', {
        vehicleId: vehicle.id,
        vehicleType: vehicle.definition.id,
        reason: 'out-of-fuel'
      });
    }

    const dt = Math.max(0, deltaTime);
    if (dt === 0) {
      return;
    }

    // Clean up expired effects
    const now = Date.now();
    let effectsChanged = false;
    for (const [effectId, effect] of vehicle.activeEffects) {
      if (effect.expiresAt > 0 && effect.expiresAt <= now) {
        vehicle.activeEffects.delete(effectId);
        effectsChanged = true;
      }
    }

    if (effectsChanged || vehicle.activeEffects.size === 0) {
      vehicle.isBoosting = vehicle.activeEffects.size > 0;
      vehicle.boostMultiplier = vehicle.isBoosting
        ? Math.max(1, Math.max(...Array.from(vehicle.activeEffects.values()).map(e => e.magnitude)))
        : 1;
    }

    const maxSpeed = vehicle.definition.maxSpeed > 0 ? vehicle.definition.maxSpeed : 0;
    const acceleration = vehicle.definition.acceleration;
    const brakingForce = vehicle.definition.brakingForce;
    const dragCoefficient = vehicle.definition.dragCoefficient;

    // Engine-driven acceleration
    if (vehicle.isEngineRunning && vehicle.fuel > 0) {
      const throttle = this.clamp(vehicle.throttle, 0, 1);
      const boostMultiplier = this.clamp(vehicle.boostMultiplier, 1, 3);
      const appliedAcceleration = acceleration * throttle * boostMultiplier;
      vehicle.currentVelocity.x += appliedAcceleration * dt;
      vehicle.currentVelocity.z += appliedAcceleration * dt * 0.1;
    }

    // Apply braking
    const brakeInput = this.clamp(vehicle.brakeInput, 0, 1);
    if (brakeInput > 0) {
      vehicle.currentVelocity.x = Math.max(0, vehicle.currentVelocity.x - brakingForce * brakeInput * dt);
    }

    // Aerodynamic drag
    if (vehicle.currentVelocity.x > 0) {
      const drag = dragCoefficient * vehicle.currentVelocity.x * dt;
      vehicle.currentVelocity.x = Math.max(0, vehicle.currentVelocity.x - drag);
    }

    // Terrain modifiers
    const terrain = vehicle.currentTerrain || 'road';
    const terrainEffect = this.getTerrainEffect(terrain);
    vehicle.terrainModifiers.set(terrain, terrainEffect);
    if (terrainEffect < 0) {
      vehicle.currentVelocity.x = Math.max(0, vehicle.currentVelocity.x * (1 + terrainEffect));
    }

    // Clamp to max speed
    if (maxSpeed > 0) {
      vehicle.currentVelocity.x = Math.min(vehicle.currentVelocity.x, maxSpeed);
    }

    vehicle.currentSpeed = Math.max(0, vehicle.currentVelocity.x);

    // Integrate position (simple forward integration along X)
    vehicle.currentPosition.x += vehicle.currentVelocity.x * dt;

    // Simple steering updates rotation around Y axis
    if (vehicle.steering !== 0) {
      const handling = this.clamp(vehicle.definition.handling, 0, 1);
      vehicle.currentRotation.y += vehicle.steering * handling * dt * 45;
    }

    // Gravity and vertical motion for crash detection
    vehicle.currentVelocity.y -= this.config.gravity * dt;
    vehicle.currentPosition.y += vehicle.currentVelocity.y * dt;

    if (vehicle.currentVelocity.y < -15 && vehicle.currentPosition.y <= 10) {
      this.crashVehicle(vehicle);
      vehicle.currentPosition.y = 0;
      vehicle.currentVelocity.y = 0;
    }

    if (vehicle.currentPosition.y <= 0) {
      if (vehicle.currentVelocity.y < -15) {
        this.crashVehicle(vehicle);
      }
      vehicle.currentPosition.y = 0;
      vehicle.currentVelocity.y = 0;
    }

    // Update RPM and gear estimation
    if (vehicle.currentSpeed > 0) {
      vehicle.rpm = 800 + vehicle.currentSpeed * 200;
      vehicle.gear = Math.max(1, Math.min(6, Math.ceil(vehicle.currentSpeed / 15)));
    } else {
      vehicle.rpm = vehicle.isEngineRunning ? 900 : 0;
      vehicle.gear = vehicle.isEngineRunning ? 1 : 0;
    }

    // Fuel consumption
    if (this.config.enableFuelSystem && vehicle.isEngineRunning && vehicle.fuel > 0) {
      const baseConsumption = vehicle.definition.fuelConsumption ?? 0.1;
      const speedFactor = maxSpeed > 0 ? vehicle.currentSpeed / maxSpeed : 0;
      const consumption = baseConsumption * (0.4 + speedFactor) * dt * this.config.fuelConsumptionMultiplier * (vehicle.isBoosting ? 1.5 : 1);

      if (consumption > 0) {
        vehicle.fuel = Math.max(0, vehicle.fuel - consumption);
        vehicle.fuelConsumed += consumption;
        this.stats.totalFuelConsumed += consumption;

        if (vehicle.fuel <= 0) {
          vehicle.fuel = 0;
          vehicle.isEngineRunning = false;
          this.publishEvent('driving:engine-stopped', {
            vehicleId: vehicle.id,
            vehicleType: vehicle.definition.id,
            reason: 'out-of-fuel'
          });
        }
      }
    }

    // Update global stats
    this.stats.totalDistance += vehicle.currentSpeed * dt;
    this.stats.totalTime += dt;
    this.stats.averageSpeed = this.stats.totalTime > 0 ? this.stats.totalDistance / this.stats.totalTime : 0;
  }

  /** Activate a vehicle ability */
  activateAbility(vehicleId: string, abilityId: string): boolean {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      return false;
    }

    const ability = vehicle.definition.abilities.find(a => a.id === abilityId);
    if (!ability) {
      return false;
    }

    const now = Date.now();
    const lastUsed = vehicle.abilityCooldowns.get(ability.id);
    if (lastUsed && now - lastUsed < ability.cooldown) {
      return false;
    }

    if (ability.activationRequirements?.includes('speed-above-20') && vehicle.currentSpeed < 20) {
      return false;
    }

    vehicle.isBoosting = ability.type === 'active';
    const primaryEffect = ability.effects[0];
    const magnitude = primaryEffect?.magnitude ?? 1.2;
    vehicle.boostMultiplier = Math.max(1, magnitude);
    vehicle.boostEndTime = now + ability.duration;

    vehicle.activeEffects.set(ability.id, {
      id: ability.id,
      type: primaryEffect?.type ?? 'speed',
      magnitude,
      expiresAt: vehicle.boostEndTime
    });

    vehicle.abilityCooldowns.set(ability.id, now);

    this.publishEvent('driving:ability-activated', {
      vehicleId: vehicle.id,
      abilityId: ability.id,
      ownerId: vehicle.ownerId
    });

    return true;
  }

  /** Apply damage to a vehicle */
  damageVehicle(vehicle: VehicleInstance | null, amount: number): void {
    const resolved = this.resolveVehicle(vehicle);
    if (!resolved || amount <= 0) {
      return;
    }

    const damage = Math.max(0, amount * this.config.collisionDamageMultiplier);
    resolved.health = Math.max(0, resolved.health - damage);
    resolved.damageTaken += damage;

    if (resolved.health <= 0) {
      resolved.isEngineRunning = false;
    }

    this.publishEvent('driving:vehicle-damaged', {
      vehicleId: resolved.id,
      vehicleType: resolved.definition.id,
      damage,
      currentHealth: resolved.health,
      maxHealth: resolved.maxHealth
    });
  }

  /** Repair a vehicle */
  repairVehicle(vehicle: VehicleInstance | null, amount: number): void {
    const resolved = this.resolveVehicle(vehicle);
    if (!resolved || amount <= 0) {
      return;
    }

    const repair = Math.min(amount, resolved.maxHealth - resolved.health);
    resolved.health += repair;
    this.stats.totalRepairs += repair;
  }

  /** Handle a crash event for the vehicle */
  crashVehicle(vehicle: VehicleInstance | null): void {
    const resolved = this.resolveVehicle(vehicle);
    if (!resolved) {
      return;
    }

    const crashDamage = Math.max(resolved.maxHealth * 0.1, 50);
    this.damageVehicle(resolved, crashDamage);
    resolved.isEngineRunning = false;
    resolved.currentSpeed = 0;
    resolved.currentVelocity = { x: 0, y: 0, z: 0 };

    this.stats.totalCrashes += 1;

    this.publishEvent('driving:vehicle-crashed', {
      vehicleId: resolved.id,
      vehicleType: resolved.definition.id,
      position: { ...resolved.currentPosition }
    });
  }

  /** Retrieve a track definition */
  getTrack(id: string): TrackDefinition | null {
    const track = this.trackDefinitions.get(id);
    return track ? this.cloneTrackDefinition(track) : null;
  }

  /** Retrieve all track definitions */
  getAllTracks(): TrackDefinition[] {
    return Array.from(this.trackDefinitions.values()).map(track => this.cloneTrackDefinition(track));
  }

  /** Register or override a vehicle definition */
  registerVehicleDefinition(definition: VehicleDefinition): void {
    this.vehicleDefinitions.set(definition.id, this.cloneVehicleDefinition(definition));
  }

  /** Register or override a track definition */
  registerTrack(definition: TrackDefinition): void {
    this.trackDefinitions.set(definition.id, this.cloneTrackDefinition(definition));
  }

  private createDefaultConfig(): DrivingConfig {
    return {
      physicsUpdateRate: 60,
      enableDetailedCollisions: true,
      enableDamageSystem: true,
      enableFuelSystem: true,
      gravity: 9.81,
      airDensity: 1.225,
      collisionDamageMultiplier: 1,
      fuelConsumptionMultiplier: 1
    };
  }

  private createInitialStats(): DrivingStats {
    return {
      totalSessions: 0,
      totalDistance: 0,
      totalTime: 0,
      totalCrashes: 0,
      totalRepairs: 0,
      totalFuelConsumed: 0,
      vehiclesOwned: 0,
      averageSpeed: 0
    };
  }

  private initializeDefaultVehicles(): void {
    const demoCar: VehicleDefinition = {
      id: 'demo-car',
      name: 'Demo Sports Car',
      type: 'car',
      category: 'land',
      description: 'Balanced sports car ideal for demonstrations.',
      mass: 1200,
      dragCoefficient: 0.32,
      frictionCoefficient: 0.85,
      maxSpeed: 80,
      acceleration: 12,
      brakingForce: 25,
      handling: 0.8,
      length: 4.4,
      width: 1.9,
      height: 1.2,
      terrainTypes: ['road', 'track'],
      weatherEffects: new Map([
        ['rain', -0.2],
        ['snow', -0.3]
      ]),
      abilities: [
        {
          id: 'nitro-boost',
          name: 'Nitro Boost',
          description: 'Temporarily increases acceleration and top speed.',
          type: 'active',
          cooldown: 5000,
          duration: 2500,
          activationRequirements: ['speed-above-20'],
          effects: [
            {
              id: 'nitro-boost-speed',
              type: 'speed',
              magnitude: 1.5,
              duration: 2500,
              description: 'Increases speed and acceleration while active.'
            }
          ]
        }
      ],
      boostPower: 2.0,
      boostDuration: 2500,
      boostCooldown: 5000,
      model: 'demo_sports_car',
      texture: 'demo_car_texture',
      soundProfile: 'sports_engine',
      particleEffects: ['exhaust_smoke'],
      fuelCapacity: 60,
      fuelConsumption: 0.15,
      durability: 1000,
      repairCost: 300,
      upgradeSlots: 3,
      compatibleUpgrades: ['engine', 'tires', 'aero'],
      unlockRequirements: [],
      skillRequirements: new Map([
        ['driving', 1]
      ]),
      manufacturer: 'MIFF Motors',
      modelYear: 2025,
      rarity: 'common',
      value: 85000
    };

    const demoBike: VehicleDefinition = {
      id: 'demo-bike',
      name: 'Demo Racing Bike',
      type: 'bike',
      category: 'land',
      description: 'Lightweight racing bike with excellent handling.',
      mass: 300,
      dragCoefficient: 0.28,
      frictionCoefficient: 0.9,
      maxSpeed: 70,
      acceleration: 14,
      brakingForce: 18,
      handling: 0.95,
      length: 2.1,
      width: 0.7,
      height: 1.1,
      terrainTypes: ['road', 'track'],
      weatherEffects: new Map([
        ['rain', -0.25]
      ]),
      abilities: [
        {
          id: 'lean-control',
          name: 'Lean Stabilizer',
          description: 'Improves handling temporarily.',
          type: 'active',
          cooldown: 4000,
          duration: 2000,
          activationRequirements: ['speed-above-20'],
          effects: [
            {
              id: 'lean-control-handling',
              type: 'handling',
              magnitude: 1.3,
              duration: 2000,
              description: 'Improves handling during tight turns.'
            }
          ]
        }
      ],
      boostPower: 1.5,
      boostDuration: 2000,
      boostCooldown: 4000,
      model: 'demo_racing_bike',
      texture: 'bike_texture',
      soundProfile: 'bike_engine',
      particleEffects: ['dust_trail'],
      fuelCapacity: 20,
      fuelConsumption: 0.08,
      durability: 600,
      repairCost: 120,
      upgradeSlots: 2,
      compatibleUpgrades: ['tires', 'engine'],
      unlockRequirements: [],
      skillRequirements: new Map([
        ['driving', 1]
      ]),
      manufacturer: 'MIFF Motors',
      modelYear: 2025,
      rarity: 'common',
      value: 45000
    };

    this.registerVehicleDefinition(demoCar);
    this.registerVehicleDefinition(demoBike);
  }

  private initializeDefaultTracks(): void {
    const demoCircuit: TrackDefinition = {
      id: 'demo-circuit',
      name: 'Demo Circuit',
      description: 'Standard demonstration racing circuit.',
      type: 'circuit',
      waypoints: [
        { x: 0, y: 0, z: 0 },
        { x: 150, y: 0, z: 0 },
        { x: 150, y: 0, z: 150 },
        { x: 0, y: 0, z: 150 }
      ],
      checkpoints: [
        {
          id: 'start-finish',
          position: { x: 0, y: 0, z: 0 },
          direction: { x: 1, y: 0, z: 0 },
          size: { width: 20, height: 5 },
          type: 'start',
          isRequired: true,
          visualEffect: 'checkpoint_glow'
        },
        {
          id: 'midpoint',
          position: { x: 150, y: 0, z: 75 },
          direction: { x: 0, y: 0, z: 1 },
          size: { width: 16, height: 5 },
          type: 'intermediate',
          isRequired: true
        }
      ],
      startLine: {
        position: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 0, z: 0 }
      },
      finishLine: {
        position: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 0, z: 0 }
      },
      length: 400,
      width: 15,
      elevation: 0,
      surfaceType: 'asphalt',
      terrainModifiers: new Map([
        ['grip', 1.0]
      ]),
      obstacles: [],
      powerUps: [],
      weatherZones: [],
      lapCount: 3,
      direction: 'clockwise',
      allowedVehicles: ['car', 'bike'],
      penalties: new Map([
        ['off-track', 3]
      ]),
      environment: 'stadium',
      lighting: 'day',
      skybox: 'clear_sky',
      backgroundMusic: 'demo_race_theme',
      ambientSounds: ['crowd_noise']
    };

    const demoSprint: TrackDefinition = {
      id: 'demo-sprint',
      name: 'Demo Sprint',
      description: 'Straight sprint course for time trials.',
      type: 'sprint',
      waypoints: [
        { x: 0, y: 0, z: 0 },
        { x: 300, y: 0, z: 0 }
      ],
      checkpoints: [
        {
          id: 'start',
          position: { x: 0, y: 0, z: 0 },
          direction: { x: 1, y: 0, z: 0 },
          size: { width: 20, height: 5 },
          type: 'start',
          isRequired: true
        },
        {
          id: 'finish',
          position: { x: 300, y: 0, z: 0 },
          direction: { x: 1, y: 0, z: 0 },
          size: { width: 20, height: 5 },
          type: 'finish',
          isRequired: true
        }
      ],
      startLine: {
        position: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 0, z: 0 }
      },
      finishLine: {
        position: { x: 300, y: 0, z: 0 },
        direction: { x: 1, y: 0, z: 0 }
      },
      length: 300,
      width: 12,
      elevation: 0,
      surfaceType: 'asphalt',
      terrainModifiers: new Map(),
      obstacles: [],
      powerUps: [],
      weatherZones: [],
      lapCount: 1,
      direction: 'clockwise',
      allowedVehicles: ['car', 'bike'],
      penalties: new Map(),
      environment: 'industrial',
      lighting: 'day',
      skybox: 'partly_cloudy',
      backgroundMusic: 'sprint_theme',
      ambientSounds: ['wind']
    };

    this.registerTrack(demoCircuit);
    this.registerTrack(demoSprint);
  }

  private cloneVehicleDefinition(definition: VehicleDefinition): VehicleDefinition {
    return {
      ...definition,
      terrainTypes: [...definition.terrainTypes],
      weatherEffects: new Map(definition.weatherEffects),
      abilities: definition.abilities.map(ability => ({
        ...ability,
        activationRequirements: ability.activationRequirements ? [...ability.activationRequirements] : undefined,
        effects: ability.effects.map(effect => ({ ...effect }))
      })),
      particleEffects: definition.particleEffects ? [...definition.particleEffects] : undefined,
      compatibleUpgrades: definition.compatibleUpgrades ? [...definition.compatibleUpgrades] : undefined,
      unlockRequirements: definition.unlockRequirements ? [...definition.unlockRequirements] : undefined,
      skillRequirements: definition.skillRequirements ? new Map(definition.skillRequirements) : undefined
    };
  }

  private cloneTrackDefinition(track: TrackDefinition): TrackDefinition {
    return {
      ...track,
      waypoints: track.waypoints.map(point => ({ ...point })),
      checkpoints: track.checkpoints.map(checkpoint => ({
        ...checkpoint,
        position: { ...checkpoint.position },
        direction: { ...checkpoint.direction },
        size: { ...checkpoint.size }
      })),
      startLine: {
        position: { ...track.startLine.position },
        direction: { ...track.startLine.direction }
      },
      finishLine: {
        position: { ...track.finishLine.position },
        direction: { ...track.finishLine.direction }
      },
      terrainModifiers: new Map(track.terrainModifiers),
      obstacles: track.obstacles.map(obstacle => ({
        ...obstacle,
        position: { ...obstacle.position },
        size: { ...obstacle.size }
      })),
      powerUps: track.powerUps.map(powerUp => ({
        ...powerUp,
        position: { ...powerUp.position }
      })),
      weatherZones: track.weatherZones.map(zone => ({
        ...zone,
        area: zone.area.map(point => ({ ...point }))
      })),
      allowedVehicles: [...track.allowedVehicles],
      penalties: new Map(track.penalties),
      ambientSounds: track.ambientSounds ? [...track.ambientSounds] : []
    };
  }

  private getTerrainEffect(terrain: string | undefined): number {
    if (!terrain) {
      return 0;
    }
    return DEFAULT_TERRAIN_EFFECTS[terrain] ?? 0;
  }

  private generateVehicleId(baseId: string): string {
    this.vehicleCounter += 1;
    const randomSuffix = Math.floor((this.rng?.nextFloat() ?? Math.random()) * 1_000_000)
      .toString(36)
      .padStart(3, '0');
    return `${baseId}_${this.vehicleCounter}_${randomSuffix}`;
  }

  private resolveVehicle(vehicle: VehicleInstance | null): VehicleInstance | null {
    if (!vehicle) {
      return null;
    }

    if (this.vehicles.has(vehicle.id)) {
      return this.vehicles.get(vehicle.id) ?? null;
    }

    // Fallback: ensure minimal shape exists (for defensive handling in tests)
    if (typeof vehicle.health === 'number' && typeof vehicle.maxHealth === 'number') {
      return vehicle;
    }

    return null;
  }

  private publishEvent(event: string, payload: unknown): void {
    if (!this.eventBus) {
      return;
    }

    if (typeof this.eventBus.publish === 'function') {
      this.eventBus.publish(event, payload);
    } else if (typeof this.eventBus.emit === 'function') {
      this.eventBus.emit(event, payload);
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}

export { DrivingManager } from './Manager';
export { DrivingManager as DrivingSystemManager } from './Manager';
export default DrivingSystemPure;
