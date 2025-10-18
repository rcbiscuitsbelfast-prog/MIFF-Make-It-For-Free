/**
 * MIFF Driving System Manager
 *
 * Core business logic for vehicle management, racing sessions, and driving mechanics
 */

import {
  DrivingSystemPure,
  VehicleDefinition,
  VehicleInstance,
  VehicleAbility,
  VehicleEffect,
  Upgrade,
  DrivingSession,
  DrivingPenalty,
  TrackDefinition,
  Checkpoint,
  Obstacle,
  PowerUp,
  WeatherZone,
  MovementPattern,
  DrivingConfig,
  DrivingStats,
  Vector3
} from './index';
import { Logger } from '../shared/logging';

const logger = Logger.create('DrivingManager');

export class DrivingManager {
  private drivingSystem: DrivingSystemPure;

  constructor(drivingSystem: DrivingSystemPure) {
    this.drivingSystem = drivingSystem;
  }

  /**
   * Create a new vehicle definition with validation
   */
  createVehicleDefinition(vehicleData: Partial<VehicleDefinition>): VehicleDefinition | null {
    // Validate required fields
    if (!vehicleData.id || vehicleData.id.trim() === '') {
      logger.error('Vehicle ID is required', { vehicleData });
      return null;
    }

    if (!vehicleData.name || vehicleData.name.trim() === '') {
      logger.error('Vehicle name is required', { vehicleId: vehicleData.id });
      return null;
    }

    if (!vehicleData.type) {
      logger.error('Vehicle type is required', { vehicleId: vehicleData.id, vehicleName: vehicleData.name });
      return null;
    }

    if (vehicleData.mass <= 0) {
      logger.error('Vehicle mass must be positive', { vehicleId: vehicleData.id, mass: vehicleData.mass });
      return null;
    }

    if (vehicleData.maxSpeed <= 0) {
      logger.error('Vehicle max speed must be positive', { vehicleId: vehicleData.id, maxSpeed: vehicleData.maxSpeed });
      return null;
    }

    // Create vehicle definition
    const vehicle: VehicleDefinition = {
      id: vehicleData.id,
      name: vehicleData.name,
      type: vehicleData.type,
      category: vehicleData.category || 'land',
      description: vehicleData.description || 'A vehicle',
      mass: vehicleData.mass,
      dragCoefficient: vehicleData.dragCoefficient || 0.3,
      frictionCoefficient: vehicleData.frictionCoefficient || 0.7,
      maxSpeed: vehicleData.maxSpeed,
      acceleration: vehicleData.acceleration || 10,
      brakingForce: vehicleData.brakingForce || 20,
      handling: vehicleData.handling || 0.8,
      length: vehicleData.length || 4.0,
      width: vehicleData.width || 2.0,
      height: vehicleData.height || 1.5,
      wheelbase: vehicleData.wheelbase,
      terrainTypes: vehicleData.terrainTypes || ['road'],
      weatherEffects: vehicleData.weatherEffects || new Map(),
      abilities: vehicleData.abilities || [],
      boostPower: vehicleData.boostPower,
      boostDuration: vehicleData.boostDuration,
      boostCooldown: vehicleData.boostCooldown,
      model: vehicleData.model || 'default',
      texture: vehicleData.texture || 'default',
      soundProfile: vehicleData.soundProfile || 'default',
      particleEffects: vehicleData.particleEffects || [],
      fuelCapacity: vehicleData.fuelCapacity,
      fuelConsumption: vehicleData.fuelConsumption || 0.1,
      durability: vehicleData.durability || 1000,
      repairCost: vehicleData.repairCost || 100,
      upgradeSlots: vehicleData.upgradeSlots || 4,
      compatibleUpgrades: vehicleData.compatibleUpgrades || [],
      unlockRequirements: vehicleData.unlockRequirements || [],
      skillRequirements: vehicleData.skillRequirements || new Map(),
      manufacturer: vehicleData.manufacturer || 'Unknown',
      modelYear: vehicleData.modelYear || Date.now().getFullYear(),
      rarity: vehicleData.rarity || 'common',
      value: vehicleData.value || 0
    };

    return vehicle;
  }

  /**
   * Register a vehicle in the system
   */
  registerVehicle(vehicle: VehicleDefinition): boolean {
    // Validate vehicle
    if (!this.validateVehicleDefinition(vehicle)) {
      logger.error('Invalid vehicle definition', { vehicleId: vehicle.id, vehicleName: vehicle.name });
      return false;
    }

    // Store in system (this would normally go through the main system)
    logger.info('Vehicle registered', { vehicleId: vehicle.id, vehicleName: vehicle.name, type: vehicle.type, rarity: vehicle.rarity });
    return true;
  }

  /**
   * Create a vehicle instance for a player
   */
  createVehicleForPlayer(vehicleId: string, playerId: string): VehicleInstance | null {
    try {
      // Check if vehicle is unlocked for this player
      if (!this.isVehicleUnlocked(vehicleId, playerId)) {
        console.warn(`⚠️ Vehicle not unlocked: ${vehicleId} for player ${playerId}`);
        return null;
      }

      // Create the vehicle instance
      const vehicle = this.drivingSystem.createVehicle(vehicleId, playerId);

      if (vehicle) {
        console.log(`🚗 Created vehicle for ${playerId}: ${vehicle.definition.name}`);
        this.updateStats({ vehiclesOwned: this.drivingSystem.getStats().vehiclesOwned + 1 });
      }

      return vehicle;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Error creating vehicle ${vehicleId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if vehicle is unlocked for player
   */
  private isVehicleUnlocked(vehicleId: string, playerId: string): boolean {
    // This would check player's progress, purchases, etc.
    // For now, assume demo vehicles are always unlocked
    return vehicleId.startsWith('demo-');
  }

  /**
   * Start a driving session
   */
  startDrivingSession(vehicleId: string, trackId: string, playerId: string): DrivingSession | null {
    try {
      const vehicle = this.drivingSystem.getVehicleInstance(vehicleId);
      const track = this.drivingSystem.getTrack(trackId);

      if (!vehicle) {
        throw new Error(`Vehicle not found: ${vehicleId}`);
      }

      if (!track) {
        throw new Error(`Track not found: ${trackId}`);
      }

      // Check if vehicle is compatible with track
      if (!track.allowedVehicles.includes(vehicle.definition.type)) {
        throw new Error(`Vehicle ${vehicle.definition.name} not allowed on track ${track.name}`);
      }

      // Create driving session
      const session: DrivingSession = {
        id: this.generateSessionId(),
        vehicleId,
        driverId: playerId,
        startTime: new Date(),
        startPosition: { ...vehicle.currentPosition },
        currentLap: 1,
        totalLaps: track.lapCount,
        lapTimes: [],
        bestLapTime: 0,
        checkpointsPassed: 0,
        totalCheckpoints: track.checkpoints.length,
        topSpeed: 0,
        averageSpeed: 0,
        distanceTraveled: 0,
        fuelConsumed: 0,
        penalties: [],
        collisionCount: 0,
        offTrackTime: 0,
        status: 'active'
      };

      // Store session (would normally go through main system)
      this.updateStats({ totalSessions: this.drivingSystem.getStats().totalSessions + 1 });

      logger.info('Driving session started', { trackName: track.name, vehicleName: vehicle.definition.name, playerId, trackId, vehicleId });
      return session;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error starting session', { playerId, trackId, vehicleId, error: err });
      return null;
    }
  }

  /**
   * Update vehicle controls
   */
  updateVehicleControls(vehicleId: string, controls: {
    throttle?: number;
    steering?: number;
    brake?: number;
    boost?: boolean;
    ability?: string;
  }): boolean {
    const vehicle = this.drivingSystem.getVehicleInstance(vehicleId);
    if (!vehicle) return false;

    // Update control inputs
    if (controls.throttle !== undefined) {
      vehicle.throttle = Math.max(0, Math.min(1, controls.throttle));
    }

    if (controls.steering !== undefined) {
      vehicle.steering = Math.max(-1, Math.min(1, controls.steering));
    }

    if (controls.brake !== undefined) {
      vehicle.brakeInput = Math.max(0, Math.min(1, controls.brake));
      vehicle.isBraking = controls.brake > 0;
    }

    // Handle boost
    if (controls.boost && !vehicle.isBoosting) {
      const boostAbility = vehicle.definition.abilities.find(a => a.type === 'active' && a.effects.some(e => e.type === 'boost'));
      if (boostAbility) {
        this.drivingSystem.activateAbility(vehicleId, boostAbility.id);
      }
    }

    // Handle ability activation
    if (controls.ability) {
      this.drivingSystem.activateAbility(vehicleId, controls.ability);
    }

    return true;
  }

  /**
   * Get driving statistics
   */
  getDrivingStats(): {
    totalSessions: number;
    totalDistance: number;
    totalTime: number;
    totalCrashes: number;
    totalRepairs: number;
    totalFuelConsumed: number;
    averageSpeed: number;
    bestLapTime: number;
    vehiclesOwned: number;
    tracksCompleted: number;
    achievements: string[];
    favoriteVehicle: string;
    favoriteTrack: string;
    performanceRating: string;
  } {
    const stats = this.drivingSystem.getStats();

    // Calculate performance rating
    let performanceRating = 'Beginner';
    if (stats.totalSessions > 50) {
      performanceRating = 'Expert';
    } else if (stats.totalSessions > 20) {
      performanceRating = 'Advanced';
    } else if (stats.totalSessions > 5) {
      performanceRating = 'Intermediate';
    }

    return {
      ...stats,
      performanceRating
    };
  }

  /**
   * Get available vehicles for a player
   */
  getAvailableVehicles(playerId: string): VehicleDefinition[] {
    const allVehicles = this.getAllVehicleDefinitions();
    return allVehicles.filter((vehicle: any) => this.isVehicleUnlocked(vehicle.id, playerId));
  }

  /**
   * Get all vehicle definitions
   */
  getAllVehicleDefinitions(): VehicleDefinition[] {
    // This would normally come from the main system
    return [];
  }

  /**
   * Get vehicle recommendations for a player
   */
  getVehicleRecommendations(playerId: string): Array<{
    vehicle: VehicleDefinition;
    reason: string;
    suitability: 'excellent' | 'good' | 'fair' | 'poor';
    estimatedCost: number;
  }> {
    const availableVehicles = this.getAvailableVehicles(playerId);
    const recommendations: Array<{
      vehicle: VehicleDefinition;
      reason: string;
      suitability: 'excellent' | 'good' | 'fair' | 'poor';
      estimatedCost: number;
    }> = [];

    for (const vehicle of availableVehicles) {
      const suitability = this.assessVehicleSuitability(vehicle, playerId);
      const reason = this.getVehicleRecommendationReason(vehicle);
      const estimatedCost = vehicle.value * (1 + (vehicle.rarity === 'rare' ? 5: 0));

      recommendations.push({
        vehicle,
        reason,
        suitability,
        estimatedCost
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Assess vehicle suitability for a player
   */
  private assessVehicleSuitability(vehicle: VehicleDefinition, playerId: string): 'excellent' | 'good' | 'fair' | 'poor' {
    // This would check player's driving stats, preferences, etc.
    // For now, return based on vehicle tier
    switch (vehicle.rarity) {
      case 'legendary':
        return 'excellent';
      case 'epic':
        return 'good';
      case 'rare':
        return 'good';
      case 'uncommon':
        return 'fair';
      default:
        return 'poor';
    }
  }

  /**
   * Get recommendation reason for a vehicle
   */
  private getVehicleRecommendationReason(vehicle: VehicleDefinition): string {
    if (vehicle.type === 'car') {
      return 'Great all-around performance for most tracks';
    } else if (vehicle.type === 'bike') {
      return 'Excellent handling and acceleration for tight courses';
    } else {
      return 'Specialized vehicle for specific track types';
    }
  }

  /**
   * Get track information
   */
  getTrackInfo(trackId: string): TrackDefinition | null {
    return this.drivingSystem.getTrack(trackId);
  }

  /**
   * Get all tracks
   */
  getAllTracks(): TrackDefinition[] {
    return this.drivingSystem.getAllTracks();
  }

  /**
   * Get track recommendations
   */
  getTrackRecommendations(): Array<{
    track: TrackDefinition;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    reason: string;
    estimatedTime: number;
  }> {
    const allTracks = this.getAllTracks();
    const recommendations: Array<{
      track: TrackDefinition;
      difficulty: 'easy' | 'medium' | 'hard' | 'expert';
      reason: string;
      estimatedTime: number;
    }> = [];

    for (const track of allTracks) {
      const difficulty = this.assessTrackDifficulty(track);
      const reason = this.getTrackRecommendationReason(track);
      const estimatedTime = Math.ceil(track.length / 50); // Rough estimate

      recommendations.push({
        track,
        difficulty,
        reason,
        estimatedTime
      });
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Assess track difficulty
   */
  private assessTrackDifficulty(track: TrackDefinition): 'easy' | 'medium' | 'hard' | 'expert' {
    if (track.length < 200) return 'easy';
    if (track.length < 500) return 'medium';
    if (track.length < 1000) return 'hard';
    return 'expert';
  }

  /**
   * Get track recommendation reason
   */
  private getTrackRecommendationReason(track: TrackDefinition): string {
    if (track.type === 'circuit') {
      return 'Classic racing circuit with multiple laps';
    } else if (track.type === 'sprint') {
      return 'Short, fast sprint track';
    } else if (track.type === 'drag') {
      return 'Straight-line drag racing';
    } else {
      return 'Specialized track for unique racing experiences';
    }
  }

  /**
   * Apply penalty to driving session
   */
  applyPenalty(sessionId: string, penalty: DrivingPenalty): void {
    // This would apply penalty to a driving session
    console.log(`⚠️ Applied penalty: ${penalty.type} (${penalty.timePenalty}s)`);
  }

  /**
   * Update driving statistics
   */
  updateStats(updates: Partial<DrivingStats>): void {
    // This would update the player's driving statistics
    console.log('Updated driving statistics');
  }

  /**
   * Validate vehicle definition
   */
  private validateVehicleDefinition(vehicle: VehicleDefinition): boolean {
    if (!vehicle.id || vehicle.id.trim() === '') {
      logger.error('Vehicle validation failed: ID is required', { vehicle });
      return false;
    }

    if (!vehicle.name || vehicle.name.trim() === '') {
      logger.error('Vehicle validation failed: name is required', { vehicleId: vehicle.id });
      return false;
    }

    if (vehicle.mass <= 0) {
      logger.error('Vehicle validation failed: mass must be positive', { vehicleId: vehicle.id, mass: vehicle.mass });
      return false;
    }

    if (vehicle.maxSpeed <= 0) {
      logger.error('Vehicle validation failed: max speed must be positive', { vehicleId: vehicle.id, maxSpeed: vehicle.maxSpeed });
      return false;
    }

    if (vehicle.acceleration <= 0) {
      logger.error('Vehicle validation failed: acceleration must be positive', { vehicleId: vehicle.id, acceleration: vehicle.acceleration });
      return false;
    }

    return true;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Export driving system data
   */
  exportData(): {
    vehicles: VehicleDefinition[];
    tracks: TrackDefinition[];
    stats: DrivingStats;
    config: DrivingConfig;
    timestamp: number;
  } {
    return {
      vehicles: this.getAllVehicleDefinitions(),
      tracks: this.getAllTracks(),
      stats: this.drivingSystem.getStats(),
      config: this.drivingSystem.getConfig(),
      timestamp: new Date()
    };
  }

  /**
   * Import driving system data
   */
  importData(data: ReturnType<typeof this.exportData>): void {
    // Import logic would go here
    logger.info('Driving system data imported', { dataKeys: Object.keys(data) });
  }
}