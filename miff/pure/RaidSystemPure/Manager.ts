export type RaidDifficulty = 'normal' | 'heroic' | 'mythic' | 'legendary';

export type RaidBoss = {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  abilities: RaidAbility[];
  lootTable: LootEntry[];
  scalingFactor: number;
  metadata: Record<string, any>;
};

export type RaidAbility = {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  healing?: number;
  effects: RaidEffect[];
  targetType: 'self' | 'enemy' | 'ally' | 'all';
  range: number;
};

export type RaidEffect = {
  type: 'damage' | 'healing' | 'buff' | 'debuff' | 'stun' | 'shield';
  value: number;
  duration: number;
  stackable: boolean;
  description: string;
};

export type LootEntry = {
  itemId: string;
  dropRate: number; // 0-1
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requiredLevel: number;
};

export type RaidParty = {
  id: string;
  name: string;
  members: RaidMember[];
  averageLevel: number;
  totalHealth: number;
  totalDamage: number;
  buffs: RaidEffect[];
  debuffs: RaidEffect[];
};

export type RaidMember = {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  role: 'tank' | 'healer' | 'dps' | 'support';
  abilities: string[];
  position: { x: number; y: number };
};

export type RaidEncounter = {
  id: string;
  bossId: string;
  partyId: string;
  difficulty: RaidDifficulty;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'failed' | 'paused';
  currentPhase: number;
  totalPhases: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  events: RaidEvent[];
};

export type RaidEvent = {
  timestamp: number;
  type: 'damage' | 'healing' | 'ability' | 'death' | 'phase_change' | 'loot';
  source: string;
  target: string;
  value: number;
  description: string;
  metadata?: Record<string, any>;
};

export type RaidResult = {
  op: 'raidResult';
  status: 'success' | 'failure' | 'timeout';
  encounter: RaidEncounter;
  rewards: LootEntry[];
  statistics: RaidStatistics;
  duration: number;
};

export type RaidStatistics = {
  totalDamage: number;
  totalHealing: number;
  deaths: number;
  abilitiesUsed: number;
  phasesCompleted: number;
  efficiency: number; // 0-1
  performance: 'poor' | 'fair' | 'good' | 'excellent';
};

export class RaidManager {
  private bosses = new Map<string, RaidBoss>();
  private parties = new Map<string, RaidParty>();
  private encounters = new Map<string, RaidEncounter>();
  private scalingConfig: Record<RaidDifficulty, number> = {
    normal: 1.0,
    heroic: 1.5,
    mythic: 2.0,
    legendary: 3.0
  };

  // Boss Management
  createBoss(boss: RaidBoss): RaidBoss {
    this.bosses.set(boss.id, { ...boss });
    return boss;
  }

  getBoss(bossId: string): RaidBoss | null {
    return this.bosses.get(bossId) || null;
  }

  scaleBossForDifficulty(bossId: string, difficulty: RaidDifficulty): RaidBoss | null {
    const baseBoss = this.bosses.get(bossId);
    if (!baseBoss) return null;

    const scalingFactor = this.scalingConfig[difficulty!];
    const scaledBoss: RaidBoss = {
      ...baseBoss,
      level: Math.floor(baseBoss.level * scalingFactor),
      health: Math.floor(baseBoss.health * scalingFactor),
      maxHealth: Math.floor(baseBoss.maxHealth * scalingFactor),
      attack: Math.floor(baseBoss.attack * scalingFactor),
      defense: Math.floor(baseBoss.defense * scalingFactor),
      abilities: baseBoss.abilities.map((ability: any) => ({
        ...ability,
        damage: Math.floor(ability.damage * scalingFactor),
        healing: ability.healing ? Math.floor(ability.healing * scalingFactor) : undefined,
        effects: ability.effects.map((effect: any) => ({
          ...effect,
          value: Math.floor(effect.value * scalingFactor)
        }))
      })),
      scalingFactor
    };

    return scaledBoss;
  }

  // Party Management
  createParty(party: RaidParty): RaidParty {
    // Calculate party statistics
    const totalHealth = party.members.reduce((sum, member) => sum + member.maxHealth, 0);
    const totalDamage = party.members.reduce((sum, member) => sum + member.attack, 0);
    const averageLevel = party.members.reduce((sum, member) => sum + member.level, 0) / party.members.length;

    const enhancedParty: RaidParty = {
      ...party,
      totalHealth,
      totalDamage,
      averageLevel: Math.round(averageLevel * 100) / 100
    };

    this.parties.set(party.id, enhancedParty);
    return enhancedParty;
  }

  getParty(partyId: string): RaidParty | null {
    return this.parties.get(partyId) || null;
  }

  updatePartyMember(partyId: string, memberId: string, updates: Partial<RaidMember>): boolean {
    const party = this.parties.get(partyId);
    if (!party) return false;

    const memberIndex = party.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return false;

    party.members[memberIndex!] = { ...party.members[memberIndex!], ...updates };
    
    // Recalculate party statistics
    party.totalHealth = party.members.reduce((sum, member) => sum + member.maxHealth, 0);
    party.totalDamage = party.members.reduce((sum, member) => sum + member.attack, 0);
    party.averageLevel = party.members.reduce((sum, member) => sum + member.level, 0) / party.members.length;

    return true;
  }

  // Encounter Management
  startEncounter(bossId: string, partyId: string, difficulty: RaidDifficulty): RaidEncounter | null {
    const boss = this.scaleBossForDifficulty(bossId, difficulty);
    const party = this.parties.get(partyId);
    
    if (!boss || !party) return null;

    const encounter: RaidEncounter = {
      id: `encounter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bossId,
      partyId,
      difficulty,
      startTime: Date.now(),
      status: 'active',
      currentPhase: 1,
      totalPhases: this.calculatePhases(boss, party),
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      events: []
    };

    this.encounters.set(encounter.id, encounter);
    return encounter;
  }

  processEncounter(encounterId: string, events: RaidEvent[]): RaidEncounter | null {
    const encounter = this.encounters.get(encounterId);
    if (!encounter || encounter.status !== 'active') return null;

    // Process events
    for (const event of events) {
      encounter.events.push(event);
      
      switch (event.type) {
        case 'damage':
          encounter.damageDealt += event.value;
          break;
        case 'healing':
          encounter.healingDone += event.value;
          break;
        case 'death':
          // Handle member death
          break;
        case 'phase_change':
          encounter.currentPhase = event.value;
          break;
      }
    }

    // Check for encounter completion
    if (this.isEncounterComplete(encounter)) {
      encounter.status = 'completed';
      encounter.endTime = Date.now();
    } else if (this.isEncounterFailed(encounter)) {
      encounter.status = 'failed';
      encounter.endTime = Date.now();
    }

    return encounter;
  }

  completeEncounter(encounterId: string): RaidResult | null {
    const encounter = this.encounters.get(encounterId);
    if (!encounter || encounter.status !== 'completed') return null;

    const boss = this.bosses.get(encounter.bossId);
    const party = this.parties.get(encounter.partyId);
    
    if (!boss || !party) return null;

    const rewards = this.calculateLoot(boss, encounter);
    const statistics = this.calculateStatistics(encounter, party);
    const duration = encounter.endTime! - encounter.startTime;

    const result: RaidResult = {
      op: 'raidResult',
      status: 'success',
      encounter,
      rewards,
      statistics,
      duration
    };

    return result;
  }

  // Private Helper Methods
  private calculatePhases(boss: RaidBoss, party: RaidParty): number {
    // Calculate phases based on boss health and party strength
    const healthRatio = boss.maxHealth / party.totalHealth;
    return Math.max(1, Math.min(5, Math.floor(healthRatio / 0.2)));
  }

  private isEncounterComplete(encounter: RaidEncounter): boolean {
    // Simplified completion logic - in reality would check boss health
    return encounter.currentPhase >= encounter.totalPhases;
  }

  private isEncounterFailed(encounter: RaidEncounter): boolean {
    // Check if all party members are dead or encounter timeout
    const party = this.parties.get(encounter.partyId);
    if (!party) return true;

    const aliveMembers = party.members.filter((member: any) => member.health > 0);
    return aliveMembers.length === 0;
  }

  private calculateLoot(boss: RaidBoss, encounter: RaidEncounter): LootEntry[] {
    const rewards: LootEntry[] = [];
    
    for (const lootEntry of boss.lootTable) {
      const roll = Math.random();
      if (roll <= lootEntry.dropRate) {
        rewards.push({ ...lootEntry });
      }
    }

    return rewards;
  }

  private calculateStatistics(encounter: RaidEncounter, party: RaidParty): RaidStatistics {
    const deaths = encounter.events.filter((e: any) => e.type === 'death').length;
    const abilitiesUsed = encounter.events.filter((e: any) => e.type === 'ability').length;
    const phasesCompleted = encounter.currentPhase;
    
    const efficiency = encounter.damageDealt / (encounter.damageTaken + 1); // Avoid division by zero
    const performance = efficiency > 2 ? 'excellent' : 
                      efficiency > 1.5 ? 'good' : 
                      efficiency > 1 ? 'fair' : 'poor';

    return {
      totalDamage: encounter.damageDealt,
      totalHealing: encounter.healingDone,
      deaths,
      abilitiesUsed,
      phasesCompleted,
      efficiency: Math.min(1, efficiency),
      performance
    };
  }

  // Query Methods
  getEncounter(encounterId: string): RaidEncounter | null {
    return this.encounters.get(encounterId) || null;
  }

  getAllBosses(): RaidBoss[] {
    return Array.from(this.bosses.values());
  }

  getAllParties(): RaidParty[] {
    return Array.from(this.parties.values());
  }

  getActiveEncounters(): RaidEncounter[] {
    return Array.from(this.encounters.values()).filter((e: any) => e.status === 'active');
  }

  // Statistics
  getRaidStatistics(): {
    totalBosses: number;
    totalParties: number;
    totalEncounters: number;
    activeEncounters: number;
    completedEncounters: number;
    averageEncounterDuration: number;
  } {
    const encounters = Array.from(this.encounters.values());
    const completedEncounters = encounters.filter((e: any) => e.status === 'completed');
    const activeEncounters = encounters.filter((e: any) => e.status === 'active');
    
    const averageDuration = completedEncounters.length > 0
      ? completedEncounters.reduce((sum, e) => sum + (e.endTime! - e.startTime), 0) / completedEncounters.length
      : 0;

    return {
      totalBosses: this.bosses.size,
      totalParties: this.parties.size,
      totalEncounters: encounters.length,
      activeEncounters: activeEncounters.length,
      completedEncounters: completedEncounters.length,
      averageEncounterDuration: Math.round(averageDuration)
    };
  }

  // Export comprehensive raid statistics
  exportRaidStats(): {
    op: 'exportRaidStats';
    status: 'ok';
    data: {
      summary: {
        totalBosses: number;
        totalParties: number;
        totalEncounters: number;
        activeEncounters: number;
        completedEncounters: number;
        failedEncounters: number;
        averageEncounterDuration: number;
        totalDamageDealt: number;
        totalHealingDone: number;
        totalLootGenerated: number;
      };
      bosses: Array<{
        id: string;
        name: string;
        level: number;
        encounters: number;
        victories: number;
        defeats: number;
        averageEncounterDuration: number;
        lootGenerated: number;
      }>;
      parties: Array<{
        id: string;
        name: string;
        averageLevel: number;
        encounters: number;
        victories: number;
        defeats: number;
        totalDamageDealt: number;
        totalHealingDone: number;
        efficiency: number;
      }>;
      encounters: Array<{
        id: string;
        bossId: string;
        partyId: string;
        difficulty: RaidDifficulty;
        status: string;
        duration: number;
        damageDealt: number;
        healingDone: number;
        phasesCompleted: number;
        performance: string;
      }>;
      difficultyBreakdown: Record<RaidDifficulty, {
        encounters: number;
        victories: number;
        averageDuration: number;
        successRate: number;
      }>;
    };
    timestamp: number;
  } {
    const encounters = Array.from(this.encounters.values());
    const completedEncounters = encounters.filter((e: any) => e.status === 'completed');
    const failedEncounters = encounters.filter((e: any) => e.status === 'failed');
    const activeEncounters = encounters.filter((e: any) => e.status === 'active');

    // Calculate totals
    const totalDamageDealt = encounters.reduce((sum, e) => sum + e.damageDealt, 0);
    const totalHealingDone = encounters.reduce((sum, e) => sum + e.healingDone, 0);
    const averageDuration = completedEncounters.length > 0
      ? completedEncounters.reduce((sum, e) => sum + (e.endTime! - e.startTime), 0) / completedEncounters.length
      : 0;

    // Boss statistics
    const bossStats = Array.from(this.bosses.values()).map((boss: any) => {
      const bossEncounters = encounters.filter((e: any) => e.bossId === boss.id);
      const victories = bossEncounters.filter((e: any) => e.status === 'completed').length;
      const defeats = bossEncounters.filter((e: any) => e.status === 'failed').length;
      const avgDuration = victories > 0
        ? bossEncounters.filter((e: any) => e.status === 'completed')
            .reduce((sum, e) => sum + (e.endTime! - e.startTime), 0) / victories
        : 0;
      const lootGenerated = bossEncounters.filter((e: any) => e.status === 'completed').length * boss.lootTable.length;

      return {
        id: boss.id,
        name: boss.name,
        level: boss.level,
        encounters: bossEncounters.length,
        victories,
        defeats,
        averageEncounterDuration: Math.round(avgDuration),
        lootGenerated
      };
    });

    // Party statistics
    const partyStats = Array.from(this.parties.values()).map((party: any) => {
      const partyEncounters = encounters.filter((e: any) => e.partyId === party.id);
      const victories = partyEncounters.filter((e: any) => e.status === 'completed').length;
      const defeats = partyEncounters.filter((e: any) => e.status === 'failed').length;
      const totalDamage = partyEncounters.reduce((sum, e) => sum + e.damageDealt, 0);
      const totalHealing = partyEncounters.reduce((sum, e) => sum + e.healingDone, 0);
      const efficiency = totalHealing > 0 ? totalDamage / totalHealing : totalDamage;

      return {
        id: party.id,
        name: party.name,
        averageLevel: party.averageLevel,
        encounters: partyEncounters.length,
        victories,
        defeats,
        totalDamageDealt: totalDamage,
        totalHealingDone: totalHealing,
        efficiency: Math.round(efficiency * 100) / 100
      };
    });

    // Encounter details
    const encounterDetails = encounters.map((encounter: any) => {
      const duration = encounter.endTime ? encounter.endTime - encounter.startTime : 0;
      const efficiency = encounter.damageTaken > 0 ? encounter.damageDealt / encounter.damageTaken : encounter.damageDealt;
      const performance = efficiency > 2 ? 'excellent' : 
                        efficiency > 1.5 ? 'good' : 
                        efficiency > 1 ? 'fair' : 'poor';

      return {
        id: encounter.id,
        bossId: encounter.bossId,
        partyId: encounter.partyId,
        difficulty: encounter.difficulty,
        status: encounter.status,
        duration: Math.round(duration),
        damageDealt: encounter.damageDealt,
        healingDone: encounter.healingDone,
        phasesCompleted: encounter.currentPhase,
        performance
      };
    });

    // Difficulty breakdown
    const difficultyBreakdown: Record<RaidDifficulty, any> = {
      normal: { encounters: 0, victories: 0, averageDuration: 0, successRate: 0 },
      heroic: { encounters: 0, victories: 0, averageDuration: 0, successRate: 0 },
      mythic: { encounters: 0, victories: 0, averageDuration: 0, successRate: 0 },
      legendary: { encounters: 0, victories: 0, averageDuration: 0, successRate: 0 }
    };

    Object.keys(difficultyBreakdown).forEach((diff: any) => {
      const diffEncounters = encounters.filter((e: any) => e.difficulty === diff);
      const victories = diffEncounters.filter((e: any) => e.status === 'completed').length;
      const avgDuration = victories > 0
        ? diffEncounters.filter((e: any) => e.status === 'completed')
            .reduce((sum, e) => sum + (e.endTime! - e.startTime), 0) / victories
        : 0;
      const successRate = diffEncounters.length > 0 ? victories / diffEncounters.length : 0;

      difficultyBreakdown[diff as RaidDifficulty] = {
        encounters: diffEncounters.length,
        victories,
        averageDuration: Math.round(avgDuration),
        successRate: Math.round(successRate * 100) / 100
      };
    });

    return {
      op: 'exportRaidStats',
      status: 'ok',
      data: {
        summary: {
          totalBosses: this.bosses.size,
          totalParties: this.parties.size,
          totalEncounters: encounters.length,
          activeEncounters: activeEncounters.length,
          completedEncounters: completedEncounters.length,
          failedEncounters: failedEncounters.length,
          averageEncounterDuration: Math.round(averageDuration),
          totalDamageDealt,
          totalHealingDone,
          totalLootGenerated: completedEncounters.reduce((sum, e) => {
            const boss = this.bosses.get(e.bossId);
            return sum + (boss ? boss.lootTable.length : 0);
          }, 0)
        },
        bosses: bossStats,
        parties: partyStats,
        encounters: encounterDetails,
        difficultyBreakdown
      },
      timestamp: new Date()
    };
  }
}