// UnrealPayloadAdapterPure - Converts RenderPayloadPure to Unreal-compatible format
// Schema Version: v1.0

import { RenderPayloadManager, RenderPayloadBuilder } from '../RenderPayloadPure';
import { UnrealBridgeManager, UnrealActorBridge, UnrealComponentBridge, UnrealAssetBridge, UnrealSceneBridge } from './index';

export enum PayloadConversionMode {
  STATIC_MESH = 'static_mesh',
  SKELETAL_MESH = 'skeletal_mesh',
  BLUEPRINT = 'blueprint',
  LEVEL = 'level',
  WORLD = 'world',
  MATERIAL = 'material',
  TEXTURE = 'texture',
  ANIMATION = 'animation',
  PARTICLE_SYSTEM = 'particle_system',
  SOUND = 'sound',
  PHYSICS_ASSET = 'physics_asset',
  DESTRUCTIBLE_MESH = 'destructible_mesh',
  LANDSCAPE = 'landscape',
  FOLIAGE = 'foliage',
  LIGHT = 'light',
  CAMERA = 'camera',
  POST_PROCESS = 'post_process',
  CUBEMAP = 'cubemap',
  SPRITE = 'sprite',
  VECTOR_FIELD = 'vector_field',
  PHYSICS_MATERIAL = 'physics_material',
  PHYSICAL_MATERIAL = 'physical_material',
  SOUND_ATTENUATION = 'sound_attenuation',
  REVERB_EFFECT = 'reverb_effect',
  FORCE_FEEDBACK = 'force_feedback',
  TACTILE_FEEDBACK = 'tactile_feedback',
  HAPTIC_FEEDBACK = 'haptic_feedback',
  SUBSURFACE_PROFILE = 'subsurface_profile',
  VIRTUAL_TEXTURE = 'virtual_texture'
}

export enum UnrealAssetType {
  STATIC_MESH = 'static_mesh',
  SKELETAL_MESH = 'skeletal_mesh',
  MATERIAL = 'material',
  MATERIAL_INSTANCE = 'material_instance',
  TEXTURE = 'texture',
  TEXTURE_2D = 'texture_2d',
  TEXTURE_CUBE = 'texture_cube',
  ANIMATION_SEQUENCE = 'animation_sequence',
  ANIM_BLUEPRINT = 'anim_blueprint',
  PHYSICS_ASSET = 'physics_asset',
  SKELETAL_MESH_SOCKET = 'skeletal_mesh_socket',
  BLEND_SPACE = 'blend_space',
  AIM_OFFSET = 'aim_offset',
  MONTAGE = 'montage',
  POSE_ASSET = 'pose_asset',
  SOUND_WAVE = 'sound_wave',
  SOUND_CUE = 'sound_cue',
  DIALOGUE_WAVE = 'dialogue_wave',
  DIALOGUE_VOICE = 'dialogue_voice',
  REVERB_EFFECT = 'reverb_effect',
  SOUND_ATTENUATION = 'sound_attenuation',
  SOUND_CONCURRENCY = 'sound_concurrency',
  PARTICLE_SYSTEM = 'particle_system',
  BLUEPRINT = 'blueprint',
  BLUEPRINT_GENERATED_CLASS = 'blueprint_generated_class',
  WIDGET_BLUEPRINT = 'widget_blueprint',
  LEVEL = 'level',
  WORLD = 'world',
  GAME_MODE = 'game_mode',
  GAME_STATE = 'game_state',
  PLAYER_CONTROLLER = 'player_controller',
  AI_CONTROLLER = 'ai_controller',
  PAWN = 'pawn',
  CHARACTER = 'character',
  DATA_TABLE = 'data_table',
  CURVE_TABLE = 'curve_table',
  STRING_TABLE = 'string_table',
  CURVE_FLOAT = 'curve_float',
  CURVE_VECTOR = 'curve_vector',
  CURVE_LINEAR_COLOR = 'curve_linear_color',
  PHYSICS_MATERIAL = 'physics_material',
  PHYSICAL_MATERIAL = 'physical_material',
  DESTRUCTIBLE_MESH = 'destructible_mesh',
  FORCE_FEEDBACK_EFFECT = 'force_feedback_effect',
  TACTILE_FEEDBACK_EFFECT = 'tactile_feedback_effect',
  HAPTIC_FEEDBACK_EFFECT = 'haptic_feedback_effect',
  SUBSURFACE_PROFILE = 'subsurface_profile',
  VIRTUAL_TEXTURE = 'virtual_texture',
  RUNTIME_VIRTUAL_TEXTURE = 'runtime_virtual_texture',
  LIGHT_PROFILE = 'light_profile',
  IES_LIGHT_PROFILE = 'ies_light_profile',
  ENVIRONMENTAL_LIGHT_MIXER = 'environmental_light_mixer',
  FONT = 'font',
  FONT_FACE = 'font_face',
  SLATE_BRUSH = 'slate_brush',
  SLATE_WIDGET_STYLE = 'slate_widget_style',
  GAMEPLAY_TAG_LIST = 'gameplay_tag_list',
  RESTRICTION_ASSET = 'restriction_asset',
  SMART_NAME_MAPPING = 'smart_name_mapping',
  ANIMATION_SHARING_SETUP = 'animation_sharing_setup',
  PREVIEW_MESH_COLLECTION = 'preview_mesh_collection',
  PRIMARY_ASSET_LABEL = 'primary_asset_label',
  ASSET_MANAGER_SETTINGS = 'asset_manager_settings',
  ASSET_REGISTRY = 'asset_registry'
}

export interface PayloadConversionConfiguration {
  mode: PayloadConversionMode;
  targetEngineVersion: string;
  targetPlatform: string;
  optimizationLevel: 'none' | 'fast' | 'balanced' | 'quality' | 'production';
  enableCompression: boolean;
  enableMipmaps: boolean;
  enableStreaming: boolean;
  maxTextureSize: number;
  textureFormat: 'auto' | 'png' | 'jpg' | 'tga' | 'bmp' | 'dds' | 'exr';
  meshOptimization: 'none' | 'vertex' | 'triangle' | 'lod' | 'impostor';
  animationCompression: 'none' | 'keyframe' | 'curve' | 'bitwise';
  soundCompression: 'none' | 'ogg' | 'wav' | 'mp3' | 'flac';
  enablePhysics: boolean;
  collisionComplexity: 'none' | 'simple' | 'complex' | 'detailed';
  lightmapResolution: number;
  shadowMapResolution: number;
  enableNanite: boolean;
  enableLumen: boolean;
  enableVirtualTextures: boolean;
  enableRayTracing: boolean;
  enablePathTracing: boolean;
  generateMipmaps: boolean;
  generateLightmaps: boolean;
  generateShadowMaps: boolean;
  generateCollision: boolean;
  generateNavMesh: boolean;
  generateSplineMeshes: boolean;
  generateGrassMeshes: boolean;
  generateWaterMeshes: boolean;
  generateSkyAtmosphere: boolean;
  generateVolumetricClouds: boolean;
  generateExponentialHeightFog: boolean;
  generateAtmosphericFog: boolean;
  generateSkyLight: boolean;
  generateDirectionalLight: boolean;
  generatePointLights: boolean;
  generateSpotLights: boolean;
  generateRectLights: boolean;
  generateIESProfiles: boolean;
  enableDistanceField: boolean;
  enableSignedDistanceField: boolean;
  enableMeshDistanceFields: boolean;
  enableGlobalDistanceField: boolean;
  enableStaticMeshDistanceFields: boolean;
  enableSkeletalMeshDistanceFields: boolean;
  enableLandscapeDistanceFields: boolean;
  customSettings: Record<string, any>;
}

export interface UnrealPayloadConversionResult {
  success: boolean;
  conversionId: string;
  conversionTime: number;
  sourcePayload: any;
  convertedAssets: UnrealAssetBridge[];
  convertedActors: UnrealActorBridge[];
  convertedComponents: UnrealComponentBridge[];
  convertedScenes: UnrealSceneBridge[];
  warnings: string[];
  errors: string[];
  metadata: Record<string, any>;
}

export interface UnrealMeshConversionOptions {
  targetPlatform: string;
  enableCollision: boolean;
  collisionComplexity: 'simple' | 'complex' | 'detailed';
  enableLOD: boolean;
  lodCount: number;
  enableNanite: boolean;
  enableVirtualTexturing: boolean;
  generateLightmapUVs: boolean;
  lightmapResolution: number;
  generateDistanceField: boolean;
  enableRayTracing: boolean;
  enablePathTracing: boolean;
  optimizeForMobile: boolean;
  optimizeForConsole: boolean;
  optimizeForVR: boolean;
  vertexColorImportance: 'none' | 'low' | 'medium' | 'high';
  textureCoordinateImportance: 'none' | 'low' | 'medium' | 'high';
  normalImportance: 'none' | 'low' | 'medium' | 'high';
  tangentImportance: 'none' | 'low' | 'medium' | 'high';
  enableVertexOptimization: boolean;
  enableTriangleOptimization: boolean;
  enableOverdrawOptimization: boolean;
  enableCacheOptimization: boolean;
  customVertexStream: any[];
  customMaterialExpression: any[];
  customParameters: Record<string, any>;
}

export interface UnrealMaterialConversionOptions {
  targetPlatform: string;
  materialDomain: 'surface' | 'deferred_decal' | 'light_function' | 'volume' | 'post_process' | 'ui';
  blendMode: 'opaque' | 'masked' | 'translucent' | 'additive' | 'modulate' | 'alpha_composite';
  shadingModel: 'unlit' | 'default_lit' | 'subsurface' | 'preintegrated_skin' | 'clear_coat' | 'subsurface_profile' | 'two_sided_foliage' | 'hair' | 'cloth' | 'eye' | 'single_layer_water';
  enableTessellation: boolean;
  enableDisplacement: boolean;
  enableVertexDeformation: boolean;
  enableWorldPositionOffset: boolean;
  enablePixelDepthOffset: boolean;
  enableSubsurfaceScattering: boolean;
  enableScreenSpaceReflections: boolean;
  enableContactShadows: boolean;
  enableDistanceFieldAO: boolean;
  enableAtmosphericFog: boolean;
  enableVolumetricFog: boolean;
  enableLightFunctions: boolean;
  enableShadowCasting: boolean;
  enableShadowReceiving: boolean;
  enableLightmap: boolean;
  enableDistanceField: boolean;
  enableSignedDistanceField: boolean;
  enableVirtualTexturing: boolean;
  enableRuntimeVirtualTexturing: boolean;
  enableRayTracing: boolean;
  enablePathTracing: boolean;
  materialQualityLevel: 'low' | 'medium' | 'high' | 'epic';
  maxTextureSize: number;
  textureFormat: 'auto' | 'png' | 'jpg' | 'tga' | 'bmp' | 'dds' | 'exr';
  compressionSettings: any;
  customMaterialExpression: any[];
  customParameters: Record<string, any>;
}

export interface UnrealAnimationConversionOptions {
  targetPlatform: string;
  animationType: 'skeletal' | 'vertex' | 'rigid' | 'morph' | 'cloth' | 'hair';
  compression: 'none' | 'keyframe' | 'curve' | 'bitwise' | 'adaptive';
  enableRootMotion: boolean;
  enableAdditiveAnimation: boolean;
  enableCurveCompression: boolean;
  enableSegmentCompression: boolean;
  enableBitwiseCompression: boolean;
  enableAdaptiveCompression: boolean;
  compressionErrorTolerance: number;
  keyframeReduction: number;
  trackCurves: boolean;
  includeRawData: boolean;
  optimizeForSize: boolean;
  optimizeForPerformance: boolean;
  generateBoneCompression: boolean;
  generateCurveCompression: boolean;
  generateBitwiseCompression: boolean;
  customAnimationExpression: any[];
  customParameters: Record<string, any>;
}

export interface UnrealAudioConversionOptions {
  targetPlatform: string;
  audioFormat: 'wav' | 'ogg' | 'mp3' | 'flac' | 'opus' | 'bink' | 'adpcm';
  quality: 'low' | 'medium' | 'high' | 'master';
  sampleRate: number;
  bitDepth: number;
  channelCount: number;
  enableStreaming: boolean;
  enableCompression: boolean;
  enableSpatialization: boolean;
  enableReverb: boolean;
  enableOcclusion: boolean;
  enableObstruction: boolean;
  enableAttenuation: boolean;
  attenuationDistance: number;
  enableLooping: boolean;
  loopStart: number;
  loopEnd: number;
  enableConcatenation: boolean;
  enableVirtualization: boolean;
  enableHRTF: boolean;
  enableAmbisonics: boolean;
  customAudioExpression: any[];
  customParameters: Record<string, any>;
}

export interface UnrealTextureConversionOptions {
  targetPlatform: string;
  textureType: '2d' | 'cube' | 'volume' | 'array' | 'multisample' | 'render_target';
  compressionFormat: 'auto' | 'dxt1' | 'dxt3' | 'dxt5' | 'bc4' | 'bc5' | 'bc6h' | 'bc7' | 'etc1' | 'etc2' | 'astc' | 'pvrtc' | 'atc' | '3dc';
  maxTextureSize: number;
  enableMipmaps: boolean;
  mipmapCount: number;
  enableStreaming: boolean;
  enableVirtualTexturing: boolean;
  enableRuntimeVirtualTexturing: boolean;
  enableSignedDistanceField: boolean;
  sdfResolution: number;
  sdfSpacing: number;
  enableUDIM: boolean;
  enableFlipbook: boolean;
  enableAtlas: boolean;
  atlasSize: number;
  textureGroup: 'world' | 'world_normalmap' | 'world_specular' | 'character' | 'character_normalmap' | 'character_specular' | 'weapon' | 'weapon_normalmap' | 'weapon_specular' | 'vehicle' | 'vehicle_normalmap' | 'vehicle_specular' | 'environment' | 'skybox' | 'ui' | 'vfx' | 'lightmap' | 'shadowmap' | 'render_target' | 'mobile' | 'terrain_heightmap' | 'terrain_weightmap' | 'bicubic_lightmap' | 'lightmap_hd' | 'shadowmap_hd' | 'color_lookup_table' | 'ies_light_profile' | 'bokeh' | 'interface' | 'light_function' | 'volume_texture';
  lodGroup: 'texture_group' | 'terrain_texture_group' | 'ui_texture_group' | 'vfx_texture_group' | 'lightmap_texture_group' | 'shadowmap_texture_group' | 'render_target_texture_group' | 'mobile_texture_group' | 'terrain_heightmap_texture_group' | 'terrain_weightmap_texture_group' | 'bicubic_lightmap_texture_group' | 'lightmap_hd_texture_group' | 'shadowmap_hd_texture_group' | 'color_lookup_table_texture_group' | 'ies_light_profile_texture_group' | 'bokeh_texture_group' | 'interface_texture_group' | 'light_function_texture_group' | 'volume_texture_texture_group';
  customTextureExpression: any[];
  customParameters: Record<string, any>;
}

export class UnrealPayloadAdapterPure {
  private renderPayloadManager: RenderPayloadManager;
  private bridgeManager: UnrealBridgeManager;
  private conversionConfigurations: Map<string, PayloadConversionConfiguration> = new Map();

  constructor(renderPayloadManager: RenderPayloadManager, bridgeManager: UnrealBridgeManager) {
    this.renderPayloadManager = renderPayloadManager;
    this.bridgeManager = bridgeManager;
    this.initializeDefaultConfigurations();
  }

  private initializeDefaultConfigurations(): void {
    console.log('[UnrealPayloadAdapterPure!] Initializing default conversion configurations...');

    // Static Mesh Configuration
    const staticMeshConfig: PayloadConversionConfiguration = {
      mode: PayloadConversionMode.STATIC_MESH,
      targetEngineVersion: '5.1',
      targetPlatform: 'windows',
      optimizationLevel: 'quality',
      enableCompression: true,
      enableMipmaps: true,
      enableStreaming: true,
      maxTextureSize: 4096,
      textureFormat: 'auto',
      meshOptimization: 'lod',
      animationCompression: 'none',
      soundCompression: 'none',
      enablePhysics: true,
      collisionComplexity: 'complex',
      lightmapResolution: 256,
      shadowMapResolution: 1024,
      enableNanite: true,
      enableLumen: true,
      enableVirtualTextures: true,
      enableRayTracing: true,
      enablePathTracing: true,
      generateMipmaps: true,
      generateLightmaps: true,
      generateShadowMaps: true,
      generateCollision: true,
      generateNavMesh: false,
      generateSplineMeshes: false,
      generateGrassMeshes: false,
      generateWaterMeshes: false,
      generateSkyAtmosphere: false,
      generateVolumetricClouds: false,
      generateExponentialHeightFog: false,
      generateAtmosphericFog: false,
      generateSkyLight: false,
      generateDirectionalLight: false,
      generatePointLights: false,
      generateSpotLights: false,
      generateRectLights: false,
      generateIESProfiles: false,
      enableDistanceField: true,
      enableSignedDistanceField: true,
      enableMeshDistanceFields: true,
      enableGlobalDistanceField: true,
      enableStaticMeshDistanceFields: true,
      enableSkeletalMeshDistanceFields: false,
      enableLandscapeDistanceFields: false,
      customSettings: {}
    };

    this.conversionConfigurations.set('static_mesh', staticMeshConfig);

    // Skeletal Mesh Configuration
    const skeletalMeshConfig: PayloadConversionConfiguration = {
      mode: PayloadConversionMode.SKELETAL_MESH,
      targetEngineVersion: '5.1',
      targetPlatform: 'windows',
      optimizationLevel: 'quality',
      enableCompression: true,
      enableMipmaps: true,
      enableStreaming: true,
      maxTextureSize: 4096,
      textureFormat: 'auto',
      meshOptimization: 'lod',
      animationCompression: 'curve',
      soundCompression: 'none',
      enablePhysics: true,
      collisionComplexity: 'complex',
      lightmapResolution: 256,
      shadowMapResolution: 1024,
      enableNanite: true,
      enableLumen: true,
      enableVirtualTextures: true,
      enableRayTracing: true,
      enablePathTracing: true,
      generateMipmaps: true,
      generateLightmaps: true,
      generateShadowMaps: true,
      generateCollision: true,
      generateNavMesh: false,
      generateSplineMeshes: false,
      generateGrassMeshes: false,
      generateWaterMeshes: false,
      generateSkyAtmosphere: false,
      generateVolumetricClouds: false,
      generateExponentialHeightFog: false,
      generateAtmosphericFog: false,
      generateSkyLight: false,
      generateDirectionalLight: false,
      generatePointLights: false,
      generateSpotLights: false,
      generateRectLights: false,
      generateIESProfiles: false,
      enableDistanceField: true,
      enableSignedDistanceField: true,
      enableMeshDistanceFields: true,
      enableGlobalDistanceField: true,
      enableStaticMeshDistanceFields: false,
      enableSkeletalMeshDistanceFields: true,
      enableLandscapeDistanceFields: false,
      customSettings: {}
    };

    this.conversionConfigurations.set('skeletal_mesh', skeletalMeshConfig);

    // Animation Configuration
    const animationConfig: PayloadConversionConfiguration = {
      mode: PayloadConversionMode.ANIMATION,
      targetEngineVersion: '5.1',
      targetPlatform: 'windows',
      optimizationLevel: 'quality',
      enableCompression: true,
      enableMipmaps: false,
      enableStreaming: false,
      maxTextureSize: 1024,
      textureFormat: 'auto',
      meshOptimization: 'none',
      animationCompression: 'adaptive',
      soundCompression: 'none',
      enablePhysics: false,
      collisionComplexity: 'none',
      lightmapResolution: 0,
      shadowMapResolution: 0,
      enableNanite: false,
      enableLumen: false,
      enableVirtualTextures: false,
      enableRayTracing: false,
      enablePathTracing: false,
      generateMipmaps: false,
      generateLightmaps: false,
      generateShadowMaps: false,
      generateCollision: false,
      generateNavMesh: false,
      generateSplineMeshes: false,
      generateGrassMeshes: false,
      generateWaterMeshes: false,
      generateSkyAtmosphere: false,
      generateVolumetricClouds: false,
      generateExponentialHeightFog: false,
      generateAtmosphericFog: false,
      generateSkyLight: false,
      generateDirectionalLight: false,
      generatePointLights: false,
      generateSpotLights: false,
      generateRectLights: false,
      generateIESProfiles: false,
      enableDistanceField: false,
      enableSignedDistanceField: false,
      enableMeshDistanceFields: false,
      enableGlobalDistanceField: false,
      enableStaticMeshDistanceFields: false,
      enableSkeletalMeshDistanceFields: false,
      enableLandscapeDistanceFields: false,
      customSettings: {}
    };

    this.conversionConfigurations.set('animation', animationConfig);

    // Material Configuration
    const materialConfig: PayloadConversionConfiguration = {
      mode: PayloadConversionMode.MATERIAL,
      targetEngineVersion: '5.1',
      targetPlatform: 'windows',
      optimizationLevel: 'quality',
      enableCompression: true,
      enableMipmaps: true,
      enableStreaming: false,
      maxTextureSize: 4096,
      textureFormat: 'auto',
      meshOptimization: 'none',
      animationCompression: 'none',
      soundCompression: 'none',
      enablePhysics: false,
      collisionComplexity: 'none',
      lightmapResolution: 0,
      shadowMapResolution: 0,
      enableNanite: false,
      enableLumen: true,
      enableVirtualTextures: true,
      enableRayTracing: true,
      enablePathTracing: true,
      generateMipmaps: true,
      generateLightmaps: false,
      generateShadowMaps: false,
      generateCollision: false,
      generateNavMesh: false,
      generateSplineMeshes: false,
      generateGrassMeshes: false,
      generateWaterMeshes: false,
      generateSkyAtmosphere: false,
      generateVolumetricClouds: false,
      generateExponentialHeightFog: false,
      generateAtmosphericFog: false,
      generateSkyLight: false,
      generateDirectionalLight: false,
      generatePointLights: false,
      generateSpotLights: false,
      generateRectLights: false,
      generateIESProfiles: false,
      enableDistanceField: false,
      enableSignedDistanceField: false,
      enableMeshDistanceFields: false,
      enableGlobalDistanceField: false,
      enableStaticMeshDistanceFields: false,
      enableSkeletalMeshDistanceFields: false,
      enableLandscapeDistanceFields: false,
      customSettings: {}
    };

    this.conversionConfigurations.set('material', materialConfig);

    console.log(`[UnrealPayloadAdapterPure!] Initialized ${this.conversionConfigurations.size} conversion configurations`);
  }

  async convertRenderPayload(
    payloadId: string,
    configurationId?: string,
    options?: Partial<PayloadConversionConfiguration>
  ): Promise<UnrealPayloadConversionResult> {
    console.log(`[UnrealPayloadAdapterPure!] Converting render payload: ${payloadId}`);

    try {
      // Get source payload
      const sourcePayload = this.renderPayloadManager.getPayload(payloadId);
      if (!sourcePayload) {
        throw new Error(`Render payload not found: ${payloadId}`);
      }

      // Get or create configuration
      let config: PayloadConversionConfiguration;
      if (configurationId) {
        const existingConfig = this.conversionConfigurations.get(configurationId);
        if (!existingConfig) {
          throw new Error(`Conversion configuration not found: ${configurationId}`);
        }
        config = { ...existingConfig, ...options };
      } else {
        config = {
          mode: PayloadConversionMode.STATIC_MESH,
          targetEngineVersion: '5.1',
          targetPlatform: 'windows',
          optimizationLevel: 'quality',
          enableCompression: true,
          enableMipmaps: true,
          enableStreaming: true,
          maxTextureSize: 4096,
          textureFormat: 'auto',
          meshOptimization: 'lod',
          animationCompression: 'none',
          soundCompression: 'none',
          enablePhysics: true,
          collisionComplexity: 'complex',
          lightmapResolution: 256,
          shadowMapResolution: 1024,
          enableNanite: true,
          enableLumen: true,
          enableVirtualTextures: true,
          enableRayTracing: true,
          enablePathTracing: true,
          generateMipmaps: true,
          generateLightmaps: true,
          generateShadowMaps: true,
          generateCollision: true,
          generateNavMesh: false,
          generateSplineMeshes: false,
          generateGrassMeshes: false,
          generateWaterMeshes: false,
          generateSkyAtmosphere: false,
          generateVolumetricClouds: false,
          generateExponentialHeightFog: false,
          generateAtmosphericFog: false,
          generateSkyLight: false,
          generateDirectionalLight: false,
          generatePointLights: false,
          generateSpotLights: false,
          generateRectLights: false,
          generateIESProfiles: false,
          enableDistanceField: true,
          enableSignedDistanceField: true,
          enableMeshDistanceFields: true,
          enableGlobalDistanceField: true,
          enableStaticMeshDistanceFields: true,
          enableSkeletalMeshDistanceFields: false,
          enableLandscapeDistanceFields: false,
          customSettings: {},
          ...options
        };
      }

      const startTime = Date.now();

      // Convert based on mode
      let convertedAssets: UnrealAssetBridge[] = [];
      let convertedActors: UnrealActorBridge[] = [];
      let convertedComponents: UnrealComponentBridge[] = [];
      let convertedScenes: UnrealSceneBridge[] = [];
      const warnings: string[] = [];
      const errors: string[] = [];

      switch (config.mode) {
        case PayloadConversionMode.STATIC_MESH:
          const staticMeshResult = await this.convertToStaticMesh(sourcePayload, config);
          convertedAssets = staticMeshResult.assets;
          convertedActors = staticMeshResult.actors;
          warnings.push(...staticMeshResult.warnings);
          errors.push(...(staticMeshResult.errors ?? []));
          break;

        case PayloadConversionMode.SKELETAL_MESH:
          const skeletalMeshResult = await this.convertToSkeletalMesh(sourcePayload, config);
          convertedAssets = skeletalMeshResult.assets;
          convertedActors = skeletalMeshResult.actors;
          warnings.push(...skeletalMeshResult.warnings);
          errors.push(...(skeletalMeshResult.errors ?? []));
          break;

        case PayloadConversionMode.BLUEPRINT:
          const blueprintResult = await this.convertToBlueprint(sourcePayload, config);
          convertedAssets = blueprintResult.assets;
          convertedActors = blueprintResult.actors;
          warnings.push(...blueprintResult.warnings);
          errors.push(...(blueprintResult.errors ?? []));
          break;

        case PayloadConversionMode.LEVEL:
          const levelResult = await this.convertToLevel(sourcePayload, config);
          convertedScenes = levelResult.scenes;
          warnings.push(...levelResult.warnings);
          errors.push(...(levelResult.errors ?? []));
          break;

        case PayloadConversionMode.MATERIAL:
          const materialResult = await this.convertToMaterial(sourcePayload, config);
          convertedAssets = materialResult.assets;
          warnings.push(...materialResult.warnings);
          errors.push(...(materialResult.errors ?? []));
          break;

        case PayloadConversionMode.TEXTURE:
          const textureResult = await this.convertToTexture(sourcePayload, config);
          convertedAssets = textureResult.assets;
          warnings.push(...textureResult.warnings);
          errors.push(...(textureResult.errors ?? []));
          break;

        case PayloadConversionMode.ANIMATION:
          const animationResult = await this.convertToAnimation(sourcePayload, config);
          convertedAssets = animationResult.assets;
          warnings.push(...animationResult.warnings);
          errors.push(...(animationResult.errors ?? []));
          break;

        case PayloadConversionMode.PARTICLE_SYSTEM:
          const particleResult = await this.convertToParticleSystem(sourcePayload, config);
          convertedAssets = particleResult.assets;
          warnings.push(...particleResult.warnings);
          errors.push(...(particleResult.errors ?? []));
          break;

        case PayloadConversionMode.SOUND:
          const soundResult = await this.convertToSound(sourcePayload, config);
          convertedAssets = soundResult.assets;
          warnings.push(...soundResult.warnings);
          errors.push(...(soundResult.errors ?? []));
          break;

        default:
          throw new Error(`Unsupported conversion mode: ${config.mode}`);
      }

      const conversionTime = Date.now() - startTime;

      // Register converted assets with bridge manager
      for (const asset of convertedAssets) {
        this.bridgeManager.registerAsset(asset);
      }

      for (const actor of convertedActors) {
        this.bridgeManager.registerActor(actor);
      }

      for (const component of convertedComponents) {
        this.bridgeManager.registerComponent(component);
      }

      for (const scene of convertedScenes) {
        this.bridgeManager.registerScene(scene);
      }

      const result: UnrealPayloadConversionResult = {
        success: errors.length === 0,
        conversionId: `conversion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversionTime,
        sourcePayload,
        convertedAssets,
        convertedActors,
        convertedComponents,
        convertedScenes,
        warnings,
        errors,
        metadata: {
          configuration: config,
          sourcePayloadId: payloadId,
          conversionMode: config.mode,
          targetEngineVersion: config.targetEngineVersion,
          targetPlatform: config.targetPlatform,
          optimizationLevel: config.optimizationLevel
        }
      };

      console.log(`[UnrealPayloadAdapterPure!] Conversion completed: ${result.success ? 'SUCCESS' : 'PARTIAL'}`);
      console.log(`[UnrealPayloadAdapterPure!] Converted ${convertedAssets.length} assets, ${convertedActors.length} actors, ${convertedComponents.length} components, ${convertedScenes.length} scenes`);
      console.log(`[UnrealPayloadAdapterPure!] Conversion time: ${conversionTime}ms`);
      console.log(`[UnrealPayloadAdapterPure!] Warnings: ${warnings.length}, Errors: ${errors.length}`);

      return result;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Conversion failed:', err instanceof Error ? err.message : String(err));

      return {
        success: false,
        conversionId: `conversion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversionTime: 0,
        sourcePayload: null,
        convertedAssets: [],
        convertedActors: [],
        convertedComponents: [],
        convertedScenes: [],
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

  private async convertToStaticMesh(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ assets: UnrealAssetBridge[]; actors: UnrealActorBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to static mesh...');

    const assets: UnrealAssetBridge[] = [];
    const actors: UnrealActorBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Convert geometry data to static mesh
      if (sourcePayload.geometry && sourcePayload.geometry.meshes) {
        for (const [index, mesh] of sourcePayload.geometry.meshes.entries()) {
          const assetId = `static_mesh_${index}_${Date.now()}`;
          const asset: UnrealAssetBridge = {
            id: assetId,
            name: `StaticMesh_${index}`,
            type: 'static_mesh',
            packagePath: '/Game/MIFF/StaticMeshes',
            assetPath: `/Game/MIFF/StaticMeshes/StaticMesh_${index}`,
            className: 'StaticMesh',
            dependencies: [],
            references: [],
            thumbnailInfo: null,
            assetBundleData: null,
            assetRegistryTags: null,
            chunkIds: [],
            isLocalizedResource: false,
            localizationId: '',
            size: mesh.vertices?.length || 0,
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
              sourceMeshIndex: index,
              vertexCount: mesh.vertices?.length || 0,
              triangleCount: mesh.indices?.length || 0,
              materialCount: mesh.materials?.length || 0,
              hasNormals: !!mesh.normals,
              hasTangents: !!mesh.tangents,
              hasUVs: !!mesh.uvs,
              hasColors: !!mesh.colors,
              boundingBox: mesh.boundingBox,
              lodLevels: config.meshOptimization === 'lod' ? 4 : 1
            }
          };

          assets.push(asset);

          // Create actor for the static mesh
          const actor: UnrealActorBridge = {
            id: `static_mesh_actor_${index}`,
            name: `StaticMeshActor_${index}`,
            className: 'StaticMeshActor',
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
            components: [
              {
                id: `static_mesh_component_${index}`,
                name: `StaticMeshComponent_${index}`,
                className: 'StaticMeshComponent',
                properties: {
                  staticMesh: asset.assetPath,
                  materials: mesh.materials?.map((material: any, matIndex: number) => ({
                    materialSlotName: `Material_${matIndex}`,
                    materialInterface: material.path || '/Game/MIFF/Materials/DefaultMaterial',
                    materialOverride: null,
                    enableMaterialOverride: false
                  })) || [],
                  collisionEnabled: config.enablePhysics ? 'query_and_physics' : 'no_collision',
                  collisionProfileName: 'BlockAll',
                  mobility: 'static',
                  castShadow: true,
                  receiveShadow: true,
                  enableLightmap: config.generateLightmaps,
                  lightmapResolution: config.lightmapResolution,
                  useDefaultLightmap: true,
                  enableDistanceField: config.enableDistanceField,
                  enableSignedDistanceField: config.enableSignedDistanceField,
                  distanceFieldResolution: 16,
                  generateDistanceFieldAsIfTwoSided: false,
                  customPrimitiveData: null,
                  customDepthStencilValue: 0,
                  renderInMainPass: true,
                  renderInDepthPass: true,
                  renderCustomDepth: false,
                  customDepthStencilWriteMask: 0,
                  lightingChannels: {
                    bChannel0: true,
                    bChannel1: false,
                    bChannel2: false
                  },
                  lightmapType: 'surface',
                  indirectLightingCacheQuality: 'ilcq_high',
                  forceDisableNanite: !config.enableNanite,
                  enableVirtualTextureLightmap: config.enableVirtualTextures,
                  enableVirtualTexture: config.enableVirtualTextures,
                  virtualTextureRenderPassType: 'always',
                  naniteSettings: {
                    enabled: config.enableNanite,
                    fallbackRelativeError: 0.1,
                    fallbackPercentTriangles: 0.5
                  }
                },
                componentTags: ['miff', 'static_mesh', 'converted'],
                editableWhenInherited: false,
                isTemplate: false,
                isCreatedByConstructionScript: false,
                usesHierarchy: false,
                replicates: false,
                netAddressable: false,
                autoActivate: true,
                canEverAffectNavigation: false,
                isEditorOnly: false,
                isVisualizationComponent: false,
                bEditableWhenInherited: false,
                bIsScreenSizeScaled: false,
                bTickInEditor: false,
                bUseAttachParentBound: false,
                bVisualizeComponent: false,
                mobility: 'static',
                detailMode: 'high',
                collisionEnabled: 'no_collision',
                collisionProfileName: 'NoCollision',
                collisionResponses: {},
                generateOverlapEvents: false,
                physicsVolumeChanged: false,
                constraintInstance: null,
                bodyInstance: null,
                metadata: {
                  sourceMeshIndex: index,
                  conversionMode: 'static_mesh',
                  optimizationLevel: config.optimizationLevel
                }
              }
            ],
            properties: {
              staticMeshComponent: `static_mesh_component_${index}`,
              mobility: 'static',
              collisionEnabled: config.enablePhysics ? 'query_and_physics' : 'no_collision',
              collisionProfileName: 'BlockAll',
              castShadow: true,
              receiveShadow: true
            },
            tags: ['miff', 'static_mesh', 'converted'],
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
            metadata: {
              sourcePayloadId: sourcePayload.id,
              conversionMode: 'static_mesh',
              meshIndex: index,
              optimizationLevel: config.optimizationLevel
            }
          };

          actors.push(actor);
        }
      }

      console.log(`[UnrealPayloadAdapterPure!] Converted ${assets.length} static meshes and ${actors.length} actors`);
      return { assets, actors, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Static mesh conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { assets: [], actors: [], warnings, errors };
    }
  }

  private async convertToSkeletalMesh(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ assets: UnrealAssetBridge[]; actors: UnrealActorBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to skeletal mesh...');

    const assets: UnrealAssetBridge[] = [];
    const actors: UnrealActorBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Convert skeletal geometry data to skeletal mesh
      if (sourcePayload.geometry && sourcePayload.geometry.skeletalMeshes) {
        for (const [index, skeletalMesh] of sourcePayload.geometry.skeletalMeshes.entries()) {
          const assetId = `skeletal_mesh_${index}_${Date.now()}`;
          const asset: UnrealAssetBridge = {
            id: assetId,
            name: `SkeletalMesh_${index}`,
            type: 'skeletal_mesh',
            packagePath: '/Game/MIFF/SkeletalMeshes',
            assetPath: `/Game/MIFF/SkeletalMeshes/SkeletalMesh_${index}`,
            className: 'SkeletalMesh',
            dependencies: [],
            references: [],
            thumbnailInfo: null,
            assetBundleData: null,
            assetRegistryTags: null,
            chunkIds: [],
            isLocalizedResource: false,
            localizationId: '',
            size: skeletalMesh.vertices?.length || 0,
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
              sourceMeshIndex: index,
              vertexCount: skeletalMesh.vertices?.length || 0,
              triangleCount: skeletalMesh.indices?.length || 0,
              boneCount: skeletalMesh.bones?.length || 0,
              socketCount: skeletalMesh.sockets?.length || 0,
              materialCount: skeletalMesh.materials?.length || 0,
              hasNormals: !!skeletalMesh.normals,
              hasTangents: !!skeletalMesh.tangents,
              hasUVs: !!skeletalMesh.uvs,
              hasColors: !!skeletalMesh.colors,
              hasSkinWeights: !!skeletalMesh.skinWeights,
              hasBoneIndices: !!skeletalMesh.boneIndices,
              boundingBox: skeletalMesh.boundingBox,
              lodLevels: config.meshOptimization === 'lod' ? 4 : 1
            }
          };

          assets.push(asset);

          // Create skeletal mesh component
          const component: UnrealComponentBridge = {
            id: `skeletal_mesh_component_${index}`,
            name: `SkeletalMeshComponent_${index}`,
            className: 'SkeletalMeshComponent',
            properties: {
              skeletalMesh: asset.assetPath,
              materials: skeletalMesh.materials?.map((material: any, matIndex: number) => ({
                materialSlotName: `Material_${matIndex}`,
                materialInterface: material.path || '/Game/MIFF/Materials/DefaultMaterial',
                materialOverride: null,
                enableMaterialOverride: false
              })) || [],
              animClass: '/Game/MIFF/Animations/DefaultAnimBlueprint',
              animInstance: null,
              animationMode: 'animation_blueprint',
              physicsAsset: null,
              bodySetup: null,
              collisionEnabled: config.enablePhysics ? 'query_and_physics' : 'no_collision',
              collisionProfileName: 'Pawn',
              mobility: 'movable',
              castShadow: true,
              receiveShadow: true,
              enableLightmap: config.generateLightmaps,
              lightmapResolution: config.lightmapResolution,
              useDefaultLightmap: true,
              enableDistanceField: config.enableDistanceField,
              enableSignedDistanceField: config.enableSignedDistanceField,
              distanceFieldResolution: 16,
              generateDistanceFieldAsIfTwoSided: false,
              customPrimitiveData: null,
              customDepthStencilValue: 0,
              renderInMainPass: true,
              renderInDepthPass: true,
              renderCustomDepth: false,
              customDepthStencilWriteMask: 0,
              lightingChannels: {
                bChannel0: true,
                bChannel1: false,
                bChannel2: false
              },
              lightmapType: 'surface',
              indirectLightingCacheQuality: 'ilcq_high',
              forceDisableNanite: !config.enableNanite,
              enableVirtualTextureLightmap: config.enableVirtualTextures,
              enableVirtualTexture: config.enableVirtualTextures,
              virtualTextureRenderPassType: 'always',
              naniteSettings: {
                enabled: config.enableNanite,
                fallbackRelativeError: 0.1,
                fallbackPercentTriangles: 0.5
              },
              clothMaxDistanceScale: 1.0,
              clothBackstopDistance: 0.0,
              clothBackstopRadius: 0.0,
              enableClothLOD: true,
              enableClothDamping: true,
              enableClothSelfCollision: false,
              enableClothInterCollision: false,
              enableClothLineChecks: false,
              enableClothTriangleChecks: false,
              clothSimulationQuality: 'fast',
              enableGravityOverride: false,
              gravityOverride: { x: 0, y: 0, z: -980 },
              linearDampingOverride: 0.0,
              angularDampingOverride: 0.0,
              linearDragOverride: 0.0,
              angularDragOverride: 0.0,
              gravityScaleOverride: 1.0,
              disablePostProcessBlueprint: false,
              customPostProcessSettings: null,
              customDepthStencilWriteMaskOverride: 0,
              customDepthStencilValueOverride: 0,
              customPrimitiveDataOverride: null,
              enableCustomPrimitiveData: false,
              enableCustomDepthStencil: false,
              enableCustomPostProcess: false
            },
            componentTags: ['miff', 'skeletal_mesh', 'converted'],
            editableWhenInherited: false,
            isTemplate: false,
            isCreatedByConstructionScript: false,
            usesHierarchy: false,
            replicates: false,
            netAddressable: false,
            autoActivate: true,
            canEverAffectNavigation: false,
            isEditorOnly: false,
            isVisualizationComponent: false,
            bEditableWhenInherited: false,
            bIsScreenSizeScaled: false,
            bTickInEditor: false,
            bUseAttachParentBound: false,
            bVisualizeComponent: false,
            mobility: 'movable',
            detailMode: 'high',
            collisionEnabled: 'query_and_physics',
            collisionProfileName: 'Pawn',
            collisionResponses: {
              'WorldStatic': 'block',
              'WorldDynamic': 'block',
              'Pawn': 'block',
              'Visibility': 'ignore',
              'Camera': 'ignore',
              'PhysicsBody': 'block',
              'Vehicle': 'block',
              'Destructible': 'block'
            },
            generateOverlapEvents: true,
            physicsVolumeChanged: false,
            constraintInstance: null,
            bodyInstance: null,
            metadata: {
              sourceMeshIndex: index,
              conversionMode: 'skeletal_mesh',
              optimizationLevel: config.optimizationLevel,
              boneCount: skeletalMesh.bones?.length || 0,
              socketCount: skeletalMesh.sockets?.length || 0
            }
          };

          // Create skeletal mesh actor
          const actor: UnrealActorBridge = {
            id: `skeletal_mesh_actor_${index}`,
            name: `SkeletalMeshActor_${index}`,
            className: 'SkeletalMeshActor',
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
            components: [component!],
            properties: {
              skeletalMeshComponent: `skeletal_mesh_component_${index}`,
              mobility: 'movable',
              collisionEnabled: config.enablePhysics ? 'query_and_physics' : 'no_collision',
              collisionProfileName: 'Pawn',
              castShadow: true,
              receiveShadow: true,
              animationMode: 'animation_blueprint'
            },
            tags: ['miff', 'skeletal_mesh', 'converted'],
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
            metadata: {
              sourcePayloadId: sourcePayload.id,
              conversionMode: 'skeletal_mesh',
              meshIndex: index,
              optimizationLevel: config.optimizationLevel,
              boneCount: skeletalMesh.bones?.length || 0,
              socketCount: skeletalMesh.sockets?.length || 0
            }
          };

          actors.push(actor);
        }
      }

      console.log(`[UnrealPayloadAdapterPure!] Converted ${assets.length} skeletal meshes and ${actors.length} actors`);
      return { assets, actors, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Skeletal mesh conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { assets: [], actors: [], warnings, errors };
    }
  }

  private async convertToBlueprint(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ assets: UnrealAssetBridge[]; actors: UnrealActorBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to blueprint...');

    const assets: UnrealAssetBridge[] = [];
    const actors: UnrealActorBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Create blueprint asset
      const blueprintAsset: UnrealAssetBridge = {
        id: `blueprint_${Date.now()}`,
        name: 'MIFFBlueprint',
        type: 'blueprint',
        packagePath: '/Game/MIFF/Blueprints',
        assetPath: '/Game/MIFF/Blueprints/MIFFBlueprint',
        className: 'Blueprint',
        blueprintType: 'blueprint',
        generatedClass: '/Game/MIFF/Blueprints/MIFFBlueprint_Generated',
        parentClass: 'Actor',
        interfaces: [],
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
          sourcePayloadId: sourcePayload.id,
          conversionMode: 'blueprint',
          nodeCount: 0,
          variableCount: 0,
          functionCount: 0,
          eventCount: 0
        }
      };

      assets.push(blueprintAsset);

      console.log('[UnrealPayloadAdapterPure!] Converted to blueprint');
      return { assets, actors, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Blueprint conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { assets: [], actors: [], warnings, errors };
    }
  }

  private async convertToLevel(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ scenes: UnrealSceneBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to level...');

    const scenes: UnrealSceneBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Create level scene
      const levelScene: UnrealSceneBridge = {
        id: `level_${Date.now()}`,
        name: 'MIFFLevel',
        path: '/Game/MIFF/Levels/MIFFLevel',
        worldType: 'game',
        featureLevel: 'sm5',
        worldComposition: null,
        levelStreaming: null,
        levelScriptActor: '',
        gameModeOverride: '',
        gameStateOverride: '',
        defaultPawnClass: '',
        hudClass: '',
        playerControllerClass: '',
        gameInstanceClass: '',
        transitionType: 'loading',
        transitionDescription: '',
        transitionGameMode: '',
        transitionLevel: '',
        transitionPosition: { x: 0, y: 0, z: 0 },
        transitionRotation: { pitch: 0, yaw: 0, roll: 0 },
        bCreateOnClient: true,
        bCreateOnServer: true,
        bShouldBlockOnLoad: false,
        bShouldBlockOnUnload: false,
        bHasBegunPlay: false,
        bPlayersOnly: false,
        bPlayersOnlyPending: false,
        bShouldBeVisible: true,
        bShouldBeLoaded: true,
        bIsVisible: true,
        bIsLoaded: false,
        bIsFromLevelStreaming: false,
        bIsPartitioned: false,
        bIsWorldPartitioned: false,
        bCanBePartitioned: false,
        metadata: {
          sourcePayloadId: sourcePayload.id,
          conversionMode: 'level',
          actorCount: 0,
          lightCount: 0,
          volumeCount: 0
        }
      };

      scenes.push(levelScene);

      console.log('[UnrealPayloadAdapterPure!] Converted to level');
      return { scenes, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Level conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { scenes: [], warnings, errors };
    }
  }

  private async convertToMaterial(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ assets: UnrealAssetBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to material...');

    const assets: UnrealAssetBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Convert material data to Unreal material
      if (sourcePayload.materials) {
        for (const [index, material] of sourcePayload.materials.entries()) {
          const asset: UnrealAssetBridge = {
            id: `material_${index}_${Date.now()}`,
            name: `Material_${index}`,
            type: 'material',
            packagePath: '/Game/MIFF/Materials',
            assetPath: `/Game/MIFF/Materials/Material_${index}`,
            className: 'Material',
            dependencies: material.textures?.map((tex: any) => tex.path) || [],
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
              sourceMaterialIndex: index,
              textureCount: material.textures?.length || 0,
              parameterCount: material.parameters?.length || 0,
              materialDomain: 'surface',
              blendMode: 'opaque',
              shadingModel: 'default_lit'
            }
          };

          assets.push(asset);
        }
      }

      console.log(`[UnrealPayloadAdapterPure!] Converted ${assets.length} materials`);
      return { assets, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Material conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { assets: [], warnings, errors };
    }
  }

  private async convertToTexture(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ assets: UnrealAssetBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to texture...');

    const assets: UnrealAssetBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Convert texture data to Unreal texture
      if (sourcePayload.textures) {
        for (const [index, texture] of sourcePayload.textures.entries()) {
          const asset: UnrealAssetBridge = {
            id: `texture_${index}_${Date.now()}`,
            name: `Texture_${index}`,
            type: 'texture',
            packagePath: '/Game/MIFF/Textures',
            assetPath: `/Game/MIFF/Textures/Texture_${index}`,
            className: 'Texture2D',
            dependencies: [],
            references: [],
            thumbnailInfo: null,
            assetBundleData: null,
            assetRegistryTags: null,
            chunkIds: [],
            isLocalizedResource: false,
            localizationId: '',
            size: texture.width * texture.height * 4, // Assuming RGBA
            diskSize: 0,
            memorySize: 0,
            uncompressedSize: texture.width * texture.height * 4,
            compressionBlockSize: 0,
            compressionBlockCount: 0,
            cookedHash: '',
            loadedState: 'not_loaded',
            loadPriority: 0,
            loadOrder: 0,
            loadState: 'uninitialized',
            metadata: {
              sourceTextureIndex: index,
              width: texture.width,
              height: texture.height,
              format: texture.format || 'auto',
              compressionFormat: config.textureFormat,
              maxSize: config.maxTextureSize,
              enableMipmaps: config.enableMipmaps,
              enableStreaming: config.enableStreaming
            }
          };

          assets.push(asset);
        }
      }

      console.log(`[UnrealPayloadAdapterPure!] Converted ${assets.length} textures`);
      return { assets, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Texture conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { assets: [], warnings, errors };
    }
  }

  private async convertToAnimation(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ assets: UnrealAssetBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to animation...');

    const assets: UnrealAssetBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Convert animation data to Unreal animation sequence
      if (sourcePayload.animations) {
        for (const [index, animation] of sourcePayload.animations.entries()) {
          const asset: UnrealAssetBridge = {
            id: `animation_${index}_${Date.now()}`,
            name: `Animation_${index}`,
            type: 'animation_sequence',
            packagePath: '/Game/MIFF/Animations',
            assetPath: `/Game/MIFF/Animations/Animation_${index}`,
            className: 'AnimSequence',
            dependencies: [],
            references: [],
            thumbnailInfo: null,
            assetBundleData: null,
            assetRegistryTags: null,
            chunkIds: [],
            isLocalizedResource: false,
            localizationId: '',
            size: animation.frameCount * animation.boneCount * 12, // Rough estimate
            diskSize: 0,
            memorySize: 0,
            uncompressedSize: animation.frameCount * animation.boneCount * 12,
            compressionBlockSize: 0,
            compressionBlockCount: 0,
            cookedHash: '',
            loadedState: 'not_loaded',
            loadPriority: 0,
            loadOrder: 0,
            loadState: 'uninitialized',
            metadata: {
              sourceAnimationIndex: index,
              frameCount: animation.frameCount,
              frameRate: animation.frameRate,
              duration: animation.duration,
              boneCount: animation.boneCount,
              trackCount: animation.tracks?.length || 0,
              compression: config.animationCompression
            }
          };

          assets.push(asset);
        }
      }

      console.log(`[UnrealPayloadAdapterPure!] Converted ${assets.length} animations`);
      return { assets, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Animation conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { assets: [], warnings, errors };
    }
  }

  private async convertToParticleSystem(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ assets: UnrealAssetBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to particle system...');

    const assets: UnrealAssetBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Convert particle data to Unreal particle system
      if (sourcePayload.particles) {
        for (const [index, particle] of sourcePayload.particles.entries()) {
          const asset: UnrealAssetBridge = {
            id: `particle_${index}_${Date.now()}`,
            name: `Particle_${index}`,
            type: 'particle_system',
            packagePath: '/Game/MIFF/Particles',
            assetPath: `/Game/MIFF/Particles/Particle_${index}`,
            className: 'ParticleSystem',
            dependencies: particle.textures?.map((tex: any) => tex.path) || [],
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
              sourceParticleIndex: index,
              emitterCount: particle.emitters?.length || 0,
              textureCount: particle.textures?.length || 0,
              moduleCount: particle.modules?.length || 0,
              maxParticles: particle.maxParticles,
              spawnRate: particle.spawnRate,
              duration: particle.duration,
              loop: particle.loop
            }
          };

          assets.push(asset);
        }
      }

      console.log(`[UnrealPayloadAdapterPure!] Converted ${assets.length} particle systems`);
      return { assets, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Particle system conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { assets: [], warnings, errors };
    }
  }

  private async convertToSound(
    sourcePayload: any,
    config: PayloadConversionConfiguration
  ): Promise<{ assets: UnrealAssetBridge[]; warnings: string[]; errors: string[] }> {
    console.log('[UnrealPayloadAdapterPure!] Converting to sound...');

    const assets: UnrealAssetBridge[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Convert audio data to Unreal sound wave
      if (sourcePayload.audio) {
        for (const [index, audio] of sourcePayload.audio.entries()) {
          const asset: UnrealAssetBridge = {
            id: `sound_${index}_${Date.now()}`,
            name: `Sound_${index}`,
            type: 'sound_wave',
            packagePath: '/Game/MIFF/Sounds',
            assetPath: `/Game/MIFF/Sounds/Sound_${index}`,
            className: 'SoundWave',
            dependencies: [],
            references: [],
            thumbnailInfo: null,
            assetBundleData: null,
            assetRegistryTags: null,
            chunkIds: [],
            isLocalizedResource: false,
            localizationId: '',
            size: audio.data?.length || 0,
            diskSize: 0,
            memorySize: 0,
            uncompressedSize: audio.data?.length || 0,
            compressionBlockSize: 0,
            compressionBlockCount: 0,
            cookedHash: '',
            loadedState: 'not_loaded',
            loadPriority: 0,
            loadOrder: 0,
            loadState: 'uninitialized',
            metadata: {
              sourceAudioIndex: index,
              sampleRate: audio.sampleRate,
              bitDepth: audio.bitDepth,
              channelCount: audio.channelCount,
              duration: audio.duration,
              compression: config.soundCompression,
              format: audio.format || 'wav'
            }
          };

          assets.push(asset);
        }
      }

      console.log(`[UnrealPayloadAdapterPure!] Converted ${assets.length} sounds`);
      return { assets, warnings, errors };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealPayloadAdapterPure!] Sound conversion failed:', err instanceof Error ? err.message : String(err));
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { assets: [], warnings, errors };
    }
  }

  // Configuration management
  addConfiguration(name: string, config: PayloadConversionConfiguration): void {
    this.conversionConfigurations.set(name, config);
  }

  getConfiguration(name: string): PayloadConversionConfiguration | undefined {
    return this.conversionConfigurations.get(name);
  }

  updateConfiguration(name: string, updates: Partial<PayloadConversionConfiguration>): void {
    const existing = this.conversionConfigurations.get(name);
    if (existing) {
      Object.assign(existing, updates);
    }
  }

  removeConfiguration(name: string): void {
    this.conversionConfigurations.delete(name);
  }

  getAllConfigurations(): string[] {
    return Array.from(this.conversionConfigurations.keys());
  }

  // Utility methods
  getConversionStats(): any {
    return {
      configurations: this.conversionConfigurations.size,
      renderPayloadManager: this.renderPayloadManager.getPayloadCount(),
      bridgeManager: {
        actors: this.bridgeManager['actors']?.size || 0,
        components: this.bridgeManager['components']?.size || 0,
        assets: this.bridgeManager['assets']?.size || 0,
        scenes: this.bridgeManager['scenes']?.size || 0
      }
    };
  }

  dispose(): void {
    console.log('[UnrealPayloadAdapterPure!] Disposing payload adapter...');
    this.conversionConfigurations.clear();
    console.log('[UnrealPayloadAdapterPure!] Payload adapter disposed successfully');
  }
}