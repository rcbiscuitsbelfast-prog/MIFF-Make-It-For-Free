#!/usr/bin/env node

/**
 * MIFF TeleportationSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the TeleportationSystemPure with spatial anchors and portals
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  TeleportationSystemPure,
  SpatialAnchor,
  Portal,
  ZoneInfo,
  Vector3
} from './index';

// Mock dependencies for CLI demo
class RealEventBus {
  private logger: StructuredLogger;
  emit(event: string, data: any) {
    console.info(`📡 Event: ${event}`, data);
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
    this.logger = new StructuredLogger({ module: 'RealEventBus' });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Initialize mock systems
    const eventBus = new RealEventBus() as any;
    const rng = new MockRNG() as any;

    this.teleportationSystem = new TeleportationSystemPure(eventBus, rng);
    this.setupDefaultData();
  }

  /**
   * Setup default data for demonstration
   */
  private setupDefaultData(): void {
    console.info('🔮 Setting up teleportation demo data...');

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

    zones.forEach(zone => {
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

    console.info('✅ Demo data setup complete!');
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this.isRunning = true;
    console.info('🚀 Welcome to MIFF TeleportationSystemPure CLI!');
    console.info('===============================================');
    console.info('Available commands:');
    console.info('  anchors        - List all spatial anchors');
    console.info('  portals        - List all portals');
    console.info('  zones          - List all zones');
    console.info('  teleport <dest> - Teleport to a destination');
    console.info('  destinations   - Show available destinations');
    console.info('  create-anchor  - Create a new spatial anchor');
    console.info('  create-portal  - Create a new portal');
    console.info('  stats          - Show teleportation statistics');
    console.info('  config         - Show current configuration');
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
    const command = parts[0]?.toLowerCase();
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
            console.info('❌ Usage: teleport <destination-id>');
          } else {
            await this.teleport(args[0]);
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
   * Show all spatial anchors
   */
  private showAnchors(): void {
    const allAnchors = this.teleportationSystem.getAllAnchors();
    const zones = this.teleportationSystem.getAllZones();

    console.info('\n🗺️ Spatial Anchors:');
    console.info('===================');

    if (allAnchors.length === 0) {
      console.info('No anchors found. Create some with "create-anchor"');
      return;
    }

    allAnchors.forEach(anchor => {
      const zone = zones.find(z => z.id === anchor.zoneId);
      const zoneName = zone ? zone.name : 'Unknown Zone';

      console.info(`${anchor.name} (${anchor.id})`);
      console.info(`  Zone: ${zoneName}`);
      console.info(`  Position: (${anchor.position.x}, ${anchor.position.y}, ${anchor.position.z})`);
      console.info(`  Energy Cost: ${anchor.energyCost}`);
      console.info(`  Status: ${anchor.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.info(`  Access: ${anchor.isPublic ? '🌍 Public' : '🔒 Restricted'}`);
      console.info(`  Tags: ${anchor.tags.join(', ')}`);
      console.info('');
    });
  }

  /**
   * Show all portals
   */
  private showPortals(): void {
    const allPortals = this.teleportationSystem.getAllPortals();
    const allAnchors = this.teleportationSystem.getAllAnchors();

    console.info('\n🚪 Portals:');
    console.info('===========');

    if (allPortals.length === 0) {
      console.info('No portals found. Create some with "create-portal"');
      return;
    }

    allPortals.forEach(portal => {
      const sourceAnchor = allAnchors.find(a => a.id === portal.sourceAnchor.id);
      const destAnchor = allAnchors.find(a => a.id === portal.destinationAnchor.id);

      console.info(`${portal.name} (${portal.id})`);
      console.info(`  From: ${sourceAnchor?.name || 'Unknown'} → To: ${destAnchor?.name || 'Unknown'}`);
      console.info(`  Energy Cost: ${portal.energyCost}`);
      console.info(`  Status: ${portal.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.info(`  Bidirectional: ${portal.isBidirectional ? '↔️ Yes' : '➡️ No'}`);
      console.info(`  Stability: ${(portal.stability * 100).toFixed(0)}%`);
      console.info(`  Charges: ${portal.charges === -1 ? '∞' : `${portal.charges}/${portal.maxCharges}`}`);
      console.info('');
    });
  }

  /**
   * Show all zones
   */
  private showZones(): void {
    const zones = this.teleportationSystem.getAllZones();

    console.info('\n🏛️ Zones:');
    console.info('=========');

    zones.forEach(zone => {
      const anchors = this.teleportationSystem.getAnchorsInZone(zone.id);

      console.info(`${zone.name} (${zone.id})`);
      console.info(`  Bounds: (${zone.bounds.min.x},${zone.bounds.min.z}) to (${zone.bounds.max.x},${zone.bounds.max.z})`);
      console.info(`  Teleport Enabled: ${zone.teleportEnabled ? '✅ Yes' : '❌ No'}`);
      console.info(`  Anchor Limit: ${zone.anchorLimit}`);
      console.info(`  Anchors: ${anchors.length}`);
      console.info(`  Restrictions: ${zone.restrictions.join(', ') || 'None'}`);
      console.info('');
    });
  }

  /**
   * Teleport to a destination
   */
  private async teleport(destinationId: string): Promise<void> {
    console.info(`🎯 Attempting teleportation to: ${destinationId}`);

    const result = this.teleportationSystem.requestTeleportation({
      entityId: 'player',
      destinationId,
      usePortal: true,
      bypassRestrictions: false
    });

    if (result.success) {
      console.info(`✅ Teleportation successful!`);
      console.info(`  From: (${result.fromPosition.x}, ${result.fromPosition.y}, ${result.fromPosition.z})`);
      console.info(`  To: (${result.toPosition.x}, ${result.toPosition.y}, ${result.toPosition.z})`);
      console.info(`  Energy spent: ${result.energySpent}`);
      console.info(`  Cooldown: ${result.cooldownApplied}ms`);

      if (result.sideEffects && result.sideEffects.length > 0) {
        console.info('  Side effects:');
        result.sideEffects.forEach(effect => {
          console.info(`    - ${effect.description} (${effect.magnitude})`);
        });
      }
    } else {
      console.info(`❌ Teleportation failed: ${result.failureReason}`);
    }
  }

  /**
   * Show available destinations
   */
  private showDestinations(): void {
    const destinations = this.getAvailableDestinations();

    console.info('\n🎯 Available Destinations:');
    console.info('===========================');

    if (destinations.length === 0) {
      console.info('No destinations available.');
      return;
    }

    destinations.forEach(dest => {
      console.info(`${dest.name} (${dest.type})`);
      console.info(`  Position: (${dest.position.x}, ${dest.position.y}, ${dest.position.z})`);
      console.info(`  Energy Cost: ${dest.energyCost}`);
      console.info(`  Distance: ${dest.distance.toFixed(1)} units`);
      console.info(`  Description: ${dest.description}`);
      console.info('');
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
    anchors.forEach(anchor => {
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
    portals.forEach(portal => {
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

    return destinations.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Create anchor interactively
   */
  private async createAnchorInteractive(): Promise<void> {
    console.info('\n🆕 Creating New Spatial Anchor');
    console.info('=============================');

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
      console.info(`✅ Created anchor: ${anchor.name} (${anchor.id})`);
    } else {
      console.info('❌ Failed to create anchor');
    }
  }

  /**
   * Create portal interactively
   */
  private async createPortalInteractive(): Promise<void> {
    console.info('\n🆕 Creating New Portal');
    console.info('======================');

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
      console.info(`✅ Created portal: ${portal.name} (${portal.id})`);
    } else {
      console.info('❌ Failed to create portal');
    }
  }

  /**
   * Show teleportation statistics
   */
  private showStats(): void {
    const stats = this.teleportationSystem.getStats();

    console.info('\n📊 Teleportation Statistics:');
    console.info('============================');

    console.info(`Total Teleports: ${stats.totalTeleports}`);
    console.info(`Successful: ${stats.successfulTeleports}`);
    console.info(`Failed: ${stats.failedTeleports}`);
    console.info(`Success Rate: ${stats.totalTeleports > 0 ? ((stats.successfulTeleports / stats.totalTeleports) * 100).toFixed(1) : 0}%`);
    console.info(`Total Energy Spent: ${stats.totalEnergySpent}`);
    console.info(`Portals Created: ${stats.portalsCreated}`);
    console.info(`Anchors Created: ${stats.anchorsCreated}`);
    console.info(`Average Distance: ${stats.averageTeleportDistance.toFixed(1)} units`);

    console.info('\nFailure Reasons:');
    Array.from(stats.failureReasons.entries()).forEach(([reason, count]) => {
      console.info(`  ${reason}: ${count}`);
    });
  }

  /**
   * Show configuration
   */
  private showConfig(): void {
    const config = this.teleportationSystem.getConfig();

    console.info('\n⚙️ Teleportation Configuration:');
    console.info('==============================');

    console.info(`Default Energy Cost: ${config.defaultEnergyCost}`);
    console.info(`Max Portal Distance: ${config.maxPortalDistance}`);
    console.info(`Portal Stability Decay: ${config.portalStabilityDecay}`);
    console.info(`Anchor Creation Cost: ${config.anchorCreationCost}`);
    console.info(`Max Anchors Per Zone: ${config.maxAnchorsPerZone}`);
    console.info(`Max Portals Per Anchor: ${config.maxPortalsPerAnchor}`);
    console.info(`Global Cooldown: ${config.globalCooldown}ms`);
    console.info(`Teleportation Range: ${config.teleportationRange}`);
    console.info(`Allow Inter-Zone Teleport: ${config.allowInterZoneTeleport}`);
    console.info(`Require Line of Sight: ${config.requireLineOfSight}`);
    console.info(`Enable Side Effects: ${config.enableSideEffects}`);
    console.info(`Enable Portal Charges: ${config.enablePortalCharges}`);
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    console.info('\n🎬 Running Teleportation Demo...');
    console.info('=================================');

    // Show available destinations
    console.info('\n📍 Available destinations:');
    this.showDestinations();

    // Perform some teleports
    const destinations = this.getAvailableDestinations();

    if (destinations.length >= 3) {
      for (let i = 0; i < 3; i++) {
        const dest = destinations[i];
        console.info(`\n🚀 Demo teleport ${i + 1}: ${dest.name}`);
        await this.teleport(dest.id);
      }
    }

    // Show final statistics
    console.info('\n📊 Demo Results:');
    this.showStats();

    console.info('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.info('\n🚀 MIFF TeleportationSystemPure CLI Help');
    console.info('=====================================');
    console.info('');
    console.info('COMMANDS:');
    console.info('  anchors        - List all spatial anchors');
    console.info('  portals        - List all portals');
    console.info('  zones          - List all zones');
    console.info('  teleport <dest> - Teleport to a destination');
    console.info('  destinations   - Show available destinations');
    console.info('  create-anchor  - Create a new spatial anchor');
    console.info('  create-portal  - Create a new portal');
    console.info('  stats          - Show teleportation statistics');
    console.info('  config         - Show current configuration');
    console.info('  demo           - Run automated demo sequence');
    console.info('  help           - Show this help information');
    console.info('  exit           - Exit the CLI');
    console.info('');
    console.info('EXAMPLES:');
    console.info('  teleport town-center      # Teleport to town center');
    console.info('  teleport tower-entrance   # Use portal to tower');
    console.info('  destinations              # See where you can go');
    console.info('');
    console.info('NOTES:');
    console.info('- Some destinations require special permissions');
    console.info('- Portals may have charges that deplete over time');
    console.info('- Teleportation costs energy and has cooldowns');
    console.info('- Side effects may occur during teleportation');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    console.info('\n👋 Thank you for using MIFF TeleportationSystemPure CLI!');
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