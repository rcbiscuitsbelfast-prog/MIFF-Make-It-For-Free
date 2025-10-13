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
    console.info('🔮 Setting up ritual demo data...');

    // Create some ritual participants
    const participants = [
      { id: 'mage-alice', name: 'Mage Alice', role: 'leader' as const },
      { id: 'apprentice-bob', name: 'Apprentice Bob', role: 'participant' as const },
      { id: 'scholar-carol', name: 'Scholar Carol', role: 'observer' as const }
    ];

    console.info(`✅ Demo participants created: ${participants.length}`);
    console.info('✅ Ritual system ready for testing!');
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this.isRunning = true;
    console.info('🎭 Welcome to MIFF RitualSystemPure CLI!');
    console.info('=====================================');
    console.info('Available commands:');
    console.info('  rituals        - List all available rituals');
    console.info('  start <ritual> - Start a ritual');
    console.info('  progress       - Progress current ritual');
    console.info('  status         - Show current ritual status');
    console.info('  participants   - List ritual participants');
    console.info('  contribute     - Contribute to current ritual');
    console.info('  cancel         - Cancel current ritual');
    console.info('  stats          - Show ritual statistics');
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
            console.info('❌ Usage: start <ritual-name>');
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
   * Show available rituals
   */
  private showRituals(): void {
    const ritualDefinitions = this.getRitualDefinitions();

    console.info('\n📜 Available Rituals:');
    console.info('=====================');

    if (ritualDefinitions.length === 0) {
      console.info('No rituals available. The system will initialize with basic rituals.');
      return;
    }

    ritualDefinitions.forEach(ritual => {
      console.info(`${ritual.name} (${ritual.id})`);
      console.info(`  Category: ${ritual.category} | Tier: ${ritual.tier}`);
      console.info(`  Participants: ${ritual.minParticipants}-${ritual.maxParticipants}`);
      console.info(`  Mana Cost: ${ritual.manaCost}`);
      console.info(`  Duration: ${Math.round(ritual.baseDuration / 1000)}s`);
      console.info(`  Steps: ${ritual.steps.length}`);
      console.info(`  Description: ${ritual.description}`);
      console.info('');
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
    console.info(`🎭 Starting ritual: ${ritualName}`);

    const rituals = this.getRitualDefinitions();
    const ritual = rituals.find(r => r.name.toLowerCase() === ritualName.toLowerCase() || r.id === ritualName);

    if (!ritual) {
      console.info(`❌ Ritual not found: ${ritualName}`);
      return;
    }

    // Start the ritual
    this.currentRitual = this.ritualSystem.startRitual(ritual.id, 'mage-alice', ['apprentice-bob']);

    if (this.currentRitual) {
      console.info(`✅ Ritual started: ${ritual.name}`);
      console.info(`   Leader: mage-alice`);
      console.info(`   Participants: ${this.currentRitual.participants.length}`);
      console.info(`   Steps: ${ritual.steps.length}`);
    } else {
      console.info('❌ Failed to start ritual');
    }
  }

  /**
   * Progress current ritual
   */
  private progressRitual(): void {
    if (!this.currentRitual) {
      console.info('❌ No active ritual to progress');
      return;
    }

    console.info('🔄 Progressing ritual...');

    const result = this.ritualSystem.progressRitual(this.currentRitual.id);

    if (result) {
      console.info(`✅ Step completed!`);
      console.info(`   Success: ${result.success}`);
      console.info(`   Energy spent: ${result.energySpent}`);
      console.info(`   Quality: ${(result.quality * 100).toFixed(1)}%`);

      if (result.effectsApplied.length > 0) {
        console.info('   Effects applied:');
        result.effectsApplied.forEach(effect => {
          console.info(`     - ${effect.description}`);
        });
      }

      if (result.summonedEntities.length > 0) {
        console.info('   Summoned entities:');
        result.summonedEntities.forEach(entity => {
          console.info(`     - ${entity.name} (${entity.type})`);
        });
      }
    } else {
      console.info('❌ Failed to progress ritual');
    }
  }

  /**
   * Show ritual status
   */
  private showRitualStatus(): void {
    if (!this.currentRitual) {
      console.info('❌ No active ritual');
      return;
    }

    const ritual = this.currentRitual;
    const currentStep = ritual.definition.steps[ritual.currentStep];

    console.info('\n📊 Ritual Status:');
    console.info('=================');
    console.info(`Ritual: ${ritual.definition.name}`);
    console.info(`Status: ${ritual.status}`);
    console.info(`Progress: ${(ritual.progress * 100).toFixed(1)}%`);
    console.info(`Current Step: ${currentStep?.name || 'None'}`);
    console.info(`Energy Spent: ${ritual.energySpent}`);
    console.info(`Participants: ${ritual.participants.length}`);
    console.info(`Summoned Entities: ${ritual.summonedEntities.length}`);
    console.info(`Quality: ${(ritual.quality * 100).toFixed(1)}%`);
    console.info(`Duration: ${Math.round((Date.now() - ritual.startTime) / 1000)}s`);
  }

  /**
   * Show participants
   */
  private showParticipants(): void {
    if (!this.currentRitual) {
      console.info('❌ No active ritual');
      return;
    }

    console.info('\n👥 Ritual Participants:');
    console.info('=======================');

    this.currentRitual.participants.forEach(participant => {
      console.info(`${participant.name} (${participant.role})`);
      console.info(`  Status: ${participant.status}`);
      console.info(`  Mana Contribution: ${participant.manaContribution || 0}`);
      console.info(`  Energy Spent: ${participant.energySpent}`);
      console.info(`  Items Contributed: ${participant.itemContributions.length}`);
      console.info('');
    });
  }

  /**
   * Contribute to ritual
   */
  private async contributeToRitual(): Promise<void> {
    if (!this.currentRitual) {
      console.info('❌ No active ritual');
      return;
    }

    console.info('\n🎁 Contributing to Ritual');
    console.info('=========================');

    const participantId = await this.askQuestion('Participant ID: ');
    const contributionType = await this.askQuestion('Contribution type (mana/item/time): ');

    if (contributionType === 'mana') {
      const amount = parseInt(await this.askQuestion('Mana amount: ') || '50');
      console.info(`✅ Contributed ${amount} mana to the ritual`);
    } else if (contributionType === 'item') {
      const itemId = await this.askQuestion('Item ID: ');
      console.info(`✅ Contributed ${itemId} to the ritual`);
    } else {
      console.info(`✅ Contributed time/effort to the ritual`);
    }
  }

  /**
   * Cancel current ritual
   */
  private cancelRitual(): void {
    if (!this.currentRitual) {
      console.info('❌ No active ritual to cancel');
      return;
    }

    const success = this.ritualSystem.cancelRitual(this.currentRitual.id);

    if (success) {
      console.info(`❌ Cancelled ritual: ${this.currentRitual.definition.name}`);
      this.currentRitual = null;
    } else {
      console.info('❌ Failed to cancel ritual');
    }
  }

  /**
   * Show statistics
   */
  private showStats(): void {
    const stats = this.ritualSystem.getStats();

    console.info('\n📊 Ritual Statistics:');
    console.info('=====================');
    console.info(`Total Rituals: ${stats.totalRituals}`);
    console.info(`Active Rituals: ${stats.activeRituals}`);
    console.info(`Completed Rituals: ${stats.completedRituals}`);
    console.info(`Average Quality: ${(stats.averageQuality * 100).toFixed(1)}%`);
    console.info(`Most Common Category: ${stats.mostCommonCategory}`);
    console.info(`Total Experience Granted: ${stats.totalExperienceGranted}`);
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    console.info('\n🎬 Running Ritual System Demo...');
    console.info('=================================');

    // Show available rituals
    console.info('\n📜 Available rituals:');
    this.showRituals();

    // Start a ritual
    console.info('\n🎭 Starting demo ritual...');
    await this.startRitual('summon-familiar');

    // Progress through steps
    if (this.currentRitual) {
      console.info('\n🔄 Progressing through ritual steps...');
      for (let i = 0; i < 3; i++) {
        console.info(`\nStep ${i + 1}:`);
        this.progressRitual();

        // Small delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Show final results
    console.info('\n📊 Demo Results:');
    this.showStats();

    if (this.currentRitual) {
      this.showRitualStatus();
    }

    console.info('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.info('\n🎭 MIFF RitualSystemPure CLI Help');
    console.info('=================================');
    console.info('');
    console.info('COMMANDS:');
    console.info('  rituals        - List all available rituals');
    console.info('  start <ritual> - Start a ritual by name');
    console.info('  progress       - Progress current ritual to next step');
    console.info('  status         - Show current ritual status');
    console.info('  participants   - List ritual participants');
    console.info('  contribute     - Contribute to current ritual');
    console.info('  cancel         - Cancel current ritual');
    console.info('  stats          - Show ritual statistics');
    console.info('  demo           - Run automated demo sequence');
    console.info('  help           - Show this help information');
    console.info('  exit           - Exit the CLI');
    console.info('');
    console.info('EXAMPLES:');
    console.info('  start summon-familiar     # Start familiar summoning ritual');
    console.info('  progress                  # Move to next ritual step');
    console.info('  contribute                # Contribute mana or items');
    console.info('');
    console.info('RITUAL TYPES:');
    console.info('  Summoning      - Call forth spirits and creatures');
    console.info('  Binding        - Bind spirits to objects or locations');
    console.info('  Creation       - Create magical items and constructs');
    console.info('  Transformation - Transform objects or participants');
    console.info('  Divination     - Gain knowledge and foresight');
    console.info('  Destruction    - Unleash destructive magical forces');
    console.info('');
    console.info('NOTES:');
    console.info('- Rituals require participants and resources');
    console.info('- Each step has different requirements and effects');
    console.info('- Quality affects ritual outcomes and rewards');
    console.info('- Failed rituals may have negative consequences');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    console.info('\n👋 Thank you for using MIFF RitualSystemPure CLI!');
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