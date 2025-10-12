#!/usr/bin/env node

/**
 * MIFF RitualSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the RitualSystemPure with multi-step ceremonies and summoning mechanics
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  RitualSystemPure,
  RitualDefinition,
  RitualInstance
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

class RitualSystemCLI {
  private rl: readline.Interface;
  private ritualSystem: RitualSystemPure;
  private isRunning: boolean = false;
  private currentRitual: RitualInstance | null = null;

  constructor() {
    this.logger = new StructuredLogger({ module: 'RealEventBus' });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Initialize mock systems
    const eventBus = new RealEventBus() as any;
    const rng = new MockRNG() as any;

    this.ritualSystem = new RitualSystemPure(eventBus, rng);
    this.setupDemoData();
  }

  /**
   * Setup demo data for demonstration
   */
  private setupDemoData(): void {
    this.logger.info('🔮 Setting up ritual demo data...');

    // Create some ritual participants
    const participants = [
      { id: 'mage-alice', name: 'Mage Alice', role: 'leader' as const },
      { id: 'apprentice-bob', name: 'Apprentice Bob', role: 'participant' as const },
      { id: 'scholar-carol', name: 'Scholar Carol', role: 'observer' as const }
    ];

    this.logger.info(`✅ Demo participants created: ${participants.length}`);
    this.logger.info('✅ Ritual system ready for testing!');
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this.isRunning = true;
    this.logger.info('🎭 Welcome to MIFF RitualSystemPure CLI!');
    this.logger.info('=====================================');
    this.logger.info('Available commands:');
    this.logger.info('  rituals        - List all available rituals');
    this.logger.info('  start <ritual> - Start a ritual');
    this.logger.info('  progress       - Progress current ritual');
    this.logger.info('  status         - Show current ritual status');
    this.logger.info('  participants   - List ritual participants');
    this.logger.info('  contribute     - Contribute to current ritual');
    this.logger.info('  cancel         - Cancel current ritual');
    this.logger.info('  stats          - Show ritual statistics');
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
    this.rl.question('ritual> ', (input) => {
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
        case 'rituals':
          this.showRituals();
          break;

        case 'start':
          if (args.length === 0) {
            this.logger.info('❌ Usage: start <ritual-name>');
          } else {
            await this.startRitual(args[0]);
          }
          break;

        case 'progress':
          this.progressRitual();
          break;

        case 'status':
          this.showRitualStatus();
          break;

        case 'participants':
          this.showParticipants();
          break;

        case 'contribute':
          await this.contributeToRitual();
          break;

        case 'cancel':
          this.cancelRitual();
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
   * Show available rituals
   */
  private showRituals(): void {
    const ritualDefinitions = this.getRitualDefinitions();

    this.logger.info('\n📜 Available Rituals:');
    this.logger.info('=====================');

    if (ritualDefinitions.length === 0) {
      this.logger.info('No rituals available. The system will initialize with basic rituals.');
      return;
    }

    ritualDefinitions.forEach(ritual => {
      this.logger.info(`${ritual.name} (${ritual.id})`);
      this.logger.info(`  Category: ${ritual.category} | Tier: ${ritual.tier}`);
      this.logger.info(`  Participants: ${ritual.minParticipants}-${ritual.maxParticipants}`);
      this.logger.info(`  Mana Cost: ${ritual.manaCost}`);
      this.logger.info(`  Duration: ${Math.round(ritual.baseDuration / 1000)}s`);
      this.logger.info(`  Steps: ${ritual.steps.length}`);
      this.logger.info(`  Description: ${ritual.description}`);
      this.logger.info('');
    });
  }

  /**
   * Get ritual definitions (mock implementation)
   */
  private getRitualDefinitions(): RitualDefinition[] {
    // This would normally come from the ritual system
    // For demo purposes, return mock data
    return [
      {
        id: 'summon-familiar',
        name: 'Summon Familiar',
        description: 'Call forth a magical familiar to aid you',
        category: 'summoning',
        tier: 'basic',
        steps: [
          {
            id: 'prepare-circle',
            name: 'Prepare Summoning Circle',
            description: 'Draw the summoning circle',
            duration: 10000,
            type: 'preparation',
            requirements: [],
            effects: [],
            failureEffects: [],
            visualEffect: 'circle_glow',
            soundEffect: 'chanting',
            requiredParticipants: 1,
            participantRoles: ['leader'],
            energyCost: 50,
            successRate: 0.95,
            difficultyModifier: 1.0
          },
          {
            id: 'summon-familiar',
            name: 'Summon the Familiar',
            description: 'Call forth the familiar spirit',
            duration: 15000,
            type: 'summoning',
            requirements: [],
            effects: [
              {
                type: 'summon',
                target: 'participants',
                magnitude: 1,
                description: 'Summon a familiar',
                parameters: new Map([['entityType', 'familiar']]),
                chance: 0.9
              }
            ],
            failureEffects: [
              {
                type: 'damage',
                target: 'participants',
                magnitude: 20,
                description: 'Failed summoning damages participants',
                parameters: new Map(),
                chance: 0.5
              }
            ],
            visualEffect: 'summoning_glow',
            soundEffect: 'summoning_chant',
            requiredParticipants: 1,
            participantRoles: ['leader'],
            energyCost: 100,
            successRate: 0.8,
            difficultyModifier: 1.2
          }
        ],
        requiredParticipants: 1,
        minParticipants: 1,
        maxParticipants: 1,
        baseDuration: 25000,
        manaCost: 150,
        itemRequirements: ['summoning-chalk', 'familiar-essence'],
        environmentRequirements: ['quiet-space'],
        alignmentRequirement: 'neutral',
        successRate: 0.85,
        failureConsequences: 'minor',
        rewards: [
          {
            type: 'summoned-entity',
            reward: 'familiar',
            quality: 0.8,
            chance: 0.9,
            description: 'A loyal familiar companion'
          }
        ],
        risks: [
          {
            type: 'summoned-hostile',
            severity: 'minor',
            chance: 0.1,
            description: 'Familiar may be hostile'
          }
        ],
        visualTheme: 'arcane',
        soundTheme: 'mystical',
        icon: 'familiar_icon',
        lore: 'Ancient texts describe the summoning of familiar spirits.',
        prerequisites: [],
        cooldown: 300000
      }
    ];
  }

  /**
   * Start a ritual
   */
  private async startRitual(ritualName: string): Promise<void> {
    this.logger.info(`🎭 Starting ritual: ${ritualName}`);

    const rituals = this.getRitualDefinitions();
    const ritual = rituals.find(r => r.name.toLowerCase() === ritualName.toLowerCase() || r.id === ritualName);

    if (!ritual) {
      this.logger.info(`❌ Ritual not found: ${ritualName}`);
      return;
    }

    // Start the ritual
    this.currentRitual = this.ritualSystem.startRitual(ritual.id, 'mage-alice', ['apprentice-bob']);

    if (this.currentRitual) {
      this.logger.info(`✅ Ritual started: ${ritual.name}`);
      this.logger.info(`   Leader: mage-alice`);
      this.logger.info(`   Participants: ${this.currentRitual.participants.length}`);
      this.logger.info(`   Steps: ${ritual.steps.length}`);
    } else {
      this.logger.info('❌ Failed to start ritual');
    }
  }

  /**
   * Progress current ritual
   */
  private progressRitual(): void {
    if (!this.currentRitual) {
      this.logger.info('❌ No active ritual to progress');
      return;
    }

    this.logger.info('🔄 Progressing ritual...');

    const result = this.ritualSystem.progressRitual(this.currentRitual.id);

    if (result) {
      this.logger.info(`✅ Step completed!`);
      this.logger.info(`   Success: ${result.success}`);
      this.logger.info(`   Energy spent: ${result.energySpent}`);
      this.logger.info(`   Quality: ${(result.quality * 100).toFixed(1)}%`);

      if (result.effectsApplied.length > 0) {
        this.logger.info('   Effects applied:');
        result.effectsApplied.forEach(effect => {
          this.logger.info(`     - ${effect.description}`);
        });
      }

      if (result.summonedEntities.length > 0) {
        this.logger.info('   Summoned entities:');
        result.summonedEntities.forEach(entity => {
          this.logger.info(`     - ${entity.name} (${entity.type})`);
        });
      }
    } else {
      this.logger.info('❌ Failed to progress ritual');
    }
  }

  /**
   * Show ritual status
   */
  private showRitualStatus(): void {
    if (!this.currentRitual) {
      this.logger.info('❌ No active ritual');
      return;
    }

    const ritual = this.currentRitual;
    const currentStep = ritual.definition.steps[ritual.currentStep];

    this.logger.info('\n📊 Ritual Status:');
    this.logger.info('=================');
    this.logger.info(`Ritual: ${ritual.definition.name}`);
    this.logger.info(`Status: ${ritual.status}`);
    this.logger.info(`Progress: ${(ritual.progress * 100).toFixed(1)}%`);
    this.logger.info(`Current Step: ${currentStep?.name || 'None'}`);
    this.logger.info(`Energy Spent: ${ritual.energySpent}`);
    this.logger.info(`Participants: ${ritual.participants.length}`);
    this.logger.info(`Summoned Entities: ${ritual.summonedEntities.length}`);
    this.logger.info(`Quality: ${(ritual.quality * 100).toFixed(1)}%`);
    this.logger.info(`Duration: ${Math.round((Date.now() - ritual.startTime) / 1000)}s`);
  }

  /**
   * Show participants
   */
  private showParticipants(): void {
    if (!this.currentRitual) {
      this.logger.info('❌ No active ritual');
      return;
    }

    this.logger.info('\n👥 Ritual Participants:');
    this.logger.info('=======================');

    this.currentRitual.participants.forEach(participant => {
      this.logger.info(`${participant.name} (${participant.role})`);
      this.logger.info(`  Status: ${participant.status}`);
      this.logger.info(`  Mana Contribution: ${participant.manaContribution || 0}`);
      this.logger.info(`  Energy Spent: ${participant.energySpent}`);
      this.logger.info(`  Items Contributed: ${participant.itemContributions.length}`);
      this.logger.info('');
    });
  }

  /**
   * Contribute to ritual
   */
  private async contributeToRitual(): Promise<void> {
    if (!this.currentRitual) {
      this.logger.info('❌ No active ritual');
      return;
    }

    this.logger.info('\n🎁 Contributing to Ritual');
    this.logger.info('=========================');

    const participantId = await this.askQuestion('Participant ID: ');
    const contributionType = await this.askQuestion('Contribution type (mana/item/time): ');

    if (contributionType === 'mana') {
      const amount = parseInt(await this.askQuestion('Mana amount: ') || '50');
      this.logger.info(`✅ Contributed ${amount} mana to the ritual`);
    } else if (contributionType === 'item') {
      const itemId = await this.askQuestion('Item ID: ');
      this.logger.info(`✅ Contributed ${itemId} to the ritual`);
    } else {
      this.logger.info(`✅ Contributed time/effort to the ritual`);
    }
  }

  /**
   * Cancel current ritual
   */
  private cancelRitual(): void {
    if (!this.currentRitual) {
      this.logger.info('❌ No active ritual to cancel');
      return;
    }

    const success = this.ritualSystem.cancelRitual(this.currentRitual.id);

    if (success) {
      this.logger.info(`❌ Cancelled ritual: ${this.currentRitual.definition.name}`);
      this.currentRitual = null;
    } else {
      this.logger.info('❌ Failed to cancel ritual');
    }
  }

  /**
   * Show statistics
   */
  private showStats(): void {
    const stats = this.ritualSystem.getStats();

    this.logger.info('\n📊 Ritual Statistics:');
    this.logger.info('=====================');
    this.logger.info(`Total Rituals: ${stats.totalRituals}`);
    this.logger.info(`Active Rituals: ${stats.activeRituals}`);
    this.logger.info(`Completed Rituals: ${stats.completedRituals}`);
    this.logger.info(`Average Quality: ${(stats.averageQuality * 100).toFixed(1)}%`);
    this.logger.info(`Most Common Category: ${stats.mostCommonCategory}`);
    this.logger.info(`Total Experience Granted: ${stats.totalExperienceGranted}`);
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    this.logger.info('\n🎬 Running Ritual System Demo...');
    this.logger.info('=================================');

    // Show available rituals
    this.logger.info('\n📜 Available rituals:');
    this.showRituals();

    // Start a ritual
    this.logger.info('\n🎭 Starting demo ritual...');
    await this.startRitual('summon-familiar');

    // Progress through steps
    if (this.currentRitual) {
      this.logger.info('\n🔄 Progressing through ritual steps...');
      for (let i = 0; i < 3; i++) {
        this.logger.info(`\nStep ${i + 1}:`);
        this.progressRitual();

        // Small delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Show final results
    this.logger.info('\n📊 Demo Results:');
    this.showStats();

    if (this.currentRitual) {
      this.showRitualStatus();
    }

    this.logger.info('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('\n🎭 MIFF RitualSystemPure CLI Help');
    this.logger.info('=================================');
    this.logger.info('');
    this.logger.info('COMMANDS:');
    this.logger.info('  rituals        - List all available rituals');
    this.logger.info('  start <ritual> - Start a ritual by name');
    this.logger.info('  progress       - Progress current ritual to next step');
    this.logger.info('  status         - Show current ritual status');
    this.logger.info('  participants   - List ritual participants');
    this.logger.info('  contribute     - Contribute to current ritual');
    this.logger.info('  cancel         - Cancel current ritual');
    this.logger.info('  stats          - Show ritual statistics');
    this.logger.info('  demo           - Run automated demo sequence');
    this.logger.info('  help           - Show this help information');
    this.logger.info('  exit           - Exit the CLI');
    this.logger.info('');
    this.logger.info('EXAMPLES:');
    this.logger.info('  start summon-familiar     # Start familiar summoning ritual');
    this.logger.info('  progress                  # Move to next ritual step');
    this.logger.info('  contribute                # Contribute mana or items');
    this.logger.info('');
    this.logger.info('RITUAL TYPES:');
    this.logger.info('  Summoning      - Call forth spirits and creatures');
    this.logger.info('  Binding        - Bind spirits to objects or locations');
    this.logger.info('  Creation       - Create magical items and constructs');
    this.logger.info('  Transformation - Transform objects or participants');
    this.logger.info('  Divination     - Gain knowledge and foresight');
    this.logger.info('  Destruction    - Unleash destructive magical forces');
    this.logger.info('');
    this.logger.info('NOTES:');
    this.logger.info('- Rituals require participants and resources');
    this.logger.info('- Each step has different requirements and effects');
    this.logger.info('- Quality affects ritual outcomes and rewards');
    this.logger.info('- Failed rituals may have negative consequences');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    this.logger.info('\n👋 Thank you for using MIFF RitualSystemPure CLI!');
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
// ESM-safe main guard
const isDirectRun = import.meta && (import.meta as any).url === `file://${process.argv[1]}`;
if (isDirectRun) {
  const cli = new RitualSystemCLI();
  cli.start();
}