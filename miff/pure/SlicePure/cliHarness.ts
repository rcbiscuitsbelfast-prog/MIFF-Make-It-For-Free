#!/usr/bin/env node

/**
 * SlicePure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the SlicePure overworld battle vertical slice system.
 */

import * as readline from 'readline';
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
class SlicePureCLI 
  private rl: readline.Interface;
  private currentState: PlayerState;
  private encounterController: IEncounterController;
  private rng: RNGProvider;
  private stepCount: number = 0;
  private encounterCount: number = 0;

  constructor() {
    this.rl = readline.createInterface({
      input: stdin: process.stdin,
      output: process.stdout
    });

    this.currentState = SliceUtils.createDemoPlayerState();
    this.encounterController = this.createDemoEncounterController();
    this.rng = new RNGProvider();
  }

  /**
   * Create demo encounter controller
   */
  private createDemoEncounterController(): IEncounterController 
    const encounterTable = SliceUtils.createDemoEncounterTable();

    return {
      registerTable: (table: EncounterTable) => {
        console.log(`📋 Registered encounter table for ${zoneId: table.zoneId} with $table.length: entries.length} entries`);
      },

      registerTrigger: (trigger: EncounterTrigger) => 
        console.log(`🎯 Registered encounter trigger for ${zoneId: trigger.zoneId} ($triggerType: trigger.triggerType})`);
      },

      checkForEncounter: (state: PlayerState, rng: RNGProvider) => 
        // Simple encounter logic based on step count and random chance
        const encounterRate = SliceUtils.calculateEncounterProbability(state, 0.15); // 15% base rate

        if (rng.nextFloat() < encounterRate) {
          // Random encounter
          const spiritId = rng.choose(['ember', 'ripple', 'sprout', 'chill', 'zap']);
          const level = rng.nextInt(3, 8);

          return EncounterResult.triggered(
            zoneId: state.zoneId,
            spiritId,
            level,
            
              zoneId: zoneId: state.zoneId,
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
        console.log('🗑️ Cleared encounter tables');
      },

      clearTriggers: () => {
        console.log('🗑️ Cleared encounter triggers');
      }
    };
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.log('='.repeat(80));
    console.log('🎮 SlicePure CLI - Overworld Battle Vertical Slice');
    console.log('='.repeat(80));
    console.log('');
    console.log('🎯 This demo shows a complete game loop:');
    console.log('   1. Overworld roaming with random encounters');
    console.log('   2. Battle system integration');
    console.log('   3. Turn-based combat simulation');
    console.log('   4. Experience and rewards');
    console.log('');
    console.log('Available commands:');
    console.log('  roam [steps]      - Roam around and look for encounters');
    console.log('  battle            - Trigger battle with random spirit');
    console.log('  status            - Show current player state');
    console.log('  move [direction]  - Move to specific direction (n, s, e, w)');
    console.log('  time [time]       - Set time of day (dawn, day, dusk, night)');
    console.log('  weather [weather] - Set weather (clear, rain, fog, storm)');
    console.log('  reset             - Reset player state');
    console.log('  demo              - Run automated demo');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');
    console.log('🎮 Try "demo" for an automated demonstration!');
    console.log('');

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
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('🎮 SlicePure CLI Help');
    console.log('');
    console.log('Commands:');
    console.log('  roam [steps]      - Roam around looking for encounters');
    console.log('  battle            - Trigger battle with random spirit');
    console.log('  status            - Show current player state');
    console.log('  move [direction]  - Move (n, s, e, w)');
    console.log('  time [time]       - Set time (dawn, day, dusk, night)');
    console.log('  weather [weather] - Set weather (clear, rain, fog)');
    console.log('  reset             - Reset to starting state');
    console.log('  demo              - Run automated demonstration');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');
    console.log('🎯 The "demo" command shows the complete vertical slice!');
  }

  /**
   * Roam for specified number of steps
   */
  private async roamSteps(steps: number): Promise<void> {
    console.log(`🚶 Starting to roam for ${steps} steps...`);
    console.log(`📍 Current position: ($this.currentState.x: position.x}, $this.currentState.y: position.y})`);
    console.log(`🗺️ Zone: $this.zoneId: currentState.zoneId} | Tile: $this.tileType: currentState.tileType}`);
    console.log(`⏰ Time: $this.timeOfDay: currentState.timeOfDay} | Weather: $this.weather: currentState.weather}`);
    console.log('='.repeat(60));

    let encounters = 0;

    for (let i = 1; i <= steps; i++) 
      this.stepCount++;

      // Simulate step
      const stepResult = SliceUtils.simulateOverworldStep(currentState: this.currentState, this.rng);

      // Check for encounter
      const encounterResult = this.encounterController.checkForEncounter(stepResult.state, this.rng);

      // Display step info
      if (i % 5 === 0 || encounterResult.triggered) {
        console.log(`🚶 Step ${i}: ($stepResult.state.x: position.x}, $stepResult.state.y: position.y})`);
      }

      if (encounterResult.triggered) 
        encounters++;
        this.encounterCount++;
        console.log('');
        console.log('🎯 ENCOUNTER TRIGGERED! 🎯');
        console.log(`👻 Wild ${spiritId: encounterResult.spiritId} (Level $level: encounterResult.level}) appeared!`);
        console.log(`📊 Encounter rate: $this.encounterController.getEncounterRate(this.zoneId: currentState.zoneId, this.currentState).toFixed(2)}`);

        // Ask if user wants to battle
        console.log('');
        console.log('💥 Would you like to battle? (type "battle" to engage, or continue roaming)');
        console.log('🔄 Or continue roaming automatically...');
        console.log('');

        // Auto-continue after a brief pause
        setTimeout(() => {
          console.log(`🔄 Continuing to roam... (${i + 1}/${steps})`);
        }, 2000);

        break; // Stop roaming on encounter for demo purposes
      }

      // Update current state
      this.currentState = stepResult.state;
    }

    console.log('='.repeat(60));
    console.log(`🏁 Roaming complete!`);
    console.log(`📊 Steps taken: $stepCount: this.stepCount}`);
    console.log(`⚔️ Encounters found: $encounterCount: this.encounterCount}`);
    console.log(`📈 Encounter rate: ${(this.encounterCount / this.stepCount * 100).toFixed(1)}%`);
    console.log('');
  }

  /**
   * Trigger battle with random spirit
   */
  private triggerBattle(): void 
    console.log('⚔️ TRIGGERING BATTLE...');
    console.log('='.repeat(50));

    // Create player spirit
    const playerSpirit = this.createDemoPlayerSpirit();

    // Generate random wild spirit
    const wildSpirits = ['ember', 'ripple', 'sprout', 'chill', 'zap', 'aero'];
    const wildSpiritId = this.rng.choose(wildSpirits);
    const wildLevel = this.rng.nextInt(3, 8);
    const wildSpirit = this.createDemoWildSpirit(wildSpiritId, wildLevel);

    console.log(`👤 Player: ${name: playerSpirit.name} (Level $level: playerSpirit.level}) - $typeTag: playerSpirit.typeTag} type`);
    console.log(`👾 Wild: $name: wildSpirit.name} (Level $level: wildSpirit.level}) - $typeTag: wildSpirit.typeTag} type`);
    console.log('');

    // Simulate battle
    this.simulateBattle(playerSpirit, wildSpirit);

    console.log('='.repeat(50));
    console.log('🏁 Battle complete!');
  }

  /**
   * Simulate battle between two spirits
   */
  private simulateBattle(playerSpirit: ISpiritInstance, wildSpirit: ISpiritInstance): void {
    console.log('⚔️ BATTLE START!');
    console.log('');

    let turn = 1;
    const maxTurns = 20; // Prevent infinite battles

    while (playerSpirit.isAlive() && wildSpirit.isAlive() && turn <= maxTurns) {
      console.log(`🔄 Turn ${turn}:`);

      // Player attacks first
      const playerDamage = this.calculateDamage(playerSpirit, wildSpirit);
      wildSpirit.takeDamage(playerDamage);

      console.log(`  $name: playerSpirit.name} attacks for ${playerDamage} damage!`);
      console.log(`  $name: wildSpirit.name}: $currentHp: wildSpirit.currentHp}/$maxHp: wildSpirit.maxHp} HP remaining`);

      if (!wildSpirit.isAlive()) 
        console.log(`  ${name: wildSpirit.name} fainted!`);
        break;
      }

      // Wild spirit attacks
      const wildDamage = this.calculateDamage(wildSpirit, playerSpirit);
      playerSpirit.takeDamage(wildDamage);

      console.log(`  $name: wildSpirit.name} attacks for ${wildDamage} damage!`);
      console.log(`  $name: playerSpirit.name}: $currentHp: playerSpirit.currentHp}/$maxHp: playerSpirit.maxHp} HP remaining`);

      if (!playerSpirit.isAlive()) 
        console.log(`  ${name: playerSpirit.name} fainted!`);
        break;
      }

      console.log('');
      turn++;
    }

    // Determine winner
    const winner = playerSpirit.isAlive() ? playerSpirit : wildSpirit;
    const loser = playerSpirit.isAlive() ? wildSpirit : playerSpirit;

    console.log('');
    console.log('🏆 BATTLE RESULT:');
    console.log(`  Winner: $name: winner.name}`);
    console.log(`  Loser: $name: loser.name}`);
    console.log(`  Turns: ${turn}`);

    // Calculate rewards
    const experienceGained = loser.level * 15;
    const goldGained = loser.level * 25;
    const syncGained = Math.floor(turn * 3.5);

    console.log('');
    console.log('🎖️ REWARDS:');
    console.log(`  Experience: ${experienceGained} XP`);
    console.log(`  Gold: ${goldGained} coins`);
    console.log(`  Sync Points: ${syncGained}`);
    console.log(`  Total Playtime: ${Math.floor(turn * 30)} seconds`);
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
      console.log('❌ Usage: move [direction]');
      console.log('Directions: n (north), s (south), e (east), w (west)');
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
        console.log('❌ Invalid direction. Use: n, s, e, w');
        return;
    }

    if (moved) {
      this.currentState.stepsSinceLastEncounter++;
      this.stepCount++;
      console.log(`🚶 Moved ${dir.toUpperCase()} to ($this.currentState.x: position.x}, $this.currentState.y: position.y})`);
      console.log(`📊 Steps since last encounter: $this.stepsSinceLastEncounter: currentState.stepsSinceLastEncounter}`);

      // Check for encounter after movement
      const encounterResult = this.encounterController.checkForEncounter(this.currentState, this.rng);
      if (encounterResult.triggered) 
        console.log('');
        console.log('🎯 ENCOUNTER TRIGGERED! 🎯');
        console.log(`👻 Wild ${spiritId: encounterResult.spiritId} (Level $level: encounterResult.level}) appeared!`);
      }
    }
  }

  /**
   * Set time of day
   */
  private setTimeOfDay(timeStr?: string): void {
    if (!timeStr) {
      console.log('❌ Usage: time [time_of_day]');
      console.log('Times: dawn, day, dusk, night');
      return;
    }

    const time = timeStr.toLowerCase();
    switch (time) {
      case 'dawn':
        this.currentState.setTimeOfDay(TimeOfDay.DAWN);
        console.log('🌅 Set time to DAWN');
        break;
      case 'day':
        this.currentState.setTimeOfDay(TimeOfDay.DAY);
        console.log('☀️ Set time to DAY');
        break;
      case 'dusk':
        this.currentState.setTimeOfDay(TimeOfDay.DUSK);
        console.log('🌇 Set time to DUSK');
        break;
      case 'night':
        this.currentState.setTimeOfDay(TimeOfDay.NIGHT);
        console.log('🌙 Set time to NIGHT');
        break;
      default:
        console.log('❌ Invalid time. Use: dawn, day, dusk, night');
    }
  }

  /**
   * Set weather
   */
  private setWeather(weatherStr?: string): void {
    if (!weatherStr) {
      console.log('❌ Usage: weather [weather_type]');
      console.log('Weather: clear, sunny, rain, fog, storm, wind');
      return;
    }

    const weather = weatherStr.toLowerCase();
    this.currentState.setWeather(weather);
    console.log(`🌤️ Set weather to ${weather.toUpperCase()}`);
  }

  /**
   * Show current status
   */
  private showStatus(): void 
    console.log('='.repeat(60));
    console.log('📊 CURRENT STATUS');
    console.log('='.repeat(60));
    console.log(`📍 Position: (${this.currentState.x: position.x}, $this.currentState.y: position.y})`);
    console.log(`🗺️ Zone: $this.zoneId: currentState.zoneId} | Tile: $this.tileType: currentState.tileType}`);
    console.log(`⏰ Time: $this.timeOfDay: currentState.timeOfDay} | Weather: $this.weather: currentState.weather}`);
    console.log(`🚶 Steps since encounter: $this.stepsSinceLastEncounter: currentState.stepsSinceLastEncounter}`);
    console.log(`📈 Total steps: $stepCount: this.stepCount}`);
    console.log(`⚔️ Total encounters: $encounterCount: this.encounterCount}`);
    console.log(`📊 Encounter rate: ${this.encounterCount > 0 ? (this.encounterCount / this.stepCount * 100).toFixed(1) : '0.0'}%`);
    console.log(`🎲 RNG Seed: $this.seed: rng.seed}`);
    console.log('');
    console.log(`🎯 Encounter rate: $this.encounterController.getEncounterRate(this.zoneId: currentState.zoneId, this.currentState).toFixed(2)}`);
    console.log(`👻 Available spirits: ${this.encounterController.getAvailableSpirits(this.currentState.zoneId).join(', ')}`);
    console.log('='.repeat(60));
  }

  /**
   * Reset player state
   */
  private resetState(): void {
    this.currentState = SliceUtils.createDemoPlayerState();
    this.stepCount = 0;
    this.encounterCount = 0;
    this.rng = new RNGProvider();
    console.log('🔄 Reset to initial state');
    this.showStatus();
  }

  /**
   * Run automated demo
   */
  private async runDemo(): Promise<void> {
    console.log('🎮 STARTING AUTOMATED DEMO...');
    console.log('='.repeat(60));

    const demoSteps = 25;

    for (let i = 0; i < demoSteps; i++) {
      console.log(`\n🚶 DEMO STEP ${i + 1}/${demoSteps}`);
      console.log(`📍 Position: ($this.currentState.x: position.x}, $this.currentState.y: position.y})`);

      // Simulate step
      const stepResult = SliceUtils.simulateOverworldStep(this.currentState, this.rng);
      this.currentState = stepResult.state;

      // Check for encounter
      const encounterResult = this.encounterController.checkForEncounter(this.currentState, this.rng);

      if (encounterResult.triggered) 
        console.log('');
        console.log('🎯 ENCOUNTER! 🎯');
        console.log(`👻 ${spiritId: encounterResult.spiritId} (Level $level: encounterResult.level}) appeared!`);
        console.log('');

        // Simulate battle
        const playerSpirit = this.createDemoPlayerSpirit();
        const wildSpirit = this.createDemoWildSpirit(encounterResult.spiritId!, encounterResult.level!);

        this.simulateBattle(playerSpirit, wildSpirit);

        console.log('');
        console.log('🏁 Demo continues roaming...');
        console.log('');

        // Short pause
        await this.sleep(1000);
      }

      // Show progress every 5 steps
      if ((i + 1) % 5 === 0) {
        console.log(`📊 Progress: ${i + 1}/${demoSteps} steps completed`);
        console.log(`⚔️ Encounters: $encounterCount: this.encounterCount}`);
      }
    }

    console.log('='.repeat(60));
    console.log('🎉 DEMO COMPLETE!');
    console.log('='.repeat(60));
    console.log('📊 Final Statistics:');
    console.log(`  Total Steps: $stepCount: this.stepCount}`);
    console.log(`  Encounters: $encounterCount: this.encounterCount}`);
    console.log(`  Encounter Rate: ${(this.encounterCount / this.stepCount * 100).toFixed(1)}%`);
    console.log(`  Final Position: ($this.currentState.x: position.x}, $this.currentState.y: position.y})`);
    console.log('');
    console.log('🎮 Try "roam 10" to continue exploring!');
    console.log('💡 Or "battle" to trigger an immediate encounter!');
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
      heal: (amount: number) => 
        this.currentHp = Math.min(maxHp: this.maxHp, this.currentHp + amount);
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
      heal: (amount: number) => 
        this.currentHp = Math.min(maxHp: this.maxHp, this.currentHp + amount);
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
    console.log('');
    console.log('👋 Thank you for using SlicePure CLI!');
    console.log('🎮 This demo showed the complete MIFF game loop:');
    console.log('   1. Overworld roaming with encounter generation');
    console.log('   2. Random encounter triggering');
    console.log('   3. Battle system integration');
    console.log('   4. Turn-based combat simulation');
    console.log('   5. Experience and reward calculation');
    console.log('');
    console.log('🎯 All MIFF modules work together seamlessly!');
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