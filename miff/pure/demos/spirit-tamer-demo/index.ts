#!/usr/bin/env tsx

/**
 * Spirit Tamer Demo - Interactive Creature Collection Game
 * MIFF Framework Demo Project
 *
 * Features:
 * - Creature collection and management
 * - Battle system with type effectiveness
 * - Team management and strategy
 * - Experience and leveling system
 * - Inventory and item usage
 * - Save/load functionality
 */

import { HealthSystemPure } from '../../HealthSystemPure/index';
import { CombatPure } from '../../CombatPure/index';
import { TeamsPure } from '../../TeamsPure/index';
import { ItemsPure } from '../../ItemsPure/index';
import { AIPure } from '../../AIPure/index';
import { LogPure } from '../../LogPure/index';
import { SavePure } from '../../SaveLoadPure/index';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Game Types and Interfaces
interface SpiritType {
  name: string;
  color: string;
  weaknesses: string[];
  resistances: string[];
  description: string;
}

interface SpiritSpecies {
  id: string;
  name: string;
  description: string;
  type: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  abilities: string[];
  evolutionLevel: number;
  captureRate: number;
  experienceYield: number;
}

interface PlayerSpirit {
  id: string;
  speciesId: string;
  name: string;
  level: number;
  experience: number;
  currentHp: number;
  maxHp: number;
  stats: {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  abilities: string[];
  status: 'normal' | 'fainted' | 'poisoned' | 'burned' | 'frozen' | 'paralyzed' | 'sleeping';
  type: string;
  canEvolve: boolean;
  friendship: number;
  syncLevel: number;
  moves: string[];
}

interface Player {
  name: string;
  spirits: PlayerSpirit[];
  activeTeam: PlayerSpirit[];
  inventory: Map<string, number>;
  money: number;
  badges: string[];
  location: string;
  playTime: number;
  saveFile: string;
}

interface BattleState {
  playerSpirit: PlayerSpirit;
  enemySpirit: PlayerSpirit;
  playerMoves: string[];
  enemyMoves: string[];
  turn: number;
  battleLog: string[];
  weather: string;
  terrain: string;
}

// Game Constants
const SPIRIT_TYPES: Record<string, SpiritType> = {
  fire: { name: 'Fire', color: '\x1b[31m', weaknesses: ['water', 'ground'], resistances: ['fire', 'grass'], description: 'Strong against grass, weak to water' },
  water: { name: 'Water', color: '\x1b[34m', weaknesses: ['electric', 'grass'], resistances: ['water', 'fire'], description: 'Strong against fire, weak to electric' },
  grass: { name: 'Grass', color: '\x1b[32m', weaknesses: ['fire', 'flying'], resistances: ['water', 'grass'], description: 'Strong against water, weak to fire' },
  electric: { name: 'Electric', color: '\x1b[33m', weaknesses: ['ground'], resistances: ['electric', 'flying'], description: 'Strong against water, weak to ground' },
  psychic: { name: 'Psychic', color: '\x1b[35m', weaknesses: ['bug', 'ghost'], resistances: ['psychic', 'fighting'], description: 'Strong against fighting, weak to bug' },
  fighting: { name: 'Fighting', color: '\x1b[31m', weaknesses: ['flying', 'psychic'], resistances: ['bug', 'rock'], description: 'Strong against normal, weak to flying' },
  poison: { name: 'Poison', color: '\x1b[35m', weaknesses: ['psychic', 'ground'], resistances: ['grass', 'fighting'], description: 'Strong against grass, weak to psychic' },
  ground: { name: 'Ground', color: '\x1b[33m', weaknesses: ['water', 'grass'], resistances: ['poison', 'rock'], description: 'Strong against electric, weak to water' },
  flying: { name: 'Flying', color: '\x1b[36m', weaknesses: ['electric', 'rock'], resistances: ['grass', 'fighting'], description: 'Strong against grass, weak to electric' },
  bug: { name: 'Bug', color: '\x1b[32m', weaknesses: ['fire', 'flying'], resistances: ['grass', 'fighting'], description: 'Strong against grass, weak to fire' },
  rock: { name: 'Rock', color: '\x1b[33m', weaknesses: ['water', 'grass'], resistances: ['normal', 'fire'], description: 'Strong against flying, weak to water' },
  ghost: { name: 'Ghost', color: '\x1b[35m', weaknesses: ['ghost', 'dark'], resistances: ['normal', 'fighting'], description: 'Strong against psychic, weak to ghost' },
  dragon: { name: 'Dragon', color: '\x1b[35m', weaknesses: ['dragon', 'ice'], resistances: ['fire', 'water'], description: 'Strong against dragon, weak to ice' },
  dark: { name: 'Dark', color: '\x1b[30m', weaknesses: ['fighting', 'bug'], resistances: ['ghost', 'dark'], description: 'Strong against psychic, weak to fighting' },
  steel: { name: 'Steel', color: '\x1b[37m', weaknesses: ['fire', 'fighting'], resistances: ['normal', 'flying'], description: 'Strong against rock, weak to fire' },
  fairy: { name: 'Fairy', color: '\x1b[35m', weaknesses: ['poison', 'steel'], resistances: ['fighting', 'bug'], description: 'Strong against dragon, weak to poison' },
  ice: { name: 'Ice', color: '\x1b[36m', weaknesses: ['fire', 'fighting'], resistances: ['ice'], description: 'Strong against grass, weak to fire' },
  normal: { name: 'Normal', color: '\x1b[37m', weaknesses: ['fighting'], resistances: [], description: 'No particular strengths or weaknesses' }
};

const SPIRIT_SPECIES: Record<string, SpiritSpecies> = {
  charmander: {
    id: 'charmander',
    name: 'Charmander',
    description: 'A fire lizard Pokémon',
    type: 'fire',
    baseStats: { hp: 39, attack: 52, defense: 43, specialAttack: 60, specialDefense: 50, speed: 65 },
    abilities: ['blaze'],
    evolutionLevel: 16,
    captureRate: 45,
    experienceYield: 62
  },
  squirtle: {
    id: 'squirtle',
    name: 'Squirtle',
    description: 'A water turtle Pokémon',
    type: 'water',
    baseStats: { hp: 44, attack: 48, defense: 65, specialAttack: 50, specialDefense: 64, speed: 43 },
    abilities: ['torrent'],
    evolutionLevel: 16,
    captureRate: 45,
    experienceYield: 63
  },
  bulbasaur: {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    description: 'A grass frog Pokémon',
    type: 'grass',
    baseStats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
    abilities: ['overgrow'],
    evolutionLevel: 16,
    captureRate: 45,
    experienceYield: 64
  },
  pikachu: {
    id: 'pikachu',
    name: 'Pikachu',
    description: 'An electric mouse Pokémon',
    type: 'electric',
    baseStats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
    abilities: ['static'],
    evolutionLevel: 0,
    captureRate: 190,
    experienceYield: 112
  },
  eevee: {
    id: 'eevee',
    name: 'Eevee',
    description: 'An evolution Pokémon',
    type: 'normal',
    baseStats: { hp: 55, attack: 55, defense: 50, specialAttack: 45, specialDefense: 65, speed: 55 },
    abilities: ['run away', 'adaptability'],
    evolutionLevel: 0,
    captureRate: 255,
    experienceYield: 65
  }
};

const MOVES: Record<string, any> = {
  tackle: { name: 'Tackle', type: 'normal', power: 40, accuracy: 100, pp: 35, category: 'physical', description: 'A physical attack' },
  scratch: { name: 'Scratch', type: 'normal', power: 40, accuracy: 100, pp: 35, category: 'physical', description: 'A physical attack' },
  ember: { name: 'Ember', type: 'fire', power: 40, accuracy: 100, pp: 25, category: 'special', description: 'May burn the target' },
  watergun: { name: 'Water Gun', type: 'water', power: 40, accuracy: 100, pp: 25, category: 'special', description: 'A water attack' },
  vinewhip: { name: 'Vine Whip', type: 'grass', power: 45, accuracy: 100, pp: 25, category: 'physical', description: 'A grass attack' },
  thunderbolt: { name: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100, pp: 15, category: 'special', description: 'May paralyze the target' },
  quickattack: { name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, pp: 30, category: 'physical', description: 'Always strikes first' },
  growl: { name: 'Growl', type: 'normal', power: 0, accuracy: 100, pp: 40, category: 'status', description: 'Lowers the target\'s attack' },
  tailwhip: { name: 'Tail Whip', type: 'normal', power: 0, accuracy: 100, pp: 30, category: 'status', description: 'Lowers the target\'s defense' },
  leer: { name: 'Leer', type: 'normal', power: 0, accuracy: 100, pp: 30, category: 'status', description: 'Lowers the target\'s defense' }
};

// Game Systems
class SpiritTamerGame {
  private player: Player;
  private healthSystem: any;
  private combatSystem: any;
  private teamSystem: any;
  private itemSystem: any;
  private aiSystem: any;
  private logSystem: any;
  private saveSystem: any;
  private rl: readline.Interface;
  private battleState: BattleState | null = null;

  constructor() {
    this.healthSystem = new (HealthSystemPure as any).HealthSystemManager();
    this.combatSystem = new (CombatPure as any).CombatEngine();
    this.teamSystem = new (TeamsPure as any).TeamManager();
    this.itemSystem = new (ItemsPure as any).ItemUsageManager({} as any);
    this.aiSystem = new (AIPure as any).AIManager();
    this.logSystem = new (LogPure as any).BattleLogger();
    this.saveSystem = new (SavePure as any).SaveManager();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.initializeGame();
  }

  private initializeGame(): void {
    console.log('\x1b[2J\x1b[0;0H'); // Clear screen
    console.log('🌟 Welcome to Spirit Tamer! 🌟');
    console.log('A creature collection adventure game built with MIFF Framework\n');

    this.askQuestion('What is your name, trainer? ')
      .then((name: string) => {
        this.createNewPlayer(name.trim());
        this.startGame();
      });
  }

  private createNewPlayer(name: string): void {
    this.player = {
      name,
      spirits: [],
      activeTeam: [],
      inventory: new Map([
        ['pokeball', 10],
        ['potion', 5],
        ['super_potion', 2],
        ['antidote', 3]
      ]),
      money: 1000,
      badges: [],
      location: 'pallet_town',
      playTime: 0,
      saveFile: `save_${name.toLowerCase().replace(/\s+/g, '_')}.json`
    };

    // Give starter spirits
    this.giveStarterSpirit('charmander');
    this.giveStarterSpirit('squirtle');
    this.giveStarterSpirit('bulbasaur');
  }

  private giveStarterSpirit(speciesId: string): void {
    const species = SPIRIT_SPECIES[speciesId];
    if (!species) return;

    const spirit: PlayerSpirit = {
      id: `${speciesId}_${Date.now()}`,
      speciesId,
      name: species.name,
      level: 5,
      experience: 0,
      currentHp: species.baseStats.hp,
      maxHp: species.baseStats.hp,
      stats: { ...species.baseStats },
      abilities: species.abilities,
      status: 'normal',
      type: species.type,
      canEvolve: species.evolutionLevel > 0,
      friendship: 50,
      syncLevel: 10,
      moves: this.getMovesForLevel(speciesId, 5)
    };

    this.player.spirits.push(spirit);
    this.updateActiveTeam();
  }

  private getMovesForLevel(speciesId: string, level: number): string[] {
    const movePool: Record<string, string[]> = {
      charmander: ['scratch', 'growl', 'ember'],
      squirtle: ['tackle', 'tailwhip', 'watergun'],
      bulbasaur: ['tackle', 'growl', 'vinewhip'],
      pikachu: ['thunderbolt', 'quickattack', 'growl'],
      eevee: ['tackle', 'tailwhip', 'growl']
    };

    const moves = movePool[speciesId] || ['tackle', 'growl'];
    return moves.slice(0, Math.min(level / 5 + 1, 4));
  }

  private updateActiveTeam(): void {
    this.player.activeTeam = this.player.spirits.slice(0, 6);
  }

  private async askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  private startGame(): void {
    console.log(`\n🎉 Welcome, ${this.player.name}!`);
    console.log('Your adventure begins in Pallet Town.');
    console.log(`You have ${this.player.spirits.length} spirits in your collection.`);

    this.showMainMenu();
  }

  private showMainMenu(): void {
    console.log('\n📋 Main Menu:');
    console.log('1. 🏃 Explore');
    console.log('2. ⚔️  Battle Training');
    console.log('3. 🎒 Inventory');
    console.log('4. 👥 Team Management');
    console.log('5. 💾 Save Game');
    console.log('6. 📊 Statistics');
    console.log('7. ❌ Quit');

    this.askQuestion('What would you like to do? ')
      .then((choice: string) => {
        switch (choice.trim()) {
          case '1':
            this.explore();
            break;
          case '2':
            this.startBattleTraining();
            break;
          case '3':
            this.showInventory();
            break;
          case '4':
            this.manageTeam();
            break;
          case '5':
            this.saveGame();
            break;
          case '6':
            this.showStatistics();
            break;
          case '7':
            console.log('👋 Thanks for playing Spirit Tamer!');
            this.rl.close();
            break;
          default:
            console.log('❌ Invalid choice. Please try again.');
            this.showMainMenu();
        }
      });
  }

  private explore(): void {
    console.log('\n🗺️  Exploring...');

    const locations = [
      'viridian_forest',
      'pewter_city',
      'cerulean_city',
      'vermilion_city',
      'lavender_town',
      'celadon_city',
      'fuchsia_city',
      'saffron_city',
      'cinnabar_island'
    ];

    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    this.player.location = randomLocation;

    console.log(`You are now in ${randomLocation.replace('_', ' ').toUpperCase()}!`);

    const encounters = this.getRandomEncounters(randomLocation);
    if (encounters.length > 0 && Math.random() < 0.3) {
      const enemy = this.generateWildSpirit(encounters);
      console.log(`\n⚔️  A wild ${enemy.name} appeared!`);

      this.startWildBattle(enemy);
    } else {
      console.log('Nothing interesting happened...');

      setTimeout(() => {
        this.showMainMenu();
      }, 1000);
    }
  }

  private getRandomEncounters(location: string): string[] {
    const encounters: Record<string, string[]> = {
      viridian_forest: ['pikachu', 'caterpie', 'metapod', 'butterfree'],
      pewter_city: ['pikachu', 'rattata', 'pidgey'],
      cerulean_city: ['pikachu', 'magikarp', 'gyarados'],
      vermilion_city: ['pikachu', 'voltorb', 'electrode'],
      lavender_town: ['pikachu', 'gastly', 'haunter', 'gengar'],
      celadon_city: ['pikachu', 'eevee', 'vaporeon', 'jolteon', 'flareon'],
      fuchsia_city: ['pikachu', 'venonat', 'venomoth'],
      saffron_city: ['pikachu', 'abra', 'kadabra', 'alakazam'],
      cinnabar_island: ['pikachu', 'magmar', 'magby']
    };

    return encounters[location] || ['pikachu'];
  }

  private generateWildSpirit(speciesIds: string[]): PlayerSpirit {
    const speciesId = speciesIds[Math.floor(Math.random() * speciesIds.length)];
    const species = SPIRIT_SPECIES[speciesId];

    const level = Math.floor(Math.random() * 10) + 3; // Levels 3-12
    const stats = { ...species.baseStats };

    // Scale stats with level
    Object.keys(stats).forEach((key: any) => {
      stats[key as keyof typeof stats] = Math.floor(stats[key as keyof typeof stats] * (level / 5));
    });

    return {
      id: `${speciesId}_wild_${Date.now()}`,
      speciesId,
      name: species.name,
      level,
      experience: 0,
      currentHp: stats.hp,
      maxHp: stats.hp,
      stats,
      abilities: species.abilities,
      status: 'normal',
      type: species.type,
      canEvolve: species.evolutionLevel > 0 && level >= species.evolutionLevel,
      friendship: 0,
      syncLevel: 0,
      moves: this.getMovesForLevel(speciesId, level)
    };
  }

  private startWildBattle(enemy: PlayerSpirit): void {
    if (this.player.activeTeam.length === 0) {
      console.log('❌ You have no spirits ready for battle!');
      this.showMainMenu();
      return;
    }

    const playerSpirit = this.player.activeTeam[0];
    this.battleState = {
      playerSpirit,
      enemySpirit: enemy,
      playerMoves: playerSpirit.moves,
      enemyMoves: enemy.moves,
      turn: 1,
      battleLog: [],
      weather: 'clear',
      terrain: 'normal'
    };

    console.log(`\n⚔️  ${this.player.name}'s ${playerSpirit.name} vs Wild ${enemy.name}!`);
    console.log(`Level ${playerSpirit.level} vs Level ${enemy.level}`);

    this.battleLoop();
  }

  private battleLoop(): void {
    if (!this.battleState) return;

    const { playerSpirit, enemySpirit } = this.battleState;

    console.log(`\n🔄 Turn ${this.battleState.turn}`);
    console.log(`${playerSpirit.name} (${playerSpirit.currentHp}/${playerSpirit.maxHp} HP)`);
    console.log(`${enemySpirit.name} (${enemySpirit.currentHp}/${enemySpirit.maxHp} HP)`);

    this.askQuestion('Choose your action (attack, item, switch, run): ')
      .then((action: string) => {
        switch (action.toLowerCase().trim()) {
          case 'attack':
            this.showMoves();
            break;
          case 'item':
            this.showInventory();
            break;
          case 'switch':
            this.switchSpirit();
            break;
          case 'run':
            if (Math.random() < 0.5) {
              console.log('🏃 You got away safely!');
              this.endBattle();
            } else {
              console.log('❌ Couldn\'t escape!');
              this.enemyTurn();
            }
            break;
          default:
            console.log('❌ Invalid action!');
            this.battleLoop();
        }
      });
  }

  private showMoves(): void {
    if (!this.battleState) return;

    console.log('\n⚔️  Available Moves:');
    this.battleState.playerMoves.forEach((move, index) => {
      const moveData = MOVES[move];
      console.log(`${index + 1}. ${moveData.name} (${moveData.type}, ${moveData.category})`);
    });

    this.askQuestion('Choose a move (1-4): ')
      .then((choice: string) => {
        const moveIndex = parseInt(choice) - 1;
        if (moveIndex >= 0 && moveIndex < this.battleState.playerMoves.length) {
          const moveName = this.battleState.playerMoves[moveIndex];
          this.executeMove(moveName);
        } else {
          console.log('❌ Invalid move!');
          this.showMoves();
        }
      });
  }

  private executeMove(moveName: string): void {
    if (!this.battleState) return;

    const moveData = MOVES[moveName];
    const { playerSpirit, enemySpirit } = this.battleState;

    console.log(`\n${playerSpirit.name} used ${moveData.name}!`);

    // Calculate damage
    let damage = Math.floor(moveData.power * (playerSpirit.stats.attack / enemySpirit.stats.defense));

    // Type effectiveness
    const effectiveness = this.getTypeEffectiveness(moveData.type, enemySpirit.type);
    damage = Math.floor(damage * effectiveness);

    // Apply damage
    enemySpirit.currentHp = Math.max(0, enemySpirit.currentHp - damage);

    console.log(`It dealt ${damage} damage!`);
    if (effectiveness > 1) console.log('💪 It\'s super effective!');
    if (effectiveness < 1) console.log('💨 It\'s not very effective...');

    // Check if enemy fainted
    if (enemySpirit.currentHp <= 0) {
      console.log(`${enemySpirit.name} fainted!`);
      this.gainExperience(enemySpirit);
      this.endBattle();
      return;
    }

    // Enemy turn
    this.enemyTurn();
  }

  private enemyTurn(): void {
    if (!this.battleState) return;

    const { enemySpirit, playerSpirit } = this.battleState;
    const availableMoves = enemySpirit.moves.filter((move: any) => MOVES[move]);

    if (availableMoves.length === 0) {
      console.log(`${enemySpirit.name} struggles!`);
      return;
    }

    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const moveData = MOVES[randomMove];

    console.log(`\n${enemySpirit.name} used ${moveData.name}!`);

    let damage = Math.floor(moveData.power * (enemySpirit.stats.attack / playerSpirit.stats.defense));
    const effectiveness = this.getTypeEffectiveness(moveData.type, playerSpirit.type);
    damage = Math.floor(damage * effectiveness);

    playerSpirit.currentHp = Math.max(0, playerSpirit.currentHp - damage);

    console.log(`It dealt ${damage} damage!`);

    // Check if player fainted
    if (playerSpirit.currentHp <= 0) {
      console.log(`${playerSpirit.name} fainted!`);
      this.endBattle();
      return;
    }

    this.battleState.turn++;
    this.battleLoop();
  }

  private getTypeEffectiveness(attackerType: string, defenderType: string): number {
    const type1 = SPIRIT_TYPES[attackerType];
    const type2 = SPIRIT_TYPES[defenderType];

    if (!type1 || !type2) return 1;

    if (type1.weaknesses.includes(defenderType)) return 0.5;
    if (type1.resistances.includes(defenderType)) return 2;

    return 1;
  }

  private gainExperience(enemy: PlayerSpirit): void {
    const expGained = enemy.level * 10;
    console.log(`\n⭐ Gained ${expGained} experience points!`);

    // Distribute XP to all active team members
    this.player.activeTeam.forEach((spirit: any) => {
      if (spirit.currentHp > 0) {
        spirit.experience += expGained;
        this.checkLevelUp(spirit);
      }
    });
  }

  private checkLevelUp(spirit: PlayerSpirit): void {
    const expNeeded = spirit.level * 100;

    if (spirit.experience >= expNeeded) {
      spirit.level++;
      spirit.experience -= expNeeded;

      console.log(`🎉 ${spirit.name} reached level ${spirit.level}!`);

      // Update stats
      const species = SPIRIT_SPECIES[spirit.speciesId];
      if (species) {
        spirit.maxHp = Math.floor(species.baseStats.hp * (spirit.level / 5));
        spirit.stats.attack = Math.floor(species.baseStats.attack * (spirit.level / 5));
        spirit.stats.defense = Math.floor(species.baseStats.defense * (spirit.level / 5));
        spirit.stats.specialAttack = Math.floor(species.baseStats.specialAttack * (spirit.level / 5));
        spirit.stats.specialDefense = Math.floor(species.baseStats.specialDefense * (spirit.level / 5));
        spirit.stats.speed = Math.floor(species.baseStats.speed * (spirit.level / 5));
      }

      // Heal to full
      spirit.currentHp = spirit.maxHp;

      // Learn new moves
      const newMoves = this.getMovesForLevel(spirit.speciesId, spirit.level);
      newMoves.forEach((move: any) => {
        if (!spirit.moves.includes(move)) {
          spirit.moves.push(move);
          console.log(`📚 ${spirit.name} learned ${MOVES[move].name}!`);
        }
      });

      // Check evolution
      if (spirit.canEvolve && spirit.level >= SPIRIT_SPECIES[spirit.speciesId].evolutionLevel) {
        this.evolveSpirit(spirit);
      }
    }
  }

  private evolveSpirit(spirit: PlayerSpirit): void {
    const species = SPIRIT_SPECIES[spirit.speciesId];
    if (!species) return;

    // Simple evolution (in a real game, this would be more complex)
    const evolutions: Record<string, string> = {
      charmander: 'charmeleon',
      squirtle: 'wartortle',
      bulbasaur: 'ivysaur'
    };

    const evolution = evolutions[spirit.speciesId];
    if (evolution) {
      console.log(`\n✨ ${spirit.name} is evolving!`);

      spirit.speciesId = evolution;
      spirit.name = SPIRIT_SPECIES[evolution]?.name || spirit.name;
      spirit.canEvolve = false;

      console.log(`🎉 ${spirit.name} evolved!`);
    }
  }

  private endBattle(): void {
    this.battleState = null;
    console.log('\n🏁 Battle ended!');

    setTimeout(() => {
      this.showMainMenu();
    }, 2000);
  }

  private startBattleTraining(): void {
    console.log('\n⚔️  Battle Training Mode');
    console.log('Choose a spirit to battle against:');

    this.player.spirits.forEach((spirit, index) => {
      if (index < this.player.activeTeam.length) {
        console.log(`${index + 1}. ${spirit.name} (Level ${spirit.level})`);
      }
    });

    this.askQuestion('Choose your opponent (1-6): ')
      .then((choice: string) => {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < this.player.activeTeam.length) {
          const enemy = this.player.activeTeam[index];
          this.startTrainingBattle(enemy);
        } else {
          console.log('❌ Invalid choice!');
          this.showMainMenu();
        }
      });
  }

  private startTrainingBattle(enemy: PlayerSpirit): void {
    const playerSpirit = this.player.activeTeam[0];
    this.battleState = {
      playerSpirit,
      enemySpirit: enemy,
      playerMoves: playerSpirit.moves,
      enemyMoves: enemy.moves,
      turn: 1,
      battleLog: [],
      weather: 'clear',
      terrain: 'normal'
    };

    console.log(`\n⚔️  Training Battle: ${playerSpirit.name} vs ${enemy.name}!`);
    this.battleLoop();
  }

  private showInventory(): void {
    console.log('\n🎒 Inventory:');
    console.log(`💰 Money: $${this.player.money}`);

    this.player.inventory.forEach((quantity, item) => {
      console.log(`${item}: ${quantity}`);
    });

    this.askQuestion('Use an item? (y/n): ')
      .then((answer: string) => {
        if (answer.toLowerCase() === 'y') {
          this.useItem();
        } else {
          this.showMainMenu();
        }
      });
  }

  private useItem(): void {
    console.log('\n💊 Available Items:');
    const items = Array.from(this.player.inventory.keys());
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });

    this.askQuestion('Choose an item (1-4): ')
      .then((choice: string) => {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < items.length) {
          const item = items[index];
          const quantity = this.player.inventory.get(item) || 0;

          if (quantity > 0) {
            console.log(`Using ${item}...`);
            this.player.inventory.set(item, quantity - 1);

            // Apply item effects
            switch (item) {
              case 'potion':
                this.player.activeTeam[0].currentHp = Math.min(
                  this.player.activeTeam[0].maxHp,
                  this.player.activeTeam[0].currentHp + 20
                );
                console.log('❤️ HP restored by 20!');
                break;
              case 'super_potion':
                this.player.activeTeam[0].currentHp = Math.min(
                  this.player.activeTeam[0].maxHp,
                  this.player.activeTeam[0].currentHp + 50
                );
                console.log('❤️ HP restored by 50!');
                break;
              case 'antidote':
                if (this.player.activeTeam[0].status !== 'normal') {
                  this.player.activeTeam[0].status = 'normal';
                  console.log('🧪 Status condition cured!');
                }
                break;
            }

            this.showMainMenu();
          } else {
            console.log('❌ Not enough of that item!');
            this.useItem();
          }
        } else {
          console.log('❌ Invalid item!');
          this.useItem();
        }
      });
  }

  private manageTeam(): void {
    console.log('\n👥 Team Management');
    console.log('Current Team:');

    this.player.activeTeam.forEach((spirit, index) => {
      console.log(`${index + 1}. ${spirit.name} (Level ${spirit.level}, ${spirit.currentHp}/${spirit.maxHp} HP)`);
    });

    this.askQuestion('Switch spirits? (y/n): ')
      .then((answer: string) => {
        if (answer.toLowerCase() === 'y') {
          this.switchSpirits();
        } else {
          this.showMainMenu();
        }
      });
  }

  private switchSpirits(): void {
    console.log('\n🔄 Switch Spirits');
    console.log('Available Spirits:');

    this.player.spirits.forEach((spirit, index) => {
      const inTeam = this.player.activeTeam.some(teamSpirit => teamSpirit.id === spirit.id);
      console.log(`${index + 1}. ${spirit.name} (Level ${spirit.level}) ${inTeam ? '[IN TEAM]' : ''}`);
    });

    this.askQuestion('Choose spirits to switch (format: 1 2): ')
      .then((choice: string) => {
        const indices = choice.trim().split(' ').map((n: any) => parseInt(n) - 1);

        if (indices.length === 2 && indices.every(i => i >= 0 && i < this.player.spirits.length)) {
          const spirit1 = this.player.spirits[indices[0]];
          const spirit2 = this.player.spirits[indices[1]];

          if (spirit1 && spirit2) {
            console.log(`🔄 Switching ${spirit1.name} and ${spirit2.name}...`);

            // Simple switch logic
            const temp = spirit1;
            this.player.spirits[indices[0]] = spirit2;
            this.player.spirits[indices[1]] = temp;

            this.updateActiveTeam();
            console.log('✅ Spirits switched!');
          }
        } else {
          console.log('❌ Invalid choice!');
        }

        this.showMainMenu();
      });
  }

  private saveGame(): void {
    console.log('\n💾 Saving Game...');

    try {
      const saveData = {
        player: this.player,
        timestamp: new Date(),
        version: '1.0.0'
      };

      const savePath = path.join(process.cwd(), 'saves', this.player.saveFile);
      fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));

      console.log('✅ Game saved successfully!');
      this.showMainMenu();

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log('❌ Failed to save game!');
      this.showMainMenu();
    }
  }

  private showStatistics(): void {
    console.log('\n📊 Player Statistics');
    console.log(`👤 Name: ${this.player.name}`);
    console.log(`📍 Location: ${this.player.location.replace('_', ' ').toUpperCase()}`);
    console.log(`💰 Money: $${this.player.money}`);
    console.log(`🎒 Spirits Owned: ${this.player.spirits.length}`);
    console.log(`🏆 Badges: ${this.player.badges.length}`);
    console.log(`⏱️  Play Time: ${Math.floor(this.player.playTime / 60)}m ${this.player.playTime % 60}s`);

    console.log('\n👥 Team:');
    this.player.activeTeam.forEach((spirit, index) => {
      console.log(`  ${index + 1}. ${spirit.name} (Lv.${spirit.level}) - ${spirit.type}`);
    });

    this.showMainMenu();
  }
}

// Demo Entry Point
async function main() {
  console.log('🎮 Spirit Tamer Demo - MIFF Framework');
  console.log('=====================================');
  console.log('A complete creature collection game featuring:');
  console.log('• Battle system with type effectiveness');
  console.log('• Team management and strategy');
  console.log('• Experience and leveling');
  console.log('• Item usage and inventory');
  console.log('• Save/load functionality');
  console.log('• Multiple creature types and abilities\n');

  const game = new SpiritTamerGame();
}

// Export for use in other modules
export { SpiritTamerGame, main };

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}