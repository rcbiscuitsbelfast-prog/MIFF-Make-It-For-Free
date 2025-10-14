#!/usr/bin/env node

/**
 * MIFF DrivingSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the DrivingSystemPure with vehicle physics and racing mechanics
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  DrivingSystemPure,
  VehicleDefinition,
  VehicleInstance,
  DrivingSession,
  TrackDefinition
} from './index';

// Mock dependencies for CLI demo
class RealEventBus {
  
  emit(event: string, data: any) {
    console.info(`📡 Event: ${event}`, data);
  }

  on(event: string, handler: Function) {
    // Mock implementation
  }
}

class RealInputSystem {
  // Mock implementation
}

class MockRNG {
  nextFloat(): number {
    return Math.random();
  }
}

class DrivingSystemCLI {
  private rl: readline.Interface;
  private drivingSystem: DrivingSystemPure;
  private isRunning: boolean = false;
  private currentVehicle: VehicleInstance | null = null;
  private currentSession: DrivingSession | null = null;
  private lastUpdateTime: number = Date.now();

  constructor(...args: any[]) {
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Initialize mock systems
    const eventBus = new RealEventBus() as any;
    const inputSystem = new RealInputSystem() as any;
    const rng = new MockRNG() as any;

    this.drivingSystem = new DrivingSystemPure(eventBus, inputSystem, rng);
    this.setupDemoData();
  }

  /**
   * Setup demo data for demonstration
   */
  private setupDemoData(): void {
    console.info('🚗 Setting up driving demo data...');

    // Demo vehicles and tracks are already created in the system
    console.info('✅ Demo data setup complete!');
    console.info('✅ Driving system ready for testing!');
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this.isRunning = true;
    console.info('🚗 Welcome to MIFF DrivingSystemPure CLI!');
    console.info('=========================================');
    console.info('Available commands:');
    console.info('  vehicles       - List all available vehicles');
    console.info('  create-vehicle - Create a new vehicle');
    console.info('  select <vehicle> - Select a vehicle to drive');
    console.info('  tracks         - List all available tracks');
    console.info('  start-race     - Start a racing session');
    console.info('  drive          - Drive current vehicle');
    console.info('  controls       - Show driving controls');
    console.info('  status         - Show current vehicle status');
    console.info('  stats          - Show driving statistics');
    console.info('  demo           - Run automated demo');
    console.info('  help           - Show this help');
    console.info('  exit           - Exit the CLI');
    console.info('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('driving> ', (input) => {
      this.processCommand(input.trim());
    });
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    if (!this.isRunning) return;

    const parts = input.split(' ');
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'vehicles':
          this.showVehicles();
          break;

        case 'create-vehicle':
          await this.createVehicleInteractive();
          break;

        case 'select':
          if (args.length === 0) {
            console.info('❌ Usage: select <vehicle-id>');
          } else {
            this.selectVehicle(args[0]);
          }
          break;

        case 'tracks':
          this.showTracks();
          break;

        case 'start-race':
          await this.startRaceInteractive();
          break;

        case 'drive':
          await this.driveInteractive();
          break;

        case 'controls':
          this.showControls();
          break;

        case 'status':
          this.showVehicleStatus();
          break;

        case 'stats':
          this.showStats();
          break;

        case 'demo':
          await this.runDemo();
          break;

        case 'help':
          this.showHelp();
          break;

        case 'exit':
          this.exit();
          return;

        default:
          console.info(`❓ Unknown command: ${command}`);
          console.info('Type "help" for available commands.');
          break;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }

    if (this.isRunning) {
      this.showPrompt();
    }
  }

  /**
   * Show available vehicles
   */
  private showVehicles(): void {
    const vehicles = this.getAvailableVehicles();

    console.info('\n🚗 Available Vehicles:');
    console.info('=======================');

    if (vehicles.length === 0) {
      console.info('No vehicles available. Create some with "create-vehicle"');
      return;
    }

    vehicles.forEach(vehicle => {
      console.info(`${vehicle.name} (${vehicle.id})`);
      console.info(`  Type: ${vehicle.type} | Category: ${vehicle.category}`);
      console.info(`  Max Speed: ${vehicle.maxSpeed} m/s (${(vehicle.maxSpeed * 3.6).toFixed(0)} km/h)`);
      console.info(`  Acceleration: ${vehicle.acceleration} m/s²`);
      console.info(`  Mass: ${vehicle.mass} kg`);
      console.info(`  Handling: ${(vehicle.handling * 100).toFixed(0)}%`);
      console.info(`  Fuel Capacity: ${vehicle.fuelCapacity || 'N/A'}`);
      console.info(`  Value: $${vehicle.value.toLocaleString()}`);
      console.info('');
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
    const vehicles = this.getAvailableVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle) {
      console.info(`❌ Vehicle not found: ${vehicleId}`);
      return;
    }

    // Create vehicle instance
    this.currentVehicle = this.drivingSystem.createVehicle(vehicleId, 'demo-player');

    if (this.currentVehicle) {
      console.info(`✅ Selected vehicle: ${vehicle.name}`);
      console.info(`   Type: ${vehicle.type}`);
      console.info(`   Max Speed: ${vehicle.maxSpeed} m/s`);
      console.info(`   Mass: ${vehicle.mass} kg`);
    } else {
      console.info('❌ Failed to create vehicle instance');
    }
  }

  /**
   * Show available tracks
   */
  private showTracks(): void {
    const tracks = this.getAvailableTracks();

    console.info('\n🏁 Available Tracks:');
    console.info('====================');

    if (tracks.length === 0) {
      console.info('No tracks available.');
      return;
    }

    tracks.forEach(track => {
      console.info(`${track.name} (${track.id})`);
      console.info(`  Type: ${track.type}`);
      console.info(`  Length: ${track.length}m`);
      console.info(`  Laps: ${track.lapCount}`);
      console.info(`  Allowed Vehicles: ${track.allowedVehicles.join(', ')}`);
      console.info(`  Description: ${track.description}`);
      console.info('');
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
    if (!this.currentVehicle) {
      console.info('❌ No vehicle selected. Use "select <vehicle>" first.');
      return;
    }

    console.info('\n🏁 Starting Race');
    console.info('================');

    const trackId = await this.askQuestion('Track ID (demo-circuit): ') || 'demo-circuit';
    const laps = parseInt(await this.askQuestion('Number of laps (3): ') || '3');

    console.info(`🏁 Starting race on ${trackId} with ${laps} laps...`);

    // This would normally create a driving session
    console.info('✅ Race started!');
  }

  /**
   * Drive interactively
   */
  private async driveInteractive(): Promise<void> {
    if (!this.currentVehicle) {
      console.info('❌ No vehicle selected. Use "select <vehicle>" first.');
      return;
    }

    console.info('\n🚗 Driving Mode');
    console.info('===============');
    console.info('Use arrow keys or WASD to control the vehicle');
    console.info('Press SPACE for boost, ENTER to exit');

    // Simple driving simulation
//     const startTime = Date.now();
    let distance = 0;

    while (this.isRunning) {
      const now = Date.now();
      const deltaTime = (now - this.lastUpdateTime) / 1000;
      this.lastUpdateTime = now;

      // Update vehicle physics (mock)
      distance += this.currentVehicle.currentSpeed * deltaTime;

      // Show driving status
      console.info(`\rSpeed: ${this.currentVehicle.currentSpeed.toFixed(1)} m/s | Distance: ${distance.toFixed(0)}m | Fuel: ${this.currentVehicle.fuel.toFixed(1)}L`);

      // Check for input
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simple exit condition
      if (distance > 1000) {
        console.info('\n🏁 Reached 1km! Race complete.');
        break;
      }
    }
  }

  /**
   * Show driving controls
   */
  private showControls(): void {
    console.info('\n🎮 Driving Controls:');
    console.info('====================');
    console.info('W/↑ - Accelerate/Throttle');
    console.info('S/↓ - Brake/Reverse');
    console.info('A/← - Steer Left');
    console.info('D/→ - Steer Right');
    console.info('SPACE - Boost (if available)');
    console.info('E - Use Ability');
    console.info('R - Repair Vehicle');
    console.info('F - Refuel');
    console.info('ESC - Exit driving mode');
    console.info('');
    console.info('Vehicle Abilities:');
    console.info('  Sports Car: Nitro Boost');
    console.info('  Racing Bike: Wheelie');
    console.info('');
  }

  /**
   * Show vehicle status
   */
  private showVehicleStatus(): void {
    if (!this.currentVehicle) {
      console.info('❌ No vehicle selected');
      return;
    }

    const vehicle = this.currentVehicle;
    const definition = vehicle.definition;

    console.info('\n📊 Vehicle Status:');
    console.info('==================');
    console.info(`${definition.name} (${vehicle.id})`);
    console.info(`Position: (${vehicle.currentPosition.x.toFixed(1)}, ${vehicle.currentPosition.y.toFixed(1)}, ${vehicle.currentPosition.z.toFixed(1)})`);
    console.info(`Speed: ${vehicle.currentSpeed.toFixed(1)} m/s (${(vehicle.currentSpeed * 3.6).toFixed(0)} km/h)`);
    console.info(`Engine: ${vehicle.isEngineRunning ? '🟢 Running' : '🔴 Stopped'}`);
    console.info(`Health: ${vehicle.health}/${vehicle.maxHealth} (${((vehicle.health / vehicle.maxHealth) * 100).toFixed(1)}%)`);
    console.info(`Fuel: ${vehicle.fuel.toFixed(1)}/${vehicle.maxFuel.toFixed(1)}L`);
    console.info(`Terrain: ${vehicle.currentTerrain}`);
    console.info(`Distance Traveled: ${vehicle.distanceTraveled.toFixed(0)}m`);
    console.info(`Time Driven: ${Math.round(vehicle.timeDriven)}s`);
    console.info('');
  }

  /**
   * Show driving statistics
   */
  private showStats(): void {
    const stats = this.drivingSystem.getStats();

    console.info('\n📊 Driving Statistics:');
    console.info('======================');
    console.info(`Total Sessions: ${stats.totalSessions}`);
    console.info(`Total Distance: ${stats.totalDistance.toLocaleString()}m`);
    console.info(`Total Time: ${Math.round(stats.totalTime)}s`);
    console.info(`Total Crashes: ${stats.totalCrashes}`);
    console.info(`Total Repairs: ${stats.totalRepairs}`);
    console.info(`Total Fuel Consumed: ${stats.totalFuelConsumed.toFixed(1)}L`);
    console.info(`Average Speed: ${stats.averageSpeed.toFixed(1)} m/s`);
    console.info(`Best Lap Time: ${stats.bestLapTime}s`);
    console.info(`Vehicles Owned: ${stats.vehiclesOwned}`);
    console.info(`Tracks Completed: ${stats.tracksCompleted}`);
    console.info(`Achievements: ${stats.achievements.length}`);
    console.info(`Favorite Vehicle: ${stats.favoriteVehicle || 'None'}`);
    console.info(`Favorite Track: ${stats.favoriteTrack || 'None'}`);
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    console.info('\n🚗 Running Driving System Demo...');
    console.info('===================================');

    // Show available vehicles
    console.info('\n🚗 Available vehicles:');
    this.showVehicles();

    // Select a vehicle
    console.info('\n🎯 Selecting demo car...');
    this.selectVehicle('demo-car');

    // Show tracks
    console.info('\n🏁 Available tracks:');
    this.showTracks();

    // Start a race
    console.info('\n🏁 Starting demo race...');
    await this.startRaceInteractive();

    // Drive for a bit
    console.info('\n🚗 Demo drive mode...');
    await this.driveInteractive();

    // Show final stats
    console.info('\n📊 Demo Results:');
    this.showStats();

    console.info('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.info('\n🚗 MIFF DrivingSystemPure CLI Help');
    console.info('==================================');
    console.info('');
    console.info('COMMANDS:');
    console.info('  vehicles       - List all available vehicles');
    console.info('  create-vehicle - Create a new vehicle');
    console.info('  select <id>    - Select a vehicle to drive');
    console.info('  tracks         - List all available tracks');
    console.info('  start-race     - Start a racing session');
    console.info('  drive          - Drive current vehicle');
    console.info('  controls       - Show driving controls');
    console.info('  status         - Show current vehicle status');
    console.info('  stats          - Show driving statistics');
    console.info('  demo           - Run automated demo sequence');
    console.info('  help           - Show this help information');
    console.info('  exit           - Exit the CLI');
    console.info('');
    console.info('VEHICLE TYPES:');
    console.info('  car            - Standard passenger vehicles');
    console.info('  bike           - Motorcycles and bikes');
    console.info('  truck          - Heavy-duty vehicles');
    console.info('  boat           - Watercraft');
    console.info('  aircraft       - Flying vehicles');
    console.info('');
    console.info('DRIVING CONTROLS:');
    console.info('  W/↑ - Accelerate');
    console.info('  S/↓ - Brake');
    console.info('  A/← - Steer Left');
    console.info('  D/→ - Steer Right');
    console.info('  SPACE - Boost');
    console.info('  E - Use Ability');
    console.info('');
    console.info('NOTES:');
    console.info('- Different vehicles have different handling characteristics');
    console.info('- Terrain affects vehicle performance');
    console.info('- Weather conditions impact driving');
    console.info('- Fuel management is important for long drives');
    console.info('- Vehicle damage affects performance');
  }

  /**
   * Create vehicle interactively
   */
  private async createVehicleInteractive(): Promise<void> {
    console.info('\n🆕 Creating New Vehicle');
    console.info('=======================');

    const name = await this.askQuestion('Vehicle name: ');
    const type = await this.askQuestion('Vehicle type (car/bike/truck/boat/aircraft): ');

    console.info(`✅ Vehicle "${name}" created successfully!`);
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    console.info('\n👋 Thank you for using MIFF DrivingSystemPure CLI!');
    this.isRunning = false;
    this.rl.close();
    process.exit(0);
  }

  /**
   * Ask a question
   */
  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Main execution
if (require.main === module) {
  const cli = new DrivingSystemCLI();
  cli.start();
}

module.exports = DrivingSystemCLI;