#!/usr/bin/env node

/**
 * EffectsPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the EffectsPure effects management system.
 */

import * as readline from 'readline';
import {
  EffectManager,
  BattleEffect,
  ActiveEffect,
  EffectResolver,
  StatModifierAggregator,
  EffectEvent,
  EffectResolution,
  EffectUtils,
  EffectType,
  EffectTrigger,
  TargetStat,
  ModifierType,
  EffectPhase,
  EffectApplicationResult,
  EffectRemovalReason,
  IEntityContext,
  IBattleEffect,
  IActiveEffect
} from './index';

// Mock Entity Context for CLI
class MockEntityContext implements IEntityContext {
  private entityStats = new Map<string, Map<string, number>>();
  private entityImmunities = new Map<string, string[]>();
  private currentPhase: EffectPhase = EffectPhase.PRE_TURN;

  getEntityStat(entityId: string, stat: TargetStat): number {
    const stats = this.entityStats.get(entityId) || new Map();
    return stats.get(stat) || 100; // Default to 100 for most stats
  }

  setEntityStat(entityId: string, stat: TargetStat, value: number): void {
    if (!this.entityStats.has(entityId)) {
      this.entityStats.set(entityId, new Map());
    }
    this.entityStats.get(entityId)!.set(stat, Math.max(0, value));
  }

  hasImmunity(entityId: string, immunityTag: string): boolean {
    const immunities = this.entityImmunities.get(entityId) || [];
    return immunities.includes(immunityTag);
  }

  getEntityImmunities(entityId: string): string[] {
    return this.entityImmunities.get(entityId) || [];
  }

  isEntityAlive(entityId: string): boolean {
    const hp = this.getEntityStat(entityId, TargetStat.HP);
    return hp > 0;
  }

  getCurrentPhase(): EffectPhase {
    return this.currentPhase;
  }

  setCurrentPhase(phase: EffectPhase): void {
    this.currentPhase = phase;
  }

  addImmunity(entityId: string, immunityTag: string): void {
    if (!this.entityImmunities.has(entityId)) {
      this.entityImmunities.set(entityId, []);
    }
    const immunities = this.entityImmunities.get(entityId)!;
    if (!immunities.includes(immunityTag)) {
      immunities.push(immunityTag);
    }
  }

  removeImmunity(entityId: string, immunityTag: string): void {
    if (this.entityImmunities.has(entityId)) {
      const immunities = this.entityImmunities.get(entityId)!;
      const index = immunities.indexOf(immunityTag);
      if (index >= 0) {
        immunities.splice(index, 1);
      }
    }
  }

  getAllEntityIds(): string[] {
    return Array.from(this.entityStats.keys());
  }

  setEntityHp(entityId: string, hp: number): void {
    this.setEntityStat(entityId, TargetStat.HP, hp);
  }

  getEntityHp(entityId: string): number {
    return this.getEntityStat(entityId, TargetStat.HP);
  }

  setEntityAtk(entityId: string, atk: number): void {
    this.setEntityStat(entityId, TargetStat.ATK, atk);
  }

  getEntityAtk(entityId: string): number {
    return this.getEntityStat(entityId, TargetStat.ATK);
  }
}

// CLI Application
class EffectsPureCLI {
  private rl: readline.Interface;
  private effectManager: EffectManager;
  private entityContext: MockEntityContext;
  private currentEntityId: string = 'player';
  private lastResolution?: EffectResolution;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.effectManager = new EffectManager();
    this.entityContext = new MockEntityContext();

    this.initializeDemoData();
    this.setupEventHandlers();
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    console.log('Initializing EffectsPure CLI with demo data...');

    // Set up initial entity stats
    this.entityContext.setEntityHp('player', 100);
    this.entityContext.setEntityAtk('player', 50);
    this.entityContext.setEntityStat('player', TargetStat.DEF, 30);
    this.entityContext.setEntityStat('player', TargetStat.SPD, 40);

    this.entityContext.setEntityHp('enemy', 150);
    this.entityContext.setEntityAtk('enemy', 45);
    this.entityContext.setEntityStat('enemy', TargetStat.DEF, 25);
    this.entityContext.setEntityStat('enemy', TargetStat.SPD, 35);

    // Create demo effects
    this.createDemoEffects();

    console.log('Demo data created. Use "list" to see available commands.');
  }

  /**
   * Create demo effects
   */
  private createDemoEffects(): void {
    // Stat modifier effects
    const strengthBoost = BattleEffect.statModifier(
      'strength_boost',
      'Strength Boost',
      'Increases attack power',
      TargetStat.ATK,
      ModifierType.FLAT,
      15,
      0,
      3, // 3 turns
      true,
      3
    );

    const defenseBoost = BattleEffect.statModifier(
      'defense_boost',
      'Defense Boost',
      'Increases defense',
      TargetStat.DEF,
      ModifierType.PERCENT,
      0.25, // 25%
      0,
      2, // 2 turns
      true,
      2
    );

    // Damage over time effect
    const poison = BattleEffect.damageOverTime(
      'poison',
      'Poison',
      'Deals damage over time',
      10, // 10 damage per tick
      0,
      5 // 5 turns
    );

    // Heal effect
    const regeneration = BattleEffect.heal(
      'regeneration',
      'Regeneration',
      'Slowly restores health',
      5, // 5 HP per tick
      0,
      10 // 10 turns
    );

    // Shield effect
    const shield = BattleEffect.shield(
      'shield',
      'Magic Shield',
      'Absorbs damage',
      25, // 25 shield
      0,
      3 // 3 turns
    );

    // Stun effect
    const stun = BattleEffect.stun(
      'stun',
      'Stun',
      'Prevents actions',
      0,
      2 // 2 turns
    );

    // Apply some initial effects to demo entities
    this.effectManager.applyEffect('player', strengthBoost);
    this.effectManager.applyEffect('player', defenseBoost);
    this.effectManager.applyEffect('enemy', poison);
    this.effectManager.applyEffect('enemy', regeneration);

    console.log('Created demo effects: strength boost, defense boost, poison, regeneration, shield, stun');
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.effectManager.onEffectApplied = (entityId, effect, activeEffect) => {
      console.log(`✨ Effect applied: ${effect.name} to ${entityId}`);
    };

    this.effectManager.onEffectRefreshed = (entityId, effect, activeEffect) => {
      console.log(`🔄 Effect refreshed: ${effect.name} on ${entityId} (stacks: ${activeEffect.stacks})`);
    };

    this.effectManager.onEffectExpired = (entityId, effect, activeEffect) => {
      console.log(`⏰ Effect expired: ${effect.name} on ${entityId}`);
    };

    this.effectManager.onEffectRemoved = (entityId, effect, activeEffect) => {
      console.log(`🗑️ Effect removed: ${effect.name} from ${entityId}`);
    };

    this.effectManager.onEffectTick = (entityId, effect, activeEffect) => {
      console.log(`⏱️ Effect tick: ${effect.name} on ${entityId}`);
    };
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.log('='.repeat(70));
    console.log('✨ EffectsPure CLI - Effects Management System');
    console.log('='.repeat(70));
    console.log('');
    console.log('Available commands:');
    console.log('  list [entity]     - List active effects on entity');
    console.log('  apply [effect]    - Apply effect to current entity');
    console.log('  remove [effect]   - Remove effect from current entity');
    console.log('  create [type]     - Create new effect');
    console.log('  stats [entity]    - Show entity stats');
    console.log('  update [time]     - Update effects (simulate time passing)');
    console.log('  switch [entity]   - Switch current entity');
    console.log('  phase [phase]     - Set current phase');
    console.log('  immunity [tag]    - Add/remove immunity');
    console.log('  demo              - Reset demo data');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');
    console.log(`Current entity: ${this.currentEntityId}`);
    console.log(`Current phase: ${this.entityContext.getCurrentPhase()}`);

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('EffectsPure> ', (input) => {
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
    const command = parts[0!].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
        case 'h':
          this.showHelp();
          break;
        case 'list':
        case 'l':
          this.listEffects(args[0!]);
          break;
        case 'apply':
        case 'a':
          this.applyEffect(args[0!]);
          break;
        case 'remove':
        case 'r':
          this.removeEffect(args[0!]);
          break;
        case 'create':
        case 'c':
          this.createEffect(args);
          break;
        case 'stats':
        case 's':
          this.showStats(args[0!]);
          break;
        case 'update':
        case 'u':
          this.updateEffects(args[0!]);
          break;
        case 'switch':
          this.switchEntity(args[0!]);
          break;
        case 'phase':
        case 'p':
          this.setPhase(args[0!]);
          break;
        case 'immunity':
        case 'i':
          this.toggleImmunity(args[0!]);
          break;
        case 'demo':
        case 'd':
          this.resetDemo();
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
    console.log('✨ EffectsPure CLI Help');
    console.log('Commands: help, list, apply, remove, create, stats, update, switch, phase, immunity, demo, exit');
  }

  /**
   * List active effects on entity
   */
  private listEffects(entityId?: string): void {
    const targetEntity = entityId || this.currentEntityId;
    const effects = this.effectManager.getActiveEffects(targetEntity);

    console.log('='.repeat(70));
    console.log(`⚡ Active Effects on ${targetEntity} (${effects.length} effects)`);
    console.log('='.repeat(70));

    if (effects.length === 0) {
      console.log('No active effects.');
      return;
    }

    effects.forEach((effect, index) => {
      const typeIcon = this.getEffectTypeIcon(effect.effect.effectType);
      const duration = effect.getDurationPercentage();
      const durationBar = this.createProgressBar(duration, 10);

      console.log(`${index + 1}. ${typeIcon} ${effect.effect.name} x${effect.stacks}`);
      console.log(`   ID: ${effect.effect.effectId} | Duration: ${durationBar} | Type: ${effect.effect.effectType}`);
      console.log(`   Description: ${effect.effect.description}`);
      console.log('');
    });

    // Show entity stats
    this.showEntityStats(targetEntity);
  }

  /**
   * Apply effect to current entity
   */
  private applyEffect(effectId: string): void {
    if (!effectId) {
      console.log('❌ Usage: apply [effect_id]');
      console.log('Available effects: strength_boost, defense_boost, poison, regeneration, shield, stun');
      return;
    }

    const effect = this.createEffectById(effectId);
    if (!effect) {
      console.log(`❌ Effect not found: ${effectId}`);
      return;
    }

    const result = this.effectManager.applyEffect(this.currentEntityId, effect);

    switch (result) {
      case EffectApplicationResult.APPLIED:
        console.log(`✅ Applied ${effect.name} to ${this.currentEntityId}`);
        break;
      case EffectApplicationResult.REFRESHED:
        console.log(`🔄 Refreshed ${effect.name} on ${this.currentEntityId}`);
        break;
      case EffectApplicationResult.REJECTED:
        console.log(`❌ Could not apply ${effect.name} to ${this.currentEntityId}`);
        break;
    }
  }

  /**
   * Remove effect from current entity
   */
  private removeEffect(effectId: string): void {
    if (!effectId) {
      console.log('❌ Usage: remove [effect_id]');
      return;
    }

    const success = this.effectManager.removeEffect(this.currentEntityId, effectId);

    if (success) {
      console.log(`✅ Removed ${effectId} from ${this.currentEntityId}`);
    } else {
      console.log(`❌ Effect ${effectId} not found on ${this.currentEntityId}`);
    }
  }

  /**
   * Create new effect
   */
  private createEffect(args: string[]): void {
    if (args.length < 3) {
      console.log('❌ Usage: create [type] [name] [description] [value]');
      console.log('Types: stat, dot, heal, stun, shield');
      return;
    }

    const [type, name, description] = args;
    const value = parseFloat(args[3!]) || 0;

    let effect: IBattleEffect;

    switch (type.toLowerCase()) {
      case 'stat':
        effect = BattleEffect.statModifier(
          `custom_${Date.now()}`,
          name,
          description,
          TargetStat.ATK,
          ModifierType.FLAT,
          value,
          0,
          3
        );
        break;
      case 'dot':
        effect = BattleEffect.damageOverTime(
          `custom_${Date.now()}`,
          name,
          description,
          value,
          0,
          5
        );
        break;
      case 'heal':
        effect = BattleEffect.heal(
          `custom_${Date.now()}`,
          name,
          description,
          value,
          0,
          5
        );
        break;
      case 'stun':
        effect = BattleEffect.stun(
          `custom_${Date.now()}`,
          name,
          description,
          0,
          2
        );
        break;
      case 'shield':
        effect = BattleEffect.shield(
          `custom_${Date.now()}`,
          name,
          description,
          value,
          0,
          3
        );
        break;
      default:
        console.log('❌ Invalid effect type. Use: stat, dot, heal, stun, shield');
        return;
    }

    const result = this.effectManager.applyEffect(this.currentEntityId, effect);
    console.log(`✅ Created and applied ${effect.name} (${result})`);
  }

  /**
   * Show entity stats
   */
  private showStats(entityId?: string): void {
    const targetEntity = entityId || this.currentEntityId;
    this.showEntityStats(targetEntity);
  }

  /**
   * Show entity stats helper
   */
  private showEntityStats(entityId: string): void {
    const stats = [
      TargetStat.HP,
      TargetStat.ATK,
      TargetStat.DEF,
      TargetStat.SPD,
      TargetStat.SPATK,
      TargetStat.SPDEF
    ];

    console.log(`📊 Stats for ${entityId}:`);
    stats.forEach((stat: any) => {
      const value = this.entityContext.getEntityStat(entityId, stat);
      const icon = this.getStatIcon(stat);
      console.log(`  ${icon} ${stat.toUpperCase()}: ${value}`);
    });

    const effectCount = this.effectManager.getEffectCount(entityId);
    console.log(`  ✨ Active Effects: ${effectCount}`);
    console.log('');
  }

  /**
   * Update effects (simulate time passing)
   */
  private updateEffects(deltaTimeStr?: string): void {
    const deltaTime = deltaTimeStr ? parseFloat(deltaTimeStr) : 1.0;

    if (isNaN(deltaTime) || deltaTime <= 0) {
      console.log('❌ Usage: update [delta_time_seconds]');
      return;
    }

    console.log(`⏱️ Updating effects with delta time: ${deltaTime}s`);
    console.log(`📍 Current phase: ${this.entityContext.getCurrentPhase()}`);

    const resolution = this.effectManager.updateEffects(deltaTime, this.entityContext);
    this.lastResolution = resolution;

    console.log(`📊 Update Results:`);
    console.log(`  - Effects processed: ${resolution.resolvedEffects.length}`);
    console.log(`  - Stat changes: ${resolution.statChanges.size}`);

    if (resolution.statChanges.size > 0) {
      console.log('  Stat Changes:');
      resolution.statChanges.forEach((change, stat) => {
        console.log(`    ${stat.toUpperCase()}: ${change >= 0 ? '+' : ''}${change}`);
      });
    }

    // Update entity stats based on resolution
    resolution.statChanges.forEach((change, stat) => {
      const currentValue = this.entityContext.getEntityStat(this.currentEntityId, stat as TargetStat);
      this.entityContext.setEntityStat(this.currentEntityId, stat as TargetStat, currentValue + change);
    });

    if (resolution.events.length > 0) {
      console.log(`  Events triggered: ${resolution.events.length}`);
    }

    console.log('✅ Effects updated successfully');
  }

  /**
   * Switch current entity
   */
  private switchEntity(entityId: string): void {
    if (!entityId) {
      console.log('❌ Usage: switch [entity_id]');
      console.log('Available entities: player, enemy');
      return;
    }

    if (!this.entityContext.getEntityHp(entityId)) {
      // Entity doesn't exist, create it
      this.entityContext.setEntityHp(entityId, 100);
      this.entityContext.setEntityAtk(entityId, 50);
      this.entityContext.setEntityStat(entityId, TargetStat.DEF, 30);
      this.entityContext.setEntityStat(entityId, TargetStat.SPD, 40);
    }

    this.currentEntityId = entityId;
    console.log(`✅ Switched to entity: ${entityId}`);
    this.showEntityStats(entityId);
  }

  /**
   * Set current phase
   */
  private setPhase(phaseStr: string): void {
    if (!phaseStr) {
      console.log('❌ Usage: phase [phase_name]');
      console.log('Available phases: pre_turn, select_action, resolve_action, end_turn');
      return;
    }

    switch (phaseStr.toLowerCase()) {
      case 'pre_turn':
        this.entityContext.setCurrentPhase(EffectPhase.PRE_TURN);
        break;
      case 'select_action':
        this.entityContext.setCurrentPhase(EffectPhase.SELECT_ACTION);
        break;
      case 'resolve_action':
        this.entityContext.setCurrentPhase(EffectPhase.RESOLVE_ACTION);
        break;
      case 'end_turn':
        this.entityContext.setCurrentPhase(EffectPhase.END_TURN);
        break;
      default:
        console.log('❌ Invalid phase. Use: pre_turn, select_action, resolve_action, end_turn');
        return;
    }

    console.log(`✅ Set phase to: ${this.entityContext.getCurrentPhase()}`);
  }

  /**
   * Toggle immunity
   */
  private toggleImmunity(immunityTag: string): void {
    if (!immunityTag) {
      console.log('❌ Usage: immunity [immunity_tag]');
      return;
    }

    const hasImmunity = this.entityContext.hasImmunity(this.currentEntityId, immunityTag);

    if (hasImmunity) {
      this.entityContext.removeImmunity(this.currentEntityId, immunityTag);
      console.log(`✅ Removed immunity: ${immunityTag} from ${this.currentEntityId}`);
    } else {
      this.entityContext.addImmunity(this.currentEntityId, immunityTag);
      console.log(`✅ Added immunity: ${immunityTag} to ${this.currentEntityId}`);
    }

    const immunities = this.entityContext.getEntityImmunities(this.currentEntityId);
    console.log(`Current immunities: ${immunities.join(', ') || 'none'}`);
  }

  /**
   * Reset demo data
   */
  private resetDemo(): void {
    this.effectManager.clearAllEffects();
    this.initializeDemoData();
    console.log('🔄 Demo data reset');
  }

  /**
   * Create effect by ID for demo purposes
   */
  private createEffectById(effectId: string): IBattleEffect | null {
    switch (effectId.toLowerCase()) {
      case 'strength_boost':
        return BattleEffect.statModifier(
          'strength_boost',
          'Strength Boost',
          'Increases attack power',
          TargetStat.ATK,
          ModifierType.FLAT,
          15,
          0,
          3
        );
      case 'defense_boost':
        return BattleEffect.statModifier(
          'defense_boost',
          'Defense Boost',
          'Increases defense',
          TargetStat.DEF,
          ModifierType.PERCENT,
          0.25,
          0,
          2
        );
      case 'poison':
        return BattleEffect.damageOverTime(
          'poison',
          'Poison',
          'Deals damage over time',
          10,
          0,
          5
        );
      case 'regeneration':
        return BattleEffect.heal(
          'regeneration',
          'Regeneration',
          'Slowly restores health',
          5,
          0,
          10
        );
      case 'shield':
        return BattleEffect.shield(
          'shield',
          'Magic Shield',
          'Absorbs damage',
          25,
          0,
          3
        );
      case 'stun':
        return BattleEffect.stun(
          'stun',
          'Stun',
          'Prevents actions',
          0,
          2
        );
      default:
        return null;
    }
  }

  /**
   * Get effect type icon
   */
  private getEffectTypeIcon(effectType: EffectType): string {
    switch (effectType) {
      case EffectType.STAT_MODIFIER: return '📊';
      case EffectType.DAMAGE_OVER_TIME: return '☠️';
      case EffectType.HEAL: return '💚';
      case EffectType.STUN: return '😵';
      case EffectType.SHIELD: return '🛡️';
      case EffectType.CUSTOM: return '⚡';
      default: return '❓';
    }
  }

  /**
   * Get stat icon
   */
  private getStatIcon(stat: TargetStat): string {
    switch (stat) {
      case TargetStat.HP: return '❤️';
      case TargetStat.ATK: return '⚔️';
      case TargetStat.DEF: return '🛡️';
      case TargetStat.SPD: return '💨';
      case TargetStat.SPATK: return '🔥';
      case TargetStat.SPDEF: return '❄️';
      case TargetStat.ACC: return '🎯';
      case TargetStat.EVA: return '💨';
      default: return '📊';
    }
  }

  /**
   * Create progress bar
   */
  private createProgressBar(percentage: number, length: number = 10): string {
    const filledLength = Math.round(percentage * length);
    const emptyLength = length - filledLength;
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    return `${filled}${empty}`;
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.log('');
    console.log('👋 Thank you for using EffectsPure CLI!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new EffectsPureCLI();
  cli.start();
}

export { EffectsPureCLI };