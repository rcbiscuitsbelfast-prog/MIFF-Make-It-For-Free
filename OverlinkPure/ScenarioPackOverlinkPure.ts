// ScenarioPackOverlinkPure — Overlink Zone Demo (Remix-Safe)
// Purpose: Demonstrates meta-zone capabilities with modular draw reducers, toggleable debug layers, and remix-safe asset bindings
// Schema: Pure JSON outputs, deterministic, engine-agnostic

import { OverlinkZone, DrawReducer, AssetBinding, ModuleConnection } from './OverlinkZone';

export type ScenarioState = {
  step: number;
  currentZone: string;
  activeModules: string[];
  overlayLayers: Record<string, boolean>;
  drawReducers: number;
  assetBindings: number;
  transitions: number;
  debugMode: boolean;
};

export type ScenarioOutput = {
  op: 'scenario';
  status: 'ok' | 'error';
  name: 'OverlinkPure';
  timeline: ScenarioState[];
  finalState: any;
  issues: string[];
};

export interface ScenarioConfig {
  steps?: number;
  enableDebug?: boolean;
  enableRemixMode?: boolean;
}

/**
 * runScenario — Demonstrates Overlink zone capabilities with a sequence of operations
 * Deterministic, remix-safe, and ready for golden fixtures.
 */
export function runScenario(cfg: ScenarioConfig = {}): ScenarioOutput {
  const steps = cfg.steps ?? 8;
  const enableDebug = cfg.enableDebug ?? false;
  const enableRemixMode = cfg.enableRemixMode ?? false;
  
  const overlink = new OverlinkZone();
  const timeline: ScenarioState[] = [];
  const issues: string[] = [];

  // Step 1: Register zones
  overlink.registerZone('hub', 'Central Hub', ['meta', 'transition']);
  overlink.registerZone('toppler', 'Toppler Demo', ['physics', 'puzzle']);
  overlink.registerZone('spirit_tamer', 'Spirit Tamer', ['rpg', 'combat']);
  overlink.registerZone('preview', 'Remix Preview', ['meta', 'preview']);

  // Step 2: Register modules with dependencies
  const topplerModule = overlink.registerModule('toppler_demo', 'toppler', []);
  const spiritTamerModule = overlink.registerModule('spirit_tamer_demo', 'spirit_tamer', []);
  const previewModule = overlink.registerModule('remix_preview', 'preview', ['toppler_demo', 'spirit_tamer_demo']);

  // Step 3: Add draw reducers
  const spriteReducer: DrawReducer = {
    id: 'sprite_renderer',
    type: 'sprite',
    priority: 1,
    enabled: true,
    data: { batchSize: 100, textureAtlas: 'main' }
  };

  const uiReducer: DrawReducer = {
    id: 'ui_renderer',
    type: 'ui',
    priority: 10,
    enabled: true,
    data: { theme: 'default', scale: 1.0 }
  };

  const effectReducer: DrawReducer = {
    id: 'effect_renderer',
    type: 'effect',
    priority: 5,
    enabled: true,
    data: { particleCount: 50, blendMode: 'additive' }
  };

  const debugReducer: DrawReducer = {
    id: 'debug_renderer',
    type: 'debug',
    priority: 100,
    enabled: false,
    data: { showFPS: true, showBounds: false }
  };

  overlink.addDrawReducer(spriteReducer);
  overlink.addDrawReducer(uiReducer);
  overlink.addDrawReducer(effectReducer);
  overlink.addDrawReducer(debugReducer);

  // Step 4: Bind assets
  const textureBinding: AssetBinding = {
    id: 'main_textures',
    type: 'texture',
    path: 'assets/textures/main.atlas',
    remixSafe: true,
    fallback: 'assets/textures/fallback.atlas'
  };

  const audioBinding: AssetBinding = {
    id: 'background_music',
    type: 'audio',
    path: 'assets/audio/ambient.ogg',
    remixSafe: false,
    fallback: 'assets/audio/silence.ogg'
  };

  const shaderBinding: AssetBinding = {
    id: 'transition_shader',
    type: 'shader',
    path: 'assets/shaders/transition.glsl',
    remixSafe: true
  };

  overlink.bindAsset(textureBinding);
  overlink.bindAsset(audioBinding);
  overlink.bindAsset(shaderBinding);

  // Step 5: Enable debug mode if requested
  if (enableDebug) {
    overlink.toggleDebugMode();
    overlink.toggleDrawReducer('debug_renderer');
  }

  // Step 6: Activate modules
  overlink.activateModule('toppler_demo');
  overlink.activateModule('spirit_tamer_demo');
  
  if (enableRemixMode) {
    overlink.activateModule('remix_preview');
  }

  // Step 7: Navigate through zones
  overlink.enterZone('hub');
  captureState(overlink, timeline, 1, 'hub');

  overlink.enterZone('toppler');
  captureState(overlink, timeline, 2, 'toppler');

  overlink.enterZone('spirit_tamer');
  captureState(overlink, timeline, 3, 'spirit_tamer');

  overlink.enterZone('preview');
  captureState(overlink, timeline, 4, 'preview');

  // Step 8: Toggle overlay layers
  overlink.toggleOverlayLayer('preview');
  captureState(overlink, timeline, 5, 'preview');

  overlink.toggleOverlayLayer('debug');
  captureState(overlink, timeline, 6, 'debug');

  // Step 9: Process transitions
  const transitions = overlink.processTransitions();
  captureState(overlink, timeline, 7, 'preview');

  // Step 10: Final state
  overlink.enterZone('hub');
  captureState(overlink, timeline, 8, 'hub');

  // Validate final state
  const finalState = overlink.exportState();
  if (finalState.currentZone !== 'hub') {
    issues.push(`Expected final zone to be 'hub', got '${finalState.currentZone}'`);
  }

  if (finalState.activeModules.length < 2) {
    issues.push(`Expected at least 2 active modules, got ${finalState.activeModules.length}`);
  }

  if (finalState.drawReducers.length !== 4) {
    issues.push(`Expected 4 draw reducers, got ${finalState.drawReducers.length}`);
  }

  if (finalState.assetBindings.length !== 3) {
    issues.push(`Expected 3 asset bindings, got ${finalState.assetBindings.length}`);
  }

  return {
    op: 'scenario',
    status: issues.length === 0 ? 'ok' : 'error',
    name: 'OverlinkPure',
    timeline,
    finalState: {
      currentZone: finalState.currentZone,
      activeModules: finalState.activeModules.map(m => ({ id: m.id, status: m.status })),
      overlayLayers: Object.fromEntries(finalState.overlayLayers),
      drawReducers: finalState.drawReducers.map(r => ({ id: r.id, enabled: r.enabled })),
      assetBindings: finalState.assetBindings.map(a => ({ id: a.id, type: a.type, remixSafe: a.remixSafe })),
      debugMode: finalState.debugMode
    },
    issues
  };
}

function captureState(overlink: OverlinkZone, timeline: ScenarioState[], step: number, zone: string): void {
  const state = overlink.exportState();
  
  timeline.push({
    step,
    currentZone: zone,
    activeModules: state.activeModules.map(m => m.id),
    overlayLayers: Object.fromEntries(state.overlayLayers),
    drawReducers: state.drawReducers.length,
    assetBindings: state.assetBindings.length,
    transitions: state.transitions.length,
    debugMode: state.debugMode
  });
}