// UnrealSceneBuilderPure - Scene composition from MIFF data for Unreal Engine
// Schema Version: v1.0

import { SceneBuilderManager, SceneBuildConfiguration, SceneLayer, SceneOptimizationMode, SceneExportFormat } from '../SceneBuilderPure';
import { UnrealBridgeManager, UnrealActorBridge, UnrealSceneBridge, UnrealLevelBridge, UnrealWorldBridge } from './index';
import { RenderPayloadManager } from '../RenderPayloadPure';
import { UnrealPayloadAdapterPure } from './UnrealPayloadAdapterPure';

export enum UnrealSceneType {
  LEVEL = 'level',
  WORLD = 'world',
  SUBLEVEL = 'sublevel',
  STREAMING_LEVEL = 'streaming_level',
  PERSISTENT_LEVEL = 'persistent_level',
  PLAY_IN_EDITOR = 'play_in_editor',
  GAME_PREVIEW = 'game_preview',
  SIMULATION = 'simulation'
}

export enum UnrealWorldPartitionType {
  NONE = 'none',
  GRID = 'grid',
  HIERARCHICAL = 'hierarchical',
  CUSTOM = 'custom'
}

export enum UnrealNavigationSystem {
  DEFAULT = 'default',
  CUSTOM = 'custom',
  NONE = 'none'
}

export enum UnrealLightingSystem {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
  STATIONARY = 'stationary',
  MOVABLE = 'movable',
  LUMEN = 'lumen',
  RAY_TRACING = 'ray_tracing',
  PATH_TRACING = 'path_tracing'
}

export enum UnrealPhysicsSystem {
  PHYSICS = 'physics',
  CHAOS = 'chaos',
  CUSTOM = 'custom',
  NONE = 'none'
}

export enum UnrealAudioSystem {
  DEFAULT = 'default',
  WWISE = 'wwise',
  FMOD = 'fmod',
  CUSTOM = 'custom'
}

export interface UnrealSceneBuildConfiguration extends SceneBuildConfiguration {
  sceneType: UnrealSceneType;
  worldPartitionType: UnrealWorldPartitionType;
  navigationSystem: UnrealNavigationSystem;
  lightingSystem: UnrealLightingSystem;
  physicsSystem: UnrealPhysicsSystem;
  audioSystem: UnrealAudioSystem;
  enableWorldPartition: boolean;
  enableDataLayers: boolean;
  enableHLOD: boolean;
  enableNanite: boolean;
  enableLumen: boolean;
  enableVirtualTextures: boolean;
  enableRayTracing: boolean;
  enablePathTracing: boolean;
  enableVolumetricClouds: boolean;
  enableSkyAtmosphere: boolean;
  enableExponentialHeightFog: boolean;
  enableAtmosphericFog: boolean;
  enableDistanceFieldAO: boolean;
  enableContactShadows: boolean;
  enableScreenSpaceReflections: boolean;
  enableMotionBlur: boolean;
  enableTemporalAA: boolean;
  enableDLSS: boolean;
  enableFSR: boolean;
  enableXeSS: boolean;
  enableGlobalIllumination: boolean;
  enableReflections: boolean;
  enableTranslucency: boolean;
  enablePostProcessing: boolean;
  enableAntiAliasing: boolean;
  enableAmbientOcclusion: boolean;
  enableBloom: boolean;
  enableToneMapping: boolean;
  enableColorGrading: boolean;
  enableFilmGrain: boolean;
  enableVignette: boolean;
  enableLensFlare: boolean;
  enableDepthOfField: boolean;
  enableEyeAdaptation: boolean;
  // duplicate removed
  enableChromaticAberration: boolean;
  enableLensDistortion: boolean;
  enableCameraShake: boolean;
  enableReverb: boolean;
  enableOcclusion: boolean;
  enableObstruction: boolean;
  enableSpatialization: boolean;
  enableAmbisonics: boolean;
  enableHRTF: boolean;
  enableVirtualization: boolean;
  gameMode: string;
  gameState: string;
  playerController: string;
  defaultPawn: string;
  hud: string;
  gameInstance: string;
  localPlayer: string;
  spectator: string;
  replaySpectator: string;
  cheatManager: string;
  playerState: string;
  serverStatReplicator: string;
  replicatedWorldTimeSeconds: boolean;
  replicatedWorldTimeSecondsDouble: boolean;
  customGameModeSettings: Record<string, any>;
  customWorldSettings: Record<string, any>;
}

export interface UnrealSceneComposition {
  world: UnrealWorldBridge;
  persistentLevel: UnrealLevelBridge;
  streamingLevels: UnrealLevelBridge[];
  dataLayers: UnrealDataLayer[];
  worldPartitions: UnrealWorldPartition[];
  navigationSystem: UnrealNavigationSystemBridge;
  lightingSystem: UnrealLightingSystemBridge;
  physicsSystem: UnrealPhysicsSystemBridge;
  audioSystem: UnrealAudioSystemBridge;
  actors: UnrealActorBridge[];
  components: any[];
  systems: any[];
  services: any[];
  gameMode: any;
  gameState: any;
  playerControllers: any[];
  aiControllers: any[];
  pawns: any[];
  characters: any[];
  metadata: Record<string, any>;
}

export interface UnrealDataLayer {
  id: string;
  name: string;
  description: string;
  actors: string[];
  components: string[];
  dataLayerAsset: string;
  dataLayerType: 'runtime' | 'editor' | 'both';
  bIsVisible: boolean;
  bIsLoaded: boolean;
  bIsInitiallyLoaded: boolean;
  bIsInitiallyVisible: boolean;
  priority: number;
  metadata: Record<string, any>;
}

export interface UnrealWorldPartition {
  id: string;
  name: string;
  type: UnrealWorldPartitionType;
  gridSize: number;
  cellSize: number;
  loadingRange: number;
  blockOnSlowLoading: boolean;
  dataLayers: string[];
  hlodLayers: string[];
  actors: string[];
  components: string[];
  alwaysLoadedActors: string[];
  runtimeGrid: any;
  editorGrid: any;
  metadata: Record<string, any>;
}

export interface UnrealNavigationSystemBridge {
  id: string;
  name: string;
  navigationSystemClass: string;
  defaultAgentRadius: number;
  defaultAgentHeight: number;
  defaultAgentStepHeight: number;
  defaultCellSize: number;
  defaultCellHeight: number;
  maxSimultaneousTileGenerationJobsCount: number;
  tileNumberHardLimit: number;
  maxSimplificationError: number;
  maxEdgeLength: number;
  minRegionArea: number;
  mergeRegionSize: number;
  maxVertsPerPoly: number;
  tilePoolSize: number;
  navigationDataResolution: number;
  activeTilesUpdateInterval: number;
  dirtyAreasUpdateInterval: number;
  dirtyAreasUpdateFrequency: number;
  bGenerateNavigationOnlyAroundNavigationInvokers: boolean;
  bUseNavigationDataChunkGrid: boolean;
  supportedAgentsMask: number;
  defaultDrawDistance: number;
  maxDrawDistance: number;
  bAllowClientSideNavigation: boolean;
  bSupportRebuilding: boolean;
  bInitialBuildingLocked: boolean;
  bSkipAgentHeightCheckWhenPickingNavData: boolean;
  bTickWhilePaused: boolean;
  bPauseDuringCinematic: boolean;
  bAllowAutoRebuilding: boolean;
  metadata: Record<string, any>;
}

export interface UnrealLightingSystemBridge {
  id: string;
  name: string;
  lightingSystemType: 'static' | 'dynamic' | 'lumen' | 'ray_tracing' | 'path_tracing';
  globalIlluminationType: 'none' | 'lightmass' | 'lumen' | 'ray_tracing';
  reflectionType: 'none' | 'reflection_captures' | 'lumen' | 'ray_tracing' | 'screen_space';
  shadowType: 'none' | 'baked' | 'dynamic' | 'ray_traced';
  volumetricLightingType: 'none' | 'fog' | 'clouds' | 'atmosphere';
  skyLightType: 'none' | 'static' | 'dynamic' | 'real_time_capture';
  ambientOcclusionType: 'none' | 'static' | 'dynamic' | 'distance_field' | 'ray_traced';
  lightmapType: 'none' | 'lightmass' | 'gpu_lightmass' | 'lumen';
  lightmapResolution: number;
  numLightmapCoefficients: number;
  bUseAmbientOcclusion: boolean;
  bUseDistanceFieldAmbientOcclusion: boolean;
  bUseRayTracedAmbientOcclusion: boolean;
  bUseGlobalIllumination: boolean;
  bUseReflections: boolean;
  bUseTranslucencyVolume: boolean;
  bUseVolumetricLightmap: boolean;
  bUseVirtualShadowMaps: boolean;
  bCompressLightmaps: boolean;
  bGenerateDistanceField: boolean;
  bGenerateMeshDistanceFields: boolean;
  bGenerateGlobalDistanceField: boolean;
  bGenerateStaticMeshDistanceFields: boolean;
  bGenerateSkeletalMeshDistanceFields: boolean;
  bGenerateLandscapeDistanceFields: boolean;
  bGenerateVirtualShadowMaps: boolean;
  bGenerateSignedDistanceFields: boolean;
  bGenerateLightmapAtlas: boolean;
  bGenerateVolumetricLightmap: boolean;
  bUseLightmapAtlas: boolean;
  bUseVirtualTextures: boolean;
  bUseRuntimeVirtualTextures: boolean;
  bUseNanite: boolean;
  bUseLumen: boolean;
  bUseHardwareRayTracing: boolean;
  bUseRayTracing: boolean;
  bUsePathTracing: boolean;
  bUseVirtualShadowMaps: boolean;
  bUseSignedDistanceFields: boolean;
  bUseMeshDistanceFields: boolean;
  bUseGlobalDistanceField: boolean;
  bUseStaticMeshDistanceFields: boolean;
  bUseSkeletalMeshDistanceFields: boolean;
  bUseLandscapeDistanceFields: boolean;
  metadata: Record<string, any>;
}

export interface UnrealPhysicsSystemBridge {
  id: string;
  name: string;
  physicsSystemType: 'physics' | 'chaos' | 'custom';
  gravity: { x: number; y: number; z: number };
  defaultFluidFriction: number;
  defaultTerminalVelocity: number;
  defaultFluidDensity: number;
  sleepLinearVelocityThreshold: number;
  sleepAngularVelocityThreshold: number;
  sleepConeLimit: number;
  defaultLinearDamping: number;
  defaultAngularDamping: number;
  defaultRestitutionThreshold: number;
  defaultContactOffsetMultiplier: number;
  defaultDeformableMeshRestitution: number;
  defaultDeformableMeshFriction: number;
  defaultDeformableMeshDamping: number;
  defaultDeformableMeshMaxDepenetrationVelocity: number;
  bEnablePhysicsSubstepping: boolean;
  bEnableEnhancedDeterminism: boolean;
  bEnableStabilization: boolean;
  bWarnMissingLocks: boolean;
  bEnable2DPhysics: boolean;
  bDefaultHasComplexCollision: boolean;
  bSimulateComplexCollision: boolean;
  bDisableContactGraph: boolean;
  bEnableContactGraph: boolean;
  bUseContactGraphForCollision: boolean;
  bUseContactGraphForSimulation: boolean;
  bDisableCCD: boolean;
  bEnableCCD: boolean;
  bUseCCDForCollision: boolean;
  bUseCCDForSimulation: boolean;
  maxPhysicsDeltaTime: number;
  maxSubstepDeltaTime: number;
  maxSubsteps: number;
  maxDepenetrationVelocity: number;
  contactOffsetMultiplier: number;
  minContactOffset: number;
  maxContactOffset: number;
  separationLinearVelocityThreshold: number;
  separationAngularVelocityThreshold: number;
  maxLinearVelocity: number;
  maxAngularVelocity: number;
  linearVelocityTolerance: number;
  angularVelocityTolerance: number;
  metadata: Record<string, any>;
}

export interface UnrealAudioSystemBridge {
  id: string;
  name: string;
  audioSystemType: 'default' | 'wwise' | 'fmod' | 'custom';
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  masterBus: string;
  musicBus: string;
  sfxBus: string;
  voiceBus: string;
  reverbBus: string;
  ambientBus: string;
  uiBus: string;
  maxActiveSounds: number;
  maxVirtualSounds: number;
  maxActiveEvents: number;
  maxActiveSwitches: number;
  maxActiveStates: number;
  maxActiveListeners: number;
  maxActivePorts: number;
  maxActiveGameSyncs: number;
  maxActiveTriggers: number;
  maxActiveArguments: number;
  maxActiveLayers: number;
  maxActivePositions: number;
  maxActivePositioning: number;
  bEnableSpatialAudio: boolean;
  bEnableReverb: boolean;
  bEnableOcclusion: boolean;
  bEnableObstruction: boolean;
  bEnableVirtualization: boolean;
  bEnableHRTF: boolean;
  bEnableAmbisonics: boolean;
  bEnableBinaural: boolean;
  bEnablePersonalizedHRTF: boolean;
  bEnable3DAudio: boolean;
  bEnableDynamicRoomModeling: boolean;
  bEnableDynamicRoomCorrection: boolean;
  bEnableSoundPropagation: boolean;
  bEnableSoundOcclusion: boolean;
  bEnableSoundObstruction: boolean;
  bEnableSoundVirtualization: boolean;
  bEnableSoundAttenuation: boolean;
  bEnableSoundConcurrency: boolean;
  bEnableSoundLimiting: boolean;
  bEnableSoundModulation: boolean;
  bEnableSoundMarkers: boolean;
  bEnableSoundSync: boolean;
  bEnableSoundRandomization: boolean;
  bEnableSoundVariation: boolean;
  bEnableSoundAnalysis: boolean;
  bEnableSoundVisualization: boolean;
  bEnableSoundDebug: boolean;
  bEnableSoundStats: boolean;
  bEnableSoundMemoryStats: boolean;
  bEnableSoundCPUTimeStats: boolean;
  bEnableSoundGPUTimeStats: boolean;
  bEnableSoundBandwidthStats: boolean;
  bEnableSoundVoiceStats: boolean;
  bEnableSoundPluginStats: boolean;
  bEnableSoundPlatformStats: boolean;
  bEnableSoundEngineStats: boolean;
  metadata: Record<string, any>;
}

export interface UnrealSceneBuildResult {
  success: boolean;
  sceneId: string;
  worldId: string;
  buildTime: number;
  composition: UnrealSceneComposition;
  warnings: string[];
  errors: string[];
  metadata: Record<string, any>;
}

export class UnrealSceneBuilderPure {
  private sceneBuilderManager: SceneBuilderManager;
  private bridgeManager: UnrealBridgeManager;
  private payloadAdapter: UnrealPayloadAdapterPure;
  private renderPayloadManager: RenderPayloadManager;
  private sceneConfigurations: Map<string, UnrealSceneBuildConfiguration> = new Map();

  constructor(
    sceneBuilderManager: SceneBuilderManager,
    bridgeManager: UnrealBridgeManager,
    payloadAdapter: UnrealPayloadAdapterPure,
    renderPayloadManager: RenderPayloadManager
  ) {
    this.sceneBuilderManager = sceneBuilderManager;
    this.bridgeManager = bridgeManager;
    this.payloadAdapter = payloadAdapter;
    this.renderPayloadManager = renderPayloadManager;
    this.initializeDefaultConfigurations();
  }

  private initializeDefaultConfigurations(): void {
    console.log('[UnrealSceneBuilderPure] Initializing default scene configurations...');

    // Default Game Scene Configuration
    const defaultGameConfig: UnrealSceneBuildConfiguration = {
      sceneType: UnrealSceneType.LEVEL,
      worldPartitionType: UnrealWorldPartitionType.GRID,
      navigationSystem: UnrealNavigationSystem.DEFAULT,
      lightingSystem: UnrealLightingSystem.LUMEN,
      physicsSystem: UnrealPhysicsSystem.CHAOS,
      audioSystem: UnrealAudioSystem.DEFAULT,
      name: 'DefaultGameScene',
      description: 'Default Unreal game scene with full feature set',
      dimensions: { width: 10000, height: 10000, depth: 10000 },
      layers: [
        SceneLayer.BACKGROUND,
        SceneLayer.TERRAIN,
        SceneLayer.STRUCTURES,
        SceneLayer.INTERACTABLES,
        SceneLayer.CHARACTERS,
        SceneLayer.EFFECTS,
        SceneLayer.UI,
        SceneLayer.OVERLAY
      ],
      optimizationMode: SceneOptimizationMode.CULLING as any,
      exportFormats: [SceneExportFormat.UNITY, SceneExportFormat.GODOT, SceneExportFormat.JSON] as any,
      enablePhysics: true,
      enableLighting: true,
      enableAudio: true,
      enableAnimations: true,
      enableParticles: true,
      enablePostProcessing: true,
      maxRenderDistance: 10000,
      lodLevels: 4,
      textureQuality: 'high',
      shadowQuality: 'high',
      antialiasing: 'msaa_4x',
      ambientOcclusion: true,
      bloom: true,
      motionBlur: true,
      depthOfField: true,
      colorGrading: true,
      enableWorldPartition: true,
      enableDataLayers: true,
      enableHLOD: true,
      enableNanite: true,
      enableLumen: true,
      enableVirtualTextures: true,
      enableRayTracing: true,
      enablePathTracing: true,
      enableVolumetricClouds: true,
      enableSkyAtmosphere: true,
      enableExponentialHeightFog: true,
      enableAtmosphericFog: true,
      enableDistanceFieldAO: true,
      enableContactShadows: true,
      enableScreenSpaceReflections: true,
      enableMotionBlur: true,
      enableTemporalAA: true,
      enableDLSS: true,
      enableFSR: true,
      enableXeSS: true,
      enableGlobalIllumination: true,
      enableReflections: true,
      enableTranslucency: true,
      enablePostProcessing: true,
      enableAntiAliasing: true,
      enableAmbientOcclusion: true,
      enableBloom: true,
      enableToneMapping: true,
      enableColorGrading: true,
      enableFilmGrain: true,
      enableVignette: true,
      enableLensFlare: true,
      enableDepthOfField: true,
      enableEyeAdaptation: true,
      enableChromaticAberration: true,
      enableLensDistortion: true,
      enableCameraShake: true,
      enableReverb: true,
      enableOcclusion: true,
      enableObstruction: true,
      enableSpatialization: true,
      enableAmbisonics: true,
      enableHRTF: true,
      enableVirtualization: true,
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
      customSettings: {}
    };

    this.sceneConfigurations.set('default_game', defaultGameConfig);

    // Combat Arena Configuration
    const combatArenaConfig: UnrealSceneBuildConfiguration = {
      sceneType: UnrealSceneType.LEVEL,
      worldPartitionType: UnrealWorldPartitionType.NONE,
      navigationSystem: UnrealNavigationSystem.DEFAULT,
      lightingSystem: UnrealLightingSystem.DYNAMIC,
      physicsSystem: UnrealPhysicsSystem.CHAOS,
      audioSystem: UnrealAudioSystem.DEFAULT,
      name: 'CombatArena',
      description: 'Combat arena for battles and fights',
      dimensions: { width: 5000, height: 5000, depth: 1000 },
      layers: [
        SceneLayer.TERRAIN,
        SceneLayer.STRUCTURES,
        SceneLayer.INTERACTABLES,
        SceneLayer.CHARACTERS,
        SceneLayer.EFFECTS
      ],
      optimizationMode: SceneOptimizationMode.CULLING as any,
      exportFormats: [SceneExportFormat.UNITY, SceneExportFormat.GODOT, SceneExportFormat.JSON] as any,
      enablePhysics: true,
      enableLighting: true,
      enableAudio: true,
      enableAnimations: true,
      enableParticles: true,
      enablePostProcessing: false,
      maxRenderDistance: 2500,
      lodLevels: 3,
      textureQuality: 'high',
      shadowQuality: 'high',
      antialiasing: 'fxaa',
      ambientOcclusion: false,
      bloom: false,
      motionBlur: false,
      depthOfField: false,
      colorGrading: false,
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
      gameMode: 'CombatGameMode',
      gameState: 'CombatGameState',
      playerController: 'CombatPlayerController',
      defaultPawn: 'CombatCharacter',
      hud: 'CombatHUD',
      gameInstance: 'CombatGameInstance',
      localPlayer: 'CombatLocalPlayer',
      spectator: 'CombatSpectatorPawn',
      replaySpectator: 'CombatReplaySpectatorPawn',
      cheatManager: 'CombatCheatManager',
      playerState: 'CombatPlayerState',
      serverStatReplicator: 'CombatServerStatReplicator',
      replicatedWorldTimeSeconds: true,
      replicatedWorldTimeSecondsDouble: true,
      customGameModeSettings: {
        arenaBounds: { x: 5000, y: 5000, z: 1000 },
        spawnPoints: [
          { x: 500, y: 500, z: 0 },
          { x: 4500, y: 500, z: 0 },
          { x: 500, y: 4500, z: 0 },
          { x: 4500, y: 4500, z: 0 }
        ],
        respawnTime: 5.0,
        matchDuration: 300.0,
        maxPlayers: 8,
        teamCount: 2,
        gameRules: 'deathmatch'
      },
      customWorldSettings: {
        killZ: -1000,
        worldOriginLocation: { x: 0, y: 0, z: 0 },
        bWorldOriginShifting: true,
        bEnableWorldOriginRebasing: true,
        bUseClientSideLevelStreamingVolumes: true,
        bEnableLevelStreaming: true,
        bEnableHierarchicalLOD: false,
        bEnableDistanceFieldAO: false,
        bEnableContactShadows: false,
        bEnableScreenSpaceReflections: false
      },
      customSettings: {}
    };

    this.sceneConfigurations.set('combat_arena', combatArenaConfig);

    console.log(`[UnrealSceneBuilderPure] Initialized ${this.sceneConfigurations.size} scene configurations`);
  }

  async buildUnrealScene(
    payloadId: string,
    configurationId?: string,
    options?: Partial<UnrealSceneBuildConfiguration>
  ): Promise<UnrealSceneBuildResult> {
    console.log(`[UnrealSceneBuilderPure] Building Unreal scene from payload: ${payloadId}`);

    try {
      // Get or create configuration
      let config: UnrealSceneBuildConfiguration;
      if (configurationId) {
        const existingConfig = this.sceneConfigurations.get(configurationId);
        if (!existingConfig) {
          throw new Error(`Scene configuration not found: ${configurationId}`);
        }
        config = { ...existingConfig, ...options };
      } else {
        config = {
          sceneType: UnrealSceneType.LEVEL,
          worldPartitionType: UnrealWorldPartitionType.NONE,
          navigationSystem: UnrealNavigationSystem.DEFAULT,
          lightingSystem: UnrealLightingSystem.DYNAMIC,
          physicsSystem: UnrealPhysicsSystem.PHYSICS,
          audioSystem: UnrealAudioSystem.DEFAULT,
          name: 'UnrealScene',
          description: 'Unreal scene built from MIFF data',
          dimensions: { width: 10000, height: 10000, depth: 10000 },
          layers: [SceneLayer.BACKGROUND, SceneLayer.TERRAIN, SceneLayer.CHARACTERS],
          optimizationMode: SceneOptimizationMode.CULLING as any,
          exportFormats: [SceneExportFormat.UNITY, SceneExportFormat.GODOT, SceneExportFormat.JSON] as any,
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
          customSettings: {},
          ...options
        };
      }

      const startTime = Date.now();

      // Convert payload to Unreal format
      console.log('[UnrealSceneBuilderPure] Converting render payload to Unreal format...');
      const conversionResult = await this.payloadAdapter.convertRenderPayload(payloadId, configurationId, config);

      if (!conversionResult.success) {
        throw new Error(`Payload conversion failed: ${conversionResult.errors.join(', ')}`);
      }

      // Build scene composition
      console.log('[UnrealSceneBuilderPure] Building scene composition...');
      const composition = await this.buildSceneComposition(config, conversionResult);

      // Create world and level structures
      console.log('[UnrealSceneBuilderPure] Creating world and level structures...');
      const world = this.createUnrealWorld(config, composition);
      const persistentLevel = this.createUnrealLevel(config, composition);

      // Create navigation system
      console.log('[UnrealSceneBuilderPure] Creating navigation system...');
      const navigationSystem = this.createNavigationSystem(config);

      // Create lighting system
      console.log('[UnrealSceneBuilderPure] Creating lighting system...');
      const lightingSystem = this.createLightingSystem(config);

      // Create physics system
      console.log('[UnrealSceneBuilderPure] Creating physics system...');
      const physicsSystem = this.createPhysicsSystem(config);

      // Create audio system
      console.log('[UnrealSceneBuilderPure] Creating audio system...');
      const audioSystem = this.createAudioSystem(config);

      // Register all components with bridge manager
      console.log('[UnrealSceneBuilderPure] Registering components with bridge manager...');
      this.registerSceneComponents(composition);

      const buildTime = Date.now() - startTime;

      const result: UnrealSceneBuildResult = {
        success: true,
        sceneId: `unreal_scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        worldId: world.id,
        buildTime,
        composition,
        warnings: conversionResult.warnings,
        errors: conversionResult.errors,
        metadata: {
          configuration: config,
          sourcePayloadId: payloadId,
          conversionResult,
          buildDuration: buildTime,
          actorCount: composition.actors.length,
          componentCount: composition.components.length,
          systemCount: composition.systems.length,
          serviceCount: composition.services.length
        }
      };

      console.log(`[UnrealSceneBuilderPure] Scene build completed: ${result.success ? 'SUCCESS' : 'PARTIAL'}`);
      console.log(`[UnrealSceneBuilderPure] Created world: ${world.name} (${world.id})`);
      console.log(`[UnrealSceneBuilderPure] Created level: ${persistentLevel.name} (${persistentLevel.id})`);
      console.log(`[UnrealSceneBuilderPure] Registered ${composition.actors.length} actors, ${composition.components.length} components`);
      console.log(`[UnrealSceneBuilderPure] Build time: ${buildTime}ms`);
      console.log(`[UnrealSceneBuilderPure] Warnings: ${result.warnings.length}, Errors: ${result.errors.length}`);

      return result;

    } catch (error) {
      console.error('[UnrealSceneBuilderPure] Scene build failed:', error);

      return {
        success: false,
        sceneId: `unreal_scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        worldId: '',
        buildTime: 0,
        composition: null as any,
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          configuration: null,
          sourcePayloadId: payloadId,
          error: error
        }
      };
    }
  }

  private async buildSceneComposition(
    config: UnrealSceneBuildConfiguration,
    conversionResult: any
  ): Promise<UnrealSceneComposition> {
    console.log('[UnrealSceneBuilderPure] Building scene composition...');

    const composition: UnrealSceneComposition = {
      world: null as any,
      persistentLevel: null as any,
      streamingLevels: [],
      dataLayers: [],
      worldPartitions: [],
      navigationSystem: null as any,
      lightingSystem: null as any,
      physicsSystem: null as any,
      audioSystem: null as any,
      actors: conversionResult.convertedActors,
      components: conversionResult.convertedComponents,
      systems: [],
      services: [],
      gameMode: null,
      gameState: null,
      playerControllers: [],
      aiControllers: [],
      pawns: [],
      characters: [],
      metadata: {
        configuration: config,
        conversionResult: conversionResult,
        compositionTime: Date.now()
      }
    };

    return composition;
  }

  private createUnrealWorld(config: UnrealSceneBuildConfiguration, composition: UnrealSceneComposition): UnrealWorldBridge {
    return {
      id: `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      worldType: 'game',
      timeSeconds: 0,
      realTimeSeconds: 0,
      audioTimeSeconds: 0,
      deltaTimeSeconds: 0,
      pauseDelay: 0,
      timeDilation: 1.0,
      worldOriginLocation: { x: 0, y: 0, z: 0 },
      bWorldOriginShifted: false,
      bIsWorldInitialized: false,
      bIsDefaultLevel: true,
      bIsPartitionedWorld: config.enableWorldPartition,
      bShouldSimulatePhysics: config.enablePhysics,
      bShouldTick: true,
      bIsTearingDown: false,
      bIsBuilt: false,
      bIsBeingReset: false,
      bIsVisible: true,
      bIsLoaded: false,
      bHasBegunPlay: false,
      bIsInSeamlessTravel: false,
      bIsDefaultLevelVisible: true,
      bIsPartitioned: config.enableWorldPartition,
      bIsWorldPartitioned: config.enableWorldPartition,
      bCanBePartitioned: config.enableWorldPartition,
      bIsVisibleInSceneOutliner: true,
      metadata: {
        configuration: config,
        composition: composition,
        creationTime: Date.now()
      }
    };
  }

  private createUnrealLevel(config: UnrealSceneBuildConfiguration, composition: UnrealSceneComposition): UnrealLevelBridge {
    return {
      id: `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${config.name}_Level`,
      path: `/Game/MIFF/Levels/${config.name}_Level`,
      persistentLevel: '',
      streamedLevels: [],
      levelScriptBlueprint: '',
      worldSettings: null,
      gameMode: config.gameMode,
      defaultPawn: config.defaultPawn,
      hudClass: config.hud,
      playerController: config.playerController,
      gameState: config.gameState,
      spectatorClass: config.spectator,
      defaultPhysicsVolume: 'DefaultPhysicsVolume',
      defaultGameMode: config.gameMode,
      globalGravity: -980.0,
      levelBounds: {
        min: { x: -config.dimensions.width / 2, y: -config.dimensions.height / 2, z: -config.dimensions.depth! / 2 },
        max: { x: config.dimensions.width / 2, y: config.dimensions.height / 2, z: config.dimensions.depth! / 2 }
      },
      numTextureStreamingUnbuiltComponents: 0,
      numTextureStreamingDirtyResources: 0,
      bIsVisible: true,
      bIsLocked: false,
      bIsPartitioned: config.enableWorldPartition,
      levelColor: { r: 0.5, g: 0.5, b: 0.5 },
      metadata: {
        configuration: config,
        composition: composition,
        creationTime: Date.now()
      }
    };
  }

  private createNavigationSystem(config: UnrealSceneBuildConfiguration): UnrealNavigationSystemBridge {
    return {
      id: `navigation_system_${Date.now()}`,
      name: 'NavigationSystem',
      navigationSystemClass: 'NavigationSystemV1',
      defaultAgentRadius: 34.0,
      defaultAgentHeight: 144.0,
      defaultAgentStepHeight: 35.0,
      defaultCellSize: 19.0,
      defaultCellHeight: 19.0,
      maxSimultaneousTileGenerationJobsCount: 4,
      tileNumberHardLimit: 1000,
      maxSimplificationError: 1.3,
      maxEdgeLength: 1200.0,
      minRegionArea: 0.0,
      mergeRegionSize: 20.0,
      maxVertsPerPoly: 6.0,
      tilePoolSize: 100,
      navigationDataResolution: 4.0,
      activeTilesUpdateInterval: 1.0,
      dirtyAreasUpdateInterval: 0.5,
      dirtyAreasUpdateFrequency: 2.0,
      bGenerateNavigationOnlyAroundNavigationInvokers: false,
      bUseNavigationDataChunkGrid: false,
      supportedAgentsMask: 1,
      defaultDrawDistance: 5000.0,
      maxDrawDistance: 25000.0,
      bAllowClientSideNavigation: true,
      bSupportRebuilding: true,
      bInitialBuildingLocked: false,
      bSkipAgentHeightCheckWhenPickingNavData: false,
      bTickWhilePaused: false,
      bPauseDuringCinematic: false,
      bAllowAutoRebuilding: true,
      metadata: {
        configuration: config,
        creationTime: Date.now()
      }
    };
  }

  private createLightingSystem(config: UnrealSceneBuildConfiguration): UnrealLightingSystemBridge {
    return {
      id: `lighting_system_${Date.now()}`,
      name: 'LightingSystem',
      lightingSystemType: config.lightingSystem === UnrealLightingSystem.LUMEN ? 'lumen' : 'static',
      globalIlluminationType: config.enableLumen ? 'lumen' : 'lightmass',
      reflectionType: config.enableLumen ? 'lumen' : 'reflection_captures',
      shadowType: 'baked',
      volumetricLightingType: config.enableVolumetricClouds ? 'clouds' : 'none',
      skyLightType: config.enableSkyAtmosphere ? 'real_time_capture' : 'static',
      ambientOcclusionType: config.enableDistanceFieldAO ? 'distance_field' : 'none',
      lightmapType: config.enableLumen ? 'lumen' : 'lightmass',
      lightmapResolution: config.lightmapResolution,
      numLightmapCoefficients: 4,
      bUseAmbientOcclusion: config.enableAmbientOcclusion,
      bUseDistanceFieldAmbientOcclusion: config.enableDistanceFieldAO,
      bUseRayTracedAmbientOcclusion: config.enableRayTracing,
      bUseGlobalIllumination: config.enableGlobalIllumination,
      bUseReflections: config.enableReflections,
      bUseTranslucencyVolume: config.enableTranslucency,
      bUseVolumetricLightmap: config.enableLumen,
      bUseVirtualShadowMaps: config.enableVirtualTextures,
      bCompressLightmaps: true,
      bGenerateDistanceField: config.enableDistanceField,
      bGenerateMeshDistanceFields: (config as any).enableMeshDistanceFields,
      bGenerateGlobalDistanceField: (config as any).enableGlobalDistanceField,
      bGenerateStaticMeshDistanceFields: (config as any).enableStaticMeshDistanceFields,
      bGenerateSkeletalMeshDistanceFields: (config as any).enableSkeletalMeshDistanceFields,
      bGenerateLandscapeDistanceFields: (config as any).enableLandscapeDistanceFields,
      bGenerateVirtualShadowMaps: config.enableVirtualTextures,
      bGenerateSignedDistanceFields: (config as any).enableSignedDistanceField,
      bGenerateLightmapAtlas: true,
      bGenerateVolumetricLightmap: config.enableLumen,
      bUseLightmapAtlas: true,
      bUseVirtualTextures: config.enableVirtualTextures,
      bUseRuntimeVirtualTextures: config.enableVirtualTextures,
      bUseNanite: config.enableNanite,
      bUseLumen: config.enableLumen,
      bUseHardwareRayTracing: config.enableRayTracing,
      bUseRayTracing: config.enableRayTracing,
      bUsePathTracing: config.enablePathTracing,
      bUseVirtualShadowMaps: config.enableVirtualTextures,
      bUseSignedDistanceFields: (config as any).enableSignedDistanceField,
      bUseMeshDistanceFields: (config as any).enableMeshDistanceFields,
      bUseGlobalDistanceField: (config as any).enableGlobalDistanceField,
      bUseStaticMeshDistanceFields: (config as any).enableStaticMeshDistanceFields,
      bUseSkeletalMeshDistanceFields: (config as any).enableSkeletalMeshDistanceFields,
      bUseLandscapeDistanceFields: (config as any).enableLandscapeDistanceFields,
      metadata: {
        configuration: config,
        creationTime: Date.now()
      }
    };
  }

  private createPhysicsSystem(config: UnrealSceneBuildConfiguration): UnrealPhysicsSystemBridge {
    return {
      id: `physics_system_${Date.now()}`,
      name: 'PhysicsSystem',
      physicsSystemType: config.physicsSystem === UnrealPhysicsSystem.CHAOS ? 'chaos' : 'physics',
      gravity: { x: 0, y: 0, z: -980 },
      defaultFluidFriction: 0.3,
      defaultTerminalVelocity: 4000.0,
      defaultFluidDensity: 1.0,
      sleepLinearVelocityThreshold: 5.0,
      sleepAngularVelocityThreshold: 5.0,
      sleepConeLimit: 0.1,
      defaultLinearDamping: 0.01,
      defaultAngularDamping: 0.0,
      defaultRestitutionThreshold: 10.0,
      defaultContactOffsetMultiplier: 0.02,
      defaultDeformableMeshRestitution: 0.3,
      defaultDeformableMeshFriction: 0.5,
      defaultDeformableMeshDamping: 0.0,
      defaultDeformableMeshMaxDepenetrationVelocity: 100.0,
      bEnablePhysicsSubstepping: true,
      bEnableEnhancedDeterminism: false,
      bEnableStabilization: false,
      bWarnMissingLocks: false,
      bEnable2DPhysics: false,
      bDefaultHasComplexCollision: true,
      bSimulateComplexCollision: true,
      bDisableContactGraph: false,
      bEnableContactGraph: true,
      bUseContactGraphForCollision: true,
      bUseContactGraphForSimulation: true,
      bDisableCCD: false,
      bEnableCCD: true,
      bUseCCDForCollision: true,
      bUseCCDForSimulation: true,
      maxPhysicsDeltaTime: 0.033,
      maxSubstepDeltaTime: 0.016,
      maxSubsteps: 4,
      maxDepenetrationVelocity: 100.0,
      contactOffsetMultiplier: 0.02,
      minContactOffset: 0.0001,
      maxContactOffset: 1.0,
      separationLinearVelocityThreshold: 10.0,
      separationAngularVelocityThreshold: 10.0,
      maxLinearVelocity: 4000.0,
      maxAngularVelocity: 4000.0,
      linearVelocityTolerance: 10.0,
      angularVelocityTolerance: 10.0,
      metadata: {
        configuration: config,
        creationTime: Date.now()
      }
    };
  }

  private createAudioSystem(config: UnrealSceneBuildConfiguration): UnrealAudioSystemBridge {
    return {
      id: `audio_system_${Date.now()}`,
      name: 'AudioSystem',
      audioSystemType: config.audioSystem === UnrealAudioSystem.DEFAULT ? 'default' : 'default',
      masterVolume: 1.0,
      musicVolume: 0.8,
      sfxVolume: 1.0,
      voiceVolume: 1.0,
      masterBus: 'Master',
      musicBus: 'Music',
      sfxBus: 'SFX',
      voiceBus: 'Voice',
      reverbBus: 'Reverb',
      ambientBus: 'Ambient',
      uiBus: 'UI',
      maxActiveSounds: 128,
      maxVirtualSounds: 256,
      maxActiveEvents: 64,
      maxActiveSwitches: 32,
      maxActiveStates: 16,
      maxActiveListeners: 4,
      maxActivePorts: 8,
      maxActiveGameSyncs: 64,
      maxActiveTriggers: 32,
      maxActiveArguments: 128,
      maxActiveLayers: 64,
      maxActivePositions: 32,
      maxActivePositioning: 64,
      bEnableSpatialAudio: config.enableSpatialization,
      bEnableReverb: config.enableReverb,
      bEnableOcclusion: config.enableOcclusion,
      bEnableObstruction: config.enableObstruction,
      bEnableVirtualization: config.enableVirtualization,
      bEnableHRTF: config.enableHRTF,
      bEnableAmbisonics: config.enableAmbisonics,
      bEnableBinaural: false,
      bEnablePersonalizedHRTF: false,
      bEnable3DAudio: config.enableSpatialization,
      bEnableDynamicRoomModeling: false,
      bEnableDynamicRoomCorrection: false,
      bEnableSoundPropagation: config.enableSpatialization,
      bEnableSoundOcclusion: config.enableOcclusion,
      bEnableSoundObstruction: config.enableObstruction,
      bEnableSoundVirtualization: config.enableVirtualization,
      bEnableSoundAttenuation: true,
      bEnableSoundConcurrency: true,
      bEnableSoundLimiting: true,
      bEnableSoundModulation: true,
      bEnableSoundMarkers: false,
      bEnableSoundSync: false,
      bEnableSoundRandomization: true,
      bEnableSoundVariation: true,
      bEnableSoundAnalysis: false,
      bEnableSoundVisualization: false,
      bEnableSoundDebug: false,
      bEnableSoundStats: false,
      bEnableSoundMemoryStats: false,
      bEnableSoundCPUTimeStats: false,
      bEnableSoundGPUTimeStats: false,
      bEnableSoundBandwidthStats: false,
      bEnableSoundVoiceStats: false,
      bEnableSoundPluginStats: false,
      bEnableSoundPlatformStats: false,
      bEnableSoundEngineStats: false,
      metadata: {
        configuration: config,
        creationTime: Date.now()
      }
    };
  }

  private registerSceneComponents(composition: UnrealSceneComposition): void {
    // Register world
    this.bridgeManager.registerWorld(composition.world);

    // Register persistent level
    this.bridgeManager.registerLevel(composition.persistentLevel);

    // Register streaming levels
    for (const level of composition.streamingLevels) {
      this.bridgeManager.registerLevel(level);
    }

    // Register navigation system
    this.bridgeManager.registerSystem(composition.navigationSystem);

    // Register lighting system
    this.bridgeManager.registerSystem(composition.lightingSystem);

    // Register physics system
    this.bridgeManager.registerSystem(composition.physicsSystem);

    // Register audio system
    this.bridgeManager.registerSystem(composition.audioSystem);

    // Register actors
    for (const actor of composition.actors) {
      this.bridgeManager.registerActor(actor);
    }

    console.log(`[UnrealSceneBuilderPure] Registered ${composition.actors.length} actors and ${composition.systems.length} systems`);
  }

  // Configuration management
  addConfiguration(name: string, config: UnrealSceneBuildConfiguration): void {
    this.sceneConfigurations.set(name, config);
  }

  getConfiguration(name: string): UnrealSceneBuildConfiguration | undefined {
    return this.sceneConfigurations.get(name);
  }

  updateConfiguration(name: string, updates: Partial<UnrealSceneBuildConfiguration>): void {
    const existing = this.sceneConfigurations.get(name);
    if (existing) {
      Object.assign(existing, updates);
    }
  }

  removeConfiguration(name: string): void {
    this.sceneConfigurations.delete(name);
  }

  getAllConfigurations(): string[] {
    return Array.from(this.sceneConfigurations.keys());
  }

  // Utility methods
  getSceneBuildStats(): any {
    return {
      configurations: this.sceneConfigurations.size,
      sceneBuilderManager: {
        nodeCount: this.sceneBuilderManager.getNodeCount(),
        assetCount: this.sceneBuilderManager.getAssetCount()
      },
      bridgeManager: {
        actors: this.bridgeManager['actors']?.size || 0,
        components: this.bridgeManager['components']?.size || 0,
        systems: this.bridgeManager['systems']?.size || 0,
        worlds: this.bridgeManager['worlds']?.size || 0,
        levels: this.bridgeManager['levels']?.size || 0
      }
    };
  }

  dispose(): void {
    console.log('[UnrealSceneBuilderPure] Disposing scene builder...');
    this.sceneConfigurations.clear();
    console.log('[UnrealSceneBuilderPure] Scene builder disposed successfully');
  }
}