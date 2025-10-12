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
    this.logger.info(`📡 Event: ${event}`, data);
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
    this.logger.info('🔮 Setting up teleportation demo data...');

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

    this.logger.info('✅ Demo data setup complete!');
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this.isRunning = true;
    this.logger.info('🚀 Welcome to MIFF TeleportationSystemPure CLI!');
    this.logger.info('===============================================');
    this.logger.info('Available commands:');
    this.logger.info('  anchors        - List all spatial anchors');
    this.logger.info('  portals        - List all portals');
    this.logger.info('  zones          - List all zones');
    this.logger.info('  teleport <dest> - Teleport to a destination');
    this.logger.info('  destinations   - Show available destinations');
    this.logger.info('  create-anchor  - Create a new spatial anchor');
    this.logger.info('  create-portal  - Create a new portal');
    this.logger.info('  stats          - Show teleportation statistics');
    this.logger.info('  config         - Show current configuration');
    this.logger.info('  demo           - Run automated demo');
    this.logger.info('  help           - Show this help');
    this.logger.info('  exit           - Exit the CLI');
    this.logger.info('');

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
            this.logger.info('❌ Usage: teleport <destination-id>');
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
          this.logger.info(`❓ Unknown command: ${command}`);
          this.logger.info('Type "help" for available commands.');
          break;
      }
    } catch (error) {
      this.logger.error(`❌ Error: ${error.message}`);
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

    this.logger.info('\n🗺️ Spatial Anchors:');
    this.logger.info('===================');

    if (allAnchors.length === 0) {
      this.logger.info('No anchors found. Create some with "create-anchor"');
      return;
    }

    allAnchors.forEach(anchor => {
      const zone = zones.find(z => z.id === anchor.zoneId);
      const zoneName = zone ? zone.name : 'Unknown Zone';

      this.logger.info(`${anchor.name} (${anchor.id})`);
      this.logger.info(`  Zone: ${zoneName}`);
      this.logger.info(`  Position: (${anchor.position.x}, ${anchor.position.y}, ${anchor.position.z})`);
      this.logger.info(`  Energy Cost: ${anchor.energyCost}`);
      this.logger.info(`  Status: ${anchor.isActive ? '✅ Active' : '❌ Inactive'}`);
      this.logger.info(`  Access: ${anchor.isPublic ? '🌍 Public' : '🔒 Restricted'}`);
      this.logger.info(`  Tags: ${anchor.tags.join(', ')}`);
      this.logger.info('');
    });
  }

  /**
   * Show all portals
   */
  private showPortals(): void {
    const allPortals = this.teleportationSystem.getAllPortals();
    const allAnchors = this.teleportationSystem.getAllAnchors();

    this.logger.info('\n🚪 Portals:');
    this.logger.info('===========');

    if (allPortals.length === 0) {
      this.logger.info('No portals found. Create some with "create-portal"');
      return;
    }

    allPortals.forEach(portal => {
      const sourceAnchor = allAnchors.find(a => a.id === portal.sourceAnchor.id);
      const destAnchor = allAnchors.find(a => a.id === portal.destinationAnchor.id);

      this.logger.info(`${portal.name} (${portal.id})`);
      this.logger.info(`  From: ${sourceAnchor?.name || 'Unknown'} → To: ${destAnchor?.name || 'Unknown'}`);
      this.logger.info(`  Energy Cost: ${portal.energyCost}`);
      this.logger.info(`  Status: ${portal.isActive ? '✅ Active' : '❌ Inactive'}`);
      this.logger.info(`  Bidirectional: ${portal.isBidirectional ? '↔️ Yes' : '➡️ No'}`);
      this.logger.info(`  Stability: ${(portal.stability * 100).toFixed(0)}%`);
      this.logger.info(`  Charges: ${portal.charges === -1 ? '∞' : `${portal.charges}/${portal.maxCharges}`}`);
      this.logger.info('');
    });
  }

  /**
   * Show all zones
   */
  private showZones(): void {
    const zones = this.teleportationSystem.getAllZones();

    this.logger.info('\n🏛️ Zones:');
    this.logger.info('=========');

    zones.forEach(zone => {
      const anchors = this.teleportationSystem.getAnchorsInZone(zone.id);

      this.logger.info(`${zone.name} (${zone.id})`);
      this.logger.info(`  Bounds: (${zone.bounds.min.x},${zone.bounds.min.z}) to (${zone.bounds.max.x},${zone.bounds.max.z})`);
      this.logger.info(`  Teleport Enabled: ${zone.teleportEnabled ? '✅ Yes' : '❌ No'}`);
      this.logger.info(`  Anchor Limit: ${zone.anchorLimit}`);
      this.logger.info(`  Anchors: ${anchors.length}`);
      this.logger.info(`  Restrictions: ${zone.restrictions.join(', ') || 'None'}`);
      this.logger.info('');
    });
  }

  /**
   * Teleport to a destination
   */
  private async teleport(destinationId: string): Promise<void> {
    this.logger.info(`🎯 Attempting teleportation to: ${destinationId}`);

    const result = this.teleportationSystem.requestTeleportation({
      entityId: 'player',
      destinationId,
      usePortal: true,
      bypassRestrictions: false
    });

    if (result.success) {
      this.logger.info(`✅ Teleportation successful!`);
      this.logger.info(`  From: (${result.fromPosition.x}, ${result.fromPosition.y}, ${result.fromPosition.z})`);
      this.logger.info(`  To: (${result.toPosition.x}, ${result.toPosition.y}, ${result.toPosition.z})`);
      this.logger.info(`  Energy spent: ${result.energySpent}`);
      this.logger.info(`  Cooldown: ${result.cooldownApplied}ms`);

      if (result.sideEffects && result.sideEffects.length > 0) {
        this.logger.info('  Side effects:');
        result.sideEffects.forEach(effect => {
          this.logger.info(`    - ${effect.description} (${effect.magnitude})`);
        });
      }
    } else {
      this.logger.info(`❌ Teleportation failed: ${result.failureReason}`);
    }
  }

  /**
   * Show available destinations
   */
  private showDestinations(): void {
    const destinations = this.getAvailableDestinations();

    this.logger.info('\n🎯 Available Destinations:');
    this.logger.info('===========================');

    if (destinations.length === 0) {
      this.logger.info('No destinations available.');
      return;
    }

    destinations.forEach(dest => {
      this.logger.info(`${dest.name} (${dest.type})`);
      this.logger.info(`  Position: (${dest.position.x}, ${dest.position.y}, ${dest.position.z})`);
      this.logger.info(`  Energy Cost: ${dest.energyCost}`);
      this.logger.info(`  Distance: ${dest.distance.toFixed(1)} units`);
      this.logger.info(`  Description: ${dest.description}`);
      this.logger.info('');
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
    this.logger.info('\n🆕 Creating New Spatial Anchor');
    this.logger.info('=============================');

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
      this.logger.info(`✅ Created anchor: ${anchor.name} (${anchor.id})`);
    } else {
      this.logger.info('❌ Failed to create anchor');
    }
  }

  /**
   * Create portal interactively
   */
  private async createPortalInteractive(): Promise<void> {
    this.logger.info('\n🆕 Creating New Portal');
    this.logger.info('======================');

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
      this.logger.info(`✅ Created portal: ${portal.name} (${portal.id})`);
    } else {
      this.logger.info('❌ Failed to create portal');
    }
  }

  /**
   * Show teleportation statistics
   */
  private showStats(): void {
    const stats = this.teleportationSystem.getStats();

    this.logger.info('\n📊 Teleportation Statistics:');
    this.logger.info('============================');

    this.logger.info(`Total Teleports: ${stats.totalTeleports}`);
    this.logger.info(`Successful: ${stats.successfulTeleports}`);
    this.logger.info(`Failed: ${stats.failedTeleports}`);
    this.logger.info(`Success Rate: ${stats.totalTeleports > 0 ? ((stats.successfulTeleports / stats.totalTeleports) * 100).toFixed(1) : 0}%`);
    this.logger.info(`Total Energy Spent: ${stats.totalEnergySpent}`);
    this.logger.info(`Portals Created: ${stats.portalsCreated}`);
    this.logger.info(`Anchors Created: ${stats.anchorsCreated}`);
    this.logger.info(`Average Distance: ${stats.averageTeleportDistance.toFixed(1)} units`);

    this.logger.info('\nFailure Reasons:');
    Array.from(stats.failureReasons.entries()).forEach(([reason, count]) => {
      this.logger.info(`  ${reason}: ${count}`);
    });
  }

  /**
   * Show configuration
   */
  private showConfig(): void {
    const config = this.teleportationSystem.getConfig();

    this.logger.info('\n⚙️ Teleportation Configuration:');
    this.logger.info('==============================');

    this.logger.info(`Default Energy Cost: ${config.defaultEnergyCost}`);
    this.logger.info(`Max Portal Distance: ${config.maxPortalDistance}`);
    this.logger.info(`Portal Stability Decay: ${config.portalStabilityDecay}`);
    this.logger.info(`Anchor Creation Cost: ${config.anchorCreationCost}`);
    this.logger.info(`Max Anchors Per Zone: ${config.maxAnchorsPerZone}`);
    this.logger.info(`Max Portals Per Anchor: ${config.maxPortalsPerAnchor}`);
    this.logger.info(`Global Cooldown: ${config.globalCooldown}ms`);
    this.logger.info(`Teleportation Range: ${config.teleportationRange}`);
    this.logger.info(`Allow Inter-Zone Teleport: ${config.allowInterZoneTeleport}`);
    this.logger.info(`Require Line of Sight: ${config.requireLineOfSight}`);
    this.logger.info(`Enable Side Effects: ${config.enableSideEffects}`);
    this.logger.info(`Enable Portal Charges: ${config.enablePortalCharges}`);
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    this.logger.info('\n🎬 Running Teleportation Demo...');
    this.logger.info('=================================');

    // Show available destinations
    this.logger.info('\n📍 Available destinations:');
    this.showDestinations();

    // Perform some teleports
    const destinations = this.getAvailableDestinations();

    if (destinations.length >= 3) {
      for (let i = 0; i < 3; i++) {
        const dest = destinations[i];
        this.logger.info(`\n🚀 Demo teleport ${i + 1}: ${dest.name}`);
        await this.teleport(dest.id);
      }
    }

    // Show final statistics
    this.logger.info('\n📊 Demo Results:');
    this.showStats();

    this.logger.info('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('\n🚀 MIFF TeleportationSystemPure CLI Help');
    this.logger.info('=====================================');
    this.logger.info('');
    this.logger.info('COMMANDS:');
    this.logger.info('  anchors        - List all spatial anchors');
    this.logger.info('  portals        - List all portals');
    this.logger.info('  zones          - List all zones');
    this.logger.info('  teleport <dest> - Teleport to a destination');
    this.logger.info('  destinations   - Show available destinations');
    this.logger.info('  create-anchor  - Create a new spatial anchor');
    this.logger.info('  create-portal  - Create a new portal');
    this.logger.info('  stats          - Show teleportation statistics');
    this.logger.info('  config         - Show current configuration');
    this.logger.info('  demo           - Run automated demo sequence');
    this.logger.info('  help           - Show this help information');
    this.logger.info('  exit           - Exit the CLI');
    this.logger.info('');
    this.logger.info('EXAMPLES:');
    this.logger.info('  teleport town-center      # Teleport to town center');
    this.logger.info('  teleport tower-entrance   # Use portal to tower');
    this.logger.info('  destinations              # See where you can go');
    this.logger.info('');
    this.logger.info('NOTES:');
    this.logger.info('- Some destinations require special permissions');
    this.logger.info('- Portals may have charges that deplete over time');
    this.logger.info('- Teleportation costs energy and has cooldowns');
    this.logger.info('- Side effects may occur during teleportation');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    this.logger.info('\n👋 Thank you for using MIFF TeleportationSystemPure CLI!');
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