import { AudioManager, AudioManagerOptions } from './AudioManager';

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(async () => {
    // Create a fresh instance for each test
    audioManager = new AudioManager();
    await audioManager.loadConfig();
  });

  afterEach(async () => {
    // Clean up any running audio and timers
    if (audioManager) {
      await audioManager.stopCurrentAudio();
      // Clear any timers that might be running
      jest.clearAllTimers();
    }
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
      // Ensure clean state before each test
      await audioManager.stopCurrentAudio();
      // Start with a known state
      await audioManager.playThemeAudio('neonGrid');
    });

    afterEach(async () => {
      // Clean up after each test
      await audioManager.stopCurrentAudio();
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
    beforeEach(async () => {
      // Ensure clean state before volume control tests
      await audioManager.stopCurrentAudio();
      audioManager.setMasterVolume(1.0); // Reset to default volume
    });

    afterEach(async () => {
      // Clean up after volume control tests
      await audioManager.stopCurrentAudio();
      audioManager.setMasterVolume(1.0); // Reset to default volume
    });

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
      // Note: Theme volume is not directly accessible via getCurrentVolume
      // This test verifies the method doesn't throw errors
      expect(audioManager).toBeDefined();
    });
  });

  describe('Remix Safety and Options', () => {
    beforeEach(async () => {
      // Ensure clean state before remix safety tests
      await audioManager.stopCurrentAudio();
    });

    afterEach(async () => {
      // Clean up after remix safety tests
      await audioManager.stopCurrentAudio();
    });

    test('should respect remix mode options', async () => {
      const remixOptions: AudioManagerOptions = { remix: true };
      
      const result = await audioManager.playThemeAudio('neonGrid', remixOptions);
      expect(result).toBe(true);
      
      // In remix mode, should use fallback audio
      const state = audioManager.getPlaybackState();
      expect(state.currentTheme).toBe('neonGrid');
    });

    test('should respect debug mode options', async () => {
      const debugOptions: AudioManagerOptions = { debug: true };
      
      const result = await audioManager.playThemeAudio('neonGrid', debugOptions);
      expect(result).toBe(true);
    });

    test('should respect zone state options', async () => {
      const zoneOptions: AudioManagerOptions = { zoneState: 'active' };
      
      const result = await audioManager.playThemeAudio('neonGrid', zoneOptions);
      expect(result).toBe(true);
    });

    test('should handle autoPlay option', async () => {
      const autoPlayOptions: AudioManagerOptions = { autoPlay: true };
      
      const result = await audioManager.playThemeAudio('neonGrid', autoPlayOptions);
      expect(result).toBe(true);
    });

    test('should handle crossfade option', async () => {
      const crossfadeOptions: AudioManagerOptions = { crossfade: true };
      
      const result = await audioManager.playThemeAudio('neonGrid', crossfadeOptions);
      expect(result).toBe(true);
    });
  });

  describe('CLI Preview Mode', () => {
    beforeEach(async () => {
      // Ensure clean state before CLI preview tests
      await audioManager.stopCurrentAudio();
    });

    afterEach(async () => {
      // Clean up after CLI preview tests
      await audioManager.stopCurrentAudio();
    });

    test('should generate general CLI preview', () => {
      const preview = audioManager.getCLIPreview();
      expect(preview).toContain('=== Audio Manager Status ===');
      expect(preview).toContain('Playing: No');
      expect(preview).toContain('Current Theme: None');
      expect(preview).toContain('Master Volume: 1');
      expect(preview).toContain('=== Available Themes ===');
      expect(preview).toContain('neonGrid');
      expect(preview).toContain('forestGlade');
      expect(preview).toContain('cosmicVoid');
    });

    test('should generate theme-specific CLI preview', () => {
      const preview = audioManager.getCLIPreview('neonGrid');
      expect(preview).toContain('=== Theme: neonGrid ===');
      expect(preview).toContain('Cyberpunk synth ambient with electric pulses');
      expect(preview).toContain('assets/themes/neon_grid/ambient_synth.ogg');
      expect(preview).toContain('assets/themes/neon_grid/effect_pulses.ogg');
    });

    test('should handle invalid theme in CLI preview', () => {
      const preview = audioManager.getCLIPreview('invalidTheme');
      expect(preview).toContain("Theme 'invalidTheme' not found");
    });
  });

  describe('Remix Safety Validation', () => {
    beforeEach(async () => {
      // Ensure clean state before validation tests
      await audioManager.stopCurrentAudio();
    });

    afterEach(async () => {
      // Clean up after validation tests
      await audioManager.stopCurrentAudio();
    });

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
      // Get initial state before any modifications
      const initialState = audioManager.exportState();
      
      // Verify initial state is clean
      expect(initialState.playbackState.isPlaying).toBe(false);
      expect(initialState.playbackState.currentTheme).toBe(null);
      
      // Modify state by playing audio
      await audioManager.playThemeAudio('neonGrid');
      
      // Verify state was modified
      const modifiedState = audioManager.getPlaybackState();
      expect(modifiedState.isPlaying).toBe(true);
      expect(modifiedState.currentTheme).toBe('neonGrid');
      
      // Import the original state
      audioManager.importState(initialState);
      
      // Verify state was restored correctly
      const restoredState = audioManager.getPlaybackState();
      expect(restoredState.isPlaying).toBe(false);
      expect(restoredState.currentTheme).toBe(null);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      // Ensure clean state before error handling tests
      await audioManager.stopCurrentAudio();
    });

    afterEach(async () => {
      // Clean up after error handling tests
      await audioManager.stopCurrentAudio();
    });

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
    beforeEach(async () => {
      // Ensure clean state before each integration test
      await audioManager.stopCurrentAudio();
      audioManager.setMasterVolume(1.0); // Reset to default volume
    });

    afterEach(async () => {
      // Clean up after each integration test
      await audioManager.stopCurrentAudio();
    });

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