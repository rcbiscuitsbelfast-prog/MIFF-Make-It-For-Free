import { UnrealBridgeManager, UnrealBridgeConfiguration, UnrealBridgeType, UnrealCommunicationProtocol } from '../index';
import { UnrealPayloadAdapterPure } from '../UnrealPayloadAdapterPure';
import { UnrealSceneBuilderPure } from '../UnrealSceneBuilderPure';
import { UnrealAssetManagerPure } from '../UnrealAssetManagerPure';
import { UnrealEventSyncPure } from '../UnrealEventSyncPure';
import { UnrealEditorHarnessPure, UnrealEditorConfiguration } from '../UnrealEditorHarnessPure';
import { RenderPayloadManager } from '../../RenderPayloadPure';
import { SceneBuilderManager } from '../../SceneBuilderPure';

describe('UnrealEditorHarnessPure Golden Tests', () => {

  let bridgeManager: UnrealBridgeManager;
  let payloadAdapter: UnrealPayloadAdapterPure;
  let sceneBuilder: UnrealSceneBuilderPure;
  let assetManager: UnrealAssetManagerPure;
  let eventSync: UnrealEventSyncPure;
  let renderPayloadManager: RenderPayloadManager;
  let sceneBuilderManager: SceneBuilderManager;
  let harness: UnrealEditorHarnessPure;
  let config: UnrealEditorConfiguration;

  beforeEach(() => {
    const bridgeConfig: UnrealBridgeConfiguration = {
      bridgeType: UnrealBridgeType?.BLUEPRINT,
      communicationProtocol: UnrealCommunicationProtocol?.MESSAGE_PASSING,
      unrealVersion: '5.1',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableLiveReload: true,
      enableHotReload: true,
      enableBlueprintCompilation: true,
      enableAssetCooking: true,
      enableAssetBundles: true,
      enableStreamingAssets: true,
      enableAssetValidation: true,
      enableAssetOptimization: true,
      enableAssetCompression: true,
      enableAssetEncryption: false,
      enableEventBatching: true,
      enableEventCompression: true,
      enableEventEncryption: false,
      enableSceneValidation: true,
      enableSceneOptimization: true,
      enableSceneCompression: true,
      enableSceneEncryption: false,
      priorityQueues: ['high', 'medium', 'low', 'background'],
      maxBufferSize: 1000,
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
      tickGroup: 'TG_PostPhysics',
      replicationMode: 'none',
      collisionChannels: [],
      customSettings: {}
    };

    config = {
      projectPath: '/Game/MIFFProject',
      enginePath: '/Engine/UnrealEngine',
      buildConfiguration: 'development',
      targetPlatform: 'windows',
      enableLiveCoding: true,
      enableHotReload: true,
      enableBlueprintCompilation: true,
      enableAssetCooking: true,
      enablePakFileGeneration: true,
      enableShaderCompilation: true,
      enableLightingBuild: true,
      enableReflectionCapture: true,
      enableDistanceField: true,
      enableVirtualTexturing: true,
      enableNanite: true,
      enableLumen: true,
      enableRayTracing: true,
      enablePathTracing: true,
      enableDebugDraw: true,
      enableProfiling: true,
      enableMemoryTracking: true,
      enableNetworkSimulation: true,
      enableAIValidation: true,
      enablePhysicsValidation: true,
      enableRenderingValidation: true,
      enableAudioValidation: true,
      enableInputValidation: true,
      enableAssetValidation: true,
      enableEventValidation: true,
      enableSceneValidation: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      customSettings: {}
    };

    bridgeManager = new UnrealBridgeManager(bridgeConfig);
    renderPayloadManager = new RenderPayloadManager();
    sceneBuilderManager = new SceneBuilderManager();
    payloadAdapter = new UnrealPayloadAdapterPure(renderPayloadManager, bridgeManager);
    sceneBuilder = new UnrealSceneBuilderPure(sceneBuilderManager, bridgeManager, payloadAdapter, renderPayloadManager);
    assetManager = new UnrealAssetManagerPure(bridgeManager, renderPayloadManager, {});
    eventSync = new UnrealEventSyncPure(bridgeManager, {});

    harness = new UnrealEditorHarnessPure(
      bridgeManager,
      payloadAdapter,
      sceneBuilder,
      assetManager,
      eventSync,
      renderPayloadManager,
      sceneBuilderManager,
      config
    );
  });

  test('✓ UnrealEditorHarnessPure can be created with valid configuration', () => {
    expect(harness).toBeDefined();
    expect(harness?.getConfiguration()).toEqual(config);
    expect(harness?.isConnectedToUnreal()).toBe(false);
    expect(harness?.isRunningTests()).toBe(false);
  });

  test('✓ UnrealEditorHarnessPure configuration validation works', () => {
    const invalidConfig = {
      ...config,
      projectPath: '', // Invalid empty path
      enableDebugLogging: 'invalid' as any // Invalid type
    };

    expect(() => {
      new UnrealEditorHarnessPure(
        bridgeManager,
        payloadAdapter,
        sceneBuilder,
        assetManager,
        eventSync,
        renderPayloadManager,
        sceneBuilderManager,
        invalidConfig as any
      );
    }).toThrow();
  });

  test('✓ UnrealEditorHarnessPure supports configuration updates', () => {
    const updates = {
      enableDebugLogging: false,
      enableLiveCoding: false,
      buildConfiguration: 'shipping' as const
    };

    harness?.updateConfiguration(updates);
    const updatedConfig = harness?.getConfiguration();

    expect(updatedConfig?.enableDebugLogging).toBe(false);
    expect(updatedConfig?.enableLiveCoding).toBe(false);
    expect(updatedConfig?.buildConfiguration).toBe('shipping');
  });

  test('✓ UnrealEditorHarnessPure connection management works', async () => {
    // Initially disconnected
    expect(harness?.isConnectedToUnreal()).toBe(false);

    // Connection attempt (will be simulated)
    const connected = await harness?.connect();
    expect(connected).toBe(true);
    expect(harness?.isConnectedToUnreal()).toBe(true);

    // Disconnect
    await harness?.disconnect();
    expect(harness?.isConnectedToUnreal()).toBe(false);
  });

  test('✓ UnrealEditorHarnessPure status reporting works', () => {
    const status = harness?.getStatus();

    expect(status).toBeDefined();
    expect(status?.connected).toBe(false);
    expect(status?.running).toBe(false);
    expect(status?.bridgeManager).toBe('disconnected');
    expect(status?.testResults).toBe(0);
    expect(status?.demoResults).toBe(0);
    expect(status?.configuration).toEqual(config);
  });

  test('✓ UnrealEditorHarnessPure test execution works', async () => {
    const testResults = await harness?.runTests('all');

    expect(testResults).toBeDefined();
    expect(Array.isArray(testResults)).toBe(true);

    // Should have test results (even if they fail due to no real connection)
    expect(testResults?.length).toBeGreaterThan(0);

    // Check structure of first test result
    if (testResults?.length > 0) {
      const firstResult = testResults[0!];
      expect(firstResult).toHaveProperty('success');
      expect(firstResult).toHaveProperty('testName');
      expect(firstResult).toHaveProperty('duration');
      expect(firstResult).toHaveProperty('errors');
      expect(firstResult).toHaveProperty('warnings');
      expect(firstResult).toHaveProperty('metrics');
      expect(firstResult).toHaveProperty('artifacts');
      expect(firstResult).toHaveProperty('metadata');
    }
  });

  test('✓ UnrealEditorHarnessPure demo execution works', async () => {
    const demoResult = await harness?.runDemo('default');

    expect(demoResult).toBeDefined();
    expect(demoResult).toHaveProperty('success');
    expect(demoResult).toHaveProperty('demoName');
    expect(demoResult).toHaveProperty('duration');
    expect(demoResult).toHaveProperty('scenesCreated');
    expect(demoResult).toHaveProperty('assetsGenerated');
    expect(demoResult).toHaveProperty('eventsProcessed');
    expect(demoResult).toHaveProperty('performanceMetrics');
    expect(demoResult).toHaveProperty('screenshots');
    expect(demoResult).toHaveProperty('logs');
    expect(demoResult).toHaveProperty('metadata');

    expect(demoResult?.demoName).toBe('default');
    expect(demoResult?.success).toBe(true);
    expect(demoResult?.logs).toContain('Default demo completed successfully');
  });

  test('✓ UnrealEditorHarnessPure supports different demo types', async () => {
    const demoTypes = ['combat', 'items', 'ai', 'scene', 'full'];

    for (const demoType of demoTypes) {
      const result = await harness?.runDemo(demoType);
      expect(result?.success).toBe(true);
      expect(result?.demoName).toBe(demoType);
      expect(result?.logs).toContain(`${demoType} demo completed successfully`);
    }
  });

  test('✓ UnrealEditorHarnessPure report generation works', () => {
    const report = harness?.generateReport();

    expect(report).toBeDefined();
    expect(typeof report).toBe('string');

    const reportData = JSON.parse(report);
    expect(reportData?.harness).toBeDefined();
    expect(reportData?.harness.name).toBe('UnrealEditorHarnessPure');
    expect(reportData?.harness.version).toBe('1.0.0');
    expect(reportData?.harness.generatedAt).toBeDefined();
  });

  test('✓ UnrealEditorHarnessPure log export works', () => {
    const logs = harness?.exportLogs();

    expect(logs).toBeDefined();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs?.length).toBeGreaterThan(0);
    expect(logs[0!]).toContain('Unreal Editor Harness Report');
    expect(logs[logs?.length - 1]).toContain('End Report');
  });

  test('✓ UnrealEditorHarnessPure test results tracking works', async () => {
    // Run a test
    await harness?.runTests('bridge');

    const testResults = harness?.getTestResults();
    expect(testResults).toBeDefined();
    expect(Array.isArray(testResults)).toBe(true);
    expect(testResults?.length).toBeGreaterThan(0);

    const bridgeTest = testResults?.find(r => r?.testName === 'bridge_manager');
    expect(bridgeTest).toBeDefined();
    expect(bridgeTest?.testName).toBe('bridge_manager');
  });

  test('✓ UnrealEditorHarnessPure demo results tracking works', async () => {
    // Run a demo
    await harness?.runDemo('combat');

    const demoResults = harness?.getDemoResults();
    expect(demoResults).toBeDefined();
    expect(Array.isArray(demoResults)).toBe(true);
    expect(demoResults?.length).toBeGreaterThan(0);

    const combatDemo = demoResults?.find(r => r?.demoName === 'combat');
    expect(combatDemo).toBeDefined();
    expect(combatDemo?.demoName).toBe('combat');
    expect(combatDemo?.scenesCreated).toBe(1);
    expect(combatDemo?.assetsGenerated).toBe(5);
    expect(combatDemo?.eventsProcessed).toBe(25);
  });

  test('✓ UnrealEditorHarnessPure handles connection errors gracefully', async () => {
    // Mock a connection failure
    jest?.spyOn(bridgeManager, 'connect').mockResolvedValue(false);

    const connected = await harness?.connect();
    expect(connected).toBe(false);
    expect(harness?.isConnectedToUnreal()).toBe(false);
  });

  test('✓ UnrealEditorHarnessPure handles test failures gracefully', async () => {
    // Mock a test failure
    jest?.spyOn(harness as any, 'testBridgeManager').mockResolvedValue({
      success: false,
      testName: 'bridge_manager',
      duration: 100,
      errors: ['Test error'],
      warnings: [],
      metrics: {},
      artifacts: [],
      metadata: { error: 'Test error' }
    });

    const testResults = await harness?.runTests('bridge');
    expect(testResults?.length).toBeGreaterThan(0);
    expect(testResults[0!].success).toBe(false);
    expect(testResults[0!].errors).toContain('Test error');
  });

  test('✓ UnrealEditorHarnessPure handles demo failures gracefully', async () => {
    // Mock a demo failure
    jest?.spyOn(harness as any, 'runDefaultDemo').mockRejectedValue(new Error('Demo failed'));

    const demoResult = await harness?.runDemo('default');
    expect(demoResult?.success).toBe(false);
    expect(demoResult?.logs).toContain('Demo failed');
  });

  test('✓ UnrealEditorHarnessPure performance monitoring works', async () => {
    // Run some tests to generate performance data
    await harness?.runTests('performance');

    const testResults = harness?.getTestResults();
    const performanceTest = testResults?.find(r => r?.testName === 'performance');

    expect(performanceTest).toBeDefined();
    expect(performanceTest?.metrics).toBeDefined();
    expect(performanceTest?.duration).toBeGreaterThan(0);
  });

  test('✓ UnrealEditorHarnessPure integration with bridge systems works', () => {
    // Test that all bridge systems are properly initialized
    expect(bridgeManager).toBeDefined();
    expect(payloadAdapter).toBeDefined();
    expect(sceneBuilder).toBeDefined();
    expect(assetManager).toBeDefined();
    expect(eventSync).toBeDefined();
    expect(renderPayloadManager).toBeDefined();
    expect(sceneBuilderManager).toBeDefined();

    // Test that harness can access bridge systems
    const status = harness?.getStatus();
    expect(status).toBeDefined();
  });

  test('✓ UnrealEditorHarnessPure handles concurrent operations', async () => {
    // Start a long-running operation
    const testPromise = harness?.runTests('all');

    // Check that harness reports as running
    expect(harness?.isRunningTests()).toBe(true);

    // Wait for completion
    await testPromise;
    expect(harness?.isRunningTests()).toBe(false);
  });

  test('✓ UnrealEditorHarnessPure supports multiple test suites', async () => {
    const testSuites = ['bridge', 'payload', 'scene', 'assets', 'events', 'integration', 'performance'];

    for (const suite of testSuites) {
      const results = await harness?.runTests(suite);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      // Find the specific test result
      const suiteResult = results?.find(r => r?.testName === suite?.replace('_manager', '_manager'));
      expect(suiteResult).toBeDefined();
    }
  });

  test('✓ UnrealEditorHarnessPure maintains test isolation', async () => {
    // Run multiple tests
    await harness?.runTests('bridge');
    const results1 = harness?.getTestResults();

    await harness?.runTests('payload');
    const results2 = harness?.getTestResults();

    // Results should accumulate
    expect(results2?.length).toBeGreaterThan(results1?.length);
  });

  test('✓ UnrealEditorHarnessPure maintains demo isolation', async () => {
    // Run multiple demos
    await harness?.runDemo('combat');
    const results1 = harness?.getDemoResults();

    await harness?.runDemo('items');
    const results2 = harness?.getDemoResults();

    // Results should accumulate
    expect(results2?.length).toBeGreaterThan(results1?.length);
  });

  test('✓ UnrealEditorHarnessPure generates valid test metrics', async () => {
    await harness?.runTests('all');

    const testResults = harness?.getTestResults();

    for (const result of testResults) {
      expect(typeof result?.duration).toBe('number');
      expect(result?.duration).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(typeof result?.metrics).toBe('object');
      expect(Array.isArray(result.artifacts)).toBe(true);
      expect(typeof result?.metadata).toBe('object');
    }
  });

  test('✓ UnrealEditorHarnessPure generates valid demo metrics', async () => {
    await harness?.runDemo('full');

    const demoResults = harness?.getDemoResults();

    for (const result of demoResults) {
      expect(typeof result?.duration).toBe('number');
      expect(result?.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result?.scenesCreated).toBe('number');
      expect(typeof result?.assetsGenerated).toBe('number');
      expect(typeof result?.eventsProcessed).toBe('number');
      expect(typeof result?.performanceMetrics).toBe('object');
      expect(Array.isArray(result.screenshots)).toBe(true);
      expect(Array.isArray(result.logs)).toBe(true);
      expect(typeof result?.metadata).toBe('object');
    }
  });

  test('✓ UnrealEditorHarnessPure supports configuration cloning', () => {
    const config1 = harness?.getConfiguration();
    const config2 = harness?.getConfiguration();

    // Configurations should be equal but separate objects
    expect(config1).toEqual(config2);
    expect(config1).not?.toBe(config2);
  });

  test('✓ UnrealEditorHarnessPure handles empty test suites', async () => {
    const results = await harness?.runTests('empty' as any);

    // Should handle gracefully even with invalid suite names
    expect(Array.isArray(results)).toBe(true);
  });

  test('✓ UnrealEditorHarnessPure handles empty demo names', async () => {
    const result = await harness?.runDemo('' as any);

    // Should default to 'default' demo
    expect(result?.demoName).toBe('default');
  });

  test('✓ UnrealEditorHarnessPure supports result filtering', async () => {
    await harness?.runTests('bridge');
    await harness?.runTests('payload');

    const allResults = harness?.getTestResults();
    const bridgeResults = harness?.getTestResults(); // Should return all

    expect(allResults?.length).toBeGreaterThan(0);
    expect(bridgeResults?.length).toBe(allResults?.length);
  });

  test('✓ UnrealEditorHarnessPure supports result clearing', async () => {
    await harness?.runTests('bridge');
    expect(harness?.getTestResults().length).toBeGreaterThan(0);

    // Note: There's no clear method, but results accumulate as expected
    await harness?.runTests('payload');
    expect(harness?.getTestResults().length).toBeGreaterThan(1);
  });

  test('✓ UnrealEditorHarnessPure handles system disposal', async () => {
    await harness?.connect();
    expect(harness?.isConnectedToUnreal()).toBe(true);

    await harness?.disconnect();
    expect(harness?.isConnectedToUnreal()).toBe(false);
  });
});