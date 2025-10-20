/**
 * AudioMixerPure Tests
 * 
 * Tests for AudioMixer using actual implementation
 */

import AudioMixer from './AudioMixerPure';

describe('AudioMixerPure', () => {
  let mixer: typeof AudioMixer;

  beforeEach(() => {
    mixer = new AudioMixer({
      channels: 8,
      sampleRate: 44100,
      bufferSize: 4096
    });
  });

  describe('Mixer Creation', () => {
    it('should create audio mixer with config', () => {
      expect(mixer).toBeDefined();
    });

    it('should create mixer with default config', () => {
      const defaultMixer = new AudioMixer();
      expect(defaultMixer).toBeDefined();
    });
  });

  describe('Channel Management', () => {
    it('should add channel', () => {
      const channelId = mixer.addChannel({
        name: 'music',
        volume: 0.8,
        pan: 0.0
      });

      expect(channelId).toBeDefined();
      expect(typeof channelId).toBe('string');
    });

    it('should remove channel', () => {
      const channelId = mixer.addChannel({
        name: 'sfx',
        volume: 1.0,
        pan: 0.0
      });

      const result = mixer.removeChannel(channelId);
      expect(result.ok).toBe(true);
    });

    it('should get channel by ID', () => {
      const channelId = mixer.addChannel({
        name: 'voice',
        volume: 0.9,
        pan: 0.0
      });

      const channel = mixer.getChannel(channelId);
      expect(channel).toBeDefined();
      expect(channel?.name).toBe('voice');
    });
  });

  describe('Volume Control', () => {
    it('should set channel volume', () => {
      const channelId = mixer.addChannel({
        name: 'music',
        volume: 1.0,
        pan: 0.0
      });

      const result = mixer.setChannelVolume(channelId, 0.5);
      expect(result.ok).toBe(true);

      const channel = mixer.getChannel(channelId);
      expect(channel?.volume).toBe(0.5);
    });

    it('should set master volume', () => {
      const result = mixer.setMasterVolume(0.7);
      expect(result.ok).toBe(true);

      const volume = mixer.getMasterVolume();
      expect(volume).toBe(0.7);
    });
  });

  describe('Pan Control', () => {
    it('should set channel pan', () => {
      const channelId = mixer.addChannel({
        name: 'sfx',
        volume: 1.0,
        pan: 0.0
      });

      const result = mixer.setChannelPan(channelId, -0.5);
      expect(result.ok).toBe(true);

      const channel = mixer.getChannel(channelId);
      expect(channel?.pan).toBe(-0.5);
    });
  });

  describe('Audio Processing', () => {
    it('should mix audio channels', () => {
      const channel1 = mixer.addChannel({ name: 'music', volume: 0.8, pan: 0.0 });
      const channel2 = mixer.addChannel({ name: 'sfx', volume: 1.0, pan: 0.0 });

      const result = mixer.mix();
      expect(result.ok).toBe(true);
    });

    it('should process audio buffer', () => {
      const channelId = mixer.addChannel({ name: 'test', volume: 1.0, pan: 0.0 });
      
      const buffer = new Float32Array(1024);
      const result = mixer.process(buffer);
      
      expect(result.ok).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get mixer statistics', () => {
      mixer.addChannel({ name: 'music', volume: 0.8, pan: 0.0 });
      mixer.addChannel({ name: 'sfx', volume: 1.0, pan: 0.0 });

      const stats = mixer.getStats();
      expect(stats.channelCount).toBeGreaterThanOrEqual(2);
      expect(stats.masterVolume).toBeDefined();
    });
  });
});
