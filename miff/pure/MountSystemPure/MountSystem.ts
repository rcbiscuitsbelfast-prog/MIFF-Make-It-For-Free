// MountSystemPure - Comprehensive Mount System for MIFF
// Implements: Attributes, Progression, Equipment, Stamina, Breeding, AI, Market

export enum MountType {
  LAND = 'land',
  WATER = 'water',
  AIR = 'air',
  MAGICAL = 'magical',
  MECHANICAL = 'mechanical'
}

export enum MountRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export enum MountAttribute {
  SPEED = 'speed',
  STAMINA = 'stamina',
  STRENGTH = 'strength',
  AGILITY = 'agility',
  INTELLIGENCE = 'intelligence',
  ENDURANCE = 'endurance'
}

export interface MountStats {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  level: number;
  experience: number;
  attributes: Record<MountAttribute, number>;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  loyalty: number; // 0-100, affects behavior
  happiness: number; // 0-100, affects performance
}

export interface MountEquipment {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  saddle?: string;
  armor?: string;
  shoes?: string;
  bridle?: string;
  accessory?: string;
}

export interface MountSkills {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  basic: string[];
  advanced: string[];
  special: string[];
}

export interface MountInstance {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: MountType;
  rarity: MountRarity;
  species: string;
  stats: MountStats;
  equipment: MountEquipment;
  skills: MountSkills;
  breeding: {
    canBreed: boolean;
    cooldown: number; // days
    offspring: string[]; // IDs of offspring
    parents: string[]; // IDs of parents
  };
  training: {
    currentActivity?: string;
    progress: number;
    completedActivities: string[];
  };
  appearance: {
    color: string;
    markings: string[];
    size: 'small' | 'medium' | 'large' | 'extra-large';
  };
}

export interface MountState {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  mounts: Record<string, MountInstance>;
  mounted: Record<string, string>; // rider -> mount
  market: {
    availableMounts: Array<{
      id: string;
      name: string;
      type: MountType;
      rarity: MountRarity;
      price: number;
      stats: MountStats;
    }>;
    prices: Record<string, number>; // mount species -> price
  };
  trainingFacilities: Record<string, {
    type: string;
    capacity: number;
    currentOccupants: number;
  }>;
}

export interface MountEvent {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'mount' | 'dismount' | 'train' | 'feed' | 'equip' | 'breed' | 'purchase' | 'sell';
  rider?: string;
  mount?: string;
  target?: string; // for breeding, training, etc.
  equipment?: MountEquipment;
  item?: string; // food, training item, etc.
}

export interface MountSystemResult {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  op: string;
  status: 'ok' | 'error' | 'invalid';
  message: string;
  state: MountState;
  rewards?: any[];
  statistics?: Record<string, any>;
}

export class MountManager {
  private state: MountState;
  private eventLog: Array<{timestamp: number, event: MountEvent, result: string}> = [];

  constructor(initialState?: Partial<MountState>) {
    this.state = {
      mounts: {},
      mounted: {},
      market: {
        availableMounts: [],
        prices: {}
      },
      trainingFacilities: {},
      ...initialState
    };
  }

  // Core mount/dismount functionality
  mount(rider: string, mountId: string): MountSystemResult {
    const mount = this.state.mounts[mountId];
    if (!mount) {
      return this.error(`Mount ${mountId} not found`);
    }

    if (this.state.mounted[rider]) {
      return this.error(`Rider ${rider} is already mounted`);
    }

    // Check mount stamina
    if (mount.stats.stamina < 10) {
      return this.error(`${mount.name} is too tired to be mounted`);
    }

    // Update mount state
    this.state.mounted[rider] = mountId;

    // Reduce stamina for mounting
    mount.stats.stamina = Math.max(0, mount.stats.stamina - 10);

    this.logEvent({type: 'mount', rider, mount: mountId});

    return this.success('Successfully mounted', {
      mountedRiders: this.state.mounted,
      mountStats: mount.stats
    });
  }

  dismount(rider: string): MountSystemResult {
    if (!this.state.mounted[rider]) {
      return this.error(`Rider ${rider} is not mounted`);
    }

    const mountId = this.state.mounted[rider];
    const mount = this.state.mounts[mountId];

    if (mount) {
      // Restore some stamina when dismounting
      mount.stats.stamina = Math.min(mount.stats.maxStamina,
        mount.stats.stamina + 5);
    }

    delete this.state.mounted[rider];
    this.logEvent({type: 'dismount', rider});

    return this.success('Successfully dismounted', {
      mountedRiders: this.state.mounted
    });
  }

  // Training system
  train(mountId: string, activity: string): MountSystemResult {
    const mount = this.state.mounts[mountId];
    if (!mount) {
      return this.error(`Mount ${mountId} not found`);
    }

    if (mount.training.currentActivity) {
      return this.error(`${mount.name} is already training`);
    }

    // Check stamina
    if (mount.stats.stamina < 20) {
      return this.error(`${mount.name} is too tired for training`);
    }

    mount.training.currentActivity = activity;
    mount.training.progress = 0;

    // Reduce stamina
    mount.stats.stamina = Math.max(0, mount.stats.stamina - 20);

    return this.success(`Started training ${mount.name} in ${activity}`);
  }

  // Equipment system
  equip(mountId: string, equipment: MountEquipment): MountSystemResult {
    const mount = this.state.mounts[mountId];
    if (!mount) {
      return this.error(`Mount ${mountId} not found`);
    }

    // Apply equipment effects
    if (equipment.saddle) {
      mount.stats.attributes.speed += 5;
      mount.stats.maxStamina += 10;
    }
    if (equipment.armor) {
      mount.stats.maxHealth += 20;
      mount.stats.attributes.strength += 3;
    }
    if (equipment.shoes) {
      mount.stats.attributes.speed += 8;
      mount.stats.attributes.endurance += 5;
    }

    mount.equipment = { ...mount.equipment, ...equipment };

    return this.success(`Equipped ${mount.name} with new gear`);
  }

  // Breeding system
  breed(mount1Id: string, mount2Id: string): MountSystemResult {
    const mount1 = this.state.mounts[mount1Id];
    const mount2 = this.state.mounts[mount2Id];

    if (!mount1 || !mount2) {
      return this.error('One or both mounts not found');
    }

    if (!mount1.breeding.canBreed || !mount2.breeding.canBreed) {
      return this.error('One or both mounts cannot breed');
    }

    if (mount1.breeding.cooldown > 0 || mount2.breeding.cooldown > 0) {
      return this.error('One or both mounts are on breeding cooldown');
    }

    // Create offspring
    const offspringId = `offspring_${Date.now()}`;
    const offspring: MountInstance = this.createOffspring(mount1, mount2);

    this.state.mounts[offspringId] = offspring;

    // Set breeding cooldown (30 days)
    mount1.breeding.cooldown = 30;
    mount2.breeding.cooldown = 30;

    // Add to parent offspring lists
    mount1.breeding.offspring.push(offspringId);
    mount2.breeding.offspring.push(offspringId);
    offspring.breeding.parents = [mount1Id, mount2Id];

    return this.success(`Successfully bred ${mount1.name} and ${mount2.name}`,
      { offspring: offspring });
  }

  // Stamina and energy management
  updateStamina(deltaTime: number): void {
    const staminaRecoveryRate = 1; // per minute

    Object.values(this.state.mounts).forEach(mount => {
      if (mount.stats.stamina < mount.stats.maxStamina) {
        mount.stats.stamina = Math.min(mount.stats.maxStamina,
          mount.stats.stamina + (staminaRecoveryRate * deltaTime));
      }

      // Update breeding cooldowns
      if (mount.breeding.cooldown > 0) {
        mount.breeding.cooldown = Math.max(0, mount.breeding.cooldown - deltaTime);
      }
    });
  }

  // Market system
  purchaseMount(buyer: string, mountType: MountType): MountSystemResult {
    const available = this.state.market.availableMounts
      .filter(m => m.type === mountType && !m.id.startsWith('sold_'));

    if (available.length === 0) {
      return this.error(`No ${mountType} mounts available for purchase`);
    }

    // Select random mount (in a real system, this would be more sophisticated)
    const selectedMount = available[Math.floor(Math.random() * available.length)];
    const mountId = `purchased_${Date.now()}`;

    // Create mount instance
    const mount: MountInstance = {
      id: mountId,
      name: `${selectedMount.name} (${buyer})`,
      type: selectedMount.type,
      rarity: selectedMount.rarity,
      species: mountType,
      stats: { ...selectedMount.stats },
      equipment: {},
      skills: { basic: [], advanced: [], special: [] },
      breeding: {
        canBreed: true,
        cooldown: 0,
        offspring: [],
        parents: []
      },
      training: {
        currentActivity: undefined,
        progress: 0,
        completedActivities: []
      },
      appearance: {
        color: 'brown',
        markings: [],
        size: 'medium'
      }
    };

    this.state.mounts[mountId] = mount;

    // Mark as sold
    selectedMount.id = `sold_${selectedMount.id}`;

    return this.success(`Purchased ${mount.name}`,
      { mount, cost: selectedMount.price });
  }

  // Private helper methods
  private createOffspring(parent1: MountInstance, parent2: MountInstance): MountInstance {
    const species = this.inheritSpecies(parent1.species, parent2.species);
    const rarity = this.inheritRarity(parent1.rarity, parent2.rarity);
    const stats = this.inheritStats(parent1.stats, parent2.stats);

    return {
      id: `offspring_${Date.now()}`,
      name: `${parent1.name} x ${parent2.name} Offspring`,
      type: parent1.type,
      rarity,
      species,
      stats,
      equipment: {},
      skills: { basic: [], advanced: [], special: [] },
      breeding: {
        canBreed: false, // Offspring cannot breed immediately
        cooldown: 0,
        offspring: [],
        parents: [parent1.id, parent2.id]
      },
      training: {
        currentActivity: undefined,
        progress: 0,
        completedActivities: []
      },
      appearance: {
        color: this.inheritColor(parent1.appearance.color, parent2.appearance.color),
        markings: [...parent1.appearance.markings, ...parent2.appearance.markings],
        size: this.inheritSize(parent1.appearance.size, parent2.appearance.size)
      }
    };
  }

  private inheritSpecies(species1: string, species2: string): string {
    // Simple inheritance - could be more complex
    return Math.random() > 0.5 ? species1 : species2;
  }

  private inheritRarity(rarity1: MountRarity, rarity2: MountRarity): MountRarity {
    const rarityValues = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
    const avgRarity = (rarityValues[rarity1] + rarityValues[rarity2]) / 2;

    // Slight chance of improvement
    if (Math.random() < 0.1) {
      const improvedRarity = Math.min(6, Math.max(1, avgRarity + 1));
      return Object.values(MountRarity)[improvedRarity - 1] as MountRarity;
    }

    const roundedRarity = Math.round(avgRarity);
    return Object.values(MountRarity)[roundedRarity - 1] as MountRarity;
  }

  private inheritStats(stats1: MountStats, stats2: MountStats): MountStats {
    return {
      level: Math.round((stats1.level + stats2.level) / 2),
      experience: 0,
      attributes: {
        speed: Math.round((stats1.attributes.speed + stats2.attributes.speed) / 2),
        stamina: Math.round((stats1.attributes.stamina + stats2.attributes.stamina) / 2),
        strength: Math.round((stats1.attributes.strength + stats2.attributes.strength) / 2),
        agility: Math.round((stats1.attributes.agility + stats2.attributes.agility) / 2),
        intelligence: Math.round((stats1.attributes.intelligence + stats2.attributes.intelligence) / 2),
        endurance: Math.round((stats1.attributes.endurance + stats2.attributes.endurance) / 2)
      },
      health: Math.round((stats1.maxHealth + stats2.maxHealth) / 2),
      maxHealth: Math.round((stats1.maxHealth + stats2.maxHealth) / 2),
      stamina: Math.round((stats1.maxStamina + stats2.maxStamina) / 2),
      maxStamina: Math.round((stats1.maxStamina + stats2.maxStamina) / 2),
      loyalty: 50, // Default for offspring
      happiness: 75 // Slightly higher for offspring
    };
  }

  private inheritColor(color1: string, color2: string): string {
    // Simple color mixing
    const colors = [color1, color2];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private inheritSize(size1: string, size2: string): 'small' | 'medium' | 'large' | 'extra-large' {
    const sizes = { 'small': 1, 'medium': 2, 'large': 3, 'extra-large': 4 };
    const avgSize = (sizes[size1 as keyof typeof sizes] + sizes[size2 as keyof typeof sizes]) / 2;

    const sizeNames: Array<'small' | 'medium' | 'large' | 'extra-large'> = ['small', 'medium', 'large', 'extra-large'];
    return sizeNames[Math.round(avgSize) - 1];
  }

  private logEvent(event: MountEvent): void {
    this.eventLog.push({
      timestamp: Date.now(),
      event,
      result: 'processed'
    });
  }

  private success(message: string, extra?: any): MountSystemResult {
    return {
      op: 'mount_system',
      status: 'ok',
      message,
      state: this.state,
      ...extra
    };
  }

  private error(message: string): MountSystemResult {
    return {
      op: 'mount_system',
      status: 'error',
      message,
      state: this.state
    };
  }

  // Public interface methods
  getState(): MountState {
    return { ...this.state };
  }

  getMount(mountId: string): MountInstance! {
    return this.state.mounts[mountId];
  }

  getMountedRider(mountId: string): string! {
    for (const [rider, mount] of Object.entries(this.state.mounted)) {
      if (mount === mountId) return rider;
    }
    return undefined;
  }

  getAvailableMounts(): MountInstance[] {
    return Object.values(this.state.mounts);
  }

  getMountStatistics(): Record<string, any> {
    const mounts = Object.values(this.state.mounts);
    const mountedCount = Object.keys(this.state.mounted).length;

    return {
      totalMounts: mounts.length,
      mountedCount,
      availableCount: mounts.length - mountedCount,
      typeDistribution: mounts.reduce((acc, mount) => {
        acc[mount.type] = (acc[mount.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageLevel: mounts.length > 0
        ? mounts.reduce((sum, mount) => sum + mount.stats.level, 0) / mounts.length
        : 0,
      averageStamina: mounts.length > 0
        ? mounts.reduce((sum, mount) => sum + mount.stats.stamina, 0) / mounts.length
        : 0
    };
  }
}

// Legacy compatibility functions
export type MountStateLegacy = { mounted: Record<string,string|undefined> };
export type MountEventLegacy = { type:'mount'|'dismount'; rider: string; mount?: string };

export function applyMountLegacy(state: MountStateLegacy, events: MountEventLegacy[]): { op:'mount'; status:'ok'; state: MountStateLegacy }{
  const m = { ...state.mounted };
  for(const e of events){
    if(e.type==='mount' && e.mount) m[e.rider] = e.mount;
    else if(e.type==='dismount') m[e.rider] = undefined;
  }
  return { op:'mount', status:'ok', state: { mounted: m } };
}