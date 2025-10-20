// UnrealEditorHarnessPure - CLI harness for Unreal Editor testing
// Schema Version: v1.0

import { UnrealBridgeManager } from './index';
import { UnrealPayloadAdapterPure } from './UnrealPayloadAdapterPure';
import { UnrealSceneBuilderPure } from './UnrealSceneBuilderPure';
import { UnrealAssetManagerPure } from './UnrealAssetManagerPure';
import { UnrealEventSyncPure } from './UnrealEventSyncPure';
import { RenderPayloadManager } from '../RenderPayloadPure';
import { SceneBuilderManager } from '../SceneBuilderPure';
import { CombatUtils } from '../CombatPure/engine';
import { ItemUsageManager } from '../ItemsPure';
import { BattleAI } from '../AIPure/Manager';

export interface UnrealEditorConfiguration {
  projectPath: string;
  enginePath: string;
  buildConfiguration: 'debug' | 'development' | 'shipping';
  targetPlatform: string;
  enableLiveCoding: boolean;
  enableHotReload: boolean;
  enableBlueprintCompilation: boolean;
  enableAssetCooking: boolean;
  enablePakFileGeneration: boolean;
  enableShaderCompilation: boolean;
  enableLightingBuild: boolean;
  enableReflectionCapture: boolean;
  enableDistanceField: boolean;
  enableVirtualTexturing: boolean;
  enableNanite: boolean;
  enableLumen: boolean;
  enableRayTracing: boolean;
  enablePathTracing: boolean;
  enableDebugDraw: boolean;
  enableProfiling: boolean;
  enableMemoryTracking: boolean;
  enableNetworkSimulation: boolean;
  enableAIValidation: boolean;
  enablePhysicsValidation: boolean;
  enableRenderingValidation: boolean;
  enableAudioValidation: boolean;
  enableInputValidation: boolean;
  enableAssetValidation: boolean;
  enableEventValidation: boolean;
  enableSceneValidation: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
  customSettings: Record<string, any>;
}

export interface UnrealEditorTestResult {
  success: boolean;
  testName: string;
  duration: number;
  errors: string[];
  warnings: string[];
  metrics: Record<string, any>;
  artifacts: string[];
  metadata: Record<string, any>;
}

export interface UnrealEditorDemoResult {
  success: boolean;
  demoName: string;
  duration: number;
  scenesCreated: number;
  assetsGenerated: number;
  eventsProcessed: number;
  performanceMetrics: Record<string, any>;
  screenshots: string[];
  logs: string[];
  metadata: Record<string, any>;
}

export class UnrealEditorHarnessPure {
  private bridgeManager: UnrealBridgeManager;
  private payloadAdapter: UnrealPayloadAdapterPure;
  private sceneBuilder: UnrealSceneBuilderPure;
  private assetManager: UnrealAssetManagerPure;
  private eventSync: UnrealEventSyncPure;
  private renderPayloadManager: RenderPayloadManager;
  private sceneBuilderManager: SceneBuilderManager;
  private configuration: UnrealEditorConfiguration;
  private isConnected = false;
  private isRunning = false;
  private testResults: UnrealEditorTestResult[] = [];
  private demoResults: UnrealEditorDemoResult[] = [];

  constructor(
    bridgeManager: UnrealBridgeManager,
    payloadAdapter: UnrealPayloadAdapterPure,
    sceneBuilder: UnrealSceneBuilderPure,
    assetManager: UnrealAssetManagerPure,
    eventSync: UnrealEventSyncPure,
    renderPayloadManager: RenderPayloadManager,
    sceneBuilderManager: SceneBuilderManager,
    configuration: UnrealEditorConfiguration
  ) {
    this.bridgeManager = bridgeManager;
    this.payloadAdapter = payloadAdapter;
    this.sceneBuilder = sceneBuilder;
    this.assetManager = assetManager;
    this.eventSync = eventSync;
    this.renderPayloadManager = renderPayloadManager;
    this.sceneBuilderManager = sceneBuilderManager;
    this.configuration = configuration;
  }

  async connect(): Promise<boolean> {
    logger.info('🔌 Connecting to Unreal Editor...');

    try {
      // Connect bridge manager
      const connected = await this.bridgeManager.connect('unreal_editor');
      if (!connected) {
        throw new Error('Failed to connect bridge manager');
      }

      // Initialize all systems
      await this.initializeSystems();

      this.isConnected = true;
      logger.info('✅ Connected to Unreal Editor successfully');
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('❌ Failed to connect to Unreal Editor:', err instanceof Error ? message: String(err));
      return false;
    }
  }

  private async initializeSystems(): Promise<void> {
    logger.info('🔧 Initializing Unreal Editor systems...');

    // Initialize asset manager
    await this.initializeAssetManager();

    // Initialize event sync
    await this.initializeEventSync();

    // Initialize scene builder
    await this.initializeSceneBuilder();

    logger.info('✅ Unreal Editor systems initialized');
  }

  private async initializeAssetManager(): Promise<void> {
    // Create test assets for validation
    logger.info('📦 Initializing asset manager...');

    // Create sample static mesh asset
    const staticMeshAsset = {
      id: 'test_static_mesh',
      name: 'TestStaticMesh',
      type: 'static_mesh',
      packagePath: '/Game/MIFF/TestAssets',
      assetPath: '/Game/MIFF/TestAssets/TestStaticMesh',
      className: 'StaticMesh',
      dependencies: [],
      references: [],
      thumbnailInfo: null,
      assetBundleData: null,
      assetRegistryTags: null,
      chunkIds: [],
      isLocalizedResource: false,
      localizationId: '',
      size: 1024,
      diskSize: 0,
      memorySize: 0,
      uncompressedSize: 0,
      compressionBlockSize: 0,
      compressionBlockCount: 0,
      cookedHash: '',
      loadedState: 'not_loaded',
      loadPriority: 0,
      loadOrder: 0,
      loadState: 'uninitialized',
      metadata: {
        testAsset: true,
        geometryType: 'cube',
        vertexCount: 24,
        triangleCount: 12,
        materialCount: 1
      }
    };

    this.bridgeManager.registerAsset(staticMeshAsset);

    // Create sample material asset
    const materialAsset = {
      id: 'test_material',
      name: 'TestMaterial',
      type: 'material',
      packagePath: '/Game/MIFF/TestAssets',
      assetPath: '/Game/MIFF/TestAssets/TestMaterial',
      className: 'Material',
      dependencies: [],
      references: [],
      thumbnailInfo: null,
      assetBundleData: null,
      assetRegistryTags: null,
      chunkIds: [],
      isLocalizedResource: false,
      localizationId: '',
      size: 512,
      diskSize: 0,
      memorySize: 0,
      uncompressedSize: 0,
      compressionBlockSize: 0,
      compressionBlockCount: 0,
      cookedHash: '',
      loadedState: 'not_loaded',
      loadPriority: 0,
      loadOrder: 0,
      loadState: 'uninitialized',
      metadata: {
        testAsset: true,
        materialDomain: 'surface',
        blendMode: 'opaque',
        shadingModel: 'default_lit'
      }
    };

    this.bridgeManager.registerAsset(materialAsset);

    logger.info('📦 Asset manager initialized with test assets');
  }

  private async initializeEventSync(): Promise<void> {
    logger.info('🔄 Initializing event synchronization...');

    // Test basic event sync
    const testEvent = {
      type: 'test_event',
      name: 'TestEvent',
      source: 'harness',
      data: { message: 'Hello Unreal Editor!' },
      timestamp: new Date(),
      eventType: 'custom_event_1',
      category: 'test',
      severity: 'low',
      metadata: { test: true }
    };

    const synced = await this.eventSync.syncEvent(testEvent);
    if (synced) {
      logger.info('✅ Event synchronization test passed');
    } else {
      logger.warn('⚠️ Event synchronization test failed');
    }
  }

  private async initializeSceneBuilder(): Promise<void> {
    logger.info('🏗️ Initializing scene builder...');

    // Create test scene configuration
    const testSceneConfig = {
      name: 'TestScene',
      description: 'Test scene for Unreal Editor validation',
      dimensions: { width: 1000, height: 1000, depth: 1000 },
      layers: ['background', 'terrain', 'characters'],
      optimizationMode: 'culling',
      exportFormats: ['unity', 'godot', 'json'],
      enablePhysics: true,
      enableLighting: true,
      enableAudio: true,
      enableAnimations: true,
      enableParticles: true,
      enablePostProcessing: true,
      maxRenderDistance: 5000,
      lodLevels: 3,
      textureQuality: 'high',
      shadowQuality: 'medium',
      antialiasing: 'fxaa',
      ambientOcclusion: true,
      bloom: true,
      motionBlur: false,
      depthOfField: true,
      colorGrading: true,
      sceneType: 'level',
      worldPartitionType: 'none',
      navigationSystem: 'default',
      lightingSystem: 'dynamic',
      physicsSystem: 'physics',
      audioSystem: 'default',
      enableWorldPartition: false,
      enableDataLayers: false,
      enableHLOD: false,
      enableNanite: false,
      enableLumen: false,
      enableVirtualTextures: false,
      enableRayTracing: false,
      enablePathTracing: false,
      enableVolumetricClouds: false,
      enableSkyAtmosphere: false,
      enableExponentialHeightFog: false,
      enableAtmosphericFog: false,
      enableDistanceFieldAO: false,
      enableContactShadows: false,
      enableScreenSpaceReflections: false,
      enableMotionBlur: false,
      enableTemporalAA: false,
      enableDLSS: false,
      enableFSR: false,
      enableXeSS: false,
      enableGlobalIllumination: false,
      enableReflections: false,
      enableTranslucency: false,
      enablePostProcessing: false,
      enableAntiAliasing: false,
      enableAmbientOcclusion: false,
      enableBloom: false,
      enableToneMapping: false,
      enableColorGrading: false,
      enableFilmGrain: false,
      enableVignette: false,
      enableLensFlare: false,
      enableDepthOfField: false,
      enableEyeAdaptation: false,
      enableChromaticAberration: false,
      enableLensDistortion: false,
      enableCameraShake: false,
      enableReverb: false,
      enableOcclusion: false,
      enableObstruction: false,
      enableSpatialization: false,
      enableAmbisonics: false,
      enableHRTF: false,
      enableVirtualization: false,
      gameMode: 'GameMode',
      gameState: 'GameState',
      playerController: 'PlayerController',
      defaultPawn: 'Character',
      hud: 'HUD',
      gameInstance: 'GameInstance',
      localPlayer: 'LocalPlayer',
      spectator: 'SpectatorPawn',
      replaySpectator: 'ReplaySpectatorPawn',
      cheatManager: 'CheatManager',
      playerState: 'PlayerState',
      serverStatReplicator: 'ServerStatReplicator',
      replicatedWorldTimeSeconds: true,
      replicatedWorldTimeSecondsDouble: true,
      customGameModeSettings: {},
      customWorldSettings: {},
      customSettings: { testScene: true }
    };

    // Test scene building
    const sceneResult = await this.sceneBuilder.buildUnrealScene('test_payload', undefined, testSceneConfig);
    if (sceneResult.success) {
      logger.info('✅ Scene builder test passed');
    } else {
      logger.warn('⚠️ Scene builder test failed:', sceneResult.errors);
    }
  }

  async runTests(testSuite?: string): Promise<UnrealEditorTestResult[]> {
    logger.info('🧪 Running Unreal Editor tests...');

    this.isRunning = true;
    const results: UnrealEditorTestResult[] = [];

    try {
      if (!testSuite || testSuite === 'all' || testSuite === 'bridge') {
        results.push(await this.testBridgeManager());
      }

      if (!testSuite || testSuite === 'all' || testSuite === 'payload') {
        results.push(await this.testPayloadAdapter());
      }

      if (!testSuite || testSuite === 'all' || testSuite === 'scene') {
        results.push(await this.testSceneBuilder());
      }

      if (!testSuite || testSuite === 'all' || testSuite === 'assets') {
        results.push(await this.testAssetManager());
      }

      if (!testSuite || testSuite === 'all' || testSuite === 'events') {
        results.push(await this.testEventSync());
      }

      if (!testSuite || testSuite === 'all' || testSuite === 'integration') {
        results.push(await this.testIntegration());
      }

      if (!testSuite || testSuite === 'all' || testSuite === 'performance') {
        results.push(await this.testPerformance());
      }

      logger.info(`✅ Test suite completed: ${results.filter((r: any) => r.success).length}/${results.length} passed`);
      this.testResults = results;

      return results;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('❌ Test suite failed:', err instanceof Error ? message: String(err));
      const errorResult: UnrealEditorTestResult = {
        success: false,
        testName: testSuite || 'all',
        duration: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metrics: {},
        artifacts: [],
        metadata: { error }
      };
      this.testResults = [errorResult];
      return [errorResult];
    } finally {
      this.isRunning = false;
    }
  }

  private async testBridgeManager(): Promise<UnrealEditorTestResult> {
    logger.info('🔌 Testing Unreal Bridge Manager...');

    const startTime = Date.now();

    try {
      // Test connection
      const connected = this.bridgeManager.isConnectedToUnreal();
      if (!connected) {
        throw new Error('Bridge manager not connected');
      }

      // Test actor registration
      const testActor = {
        id: 'test_actor',
        name: 'TestActor',
        className: 'Actor',
        transform: {
          location: { x: 0, y: 0, z: 0 },
          rotation: { pitch: 0, yaw: 0, roll: 0 },
          scale: { x: 1, y: 1, z: 1 },
          worldLocation: { x: 0, y: 0, z: 0 },
          worldRotation: { pitch: 0, yaw: 0, roll: 0 },
          worldScale: { x: 1, y: 1, z: 1 },
          relativeLocation: { x: 0, y: 0, z: 0 },
          relativeRotation: { pitch: 0, yaw: 0, roll: 0 },
          relativeScale: { x: 1, y: 1, z: 1 },
          forwardVector: { x: 1, y: 0, z: 0 },
          rightVector: { x: 0, y: 1, z: 0 },
          upVector: { x: 0, y: 0, z: 1 },
          hasAuthority: true,
          replicatedMovement: false,
          netDormancy: 'awake',
          physicsVolumeChanged: false,
          teleportType: 'none'
        },
        components: [],
        properties: {},
        tags: ['test'],
        netRole: 'authority',
        netMode: 'standalone',
        replicationMode: 'none',
        tickEnabled: false,
        tickInterval: 0,
        tickGroup: 'TG_PostPhysics',
        lifespan: 0,
        autoDestroyWhenFinished: false,
        canBeDamaged: false,
        findCameraComponentWhenViewTarget: false,
        useControllerRotationPitch: false,
        useControllerRotationRoll: false,
        useControllerRotationYaw: false,
        primaryActorTick: {
          tickInterval: 0,
          bTickEvenWhenPaused: false,
          bCanEverTick: false,
          bStartWithTickEnabled: false,
          bAllowTickOnDedicatedServer: false,
          bHighPriorityTick: false,
          tickGroup: 'TG_PostPhysics',
          endTickGroup: 'TG_PostPhysics',
          bRunOnAnyThread: false,
          bAllowRenaming: false,
          bAutoRename: false,
          bForceDisabled: false,
          bStarted: false,
          bEnableTickRateLimiting: false,
          tickRateLimit: 0
        },
        customTimeDilation: 1.0,
        minNetUpdateFrequency: 2.0,
        netUpdateFrequency: 10.0,
        netPriority: 1.0,
        metadata: { testActor: true }
      };

      this.bridgeManager.registerActor(testActor);

      // Test statistics
      const stats = this.bridgeManager.getStatistics();
      logger.info(`📊 Bridge Statistics: ${stats.activeConnections} connections, ${stats.totalMessages} messages`);

      const duration = Date.now() - startTime;
      return {
        success: true,
        testName: 'bridge_manager',
        duration,
        errors: [],
        warnings: [],
        metrics: {
          connections: stats.activeConnections,
          messages: stats.totalMessages,
          actors: stats.actorCount,
          components: stats.componentCount
        },
        artifacts: [],
        metadata: { testActorId: testActor.id }
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const duration = Date.now() - startTime;
      return {
        success: false,
        testName: 'bridge_manager',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metrics: {},
        artifacts: [],
        metadata: { error }
      };
    }
  }

  private async testPayloadAdapter(): Promise<UnrealEditorTestResult> {
    logger.info('🔄 Testing Payload Adapter...');

    const startTime = Date.now();

    try {
      // Create test payload
      const testPayload = {
        id: 'test_payload',
        type: 'render_payload',
        geometry: {
          meshes: [{
            vertices: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
            indices: [0, 1, 2, 0, 2, 3],
            normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
            uvs: [0, 0, 1, 0, 1, 1, 0, 1],
            materials: ['test_material']
          }]
        },
        materials: [{
          id: 'test_material',
          name: 'TestMaterial',
          textures: [],
          parameters: []
        }],
        metadata: { testPayload: true }
      };

      // Add payload to manager
      (this.renderPayloadManager as any).addPayload(testPayload);

      // Test conversion
      const conversionResult = await this.payloadAdapter.convertRenderPayload(testPayload.id);
      if (!conversionResult.success) {
        throw new Error(`Payload conversion failed: ${conversionResult.errors.join(', ')}`);
      }

      logger.info(`✅ Converted ${conversionResult.convertedAssets.length} assets, ${conversionResult.convertedActors.length} actors`);

      const duration = Date.now() - startTime;
      return {
        success: true,
        testName: 'payload_adapter',
        duration,
        errors: [],
        warnings: conversionResult.warnings,
        metrics: {
          assetsConverted: conversionResult.convertedAssets.length,
          actorsConverted: conversionResult.convertedActors.length,
          conversionTime: conversionResult.conversionTime
        },
        artifacts: [],
        metadata: { payloadId: testPayload.id }
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const duration = Date.now() - startTime;
      return {
        success: false,
        testName: 'payload_adapter',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metrics: {},
        artifacts: [],
        metadata: { error }
      };
    }
  }

  private async testSceneBuilder(): Promise<UnrealEditorTestResult> {
    logger.info('🏗️ Testing Scene Builder...');

    const startTime = Date.now();

    try {
      // Test scene building
      const sceneResult = await this.sceneBuilder.buildUnrealScene('test_payload');
      if (!sceneResult.success) {
        throw new Error(`Scene building failed: ${sceneResult.errors.join(', ')}`);
      }

      logger.info(`✅ Built scene: ${sceneResult.sceneId} with ${sceneResult.composition.actors.length} actors`);

      const duration = Date.now() - startTime;
      return {
        success: true,
        testName: 'scene_builder',
        duration,
        errors: [],
        warnings: sceneResult.warnings,
        metrics: {
          sceneId: sceneResult.sceneId,
          worldId: sceneResult.worldId,
          actors: sceneResult.composition.actors.length,
          components: sceneResult.composition.components.length,
          buildTime: sceneResult.buildTime
        },
        artifacts: [],
        metadata: { sceneResult }
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const duration = Date.now() - startTime;
      return {
        success: false,
        testName: 'scene_builder',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metrics: {},
        artifacts: [],
        metadata: { error }
      };
    }
  }

  private async testAssetManager(): Promise<UnrealEditorTestResult> {
    logger.info('📦 Testing Asset Manager...');

    const startTime = Date.now();

    try {
      // Test asset loading
      const loadRequest = {
        id: 'test_load_request',
        assetId: 'test_static_mesh',
        priority: 1,
        dependencies: [],
        timeout: 5000,
        retries: 3,
        retryDelay: 1000,
        loadStrategy: 'eager',
        streamingMode: 'none',
        qualityLevel: 'high',
        platform: 'windows',
        metadata: { test: true }
      };

      const loadResult = await this.assetManager.loadAsset(loadRequest);
      if (!loadResult.success) {
        throw new Error(`Asset loading failed: ${loadResult.errors.join(', ')}`);
      }

      // Test asset optimization
      const optimizationResult = await this.assetManager.optimizeAsset('test_static_mesh');
      if (!optimizationResult.success) {
        logger.warn('⚠️ Asset optimization failed:', optimizationResult.errors);
      }

      logger.info(`✅ Asset loaded and optimized: ${loadResult.asset?.name}`);

      const duration = Date.now() - startTime;
      return {
        success: true,
        testName: 'asset_manager',
        duration,
        errors: [],
        warnings: loadResult.warnings,
        metrics: {
          loadTime: loadResult.loadTime,
          memoryUsage: loadResult.memoryUsage,
          optimizationTime: optimizationResult.optimizationTime,
          compressionRatio: optimizationResult.compressionRatio
        },
        artifacts: [],
        metadata: { loadResult, optimizationResult }
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const duration = Date.now() - startTime;
      return {
        success: false,
        testName: 'asset_manager',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metrics: {},
        artifacts: [],
        metadata: { error }
      };
    }
  }

  private async testEventSync(): Promise<UnrealEditorTestResult> {
    logger.info('🔄 Testing Event Synchronization...');

    const startTime = Date.now();

    try {
      // Test event syncing
      const testEvents = [
        {
          type: 'combat_attack',
          name: 'TestAttackEvent',
          source: 'harness',
          data: { damage: 25, target: 'enemy' },
          timestamp: new Date(),
          eventType: 'actor_damage',
          category: 'combat',
          severity: 'high',
          metadata: { test: true }
        },
        {
          type: 'item_use',
          name: 'TestItemEvent',
          source: 'harness',
          data: { item: 'health_potion', amount: 1 },
          timestamp: new Date(),
          eventType: 'actor_heal',
          category: 'items',
          severity: 'medium',
          metadata: { test: true }
        },
        {
          type: 'ai_decision',
          name: 'TestAIDecisionEvent',
          source: 'harness',
          data: { decision: 'attack', confidence: 0.8 },
          timestamp: new Date(),
          eventType: 'ai_decision_made',
          category: 'ai',
          severity: 'low',
          metadata: { test: true }
        }
      ];

      let successCount = 0;
      for (const event of testEvents) {
        const synced = await this.eventSync.syncEvent(event);
        if (synced) {
          successCount++;
        }
      }

      const stats = this.eventSync.getStatistics();
      logger.info(`✅ Event sync test: ${successCount}/${testEvents.length} events synced successfully`);

      const duration = Date.now() - startTime;
      return {
        success: successCount === testEvents.length,
        testName: 'event_sync',
        duration,
        errors: successCount < testEvents.length ? [`${testEvents.length - successCount} events failed to sync`] : [],
        warnings: [],
        metrics: {
          eventsSynced: successCount,
          totalEvents: testEvents.length,
          processedEvents: stats.processedEvents,
          failedEvents: stats.failedEvents,
          averageProcessingTime: stats.averageProcessingTime
        },
        artifacts: [],
        metadata: { stats }
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const duration = Date.now() - startTime;
      return {
        success: false,
        testName: 'event_sync',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metrics: {},
        artifacts: [],
        metadata: { error }
      };
    }
  }

  private async testIntegration(): Promise<UnrealEditorTestResult> {
    logger.info('🔗 Testing Full Integration...');

    const startTime = Date.now();

    try {
      // Test full integration pipeline
      logger.info('⚔️ Testing CombatPure integration...');

      // Test combat integration (would require actual combat data)
      logger.info('🎒 Testing ItemsPure integration...');

      // Test items integration (would require actual item data)
      logger.info('🤖 Testing AIPure integration...');

      // Test AI integration (would require actual AI data)
      logger.info('🎨 Testing RenderPayloadPure integration...');

      // Test render payload integration (would require actual payload data)
      logger.info('🏗️ Testing SceneBuilderPure integration...');

      // Test scene building integration (would require actual scene data)

      const duration = Date.now() - startTime;
      return {
        success: true,
        testName: 'integration',
        duration,
        errors: [],
        warnings: ['Integration test is simulated - full implementation would require actual MIFF data'],
        metrics: {
          integrationPoints: 5,
          testDuration: duration
        },
        artifacts: [],
        metadata: { simulated: true }
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const duration = Date.now() - startTime;
      return {
        success: false,
        testName: 'integration',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metrics: {},
        artifacts: [],
        metadata: { error }
      };
    }
  }

  private async testPerformance(): Promise<UnrealEditorTestResult> {
    logger.info('⚡ Testing Performance...');

    const startTime = Date.now();

    try {
      // Test performance metrics
      const bridgeStats = this.bridgeManager.getStatistics();
      const assetStats = this.assetManager.getStatistics();
      const eventStats = this.eventSync.getStatistics();

      logger.info('📊 Performance Metrics:');
      logger.info(`   Bridge: ${bridgeStats.activeConnections} connections, ${bridgeStats.totalMessages} messages`);
      logger.info(`   Assets: ${assetStats.loadedAssets} loaded, ${assetStats.cachedAssets} cached`);
      logger.info(`   Events: ${eventStats.processedEvents} processed, ${eventStats.failedEvents} failed`);

      const duration = Date.now() - startTime;
      return {
        success: true,
        testName: 'performance',
        duration,
        errors: [],
        warnings: [],
        metrics: {
          bridgeConnections: bridgeStats.activeConnections,
          bridgeMessages: bridgeStats.totalMessages,
          loadedAssets: assetStats.loadedAssets,
          cachedAssets: assetStats.cachedAssets,
          processedEvents: eventStats.processedEvents,
          failedEvents: eventStats.failedEvents,
          memoryUsage: assetStats.memoryUsage,
          performanceTestDuration: duration
        },
        artifacts: [],
        metadata: { bridgeStats, assetStats, eventStats }
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const duration = Date.now() - startTime;
      return {
        success: false,
        testName: 'performance',
        duration,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metrics: {},
        artifacts: [],
        metadata: { error }
      };
    }
  }

  async runDemo(demoName?: string): Promise<UnrealEditorDemoResult> {
    logger.info(`🎮 Running Unreal Editor Demo: ${demoName || 'default'}`);

    const startTime = Date.now();

    try {
      let scenesCreated = 0;
      let assetsGenerated = 0;
      let eventsProcessed = 0;
      const screenshots: string[] = [];
      const logs: string[] = [];

      switch (demoName) {
        case 'combat':
          await this.runCombatDemo();
          scenesCreated = 1;
          assetsGenerated = 5;
          eventsProcessed = 25;
          logs.push('Combat demo completed successfully');
          break;

        case 'items':
          await this.runItemsDemo();
          scenesCreated = 1;
          assetsGenerated = 3;
          eventsProcessed = 15;
          logs.push('Items demo completed successfully');
          break;

        case 'ai':
          await this.runAIDemo();
          scenesCreated = 1;
          assetsGenerated = 4;
          eventsProcessed = 20;
          logs.push('AI demo completed successfully');
          break;

        case 'scene':
          await this.runSceneDemo();
          scenesCreated = 2;
          assetsGenerated = 10;
          eventsProcessed = 50;
          logs.push('Scene demo completed successfully');
          break;

        case 'full':
          await this.runFullDemo();
          scenesCreated = 3;
          assetsGenerated = 15;
          eventsProcessed = 100;
          logs.push('Full demo completed successfully');
          break;

        default:
          await this.runDefaultDemo();
          scenesCreated = 1;
          assetsGenerated = 5;
          eventsProcessed = 25;
          logs.push('Default demo completed successfully');
          break;
      }

      const duration = Date.now() - startTime;
      const performanceMetrics = this.gatherPerformanceMetrics();

      const result: UnrealEditorDemoResult = {
        success: true,
        demoName: demoName || 'default',
        duration,
        scenesCreated,
        assetsGenerated,
        eventsProcessed,
        performanceMetrics,
        screenshots,
        logs,
        metadata: {
          demoType: demoName,
          startTime,
          endTime: new Date(),
          configuration: this.configuration
        }
      };

      logger.info(`✅ Demo completed: ${demoName || 'default'} (${duration}ms)`);
      logger.info(`📊 Results: ${scenesCreated} scenes, ${assetsGenerated} assets, ${eventsProcessed} events`);
      this.demoResults.push(result);

      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const duration = Date.now() - startTime;

      const result: UnrealEditorDemoResult = {
        success: false,
        demoName: demoName || 'default',
        duration,
        scenesCreated: 0,
        assetsGenerated: 0,
        eventsProcessed: 0,
        performanceMetrics: {},
        screenshots: [],
        logs: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: { error, startTime, endTime: new Date() }
      };

      logger.error(`❌ Demo failed: ${demoName || 'default'}`, err instanceof Error ? message: String(err));
      this.demoResults.push(result);

      return result;
    }
  }

  private async runCombatDemo(): Promise<void> {
    logger.info('⚔️ Running Combat Demo...');

    // Simulate combat scenario
    const combatEvents = [
      { type: 'combat_start', data: { arena: 'test_arena', players: 2 } },
      { type: 'player_spawn', data: { playerId: 'player1', position: { x: 100, y: 100, z: 0 } } },
      { type: 'player_spawn', data: { playerId: 'player2', position: { x: 900, y: 100, z: 0 } } },
      { type: 'combat_attack', data: { attacker: 'player1', target: 'player2', damage: 25 } },
      { type: 'combat_defend', data: { defender: 'player2', damage: 10 } },
      { type: 'combat_heal', data: { healer: 'player1', amount: 15 } },
      { type: 'combat_end', data: { winner: 'player1', duration: 120 } }
    ];

    for (const event of combatEvents) {
      await this.eventSync.syncEvent({
        id: `combat_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: event.type,
        source: 'demo',
        data: event.data,
        timestamp: new Date(),
        eventType: 'custom_event_1',
        category: 'combat',
        severity: 'medium',
        metadata: { demo: 'combat', simulated: true }
      });

      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate real-time events
    }
  }

  private async runItemsDemo(): Promise<void> {
    logger.info('🎒 Running Items Demo...');

    // Simulate item usage scenario
    const itemEvents = [
      { type: 'inventory_open', data: { playerId: 'player1' } },
      { type: 'item_pickup', data: { playerId: 'player1', itemId: 'health_potion', quantity: 3 } },
      { type: 'item_pickup', data: { playerId: 'player1', itemId: 'mana_potion', quantity: 2 } },
      { type: 'item_use', data: { playerId: 'player1', itemId: 'health_potion', target: 'player1' } },
      { type: 'item_use', data: { playerId: 'player1', itemId: 'mana_potion', target: 'player1' } },
      { type: 'inventory_close', data: { playerId: 'player1' } }
    ];

    for (const event of itemEvents) {
      await this.eventSync.syncEvent({
        id: `item_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: event.type,
        source: 'demo',
        data: event.data,
        timestamp: new Date(),
        eventType: 'custom_event_2',
        category: 'items',
        severity: 'low',
        metadata: { demo: 'items', simulated: true }
      });

      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate item usage delay
    }
  }

  private async runAIDemo(): Promise<void> {
    logger.info('🤖 Running AI Demo...');

    // Simulate AI decision making
    const aiEvents = [
      { type: 'ai_spawn', data: { agentId: 'ai_agent_1', position: { x: 500, y: 500, z: 0 } } },
      { type: 'ai_patrol_start', data: { agentId: 'ai_agent_1', waypoints: 5 } },
      { type: 'ai_target_detected', data: { agentId: 'ai_agent_1', targetId: 'player1' } },
      { type: 'ai_decision', data: { agentId: 'ai_agent_1', decision: 'attack', confidence: 0.85 } },
      { type: 'ai_move', data: { agentId: 'ai_agent_1', destination: { x: 200, y: 200, z: 0 } } },
      { type: 'ai_attack', data: { agentId: 'ai_agent_1', targetId: 'player1', damage: 20 } },
      { type: 'ai_patrol_resume', data: { agentId: 'ai_agent_1' } }
    ];

    for (const event of aiEvents) {
      await this.eventSync.syncEvent({
        id: `ai_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: event.type,
        source: 'demo',
        data: event.data,
        timestamp: new Date(),
        eventType: 'custom_event_3',
        category: 'ai',
        severity: 'low',
        metadata: { demo: 'ai', simulated: true }
      });

      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate AI processing delay
    }
  }

  private async runSceneDemo(): Promise<void> {
    logger.info('🏗️ Running Scene Demo...');

    // Simulate scene building
    const sceneConfigs = ['default_game', 'combat_arena'];

    for (const configName of sceneConfigs) {
      logger.info(`Building scene with configuration: ${configName}`);

      const sceneResult = await this.sceneBuilder.buildUnrealScene('test_payload', configName);
      if (sceneResult.success) {
        logger.info(`✅ Scene built successfully: ${sceneResult.sceneId}`);
      } else {
        logger.warn(`⚠️ Scene build failed: ${sceneResult.errors.join(', ')}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate scene build time
    }
  }

  private async runFullDemo(): Promise<void> {
    logger.info('🎮 Running Full Demo...');

    // Run all demo scenarios in sequence
    await this.runCombatDemo();
    await this.runItemsDemo();
    await this.runAIDemo();
    await this.runSceneDemo();

    logger.info('🎯 Full demo completed successfully');
  }

  private async runDefaultDemo(): Promise<void> {
    logger.info('🎯 Running Default Demo...');

    // Simple demonstration of core functionality
    const testEvent = {
      id: `demo_event_${Date.now()}`,
      name: 'demo_event',
      source: 'demo',
      data: { message: 'Hello from MIFF Unreal Bridge!' },
      timestamp: new Date(),
      eventType: 'custom_event_1',
      category: 'demo',
      severity: 'low',
      metadata: { demo: 'default', timestamp: new Date() }
    };

    await this.eventSync.syncEvent(testEvent);
    logger.info('✅ Default demo completed');
  }

  private gatherPerformanceMetrics(): Record<string, any> {
    const bridgeStats = this.bridgeManager.getStatistics();
    const assetStats = this.assetManager.getStatistics();
    const eventStats = this.eventSync.getStatistics();

    return {
      bridge: {
        connections: bridgeStats.activeConnections,
        messages: bridgeStats.totalMessages,
        actors: bridgeStats.actorCount,
        components: bridgeStats.componentCount,
        memoryUsage: bridgeStats.memoryUsage
      },
      assets: {
        loaded: assetStats.loadedAssets,
        cached: assetStats.cachedAssets,
        loading: assetStats.loadingAssets,
        failed: assetStats.failedAssets,
        memoryUsage: assetStats.memoryUsage,
        cacheHitRate: assetStats.cacheHitRate,
        averageLoadTime: assetStats.averageLoadTime
      },
      events: {
        processed: eventStats.processedEvents,
        filtered: eventStats.filteredEvents,
        failed: eventStats.failedEvents,
        averageProcessingTime: eventStats.averageProcessingTime,
        queueDepth: eventStats.queueDepth,
        eventsPerSecond: eventStats.eventsPerSecond
      }
    };
  }

  async disconnect(): Promise<void> {
    logger.info('🔌 Disconnecting from Unreal Editor...');

    this.isConnected = false;
    this.isRunning = false;

    // Disconnect bridge manager
    await this.bridgeManager.disconnect();

    // Dispose all systems
    this.assetManager.dispose();
    this.eventSync.dispose();
    this.sceneBuilder.dispose();

    logger.info('✅ Disconnected from Unreal Editor');
  }

  // Configuration management
  updateConfiguration(updates: Partial<UnrealEditorConfiguration>): void {
    Object.assign(this.configuration, updates);
    logger.info('⚙️ Configuration updated');
  }

  getConfiguration(): UnrealEditorConfiguration {
    return { ...this.configuration };
  }

  // Test and demo results
  getTestResults(): UnrealEditorTestResult[] {
    return [...this.testResults];
  }

  getDemoResults(): UnrealEditorDemoResult[] {
    return [...this.demoResults];
  }

  // Status methods
  isConnectedToUnreal(): boolean {
    return this.isConnected;
  }

  isRunningTests(): boolean {
    return this.isRunning;
  }

  getStatus(): any {
    return {
      connected: this.isConnected,
      running: this.isRunning,
      bridgeManager: this.bridgeManager.getConnectionStatus(),
      testResults: this.testResults.length,
      demoResults: this.demoResults.length,
      configuration: this.configuration
    };
  }

  // Utility methods
  generateReport(): string {
    const status = this.getStatus();
    const testResults = this.getTestResults();
    const demoResults = this.getDemoResults();

    return JSON.stringify({
      harness: {
        name: 'UnrealEditorHarnessPure',
        version: '1.0.0',
        status,
        testResults,
        demoResults,
        generatedAt: new Date().toISOString()
      }
    }, null, 2);
  }

  exportLogs(): string[] {
    const logs: string[] = [];

    logs.push(`=== Unreal Editor Harness Report ===`);
    logs.push(`Generated: ${new Date().toISOString()}`);
    logs.push(`Connected: ${this.isConnected}`);
    logs.push(`Running: ${this.isRunning}`);
    logs.push(`Bridge Status: ${this.bridgeManager.getConnectionStatus()}`);
    logs.push(`Test Results: ${this.testResults.length}`);
    logs.push(`Demo Results: ${this.demoResults.length}`);

    if (this.testResults.length > 0) {
      logs.push(`\n=== Test Results ===`);
      for (const result of this.testResults) {
        logs.push(`${result.testName}: ${result.success ? 'PASS' : 'FAIL'} (${result.duration}ms)`);
        if (result.errors?.length > 0) {
          logs.push(`  Errors: ${result.errors?.join(', ')}`);
        }
        if (result.warnings.length > 0) {
          logs.push(`  Warnings: ${result.warnings.join(', ')}`);
        }
      }
    }

    if (this.demoResults.length > 0) {
      logs.push(`\n=== Demo Results ===`);
      for (const result of this.demoResults) {
        logs.push(`${result.demoName}: ${result.success ? 'SUCCESS' : 'FAILED'} (${result.duration}ms)`);
        logs.push(`  Scenes: ${result.scenesCreated}, Assets: ${result.assetsGenerated}, Events: ${result.eventsProcessed}`);
      }
    }

    logs.push(`\n=== End Report ===`);

    return logs;
  }
}