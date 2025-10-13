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
    console.info(`📡 Event: ${event}`, data);
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
    console.info(`💔 ${entityId} takes ${damage} damage (HP: ${result.newHP}/${result.maxHP})`);
    return result;
  }

  healEntity(entityId: string, healing: number) {
    const result = super.applyHealing(entityId, healing);
    console.info(`💚 ${entityId} heals ${healing} health (HP: ${result.newHP}/${result.maxHP})`);
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
    console.info('🔮 Welcome to MIFF MagicSystemPure CLI!');
    console.info('=====================================');
    console.info('Available commands:');
    console.info('  spells        - List all spells');
    console.info('  cast <spell>  - Cast a spell');
    console.info('  learn <spell> - Learn a spell');
    console.info('  mana          - Show mana status');
    console.info('  elements      - List all elements');
    console.info('  schools       - List spell schools');
    console.info('  stats         - Show spell statistics');
    console.info('  demo          - Run demo sequence');
    console.info('  help          - Show this help');
    console.info('  exit          - Exit the CLI');
    console.info('');

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
            console.info('❌ Usage: cast <spell-name>');
          } else {
            await this.castSpell(args[0]);
          }
          break;

        case 'learn':
          if (args.length === 0) {
            console.info('❌ Usage: learn <spell-name>');
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
   * Show available spells
   */
  private showSpells(): void {
    const spells = this.magicSystem.getAllSpellDefinitions();
    const casterSpells = this.magicSystem.getSpellsForCaster(this.currentCaster);

    console.info('\n📚 Available Spells:');
    console.info('===================');

    spells.forEach(spell => {
      const isLearned = casterSpells.some(s => s.definition.id === spell.id);
      const status = isLearned ? '✅ Learned' : '❌ Not Learned';

      console.info(`${spell.name} (${spell.id})`);
      console.info(`   School: ${spell.school} | Mana: ${spell.manaCost} | Cooldown: ${spell.cooldown}ms`);
      console.info(`   Description: ${spell.description}`);
      console.info(`   Status: ${status}`);
      console.info('');
    });
  }

  /**
   * Cast a spell
   */
  private async castSpell(spellName: string): Promise<void> {
    const spells = this.magicSystem.getAllSpellDefinitions();
    const spell = spells.find(s => s.name.toLowerCase() === spellName.toLowerCase() || s.id === spellName);

    if (!spell) {
      console.info(`❌ Spell not found: ${spellName}`);
      return;
    }

    // Unlock spell if not already learned
    const casterSpells = this.magicSystem.getSpellsForCaster(this.currentCaster);
    const isLearned = casterSpells.some(s => s.definition.id === spell.id);

    if (!isLearned) {
      this.magicSystem.unlockSpell(this.currentCaster, spell.id);
      console.info(`📚 Learned spell: ${spell.name}`);
    }

    // Cast the spell
    console.info(`🎯 Casting ${spell.name}...`);
    const result = this.magicSystem.castSpell(this.currentCaster, spell.id, ['target-enemy']);

    if (result.success) {
      console.info(`✅ Spell cast successfully!`);
      console.info(`   Mana spent: ${result.manaSpent}`);
      console.info(`   Damage dealt: ${result.damageDealt}`);
      console.info(`   Healing done: ${result.healingDone}`);

      if (result.buffsApplied.length > 0) {
        console.info(`   Buffs applied: ${result.buffsApplied.join(', ')}`);
      }

      if (result.debuffsApplied.length > 0) {
        console.info(`   Debuffs applied: ${result.debuffsApplied.join(', ')}`);
      }
    } else {
      console.info(`❌ Spell cast failed: ${result.failureReason}`);
    }
  }

  /**
   * Learn a spell
   */
  private learnSpell(spellName: string): void {
    const spells = this.magicSystem.getAllSpellDefinitions();
    const spell = spells.find(s => s.name.toLowerCase() === spellName.toLowerCase() || s.id === spellName);

    if (!spell) {
      console.info(`❌ Spell not found: ${spellName}`);
      return;
    }

    const success = this.magicSystem.unlockSpell(this.currentCaster, spell.id);
    if (success) {
      console.info(`📚 Successfully learned: ${spell.name}`);
    } else {
      console.info(`❌ Failed to learn: ${spell.name}`);
    }
  }

  /**
   * Show mana status
   */
  private showMana(): void {
    const manaPool = this.magicSystem.getManaPool(this.currentCaster);

    if (!manaPool) {
      console.info('❌ No mana pool found. Create one first.');
      return;
    }

    console.info('\n💧 Mana Pool Status:');
    console.info('==================');
    console.info(`Current Mana: ${manaPool.current}/${manaPool.maximum}`);
    console.info(`Regeneration Rate: ${manaPool.regenerationRate} mana/second`);
    console.info(`Mana Percentage: ${((manaPool.current / manaPool.maximum) * 100).toFixed(1)}%`);

    // Show elemental affinities
    console.info('\nElemental Affinities:');
    manaPool.elementalAffinities.forEach((affinity, element) => {
      console.info(`  ${element}: ${(affinity * 100).toFixed(0)}%`);
    });

    // Show spell school modifiers
    console.info('\nSpell School Modifiers:');
    manaPool.modifiers.forEach((modifier, school) => {
      console.info(`  ${school}: ${(modifier * 100).toFixed(0)}%`);
    });
  }

  /**
   * Show elements
   */
  private showElements(): void {
    const elements = this.magicSystem.getAllElements();

    console.info('\n🧪 Elemental System:');
    console.info('===================');

    elements.forEach(element => {
      console.info(`${element.name.toUpperCase()} (${element.color})`);
      console.info(`  Description: ${element.description}`);
      console.info(`  Strengths: ${element.strengths.join(', ')}`);
      console.info(`  Weaknesses: ${element.weaknesses.join(', ')}`);
      console.info('');
    });
  }

  /**
   * Show spell schools
   */
  private showSchools(): void {
    const schools = this.magicSystem.getAllSpellSchools();

    console.info('\n🎓 Spell Schools:');
    console.info('=================');

    schools.forEach(school => {
      console.info(`${school.icon} ${school.name.toUpperCase()} (${school.color})`);
      console.info(`  Description: ${school.description}`);
      console.info(`  Passive Bonus: ${school.passiveBonus}`);
      console.info(`  Strength: ${school.strength}`);
      console.info(`  Weakness: ${school.weakness}`);
      console.info('');
    });
  }

  /**
   * Show statistics
   */
  private showStats(): void {
    const casterSpells = this.magicSystem.getSpellsForCaster(this.currentCaster);
    const manaPool = this.magicSystem.getManaPool(this.currentCaster);

    console.info('\n📊 Magic Statistics:');
    console.info('====================');

    if (manaPool) {
      console.info(`Mana Pool: ${manaPool.current}/${manaPool.maximum}`);
      console.info(`Regeneration: ${manaPool.regenerationRate}/sec`);
    }

    console.info(`Learned Spells: ${casterSpells.length}`);
    console.info(`Available Spells: ${this.magicSystem.getAllSpellDefinitions().length}`);

    // Show spell breakdown by school
    const schoolCount = new Map<string, number>();
    casterSpells.forEach(spell => {
      const school = spell.definition.school;
      schoolCount.set(school, (schoolCount.get(school) || 0) + 1);
    });

    console.info('\nSpells by School:');
    schoolCount.forEach((count, school) => {
      console.info(`  ${school}: ${count}`);
    });
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    console.info('\n🎬 Running Magic System Demo...');
    console.info('===============================');

    // Ensure we have some spells learned
    const spells = this.magicSystem.getAllSpellDefinitions();
    if (spells.length > 0) {
      // Learn first few spells
      for (let i = 0; i < Math.min(3, spells.length); i++) {
        this.magicSystem.unlockSpell(this.currentCaster, spells[i].id);
        console.info(`📚 Learned: ${spells[i].name}`);
      }

      // Cast some spells
      console.info('\n🔥 Casting spells...');
      for (let i = 0; i < 3; i++) {
        const spell = spells[i];
        if (spell) {
          console.info(`\n🎯 Casting ${spell.name}...`);
          const result = this.magicSystem.castSpell(this.currentCaster, spell.id, ['demo-target']);
          console.info(`   Result: ${result.success ? 'Success' : 'Failed'}`);
          console.info(`   Mana spent: ${result.manaSpent}`);
          console.info(`   Damage: ${result.damageDealt}, Healing: ${result.healingDone}`);
        }
      }
    }

    // Show final mana status
    console.info('\n💧 Final Mana Status:');
    this.showMana();

    console.info('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.info('\n🔮 MIFF MagicSystemPure CLI Help');
    console.info('===============================');
    console.info('');
    console.info('COMMANDS:');
    console.info('  spells        - List all available spells');
    console.info('  cast <spell>  - Cast a spell by name or ID');
    console.info('  learn <spell> - Learn a spell by name or ID');
    console.info('  mana          - Show current mana status');
    console.info('  elements      - List all magic elements');
    console.info('  schools       - List all spell schools');
    console.info('  stats         - Show spell casting statistics');
    console.info('  demo          - Run automated demo sequence');
    console.info('  help          - Show this help information');
    console.info('  exit          - Exit the CLI');
    console.info('');
    console.info('EXAMPLES:');
    console.info('  cast firebolt     # Cast Fire Bolt spell');
    console.info('  learn heal        # Learn Minor Heal spell');
    console.info('  cast magic-missile # Cast Magic Missile spell');
    console.info('');
    console.info('NOTES:');
    console.info('- Spells must be learned before they can be cast');
    console.info('- Mana regenerates over time');
    console.info('- Elements have strengths and weaknesses');
    console.info('- Spell schools provide different bonuses');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    console.info('\n👋 Thank you for using MIFF MagicSystemPure CLI!');
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