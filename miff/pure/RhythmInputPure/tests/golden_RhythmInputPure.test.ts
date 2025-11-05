/**
 * Golden Test Suite for RhythmInputPure
 */

import {
  RhythmInputManager,
  RhythmInputType,
  RhythmDifficulty,
  RhythmAccuracy,
  BeatMapGenerator,
  RhythmInputUtils,
  IBeatMap,
  IRhythmNote
} from '../index';

describe('RhythmInputPure Golden Tests', () => {
  
  describe('Basic Functionality', () => {
    test('should create rhythm input manager', () => {
      const manager = new RhythmInputManager(RhythmDifficulty.STANDARD);
      expect(manager).toBeDefined();
    });

    test('should load beat map', () => {
      const manager = new RhythmInputManager();
      const beatMap = BeatMapGenerator.generateSimple(120, 10000, RhythmDifficulty.STANDARD);
      
      manager.loadBeatMap(beatMap);
      expect(() => manager.start()).not.toThrow();
    });

    test('should start and stop rhythm sequence', () => {
      const manager = new RhythmInputManager();
      const beatMap = BeatMapGenerator.generateSimple(120, 10000, RhythmDifficulty.STANDARD);
      manager.loadBeatMap(beatMap);
      
      manager.start();
      expect(() => manager.stop()).not.toThrow();
    });
  });

  describe('Input Detection', () => {
    test('should detect perfect tap', () => {
      const manager = new RhythmInputManager(RhythmDifficulty.STANDARD);
      const beatMap: IBeatMap = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        duration: 5000,
        notes: [
          { id: 'note_1', time: 1000, type: RhythmInputType.TAP }
        ],
        difficulty: RhythmDifficulty.STANDARD,
        audioFile: 'test.mp3'
      };
      
      manager.loadBeatMap(beatMap);
      manager.start();
      
      const result = manager.handleTap(100, 100, 1000); // Perfect timing
      expect(result).toBeDefined();
      expect(result?.accuracy).toBe(RhythmAccuracy.PERFECT);
      expect(result?.score).toBe(100);
    });

    test('should detect good tap', () => {
      const manager = new RhythmInputManager(RhythmDifficulty.STANDARD);
      const beatMap: IBeatMap = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        duration: 5000,
        notes: [
          { id: 'note_1', time: 1000, type: RhythmInputType.TAP }
        ],
        difficulty: RhythmDifficulty.STANDARD,
        audioFile: 'test.mp3'
      };
      
      manager.loadBeatMap(beatMap);
      manager.start();
      
      const result = manager.handleTap(100, 100, 1100); // 100ms late (good window)
      expect(result).toBeDefined();
      expect(result?.accuracy).toBe(RhythmAccuracy.GOOD);
    });

    test('should detect miss', () => {
      const manager = new RhythmInputManager(RhythmDifficulty.STANDARD);
      const beatMap: IBeatMap = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        duration: 5000,
        notes: [
          { id: 'note_1', time: 1000, type: RhythmInputType.TAP }
        ],
        difficulty: RhythmDifficulty.STANDARD,
        audioFile: 'test.mp3'
      };
      
      manager.loadBeatMap(beatMap);
      manager.start();
      
      const result = manager.handleTap(100, 100, 1300); // 300ms late (miss)
      expect(result).toBeDefined();
      expect(result?.accuracy).toBe(RhythmAccuracy.MISS);
      expect(result?.score).toBe(-10);
    });
  });

  describe('Beat Map Generation', () => {
    test('should generate simple beat map', () => {
      const beatMap = BeatMapGenerator.generateSimple(120, 10000, RhythmDifficulty.STANDARD);
      
      expect(beatMap).toBeDefined();
      expect(beatMap.bpm).toBe(120);
      expect(beatMap.duration).toBe(10000);
      expect(beatMap.notes.length).toBeGreaterThan(0);
    });

    test('should generate complex beat map', () => {
      const beatMap = BeatMapGenerator.generateComplex(140, 15000, RhythmDifficulty.EXPERT);
      
      expect(beatMap).toBeDefined();
      expect(beatMap.bpm).toBe(140);
      expect(beatMap.notes.length).toBeGreaterThan(0);
      
      // Should have variety of note types
      const hasHolds = beatMap.notes.some(n => n.type === RhythmInputType.HOLD);
      const hasSwipes = beatMap.notes.some(n => 
        n.type === RhythmInputType.SWIPE_UP || 
        n.type === RhythmInputType.SWIPE_DOWN
      );
      
      expect(hasHolds || hasSwipes).toBe(true);
    });
  });

  describe('Accuracy Statistics', () => {
    test('should calculate accuracy stats', () => {
      const manager = new RhythmInputManager(RhythmDifficulty.STANDARD);
      const beatMap = BeatMapGenerator.generateSimple(120, 5000, RhythmDifficulty.STANDARD);
      manager.loadBeatMap(beatMap);
      manager.start();
      
      // Simulate some perfect hits
      beatMap.notes.slice(0, 3).forEach(note => {
        manager.handleTap(100, 100, note.time);
      });
      
      const stats = manager.getAccuracyStats();
      expect(stats.perfect).toBeGreaterThan(0);
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.accuracy).toBeGreaterThan(0);
    });

    test('should calculate total score', () => {
      const manager = new RhythmInputManager(RhythmDifficulty.STANDARD);
      const beatMap: IBeatMap = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        duration: 5000,
        notes: [
          { id: 'note_1', time: 1000, type: RhythmInputType.TAP },
          { id: 'note_2', time: 2000, type: RhythmInputType.TAP }
        ],
        difficulty: RhythmDifficulty.STANDARD,
        audioFile: 'test.mp3'
      };
      
      manager.loadBeatMap(beatMap);
      manager.start();
      
      manager.handleTap(100, 100, 1000); // Perfect = 100
      manager.handleTap(100, 100, 2100); // Good = 50
      
      const totalScore = manager.getTotalScore();
      expect(totalScore).toBe(150);
    });
  });

  describe('Utility Functions', () => {
    test('should convert beat to ms', () => {
      const ms = RhythmInputUtils.beatToMs(4, 120); // 4 beats at 120 BPM
      expect(ms).toBe(2000); // 2 seconds
    });

    test('should convert ms to beat', () => {
      const beat = RhythmInputUtils.msToBeat(2000, 120);
      expect(beat).toBe(4);
    });

    test('should create capture beat map', () => {
      const beatMap = RhythmInputUtils.createCaptureBeatMap(RhythmDifficulty.CASUAL);
      expect(beatMap).toBeDefined();
      expect(beatMap.duration).toBe(15000); // 15 second capture sequence
    });

    test('should create boss beat map', () => {
      const beatMap = RhythmInputUtils.createBossBeatMap(RhythmDifficulty.EXPERT);
      expect(beatMap).toBeDefined();
      expect(beatMap.duration).toBe(120000); // 2 minute boss battle
    });
  });

  describe('Game Integration', () => {
    test('should complete spirit capture sequence', () => {
      const manager = new RhythmInputManager(RhythmDifficulty.CASUAL);
      const beatMap = RhythmInputUtils.createCaptureBeatMap(RhythmDifficulty.CASUAL);
      
      manager.loadBeatMap(beatMap);
      manager.start();
      
      // Simulate perfect sequence
      beatMap.notes.forEach(note => {
        manager.handleTap(100, 100, note.time);
      });
      
      expect(manager.isSuccess(70)).toBe(true); // 70% accuracy required
      console.log('✅ Spirit capture successful!');
    });

    test('should fail capture on low accuracy', () => {
      const manager = new RhythmInputManager(RhythmDifficulty.EXPERT);
      const beatMap: IBeatMap = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        duration: 5000,
        notes: [
          { id: 'note_1', time: 1000, type: RhythmInputType.TAP },
          { id: 'note_2', time: 2000, type: RhythmInputType.TAP },
          { id: 'note_3', time: 3000, type: RhythmInputType.TAP }
        ],
        difficulty: RhythmDifficulty.EXPERT,
        audioFile: 'test.mp3'
      };
      
      manager.loadBeatMap(beatMap);
      manager.start();
      
      // Miss all notes by not inputting
      manager.update(5000);
      
      expect(manager.isSuccess(70)).toBe(false);
    });
  });

  console.log('✅ RhythmInputPure Golden Tests completed');
});
