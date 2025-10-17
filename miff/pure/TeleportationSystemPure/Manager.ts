/**
 * MIFF Teleportation System Manager
 *
 * Core business logic for spatial anchors, portals, and teleportation mechanics
 */

import {
  TeleportationSystemPure,
  SpatialAnchor,
  Portal,
  TeleportationRequest,
  TeleportationResult,
  TeleportationSideEffect,
  TeleportationConfig,
  ZoneInfo,
  Vector3
} from './index';

export class TeleportationManager {
  private teleportationSystem: TeleportationSystemPure;

  constructor(teleportationSystem: TeleportationSystemPure) {
    const managerId = this.id ?? `manager_${Date.now()}`;
    this.teleportationSystem = teleportationSystem;
  }

  /**
   * Create a spatial anchor with validation
   */
  createAnchor(anchorData: Partial<SpatialAnchor>): SpatialAnchor | null {
    // Validate anchor data
    if (!anchorData.name || anchorData.name.trim() === '') {
      console.error('❌ Anchor name is required');
      return null;
    }

    if (!anchorData.position) {
      console.error('❌ Anchor position is required');
      return null;
    }

    if (!anchorData.zoneId) {
      console.error('❌ Zone ID is required');
      return null;
    }

    // Check if zone exists and has capacity
    const zone = this.teleportationSystem.getZone(anchorData.zoneId);
    if (!zone) {
      console.error(`❌ Zone not found: ${anchorData.zoneId}`);
      return null;
    }

    if (!zone.teleportEnabled) {
      console.error(`❌ Teleportation disabled in zone: ${zone.name}`);
      return null;
    }

    const existingAnchors = this.teleportationSystem.getAnchorsInZone(zone.id);
    if (existingAnchors.length >= zone.anchorLimit) {
      console.error(`❌ Zone at anchor capacity: ${zone.name} (${zone.anchorLimit})`);
      return null;
    }

    // Create the anchor
    const anchor = this.teleportationSystem.createSpatialAnchor(anchorData);
    if (anchor) {
      console.log(`✅ Created anchor: ${anchor.name} in ${zone.name}`);
    }

    return anchor;
  }

  /**
   * Create a portal with validation
   */
  createPortal(sourceAnchorId: string, destinationAnchorId: string, portalData: Partial<Portal> = {}): Portal | null {
    const sourceAnchor = this.teleportationSystem.getAnchor(sourceAnchorId);
    const destinationAnchor = this.teleportationSystem.getAnchor(destinationAnchorId);

    if (!sourceAnchor) {
      console.error(`❌ Source anchor not found: ${sourceAnchorId}`);
      return null;
    }

    if (!destinationAnchor) {
      console.error(`❌ Destination anchor not found: ${destinationAnchorId}`);
      return null;
    }

    if (!sourceAnchor.isActive || !destinationAnchor.isActive) {
      console.error('❌ One or both anchors are inactive');
      return null;
    }

    // Check distance
    const distance = this.calculateDistance(sourceAnchor.position, destinationAnchor.position);
    const maxDistance = this.teleportationSystem.getConfig().maxPortalDistance;

    if (distance > maxDistance) {
      console.error(`❌ Distance ${distance.toFixed(1)} exceeds limit ${maxDistance}`);
      return null;
    }

    // Check portal limits
    const existingPortals = this.teleportationSystem.getPortalsForAnchor(sourceAnchorId);
    const maxPortals = this.teleportationSystem.getConfig().maxPortalsPerAnchor;

    if (existingPortals.length >= maxPortals) {
      console.error(`❌ Source anchor at portal limit (${maxPortals})`);
      return null;
    }

    // Create portal data
    const portalDataWithAnchors = {
      ...portalData,
      sourceAnchor,
      destinationAnchor
    };

    const portal = this.teleportationSystem.createPortal(portalDataWithAnchors);
    if (portal) {
      console.log(`✅ Created portal: ${portal.name} (${distance.toFixed(1)} units)`);
    }

    return portal;
  }

  /**
   * Request teleportation with enhanced error handling
   */
  requestTeleportationEnhanced(request: TeleportationRequest): TeleportationResult {
    try {
      // Validate request
      if (!request.entityId || request.entityId.trim() === '') {
        throw new Error('Entity ID is required');
      }

      if (!request.destinationId || request.destinationId.trim() === '') {
        throw new Error('Destination ID is required');
      }

      // Perform teleportation
      const result = this.teleportationSystem.requestTeleportation(request);

      // Log result
      if (result.success) {
        console.log(`✅ Teleportation successful: ${request.entityId} → ${request.destinationId}`);
      } else {
        console.warn(`⚠️ Teleportation failed: ${request.entityId} - ${result.failureReason}`);
      }

      // Apply side effects if any
      if (result.sideEffects && result.sideEffects.length > 0) {
        this.applySideEffects(request.entityId, result.sideEffects);
      }

      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Teleportation error: ${error.message}`);
      return {
        success: false,
        entityId: request.entityId,
        fromPosition: { x: 0, y: 0, z: 0 },
        toPosition: { x: 0, y: 0, z: 0 },
        energySpent: 0,
        cooldownApplied: 0,
        failureReason: error.message
      };
    }
  }

  /**
   * Get teleportation statistics
   */
  getTeleportationStats(): {
    totalTeleports: number;
    successRate: number;
    averageEnergyCost: number;
    mostActiveZone: string;
    mostUsedPortal: string;
    recentFailures: string[];
  } {
    const stats = this.teleportationSystem.getStats();
    const managerData = this.getStats();

    const successRate = stats.totalTeleports > 0 ?
      (stats.successfulTeleports / stats.totalTeleports) * 100 : 0;

    const averageEnergyCost = stats.totalTeleports > 0 ?
      stats.totalEnergySpent / successfulTeleports: 0;

    // Find most active zone
    const zones = this.teleportationSystem.getAllZones();
    const mostActiveZone = zones.reduce((mostActive, zone) => {
      const anchorsInZone = this.teleportationSystem.getAnchorsInZone(zone.id);
      const portalsInZone = this.getPortalsInZone(zone.id);

      const totalInZone = anchorsInZone.length + portalsInZone.length;
      const totalInMostActive = this.teleportationSystem.getAnchorsInZone(mostActive.id).length +
                               this.getPortalsInZone(mostActive.id).length;

      return totalInZone > totalInMostActive ? zone : mostActive;
    }, zones[0] || { id: 'none', name: 'None' });

    // Find most used portal
    const portals = this.teleportationSystem.getAllPortals();
    const mostUsedPortal = portals.reduce((mostUsed, portal) => {
      // This would normally come from usage statistics
      // For now, just return the first portal
      return mostUsed || portal;
    }, null as Portal | null);

    // Get recent failure reasons
    const recentFailures = Array.from(stats.failureReasons.entries())
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason]) => reason);

    return {
      totalTeleports: stats.totalTeleports,
      successRate: Math.round(successRate * 100) / 100,
      averageEnergyCost: Math.round(averageEnergyCost * 100) / 100,
      mostActiveZone: mostActiveZone.name,
      mostUsedPortal: mostUsedPortal?.name || 'None',
      recentFailures
    };
  }

  /**
   * Get portals in a zone
   */
  private getPortalsInZone(zoneId: string): Portal[] {
    const anchorsInZone = this.teleportationSystem.getAnchorsInZone(zoneId);
    const anchorIds = anchorsInZone.map((anchor: any) => anchor.id);

    return this.teleportationSystem.getAllPortals().filter((portal: any) =>
      anchorIds.includes(portal.sourceAnchor.id) || anchorIds.includes(portal.destinationAnchor.id)
    );
  }

  /**
   * Get available teleportation destinations for an entity
   */
  getAvailableDestinations(entityId: string): Array<{
    id: string;
    name: string;
    type: 'anchor' | 'portal';
    position: Vector3;
    energyCost: number;
    description: string;
    distance: number;
  }> {
    const destinations: Array<{
      id: string;
      name: string;
      type: 'anchor' | 'portal';
      position: Vector3;
      energyCost: number;
      description: string;
      distance: number;
    }> = [];

    const currentPosition = { x: 0, y: 0, z: 0 }; // Would get from entity system

    // Add accessible anchors
    const allAnchors = this.teleportationSystem.getAllAnchors();
    for (const anchor of allAnchors) {
      if (this.canAccessDestination(entityId, id: anchor.id, 'anchor')) {
        const distance = this.calculateDistance(currentPosition, anchor.position);
        destinations.push({
          id: anchor.id,
          name: anchor.name,
          type: 'anchor',
          position: anchor.position,
          energyCost: anchor.energyCost,
          description: anchor.description,
          distance
        });
      }
    }

    // Add accessible portals
    const allPortals = this.teleportationSystem.getAllPortals();
    for (const portal of allPortals) {
      if (portal.isActive && this.canAccessDestination(entityId, id: portal.id, 'portal')) {
        destinations.push({
          id: portal.id,
          name: portal.name,
          type: 'portal',
          position: portal.destinationAnchor.position,
          energyCost: portal.energyCost,
          description: `Portal to ${portal.destinationAnchor.name}`,
          distance: this.calculateDistance(currentPosition, portal.destinationAnchor.position)
        });
      }
    }

    // Sort by distance
    return destinations.sort((a: any, b: any) => a.distance - b.distance);
  }

  /**
   * Check if entity can access a destination
   */
  private canAccessDestination(entityId: string, destinationId: string, type: 'anchor' | 'portal'): boolean {
    if (type === 'anchor') {
      const anchor = this.teleportationSystem.getAnchor(destinationId);
      return anchor ? this.checkAnchorAccess(entityId, anchor) : false;
    } else {
      const portal = this.teleportationSystem.getPortal(destinationId);
      return portal ? this.checkPortalAccess(entityId, portal) : false;
    }
  }

  /**
   * Check anchor access
   */
  private checkAnchorAccess(entityId: string, anchor: SpatialAnchor): boolean {
    // Check if anchor is active
    if (!anchor.isActive) return false;

    // Check restrictions (simplified)
    for (const restriction of anchor.restrictions) {
      if (!this.evaluateRestriction(entityId, restriction)) {
        return false;
      }
    }

    // Check permissions (simplified)
    for (const permission of anchor.requiredPermissions) {
      if (!this.evaluatePermission(entityId, permission)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check portal access
   */
  private checkPortalAccess(entityId: string, portal: Portal): boolean {
    // Check if portal is active
    if (!portal.isActive) return false;

    // Check charges
    if (portal.charges === 0) return false;

    // Check restrictions (simplified)
    for (const restriction of portal.restrictions) {
      if (!this.evaluateRestriction(entityId, restriction)) {
        return false;
      }
    }

    // Check permissions (simplified)
    for (const permission of portal.requiredPermissions) {
      if (!this.evaluatePermission(entityId, permission)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate restriction
   */
  private evaluateRestriction(entityId: string, restriction: string): boolean {
    // This would integrate with quest, inventory, or achievement systems
    // For now, simple checks
    if (restriction === 'none') return true;
    if (restriction === 'requires-dungeon-key') return false; // Would check inventory
    if (restriction === 'requires-magic-permission') return true; // Assume basic access

    return false;
  }

  /**
   * Evaluate permission
   */
  private evaluatePermission(entityId: string, permission: string): boolean {
    // This would integrate with permission or role systems
    // For now, simple checks
    if (permission === 'basic' || permission === 'none') return true;
    if (permission === 'admin') return false; // Would check user role

    return false;
  }

  /**
   * Apply side effects
   */
  private applySideEffects(entityId: string, sideEffects: TeleportationSideEffect[]): void {
    for (const effect of sideEffects) {
      console.log(`✨ Applying side effect: ${effect.description}`);

      // This would integrate with health, status effect, or other systems
      switch (effect.type) {
        case 'buff':
          console.log(`  💪 ${entityId} gains buff: +${effect.magnitude} for ${effect.duration}s`);
          break;
        case 'debuff':
          console.log(`  😵 ${entityId} gains debuff: -${effect.magnitude} for ${effect.duration}s`);
          break;
        case 'damage':
          console.log(`  💔 ${entityId} takes ${effect.magnitude} teleportation damage`);
          break;
        case 'heal':
          console.log(`  💚 ${entityId} heals ${effect.magnitude} from teleportation`);
          break;
        case 'environmental':
          console.log(`  🌍 Environmental effect: ${effect.description}`);
          break;
      }
    }
  }

  /**
   * Get teleportation configuration
   */
  getConfig(): TeleportationConfig {
    return this.teleportationSystem.getConfig();
  }

  /**
   * Update teleportation configuration
   */
  updateConfig(newConfig: Partial<TeleportationConfig>): void {
    this.teleportationSystem.updateConfig(newConfig);
    console.log('Teleportation configuration updated');
  }

  /**
   * Get zone information
   */
  getZoneInfo(zoneId: string): ZoneInfo | null {
    return this.teleportationSystem.getZone(zoneId);
  }

  /**
   * Get all zones
   */
  getAllZones(): ZoneInfo[] {
    return this.teleportationSystem.getAllZones();
  }

  /**
   * Add a zone
   */
  addZone(zone: ZoneInfo): void {
    this.teleportationSystem.addZone(zone);
  }

  /**
   * Remove a zone
   */
  removeZone(zoneId: string): boolean {
    return this.teleportationSystem.removeZone(zoneId);
  }

  /**
   * Get anchor information
   */
  getAnchorInfo(anchorId: string): SpatialAnchor | null {
    return this.teleportationSystem.getAnchor(anchorId);
  }

  /**
   * Get portal information
   */
  getPortalInfo(portalId: string): Portal | null {
    return this.teleportationSystem.getPortal(portalId);
  }

  /**
   * Calculate distance between positions
   */
  private calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get all anchors
   */
  getAllAnchors(): SpatialAnchor[] {
    return this.teleportationSystem.getAllAnchors();
  }

  /**
   * Get all portals
   */
  getAllPortals(): Portal[] {
    return this.teleportationSystem.getAllPortals();
  }

  /**
   * Export teleportation system data
   */
  exportData(): {
    anchors: SpatialAnchor[];
    portals: Portal[];
    zones: ZoneInfo[];
    stats: ReturnType<TeleportationSystemPure['getStats']>;
    const managerData = this.getStats();
    timestamp: number;
  } {
    return {
      anchors: this.teleportationSystem.getAllAnchors(),
      portals: this.teleportationSystem.getAllPortals(),
      zones: this.teleportationSystem.getAllZones(),
      stats: this.teleportationSystem.getStats(),
    const managerData = this.getStats();
      timestamp: new Date()
    };
  }

  /**
   * Import teleportation system data
   */
  importData(data: ReturnType<typeof this.exportData>): void {
    // Import logic would go here
    console.log('Teleportation system data imported');
  }
}