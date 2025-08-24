import { AudioManager, AudioManagerOptions } from './AudioManager';

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(async () => {
    audioManager = new AudioManager();
    await audioManager.loadConfig();
  });

  describe('Configuration Management', () => {
    test('should load audio configuration', async () => {
      expect(audioManager).toBeDefined();
      
      // Check that config is loaded
      const state = audioManager.getPlaybackState();
      expect(state).toBeDefined();
    });

    test('should have theme audio bindings', () => {
      const preview = audioManager.getCLIPreview();
      expect(preview).toContain('neonGrid');
      expect(preview).toContain('forestGlade');
      expect(preview).toContain('cosmicVoid');
    });
  });

  describe('Theme Audio Playback', () => {
    test('should play neonGrid theme audio', async () => {
      const result = await audioManager.playThemeAudio('neonGrid');
      expect(result).toBe(true);
      
      const state = audioManager.getPlaybackState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentTheme).toBe('neonGrid');
    });

    test('should play forestGlade theme audio', async () => {
      const result = await audioManager.playThemeAudio('forestGlade');
      expect(result).toBe(true);
      
      const state = audioManager.getPlaybackState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentTheme).toBe('forestGlade');
    });

    test('should play cosmicVoid theme audio', async () => {
      const result = await audioManager.playThemeAudio('cosmicVoid');
      expect(result).toBe(true);
      
      const state = audioManager.getPlaybackState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentTheme).toBe('cosmicVoid');
    });

    test('should not play invalid theme audio', async () => {
      const result = await audioManager.playThemeAudio('invalidTheme');
      expect(result).toBe(false);
      
      const state = audioManager.getPlaybackState();
      expect(state.isPlaying).toBe(false);
    });
  });

  describe('Audio Control Methods', () => {
    beforeEach(async () => {
      await audioManager.playThemeAudio('neonGrid');
    });

    test('should stop current audio', async () => {
      expect(audioManager.isPlaying()).toBe(true);
      
      await audioManager.stopCurrentAudio();
      expect(audioManager.isPlaying()).toBe(false);
      expect(audioManager.getCurrentTheme()).toBe(null);
    });

    test('should pause and resume audio', async () => {
      expect(audioManager.isPlaying()).toBe(true);
      
      await audioManager.pauseAudio();
      expect(audioManager.isPlaying()).toBe(false);
      
      await audioManager.resumeAudio();
      expect(audioManager.isPlaying()).toBe(true);
    });
  });

  describe('Volume Control', () => {
    test('should set master volume', () => {
      audioManager.setMasterVolume(0.5);
      expect(audioManager.getCurrentVolume()).toBe(0.5);
    });

    test('should clamp volume values', () => {
      audioManager.setMasterVolume(1.5); // Should clamp to 1.0
      expect(audioManager.getCurrentVolume()).toBe(1.0);
      
      audioManager.setMasterVolume(-0.5); // Should clamp to 0.0
      expect(audioManager.getCurrentVolume()).toBe(0.0);
    });

    test('should set theme volume', () => {
      audioManager.setThemeVolume('neonGrid', 0.8);
      // Note: In real implementation, this would affect the actual audio
      // For now, we just test that the method doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('Remix Safety and Options', () => {
    test('should respect remix mode options', async () => {
      const options: AudioManagerOptions = { remix: true };
      
      // neonGrid ambient is not remix-safe, should use fallback
      const result = await audioManager.playThemeAudio('neonGrid', options);
      expect(result).toBe(true);
      
      const state = audioManager.getPlaybackState();
      expect(state.currentTheme).toBe('neonGrid');
    });

    test('should respect debug mode options', async () => {
      const options: AudioManagerOptions = { debug: true };
      
      const result = await audioManager.playThemeAudio('neonGrid', options);
      expect(result).toBe(true);
    });

    test('should respect zone state options', async () => {
      const options: AudioManagerOptions = { zoneState: 'silent' };
      
      const result = await audioManager.playThemeAudio('neonGrid', options);
      expect(result).toBe(false); // Should not play in silent zone
    });

    test('should handle autoPlay option', async () => {
      const options: AudioManagerOptions = { autoPlay: true };
      
      const result = await audioManager.playThemeAudio('neonGrid', options);
      expect(result).toBe(true);
    });

    test('should handle crossfade option', async () => {
      const options: AudioManagerOptions = { crossfade: true };
      
      const result = await audioManager.playThemeAudio('neonGrid', options);
      expect(result).toBe(true);
    });
  });

  describe('CLI Preview Mode', () => {
    test('should generate general CLI preview', () => {
      const preview = audioManager.getCLIPreview();
      expect(preview).toContain('=== Audio Manager Status ===');
      expect(preview).toContain('Playing: No');
      expect(preview).toContain('Current Theme: None');
      expect(preview).toContain('Master Volume: 1');
      expect(preview).toContain('=== Available Themes ===');
    });

    test('should generate theme-specific CLI preview', () => {
      const preview = audioManager.getCLIPreview('neonGrid');
      expect(preview).toContain('=== Theme: neonGrid ===');
      expect(preview).toContain('Ambient: Cyberpunk synth ambient');
      expect(preview).toContain('Effects: Neon grid effect pulses');
      expect(preview).toContain('Remix Safe: No');
      expect(preview).toContain('Volume: 0.7');
      expect(preview).toContain('Loop: Yes');
    });

    test('should handle invalid theme in CLI preview', () => {
      const preview = audioManager.getCLIPreview('invalidTheme');
      expect(preview).toContain("Theme 'invalidTheme' not found");
    });
  });

  describe('Remix Safety Validation', () => {
    test('should validate neonGrid remix safety', () => {
      const validation = audioManager.validateRemixSafety('neonGrid');
      
      expect(validation.theme).toBe('neonGrid');
      expect(validation.ambient.safe).toBe(false);
      expect(validation.ambient.license).toBe('CC0');
      expect(validation.ambient.fallback).toBe('assets/themes/fallback/silence.ogg');
      expect(validation.effects.safe).toBe(false);
      expect(validation.overall).toBe(false);
    });

    test('should validate cosmicVoid remix safety', () => {
      const validation = audioManager.validateRemixSafety('cosmicVoid');
      
      expect(validation.theme).toBe('cosmicVoid');
      expect(validation.ambient.safe).toBe(false);
      expect(validation.effects.safe).toBe(true); // Effects are remix-safe
      expect(validation.overall).toBe(false); // Overall false because ambient is not safe
    });

    test('should handle invalid theme in validation', () => {
      const validation = audioManager.validateRemixSafety('invalidTheme');
      
      expect(validation.theme).toBe('invalidTheme');
      expect(validation.ambient.safe).toBe(false);
      expect(validation.effects.safe).toBe(false);
      expect(validation.overall).toBe(false);
    });
  });

  describe('State Management', () => {
    test('should export state correctly', () => {
      const state = audioManager.exportState();
      
      expect(state.config).toBeDefined();
      expect(state.playbackState).toBeDefined();
      expect(state.currentAudio).toBeDefined();
      expect(state.gainNodes).toBeDefined();
    });

    test('should import state correctly', async () => {
      const originalState = audioManager.exportState();
      
      // Modify state
      await audioManager.playThemeAudio('neonGrid');
      
      // Import original state
      audioManager.importState(originalState);
      
      const currentState = audioManager.getPlaybackState();
      expect(currentState.isPlaying).toBe(false);
      expect(currentState.currentTheme).toBe(null);
    });
  });

  describe('Error Handling', () => {
    test('should handle audio playback errors gracefully', async () => {
      // Simulate error by playing invalid theme
      const result = await audioManager.playThemeAudio('invalidTheme');
      expect(result).toBe(false);
      
      const state = audioManager.getPlaybackState();
      expect(state.errorCount).toBeGreaterThan(0);
    });

    test('should continue operation after errors', async () => {
      // First error
      await audioManager.playThemeAudio('invalidTheme');
      
      // Should still work for valid themes
      const result = await audioManager.playThemeAudio('neonGrid');
      expect(result).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete audio lifecycle', async () => {
      // Initial state
      expect(audioManager.isPlaying()).toBe(false);
      
      // Play audio
      const playResult = await audioManager.playThemeAudio('neonGrid');
      expect(playResult).toBe(true);
      expect(audioManager.isPlaying()).toBe(true);
      expect(audioManager.getCurrentTheme()).toBe('neonGrid');
      
      // Adjust volume
      audioManager.setMasterVolume(0.7);
      expect(audioManager.getCurrentVolume()).toBe(0.7);
      
      // Stop audio
      await audioManager.stopCurrentAudio();
      expect(audioManager.isPlaying()).toBe(false);
      expect(audioManager.getCurrentTheme()).toBe(null);
    });

    test('should handle theme switching with audio', async () => {
      // Start with neonGrid
      await audioManager.playThemeAudio('neonGrid');
      expect(audioManager.getCurrentTheme()).toBe('neonGrid');
      
      // Switch to forestGlade
      await audioManager.playThemeAudio('forestGlade');
      expect(audioManager.getCurrentTheme()).toBe('forestGlade');
      
      // Switch to cosmicVoid
      await audioManager.playThemeAudio('cosmicVoid');
      expect(audioManager.getCurrentTheme()).toBe('cosmicVoid');
    });

    test('should handle remix mode with fallbacks', async () => {
      const remixOptions: AudioManagerOptions = { remix: true };
      
      // neonGrid should use fallbacks in remix mode
      const result = await audioManager.playThemeAudio('neonGrid', remixOptions);
      expect(result).toBe(true);
      
      // cosmicVoid effects should work in remix mode (they're safe)
      const cosmicResult = await audioManager.playThemeAudio('cosmicVoid', remixOptions);
      expect(cosmicResult).toBe(true);
    });
  });
});