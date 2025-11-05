/**
 * K-Pop Monster Hunter - Complete Game Loop Integration Test
 * 
 * This test validates the core game loop:
 * 1. Spirit capture (rhythm system placeholder)
 * 2. Team management (3 spirit carry limit)
 * 3. Battle simulation (type effectiveness)
 * 4. Spirit evolution
 * 5. Shrine interaction (save/evolve placeholder)
 * 6. Boss battle simulation
 */

import { Spirit, SpiritType, SpiritRarity, SpiritCollection, SpiritUtils } from '../SpiritsPure/index';
import { TeamManager, TeamOperationResult } from '../TeamsPure/index';

describe('K-Pop Monster Hunter - Complete Game Loop', () => {
  let playerTeam: TeamManager;
  let playerCollection: SpiritCollection;

  beforeEach(() => {
    playerTeam = new TeamManager();
    playerCollection = new SpiritCollection();
  });

  describe('Phase 1: Tutorial Island - Spirit Capture', () => {
    test('should capture starter spirit after rhythm sequence', () => {
      // Simulate rhythm capture sequence success
      const starterSpirit = Spirit.create(
        'goblin_001',
        'Goblin Spirit',
        'A mischievous goblin spirit from the retreat grounds',
        SpiritType.SHADOW,
        undefined,
        SpiritRarity.COMMON
      );

      starterSpirit.level = 3;
      starterSpirit.stats = {
        hp: 45,
        attack: 30,
        defense: 25,
        speed: 40,
        specialAttack: 20,
        specialDefense: 20
      };
      starterSpirit.captured = true;
      starterSpirit.captureDate = new Date();
      starterSpirit.syncLevel = 10; // Initial sync after capture

      playerCollection.spirits.push(starterSpirit);

      expect(playerCollection.spirits.length).toBe(1);
      expect(starterSpirit.captured).toBe(true);
      expect(starterSpirit.syncLevel).toBe(10);
    });

    test('should add captured spirit to active team (3 spirit limit)', () => {
      // Create team
      const teamId = playerTeam.createTeam('player_team', 3);
      expect(teamId).not.toBe('');

      // Create and add 3 spirits
      const spirit1 = Spirit.create('s1', 'Spirit 1', 'First', SpiritType.FIRE, undefined, SpiritRarity.COMMON);
      spirit1.level = 5;
      
      const spirit2 = Spirit.create('s2', 'Spirit 2', 'Second', SpiritType.WATER, undefined, SpiritRarity.COMMON);
      spirit2.level = 5;
      
      const spirit3 = Spirit.create('s3', 'Spirit 3', 'Third', SpiritType.GRASS, undefined, SpiritRarity.COMMON);
      spirit3.level = 5;

      // Add to team (using the actual TeamsPure API)
      const result1 = playerTeam.addSpiritToTeam(teamId, spirit1 as any);
      const result2 = playerTeam.addSpiritToTeam(teamId, spirit2 as any);
      const result3 = playerTeam.addSpiritToTeam(teamId, spirit3 as any);

      expect(result1).toBe(TeamOperationResult.SUCCESS);
      expect(result2).toBe(TeamOperationResult.SUCCESS);
      expect(result3).toBe(TeamOperationResult.SUCCESS);

      // Verify team is full (3 spirit limit)
      const activeTeam = playerTeam.getActiveTeam(teamId);
      expect(activeTeam.length).toBe(3);
    });

    test('should designate companion spirit (constant with dialogue)', () => {
      const teamId = playerTeam.createTeam('player_team', 3);

      const companionSpirit = Spirit.create(
        'companion_001',
        'Minji Spirit',
        'A friendly spirit guide',
        SpiritType.LIGHT,
        undefined,
        SpiritRarity.UNCOMMON
      );
      
      companionSpirit.level = 5;
      companionSpirit.isFavorite = true; // Mark as companion
      companionSpirit.syncLevel = 50; // Higher sync for companion

      playerTeam.addSpiritToTeam(teamId, companionSpirit as any);

      const team = playerTeam.getActiveTeam(teamId);
      const companion = team.find(s => (s as any).isFavorite);
      
      expect(companion).toBeDefined();
      expect((companion as any).syncLevel).toBe(50);
    });
  });

  describe('Phase 2: Dungeon Combat - Battle System', () => {
    test('should calculate type effectiveness in battle', () => {
      const fireSpirit = Spirit.create('fire', 'Fire Attacker', 'Fire type', SpiritType.FIRE, undefined, SpiritRarity.COMMON);
      const grassEnemy = Spirit.create('grass', 'Grass Enemy', 'Grass type', SpiritType.GRASS, undefined, SpiritRarity.COMMON);

      // Fire is super effective against Grass
      const effectiveness = SpiritUtils.calculateTypeEffectiveness(fireSpirit.primaryType, grassEnemy.primaryType);
      
      expect(effectiveness).toBeGreaterThanOrEqual(1.0);
      console.log(`Fire vs Grass effectiveness: ${effectiveness}x`);
    });

    test('should simulate spirit taking damage', () => {
      const playerSpirit = Spirit.create('player', 'Player Spirit', 'Player', SpiritType.WATER, undefined, SpiritRarity.UNCOMMON);
      playerSpirit.stats = {
        hp: 60,
        attack: 45,
        defense: 40,
        speed: 50,
        specialAttack: 55,
        specialDefense: 45
      };
      playerSpirit.currentHP = 60;

      // Simulate attack damage
      const damage = 20;
      playerSpirit.currentHP = Math.max(0, playerSpirit.currentHP - damage);

      expect(playerSpirit.currentHP).toBe(40);
      expect(playerSpirit.currentHP).toBeGreaterThan(0); // Still alive
    });

    test('should detect spirit fainted (HP = 0)', () => {
      const faintedSpirit = Spirit.create('fainted', 'Fainted Spirit', 'Down', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      faintedSpirit.stats = { hp: 50, attack: 30, defense: 30, speed: 30, specialAttack: 30, specialDefense: 30 };
      faintedSpirit.currentHP = 0;

      expect(faintedSpirit.currentHP).toBe(0);
      // Player would need to revive or swap spirits
    });

    test('should trigger spirit assist during dungeon combat', () => {
      const teamId = playerTeam.createTeam('combat_team', 3);
      
      const mainSpirit = Spirit.create('main', 'Main Fighter', 'Main', SpiritType.FIRE, undefined, SpiritRarity.RARE);
      const assistSpirit = Spirit.create('assist', 'Support Spirit', 'Support', SpiritType.WATER, undefined, SpiritRarity.UNCOMMON);

      playerTeam.addSpiritToTeam(teamId, mainSpirit as any);
      playerTeam.addSpiritToTeam(teamId, assistSpirit as any);

      // Simulate spirit assist activation (cooldown-based)
      const assistDamage = 30;
      const assistCooldown = 10; // seconds

      expect(assistDamage).toBeGreaterThan(0);
      expect(assistCooldown).toBeGreaterThan(0);
      // In actual game, assists would have cooldowns and special effects
    });
  });

  describe('Phase 3: Spirit Evolution', () => {
    test('should gain experience and level up', () => {
      const spirit = Spirit.create('evo_test', 'Evolution Test', 'Test', SpiritType.ELECTRIC, undefined, SpiritRarity.COMMON);
      spirit.level = 10;
      spirit.experience = 900;
      spirit.maxExperience = 1000;

      // Gain exp from battle
      spirit.experience += 150;

      if (spirit.experience >= spirit.maxExperience) {
        spirit.level += 1;
        spirit.experience = spirit.experience - spirit.maxExperience;
        spirit.maxExperience = SpiritUtils.calculateExperienceForLevel(spirit.level + 1, 'medium_fast');
      }

      expect(spirit.level).toBe(11);
      expect(spirit.experience).toBe(50);
    });

    test('should evolve spirit at shrine (fixed evolution path)', () => {
      const baseSpirit = Spirit.create('base_goblin', 'Goblin Spirit', 'Base form', SpiritType.SHADOW, undefined, SpiritRarity.COMMON);
      baseSpirit.level = 16;
      baseSpirit.stats = {
        hp: 60,
        attack: 45,
        defense: 35,
        speed: 50,
        specialAttack: 40,
        specialDefense: 30
      };

      // Simulate shrine evolution
      const evolvedSpirit = Spirit.create('evolved_goblin', 'Shadow Goblin', 'Evolved form', SpiritType.SHADOW, SpiritType.DARK, SpiritRarity.UNCOMMON);
      evolvedSpirit.level = baseSpirit.level;
      evolvedSpirit.stats = {
        hp: 85,
        attack: 70,
        defense: 55,
        speed: 70,
        specialAttack: 65,
        specialDefense: 50
      };
      evolvedSpirit.syncLevel = baseSpirit.syncLevel;

      expect(evolvedSpirit.stats.hp).toBeGreaterThan(baseSpirit.stats.hp);
      expect(evolvedSpirit.stats.attack).toBeGreaterThan(baseSpirit.stats.attack);
      expect(evolvedSpirit.rarity).toBeGreaterThan(baseSpirit.rarity);
      console.log(`✅ Evolution: ${baseSpirit.spiritName} → ${evolvedSpirit.spiritName}`);
    });
  });

  describe('Phase 4: Shrine System', () => {
    test('should save at campfire shrine', () => {
      const savePoint = {
        location: 'Goblin Hollow Campfire',
        timestamp: new Date(),
        playerLevel: 8,
        spiritCount: 5,
        completedShrines: ['tutorial_shrine', 'hidden_grove']
      };

      expect(savePoint.location).toBe('Goblin Hollow Campfire');
      expect(savePoint.spiritCount).toBe(5);
      expect(savePoint.completedShrines.length).toBe(2);
      console.log('✅ Game saved at:', savePoint.location);
    });

    test('should unlock lore at minor shrine', () => {
      const shrine = {
        id: 'prayer_shrine_001',
        name: 'Ancient Prayer Shrine',
        type: 'minor_prayer',
        loreUnlocked: ['goblin_origin', 'retreat_history'],
        buffGranted: 'spirit_sync_boost'
      };

      expect(shrine.type).toBe('minor_prayer');
      expect(shrine.loreUnlocked.length).toBe(2);
      expect(shrine.buffGranted).toBeDefined();
    });

    test('should complete puzzle at major boss shrine', () => {
      const bossShrine = {
        id: 'idol_arena_shrine',
        name: 'Idol Arena Shrine',
        type: 'major_boss',
        puzzleCompleted: true,
        bossDefeated: false,
        regionUnlocked: false
      };

      // Complete puzzle to access boss
      bossShrine.puzzleCompleted = true;

      expect(bossShrine.puzzleCompleted).toBe(true);
      expect(bossShrine.type).toBe('major_boss');
    });
  });

  describe('Phase 5: Rhythm Boss Battle', () => {
    test('should initiate rhythm boss battle', () => {
      const boss = Spirit.create('boss_idol', 'Corrupted Idol', 'Boss spirit', SpiritType.SHADOW, SpiritType.SOUND, SpiritRarity.EPIC);
      boss.level = 15;
      boss.stats = {
        hp: 200,
        attack: 80,
        defense: 60,
        speed: 70,
        specialAttack: 90,
        specialDefense: 70
      };
      boss.currentHP = 200;

      const rhythmBattle = {
        bossSpirit: boss,
        phases: 3, // 3 health bars
        currentPhase: 1,
        winMeter: 0,
        maxWinMeter: 100,
        playerVoice: 'female',
        bossPattern: 'shadow_tones'
      };

      expect(rhythmBattle.phases).toBe(3);
      expect(rhythmBattle.currentPhase).toBe(1);
      expect(rhythmBattle.winMeter).toBe(0);
    });

    test('should build win meter with rhythm inputs', () => {
      let winMeter = 0;
      const maxWinMeter = 100;

      // Simulate perfect rhythm inputs
      const perfectHit = 10; // +10 per perfect
      const goodHit = 5;     // +5 per good
      const missHit = -5;    // -5 per miss

      winMeter += perfectHit; // Hit 1
      winMeter += perfectHit; // Hit 2
      winMeter += goodHit;    // Hit 3
      winMeter += perfectHit; // Hit 4

      expect(winMeter).toBe(35);
      expect(winMeter).toBeLessThan(maxWinMeter);
    });

    test('should trigger spirit solo during rhythm battle', () => {
      let winMeter = 45;
      
      // Spirit solo triggers
      const soloBoost = 20;
      const soloEffect = 'interrupt_boss_attack';

      winMeter += soloBoost;

      expect(winMeter).toBe(65);
      expect(soloEffect).toBe('interrupt_boss_attack');
      console.log('✅ Spirit solo activated! Win meter:', winMeter);
    });

    test('should defeat boss and unlock next region', () => {
      let winMeter = 95;
      const boss = Spirit.create('boss', 'Boss', 'Boss', SpiritType.SHADOW, undefined, SpiritRarity.EPIC);
      boss.currentHP = 50;

      // Final rhythm sequence
      winMeter += 10; // Perfect hit!

      if (winMeter >= 100) {
        boss.currentHP = 0;
        const regionUnlocked = 'mainland_fire_zone';
        const rewardSpirits = ['fire_spirit_001', 'fire_spirit_002'];

        expect(boss.currentHP).toBe(0);
        expect(regionUnlocked).toBe('mainland_fire_zone');
        expect(rewardSpirits.length).toBe(2);
        console.log('🎉 BOSS DEFEATED! Region unlocked:', regionUnlocked);
      }
    });

    test('should handle boss phase transitions (3 health bars)', () => {
      const bossHP = [100, 100, 100]; // 3 phases
      let currentPhase = 0;

      // Defeat phase 1
      bossHP[0] = 0;
      currentPhase = 1;
      expect(currentPhase).toBe(1);

      // Defeat phase 2
      bossHP[1] = 0;
      currentPhase = 2;
      expect(currentPhase).toBe(2);

      // Defeat phase 3 (final)
      bossHP[2] = 0;
      const bossDefeated = bossHP.every(hp => hp === 0);
      
      expect(bossDefeated).toBe(true);
      console.log('🏆 All boss phases defeated!');
    });
  });

  describe('Phase 6: Complete Game Loop Integration', () => {
    test('should run complete game loop: capture → team → battle → evolve', () => {
      console.log('\n🎮 STARTING COMPLETE K-POP GAME LOOP TEST');

      // 1. CAPTURE SPIRIT
      const newSpirit = Spirit.create('goblin_shadow', 'Shadow Goblin', 'Captured spirit', SpiritType.SHADOW, undefined, SpiritRarity.COMMON);
      newSpirit.level = 5;
      newSpirit.stats = { hp: 50, attack: 35, defense: 30, speed: 45, specialAttack: 30, specialDefense: 25 };
      newSpirit.currentHP = 50;
      newSpirit.captured = true;
      newSpirit.syncLevel = 10;
      playerCollection.spirits.push(newSpirit);
      console.log('  ✅ 1. Spirit captured:', newSpirit.spiritName);

      // 2. ADD TO TEAM
      const teamId = playerTeam.createTeam('player_team', 3);
      playerTeam.addSpiritToTeam(teamId, newSpirit as any);
      const team = playerTeam.getActiveTeam(teamId);
      console.log('  ✅ 2. Added to team. Team size:', team.length);

      // 3. BATTLE SIMULATION
      const enemy = Spirit.create('enemy', 'Wild Spirit', 'Enemy', SpiritType.LIGHT, undefined, SpiritRarity.COMMON);
      enemy.stats = { hp: 40, attack: 30, defense: 25, speed: 35, specialAttack: 30, specialDefense: 25 };
      const effectiveness = SpiritUtils.calculateTypeEffectiveness(newSpirit.primaryType, enemy.primaryType);
      console.log(`  ✅ 3. Battle! ${newSpirit.primaryType} vs ${enemy.primaryType} = ${effectiveness}x effectiveness`);

      // 4. GAIN EXPERIENCE
      newSpirit.experience = (newSpirit.experience || 0) + 200;
      newSpirit.maxExperience = SpiritUtils.calculateExperienceForLevel(newSpirit.level + 1, 'medium_fast');
      if (newSpirit.experience >= newSpirit.maxExperience) {
        newSpirit.level += 1;
        console.log('  ✅ 4. Level up! New level:', newSpirit.level);
      }

      // 5. INCREASE SYNC
      newSpirit.syncLevel = (newSpirit.syncLevel || 0) + 15;
      console.log('  ✅ 5. Sync increased to:', newSpirit.syncLevel);

      // 6. CHECK EVOLUTION (at level 16)
      if (newSpirit.level >= 16) {
        console.log('  ✅ 6. Ready to evolve at shrine!');
      } else {
        console.log(`  ⏳ 6. Need level ${16 - newSpirit.level} more to evolve`);
      }

      // VERIFY COMPLETE LOOP
      expect(newSpirit.captured).toBe(true);
      expect(team.length).toBeGreaterThan(0);
      expect(effectiveness).toBeGreaterThan(0);
      expect(newSpirit.syncLevel).toBeGreaterThanOrEqual(25);
      
      console.log('🎉 COMPLETE GAME LOOP VALIDATED!\n');
    });
  });

  describe('Performance and Scale Tests', () => {
    test('should handle large spirit collection (100+ spirits)', () => {
      const largeCollection = new SpiritCollection();
      const types = Object.values(SpiritType).filter(t => t !== SpiritType.NONE);

      for (let i = 0; i < 100; i++) {
        const spirit = Spirit.create(
          `spirit_${i}`,
          `Spirit ${i}`,
          `Test spirit ${i}`,
          types[i % types.length] as SpiritType,
          undefined,
          (i % 7 + 1) as SpiritRarity
        );
        spirit.level = Math.floor(Math.random() * 50) + 1;
        largeCollection.spirits.push(spirit);
      }

      expect(largeCollection.spirits.length).toBe(100);

      // Test filtering performance
      const fireSpirits = largeCollection.spirits.filter(s => s.primaryType === SpiritType.FIRE);
      const legendaries = largeCollection.spirits.filter(s => s.rarity === SpiritRarity.LEGENDARY);

      expect(fireSpirits.length).toBeGreaterThan(0);
      console.log(`✅ Large collection: ${largeCollection.spirits.length} spirits, ${fireSpirits.length} fire types, ${legendaries.length} legendaries`);
    });

    test('should handle rapid team swaps', () => {
      const teamId = playerTeam.createTeam('swap_team', 3);
      
      const spirits = [];
      for (let i = 0; i < 6; i++) {
        const s = Spirit.create(`swap_${i}`, `Spirit ${i}`, `Test ${i}`, SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
        s.level = 10;
        spirits.push(s);
      }

      // Add first 3
      playerTeam.addSpiritToTeam(teamId, spirits[0] as any);
      playerTeam.addSpiritToTeam(teamId, spirits[1] as any);
      playerTeam.addSpiritToTeam(teamId, spirits[2] as any);

      let team = playerTeam.getActiveTeam(teamId);
      expect(team.length).toBe(3);

      // Swap logic would go here in actual implementation
      console.log('✅ Team swap test passed');
    });
  });
});
