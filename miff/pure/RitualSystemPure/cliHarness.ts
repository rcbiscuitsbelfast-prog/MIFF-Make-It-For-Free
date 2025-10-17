#!/usr/bin/env node

/**
 * MIFF RitualSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the RitualSystemPure with multi-step ceremonies and summoning mechanics
 */

import * as readline from 'readline';
import {
  RitualSystemPure,
  RitualDefinition,
  RitualInstance
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

class RitualSystemCLI {
  private rl: readline.Interface;
  private ritualSystem: RitualSystemPure;
  private isRunning: boolean = false;
  private currentRitual: RitualInstance | null = null;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Initialize mock systems
    const eventBus = new MockEventBus() as any;
    const rng = new MockRNG() as any;

    this.ritualSystem = new RitualSystemPure(eventBus, rng);
    this.setupDemoData();
  }

  /**
   * Setup demo data for demonstration
   */
  private setupDemoData(): void {
    console.log('🔮 Setting up ritual demo data...');

    // Create some ritual participants
    const participants = [
      { id: 'mage-alice', name: 'Mage Alice', role: 'leader' as const },
      { id: 'apprentice-bob', name: 'Apprentice Bob', role: 'participant' as const },
      { id: 'scholar-carol', name: 'Scholar Carol', role: 'observer' as const }
    ];

    console.log(`✅ Demo participants created: ${participants.length}`);
    console.log('✅ Ritual system ready for testing!');
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this.isRunning = true;
    console.log('🎭 Welcome to MIFF RitualSystemPure CLI!');
    console.log('=====================================');
    console.log('Available commands:');
    console.log('  rituals        - List all available rituals');
    console.log('  start <ritual> - Start a ritual');
    console.log('  progress       - Progress current ritual');
    console.log('  status         - Show current ritual status');
    console.log('  participants   - List ritual participants');
    console.log('  contribute     - Contribute to current ritual');
    console.log('  cancel         - Cancel current ritual');
    console.log('  stats          - Show ritual statistics');
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
            console.log('❌ Usage: start <ritual-name>');
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
   * Show available rituals
   */
  private showRituals(): void {
    const ritualDefinitions = this.getRitualDefinitions();

    console.log('\n📜 Available Rituals:');
    console.log('=====================');

    if (ritualDefinitions.length === 0) {
      console.log('No rituals available. The system will initialize with basic rituals.');
      return;
    }

    ritualDefinitions.forEach((ritual: any) => {
      console.log(`${ritual.name} (${ritual.id})`);
      console.log(`  Category: ${ritual.category} | Tier: ${ritual.tier}`);
      console.log(`  Participants: ${ritual.minParticipants}-${ritual.maxParticipants}`);
      console.log(`  Mana Cost: ${ritual.manaCost}`);
      console.log(`  Duration: ${Math.round(ritual.baseDuration / 1000)}s`);
      console.log(`  Steps: ${ritual.steps.length}`);
      console.log(`  Description: ${ritual.description}`);
      console.log('');
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
    console.log(`🎭 Starting ritual: ${ritualName}`);

    const rituals = this.getRitualDefinitions();
    const ritual = rituals.find(r => r.name.toLowerCase() === ritualName.toLowerCase() || r.id === ritualName);

    if (!ritual) {
      console.log(`❌ Ritual not found: ${ritualName}`);
      return;
    }

    // Start the ritual
    this.currentRitual = this.ritualSystem.startRitual(ritual.id, 'mage-alice', ['apprentice-bob']);

    if (this.currentRitual) {
      console.log(`✅ Ritual started: ${ritual.name}`);
      console.log(`   Leader: mage-alice`);
      console.log(`   Participants: ${this.currentRitual.participants.length}`);
      console.log(`   Steps: ${ritual.steps.length}`);
    } else {
      console.log('❌ Failed to start ritual');
    }
  }

  /**
   * Progress current ritual
   */
  private progressRitual(): void {
    if (!this.currentRitual) {
      console.log('❌ No active ritual to progress');
      return;
    }

    console.log('🔄 Progressing ritual...');

    const result = this.ritualSystem.progressRitual(this.currentRitual.id);

    if (result) {
      console.log(`✅ Step completed!`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Energy spent: ${result.energySpent}`);
      console.log(`   Quality: ${(result.quality * 100).toFixed(1)}%`);

      if (result.effectsApplied.length > 0) {
        console.log('   Effects applied:');
        result.effectsApplied.forEach((effect: any) => {
          console.log(`     - ${effect.description}`);
        });
      }

      if (result.summonedEntities.length > 0) {
        console.log('   Summoned entities:');
        result.summonedEntities.forEach((entity: any) => {
          console.log(`     - ${entity.name} (${entity.type})`);
        });
      }
    } else {
      console.log('❌ Failed to progress ritual');
    }
  }

  /**
   * Show ritual status
   */
  private showRitualStatus(): void {
    if (!this.currentRitual) {
      console.log('❌ No active ritual');
      return;
    }

    const ritual = this.currentRitual;
    const currentStep = ritual.definition.steps[ritual.currentStep];

    console.log('\n📊 Ritual Status:');
    console.log('=================');
    console.log(`Ritual: ${ritual.definition.name}`);
    console.log(`Status: ${ritual.status}`);
    console.log(`Progress: ${(ritual.progress * 100).toFixed(1)}%`);
    console.log(`Current Step: ${currentStep?.name || 'None'}`);
    console.log(`Energy Spent: ${ritual.energySpent}`);
    console.log(`Participants: ${ritual.participants.length}`);
    console.log(`Summoned Entities: ${ritual.summonedEntities.length}`);
    console.log(`Quality: ${(ritual.quality * 100).toFixed(1)}%`);
    console.log(`Duration: ${Math.round((Date.now() - ritual.startTime) / 1000)}s`);
  }

  /**
   * Show participants
   */
  private showParticipants(): void {
    if (!this.currentRitual) {
      console.log('❌ No active ritual');
      return;
    }

    console.log('\n👥 Ritual Participants:');
    console.log('=======================');

    this.currentRitual.participants.forEach((participant: any) => {
      console.log(`${participant.name} (${participant.role})`);
      console.log(`  Status: ${participant.status}`);
      console.log(`  Mana Contribution: ${participant.manaContribution || 0}`);
      console.log(`  Energy Spent: ${participant.energySpent}`);
      console.log(`  Items Contributed: ${participant.itemContributions.length}`);
      console.log('');
    });
  }

  /**
   * Contribute to ritual
   */
  private async contributeToRitual(): Promise<void> {
    if (!this.currentRitual) {
      console.log('❌ No active ritual');
      return;
    }

    console.log('\n🎁 Contributing to Ritual');
    console.log('=========================');

    const participantId = await this.askQuestion('Participant ID: ');
    const contributionType = await this.askQuestion('Contribution type (mana/item/time): ');

    if (contributionType === 'mana') {
      const amount = parseInt(await this.askQuestion('Mana amount: ') || '50');
      console.log(`✅ Contributed ${amount} mana to the ritual`);
    } else if (contributionType === 'item') {
      const itemId = await this.askQuestion('Item ID: ');
      console.log(`✅ Contributed ${itemId} to the ritual`);
    } else {
      console.log(`✅ Contributed time/effort to the ritual`);
    }
  }

  /**
   * Cancel current ritual
   */
  private cancelRitual(): void {
    if (!this.currentRitual) {
      console.log('❌ No active ritual to cancel');
      return;
    }

    const success = this.ritualSystem.cancelRitual(this.currentRitual.id);

    if (success) {
      console.log(`❌ Cancelled ritual: ${this.currentRitual.definition.name}`);
      this.currentRitual = null;
    } else {
      console.log('❌ Failed to cancel ritual');
    }
  }

  /**
   * Show statistics
   */
  private showStats(): void {
    const stats = this.ritualSystem.getStats();

    console.log('\n📊 Ritual Statistics:');
    console.log('=====================');
    console.log(`Total Rituals: ${stats.totalRituals}`);
    console.log(`Active Rituals: ${stats.activeRituals}`);
    console.log(`Completed Rituals: ${stats.completedRituals}`);
    console.log(`Average Quality: ${(stats.averageQuality * 100).toFixed(1)}%`);
    console.log(`Most Common Category: ${stats.mostCommonCategory}`);
    console.log(`Total Experience Granted: ${stats.totalExperienceGranted}`);
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    console.log('\n🎬 Running Ritual System Demo...');
    console.log('=================================');

    // Show available rituals
    console.log('\n📜 Available rituals:');
    this.showRituals();

    // Start a ritual
    console.log('\n🎭 Starting demo ritual...');
    await this.startRitual('summon-familiar');

    // Progress through steps
    if (this.currentRitual) {
      console.log('\n🔄 Progressing through ritual steps...');
      for (let i = 0; i < 3; i++) {
        console.log(`\nStep ${i + 1}:`);
        this.progressRitual();

        // Small delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Show final results
    console.log('\n📊 Demo Results:');
    this.showStats();

    if (this.currentRitual) {
      this.showRitualStatus();
    }

    console.log('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('\n🎭 MIFF RitualSystemPure CLI Help');
    console.log('=================================');
    console.log('');
    console.log('COMMANDS:');
    console.log('  rituals        - List all available rituals');
    console.log('  start <ritual> - Start a ritual by name');
    console.log('  progress       - Progress current ritual to next step');
    console.log('  status         - Show current ritual status');
    console.log('  participants   - List ritual participants');
    console.log('  contribute     - Contribute to current ritual');
    console.log('  cancel         - Cancel current ritual');
    console.log('  stats          - Show ritual statistics');
    console.log('  demo           - Run automated demo sequence');
    console.log('  help           - Show this help information');
    console.log('  exit           - Exit the CLI');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  start summon-familiar     # Start familiar summoning ritual');
    console.log('  progress                  # Move to next ritual step');
    console.log('  contribute                # Contribute mana or items');
    console.log('');
    console.log('RITUAL TYPES:');
    console.log('  Summoning      - Call forth spirits and creatures');
    console.log('  Binding        - Bind spirits to objects or locations');
    console.log('  Creation       - Create magical items and constructs');
    console.log('  Transformation - Transform objects or participants');
    console.log('  Divination     - Gain knowledge and foresight');
    console.log('  Destruction    - Unleash destructive magical forces');
    console.log('');
    console.log('NOTES:');
    console.log('- Rituals require participants and resources');
    console.log('- Each step has different requirements and effects');
    console.log('- Quality affects ritual outcomes and rewards');
    console.log('- Failed rituals may have negative consequences');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    console.log('\n👋 Thank you for using MIFF RitualSystemPure CLI!');
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