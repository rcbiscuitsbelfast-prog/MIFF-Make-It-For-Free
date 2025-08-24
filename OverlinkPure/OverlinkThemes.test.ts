import { OverlinkThemes, ThemeId, ThemeConfig, ThemeAsset, ThemeDrawReducer } from './OverlinkThemes';

describe('OverlinkThemes', () => {
  let themes: OverlinkThemes;

  beforeEach(() => {
    themes = new OverlinkThemes();
  });

  describe('Theme Management', () => {
    test('should have default themes available', () => {
      const availableThemes = themes.getAvailableThemes();
      expect(availableThemes).toContain('neonGrid');
      expect(availableThemes).toContain('forestGlade');
      expect(availableThemes).toContain('cosmicVoid');
    });

    test('should activate themes correctly', () => {
      const result = themes.activateTheme('neonGrid');
      expect(result).toBe(true);
      expect(themes.getActiveTheme()).toBe('neonGrid');
    });

    test('should not activate invalid themes', () => {
      const result = themes.activateTheme('invalidTheme' as ThemeId);
      expect(result).toBe(false);
      expect(themes.getActiveTheme()).toBe(null);
    });

    test('should deactivate themes correctly', () => {
      themes.activateTheme('neonGrid');
      themes.deactivateTheme();
      expect(themes.getActiveTheme()).toBe(null);
    });

    test('should get theme configuration', () => {
      const config = themes.getThemeConfig('neonGrid');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Neon Grid');
      expect(config?.description).toContain('Cyberpunk-inspired');
    });
  });

  describe('Layer Management', () => {
    test('should toggle layers correctly', () => {
      const result = themes.toggleLayer('effects');
      expect(result).toBe(true);
      
      const layers = themes.getLayerVisibility();
      expect(layers.get('effects')).toBe(true);
    });

    test('should set layer visibility', () => {
      themes.setLayer('effects', true);
      
      const layers = themes.getLayerVisibility();
      expect(layers.get('effects')).toBe(true);
    });

    test('should maintain layer state', () => {
      themes.setLayer('background', true);
      themes.setLayer('foreground', false);
      
      const layers = themes.getLayerVisibility();
      expect(layers.get('background')).toBe(true);
      expect(layers.get('foreground')).toBe(false);
    });
  });

  describe('Asset Management', () => {
    test('should get theme assets', () => {
      const neonAssets = themes.getThemeAssets('neonGrid');
      expect(neonAssets).toHaveLength(3);
      
      const textureAssets = neonAssets.filter(a => a.type === 'texture');
      expect(textureAssets).toHaveLength(1);
      expect(textureAssets[0].id).toBe('grid_texture');
    });

    test('should get assets by type', () => {
      const textureAssets = themes.getAssetByType('texture');
      expect(textureAssets.length).toBeGreaterThan(0);
      expect(textureAssets.every(a => a.type === 'texture')).toBe(true);
    });

    test('should get remix-safe assets', () => {
      const safeAssets = themes.getRemixSafeAssets();
      expect(safeAssets.length).toBeGreaterThan(0);
      expect(safeAssets.every(a => a.remixSafe)).toBe(true);
    });

    test('should have fallback assets', () => {
      const neonAssets = themes.getThemeAssets('neonGrid');
      const audioAsset = neonAssets.find(a => a.type === 'audio');
      expect(audioAsset?.fallback).toBeDefined();
    });
  });

  describe('Draw Reducer Management', () => {
    test('should get theme reducers', () => {
      const neonReducers = themes.getThemeReducers('neonGrid');
      expect(neonReducers).toHaveLength(2);
      
      const spriteReducer = neonReducers.find(r => r.type === 'sprite');
      expect(spriteReducer?.id).toBe('grid_renderer');
      expect(spriteReducer?.priority).toBe(1);
    });

    test('should get active theme reducers', () => {
      themes.activateTheme('neonGrid');
      themes.setLayer('effects', true);
      
      const activeReducers = themes.getActiveThemeReducers();
      expect(activeReducers.length).toBeGreaterThan(0);
      
      const effectsReducer = activeReducers.find(r => r.layer === 'effects');
      expect(effectsReducer).toBeDefined();
    });

    test('should toggle theme reducers', () => {
      const result = themes.toggleThemeReducer('neonGrid', 'grid_renderer');
      expect(result).toBe(false); // Should toggle from enabled to disabled
    });
  });

  describe('Audio and Shader Presets', () => {
    test('should get audio presets', () => {
      const neonAudio = themes.getAudioPreset('neonGrid');
      expect(neonAudio).toBe('neon_synth');
      
      const forestAudio = themes.getAudioPreset('forestGlade');
      expect(forestAudio).toBe('forest_ambient');
    });

    test('should get shader presets', () => {
      const neonShader = themes.getShaderPreset('neonGrid');
      expect(neonShader).toBe('neon_glow');
      
      const cosmicShader = themes.getShaderPreset('cosmicVoid');
      expect(cosmicShader).toBe('cosmic_shift');
    });
  });

  describe('Theme Preview', () => {
    test('should preview themes correctly', () => {
      const preview = themes.previewTheme('neonGrid');
      expect(preview).toBeDefined();
      expect(preview?.theme.name).toBe('Neon Grid');
      expect(preview?.assets).toHaveLength(3);
      expect(preview?.reducers).toHaveLength(2);
      expect(preview?.audioPreset).toBe('neon_synth');
      expect(preview?.shaderPreset).toBe('neon_glow');
    });

    test('should return null for invalid themes', () => {
      const preview = themes.previewTheme('invalidTheme' as ThemeId);
      expect(preview).toBeNull();
    });
  });

  describe('CLI Preview', () => {
    test('should generate CLI preview', () => {
      const cliPreview = themes.getCLIPreview('neonGrid');
      expect(cliPreview).toContain('Theme: Neon Grid');
      expect(cliPreview).toContain('Description: Cyberpunk-inspired');
      expect(cliPreview).toContain('Layers: background, foreground, ui, effects, audio');
      expect(cliPreview).toContain('Assets: 3');
      expect(cliPreview).toContain('Draw Reducers: 2');
      expect(cliPreview).toContain('Audio Preset: neon_synth');
      expect(cliPreview).toContain('Shader Preset: neon_glow');
    });

    test('should include asset details in CLI preview', () => {
      const cliPreview = themes.getCLIPreview('neonGrid');
      expect(cliPreview).toContain('texture: grid_texture (remix-safe)');
      expect(cliPreview).toContain('shader: neon_shader (remix-safe)');
      expect(cliPreview).toContain('audio: synth_audio (remix-restricted)');
    });

    test('should include reducer details in CLI preview', () => {
      const cliPreview = themes.getCLIPreview('neonGrid');
      expect(cliPreview).toContain('sprite: grid_renderer (priority: 1, layer: background)');
      expect(cliPreview).toContain('effect: neon_effects (priority: 5, layer: effects)');
    });
  });

  describe('State Management', () => {
    test('should export state correctly', () => {
      themes.activateTheme('neonGrid');
      themes.setLayer('effects', true);
      
      const state = themes.exportState();
      expect(state.activeTheme).toBe('neonGrid');
      expect(state.layerVisibility.get('effects')).toBe(true);
      expect(state.availableThemes.size).toBeGreaterThan(0);
    });

    test('should import state correctly', () => {
      const testState = {
        activeTheme: 'forestGlade' as ThemeId,
        layerVisibility: new Map([['effects' as const, true]])
      };
      
      themes.importState(testState);
      expect(themes.getActiveTheme()).toBe('forestGlade');
      
      const layers = themes.getLayerVisibility();
      expect(layers.get('effects')).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete theme lifecycle', () => {
      // Activate theme
      themes.activateTheme('neonGrid');
      expect(themes.getActiveTheme()).toBe('neonGrid');
      
      // Toggle layers
      themes.toggleLayer('effects');
      themes.toggleLayer('audio');
      
      // Get active reducers
      const activeReducers = themes.getActiveThemeReducers();
      expect(activeReducers.length).toBeGreaterThan(0);
      
      // Toggle reducers
      const reducer = activeReducers[0];
      const enabled = themes.toggleThemeReducer('neonGrid', reducer.id);
      expect(enabled).toBe(false);
      
      // Deactivate theme
      themes.deactivateTheme();
      expect(themes.getActiveTheme()).toBe(null);
    });

    test('should handle multiple themes', () => {
      // Test neon theme
      themes.activateTheme('neonGrid');
      let neonAssets = themes.getThemeAssets('neonGrid');
      expect(neonAssets.length).toBeGreaterThan(0);
      
      // Switch to forest theme
      themes.activateTheme('forestGlade');
      let forestAssets = themes.getThemeAssets('forestGlade');
      expect(forestAssets.length).toBeGreaterThan(0);
      
      // Verify different assets
      expect(neonAssets).not.toEqual(forestAssets);
    });

    test('should handle layer visibility with themes', () => {
      themes.activateTheme('cosmicVoid');
      
      // Initially effects layer is disabled
      let activeReducers = themes.getActiveThemeReducers();
      const initialCount = activeReducers.length;
      
      // Enable effects layer
      themes.setLayer('effects', true);
      activeReducers = themes.getActiveThemeReducers();
      expect(activeReducers.length).toBeGreaterThan(initialCount);
      
      // Disable effects layer
      themes.setLayer('effects', false);
      activeReducers = themes.getActiveThemeReducers();
      expect(activeReducers.length).toBe(initialCount);
    });
  });
});