#!/usr/bin/env tsx
/**
 * Simple RPG Game using MIFF Framework
 * 
 * This is a 100-line RPG demonstration showing real-world MIFF usage.
 * It showcases module integration, event handling, and game loop mechanics.
 */

import { EventBus } from '../miff/pure/EventBusPure';
import { CombatEngine } from '../miff/pure/CombatPure';
import { InventoryManager } from '../miff/pure/InventoryPure';
import { QuestManager } from '../miff/pure/QuestsPure';
import { StatsManager } from '../miff/pure/StatsSystemPure';

interface GameState {
  player: {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    experience: number;
    gold: number;
  };
  currentLocation: string;
  quests: any[];
  inventory: any;
  combat: any;
}

class SimpleRPG {
  private eventBus: EventBus;
  private gameState: GameState;
  private isRunning: boolean = false;

  constructor() {
    this.eventBus = new EventBus();
    this.gameState = {
      player: {
        name: "Hero",
        level: 1,
        health: 100,
        maxHealth: 100,
        experience: 0,
        gold: 50
      },
      currentLocation: "Town Square",
      quests: [],
      inventory: null,
      combat: null
    };
  }

  async initialize(): Promise<void> {
    console.log("🎮 Initializing Simple RPG...");
    
    try {
      // Initialize MIFF modules
      this.gameState.inventory = new InventoryManager();
      this.gameState.combat = new CombatEngine();
      
      // Set up event listeners
      this.eventBus.subscribe('player.levelUp', this.onLevelUp.bind(this));
      this.eventBus.subscribe('combat.victory', this.onCombatVictory.bind(this));
      this.eventBus.subscribe('quest.completed', this.onQuestCompleted.bind(this));
      
      console.log("✅ RPG initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize RPG:", error);
      throw error;
    }
  }

  private onLevelUp(data: any): void {
    this.gameState.player.level++;
    this.gameState.player.maxHealth += 20;
    this.gameState.player.health = this.gameState.player.maxHealth;
    console.log(`🎉 Level up! Now level ${this.gameState.player.level}`);
  }

  private onCombatVictory(data: any): void {
    const expGained = data.experience || 10;
    const goldGained = data.gold || 5;
    
    this.gameState.player.experience += expGained;
    this.gameState.player.gold += goldGained;
    
    console.log(`⚔️ Victory! +${expGained} XP, +${goldGained} gold`);
    
    // Check for level up
    if (this.gameState.player.experience >= this.gameState.player.level * 100) {
      this.eventBus.emit('player.levelUp', { newLevel: this.gameState.player.level + 1 });
    }
  }

  private onQuestCompleted(data: any): void {
    console.log(`📜 Quest completed: ${data.questName}`);
  }

  async startGame(): Promise<void> {
    this.isRunning = true;
    console.log("\n🌟 Welcome to Simple RPG!");
    console.log(`You are ${this.gameState.player.name}, a level ${this.gameState.player.level} adventurer.`);
    console.log(`Location: ${this.gameState.currentLocation}`);
    console.log(`Health: ${this.gameState.player.health}/${this.gameState.player.maxHealth}`);
    console.log(`Gold: ${this.gameState.player.gold}`);
    
    // Simulate some gameplay
    await this.simulateGameplay();
  }

  private async simulateGameplay(): Promise<void> {
    console.log("\n🎯 Starting gameplay simulation...");
    
    // Simulate combat
    console.log("⚔️ A goblin appears!");
    this.eventBus.emit('combat.victory', { experience: 15, gold: 8 });
    
    // Simulate quest completion
    console.log("📜 You found a lost artifact!");
    this.eventBus.emit('quest.completed', { questName: "Lost Artifact" });
    
    // Show final stats
    console.log("\n📊 Final Stats:");
    console.log(`Level: ${this.gameState.player.level}`);
    console.log(`Health: ${this.gameState.player.health}/${this.gameState.player.maxHealth}`);
    console.log(`Experience: ${this.gameState.player.experience}`);
    console.log(`Gold: ${this.gameState.player.gold}`);
    
    this.isRunning = false;
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }
}

// Main execution
async function main() {
  const game = new SimpleRPG();
  
  try {
    await game.initialize();
    await game.startGame();
    console.log("\n🎮 Game completed successfully!");
  } catch (error) {
    console.error("💥 Game failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SimpleRPG };