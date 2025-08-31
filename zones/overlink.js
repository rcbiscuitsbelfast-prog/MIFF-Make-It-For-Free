// Zone: Overlink - Meta-Zone Hub Sampler
// Purpose: Connects other modules (Toppler, Spirit Tamer) as a hub for transitions, overlays, and remix previews
// Modules used:
// - OverlinkZone: meta-zone management
// - ZoneSystemPure: pure routing between zones
// - UISystemPure: navigation and overlay controls
// - InputSystemPure: touch input mapping

require('ts-node/register/transpile-only');
const path = require('path');
const fs = require('fs');
const { OverlinkZone } = require('../../OverlinkPure/OverlinkZone');
const { route } = require('../../modules/pure/ZoneSystemPure.ts');
const UI = require('../../modules/pure/UISystemPure.ts');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');

function loadScenario() {
  const p = path.resolve(__dirname, '../scenarios/overlink.fixture.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function startZone() {
  // 1) Initialize Overlink zone
  const overlink = new OverlinkZone();
  
  // 2) Register zones
  overlink.registerZone('hub', 'Central Hub', ['meta', 'transition']);
  overlink.registerZone('toppler', 'Toppler Demo', ['physics', 'puzzle']);
  overlink.registerZone('spirit_tamer', 'Spirit Tamer', ['rpg', 'combat']);
  overlink.registerZone('preview', 'Remix Preview', ['meta', 'preview']);
  
  // 3) Register modules
  overlink.registerModule('toppler_demo', 'toppler', []);
  overlink.registerModule('spirit_tamer_demo', 'spirit_tamer', []);
  overlink.registerModule('remix_preview', 'preview', ['toppler_demo', 'spirit_tamer_demo']);
  
  // 4) Add draw reducers
  overlink.addDrawReducer({
    id: 'sprite_renderer',
    type: 'sprite',
    priority: 1,
    enabled: true,
    data: { batchSize: 100, textureAtlas: 'main' }
  });
  
  overlink.addDrawReducer({
    id: 'ui_renderer',
    type: 'ui',
    priority: 10,
    enabled: true,
    data: { theme: 'default', scale: 1.0 }
  });
  
  overlink.addDrawReducer({
    id: 'debug_renderer',
    type: 'debug',
    priority: 100,
    enabled: false,
    data: { showFPS: true, showBounds: false }
  });
  
  // 5) Bind assets
  overlink.bindAsset({
    id: 'main_textures',
    type: 'texture',
    path: 'assets/textures/main.atlas',
    remixSafe: true,
    fallback: 'assets/textures/fallback.atlas'
  });
  
  overlink.bindAsset({
    id: 'transition_shader',
    type: 'shader',
    path: 'assets/shaders/transition.glsl',
    remixSafe: true
  });
  
  // 6) Activate modules
  overlink.activateModule('toppler_demo');
  overlink.activateModule('spirit_tamer_demo');
  
  // 7) Enter hub zone
  overlink.enterZone('hub');
  
  // 8) Enable touch input
  const input = mapInputs([{ t: 0, type: 'tap' }], [{ type: 'tap', code: 'screen', action: 'interact' }]);
  const cursor = 'visible';
  
  // 9) Render navigation UI
  const ui = UI.renderUI([
    UI.createButton('btn_toppler', '→ Toppler Demo', 'full'),
    UI.createButton('btn_spirit_tamer', '→ Spirit Tamer', 'full'),
    UI.createButton('btn_preview', '→ Remix Preview', 'full'),
    UI.createButton('btn_debug', 'Toggle Debug', 'full'),
    UI.createButton('btn_back', '← Back to Synth Nexus', 'full')
  ]);
  
  console.log('[Overlink] UI:', JSON.stringify(ui, null, 2));
  
  // 10) Handle navigation
  function onTap(targetId) {
    const act = UI.handleTap(ui.elements, targetId);
    
    if (act.kind === 'button') {
      switch (act.id) {
        case 'btn_toppler':
          overlink.enterZone('toppler');
          const topplerRoute = route('overlink', 'toppler');
          console.log('[Overlink] Route to Toppler:', JSON.stringify(topplerRoute.route));
          return topplerRoute;
          
        case 'btn_spirit_tamer':
          overlink.enterZone('spirit_tamer');
          const spiritRoute = route('overlink', 'spirit_tamer');
          console.log('[Overlink] Route to Spirit Tamer:', JSON.stringify(spiritRoute.route));
          return spiritRoute;
          
        case 'btn_preview':
          overlink.enterZone('preview');
          overlink.toggleOverlayLayer('preview');
          console.log('[Overlink] Entered preview mode');
          return { op: 'preview', status: 'ok' };
          
        case 'btn_debug':
          const debugMode = overlink.toggleDebugMode();
          overlink.toggleDrawReducer('debug_renderer');
          console.log('[Overlink] Debug mode:', debugMode ? 'enabled' : 'disabled');
          return { op: 'debug', status: 'ok', enabled: debugMode };
          
        case 'btn_back':
          const backRoute = route('overlink', 'synth_nexus');
          console.log('[Overlink] Route back:', JSON.stringify(backRoute.route));
          return backRoute;
      }
    }
    
    return { op: 'noop', status: 'ok' };
  }
  
  // 11) Log current state
  const state = overlink.exportState();
  console.log('[Overlink] Current zone:', state.currentZone);
  console.log('[Overlink] Active modules:', state.activeModules.map(m => m.id));
  console.log('[Overlink] Draw reducers:', state.drawReducers.length);
  console.log('[Overlink] Asset bindings:', state.assetBindings.length);
  
  return { 
    status: 'ok', 
    zone: 'overlink', 
    onTap,
    state: {
      currentZone: state.currentZone,
      activeModules: state.activeModules.map(m => ({ id: m.id, status: m.status })),
      drawReducers: state.drawReducers.map(r => ({ id: r.id, enabled: r.enabled })),
      assetBindings: state.assetBindings.map(a => ({ id: a.id, type: a.type, remixSafe: a.remixSafe }))
    }
  };
}

module.exports = { startZone };