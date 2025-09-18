import { PixelAnimManager, AnimationPreset } from '../Manager';
import { PixelAnimPure } from '../index';
import * as fs from 'fs';
import * as path from 'path';

describe('PixelAnimPure Golden Tests', () => {
  let manager: PixelAnimManager;

  beforeEach(() => {
    manager = new PixelAnimManager();
  });

  test('creates animation from preset', () => {
    const result = manager.createAnimationFromPreset('walk-basic');
    
    expect(result.ok).toBe(true);
    expect(result.animation).toBeDefined();
    expect(result.animation?.name).toBe('Basic Walk Cycle');
    expect(result.animation?.frames).toHaveLength(4);
    expect(result.animation?.speed).toBe(8);
    expect(result.animation?.loop).toBe(true);
  });

  test('creates custom animation', () => {
    const frames = ['test1.png', 'test2.png', 'test3.png'];
    const result = manager.createAnimation('Test Animation', frames, 12, false);
    
    expect(result.ok).toBe(true);
    expect(result.animation?.name).toBe('Test Animation');
    expect(result.animation?.frames).toHaveLength(3);
    expect(result.animation?.speed).toBe(12);
    expect(result.animation?.loop).toBe(false);
    
    // Verify frame structure
    result.animation?.frames.forEach((frame, index) => {
      expect(frame.frame).toBe(index);
      expect(frame.duration).toBe(1000 / 12); // 1000ms / 12fps
      expect(frame.layer).toBe(frames[index]);
    });
  });

  test('manages animation library', () => {
    // Create multiple animations
    manager.createAnimation('Anim1', ['a1.png', 'a2.png'], 8, true);
    manager.createAnimation('Anim2', ['b1.png', 'b2.png', 'b3.png'], 10, false);
    
    // List animations
    const listResult = manager.listAnimations();
    expect(listResult.ok).toBe(true);
    expect(listResult.total).toBeGreaterThanOrEqual(5); // 3 samples + 2 created
    
    // Filter by loop
    const loopingResult = manager.listAnimations({ loop: true });
    const nonLoopingResult = manager.listAnimations({ loop: false });
    
    expect(loopingResult.animations.every(a => a.loop)).toBe(true);
    expect(nonLoopingResult.animations.every(a => !a.loop)).toBe(true);
    
    // Get specific animation
    const getResult = manager.getAnimation('Anim1');
    expect(getResult.ok).toBe(true);
    expect(getResult.animation?.name).toBe('Anim1');
  });

  test('manages presets', () => {
    // List default presets
    const allPresets = manager.listPresets();
    expect(allPresets.ok).toBe(true);
    expect(allPresets.total).toBeGreaterThanOrEqual(5); // Default presets
    
    // Filter by category
    const characterPresets = manager.listPresets('character');
    expect(characterPresets.presets.every(p => p.category === 'character')).toBe(true);
    
    const effectPresets = manager.listPresets('effect');
    expect(effectPresets.presets.every(p => p.category === 'effect')).toBe(true);
    
    // Add custom preset
    const customPreset: AnimationPreset = {
      id: 'test-preset',
      name: 'Test Preset',
      description: 'A test preset',
      category: 'custom',
      frames: ['test1.png', 'test2.png'],
      fps: 6,
      loop: true
    };
    
    const addResult = manager.addPreset(customPreset);
    expect(addResult.ok).toBe(true);
    
    // Verify preset was added
    const afterAdd = manager.listPresets();
    expect(afterAdd.total).toBe(allPresets.total + 1);
  });

  test('creates and manages sequences', () => {
    // Create animations for sequence
    manager.createAnimation('Walk', ['w1.png', 'w2.png'], 8, true);
    manager.createAnimation('Run', ['r1.png', 'r2.png', 'r3.png'], 12, true);
    
    // Create sequence
    const walkAnim = manager.getAnimation('Walk');
    const runAnim = manager.getAnimation('Run');
    expect(walkAnim.ok && runAnim.ok).toBe(true);
    
    const transitions = { 'Walk': 'Run', 'Run': 'Walk' };
    const seqResult = manager.createSequence(
      'movement-seq', 
      'Movement Sequence', 
      [walkAnim.animation!, runAnim.animation!], 
      transitions
    );
    
    expect(seqResult.ok).toBe(true);
    expect(seqResult.sequence?.animations).toHaveLength(2);
    expect(seqResult.sequence?.transitions).toEqual(transitions);
    
    // List sequences
    const listSeqResult = manager.listSequences();
    expect(listSeqResult.ok).toBe(true);
    expect(listSeqResult.total).toBeGreaterThanOrEqual(2); // 1 sample + 1 created
    
    // Get sequence
    const getSeqResult = manager.getSequence('movement-seq');
    expect(getSeqResult.ok).toBe(true);
    expect(getSeqResult.sequence?.name).toBe('Movement Sequence');
  });

  test('creates sprite sheets', () => {
    // Create animations
    manager.createAnimation('Sheet1', ['s1_1.png', 's1_2.png'], 8, true);
    manager.createAnimation('Sheet2', ['s2_1.png', 's2_2.png', 's2_3.png'], 10, true);
    
    // Create sprite sheet
    const result = manager.createSpriteSheet(['Sheet1', 'Sheet2'], 32, 32);
    
    expect(result.ok).toBe(true);
    expect(result.spriteSheet).toBeDefined();
    expect(result.spriteSheet?.frameWidth).toBe(32);
    expect(result.spriteSheet?.frameHeight).toBe(32);
    expect(result.spriteSheet?.layers).toHaveLength(5); // 2 + 3 unique frames
    
    // Test with non-existent animation
    const badResult = manager.createSpriteSheet(['NonExistent'], 32, 32);
    expect(badResult.ok).toBe(false);
    expect(badResult.errors).toContain('Animation NonExistent not found');
  });

  test('simulates animation playback', () => {
    // Use existing sample animation
    const simResult = manager.simulate('Basic Walk Cycle', 2000);
    
    expect(simResult.ok).toBe(true);
    expect(simResult.simulation).toBeDefined();
    expect(simResult.simulation?.animationName).toBe('Basic Walk Cycle');
    expect(simResult.simulation?.duration).toBe(2000);
    expect(simResult.simulation?.totalCycles).toBeGreaterThan(0);
    expect(simResult.simulation?.events).toBeDefined();
    expect(Array.isArray(simResult.simulation?.events)).toBe(true);
    
    // Verify frame progression
    const events = simResult.simulation?.events;
    if (events && events.length > 0) {
      expect(events[0].frame).toBe(0);
      expect(events[0].cycle).toBe(0);
      expect(typeof events[0].timestamp).toBe('number');
    }
    
    // Test with non-existent animation
    const badSimResult = manager.simulate('NonExistent', 1000);
    expect(badSimResult.ok).toBe(false);
    expect(badSimResult.errors).toContain('Animation NonExistent not found');
  });

  test('generates statistics', () => {
    // Add some animations to get meaningful stats
    manager.createAnimation('Stats1', ['s1.png', 's2.png'], 8, true);
    manager.createAnimation('Stats2', ['t1.png', 't2.png', 't3.png', 't4.png'], 10, false);
    
    const stats = manager.getStats();
    
    expect(stats.totalAnimations).toBeGreaterThanOrEqual(5); // 3 samples + 2 created
    expect(stats.totalSequences).toBeGreaterThanOrEqual(1); // 1 sample sequence
    expect(stats.totalFrames).toBeGreaterThan(0);
    expect(stats.averageFramesPerAnimation).toBeGreaterThan(0);
    expect(typeof stats.presetUsage).toBe('object');
    expect(typeof stats.categoryDistribution).toBe('object');
    
    // Verify category distribution includes expected categories
    expect(stats.categoryDistribution.character).toBeGreaterThan(0);
    expect(stats.categoryDistribution.effect).toBeGreaterThan(0);
  });

  test('exports animations in different formats', () => {
    // Use existing sample animation
    const animName = 'Basic Walk Cycle';
    
    // Test JSON export
    const jsonExport = manager.exportAnimation(animName, 'json');
    expect(jsonExport.ok).toBe(true);
    expect(jsonExport.data?.name).toBe(animName);
    
    // Test manifest export
    const manifestExport = manager.exportAnimation(animName, 'manifest');
    expect(manifestExport.ok).toBe(true);
    expect(manifestExport.data?.schema).toBe('miff.pixel.animation.manifest.v1');
    expect(manifestExport.data?.animation).toBeDefined();
    expect(manifestExport.data?.metadata).toBeDefined();
    
    // Test sprite sheet export
    const spriteExport = manager.exportAnimation(animName, 'spritesheet');
    expect(spriteExport.ok).toBe(true);
    expect(spriteExport.data?.spriteSheet).toBeDefined();
    expect(spriteExport.data?.animation).toBeDefined();
    
    // Test with non-existent animation
    const badExport = manager.exportAnimation('NonExistent', 'json');
    expect(badExport.ok).toBe(false);
    expect(badExport.errors).toContain('Animation NonExistent not found');
  });

  test('validates animations', () => {
    // Valid animation
    const validAnimation = {
      name: 'Valid Test',
      frames: [
        { frame: 0, duration: 100, layer: 'frame1.png' },
        { frame: 1, duration: 100, layer: 'frame2.png' }
      ],
      loop: true,
      speed: 10
    };
    
    const validResult = manager.validateAnimation(validAnimation);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
    
    // Invalid animation - missing name
    const invalidAnimation = {
      name: '',
      frames: [],
      loop: true,
      speed: -5
    };
    
    const invalidResult = manager.validateAnimation(invalidAnimation);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
    expect(invalidResult.errors).toContain('Animation name is required');
    expect(invalidResult.errors).toContain('Animation must have at least one frame');
    expect(invalidResult.errors).toContain('Animation speed must be between 1 and 60 FPS');
  });

  test('handles deletion with dependency checking', () => {
    // Create animation and sequence
    manager.createAnimation('DeleteTest', ['d1.png', 'd2.png'], 8, true);
    const deleteAnim = manager.getAnimation('DeleteTest');
    expect(deleteAnim.ok).toBe(true);
    
    // Create sequence using the animation
    const seqResult = manager.createSequence(
      'delete-seq', 
      'Delete Test Sequence', 
      [deleteAnim.animation!]
    );
    expect(seqResult.ok).toBe(true);
    
    // Try to delete animation (should fail due to sequence dependency)
    const deleteResult = manager.deleteAnimation('DeleteTest');
    expect(deleteResult.ok).toBe(false);
    expect(deleteResult.errors?.[0]).toContain('is used in sequences');
    
    // Delete sequence first
    const deleteSeqResult = manager.deleteSequence('delete-seq');
    expect(deleteSeqResult.ok).toBe(true);
    
    // Now delete animation should work
    const deleteResult2 = manager.deleteAnimation('DeleteTest');
    expect(deleteResult2.ok).toBe(true);
    
    // Verify animation is gone
    const getResult = manager.getAnimation('DeleteTest');
    expect(getResult.ok).toBe(false);
  });

  test('validates fixture file', () => {
    const fixturePath = path.join(__dirname, '../fixtures/sample_animation.json');
    expect(fs.existsSync(fixturePath)).toBe(true);
    
    const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    const validation = manager.validateAnimation(fixtureData);
    
    expect(validation.valid).toBe(true);
    expect(fixtureData.name).toBe('Custom Walk');
    expect(fixtureData.frames).toHaveLength(4);
    expect(fixtureData.speed).toBe(8);
  });

  test('handles error cases gracefully', () => {
    // Duplicate animation
    manager.createAnimation('Duplicate', ['d1.png'], 8, true);
    const duplicateResult = manager.createAnimation('Duplicate', ['d2.png'], 10, false);
    expect(duplicateResult.ok).toBe(false);
    expect(duplicateResult.errors).toContain('Animation Duplicate already exists');
    
    // Invalid FPS
    const badFpsResult = manager.createAnimation('BadFPS', ['b1.png'], 100, true);
    expect(badFpsResult.ok).toBe(false);
    expect(badFpsResult.errors).toContain('FPS must be between 1 and 60');
    
    // Empty frames
    const noFramesResult = manager.createAnimation('NoFrames', [], 8, true);
    expect(noFramesResult.ok).toBe(false);
    expect(noFramesResult.errors).toContain('Animation must have at least one frame');
    
    // Non-existent preset
    const badPresetResult = manager.createAnimationFromPreset('non-existent');
    expect(badPresetResult.ok).toBe(false);
    expect(badPresetResult.errors).toContain('Preset non-existent not found');
    
    // Duplicate preset
    const preset: AnimationPreset = {
      id: 'walk-basic', // Already exists
      name: 'Duplicate',
      description: 'Duplicate preset',
      category: 'custom',
      frames: ['d1.png'],
      fps: 8,
      loop: true
    };
    
    const duplicatePresetResult = manager.addPreset(preset);
    expect(duplicatePresetResult.ok).toBe(false);
    expect(duplicatePresetResult.errors).toContain('Preset walk-basic already exists');
  });

  test('uses PixelAnimPure static methods', () => {
    // Test direct usage of PixelAnimPure
    const animation = PixelAnimPure.createAnimation('Direct Test', ['d1.png', 'd2.png'], 12, false);
    
    expect(animation.name).toBe('Direct Test');
    expect(animation.frames).toHaveLength(2);
    expect(animation.speed).toBe(12);
    expect(animation.loop).toBe(false);
    
    // Test preset creation
    const presetAnim = PixelAnimPure.createFromPreset('walk');
    expect(presetAnim.name).toBe('walk');
    expect(presetAnim.frames).toHaveLength(4);
    
    // Test sprite sheet creation
    const spriteSheet = PixelAnimPure.createSpriteSheet([animation, presetAnim], 32, 32);
    expect(spriteSheet.frameWidth).toBe(32);
    expect(spriteSheet.frameHeight).toBe(32);
    expect(spriteSheet.layers.length).toBeGreaterThan(0);
    
    // Test exports
    const animExport = PixelAnimPure.exportAnimation(animation);
    expect((animExport as any).schema).toBe('miff.pixel.animation.v1');
    
    const sheetExport = PixelAnimPure.exportSpriteSheet(spriteSheet);
    expect((sheetExport as any).schema).toBe('miff.pixel.spritesheet.v1');
  });
});