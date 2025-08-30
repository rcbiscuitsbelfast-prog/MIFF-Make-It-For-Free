/**
 * PlatformBridgePure.test.ts - Tests for PlatformBridgePure module
 * 
 * Tests platform detection, render targets, input devices, and backend management.
 */

import {
  createPlatformBridge,
  createPlatformManager,
  createAutoPlatformBridge,
  Platform,
  RenderBackend,
  InputType,
  PlatformConfig
} from './PlatformBridgePure';

describe('PlatformBridgePure', () => {
  let config: PlatformConfig;

  beforeEach(() => {
    config = {
      platform: Platform.WEB,
      renderBackend: RenderBackend.CANVAS_2D,
      enableAudio: true,
      enableInput: true,
      enableStorage: true,
      enableNetwork: true,
      maxFPS: 60,
      vsync: true,
      fullscreen: false,
      windowSize: { width: 800, height: 600 },
      features: []
    };
  });

  describe('PlatformBridge', () => {
    it('should create platform bridge with config', () => {
      const bridge = createPlatformBridge(config);
      expect(bridge).toBeDefined();
      expect(bridge.getConfig().platform).toBe(Platform.WEB);
    });

    it('should detect platform capabilities', () => {
      const bridge = createPlatformBridge(config);
      const capabilities = bridge.getCapabilities();
      
      expect(capabilities.platform).toBe(Platform.WEB);
      expect(capabilities.renderBackends).toContain(RenderBackend.CANVAS_2D);
      expect(capabilities.inputTypes).toContain(InputType.KEYBOARD);
      expect(capabilities.inputTypes).toContain(InputType.MOUSE);
    });

    it('should create render target', async () => {
      const bridge = createPlatformBridge(config);
      const target = await bridge.createRenderTarget('test-target', 'canvas', 800, 600);
      
      expect(target.id).toBe('test-target');
      expect(target.type).toBe('canvas');
      expect(target.width).toBe(800);
      expect(target.height).toBe(600);
      expect(target.backend).toBe(RenderBackend.CANVAS_2D);
    });

    it('should get render target by ID', async () => {
      const bridge = createPlatformBridge(config);
      await bridge.createRenderTarget('test-target', 'canvas', 800, 600);
      
      const target = bridge.getRenderTarget('test-target');
      expect(target).toBeDefined();
      expect(target?.id).toBe('test-target');
    });

    it('should destroy render target', async () => {
      const bridge = createPlatformBridge(config);
      await bridge.createRenderTarget('test-target', 'canvas', 800, 600);
      
      const result = bridge.destroyRenderTarget('test-target');
      expect(result).toBe(true);
      
      const target = bridge.getRenderTarget('test-target');
      expect(target).toBeUndefined();
    });

    it('should render to target', async () => {
      const bridge = createPlatformBridge(config);
      await bridge.createRenderTarget('test-target', 'canvas', 800, 600);
      
      const renderFunction = jest.fn();
      await bridge.renderToTarget('test-target', renderFunction);
      
      expect(renderFunction).toHaveBeenCalled();
    });

    it('should fail to render to non-existent target', async () => {
      const bridge = createPlatformBridge(config);
      
      const renderFunction = jest.fn();
      await expect(
        bridge.renderToTarget('non-existent', renderFunction)
      ).rejects.toThrow('Render target not found');
    });

    it('should register input device', () => {
      const bridge = createPlatformBridge(config);
      const device = {
        id: 'keyboard-1',
        type: InputType.KEYBOARD,
        name: 'Standard Keyboard',
        connected: true,
        capabilities: ['text-input', 'key-combinations'],
        data: {}
      };
      
      bridge.registerInputDevice(device);
      const registeredDevice = bridge.getInputDevice('keyboard-1');
      expect(registeredDevice).toBeDefined();
      expect(registeredDevice?.name).toBe('Standard Keyboard');
    });

    it('should unregister input device', () => {
      const bridge = createPlatformBridge(config);
      const device = {
        id: 'mouse-1',
        type: InputType.MOUSE,
        name: 'Standard Mouse',
        connected: true,
        capabilities: ['pointing', 'clicking'],
        data: {}
      };
      
      bridge.registerInputDevice(device);
      const result = bridge.unregisterInputDevice('mouse-1');
      expect(result).toBe(true);
      
      const unregisteredDevice = bridge.getInputDevice('mouse-1');
      expect(unregisteredDevice).toBeUndefined();
    });

    it('should get input devices by type', () => {
      const bridge = createPlatformBridge(config);
      
      const keyboard = {
        id: 'keyboard-1',
        type: InputType.KEYBOARD,
        name: 'Keyboard 1',
        connected: true,
        capabilities: [],
        data: {}
      };
      
      const mouse = {
        id: 'mouse-1',
        type: InputType.MOUSE,
        name: 'Mouse 1',
        connected: true,
        capabilities: [],
        data: {}
      };
      
      bridge.registerInputDevice(keyboard);
      bridge.registerInputDevice(mouse);
      
      const keyboards = bridge.getInputDevicesByType(InputType.KEYBOARD);
      const mice = bridge.getInputDevicesByType(InputType.MOUSE);
      
      expect(keyboards).toHaveLength(1);
      expect(mice).toHaveLength(1);
      expect(keyboards[0].name).toBe('Keyboard 1');
      expect(mice[0].name).toBe('Mouse 1');
    });

    it('should process input events', () => {
      const bridge = createPlatformBridge(config);
      const events = bridge.processInputEvents();
      
      expect(Array.isArray(events)).toBe(true);
    });

    it('should play audio', async () => {
      const bridge = createPlatformBridge(config);
      const audioData = { format: 'mp3', data: 'mock-audio-data' };
      
      await bridge.playAudio('test-audio', audioData, { volume: 0.5 });
      // Should not throw error
    });

    it('should stop audio', () => {
      const bridge = createPlatformBridge(config);
      const result = bridge.stopAudio('test-audio');
      expect(typeof result).toBe('boolean');
    });

    it('should save data to storage', async () => {
      const bridge = createPlatformBridge(config);
      const testData = { score: 100, level: 5 };
      
      const result = await bridge.saveData('game-save', testData);
      expect(typeof result).toBe('boolean');
    });

    it('should load data from storage', async () => {
      const bridge = createPlatformBridge(config);
      const data = await bridge.loadData('game-save');
      expect(data).toBeDefined();
    });

    it('should send network message', async () => {
      const bridge = createPlatformBridge(config);
      const message = { type: 'chat', content: 'Hello World' };
      
      const result = await bridge.sendNetworkMessage('player-1', message, { reliable: true });
      expect(typeof result).toBe('boolean');
    });

    it('should get platform statistics', () => {
      const bridge = createPlatformBridge(config);
      const stats = bridge.getStats();
      
      expect(stats).toHaveProperty('fps');
      expect(stats).toHaveProperty('frameTime');
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats).toHaveProperty('renderCalls');
      expect(stats).toHaveProperty('inputEvents');
      expect(stats).toHaveProperty('audioChannels');
      expect(stats).toHaveProperty('networkLatency');
    });

    it('should update platform statistics', () => {
      const bridge = createPlatformBridge(config);
      bridge.updateStats();
      
      const stats = bridge.getStats();
      expect(stats.fps).toBeGreaterThanOrEqual(0);
    });

    it('should check feature support', () => {
      const bridge = createPlatformBridge(config);
      const capabilities = bridge.getCapabilities();
      
      for (const feature of capabilities.features) {
        expect(bridge.isFeatureSupported(feature)).toBe(true);
      }
      
      expect(bridge.isFeatureSupported('non-existent-feature')).toBe(false);
    });

    it('should get platform configuration', () => {
      const bridge = createPlatformBridge(config);
      const bridgeConfig = bridge.getConfig();
      
      expect(bridgeConfig.platform).toBe(config.platform);
      expect(bridgeConfig.renderBackend).toBe(config.renderBackend);
      expect(bridgeConfig.maxFPS).toBe(config.maxFPS);
    });

    it('should update platform configuration', () => {
      const bridge = createPlatformBridge(config);
      
      bridge.updateConfig({ maxFPS: 120, fullscreen: true });
      const updatedConfig = bridge.getConfig();
      
      expect(updatedConfig.maxFPS).toBe(120);
      expect(updatedConfig.fullscreen).toBe(true);
    });
  });

  describe('PlatformManager', () => {
    it('should create platform manager', () => {
      const manager = createPlatformManager(config);
      expect(manager).toBeDefined();
    });

    it('should get current platform bridge', () => {
      const manager = createPlatformManager(config);
      const bridge = manager.getCurrentBridge();
      
      expect(bridge).toBeDefined();
      expect(bridge.getConfig().platform).toBe(Platform.WEB);
    });

    it('should get current platform', () => {
      const manager = createPlatformManager(config);
      const platform = manager.getCurrentPlatform();
      
      expect(platform).toBe(Platform.WEB);
    });

    it('should get platform configuration', () => {
      const manager = createPlatformManager(config);
      const managerConfig = manager.getConfig();
      
      expect(managerConfig.platform).toBe(config.platform);
      expect(managerConfig.renderBackend).toBe(config.renderBackend);
    });

    it('should get available platforms', () => {
      const manager = createPlatformManager(config);
      const platforms = manager.getAvailablePlatforms();
      
      expect(platforms).toContain(Platform.WEB);
      expect(platforms).toHaveLength(1);
    });

    it('should get bridge by platform', () => {
      const manager = createPlatformManager(config);
      const bridge = manager.getBridge(Platform.WEB);
      
      expect(bridge).toBeDefined();
      expect(bridge?.getConfig().platform).toBe(Platform.WEB);
    });

    it('should return undefined for non-existent platform bridge', () => {
      const manager = createPlatformManager(config);
      const bridge = manager.getBridge(Platform.MOBILE);
      
      expect(bridge).toBeUndefined();
    });
  });

  describe('Auto Platform Detection', () => {
    it('should create auto platform bridge', () => {
      const bridge = createAutoPlatformBridge();
      expect(bridge).toBeDefined();
      
      const config = bridge.getConfig();
      expect(config.platform).toBeDefined();
      expect(config.renderBackend).toBeDefined();
    });
  });

  describe('Platform Capabilities', () => {
    it('should detect web platform capabilities', () => {
      const webConfig: PlatformConfig = {
        ...config,
        platform: Platform.WEB
      };
      
      const bridge = createPlatformBridge(webConfig);
      const capabilities = bridge.getCapabilities();
      
      expect(capabilities.platform).toBe(Platform.WEB);
      expect(capabilities.renderBackends).toContain(RenderBackend.CANVAS_2D);
      expect(capabilities.inputTypes).toContain(InputType.KEYBOARD);
      expect(capabilities.inputTypes).toContain(InputType.MOUSE);
      expect(capabilities.audioFormats).toContain('mp3');
      expect(capabilities.storageTypes).toContain('localStorage');
      expect(capabilities.networkProtocols).toContain('websocket');
    });

    it('should detect mobile platform capabilities', () => {
      const mobileConfig: PlatformConfig = {
        ...config,
        platform: Platform.MOBILE
      };
      
      const bridge = createPlatformBridge(mobileConfig);
      const capabilities = bridge.getCapabilities();
      
      expect(capabilities.platform).toBe(Platform.MOBILE);
      expect(capabilities.inputTypes).toContain(InputType.TOUCH);
      expect(capabilities.inputTypes).toContain(InputType.GYROSCOPE);
      expect(capabilities.inputTypes).toContain(InputType.ACCELEROMETER);
      expect(capabilities.audioFormats).toContain('aac');
      expect(capabilities.limitations).toContain('limited-memory');
    });

    it('should detect desktop platform capabilities', () => {
      const desktopConfig: PlatformConfig = {
        ...config,
        platform: Platform.DESKTOP
      };
      
      const bridge = createPlatformBridge(desktopConfig);
      const capabilities = bridge.getCapabilities();
      
      expect(capabilities.platform).toBe(Platform.DESKTOP);
      expect(capabilities.renderBackends).toContain(RenderBackend.OPENGL);
      expect(capabilities.inputTypes).toContain(InputType.KEYBOARD);
      expect(capabilities.inputTypes).toContain(InputType.MOUSE);
      expect(capabilities.storageTypes).toContain('fileSystem');
      expect(capabilities.features).toContain('multithreading');
    });
  });

  describe('Render Backend Management', () => {
    it('should create canvas 2D backend', () => {
      const canvasConfig: PlatformConfig = {
        ...config,
        renderBackend: RenderBackend.CANVAS_2D
      };
      
      const bridge = createPlatformBridge(canvasConfig);
      const capabilities = bridge.getCapabilities();
      
      expect(capabilities.renderBackends).toContain(RenderBackend.CANVAS_2D);
    });

    it('should create WebGL backend', () => {
      const webglConfig: PlatformConfig = {
        ...config,
        renderBackend: RenderBackend.WEBGL
      };
      
      const bridge = createPlatformBridge(webglConfig);
      const capabilities = bridge.getCapabilities();
      
      expect(capabilities.renderBackends).toContain(RenderBackend.WEBGL);
    });

    it('should create OpenGL backend', () => {
      const openglConfig: PlatformConfig = {
        ...config,
        platform: Platform.DESKTOP,
        renderBackend: RenderBackend.OPENGL
      };
      
      const bridge = createPlatformBridge(openglConfig);
      const capabilities = bridge.getCapabilities();
      
      expect(capabilities.renderBackends).toContain(RenderBackend.OPENGL);
    });
  });

  describe('Input Device Management', () => {
    it('should handle multiple input devices', () => {
      const bridge = createPlatformBridge(config);
      
      const devices = [
        {
          id: 'keyboard-1',
          type: InputType.KEYBOARD,
          name: 'Keyboard 1',
          connected: true,
          capabilities: [],
          data: {}
        },
        {
          id: 'mouse-1',
          type: InputType.MOUSE,
          name: 'Mouse 1',
          connected: true,
          capabilities: [],
          data: {}
        },
        {
          id: 'gamepad-1',
          type: InputType.GAMEPAD,
          name: 'Gamepad 1',
          connected: true,
          capabilities: [],
          data: {}
        }
      ];
      
      for (const device of devices) {
        bridge.registerInputDevice(device);
      }
      
      const keyboards = bridge.getInputDevicesByType(InputType.KEYBOARD);
      const mice = bridge.getInputDevicesByType(InputType.MOUSE);
      const gamepads = bridge.getInputDevicesByType(InputType.GAMEPAD);
      
      expect(keyboards).toHaveLength(1);
      expect(mice).toHaveLength(1);
      expect(gamepads).toHaveLength(1);
    });

    it('should handle device disconnection', () => {
      const bridge = createPlatformBridge(config);
      const device = {
        id: 'test-device',
        type: InputType.KEYBOARD,
        name: 'Test Device',
        connected: true,
        capabilities: [],
        data: {}
      };
      
      bridge.registerInputDevice(device);
      const result = bridge.unregisterInputDevice('test-device');
      expect(result).toBe(true);
      
      const result2 = bridge.unregisterInputDevice('non-existent');
      expect(result2).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete platform workflow', async () => {
      const bridge = createPlatformBridge(config);
      
      // Create render target
      const target = await bridge.createRenderTarget('main-canvas', 'canvas', 800, 600);
      expect(target.id).toBe('main-canvas');
      
      // Register input devices
      const keyboard = {
        id: 'keyboard-1',
        type: InputType.KEYBOARD,
        name: 'Main Keyboard',
        connected: true,
        capabilities: [],
        data: {}
      };
      bridge.registerInputDevice(keyboard);
      
      // Render to target
      const renderFunction = jest.fn();
      await bridge.renderToTarget('main-canvas', renderFunction);
      expect(renderFunction).toHaveBeenCalled();
      
      // Check statistics
      bridge.updateStats();
      const stats = bridge.getStats();
      expect(stats.renderCalls).toBeGreaterThan(0);
      
      // Cleanup
      bridge.destroyRenderTarget('main-canvas');
      bridge.unregisterInputDevice('keyboard-1');
    });

    it('should handle platform switching', async () => {
      const manager = createPlatformManager(config);
      
      // Switch to mobile platform
      await manager.switchPlatform(Platform.MOBILE, {
        windowSize: { width: 360, height: 640 },
        maxFPS: 30
      });
      
      const mobileBridge = manager.getCurrentBridge();
      const mobileConfig = mobileBridge.getConfig();
      
      expect(mobileConfig.platform).toBe(Platform.MOBILE);
      expect(mobileConfig.windowSize.width).toBe(360);
      expect(mobileConfig.maxFPS).toBe(30);
      
      // Check mobile capabilities
      const capabilities = mobileBridge.getCapabilities();
      expect(capabilities.platform).toBe(Platform.MOBILE);
      expect(capabilities.inputTypes).toContain(InputType.TOUCH);
    });

    it('should handle multiple render targets', async () => {
      const bridge = createPlatformBridge(config);
      
      // Create multiple targets
      const targets = [
        { id: 'ui-canvas', width: 800, height: 600 },
        { id: 'game-canvas', width: 1024, height: 768 },
        { id: 'overlay-canvas', width: 400, height: 300 }
      ];
      
      for (const target of targets) {
        await bridge.createRenderTarget(target.id, 'canvas', target.width, target.height);
      }
      
      // Verify all targets exist
      for (const target of targets) {
        const retrieved = bridge.getRenderTarget(target.id);
        expect(retrieved).toBeDefined();
        expect(retrieved?.width).toBe(target.width);
        expect(retrieved?.height).toBe(target.height);
      }
      
      // Cleanup
      for (const target of targets) {
        bridge.destroyRenderTarget(target.id);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid render target operations', async () => {
      const bridge = createPlatformBridge(config);
      
      // Try to render to non-existent target
      const renderFunction = jest.fn();
      await expect(
        bridge.renderToTarget('non-existent', renderFunction)
      ).rejects.toThrow('Render target not found');
      
      // Try to destroy non-existent target
      const result = bridge.destroyRenderTarget('non-existent');
      expect(result).toBe(false);
    });

    it('should handle invalid input device operations', () => {
      const bridge = createPlatformBridge(config);
      
      // Try to get non-existent device
      const device = bridge.getInputDevice('non-existent');
      expect(device).toBeUndefined();
      
      // Try to unregister non-existent device
      const result = bridge.unregisterInputDevice('non-existent');
      expect(result).toBe(false);
    });

    it('should handle platform manager errors', () => {
      const manager = createPlatformManager(config);
      
      // Try to get non-existent platform bridge
      const bridge = manager.getBridge(Platform.MOBILE);
      expect(bridge).toBeUndefined();
    });
  });
});