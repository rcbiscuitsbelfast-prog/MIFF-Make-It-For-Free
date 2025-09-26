// SceneBuilderPure - Scene composition and world building system for MIFF framework
// Schema Version: v1

export enum SceneLayer {
  BACKGROUND = 'background',
  TERRAIN = 'terrain',
  STRUCTURES = 'structures',
  INTERACTABLES = 'interactables',
  CHARACTERS = 'characters',
  EFFECTS = 'effects',
  UI = 'ui',
  OVERLAY = 'overlay'
}

export enum SceneOptimizationMode {
  NONE = 'none',
  CULLING = 'culling',
  LOD = 'lod',
  BATCHING = 'batching',
  INSTANCING = 'instancing',
  OCCLUSION = 'occlusion'
}

export enum SceneExportFormat {
  UNITY = 'unity',
  GODOT = 'godot',
  WEBGL = 'webgl',
  GLTF = 'gltf',
  FBX = 'fbx',
  OBJ = 'obj',
  JSON = 'json',
  BINARY = 'binary'
}

export interface SceneBuildConfiguration {
  name: string;
  description: string;
  dimensions: { width: number; height: number; depth?: number };
  layers: SceneLayer[];
  optimizationMode: SceneOptimizationMode;
  exportFormats: SceneExportFormat[];
  enablePhysics: boolean;
  enableLighting: boolean;
  enableAudio: boolean;
  enableAnimations: boolean;
  enableParticles: boolean;
  enablePostProcessing: boolean;
  maxRenderDistance: number;
  lodLevels: number;
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadowQuality: 'off' | 'low' | 'medium' | 'high' | 'ultra';
  antialiasing: 'none' | 'fxaa' | 'msaa_2x' | 'msaa_4x' | 'msaa_8x';
  ambientOcclusion: boolean;
  bloom: boolean;
  motionBlur: boolean;
  depthOfField: boolean;
  colorGrading: boolean;
  customSettings: Record<string, any>;
}

export interface SceneNode {
  id: string;
  name: string;
  layer: SceneLayer;
  type: 'mesh' | 'sprite' | 'light' | 'camera' | 'audio' | 'particle' | 'animation' | 'trigger' | 'collider' | 'custom';
  position: { x: number; y: number; z?: number };
  rotation: { x: number; y: number; z: number; w?: number };
  scale: { x: number; y: number; z?: number };
  parent?: string;
  children: string[];
  components: SceneComponent[];
  metadata: Record<string, any>;
  tags: string[];
  visible: boolean;
  enabled: boolean;
  static: boolean;
  castShadows: boolean;
  receiveShadows: boolean;
}

export interface SceneComponent {
  type: string;
  properties: Record<string, any>;
  enabled: boolean;
  order: number;
}

export interface SceneAsset {
  id: string;
  name: string;
  type: 'texture' | 'mesh' | 'material' | 'shader' | 'audio' | 'animation' | 'prefab' | 'script' | 'font' | 'particle';
  path: string;
  size: number;
  format: string;
  compression: 'none' | 'gzip' | 'lz4' | 'lzma';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  metadata: Record<string, any>;
  dependencies: string[];
  tags: string[];
  loadPriority: number;
  preload: boolean;
  cache: boolean;
}

export interface SceneLight {
  id: string;
  type: 'directional' | 'point' | 'spot' | 'area' | 'ambient';
  color: { r: number; g: number; b: number; a?: number };
  intensity: number;
  range?: number;
  angle?: number;
  shadows: boolean;
  shadowBias: number;
  shadowNormalBias: number;
  shadowNearPlane: number;
  shadowFarPlane: number;
  shadowResolution: number;
  shadowCascades: number;
  shadowDistance: number;
}

export interface SceneCamera {
  id: string;
  type: 'perspective' | 'orthographic';
  fov: number;
  nearClip: number;
  farClip: number;
  aspect: number;
  orthographicSize: number;
  viewport: { x: number; y: number; width: number; height: number };
  clearFlags: 'skybox' | 'solid_color' | 'depth_only' | 'nothing';
  backgroundColor: { r: number; g: number; b: number; a: number };
  cullingMask: string[];
  occlusionCulling: boolean;
  hdr: boolean;
  msaa: boolean;
  renderTexture?: string;
}

export interface SceneAudio {
  id: string;
  type: 'source' | 'listener' | 'reverb_zone' | 'audio_clip';
  clip?: string;
  volume: number;
  pitch: number;
  loop: boolean;
  spatial: boolean;
  minDistance: number;
  maxDistance: number;
  rolloffMode: 'linear' | 'logarithmic' | 'custom';
  dopplerLevel: number;
  spread: number;
  reverbZoneMix: number;
}

export interface SceneAnimation {
  id: string;
  target: string;
  clip: string;
  speed: number;
  loop: boolean;
  wrapMode: 'once' | 'loop' | 'ping_pong' | 'clamp';
  layer: number;
  weight: number;
  blendMode: 'override' | 'additive';
  events: SceneAnimationEvent[];
}

export interface SceneAnimationEvent {
  time: number;
  functionName: string;
  parameters: any[];
  objectReferenceParameter?: string;
}

export interface SceneParticleSystem {
  id: string;
  emitterShape: 'sphere' | 'box' | 'cone' | 'circle' | 'edge' | 'mesh';
  startSpeed: number;
  startSize: number;
  startLifetime: number;
  startColor: { r: number; g: number; b: number; a: number };
  gravityModifier: number;
  simulationSpace: 'local' | 'world';
  scalingMode: 'local' | 'hierarchy' | 'shape';
  playOnAwake: boolean;
  looping: boolean;
  prewarm: boolean;
  duration: number;
  maxParticles: number;
  emissionRate: number;
  burstCount: number;
  burstTime: number;
  burstCycles: number;
  burstInterval: number;
  burstProbability: number;
}

export interface SceneTrigger {
  id: string;
  shape: 'box' | 'sphere' | 'capsule' | 'mesh';
  size: { x: number; y: number; z: number };
  center: { x: number; y: number; z: number };
  isTrigger: boolean;
  layerMask: string[];
  events: SceneTriggerEvent[];
}

export interface SceneTriggerEvent {
  type: 'enter' | 'stay' | 'exit';
  targetTag: string;
  methodName: string;
  parameters: any[];
  delay: number;
  repeat: boolean;
}

export interface SceneCollider {
  id: string;
  type: 'box' | 'sphere' | 'capsule' | 'mesh' | 'terrain';
  center: { x: number; y: number; z: number };
  size: { x: number; y: number; z: number };
  radius: number;
  height: number;
  direction: 'x' | 'y' | 'z';
  convex: boolean;
  isTrigger: boolean;
  material: string;
  layer: string;
  includeLayers: string[];
  excludeLayers: string[];
}

export interface ScenePhysicsMaterial {
  id: string;
  name: string;
  dynamicFriction: number;
  staticFriction: number;
  bounciness: number;
  frictionCombine: 'average' | 'minimum' | 'maximum' | 'multiply';
  bounceCombine: 'average' | 'minimum' | 'maximum' | 'multiply';
}

export interface ScenePostProcessing {
  id: string;
  effects: ScenePostProcessingEffect[];
  enabled: boolean;
  priority: number;
}

export interface ScenePostProcessingEffect {
  type: 'bloom' | 'depth_of_field' | 'motion_blur' | 'vignette' | 'color_grading' | 'grain' | 'chromatic_aberration' | 'lens_distortion';
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface SceneBuildResult {
  success: boolean;
  sceneId: string;
  buildTime: number;
  fileSize: number;
  assetCount: number;
  nodeCount: number;
  optimizationStats: SceneOptimizationStats;
  exportPaths: Record<SceneExportFormat, string>;
  warnings: string[];
  errors: string[];
  metadata: Record<string, any>;
}

export interface SceneOptimizationStats {
  triangles: number;
  vertices: number;
  meshes: number;
  materials: number;
  textures: number;
  drawCalls: number;
  culledObjects: number;
  batchedObjects: number;
  instancedObjects: number;
  memoryUsage: number;
  compressionRatio: number;
  lodLevels: number;
  occlusionAreas: number;
}

export interface SceneValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  performanceScore: number;
  compatibility: Record<string, boolean>;
}

export interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  configuration: Partial<SceneBuildConfiguration>;
  nodes: SceneNode[];
  assets: SceneAsset[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface SceneBuilderProgress {
  stage: 'initialization' | 'asset_loading' | 'node_building' | 'optimization' | 'export' | 'finalization';
  progress: number;
  message: string;
  estimatedTimeRemaining: number;
  currentOperation: string;
  completedOperations: string[];
  failedOperations: string[];
}

export class SceneBuilderManager {
  private configuration: SceneBuildConfiguration;
  private nodes: Map<string, SceneNode> = new Map();
  private assets: Map<string, SceneAsset> = new Map();
  private lights: Map<string, SceneLight> = new Map();
  private cameras: Map<string, SceneCamera> = new Map();
  private audios: Map<string, SceneAudio> = new Map();
  private animations: Map<string, SceneAnimation> = new Map();
  private particleSystems: Map<string, SceneParticleSystem> = new Map();
  private triggers: Map<string, SceneTrigger> = new Map();
  private colliders: Map<string, SceneCollider> = new Map();
  private postProcessing: Map<string, ScenePostProcessing> = new Map();
  private templates: Map<string, SceneTemplate> = new Map();
  private isBuilding = false;
  private buildProgress?: SceneBuilderProgress;

  constructor(configuration: SceneBuildConfiguration) {
    this.configuration = configuration;
    this.initializeBuilder();
  }

  private initializeBuilder(): void {
    console.log('[SceneBuilderManager] Initializing scene builder...');

    // Initialize default templates
    this.initializeDefaultTemplates();

    // Initialize optimization systems
    this.initializeOptimizationSystems();

    console.log('[SceneBuilderManager] Scene builder initialized successfully');
  }

  private initializeDefaultTemplates(): void {
    // Empty scene template
    const emptyTemplate: SceneTemplate = {
      id: 'template_empty',
      name: 'Empty Scene',
      description: 'A blank scene with basic configuration',
      category: 'basic',
      configuration: {
        dimensions: { width: 100, height: 100 },
        layers: [SceneLayer.BACKGROUND, SceneLayer.TERRAIN, SceneLayer.CHARACTERS],
        optimizationMode: SceneOptimizationMode.CULLING,
        exportFormats: [SceneExportFormat.UNITY, SceneExportFormat.GODOT],
        enablePhysics: false,
        enableLighting: true,
        enableAudio: false,
        enableAnimations: false,
        enableParticles: false,
        enablePostProcessing: false,
        maxRenderDistance: 50,
        lodLevels: 3,
        textureQuality: 'medium',
        shadowQuality: 'medium',
        antialiasing: 'fxaa',
        ambientOcclusion: false,
        bloom: false,
        motionBlur: false,
        depthOfField: false,
        colorGrading: false,
        customSettings: {}
      },
      nodes: [],
      assets: [],
      tags: ['basic', 'empty'],
      metadata: {}
    };

    this.templates.set('template_empty', emptyTemplate);

    // Basic 2D scene template
    const basic2DTemplate: SceneTemplate = {
      id: 'template_2d_basic',
      name: 'Basic 2D Scene',
      description: 'A simple 2D scene with camera and lighting',
      category: '2d',
      configuration: {
        dimensions: { width: 1920, height: 1080 },
        layers: [SceneLayer.BACKGROUND, SceneLayer.TERRAIN, SceneLayer.INTERACTABLES, SceneLayer.CHARACTERS, SceneLayer.UI],
        optimizationMode: SceneOptimizationMode.CULLING,
        exportFormats: [SceneExportFormat.UNITY, SceneExportFormat.GODOT, SceneExportFormat.WEBGL],
        enablePhysics: true,
        enableLighting: true,
        enableAudio: true,
        enableAnimations: true,
        enableParticles: false,
        enablePostProcessing: true,
        maxRenderDistance: 100,
        lodLevels: 2,
        textureQuality: 'high',
        shadowQuality: 'medium',
        antialiasing: 'msaa_2x',
        ambientOcclusion: true,
        bloom: true,
        motionBlur: false,
        depthOfField: true,
        colorGrading: true,
        customSettings: {}
      },
      nodes: [
        {
          id: 'main_camera',
          name: 'Main Camera',
          layer: SceneLayer.CHARACTERS,
          type: 'camera',
          position: { x: 0, y: 0, z: -10 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
          children: [],
          components: [
            {
              type: 'CameraComponent',
              properties: {
                fov: 60,
                nearClip: 0.1,
                farClip: 1000,
                clearFlags: 'skybox'
              },
              enabled: true,
              order: 0
            }
          ],
          metadata: {},
          tags: ['camera', 'main'],
          visible: true,
          enabled: true,
          static: false,
          castShadows: false,
          receiveShadows: false
        },
        {
          id: 'directional_light',
          name: 'Directional Light',
          layer: SceneLayer.BACKGROUND,
          type: 'light',
          position: { x: 0, y: 10, z: 0 },
          rotation: { x: 50, y: -30, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
          children: [],
          components: [
            {
              type: 'LightComponent',
              properties: {
                type: 'directional',
                color: { r: 1, g: 0.956, b: 0.839, a: 1 },
                intensity: 1,
                shadows: true
              },
              enabled: true,
              order: 0
            }
          ],
          metadata: {},
          tags: ['light', 'directional'],
          visible: true,
          enabled: true,
          static: false,
          castShadows: false,
          receiveShadows: false
        }
      ],
      assets: [],
      tags: ['2d', 'basic', 'camera', 'lighting'],
      metadata: {}
    };

    this.templates.set('template_2d_basic', basic2DTemplate);
  }

  private initializeOptimizationSystems(): void {
    // Initialize optimization systems based on configuration
    if (this.configuration.optimizationMode !== SceneOptimizationMode.NONE) {
      console.log(`[SceneBuilderManager] Initializing optimization system: ${this.configuration.optimizationMode}`);
    }
  }

  // Core scene building functionality
  async buildScene(templateId?: string): Promise<SceneBuildResult> {
    if (this.isBuilding) {
      throw new Error('Scene building already in progress');
    }

    this.isBuilding = true;
    this.buildProgress = {
      stage: 'initialization',
      progress: 0,
      message: 'Initializing scene build...',
      estimatedTimeRemaining: 0,
      currentOperation: 'setup',
      completedOperations: [],
      failedOperations: []
    };

    try {
      console.log('[SceneBuilderManager] Starting scene build...');

      // Initialize scene
      this.updateProgress('initialization', 10, 'Setting up scene structure...');
      await this.initializeScene(templateId);

      // Load assets
      this.updateProgress('asset_loading', 25, 'Loading assets...');
      await this.loadAssets();

      // Build nodes
      this.updateProgress('node_building', 50, 'Building scene nodes...');
      await this.buildSceneNodes();

      // Apply optimizations
      this.updateProgress('optimization', 75, 'Applying optimizations...');
      await this.applyOptimizations();

      // Export scene
      this.updateProgress('export', 90, 'Exporting scene...');
      const exportPaths = await this.exportScene();

      // Finalize
      this.updateProgress('finalization', 100, 'Finalizing scene...');
      await this.finalizeScene();

      const result: SceneBuildResult = {
        success: true,
        sceneId: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        buildTime: Date.now(),
        fileSize: 0, // Would be calculated from actual files
        assetCount: this.assets.size,
        nodeCount: this.nodes.size,
        optimizationStats: this.calculateOptimizationStats(),
        exportPaths,
        warnings: [],
        errors: [],
        metadata: {
          configuration: this.configuration,
          template: templateId,
          buildDuration: Date.now()
        }
      };

      console.log('[SceneBuilderManager] Scene build completed successfully');
      return result;

    } catch (error) {
      console.error('[SceneBuilderManager] Scene build failed:', error);

      const result: SceneBuildResult = {
        success: false,
        sceneId: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        buildTime: Date.now(),
        fileSize: 0,
        assetCount: this.assets.size,
        nodeCount: this.nodes.size,
        optimizationStats: this.calculateOptimizationStats(),
        exportPaths: {},
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          configuration: this.configuration,
          template: templateId,
          buildDuration: Date.now(),
          error: error
        }
      };

      return result;
    } finally {
      this.isBuilding = false;
      this.buildProgress = undefined;
    }
  }

  private async initializeScene(templateId?: string): Promise<void> {
    // Clear existing scene data
    this.nodes.clear();
    this.assets.clear();
    this.lights.clear();
    this.cameras.clear();
    this.audios.clear();
    this.animations.clear();
    this.particleSystems.clear();
    this.triggers.clear();
    this.colliders.clear();
    this.postProcessing.clear();

    // Load template if specified
    if (templateId) {
      const template = this.templates.get(templateId);
      if (template) {
        console.log(`[SceneBuilderManager] Loading template: ${template.name}`);

        // Apply template configuration
        Object.assign(this.configuration, template.configuration);

        // Load template nodes
        for (const node of template.nodes) {
          this.nodes.set(node.id, { ...node });
        }

        // Load template assets
        for (const asset of template.assets) {
          this.assets.set(asset.id, { ...asset });
        }
      } else {
        throw new Error(`Template not found: ${templateId}`);
      }
    }
  }

  private async loadAssets(): Promise<void> {
    // Simulate asset loading
    console.log('[SceneBuilderManager] Loading assets...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async buildSceneNodes(): Promise<void> {
    // Build scene hierarchy
    console.log('[SceneBuilderManager] Building scene nodes...');
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async applyOptimizations(): Promise<void> {
    console.log(`[SceneBuilderManager] Applying optimizations: ${this.configuration.optimizationMode}`);

    switch (this.configuration.optimizationMode) {
      case SceneOptimizationMode.CULLING:
        await this.applyCullingOptimizations();
        break;
      case SceneOptimizationMode.LOD:
        await this.applyLODOptimizations();
        break;
      case SceneOptimizationMode.BATCHING:
        await this.applyBatchingOptimizations();
        break;
      case SceneOptimizationMode.INSTANCING:
        await this.applyInstancingOptimizations();
        break;
      case SceneOptimizationMode.OCCLUSION:
        await this.applyOcclusionOptimizations();
        break;
      default:
        console.log('[SceneBuilderManager] No optimizations applied');
    }

    await new Promise(resolve => setTimeout(resolve, 150));
  }

  private async applyCullingOptimizations(): Promise<void> {
    console.log('[SceneBuilderManager] Applying culling optimizations...');
    // Implementation for frustum culling, occlusion culling, etc.
  }

  private async applyLODOptimizations(): Promise<void> {
    console.log('[SceneBuilderManager] Applying LOD optimizations...');
    // Implementation for level of detail optimizations
  }

  private async applyBatchingOptimizations(): Promise<void> {
    console.log('[SceneBuilderManager] Applying batching optimizations...');
    // Implementation for static/dynamic batching
  }

  private async applyInstancingOptimizations(): Promise<void> {
    console.log('[SceneBuilderManager] Applying instancing optimizations...');
    // Implementation for GPU instancing
  }

  private async applyOcclusionOptimizations(): Promise<void> {
    console.log('[SceneBuilderManager] Applying occlusion optimizations...');
    // Implementation for occlusion culling
  }

  private async exportScene(): Promise<Record<SceneExportFormat, string>> {
    const exportPaths: Record<SceneExportFormat, string> = {} as Record<SceneExportFormat, string>;

    for (const format of this.configuration.exportFormats) {
      console.log(`[SceneBuilderManager] Exporting to ${format}...`);

      switch (format) {
        case SceneExportFormat.UNITY:
          exportPaths[format] = await this.exportToUnity();
          break;
        case SceneExportFormat.GODOT:
          exportPaths[format] = await this.exportToGodot();
          break;
        case SceneExportFormat.WEBGL:
          exportPaths[format] = await this.exportToWebGL();
          break;
        case SceneExportFormat.JSON:
          exportPaths[format] = await this.exportToJSON();
          break;
        default:
          exportPaths[format] = `export_${format}_${Date.now()}`;
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return exportPaths;
  }

  private async exportToUnity(): Promise<string> {
    // Implementation for Unity export
    return `unity_export_${Date.now()}.unity`;
  }

  private async exportToGodot(): Promise<string> {
    // Implementation for Godot export
    return `godot_export_${Date.now()}.tscn`;
  }

  private async exportToWebGL(): Promise<string> {
    // Implementation for WebGL export
    return `webgl_export_${Date.now()}`;
  }

  private async exportToJSON(): Promise<string> {
    // Implementation for JSON export
    return `scene_export_${Date.now()}.json`;
  }

  private async finalizeScene(): Promise<void> {
    console.log('[SceneBuilderManager] Finalizing scene...');
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private calculateOptimizationStats(): SceneOptimizationStats {
    return {
      triangles: 0,
      vertices: 0,
      meshes: 0,
      materials: 0,
      textures: 0,
      drawCalls: 0,
      culledObjects: 0,
      batchedObjects: 0,
      instancedObjects: 0,
      memoryUsage: 0,
      compressionRatio: 1.0,
      lodLevels: this.configuration.lodLevels,
      occlusionAreas: 0
    };
  }

  private updateProgress(stage: SceneBuilderProgress['stage'], progress: number, message: string): void {
    if (this.buildProgress) {
      this.buildProgress.stage = stage;
      this.buildProgress.progress = progress;
      this.buildProgress.message = message;
      this.buildProgress.currentOperation = message;

      console.log(`[SceneBuilderManager] Progress: ${progress}% - ${message}`);
    }
  }

  // Scene management methods
  addNode(node: SceneNode): void {
    this.nodes.set(node.id, node);
  }

  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      // Remove from parent
      if (node.parent) {
        const parent = this.nodes.get(node.parent);
        if (parent) {
          parent.children = parent.children.filter(id => id !== nodeId);
        }
      }

      // Remove children recursively
      for (const childId of node.children) {
        this.removeNode(childId);
      }

      this.nodes.delete(nodeId);
    }
  }

  getNode(nodeId: string): SceneNode | undefined {
    return this.nodes.get(nodeId);
  }

  addAsset(asset: SceneAsset): void {
    this.assets.set(asset.id, asset);
  }

  removeAsset(assetId: string): void {
    this.assets.delete(assetId);
  }

  getAsset(assetId: string): SceneAsset | undefined {
    return this.assets.get(assetId);
  }

  addTemplate(template: SceneTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(templateId: string): SceneTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): SceneTemplate[] {
    return Array.from(this.templates.values());
  }

  // Validation and optimization
  validateScene(): SceneValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate nodes
    for (const node of this.nodes.values()) {
      if (!node.name || node.name.trim() === '') {
        errors.push(`Node '${node.id}' has empty name`);
      }

      if (node.parent && !this.nodes.has(node.parent)) {
        errors.push(`Node '${node.id}' references non-existent parent '${node.parent}'`);
      }
    }

    // Validate assets
    for (const asset of this.assets.values()) {
      if (!asset.path || asset.path.trim() === '') {
        errors.push(`Asset '${asset.id}' has empty path`);
      }
    }

    // Performance suggestions
    if (this.nodes.size > 1000) {
      suggestions.push('Large number of nodes detected. Consider using LOD or culling.');
    }

    if (this.assets.size > 500) {
      suggestions.push('Large number of assets detected. Consider asset bundling.');
    }

    const performanceScore = Math.max(0, 100 - errors.length * 10 - warnings.length * 2);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      performanceScore,
      compatibility: {
        unity: true,
        godot: true,
        webgl: true
      }
    };
  }

  // Configuration management
  updateConfiguration(updates: Partial<SceneBuildConfiguration>): void {
    Object.assign(this.configuration, updates);
  }

  getConfiguration(): SceneBuildConfiguration {
    return { ...this.configuration };
  }

  // Progress tracking
  getBuildProgress(): SceneBuilderProgress | undefined {
    return this.buildProgress ? { ...this.buildProgress } : undefined;
  }

  // Utility methods
  getSceneBounds(): { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } } {
    const positions = Array.from(this.nodes.values()).map(node => node.position);

    if (positions.length === 0) {
      return {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 }
      };
    }

    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };

    for (const pos of positions) {
      min.x = Math.min(min.x, pos.x);
      min.y = Math.min(min.y, pos.y);
      min.z = Math.min(min.z, pos.z || 0);
      max.x = Math.max(max.x, pos.x);
      max.y = Math.max(max.y, pos.y);
      max.z = Math.max(max.z, pos.z || 0);
    }

    return { min, max };
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getAssetCount(): number {
    return this.assets.size;
  }

  // Export individual components
  exportSceneData(): string {
    const sceneData = {
      configuration: this.configuration,
      nodes: Array.from(this.nodes.values()),
      assets: Array.from(this.assets.values()),
      lights: Array.from(this.lights.values()),
      cameras: Array.from(this.cameras.values()),
      audios: Array.from(this.audios.values()),
      animations: Array.from(this.animations.values()),
      particleSystems: Array.from(this.particleSystems.values()),
      triggers: Array.from(this.triggers.values()),
      colliders: Array.from(this.colliders.values()),
      postProcessing: Array.from(this.postProcessing.values()),
      timestamp: Date.now()
    };

    return JSON.stringify(sceneData, null, 2);
  }

  // Cleanup
  dispose(): void {
    this.nodes.clear();
    this.assets.clear();
    this.lights.clear();
    this.cameras.clear();
    this.audios.clear();
    this.animations.clear();
    this.particleSystems.clear();
    this.triggers.clear();
    this.colliders.clear();
    this.postProcessing.clear();
    this.templates.clear();

    console.log('[SceneBuilderManager] Disposed successfully');
  }
}

// Default export
export { SceneBuilderManager as default };