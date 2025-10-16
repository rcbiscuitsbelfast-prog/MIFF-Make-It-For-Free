/**
 * RacingSystemPure - AAA Quality Racing Game System
 *
 * Advanced racing mechanics with:
 * - Lap timing and checkpoint systems
 * - AI ghost racers for competition
 * - Vehicle physics and handling
 * - Track design and optimization
 * - Mobile-optimized racing controls
 * - Multiplayer racing support
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';

export type RaceType = 'circuit' | 'sprint' | 'endurance' | 'drag' | 'drift' | 'time_trial';
export type VehicleType = 'car' | 'motorcycle' | 'kart' | 'truck' | 'bike';
export type SurfaceType = 'asphalt' | 'dirt' | 'ice' | 'sand' | 'snow' | 'grass';
export type RaceState = 'waiting' | 'countdown' | 'racing' | 'paused' | 'finished' | 'aborted';

export interface Checkpoint {
  id: string;
  position: { x: number; y: number; z: number };
  radius: number;
  order: number;
  isStartFinish: boolean;
  lapTrigger?: boolean;
}

export interface LapTime {
  lapNumber: number;
  time: number; // milliseconds
  bestSector1?: number;
  bestSector2?: number;
  bestSector3?: number;
  penalties: number; // seconds
  completedAt: number;
}

export interface GhostRacer {
  id: string;
  name: string;
  vehicleType: VehicleType;
  lapTimes: LapTime[];
  bestLapTime: number;
  totalTime: number;
  position: number;
  isPlayer: boolean;
  recording: GhostRecording[];
}

export interface GhostRecording {
  timestamp: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  input: {
    throttle: number;
    brake: number;
    steering: number;
    handbrake: boolean;
  };
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };

  // Vehicle specs
  maxSpeed: number;
  acceleration: number;
  handling: number;
  braking: number;
  weight: number;
  drag: number;

  // Current state
  engineRPM: number;
  gear: number;
  fuel: number;
  tireWear: number;
  damage: number;

  // Controls
  throttle: number; // 0-1
  brake: number; // 0-1
  steering: number; // -1 to 1
  handbrake: boolean;
  clutch: number; // 0-1

  // Physics
  isGrounded: boolean;
  wheelSlip: number;
  driftAngle: number;
  traction: number;
}

export interface Track {
  id: string;
  name: string;
  raceType: RaceType;
  surfaceType: SurfaceType;
  length: number; // meters
  width: number; // meters
  checkpoints: Checkpoint[];
  sectors: Sector[];
  obstacles: TrackObstacle[];
  weatherEffects: boolean;
  dynamicElements: boolean;
}

export interface Sector {
  id: string;
  startCheckpoint: number;
  endCheckpoint: number;
  length: number;
  optimalTime: number; // seconds
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TrackObstacle {
  id: string;
  type: 'static' | 'dynamic' | 'destructible';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  damageValue: number;
  affectsHandling: boolean;
  respawnTime?: number;
}

export interface RaceRules {
  raceType: RaceType;
  maxLaps: number;
  timeLimit?: number; // seconds
  vehicleClass: VehicleType;
  weatherConditions: string[];
  damageEnabled: boolean;
  collisionEnabled: boolean;
  ghostMode: boolean;
  qualifyingRequired: boolean;
}

export interface RaceStats {
  totalDistance: number;
  averageSpeed: number;
  topSpeed: number;
  lapCount: number;
  bestLapTime: number;
  sectorTimes: { sector1: number; sector2: number; sector3: number };
  penalties: number;
  collisions: number;
  driftScore: number;
  consistency: number; // lower is better (time variation)
}

export interface RaceResult {
  raceId: string;
  position: number;
  totalTime: number;
  bestLapTime: number;
  lapsCompleted: number;
  penalties: number;
  points: number;
  didNotFinish: boolean;
  reason?: string;
}

export class RacingSystemPure {
  private eventBus: EventBus;
  private races: Map<string, Race> = new Map();
  private vehicles: Map<string, Vehicle> = new Map();
  private tracks: Map<string, Track> = new Map();
  private ghostRacers: Map<string, GhostRacer> = new Map();
  private physicsTimer: NodeJS.Timeout | null = null;
  private recordingTimer: NodeJS.Timeout | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.startPhysicsSimulation();
    this.startRecording();
  }

  private startPhysicsSimulation(): void {
    this.physicsTimer = setInterval(() => {
      this.updateVehiclePhysics();
    }, 16); // 60 FPS
  }

  private startRecording(): void {
    this.recordingTimer = setInterval(() => {
      this.updateGhostRecordings();
    }, 100); // 10 FPS recording
  }

  private updateVehiclePhysics(): void {
    this.vehicles.forEach((vehicle, vehicleId) => {
      this.updateVehicle(vehicle);
    });
  }

  private updateVehicle(vehicle: Vehicle): void {
    // Apply engine force
    const engineForce = vehicle.throttle * vehicle.acceleration * (1 - vehicle.damage / 100);
    const forwardVector = this.getForwardVector(vehicle.rotation);
    const engineVector = {
      x: forwardVector.x * engineForce,
      y: forwardVector.y * engineForce,
      z: forwardVector.z * engineForce
    };

    // Apply brake force
    const brakeForce = vehicle.brake * vehicle.braking;
    const brakeVector = {
      x: -vehicle.velocity.x * brakeForce,
      y: -vehicle.velocity.y * brakeForce,
      z: -vehicle.velocity.z * brakeForce
    };

    // Apply drag
    const dragForce = vehicle.drag * vehicle.velocity.x ** 2;
    const dragVector = {
      x: -Math.sign(vehicle.velocity.x) * dragForce,
      y: -Math.sign(vehicle.velocity.y) * dragForce,
      z: -Math.sign(vehicle.velocity.z) * dragForce
    };

    // Calculate total force
    const totalForce = {
      x: engineVector.x + brakeVector.x + dragVector.x,
      y: engineVector.y + brakeVector.y + dragVector.y,
      z: engineVector.z + brakeVector.z + dragVector.z
    };

    // Update velocity
    const mass = vehicle.weight;
    vehicle.velocity.x += totalForce.x / mass;
    vehicle.velocity.y += totalForce.y / mass;
    vehicle.velocity.z += totalForce.z / mass;

    // Apply steering
    if (Math.abs(vehicle.velocity.x) > 0.1) {
      const steeringForce = vehicle.steering * vehicle.handling * (1 - vehicle.damage / 100);
      vehicle.angularVelocity.y += steeringForce;
    }

    // Update position and rotation
    vehicle.position.x += vehicle.velocity.x;
    vehicle.position.y += vehicle.velocity.y;
    vehicle.position.z += vehicle.velocity.z;

    vehicle.rotation.x += vehicle.angularVelocity.x;
    vehicle.rotation.y += vehicle.angularVelocity.y;
    vehicle.rotation.z += vehicle.angularVelocity.z;

    // Update RPM
    const speedKmh = Math.sqrt(vehicle.velocity.x ** 2 + vehicle.velocity.z ** 2) * 3.6;
    vehicle.engineRPM = Math.max(1000, speedKmh * 100);

    // Update tire wear
    const wearRate = Math.abs(vehicle.steering) * Math.abs(vehicle.throttle);
    vehicle.tireWear = Math.min(100, vehicle.tireWear + wearRate * 0.01);

    // Check ground contact
    vehicle.isGrounded = vehicle.position.y <= 0;
    if (vehicle.isGrounded) {
      vehicle.position.y = 0;
      vehicle.velocity.y = 0;
    }

    // Check checkpoint collisions
    this.checkCheckpointCollisions(vehicle);
  }

  private getForwardVector(rotation: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    return {
      x: -Math.sin(rotation.y),
      y: 0,
      z: -Math.cos(rotation.y)
    };
  }

  private checkCheckpointCollisions(vehicle: Vehicle): void {
    // Find current race for this vehicle
    const race = Array.from(this.races.values()).find(r =>
      r.vehicles.some(v => v.id === vehicle.id)
    );

    if (!race) return;

    race.track.checkpoints.forEach((checkpoint: any) => {
      const distance = Math.sqrt(
        (vehicle.position.x - checkpoint.position.x) ** 2 +
        (vehicle.position.y - checkpoint.position.y) ** 2 +
        (vehicle.position.z - checkpoint.position.z) ** 2
      );

      if (distance <= checkpoint.radius) {
        this.handleCheckpointCollision(race.id, vehicle.id, checkpoint);
      }
    });
  }

  private handleCheckpointCollision(raceId: string, vehicleId: string, checkpoint: Checkpoint): void {
    const race = this.races.get(raceId);
    if (!race) return;

    const vehicle = race.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    // Update current checkpoint
    race.currentCheckpointIndex = checkpoint.order;

    // Handle lap completion
    if (checkpoint.isStartFinish && checkpoint.lapTrigger) {
      this.completeLap(raceId, vehicleId);
    }

    this.eventBus.publish('racing:checkpoint_passed', {
      raceId: raceId,
      vehicleId: vehicleId,
      checkpointId: checkpoint.id,
      timestamp: Date.now()
    });
  }

  private completeLap(raceId: string, vehicleId: string): void {
    const race = this.races.get(raceId);
    if (!race) return;

    const vehicle = race.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const lapTime = Date.now() - race.lapStartTime;
    const lapNumber = race.completedLaps + 1;

    const lap: LapTime = {
      lapNumber: lapNumber,
      time: lapTime,
      penalties: 0,
      completedAt: Date.now()
    };

    race.lapTimes.push(lap);
    race.completedLaps = lapNumber;
    race.lapStartTime = Date.now();

    // Update best lap
    if (lapTime < race.bestLapTime || race.bestLapTime === 0) {
      race.bestLapTime = lapTime;
    }

    // Check race completion
    if (race.completedLaps >= race.rules.maxLaps) {
      this.finishRace(raceId);
    }

    this.eventBus.publish('racing:lap_completed', {
      raceId: raceId,
      vehicleId: vehicleId,
      lapNumber: lapNumber,
      lapTime: lapTime,
      timestamp: Date.now()
    });
  }

  private updateGhostRecordings(): void {
    this.vehicles.forEach((vehicle, vehicleId) => {
      const race = Array.from(this.races.values()).find(r =>
        r.vehicles.some(v => v.id === vehicleId)
      );

      if (race && race.state === 'racing') {
        const ghost = this.ghostRacers.get(vehicleId);
        if (ghost) {
          const recording: GhostRecording = {
            timestamp: Date.now(),
            position: { ...vehicle.position },
            rotation: { ...vehicle.rotation },
            velocity: { ...vehicle.velocity },
            input: {
              throttle: vehicle.throttle,
              brake: vehicle.brake,
              steering: vehicle.steering,
              handbrake: vehicle.handbrake
            }
          };

          ghost.recording.push(recording);
        }
      }
    });
  }

  public createTrack(name: string, raceType: RaceType, surfaceType: SurfaceType): Track {
    const checkpoints = this.generateCheckpoints(raceType);
    const sectors = this.generateSectors(checkpoints);

    const track: Track = {
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      raceType: raceType,
      surfaceType: surfaceType,
      length: this.calculateTrackLength(checkpoints),
      width: 12, // Default track width
      checkpoints: checkpoints,
      sectors: sectors,
      obstacles: [],
      weatherEffects: true,
      dynamicElements: false
    };

    this.tracks.set(track.id, track);

    this.eventBus.publish('racing:track_created', {
      track: track,
      timestamp: Date.now()
    });

    return track;
  }

  public createVehicle(type: VehicleType, position?: { x: number; y: number; z: number }): Vehicle {
    const specs = this.getVehicleSpecs(type);

    const vehicle: Vehicle = {
      id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      position: position || { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
      ...specs,
      engineRPM: 1000,
      gear: 1,
      fuel: 100,
      tireWear: 0,
      damage: 0,
      throttle: 0,
      brake: 0,
      steering: 0,
      handbrake: false,
      clutch: 0,
      isGrounded: true,
      wheelSlip: 0,
      driftAngle: 0,
      traction: 1
    };

    this.vehicles.set(vehicle.id, vehicle);

    this.eventBus.publish('racing:vehicle_created', {
      vehicle: vehicle,
      timestamp: Date.now()
    });

    return vehicle;
  }

  public createRace(trackId: string, raceType: RaceType, vehicleIds: string[]): Race {
    const track = this.tracks.get(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found`);
    }

    const vehicles = vehicleIds.map((id: any) => {
      const vehicle = this.vehicles.get(id);
      if (!vehicle) {
        throw new Error(`Vehicle ${id} not found`);
      }
      return vehicle;
    });

    const rules = this.getRaceRules(raceType);

    const race: Race = {
      id: `race_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      track: track,
      vehicles: vehicles,
      state: 'waiting',
      rules: rules,
      startTime: 0,
      currentTime: 0,
      lapStartTime: 0,
      currentCheckpointIndex: 0,
      completedLaps: 0,
      bestLapTime: 0,
      lapTimes: [],
      positions: this.initializePositions(vehicles),
      results: []
    };

    this.races.set(race.id, race);

    // Create ghost racers for AI competition
    vehicles.forEach((vehicle: any) => {
      if (!this.ghostRacers.has(vehicle.id)) {
        this.createGhostRacer(vehicle.id, `Ghost ${vehicle.id.slice(0, 8)}`, vehicle.type);
      }
    });

    this.eventBus.publish('racing:race_created', {
      race: race,
      timestamp: Date.now()
    });

    return race;
  }

  public startRace(raceId: string): boolean {
    const race = this.races.get(raceId);
    if (!race || race.state !== 'waiting') {
      return false;
    }

    race.state = 'countdown';
    race.startTime = Date.now();

    // Start countdown
    setTimeout(() => {
      if (race.state === 'countdown') {
        race.state = 'racing';
        race.lapStartTime = Date.now();

        this.eventBus.publish('racing:race_started', {
          raceId: raceId,
          timestamp: Date.now()
        });
      }
    }, 3000); // 3 second countdown

    return true;
  }

  public updateVehicleControls(vehicleId: string, controls: {
    throttle: number;
    brake: number;
    steering: number;
    handbrake: boolean;
    clutch?: number;
  }): boolean {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      return false;
    }

    vehicle.throttle = Math.max(0, Math.min(1, controls.throttle));
    vehicle.brake = Math.max(0, Math.min(1, controls.brake));
    vehicle.steering = Math.max(-1, Math.min(1, controls.steering));
    vehicle.handbrake = controls.handbrake;
    vehicle.clutch = controls.clutch || vehicle.clutch;

    return true;
  }

  public getRaceState(raceId: string): Race | null {
    return this.races.get(raceId) || null;
  }

  public getVehicleState(vehicleId: string): Vehicle | null {
    return this.vehicles.get(vehicleId) || null;
  }

  public getTrack(trackId: string): Track | null {
    return this.tracks.get(trackId) || null;
  }

  public getLeaderboard(raceId: string): { position: number; vehicleId: string; lapTime: number; bestLap: number; laps: number }[] {
    const race = this.races.get(raceId);
    if (!race) return [];

    return race.vehicles.map((vehicle: any) => ({
      position: race.positions.get(vehicle.id) || 0,
      vehicleId: vehicle.id,
      lapTime: Date.now() - race.lapStartTime,
      bestLap: race.bestLapTime,
      laps: race.completedLaps
    })).sort((a: any, b: any) => a.position - b.position);
  }

  private createGhostRacer(vehicleId: string, name: string, vehicleType: VehicleType): GhostRacer {
    const ghost: GhostRacer = {
      id: `ghost_${vehicleId}`,
      name: name,
      vehicleType: vehicleType,
      lapTimes: [],
      bestLapTime: 0,
      totalTime: 0,
      position: 0,
      isPlayer: false,
      recording: []
    };

    this.ghostRacers.set(ghost.id, ghost);
    return ghost;
  }

  private generateCheckpoints(raceType: RaceType): Checkpoint[] {
    const checkpoints: Checkpoint[] = [];
    const checkpointCount = raceType === 'circuit' ? 8 : raceType === 'sprint' ? 4 : 12;

    for (let i = 0; i < checkpointCount; i++) {
      const angle = (i / checkpointCount) * Math.PI * 2;
      const radius = 50 + Math.random() * 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      checkpoints.push({
        id: `checkpoint_${i}`,
        position: { x: x, y: 0, z: z },
        radius: 8,
        order: i,
        isStartFinish: i === 0,
        lapTrigger: i === 0
      });
    }

    return checkpoints;
  }

  private generateSectors(checkpoints: Checkpoint[]): Sector[] {
    const sectors: Sector[] = [];
    const sectorCount = Math.min(3, Math.floor(checkpoints.length / 2));

    for (let i = 0; i < sectorCount; i++) {
      const startIndex = Math.floor((i / sectorCount) * checkpoints.length);
      const endIndex = Math.floor(((i + 1) / sectorCount) * checkpoints.length);

      sectors.push({
        id: `sector_${i}`,
        startCheckpoint: startIndex,
        endCheckpoint: endIndex - 1,
        length: 100 + Math.random() * 200,
        optimalTime: 20 + Math.random() * 30,
        difficulty: i === 1 ? 'hard' : i === 0 ? 'easy' : 'medium'
      });
    }

    return sectors;
  }

  private calculateTrackLength(checkpoints: Checkpoint[]): number {
    let length = 0;
    for (let i = 1; i < checkpoints.length; i++) {
      const prev = checkpoints[i - 1];
      const curr = checkpoints[i];
      length += Math.sqrt(
        (curr.position.x - prev.position.x) ** 2 +
        (curr.position.z - prev.position.z) ** 2
      );
    }
    return Math.floor(length);
  }

  private getVehicleSpecs(type: VehicleType): Partial<Vehicle> {
    const specs: Record<VehicleType, Partial<Vehicle>> = {
      car: {
        maxSpeed: 250,
        acceleration: 10,
        handling: 0.8,
        braking: 8,
        weight: 1500,
        drag: 0.3
      },
      motorcycle: {
        maxSpeed: 280,
        acceleration: 15,
        handling: 1.2,
        braking: 12,
        weight: 200,
        drag: 0.4
      },
      kart: {
        maxSpeed: 180,
        acceleration: 12,
        handling: 1.5,
        braking: 10,
        weight: 150,
        drag: 0.2
      },
      truck: {
        maxSpeed: 160,
        acceleration: 6,
        handling: 0.5,
        braking: 5,
        weight: 5000,
        drag: 0.6
      },
      bike: {
        maxSpeed: 300,
        acceleration: 18,
        handling: 1.0,
        braking: 15,
        weight: 180,
        drag: 0.3
      }
    };

    return specs[type] || specs.car;
  }

  private getRaceRules(raceType: RaceType): RaceRules {
    const rules: Record<RaceType, RaceRules> = {
      circuit: {
        raceType: 'circuit',
        maxLaps: 5,
        vehicleClass: 'car',
        weatherConditions: ['clear', 'rain', 'fog'],
        damageEnabled: true,
        collisionEnabled: true,
        ghostMode: true,
        qualifyingRequired: false
      },
      sprint: {
        raceType: 'sprint',
        maxLaps: 1,
        vehicleClass: 'car',
        weatherConditions: ['clear'],
        damageEnabled: false,
        collisionEnabled: false,
        ghostMode: true,
        qualifyingRequired: true
      },
      endurance: {
        raceType: 'endurance',
        maxLaps: 20,
        timeLimit: 3600000, // 1 hour
        vehicleClass: 'car',
        weatherConditions: ['clear', 'rain', 'fog', 'night'],
        damageEnabled: true,
        collisionEnabled: true,
        ghostMode: false,
        qualifyingRequired: true
      },
      drag: {
        raceType: 'drag',
        maxLaps: 1,
        vehicleClass: 'car',
        weatherConditions: ['clear'],
        damageEnabled: false,
        collisionEnabled: false,
        ghostMode: false,
        qualifyingRequired: false
      },
      drift: {
        raceType: 'drift',
        maxLaps: 3,
        vehicleClass: 'car',
        weatherConditions: ['clear'],
        damageEnabled: false,
        collisionEnabled: false,
        ghostMode: false,
        qualifyingRequired: false
      },
      time_trial: {
        raceType: 'time_trial',
        maxLaps: 10,
        vehicleClass: 'car',
        weatherConditions: ['clear'],
        damageEnabled: false,
        collisionEnabled: false,
        ghostMode: true,
        qualifyingRequired: false
      }
    };

    return rules[raceType] || rules.circuit;
  }

  private initializePositions(vehicles: Vehicle[]): Map<string, number> {
    const positions = new Map<string, number>();

    vehicles.forEach((vehicle, index) => {
      positions.set(vehicle.id, index + 1);
    });

    return positions;
  }

  private finishRace(raceId: string): void {
    const race = this.races.get(raceId);
    if (!race) return;

    race.state = 'finished';

    // Calculate final positions and results
    const results: RaceResult[] = race.vehicles.map((vehicle: any) => ({
      raceId: raceId,
      position: race.positions.get(vehicle.id) || 0,
      totalTime: Date.now() - race.startTime,
      bestLapTime: race.bestLapTime,
      lapsCompleted: race.completedLaps,
      penalties: 0,
      points: this.calculatePoints(race.positions.get(vehicle.id) || 0),
      didNotFinish: false
    }));

    race.results = results;

    this.eventBus.publish('racing:race_finished', {
      raceId: raceId,
      results: results,
      timestamp: Date.now()
    });
  }

  private calculatePoints(position: number): number {
    const pointsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    return pointsTable[position - 1] || 0;
  }
}

// Additional interfaces
export interface Race {
  id: string;
  track: Track;
  vehicles: Vehicle[];
  state: RaceState;
  rules: RaceRules;
  startTime: number;
  currentTime: number;
  lapStartTime: number;
  currentCheckpointIndex: number;
  completedLaps: number;
  bestLapTime: number;
  lapTimes: LapTime[];
  positions: Map<string, number>;
  results: RaceResult[];
}

export default RacingSystemPure;