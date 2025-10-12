#!/usr/bin/env node

/**
 * SlicePure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the SlicePure overworld battle vertical slice system.
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  OverworldBattleSliceTool,
  SliceUtils,
  PlayerState,
  EncounterTable,
  EncounterTrigger,
  EncounterResult,
  RNGProvider,
  TimeOfDay,
  ISpiritInstance,
  IEncounterController
} from './index';

// CLI Application
class SlicePureCLI {
  private logger: StructuredLogger;
  private rl: readline.Interface;
  private currentState: PlayerState;
  private encounterController: IEncounterController;
  private rng: RNGProvider;
  private stepCount: number = 0;
  private encounterCount: number = 0;

  constructor() {
    this.logger = new StructuredLogger({ module: 'SlicePureCLI' });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.currentState = SliceUtils.createDemoPlayerState();
    this.encounterController = this.createDemoEncounterController();
    this.rng = new RNGProvider();
  }

  /**
   * Create demo encounter controller
   */
  private createDemoEncounterController(): IEncounterController {
    const encounterTable = SliceUtils.createDemoEncounterTable();

    return {
      registerTable: (table: EncounterTable) => {
        this.logger.info(`📋 Registered encounter table for ${table.zoneId} with ${table.entries.length} entries`);
      },

      registerTrigger: (trigger: EncounterTrigger) => {
        this.logger.info(`🎯 Registered encounter trigger for ${trigger.zoneId} (${trigger.triggerType})`);
      },

      checkForEncounter: (state: PlayerState, rng: RNGProvider) => {
        // Simple encounter logic based on step count and random chance
        const encounterRate = SliceUtils.calculateEncounterProbability(state, 0.15); // 15% base rate

        if (rng.nextFloat() < encounterRate) {
          // Random encounter
          const spiritId = rng.choose(['ember', 'ripple', 'sprout', 'chill', 'zap']);
          const level = rng.nextInt(3, 8);

          return EncounterResult.triggered(
            state.zoneId,
            spiritId,
            level,
            {
              zoneId: state.zoneId,
              spiritId: spiritId,
              weight: 30,
              minLevel: 3,
              maxLevel: 8
            } as any,
            rng.nextInt(5, 15) // Steps until next encounter
          );
        }

        return EncounterResult.notTriggered();
      },

      getEncounterRate: (zoneId: string, state: PlayerState) => {
        return SliceUtils.calculateEncounterProbability(state, 0.15);
      },

      getAvailableSpirits: (zoneId: string) => {
        return ['ember', 'ripple', 'sprout', 'chill', 'zap', 'aero', 'terra'];
      },

      clearTables: () => {
        this.logger.info('🗑️ Cleared encounter tables');
      },

      clearTriggers: () => {
        this.logger.info('🗑️ Cleared encounter triggers');
      }
    };
  }

  /**
   * Start CLI application
   */
  start(): void {
    this.logger.info('='.repeat(80));
    this.logger.info('🎮 SlicePure CLI - Overworld Battle Vertical Slice');
    this.logger.info('='.repeat(80));
    this.logger.info('');
    this.logger.info('🎯 This demo shows a complete game loop:');
    this.logger.info('   1. Overworld roaming with random encounters');
    this.logger.info('   2. Battle system integration');
    this.logger.info('   3. Turn-based combat simulation');
    this.logger.info('   4. Experience and rewards');
    this.logger.info('');
    this.logger.info('Available commands:');
    this.logger.info('  roam [steps]      - Roam around and look for encounters');
    this.logger.info('  battle            - Trigger battle with random spirit');
    this.logger.info('  status            - Show current player state');
    this.logger.info('  move [direction]  - Move to specific direction (n, s, e, w)');
    this.logger.info('  time [time]       - Set time of day (dawn, day, dusk, night)');
    this.logger.info('  weather [weather] - Set weather (clear, rain, fog, storm)');
    this.logger.info('  reset             - Reset player state');
    this.logger.info('  demo              - Run automated demo');
    this.logger.info('  help              - Show this help');
    this.logger.info('  exit              - Exit application');
    this.logger.info('');
    this.logger.info('🎮 Try "demo" for an automated demonstration!');
    this.logger.info('');

    this.showStatus();
    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('SlicePure> ', (input) => {
      this.processCommand(input.trim());
    });
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    if (!input) {
      this.showPrompt();
      return;
    }

    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
        case 'h':
          this.showHelp();
          break;
        case 'roam':
        case 'r':
          const steps = args[0] ? parseInt(args[0]) : 10;
          await this.roamSteps(steps);
          break;
        case 'battle':
        case 'b':
          this.triggerBattle();
          break;
        case 'status':
        case 's':
          this.showStatus();
          break;
        case 'move':
        case 'm':
          this.movePlayer(args[0]);
          break;
        case 'time':
        case 't':
          this.setTimeOfDay(args[0]);
          break;
        case 'weather':
        case 'w':
          this.setWeather(args[0]);
          break;
        case 'reset':
          this.resetState();
          break;
        case 'demo':
        case 'd':
          await this.runDemo();
          break;
        case 'exit':
        case 'quit':
        case 'q':
          this.exit();
          return;
        default:
          this.logger.info(`❌ Unknown command: ${command}`);
          this.logger.info('Type "help" for available commands.');
      }
    } catch (error) {
      this.logger.info(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('🎮 SlicePure CLI Help');
    this.logger.info('');
    this.logger.info('Commands:');
    this.logger.info('  roam [steps]      - Roam around looking for encounters');
    this.logger.info('  battle            - Trigger battle with random spirit');
    this.logger.info('  status            - Show current player state');
    this.logger.info('  move [direction]  - Move (n, s, e, w)');
    this.logger.info('  time [time]       - Set time (dawn, day, dusk, night)');
    this.logger.info('  weather [weather] - Set weather (clear, rain, fog)');
    this.logger.info('  reset             - Reset to starting state');
    this.logger.info('  demo              - Run automated demonstration');
    this.logger.info('  help              - Show this help');
    this.logger.info('  exit              - Exit application');
    this.logger.info('');
    this.logger.info('🎯 The "demo" command shows the complete vertical slice!');
  }

  /**
   * Roam for specified number of steps
   */
  private async roamSteps(steps: number): Promise<void> {
    this.logger.info(`🚶 Starting to roam for ${steps} steps...`);
    this.logger.info(`📍 Current position: (${this.currentState.position.x}, ${this.currentState.position.y})`);
    this.logger.info(`🗺️ Zone: ${this.currentState.zoneId} | Tile: ${this.currentState.tileType}`);
    this.logger.info(`⏰ Time: ${this.currentState.timeOfDay} | Weather: ${this.currentState.weather}`);
    this.logger.info('='.repeat(60));

    let encounters = 0;

    for (let i = 1; i <= steps; i++) {
      this.stepCount++;

      // Simulate step
      const stepResult = SliceUtils.simulateOverworldStep(this.currentState, this.rng);

      // Check for encounter
      const encounterResult = this.encounterController.checkForEncounter(stepResult.state, this.rng);

      // Display step info
      if (i % 5 === 0 || encounterResult.triggered) {
        this.logger.info(`🚶 Step ${i}: (${stepResult.state.position.x}, ${stepResult.state.position.y})`);
      }

      if (encounterResult.triggered) {
        encounters++;
        this.encounterCount++;
        this.logger.info('');
        this.logger.info('🎯 ENCOUNTER TRIGGERED! 🎯');
        this.logger.info(`👻 Wild ${encounterResult.spiritId} (Level ${encounterResult.level}) appeared!`);
        this.logger.info(`📊 Encounter rate: ${this.encounterController.getEncounterRate(this.currentState.zoneId, this.currentState).toFixed(2)}`);

        // Ask if user wants to battle
        this.logger.info('');
        this.logger.info('💥 Would you like to battle? (type "battle" to engage, or continue roaming)');
        this.logger.info('🔄 Or continue roaming automatically...');
        this.logger.info('');

        // Auto-continue after a brief pause
        setTimeout(() => {
          this.logger.info(`🔄 Continuing to roam... (${i + 1}/${steps})`);
        }, 2000);

        break; // Stop roaming on encounter for demo purposes
      }

      // Update current state
      this.currentState = stepResult.state;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`🏁 Roaming complete!`);
    this.logger.info(`📊 Steps taken: ${this.stepCount}`);
    this.logger.info(`⚔️ Encounters found: ${this.encounterCount}`);
    this.logger.info(`📈 Encounter rate: ${(this.encounterCount / this.stepCount * 100).toFixed(1)}%`);
    this.logger.info('');
  }

  /**
   * Trigger battle with random spirit
   */
  private triggerBattle(): void {
    this.logger.info('⚔️ TRIGGERING BATTLE...');
    this.logger.info('='.repeat(50));

    // Create player spirit
    const playerSpirit = this.createDemoPlayerSpirit();

    // Generate random wild spirit
    const wildSpirits = ['ember', 'ripple', 'sprout', 'chill', 'zap', 'aero'];
    const wildSpiritId = this.rng.choose(wildSpirits);
    const wildLevel = this.rng.nextInt(3, 8);
    const wildSpirit = this.createDemoWildSpirit(wildSpiritId, wildLevel);

    this.logger.info(`👤 Player: ${playerSpirit.name} (Level ${playerSpirit.level}) - ${playerSpirit.typeTag} type`);
    this.logger.info(`👾 Wild: ${wildSpirit.name} (Level ${wildSpirit.level}) - ${wildSpirit.typeTag} type`);
    this.logger.info('');

    // Simulate battle
    this.simulateBattle(playerSpirit, wildSpirit);

    this.logger.info('='.repeat(50));
    this.logger.info('🏁 Battle complete!');
  }

  /**
   * Simulate battle between two spirits
   */
  private simulateBattle(playerSpirit: ISpiritInstance, wildSpirit: ISpiritInstance): void {
    this.logger.info('⚔️ BATTLE START!');
    this.logger.info('');

    let turn = 1;
    const maxTurns = 20; // Prevent infinite battles

    while (playerSpirit.isAlive() && wildSpirit.isAlive() && turn <= maxTurns) {
      this.logger.info(`🔄 Turn ${turn}:`);

      // Player attacks first
      const playerDamage = this.calculateDamage(playerSpirit, wildSpirit);
      wildSpirit.takeDamage(playerDamage);

      this.logger.info(`  ${playerSpirit.name} attacks for ${playerDamage} damage!`);
      this.logger.info(`  ${wildSpirit.name}: ${wildSpirit.currentHp}/${wildSpirit.maxHp} HP remaining`);

      if (!wildSpirit.isAlive()) {
        this.logger.info(`  ${wildSpirit.name} fainted!`);
        break;
      }

      // Wild spirit attacks
      const wildDamage = this.calculateDamage(wildSpirit, playerSpirit);
      playerSpirit.takeDamage(wildDamage);

      this.logger.info(`  ${wildSpirit.name} attacks for ${wildDamage} damage!`);
      this.logger.info(`  ${playerSpirit.name}: ${playerSpirit.currentHp}/${playerSpirit.maxHp} HP remaining`);

      if (!playerSpirit.isAlive()) {
        this.logger.info(`  ${playerSpirit.name} fainted!`);
        break;
      }

      this.logger.info('');
      turn++;
    }

    // Determine winner
    const winner = playerSpirit.isAlive() ? playerSpirit : wildSpirit;
    const loser = playerSpirit.isAlive() ? wildSpirit : playerSpirit;

    this.logger.info('');
    this.logger.info('🏆 BATTLE RESULT:');
    this.logger.info(`  Winner: ${winner.name}`);
    this.logger.info(`  Loser: ${loser.name}`);
    this.logger.info(`  Turns: ${turn}`);

    // Calculate rewards
    const experienceGained = loser.level * 15;
    const goldGained = loser.level * 25;
    const syncGained = Math.floor(turn * 3.5);

    this.logger.info('');
    this.logger.info('🎖️ REWARDS:');
    this.logger.info(`  Experience: ${experienceGained} XP`);
    this.logger.info(`  Gold: ${goldGained} coins`);
    this.logger.info(`  Sync Points: ${syncGained}`);
    this.logger.info(`  Total Playtime: ${Math.floor(turn * 30)} seconds`);
  }

  /**
   * Calculate damage between spirits
   */
  private calculateDamage(attacker: ISpiritInstance, defender: ISpiritInstance): number {
    const baseDamage = attacker.attack;
    const defense = defender.defense;
    const randomFactor = 0.8 + this.rng.nextFloat() * 0.4; // 0.8 to 1.2

    // Simple damage calculation
    const damage = Math.max(1, Math.floor((baseDamage * randomFactor) - (defense * 0.5)));
    return damage;
  }

  /**
   * Move player in specified direction
   */
  private movePlayer(direction?: string): void {
    if (!direction) {
      this.logger.info('❌ Usage: move [direction]');
      this.logger.info('Directions: n (north), s (south), e (east), w (west)');
      return;
    }

    const dir = direction.toLowerCase();
    let moved = false;

    switch (dir) {
      case 'n':
      case 'north':
        this.currentState.position.y++;
        moved = true;
        break;
      case 's':
      case 'south':
        this.currentState.position.y--;
        moved = true;
        break;
      case 'e':
      case 'east':
        this.currentState.position.x++;
        moved = true;
        break;
      case 'w':
      case 'west':
        this.currentState.position.x--;
        moved = true;
        break;
      default:
        this.logger.info('❌ Invalid direction. Use: n, s, e, w');
        return;
    }

    if (moved) {
      this.currentState.stepsSinceLastEncounter++;
      this.stepCount++;
      this.logger.info(`🚶 Moved ${dir.toUpperCase()} to (${this.currentState.position.x}, ${this.currentState.position.y})`);
      this.logger.info(`📊 Steps since last encounter: ${this.currentState.stepsSinceLastEncounter}`);

      // Check for encounter after movement
      const encounterResult = this.encounterController.checkForEncounter(this.currentState, this.rng);
      if (encounterResult.triggered) {
        this.logger.info('');
        this.logger.info('🎯 ENCOUNTER TRIGGERED! 🎯');
        this.logger.info(`👻 Wild ${encounterResult.spiritId} (Level ${encounterResult.level}) appeared!`);
      }
    }
  }

  /**
   * Set time of day
   */
  private setTimeOfDay(timeStr?: string): void {
    if (!timeStr) {
      this.logger.info('❌ Usage: time [time_of_day]');
      this.logger.info('Times: dawn, day, dusk, night');
      return;
    }

    const time = timeStr.toLowerCase();
    switch (time) {
      case 'dawn':
        this.currentState.setTimeOfDay(TimeOfDay.DAWN);
        this.logger.info('🌅 Set time to DAWN');
        break;
      case 'day':
        this.currentState.setTimeOfDay(TimeOfDay.DAY);
        this.logger.info('☀️ Set time to DAY');
        break;
      case 'dusk':
        this.currentState.setTimeOfDay(TimeOfDay.DUSK);
        this.logger.info('🌇 Set time to DUSK');
        break;
      case 'night':
        this.currentState.setTimeOfDay(TimeOfDay.NIGHT);
        this.logger.info('🌙 Set time to NIGHT');
        break;
      default:
        this.logger.info('❌ Invalid time. Use: dawn, day, dusk, night');
    }
  }

  /**
   * Set weather
   */
  private setWeather(weatherStr?: string): void {
    if (!weatherStr) {
      this.logger.info('❌ Usage: weather [weather_type]');
      this.logger.info('Weather: clear, sunny, rain, fog, storm, wind');
      return;
    }

    const weather = weatherStr.toLowerCase();
    this.currentState.setWeather(weather);
    this.logger.info(`🌤️ Set weather to ${weather.toUpperCase()}`);
  }

  /**
   * Show current status
   */
  private showStatus(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('📊 CURRENT STATUS');
    this.logger.info('='.repeat(60));
    this.logger.info(`📍 Position: (${this.currentState.position.x}, ${this.currentState.position.y})`);
    this.logger.info(`🗺️ Zone: ${this.currentState.zoneId} | Tile: ${this.currentState.tileType}`);
    this.logger.info(`⏰ Time: ${this.currentState.timeOfDay} | Weather: ${this.currentState.weather}`);
    this.logger.info(`🚶 Steps since encounter: ${this.currentState.stepsSinceLastEncounter}`);
    this.logger.info(`📈 Total steps: ${this.stepCount}`);
    this.logger.info(`⚔️ Total encounters: ${this.encounterCount}`);
    this.logger.info(`📊 Encounter rate: ${this.encounterCount > 0 ? (this.encounterCount / this.stepCount * 100).toFixed(1) : '0.0'}%`);
    this.logger.info(`🎲 RNG Seed: ${this.rng.seed}`);
    this.logger.info('');
    this.logger.info(`🎯 Encounter rate: ${this.encounterController.getEncounterRate(this.currentState.zoneId, this.currentState).toFixed(2)}`);
    this.logger.info(`👻 Available spirits: ${this.encounterController.getAvailableSpirits(this.currentState.zoneId).join(', ')}`);
    this.logger.info('='.repeat(60));
  }

  /**
   * Reset player state
   */
  private resetState(): void {
    this.currentState = SliceUtils.createDemoPlayerState();
    this.stepCount = 0;
    this.encounterCount = 0;
    this.rng = new RNGProvider();
    this.logger.info('🔄 Reset to initial state');
    this.showStatus();
  }

  /**
   * Run automated demo
   */
  private async runDemo(): Promise<void> {
    this.logger.info('🎮 STARTING AUTOMATED DEMO...');
    this.logger.info('='.repeat(60));

    const demoSteps = 25;

    for (let i = 0; i < demoSteps; i++) {
      this.logger.info(`\n🚶 DEMO STEP ${i + 1}/${demoSteps}`);
      this.logger.info(`📍 Position: (${this.currentState.position.x}, ${this.currentState.position.y})`);

      // Simulate step
      const stepResult = SliceUtils.simulateOverworldStep(this.currentState, this.rng);
      this.currentState = stepResult.state;

      // Check for encounter
      const encounterResult = this.encounterController.checkForEncounter(this.currentState, this.rng);

      if (encounterResult.triggered) {
        this.logger.info('');
        this.logger.info('🎯 ENCOUNTER! 🎯');
        this.logger.info(`👻 ${encounterResult.spiritId} (Level ${encounterResult.level}) appeared!`);
        this.logger.info('');

        // Simulate battle
        const playerSpirit = this.createDemoPlayerSpirit();
        const wildSpirit = this.createDemoWildSpirit(encounterResult.spiritId!, encounterResult.level!);

        this.simulateBattle(playerSpirit, wildSpirit);

        this.logger.info('');
        this.logger.info('🏁 Demo continues roaming...');
        this.logger.info('');

        // Short pause
        await this.sleep(1000);
      }

      // Show progress every 5 steps
      if ((i + 1) % 5 === 0) {
        this.logger.info(`📊 Progress: ${i + 1}/${demoSteps} steps completed`);
        this.logger.info(`⚔️ Encounters: ${this.encounterCount}`);
      }
    }

    this.logger.info('='.repeat(60));
    this.logger.info('🎉 DEMO COMPLETE!');
    this.logger.info('='.repeat(60));
    this.logger.info('📊 Final Statistics:');
    this.logger.info(`  Total Steps: ${this.stepCount}`);
    this.logger.info(`  Encounters: ${this.encounterCount}`);
    this.logger.info(`  Encounter Rate: ${(this.encounterCount / this.stepCount * 100).toFixed(1)}%`);
    this.logger.info(`  Final Position: (${this.currentState.position.x}, ${this.currentState.position.y})`);
    this.logger.info('');
    this.logger.info('🎮 Try "roam 10" to continue exploring!');
    this.logger.info('💡 Or "battle" to trigger an immediate encounter!');
  }

  /**
   * Create demo player spirit
   */
  private createDemoPlayerSpirit(): ISpiritInstance {
    return {
      id: 1001,
      spiritId: 'waterling',
      name: 'Waterling',
      typeTag: 'water',
      level: 6,
      attack: 26,
      defense: 19,
      specialAttack: 28,
      specialDefense: 21,
      maxHp: 72,
      currentHp: 72,
      statusEffects: [],
      isPlayerControlled: true,

      isAlive: () => this.currentHp > 0,
      takeDamage: (damage: number) => {
        this.currentHp = Math.max(0, this.currentHp - damage);
        return damage;
      },
      heal: (amount: number) => {
        this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
        return amount;
      },
      addStatusEffect: (effect: string) => {
        if (!this.statusEffects.includes(effect)) {
          this.statusEffects.push(effect);
        }
      },
      removeStatusEffect: (effect: string) => {
        const index = this.statusEffects.indexOf(effect);
        if (index >= 0) {
          this.statusEffects.splice(index, 1);
          return true;
        }
        return false;
      },
      hasStatusEffect: (effect: string) => this.statusEffects.includes(effect),
      getEffectiveAttack: () => this.attack,
      getEffectiveDefense: () => this.defense,
      getEffectiveSpecialAttack: () => this.specialAttack,
      getEffectiveSpecialDefense: () => this.specialDefense,
      clone: () => ({ ...this }),
      toJSON: () => ({ ...this })
    } as ISpiritInstance;
  }

  /**
   * Create demo wild spirit
   */
  private createDemoWildSpirit(spiritId: string, level: number): ISpiritInstance {
    const typeMap: Record<string, string> = {
      'ember': 'fire',
      'ripple': 'water',
      'sprout': 'grass',
      'chill': 'ice',
      'zap': 'electric',
      'aero': 'flying',
      'terra': 'ground'
    };

    const type = typeMap[spiritId] || 'neutral';

    return {
      id: 2001,
      spiritId: spiritId,
      name: spiritId,
      typeTag: type,
      level: level,
      attack: 18 + level,
      defense: 16 + Math.floor(level / 2),
      specialAttack: 18 + level,
      specialDefense: 16 + Math.floor(level / 2),
      maxHp: 55 + level * 2,
      currentHp: 55 + level * 2,
      statusEffects: [],
      isPlayerControlled: false,

      isAlive: () => this.currentHp > 0,
      takeDamage: (damage: number) => {
        this.currentHp = Math.max(0, this.currentHp - damage);
        return damage;
      },
      heal: (amount: number) => {
        this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
        return amount;
      },
      addStatusEffect: (effect: string) => {
        if (!this.statusEffects.includes(effect)) {
          this.statusEffects.push(effect);
        }
      },
      removeStatusEffect: (effect: string) => {
        const index = this.statusEffects.indexOf(effect);
        if (index >= 0) {
          this.statusEffects.splice(index, 1);
          return true;
        }
        return false;
      },
      hasStatusEffect: (effect: string) => this.statusEffects.includes(effect),
      getEffectiveAttack: () => this.attack,
      getEffectiveDefense: () => this.defense,
      getEffectiveSpecialAttack: () => this.specialAttack,
      getEffectiveSpecialDefense: () => this.specialDefense,
      clone: () => ({ ...this }),
      toJSON: () => ({ ...this })
    } as ISpiritInstance;
  }

  /**
   * Sleep utility for demo pacing
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exit application
   */
  private exit(): void {
    this.logger.info('');
    this.logger.info('👋 Thank you for using SlicePure CLI!');
    this.logger.info('🎮 This demo showed the complete MIFF game loop:');
    this.logger.info('   1. Overworld roaming with encounter generation');
    this.logger.info('   2. Random encounter triggering');
    this.logger.info('   3. Battle system integration');
    this.logger.info('   4. Turn-based combat simulation');
    this.logger.info('   5. Experience and reward calculation');
    this.logger.info('');
    this.logger.info('🎯 All MIFF modules work together seamlessly!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new SlicePureCLI();
  cli.start();
}

export { SlicePureCLI };