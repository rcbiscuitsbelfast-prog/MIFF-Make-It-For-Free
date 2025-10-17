/**
 * WitcherExplorerDemo - Grove 3D Exploration Demo
 * Showcases 3D world exploration with MIFF framework
 */

export interface WitcherExplorerConfig {
  worldSize?: 'small' | 'medium' | 'large';
  renderQuality?: 'low' | 'medium' | 'high';
  enableFog?: boolean;
  enableParticles?: boolean;
  enableNPCs?: boolean;
}

export interface WitcherExplorerState {
  playerPosition: { x: number; y: number; z: number };
  playerRotation: number;
  cameraMode: '3d' | 'topdown';
  exploredAreas: string[];
  discoveredLocations: number;
  currentQuest: string | null;
  isExploring: boolean;
}

export interface Location {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  type: 'grove' | 'ruin' | 'village' | 'cave';
  discovered: boolean;
}

export class WitcherExplorerDemo {
  private config: WitcherExplorerConfig;
  private state: WitcherExplorerState;
  private locations: Map<string, Location> = new Map();
  private initialized: boolean = false;

  constructor(config: WitcherExplorerConfig = {}) {
    this.config = {
      worldSize: config.worldSize || 'medium',
      renderQuality: config.renderQuality || 'medium',
      enableFog: config.enableFog !== false,
      enableParticles: config.enableParticles !== false,
      enableNPCs: config.enableNPCs !== false
    };

    this.state = {
      playerPosition: { x: 0, y: 0, z: 0 },
      playerRotation: 0,
      cameraMode: '3d',
      exploredAreas: [],
      discoveredLocations: 0,
      currentQuest: null,
      isExploring: false
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize world
    this.generateWorld();
    this.setupLocations();
    this.setupNPCs();

    this.initialized = true;
  }

  private generateWorld(): void {
    // World generation logic would go here
    // This would create the 3D grove environment
  }

  private setupLocations(): void {
    // Example locations for the grove
    const locations: Location[] = [
      { id: 'grove_center', name: 'Ancient Grove Center', position: { x: 0, y: 0, z: 0 }, type: 'grove', discovered: true },
      { id: 'mystic_ruins', name: 'Mystic Ruins', position: { x: 100, y: 0, z: 50 }, type: 'ruin', discovered: false },
      { id: 'hermit_cave', name: 'Hermit\'s Cave', position: { x: -50, y: 10, z: 80 }, type: 'cave', discovered: false },
      { id: 'hidden_village', name: 'Hidden Village', position: { x: 75, y: 0, z: -60 }, type: 'village', discovered: false }
    ];

    locations.forEach(loc => this.locations.set(loc.id, loc));
  }

  private setupNPCs(): void {
    if (this.config.enableNPCs) {
      // NPC setup would go here
    }
  }

  startExploration(): void {
    if (!this.initialized) {
      throw new Error('WitcherExplorerDemo must be initialized before starting exploration');
    }

    this.state.isExploring = true;
  }

  stopExploration(): void {
    this.state.isExploring = false;
  }

  movePlayer(deltaX: number, deltaY: number, deltaZ: number): void {
    this.state.playerPosition.x += deltaX;
    this.state.playerPosition.y += deltaY;
    this.state.playerPosition.z += deltaZ;

    this.checkLocationDiscovery();
  }

  rotatePlayer(rotation: number): void {
    this.state.playerRotation = rotation % 360;
  }

  switchCameraMode(mode: '3d' | 'topdown'): void {
    this.state.cameraMode = mode;
  }

  private checkLocationDiscovery(): void {
    const DISCOVERY_RADIUS = 20;

    this.locations.forEach((location, id) => {
      if (!location.discovered) {
        const distance = Math.sqrt(
          Math.pow(this.state.playerPosition.x - location.position.x, 2) +
          Math.pow(this.state.playerPosition.y - location.position.y, 2) +
          Math.pow(this.state.playerPosition.z - location.position.z, 2)
        );

        if (distance < DISCOVERY_RADIUS) {
          this.discoverLocation(id);
        }
      }
    });
  }

  discoverLocation(locationId: string): boolean {
    const location = this.locations.get(locationId);
    if (location && !location.discovered) {
      location.discovered = true;
      this.state.discoveredLocations++;
      this.state.exploredAreas.push(locationId);
      return true;
    }
    return false;
  }

  getLocation(locationId: string): Location | undefined {
    return this.locations.get(locationId);
  }

  getAllLocations(): Location[] {
    return Array.from(this.locations.values());
  }

  getDiscoveredLocations(): Location[] {
    return Array.from(this.locations.values()).filter(loc => loc.discovered);
  }

  startQuest(questId: string): void {
    this.state.currentQuest = questId;
  }

  completeQuest(): void {
    this.state.currentQuest = null;
  }

  getState(): WitcherExplorerState {
    return { ...this.state };
  }

  getConfig(): WitcherExplorerConfig {
    return { ...this.config };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  reset(): void {
    this.state = {
      playerPosition: { x: 0, y: 0, z: 0 },
      playerRotation: 0,
      cameraMode: '3d',
      exploredAreas: [],
      discoveredLocations: 0,
      currentQuest: null,
      isExploring: false
    };

    // Reset location discovery
    this.locations.forEach(location => {
      if (location.id !== 'grove_center') {
        location.discovered = false;
      }
    });
  }

  dispose(): void {
    this.stopExploration();
    this.locations.clear();
    this.initialized = false;
  }
}

// Export default for backward compatibility
export default WitcherExplorerDemo;
