#!/usr/bin/env node

/**
 * MIFF MagicSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the MagicSystemPure spell system with mana pools and elemental interactions
 */

import * as readline from 'readline';
import {
  MagicSystemPure,
  SpellDefinition,
  ManaPool,
  SpellElement,
  SpellSchool
} from './index';

// Real EventBus integration for CLI
import { EventBus } from '../EventBusPure/index';

class CLIEventBus extends EventBus {
  emit(event: string, data: any) {
    super.publish(event, data);
    this.logger.info(`📡 Event: ${event}`, data);
  }

  on(event: string, handler: Function) {
    super.subscribe(event, handler);
  }
}

// Real HealthSystem integration for CLI
import { HealthSystemManager } from '../HealthSystemPure/Manager';

class CLIHealthSystem extends HealthSystemManager {
  damageEntity(entityId: string, damage: number) {
    const result = super.applyDamage(entityId, damage);
    this.logger.info(`💔 ${entityId} takes ${damage} damage (HP: ${result.newHP}/${result.maxHP})`);
    return result;
  }

  healEntity(entityId: string, healing: number) {
    const result = super.applyHealing(entityId, healing);
    this.logger.info(`💚 ${entityId} heals ${healing} health (HP: ${result.newHP}/${result.maxHP})`);
    return result;
  }
}

class MockCombatSystem {
  // Mock implementation
}

// Real RNG integration for CLI
import { RNGManager } from '../RNGPure/index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class CLIRNG extends RNGManager {
  constructor() {
    this.logger = new StructuredLogger({ module: 'CLIEventBus' });
    super('magic_system_cli');
  }

  nextFloat(): number {
    return this.random();
  }

  nextInt(min: number, max: number): number {
    return this.randomInt(min, max);
  }
}

class MagicSystemCLI {
  private rl: readline.Interface;
  private magicSystem: MagicSystemPure;
  private currentCaster: string;
  private isRunning: boolean = false;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Initialize mock systems
    const eventBus = new RealEventBus() as any;
    const healthSystem = new MockHealthSystem() as any;
    const combatSystem = new MockCombatSystem() as any;
    const rng = new MockRNG() as any;

    this.magicSystem = new MagicSystemPure(eventBus, healthSystem, combatSystem, rng);
    this.currentCaster = 'player';

    // Create initial mana pool
    this.magicSystem.createManaPool(this.currentCaster, 150);
  }

  /**
   * Start the CLI interface
   */
  start(): void {
    this.isRunning = true;
    this.logger.info('🔮 Welcome to MIFF MagicSystemPure CLI!');
    this.logger.info('=====================================');
    this.logger.info('Available commands:');
    this.logger.info('  spells        - List all spells');
    this.logger.info('  cast <spell>  - Cast a spell');
    this.logger.info('  learn <spell> - Learn a spell');
    this.logger.info('  mana          - Show mana status');
    this.logger.info('  elements      - List all elements');
    this.logger.info('  schools       - List spell schools');
    this.logger.info('  stats         - Show spell statistics');
    this.logger.info('  demo          - Run demo sequence');
    this.logger.info('  help          - Show this help');
    this.logger.info('  exit          - Exit the CLI');
    this.logger.info('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('magic> ', (input) => {
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
        case 'spells':
          this.showSpells();
          break;

        case 'cast':
          if (args.length === 0) {
            this.logger.info('❌ Usage: cast <spell-name>');
          } else {
            await this.castSpell(args[0]);
          }
          break;

        case 'learn':
          if (args.length === 0) {
            this.logger.info('❌ Usage: learn <spell-name>');
          } else {
            this.learnSpell(args[0]);
          }
          break;

        case 'mana':
          this.showMana();
          break;

        case 'elements':
          this.showElements();
          break;

        case 'schools':
          this.showSchools();
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
   * Show available spells
   */
  private showSpells(): void {
    const spells = this.magicSystem.getAllSpellDefinitions();
    const casterSpells = this.magicSystem.getSpellsForCaster(this.currentCaster);

    this.logger.info('\n📚 Available Spells:');
    this.logger.info('===================');

    spells.forEach(spell => {
      const isLearned = casterSpells.some(s => s.definition.id === spell.id);
      const status = isLearned ? '✅ Learned' : '❌ Not Learned';

      this.logger.info(`${spell.name} (${spell.id})`);
      this.logger.info(`   School: ${spell.school} | Mana: ${spell.manaCost} | Cooldown: ${spell.cooldown}ms`);
      this.logger.info(`   Description: ${spell.description}`);
      this.logger.info(`   Status: ${status}`);
      this.logger.info('');
    });
  }

  /**
   * Cast a spell
   */
  private async castSpell(spellName: string): Promise<void> {
    const spells = this.magicSystem.getAllSpellDefinitions();
    const spell = spells.find(s => s.name.toLowerCase() === spellName.toLowerCase() || s.id === spellName);

    if (!spell) {
      this.logger.info(`❌ Spell not found: ${spellName}`);
      return;
    }

    // Unlock spell if not already learned
    const casterSpells = this.magicSystem.getSpellsForCaster(this.currentCaster);
    const isLearned = casterSpells.some(s => s.definition.id === spell.id);

    if (!isLearned) {
      this.magicSystem.unlockSpell(this.currentCaster, spell.id);
      this.logger.info(`📚 Learned spell: ${spell.name}`);
    }

    // Cast the spell
    this.logger.info(`🎯 Casting ${spell.name}...`);
    const result = this.magicSystem.castSpell(this.currentCaster, spell.id, ['target-enemy']);

    if (result.success) {
      this.logger.info(`✅ Spell cast successfully!`);
      this.logger.info(`   Mana spent: ${result.manaSpent}`);
      this.logger.info(`   Damage dealt: ${result.damageDealt}`);
      this.logger.info(`   Healing done: ${result.healingDone}`);

      if (result.buffsApplied.length > 0) {
        this.logger.info(`   Buffs applied: ${result.buffsApplied.join(', ')}`);
      }

      if (result.debuffsApplied.length > 0) {
        this.logger.info(`   Debuffs applied: ${result.debuffsApplied.join(', ')}`);
      }
    } else {
      this.logger.info(`❌ Spell cast failed: ${result.failureReason}`);
    }
  }

  /**
   * Learn a spell
   */
  private learnSpell(spellName: string): void {
    const spells = this.magicSystem.getAllSpellDefinitions();
    const spell = spells.find(s => s.name.toLowerCase() === spellName.toLowerCase() || s.id === spellName);

    if (!spell) {
      this.logger.info(`❌ Spell not found: ${spellName}`);
      return;
    }

    const success = this.magicSystem.unlockSpell(this.currentCaster, spell.id);
    if (success) {
      this.logger.info(`📚 Successfully learned: ${spell.name}`);
    } else {
      this.logger.info(`❌ Failed to learn: ${spell.name}`);
    }
  }

  /**
   * Show mana status
   */
  private showMana(): void {
    const manaPool = this.magicSystem.getManaPool(this.currentCaster);

    if (!manaPool) {
      this.logger.info('❌ No mana pool found. Create one first.');
      return;
    }

    this.logger.info('\n💧 Mana Pool Status:');
    this.logger.info('==================');
    this.logger.info(`Current Mana: ${manaPool.current}/${manaPool.maximum}`);
    this.logger.info(`Regeneration Rate: ${manaPool.regenerationRate} mana/second`);
    this.logger.info(`Mana Percentage: ${((manaPool.current / manaPool.maximum) * 100).toFixed(1)}%`);

    // Show elemental affinities
    this.logger.info('\nElemental Affinities:');
    manaPool.elementalAffinities.forEach((affinity, element) => {
      this.logger.info(`  ${element}: ${(affinity * 100).toFixed(0)}%`);
    });

    // Show spell school modifiers
    this.logger.info('\nSpell School Modifiers:');
    manaPool.modifiers.forEach((modifier, school) => {
      this.logger.info(`  ${school}: ${(modifier * 100).toFixed(0)}%`);
    });
  }

  /**
   * Show elements
   */
  private showElements(): void {
    const elements = this.magicSystem.getAllElements();

    this.logger.info('\n🧪 Elemental System:');
    this.logger.info('===================');

    elements.forEach(element => {
      this.logger.info(`${element.name.toUpperCase()} (${element.color})`);
      this.logger.info(`  Description: ${element.description}`);
      this.logger.info(`  Strengths: ${element.strengths.join(', ')}`);
      this.logger.info(`  Weaknesses: ${element.weaknesses.join(', ')}`);
      this.logger.info('');
    });
  }

  /**
   * Show spell schools
   */
  private showSchools(): void {
    const schools = this.magicSystem.getAllSpellSchools();

    this.logger.info('\n🎓 Spell Schools:');
    this.logger.info('=================');

    schools.forEach(school => {
      this.logger.info(`${school.icon} ${school.name.toUpperCase()} (${school.color})`);
      this.logger.info(`  Description: ${school.description}`);
      this.logger.info(`  Passive Bonus: ${school.passiveBonus}`);
      this.logger.info(`  Strength: ${school.strength}`);
      this.logger.info(`  Weakness: ${school.weakness}`);
      this.logger.info('');
    });
  }

  /**
   * Show statistics
   */
  private showStats(): void {
    const casterSpells = this.magicSystem.getSpellsForCaster(this.currentCaster);
    const manaPool = this.magicSystem.getManaPool(this.currentCaster);

    this.logger.info('\n📊 Magic Statistics:');
    this.logger.info('====================');

    if (manaPool) {
      this.logger.info(`Mana Pool: ${manaPool.current}/${manaPool.maximum}`);
      this.logger.info(`Regeneration: ${manaPool.regenerationRate}/sec`);
    }

    this.logger.info(`Learned Spells: ${casterSpells.length}`);
    this.logger.info(`Available Spells: ${this.magicSystem.getAllSpellDefinitions().length}`);

    // Show spell breakdown by school
    const schoolCount = new Map<string, number>();
    casterSpells.forEach(spell => {
      const school = spell.definition.school;
      schoolCount.set(school, (schoolCount.get(school) || 0) + 1);
    });

    this.logger.info('\nSpells by School:');
    schoolCount.forEach((count, school) => {
      this.logger.info(`  ${school}: ${count}`);
    });
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    this.logger.info('\n🎬 Running Magic System Demo...');
    this.logger.info('===============================');

    // Ensure we have some spells learned
    const spells = this.magicSystem.getAllSpellDefinitions();
    if (spells.length > 0) {
      // Learn first few spells
      for (let i = 0; i < Math.min(3, spells.length); i++) {
        this.magicSystem.unlockSpell(this.currentCaster, spells[i].id);
        this.logger.info(`📚 Learned: ${spells[i].name}`);
      }

      // Cast some spells
      this.logger.info('\n🔥 Casting spells...');
      for (let i = 0; i < 3; i++) {
        const spell = spells[i];
        if (spell) {
          this.logger.info(`\n🎯 Casting ${spell.name}...`);
          const result = this.magicSystem.castSpell(this.currentCaster, spell.id, ['demo-target']);
          this.logger.info(`   Result: ${result.success ? 'Success' : 'Failed'}`);
          this.logger.info(`   Mana spent: ${result.manaSpent}`);
          this.logger.info(`   Damage: ${result.damageDealt}, Healing: ${result.healingDone}`);
        }
      }
    }

    // Show final mana status
    this.logger.info('\n💧 Final Mana Status:');
    this.showMana();

    this.logger.info('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('\n🔮 MIFF MagicSystemPure CLI Help');
    this.logger.info('===============================');
    this.logger.info('');
    this.logger.info('COMMANDS:');
    this.logger.info('  spells        - List all available spells');
    this.logger.info('  cast <spell>  - Cast a spell by name or ID');
    this.logger.info('  learn <spell> - Learn a spell by name or ID');
    this.logger.info('  mana          - Show current mana status');
    this.logger.info('  elements      - List all magic elements');
    this.logger.info('  schools       - List all spell schools');
    this.logger.info('  stats         - Show spell casting statistics');
    this.logger.info('  demo          - Run automated demo sequence');
    this.logger.info('  help          - Show this help information');
    this.logger.info('  exit          - Exit the CLI');
    this.logger.info('');
    this.logger.info('EXAMPLES:');
    this.logger.info('  cast firebolt     # Cast Fire Bolt spell');
    this.logger.info('  learn heal        # Learn Minor Heal spell');
    this.logger.info('  cast magic-missile # Cast Magic Missile spell');
    this.logger.info('');
    this.logger.info('NOTES:');
    this.logger.info('- Spells must be learned before they can be cast');
    this.logger.info('- Mana regenerates over time');
    this.logger.info('- Elements have strengths and weaknesses');
    this.logger.info('- Spell schools provide different bonuses');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    this.logger.info('\n👋 Thank you for using MIFF MagicSystemPure CLI!');
    this.isRunning = false;
    this.rl.close();
    process.exit(0);
  }
}

// Main execution
// ESM-safe main guard
const isDirectRun = import.meta && (import.meta as any).url === `file://${process.argv[1]}`;
if (isDirectRun) {
  const cli = new MagicSystemCLI();
  cli.start();
}