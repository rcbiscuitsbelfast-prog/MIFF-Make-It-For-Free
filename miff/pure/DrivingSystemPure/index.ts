/**
 * MIFF Driving System Pure
 *
 * Comprehensive vehicle physics system with terrain modifiers, lap logic, and driving mechanics
 * Integrates with PhysicsSystemPure, InputPure, and MountSystemPure
 *
 * Schema Version: v1.0.0
 */

import { EventBus } from '../EventsPure/index';
import { RNGPure } from '../RNGPure/index';
import { InputSystemPure } from '../InputPure/index';

// Core interfaces and types
export interface VehicleDefinition {
  id: string;
  name: string;
  type: 'car' | 'bike' | 'truck' | 'boat' | 'aircraft' | 'mount' | 'kart' | 'custom';
  category: 'land' | 'water' | 'air' | 'space';
  description: string;

  // Physical properties
  mass: number;                    // Vehicle mass in kg
  dragCoefficient: number;         // Air resistance (0-1)
  frictionCoefficient: number;     // Surface friction (0-1)
  maxSpeed: number;                // Maximum speed in m/s
  acceleration: number;            // Acceleration force
  brakingForce: number;           // Braking power
  handling: number;               // Turn responsiveness (0-1)

  // Dimensions
  length: number;                 // Length in meters
  width: number;                  // Width in meters
  height: number;                 // Height in meters
  wheelbase?: number;             // Distance between front and rear wheels

  // Terrain compatibility
  terrainTypes: string[];         // Compatible terrain types
  weatherEffects: Map<string, number>; // Weather modifiers (-1 to +1)

  // Special abilities
  abilities: VehicleAbility[];
  boostPower?: number;            // Boost acceleration multiplier
  boostDuration?: number;         // Boost duration in seconds
  boostCooldown?: number;         // Cooldown between boosts

  // Visual properties
  model: string;                  // 3D model identifier
  texture: string;                // Texture/skin identifier
  soundProfile: string;           // Sound effect profile
  particleEffects: string[];      // Visual effects

  // Performance characteristics
  fuelCapacity?: number;          // Fuel tank capacity
  fuelConsumption: number;        // Fuel usage per unit distance
  durability: number;             // Vehicle health/durability
  repairCost: number;             // Cost to repair

  // Upgrade slots
  upgradeSlots: number;           // Available upgrade slots
  compatibleUpgrades: string[];   // Allowed upgrade types

  // Requirements
  unlockRequirements: string[];   // Requirements to unlock
  skillRequirements: Map<string, number>; // Required skills and levels

  // Metadata
  manufacturer: string;
  modelYear: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;                  // Base monetary value
}

export interface VehicleAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'toggle' | 'charge';
  cooldown?: number;              // Cooldown in milliseconds
  duration?: number;              // Duration for temporary effects
  energyCost?: number;            // Energy/mana cost to activate
  activationRequirements: string[]; // Conditions to activate
  effects: VehicleEffect[];
  visualEffect?: string;
  soundEffect?: string;
  icon?: string;
}

export interface VehicleEffect {
  type: 'speed' | 'acceleration' | 'handling' | 'braking' | 'fuel-efficiency' | 'durability' | 'traction' | 'stability' | 'boost' | 'drift';
  magnitude: number;              // Effect strength
  duration?: number;              // Duration for temporary effects
  condition?: string;             // When effect is active
  description: string;
}

export interface VehicleInstance {
  id: string;
  definition: VehicleDefinition;
  ownerId: string;
  currentPosition: Vector3;
  currentVelocity: Vector3;
  currentRotation: Quaternion;
  health: number;                 // Current durability
  maxHealth: number;
  fuel: number;                   // Current fuel
  maxFuel: number;

  // State
  isEngineRunning: boolean;
  isBraking: boolean;
  isBoosting: boolean;
  isDrifting: boolean;
  isAirborne: boolean;
  isStunned: boolean;

  // Physics state
  currentSpeed: number;           // Current speed in m/s
  rpm: number;                    // Engine RPM
  gear: number;                   // Current gear
  throttle: number;               // Throttle input (0-1)
  steering: number;               // Steering input (-1 to 1)
  brakeInput: number;             // Brake input (0-1)

  // Terrain interaction
  currentTerrain: string;
  terrainModifiers: Map<string, number>;
  surfaceType: 'road' | 'dirt' | 'grass' | 'sand' | 'snow' | 'ice' | 'water' | 'air';

  // Active effects
  activeEffects: Map<string, VehicleEffect>;
  abilityCooldowns: Map<string, number>;

  // Statistics
  distanceTraveled: number;
  timeDriven: number;
  fuelConsumed: number;
  damageTaken: number;
  boostsUsed: number;
  crashes: number;

  // Customization
  upgrades: Map<string, Upgrade>;
  paintJob: string;
  customizations: Map<string, any>;

  // Metadata
  createdAt: number;
  lastUsed: number;
  totalUsageTime: number;
}

export interface Upgrade {
  id: string;
  name: string;
  type: 'engine' | 'transmission' | 'suspension' | 'brakes' | 'tires' | 'body' | 'electronics' | 'aero';
  description: string;
  effects: VehicleEffect[];
  cost: number;
  requiredLevel: number;
  compatibility: string[];        // Compatible vehicle IDs
  installationTime: number;       // Installation duration
  isInstalled: boolean;
  unlockRequirements: string[];
}

export interface DrivingSession {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: number;
  endTime?: number;
  startPosition: Vector3;
  endPosition?: Vector3;

  // Track progress
  currentLap: number;
  totalLaps: number;
  lapTimes: number[];
  bestLapTime: number;
  checkpointsPassed: number;
  totalCheckpoints: number;

  // Performance
  topSpeed: number;
  averageSpeed: number;
  distanceTraveled: number;
  fuelConsumed: number;

  // Penalties
  penalties: DrivingPenalty[];
  collisionCount: number;
  offTrackTime: number;

  // Status
  status: 'active' | 'paused' | 'completed' | 'abandoned' | 'disqualified';
  reason?: string;
}

export interface DrivingPenalty {
  type: 'collision' | 'off-track' | 'speeding' | 'wrong-way' | 'jump-start' | 'pit-violation';
  severity: 'minor' | 'major' | 'severe';
  timePenalty: number;            // Time added in seconds
  description: string;
  timestamp: number;
  position?: Vector3;
}

export interface TrackDefinition {
  id: string;
  name: string;
  description: string;
  type: 'circuit' | 'sprint' | 'drag' | 'drift' | 'rally' | 'offroad' | 'custom';

  // Layout
  waypoints: Vector3[];           // Track path points
  checkpoints: Checkpoint[];
  startLine: { position: Vector3; direction: Vector3 };
  finishLine: { position: Vector3; direction: Vector3 };

  // Dimensions
  length: number;                 // Total track length
  width: number;                  // Track width
  elevation: number;              // Height variation

  // Surface properties
  surfaceType: string;            // Default surface type
  terrainModifiers: Map<string, number>;

  // Special features
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  weatherZones: WeatherZone[];

  // Racing rules
  lapCount: number;               // Required laps to complete
  direction: 'clockwise' | 'counterclockwise';
  allowedVehicles: string[];      // Compatible vehicle types
  timeLimit?: number;             // Time limit in seconds
  penalties: Map<string, number>; // Penalty configurations

  // Visual properties
  environment: string;            // Environment type
  lighting: string;               // Lighting conditions
  skybox: string;
  backgroundMusic: string;
  ambientSounds: string[];
}

export interface Checkpoint {
  id: string;
  position: Vector3;
  direction: Vector3;             // Facing direction for wrong-way detection
  size: { width: number; height: number };
  type: 'start' | 'intermediate' | 'finish' | 'split';
  isRequired: boolean;
  penalty?: number;               // Wrong-way penalty in seconds
  visualEffect: string;
}

export interface Obstacle {
  id: string;
  position: Vector3;
  type: 'static' | 'dynamic' | 'destructible' | 'moving';
  shape: 'sphere' | 'box' | 'cylinder' | 'mesh';
  dimensions: Vector3;
  collisionDamage: number;        // Damage on collision
  respawnTime?: number;           // Time to respawn if destructible
  movementPattern?: MovementPattern;
  visualModel: string;
  collisionEffect: string;
}

export interface PowerUp {
  id: string;
  position: Vector3;
  type: 'boost' | 'shield' | 'repair' | 'fuel' | 'speed' | 'handling' | 'nitro';
  duration?: number;              // Effect duration
  strength: number;               // Effect strength
  respawnTime: number;            // Time to respawn
  visualEffect: string;
  collectionEffect: string;
}

export interface WeatherZone {
  id: string;
  center: Vector3;
  radius: number;
  weatherType: string;
  intensity: number;              // 0-1 weather intensity
  duration: number;               // Zone duration
  transitionTime: number;         // Time to transition effects
}

export interface MovementPattern {
  type: 'linear' | 'circular' | 'sine' | 'random' | 'patrol';
  speed: number;
  radius?: number;
  waypoints?: Vector3[];
  frequency?: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface DrivingConfig {
  physicsUpdateRate: number;      // Physics updates per second
  enableDetailedCollisions: boolean;
  enableTerrainDeformation: boolean;
  enableWeatherEffects: boolean;
  enableDamageSystem: boolean;
  enableFuelSystem: boolean;
  enableUpgrades: boolean;
  enableAI: boolean;
  maxVehiclesPerSession: number;
  collisionDamageMultiplier: number;
  terrainResistanceMultiplier: number;
  gravity: number;                // Gravity strength
  airDensity: number;             // Air density for drag calculations
  enableRealisticPhysics: boolean;
  enableArcadePhysics: boolean;
  defaultTrack: string;
  enableLeaderboards: boolean;
  enableGhostRacing: boolean;
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

export class DrivingSystemPure {
  private vehicleDefinitions: Map<string, VehicleDefinition> = new Map();
  private vehicleInstances: Map<string, VehicleInstance> = new Map();
  private activeSessions: Map<string, DrivingSession> = new Map();
  private tracks: Map<string, TrackDefinition> = new Map();
  private upgrades: Map<string, Upgrade> = new Map();
  private config: DrivingConfig;
  private stats: DrivingStats;
  private eventBus: EventBus;
  private inputSystem: InputSystemPure;
  private rng: RNGPure;

  constructor(
    eventBus: EventBus,
    inputSystem: InputSystemPure,
    rng: RNGPure
  ) {
    this.eventBus = eventBus;
    this.inputSystem = inputSystem;
    this.rng = rng;
    this.config = this.initializeConfig();
    this.stats = this.initializeStats();
    this.initializeDefaultVehicles();
    this.initializeDefaultTracks();
    this.setupEventListeners();
  }

  /**
   * Initialize default configuration
   */
  private initializeConfig(): DrivingConfig {
    return {
      physicsUpdateRate: 60,          // 60 FPS physics
      enableDetailedCollisions: true,
      enableTerrainDeformation: false,
      enableWeatherEffects: true,
      enableDamageSystem: true,
      enableFuelSystem: true,
      enableUpgrades: true,
      enableAI: true,
      maxVehiclesPerSession: 12,
      collisionDamageMultiplier: 1.0,
      terrainResistanceMultiplier: 1.0,
      gravity: 9.81,                  // Standard gravity
      airDensity: 1.225,              // Air density at sea level
      enableRealisticPhysics: false,
      enableArcadePhysics: true,
      defaultTrack: 'demo-circuit',
      enableLeaderboards: true,
      enableGhostRacing: true
    };
  }

  /**
   * Initialize default statistics
   */
  private initializeStats(): DrivingStats {
    return {
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
  }

  /**
   * Initialize default vehicles
   */
  private initializeDefaultVehicles(): void {
    const vehicles: VehicleDefinition[] = [
      {
        id: 'demo-car',
        name: 'Demo Sports Car',
        type: 'car',
        category: 'land',
        description: 'A high-performance sports car for racing',
        mass: 1200,                    // 1200 kg
        dragCoefficient: 0.3,          // Aerodynamic
        frictionCoefficient: 0.8,      // Good grip
        maxSpeed: 80,                  // 80 m/s ≈ 288 km/h
        acceleration: 15,              // Strong acceleration
        brakingForce: 25,             // Excellent brakes
        handling: 0.9,                // Responsive handling
        length: 4.5,                   // 4.5 meters long
        width: 2.0,                    // 2 meters wide
        height: 1.2,                   // 1.2 meters tall
        wheelbase: 2.8,               // 2.8m wheelbase
        terrainTypes: ['road', 'track'],
        weatherEffects: new Map([
          ['rain', -0.2],             // Reduced grip in rain
          ['snow', -0.4],             // Poor traction in snow
          ['wind', -0.1]              // Slight wind resistance
        ]),
        abilities: [
          {
            id: 'nitro-boost',
            name: 'Nitro Boost',
            description: 'Temporary speed boost using nitrous oxide',
            type: 'active',
            cooldown: 30000,            // 30 seconds
            duration: 5000,             // 5 seconds
            energyCost: 25,
            activationRequirements: ['speed-above-50'],
            effects: [
              {
                type: 'speed',
                magnitude: 2.0,         // Double speed
                duration: 5000,
                condition: 'boost-active',
                description: 'Massive speed increase'
              },
              {
                type: 'acceleration',
                magnitude: 1.5,         // 50% more acceleration
                duration: 5000,
                condition: 'boost-active',
                description: 'Enhanced acceleration'
              }
            ],
            visualEffect: 'nitro_boost',
            soundEffect: 'engine_roar',
            icon: 'nitro_icon'
          },
          {
            id: 'drift-master',
            name: 'Drift Master',
            description: 'Improved control during drifts',
            type: 'passive',
            effects: [
              {
                type: 'handling',
                magnitude: 0.3,         // 30% better handling
                description: 'Improved cornering'
              },
              {
                type: 'stability',
                magnitude: 0.2,         // 20% more stability
                description: 'Better stability at high speeds'
              }
            ]
          }
        ],
        boostPower: 2.5,
        boostDuration: 3000,
        boostCooldown: 15000,
        model: 'sports_car',
        texture: 'red_sports',
        soundProfile: 'sports_engine',
        particleEffects: ['tire_smoke', 'exhaust'],
        fuelCapacity: 60,
        fuelConsumption: 0.1,           // 0.1 L per meter
        durability: 1000,
        repairCost: 500,
        upgradeSlots: 4,
        compatibleUpgrades: ['engine', 'tires', 'brakes', 'aero'],
        unlockRequirements: [],
        skillRequirements: new Map([['driving', 1]]),
        manufacturer: 'Demo Motors',
        modelYear: 2025,
        rarity: 'common',
        value: 75000
      },
      {
        id: 'demo-bike',
        name: 'Demo Racing Bike',
        type: 'bike',
        category: 'land',
        description: 'A nimble racing motorcycle',
        mass: 200,                     // 200 kg
        dragCoefficient: 0.4,          // Less aerodynamic than car
        frictionCoefficient: 0.7,      // Good grip but riskier
        maxSpeed: 70,                  // 70 m/s ≈ 252 km/h
        acceleration: 20,              // Very quick acceleration
        brakingForce: 30,             // Excellent brakes
        handling: 0.95,               // Extremely responsive
        length: 2.0,
        width: 0.8,
        height: 1.1,
        terrainTypes: ['road', 'track'],
        weatherEffects: new Map([
          ['rain', -0.3],             // Very dangerous in rain
          ['wind', -0.2]              // Affected by crosswinds
        ]),
        abilities: [
          {
            id: 'wheelie',
            name: 'Wheelie',
            description: 'Perform wheelies for speed boost',
            type: 'active',
            cooldown: 10000,
            duration: 3000,
            activationRequirements: ['speed-above-30'],
            effects: [
              {
                type: 'speed',
                magnitude: 1.3,         // 30% speed boost
                duration: 3000,
                condition: 'wheelie-active',
                description: 'Wheelie speed bonus'
              },
              {
                type: 'acceleration',
                magnitude: 1.2,         // 20% acceleration boost
                duration: 3000,
                condition: 'wheelie-active',
                description: 'Wheelie acceleration bonus'
              }
            ],
            visualEffect: 'wheelie_effect',
            soundEffect: 'engine_wheelie',
            icon: 'wheelie_icon'
          }
        ],
        model: 'racing_bike',
        texture: 'blue_bike',
        soundProfile: 'bike_engine',
        particleEffects: ['exhaust'],
        fuelCapacity: 20,
        fuelConsumption: 0.15,
        durability: 500,
        repairCost: 300,
        upgradeSlots: 3,
        compatibleUpgrades: ['engine', 'tires', 'brakes'],
        unlockRequirements: [],
        skillRequirements: new Map([['driving', 2]]),
        manufacturer: 'Demo Bikes',
        modelYear: 2025,
        rarity: 'uncommon',
        value: 25000
      }
    ];

    vehicles.forEach(vehicle => {
      this.vehicleDefinitions.set(vehicle.id, vehicle);
    });
  }

  /**
   * Initialize default tracks
   */
  private initializeDefaultTracks(): void {
    const tracks: TrackDefinition[] = [
      {
        id: 'demo-circuit',
        name: 'Demo Circuit',
        description: 'A classic racing circuit for testing',
        type: 'circuit',
        waypoints: [
          { x: 0, y: 0, z: 0 },
          { x: 100, y: 0, z: 0 },
          { x: 100, y: 0, z: 100 },
          { x: 0, y: 0, z: 100 }
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
            id: 'checkpoint-1',
            position: { x: 100, y: 0, z: 0 },
            direction: { x: 0, y: 0, z: 1 },
            size: { width: 20, height: 5 },
            type: 'intermediate',
            isRequired: true,
            visualEffect: 'checkpoint_glow'
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
        surfaceType: 'track',
        terrainModifiers: new Map([['grip', 1.0]]),
        obstacles: [],
        powerUps: [
          {
            id: 'boost-pad-1',
            position: { x: 50, y: 0, z: 25 },
            type: 'boost',
            duration: 3000,
            strength: 1.5,
            respawnTime: 10000,
            visualEffect: 'boost_pad',
            collectionEffect: 'boost_collect'
          }
        ],
        weatherZones: [],
        lapCount: 3,
        direction: 'clockwise',
        allowedVehicles: ['car', 'bike', 'kart'],
        penalties: new Map([
          ['off-track', 5],
          ['wrong-way', 10],
          ['collision', 3]
        ]),
        environment: 'racetrack',
        lighting: 'day',
        skybox: 'clear_sky',
        backgroundMusic: 'race_music',
        ambientSounds: ['engine_sounds', 'tires_squeal']
      }
    ];

    tracks.forEach(track => {
      this.tracks.set(track.id, track);
    });
  }

  /**
   * Create a vehicle instance
   */
  createVehicle(vehicleId: string, ownerId: string): VehicleInstance | null {
    const definition = this.vehicleDefinitions.get(vehicleId);
    if (!definition) {
      console.warn(`Vehicle definition not found: ${vehicleId}`);
      return null;
    }

    const instance: VehicleInstance = {
      id: this.generateVehicleId(),
      definition,
      ownerId,
      currentPosition: { x: 0, y: 0, z: 0 },
      currentVelocity: { x: 0, y: 0, z: 0 },
      currentRotation: { x: 0, y: 0, z: 0, w: 1 },
      health: definition.durability,
      maxHealth: definition.durability,
      fuel: definition.fuelCapacity || 0,
      maxFuel: definition.fuelCapacity || 0,
      isEngineRunning: false,
      isBraking: false,
      isBoosting: false,
      isDrifting: false,
      isAirborne: false,
      isStunned: false,
      currentSpeed: 0,
      rpm: 0,
      gear: 1,
      throttle: 0,
      steering: 0,
      brakeInput: 0,
      currentTerrain: 'road',
      terrainModifiers: new Map(),
      surfaceType: 'road',
      activeEffects: new Map(),
      abilityCooldowns: new Map(),
      distanceTraveled: 0,
      timeDriven: 0,
      fuelConsumed: 0,
      damageTaken: 0,
      boostsUsed: 0,
      crashes: 0,
      upgrades: new Map(),
      paintJob: 'default',
      customizations: new Map(),
      createdAt: Date.now(),
      lastUsed: Date.now(),
      totalUsageTime: 0
    };

    this.vehicleInstances.set(instance.id, instance);
    this.eventBus.emit('driving:vehicle-created', {
      vehicleId: instance.id,
      vehicleType: definition.id,
      ownerId
    });

    console.log(`🚗 Created vehicle: ${definition.name} (${instance.id})`);
    return instance;
  }

  /**
   * Update vehicle physics
   */
  updateVehiclePhysics(vehicleId: string, deltaTime: number): void {
    const vehicle = this.vehicleInstances.get(vehicleId);
    if (!vehicle) return;

    if (!vehicle.isEngineRunning) {
      // Apply friction and gravity when engine is off
      this.applyFriction(vehicle, deltaTime);
      this.applyGravity(vehicle, deltaTime);
      return;
    }

    // Apply driving forces
    this.applyThrottle(vehicle, deltaTime);
    this.applyBraking(vehicle, deltaTime);
    this.applySteering(vehicle, deltaTime);
    this.applyDrag(vehicle, deltaTime);
    this.applyTerrainEffects(vehicle, deltaTime);
    this.applyGravity(vehicle, deltaTime);

    // Update vehicle state
    this.updateSpeed(vehicle, deltaTime);
    this.updatePosition(vehicle, deltaTime);
    this.updateFuelConsumption(vehicle, deltaTime);

    // Check for collisions and obstacles
    this.checkCollisions(vehicle, deltaTime);

    // Update statistics
    vehicle.distanceTraveled += vehicle.currentSpeed * deltaTime;
    vehicle.timeDriven += deltaTime;
    vehicle.totalUsageTime += deltaTime;
    vehicle.lastUsed = Date.now();
  }

  /**
   * Apply throttle force
   */
  private applyThrottle(vehicle: VehicleInstance, deltaTime: number): void {
    if (vehicle.throttle <= 0 || vehicle.fuel <= 0) return;

    const acceleration = vehicle.definition.acceleration * vehicle.throttle * deltaTime;
    const force = acceleration * vehicle.definition.mass;

    // Apply force in the direction the vehicle is facing
    const forwardForce = force * Math.cos(vehicle.currentRotation.y);
    const lateralForce = force * Math.sin(vehicle.currentRotation.y);

    vehicle.currentVelocity.x += forwardForce * deltaTime;
    vehicle.currentVelocity.z += lateralForce * deltaTime;

    // Limit to max speed
    const currentSpeed = Math.sqrt(vehicle.currentVelocity.x ** 2 + vehicle.currentVelocity.z ** 2);
    if (currentSpeed > vehicle.definition.maxSpeed) {
      const speedRatio = vehicle.definition.maxSpeed / currentSpeed;
      vehicle.currentVelocity.x *= speedRatio;
      vehicle.currentVelocity.z *= speedRatio;
    }
  }

  /**
   * Apply braking force
   */
  private applyBraking(vehicle: VehicleInstance, deltaTime: number): void {
    if (vehicle.brakeInput <= 0) return;

    const brakingForce = vehicle.definition.brakingForce * vehicle.brakeInput;
    const deceleration = brakingForce / vehicle.definition.mass * deltaTime;

    // Apply braking in opposite direction of velocity
    const velocityMagnitude = Math.sqrt(vehicle.currentVelocity.x ** 2 + vehicle.currentVelocity.z ** 2);
    if (velocityMagnitude > 0) {
      const brakeRatio = Math.min(1, deceleration / velocityMagnitude);
      vehicle.currentVelocity.x *= (1 - brakeRatio);
      vehicle.currentVelocity.z *= (1 - brakeRatio);
    }

    vehicle.isBraking = true;
  }

  /**
   * Apply steering
   */
  private applySteering(vehicle: VehicleInstance, deltaTime: number): void {
    if (Math.abs(vehicle.steering) < 0.01) return;

    const currentSpeed = Math.sqrt(vehicle.currentVelocity.x ** 2 + vehicle.currentVelocity.z ** 2);
    if (currentSpeed < 0.1) return; // Can't steer if not moving

    const handlingFactor = vehicle.definition.handling;
    const turnRate = vehicle.steering * handlingFactor * deltaTime * (1 / currentSpeed) * 10;

    // Update rotation
    vehicle.currentRotation.y += turnRate;

    // Apply lateral forces for realistic turning
    const lateralForce = currentSpeed * vehicle.steering * 0.5;
    vehicle.currentVelocity.x += Math.sin(vehicle.currentRotation.y) * lateralForce * deltaTime;
    vehicle.currentVelocity.z -= Math.cos(vehicle.currentRotation.y) * lateralForce * deltaTime;
  }

  /**
   * Apply drag forces
   */
  private applyDrag(vehicle: VehicleInstance, deltaTime: number): void {
    const dragCoefficient = vehicle.definition.dragCoefficient;
    const airDensity = this.config.airDensity;
    const frontalArea = vehicle.definition.width * vehicle.definition.height;
    const dragForce = 0.5 * airDensity * dragCoefficient * frontalArea * vehicle.currentSpeed ** 2;

    const velocityMagnitude = Math.sqrt(vehicle.currentVelocity.x ** 2 + vehicle.currentVelocity.z ** 2);
    if (velocityMagnitude > 0) {
      const dragRatio = Math.min(1, dragForce / (vehicle.definition.mass * velocityMagnitude));
      vehicle.currentVelocity.x *= (1 - dragRatio * deltaTime);
      vehicle.currentVelocity.z *= (1 - dragRatio * deltaTime);
    }
  }

  /**
   * Apply terrain effects
   */
  private applyTerrainEffects(vehicle: VehicleInstance, deltaTime: number): void {
    const terrainModifier = vehicle.terrainModifiers.get(vehicle.currentTerrain) || 1.0;

    // Apply terrain-based friction
    const baseFriction = vehicle.definition.frictionCoefficient;
    const terrainFriction = baseFriction * terrainModifier;

    const velocityMagnitude = Math.sqrt(vehicle.currentVelocity.x ** 2 + vehicle.currentVelocity.z ** 2);
    if (velocityMagnitude > 0) {
      const frictionForce = terrainFriction * this.config.gravity * vehicle.definition.mass;
      const frictionRatio = Math.min(1, frictionForce / (vehicle.definition.mass * velocityMagnitude));
      vehicle.currentVelocity.x *= (1 - frictionRatio * deltaTime);
      vehicle.currentVelocity.z *= (1 - frictionRatio * deltaTime);
    }

    // Apply terrain-specific effects
    switch (vehicle.currentTerrain) {
      case 'ice':
        // Reduced traction, increased sliding
        vehicle.currentVelocity.x *= 0.95;
        vehicle.currentVelocity.z *= 0.95;
        break;
      case 'mud':
        // Increased resistance
        vehicle.currentVelocity.x *= 0.9;
        vehicle.currentVelocity.z *= 0.9;
        break;
      case 'water':
        // Buoyancy and water resistance
        vehicle.currentVelocity.y += 2.0 * deltaTime; // Buoyancy
        vehicle.currentVelocity.x *= 0.8;
        vehicle.currentVelocity.z *= 0.8;
        break;
    }
  }

  /**
   * Apply gravity
   */
  private applyGravity(vehicle: VehicleInstance, deltaTime: number): void {
    const gravity = this.config.gravity;

    // Apply downward force
    vehicle.currentVelocity.y -= gravity * deltaTime;

    // Check if airborne
    vehicle.isAirborne = vehicle.currentPosition.y > 1.0;

    if (vehicle.isAirborne) {
      // Apply air resistance to vertical velocity
      vehicle.currentVelocity.y *= 0.99;
    }
  }

  /**
   * Apply friction when not moving
   */
  private applyFriction(vehicle: VehicleInstance, deltaTime: number): void {
    // Apply rolling resistance and static friction
    const frictionCoefficient = 0.02; // Rolling resistance
    const velocityMagnitude = Math.sqrt(vehicle.currentVelocity.x ** 2 + vehicle.currentVelocity.z ** 2);

    if (velocityMagnitude > 0.1) {
      const frictionForce = frictionCoefficient * this.config.gravity * vehicle.definition.mass;
      const frictionRatio = Math.min(1, frictionForce / (vehicle.definition.mass * velocityMagnitude));
      vehicle.currentVelocity.x *= (1 - frictionRatio * deltaTime);
      vehicle.currentVelocity.z *= (1 - frictionRatio * deltaTime);
    } else {
      // Come to complete stop
      vehicle.currentVelocity.x = 0;
      vehicle.currentVelocity.z = 0;
      vehicle.currentSpeed = 0;
    }
  }

  /**
   * Update vehicle speed
   */
  private updateSpeed(vehicle: VehicleInstance, deltaTime: number): void {
    vehicle.currentSpeed = Math.sqrt(
      vehicle.currentVelocity.x ** 2 +
      vehicle.currentVelocity.y ** 2 +
      vehicle.currentVelocity.z ** 2
    );

    // Update RPM based on speed and gear
    const maxRpm = 8000;
    const rpmRatio = Math.min(1, vehicle.currentSpeed / vehicle.definition.maxSpeed);
    vehicle.rpm = 1000 + (rpmRatio * (maxRpm - 1000));

    // Simple gear calculation
    const speedPerGear = vehicle.definition.maxSpeed / 6; // 6 gears
    vehicle.gear = Math.min(6, Math.max(1, Math.floor(vehicle.currentSpeed / speedPerGear) + 1));
  }

  /**
   * Update vehicle position
   */
  private updatePosition(vehicle: VehicleInstance, deltaTime: number): void {
    vehicle.currentPosition.x += vehicle.currentVelocity.x * deltaTime;
    vehicle.currentPosition.y += vehicle.currentVelocity.y * deltaTime;
    vehicle.currentPosition.z += vehicle.currentVelocity.z * deltaTime;

    // Prevent going below ground
    if (vehicle.currentPosition.y < 0) {
      vehicle.currentPosition.y = 0;
      vehicle.currentVelocity.y = 0;
      vehicle.isAirborne = false;

      // Apply ground impact damage if falling fast
      if (Math.abs(vehicle.currentVelocity.y) > 10) {
        const impactDamage = Math.abs(vehicle.currentVelocity.y) * 10;
        this.damageVehicle(vehicle, impactDamage);
      }
    }
  }

  /**
   * Update fuel consumption
   */
  private updateFuelConsumption(vehicle: VehicleInstance, deltaTime: number): void {
    if (!this.config.enableFuelSystem) return;

    const fuelConsumptionRate = vehicle.definition.fuelConsumption * vehicle.currentSpeed * deltaTime;
    vehicle.fuel = Math.max(0, vehicle.fuel - fuelConsumptionRate);
    vehicle.fuelConsumed += fuelConsumptionRate;

    if (vehicle.fuel <= 0 && vehicle.isEngineRunning) {
      this.stopEngine(vehicle);
    }
  }

  /**
   * Check for collisions
   */
  private checkCollisions(vehicle: VehicleInstance, deltaTime: number): void {
    // This would integrate with a collision detection system
    // For now, just check for basic collision responses

    // Simple collision detection with track boundaries
    const track = this.getCurrentTrack(vehicle);
    if (track) {
      // Check if vehicle is off-track
      const trackCenter = this.getTrackCenter(track);
      const distanceFromCenter = Math.sqrt(
        (vehicle.currentPosition.x - trackCenter.x) ** 2 +
        (vehicle.currentPosition.z - trackCenter.z) ** 2
      );

      if (distanceFromCenter > track.width / 2) {
        // Off-track penalty
        this.applyOffTrackPenalty(vehicle);
      }
    }
  }

  /**
   * Apply off-track penalty
   */
  private applyOffTrackPenalty(vehicle: VehicleInstance): void {
    // Reduce speed due to rough terrain
    vehicle.currentVelocity.x *= 0.8;
    vehicle.currentVelocity.z *= 0.8;

    // Apply damage
    if (this.config.enableDamageSystem) {
      this.damageVehicle(vehicle, 5);
    }
  }

  /**
   * Damage vehicle
   */
  private damageVehicle(vehicle: VehicleInstance, damage: number): void {
    vehicle.health -= damage;
    vehicle.damageTaken += damage;

    if (vehicle.health <= 0) {
      this.crashVehicle(vehicle);
    }

    this.eventBus.emit('driving:vehicle-damaged', {
      vehicleId: vehicle.id,
      damage,
      currentHealth: vehicle.health,
      maxHealth: vehicle.maxHealth
    });
  }

  /**
   * Crash vehicle
   */
  private crashVehicle(vehicle: VehicleInstance): void {
    vehicle.isEngineRunning = false;
    vehicle.currentVelocity.x *= 0.1;
    vehicle.currentVelocity.y *= 0.1;
    vehicle.currentVelocity.z *= 0.1;
    vehicle.isStunned = true;

    this.stats.totalCrashes++;

    this.eventBus.emit('driving:vehicle-crashed', {
      vehicleId: vehicle.id,
      position: vehicle.currentPosition
    });

    console.log(`💥 Vehicle crashed: ${vehicle.definition.name}`);
  }

  /**
   * Start vehicle engine
   */
  startEngine(vehicle: VehicleInstance): boolean {
    if (vehicle.fuel <= 0) {
      console.warn('Cannot start engine: No fuel');
      return false;
    }

    if (vehicle.health <= 0) {
      console.warn('Cannot start engine: Vehicle destroyed');
      return false;
    }

    vehicle.isEngineRunning = true;
    this.eventBus.emit('driving:engine-started', {
      vehicleId: vehicle.id,
      vehicleType: vehicle.definition.id
    });

    console.log(`🔥 Engine started: ${vehicle.definition.name}`);
    return true;
  }

  /**
   * Stop vehicle engine
   */
  stopEngine(vehicle: VehicleInstance): void {
    vehicle.isEngineRunning = false;
    this.eventBus.emit('driving:engine-stopped', {
      vehicleId: vehicle.id,
      vehicleType: vehicle.definition.id
    });

    console.log(`⏹️ Engine stopped: ${vehicle.definition.name}`);
  }

  /**
   * Activate vehicle ability
   */
  activateAbility(vehicleId: string, abilityId: string): boolean {
    const vehicle = this.vehicleInstances.get(vehicleId);
    if (!vehicle) return false;

    const ability = vehicle.definition.abilities.find(a => a.id === abilityId);
    if (!ability) return false;

    // Check cooldown
    const cooldownEnd = vehicle.abilityCooldowns.get(abilityId) || 0;
    if (Date.now() < cooldownEnd) {
      console.warn(`Ability on cooldown: ${abilityId}`);
      return false;
    }

    // Check activation requirements
    for (const requirement of ability.activationRequirements) {
      if (!this.checkRequirement(vehicle, requirement)) {
        console.warn(`Requirement not met: ${requirement}`);
        return false;
      }
    }

    // Apply ability effects
    for (const effect of ability.effects) {
      this.applyAbilityEffect(vehicle, ability, effect);
    }

    // Set cooldown
    const cooldownEndTime = Date.now() + (ability.cooldown || 0);
    vehicle.abilityCooldowns.set(abilityId, cooldownEndTime);

    this.eventBus.emit('driving:ability-activated', {
      vehicleId,
      abilityId,
      abilityName: ability.name
    });

    console.log(`⚡ Ability activated: ${ability.name}`);
    return true;
  }

  /**
   * Apply ability effect
   */
  private applyAbilityEffect(vehicle: VehicleInstance, ability: VehicleAbility, effect: VehicleEffect): void {
    const effectKey = `${ability.id}-${effect.type}-${Date.now()}`;
    vehicle.activeEffects.set(effectKey, effect);

    // Apply the effect
    switch (effect.type) {
      case 'speed':
        // Speed boost effect
        break;
      case 'boost':
        vehicle.isBoosting = true;
        setTimeout(() => {
          vehicle.isBoosting = false;
        }, effect.duration || 3000);
        break;
      case 'drift':
        vehicle.isDrifting = true;
        break;
      case 'handling':
        // Improved handling
        break;
    }

    console.log(`✨ Applied effect: ${effect.description}`);
  }

  /**
   * Check requirement
   */
  private checkRequirement(vehicle: VehicleInstance, requirement: string): boolean {
    switch (requirement) {
      case 'engine-running':
        return vehicle.isEngineRunning;
      case 'speed-above-50':
        return vehicle.currentSpeed > 50;
      case 'fuel-above-10':
        return vehicle.fuel > 10;
      default:
        return true;
    }
  }

  /**
   * Get current track for vehicle
   */
  private getCurrentTrack(vehicle: VehicleInstance): TrackDefinition | null {
    // This would determine which track the vehicle is on
    // For now, return the default track
    return this.tracks.get(this.config.defaultTrack) || null;
  }

  /**
   * Get track center
   */
  private getTrackCenter(track: TrackDefinition): Vector3 {
    // Calculate center of track waypoints
    const sum = track.waypoints.reduce(
      (acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y,
        z: acc.z + point.z
      }),
      { x: 0, y: 0, z: 0 }
    );

    return {
      x: sum.x / track.waypoints.length,
      y: sum.y / track.waypoints.length,
      z: sum.z / track.waypoints.length
    };
  }

  /**
   * Get vehicle definition
   */
  getVehicleDefinition(vehicleId: string): VehicleDefinition | null {
    return this.vehicleDefinitions.get(vehicleId) || null;
  }

  /**
   * Get vehicle instance
   */
  getVehicleInstance(vehicleId: string): VehicleInstance | null {
    return this.vehicleInstances.get(vehicleId) || null;
  }

  /**
   * Get track definition
   */
  getTrack(trackId: string): TrackDefinition | null {
    return this.tracks.get(trackId) || null;
  }

  /**
   * Get all tracks
   */
  getAllTracks(): TrackDefinition[] {
    return Array.from(this.tracks.values());
  }

  /**
   * Update driving configuration
   */
  updateConfig(newConfig: Partial<DrivingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Driving configuration updated');
  }

  /**
   * Get driving statistics
   */
  getStats(): DrivingStats {
    return { ...this.stats };
  }

  private setupEventListeners(): void {
    this.eventBus.on('input:button-pressed', (data: any) => {
      // Handle input events for driving controls
    });
  }

  private generateVehicleId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `vehicle_${timestamp}_${random}`;
  }

  private log(message: string, level: 'info' | 'debug' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[DRIVING:${level.toUpperCase()}] ${timestamp} - ${message}`);
  }
}

// Export main class and interfaces
export { DrivingSystemPure };
export type {
  VehicleDefinition,
  VehicleInstance,
  VehicleAbility,
  VehicleEffect,
  Upgrade,
  DrivingSession,
  DrivingPenalty,
  TrackDefinition,
  Checkpoint,
  Obstacle,
  PowerUp,
  WeatherZone,
  MovementPattern,
  DrivingConfig,
  DrivingStats
};