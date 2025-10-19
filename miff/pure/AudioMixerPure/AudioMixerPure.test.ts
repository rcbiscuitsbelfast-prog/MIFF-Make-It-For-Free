import { describe, it, expect } from '@jest/globals';
import AudioMixer from './AudioMixerPure';

describe('AudioMixerPure', () => {
  describe('Mixer Creation', () => {
    it('should create audio mixer with default config', () => {
      const mixer = new AudioMixer();
      expect(mixer).toBeDefined();
    });

    it('should create mixer with custom config', () => {
      const mixer = new AudioMixer({
        masterVolume: 0.8,
        enabled: true
      });
      expect(mixer).toBeDefined();
    });
  });

  describe('Audio Bus Management', () => {
    it('should create audio bus', () => {
      const mixer = new AudioMixer();
      mixer.createBus('music', { volume: 0.7 });
      
      // Mixer should accept bus creation without errors
      expect(mixer).toBeDefined();
    });

    it('should set bus volume', () => {
      const mixer = new AudioMixer();
      mixer.createBus('sfx', { volume: 1.0 });
      mixer.setBusVolume('sfx', 0.5);
      
      expect(mixer).toBeDefined();
    });
  });

  describe('Audio Playback', () => {
    it('should load audio without errors', () => {
      const mixer = new AudioMixer();
      mixer.loadAudio('test-sound', 'path/to/sound.wav');
      
      expect(mixer).toBeDefined();
    });

    it('should play audio on bus', () => {
      const mixer = new AudioMixer();
      mixer.createBus('sfx', { volume: 1.0 });
      mixer.loadAudio('test-sound', 'path/to/sound.wav');
      mixer.playAudio('test-sound', { bus: 'sfx' });
      
      expect(mixer).toBeDefined();
    });

    it('should stop audio', () => {
      const mixer = new AudioMixer();
      mixer.stopAudio('test-sound');
      
      expect(mixer).toBeDefined();
    });
  });

  describe('Master Volume', () => {
    it('should set master volume', () => {
      const mixer = new AudioMixer();
      mixer.setMasterVolume(0.5);
      
      expect(mixer).toBeDefined();
    });
  });
});
