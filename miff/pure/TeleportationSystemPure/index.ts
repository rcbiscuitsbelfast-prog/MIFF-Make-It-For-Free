/**
 * MIFF Teleportation System Pure
 *
 * Comprehensive teleportation system with portal placement, spatial anchors, and energy costs
 * Integrates with NavigationSystemPure and ZoneServerPure
 *
 * Schema Version: v1.0.0
 */

import { EventBus } from '../EventBusPure/index.js';
type RNGPure = any;

// Core interfaces and types
export interface SpatialAnchor {
  id: string;
  name: string;
  position: Vector3;
  zoneId: string;
  description: string;
  isPublic: boolean;
  isActive: boolean;
  energyCost: number;
  cooldown: number;
  lastUsed: number;
  createdBy: string;
  restrictions: string[];
  visualMarker: string;
  soundEffect: string;
  requiredPermissions: string[];
  tags: string[];
}

export interface Portal {
  id: string;
  name: string;
  sourceAnchor: SpatialAnchor;
  destinationAnchor: SpatialAnchor;
  isActive: boolean;
  isBidirectional: boolean;
  energyCost: number;
  cooldown: number;
  lastUsed: number;
  createdBy: string;
  visualEffect: string;
  soundEffect: string;
  restrictions: string[];
  requiredPermissions: string[];
  tags: string[];
  stability: number; // 0-1, affects teleport success rate
  charges: number; // -1 for unlimited
  maxCharges: number;
}

export interface TeleportationRequest {
  entityId: string;
  destinationId: string; // Anchor or portal ID
  usePortal: boolean;
  energyCost?: number;
  bypassRestrictions?: boolean;
  callback?: (result: TeleportationResult) => void;
}

export interface TeleportationResult {
  success: boolean;
  entityId: string;
  fromPosition: Vector3;
  toPosition: Vector3;
  energySpent: number;
  cooldownApplied: number;
  failureReason?: string;
  sideEffects?: TeleportationSideEffect[];
  experienceGained?: number;
}

export interface TeleportationSideEffect {
  type: 'buff' | 'debuff' | 'damage' | 'heal' | 'summon' | 'environmental';
  description: string;
  duration?: number;
  magnitude: number;
  chance: number; // 0-1 probability
}

export interface TeleportationConfig {
  defaultEnergyCost: number;
  maxPortalDistance: number;
  portalStabilityDecay: number; // Per use
  anchorCreationCost: number;
  maxAnchorsPerZone: number;
  maxPortalsPerAnchor: number;
  globalCooldown: number;
  teleportationRange: number;
  allowInterZoneTeleport: boolean;
  requireLineOfSight: boolean;
  enableSideEffects: boolean;
  enablePortalCharges: boolean;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ZoneInfo {
  id: string;
  name: string;
  bounds: {
    min: Vector3;
    max: Vector3;
  };
  isActive: boolean;
  teleportEnabled: boolean;
  restrictions: string[];
  anchorLimit: number;
}

export interface TeleportationStats {
  totalTeleports: number;
  successfulTeleports: number;
  failedTeleports: number;
  totalEnergySpent: number;
  portalsCreated: number;
  anchorsCreated: number;
  averageTeleportDistance: number;
  mostUsedDestination: string;
  failureReasons: Map<string, number>;
}

export class TeleportationSystemPure {
  private anchors: Map<string, SpatialAnchor> = new Map();
  private portals: Map<string, Portal> = new Map();
  private zones: Map<string, ZoneInfo> = new Map();
  private teleportationHistory: TeleportationResult[] = [];
  private config: TeleportationConfig;
  private stats: TeleportationStats;
  private eventBus: EventBus;
  private rng: RNGPure;

  constructor(eventBus: EventBus, rng: RNGPure) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.config = this.initializeConfig();
    this.stats = this.initializeStats();
    this.initializeDefaultZones();
    this.setupEventListeners();
  }

  /**
   * Initialize default configuration
   */
  private initializeConfig(): TeleportationConfig {
    return {
      defaultEnergyCost: 25,
      maxPortalDistance: 1000,
      portalStabilityDecay: 0.01, // 1% per use
      anchorCreationCost: 50,
      maxAnchorsPerZone: 10,
      maxPortalsPerAnchor: 5,
      globalCooldown: 5000, // 5 seconds
      teleportationRange: 50,
      allowInterZoneTeleport: true,
      requireLineOfSight: false,
      enableSideEffects: true,
      enablePortalCharges: true
    };
  }

  /**
   * Initialize default zones
   */
  private initializeDefaultZones(): void {
    // Create default zones for testing
    const zones: ZoneInfo[] = [
      {
        id: 'overworld',
        name: 'Overworld',
        bounds: {
          min: { x: -1000, y: 0, z: -1000 },
          max: { x: 1000, y: 100, z: 1000 }
        },
        isActive: true,
        teleportEnabled: true,
        restrictions: [],
        anchorLimit: 20
      },
      {
        id: 'dungeon',
        name: 'Mystic Dungeon',
        bounds: {
          min: { x: -500, y: -100, z: -500 },
          max: { x: 500, y: 0, z: 500 }
        },
        isActive: true,
        teleportEnabled: true,
        restrictions: ['requires-dungeon-key'],
        anchorLimit: 5
      },
      {
        id: 'tower',
        name: 'Wizard Tower',
        bounds: {
          min: { x: -100, y: 0, z: -100 },
          max: { x: 100, y: 200, z: 100 }
        },
        isActive: true,
        teleportEnabled: true,
        restrictions: ['requires-magic-permission'],
        anchorLimit: 10
      }
    ];

    zones.forEach(zone => {
      this.zones.set(zone.id, zone);
    });
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): TeleportationStats {
    return {
      totalTeleports: 0,
      successfulTeleports: 0,
      failedTeleports: 0,
      totalEnergySpent: 0,
      portalsCreated: 0,
      anchorsCreated: 0,
      averageTeleportDistance: 0,
      mostUsedDestination: '',
      failureReasons: new Map()
    };
  }

  /**
   * Create a spatial anchor
   */
  createSpatialAnchor(anchorData: Partial<SpatialAnchor>): SpatialAnchor | null {
    const zone = this.zones.get(anchorData.zoneId || 'overworld');
    if (!zone) {
      console.warn(`Cannot create anchor: Zone ${anchorData.zoneId} not found`);
      return null;
    }

    if (this.getAnchorsInZone(zone.id).length >= zone.anchorLimit) {
      console.warn(`Cannot create anchor: Zone ${zone.id} at capacity (${zone.anchorLimit})`);
      return null;
    }

    const anchor: SpatialAnchor = {
      id: anchorData.id || this.generateAnchorId(),
      name: anchorData.name || 'Unnamed Anchor',
      position: anchorData.position || { x: 0, y: 0, z: 0 },
      zoneId: anchorData.zoneId || 'overworld',
      description: anchorData.description || 'A spatial anchor',
      isPublic: anchorData.isPublic || false,
      isActive: anchorData.isActive !== false,
      energyCost: anchorData.energyCost || this.config.defaultEnergyCost,
      cooldown: anchorData.cooldown || this.config.globalCooldown,
      lastUsed: 0,
      createdBy: anchorData.createdBy || 'system',
      restrictions: anchorData.restrictions || [],
      visualMarker: anchorData.visualMarker || 'anchor_default',
      soundEffect: anchorData.soundEffect || 'anchor_create',
      requiredPermissions: anchorData.requiredPermissions || [],
      tags: anchorData.tags || []
    };

    this.anchors.set(anchor.id, anchor);
    this.stats.anchorsCreated++;

    this.eventBus.publish('teleportation:anchor-created', {
      anchorId: anchor.id,
      zoneId: anchor.zoneId,
      position: anchor.position
    });

    console.log(`✅ Created spatial anchor: ${anchor.name} at ${JSON.stringify(anchor.position)}`);
    return anchor;
  }

  /**
   * Create a portal between two anchors
   */
  createPortal(portalData: Partial<Portal>): Portal | null {
    const sourceAnchor = this.anchors.get(portalData.sourceAnchor?.id || '');
    const destinationAnchor = this.anchors.get(portalData.destinationAnchor?.id || '');

    if (!sourceAnchor || !destinationAnchor) {
      console.warn('Cannot create portal: Source or destination anchor not found');
      return null;
    }

    if (!sourceAnchor.isActive || !destinationAnchor.isActive) {
      console.warn('Cannot create portal: One or both anchors are inactive');
      return null;
    }

    // Check distance limit
    const distance = this.calculateDistance(sourceAnchor.position, destinationAnchor.position);
    if (distance > this.config.maxPortalDistance) {
      console.warn(`Cannot create portal: Distance ${distance} exceeds limit ${this.config.maxPortalDistance}`);
      return null;
    }

    // Check portal limit per anchor
    if (this.getPortalsForAnchor(sourceAnchor.id).length >= this.config.maxPortalsPerAnchor) {
      console.warn(`Cannot create portal: Source anchor at portal limit (${this.config.maxPortalsPerAnchor})`);
      return null;
    }

    const portal: Portal = {
      id: portalData.id || this.generatePortalId(),
      name: portalData.name || `Portal to ${destinationAnchor.name}`,
      sourceAnchor,
      destinationAnchor,
      isActive: portalData.isActive !== false,
      isBidirectional: portalData.isBidirectional !== false,
      energyCost: portalData.energyCost || this.config.defaultEnergyCost,
      cooldown: portalData.cooldown || this.config.globalCooldown,
      lastUsed: 0,
      createdBy: portalData.createdBy || 'system',
      visualEffect: portalData.visualEffect || 'portal_default',
      soundEffect: portalData.soundEffect || 'portal_create',
      restrictions: portalData.restrictions || [],
      requiredPermissions: portalData.requiredPermissions || [],
      tags: portalData.tags || [],
      stability: 1.0,
      charges: portalData.charges || (this.config.enablePortalCharges ? 10 : -1),
      maxCharges: portalData.maxCharges || 10
    };

    this.portals.set(portal.id, portal);
    this.stats.portalsCreated++;

    this.eventBus.publish('teleportation:portal-created', {
      portalId: portal.id,
      sourceAnchorId: sourceAnchor.id,
      destinationAnchorId: destinationAnchor.id
    });

    console.log(`✅ Created portal: ${portal.name} (${distance.toFixed(1)} units)`);
    return portal;
  }

  /**
   * Request teleportation
   */
  requestTeleportation(request: TeleportationRequest): TeleportationResult {
    const entityId = request.entityId;
    const destinationId = request.destinationId;

    // Find destination (anchor or portal)
    const destinationAnchor = this.anchors.get(destinationId);
    const destinationPortal = this.portals.get(destinationId);

    if (!destinationAnchor && !destinationPortal) {
      const failureReason = `Destination not found: ${destinationId}`;
      this.recordTeleportationFailure(entityId, failureReason);
      return {
        success: false,
        entityId,
        fromPosition: { x: 0, y: 0, z: 0 }, // Would get from entity system
        toPosition: { x: 0, y: 0, z: 0 },
        energySpent: 0,
        cooldownApplied: 0,
        failureReason
      };
    }

    // Determine target position and energy cost
    let targetPosition: Vector3;
    let energyCost: number;

    if (destinationPortal && request.usePortal) {
      targetPosition = destinationPortal.destinationAnchor.position;
      energyCost = destinationPortal.energyCost;
    } else if (destinationAnchor) {
      targetPosition = destinationAnchor.position;
      energyCost = destinationAnchor.energyCost;
    } else {
      const failureReason = 'Invalid destination type';
      this.recordTeleportationFailure(entityId, failureReason);
      return {
        success: false,
        entityId,
        fromPosition: { x: 0, y: 0, z: 0 },
        toPosition: { x: 0, y: 0, z: 0 },
        energySpent: 0,
        cooldownApplied: 0,
        failureReason
      };
    }

    // Check restrictions and permissions
    if (!request.bypassRestrictions) {
      if (destinationAnchor && !this.canAccessAnchor(entityId, destinationAnchor)) {
        const failureReason = 'Access denied to anchor';
        this.recordTeleportationFailure(entityId, failureReason);
        return {
          success: false,
          entityId,
          fromPosition: { x: 0, y: 0, z: 0 },
          toPosition: targetPosition,
          energySpent: 0,
          cooldownApplied: 0,
          failureReason
        };
      }

      if (destinationPortal && !this.canAccessPortal(entityId, destinationPortal)) {
        const failureReason = 'Access denied to portal';
        this.recordTeleportationFailure(entityId, failureReason);
        return {
          success: false,
          entityId,
          fromPosition: { x: 0, y: 0, z: 0 },
          toPosition: targetPosition,
          energySpent: 0,
          cooldownApplied: 0,
          failureReason
        };
      }
    }

    // Check line of sight if required
    if (this.config.requireLineOfSight) {
      const hasLineOfSight = this.checkLineOfSight(entityId, targetPosition);
      if (!hasLineOfSight) {
        const failureReason = 'Line of sight blocked';
        this.recordTeleportationFailure(entityId, failureReason);
        return {
          success: false,
          entityId,
          fromPosition: { x: 0, y: 0, z: 0 },
          toPosition: targetPosition,
          energySpent: 0,
          cooldownApplied: 0,
          failureReason
        };
      }
    }

    // Calculate teleportation success
    const successRate = this.calculateTeleportationSuccessRate(entityId, targetPosition, energyCost);
    const success = this.rng.nextFloat() < successRate;

    if (!success) {
      const failureReason = 'Teleportation failed (unstable destination)';
      this.recordTeleportationFailure(entityId, failureReason);
      return {
        success: false,
        entityId,
        fromPosition: { x: 0, y: 0, z: 0 },
        toPosition: targetPosition,
        energySpent: 0,
        cooldownApplied: this.config.globalCooldown,
        failureReason
      };
    }

    // Perform teleportation
    const fromPosition = { x: 0, y: 0, z: 0 }; // Would get from entity system
    const sideEffects = this.generateTeleportationSideEffects();

    // Update portal stability and charges if applicable
    if (destinationPortal && request.usePortal) {
      this.updatePortalUsage(destinationPortal);
    }

    // Record successful teleportation
    const result: TeleportationResult = {
      success: true,
      entityId,
      fromPosition,
      toPosition: targetPosition,
      energySpent: energyCost,
      cooldownApplied: this.config.globalCooldown,
      sideEffects,
      experienceGained: this.calculateTeleportationExperience(entityId, targetPosition, energyCost)
    };

    this.recordTeleportationSuccess(result);
    this.stats.totalEnergySpent += energyCost;

    // Emit teleportation event
    this.eventBus.publish('teleportation:teleport-success', {
      entityId,
      fromPosition,
      toPosition: targetPosition,
      energySpent: energyCost,
      portalUsed: destinationPortal !== undefined
    });

    console.log(`✅ Teleportation successful: ${entityId} → ${JSON.stringify(targetPosition)}`);
    return result;
  }

  /**
   * Get all anchors in a zone
   */
  getAnchorsInZone(zoneId: string): SpatialAnchor[] {
    return Array.from(this.anchors.values()).filter(anchor => anchor.zoneId === zoneId);
  }

  /**
   * Get all portals for an anchor
   */
  getPortalsForAnchor(anchorId: string): Portal[] {
    return Array.from(this.portals.values()).filter(portal =>
      portal.sourceAnchor.id === anchorId || portal.destinationAnchor.id === anchorId
    );
  }

  /**
   * Get anchor by ID
   */
  getAnchor(anchorId: string): SpatialAnchor | null {
    return this.anchors.get(anchorId) || null;
  }

  /**
   * Get portal by ID
   */
  getPortal(portalId: string): Portal | null {
    return this.portals.get(portalId) || null;
  }

  /**
   * Get zone information
   */
  getZone(zoneId: string): ZoneInfo | null {
    return this.zones.get(zoneId) || null;
  }

  /**
   * Get all zones
   */
  getAllZones(): ZoneInfo[] {
    return Array.from(this.zones.values());
  }

  /**
   * Get teleportation statistics
   */
  getStats(): TeleportationStats {
    return { ...this.stats };
  }

  /**
   * Update teleportation configuration
   */
  updateConfig(newConfig: Partial<TeleportationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Teleportation config updated');
  }

  /**
   * Add a zone
   */
  addZone(zone: ZoneInfo): void {
    this.zones.set(zone.id, zone);
    console.log(`✅ Added teleportation zone: ${zone.name}`);
  }

  /**
   * Remove a zone
   */
  removeZone(zoneId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    // Remove all anchors in this zone
    const anchorsToRemove = this.getAnchorsInZone(zoneId);
    anchorsToRemove.forEach(anchor => {
      this.anchors.delete(anchor.id);
    });

    this.zones.delete(zoneId);
    console.log(`🗑️ Removed zone: ${zone.name} (${anchorsToRemove.length} anchors removed)`);
    return true;
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Check if entity can access anchor
   */
  private canAccessAnchor(entityId: string, anchor: SpatialAnchor): boolean {
    // Check restrictions
    for (const restriction of anchor.restrictions) {
      if (!this.checkRestriction(entityId, restriction)) {
        return false;
      }
    }

    // Check permissions
    for (const permission of anchor.requiredPermissions) {
      if (!this.checkPermission(entityId, permission)) {
        return false;
      }
    }

    return anchor.isActive;
  }

  /**
   * Check if entity can access portal
   */
  private canAccessPortal(entityId: string, portal: Portal): boolean {
    // Check restrictions
    for (const restriction of portal.restrictions) {
      if (!this.checkRestriction(entityId, restriction)) {
        return false;
      }
    }

    // Check permissions
    for (const permission of portal.requiredPermissions) {
      if (!this.checkPermission(entityId, permission)) {
        return false;
      }
    }

    return portal.isActive && portal.charges !== 0;
  }

  /**
   * Check line of sight
   */
  private checkLineOfSight(entityId: string, targetPosition: Vector3): boolean {
    // Simplified line of sight check
    // In a real implementation, this would check for obstacles
    return true;
  }

  /**
   * Calculate teleportation success rate
   */
  private calculateTeleportationSuccessRate(entityId: string, targetPosition: Vector3, energyCost: number): number {
    let successRate = 0.95; // Base 95% success rate

    // Reduce success rate for long distances
    const distance = this.calculateDistance({ x: 0, y: 0, z: 0 }, targetPosition); // From entity position
    const distancePenalty = Math.min(0.3, distance / 1000); // Up to 30% penalty for long distances
    successRate -= distancePenalty;

    // Reduce success rate for high energy costs
    if (energyCost > 50) {
      const costPenalty = Math.min(0.2, (energyCost - 50) / 200);
      successRate -= costPenalty;
    }

    // Apply entity-specific modifiers (would integrate with character system)
    const entityModifier = 0; // Placeholder
    successRate += entityModifier;

    return Math.max(0.1, Math.min(1.0, successRate));
  }

  /**
   * Generate teleportation side effects
   */
  private generateTeleportationSideEffects(): TeleportationSideEffect[] {
    const sideEffects: TeleportationSideEffect[] = [];

    if (!this.config.enableSideEffects) return sideEffects;

    // Random chance for side effects
    if (this.rng.nextFloat() < 0.1) { // 10% chance
      const effectTypes: TeleportationSideEffect['type'][] = ['buff', 'debuff', 'damage', 'heal', 'environmental'];
      const effectType = effectTypes[Math.floor(this.rng.nextFloat() * effectTypes.length)];

      const sideEffect: TeleportationSideEffect = {
        type: effectType,
        description: this.getSideEffectDescription(effectType),
        duration: effectType === 'buff' || effectType === 'debuff' ? 30 : undefined,
        magnitude: this.rng.nextFloat() * 20 + 5,
        chance: 0.1
      };

      sideEffects.push(sideEffect);
    }

    return sideEffects;
  }

  /**
   * Update portal usage
   */
  private updatePortalUsage(portal: Portal): void {
    // Reduce stability
    portal.stability = Math.max(0, portal.stability - this.config.portalStabilityDecay);

    // Reduce charges if enabled
    if (this.config.enablePortalCharges && portal.charges > 0) {
      portal.charges = Math.max(0, portal.charges - 1);
    }

    // Deactivate if unstable
    if (portal.stability <= 0) {
      portal.isActive = false;
      console.log(`⚠️ Portal deactivated due to instability: ${portal.name}`);
    }

    portal.lastUsed = Date.now();
  }

  /**
   * Record teleportation success
   */
  private recordTeleportationSuccess(result: TeleportationResult): void {
    this.stats.totalTeleports++;
    this.stats.successfulTeleports++;
    this.teleportationHistory.push(result);

    // Update most used destination
    const destinationId = result.toPosition.x + ',' + result.toPosition.y + ',' + result.toPosition.z;
    // This would track usage statistics in a real implementation
  }

  /**
   * Record teleportation failure
   */
  private recordTeleportationFailure(entityId: string, reason: string): void {
    this.stats.totalTeleports++;
    this.stats.failedTeleports++;

    const failureCount = this.stats.failureReasons.get(reason) || 0;
    this.stats.failureReasons.set(reason, failureCount + 1);
  }

  /**
   * Check restriction
   */
  private checkRestriction(entityId: string, restriction: string): boolean {
    // This would integrate with quest/inventory systems
    // For now, just return true for basic restrictions
    return !restriction.includes('requires-') || restriction.includes('none');
  }

  /**
   * Check permission
   */
  private checkPermission(entityId: string, permission: string): boolean {
    // This would integrate with permission/achievement systems
    return permission === 'basic' || permission === 'none';
  }

  /**
   * Calculate teleportation experience
   */
  private calculateTeleportationExperience(entityId: string, targetPosition: Vector3, energySpent: number): number {
    const distance = this.calculateDistance({ x: 0, y: 0, z: 0 }, targetPosition);
    return Math.floor((distance / 100) + (energySpent / 10));
  }

  /**
   * Get side effect description
   */
  private getSideEffectDescription(type: TeleportationSideEffect['type']): string {
    const descriptions: Record<Exclude<TeleportationSideEffect['type'], 'summon'>, string> = {
      buff: 'You feel energized by the teleportation',
      debuff: 'The teleportation leaves you disoriented',
      damage: 'You suffer minor damage from the teleportation',
      heal: 'The teleportation heals some of your wounds',
      environmental: 'The destination environment affects you'
    };

    if (type === 'summon') {
      return 'A mysterious entity appears due to teleportation';
    }
    return descriptions[type as Exclude<TeleportationSideEffect['type'], 'summon'>] || 'A mysterious effect occurs';
  }

  /**
   * Generate unique anchor ID
   */
  private generateAnchorId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `anchor_${timestamp}_${random}`;
  }

  /**
   * Generate unique portal ID
   */
  private generatePortalId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `portal_${timestamp}_${random}`;
  }

  private setupEventListeners(): void {
    // Listen for zone changes or entity movements that might affect teleportation
    this.eventBus.subscribe('zone:entity-entered', (e: any) => {
      const data = e?.data as any;
      // Could trigger teleportation events or update anchor visibility
    });

    this.eventBus.subscribe('zone:entity-exited', (e: any) => {
      const data = e?.data as any;
      // Could clean up temporary anchors or update portal states
    });
  }

  private log(message: string, level: 'info' | 'debug' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[TELEPORT:${level.toUpperCase()}] ${timestamp} - ${message}`);
  }
}

// Export main class and interfaces