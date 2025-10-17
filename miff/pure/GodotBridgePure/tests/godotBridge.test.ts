import { GodotBridgeManager, GodotBridgeConfiguration, GodotBridgeType } from '../index';

describe('GodotBridgePure Tests', () => {

  test('✓ GodotBridgeManager can be created with valid configuration', () => {
    const config: GodotBridgeConfiguration = {
      bridgeType: GodotBridgeType?.NODE,
      communicationProtocol: 'gdnative',
      godotVersion: '4.0',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxMessageSize: 1024 * 1024,
      timeout: 5000,
      retryAttempts: 3,
      connectionPoolSize: 5,
      serializationFormat: 'json',
      compression: 'none',
      encryption: false,
      heartbeatInterval: 1000,
      reconnectInterval: 5000,
      bufferSize: 1024,
      queueSize: 100,
      batchSize: 10,
      threadPoolSize: 4,
      customSettings: {}
    };

    const bridge = new GodotBridgeManager(config);

    expect(bridge).toBeDefined();
    expect(bridge?.getConfiguration()).toEqual(config);
    expect(bridge?.getStatistics()).toBeDefined();
    expect(bridge?.getConnectionStatus()).toBe('disconnected');
  });

  test('✓ GodotBridgeManager supports different bridge types', () => {
    const nodeConfig: GodotBridgeConfiguration = {
      bridgeType: GodotBridgeType?.NODE,
      communicationProtocol: 'gdnative',
      godotVersion: '4.0',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxMessageSize: 1024 * 1024,
      timeout: 5000,
      retryAttempts: 3,
      connectionPoolSize: 5,
      serializationFormat: 'json',
      compression: 'none',
      encryption: false,
      heartbeatInterval: 1000,
      reconnectInterval: 5000,
      bufferSize: 1024,
      queueSize: 100,
      batchSize: 10,
      threadPoolSize: 4,
      customSettings: {}
    };

    const sceneConfig: GodotBridgeConfiguration = {
      ...nodeConfig,
      bridgeType: GodotBridgeType?.SCENE
    };

    const bridge1 = new GodotBridgeManager(nodeConfig);
    const bridge2 = new GodotBridgeManager(sceneConfig);

    expect(bridge1?.getConfiguration().bridgeType).toBe('node');
    expect(bridge2?.getConfiguration().bridgeType).toBe('scene');
  });

  test('✓ GodotBridgeManager handles communication protocols correctly', () => {
    const gdnativeConfig: GodotBridgeConfiguration = {
      bridgeType: GodotBridgeType?.NODE,
      communicationProtocol: 'gdnative',
      godotVersion: '4.0',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxMessageSize: 1024 * 1024,
      timeout: 5000,
      retryAttempts: 3,
      connectionPoolSize: 5,
      serializationFormat: 'json',
      compression: 'none',
      encryption: false,
      heartbeatInterval: 1000,
      reconnectInterval: 5000,
      bufferSize: 1024,
      queueSize: 100,
      batchSize: 10,
      threadPoolSize: 4,
      customSettings: {}
    };

    const gdscriptConfig: GodotBridgeConfiguration = {
      ...gdnativeConfig,
      communicationProtocol: 'gdscript'
    };

    const bridge1 = new GodotBridgeManager(gdnativeConfig);
    const bridge2 = new GodotBridgeManager(gdscriptConfig);

    expect(bridge1?.getConfiguration().communicationProtocol).toBe('gdnative');
    expect(bridge2?.getConfiguration().communicationProtocol).toBe('gdscript');
  });

  test('✓ GodotBridgeManager performance metrics are initialized', () => {
    const config: GodotBridgeConfiguration = {
      bridgeType: GodotBridgeType?.NODE,
      communicationProtocol: 'gdnative',
      godotVersion: '4.0',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxMessageSize: 1024 * 1024,
      timeout: 5000,
      retryAttempts: 3,
      connectionPoolSize: 5,
      serializationFormat: 'json',
      compression: 'none',
      encryption: false,
      heartbeatInterval: 1000,
      reconnectInterval: 5000,
      bufferSize: 1024,
      queueSize: 100,
      batchSize: 10,
      threadPoolSize: 4,
      customSettings: {}
    };

    const bridge = new GodotBridgeManager(config);
    const metrics = bridge?.getPerformanceMetrics();

    expect(metrics).toBeDefined();
    expect(metrics?.frameRate).toBe(0);
    expect(metrics?.targetFrameRate).toBe(60);
    expect(metrics?.vsyncEnabled).toBe(false);
  });

  test('✓ GodotBridgeManager statistics tracking works', () => {
    const config: GodotBridgeConfiguration = {
      bridgeType: GodotBridgeType?.NODE,
      communicationProtocol: 'gdnative',
      godotVersion: '4.0',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxMessageSize: 1024 * 1024,
      timeout: 5000,
      retryAttempts: 3,
      connectionPoolSize: 5,
      serializationFormat: 'json',
      compression: 'none',
      encryption: false,
      heartbeatInterval: 1000,
      reconnectInterval: 5000,
      bufferSize: 1024,
      queueSize: 100,
      batchSize: 10,
      threadPoolSize: 4,
      customSettings: {}
    };

    const bridge = new GodotBridgeManager(config);
    const stats = bridge?.getStatistics();

    expect(stats).toBeDefined();
    expect(stats?.totalMessages).toBe(0);
    expect(stats?.errorRate).toBe(0);
    expect(stats?.activeConnections).toBe(0);
    expect(stats?.queueDepth).toBe(0);
  });

  test('✓ GodotBridgeManager handles lifecycle events', () => {
    const config: GodotBridgeConfiguration = {
      bridgeType: GodotBridgeType?.NODE,
      communicationProtocol: 'gdnative',
      godotVersion: '4.0',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxMessageSize: 1024 * 1024,
      timeout: 5000,
      retryAttempts: 3,
      connectionPoolSize: 5,
      serializationFormat: 'json',
      compression: 'none',
      encryption: false,
      heartbeatInterval: 1000,
      reconnectInterval: 5000,
      bufferSize: 1024,
      queueSize: 100,
      batchSize: 10,
      threadPoolSize: 4,
      customSettings: {}
    };

    const bridge = new GodotBridgeManager(config);

    // Test configuration retrieval
    const retrievedConfig = bridge?.getConfiguration();
    expect(retrievedConfig?.bridgeType).toBe('node');
    expect(retrievedConfig?.communicationProtocol).toBe('gdnative');
    expect(retrievedConfig?.godotVersion).toBe('4.0');

    // Test statistics functionality
    const stats = bridge?.getStatistics();
    expect(stats?.totalMessages).toBe(0);
    expect(stats?.activeConnections).toBe(0);

    expect(bridge).toBeDefined();
  });
});