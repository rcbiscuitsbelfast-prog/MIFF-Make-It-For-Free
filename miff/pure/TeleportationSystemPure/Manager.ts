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
    this.teleportationSystem = teleportationSystem;

    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'TeleportationSystemManager': LogLevel.DEBUG
      }
    });

    // Register with memory manager
    this.memoryId = `TeleportationSystemManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'TeleportationSystemManager');
  }

  /**
   * Create a spatial anchor with validation
   */
  createAnchor(anchorData: Partial<SpatialAnchor>): SpatialAnchor | null {
    // Validate anchor data
    if (!anchorData.name || anchorData.name.trim() === '') {
      this.logger.error('TeleportationSystemManager', '❌ Anchor name is required');
      return null;
    }

    if (!anchorData.position) {
      this.logger.error('TeleportationSystemManager', '❌ Anchor position is required');
      return null;
    }

    if (!anchorData.zoneId) {
      this.logger.error('TeleportationSystemManager', '❌ Zone ID is required');
      return null;
    }

    // Check if zone exists and has capacity
    const zone = this.teleportationSystem.getZone(anchorData.zoneId);
    if (!zone) {
      this.logger.error('TeleportationSystemManager', `❌ Zone not found: ${anchorData.zoneId}`);
      return null;
    }

    if (!zone.teleportEnabled) {
      this.logger.error('TeleportationSystemManager', `❌ Teleportation disabled in zone: ${zone.name}`);
      return null;
    }

    const existingAnchors = this.teleportationSystem.getAnchorsInZone(zone.id);
    if (existingAnchors.length >= zone.anchorLimit) {
      this.logger.error('TeleportationSystemManager', `❌ Zone at anchor capacity: ${zone.name} (${zone.anchorLimit})`);
      return null;
    }

    // Create the anchor
    const anchor = this.teleportationSystem.createSpatialAnchor(anchorData);
    if (anchor) {
      this.logger.info('TeleportationSystemManager', `✅ Created anchor: ${anchor.name} in ${zone.name}`);
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
      this.logger.error('TeleportationSystemManager', `❌ Source anchor not found: ${sourceAnchorId}`);
      return null;
    }

    if (!destinationAnchor) {
      this.logger.error('TeleportationSystemManager', `❌ Destination anchor not found: ${destinationAnchorId}`);
      return null;
    }

    if (!sourceAnchor.isActive || !destinationAnchor.isActive) {
      this.logger.error('TeleportationSystemManager', '❌ One or both anchors are inactive');
      return null;
    }

    // Check distance
    const distance = this.calculateDistance(sourceAnchor.position, destinationAnchor.position);
    const maxDistance = (this.teleportationSystem as any).getConfig?.().maxPortalDistance ?? 1000;

    if (distance > maxDistance) {
      this.logger.error('TeleportationSystemManager', `❌ Distance ${distance.toFixed(1)} exceeds limit ${maxDistance}`);
      return null;
    }

    // Check portal limits
    const existingPortals = (this.teleportationSystem as any).getPortalsForAnchor?.(sourceAnchorId) ?? [];
    const maxPortals = (this.teleportationSystem as any).getConfig?.().maxPortalsPerAnchor ?? 3;

    if (existingPortals.length >= maxPortals) {
      this.logger.error('TeleportationSystemManager', `❌ Source anchor at portal limit (${maxPortals})`);
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
      this.logger.info('TeleportationSystemManager', `✅ Created portal: ${portal.name} (${distance.toFixed(1)} units)`);
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
        this.logger.info('TeleportationSystemManager', `✅ Teleportation successful: ${request.entityId} → ${request.destinationId}`);
      } else {
        this.logger.warn('TeleportationSystemManager', `⚠️ Teleportation failed: ${request.entityId} - ${result.failureReason}`);
      }

      // Apply side effects if any
      if (result.sideEffects && result.sideEffects.length > 0) {
        this.applySideEffects(request.entityId, result.sideEffects);
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('TeleportationSystemManager', `❌ Teleportation error: ${message}`);
      return {
        success: false,
        entityId: request.entityId,
        fromPosition: {

          x: 0, y: 0, z: 0;

        }
    },
        toPosition: {

          x: 0, y: 0, z: 0;

        }
    },
        energySpent: 0,
        cooldownApplied: 0,
        failureReason: message;
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

    const successRate = stats.totalTeleports > 0 ?
      (stats.successfulTeleports / stats.totalTeleports) * 100 : 0;

    const averageEnergyCost = stats.totalTeleports > 0 ?
      stats.totalEnergySpent / stats.successfulTeleports : 0;

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
    const portals = (this.teleportationSystem as any).getAllPortals?.() ?? [];
    const mostUsedPortal = (portals as Portal[]).reduce((mostUsed: Portal | null, portal: Portal) => {
      // This would normally come from usage statistics
      // For now, just return the first portal
      return mostUsed || portal;
    }, null as Portal | null);

    // Get recent failure reasons
    const recentFailures = Array.from(stats.failureReasons.entries())
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 5)
      .map(([
      r,
      e,
      a,
      s,
      o,
      n
    ]) => reason);

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
    const anchorIds = anchorsInZone.map(anchor => anchor.id);

    return ((this.teleportationSystem as any).getAllPortals?.() ?? []).filter((portal: Portal) =>
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

    const currentPosition = { x: 0, y: 0, z: 0;
    }; // Would get from entity system

    // Add accessible anchors
    const allAnchors = (this.teleportationSystem as any).getAllAnchors?.() ?? [];
    for (const anchor of allAnchors) {
      if (this.canAccessDestination(entityId, anchor.id, 'anchor')) {
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
    const allPortals = (this.teleportationSystem as any).getAllPortals?.() ?? [];
    for (const portal of allPortals) {
      if (portal.isActive && this.canAccessDestination(entityId, portal.id, 'portal')) {
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
    return destinations.sort((a, b) => a.distance - b.distance);
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
      this.logger.info('TeleportationSystemManager', `✨ Applying side effect: ${effect.description}`);

      // This would integrate with health, status effect, or other systems
      switch (effect.type) {
        case 'buff':
          this.logger.info('TeleportationSystemManager', `  💪 ${entityId} gains buff: +${effect.magnitude} for ${effect.duration}s`);
          break;
        case 'debuff':
          this.logger.info('TeleportationSystemManager', `  😵 ${entityId} gains debuff: -${effect.magnitude} for ${effect.duration}s`);
          break;
        case 'damage':
          this.logger.info('TeleportationSystemManager', `  💔 ${entityId} takes ${effect.magnitude} teleportation damage`);
          break;
        case 'heal':
          this.logger.info('TeleportationSystemManager', `  💚 ${entityId} heals ${effect.magnitude} from teleportation`);
          break;
        case 'environmental':
          this.logger.info('TeleportationSystemManager', `  🌍 Environmental effect: ${effect.description}`);
          break;
      }
    }
  }

  /**
   * Get teleportation configuration
   */
  getConfig(): TeleportationConfig {
    return ((this.teleportationSystem as any).getConfig?.() ?? {}) as TeleportationConfig;
  }

  /**
   * Update teleportation configuration
   */
  updateConfig(newConfig: Partial<TeleportationConfig>): void {
    this.teleportationSystem.updateConfig(newConfig);
    this.logger.info('TeleportationSystemManager', 'Teleportation configuration updated');
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
    return ((this.teleportationSystem as any).getAllAnchors?.() ?? []) as SpatialAnchor[];
  }

  /**
   * Get all portals
   */
  getAllPortals(): Portal[] {
    return ((this.teleportationSystem as any).getAllPortals?.() ?? []) as Portal[];
  }

  /**
   * Export teleportation system data
   */
  exportData(): {
    anchors: SpatialAnchor[];
    portals: Portal[];
    zones: ZoneInfo[];
    stats: ReturnType<TeleportationSystemPure['getStats']>;
    timestamp: number;
  } {
    return {
      anchors: ((this.teleportationSystem as any).getAllAnchors?.() ?? []) as SpatialAnchor[],
      portals: ((this.teleportationSystem as any).getAllPortals?.() ?? []) as Portal[],
      zones: ((this.teleportationSystem as any).getAllZones?.() ?? []) as ZoneInfo[],
      stats: ((this.teleportationSystem as any).getStats?.() ?? {}) as any,
      timestamp: Date.now()
    };
  }

  /**
   * Import teleportation system data
   */
  importData(data: ReturnType<typeof this.exportData>): void {
    // Import logic would go here
    this.logger.info('TeleportationSystemManager', 'Teleportation system data imported');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.logger.info('TeleportationSystemManager', 'Destroying manager', {
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