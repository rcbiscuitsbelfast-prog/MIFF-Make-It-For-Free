
// Compiled from CameraSystemPure
(function() {
  'use strict';
  
  

../InputPure/index';
chase' | 'orbit' | 'first-person' | 'fixed' | 'cinematic' | 'debug' | 'custom';
  parameters: Map<string, any>;
  updateFunction: string;
  transitionMode: 'smooth' | 'cut' | 'fade' | 'custom';
  defaultDuration: number;
}

type CameraModeType = 'chase' | 'orbit' | 'first-person' | 'fixed' | 'cinematic' | 'debug' | 'custom';

interface CameraSettings {
  
  position: Vector3;
  target: Vector3;
  up: Vector3;
  rotation: Quaternion;

  
  fov: number;
  nearClip: number;
  farClip: number;
  aspectRatio: number;
  projectionMode: 'perspective' | 'orthographic' | 'isometric';

  
  movementSpeed: number;
  rotationSpeed: number;
  zoomSpeed: number;
  smoothingFactor: number;

  
  distance: number;
  minDistance: number;
  maxDistance: number;
  trackingOffset: Vector3;

  
  enableCollision: boolean;
  enableOcclusion: boolean;
  enableSmoothing: boolean;
  enableAutoFocus: boolean;
  focusDistance: number;
}

interface CameraTransition {
  id: string;
  name: string;
  fromMode: string;
  toMode: string;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  interpolation: 'lerp' | 'slerp' | 'cubic' | 'quaternion' | 'custom';
  keyframes: CameraKeyframe[];
  events: CameraTransitionEvent[];
  visualEffect: string;
  soundEffect: string;
}

interface CameraKeyframe {
  time: number; 
  position: Vector3;
  rotation: Quaternion;
  fov: number;
  settings: Partial<CameraSettings>;
  events: string[]; 
}

interface CameraTransitionEvent {
  time: number;
  event: string;
  parameters: Map<string, any>;
  target: 'global' | 'local' | 'camera' | 'specific';
}

interface CameraConstraints {
  
  positionBounds?: {
    min: Vector3;
    max: Vector3;
  };

  
  rotationLimits?: {
    minPitch: number; 
    maxPitch: number;
    minYaw: number;
    maxYaw: number;
    minRoll: number;
    maxRoll: number;
  };

  
  distanceLimits?: {
    minDistance: number;
    maxDistance: number;
    maintainDistance: boolean;
  };

  
  collisionRadius: number;
  avoidanceDistance: number;

  
  followSpeed: number;
  predictionTime: number;
  deadZone: number; 
}

interface CameraEffect {
  id: string;
  name: string;
  description: string;
  type: 'shake' | 'zoom' | 'blur' | 'chromatic' | 'vignette' | 'color' | 'noise' | 'custom';
  parameters: Map<string, any>;
  duration: number;
  intensity: number;
  falloff: 'linear' | 'exponential' | 'logarithmic' | 'custom';
  triggerCondition: string;
  priority: number;
}

interface CameraVisualStyle {
  filter: string;
  overlay: string;
  crosshair: boolean;
  hudElements: string[];
  colorGrading: string;
  bloomIntensity: number;
  vignetteIntensity: number;
  chromaticAberration: number;
  grainIntensity: number;
  customShaders: string[];
}

interface CameraMetadata {
  author: string;
  version: string;
  compatibility: string[];
  tags: string[];
  dependencies: string[];
  performanceRating: 'low' | 'medium' | 'high' | 'ultra';
  qualitySettings: Map<string, number>;
}

interface CameraInstance {
  id: string;
  definition: CameraDefinition;
  currentSettings: CameraSettings;
  targetEntity?: string; 
  path?: CameraPath; 
  effects: Map<string, CameraEffect>;
  state: CameraState;
  lastUpdateTime: number;
  updateCount: number;
  performanceMetrics: CameraPerformanceMetrics;
}

interface CameraPath {
  id: string;
  name: string;
  description: string;
  waypoints: CameraWaypoint[];
  duration: number;
  loop: boolean;
  interpolation: 'linear' | 'slerp' | 'cubic' | 'hermite';
  events: CameraPathEvent[];
  visualStyle: string;
  speedMultiplier: number;
  startDelay: number;
  endDelay: number;
}

interface CameraWaypoint {
  position: Vector3;
  rotation: Quaternion;
  fov: number;
  time: number; 
  transition: 'smooth' | 'cut' | 'instant';
  lookAt?: Vector3; 
  up?: Vector3; 
  events: string[]; 
  metadata: Map<string, any>;
}

interface CameraPathEvent {
  time: number;
  event: string;
  parameters: Map<string, any>;
  waypoint?: string;
}

interface CameraState {
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
  isMoving: boolean;
  isRotating: boolean;
  isZooming: boolean;
  isFollowing: boolean;
  isConstrained: boolean;
  mode: string;
  activeTransitions: string[];
  activeEffects: string[];
  lastInputTime: number;
  inputIdleTime: number;
}

interface CameraPerformanceMetrics {
  updateTime: number;
  renderTime: number;
  collisionChecks: number;
  occlusionTests: number;
  memoryUsage: number;
  frameDrops: number;
  averageFPS: number;
  peakMemory: number;
  lastOptimizationTime: number;
}

interface CinematicSequence {
  id: string;
  name: string;
  description: string;
  duration: number;
  cameraShots: CameraShot[];
  audioTrack: string;
  subtitles?: Subtitle[];
  effects: CinematicEffect[];
  priority: number;
  triggerCondition: string;
  autoPlay: boolean;
  loop: boolean;
}

interface CameraShot {
  id: string;
  name: string;
  cameraId: string;
  startTime: number;
  endTime: number;
  position: Vector3;
  rotation: Quaternion;
  fov: number;
  transitionIn: string;
  transitionOut: string;
  targetEntity?: string;
  effects: string[];
  metadata: Map<string, any>;
}

interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
  style: string;
  position: 'top' | 'bottom' | 'center';
  language: string;
}

interface CinematicEffect {
  id: string;
  type: 'fade' | 'blur' | 'shake' | 'color' | 'filter' | 'overlay';
  startTime: number;
  endTime: number;
  parameters: Map<string, any>;
  target: 'global' | 'camera' | 'specific';
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface CameraConfig {
  defaultMode: string;
  enableDebugCamera: boolean;
  enableCinematicMode: boolean;
  enablePathRecording: boolean;
  maxActiveCameras: number;
  updateRate: number;
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  enablePostProcessing: boolean;
  enableMotionBlur: boolean;
  enableDepthOfField: boolean;
  enableBloom: boolean;
  enableAntiAliasing: boolean;
  collisionDetection: boolean;
  occlusionCulling: boolean;
  lodDistance: number;
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  enableVSync: boolean;
  targetFPS: number;
  maxFrameTime: number;
}

interface CameraStats {
  totalCameras: number;
  activeCameras: number;
  modeSwitches: number;
  cinematicSequences: number;
  pathsCreated: number;
  effectsApplied: number;
  averageFrameTime: number;
  peakFrameTime: number;
  collisionAvoidance: number;
  smoothTransitions: number;
  userInputs: number;
  totalPlayTime: number;
}

class CameraSystemPure {
  private cameraDefinitions: Map<string, CameraDefinition> = new Map();
  private activeCameras: Map<string, CameraInstance> = new Map();
  private cameraPaths: Map<string, CameraPath> = new Map();
  private cinematicSequences: Map<string, CinematicSequence> = new Map();
  private config: CameraConfig;
  private stats: CameraStats;
  private eventBus: EventBus;
  private inputSystem: InputSystemPure;
  private rng: RNGPure;
  private mainCamera: string | null = null;
  private lastUpdateTime: number = 0;

  constructor(
    eventBus: EventBus,
    inputSystem: InputSystemPure,
    rng: RNGPure
  ) {
    this.eventBus = eventBus;
    this.inputSystem = inputSystem;
    this.rng = rng;
    this.config = this.initializeConfig();
    this.stats = this.initializeStats();
    this.initializeDefaultCameras();
    this.initializeDefaultPaths();
    this.setupEventListeners();
  }

  
  private initializeConfig(): CameraConfig {
    return {
      defaultMode: 'chase',
      enableDebugCamera: true,
      enableCinematicMode: true,
      enablePathRecording: true,
      maxActiveCameras: 8,
      updateRate: 60,
      renderQuality: 'high',
      enablePostProcessing: true,
      enableMotionBlur: true,
      enableDepthOfField: true,
      enableBloom: true,
      enableAntiAliasing: true,
      collisionDetection: true,
      occlusionCulling: true,
      lodDistance: 100,
      shadowQuality: 'high',
      textureQuality: 'high',
      enableVSync: true,
      targetFPS: 60,
      maxFrameTime: 16.67 
    };
  }

  
  private initializeStats(): CameraStats {
    return {
      totalCameras: 0,
      activeCameras: 0,
      modeSwitches: 0,
      cinematicSequences: 0,
      pathsCreated: 0,
      effectsApplied: 0,
      averageFrameTime: 0,
      peakFrameTime: 0,
      collisionAvoidance: 0,
      smoothTransitions: 0,
      userInputs: 0,
      totalPlayTime: 0
    };
  }

  
  private initializeDefaultCameras(): void {
    const cameras: CameraDefinition[] = [
      {
        id: 'chase-camera',
        name: 'Chase Camera',
        description: 'Third-person camera that follows behind the target',
        mode: {
          type: 'chase',
          parameters: new Map([
            ['distance', 10],
            ['height', 5],
            ['smoothness', 0.8]
          ]),
          updateFunction: 'chaseUpdate',
          transitionMode: 'smooth',
          defaultDuration: 0.5
        },
        settings: {
          position: { x: 0, y: 5, z: 10 },
          target: { x: 0, y: 0, z: 0 },
          up: { x: 0, y: 1, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          fov: 75,
          nearClip: 0.1,
          farClip: 1000,
          aspectRatio: 16/9,
          projectionMode: 'perspective',
          movementSpeed: 5,
          rotationSpeed: 2,
          zoomSpeed: 3,
          smoothingFactor: 0.8,
          distance: 10,
          minDistance: 2,
          maxDistance: 50,
          trackingOffset: { x: 0, y: 2, z: 0 },
          enableCollision: true,
          enableOcclusion: true,
          enableSmoothing: true,
          enableAutoFocus: true,
          focusDistance: 10
        },
        transitions: [],
        constraints: {
          collisionRadius: 1,
          avoidanceDistance: 2,
          followSpeed: 1.5,
          predictionTime: 0.5,
          deadZone: 1
        },
        effects: [
          {
            id: 'camera-shake',
            name: 'Camera Shake',
            description: 'Screen shake effect for impacts',
            type: 'shake',
            parameters: new Map([
              ['intensity', 0.5],
              ['frequency', 10],
              ['duration', 0.3]
            ]),
            duration: 300,
            intensity: 0.5,
            falloff: 'exponential',
            triggerCondition: 'collision-detected',
            priority: 5
          }
        ],
        inputBindings: new Map([
          ['zoom-in', 'mouse-wheel-up'],
          ['zoom-out', 'mouse-wheel-down'],
          ['rotate-left', 'q'],
          ['rotate-right', 'e'],
          ['switch-mode', 'c']
        ]),
        visualStyle: {
          filter: 'default',
          overlay: 'none',
          crosshair: false,
          hudElements: ['minimap', 'health'],
          colorGrading: 'neutral',
          bloomIntensity: 0.3,
          vignetteIntensity: 0.2,
          chromaticAberration: 0.1,
          grainIntensity: 0.05,
          customShaders: []
        },
        audioProfile: '3d-spatial',
        metadata: {
          author: 'MIFF System',
          version: '1.0.0',
          compatibility: ['driving', 'combat', 'exploration'],
          tags: ['third-person', 'follow', 'smooth'],
          dependencies: [],
          performanceRating: 'medium',
          qualitySettings: new Map([
            ['shadows', 0.8],
            ['textures', 0.9],
            ['effects', 0.7]
          ])
        }
      },
      {
        id: 'first-person-camera',
        name: 'First Person Camera',
        description: 'First-person perspective camera',
        mode: {
          type: 'first-person',
          parameters: new Map([
            ['head-offset', 0.1],
            ['body-offset', 0.3]
          ]),
          updateFunction: 'firstPersonUpdate',
          transitionMode: 'smooth',
          defaultDuration: 0.3
        },
        settings: {
          position: { x: 0, y: 1.7, z: 0.1 },
          target: { x: 0, y: 1.7, z: 5 },
          up: { x: 0, y: 1, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          fov: 90,
          nearClip: 0.01,
          farClip: 500,
          aspectRatio: 16/9,
          projectionMode: 'perspective',
          movementSpeed: 0,
          rotationSpeed: 3,
          zoomSpeed: 2,
          smoothingFactor: 0.95,
          distance: 0,
          minDistance: 0,
          maxDistance: 0,
          trackingOffset: { x: 0, y: 0, z: 0 },
          enableCollision: false,
          enableOcclusion: false,
          enableSmoothing: true,
          enableAutoFocus: false,
          focusDistance: 5
        },
        transitions: [],
        constraints: {
          collisionRadius: 0.3,
          avoidanceDistance: 0.5,
          followSpeed: 1.0,
          predictionTime: 0.1,
          deadZone: 0.1
        },
        effects: [],
        inputBindings: new Map([
          ['look-up', 'mouse-y-negative'],
          ['look-down', 'mouse-y-positive'],
          ['look-left', 'mouse-x-negative'],
          ['look-right', 'mouse-x-positive']
        ]),
        visualStyle: {
          filter: 'first-person',
          overlay: 'none',
          crosshair: true,
          hudElements: ['crosshair', 'ammo', 'health'],
          colorGrading: 'neutral',
          bloomIntensity: 0.1,
          vignetteIntensity: 0.4,
          chromaticAberration: 0.05,
          grainIntensity: 0.02,
          customShaders: []
        },
        audioProfile: '3d-spatial',
        metadata: {
          author: 'MIFF System',
          version: '1.0.0',
          compatibility: ['fps', 'combat', 'puzzle'],
          tags: ['first-person', 'immersive', 'head-tracking'],
          dependencies: [],
          performanceRating: 'medium',
          qualitySettings: new Map([
            ['shadows', 0.6],
            ['textures', 0.8],
            ['effects', 0.5]
          ])
        }
      },
      {
        id: 'orbit-camera',
        name: 'Orbit Camera',
        description: 'Orbital camera that circles around the target',
        mode: {
          type: 'orbit',
          parameters: new Map([
            ['radius', 15],
            ['height', 8],
            ['angular-speed', 0.5]
          ]),
          updateFunction: 'orbitUpdate',
          transitionMode: 'smooth',
          defaultDuration: 1.0
        },
        settings: {
          position: { x: 15, y: 8, z: 0 },
          target: { x: 0, y: 0, z: 0 },
          up: { x: 0, y: 1, z: 0 },
          rotation: { x: -0.3, y: 0, z: 0, w: 0.95 },
          fov: 60,
          nearClip: 0.1,
          farClip: 2000,
          aspectRatio: 16/9,
          projectionMode: 'perspective',
          movementSpeed: 2,
          rotationSpeed: 1,
          zoomSpeed: 4,
          smoothingFactor: 0.7,
          distance: 15,
          minDistance: 5,
          maxDistance: 100,
          trackingOffset: { x: 0, y: 3, z: 0 },
          enableCollision: true,
          enableOcclusion: true,
          enableSmoothing: true,
          enableAutoFocus: true,
          focusDistance: 15
        },
        transitions: [],
        constraints: {
          collisionRadius: 1.5,
          avoidanceDistance: 3,
          followSpeed: 2.0,
          predictionTime: 1.0,
          deadZone: 2
        },
        effects: [],
        inputBindings: new Map([
          ['zoom-in', 'mouse-wheel-up'],
          ['zoom-out', 'mouse-wheel-down'],
          ['increase-radius', 'shift+mouse-wheel-up'],
          ['decrease-radius', 'shift+mouse-wheel-down']
        ]),
        visualStyle: {
          filter: 'cinematic',
          overlay: 'none',
          crosshair: false,
          hudElements: ['target-info', 'distance'],
          colorGrading: 'dramatic',
          bloomIntensity: 0.4,
          vignetteIntensity: 0.3,
          chromaticAberration: 0.1,
          grainIntensity: 0.03,
          customShaders: []
        },
        audioProfile: '3d-spatial',
        metadata: {
          author: 'MIFF System',
          version: '1.0.0',
          compatibility: ['exploration', 'cinematic', 'strategy'],
          tags: ['orbital', 'cinematic', 'inspection'],
          dependencies: [],
          performanceRating: 'high',
          qualitySettings: new Map([
            ['shadows', 0.9],
            ['textures', 1.0],
            ['effects', 0.8]
          ])
        }
      }
    ];

    cameras.forEach(camera => {
      this.cameraDefinitions.set(camera.id, camera);
    });
  }

  
  private initializeDefaultPaths(): void {
    const paths: CameraPath[] = [
      {
        id: 'demo-intro-path',
        name: 'Demo Introduction Path',
        description: 'Cinematic camera path for game introduction',
        waypoints: [
          {
            position: { x: 0, y: 10, z: 20 },
            rotation: { x: -0.2, y: 0, z: 0, w: 0.98 },
            fov: 75,
            time: 0,
            transition: 'smooth',
            events: ['intro-music-start'],
            metadata: new Map()
          },
          {
            position: { x: 5, y: 8, z: 15 },
            rotation: { x: -0.3, y: 0.2, z: 0, w: 0.93 },
            fov: 70,
            time: 3,
            transition: 'smooth',
            events: ['fade-in-logo'],
            metadata: new Map()
          },
          {
            position: { x: 0, y: 5, z: 10 },
            rotation: { x: -0.1, y: 0, z: 0, w: 0.995 },
            fov: 65,
            time: 6,
            transition: 'smooth',
            lookAt: { x: 0, y: 0, z: 0 },
            events: ['show-title'],
            metadata: new Map()
          }
        ],
        duration: 10,
        loop: false,
        interpolation: 'cubic',
        events: [],
        visualStyle: 'cinematic',
        speedMultiplier: 1.0,
        startDelay: 1,
        endDelay: 2
      }
    ];

    paths.forEach(path => {
      this.cameraPaths.set(path.id, path);
    });
  }

  
  createCamera(cameraId: string, targetEntity?: string): CameraInstance | null {
    const definition = this.cameraDefinitions.get(cameraId);
    if (!definition) {
      console.warn(`Camera definition not found: ${cameraId}`);
      return null;
    }

    if (this.activeCameras.size >= this.config.maxActiveCameras) {
      console.warn('Maximum active cameras reached');
      return null;
    }

    const instance: CameraInstance = {
      id: this.generateCameraId(),
      definition,
      currentSettings: { ...definition.settings },
      targetEntity,
      effects: new Map(),
      state: {
        position: { ...definition.settings.position },
        rotation: { ...definition.settings.rotation },
        velocity: { x: 0, y: 0, z: 0 },
        angularVelocity: { x: 0, y: 0, z: 0 },
        isMoving: false,
        isRotating: false,
        isZooming: false,
        isFollowing: !!targetEntity,
        isConstrained: false,
        mode: definition.mode.type,
        activeTransitions: [],
        activeEffects: [],
        lastInputTime: Date.now(),
        inputIdleTime: 0
      },
      lastUpdateTime: Date.now(),
      updateCount: 0,
      performanceMetrics: {
        updateTime: 0,
        renderTime: 0,
        collisionChecks: 0,
        occlusionTests: 0,
        memoryUsage: 0,
        frameDrops: 0,
        averageFPS: 60,
        peakMemory: 0,
        lastOptimizationTime: 0
      }
    };

    this.activeCameras.set(instance.id, instance);
    this.stats.totalCameras++;

    if (!this.mainCamera) {
      this.mainCamera = instance.id;
    }

    this.eventBus.emit('camera:created', {
      cameraId: instance.id,
      cameraType: definition.id,
      targetEntity
    });

    console.log(`📷 Created camera: ${definition.name} (${instance.id})`);
    return instance;
  }

  
  updateCameraSystem(deltaTime: number): void {
    const startTime = performance.now();

    
    for (const [cameraId, camera] of this.activeCameras) {
      this.updateCamera(camera, deltaTime);
    }

    
    this.updateCinematicSequences(deltaTime);

    
    const updateTime = performance.now() - startTime;
    this.updatePerformanceMetrics(updateTime);

    this.lastUpdateTime = Date.now();
  }

  
  private updateCamera(camera: CameraInstance, deltaTime: number): void {
    const startTime = performance.now();

    
    switch (camera.definition.mode.type) {
      case 'chase':
        this.updateChaseCamera(camera, deltaTime);
        break;
      case 'orbit':
        this.updateOrbitCamera(camera, deltaTime);
        break;
      case 'first-person':
        this.updateFirstPersonCamera(camera, deltaTime);
        break;
      case 'fixed':
        this.updateFixedCamera(camera, deltaTime);
        break;
      case 'cinematic':
        this.updateCinematicCamera(camera, deltaTime);
        break;
      default:
        this.updateCustomCamera(camera, deltaTime);
    }

    
    this.updateCameraEffects(camera, deltaTime);

    
    this.checkCameraConstraints(camera);

    
    camera.updateCount++;
    camera.performanceMetrics.updateTime = performance.now() - startTime;
  }

  
  private updateChaseCamera(camera: CameraInstance, deltaTime: number): void {
    if (!camera.targetEntity) return;

    
    const targetPosition = { x: 0, y: 0, z: 0 }; 
    const targetVelocity = { x: 0, y: 0, z: 0 }; 

    
    const distance = camera.currentSettings.distance;
    const height = camera.currentSettings.trackingOffset.y;

    
    const lookAhead = this.calculateLookAhead(targetVelocity, camera.currentSettings.predictionTime);

    const desiredPosition = {
      x: targetPosition.x - lookAhead.x,
      y: targetPosition.y + height,
      z: targetPosition.z - distance - lookAhead.z
    };

    
    this.smoothMoveCamera(camera, desiredPosition, deltaTime);

    
    this.lookAtTarget(camera, targetPosition);
  }

  
  private updateOrbitCamera(camera: CameraInstance, deltaTime: number): void {
    if (!camera.targetEntity) return;

    const orbitRadius = camera.currentSettings.distance;
    const orbitHeight = camera.currentSettings.trackingOffset.y;
    const angularSpeed = 0.5; 

    
    const angle = (Date.now() * 0.001 * angularSpeed) % (Math.PI * 2);

    const desiredPosition = {
      x: Math.cos(angle) * orbitRadius,
      y: orbitHeight,
      z: Math.sin(angle) * orbitRadius
    };

    
    this.smoothMoveCamera(camera, desiredPosition, deltaTime);

    
    this.lookAtTarget(camera, { x: 0, y: 0, z: 0 });
  }

  
  private updateFirstPersonCamera(camera: CameraInstance, deltaTime: number): void {
    if (!camera.targetEntity) return;

    
    const mouseX = 0; 
    const mouseY = 0;

    
    camera.state.rotation.y += mouseX * deltaTime * camera.currentSettings.rotationSpeed;
    camera.state.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, camera.state.rotation.x + mouseY * deltaTime * camera.currentSettings.rotationSpeed)
    );

    
    const length = Math.sqrt(
      camera.state.rotation.x ** 2 +
      camera.state.rotation.y ** 2 +
      camera.state.rotation.z ** 2 +
      camera.state.rotation.w ** 2
    );

    if (length > 0) {
      camera.state.rotation.x /= length;
      camera.state.rotation.y /= length;
      camera.state.rotation.z /= length;
      camera.state.rotation.w /= length;
    }
  }

  
  private updateFixedCamera(camera: CameraInstance, deltaTime: number): void {
    
    
  }

  
  private updateCinematicCamera(camera: CameraInstance, deltaTime: number): void {
    if (camera.path) {
      this.updateCameraPath(camera, deltaTime);
    }
  }

  
  private updateCustomCamera(camera: CameraInstance, deltaTime: number): void {
    
    
  }

  
  private smoothMoveCamera(camera: CameraInstance, desiredPosition: Vector3, deltaTime: number): void {
    const smoothing = camera.currentSettings.smoothingFactor;
    const moveSpeed = camera.currentSettings.movementSpeed;

    const lerpFactor = 1 - Math.exp(-moveSpeed * deltaTime);

    camera.state.position.x += (desiredPosition.x - camera.state.position.x) * lerpFactor;
    camera.state.position.y += (desiredPosition.y - camera.state.position.y) * lerpFactor;
    camera.state.position.z += (desiredPosition.z - camera.state.position.z) * lerpFactor;

    camera.state.isMoving = lerpFactor > 0.01;
  }

  
  private lookAtTarget(camera: CameraInstance, target: Vector3): void {
    const direction = {
      x: target.x - camera.state.position.x,
      y: target.y - camera.state.position.y,
      z: target.z - camera.state.position.z
    };

    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
    if (length > 0) {
      direction.x /= length;
      direction.y /= length;
      direction.z /= length;
    }

    
    const dot = camera.currentSettings.up.y; 
    const pitch = Math.asin(-direction.y);
    const yaw = Math.atan2(direction.x, direction.z);

    camera.state.rotation = this.eulerToQuaternion(pitch, yaw, 0);
  }

  
  private eulerToQuaternion(pitch: number, yaw: number, roll: number): Quaternion {
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);

    return {
      w: cr * cp * cy + sr * sp * sy,
      x: sr * cp * cy - cr * sp * sy,
      y: cr * sp * cy + sr * cp * sy,
      z: cr * cp * sy - sr * sp * cy
    };
  }

  
  private calculateLookAhead(velocity: Vector3, predictionTime: number): Vector3 {
    return {
      x: velocity.x * predictionTime,
      y: velocity.y * predictionTime,
      z: velocity.z * predictionTime
    };
  }

  
  private updateCameraPath(camera: CameraInstance, deltaTime: number): void {
    if (!camera.path) return;

    
    
  }

  
  private updateCameraEffects(camera: CameraInstance, deltaTime: number): void {
    for (const [effectId, effect] of camera.effects) {
      
      effect.duration -= deltaTime;

      if (effect.duration <= 0) {
        camera.effects.delete(effectId);
        continue;
      }

      
      this.applyCameraEffect(camera, effect, deltaTime);
    }
  }

  
  private applyCameraEffect(camera: CameraInstance, effect: CameraEffect, deltaTime: number): void {
    const intensity = this.calculateEffectIntensity(effect, deltaTime);

    switch (effect.type) {
      case 'shake':
        this.applyShakeEffect(camera, effect, intensity);
        break;
      case 'zoom':
        this.applyZoomEffect(camera, effect, intensity);
        break;
      case 'blur':
        this.applyBlurEffect(camera, effect, intensity);
        break;
      case 'chromatic':
        this.applyChromaticAberration(camera, effect, intensity);
        break;
    }
  }

  
  private applyShakeEffect(camera: CameraInstance, effect: CameraEffect, intensity: number): void {
    const shakeAmount = effect.parameters.get('intensity') || 1;
    const shakeX = (Math.random() - 0.5) * shakeAmount * intensity;
    const shakeY = (Math.random() - 0.5) * shakeAmount * intensity;

    camera.state.position.x += shakeX;
    camera.state.position.y += shakeY;
  }

  
  private applyZoomEffect(camera: CameraInstance, effect: CameraEffect, intensity: number): void {
    const zoomAmount = effect.parameters.get('zoom') || 1;
    camera.currentSettings.fov = 75 + (zoomAmount * intensity);
  }

  
  private applyBlurEffect(camera: CameraInstance, effect: CameraEffect, intensity: number): void {
    
    
  }

  
  private applyChromaticAberration(camera: CameraInstance, effect: CameraEffect, intensity: number): void {
    
    
  }

  
  private calculateEffectIntensity(effect: CameraEffect, deltaTime: number): number {
    let intensity = effect.intensity;

    switch (effect.falloff) {
      case 'linear':
        intensity *= (effect.duration / effect.parameters.get('originalDuration') || effect.duration);
        break;
      case 'exponential':
        intensity *= Math.exp(-deltaTime * 2);
        break;
      case 'logarithmic':
        intensity *= Math.log(effect.duration + 1) / Math.log((effect.parameters.get('originalDuration') || effect.duration) + 1);
        break;
    }

    return Math.max(0, intensity);
  }

  
  private checkCameraConstraints(camera: CameraInstance): void {
    
    if (camera.definition.constraints.positionBounds) {
      const bounds = camera.definition.constraints.positionBounds;
      camera.state.position.x = Math.max(bounds.min.x, Math.min(bounds.max.x, camera.state.position.x));
      camera.state.position.y = Math.max(bounds.min.y, Math.min(bounds.max.y, camera.state.position.y));
      camera.state.position.z = Math.max(bounds.min.z, Math.min(bounds.max.z, camera.state.position.z));
    }

    
    if (camera.definition.constraints.distanceLimits) {
      const distance = Math.sqrt(
        camera.state.position.x ** 2 +
        camera.state.position.y ** 2 +
        camera.state.position.z ** 2
      );

      if (distance < camera.definition.constraints.distanceLimits.minDistance) {
        const ratio = camera.definition.constraints.distanceLimits.minDistance / distance;
        camera.state.position.x *= ratio;
        camera.state.position.y *= ratio;
        camera.state.position.z *= ratio;
      } else if (distance > camera.definition.constraints.distanceLimits.maxDistance) {
        const ratio = camera.definition.constraints.distanceLimits.maxDistance / distance;
        camera.state.position.x *= ratio;
        camera.state.position.y *= ratio;
        camera.state.position.z *= ratio;
      }
    }
  }

  
  private updateCinematicSequences(deltaTime: number): void {
    
    for (const [sequenceId, sequence] of this.cinematicSequences) {
      
    }
  }

  
  private updatePerformanceMetrics(updateTime: number): void {
    this.stats.averageFrameTime = (this.stats.averageFrameTime + updateTime) / 2;
    this.stats.peakFrameTime = Math.max(this.stats.peakFrameTime, updateTime);
    this.stats.totalPlayTime += updateTime;
  }

  
  getCameraDefinition(cameraId: string): CameraDefinition | null {
    return this.cameraDefinitions.get(cameraId) || null;
  }

  
  getCameraInstance(cameraId: string): CameraInstance | null {
    return this.activeCameras.get(cameraId) || null;
  }

  
  getMainCamera(): CameraInstance | null {
    return this.mainCamera ? this.activeCameras.get(this.mainCamera) || null : null;
  }

  
  setMainCamera(cameraId: string): boolean {
    if (this.activeCameras.has(cameraId)) {
      this.mainCamera = cameraId;
      return true;
    }
    return false;
  }

  
  switchCameraMode(cameraId: string, newMode: string): boolean {
    const camera = this.activeCameras.get(cameraId);
    if (!camera) return false;

    const newDefinition = this.cameraDefinitions.get(newMode);
    if (!newDefinition) return false;

    camera.definition = newDefinition;
    camera.state.mode = newMode;
    this.stats.modeSwitches++;

    this.eventBus.emit('camera:mode-switched', {
      cameraId,
      fromMode: camera.definition.mode.type,
      toMode: newMode
    });

    console.log(`📷 Switched camera ${cameraId} to mode: ${newMode}`);
    return true;
  }

  
  getCameraPath(pathId: string): CameraPath | null {
    return this.cameraPaths.get(pathId) || null;
  }

  
  updateConfig(newConfig: Partial<CameraConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Camera configuration updated');
  }

  
  getStats(): CameraStats {
    return { ...this.stats };
  }

  private setupEventListeners(): void {
    this.eventBus.on('input:camera-control', (data: any) => {
      
      this.stats.userInputs++;
    });

    this.eventBus.on('game:entity-moved', (data: any) => {
      
    });
  }

  private generateCameraId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `camera_${timestamp}_${random}`;
  }

  private log(message: string, level: 'info' | 'debug' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[CAMERA:${level.toUpperCase()}] ${timestamp} - ${message}`);
  }

  

  
  getConfig(): CameraConfig {
    return { ...this.config };
  }

  
  updateConfig(newConfig: Partial<CameraConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log('Camera configuration updated');
  }

  
  getStats(): CameraStats {
    const stats = { ...this.stats };
    stats.totalCameras = this.activeCameras.size;
    stats.activeCameras = this.activeCameras.size;
    return stats;
  }

  
  getMainCamera(): CameraInstance | null {
    if (!this.mainCamera) return null;
    return this.activeCameras.get(this.mainCamera) || null;
  }

  
  setMainCamera(cameraId: string): boolean {
    const camera = this.activeCameras.get(cameraId);
    if (camera) {
      this.mainCamera = cameraId;
      this.log(`Main camera set to: ${cameraId}`);
      return true;
    }
    return false;
  }

  
  switchCameraMode(cameraId: string, mode: CameraModeType): boolean {
    const camera = this.activeCameras.get(cameraId);
    if (!camera) {
      this.log(`Camera not found: ${cameraId}`, 'error');
      return false;
    }

    
    const validModes: CameraModeType[] = ['chase', 'first-person', 'orbit', 'fixed', 'cinematic', 'debug', 'custom'];
    if (!validModes.includes(mode)) {
      this.log(`Invalid camera mode: ${mode}`, 'error');
      return false;
    }

    const oldMode = camera.state.mode;
    camera.state.mode = mode;

    
    switch (mode) {
      case 'chase':
        camera.currentSettings.distance = 10;
        camera.currentSettings.fov = 75;
        break;
      case 'first-person':
        camera.currentSettings.distance = 0;
        camera.currentSettings.fov = 90;
        break;
      case 'orbit':
        camera.currentSettings.distance = 15;
        camera.currentSettings.fov = 60;
        break;
    }

    this.stats.modeSwitches++;
    this.eventBus.emit('camera:mode-switched', {
      cameraId,
      fromMode: oldMode,
      toMode: mode,
      timestamp: Date.now()
    });

    this.log(`Camera ${cameraId} switched from ${oldMode} to ${mode}`);
    return true;
  }

  
  applyShake(cameraId: string, intensity: number, duration: number): boolean {
    const camera = this.activeCameras.get(cameraId);
    if (!camera) return false;

    const shakeEffect: CameraEffect = {
      id: `shake_${Date.now()}`,
      name: 'Screen Shake',
      description: 'Camera shake effect',
      type: 'shake',
      parameters: new Map([['intensity', intensity]]),
      duration,
      intensity,
      falloff: 'exponential',
      triggerCondition: 'manual',
      priority: 1
    };

    camera.effects.set(shakeEffect.id, shakeEffect);
    this.stats.effectsApplied++;

    this.eventBus.emit('camera:effect-applied', {
      cameraId,
      effectType: 'shake',
      duration,
      intensity
    });

    return true;
  }

  
  applyFocus(cameraId: string, intensity: number, duration: number): boolean {
    const camera = this.activeCameras.get(cameraId);
    if (!camera) return false;

    const focusEffect: CameraEffect = {
      id: `focus_${Date.now()}`,
      name: 'Depth of Field',
      description: 'Camera focus effect',
      type: 'focus',
      parameters: new Map([['blur', intensity * 5]]),
      duration,
      intensity,
      falloff: 'linear',
      triggerCondition: 'manual',
      priority: 2
    };

    camera.effects.set(focusEffect.id, focusEffect);
    this.stats.effectsApplied++;

    return true;
  }

  
  adjustZoom(cameraId: string, delta: number): boolean {
    const camera = this.activeCameras.get(cameraId);
    if (!camera) return false;

    camera.currentSettings.fov = Math.max(30, Math.min(120, camera.currentSettings.fov + delta));
    return true;
  }

  
  applyCameraPath(cameraId: string, path: CameraPath): boolean {
    const camera = this.activeCameras.get(cameraId);
    if (!camera) return false;

    
    const sequence: CinematicSequence = {
      id: `sequence_${Date.now()}`,
      name: `Path: ${path.name}`,
      duration: path.duration,
      cameraId,
      pathId: path.id,
      effects: [],
      subtitles: [],
      isActive: true,
      startTime: Date.now(),
      currentTime: 0
    };

    this.cinematicSequences.set(sequence.id, sequence);
    this.stats.cinematicSequences++;

    this.eventBus.emit('camera:path-started', {
      cameraId,
      pathName: path.name,
      duration: path.duration
    });

    return true;
  }

  
  stopCameraPath(cameraId: string): boolean {
    const sequences = Array.from(this.cinematicSequences.values())
      .filter(seq => seq.cameraId === cameraId && seq.isActive);

    sequences.forEach(seq => {
      seq.isActive = false;
      this.eventBus.emit('camera:path-completed', {
        cameraId,
        pathName: seq.name
      });
    });

    return sequences.length > 0;
  }

  
  getCameraPath(pathId: string): CameraPath | null {
    return this.cameraPaths.get(pathId) || null;
  }

  
  getAllPaths(): CameraPath[] {
    return Array.from(this.cameraPaths.values());
  }

  
  getAllCameras(): CameraInstance[] {
    return Array.from(this.activeCameras.values());
  }

  
  removeCamera(cameraId: string): boolean {
    const camera = this.activeCameras.get(cameraId);
    if (!camera) return false;

    this.activeCameras.delete(cameraId);
    this.log(`Camera removed: ${cameraId}`);

    
    if (this.mainCamera === cameraId) {
      this.mainCamera = null;
    }

    return true;
  }

  
  updateCameraSystem(deltaTime: number): void {
    const startTime = performance.now();

    
    this.activeCameras.forEach(camera => {
      this.updateCamera(camera, deltaTime);
    });

    
    this.updateCinematicSequences(deltaTime);

    
    this.stats.totalPlayTime += deltaTime * 1000;
    this.stats.averageFPS = 1000 / (deltaTime * 1000);

    const endTime = performance.now();
    const updateTime = endTime - startTime;
    this.stats.averageFrameTime = updateTime;
    this.stats.peakFrameTime = Math.max(this.stats.peakFrameTime, updateTime);
  }

  
  private updateCamera(camera: CameraInstance, deltaTime: number): void {
    camera.updateCount++;
    camera.lastUpdateTime = Date.now();

    
    camera.effects.forEach((effect, effectId) => {
      effect.duration -= deltaTime * 1000;
      if (effect.duration <= 0) {
        camera.effects.delete(effectId);
      }
    });

    
    camera.performanceMetrics.updateTime = deltaTime * 1000;
    camera.performanceMetrics.averageFPS = 1000 / (deltaTime * 1000);
  }

  
  private updateCinematicSequences(deltaTime: number): void {
    this.cinematicSequences.forEach((sequence, sequenceId) => {
      if (sequence.isActive) {
        sequence.currentTime += deltaTime * 1000;

        if (sequence.currentTime >= sequence.duration) {
          sequence.isActive = false;
          this.eventBus.emit('camera:path-completed', {
            cameraId: sequence.cameraId,
            pathName: sequence.name
          });
        }
      }
    });
  }
}


type {
  CameraDefinition,
  CameraInstance,
  CameraMode,
  CameraSettings,
  CameraTransition,
  CameraKeyframe,
  CameraTransitionEvent,
  CameraConstraints,
  CameraEffect,
  CameraVisualStyle,
  CameraMetadata,
  CameraPath,
  CameraWaypoint,
  CameraPathEvent,
  CameraState,
  CameraPerformanceMetrics,
  CinematicSequence,
  CameraShot,
  Subtitle,
  CinematicEffect,
  CameraConfig,
  CameraStats
};
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.CameraSystemPure = {
      // Add exports here as needed
    };
  }
})();
