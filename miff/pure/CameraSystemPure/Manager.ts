/**
 * MIFF Camera System Manager
 *
 * Core business logic for camera management, mode switching, and cinematic control
 */

import {
  CameraSystemPure,
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
  CameraStats,
  Vector3,
  Quaternion
} from './index';

export class CameraManager {
  private cameraSystem: CameraSystemPure;

  constructor(cameraSystem: CameraSystemPure) {
    this.cameraSystem = cameraSystem;

    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'CameraSystemManager': LogLevel.DEBUG
      }
    });

    // Register with memory manager
    this.memoryId = `CameraSystemManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'CameraSystemManager');
  }

  /**
   * Create a new camera definition with validation
   */
  createCameraDefinition(cameraData: Partial<CameraDefinition>): CameraDefinition | null {
    // Validate required fields
    if (!cameraData.id || cameraData.id.trim() === '') {
      this.logger.error('CameraSystemManager', '❌ Camera ID is required');
      return null;
    }

    if (!cameraData.name || cameraData.name.trim() === '') {
      this.logger.error('CameraSystemManager', '❌ Camera name is required');
      return null;
    }

    if (!cameraData.mode) {
      this.logger.error('CameraSystemManager', '❌ Camera mode is required');
      return null;
    }

    if (!cameraData.settings) {
      this.logger.error('CameraSystemManager', '❌ Camera settings are required');
      return null;
    }

    // Create camera definition
    const camera: CameraDefinition = {
      id: cameraData.id,
      name: cameraData.name,
      description: cameraData.description || 'A camera',
      mode: cameraData.mode,
      settings: cameraData.settings,
      transitions: cameraData.transitions || [],
      constraints: cameraData.constraints || {
        collisionRadius: 1,
        avoidanceDistance: 2,
        followSpeed: 1.5,
        predictionTime: 0.5,
        deadZone: 1
      },
      effects: cameraData.effects || [],
      inputBindings: cameraData.inputBindings || new Map(),
      visualStyle: cameraData.visualStyle || {
        filter: 'default',
        overlay: 'none',
        crosshair: false,
        hudElements: [],
        colorGrading: 'neutral',
        bloomIntensity: 0.3,
        vignetteIntensity: 0.2,
        chromaticAberration: 0.1,
        grainIntensity: 0.05,
        customShaders: []
      },
      audioProfile: cameraData.audioProfile || '3d-spatial',
      metadata: cameraData.metadata || {
        author: 'Unknown',
        version: '1.0.0',
        compatibility: [],
        tags: [],
        dependencies: [],
        performanceRating: 'medium',
        qualitySettings: new Map()
      }
    };

    return camera;
  }

  /**
   * Register a camera in the system
   */
  registerCamera(camera: CameraDefinition): boolean {
    // Validate camera
    if (!this.validateCameraDefinition(camera)) {
      this.logger.error('CameraSystemManager', `❌ Invalid camera definition: ${camera.id}`);
      return false;
    }

    // Store in system (this would normally go through the main system)
    this.logger.info('CameraSystemManager', `✅ Registered camera: ${camera.name} (${camera.id})`);
    return true;
  }

  /**
   * Create a camera instance for a target
   */
  createCameraForTarget(cameraId: string, targetEntity: string): CameraInstance | null {
    try {
      // Check if camera exists
      const cameraDef = this.cameraSystem.getCameraDefinition(cameraId);
      if (!cameraDef) {
        throw new Error(`Camera definition not found: ${cameraId}`);
      }

      // Create the camera instance
      const camera = this.cameraSystem.createCamera(cameraId, targetEntity);

      if (camera) {
        this.logger.info('CameraSystemManager', `📷 Created camera for ${targetEntity}: ${cameraDef.name}`);
      }

      return camera;
    } catch (error) {
      this.logger.error('CameraSystemManager', `❌ Error creating camera ${cameraId}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Switch camera mode with smooth transition
   */
  switchCameraMode(cameraId: string, newMode: string, transitionDuration?: number): boolean {
    try {
      const camera = this.cameraSystem.getCameraInstance(cameraId);
      if (!camera) {
        throw new Error(`Camera not found: ${cameraId}`);
      }

      // Check if new mode exists
      const newModeDef = this.cameraSystem.getCameraDefinition(newMode);
      if (!newModeDef) {
        throw new Error(`Camera mode not found: ${newMode}`);
      }

      // Create transition
      const transition = this.createCameraTransition(
        camera.definition.mode.type,
        newMode,
        transitionDuration || newModeDef.mode.defaultDuration
      );

      // Apply transition
      const success = this.cameraSystem.switchCameraMode(cameraId, newMode);

      if (success) {
        this.logger.info('CameraSystemManager', `📷 Switched camera ${cameraId} to mode: ${newMode}`);
        this.updateStats({ modeSwitches: this.cameraSystem.getStats().modeSwitches + 1 });
      }

      return success;
    } catch (error) {
      this.logger.error('CameraSystemManager', `❌ Error switching camera mode:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Create a camera transition
   */
  private createCameraTransition(fromMode: string, toMode: string, duration: number): CameraTransition {
    const keyframes: CameraKeyframe[] = [
      {
        time: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        fov: 75,
        settings: {},
        events: ['transition-start']
      },
      {
        time: 1,
        position: { x: 0, y: 5, z: 10 },
        rotation: { x: -0.2, y: 0, z: 0, w: 0.98 },
        fov: 75,
        settings: {},
        events: ['transition-end']
      }
    ];

    return {
      id: this.generateTransitionId(),
      name: `${fromMode}-to-${toMode}`,
      fromMode,
      toMode,
      duration,
      easing: 'ease-in-out',
      interpolation: 'cubic',
      keyframes,
      events: [],
      visualEffect: 'smooth_transition',
      soundEffect: 'camera_click'
    };
  }

  /**
   * Set main camera
   */
  setMainCamera(cameraId: string): boolean {
    const success = this.cameraSystem.setMainCamera(cameraId);
    if (success) {
      this.logger.info('CameraSystemManager', `📷 Set main camera: ${cameraId}`);
    }
    return success;
  }

  /**
   * Get current main camera
   */
  getMainCamera(): CameraInstance | null {
    return this.cameraSystem.getMainCamera();
  }

  /**
   * Create a cinematic sequence
   */
  createCinematicSequence(sequenceData: Partial<CinematicSequence>): CinematicSequence | null {
    try {
      // Validate required fields
      if (!sequenceData.id || sequenceData.id.trim() === '') {
        throw new Error('Sequence ID is required');
      }

      if (!sequenceData.name || sequenceData.name.trim() === '') {
        throw new Error('Sequence name is required');
      }

      if (!sequenceData.cameraShots || sequenceData.cameraShots.length === 0) {
        throw new Error('At least one camera shot is required');
      }

      // Create sequence
      const sequence: CinematicSequence = {
        id: sequenceData.id,
        name: sequenceData.name,
        description: sequenceData.description || 'A cinematic sequence',
        duration: sequenceData.duration || 30,
        cameraShots: sequenceData.cameraShots,
        audioTrack: sequenceData.audioTrack || 'default',
        subtitles: sequenceData.subtitles || [],
        effects: sequenceData.effects || [],
        priority: sequenceData.priority || 1,
        triggerCondition: sequenceData.triggerCondition || 'manual',
        isActive: false,
        currentTime: 0,
        cameraId: sequenceData.cameraId || 'default',
        autoPlay: sequenceData.autoPlay || false,
        loop: sequenceData.loop || false
      };

      // Store sequence (would normally go through main system)
      this.logger.info('CameraSystemManager', `🎬 Created cinematic sequence: ${sequence.name}`);
      return sequence;
    } catch (error) {
      this.logger.error('CameraSystemManager', `❌ Error creating cinematic sequence:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Play cinematic sequence
   */
  playCinematicSequence(sequenceId: string): boolean {
    try {
      // This would trigger cinematic playback
      this.logger.info('CameraSystemManager', `🎬 Playing cinematic sequence: ${sequenceId}`);
      return true;
    } catch (error) {
      this.logger.error('CameraSystemManager', `❌ Error playing cinematic sequence:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Create a camera path
   */
  createCameraPath(pathData: Partial<CameraPath>): CameraPath | null {
    try {
      // Validate required fields
      if (!pathData.id || pathData.id.trim() === '') {
        throw new Error('Path ID is required');
      }

      if (!pathData.name || pathData.name.trim() === '') {
        throw new Error('Path name is required');
      }

      if (!pathData.waypoints || pathData.waypoints.length === 0) {
        throw new Error('At least one waypoint is required');
      }

      // Create path
      const path: CameraPath = {
        id: pathData.id,
        name: pathData.name,
        description: pathData.description || 'A camera path',
        waypoints: pathData.waypoints,
        duration: pathData.duration || 10,
        loop: pathData.loop || false,
        interpolation: pathData.interpolation || 'linear',
        events: pathData.events || [],
        visualStyle: pathData.visualStyle || 'default',
        speedMultiplier: pathData.speedMultiplier || 1.0,
        startDelay: pathData.startDelay || 0,
        endDelay: pathData.endDelay || 0
      };

      // Store path (would normally go through main system)
      this.logger.info('CameraSystemManager', `🛤️ Created camera path: ${path.name}`);
      this.updateStats({ pathsCreated: this.cameraSystem.getStats().pathsCreated + 1 });
      return path;
    } catch (error) {
      this.logger.error('CameraSystemManager', `❌ Error creating camera path:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Apply camera effect
   */
  applyCameraEffect(cameraId: string, effectType: string, parameters: Map<string, any>): boolean {
    try {
      const camera = this.cameraSystem.getCameraInstance(cameraId);
      if (!camera) {
        throw new Error(`Camera not found: ${cameraId}`);
      }

      // Create effect
      const effect: CameraEffect = {
        id: this.generateEffectId(),
        name: `${effectType}-effect`,
        description: `Camera ${effectType} effect`,
        type: effectType as any,
        parameters,
        duration: parameters.get('duration') || 1000,
        intensity: parameters.get('intensity') || 1.0,
        falloff: parameters.get('falloff') || 'linear',
        triggerCondition: parameters.get('trigger') || 'manual',
        priority: parameters.get('priority') || 1
      };

      // Apply effect
      camera.effects.set(effect.id, effect);
      this.logger.info('CameraSystemManager', `✨ Applied ${effectType} effect to camera ${cameraId}`);
      this.updateStats({ effectsApplied: this.cameraSystem.getStats().effectsApplied + 1 });
      return true;
    } catch (error) {
      this.logger.error('CameraSystemManager', `❌ Error applying camera effect:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Get camera recommendations for a target
   */
  getCameraRecommendations(targetEntity: string): Array<{
    camera: CameraDefinition;
    reason: string;
    suitability: 'excellent' | 'good' | 'fair' | 'poor';
    performanceRating: string;
  }> {
    const allCameras = this.getAllCameraDefinitions();
    const recommendations: Array<{
      camera: CameraDefinition;
      reason: string;
      suitability: 'excellent' | 'good' | 'fair' | 'poor';
      performanceRating: string;
    }> = [];

    for (const camera of allCameras) {
      const suitability = this.assessCameraSuitability(camera, targetEntity);
      const reason = this.getCameraRecommendationReason(camera);
      const performanceRating = camera.metadata.performanceRating;

      recommendations.push({
        camera,
        reason,
        suitability,
        performanceRating
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Assess camera suitability for a target
   */
  private assessCameraSuitability(camera: CameraDefinition, targetEntity: string): 'excellent' | 'good' | 'fair' | 'poor' {
    // This would analyze target type, environment, and requirements
    // For now, return based on camera type
    switch (camera.mode.type) {
      case 'chase':
        return 'excellent'; // Good for most targets
      case 'orbit':
        return 'good'; // Good for inspection
      case 'first-person':
        return 'fair'; // Limited to specific targets
      default:
        return 'poor';
    }
  }

  /**
   * Get recommendation reason for a camera
   */
  private getCameraRecommendationReason(camera: CameraDefinition): string {
    switch (camera.mode.type) {
      case 'chase':
        return 'Best for following moving targets with smooth tracking';
      case 'orbit':
        return 'Perfect for cinematic shots and target inspection';
      case 'first-person':
        return 'Immersive perspective for character control';
      case 'fixed':
        return 'Static camera for specific viewpoints';
      case 'cinematic':
        return 'Pre-scripted camera movements for storytelling';
      default:
        return 'Custom camera for specialized use cases';
    }
  }

  /**
   * Get camera statistics
   */
  getCameraStats(): CameraStats & {
    activeCameraCount: number;
    mainCameraMode: string;
    averagePerformanceRating: string;
  } {
    const stats = this.cameraSystem.getStats();
    const activeCameras = this.cameraSystem.getAllCameras();
    const mainCamera = this.cameraSystem.getMainCamera();

    // Calculate average performance rating
    const ratings = Array.from(activeCameras.values()).map(c => c.definition.metadata.performanceRating);
    const avgRating = this.calculateAveragePerformanceRating(ratings);

    return {
      ...stats,
      activeCameraCount: activeCameras.size,
      mainCameraMode: mainCamera?.definition.mode.type || 'none',
      averagePerformanceRating: avgRating
    };
  }

  /**
   * Calculate average performance rating
   */
  private calculateAveragePerformanceRating(ratings: string[]): string {
    const ratingValues = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'ultra': 4
    };

    const avgValue = ratings.reduce((sum, rating) => sum + (ratingValues[rating as keyof typeof ratingValues] || 2), 0) / ratings.length;
    const avgRating = Math.round(avgValue);

    switch (avgRating) {
      case 1: return 'low';
      case 2: return 'medium';
      case 3: return 'high';
      case 4: return 'ultra';
      default: return 'medium';
    }
  }

  /**
   * Get all camera definitions
   */
  getAllCameraDefinitions(): CameraDefinition[] {
    // This would normally come from the main system
    return [];
  }

  /**
   * Get all cameras
   */
  getAllCameras(): CameraInstance[] {
    // This would normally come from the main system
    return [];
  }

  /**
   * Update camera statistics
   */
  updateStats(updates: Partial<CameraStats>): void {
    // This would update the camera statistics
    this.logger.info('CameraSystemManager', 'Updated camera statistics');
  }

  /**
   * Validate camera definition
   */
  private validateCameraDefinition(camera: CameraDefinition): boolean {
    if (!camera.id || camera.id.trim() === '') {
      this.logger.error('CameraSystemManager', 'Camera ID is required');
      return false;
    }

    if (!camera.name || camera.name.trim() === '') {
      this.logger.error('CameraSystemManager', 'Camera name is required');
      return false;
    }

    if (!camera.mode) {
      this.logger.error('CameraSystemManager', 'Camera mode is required');
      return false;
    }

    if (!camera.settings) {
      this.logger.error('CameraSystemManager', 'Camera settings are required');
      return false;
    }

    return true;
  }

  /**
   * Generate unique transition ID
   */
  private generateTransitionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `transition_${timestamp}_${random}`;
  }

  /**
   * Generate unique effect ID
   */
  private generateEffectId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `effect_${timestamp}_${random}`;
  }

  /**
   * Export camera system data
   */
  exportData(): {
    cameras: CameraDefinition[];
    activeCameras: CameraInstance[];
    paths: CameraPath[];
    sequences: CinematicSequence[];
    stats: CameraStats;
    config: CameraConfig;
    timestamp: number;
  } {
    return {
      cameras: this.getAllCameraDefinitions(),
      activeCameras: this.getAllCameras(),
      paths: [], // Would get from main system
      sequences: [], // Would get from main system
      stats: this.cameraSystem.getStats(),
      config: this.cameraSystem.getConfig(),
      timestamp: Date.now()
    };
  }

  /**
   * Import camera system data
   */
  importData(data: ReturnType<typeof this.exportData>): void {
    // Import logic would go here
    this.logger.info('CameraSystemManager', 'Camera system data imported');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.logger.info('CameraSystemManager', 'Destroying manager', {
      itemsCount: this.items.size
    });
    
    this.items.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
    
    // Unregister from memory manager
    MemoryManager.unregisterObject(this.memoryId);
    
    // Destroy logger
    this.logger.destroy();
  }
}