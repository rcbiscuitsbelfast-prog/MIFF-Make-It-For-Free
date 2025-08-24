// OverlinkThemes — Visual Theme System (Remix-Safe)
// Purpose: Provides toggleable visual themes with priority-based draw reducers and remix-safe assets
// Schema: Pure JSON outputs, deterministic, engine-agnostic

export type ThemeId = 'neonGrid' | 'forestGlade' | 'cosmicVoid' | 'retroPixel' | 'cyberpunk';

export type ThemeLayer = 'background' | 'foreground' | 'ui' | 'effects' | 'audio';

export type ThemeAsset = {
  id: string;
  type: 'texture' | 'shader' | 'audio' | 'data';
  path: string;
  remixSafe: boolean;
  fallback?: string;
  themeId: ThemeId;
  layer: ThemeLayer;
  priority: number;
};

export type ThemeConfig = {
  id: ThemeId;
  name: string;
  description: string;
  layers: ThemeLayer[];
  assets: ThemeAsset[];
  drawReducers: ThemeDrawReducer[];
  audioPreset?: string;
  shaderPreset?: string;
};

export type ThemeDrawReducer = {
  id: string;
  type: 'sprite' | 'ui' | 'effect' | 'shader' | 'audio';
  priority: number;
  enabled: boolean;
  data: Record<string, any>;
  themeId: ThemeId;
  layer: ThemeLayer;
};

export type ThemeState = {
  activeTheme: ThemeId | null;
  availableThemes: Map<ThemeId, ThemeConfig>;
  themeAssets: Map<ThemeId, ThemeAsset[]>;
  themeReducers: Map<ThemeId, ThemeDrawReducer[]>;
  layerVisibility: Map<ThemeLayer, boolean>;
  audioPresets: Map<ThemeId, string>;
  shaderPresets: Map<ThemeId, string>;
};

export class OverlinkThemes {
  private state: ThemeState;
  private assetRegistry = new Map<string, ThemeAsset>();
  private reducerRegistry = new Map<string, ThemeDrawReducer>();

  constructor() {
    this.state = {
      activeTheme: null,
      availableThemes: new Map(),
      themeAssets: new Map(),
      themeReducers: new Map(),
      layerVisibility: new Map([
        ['background', true],
        ['foreground', true],
        ['ui', true],
        ['effects', false],
        ['audio', true]
      ]),
      audioPresets: new Map(),
      shaderPresets: new Map()
    };

    // Initialize default themes
    this.initializeDefaultThemes();
  }

  // Theme Management
  registerTheme(config: ThemeConfig): void {
    this.state.availableThemes.set(config.id, config);
    
    // Register theme assets
    const themeAssets = config.assets || [];
    this.state.themeAssets.set(config.id, themeAssets);
    
    // Register theme draw reducers
    const themeReducers = config.drawReducers || [];
    this.state.themeReducers.set(config.id, themeReducers);
    
    // Register audio and shader presets
    if (config.audioPreset) {
      this.state.audioPresets.set(config.id, config.audioPreset);
    }
    if (config.shaderPreset) {
      this.state.shaderPresets.set(config.id, config.shaderPreset);
    }

    // Register individual assets and reducers
    themeAssets.forEach(asset => this.registerAsset(asset));
    themeReducers.forEach(reducer => this.registerReducer(reducer));
  }

  activateTheme(themeId: ThemeId): boolean {
    if (!this.state.availableThemes.has(themeId)) {
      return false;
    }

    this.state.activeTheme = themeId;
    return true;
  }

  deactivateTheme(): void {
    this.state.activeTheme = null;
  }

  getActiveTheme(): ThemeId | null {
    return this.state.activeTheme;
  }

  getAvailableThemes(): ThemeId[] {
    return Array.from(this.state.availableThemes.keys());
  }

  getThemeConfig(themeId: ThemeId): ThemeConfig | undefined {
    return this.state.availableThemes.get(themeId);
  }

  // Layer Management
  toggleLayer(layer: ThemeLayer): boolean {
    const current = this.state.layerVisibility.get(layer) || false;
    const newState = !current;
    this.state.layerVisibility.set(layer, newState);
    return newState;
  }

  setLayer(layer: ThemeLayer, visible: boolean): void {
    this.state.layerVisibility.set(layer, visible);
  }

  getLayerVisibility(): Map<ThemeLayer, boolean> {
    return new Map(this.state.layerVisibility);
  }

  // Asset Management
  private registerAsset(asset: ThemeAsset): void {
    this.assetRegistry.set(`${asset.themeId}_${asset.id}`, asset);
  }

  getThemeAssets(themeId: ThemeId): ThemeAsset[] {
    return this.state.themeAssets.get(themeId) || [];
  }

  getAssetByType(type: 'texture' | 'shader' | 'audio' | 'data'): ThemeAsset[] {
    return Array.from(this.assetRegistry.values()).filter(asset => asset.type === type);
  }

  getRemixSafeAssets(): ThemeAsset[] {
    return Array.from(this.assetRegistry.values()).filter(asset => asset.remixSafe);
  }

  // Draw Reducer Management
  private registerReducer(reducer: ThemeDrawReducer): void {
    this.reducerRegistry.set(`${reducer.themeId}_${reducer.id}`, reducer);
  }

  getThemeReducers(themeId: ThemeId): ThemeDrawReducer[] {
    return this.state.themeReducers.get(themeId) || [];
  }

  getActiveThemeReducers(): ThemeDrawReducer[] {
    if (!this.state.activeTheme) return [];
    
    const themeReducers = this.getThemeReducers(this.state.activeTheme);
    return themeReducers.filter(reducer => 
      this.state.layerVisibility.get(reducer.layer) || false
    );
  }

  toggleThemeReducer(themeId: ThemeId, reducerId: string): boolean {
    const key = `${themeId}_${reducerId}`;
    const reducer = this.reducerRegistry.get(key);
    
    if (reducer) {
      reducer.enabled = !reducer.enabled;
      return reducer.enabled;
    }
    
    return false;
  }

  // Audio and Shader Presets
  getAudioPreset(themeId: ThemeId): string | undefined {
    return this.state.audioPresets.get(themeId);
  }

  getShaderPreset(themeId: ThemeId): string | undefined {
    return this.state.shaderPresets.get(themeId);
  }

  // Theme Preview
  previewTheme(themeId: ThemeId): {
    theme: ThemeConfig;
    assets: ThemeAsset[];
    reducers: ThemeDrawReducer[];
    audioPreset?: string;
    shaderPreset?: string;
  } | null {
    const theme = this.state.availableThemes.get(themeId);
    if (!theme) return null;

    return {
      theme,
      assets: this.getThemeAssets(themeId),
      reducers: this.getThemeReducers(themeId),
      audioPreset: this.getAudioPreset(themeId),
      shaderPreset: this.getShaderPreset(themeId)
    };
  }

  // CLI Preview Mode
  getCLIPreview(themeId: ThemeId): string {
    const preview = this.previewTheme(themeId);
    if (!preview) return `Theme '${themeId}' not found`;

    const { theme, assets, reducers, audioPreset, shaderPreset } = preview;
    
    let output = `Theme: ${theme.name}\n`;
    output += `Description: ${theme.description}\n`;
    output += `Layers: ${theme.layers.join(', ')}\n`;
    output += `Assets: ${assets.length}\n`;
    output += `Draw Reducers: ${reducers.length}\n`;
    
    if (audioPreset) output += `Audio Preset: ${audioPreset}\n`;
    if (shaderPreset) output += `Shader Preset: ${shaderPreset}\n`;
    
    output += '\nAssets:\n';
    assets.forEach(asset => {
      output += `  ${asset.type}: ${asset.id} (${asset.remixSafe ? 'remix-safe' : 'remix-restricted'})\n`;
    });
    
    output += '\nDraw Reducers:\n';
    reducers.forEach(reducer => {
      output += `  ${reducer.type}: ${reducer.id} (priority: ${reducer.priority}, layer: ${reducer.layer})\n`;
    });
    
    return output;
  }

  // State Management
  exportState(): ThemeState {
    return {
      ...this.state,
      availableThemes: new Map(this.state.availableThemes),
      themeAssets: new Map(this.state.themeAssets),
      themeReducers: new Map(this.state.themeReducers),
      layerVisibility: new Map(this.state.layerVisibility),
      audioPresets: new Map(this.state.audioPresets),
      shaderPresets: new Map(this.state.shaderPresets)
    };
  }

  importState(state: Partial<ThemeState>): void {
    if (state.activeTheme !== undefined) this.state.activeTheme = state.activeTheme;
    if (state.availableThemes) this.state.availableThemes = new Map(state.availableThemes);
    if (state.themeAssets) this.state.themeAssets = new Map(state.themeAssets);
    if (state.themeReducers) this.state.themeReducers = new Map(state.themeReducers);
    if (state.layerVisibility) this.state.layerVisibility = new Map(state.layerVisibility);
    if (state.audioPresets) this.state.audioPresets = new Map(state.audioPresets);
    if (state.shaderPresets) this.state.shaderPresets = new Map(state.shaderPresets);
  }

  // Default Theme Initialization
  private initializeDefaultThemes(): void {
    // Neon Grid Theme
    this.registerTheme({
      id: 'neonGrid',
      name: 'Neon Grid',
      description: 'Cyberpunk-inspired neon grid with electric blue and pink accents',
      layers: ['background', 'foreground', 'ui', 'effects', 'audio'],
      assets: [
        {
          id: 'grid_texture',
          type: 'texture',
          path: 'assets/themes/neon_grid/grid.png',
          remixSafe: true,
          fallback: 'assets/themes/fallback/grid.png',
          themeId: 'neonGrid',
          layer: 'background',
          priority: 1
        },
        {
          id: 'neon_shader',
          type: 'shader',
          path: 'assets/themes/neon_grid/neon.glsl',
          remixSafe: true,
          themeId: 'neonGrid',
          layer: 'effects',
          priority: 5
        },
        {
          id: 'synth_audio',
          type: 'audio',
          path: 'assets/themes/neon_grid/synth.ogg',
          remixSafe: false,
          fallback: 'assets/themes/fallback/silence.ogg',
          themeId: 'neonGrid',
          layer: 'audio',
          priority: 10
        }
      ],
      drawReducers: [
        {
          id: 'grid_renderer',
          type: 'sprite',
          priority: 1,
          enabled: true,
          data: { gridSize: 32, neonColor: '#00ffff' },
          themeId: 'neonGrid',
          layer: 'background'
        },
        {
          id: 'neon_effects',
          type: 'effect',
          priority: 5,
          enabled: true,
          data: { glowIntensity: 0.8, pulseSpeed: 2.0 },
          themeId: 'neonGrid',
          layer: 'effects'
        }
      ],
      audioPreset: 'neon_synth',
      shaderPreset: 'neon_glow'
    });

    // Forest Glade Theme
    this.registerTheme({
      id: 'forestGlade',
      name: 'Forest Glade',
      description: 'Peaceful forest environment with natural greens and earth tones',
      layers: ['background', 'foreground', 'ui', 'effects', 'audio'],
      assets: [
        {
          id: 'forest_texture',
          type: 'texture',
          path: 'assets/themes/forest_glade/forest.png',
          remixSafe: true,
          fallback: 'assets/themes/fallback/forest.png',
          themeId: 'forestGlade',
          layer: 'background',
          priority: 1
        },
        {
          id: 'nature_shader',
          type: 'shader',
          path: 'assets/themes/forest_glade/nature.glsl',
          remixSafe: true,
          themeId: 'forestGlade',
          layer: 'effects',
          priority: 3
        },
        {
          id: 'ambient_audio',
          type: 'audio',
          path: 'assets/themes/forest_glade/ambient.ogg',
          remixSafe: false,
          fallback: 'assets/themes/fallback/silence.ogg',
          themeId: 'forestGlade',
          layer: 'audio',
          priority: 8
        }
      ],
      drawReducers: [
        {
          id: 'forest_renderer',
          type: 'sprite',
          priority: 1,
          enabled: true,
          data: { treeDensity: 0.7, leafColor: '#228b22' },
          themeId: 'forestGlade',
          layer: 'background'
        },
        {
          id: 'particle_effects',
          type: 'effect',
          priority: 3,
          enabled: true,
          data: { particleCount: 100, windSpeed: 0.5 },
          themeId: 'forestGlade',
          layer: 'effects'
        }
      ],
      audioPreset: 'forest_ambient',
      shaderPreset: 'nature_soft'
    });

    // Cosmic Void Theme
    this.registerTheme({
      id: 'cosmicVoid',
      name: 'Cosmic Void',
      description: 'Deep space environment with stars, nebulae, and cosmic effects',
      layers: ['background', 'foreground', 'ui', 'effects', 'audio'],
      assets: [
        {
          id: 'space_texture',
          type: 'texture',
          path: 'assets/themes/cosmic_void/space.png',
          remixSafe: true,
          fallback: 'assets/themes/fallback/space.png',
          themeId: 'cosmicVoid',
          layer: 'background',
          priority: 1
        },
        {
          id: 'cosmic_shader',
          type: 'shader',
          path: 'assets/themes/cosmic_void/cosmic.glsl',
          remixSafe: true,
          themeId: 'cosmicVoid',
          layer: 'effects',
          priority: 7
        },
        {
          id: 'space_audio',
          type: 'audio',
          path: 'assets/themes/cosmic_void/space.ogg',
          remixSafe: false,
          fallback: 'assets/themes/fallback/silence.ogg',
          themeId: 'cosmicVoid',
          layer: 'audio',
          priority: 6
        }
      ],
      drawReducers: [
        {
          id: 'starfield_renderer',
          type: 'sprite',
          priority: 1,
          enabled: true,
          data: { starCount: 500, twinkleSpeed: 1.5 },
          themeId: 'cosmicVoid',
          layer: 'background'
        },
        {
          id: 'nebula_effects',
          type: 'effect',
          priority: 7,
          enabled: true,
          data: { nebulaDensity: 0.3, colorShift: true },
          themeId: 'cosmicVoid',
          layer: 'effects'
        }
      ],
      audioPreset: 'cosmic_ambient',
      shaderPreset: 'cosmic_shift'
    });
  }
}