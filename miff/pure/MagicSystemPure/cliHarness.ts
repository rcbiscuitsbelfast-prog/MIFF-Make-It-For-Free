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

// Mock dependencies for CLI demo
class MockEventBus {
  emit(event: string, data: any) {
    console.log(`📡 Event: ${event}`, data);
  }

  on(event: string, handler: Function) {
    // Mock implementation
  }
}

class MockHealthSystem {
  damageEntity(entityId: string, damage: number) {
    console.log(`💔 ${entityId} takes ${damage} damage`);
  }

  healEntity(entityId: string, healing: number) {
    console.log(`💚 ${entityId} heals ${healing} health`);
  }
}

class MockCombatSystem {
  // Mock implementation
}

class MockRNG {
  nextFloat(): number {
    return Math.random();
  }

  nextInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    const eventBus = new MockEventBus() as any;
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
    console.log('🔮 Welcome to MIFF MagicSystemPure CLI!');
    console.log('=====================================');
    console.log('Available commands:');
    console.log('  spells        - List all spells');
    console.log('  cast <spell>  - Cast a spell');
    console.log('  learn <spell> - Learn a spell');
    console.log('  mana          - Show mana status');
    console.log('  elements      - List all elements');
    console.log('  schools       - List spell schools');
    console.log('  stats         - Show spell statistics');
    console.log('  demo          - Run demo sequence');
    console.log('  help          - Show this help');
    console.log('  exit          - Exit the CLI');
    console.log('');

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
            console.log('❌ Usage: cast <spell-name>');
          } else {
            await this.castSpell(args[0]);
          }
          break;

        case 'learn':
          if (args.length === 0) {
            console.log('❌ Usage: learn <spell-name>');
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
          console.log(`❓ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
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

    console.log('\n📚 Available Spells:');
    console.log('===================');

    spells.forEach(spell => {
      const isLearned = casterSpells.some(s => s.definition.id === spell.id);
      const status = isLearned ? '✅ Learned' : '❌ Not Learned';

      console.log(`${spell.name} (${spell.id})`);
      console.log(`   School: ${spell.school} | Mana: ${spell.manaCost} | Cooldown: ${spell.cooldown}ms`);
      console.log(`   Description: ${spell.description}`);
      console.log(`   Status: ${status}`);
      console.log('');
    });
  }

  /**
   * Cast a spell
   */
  private async castSpell(spellName: string): Promise<void> {
    const spells = this.magicSystem.getAllSpellDefinitions();
    const spell = spells.find(s => s.name.toLowerCase() === spellName.toLowerCase() || s.id === spellName);

    if (!spell) {
      console.log(`❌ Spell not found: ${spellName}`);
      return;
    }

    // Unlock spell if not already learned
    const casterSpells = this.magicSystem.getSpellsForCaster(this.currentCaster);
    const isLearned = casterSpells.some(s => s.definition.id === spell.id);

    if (!isLearned) {
      this.magicSystem.unlockSpell(this.currentCaster, spell.id);
      console.log(`📚 Learned spell: ${spell.name}`);
    }

    // Cast the spell
    console.log(`🎯 Casting ${spell.name}...`);
    const result = this.magicSystem.castSpell(this.currentCaster, spell.id, ['target-enemy']);

    if (result.success) {
      console.log(`✅ Spell cast successfully!`);
      console.log(`   Mana spent: ${result.manaSpent}`);
      console.log(`   Damage dealt: ${result.damageDealt}`);
      console.log(`   Healing done: ${result.healingDone}`);

      if (result.buffsApplied.length > 0) {
        console.log(`   Buffs applied: ${result.buffsApplied.join(', ')}`);
      }

      if (result.debuffsApplied.length > 0) {
        console.log(`   Debuffs applied: ${result.debuffsApplied.join(', ')}`);
      }
    } else {
      console.log(`❌ Spell cast failed: ${result.failureReason}`);
    }
  }

  /**
   * Learn a spell
   */
  private learnSpell(spellName: string): void {
    const spells = this.magicSystem.getAllSpellDefinitions();
    const spell = spells.find(s => s.name.toLowerCase() === spellName.toLowerCase() || s.id === spellName);

    if (!spell) {
      console.log(`❌ Spell not found: ${spellName}`);
      return;
    }

    const success = this.magicSystem.unlockSpell(this.currentCaster, spell.id);
    if (success) {
      console.log(`📚 Successfully learned: ${spell.name}`);
    } else {
      console.log(`❌ Failed to learn: ${spell.name}`);
    }
  }

  /**
   * Show mana status
   */
  private showMana(): void {
    const manaPool = this.magicSystem.getManaPool(this.currentCaster);

    if (!manaPool) {
      console.log('❌ No mana pool found. Create one first.');
      return;
    }

    console.log('\n💧 Mana Pool Status:');
    console.log('==================');
    console.log(`Current Mana: ${manaPool.current}/${manaPool.maximum}`);
    console.log(`Regeneration Rate: ${manaPool.regenerationRate} mana/second`);
    console.log(`Mana Percentage: ${((manaPool.current / manaPool.maximum) * 100).toFixed(1)}%`);

    // Show elemental affinities
    console.log('\nElemental Affinities:');
    manaPool.elementalAffinities.forEach((affinity, element) => {
      console.log(`  ${element}: ${(affinity * 100).toFixed(0)}%`);
    });

    // Show spell school modifiers
    console.log('\nSpell School Modifiers:');
    manaPool.modifiers.forEach((modifier, school) => {
      console.log(`  ${school}: ${(modifier * 100).toFixed(0)}%`);
    });
  }

  /**
   * Show elements
   */
  private showElements(): void {
    const elements = this.magicSystem.getAllElements();

    console.log('\n🧪 Elemental System:');
    console.log('===================');

    elements.forEach(element => {
      console.log(`${element.name.toUpperCase()} (${element.color})`);
      console.log(`  Description: ${element.description}`);
      console.log(`  Strengths: ${element.strengths.join(', ')}`);
      console.log(`  Weaknesses: ${element.weaknesses.join(', ')}`);
      console.log('');
    });
  }

  /**
   * Show spell schools
   */
  private showSchools(): void {
    const schools = this.magicSystem.getAllSpellSchools();

    console.log('\n🎓 Spell Schools:');
    console.log('=================');

    schools.forEach(school => {
      console.log(`${school.icon} ${school.name.toUpperCase()} (${school.color})`);
      console.log(`  Description: ${school.description}`);
      console.log(`  Passive Bonus: ${school.passiveBonus}`);
      console.log(`  Strength: ${school.strength}`);
      console.log(`  Weakness: ${school.weakness}`);
      console.log('');
    });
  }

  /**
   * Show statistics
   */
  private showStats(): void {
    const casterSpells = this.magicSystem.getSpellsForCaster(this.currentCaster);
    const manaPool = this.magicSystem.getManaPool(this.currentCaster);

    console.log('\n📊 Magic Statistics:');
    console.log('====================');

    if (manaPool) {
      console.log(`Mana Pool: ${manaPool.current}/${manaPool.maximum}`);
      console.log(`Regeneration: ${manaPool.regenerationRate}/sec`);
    }

    console.log(`Learned Spells: ${casterSpells.length}`);
    console.log(`Available Spells: ${this.magicSystem.getAllSpellDefinitions().length}`);

    // Show spell breakdown by school
    const schoolCount = new Map<string, number>();
    casterSpells.forEach(spell => {
      const school = spell.definition.school;
      schoolCount.set(school, (schoolCount.get(school) || 0) + 1);
    });

    console.log('\nSpells by School:');
    schoolCount.forEach((count, school) => {
      console.log(`  ${school}: ${count}`);
    });
  }

  /**
   * Run demo sequence
   */
  private async runDemo(): Promise<void> {
    console.log('\n🎬 Running Magic System Demo...');
    console.log('===============================');

    // Ensure we have some spells learned
    const spells = this.magicSystem.getAllSpellDefinitions();
    if (spells.length > 0) {
      // Learn first few spells
      for (let i = 0; i < Math.min(3, spells.length); i++) {
        this.magicSystem.unlockSpell(this.currentCaster, spells[i].id);
        console.log(`📚 Learned: ${spells[i].name}`);
      }

      // Cast some spells
      console.log('\n🔥 Casting spells...');
      for (let i = 0; i < 3; i++) {
        const spell = spells[i];
        if (spell) {
          console.log(`\n🎯 Casting ${spell.name}...`);
          const result = this.magicSystem.castSpell(this.currentCaster, spell.id, ['demo-target']);
          console.log(`   Result: ${result.success ? 'Success' : 'Failed'}`);
          console.log(`   Mana spent: ${result.manaSpent}`);
          console.log(`   Damage: ${result.damageDealt}, Healing: ${result.healingDone}`);
        }
      }
    }

    // Show final mana status
    console.log('\n💧 Final Mana Status:');
    this.showMana();

    console.log('\n✅ Demo complete!');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('\n🔮 MIFF MagicSystemPure CLI Help');
    console.log('===============================');
    console.log('');
    console.log('COMMANDS:');
    console.log('  spells        - List all available spells');
    console.log('  cast <spell>  - Cast a spell by name or ID');
    console.log('  learn <spell> - Learn a spell by name or ID');
    console.log('  mana          - Show current mana status');
    console.log('  elements      - List all magic elements');
    console.log('  schools       - List all spell schools');
    console.log('  stats         - Show spell casting statistics');
    console.log('  demo          - Run automated demo sequence');
    console.log('  help          - Show this help information');
    console.log('  exit          - Exit the CLI');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  cast firebolt     # Cast Fire Bolt spell');
    console.log('  learn heal        # Learn Minor Heal spell');
    console.log('  cast magic-missile # Cast Magic Missile spell');
    console.log('');
    console.log('NOTES:');
    console.log('- Spells must be learned before they can be cast');
    console.log('- Mana regenerates over time');
    console.log('- Elements have strengths and weaknesses');
    console.log('- Spell schools provide different bonuses');
  }

  /**
   * Exit the CLI
   */
  private exit(): void {
    console.log('\n👋 Thank you for using MIFF MagicSystemPure CLI!');
    this.isRunning = false;
    this.rl.close();
    process.exit(0);
  }
}

// Main execution
if (require.main === module) {
  const cli = new MagicSystemCLI();
  cli.start();
}

module.exports = MagicSystemCLI;