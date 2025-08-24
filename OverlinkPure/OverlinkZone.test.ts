import { OverlinkZone, DrawReducer, AssetBinding, ModuleConnection } from './OverlinkZone';

describe('OverlinkZone', () => {
  let overlink: OverlinkZone;

  beforeEach(() => {
    overlink = new OverlinkZone();
  });

  describe('Zone Management', () => {
    test('should register zones correctly', () => {
      overlink.registerZone('hub', 'Central Hub', ['meta', 'transition']);
      overlink.registerZone('toppler', 'Toppler Demo', ['physics', 'puzzle']);
      
      expect(overlink.getCurrentZone()).toBe('');
    });

    test('should enter zones and track current zone', () => {
      overlink.registerZone('hub', 'Central Hub');
      overlink.enterZone('hub');
      
      expect(overlink.getCurrentZone()).toBe('hub');
    });

    test('should not change zone if already in target zone', () => {
      overlink.registerZone('hub', 'Central Hub');
      overlink.enterZone('hub');
      overlink.enterZone('hub'); // Enter same zone again
      
      expect(overlink.getCurrentZone()).toBe('hub');
    });
  });

  describe('Module Management', () => {
    test('should register modules correctly', () => {
      const module = overlink.registerModule('test_module', 'test_zone', []);
      
      expect(module.id).toBe('test_module');
      expect(module.zoneId).toBe('test_zone');
      expect(module.status).toBe('inactive');
      expect(module.dependencies).toEqual([]);
    });

    test('should activate modules without dependencies', () => {
      overlink.registerModule('test_module', 'test_zone', []);
      const result = overlink.activateModule('test_module');
      
      expect(result).toBe(true);
      expect(overlink.getActiveModules()).toHaveLength(1);
      expect(overlink.getActiveModules()[0].status).toBe('active');
    });

    test('should not activate modules with unmet dependencies', () => {
      overlink.registerModule('dependent_module', 'test_zone', ['required_module']);
      const result = overlink.activateModule('dependent_module');
      
      expect(result).toBe(false);
      expect(overlink.getActiveModules()).toHaveLength(0);
    });

    test('should activate modules when dependencies are met', () => {
      overlink.registerModule('required_module', 'test_zone', []);
      overlink.registerModule('dependent_module', 'test_zone', ['required_module']);
      
      overlink.activateModule('required_module');
      const result = overlink.activateModule('dependent_module');
      
      expect(result).toBe(true);
      expect(overlink.getActiveModules()).toHaveLength(2);
    });

    test('should deactivate modules correctly', () => {
      overlink.registerModule('test_module', 'test_zone', []);
      overlink.activateModule('test_module');
      overlink.deactivateModule('test_module');
      
      expect(overlink.getActiveModules()).toHaveLength(0);
    });
  });

  describe('Draw Reducer Management', () => {
    test('should add draw reducers correctly', () => {
      const reducer: DrawReducer = {
        id: 'test_renderer',
        type: 'sprite',
        priority: 1,
        enabled: true,
        data: { test: 'data' }
      };
      
      overlink.addDrawReducer(reducer);
      const reducers = overlink.getDrawReducers();
      
      expect(reducers).toHaveLength(1);
      expect(reducers[0].id).toBe('test_renderer');
    });

    test('should sort draw reducers by priority', () => {
      overlink.addDrawReducer({
        id: 'high_priority',
        type: 'ui',
        priority: 10,
        enabled: true,
        data: {}
      });
      
      overlink.addDrawReducer({
        id: 'low_priority',
        type: 'sprite',
        priority: 1,
        enabled: true,
        data: {}
      });
      
      const reducers = overlink.getDrawReducers();
      expect(reducers[0].priority).toBe(1);
      expect(reducers[1].priority).toBe(10);
    });

    test('should toggle draw reducers correctly', () => {
      overlink.addDrawReducer({
        id: 'test_renderer',
        type: 'sprite',
        priority: 1,
        enabled: true,
        data: {}
      });
      
      const result = overlink.toggleDrawReducer('test_renderer');
      expect(result).toBe(false);
      
      const reducers = overlink.getDrawReducers();
      expect(reducers).toHaveLength(0); // Only enabled reducers are returned
    });

    test('should remove draw reducers correctly', () => {
      overlink.addDrawReducer({
        id: 'test_renderer',
        type: 'sprite',
        priority: 1,
        enabled: true,
        data: {}
      });
      
      overlink.removeDrawReducer('test_renderer');
      const reducers = overlink.getDrawReducers();
      
      expect(reducers).toHaveLength(0);
    });
  });

  describe('Overlay Layer Management', () => {
    test('should toggle overlay layers correctly', () => {
      const result = overlink.toggleOverlayLayer('debug');
      expect(result).toBe(true);
      
      const layers = overlink.getOverlayLayers();
      expect(layers.get('debug')).toBe(true);
    });

    test('should set overlay layers correctly', () => {
      overlink.setOverlayLayer('preview', true);
      
      const layers = overlink.getOverlayLayers();
      expect(layers.get('preview')).toBe(true);
    });

    test('should maintain overlay layer state', () => {
      overlink.setOverlayLayer('debug', true);
      overlink.setOverlayLayer('preview', false);
      
      const layers = overlink.getOverlayLayers();
      expect(layers.get('debug')).toBe(true);
      expect(layers.get('preview')).toBe(false);
    });
  });

  describe('Asset Binding Management', () => {
    test('should bind assets correctly', () => {
      const binding: AssetBinding = {
        id: 'test_texture',
        type: 'texture',
        path: 'assets/test.png',
        remixSafe: true
      };
      
      overlink.bindAsset(binding);
      const bindings = overlink.getAssetBindings();
      
      expect(bindings).toHaveLength(1);
      expect(bindings[0].id).toBe('test_texture');
    });

    test('should retrieve asset bindings by ID', () => {
      const binding: AssetBinding = {
        id: 'test_texture',
        type: 'texture',
        path: 'assets/test.png',
        remixSafe: true
      };
      
      overlink.bindAsset(binding);
      const retrieved = overlink.getAssetBinding('test_texture');
      
      expect(retrieved).toEqual(binding);
    });

    test('should unbind assets correctly', () => {
      const binding: AssetBinding = {
        id: 'test_texture',
        type: 'texture',
        path: 'assets/test.png',
        remixSafe: true
      };
      
      overlink.bindAsset(binding);
      overlink.unbindAsset('test_texture');
      
      const bindings = overlink.getAssetBindings();
      expect(bindings).toHaveLength(0);
    });
  });

  describe('Transition Management', () => {
    test('should queue transitions correctly', () => {
      overlink.queueTransition({
        fromZone: 'hub',
        toZone: 'toppler',
        type: 'fade',
        duration: 300
      });
      
      const transitions = overlink.processTransitions();
      expect(transitions).toHaveLength(1);
      expect(transitions[0].toZone).toBe('toppler');
    });

    test('should process and clear transition queue', () => {
      overlink.queueTransition({
        fromZone: 'hub',
        toZone: 'toppler',
        type: 'fade',
        duration: 300
      });
      
      const firstProcess = overlink.processTransitions();
      expect(firstProcess).toHaveLength(1);
      
      const secondProcess = overlink.processTransitions();
      expect(secondProcess).toHaveLength(0);
    });
  });

  describe('Debug Mode', () => {
    test('should toggle debug mode correctly', () => {
      const result = overlink.toggleDebugMode();
      expect(result).toBe(true);
      
      const state = overlink.exportState();
      expect(state.debugMode).toBe(true);
    });

    test('should enable debug overlay when debug mode is enabled', () => {
      overlink.toggleDebugMode();
      
      const layers = overlink.getOverlayLayers();
      expect(layers.get('debug')).toBe(true);
    });
  });

  describe('State Management', () => {
    test('should export state correctly', () => {
      overlink.registerZone('hub', 'Central Hub');
      overlink.enterZone('hub');
      
      const state = overlink.exportState();
      expect(state.currentZone).toBe('hub');
      expect(state.activeModules).toHaveLength(0);
      expect(state.drawReducers).toHaveLength(0);
      expect(state.assetBindings).toHaveLength(0);
    });

    test('should import state correctly', () => {
      const testState = {
        currentZone: 'test_zone',
        debugMode: true
      };
      
      overlink.importState(testState);
      const state = overlink.exportState();
      
      expect(state.currentZone).toBe('test_zone');
      expect(state.debugMode).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete zone navigation flow', () => {
      // Setup zones and modules
      overlink.registerZone('hub', 'Central Hub');
      overlink.registerZone('toppler', 'Toppler Demo');
      overlink.registerZone('spirit_tamer', 'Spirit Tamer');
      
      overlink.registerModule('toppler_demo', 'toppler', []);
      overlink.registerModule('spirit_tamer_demo', 'spirit_tamer', []);
      
      // Navigate through zones
      overlink.enterZone('hub');
      expect(overlink.getCurrentZone()).toBe('hub');
      
      overlink.enterZone('toppler');
      expect(overlink.getCurrentZone()).toBe('toppler');
      
      overlink.enterZone('spirit_tamer');
      expect(overlink.getCurrentZone()).toBe('spirit_tamer');
      
      // Activate modules
      overlink.activateModule('toppler_demo');
      overlink.activateModule('spirit_tamer_demo');
      
      expect(overlink.getActiveModules()).toHaveLength(2);
      
      // Return to hub
      overlink.enterZone('hub');
      expect(overlink.getCurrentZone()).toBe('hub');
    });

    test('should handle draw reducer lifecycle', () => {
      // Add multiple reducers
      overlink.addDrawReducer({
        id: 'sprite',
        type: 'sprite',
        priority: 1,
        enabled: true,
        data: {}
      });
      
      overlink.addDrawReducer({
        id: 'ui',
        type: 'ui',
        priority: 10,
        enabled: true,
        data: {}
      });
      
      overlink.addDrawReducer({
        id: 'debug',
        type: 'debug',
        priority: 100,
        enabled: false,
        data: {}
      });
      
      // Verify initial state
      let reducers = overlink.getDrawReducers();
      expect(reducers).toHaveLength(2); // Only enabled reducers
      
      // Toggle debug reducer
      overlink.toggleDrawReducer('debug');
      reducers = overlink.getDrawReducers();
      expect(reducers).toHaveLength(3);
      
      // Remove a reducer
      overlink.removeDrawReducer('sprite');
      reducers = overlink.getDrawReducers();
      expect(reducers).toHaveLength(2);
    });

    test('should handle asset binding lifecycle', () => {
      // Bind assets
      overlink.bindAsset({
        id: 'textures',
        type: 'texture',
        path: 'assets/textures.atlas',
        remixSafe: true
      });
      
      overlink.bindAsset({
        id: 'audio',
        type: 'audio',
        path: 'assets/audio.ogg',
        remixSafe: false
      });
      
      // Verify bindings
      let bindings = overlink.getAssetBindings();
      expect(bindings).toHaveLength(2);
      
      // Retrieve specific binding
      const textureBinding = overlink.getAssetBinding('textures');
      expect(textureBinding?.type).toBe('texture');
      expect(textureBinding?.remixSafe).toBe(true);
      
      // Unbind asset
      overlink.unbindAsset('audio');
      bindings = overlink.getAssetBindings();
      expect(bindings).toHaveLength(1);
      expect(bindings[0].id).toBe('textures');
    });
  });
});