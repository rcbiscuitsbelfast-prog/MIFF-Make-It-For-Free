/**
 * AudioPure.test.ts
 * 
 * Tests for AudioPure module covering sound management, spatial audio, and headless mode.
 */

import { AudioSystem, AudioConfig, SoundDefinition, SpatialAudioConfig, AudioEvent } from '../../../miff/pure/AudioPure/AudioPure';

describe('AudioPure', () => {
  let config: AudioConfig;
  let audioSystem: AudioSystem;
  let origError: any;
  let origWarn: any;

  beforeEach(() => {
    origError = console.error;
    origWarn = console.warn;
    config = {
      sampleRate: 44100,
      channels: 2,
      bufferSize: 1024,
      spatialAudio: true,
      maxSimultaneousSounds: 8
    };
    audioSystem = new AudioSystem(config, true); // Headless mode for testing
  });

  afterEach(() => {
    console.error = origError;
    console.warn = origWarn;
  });

  describe('AudioSystem', () => {
    it('should create audio system with correct configuration', () => {
      expect(audioSystem.getStats().maxSimultaneous).toBe(8);
      expect(audioSystem.getStats().spatialAudio).toBe(true);
      expect(audioSystem.getStats().headless).toBe(true);
    });

    it('should register and unregister sounds', () => {
      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);
      expect(audioSystem.getSoundDefinition('test-sound')).toEqual(soundDef);
      expect(audioSystem.getStats().totalSounds).toBe(1);

      audioSystem.unregisterSound('test-sound');
      expect(audioSystem.getSoundDefinition('test-sound')).toBeUndefined();
      expect(audioSystem.getStats().totalSounds).toBe(0);
    });

    it('should play sounds and return instance IDs', () => {
      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);
      const instanceId = audioSystem.playSound('test-sound', 0.5, 1.2);

      expect(instanceId).toBeDefined();
      expect(instanceId).toContain('test-sound');
      expect(audioSystem.getActiveSounds()).toHaveLength(1);
    });

    it('should not play non-existent sounds', () => {
      const instanceId = audioSystem.playSound('non-existent');
      expect(instanceId).toBeNull();
    });

    it('should respect maximum simultaneous sounds limit', () => {
      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      // Create a new audio system with limited simultaneous sounds for this test
      const limitedConfig = { ...config, maxSimultaneousSounds: 2 };
      const limitedAudioSystem = new AudioSystem(limitedConfig, true);
      
      // Clear any previous console.warn calls and create a fresh spy
      jest.clearAllMocks();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        limitedAudioSystem.registerSound(soundDef);

        // Try to play more sounds than the limit
        const results = [];
        for (let i = 0; i < 4; i++) {
          const result = limitedAudioSystem.playSound('test-sound');
          results.push(result);
        }

        // First 2 should succeed, last 2 should return null
        expect(results[0]).toBeTruthy();
        expect(results[1]).toBeTruthy();
        expect(results[2]).toBeNull();
        expect(results[3]).toBeNull();
        
        expect(limitedAudioSystem.getActiveSounds()).toHaveLength(2); // Max limit
        
        // Check that we got exactly 2 warnings about maximum simultaneous sounds
        const maxSoundsWarnings = warnSpy.mock.calls.filter(call => 
          call[0] && call[0].includes('Maximum simultaneous sounds reached')
        );
        expect(maxSoundsWarnings).toHaveLength(2);
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('should stop sounds correctly', () => {
      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);
      const instanceId = audioSystem.playSound('test-sound');

      expect(audioSystem.getActiveSounds()).toHaveLength(1);

      const stopped = audioSystem.stopSound(instanceId!);
      expect(stopped).toBe(true);
      expect(audioSystem.getActiveSounds()).toHaveLength(0);
    });

    it('should stop all sounds', () => {
      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);

      // Play multiple sounds
      const instance1 = audioSystem.playSound('test-sound');
      const instance2 = audioSystem.playSound('test-sound');
      const instance3 = audioSystem.playSound('test-sound');

      // Verify all instances were created
      expect(instance1).toBeTruthy();
      expect(instance2).toBeTruthy();
      expect(instance3).toBeTruthy();

      expect(audioSystem.getActiveSounds()).toHaveLength(3);

      audioSystem.stopAllSounds();
      expect(audioSystem.getActiveSounds()).toHaveLength(0);
    });

    it('should set volume correctly', () => {
      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);
      const instanceId = audioSystem.playSound('test-sound');

      const success = audioSystem.setVolume(instanceId!, 0.5);
      expect(success).toBe(true);

      const activeSounds = audioSystem.getActiveSounds();
      expect(activeSounds[0].volume).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', () => {
      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);
      const instanceId = audioSystem.playSound('test-sound');

      // Try to set volume outside valid range
      audioSystem.setVolume(instanceId!, -0.5);
      expect(audioSystem.getActiveSounds()[0].volume).toBe(0);

      audioSystem.setVolume(instanceId!, 1.5);
      expect(audioSystem.getActiveSounds()[0].volume).toBe(1);
    });
  });

  describe('Spatial Audio', () => {
    it('should play spatial sounds with position and velocity', () => {
      const soundDef: SoundDefinition = {
        id: 'spatial-sound',
        name: 'Spatial Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: true
      };

      audioSystem.registerSound(soundDef);

      const spatialConfig: SpatialAudioConfig = {
        position: { x: 10, y: 5, z: 0 },
        velocity: { x: 1, y: 0, z: 0 },
        volume: 0.7,
        pitch: 1.1,
        dopplerEffect: true
      };

      const instanceId = audioSystem.playSpatialSound('spatial-sound', spatialConfig);
      expect(instanceId).toBeDefined();

      const activeSounds = audioSystem.getActiveSounds();
      expect(activeSounds[0].spatial).toBe(true);
      expect(activeSounds[0].position).toEqual(spatialConfig.position);
      expect(activeSounds[0].velocity).toEqual(spatialConfig.velocity);
    });

    it('should update listener position and velocity', () => {
      audioSystem.setListenerPosition({ x: 0, y: 0, z: 0 });
      audioSystem.setListenerVelocity({ x: 1, y: 0, z: 0 });

      // These methods don't return values, so we just verify they don't throw
      expect(() => audioSystem.setListenerPosition({ x: 5, y: 10, z: 15 })).not.toThrow();
      expect(() => audioSystem.setListenerVelocity({ x: 2, y: 1, z: 0 })).not.toThrow();
    });

    it('should update spatial audio calculations', () => {
      const soundDef: SoundDefinition = {
        id: 'spatial-sound',
        name: 'Spatial Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: true
      };

      audioSystem.registerSound(soundDef);

      const spatialConfig: SpatialAudioConfig = {
        position: { x: 10, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        volume: 1.0,
        pitch: 1.0,
        dopplerEffect: true
      };

      const instanceId = audioSystem.playSpatialSound('spatial-sound', spatialConfig);
      audioSystem.setListenerPosition({ x: 0, y: 0, z: 0 });

      // Update spatial audio
      expect(() => audioSystem.updateSpatialAudio()).not.toThrow();
    });
  });

  describe('Event Callbacks', () => {
    it('should register and call event callbacks', () => {
      const events: AudioEvent[] = [];
      const callback = (event: AudioEvent) => {
        events.push(event);
      };

      audioSystem.addCallback(callback);

      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);
      const instanceId = audioSystem.playSound('test-sound');
      audioSystem.stopSound(instanceId!);

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.type === 'play')).toBe(true);
      expect(events.some(e => e.type === 'stop')).toBe(true);
    });

    it('should remove callbacks correctly', () => {
      const events: AudioEvent[] = [];
      const callback = (event: AudioEvent) => {
        events.push(event);
      };

      audioSystem.addCallback(callback);
      audioSystem.removeCallback(callback);

      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);
      audioSystem.playSound('test-sound');

      // Should not have called the callback since it was removed
      expect(events.length).toBe(0);
    });
  });

  describe('Headless Mode', () => {
    it('should generate audio report in headless mode', () => {
      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      audioSystem.registerSound(soundDef);
      audioSystem.playSound('test-sound');

      const report = audioSystem.generateAudioReport();
      
      expect(report).toContain('Audio System Report');
      expect(report).toContain('Total Registered Sounds: 1');
      expect(report).toContain('Active Sounds: 1');
      expect(report).toContain('Headless Mode: Yes');
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = (event: AudioEvent) => {
        throw new Error('Test error');
      };

      audioSystem.addCallback(errorCallback);

      const soundDef: SoundDefinition = {
        id: 'test-sound',
        name: 'Test Sound',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: false
      };

      // Should not throw, should log error instead
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        audioSystem.registerSound(soundDef);
        audioSystem.playSound('test-sound');
      }).not.toThrow();
      expect(errSpy).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex audio scenario', () => {
      // Register multiple sounds
      const sounds = [
        { id: 'bgm', name: 'Background Music', category: 'music', volume: 0.6, pitch: 1.0, loop: true, spatial: false },
        { id: 'jump', name: 'Jump Sound', category: 'sfx', volume: 0.8, pitch: 1.0, loop: false, spatial: true },
        { id: 'coin', name: 'Coin Collect', category: 'sfx', volume: 0.9, pitch: 1.2, loop: false, spatial: false }
      ];

      sounds.forEach(sound => audioSystem.registerSound(sound));

      // Play background music
      const bgmId = audioSystem.playSound('bgm', 0.5);
      expect(bgmId).toBeDefined();

      // Play spatial jump sound
      const jumpId = audioSystem.playSpatialSound('jump', {
        position: { x: 5, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        volume: 0.8,
        pitch: 1.0,
        dopplerEffect: true
      });
      expect(jumpId).toBeDefined();

      // Play coin sound
      const coinId = audioSystem.playSound('coin');
      expect(coinId).toBeDefined();

      // Verify all sounds are active
      expect(audioSystem.getActiveSounds()).toHaveLength(3);

      // Stop specific sound
      audioSystem.stopSound(jumpId!);
      expect(audioSystem.getActiveSounds()).toHaveLength(2);

      // Update spatial audio
      audioSystem.setListenerPosition({ x: 0, y: 0, z: 0 });
      audioSystem.updateSpatialAudio();

      // Generate report
      const report = audioSystem.generateAudioReport();
      expect(report).toContain('Active Sounds: 2');
    });
  });
});