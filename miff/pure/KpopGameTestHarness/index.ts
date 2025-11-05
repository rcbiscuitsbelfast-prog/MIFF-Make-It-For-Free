/**
 * KpopGameTestHarness - Integration Test Harness for K-pop Monster Hunter
 * 
 * Connects all core systems (Rhythm, Spirits, Teams, Shrines, Bosses) to
 * PixelWorld for immediate testing and gameplay validation.
 * 
 * @module KpopGameTestHarness
 * @version 1.0.0
 * @license MIT
 */

import { RhythmInputManager, RhythmInputType, RhythmDifficulty, IBeatMap, RhythmInputUtils } from '../RhythmInputPure/index';
import { RhythmBattleManager, RhythmBattleConfigBuilder, BattleTone } from '../RhythmBattleSystemPure/index';
import { ShrineManager, ShrineUtils, ShrineType, ElementType } from '../ShrineSystemPure/index';
import { BossPhaseManager, BossBuilder, BossPhaseUtils } from '../BossPhaseSystemPure/index';
import { Spirit, SpiritType, SpiritRarity, SpiritCollection, SpiritUtils } from '../SpiritsPure/index';
import { TeamManager, TeamOperationResult } from '../TeamsPure/index';

/**
 * Zone mapping from PixelWorld to K-pop game
 */
export const ZONE_MAPPING = {
  fantasy_grove: {
    kpopName: 'Tutorial Island',
    element: ElementType.LIGHT,
    difficulty: 'casual',
    description: 'K-pop idol retreat turned supernatural'
  },
  industrial_outpost: {
    kpopName: 'Fire Zone',
    element: ElementType.FIRE,
    difficulty: 'standard',
    description: 'Industrial wasteland infused with fire energy'
  },
  arcade_district: {
    kpopName: 'Water Zone',
    element: ElementType.WATER,
    difficulty: 'standard',
    description: 'Neon-lit arcade district with water spirits'
  },
  historical_plaza: {
    kpopName: 'Earth Zone',
    element: ElementType.EARTH,
    difficulty: 'standard',
    description: 'Ancient plaza with earth guardians'
  },
  export_terminal: {
    kpopName: 'Shadow Zone',
    element: ElementType.SHADOW,
    difficulty: 'expert',
    description: 'Dark terminal where shadow spirits dwell'
  }
} as const;

/**
 * Game state interface
 */
export interface IKpopGameState {
  currentZone: string;
  playerLevel: number;
  playerHP: number;
  playerMaxHP: number;
  spiritCollection: SpiritCollection;
  activeTeam: string[];
  completedShrines: string[];
  defeatedBosses: string[];
  totalCaptures: number;
  gameTime: number;
}

/**
 * K-pop Game Test Harness Manager
 */
export class KpopGameTestHarness {
  // Core systems
  private rhythmInput: RhythmInputManager;
  private shrineSystem: ShrineManager;
  private teamSystem: TeamManager;
  private spiritCollection: SpiritCollection;
  
  // Current battle systems (nullable)
  private activeBattle: RhythmBattleManager | null = null;
  private activeBoss: BossPhaseManager | null = null;
  
  // Game state
  private gameState: IKpopGameState;
  private playerTeamId: string;

  constructor(initialDifficulty: RhythmDifficulty = RhythmDifficulty.STANDARD) {
    // Initialize core systems
    this.rhythmInput = new RhythmInputManager(initialDifficulty);
    this.shrineSystem = new ShrineManager();
    this.teamSystem = new TeamManager();
    this.spiritCollection = new SpiritCollection();
    
    // Initialize player team
    this.playerTeamId = this.teamSystem.createTeam('player_team', 3);
    
    // Initialize game state
    this.gameState = {
      currentZone: 'fantasy_grove',
      playerLevel: 1,
      playerHP: 100,
      playerMaxHP: 100,
      spiritCollection: this.spiritCollection,
      activeTeam: [],
      completedShrines: [],
      defeatedBosses: [],
      totalCaptures: 0,
      gameTime: 0
    };
    
    // Setup initial shrines
    this.setupInitialShrines();
  }

  /**
   * Setup initial shrines in all zones
   */
  private setupInitialShrines(): void {
    // Tutorial Island (fantasy_grove)
    this.shrineSystem.registerShrine(
      ShrineUtils.createCampfireShrine('campfire_tutorial', 'fantasy_grove', 10, 10)
    );
    this.shrineSystem.registerShrine(
      ShrineUtils.createPrayerShrine('prayer_tutorial', 'Ancient Prayer', 'fantasy_grove', 20, 20, ['tutorial_lore'])
    );
    this.shrineSystem.registerShrine(
      ShrineUtils.createBossShrine('boss_tutorial', 'Idol Arena', 'fantasy_grove', 30, 30, 'boss_tutorial', 'rhythm_sequence')
    );
    
    // Fire Zone (industrial_outpost)
    this.shrineSystem.registerShrine(
      ShrineUtils.createElementalShrine('fire_shrine', 'Fire Shrine', 'industrial_outpost', 15, 15, ElementType.FIRE)
    );
    this.shrineSystem.registerShrine(
      ShrineUtils.createBossShrine('boss_fire', 'Fire Temple', 'industrial_outpost', 30, 30, 'boss_fire', 'elemental_alignment')
    );
    
    // Water Zone (arcade_district)
    this.shrineSystem.registerShrine(
      ShrineUtils.createElementalShrine('water_shrine', 'Water Shrine', 'arcade_district', 15, 15, ElementType.WATER)
    );
    
    // Earth Zone (historical_plaza)
    this.shrineSystem.registerShrine(
      ShrineUtils.createElementalShrine('earth_shrine', 'Earth Shrine', 'historical_plaza', 15, 15, ElementType.EARTH)
    );
    
    // Shadow Zone (export_terminal)
    this.shrineSystem.registerShrine(
      ShrineUtils.createElementalShrine('shadow_shrine', 'Shadow Shrine', 'export_terminal', 15, 15, ElementType.SHADOW)
    );
  }

  /**
   * Convert PixelWorld NPC to K-pop Spirit
   */
  convertNPCToSpirit(npcData: { id: string; name: string; zone: string; role?: string }): Spirit {
    const zoneMapping = ZONE_MAPPING[npcData.zone as keyof typeof ZONE_MAPPING];
    const element = zoneMapping?.element || ElementType.LIGHT;
    
    // Map element to spirit type
    const typeMapping: Record<ElementType, SpiritType> = {
      [ElementType.FIRE]: SpiritType.FIRE,
      [ElementType.WATER]: SpiritType.WATER,
      [ElementType.EARTH]: SpiritType.GROUND,
      [ElementType.AIR]: SpiritType.FLYING,
      [ElementType.LIGHT]: SpiritType.LIGHT,
      [ElementType.SHADOW]: SpiritType.SHADOW,
      [ElementType.DEATH]: SpiritType.DARK
    };
    
    // Determine rarity based on role
    let rarity = SpiritRarity.COMMON;
    if (npcData.role === 'boss') rarity = SpiritRarity.LEGENDARY;
    else if (npcData.role === 'elite') rarity = SpiritRarity.EPIC;
    else if (npcData.role === 'merchant') rarity = SpiritRarity.RARE;
    
    const spirit = Spirit.create(
      npcData.id,
      npcData.name,
      `A spirit from ${zoneMapping?.kpopName || npcData.zone}`,
      typeMapping[element],
      undefined,
      rarity
    );
    
    // Set initial stats based on rarity
    const baseStats = {
      [SpiritRarity.COMMON]: { hp: 50, attack: 30, defense: 25, speed: 40, specialAttack: 30, specialDefense: 25 },
      [SpiritRarity.UNCOMMON]: { hp: 60, attack: 40, defense: 35, speed: 50, specialAttack: 40, specialDefense: 35 },
      [SpiritRarity.RARE]: { hp: 80, attack: 55, defense: 45, speed: 60, specialAttack: 55, specialDefense: 45 },
      [SpiritRarity.EPIC]: { hp: 100, attack: 70, defense: 60, speed: 75, specialAttack: 75, specialDefense: 60 },
      [SpiritRarity.LEGENDARY]: { hp: 150, attack: 100, defense: 80, speed: 100, specialAttack: 110, specialDefense: 85 }
    };
    
    spirit.stats = baseStats[rarity] || baseStats[SpiritRarity.COMMON];
    spirit.currentHP = spirit.stats.hp;
    spirit.level = 5;
    
    return spirit;
  }

  /**
   * Test spirit capture sequence
   */
  async testCaptureSpirit(npcData: { id: string; name: string; zone: string; role?: string }): Promise<Spirit | null> {
    // Create beat map for capture
    const difficulty = ZONE_MAPPING[npcData.zone as keyof typeof ZONE_MAPPING]?.difficulty || 'standard';
    const beatMap = RhythmInputUtils.createCaptureBeatMap(
      difficulty === 'casual' ? RhythmDifficulty.CASUAL :
      difficulty === 'expert' ? RhythmDifficulty.EXPERT :
      RhythmDifficulty.STANDARD
    );
    
    // Load and start rhythm input
    this.rhythmInput.loadBeatMap(beatMap);
    this.rhythmInput.start();
    
    // Simulate capture attempt (70% accuracy required)
    // In real game, this would be driven by player input
    const success = this.rhythmInput.isSuccess(70);
    
    if (success) {
      const spirit = this.convertNPCToSpirit(npcData);
      spirit.captured = true;
      spirit.captureDate = new Date();
      spirit.syncLevel = 10;
      
      this.spiritCollection.spirits.push(spirit);
      this.gameState.totalCaptures++;
      
      return spirit;
    }
    
    return null;
  }

  /**
   * Add spirit to active team
   */
  addSpiritToTeam(spirit: Spirit): boolean {
    const result = this.teamSystem.addSpiritToTeam(this.playerTeamId, spirit as any);
    
    if (result === TeamOperationResult.SUCCESS) {
      const activeTeam = this.teamSystem.getActiveTeam(this.playerTeamId);
      this.gameState.activeTeam = activeTeam.map((s: any) => s.spiritId || s.id);
      return true;
    }
    
    return false;
  }

  /**
   * Start boss battle
   */
  startBossBattle(bossId: string, playerVoice: 'male' | 'female' = 'female'): boolean {
    // Create boss based on ID
    let bossConfig;
    if (bossId === 'boss_tutorial') {
      bossConfig = BossPhaseUtils.createTutorialBoss();
    } else {
      bossConfig = BossPhaseUtils.createThreePhaseBoss(bossId, `Boss ${bossId}`, 'shadow', 20);
    }
    
    this.activeBoss = new BossPhaseManager(bossConfig);
    
    // Create rhythm battle
    const battleConfig = new RhythmBattleConfigBuilder()
      .setBoss(bossConfig.id, bossConfig.name)
      .setPlayerVoice(playerVoice)
      .setBeatMap('boss_battle_beatmap')
      .addPhase({
        phaseNumber: 1,
        name: 'Phase 1',
        maxHP: 100,
        currentHP: 100,
        attackPattern: [],
        tone: BattleTone.SHADOW,
        rhythmDifficulty: 'standard',
        winMeterDecayRate: 2,
        requiredWinMeter: 100
      })
      .enableCrowdMorale(true)
      .build();
    
    this.activeBattle = new RhythmBattleManager(battleConfig);
    
    this.activeBoss.start();
    this.activeBattle.start();
    
    return true;
  }

  /**
   * Check if boss battle is won
   */
  isBossBattleWon(): boolean {
    return this.activeBattle?.isVictory() || false;
  }

  /**
   * Save at shrine
   */
  saveAtShrine(shrineId: string): boolean {
    return this.shrineSystem.saveAtShrine(shrineId, {
      playerData: {
        level: this.gameState.playerLevel,
        experience: 0,
        currentHP: this.gameState.playerHP,
        maxHP: this.gameState.playerMaxHP
      },
      spiritData: {
        activeTeam: this.gameState.activeTeam,
        totalCaptured: this.gameState.totalCaptures,
        totalSeen: this.spiritCollection.spirits.length
      },
      progressionData: {
        completedShrines: this.gameState.completedShrines,
        unlockedRegions: [this.gameState.currentZone],
        defeatedBosses: this.gameState.defeatedBosses,
        completedQuests: []
      },
      location: {
        zone: this.gameState.currentZone,
        x: 0,
        y: 0
      }
    });
  }

  /**
   * Get game state
   */
  getGameState(): IKpopGameState {
    return { ...this.gameState };
  }

  /**
   * Get spirit collection
   */
  getSpiritCollection(): SpiritCollection {
    return this.spiritCollection;
  }

  /**
   * Get active team
   */
  getActiveTeam(): any[] {
    return this.teamSystem.getActiveTeam(this.playerTeamId);
  }

  /**
   * Get rhythm input manager (for external integration)
   */
  getRhythmInput(): RhythmInputManager {
    return this.rhythmInput;
  }

  /**
   * Get shrine system (for external integration)
   */
  getShrineSystem(): ShrineManager {
    return this.shrineSystem;
  }

  /**
   * Update game loop (call each frame)
   */
  update(deltaTime: number): void {
    this.gameState.gameTime += deltaTime;
    
    if (this.activeBattle) {
      this.activeBattle.update(deltaTime);
    }
    
    if (this.activeBoss) {
      this.activeBoss.update(deltaTime);
    }
    
    this.shrineSystem.updateBuffs(deltaTime);
  }
}

/**
 * Create default test harness instance
 */
export function createKpopGameTestHarness(): KpopGameTestHarness {
  return new KpopGameTestHarness(RhythmDifficulty.STANDARD);
}

export default KpopGameTestHarness;
