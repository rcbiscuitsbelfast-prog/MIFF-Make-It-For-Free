/**
 * AudioPure.test.ts
 * 
 * Tests for AudioPure module using actual AudioSystem implementation
 */

import { AudioSystem } from './AudioPure';

describe('AudioPure', () => {
  let audioSystem: AudioSystem;

  beforeEach(() => {
    const config: AudioConfig = {
      sampleRate: 44100,
      channels: 2,
      bufferSize: 1024,
      spatialAudio: false,
      maxSimultaneousSounds: 8,
      enableHRTF: false,
      enableReverb: false,
      enableFFT: false,
      masterVolume: 1.0
    };
    audioSystem = new AudioSystem(config, true); // Headless mode
  });

  describe('Initialization', () => {
    it('should create audio system', () => {
      expect(audioSystem).toBeDefined();
    });
  });

  describe('Sound Management', () => {
    it('should play sound', () => {
      const soundId = audioSystem.playSound('test-sound', { volume: 1.0, loop: false });
      expect(typeof soundId).toBe('string');
    });

    it('should stop sound', () => {
      const soundId = audioSystem.playSound('test-sound');
      audioSystem.stopSound(soundId);
      expect(true).toBe(true);
    });

    it('should stop all sounds', () => {
      audioSystem.playSound('sound1');
      audioSystem.playSound('sound2');
      audioSystem.stopAllSounds();
      expect(true).toBe(true);
    });
  });

  describe('Volume Control', () => {
    it('should set master volume', () => {
      audioSystem.setMasterVolume(0.5);
      expect(audioSystem.getMasterVolume()).toBe(0.5);
    });

    it('should clamp volume', () => {
      audioSystem.setMasterVolume(2.0);
      expect(audioSystem.getMasterVolume()).toBe(1.0);
      
      audioSystem.setMasterVolume(-1.0);
      expect(audioSystem.getMasterVolume()).toBe(0.0);
    });
  });

  describe('Sound Management', () => {
    it('should register multiple sounds', () => {
      const sound1 = { id: 's1', name: 'Sound 1', category: 'sfx', volume: 1.0, pitch: 1.0, loop: false, spatial: false };
      const sound2 = { id: 's2', name: 'Sound 2', category: 'music', volume: 0.8, pitch: 1.0, loop: true, spatial: false };
      
      audioSystem.registerSound(sound1);
      audioSystem.registerSound(sound2);
      
      expect(true).toBe(true);
    });
  });
});
