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
  
  // Missing properties that are being accessed
  public currentHp: number = 72;
  public maxHp: number = 72;
  public statusEffects: string[] = [];
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
//     const encounterTable = SliceUtils.createDemoEncounterTable();

    return {
      registerTable: (table: EncounterTable) => {
        console.info(`📋 Registered encounter table for ${table.zoneId} with ${table.entries.length} entries`);
      },

      registerTrigger: (trigger: EncounterTrigger) => {
        console.info(`🎯 Registered encounter trigger for ${trigger.zoneId} (${trigger.triggerType})`);
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
        console.info('🗑️ Cleared encounter tables');
      },

      clearTriggers: () => {
        console.info('🗑️ Cleared encounter triggers');
      }
    };
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.info('='.repeat(80));
    console.info('🎮 SlicePure CLI - Overworld Battle Vertical Slice');
    console.info('='.repeat(80));
    console.info('');
    console.info('🎯 This demo shows a complete game loop:');
    console.info('   1. Overworld roaming with random encounters');
    console.info('   2. Battle system integration');
    console.info('   3. Turn-based combat simulation');
    console.info('   4. Experience and rewards');
    console.info('');
    console.info('Available commands:');
    console.info('  roam [steps]      - Roam around and look for encounters');
    console.info('  battle            - Trigger battle with random spirit');
    console.info('  status            - Show current player state');
    console.info('  move [direction]  - Move to specific direction (n, s, e, w)');
    console.info('  time [time]       - Set time of day (dawn, day, dusk, night)');
    console.info('  weather [weather] - Set weather (clear, rain, fog, storm)');
    console.info('  reset             - Reset player state');
    console.info('  demo              - Run automated demo');
    console.info('  help              - Show this help');
    console.info('  exit              - Exit application');
    console.info('');
    console.info('🎮 Try "demo" for an automated demonstration!');
    console.info('');

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
          console.info(`❌ Unknown command: ${command}`);
          console.info('Type "help" for available commands.');
      }
    } catch (error) {
      console.info(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.info('🎮 SlicePure CLI Help');
    console.info('');
    console.info('Commands:');
    console.info('  roam [steps]      - Roam around looking for encounters');
    console.info('  battle            - Trigger battle with random spirit');
    console.info('  status            - Show current player state');
    console.info('  move [direction]  - Move (n, s, e, w)');
    console.info('  time [time]       - Set time (dawn, day, dusk, night)');
    console.info('  weather [weather] - Set weather (clear, rain, fog)');
    console.info('  reset             - Reset to starting state');
    console.info('  demo              - Run automated demonstration');
    console.info('  help              - Show this help');
    console.info('  exit              - Exit application');
    console.info('');
    console.info('🎯 The "demo" command shows the complete vertical slice!');
  }

  /**
   * Roam for specified number of steps
   */
  private async roamSteps(steps: number): Promise<void> {
    console.info(`🚶 Starting to roam for ${steps} steps...`);
    console.info(`📍 Current position: (${this.currentState.position.x}, ${this.currentState.position.y})`);
    console.info(`🗺️ Zone: ${this.currentState.zoneId} | Tile: ${this.currentState.tileType}`);
    console.info(`⏰ Time: ${this.currentState.timeOfDay} | Weather: ${this.currentState.weather}`);
    console.info('='.repeat(60));

    let encounters = 0;

    for (let i = 1; i <= steps; i++) {
      this.stepCount++;

      // Simulate step
      const stepResult = SliceUtils.simulateOverworldStep(this.currentState, this.rng);

      // Check for encounter
      const encounterResult = this.encounterController.checkForEncounter(stepResult.state, this.rng);

      // Display step info
      if (i % 5 === 0 || encounterResult.triggered) {
        console.info(`🚶 Step ${i}: (${stepResult.state.position.x}, ${stepResult.state.position.y})`);
      }

      if (encounterResult.triggered) {
        encounters++;
        this.encounterCount++;
        console.info('');
        console.info('🎯 ENCOUNTER TRIGGERED! 🎯');
        console.info(`👻 Wild ${encounterResult.spiritId} (Level ${encounterResult.level}) appeared!`);
        console.info(`📊 Encounter rate: ${this.encounterController.getEncounterRate(this.currentState.zoneId, this.currentState).toFixed(2)}`);

        // Ask if user wants to battle
        console.info('');
        console.info('💥 Would you like to battle? (type "battle" to engage, or continue roaming)');
        console.info('🔄 Or continue roaming automatically...');
        console.info('');

        // Auto-continue after a brief pause
        setTimeout(() => {
          console.info(`🔄 Continuing to roam... (${i + 1}/${steps})`);
        }, 2000);

        break; // Stop roaming on encounter for demo purposes
      }

      // Update current state
      this.currentState = stepResult.state;
    }

    console.info('='.repeat(60));
    console.info(`🏁 Roaming complete!`);
    console.info(`📊 Steps taken: ${this.stepCount}`);
    console.info(`⚔️ Encounters found: ${this.encounterCount}`);
    console.info(`📈 Encounter rate: ${(this.encounterCount / this.stepCount * 100).toFixed(1)}%`);
    console.info('');
  }

  /**
   * Trigger battle with random spirit
   */
  private triggerBattle(): void {
    console.info('⚔️ TRIGGERING BATTLE...');
    console.info('='.repeat(50));

    // Create player spirit
    const playerSpirit = this.createDemoPlayerSpirit();

    // Generate random wild spirit
    const wildSpirits = ['ember', 'ripple', 'sprout', 'chill', 'zap', 'aero'];
    const wildSpiritId = this.rng.choose(wildSpirits);
    const wildLevel = this.rng.nextInt(3, 8);
    const wildSpirit = this.createDemoWildSpirit(wildSpiritId, wildLevel);

    console.info(`👤 Player: ${playerSpirit.name} (Level ${playerSpirit.level}) - ${playerSpirit.typeTag} type`);
    console.info(`👾 Wild: ${wildSpirit.name} (Level ${wildSpirit.level}) - ${wildSpirit.typeTag} type`);
    console.info('');

    // Simulate battle
    this.simulateBattle(playerSpirit, wildSpirit);

    console.info('='.repeat(50));
    console.info('🏁 Battle complete!');
  }

  /**
   * Simulate battle between two spirits
   */
  private simulateBattle(playerSpirit: ISpiritInstance, wildSpirit: ISpiritInstance): void {
    console.info('⚔️ BATTLE START!');
    console.info('');

    let turn = 1;
    const maxTurns = 20; // Prevent infinite battles

    while (playerSpirit.isAlive() && wildSpirit.isAlive() && turn <= maxTurns) {
      console.info(`🔄 Turn ${turn}:`);

      // Player attacks first
      const playerDamage = this.calculateDamage(playerSpirit, wildSpirit);
      wildSpirit.takeDamage(playerDamage);

      console.info(`  ${playerSpirit.name} attacks for ${playerDamage} damage!`);
      console.info(`  ${wildSpirit.name}: ${wildSpirit.currentHp}/${wildSpirit.maxHp} HP remaining`);

      if (!wildSpirit.isAlive()) {
        console.info(`  ${wildSpirit.name} fainted!`);
        break;
      }

      // Wild spirit attacks
      const wildDamage = this.calculateDamage(wildSpirit, playerSpirit);
      playerSpirit.takeDamage(wildDamage);

      console.info(`  ${wildSpirit.name} attacks for ${wildDamage} damage!`);
      console.info(`  ${playerSpirit.name}: ${playerSpirit.currentHp}/${playerSpirit.maxHp} HP remaining`);

      if (!playerSpirit.isAlive()) {
        console.info(`  ${playerSpirit.name} fainted!`);
        break;
      }

      console.info('');
      turn++;
    }

    // Determine winner
    const winner = playerSpirit.isAlive() ? playerSpirit : wildSpirit;
    const loser = playerSpirit.isAlive() ? wildSpirit : playerSpirit;

    console.info('');
    console.info('🏆 BATTLE RESULT:');
    console.info(`  Winner: ${winner.name}`);
    console.info(`  Loser: ${loser.name}`);
    console.info(`  Turns: ${turn}`);

    // Calculate rewards
    const experienceGained = loser.level * 15;
    const goldGained = loser.level * 25;
    const syncGained = Math.floor(turn * 3.5);

    console.info('');
    console.info('🎖️ REWARDS:');
    console.info(`  Experience: ${experienceGained} XP`);
    console.info(`  Gold: ${goldGained} coins`);
    console.info(`  Sync Points: ${syncGained}`);
    console.info(`  Total Playtime: ${Math.floor(turn * 30)} seconds`);
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
      console.info('❌ Usage: move [direction]');
      console.info('Directions: n (north), s (south), e (east), w (west)');
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
        console.info('❌ Invalid direction. Use: n, s, e, w');
        return;
    }

    if (moved) {
      this.currentState.stepsSinceLastEncounter++;
      this.stepCount++;
      console.info(`🚶 Moved ${dir.toUpperCase()} to (${this.currentState.position.x}, ${this.currentState.position.y})`);
      console.info(`📊 Steps since last encounter: ${this.currentState.stepsSinceLastEncounter}`);

      // Check for encounter after movement
      const encounterResult = this.encounterController.checkForEncounter(this.currentState, this.rng);
      if (encounterResult.triggered) {
        console.info('');
        console.info('🎯 ENCOUNTER TRIGGERED! 🎯');
        console.info(`👻 Wild ${encounterResult.spiritId} (Level ${encounterResult.level}) appeared!`);
      }
    }
  }

  /**
   * Set time of day
   */
  private setTimeOfDay(timeStr?: string): void {
    if (!timeStr) {
      console.info('❌ Usage: time [time_of_day]');
      console.info('Times: dawn, day, dusk, night');
      return;
    }

    const time = timeStr.toLowerCase();
    switch (time) {
      case 'dawn':
        this.currentState.setTimeOfDay(TimeOfDay.DAWN);
        console.info('🌅 Set time to DAWN');
        break;
      case 'day':
        this.currentState.setTimeOfDay(TimeOfDay.DAY);
        console.info('☀️ Set time to DAY');
        break;
      case 'dusk':
        this.currentState.setTimeOfDay(TimeOfDay.DUSK);
        console.info('🌇 Set time to DUSK');
        break;
      case 'night':
        this.currentState.setTimeOfDay(TimeOfDay.NIGHT);
        console.info('🌙 Set time to NIGHT');
        break;
      default:
        console.info('❌ Invalid time. Use: dawn, day, dusk, night');
    }
  }

  /**
   * Set weather
   */
  private setWeather(weatherStr?: string): void {
    if (!weatherStr) {
      console.info('❌ Usage: weather [weather_type]');
      console.info('Weather: clear, sunny, rain, fog, storm, wind');
      return;
    }

    const weather = weatherStr.toLowerCase();
    this.currentState.setWeather(weather);
    console.info(`🌤️ Set weather to ${weather.toUpperCase()}`);
  }

  /**
   * Show current status
   */
  private showStatus(): void {
    console.info('='.repeat(60));
    console.info('📊 CURRENT STATUS');
    console.info('='.repeat(60));
    console.info(`📍 Position: (${this.currentState.position.x}, ${this.currentState.position.y})`);
    console.info(`🗺️ Zone: ${this.currentState.zoneId} | Tile: ${this.currentState.tileType}`);
    console.info(`⏰ Time: ${this.currentState.timeOfDay} | Weather: ${this.currentState.weather}`);
    console.info(`🚶 Steps since encounter: ${this.currentState.stepsSinceLastEncounter}`);
    console.info(`📈 Total steps: ${this.stepCount}`);
    console.info(`⚔️ Total encounters: ${this.encounterCount}`);
    console.info(`📊 Encounter rate: ${this.encounterCount > 0 ? (this.encounterCount / this.stepCount * 100).toFixed(1) : '0.0'}%`);
    console.info(`🎲 RNG Seed: ${this.rng.seed}`);
    console.info('');
    console.info(`🎯 Encounter rate: ${this.encounterController.getEncounterRate(this.currentState.zoneId, this.currentState).toFixed(2)}`);
    console.info(`👻 Available spirits: ${this.encounterController.getAvailableSpirits(this.currentState.zoneId).join(', ')}`);
    console.info('='.repeat(60));
  }

  /**
   * Reset player state
   */
  private resetState(): void {
    this.currentState = SliceUtils.createDemoPlayerState();
    this.stepCount = 0;
    this.encounterCount = 0;
    this.rng = new RNGProvider();
    console.info('🔄 Reset to initial state');
    this.showStatus();
  }

  /**
   * Run automated demo
   */
  private async runDemo(): Promise<void> {
    console.info('🎮 STARTING AUTOMATED DEMO...');
    console.info('='.repeat(60));

    const demoSteps = 25;

    for (let i = 0; i < demoSteps; i++) {
      console.info(`\n🚶 DEMO STEP ${i + 1}/${demoSteps}`);
      console.info(`📍 Position: (${this.currentState.position.x}, ${this.currentState.position.y})`);

      // Simulate step
      const stepResult = SliceUtils.simulateOverworldStep(this.currentState, this.rng);
      this.currentState = stepResult.state;

      // Check for encounter
      const encounterResult = this.encounterController.checkForEncounter(this.currentState, this.rng);

      if (encounterResult.triggered) {
        console.info('');
        console.info('🎯 ENCOUNTER! 🎯');
        console.info(`👻 ${encounterResult.spiritId} (Level ${encounterResult.level}) appeared!`);
        console.info('');

        // Simulate battle
        const playerSpirit = this.createDemoPlayerSpirit();
        const wildSpirit = this.createDemoWildSpirit(encounterResult.spiritId!, encounterResult.level!);

        this.simulateBattle(playerSpirit, wildSpirit);

        console.info('');
        console.info('🏁 Demo continues roaming...');
        console.info('');

        // Short pause
        await this.sleep(1000);
      }

      // Show progress every 5 steps
      if ((i + 1) % 5 === 0) {
        console.info(`📊 Progress: ${i + 1}/${demoSteps} steps completed`);
        console.info(`⚔️ Encounters: ${this.encounterCount}`);
      }
    }

    console.info('='.repeat(60));
    console.info('🎉 DEMO COMPLETE!');
    console.info('='.repeat(60));
    console.info('📊 Final Statistics:');
    console.info(`  Total Steps: ${this.stepCount}`);
    console.info(`  Encounters: ${this.encounterCount}`);
    console.info(`  Encounter Rate: ${(this.encounterCount / this.stepCount * 100).toFixed(1)}%`);
    console.info(`  Final Position: (${this.currentState.position.x}, ${this.currentState.position.y})`);
    console.info('');
    console.info('🎮 Try "roam 10" to continue exploring!');
    console.info('💡 Or "battle" to trigger an immediate encounter!');
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
    console.info('');
    console.info('👋 Thank you for using SlicePure CLI!');
    console.info('🎮 This demo showed the complete MIFF game loop:');
    console.info('   1. Overworld roaming with encounter generation');
    console.info('   2. Random encounter triggering');
    console.info('   3. Battle system integration');
    console.info('   4. Turn-based combat simulation');
    console.info('   5. Experience and reward calculation');
    console.info('');
    console.info('🎯 All MIFF modules work together seamlessly!');
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