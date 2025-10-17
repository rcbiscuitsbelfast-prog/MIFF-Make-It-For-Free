/**
 * MIFF DrivingSystemPure Golden Tests
 *
 * Comprehensive test suite for the DrivingSystemPure module
 * Tests vehicle physics, driving mechanics, track management, and integration
 */

import { DrivingSystemPure, VehicleDefinition, VehicleInstance, TrackDefinition } from '../index';
import { EventBus } from '../../EventsPure/index';
import { InputSystemPure } from '../../InputPure/index';
import { RNGPure } from '../../RNGPure/index';

// Mock classes for testing
class MockEventBus {
  private events: Map<string, Function[]> = new Map();

  emit(event: string, data: any) {
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }
}

class MockInputSystem {
  // Mock implementation
}

class MockRNG {
  private values: number[] = [];
  private index = 0;

  setNextFloat(value: number) {
    this.values.push(value);
  }

  nextFloat(): number {
    if (this.values.length > 0) {
      return this.values[this.index++] || 0.5;
    }
    return Math.random();
  }
}

describe('DrivingSystemPure Golden Tests', () => {
  let drivingSystem: DrivingSystemPure;
  let eventBus: MockEventBus;
  let inputSystem: MockInputSystem;
  let rng: MockRNG;

  const TEST_VEHICLE: VehicleDefinition = {
    id: 'test-car',
    name: 'Test Car',
    type: 'car',
    category: 'land',
    description: 'A test vehicle for driving mechanics',
    mass: 1000,                    // 1000 kg
    dragCoefficient: 0.3,          // Aerodynamic
    frictionCoefficient: 0.8,      // Good grip
    maxSpeed: 50,                  // 50 m/s ≈ 180 km/h
    acceleration: 10,              // Moderate acceleration
    brakingForce: 20,             // Good brakes
    handling: 0.8,                // Good handling
    length: 4.0,
    width: 2.0,
    height: 1.5,
    terrainTypes: ['road', 'track'],
    weatherEffects: new Map([
      ['rain', -0.2],             // Reduced grip in rain
      ['snow', -0.1]              // Slight reduction in snow
    ]),
    abilities: [
      {
        id: 'test-boost',
        name: 'Test Boost',
        description: 'Temporary speed boost for testing',
        type: 'active',
        cooldown: 10000,            // 10 seconds
        duration: 3000,             // 3 seconds
        activationRequirements: ['speed-above-20'],
        effects: [
          {
            type: 'speed',
            magnitude: 1.5,         // 50% speed boost
            duration: 3000,
            condition: 'boost-active',
            description: 'Speed increase during boost'
          }
        ]
      }
    ],
    boostPower: 2.0,
    model: 'test_car',
    texture: 'test_texture',
    soundProfile: 'engine_sound',
    particleEffects: ['exhaust'],
    fuelCapacity: 50,
    fuelConsumption: 0.1,
    durability: 800,
    repairCost: 400,
    upgradeSlots: 3,
    compatibleUpgrades: ['engine', 'tires'],
    unlockRequirements: [],
    skillRequirements: new Map([['driving', 1]]),
    manufacturer: 'Test Motors',
    modelYear: 2025,
    rarity: 'common',
    value: 50000
  };

  const TEST_TRACK: TrackDefinition = {
    id: 'test-track',
    name: 'Test Track',
    description: 'A simple test track for driving mechanics',
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
    powerUps: [],
    weatherZones: [],
    lapCount: 2,
    direction: 'clockwise',
    allowedVehicles: ['car', 'bike'],
    penalties: new Map([
      ['off-track', 3],
      ['collision', 5]
    ]),
    environment: 'racetrack',
    lighting: 'day',
    skybox: 'clear_sky',
    backgroundMusic: 'race_music',
    ambientSounds: ['engine_sounds']
  };

  beforeEach(() => {
    eventBus = new MockEventBus();
    inputSystem = new MockInputSystem();
    rng = new MockRNG();

    drivingSystem = new DrivingSystemPure(eventBus as any, inputSystem as any, rng as any);

    // Reset RNG mock
    rng = new MockRNG();
    (drivingSystem as any).rng = rng;
  });

  describe('Core System Initialization', () => {
    test('should initialize with default configuration', () => {
      const config = drivingSystem.getConfig();

      expect(config.physicsUpdateRate).toBe(60);
      expect(config.enableDetailedCollisions).toBe(true);
      expect(config.enableDamageSystem).toBe(true);
      expect(config.enableFuelSystem).toBe(true);
      expect(config.gravity).toBe(9.81);
      expect(config.airDensity).toBe(1.225);
    });

    test('should initialize with default vehicles', () => {
      const vehicleDef = drivingSystem.getVehicleDefinition('demo-car');

      expect(vehicleDef).toBeDefined();
      expect(vehicleDef?.name).toBe('Demo Sports Car');
      expect(vehicleDef?.type).toBe('car');
      expect(vehicleDef?.maxSpeed).toBe(80);
      expect(vehicleDef?.mass).toBe(1200);
    });

    test('should initialize with default tracks', () => {
      const trackDef = drivingSystem.getTrack('demo-circuit');

      expect(trackDef).toBeDefined();
      expect(trackDef?.name).toBe('Demo Circuit');
      expect(trackDef?.type).toBe('circuit');
      expect(trackDef?.lapCount).toBe(3);
      expect(trackDef?.length).toBe(400);
    });

    test('should initialize with empty statistics', () => {
      const stats = drivingSystem.getStats();

      expect(stats.totalSessions).toBe(0);
      expect(stats.totalDistance).toBe(0);
      expect(stats.totalTime).toBe(0);
      expect(stats.totalCrashes).toBe(0);
      expect(stats.totalRepairs).toBe(0);
      expect(stats.totalFuelConsumed).toBe(0);
    });
  });

  describe('Vehicle Management', () => {
    test('should create vehicle instances', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      expect(vehicle?.definition.id).toBe('demo-car');
      expect(vehicle?.ownerId).toBe('test-player');
      expect(vehicle?.health).toBe(1000);
      expect(vehicle?.maxHealth).toBe(1000);
      expect(vehicle?.fuel).toBe(60);
      expect(vehicle?.maxFuel).toBe(60);
      expect(vehicle?.isEngineRunning).toBe(false);
      expect(vehicle?.currentSpeed).toBe(0);
    });

    test('should retrieve vehicle definitions', () => {
      const vehicleDef = drivingSystem.getVehicleDefinition('demo-car');
      const nonExistentVehicle = drivingSystem.getVehicleDefinition('non-existent');

      expect(vehicleDef).toBeDefined();
      expect(vehicleDef?.id).toBe('demo-car');
      expect(vehicleDef?.name).toBe('Demo Sports Car');
      expect(nonExistentVehicle).toBeNull();
    });

    test('should retrieve vehicle instances', () => {
      const createdVehicle = drivingSystem.createVehicle('demo-car', 'test-player');
      const retrievedVehicle = drivingSystem.getVehicleInstance(createdVehicle!.id);
      const nonExistentVehicle = drivingSystem.getVehicleInstance('non-existent');

      expect(retrievedVehicle).toBeDefined();
      expect(retrievedVehicle?.id).toBe(createdVehicle?.id);
      expect(nonExistentVehicle).toBeNull();
    });

    test('should validate vehicle properties', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        expect(vehicle.definition.maxSpeed).toBeGreaterThan(0);
        expect(vehicle.definition.mass).toBeGreaterThan(0);
        expect(vehicle.definition.acceleration).toBeGreaterThan(0);
        expect(vehicle.definition.handling).toBeGreaterThanOrEqual(0);
        expect(vehicle.definition.handling).toBeLessThanOrEqual(1);
        expect(vehicle.fuel).toBeGreaterThanOrEqual(0);
        expect(vehicle.fuel).toBeLessThanOrEqual(vehicle.maxFuel);
      }
    });

    test('should handle vehicle abilities', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        expect(vehicle.definition.abilities).toBeDefined();
        expect(vehicle.definition.abilities.length).toBeGreaterThan(0);

        const boostAbility = vehicle.definition.abilities.find(a => a.type === 'active');
        expect(boostAbility).toBeDefined();
        expect(boostAbility?.effects).toBeDefined();
        expect(boostAbility?.effects.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Vehicle Physics', () => {
    test('should update vehicle physics correctly', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        // Start engine
        drivingSystem.startEngine(vehicle);

        // Apply throttle
        vehicle.throttle = 1.0;
        const initialSpeed = vehicle.currentSpeed;

        // Update physics
        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Speed should increase
        expect(vehicle.currentSpeed).toBeGreaterThan(initialSpeed);
        expect(vehicle.currentSpeed).toBeGreaterThan(0);
      }
    });

    test('should apply throttle force', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        drivingSystem.startEngine(vehicle);

        vehicle.throttle = 0.5;
        const initialVelocity = { ...vehicle.currentVelocity };

        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Velocity should change
        expect(vehicle.currentVelocity.x).toBeGreaterThan(initialVelocity.x);
        expect(vehicle.currentVelocity.z).toBeGreaterThan(initialVelocity.z);
      }
    });

    test('should apply braking force', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        drivingSystem.startEngine(vehicle);

        // Give some initial velocity
        vehicle.currentVelocity.x = 10;
        vehicle.currentSpeed = 10;

        vehicle.brakeInput = 1.0;
        const initialVelocity = { ...vehicle.currentVelocity };

        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Velocity should decrease
        expect(vehicle.currentVelocity.x).toBeLessThan(initialVelocity.x);
        expect(vehicle.currentSpeed).toBeLessThan(10);
      }
    });

    test('should apply steering', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        drivingSystem.startEngine(vehicle);

        // Give some initial velocity
        vehicle.currentVelocity.x = 10;
        vehicle.currentSpeed = 10;

        vehicle.steering = 0.5;
        const initialRotation = vehicle.currentRotation.y;

        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Rotation should change
        expect(vehicle.currentRotation.y).toBeGreaterThan(initialRotation);
      }
    });

    test('should apply drag forces', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        // Give some initial velocity
        vehicle.currentVelocity.x = 20;
        vehicle.currentSpeed = 20;

        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Drag should reduce velocity
        expect(vehicle.currentVelocity.x).toBeLessThan(20);
      }
    });

    test('should apply terrain effects', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        vehicle.currentTerrain = 'ice';
        vehicle.currentVelocity.x = 10;

        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Ice should reduce velocity more than normal
        expect(vehicle.currentVelocity.x).toBeLessThan(10);
      }
    });

    test('should update fuel consumption', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        drivingSystem.startEngine(vehicle);
        vehicle.currentSpeed = 20;
        const initialFuel = vehicle.fuel;

        drivingSystem.updateVehiclePhysics(vehicle.id, 1.0);

        // Fuel should decrease
        expect(vehicle.fuel).toBeLessThan(initialFuel);
        expect(vehicle.fuelConsumed).toBeGreaterThan(0);
      }
    });

    test('should handle engine stop when out of fuel', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        drivingSystem.startEngine(vehicle);
        vehicle.fuel = 0;

        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Engine should stop when out of fuel
        expect(vehicle.isEngineRunning).toBe(false);
      }
    });

    test('should update speed and RPM', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        drivingSystem.startEngine(vehicle);
        vehicle.currentVelocity.x = 20;

        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        expect(vehicle.currentSpeed).toBeGreaterThan(0);
        expect(vehicle.rpm).toBeGreaterThan(1000);
        expect(vehicle.gear).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Vehicle Abilities', () => {
    test('should activate vehicle abilities', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        // Set speed above requirement
        vehicle.currentSpeed = 25;

        const success = drivingSystem.activateAbility(vehicle.id, 'nitro-boost');

        expect(success).toBe(true);

        // Check if boost effect was applied
        expect(vehicle.isBoosting).toBe(true);
        expect(vehicle.activeEffects.size).toBeGreaterThan(0);
      }
    });

    test('should handle ability cooldowns', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        vehicle.currentSpeed = 25;

        // Activate ability
        drivingSystem.activateAbility(vehicle.id, 'nitro-boost');

        // Try to activate again immediately (should fail due to cooldown)
        const secondAttempt = drivingSystem.activateAbility(vehicle.id, 'nitro-boost');
        expect(secondAttempt).toBe(false);
      }
    });

    test('should check ability requirements', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        // Speed too low for boost
        vehicle.currentSpeed = 10;

        const attempt = drivingSystem.activateAbility(vehicle.id, 'nitro-boost');
        expect(attempt).toBe(false);
      }
    });

    test('should apply ability effects', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        vehicle.currentSpeed = 25;

        drivingSystem.activateAbility(vehicle.id, 'nitro-boost');

        // Should have boost effect
        const boostEffect = Array.from(vehicle.activeEffects.values()).find(e => e.type === 'speed');
        expect(boostEffect).toBeDefined();
        expect(boostEffect?.magnitude).toBeGreaterThan(1);
      }
    });
  });

  describe('Track Management', () => {
    test('should retrieve track definitions', () => {
      const trackDef = drivingSystem.getTrack('demo-circuit');
      const nonExistentTrack = drivingSystem.getTrack('non-existent-track');

      expect(trackDef).toBeDefined();
      expect(trackDef?.id).toBe('demo-circuit');
      expect(trackDef?.name).toBe('Demo Circuit');
      expect(nonExistentTrack).toBeNull();
    });

    test('should get all tracks', () => {
      const tracks = drivingSystem.getAllTracks();

      expect(Array.isArray(tracks)).toBe(true);
      expect(tracks.length).toBeGreaterThan(0);

      const demoTrack = tracks.find(t => t.id === 'demo-circuit');
      expect(demoTrack).toBeDefined();
    });

    test('should validate track properties', () => {
      const track = drivingSystem.getTrack('demo-circuit');

      expect(track).toBeDefined();
      if (track) {
        expect(track.length).toBeGreaterThan(0);
        expect(track.width).toBeGreaterThan(0);
        expect(track.lapCount).toBeGreaterThan(0);
        expect(track.allowedVehicles).toBeDefined();
        expect(track.allowedVehicles.length).toBeGreaterThan(0);
        expect(track.waypoints).toBeDefined();
        expect(track.waypoints.length).toBeGreaterThan(0);
      }
    });

    test('should support different track types', () => {
      const tracks = drivingSystem.getAllTracks();
      const circuitTracks = tracks.filter(t => t.type === 'circuit');
      const sprintTracks = tracks.filter(t => t.type === 'sprint');

      expect(circuitTracks.length).toBeGreaterThan(0);
      // Sprint tracks might not exist in default setup
    });
  });

  describe('Damage and Repair System', () => {
    test('should handle vehicle damage', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        const initialHealth = vehicle.health;

        // Apply damage
        drivingSystem.damageVehicle(vehicle, 100);

        expect(vehicle.health).toBeLessThan(initialHealth);
        expect(vehicle.damageTaken).toBeGreaterThan(0);
      }
    });

    test('should handle vehicle crashes', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        drivingSystem.startEngine(vehicle);

        // Set high downward velocity to trigger crash
        vehicle.currentVelocity.y = -20;
        vehicle.currentPosition.y = 10;

        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Vehicle should crash when hitting ground at high speed
        expect(vehicle.health).toBeLessThan(vehicle.maxHealth);
        expect(vehicle.isEngineRunning).toBe(false);
      }
    });

    test('should prevent destroyed vehicles from running', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        // Destroy the vehicle
        drivingSystem.damageVehicle(vehicle, vehicle.maxHealth);

        const startResult = drivingSystem.startEngine(vehicle);
        expect(startResult).toBe(false);
      }
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = {
        physicsUpdateRate: 30,
        enableDamageSystem: false,
        enableFuelSystem: false,
        collisionDamageMultiplier: 0.5
      };

      drivingSystem.updateConfig(newConfig);

      const updatedConfig = drivingSystem.getConfig();
      expect(updatedConfig.physicsUpdateRate).toBe(30);
      expect(updatedConfig.enableDamageSystem).toBe(false);
      expect(updatedConfig.enableFuelSystem).toBe(false);
      expect(updatedConfig.collisionDamageMultiplier).toBe(0.5);
    });

    test('should merge configuration updates', () => {
      const partialConfig = {
        physicsUpdateRate: 120
      };

      drivingSystem.updateConfig(partialConfig);

      const updatedConfig = drivingSystem.getConfig();
      expect(updatedConfig.physicsUpdateRate).toBe(120);
      expect(updatedConfig.enableDamageSystem).toBe(true); // Should remain unchanged
      expect(updatedConfig.gravity).toBe(9.81); // Should remain unchanged
    });
  });

  describe('Statistics Tracking', () => {
    test('should track driving statistics', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        drivingSystem.startEngine(vehicle);
        vehicle.currentSpeed = 20;
        vehicle.currentVelocity.x = 20;

        // Update physics to accumulate stats
        drivingSystem.updateVehiclePhysics(vehicle.id, 1.0);

        const stats = drivingSystem.getStats();
        expect(stats.totalDistance).toBeGreaterThan(0);
        expect(stats.totalTime).toBeGreaterThan(0);
        expect(stats.averageSpeed).toBeGreaterThan(0);
      }
    });

    test('should track multiple vehicles', () => {
      const vehicle1 = drivingSystem.createVehicle('demo-car', 'player1');
      const vehicle2 = drivingSystem.createVehicle('demo-bike', 'player2');

      expect(vehicle1).toBeDefined();
      expect(vehicle2).toBeDefined();

      if (vehicle1 && vehicle2) {
        const stats = drivingSystem.getStats();
        expect(stats.vehiclesOwned).toBeGreaterThan(0);
      }
    });
  });

  describe('Event System Integration', () => {
    test('should emit events for vehicle lifecycle', () => {
      let vehicleCreated = false;
      let engineStarted = false;

      eventBus.on('driving:vehicle-created', (data) => {
        vehicleCreated = true;
        expect(data.vehicleId).toBeDefined();
        expect(data.vehicleType).toBe('demo-car');
        expect(data.ownerId).toBe('test-player');
      });

      eventBus.on('driving:engine-started', (data) => {
        engineStarted = true;
        expect(data.vehicleId).toBeDefined();
        expect(data.vehicleType).toBe('demo-car');
      });

      // Create vehicle and start engine
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');
      expect(vehicleCreated).toBe(true);

      if (vehicle) {
        drivingSystem.startEngine(vehicle);
        expect(engineStarted).toBe(true);
      }
    });

    test('should emit events for damage and crashes', () => {
      let vehicleDamaged = false;
      let vehicleCrashed = false;

      eventBus.on('driving:vehicle-damaged', (data) => {
        vehicleDamaged = true;
        expect(data.vehicleId).toBeDefined();
        expect(data.damage).toBeGreaterThan(0);
        expect(data.currentHealth).toBeLessThan(data.maxHealth);
      });

      eventBus.on('driving:vehicle-crashed', (data) => {
        vehicleCrashed = true;
        expect(data.vehicleId).toBeDefined();
        expect(data.position).toBeDefined();
      });

      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      if (vehicle) {
        // Damage vehicle
        drivingSystem.damageVehicle(vehicle, 100);
        expect(vehicleDamaged).toBe(true);

        // Crash vehicle
        drivingSystem.crashVehicle(vehicle);
        expect(vehicleCrashed).toBe(true);
      }
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple vehicles efficiently', () => {
      const startTime = performance.now();

      // Create many vehicles
      const vehicles = [];
      for (let i = 0; i < 50; i++) {
        const vehicle = drivingSystem.createVehicle('demo-car', `player-${i}`);
        vehicles.push(vehicle);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200); // Should be reasonably fast

      // Update physics for all vehicles
      const updateStartTime = performance.now();
      vehicles.forEach(vehicle => {
        if (vehicle) {
          drivingSystem.updateVehiclePhysics(vehicle.id, 0.016); // ~60 FPS
        }
      });
      const updateEndTime = performance.now();
      const updateDuration = updateEndTime - updateStartTime;

      expect(updateDuration).toBeLessThan(100); // Physics updates should be fast
    });

    test('should handle physics updates without memory leaks', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      if (vehicle) {
        // Perform many physics updates
        for (let i = 0; i < 1000; i++) {
          drivingSystem.updateVehiclePhysics(vehicle.id, 0.016);
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not have excessive memory usage
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid vehicle IDs gracefully', () => {
      const result = drivingSystem.createVehicle('invalid-vehicle', 'test-player');
      expect(result).toBeNull();
    });

    test('should handle physics updates for non-existent vehicles', () => {
      // Should not throw errors
      expect(() => {
        drivingSystem.updateVehiclePhysics('non-existent-vehicle', 0.1);
      }).not.toThrow();
    });

    test('should handle ability activation for non-existent vehicles', () => {
      const result = drivingSystem.activateAbility('non-existent-vehicle', 'test-ability');
      expect(result).toBe(false);
    });

    test('should handle damage to non-existent vehicles', () => {
      // Should not throw errors
      expect(() => {
        drivingSystem.damageVehicle({} as VehicleInstance, 100);
      }).not.toThrow();
    });

    test('should handle engine operations on destroyed vehicles', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      if (vehicle) {
        // Destroy vehicle
        drivingSystem.damageVehicle(vehicle, vehicle.maxHealth);

        // Try to start engine
        const startResult = drivingSystem.startEngine(vehicle);
        expect(startResult).toBe(false);
      }
    });

    test('should handle zero delta time in physics updates', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      if (vehicle) {
        // Should not throw errors with zero delta time
        expect(() => {
          drivingSystem.updateVehiclePhysics(vehicle.id, 0);
        }).not.toThrow();
      }
    });
  });

  describe('Advanced Features', () => {
    test('should support different vehicle types', () => {
      const car = drivingSystem.getVehicleDefinition('demo-car');
      const bike = drivingSystem.getVehicleDefinition('demo-bike');

      expect(car).toBeDefined();
      expect(bike).toBeDefined();

      if (car && bike) {
        expect(car.type).toBe('car');
        expect(bike.type).toBe('bike');
        expect(car.mass).toBeGreaterThan(bike.mass);
        expect(car.handling).toBeLessThan(bike.handling);
      }
    });

    test('should support vehicle upgrades', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        expect(vehicle.definition.upgradeSlots).toBeGreaterThan(0);
        expect(vehicle.definition.compatibleUpgrades).toBeDefined();
        expect(vehicle.definition.compatibleUpgrades.length).toBeGreaterThan(0);
      }
    });

    test('should support different track types', () => {
      const tracks = drivingSystem.getAllTracks();
      const circuitTracks = tracks.filter(t => t.type === 'circuit');

      expect(circuitTracks.length).toBeGreaterThan(0);

      const track = circuitTracks[0!];
      expect(track.lapCount).toBeGreaterThan(1);
      expect(track.direction).toBeDefined();
      expect(track.allowedVehicles).toBeDefined();
    });

    test('should handle terrain modifiers', () => {
      const vehicle = drivingSystem.createVehicle('demo-car', 'test-player');

      expect(vehicle).toBeDefined();
      if (vehicle) {
        vehicle.currentTerrain = 'ice';

        // Update physics with terrain effects
        drivingSystem.updateVehiclePhysics(vehicle.id, 0.1);

        // Should apply terrain modifiers
        expect(vehicle.terrainModifiers.has('ice')).toBe(true);
      }
    });
  });
});