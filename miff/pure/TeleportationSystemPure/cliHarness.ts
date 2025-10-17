#!/usr/bin/env node

/**
 * MIFF TeleportationSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the TeleportationSystemPure with spatial anchors and portals
 */

import * as readline from 'readline';
import {
  TeleportationSystemPure,
  SpatialAnchor,
  Portal,
  ZoneInfo,
  Vector3
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

class MockRNG {
  nextFloat(): number {
    return Math.random();
  }
}

class TeleportationSystemCLI {
  private rl: readline.Interface;
  private teleportationSystem: TeleportationSystemPure;
  private isRunning: boolean = false;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Initialize mock systems
    const eventBus = new MockEventBus() as any;
    const rng = new MockRNG() as any;

    this.teleportationSystem = new TeleportationSystemPure(eventBus, rng);
    this.setupDefaultData();
  }

  /**
   * Setup default data for demonstration
   */
  private setupDefaultData(): void {
    console.log('🔮 Setting up teleportation demo data...');

    // Create some zones
    const zones: ZoneInfo[] = [
      {
        id: 'town-square',
        name: 'Town Square',
        bounds: {
          min: { x: -100, y: 0, z: -100 },
          max: { x: 100, y: 20, z: 100 }
        },
        isActive: true,
        teleportEnabled: true,
        restrictions: [],
        anchorLimit: 5
      },
      {
        id: 'mystical-tower',
        name: 'Mystical Tower',
        bounds: {
          min: { x: -50, y: 0, z: -50 },
          max: { x: 50, y: 100, z: 50 }
        },
        isActive: true,
        teleportEnabled: true,
        restrictions: ['requires-magic-permission'],
        anchorLimit: 3
      },
      {
        id: 'dark-cave',
        name: 'Dark Cave',
        bounds: {
          min: { x: -200, y: -50, z: -200 },
          max: { x: 200, y: 0, z: 200 }
        },
        isActive: true,
        teleportEnabled: true,
        restrictions: ['requires-dungeon-key'],
        anchorLimit: 2
      }
    ];

    zones.forEach((zone: any) => {
      this.teleportationSystem.addZone(zone);
    });

    // Create some anchors
    const anchors: Partial<SpatialAnchor>[] = [
      {
        id: 'town-center',
        name: 'Town Center',
        position: { x: 0, y: 0, z: 0 },
        zoneId: 'town-square',
        description: 'The central plaza of the town',
        isPublic: true,
        energyCost: 20,
        tags: ['safe', 'hub', 'public']
      },
      {
        id: 'tower-entrance',
        name: 'Tower Entrance',
        position: { x: 0, y: 0, z: 0 },
        zoneId: 'mystical-tower',
        description: 'The base of the mystical tower',
        isPublic: false,
        energyCost: 30,
        requiredPermissions: ['magic-user'],
        tags: ['magic', 'restricted', 'tower']
      },
      {
        id: 'tower-top',
        name: 'Tower Summit',
        position: { x: 0, y: 90, z: 0 },
        zoneId: 'mystical-tower',
        description: 'The highest point of the tower',
        isPublic: false,
        energyCost: 25,
        requiredPermissions: ['magic-user'],
        tags: ['magic', 'high', 'summit']
      },
      {
        id: 'cave-entrance',
        name: 'Cave Mouth',
        position: { x: 0, y: 0, z: 0 },
        zoneId: 'dark-cave',
        description: 'The entrance to the dark cave',
        isPublic: true,
        energyCost: 35,
        restrictions: ['requires-light-source'],
        tags: ['dark', 'cave', 'dangerous']
      },
      {
        id: 'cave-depths',
        name: 'Cave Depths',
        position: { x: 0, y: -40, z: 0 },
        zoneId: 'dark-cave',
        description: 'Deep within the cave system',
        isPublic: false,
        energyCost: 40,
        restrictions: ['requires-dungeon-key'],
        tags: ['dark', 'deep', 'treasure']
      }
    ];

    anchors.forEach(anchorData => {
      this.teleportationSystem.createSpatialAnchor(anchorData);
    });

    // Create some portals
    this.teleportationSystem.createPortal('town-center', 'tower-entrance', {
      name: 'Town to Tower Portal',
      isBidirectional: true,
      energyCost: 25
    });

    this.teleportationSystem.createPortal('town-center', 'cave-entrance', {
      name: 'Town to Cave Portal',
      isBidirectional: true,
      energyCost: 30
    });

    this.teleportationSystem.createPortal('tower-top', 'cave-depths', {
      name: 'Tower to Depths Portal',
      isBidirectional: false,
      energyCost: 50,
      restrictions: ['requires-both-keys']
    });

    console.log('✅ Demo data setup complete!');
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this.isRunning = true;
    console.log('🚀 Welcome to MIFF TeleportationSystemPure CLI!');
    console.log('===============================================');
    console.log('Available commands:');
    console.log('  anchors        - List all spatial anchors');
    console.log('  portals        - List all portals');
    console.log('  zones          - List all zones');
    console.log('  teleport <dest> - Teleport to a destination');
    console.log('  destinations   - Show available destinations');
    console.log('  create-anchor  - Create a new spatial anchor');
    console.log('  create-portal  - Create a new portal');
    console.log('  stats          - Show teleportation statistics');
    console.log('  config         - Show current configuration');
    console.log('  demo           - Run automated demo');
    console.log('  help           - Show this help');
    console.log('  exit           - Exit the CLI');
    console.log('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('teleport> ', (input) => {
      this.processCommand(input.trim());
    });
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    if (!this.isRunning) return;

    const parts = input.split(' ');
    const command = parts[0!]?.toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'anchors':
          this.showAnchors();
          break;

        case 'portals':
          this.showPortals();
          break;

        case 'zones':
          this.showZones();
          break;

        case 'teleport':
          if (args.length === 0) {
            console.log('❌ Usage: teleport <destination-id>');
          } else {
            await this.teleport(args[0!]);
          }
          break;

        case 'destinations':
          this.showDestinations();
          break;

        case 'create-anchor':
          await this.createAnchorInteractive();
          break;

        case 'create-portal':
          await this.createPortalInteractive();
          break;

        case 'stats':
          this.showStats();
          break;

        case 'config':
          this.showConfig();
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
          console.log(`❓ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
          break;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Error: ${error.message}`);
    }

    if (this.isRunning) {
      this.showPrompt();
    }
  }

  /**
   * Show all spatial anchors
   */
  private showAnchors(): void {
    const allAnchors = this.teleportationSystem.getAllAnchors();
    const zones = this.teleportationSystem.getAllZones();

    console.log('\n🗺️ Spatial Anchors:');
    console.log('===================');

    if (allAnchors.length === 0) {
      console.log('No anchors found. Create some with "create-anchor"');
      return;
    }

    allAnchors.forEach((anchor: any) => {
      const zone = zones.find(z => z.id === anchor.zoneId);
      const zoneName = zone ? zone.name : 'Unknown Zone';

      console.log(`${anchor.name} (${anchor.id})`);
      console.log(`  Zone: ${zoneName}`);
      console.log(`  Position: (${anchor.position.x}, ${anchor.position.y}, ${anchor.position.z})`);
      console.log(`  Energy Cost: ${anchor.energyCost}`);
      console.log(`  Status: ${anchor.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`  Access: ${anchor.isPublic ? '🌍 Public' : '🔒 Restricted'}`);
      console.log(`  Tags: ${anchor.tags.join(', ')}`);
      console.log('');
    });
  }

  /**
   * Show all portals
   */
  private showPortals(): void {
    const allPortals = this.teleportationSystem.getAllPortals();
    const allAnchors = this.teleportationSystem.getAllAnchors();

    console.log('\n🚪 Portals:');
    console.log('===========');

    if (allPortals.length === 0) {
      console.log('No portals found. Create some with "create-portal"');
      return;
    }

    allPortals.forEach((portal: any) => {
      const sourceAnchor = allAnchors.find(a => a.id === portal.sourceAnchor.id);
      const destAnchor = allAnchors.find(a => a.id === portal.destinationAnchor.id);

      console.log(`${portal.name} (${portal.id})`);
      console.log(`  From: ${sourceAnchor?.name || 'Unknown'} → To: ${destAnchor?.name || 'Unknown'}`);
      console.log(`  Energy Cost: ${portal.energyCost}`);
      console.log(`  Status: ${portal.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`  Bidirectional: ${portal.isBidirectional ? '↔️ Yes' : '➡️ No'}`);
      console.log(`  Stability: ${(portal.stability * 100).toFixed(0)}%`);
      console.log(`  Charges: ${portal.charges === -1 ? '∞' : `${portal.charges}/${portal.maxCharges}`}`);
      console.log('');
    });
  }

  /**
   * Show all zones
   */
  private showZones(): void {
    const zones = this.teleportationSystem.getAllZones();

    console.log('\n🏛️ Zones:');
    console.log('=========');

    zones.forEach((zone: any) => {
      const anchors = this.teleportationSystem.getAnchorsInZone(zone.id);

      console.log(`${zone.name} (${zone.id})`);
      console.log(`  Bounds: (${zone.bounds.min.x},${zone.bounds.min.z}) to (${zone.bounds.max.x},${zone.bounds.max.z})`);
      console.log(`  Teleport Enabled: ${zone.teleportEnabled ? '✅ Yes' : '❌ No'}`);
      console.log(`  Anchor Limit: ${zone.anchorLimit}`);
      console.log(`  Anchors: ${anchors.length}`);
      console.log(`  Restrictions: ${zone.restrictions.join(', ') || 'None'}`);
      console.log('');
    });
  }

  /**
   * Teleport to a destination
   */
  private async teleport(destinationId: string): Promise<void> {
    console.log(`🎯 Attempting teleportation to: ${destinationId}`);

    const result = this.teleportationSystem.requestTeleportation({
      entityId: 'player',
      destinationId,
      usePortal: true,
      bypassRestrictions: false
    });

    if (result.success) {
      console.log(`✅ Teleportation successful!`);
      console.log(`  From: (${result.fromPosition.x}, ${result.fromPosition.y}, ${result.fromPosition.z})`);
      console.log(`  To: (${result.toPosition.x}, ${result.toPosition.y}, ${result.toPosition.z})`);
      console.log(`  Energy spent: ${result.energySpent}`);
      console.log(`  Cooldown: ${result.cooldownApplied}ms`);

      if (result.sideEffects && result.sideEffects.length > 0) {
        console.log('  Side effects:');
        result.sideEffects.forEach((effect: any) => {
          console.log(`    - ${effect.description} (${effect.magnitude})`);
        });
      }
    } else {
      console.log(`❌ Teleportation failed: ${result.failureReason}`);
    }
  }

  /**
   * Show available destinations
   */
  private showDestinations(): void {
    const destinations = this.getAvailableDestinations();

    console.log('\n🎯 Available Destinations:');
    console.log('===========================');

    if (destinations.length === 0) {
      console.log('No destinations available.');
      return;
    }

    destinations.forEach((dest: any) => {
      console.log(`${dest.name} (${dest.type})`);
      console.log(`  Position: (${dest.position.x}, ${dest.position.y}, ${dest.position.z})`);
      console.log(`  Energy Cost: ${dest.energyCost}`);
      console.log(`  Distance: ${dest.distance.toFixed(1)} units`);
      console.log(`  Description: ${dest.description}`);
      console.log('');
    });
  }

  /**
   * Get available destinations (mock implementation)
   */
  private getAvailableDestinations(): Array<{
    id: string;
    name: string;
    type: 'anchor' | 'portal';
    position: Vector3;
    energyCost: number;
    description: string;
    distance: number;
  }> {
    const destinations: Array<{
      id: string;
      name: string;
      type: 'anchor' | 'portal';
      position: Vector3;
      energyCost: number;
      description: string;
      distance: number;
    }> = [];

    const currentPosition = { x: 0, y: 0, z: 0 };

    // Add anchors
    const anchors = this.teleportationSystem.getAllAnchors();
    anchors.forEach((anchor: any) => {
      if (anchor.isActive) {
        const distance = this.calculateDistance(currentPosition, anchor.position);
        destinations.push({
          id: anchor.id,
          name: anchor.name,
          type: 'anchor',
          position: anchor.position,
          energyCost: anchor.energyCost,
          description: anchor.description,
          distance
        });
      }
    });

    // Add portals
    const portals = this.teleportationSystem.getAllPortals();
    portals.forEach((portal: any) => {
      if (portal.isActive) {
        destinations.push({
          id: portal.id,
          name: portal.name,
          type: 'portal',
          position: portal.destinationAnchor.position,
          energyCost: portal.energyCost,
          description: `Portal to ${portal.destinationAnchor.name}`,
          distance: this.calculateDistance(currentPosition, portal.destinationAnchor.position)
        });
      }
    });

    return destinations.sort((a: any, b: any) => a.distance - b.distance);
  }

  /**
   * Create anchor interactively
   */
  private async createAnchorInteractive(): Promise<void> {
    console.log('\n🆕 Creating New Spatial Anchor');
    console.log('=============================');

    const name = await this.askQuestion('Anchor name: ');
    const zoneId = await this.askQuestion('Zone ID (town-square, mystical-tower, dark-cave): ');

    const x = parseFloat(await this.askQuestion('X position (0): ') || '0');
    const y = parseFloat(await this.askQuestion('Y position (0): ') || '0');
    const z = parseFloat(await this.askQuestion('Z position (0): ') || '0');

    const description = await this.askQuestion('Description (A spatial anchor): ') || 'A spatial anchor';
    const energyCost = parseInt(await this.askQuestion('Energy cost (25): ') || '25');
    const isPublic = await this.askYesNo('Is public access? (y/n): ');

    const anchorData: Partial<SpatialAnchor> = {
      name,
      zoneId,
      position: { x, y, z },
      description,
      energyCost,
      isPublic
    };

    const anchor = this.teleportationSystem.createSpatialAnchor(anchorData);
    if (anchor) {
      console.log(`✅ Created anchor: ${anchor.name} (${anchor.id})`);
    } else {
      console.log('❌ Failed to create anchor');
    }
  }

  /**
   * Create portal interactively
   */
  private async createPortalInteractive(): Promise<void> {
    console.log('\n🆕 Creating New Portal');
    console.log('======================');

    const name = await this.askQuestion('Portal name: ');
    const sourceId = await this.askQuestion('Source anchor ID: ');
    const destId = await this.askQuestion('Destination anchor ID: ');

    const energyCost = parseInt(await this.askQuestion('Energy cost (30): ') || '30');
    const isBidirectional = await this.askYesNo('Is bidirectional? (y/n): ');

    const portal = this.teleportationSystem.createPortal(sourceId, destId, {
      name,
      energyCost,
      isBidirectional
    });

    if (portal) {
      console.log(`✅ Created portal: ${portal.name} (${portal.id})`);
    } else {
      console.log('❌ Failed to create portal');
    }
  }

  /**
   * Show teleportation statistics
   */
  private showStats(): void {
    const stats = this.teleportationSystem.getStats();

    console.log('\n📊 Teleportation Statistics:');
    console.log('============================');

    console.log(`Total Teleports: ${stats.totalTeleports}`);
    console.log(`Successful: ${stats.successfulTeleports}`);
    console.log(`Failed: ${stats.failedTeleports}`);
    console.log(`Success Rate: ${stats.totalTeleports > 0 ? ((stats.successfulTeleports / stats.totalTeleports) * 100).toFixed(1) : 0}%`);
    console.log(`Total Energy Spent: ${stats.totalEnergySpent}`);
    console.log(`Portals Created: ${stats.portalsCreated}`);
    console.log(`Anchors Created: ${stats.anchorsCreated}`);
    console.log(`Average Distance: ${stats.averageTeleportDistance.toFixed(1)} units`);

    console.log('\nFailure Reasons:');
    Array.from(stats.failureReasons.entries()).forEach(([reason, count]) => {
      console.log(`  ${reason}: ${count}`);
    });
  }

  /**
   * Show configuration
   */
  private showConfig(): void {
    const config = this.teleportationSystem.getConfig();

    console.log('\n⚙️ Teleportation Configuration:');
    console.log('==============================');

    console.log(`Default Energy Cost: ${config.defaultEnergyCost}`);
    console.log(`Max Portal Distance: ${config.maxPortalDistance}`);
    console.log(`Portal Stability Decay: ${config.portalStabilityDecay}`);
    console.log(`Anchor Creation Cost: ${config.anchorCreationCost}`);
    console.log(`Max Anchors Per Zone: ${config.maxAnchorsPerZone}`);
    console.log(`Max Portals Per Anchor: ${config.maxPortalsPerAnchor}`);
    console.log(`Global Cooldown: ${config.globalCooldown}ms`);
    console.log(`Teleportation Range: ${config.teleportationRange}`);
    console.log(`Allow Inter-Zone Teleport: ${config.allowInterZoneTeleport}`);
    console.log(`Require Line of Sight: ${config.requireLineOfSight}`);
    console.log(`Enable Side Effects: ${config.enableSideEffects}`);
    console.log(`Enable Portal Charges: ${config.enablePortalCharges}`);
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    console.log('\n🎬 Running Teleportation Demo...');
    console.log('=================================');

    // Show available destinations
    console.log('\n📍 Available destinations:');
    this.showDestinations();

    // Perform some teleports
    const destinations = this.getAvailableDestinations();

    if (destinations.length >= 3) {
      for (let i = 0; i < 3; i++) {
        const dest = destinations[i!];
        console.log(`\n🚀 Demo teleport ${i + 1}: ${dest.name}`);
        await this.teleport(dest.id);
      }
    }

    // Show final statistics
    console.log('\n📊 Demo Results:');
    this.showStats();

    console.log('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('\n🚀 MIFF TeleportationSystemPure CLI Help');
    console.log('=====================================');
    console.log('');
    console.log('COMMANDS:');
    console.log('  anchors        - List all spatial anchors');
    console.log('  portals        - List all portals');
    console.log('  zones          - List all zones');
    console.log('  teleport <dest> - Teleport to a destination');
    console.log('  destinations   - Show available destinations');
    console.log('  create-anchor  - Create a new spatial anchor');
    console.log('  create-portal  - Create a new portal');
    console.log('  stats          - Show teleportation statistics');
    console.log('  config         - Show current configuration');
    console.log('  demo           - Run automated demo sequence');
    console.log('  help           - Show this help information');
    console.log('  exit           - Exit the CLI');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  teleport town-center      # Teleport to town center');
    console.log('  teleport tower-entrance   # Use portal to tower');
    console.log('  destinations              # See where you can go');
    console.log('');
    console.log('NOTES:');
    console.log('- Some destinations require special permissions');
    console.log('- Portals may have charges that deplete over time');
    console.log('- Teleportation costs energy and has cooldowns');
    console.log('- Side effects may occur during teleportation');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    console.log('\n👋 Thank you for using MIFF TeleportationSystemPure CLI!');
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

  /**
   * Ask a yes/no question
   */
  private askYesNo(question: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }

  /**
   * Calculate distance between positions
   */
  private calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

// Main execution
if (require.main === module) {
  const cli = new TeleportationSystemCLI();
  cli.start();
}

module.exports = TeleportationSystemCLI;