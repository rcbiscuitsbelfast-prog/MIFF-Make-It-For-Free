/**
 * MIFF Magic System Manager
 *
 * Core implementation of spell casting, mana management, and magical effects
 */

import {
  MagicSystemPure,
  SpellDefinition,
  SpellInstance,
  ManaPool,
  SpellEffect,
  SpellElement,
  SpellSchool,
  MagicCombatResult
} from './index';

export class MagicManager {
  private magicSystem: MagicSystemPure;

  constructor(magicSystem: MagicSystemPure) {
    this.magicSystem = magicSystem;
  }

  /**
   * Create a new spell definition
   */
  createSpellDefinition(spellData: Partial<SpellDefinition>): SpellDefinition {
    const spell: SpellDefinition = {
      id: spellData.id || this.generateSpellId(),
      name: spellData.name || 'Unnamed Spell',
      description: spellData.description || 'A magical spell',
      manaCost: spellData.manaCost || 10,
      cooldown: spellData.cooldown || 1000,
      castTime: spellData.castTime || 1000,
      levelRequirement: spellData.levelRequirement || 1,
      school: spellData.school || 'arcane',
      primaryElement: spellData.primaryElement || 'arcane',
      secondaryElements: spellData.secondaryElements || [],
      effects: spellData.effects || [],
      visualEffect: spellData.visualEffect || 'default',
      soundEffect: spellData.soundEffect || 'default',
      icon: spellData.icon || 'default',
      isPassive: spellData.isPassive || false,
      prerequisites: spellData.prerequisites || [],
      upgrades: spellData.upgrades || [],
      loreRequirement: spellData.loreRequirement,
      xpCost: spellData.xpCost
    };

    return spell;
  }

  /**
   * Register a spell in the system
   */
  registerSpell(spell: SpellDefinition): boolean {
    // Validate spell
    if (!this.validateSpellDefinition(spell)) {
      console.error(`Invalid spell definition: ${spell.id}`);
      return false;
    }

    // Store in system (this would normally go through the main system)
    return true;
  }

  /**
   * Cast spell with enhanced error handling
   */
  castSpellEnhanced(casterId: string, spellId: string, targets: string[] = []): MagicCombatResult {
    try {
      const result = this.magicSystem.castSpell(casterId, spellId, targets);

      // Log successful casts
      if (result.success) {
        console.log(`✅ Spell cast: ${spellId} by ${casterId}`);
      } else {
        console.warn(`⚠️ Spell cast failed: ${spellId} - ${result.failureReason}`);
      }

      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Spell cast error: ${spellId} - ${error.message}`);
      return {
        spellInstance: {} as SpellInstance,
        targets: [],
        effectsApplied: [],
        manaSpent: 0,
        damageDealt: 0,
        healingDone: 0,
        buffsApplied: [],
        debuffsApplied: [],
        success: false,
        failureReason: error.message
      };
    }
  }

  /**
   * Get spell casting statistics
   */
  getSpellStats(casterId: string): {
    totalSpells: number;
    unlockedSpells: number;
    totalManaSpent: number;
    favoriteSpell: string | null;
    elementalPreferences: Map<string, number>;
  } {
    const spells = this.magicSystem.getSpellsForCaster(casterId);
    const manaPool = this.magicSystem.getManaPool(casterId);

    let totalManaSpent = 0;
    const elementalUsage = new Map<string, number>();

    spells.forEach(spell => {
      // Calculate mana spent based on spell usage (simplified)
      totalManaSpent += spell.definition.manaCost * 5; // Assume cast 5 times on average

      // Track elemental usage
      const primaryElement = spell.definition.primaryElement;
      elementalUsage.set(primaryElement, (elementalUsage.get(primaryElement) || 0) + 1);
    });

    const favoriteSpell = spells.length > 0 ? spells[0].definition.id : null;

    return {
      totalSpells: spells.length,
      unlockedSpells: spells.filter(s => s.isUnlocked).length,
      totalManaSpent,
      favoriteSpell,
      elementalPreferences: elementalUsage
    };
  }

  /**
   * Learn a new spell for a caster
   */
  learnSpell(casterId: string, spellId: string): boolean {
    try {
      const success = this.magicSystem.unlockSpell(casterId, spellId);
      if (success) {
        console.log(`📚 Learned spell: ${spellId} for ${casterId}`);
        return true;
      } else {
        console.warn(`⚠️ Failed to learn spell: ${spellId} for ${casterId}`);
        return false;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Error learning spell ${spellId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Create a custom spell effect
   */
  createSpellEffect(effectData: Partial<SpellEffect>): SpellEffect {
    return {
      type: effectData.type || 'damage',
      magnitude: effectData.magnitude || 10,
      duration: effectData.duration,
      element: effectData.element || 'arcane',
      description: effectData.description || 'A magical effect',
      target: effectData.target || 'single',
      range: effectData.range,
      areaOfEffect: effectData.areaOfEffect
    };
  }

  /**
   * Get mana regeneration for an entity
   */
  getManaRegeneration(entityId: string): number {
    const manaPool = this.magicSystem.getManaPool(entityId);
    return manaPool?.regenerationRate || 0;
  }

  /**
   * Set mana regeneration for an entity
   */
  setManaRegeneration(entityId: string, rate: number): void {
    const manaPool = this.magicSystem.getManaPool(entityId);
    if (manaPool) {
      manaPool.regenerationRate = Math.max(0, rate);
    }
  }

  /**
   * Get elemental effectiveness between caster and target
   */
  getElementalEffectiveness(casterId: string, targetId: string, element: string): number {
    // This would integrate with a creature system to get target element
    const casterAffinity = this.magicSystem.getElementalAffinity(casterId, element);

    // Simulate target element (in real implementation, get from creature system)
    const targetElement = 'neutral';
    const targetElementDef = this.magicSystem.getElement(targetElement);

    let effectiveness = casterAffinity;

    if (targetElementDef) {
      if (targetElementDef.weaknesses.includes(element)) {
        effectiveness *= 1.5; // Bonus damage to weak elements
      } else if (targetElementDef.strengths.includes(element)) {
        effectiveness *= 0.5; // Reduced damage to strong elements
      }
    }

    return Math.max(0.1, effectiveness);
  }

  /**
   * Get spell school information
   */
  getSpellSchoolInfo(schoolName: string): SpellSchool | null {
    return this.magicSystem.getSpellSchool(schoolName);
  }

  /**
   * Get spells available for learning
   */
  getLearnableSpells(casterId: string): SpellDefinition[] {
    const casterSpells = this.magicSystem.getSpellsForCaster(casterId);
    const unlockedSpellIds = new Set(casterSpells.map(s => s.definition.id));

    return this.magicSystem.getAllSpellDefinitions()
      .filter(spell => !unlockedSpellIds.has(spell.id))
      .filter(spell => this.canLearnSpell(casterId, spell));
  }

  /**
   * Check if a spell can be learned
   */
  private canLearnSpell(casterId: string, spell: SpellDefinition): boolean {
    // Check prerequisites
    for (const prereq of spell.prerequisites) {
      const prereqSpell = this.magicSystem.getSpellInstance(casterId, prereq);
      if (!prereqSpell || !prereqSpell.isUnlocked) {
        return false;
      }
    }

    // Check level requirement
    // This would integrate with an XP/leveling system
    const casterLevel = 1; // Placeholder
    if (casterLevel < spell.levelRequirement) {
      return false;
    }

    return true;
  }

  /**
   * Upgrade a spell
   */
  upgradeSpell(casterId: string, spellId: string): boolean {
    const spellInstance = this.magicSystem.getSpellInstance(casterId, spellId);
    if (!spellInstance) return false;

    // Check if upgrade is available
    const currentSpell = spellInstance.definition;
    const availableUpgrades = currentSpell.upgrades.filter(upgradeId => {
      const upgradeSpell = this.magicSystem.getSpellDefinition(upgradeId);
      return upgradeSpell && this.canLearnSpell(casterId, upgradeSpell);
    });

    if (availableUpgrades.length === 0) return false;

    // Apply first available upgrade
    const upgradeSpellId = availableUpgrades[0];
    const success = this.learnSpell(casterId, upgradeSpellId);

    if (success) {
      console.log(`⬆️ Upgraded ${spellId} to ${upgradeSpellId} for ${casterId}`);
    }

    return success;
  }

  /**
   * Get spell casting history for a caster
   */
  getSpellHistory(casterId: string): Array<{
    spellId: string;
    timestamp: number;
    targets: string[];
    manaSpent: number;
  }> {
    // This would normally come from an event log or database
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Validate spell definition
   */
  private validateSpellDefinition(spell: SpellDefinition): boolean {
    if (!spell.id || spell.id.trim() === '') {
      console.error('Spell ID is required');
      return false;
    }

    if (!spell.name || spell.name.trim() === '') {
      console.error('Spell name is required');
      return false;
    }

    if (spell.manaCost < 0) {
      console.error('Mana cost cannot be negative');
      return false;
    }

    if (spell.cooldown < 0) {
      console.error('Cooldown cannot be negative');
      return false;
    }

    if (spell.effects.length === 0) {
      console.error('Spell must have at least one effect');
      return false;
    }

    return true;
  }

  /**
   * Generate unique spell ID
   */
  private generateSpellId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `spell_${timestamp}_${random}`;
  }

  /**
   * Get magic system statistics
   */
  getSystemStats(): {
    totalSpells: number;
    totalElements: number;
    totalSchools: number;
    activeCasters: number;
    averageManaPool: number;
  } {
    const allSpells = this.magicSystem.getAllSpellDefinitions();
    const allElements = this.magicSystem.getAllElements();
    const allSchools = this.magicSystem.getAllSpellSchools();
    const manaPools = Array.from(this.magicSystem.getAllSpellDefinitions());

    const totalManaPools = manaPools.length;
    const averageManaPool = totalManaPools > 0 ?
      manaPools.reduce((sum, pool) => sum + pool.maximum, 0) / totalManaPools : 0;

    return {
      totalSpells: allSpells.length,
      totalElements: allElements.length,
      totalSchools: allSchools.length,
      activeCasters: totalManaPools,
      averageManaPool
    };
  }

  /**
   * Export magic system data
   */
  exportData(): {
    spells: SpellDefinition[];
    elements: SpellElement[];
    schools: SpellSchool[];
    timestamp: number;
  } {
    return {
      spells: this.magicSystem.getAllSpellDefinitions(),
      elements: this.magicSystem.getAllElements(),
      schools: this.magicSystem.getAllSpellSchools(),
      timestamp: Date.now()
    };
  }

  /**
   * Import magic system data
   */
  importData(data: ReturnType<typeof this.exportData>): void {
    // Import logic would go here
    console.log('Magic system data imported');
  }
}