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
import { Logger } from '../shared/logging';

const logger = Logger.create('CameraManager');

export class CameraManager {
  private cameraSystem: CameraSystemPure;

  constructor(cameraSystem: CameraSystemPure) {
    this.cameraSystem = cameraSystem;
  }

  /**
   * Create a new camera definition with validation
   */
  createCameraDefinition(cameraData: Partial<CameraDefinition>): CameraDefinition | null {
    // Validate required fields
    if (!cameraData.id || cameraData.id.trim() === '') {
      logger.error('Camera ID is required', { cameraData });
      return null;
    }

    if (!cameraData.name || cameraData.name.trim() === '') {
      logger.error('Camera name is required', { cameraId: cameraData.id });
      return null;
    }

    if (!cameraData.mode) {
      logger.error('Camera mode is required', { cameraId: cameraData.id });
      return null;
    }

    if (!cameraData.settings) {
      logger.error('Camera settings are required', { cameraId: cameraData.id });
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
      logger.error('Invalid camera definition', { cameraId: camera.id, cameraName: camera.name });
      return false;
    }

    // Store in system (this would normally go through the main system)
    logger.info('Camera registered', { cameraId: camera.id, cameraName: camera.name });
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
        logger.info('Camera created', { targetEntity, cameraName: cameraDef.name, cameraId });
      }

      return camera;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error creating camera', { cameraId, error: err });
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
        logger.info('Camera mode switched', { cameraId, newMode });
        this.updateStats({ modeSwitches: this.cameraSystem.getStats().modeSwitches + 1 });
      }

      return success;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error switching camera mode', { cameraId, newMode, error: err });
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
      logger.info('Main camera set', { cameraId });
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
      logger.info('Cinematic sequence created', { sequenceName: sequence.name, shotCount: shots.length });
      return sequence;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error creating cinematic sequence', { error: err });
      return null;
    }
  }

  /**
   * Play cinematic sequence
   */
  playCinematicSequence(sequenceId: string): boolean {
    try {
      // This would trigger cinematic playback
      logger.info('Cinematic sequence playing', { sequenceId });
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error playing cinematic sequence', { sequenceId, error: err });
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
      logger.info('Camera path created', { pathName: path.name, pathId: path.id, waypointCount: waypoints.length });
      this.updateStats({ pathsCreated: this.cameraSystem.getStats().pathsCreated + 1 });
      return path;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error creating camera path', { error: err });
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
      logger.info('Camera effect applied', { cameraId, effectType, effectId: effect.id });
      this.updateStats({ effectsApplied: this.cameraSystem.getStats().effectsApplied + 1 });
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error applying camera effect', { cameraId, effectType, error: err });
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
    const ratings = Array.from(activeCameras.values()).map((c: any) => c.definition.metadata.performanceRating);
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
    logger.debug('Camera statistics updated', { updates });
  }

  /**
   * Validate camera definition
   */
  private validateCameraDefinition(camera: CameraDefinition): boolean {
    if (!camera.id || camera.id.trim() === '') {
      logger.error('Camera validation failed: ID is required', { camera });
      return false;
    }

    if (!camera.name || camera.name.trim() === '') {
      logger.error('Camera validation failed: name is required', { cameraId: camera.id });
      return false;
    }

    if (!camera.mode) {
      logger.error('Camera validation failed: mode is required', { cameraId: camera.id });
      return false;
    }

    if (!camera.settings) {
      logger.error('Camera validation failed: settings are required', { cameraId: camera.id });
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
      timestamp: new Date()
    };
  }

  /**
   * Import camera system data
   */
  importData(data: ReturnType<typeof this.exportData>): void {
    // Import logic would go here
    logger.info('Camera system data imported', { dataKeys: Object.keys(data) });
  }
}