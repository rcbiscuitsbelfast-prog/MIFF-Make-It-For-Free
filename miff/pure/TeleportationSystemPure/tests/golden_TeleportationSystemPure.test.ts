/**
 * MIFF TeleportationSystemPure Golden Tests
 *
 * Comprehensive test suite for the TeleportationSystemPure module
 * Tests spatial anchors, portals, teleportation mechanics, and integration
 */

import { TeleportationSystemPure, SpatialAnchor, Portal, ZoneInfo } from '../index';
import { EventBus } from '../../EventsPure/index';
import { RNGPure } from '../../RNGPure/index';

// Mock classes for testing
class MockEventBus {
  private events: Map<string, Function[]> = new Map();

  emit(event: string, data: any) {
    const handlers = this.events.get(event: any) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, handler: Function) {
    if (!this.events.has(event: any)) {
      this.events.set(event, []);
    }
    this.events.get(event: any)!.push(handler);
  }
}

class MockRNG {
  private values: number[] = [];
  private index = 0;

  setNextFloat(value: number) {
    this.values.push(value);
  }

  nextFloat(): number {
    if (this.values.length > 0) {
      return this.values[this.index++] || 0.5;
    }
    return Math.random();
  }
}

describe('TeleportationSystemPure Golden Tests', () => {
  let teleportationSystem: TeleportationSystemPure;
  let eventBus: MockEventBus;
  let rng: MockRNG;

  const TEST_ZONE: ZoneInfo = {
    id: 'test-zone',
    name: 'Test Zone',
    bounds: {
      min: { x: -100, y: 0, z: -100 },
      max: { x: 100, y: 50, z: 100 }
    },
    isActive: true,
    teleportEnabled: true,
    restrictions: [],
    anchorLimit: 5
  };

  const TEST_ANCHOR_1: Partial<SpatialAnchor> = {
    id: 'anchor-1',
    name: 'Test Anchor 1',
    position: { x: 0, y: 0, z: 0 },
    zoneId: 'test-zone',
    description: 'First test anchor',
    isPublic: true,
    energyCost: 25
  };

  const TEST_ANCHOR_2: Partial<SpatialAnchor> = {
    id: 'anchor-2',
    name: 'Test Anchor 2',
    position: { x: 50, y: 10, z: 50 },
    zoneId: 'test-zone',
    description: 'Second test anchor',
    isPublic: false,
    energyCost: 30,
    requiredPermissions: ['magic-user']
  };

  beforeEach(() => {
    eventBus = new MockEventBus();
    rng = new MockRNG();

    teleportationSystem = new TeleportationSystemPure(eventBus as any, rng as any);

    // Add test zone
    teleportationSystem.addZone(TEST_ZONE);

    // Reset RNG mock
    rng = new MockRNG();
    (teleportationSystem as any).rng = rng;
  });

  describe('Core System Initialization', () => {
    test('should initialize with default configuration', () => {
      const config = teleportationSystem.getConfig();

      expect(config.defaultEnergyCost).toBe(25);
      expect(config.maxPortalDistance).toBe(1000);
      expect(config.portalStabilityDecay).toBe(0.01);
      expect(config.maxAnchorsPerZone).toBe(10);
      expect(config.maxPortalsPerAnchor).toBe(5);
      expect(config.globalCooldown).toBe(5000);
    });

    test('should initialize with default zones', () => {
      const zones = teleportationSystem.getAllZones();

      expect(zones.length).toBeGreaterThan(0);

      // Check for default zones
      const overworld = zones.find(z => z.id === 'overworld');
      const dungeon = zones.find(z => z.id === 'dungeon');
      const tower = zones.find(z => z.id === 'tower');

      expect(overworld).toBeDefined();
      expect(dungeon).toBeDefined();
      expect(tower).toBeDefined();

      if (overworld) {
        expect(overworld.teleportEnabled).toBe(true);
        expect(overworld.anchorLimit).toBe(20);
      }
    });

    test('should initialize with empty statistics', () => {
      const stats = teleportationSystem.getStats();

      expect(stats.totalTeleports).toBe(0);
      expect(stats.successfulTeleports).toBe(0);
      expect(stats.failedTeleports).toBe(0);
      expect(stats.totalEnergySpent).toBe(0);
      expect(stats.portalsCreated).toBe(0);
      expect(stats.anchorsCreated).toBe(0);
    });
  });

  describe('Zone Management', () => {
    test('should add and retrieve zones', () => {
      const newZone: ZoneInfo = {
        id: 'custom-zone',
        name: 'Custom Zone',
        bounds: {
          min: { x: -200, y: 0, z: -200 },
          max: { x: 200, y: 100, z: 200 }
        },
        isActive: true,
        teleportEnabled: true,
        restrictions: ['custom-restriction'],
        anchorLimit: 3
      };

      teleportationSystem.addZone(newZone);

      const retrievedZone = teleportationSystem.getZone('custom-zone');
      expect(retrievedZone).toEqual(newZone);
    });

    test('should remove zones and their anchors', () => {
      // Create anchors in the zone
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      const anchorsBefore = teleportationSystem.getAnchorsInZone('test-zone');
      expect(anchorsBefore.length).toBe(2);

      // Remove the zone
      const removed = teleportationSystem.removeZone('test-zone');
      expect(removed).toBe(true);

      // Check that anchors are also removed
      const anchorsAfter = teleportationSystem.getAnchorsInZone('test-zone');
      expect(anchorsAfter.length).toBe(0);

      const zoneAfter = teleportationSystem.getZone('test-zone');
      expect(zoneAfter).toBeNull();
    });

    test('should not remove non-existent zones', () => {
      const removed = teleportationSystem.removeZone('non-existent-zone');
      expect(removed).toBe(false);
    });

    test('should enforce anchor limits per zone', () => {
      const limitedZone: ZoneInfo = {
        id: 'limited-zone',
        name: 'Limited Zone',
        bounds: {
          min: { x: -50, y: 0, z: -50 },
          max: { x: 50, y: 25, z: 50 }
        },
        isActive: true,
        teleportEnabled: true,
        restrictions: [],
        anchorLimit: 2
      };

      teleportationSystem.addZone(limitedZone);

      // Create first anchor (should succeed)
      const anchor1 = teleportationSystem.createSpatialAnchor({
        ...TEST_ANCHOR_1,
        zoneId: 'limited-zone'
      });
      expect(anchor1).toBeDefined();

      // Create second anchor (should succeed)
      const anchor2 = teleportationSystem.createSpatialAnchor({
        ...TEST_ANCHOR_2,
        zoneId: 'limited-zone'
      });
      expect(anchor2).toBeDefined();

      // Try to create third anchor (should fail)
      const anchor3 = teleportationSystem.createSpatialAnchor({
        id: 'anchor-3',
        name: 'Third Anchor',
        position: { x: 25, y: 5, z: 25 },
        zoneId: 'limited-zone',
        description: 'Should fail due to limit'
      });
      expect(anchor3).toBeNull();
    });
  });

  describe('Spatial Anchor Management', () => {
    test('should create spatial anchors', () => {
      const anchor = teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);

      expect(anchor).toBeDefined();
      expect(anchor?.id).toBe('anchor-1');
      expect(anchor?.name).toBe('Test Anchor 1');
      expect(anchor?.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(anchor?.zoneId).toBe('test-zone');
      expect(anchor?.isActive).toBe(true);
      expect(anchor?.energyCost).toBe(25);
    });

    test('should retrieve anchors by ID', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      const retrievedAnchor1 = teleportationSystem.getAnchor('anchor-1');
      const retrievedAnchor2 = teleportationSystem.getAnchor('anchor-2');
      const nonExistentAnchor = teleportationSystem.getAnchor('non-existent');

      expect(retrievedAnchor1).toEqual(expect.objectContaining(TEST_ANCHOR_1));
      expect(retrievedAnchor2).toEqual(expect.objectContaining(TEST_ANCHOR_2));
      expect(nonExistentAnchor).toBeNull();
    });

    test('should get all anchors in a zone', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      const anchorsInTestZone = teleportationSystem.getAnchorsInZone('test-zone');
      const anchorsInOtherZone = teleportationSystem.getAnchorsInZone('non-existent-zone');

      expect(anchorsInTestZone.length).toBe(2);
      expect(anchorsInOtherZone.length).toBe(0);
    });

    test('should validate anchor restrictions', () => {
      const restrictedAnchor: Partial<SpatialAnchor> = {
        id: 'restricted-anchor',
        name: 'Restricted Anchor',
        position: { x: 10, y: 5, z: 10 },
        zoneId: 'test-zone',
        description: 'An anchor with restrictions',
        isPublic: false,
        energyCost: 40,
        requiredPermissions: ['admin'],
        restrictions: ['requires-key']
      };

      const anchor = teleportationSystem.createSpatialAnchor(restrictedAnchor);
      expect(anchor).toBeDefined();

      if (anchor) {
        expect(anchor.requiredPermissions).toContain('admin');
        expect(anchor.restrictions).toContain('requires-key');
      }
    });

    test('should handle anchor creation failures', () => {
      // Try to create anchor in non-existent zone
      const invalidAnchor: Partial<SpatialAnchor> = {
        id: 'invalid-anchor',
        name: 'Invalid Anchor',
        position: { x: 0, y: 0, z: 0 },
        zoneId: 'non-existent-zone',
        description: 'This should fail'
      };

      const result = teleportationSystem.createSpatialAnchor(invalidAnchor);
      expect(result).toBeNull();
    });
  });

  describe('Portal Management', () => {
    test('should create portals between anchors', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      const portal = teleportationSystem.createPortal('anchor-1', 'anchor-2', {
        name: 'Test Portal',
        energyCost: 35
      });

      expect(portal).toBeDefined();
      expect(portal?.name).toBe('Test Portal');
      expect(portal?.sourceAnchor.id).toBe('anchor-1');
      expect(portal?.destinationAnchor.id).toBe('anchor-2');
      expect(portal?.energyCost).toBe(35);
      expect(portal?.isActive).toBe(true);
    });

    test('should retrieve portals by ID', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      teleportationSystem.createPortal('anchor-1', 'anchor-2', {
        id: 'test-portal',
        name: 'Test Portal'
      });

      const retrievedPortal = teleportationSystem.getPortal('test-portal');
      const nonExistentPortal = teleportationSystem.getPortal('non-existent');

      expect(retrievedPortal).toBeDefined();
      expect(retrievedPortal?.id).toBe('test-portal');
      expect(nonExistentPortal).toBeNull();
    });

    test('should get portals for an anchor', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      teleportationSystem.createPortal('anchor-1', 'anchor-2', {
        name: 'Portal 1'
      });

      teleportationSystem.createPortal('anchor-2', 'anchor-1', {
        name: 'Portal 2'
      });

      const portalsForAnchor1 = teleportationSystem.getPortalsForAnchor('anchor-1');
      const portalsForAnchor2 = teleportationSystem.getPortalsForAnchor('anchor-2');

      expect(portalsForAnchor1.length).toBe(2);
      expect(portalsForAnchor2.length).toBe(2);
    });

    test('should enforce portal limits per anchor', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      // Create maximum portals for anchor 1
      for (let i = 0; i < 5; i++) {
        const portal = teleportationSystem.createPortal('anchor-1', 'anchor-2', {
          id: `portal-${i}`,
          name: `Portal ${i}`
        });
        expect(portal).toBeDefined();
      }

      // Try to create one more (should fail)
      const extraPortal = teleportationSystem.createPortal('anchor-1', 'anchor-2', {
        id: 'extra-portal',
        name: 'Extra Portal'
      });
      expect(extraPortal).toBeNull();
    });

    test('should validate portal distance limits', () => {
      const farAnchor: Partial<SpatialAnchor> = {
        id: 'far-anchor',
        name: 'Far Anchor',
        position: { x: 2000, y: 0, z: 2000 }, // Very far away
        zoneId: 'test-zone',
        description: 'A very distant anchor'
      };

      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(farAnchor);

      const portal = teleportationSystem.createPortal('anchor-1', 'far-anchor', {
        name: 'Long Distance Portal'
      });

      // Should fail due to distance limit (default 1000)
      expect(portal).toBeNull();
    });

    test('should handle portal creation failures gracefully', () => {
      // Try to create portal with non-existent anchors
      const portal = teleportationSystem.createPortal('non-existent-1', 'non-existent-2', {
        name: 'Invalid Portal'
      });

      expect(portal).toBeNull();
    });
  });

  describe('Teleportation Mechanics', () => {
    test('should handle successful teleportation', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      const result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: 'anchor-2',
        usePortal: false
      });

      expect(result.success).toBe(true);
      expect(result.entityId).toBe('test-player');
      expect(result.energySpent).toBe(30); // anchor-2 energy cost
      expect(result.cooldownApplied).toBe(5000); // global cooldown
    });

    test('should handle failed teleportation due to restrictions', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2); // Has 'magic-user' permission requirement

      const result = teleportationSystem.requestTeleportation({
        entityId: 'basic-player', // No special permissions
        destinationId: 'anchor-2',
        usePortal: false
      });

      expect(result.success).toBe(false);
      expect(result.failureReason).toContain('Access denied');
    });

    test('should handle portal teleportation', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      teleportationSystem.createPortal('anchor-1', 'anchor-2', {
        id: 'test-portal',
        name: 'Test Portal',
        energyCost: 40
      });

      const result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: 'test-portal',
        usePortal: true
      });

      expect(result.success).toBe(true);
      expect(result.energySpent).toBe(40); // Portal energy cost
    });

    test('should calculate teleportation success rate', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      // Set high success rate for testing
      rng.setNextFloat(0.95); // 95% success rate

      const result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: 'anchor-2',
        usePortal: false
      });

      expect(result.success).toBe(true);
    });

    test('should handle teleportation failures', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      // Set low success rate for testing
      rng.setNextFloat(0.05); // 5% success rate

      const result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: 'anchor-2',
        usePortal: false
      });

      expect(result.success).toBe(false);
      expect(result.failureReason).toContain('unstable destination');
    });

    test('should generate side effects for teleportation', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      // Enable side effects and set high random value
      const config = teleportationSystem.getConfig();
      config.enableSideEffects = true;
      teleportationSystem.updateConfig(config);

      rng.setNextFloat(0.15); // Above 10% threshold for side effects

      const result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: 'anchor-2',
        usePortal: false
      });

      if (result.success && result.sideEffects) {
        expect(result.sideEffects.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Statistics and Analytics', () => {
    test('should track teleportation statistics', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      // Perform some teleports
      for (let i = 0; i < 5; i++) {
        const result = teleportationSystem.requestTeleportation({
          entityId: 'test-player',
          destinationId: 'anchor-2',
          usePortal: false
        });

        if (result.success) {
          break; // Stop after first success
        }
      }

      const stats = teleportationSystem.getStats();

      expect(stats.totalTeleports).toBeGreaterThan(0);
      expect(stats.totalEnergySpent).toBeGreaterThan(0);
    });

    test('should track failure reasons', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2); // Restricted anchor

      // Try to teleport without permissions (should fail)
      teleportationSystem.requestTeleportation({
        entityId: 'basic-player',
        destinationId: 'anchor-2',
        usePortal: false
      });

      const stats = teleportationSystem.getStats();
      expect(stats.failedTeleports).toBeGreaterThan(0);
      expect(stats.failureReasons.size).toBeGreaterThan(0);
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = {
        defaultEnergyCost: 50,
        maxPortalDistance: 2000,
        globalCooldown: 10000
      };

      teleportationSystem.updateConfig(newConfig);

      const updatedConfig = teleportationSystem.getConfig();
      expect(updatedConfig.defaultEnergyCost).toBe(50);
      expect(updatedConfig.maxPortalDistance).toBe(2000);
      expect(updatedConfig.globalCooldown).toBe(10000);
    });

    test('should merge configuration updates', () => {
      const partialConfig = {
        defaultEnergyCost: 75
      };

      teleportationSystem.updateConfig(partialConfig);

      const updatedConfig = teleportationSystem.getConfig();
      expect(updatedConfig.defaultEnergyCost).toBe(75);
      expect(updatedConfig.maxPortalDistance).toBe(1000); // Should remain unchanged
      expect(updatedConfig.globalCooldown).toBe(5000); // Should remain unchanged
    });
  });

  describe('Event System Integration', () => {
    test('should emit events for anchor creation', () => {
      let eventEmitted = false;
      let eventData: any = null;

      eventBus.on('teleportation:anchor-created', (data) => {
        eventEmitted = true;
        eventData = data;
      });

      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);

      expect(eventEmitted).toBe(true);
      expect(eventData.anchorId).toBe('anchor-1');
      expect(eventData.zoneId).toBe('test-zone');
    });

    test('should emit events for portal creation', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      let eventEmitted = false;
      let eventData: any = null;

      eventBus.on('teleportation:portal-created', (data) => {
        eventEmitted = true;
        eventData = data;
      });

      teleportationSystem.createPortal('anchor-1', 'anchor-2', {
        name: 'Test Portal'
      });

      expect(eventEmitted).toBe(true);
      expect(eventData.sourceAnchorId).toBe('anchor-1');
      expect(eventData.destinationAnchorId).toBe('anchor-2');
    });

    test('should emit events for successful teleportation', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      let eventEmitted = false;
      let eventData: any = null;

      eventBus.on('teleportation:teleport-success', (data) => {
        eventEmitted = true;
        eventData = data;
      });

      teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: 'anchor-2',
        usePortal: false
      });

      expect(eventEmitted).toBe(true);
      expect(eventData.entityId).toBe('test-player');
      expect(eventData.energySpent).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple zones efficiently', () => {
      const startTime = performance.now();

      // Create many zones
      for (let i = 0; i < 100; i++) {
        const zone: ZoneInfo = {
          id: `zone-${i}`,
          name: `Zone ${i}`,
          bounds: {
            min: { x: -10, y: 0, z: -10 },
            max: { x: 10, y: 10, z: 10 }
          },
          isActive: true,
          teleportEnabled: true,
          restrictions: [],
          anchorLimit: 5
        };

        teleportationSystem.addZone(zone);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should be very fast

      const zones = teleportationSystem.getAllZones();
      expect(zones.length).toBe(103); // 100 new + 3 default
    });

    test('should handle many anchors without memory leaks', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create many anchors
      for (let i = 0; i < 1000; i++) {
        const anchor: Partial<SpatialAnchor> = {
          id: `anchor-${i}`,
          name: `Anchor ${i}`,
          position: { x: i * 10, y: 0, z: i * 10 },
          zoneId: 'test-zone',
          description: `Anchor ${i}`,
          energyCost: 25 + (i % 50)
        };

        teleportationSystem.createSpatialAnchor(anchor);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not have excessive memory usage
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    test('should handle concurrent teleportation requests', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      const startTime = performance.now();

      // Perform many concurrent teleports
      const promises = [];
      for (let i = 0; i < 100; i++) {
        const promise = new Promise((resolve) => {
          const result = teleportationSystem.requestTeleportation({
            entityId: `player-${i}`,
            destinationId: 'anchor-2',
            usePortal: false
          });
          resolve(result);
        });
        promises.push(promise);
      }

      return Promise.all(promises).then(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(duration).toBeLessThan(1000); // Should be reasonably fast
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid teleportation requests gracefully', () => {
      const result = teleportationSystem.requestTeleportation({
        entityId: '', // Invalid entity ID
        destinationId: 'non-existent-destination',
        usePortal: false
      });

      expect(result.success).toBe(false);
      expect(result.failureReason).toContain('not found');
    });

    test('should handle portal charges and depletion', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      const portal = teleportationSystem.createPortal('anchor-1', 'anchor-2', {
        name: 'Limited Portal',
        charges: 2,
        maxCharges: 2
      });

      expect(portal).toBeDefined();
      expect(portal?.charges).toBe(2);

      // First teleport (should succeed)
      let result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: portal!.id,
        usePortal: true
      });
      expect(result.success).toBe(true);

      // Second teleport (should succeed)
      result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: portal!.id,
        usePortal: true
      });
      expect(result.success).toBe(true);

      // Third teleport (should fail due to no charges)
      result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: portal!.id,
        usePortal: true
      });
      expect(result.success).toBe(false);
      expect(result.failureReason).toContain('Access denied');
    });

    test('should handle portal stability decay', () => {
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_1);
      teleportationSystem.createSpatialAnchor(TEST_ANCHOR_2);

      const portal = teleportationSystem.createPortal('anchor-1', 'anchor-2', {
        name: 'Decaying Portal',
        stability: 0.05 // Very low stability
      });

      expect(portal).toBeDefined();
      expect(portal?.stability).toBe(0.05);

      // Use portal enough times to reduce stability to 0
      for (let i = 0; i < 5; i++) {
        teleportationSystem.requestTeleportation({
          entityId: 'test-player',
          destinationId: portal!.id,
          usePortal: true
        });
      }

      // Portal should be deactivated
      const updatedPortal = teleportationSystem.getPortal(portal!.id);
      expect(updatedPortal?.isActive).toBe(false);
    });

    test('should handle zone teleportation restrictions', () => {
      const restrictedZone: ZoneInfo = {
        id: 'restricted-zone',
        name: 'Restricted Zone',
        bounds: {
          min: { x: -50, y: 0, z: -50 },
          max: { x: 50, y: 25, z: 50 }
        },
        isActive: true,
        teleportEnabled: false, // Teleportation disabled
        restrictions: [],
        anchorLimit: 3
      };

      teleportationSystem.addZone(restrictedZone);

      const anchorInRestrictedZone: Partial<SpatialAnchor> = {
        id: 'restricted-anchor',
        name: 'Restricted Anchor',
        position: { x: 0, y: 0, z: 0 },
        zoneId: 'restricted-zone',
        description: 'Anchor in restricted zone'
      };

      teleportationSystem.createSpatialAnchor(anchorInRestrictedZone);

      const result = teleportationSystem.requestTeleportation({
        entityId: 'test-player',
        destinationId: 'restricted-anchor',
        usePortal: false
      });

      expect(result.success).toBe(false);
      expect(result.failureReason).toContain('disabled');
    });
  });
});