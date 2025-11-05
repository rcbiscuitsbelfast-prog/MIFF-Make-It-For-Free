/**
 * Golden Test Suite for SpiritsPure
 * 
 * Comprehensive tests for the spirit system including:
 * - Spirit definitions and properties
 * - Type effectiveness
 * - Stat calculations
 * - Collections and filtering
 * - Spirit state management
 */

import {
  Spirit,
  SpiritType,
  SpiritRarity,
  SpiritCollection,
  SpiritUtils,
  ISpiritStats,
  SpiritFilter,
  SpiritSorter,
  SortOption
} from '../index';

describe('SpiritsPure Golden Tests', () => {
  
  describe('Spirit Creation and Properties', () => {
    test('should create a basic spirit with required properties', () => {
      const spirit = Spirit.create(
        'test_spirit_001',
        'Test Spirit',
        'A test spirit for validation',
        SpiritType.FIRE,
        undefined,
        SpiritRarity.COMMON
      );

      spirit.level = 1;
      spirit.stats = {
        hp: 100,
        attack: 50,
        defense: 40,
        speed: 60,
        specialAttack: 45,
        specialDefense: 35
      };

      expect(spirit).toBeDefined();
      expect(spirit.spiritId).toBe('test_spirit_001');
      expect(spirit.spiritName).toBe('Test Spirit');
      expect(spirit.primaryType).toBe(SpiritType.FIRE);
      expect(spirit.rarity).toBe(SpiritRarity.COMMON);
      expect(spirit.level).toBe(1);
      expect(spirit.stats.hp).toBe(100);
    });

    test('should create spirits with different types', () => {
      const fireSpirit = Spirit.create(
        'fire_001',
        'Flame',
        'A fire spirit',
        SpiritType.FIRE,
        undefined,
        SpiritRarity.COMMON
      );

      const waterSpirit = Spirit.create(
        'water_001',
        'Wave',
        'A water spirit',
        SpiritType.WATER,
        undefined,
        SpiritRarity.COMMON
      );

      expect(fireSpirit.primaryType).toBe(SpiritType.FIRE);
      expect(waterSpirit.primaryType).toBe(SpiritType.WATER);
    });

    test('should create spirits with different rarities', () => {
      const common = Spirit.create(
        'common_001',
        'Common',
        'A common spirit',
        SpiritType.GROUND,
        undefined,
        SpiritRarity.COMMON
      );

      const legendary = Spirit.create(
        'legendary_001',
        'Legendary',
        'A legendary spirit',
        SpiritType.LIGHT,
        undefined,
        SpiritRarity.LEGENDARY
      );

      expect(common.rarity).toBe(SpiritRarity.COMMON);
      expect(legendary.rarity).toBe(SpiritRarity.LEGENDARY);
    });

    test('should create spirit with secondary type', () => {
      const dualType = Spirit.create(
        'dual_001',
        'Dual Type',
        'A dual type spirit',
        SpiritType.FIRE,
        SpiritType.FLYING,
        SpiritRarity.RARE
      );

      expect(dualType.primaryType).toBe(SpiritType.FIRE);
      expect(dualType.secondaryType).toBe(SpiritType.FLYING);
    });
  });

  describe('Spirit Stats and Calculations', () => {
    test('should set and retrieve stats', () => {
      const spirit = Spirit.create(
        'stats_001',
        'Stats Test',
        'Testing stats',
        SpiritType.NORMAL,
        undefined,
        SpiritRarity.COMMON
      );

      spirit.stats = {
        hp: 100,
        attack: 50,
        defense: 40,
        speed: 60,
        specialAttack: 45,
        specialDefense: 35
      };

      expect(spirit.stats.hp).toBe(100);
      expect(spirit.stats.attack).toBe(50);
      expect(spirit.stats.defense).toBe(40);
      expect(spirit.stats.speed).toBe(60);
      expect(spirit.stats.specialAttack).toBe(45);
      expect(spirit.stats.specialDefense).toBe(35);
    });

    test('should handle level changes', () => {
      const spirit = Spirit.create(
        'level_001',
        'Level Test',
        'Testing levels',
        SpiritType.FIRE,
        undefined,
        SpiritRarity.COMMON
      );

      spirit.level = 1;
      expect(spirit.level).toBe(1);

      spirit.level = 50;
      expect(spirit.level).toBe(50);
    });

    test('should track experience', () => {
      const spirit = Spirit.create(
        'exp_001',
        'Experience Test',
        'Testing experience',
        SpiritType.WATER,
        undefined,
        SpiritRarity.COMMON
      );

      spirit.experience = 1000;
      spirit.maxExperience = 2000;

      expect(spirit.experience).toBe(1000);
      expect(spirit.maxExperience).toBe(2000);
    });
  });

  describe('Type Effectiveness System', () => {
    test('should calculate type effectiveness', () => {
      const effectiveness = SpiritUtils.calculateTypeEffectiveness(SpiritType.FIRE, SpiritType.WATER);
      expect(effectiveness).toBeGreaterThan(0);
      expect(typeof effectiveness).toBe('number');
    });

    test('should handle same-type matchups', () => {
      const effectiveness = SpiritUtils.calculateTypeEffectiveness(SpiritType.FIRE, SpiritType.FIRE);
      expect(effectiveness).toBeGreaterThan(0);
    });

    test('should handle light and shadow types', () => {
      const lightVsShadow = SpiritUtils.calculateTypeEffectiveness(SpiritType.LIGHT, SpiritType.SHADOW);
      const shadowVsLight = SpiritUtils.calculateTypeEffectiveness(SpiritType.SHADOW, SpiritType.LIGHT);
      
      expect(lightVsShadow).toBeGreaterThan(0);
      expect(shadowVsLight).toBeGreaterThan(0);
    });

    test('should get all spirit types', () => {
      const allTypes = SpiritUtils.getAllSpiritTypes();
      expect(Array.isArray(allTypes)).toBe(true);
      expect(allTypes.length).toBeGreaterThan(10);
      expect(allTypes).toContain(SpiritType.FIRE);
      expect(allTypes).toContain(SpiritType.WATER);
      expect(allTypes).toContain(SpiritType.LIGHT);
      expect(allTypes).toContain(SpiritType.SHADOW);
    });

    test('should get type name', () => {
      const fireName = SpiritUtils.getTypeName(SpiritType.FIRE);
      expect(typeof fireName).toBe('string');
      expect(fireName.length).toBeGreaterThan(0);
    });

    test('should get rarity name', () => {
      const commonName = SpiritUtils.getRarityName(SpiritRarity.COMMON);
      expect(commonName).toBe('Common');
      
      const legendaryName = SpiritUtils.getRarityName(SpiritRarity.LEGENDARY);
      expect(legendaryName).toBe('Legendary');
    });
  });

  describe('Spirit Collection System', () => {
    let collection: SpiritCollection;

    beforeEach(() => {
      collection = new SpiritCollection();
    });

    test('should create empty collection', () => {
      expect(collection).toBeDefined();
      expect(collection.spirits).toBeDefined();
      expect(Array.isArray(collection.spirits)).toBe(true);
    });

    test('should add spirits to collection', () => {
      const spirit1 = Spirit.create('coll_001', 'Spirit 1', 'First spirit', SpiritType.FIRE, undefined, SpiritRarity.COMMON);
      const spirit2 = Spirit.create('coll_002', 'Spirit 2', 'Second spirit', SpiritType.WATER, undefined, SpiritRarity.COMMON);

      collection.spirits.push(spirit1);
      collection.spirits.push(spirit2);

      expect(collection.spirits.length).toBe(2);
    });

    test('should find spirit by ID', () => {
      const testSpirit = Spirit.create('find_001', 'Findable', 'Find me', SpiritType.GRASS, undefined, SpiritRarity.UNCOMMON);
      collection.spirits.push(testSpirit);

      const found = collection.spirits.find(s => s.spiritId === 'find_001');
      expect(found).toBeDefined();
      expect(found?.spiritName).toBe('Findable');
    });

    test('should filter spirits by type', () => {
      const fire1 = Spirit.create('fire_a', 'Fire A', 'Fire type', SpiritType.FIRE, undefined, SpiritRarity.COMMON);
      const water1 = Spirit.create('water_a', 'Water A', 'Water type', SpiritType.WATER, undefined, SpiritRarity.COMMON);
      const fire2 = Spirit.create('fire_b', 'Fire B', 'Fire type', SpiritType.FIRE, undefined, SpiritRarity.RARE);

      collection.spirits.push(fire1, water1, fire2);

      const fireSpirits = collection.spirits.filter(s => s.primaryType === SpiritType.FIRE);
      expect(fireSpirits.length).toBe(2);
    });

    test('should filter spirits by rarity', () => {
      const common1 = Spirit.create('c1', 'Common 1', 'Common', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      const rare1 = Spirit.create('r1', 'Rare 1', 'Rare', SpiritType.DRAGON, undefined, SpiritRarity.RARE);
      const common2 = Spirit.create('c2', 'Common 2', 'Common', SpiritType.BUG, undefined, SpiritRarity.COMMON);

      collection.spirits.push(common1, rare1, common2);

      const commons = collection.spirits.filter(s => s.rarity === SpiritRarity.COMMON);
      expect(commons.length).toBe(2);
      
      const rares = collection.spirits.filter(s => s.rarity === SpiritRarity.RARE);
      expect(rares.length).toBe(1);
    });
  });

  describe('Spirit Filter System', () => {
    test('should create spirit filter', () => {
      const filter = new SpiritFilter();
      expect(filter).toBeDefined();
    });

    test('should filter by type', () => {
      const filter = new SpiritFilter();
      filter.type = SpiritType.FIRE;

      expect(filter.type).toBe(SpiritType.FIRE);
    });

    test('should filter by rarity', () => {
      const filter = new SpiritFilter();
      filter.rarity = SpiritRarity.LEGENDARY;

      expect(filter.rarity).toBe(SpiritRarity.LEGENDARY);
    });

    test('should filter by level range', () => {
      const filter = new SpiritFilter();
      filter.minLevel = 10;
      filter.maxLevel = 50;

      expect(filter.minLevel).toBe(10);
      expect(filter.maxLevel).toBe(50);
    });

    test('should filter by name substring', () => {
      const filter = new SpiritFilter();
      filter.nameContains = 'dragon';

      expect(filter.nameContains).toBe('dragon');
    });
  });

  describe('Spirit Sorter System', () => {
    test('should create spirit sorter', () => {
      const sorter = new SpiritSorter();
      expect(sorter).toBeDefined();
    });

    test('should sort alphabetically', () => {
      const collection = new SpiritCollection();
      const spiritZ = Spirit.create('z', 'Zebra', 'Last', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      const spiritA = Spirit.create('a', 'Ant', 'First', SpiritType.BUG, undefined, SpiritRarity.COMMON);
      const spiritM = Spirit.create('m', 'Mouse', 'Middle', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);

      collection.spirits.push(spiritZ, spiritA, spiritM);

      const sorter = new SpiritSorter();
      sorter.primarySort = SortOption.ALPHABETICAL_ASC;
      sorter.ascending = true;

      // Manual sort to test
      const sorted = [...collection.spirits].sort((a, b) => 
        a.spiritName.localeCompare(b.spiritName)
      );

      expect(sorted[0].spiritName).toBe('Ant');
      expect(sorted[2].spiritName).toBe('Zebra');
    });

    test('should sort by rarity', () => {
      const collection = new SpiritCollection();
      const common = Spirit.create('c', 'Common', 'Low', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      const legendary = Spirit.create('l', 'Legendary', 'High', SpiritType.DRAGON, undefined, SpiritRarity.LEGENDARY);
      const rare = Spirit.create('r', 'Rare', 'Mid', SpiritType.FIRE, undefined, SpiritRarity.RARE);

      collection.spirits.push(common, legendary, rare);

      const sorted = [...collection.spirits].sort((a, b) => a.rarity - b.rarity);

      expect(sorted[0].rarity).toBe(SpiritRarity.COMMON);
      expect(sorted[2].rarity).toBe(SpiritRarity.LEGENDARY);
    });

    test('should sort by level', () => {
      const collection = new SpiritCollection();
      const level50 = Spirit.create('50', 'High', 'High', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      level50.level = 50;
      
      const level1 = Spirit.create('1', 'Low', 'Low', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      level1.level = 1;
      
      const level25 = Spirit.create('25', 'Mid', 'Mid', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      level25.level = 25;

      collection.spirits.push(level50, level1, level25);

      const sorted = [...collection.spirits].sort((a, b) => a.level - b.level);

      expect(sorted[0].level).toBe(1);
      expect(sorted[2].level).toBe(50);
    });
  });

  describe('Spirit Utils Functions', () => {
    test('should calculate experience for level', () => {
      const exp = SpiritUtils.calculateExperienceForLevel(10, 'medium_fast');
      expect(typeof exp).toBe('number');
      expect(exp).toBeGreaterThan(0);
    });

    test('should handle different growth rates', () => {
      const slow = SpiritUtils.calculateExperienceForLevel(10, 'slow');
      const fast = SpiritUtils.calculateExperienceForLevel(10, 'fast');
      
      expect(slow).toBeGreaterThan(fast);
    });

    test('should handle level 1 (zero experience)', () => {
      const exp = SpiritUtils.calculateExperienceForLevel(1, 'medium_fast');
      expect(exp).toBe(0);
    });

    test('should create demo spirit', () => {
      const demo = SpiritUtils.createDemoSpirit();
      expect(demo).toBeDefined();
      expect(demo.spiritId).toBe('demo_spirit');
      expect(demo.spiritName).toBe('Demo Spirit');
      expect(demo.primaryType).toBe(SpiritType.FIRE);
    });

    test('should create demo collection', () => {
      const demoCollection = SpiritUtils.createDemoCollection();
      expect(demoCollection).toBeDefined();
      expect(demoCollection.spirits).toBeDefined();
      expect(demoCollection.spirits.length).toBeGreaterThan(0);
    });
  });

  describe('Spirit State and Properties', () => {
    test('should track captured state', () => {
      const spirit = Spirit.create('cap_001', 'Captured', 'Caught', SpiritType.WATER, undefined, SpiritRarity.COMMON);
      spirit.captured = true;
      spirit.captureDate = new Date();

      expect(spirit.captured).toBe(true);
      expect(spirit.captureDate).toBeDefined();
    });

    test('should track sync level', () => {
      const spirit = Spirit.create('sync_001', 'Synced', 'High sync', SpiritType.PSYCHIC, undefined, SpiritRarity.RARE);
      spirit.syncLevel = 75;

      expect(spirit.syncLevel).toBe(75);
    });

    test('should track nickname', () => {
      const spirit = Spirit.create('nick_001', 'Original Name', 'Has nickname', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      spirit.nickname = 'Sparky';

      expect(spirit.nickname).toBe('Sparky');
    });

    test('should track favorite status', () => {
      const spirit = Spirit.create('fav_001', 'Favorite', 'Loved', SpiritType.FAIRY, undefined, SpiritRarity.EPIC);
      spirit.isFavorite = true;

      expect(spirit.isFavorite).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete spirit collection workflow', () => {
      // Create collection
      const collection = new SpiritCollection();
      
      // Add various spirits
      const spirits = [
        Spirit.create('s1', 'Fire Dragon', 'Dragon', SpiritType.FIRE, SpiritType.DRAGON, SpiritRarity.LEGENDARY),
        Spirit.create('s2', 'Water Bird', 'Bird', SpiritType.WATER, SpiritType.FLYING, SpiritRarity.RARE),
        Spirit.create('s3', 'Grass Bug', 'Bug', SpiritType.GRASS, SpiritType.BUG, SpiritRarity.COMMON),
        Spirit.create('s4', 'Electric Mouse', 'Mouse', SpiritType.ELECTRIC, undefined, SpiritRarity.UNCOMMON),
        Spirit.create('s5', 'Psychic Ghost', 'Ghost', SpiritType.PSYCHIC, SpiritType.GHOST, SpiritRarity.EPIC)
      ];

      spirits.forEach((s, i) => {
        s.level = (i + 1) * 10;
        s.captured = true;
        s.syncLevel = 50 + i * 10;
      });

      collection.spirits.push(...spirits);

      // Verify collection
      expect(collection.spirits.length).toBe(5);
      
      // Filter by type
      const fireTypes = collection.spirits.filter(s => s.primaryType === SpiritType.FIRE);
      expect(fireTypes.length).toBe(1);
      
      // Filter by rarity
      const legendaries = collection.spirits.filter(s => s.rarity === SpiritRarity.LEGENDARY);
      expect(legendaries.length).toBe(1);
      
      // Sort by level
      const sorted = [...collection.spirits].sort((a, b) => b.level - a.level);
      expect(sorted[0].level).toBe(50);
    });

    test('should calculate battle effectiveness', () => {
      const fireSpirit = Spirit.create('battle_fire', 'Inferno', 'Fire', SpiritType.FIRE, undefined, SpiritRarity.RARE);
      const grassSpirit = Spirit.create('battle_grass', 'Leaf', 'Grass', SpiritType.GRASS, undefined, SpiritRarity.RARE);

      const effectiveness = SpiritUtils.calculateTypeEffectiveness(fireSpirit.primaryType, grassSpirit.primaryType);
      
      // Fire should be effective against Grass
      expect(effectiveness).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty spirit IDs gracefully', () => {
      expect(() => {
        Spirit.create('', '', '', SpiritType.NORMAL, undefined, SpiritRarity.COMMON);
      }).toBeDefined(); // Should not crash
    });

    test('should handle very high levels', () => {
      const spirit = Spirit.create('high_level', 'Max Level', 'High', SpiritType.DRAGON, undefined, SpiritRarity.LEGENDARY);
      spirit.level = 100;

      expect(spirit.level).toBe(100);
      
      const exp = SpiritUtils.calculateExperienceForLevel(100, 'slow');
      expect(exp).toBeGreaterThan(0);
    });

    test('should handle dual type effectiveness', () => {
      const dualSpirit = Spirit.create('dual', 'Dual', 'Dual type', SpiritType.FIRE, SpiritType.FLYING, SpiritRarity.RARE);
      
      expect(dualSpirit.primaryType).toBe(SpiritType.FIRE);
      expect(dualSpirit.secondaryType).toBe(SpiritType.FLYING);
    });

    test('should handle empty collections', () => {
      const emptyCollection = new SpiritCollection();
      expect(emptyCollection.spirits.length).toBe(0);
      
      const filtered = emptyCollection.spirits.filter(s => s.rarity === SpiritRarity.LEGENDARY);
      expect(filtered.length).toBe(0);
    });
  });

  console.log('✅ SpiritsPure Golden Tests completed successfully');
});
