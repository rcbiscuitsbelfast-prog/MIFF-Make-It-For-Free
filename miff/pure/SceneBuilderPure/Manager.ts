/**
 * SceneBuilderPure Manager - Advanced Scene Construction System
 *
 * Comprehensive scene building with:
 * - Real-time scene editing
 * - Asset placement and management
 * - Lighting and environment setup
 * - Physics and collision configuration
 * - Performance optimization
 * - Multi-user collaboration
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';

export interface SceneBuilderConfig {
  enableRealTimeEditing: boolean;
  enableMultiUser: boolean;
  enablePhysics: boolean;
  enableLighting: boolean;
  enableWeather: boolean;
  enableAudio: boolean;
  enableParticles: boolean;
  enableOptimization: boolean;
  maxObjects: number;
  maxLights: number;
  maxParticles: number;
  enableUndoRedo: boolean;
  enableSnapToGrid: boolean;
  gridSize: number;
  enableCollisionPreview: boolean;
  enablePerformanceMonitoring: boolean;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  created: number;
  modified: number;
  objects: SceneObject[];
  lights: SceneLight[];
  cameras: SceneCamera[];
  environment: SceneEnvironment;
  physics: ScenePhysics;
  audio: SceneAudio;
  particles: ParticleSystem[];
  metadata: SceneMetadata;
  isDirty: boolean;
  isLocked: boolean;
  lockExpiry: number;
}

export interface SceneObject {
  id: string;
  name: string;
  type: ObjectType;
  position: Position3D;
  rotation: Rotation3D;
  scale: Scale3D;
  visible: boolean;
  locked: boolean;
  parent: string | null;
  children: string[];
  components: Component[];
  materials: Material[];
  physics: ObjectPhysics;
  audio: ObjectAudio;
  particles: ObjectParticles;
  metadata: Map<string, any>;
}

export enum ObjectType {
  MESH = 'mesh',
  LIGHT = 'light',
  CAMERA = 'camera',
  EMPTY = 'empty',
  GROUP = 'group',
  INSTANCE = 'instance',
  PREFAB = 'prefab',
  TERRAIN = 'terrain',
  WATER = 'water',
  SKYBOX = 'skybox',
  PARTICLE_SYSTEM = 'particle_system',
  AUDIO_SOURCE = 'audio_source',
  TRIGGER = 'trigger',
  SPAWN_POINT = 'spawn_point',
  CUSTOM = 'custom'
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Scale3D {
  x: number;
  y: number;
  z: number;
}

export interface Component {
  id: string;
  type: ComponentType;
  enabled: boolean;
  data: Map<string, any>;
  metadata: Map<string, any>;
}

export enum ComponentType {
  TRANSFORM = 'transform',
  MESH_RENDERER = 'mesh_renderer',
  LIGHT = 'light',
  CAMERA = 'camera',
  RIGIDBODY = 'rigidbody',
  COLLIDER = 'collider',
  AUDIO_SOURCE = 'audio_source',
  PARTICLE_SYSTEM = 'particle_system',
  ANIMATOR = 'animator',
  SCRIPT = 'script',
  CUSTOM = 'custom'
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  shader: string;
  properties: MaterialProperty[];
  textures: MaterialTexture[];
  isTransparent: boolean;
  isDoubleSided: boolean;
  renderQueue: number;
  metadata: Map<string, any>;
}

export enum MaterialType {
  STANDARD = 'standard',
  UNLIT = 'unlit',
  TRANSPARENT = 'transparent',
  EMISSIVE = 'emissive',
  PBR = 'pbr',
  CUSTOM = 'custom'
}

export interface MaterialProperty {
  name: string;
  type: PropertyType;
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export enum PropertyType {
  FLOAT = 'float',
  INT = 'int',
  BOOLEAN = 'boolean',
  COLOR = 'color',
  VECTOR2 = 'vector2',
  VECTOR3 = 'vector3',
  VECTOR4 = 'vector4',
  TEXTURE = 'texture',
  ENUM = 'enum',
  CUSTOM = 'custom'
}

export interface MaterialTexture {
  name: string;
  type: TextureType;
  texture: string;
  tiling: [number, number];
  offset: [number, number];
  rotation: number;
  metadata: Map<string, any>;
}

export enum TextureType {
  DIFFUSE = 'diffuse',
  NORMAL = 'normal',
  SPECULAR = 'specular',
  ROUGHNESS = 'roughness',
  METALLIC = 'metallic',
  EMISSIVE = 'emissive',
  OCCLUSION = 'occlusion',
  HEIGHT = 'height',
  CUSTOM = 'custom'
}

export interface ObjectPhysics {
  enabled: boolean;
  type: PhysicsType;
  mass: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
  isKinematic: boolean;
  collisionType: CollisionType;
  collisionShape: CollisionShape;
  constraints: PhysicsConstraint[];
  metadata: Map<string, any>;
}

export enum PhysicsType {
  NONE = 'none',
  STATIC = 'static',
  DYNAMIC = 'dynamic',
  KINEMATIC = 'kinematic',
  TRIGGER = 'trigger'
}

export enum CollisionType {
  NONE = 'none',
  STATIC = 'static',
  DYNAMIC = 'dynamic',
  KINEMATIC = 'kinematic',
  TRIGGER = 'trigger'
}

export enum CollisionShape {
  BOX = 'box',
  SPHERE = 'sphere',
  CAPSULE = 'capsule',
  MESH = 'mesh',
  CONVEX_HULL = 'convex_hull',
  COMPOUND = 'compound'
}

export interface PhysicsConstraint {
  type: ConstraintType;
  target: string;
  limits: ConstraintLimits;
  isActive: boolean;
  metadata: Map<string, any>;
}

export enum ConstraintType {
  HINGE = 'hinge',
  BALL_SOCKET = 'ball_socket',
  SLIDER = 'slider',
  FIXED = 'fixed',
  SPRING = 'spring',
  ROPE = 'rope'
}

export interface ConstraintLimits {
  min: number;
  max: number;
  damping: number;
  stiffness: number;
}

export interface ObjectAudio {
  enabled: boolean;
  sources: AudioSource[];
  spatial: boolean;
  volume: number;
  pitch: number;
  loop: boolean;
  playOnAwake: boolean;
  metadata: Map<string, any>;
}

export interface AudioSource {
  id: string;
  clip: string;
  volume: number;
  pitch: number;
  loop: boolean;
  playOnAwake: boolean;
  spatial: boolean;
  minDistance: number;
  maxDistance: number;
  rolloffMode: RolloffMode;
  metadata: Map<string, any>;
}

export enum RolloffMode {
  LOGARITHMIC = 'logarithmic',
  LINEAR = 'linear',
  CUSTOM = 'custom'
}

export interface ObjectParticles {
  enabled: boolean;
  systems: ParticleSystem[];
  metadata: Map<string, any>;
}

export interface ParticleSystem {
  id: string;
  name: string;
  enabled: boolean;
  emission: EmissionModule;
  shape: ShapeModule;
  velocity: VelocityModule;
  color: ColorModule;
  size: SizeModule;
  rotation: RotationModule;
  texture: TextureModule;
  collision: CollisionModule;
  force: ForceModule;
  metadata: Map<string, any>;
}

export interface EmissionModule {
  rate: number;
  burst: Burst[];
  enabled: boolean;
}

export interface Burst {
  time: number;
  count: number;
  cycles: number;
  interval: number;
}

export interface ShapeModule {
  type: ShapeType;
  radius: number;
  angle: number;
  length: number;
  box: [number, number, number];
  enabled: boolean;
}

export enum ShapeType {
  SPHERE = 'sphere',
  CONE = 'cone',
  BOX = 'box',
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
  CUSTOM = 'custom'
}

export interface VelocityModule {
  linear: [number, number, number];
  angular: [number, number, number];
  space: SpaceType;
  enabled: boolean;
}

export enum SpaceType {
  LOCAL = 'local',
  WORLD = 'world',
  CUSTOM = 'custom'
}

export interface ColorModule {
  color: [number, number, number, number];
  gradient: ColorGradient;
  enabled: boolean;
}

export interface ColorGradient {
  keys: ColorKey[];
  mode: GradientMode;
}

export interface ColorKey {
  time: number;
  color: [number, number, number, number];
}

export enum GradientMode {
  BLEND = 'blend',
  FIXED = 'fixed'
}

export interface SizeModule {
  size: number;
  curve: AnimationCurve;
  enabled: boolean;
}

export interface AnimationCurve {
  keys: CurveKey[];
  mode: CurveMode;
}

export interface CurveKey {
  time: number;
  value: number;
  inTangent: number;
  outTangent: number;
}

export enum CurveMode {
  AUTO = 'auto',
  FREE = 'free',
  BROKEN = 'broken'
}

export interface RotationModule {
  rotation: [number, number, number];
  curve: AnimationCurve;
  enabled: boolean;
}

export interface TextureModule {
  texture: string;
  frameCount: number;
  frameRate: number;
  enabled: boolean;
}

export interface CollisionModule {
  type: CollisionType;
  mode: CollisionMode;
  enabled: boolean;
}

export enum CollisionMode {
  NONE = 'none',
  WORLD = 'world',
  PLANES = 'planes',
  CUSTOM = 'custom'
}

export interface ForceModule {
  force: [number, number, number];
  space: SpaceType;
  enabled: boolean;
}

export interface SceneLight {
  id: string;
  name: string;
  type: LightType;
  position: Position3D;
  rotation: Rotation3D;
  color: [number, number, number];
  intensity: number;
  range: number;
  angle: number;
  innerAngle: number;
  shadows: boolean;
  shadowBias: number;
  shadowNormalBias: number;
  cullingMask: number;
  enabled: boolean;
  metadata: Map<string, any>;
}

export enum LightType {
  DIRECTIONAL = 'directional',
  POINT = 'point',
  SPOT = 'spot',
  AREA = 'area',
  AMBIENT = 'ambient'
}

export interface SceneCamera {
  id: string;
  name: string;
  position: Position3D;
  rotation: Rotation3D;
  projection: ProjectionType;
  fov: number;
  near: number;
  far: number;
  aspect: number;
  orthoSize: number;
  viewport: [number, number, number, number];
  cullingMask: number;
  clearFlags: ClearFlags;
  clearColor: [number, number, number, number];
  depth: number;
  enabled: boolean;
  metadata: Map<string, any>;
}

export enum ProjectionType {
  PERSPECTIVE = 'perspective',
  ORTHOGRAPHIC = 'orthographic'
}

export enum ClearFlags {
  NONE = 'none',
  COLOR = 'color',
  DEPTH = 'depth',
  STENCIL = 'stencil',
  ALL = 'all'
}

export interface SceneEnvironment {
  skybox: string;
  ambientColor: [number, number, number];
  ambientIntensity: number;
  fog: FogSettings;
  wind: WindSettings;
  weather: WeatherSettings;
  time: TimeSettings;
  metadata: Map<string, any>;
}

export interface FogSettings {
  enabled: boolean;
  color: [number, number, number];
  density: number;
  startDistance: number;
  endDistance: number;
  heightFalloff: number;
  type: FogType;
}

export enum FogType {
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  EXPONENTIAL_SQUARED = 'exponential_squared',
  HEIGHT = 'height'
}

export interface WindSettings {
  enabled: boolean;
  direction: [number, number, number];
  speed: number;
  turbulence: number;
  gustiness: number;
  metadata: Map<string, any>;
}

export interface WeatherSettings {
  type: WeatherType;
  intensity: number;
  precipitation: number;
  temperature: number;
  humidity: number;
  pressure: number;
  visibility: number;
  metadata: Map<string, any>;
}

export enum WeatherType {
  CLEAR = 'clear',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  SNOWY = 'snowy',
  FOGGY = 'foggy',
  STORMY = 'stormy',
  CUSTOM = 'custom'
}

export interface TimeSettings {
  currentTime: number;
  day: number;
  month: number;
  year: number;
  season: Season;
  timeOfDay: TimeOfDay;
  isPaused: boolean;
  speed: number;
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}

export enum TimeOfDay {
  DAWN = 'dawn',
  MORNING = 'morning',
  NOON = 'noon',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  MIDNIGHT = 'midnight'
}

export interface ScenePhysics {
  gravity: [number, number, number];
  timeScale: number;
  fixedTimeStep: number;
  maxSubSteps: number;
  solverIterations: number;
  solverVelocityIterations: number;
  enableSleeping: boolean;
  enableCCD: boolean;
  enableContinuousCollision: boolean;
  metadata: Map<string, any>;
}

export interface SceneAudio {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  enable3D: boolean;
  enableReverb: boolean;
  enableOcclusion: boolean;
  reverb: ReverbSettings;
  metadata: Map<string, any>;
}

export interface ReverbSettings {
  enabled: boolean;
  preset: ReverbPreset;
  room: number;
  roomHF: number;
  roomLF: number;
  decayTime: number;
  decayHFRatio: number;
  reflections: number;
  reflectionsDelay: number;
  reverb: number;
  reverbDelay: number;
  HFReference: number;
  LFReference: number;
  diffusion: number;
  density: number;
}

export enum ReverbPreset {
  OFF = 'off',
  GENERIC = 'generic',
  PADDEDCELL = 'paddedcell',
  ROOM = 'room',
  BATHROOM = 'bathroom',
  LIVINGROOM = 'livingroom',
  STONEROOM = 'stoneroom',
  AUDITORIUM = 'auditorium',
  CONCERTHALL = 'concerthall',
  CAVE = 'cave',
  ARENA = 'arena',
  HANGAR = 'hangar',
  CARPETEDHALLWAY = 'carpetedhallway',
  HALLWAY = 'hallway',
  STONECORRIDOR = 'stonecorridor',
  ALLEY = 'alley',
  FOREST = 'forest',
  CITY = 'city',
  MOUNTAINS = 'mountains',
  QUARRY = 'quarry',
  PLAIN = 'plain',
  PARKINGLOT = 'parkinglot',
  SEWERPIPE = 'sewerpipe',
  UNDERWATER = 'underwater',
  CUSTOM = 'custom'
}

export interface SceneMetadata {
  tags: string[];
  category: string;
  difficulty: DifficultyLevel;
  rating: number;
  downloads: number;
  likes: number;
  comments: number;
  author: string;
  contributors: string[];
  license: string;
  description: string;
  thumbnail: string;
  screenshots: string[];
  videos: string[];
  customMetadata: Map<string, any>;
}

export enum DifficultyLevel {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EXPERT = 'expert',
  NIGHTMARE = 'nightmare',
  CUSTOM = 'custom'
}

export interface SceneBuilderStats {
  totalScenes: number;
  totalObjects: number;
  totalLights: number;
  totalCameras: number;
  totalParticles: number;
  memoryUsage: number;
  gpuMemoryUsage: number;
  frameRate: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  textures: number;
  materials: number;
  shaders: number;
  audioSources: number;
  lastUpdate: number;
}

export class SceneBuilderManager {
  private config: SceneBuilderConfig;
  private scenes: Map<string, Scene> = new Map();
  private currentScene: string | null = null;
  private undoStack: Scene[] = [];
  private redoStack: Scene[] = [];
  private stats: SceneBuilderStats = this.initializeStats();
  private isInitialized: boolean = false;
  private logger: StructuredLogger;
  private memoryId: string;

  constructor(config: Partial<SceneBuilderConfig> = {}) {
    this.config = {
      enableRealTimeEditing: true,
      enableMultiUser: false,
      enablePhysics: true,
      enableLighting: true,
      enableWeather: true,
      enableAudio: true,
      enableParticles: true,
      enableOptimization: true,
      maxObjects: 10000,
      maxLights: 100,
      maxParticles: 1000,
      enableUndoRedo: true,
      enableSnapToGrid: true,
      gridSize: 1.0,
      enableCollisionPreview: true,
      enablePerformanceMonitoring: true,
      ...config
  
    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'SceneBuilderManager': LogLevel.DEBUG
      }
    });

    // Register with memory manager
    this.memoryId = `SceneBuilderManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'SceneBuilderManager');
  };
  }

  /**
   * Initialize scene builder
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize scene builder
      await this.initializeSceneBuilder();
      
      this.isInitialized = true;
      this.logger.info('SceneBuilderManager', 'Scene builder initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('SceneBuilderManager', 'Failed to initialize scene builder:', error);
      return false;
    }
  }

  /**
   * Create new scene
   */
  createScene(name: string, description: string = ''): Scene {
    const scene: Scene = {
      id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      version: '1.0.0',
      author: 'Unknown',
      created: Date.now(),
      modified: Date.now(),
      objects: [],
      lights: [],
      cameras: [],
      environment: this.createDefaultEnvironment(),
      physics: this.createDefaultPhysics(),
      audio: this.createDefaultAudio(),
      particles: [],
      metadata: this.createDefaultMetadata(),
      isDirty: false,
      isLocked: false,
      lockExpiry: 0;
    };

    this.scenes.set(scene.id, scene);
    this.currentScene = scene.id;

    this.logger.info('SceneBuilderManager', `Created scene: ${name}`);
    return scene;
  }

  /**
   * Load scene
   */
  loadScene(sceneId: string): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.warn('SceneBuilderManager', `Scene ${sceneId} not found`);
      return false;
    }

    this.currentScene = sceneId;
    this.logger.info('SceneBuilderManager', `Loaded scene: ${scene.name}`);
    return true;
  }

  /**
   * Save scene
   */
  saveScene(sceneId: string): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.warn('SceneBuilderManager', `Scene ${sceneId} not found`);
      return false;
    }

    scene.modified = Date.now();
    scene.isDirty = false;

    this.logger.info('SceneBuilderManager', `Saved scene: ${scene.name}`);
    return true;
  }

  /**
   * Add object to scene
   */
  addObject(sceneId: string, object: Partial<SceneObject>): SceneObject | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.warn('SceneBuilderManager', `Scene ${sceneId} not found`);
      return null;
    }

    if (scene.objects.length >= this.config.maxObjects) {
      this.logger.warn('SceneBuilderManager', `Maximum objects reached for scene ${sceneId}`);
      return null;
    }

    const newObject: SceneObject = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: object.name || 'New Object',
      type: object.type || ObjectType.EMPTY,
      position: object.position || { x: 0, y: 0, z: 0;
    },
      rotation: object.rotation || { x: 0, y: 0, z: 0, w: 1;
    },
      scale: object.scale || { x: 1, y: 1, z: 1;
    },
      visible: object.visible !== false,
      locked: object.locked || false,
      parent: object.parent || null,
      children: object.children || [],
      components: object.components || [],
      materials: object.materials || [],
      physics: object.physics || this.createDefaultObjectPhysics(),
      audio: object.audio || this.createDefaultObjectAudio(),
      particles: object.particles || this.createDefaultObjectParticles(),
      metadata: object.metadata || new Map()
    };

    scene.objects.push(newObject);
    scene.isDirty = true;

    // Add to undo stack
    if (this.config.enableUndoRedo) {
      this.addToUndoStack(scene);
    }

    this.logger.info('SceneBuilderManager', `Added object to scene: ${newObject.name}`);
    return newObject;
  }

  /**
   * Remove object from scene
   */
  removeObject(sceneId: string, objectId: string): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.warn('SceneBuilderManager', `Scene ${sceneId} not found`);
      return false;
    }

    const index = scene.objects.findIndex(obj => obj.id === objectId);
    if (index === -1) {
      this.logger.warn('SceneBuilderManager', `Object ${objectId} not found in scene ${sceneId}`);
      return false;
    }

    scene.objects.splice(index, 1);
    scene.isDirty = true;

    // Add to undo stack
    if (this.config.enableUndoRedo) {
      this.addToUndoStack(scene);
    }

    this.logger.info('SceneBuilderManager', `Removed object from scene: ${objectId}`);
    return true;
  }

  /**
   * Update object in scene
   */
  updateObject(sceneId: string, objectId: string, updates: Partial<SceneObject>): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.warn('SceneBuilderManager', `Scene ${sceneId} not found`);
      return false;
    }

    const object = scene.objects.find(obj => obj.id === objectId);
    if (!object) {
      this.logger.warn('SceneBuilderManager', `Object ${objectId} not found in scene ${sceneId}`);
      return false;
    }

    Object.assign(object, updates);
    scene.isDirty = true;

    // Add to undo stack
    if (this.config.enableUndoRedo) {
      this.addToUndoStack(scene);
    }

    this.logger.info('SceneBuilderManager', `Updated object in scene: ${objectId}`);
    return true;
  }

  /**
   * Add light to scene
   */
  addLight(sceneId: string, light: Partial<SceneLight>): SceneLight | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.warn('SceneBuilderManager', `Scene ${sceneId} not found`);
      return null;
    }

    if (scene.lights.length >= this.config.maxLights) {
      this.logger.warn('SceneBuilderManager', `Maximum lights reached for scene ${sceneId}`);
      return null;
    }

    const newLight: SceneLight = {
      id: `light_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: light.name || 'New Light',
      type: light.type || LightType.POINT,
      position: light.position || { x: 0, y: 0, z: 0;
    },
      rotation: light.rotation || { x: 0, y: 0, z: 0, w: 1;
    },
      color: light.color || [1, 1, 1],
      intensity: light.intensity || 1.0,
      range: light.range || 10.0,
      angle: light.angle || 30.0,
      innerAngle: light.innerAngle || 21.0,
      shadows: light.shadows || false,
      shadowBias: light.shadowBias || 0.05,
      shadowNormalBias: light.shadowNormalBias || 0.0,
      cullingMask: light.cullingMask || -1,
      enabled: light.enabled !== false,
      metadata: light.metadata || new Map()
    };

    scene.lights.push(newLight);
    scene.isDirty = true;

    // Add to undo stack
    if (this.config.enableUndoRedo) {
      this.addToUndoStack(scene);
    }

    this.logger.info('SceneBuilderManager', `Added light to scene: ${newLight.name}`);
    return newLight;
  }

  /**
   * Add camera to scene
   */
  addCamera(sceneId: string, camera: Partial<SceneCamera>): SceneCamera | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      this.logger.warn('SceneBuilderManager', `Scene ${sceneId} not found`);
      return null;
    }

    const newCamera: SceneCamera = {
      id: `camera_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: camera.name || 'New Camera',
      position: camera.position || { x: 0, y: 0, z: 0;
    },
      rotation: camera.rotation || { x: 0, y: 0, z: 0, w: 1;
    },
      projection: camera.projection || ProjectionType.PERSPECTIVE,
      fov: camera.fov || 60.0,
      near: camera.near || 0.1,
      far: camera.far || 1000.0,
      aspect: camera.aspect || 16 / 9,
      orthoSize: camera.orthoSize || 5.0,
      viewport: camera.viewport || [0, 0, 1, 1],
      cullingMask: camera.cullingMask || -1,
      clearFlags: camera.clearFlags || ClearFlags.ALL,
      clearColor: camera.clearColor || [0, 0, 0, 1],
      depth: camera.depth || 0,
      enabled: camera.enabled !== false,
      metadata: camera.metadata || new Map()
    };

    scene.cameras.push(newCamera);
    scene.isDirty = true;

    // Add to undo stack
    if (this.config.enableUndoRedo) {
      this.addToUndoStack(scene);
    }

    this.logger.info('SceneBuilderManager', `Added camera to scene: ${newCamera.name}`);
    return newCamera;
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    if (!this.config.enableUndoRedo || this.undoStack.length === 0) {
      return false;
    }

    const currentScene = this.getCurrentScene();
    if (!currentScene) {
      return false;
    }

    // Move current scene to redo stack
    this.redoStack.push({ ...currentScene });

    // Restore previous state
    const previousScene = this.undoStack.pop();
    if (previousScene) {
      this.scenes.set(currentScene.id, previousScene);
      this.logger.info('SceneBuilderManager', 'Undid last action');
      return true;
    }

    return false;
  }

  /**
   * Redo last undone action
   */
  redo(): boolean {
    if (!this.config.enableUndoRedo || this.redoStack.length === 0) {
      return false;
    }

    const currentScene = this.getCurrentScene();
    if (!currentScene) {
      return false;
    }

    // Move current scene to undo stack
    this.undoStack.push({ ...currentScene });

    // Restore next state
    const nextScene = this.redoStack.pop();
    if (nextScene) {
      this.scenes.set(currentScene.id, nextScene);
      this.logger.info('SceneBuilderManager', 'Redid last undone action');
      return true;
    }

    return false;
  }

  /**
   * Get current scene
   */
  getCurrentScene(): Scene | null {
    if (!this.currentScene) {
      return null;
    }
    return this.scenes.get(this.currentScene) || null;
  }

  /**
   * Get all scenes
   */
  getScenes(): Scene[] {
    return Array.from(this.scenes.values());
  }

  /**
   * Get scene by ID
   */
  getScene(sceneId: string): Scene | null {
    return this.scenes.get(sceneId) || null;
  }

  /**
   * Get scene statistics
   */
  getStats(): SceneBuilderStats {
    return { ...this.stats };
  }

  /**
   * Initialize scene builder
   */
  private async initializeSceneBuilder(): Promise<void> {
    this.logger.info('SceneBuilderManager', 'Initializing scene builder...');
  }

  /**
   * Create default environment
   */
  private createDefaultEnvironment(): SceneEnvironment {
    return {
      skybox: 'default_skybox',
      ambientColor: [0.2, 0.2, 0.2],
      ambientIntensity: 0.2,
      fog: {

        enabled: false,
        color: [0.5, 0.5, 0.5],
        density: 0.1,
        startDistance: 100,
        endDistance: 1000,
        heightFalloff: 0.1,
        type: FogType.LINEAR

      }
      },
      wind: {

        enabled: false,
        direction: [1, 0, 0],
        speed: 1.0,
        turbulence: 0.1,
        gustiness: 0.1,
        metadata: new Map()

      }
      },
      weather: {

        type: WeatherType.CLEAR,
        intensity: 1.0,
        precipitation: 0.0,
        temperature: 20.0,
        humidity: 50.0,
        pressure: 1013.25,
        visibility: 10000.0,
        metadata: new Map()

      }
      },
      time: {

        currentTime: 0,
        day: 1,
        month: 1,
        year: 2024,
        season: Season.SPRING,
        timeOfDay: TimeOfDay.NOON,
        isPaused: false,
        speed: 1.0

      }
      },
      metadata: new Map()
    };
  }

  /**
   * Create default physics
   */
  private createDefaultPhysics(): ScenePhysics {
    return {
      gravity: [0, -9.81, 0],
      timeScale: 1.0,
      fixedTimeStep: 1.0 / 60.0,
      maxSubSteps: 3,
      solverIterations: 8,
      solverVelocityIterations: 1,
      enableSleeping: true,
      enableCCD: false,
      enableContinuousCollision: false,
      metadata: new Map()
    };
  }

  /**
   * Create default audio
   */
  private createDefaultAudio(): SceneAudio {
    return {
      masterVolume: 1.0,
      musicVolume: 0.8,
      sfxVolume: 1.0,
      voiceVolume: 1.0,
      ambientVolume: 0.6,
      enable3D: true,
      enableReverb: true,
      enableOcclusion: true,
      reverb: {

        enabled: false,
        preset: ReverbPreset.OFF,
        room: 0,
        roomHF: 0,
        roomLF: 0,
        decayTime: 0,
        decayHFRatio: 0,
        reflections: 0,
        reflectionsDelay: 0,
        reverb: 0,
        reverbDelay: 0,
        HFReference: 0,
        LFReference: 0,
        diffusion: 0,
        density: 0;

      }
    },
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): SceneMetadata {
    return {
      tags: [],
      category: 'General',
      difficulty: DifficultyLevel.NORMAL,
      rating: 0,
      downloads: 0,
      likes: 0,
      comments: 0,
      author: 'Unknown',
      contributors: [],
      license: 'MIT',
      description: '',
      thumbnail: '',
      screenshots: [],
      videos: [],
      customMetadata: new Map()
    };
  }

  /**
   * Create default object physics
   */
  private createDefaultObjectPhysics(): ObjectPhysics {
    return {
      enabled: false,
      type: PhysicsType.NONE,
      mass: 1.0,
      friction: 0.5,
      restitution: 0.0,
      isStatic: true,
      isKinematic: false,
      collisionType: CollisionType.NONE,
      collisionShape: CollisionShape.BOX,
      constraints: [],
      metadata: new Map()
    };
  }

  /**
   * Create default object audio
   */
  private createDefaultObjectAudio(): ObjectAudio {
    return {
      enabled: false,
      sources: [],
      spatial: true,
      volume: 1.0,
      pitch: 1.0,
      loop: false,
      playOnAwake: false,
      metadata: new Map()
    };
  }

  /**
   * Create default object particles
   */
  private createDefaultObjectParticles(): ObjectParticles {
    return {
      enabled: false,
      systems: [],
      metadata: new Map()
    };
  }

  /**
   * Add to undo stack
   */
  private addToUndoStack(scene: Scene): void {
    this.undoStack.push({ ...scene });
    
    // Limit undo stack size
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
    
    // Clear redo stack
    this.redoStack = [];
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): SceneBuilderStats {
    return {
      totalScenes: 0,
      totalObjects: 0,
      totalLights: 0,
      totalCameras: 0,
      totalParticles: 0,
      memoryUsage: 0,
      gpuMemoryUsage: 0,
      frameRate: 0,
      drawCalls: 0,
      triangles: 0,
      vertices: 0,
      textures: 0,
      materials: 0,
      shaders: 0,
      audioSources: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.scenes.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.currentScene = null;
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultSceneBuilderManager = new SceneBuilderManager();
export { SceneBuilderManager as default };