/**
 * AudioPure.test.ts
 * 
 * Core tests for AudioPure module - testing actual AudioSystem implementation
 */

import { AudioSystem, AudioConfig } from './index';

describe('AudioPure', () => {
  let config: AudioConfig;

  beforeEach(() => {
    config = {
      sampleRate: 44100,
      channels: 2,
      bitDepth: 16,
      bufferSize: 4096,
      maxSounds: 32,
      headlessMode: true
    };
  });

  describe('AudioSystem Creation', () => {
    it('should create audio system with config', () => {
      const system = new AudioSystem(config);
      expect(system).toBeDefined();
    });

    it('should create audio system with default config', () => {
      const system = new AudioSystem();
      expect(system).toBeDefined();
    });
  });

  describe('Audio Playback', () => {
    it('should play sound and return sound ID', () => {
      const system = new AudioSystem(config);
      const soundId = system.playSound('test-sound', { volume: 0.5, loop: false });
      expect(typeof soundId).toBe('string');
      expect(soundId.length).toBeGreaterThan(0);
    });

    it('should stop sound', () => {
      const system = new AudioSystem(config);
      const soundId = system.playSound('test-sound');
      system.stopSound(soundId);
      // No error thrown = success
      expect(true).toBe(true);
    });

    it('should stop all sounds', () => {
      const system = new AudioSystem(config);
      system.playSound('sound-1');
      system.playSound('sound-2');
      system.stopAllSounds();
      expect(true).toBe(true);
    });
  });

  describe('Volume Control', () => {
    it('should set master volume', () => {
      const system = new AudioSystem(config);
      system.setMasterVolume(0.7);
      const volume = system.getMasterVolume();
      expect(volume).toBe(0.7);
    });

    it('should clamp volume to 0-1 range', () => {
      const system = new AudioSystem(config);
      system.setMasterVolume(1.5);
      expect(system.getMasterVolume()).toBe(1.0);
      
      system.setMasterVolume(-0.5);
      expect(system.getMasterVolume()).toBe(0.0);
    });
  });

  describe('Audio State', () => {
    it('should get audio stats', () => {
      const system = new AudioSystem(config);
      const stats = system.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.activeSounds).toBe('number');
      expect(typeof stats.totalSounds).toBe('number');
    });

    it('should pause and resume audio', () => {
      const system = new AudioSystem(config);
      system.pause();
      expect(system.isPaused()).toBe(true);
      
      system.resume();
      expect(system.isPaused()).toBe(false);
    });
  });

  describe('Headless Mode', () => {
    it('should work in headless mode without errors', () => {
      const headlessConfig = { ...config, headlessMode: true };
      const system = new AudioSystem(headlessConfig);
      
      const soundId = system.playSound('test');
      system.setMasterVolume(0.5);
      system.stopSound(soundId);
      
      expect(true).toBe(true);
    });
  });
});
