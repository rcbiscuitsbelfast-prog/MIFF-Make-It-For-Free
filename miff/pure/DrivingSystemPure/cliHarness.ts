#!/usr/bin/env node

/**
 * MIFF DrivingSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the DrivingSystemPure with vehicle physics and racing mechanics
 */

import * as readline from 'readline';
import {
  DrivingSystemPure,
  VehicleDefinition,
  VehicleInstance,
  DrivingSession,
  TrackDefinition
} from './index';

// Mock dependencies for CLI demo
class MockEventBus {
  emit(event: string, data: any) {
    console.log(`📡 Event: ${event}`, data);
  }

  on(event: string, handler: Function) {
    // Mock implementation
  }
}

class MockInputSystem {
  // Mock implementation
}

class MockRNG {
  nextFloat(): number {
    return Math.random();
  }
}

class DrivingSystemCLI {
  private rl: readline?.Interface;
  private drivingSystem: DrivingSystemPure;
  private isRunning: boolean = false;
  private currentVehicle: VehicleInstance | null = null;
  private currentSession: DrivingSession | null = null;
  private lastUpdateTime: number = new Date();

  constructor() {
    this?.rl = readline?.createInterface({
      input: process?.stdin,
      output: process?.stdout
    });

    // Initialize mock systems
    const eventBus = new MockEventBus() as any;
    const inputSystem = new MockInputSystem() as any;
    const rng = new MockRNG() as any;

    this?.drivingSystem = new DrivingSystemPure(eventBus, inputSystem, rng);
    this?.setupDemoData();
  }

  /**
   * Setup demo data for demonstration
   */
  private setupDemoData(): void {
    console.log('🚗 Setting up driving demo data...');

    // Demo vehicles and tracks are already created in the system
    console.log('✅ Demo data setup complete!');
    console.log('✅ Driving system ready for testing!');
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this?.isRunning = true;
    console.log('🚗 Welcome to MIFF DrivingSystemPure CLI!');
    console.log('=========================================');
    console.log('Available commands:');
    console.log('  vehicles       - List all available vehicles');
    console.log('  create-vehicle - Create a new vehicle');
    console.log('  select <vehicle> - Select a vehicle to drive');
    console.log('  tracks         - List all available tracks');
    console.log('  start-race     - Start a racing session');
    console.log('  drive          - Drive current vehicle');
    console.log('  controls       - Show driving controls');
    console.log('  status         - Show current vehicle status');
    console.log('  stats          - Show driving statistics');
    console.log('  demo           - Run automated demo');
    console.log('  help           - Show this help');
    console.log('  exit           - Exit the CLI');
    console.log('');

    this?.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this?.rl.question('driving> ', (input) => {
      this?.processCommand(input?.trim());
    });
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    if (!this?.isRunning) return;

    const parts = input?.split(' ');
    const command = parts[0!]?.toLowerCase();
    const args = parts?.slice(1);

    try {
      switch (command) {
        case 'vehicles':
          this?.showVehicles();
          break;

        case 'create-vehicle':
          await this?.createVehicleInteractive();
          break;

        case 'select':
          if (args?.length === 0) {
            console.log('❌ Usage: select <vehicle-id>');
          } else {
            this?.selectVehicle(args[0!]);
          }
          break;

        case 'tracks':
          this?.showTracks();
          break;

        case 'start-race':
          await this?.startRaceInteractive();
          break;

        case 'drive':
          await this?.driveInteractive();
          break;

        case 'controls':
          this?.showControls();
          break;

        case 'status':
          this?.showVehicleStatus();
          break;

        case 'stats':
          this?.showStats();
          break;

        case 'demo':
          await this?.runDemo();
          break;

        case 'help':
          this?.showHelp();
          break;

        case 'exit':
          this?.exit();
          return;

        default:
          console.log(`❓ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
          break;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Error: ${error.message}`);
    }

    if (this?.isRunning) {
      this?.showPrompt();
    }
  }

  /**
   * Show available vehicles
   */
  private showVehicles(): void {
    const vehicles = this?.getAvailableVehicles();

    console.log('\n🚗 Available Vehicles:');
    console.log('=======================');

    if (vehicles?.length === 0) {
      console.log('No vehicles available. Create some with "create-vehicle"');
      return;
    }

    vehicles?.forEach((vehicle: any) => {
      console.log(`${vehicle.name} (${vehicle.id})`);
      console.log(`  Type: ${vehicle.type} | Category: ${vehicle.category}`);
      console.log(`  Max Speed: ${vehicle.maxSpeed} m/s (${(vehicle.maxSpeed * 3.6).toFixed(0)} km/h)`);
      console.log(`  Acceleration: ${vehicle.acceleration} m/s²`);
      console.log(`  Mass: ${vehicle.mass} kg`);
      console.log(`  Handling: ${(vehicle.handling * 100).toFixed(0)}%`);
      console.log(`  Fuel Capacity: ${vehicle.fuelCapacity || 'N/A'}`);
      console.log(`  Value: $${vehicle.value.toLocaleString()}`);
      console.log('');
    });
  }

  /**
   * Get available vehicles (mock implementation)
   */
  private getAvailableVehicles(): VehicleDefinition[] {
    // This would normally come from the driving system
    // For demo purposes, return mock data
    return [
      {
        id: 'demo-car',
        name: 'Demo Sports Car',
        type: 'car',
        category: 'land',
        description: 'A high-performance sports car for racing',
        mass: 1200,
        dragCoefficient: 0.3,
        frictionCoefficient: 0.8,
        maxSpeed: 80,
        acceleration: 15,
        brakingForce: 25,
        handling: 0.9,
        length: 4.5,
        width: 2.0,
        height: 1.2,
        terrainTypes: ['road', 'track'],
        weatherEffects: new Map([['rain', -0.2]]),
        abilities: [
          {
            id: 'nitro-boost',
            name: 'Nitro Boost',
            description: 'Temporary speed boost',
            type: 'active',
            cooldown: 30000,
            duration: 5000,
            activationRequirements: ['speed-above-50'],
            effects: [
              {
                type: 'speed',
                magnitude: 2.0,
                duration: 5000,
                condition: 'boost-active',
                description: 'Massive speed increase'
              }
            ]
          }
        ],
        boostPower: 2.5,
        model: 'sports_car',
        texture: 'red_sports',
        soundProfile: 'sports_engine',
        particleEffects: ['tire_smoke'],
        fuelCapacity: 60,
        fuelConsumption: 0.1,
        durability: 1000,
        repairCost: 500,
        upgradeSlots: 4,
        compatibleUpgrades: ['engine', 'tires'],
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
        mass: 200,
        dragCoefficient: 0.4,
        frictionCoefficient: 0.7,
        maxSpeed: 70,
        acceleration: 20,
        brakingForce: 30,
        handling: 0.95,
        length: 2.0,
        width: 0.8,
        height: 1.1,
        terrainTypes: ['road', 'track'],
        weatherEffects: new Map([['rain', -0.3]]),
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
                magnitude: 1.3,
                duration: 3000,
                condition: 'wheelie-active',
                description: 'Wheelie speed bonus'
              }
            ]
          }
        ],
        model: 'racing_bike',
        texture: 'blue_bike',
        soundProfile: 'bike_engine',
        particleEffects: [],
        fuelCapacity: 20,
        fuelConsumption: 0.15,
        durability: 500,
        repairCost: 300,
        upgradeSlots: 3,
        compatibleUpgrades: ['engine'],
        unlockRequirements: [],
        skillRequirements: new Map([['driving', 2]]),
        manufacturer: 'Demo Bikes',
        modelYear: 2025,
        rarity: 'uncommon',
        value: 25000
      }
    ];
  }

  /**
   * Select a vehicle to drive
   */
  private selectVehicle(vehicleId: string): void {
    const vehicles = this?.getAvailableVehicles();
    const vehicle = vehicles?.find(v => v?.id === vehicleId);

    if (!vehicle) {
      console.log(`❌ Vehicle not found: ${vehicleId}`);
      return;
    }

    // Create vehicle instance
    this?.currentVehicle = this?.drivingSystem.createVehicle(vehicleId, 'demo-player');

    if (this?.currentVehicle) {
      console.log(`✅ Selected vehicle: ${vehicle.name}`);
      console.log(`   Type: ${vehicle.type}`);
      console.log(`   Max Speed: ${vehicle.maxSpeed} m/s`);
      console.log(`   Mass: ${vehicle.mass} kg`);
    } else {
      console.log('❌ Failed to create vehicle instance');
    }
  }

  /**
   * Show available tracks
   */
  private showTracks(): void {
    const tracks = this?.getAvailableTracks();

    console.log('\n🏁 Available Tracks:');
    console.log('====================');

    if (tracks?.length === 0) {
      console.log('No tracks available.');
      return;
    }

    tracks?.forEach((track: any) => {
      console.log(`${track.name} (${track.id})`);
      console.log(`  Type: ${track.type}`);
      console.log(`  Length: ${track.length}m`);
      console.log(`  Laps: ${track.lapCount}`);
      console.log(`  Allowed Vehicles: ${track.allowedVehicles.join(', ')}`);
      console.log(`  Description: ${track.description}`);
      console.log('');
    });
  }

  /**
   * Get available tracks (mock implementation)
   */
  private getAvailableTracks(): TrackDefinition[] {
    return [
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
        allowedVehicles: ['car', 'bike'],
        penalties: new Map([['off-track', 5]]),
        environment: 'racetrack',
        lighting: 'day',
        skybox: 'clear_sky',
        backgroundMusic: 'race_music',
        ambientSounds: ['engine_sounds']
      }
    ];
  }

  /**
   * Start a race interactively
   */
  private async startRaceInteractive(): Promise<void> {
    if (!this?.currentVehicle) {
      console.log('❌ No vehicle selected. Use "select <vehicle>" first.');
      return;
    }

    console.log('\n🏁 Starting Race');
    console.log('================');

    const trackId = await this?.askQuestion('Track ID (demo-circuit): ') || 'demo-circuit';
    const laps = parseInt(await this?.askQuestion('Number of laps (3): ') || '3');

    console.log(`🏁 Starting race on ${trackId} with ${laps} laps...`);

    // This would normally create a driving session
    console.log('✅ Race started!');
  }

  /**
   * Drive interactively
   */
  private async driveInteractive(): Promise<void> {
    if (!this?.currentVehicle) {
      console.log('❌ No vehicle selected. Use "select <vehicle>" first.');
      return;
    }

    console.log('\n🚗 Driving Mode');
    console.log('===============');
    console.log('Use arrow keys or WASD to control the vehicle');
    console.log('Press SPACE for boost, ENTER to exit');

    // Simple driving simulation
    const startTime = new Date();
    let distance = 0;

    while (this?.isRunning) {
      const now = new Date();
      const deltaTime = (now - this?.lastUpdateTime) / 1000;
      this?.lastUpdateTime = now;

      // Update vehicle physics (mock)
      distance += this?.currentVehicle.currentSpeed * deltaTime;

      // Show driving status
      console.log(`\rSpeed: ${this.currentVehicle.currentSpeed.toFixed(1)} m/s | Distance: ${distance.toFixed(0)}m | Fuel: ${this.currentVehicle.fuel.toFixed(1)}L`);

      // Check for input
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simple exit condition
      if (distance > 1000) {
        console.log('\n🏁 Reached 1km! Race complete.');
        break;
      }
    }
  }

  /**
   * Show driving controls
   */
  private showControls(): void {
    console.log('\n🎮 Driving Controls:');
    console.log('====================');
    console.log('W/↑ - Accelerate/Throttle');
    console.log('S/↓ - Brake/Reverse');
    console.log('A/← - Steer Left');
    console.log('D/→ - Steer Right');
    console.log('SPACE - Boost (if available)');
    console.log('E - Use Ability');
    console.log('R - Repair Vehicle');
    console.log('F - Refuel');
    console.log('ESC - Exit driving mode');
    console.log('');
    console.log('Vehicle Abilities:');
    console.log('  Sports Car: Nitro Boost');
    console.log('  Racing Bike: Wheelie');
    console.log('');
  }

  /**
   * Show vehicle status
   */
  private showVehicleStatus(): void {
    if (!this?.currentVehicle) {
      console.log('❌ No vehicle selected');
      return;
    }

    const vehicle = this?.currentVehicle;
    const definition = vehicle?.definition;

    console.log('\n📊 Vehicle Status:');
    console.log('==================');
    console.log(`${definition.name} (${vehicle.id})`);
    console.log(`Position: (${vehicle.currentPosition.x.toFixed(1)}, ${vehicle.currentPosition.y.toFixed(1)}, ${vehicle.currentPosition.z.toFixed(1)})`);
    console.log(`Speed: ${vehicle.currentSpeed.toFixed(1)} m/s (${(vehicle.currentSpeed * 3.6).toFixed(0)} km/h)`);
    console.log(`Engine: ${vehicle.isEngineRunning ? '🟢 Running' : '🔴 Stopped'}`);
    console.log(`Health: ${vehicle.health}/${vehicle.maxHealth} (${((vehicle.health / vehicle.maxHealth) * 100).toFixed(1)}%)`);
    console.log(`Fuel: ${vehicle.fuel.toFixed(1)}/${vehicle.maxFuel.toFixed(1)}L`);
    console.log(`Terrain: ${vehicle.currentTerrain}`);
    console.log(`Distance Traveled: ${vehicle.distanceTraveled.toFixed(0)}m`);
    console.log(`Time Driven: ${Math.round(vehicle.timeDriven)}s`);
    console.log('');
  }

  /**
   * Show driving statistics
   */
  private showStats(): void {
    const stats = this?.drivingSystem.getStats();

    console.log('\n📊 Driving Statistics:');
    console.log('======================');
    console.log(`Total Sessions: ${stats.totalSessions}`);
    console.log(`Total Distance: ${stats.totalDistance.toLocaleString()}m`);
    console.log(`Total Time: ${Math.round(stats.totalTime)}s`);
    console.log(`Total Crashes: ${stats.totalCrashes}`);
    console.log(`Total Repairs: ${stats.totalRepairs}`);
    console.log(`Total Fuel Consumed: ${stats.totalFuelConsumed.toFixed(1)}L`);
    console.log(`Average Speed: ${stats.averageSpeed.toFixed(1)} m/s`);
    console.log(`Best Lap Time: ${stats.bestLapTime}s`);
    console.log(`Vehicles Owned: ${stats.vehiclesOwned}`);
    console.log(`Tracks Completed: ${stats.tracksCompleted}`);
    console.log(`Achievements: ${stats.achievements.length}`);
    console.log(`Favorite Vehicle: ${stats.favoriteVehicle || 'None'}`);
    console.log(`Favorite Track: ${stats.favoriteTrack || 'None'}`);
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    console.log('\n🚗 Running Driving System Demo...');
    console.log('===================================');

    // Show available vehicles
    console.log('\n🚗 Available vehicles:');
    this?.showVehicles();

    // Select a vehicle
    console.log('\n🎯 Selecting demo car...');
    this?.selectVehicle('demo-car');

    // Show tracks
    console.log('\n🏁 Available tracks:');
    this?.showTracks();

    // Start a race
    console.log('\n🏁 Starting demo race...');
    await this?.startRaceInteractive();

    // Drive for a bit
    console.log('\n🚗 Demo drive mode...');
    await this?.driveInteractive();

    // Show final stats
    console.log('\n📊 Demo Results:');
    this?.showStats();

    console.log('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('\n🚗 MIFF DrivingSystemPure CLI Help');
    console.log('==================================');
    console.log('');
    console.log('COMMANDS:');
    console.log('  vehicles       - List all available vehicles');
    console.log('  create-vehicle - Create a new vehicle');
    console.log('  select <id>    - Select a vehicle to drive');
    console.log('  tracks         - List all available tracks');
    console.log('  start-race     - Start a racing session');
    console.log('  drive          - Drive current vehicle');
    console.log('  controls       - Show driving controls');
    console.log('  status         - Show current vehicle status');
    console.log('  stats          - Show driving statistics');
    console.log('  demo           - Run automated demo sequence');
    console.log('  help           - Show this help information');
    console.log('  exit           - Exit the CLI');
    console.log('');
    console.log('VEHICLE TYPES:');
    console.log('  car            - Standard passenger vehicles');
    console.log('  bike           - Motorcycles and bikes');
    console.log('  truck          - Heavy-duty vehicles');
    console.log('  boat           - Watercraft');
    console.log('  aircraft       - Flying vehicles');
    console.log('');
    console.log('DRIVING CONTROLS:');
    console.log('  W/↑ - Accelerate');
    console.log('  S/↓ - Brake');
    console.log('  A/← - Steer Left');
    console.log('  D/→ - Steer Right');
    console.log('  SPACE - Boost');
    console.log('  E - Use Ability');
    console.log('');
    console.log('NOTES:');
    console.log('- Different vehicles have different handling characteristics');
    console.log('- Terrain affects vehicle performance');
    console.log('- Weather conditions impact driving');
    console.log('- Fuel management is important for long drives');
    console.log('- Vehicle damage affects performance');
  }

  /**
   * Create vehicle interactively
   */
  private async createVehicleInteractive(): Promise<void> {
    console.log('\n🆕 Creating New Vehicle');
    console.log('=======================');

    const name = await this?.askQuestion('Vehicle name: ');
    const type = await this?.askQuestion('Vehicle type (car/bike/truck/boat/aircraft): ');

    console.log(`✅ Vehicle "${name}" created successfully!`);
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    console.log('\n👋 Thank you for using MIFF DrivingSystemPure CLI!');
    this?.isRunning = false;
    this?.rl.close();
    process?.exit(0);
  }

  /**
   * Ask a question
   */
  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this?.rl.question(question, (answer) => {
        resolve(answer?.trim());
      });
    });
  }
}

// Main execution
if (require?.main === module) {
  const cli = new DrivingSystemCLI();
  cli?.start();
}

module?.exports = DrivingSystemCLI;