/**
 * Gameplay Systems Integration Test
 * 
 * Tests the integration of all gameplay systems in RenderWorld to ensure
 * they work together correctly and maintain performance.
 * 
 * @module GameplaySystemsIntegrationTest
 * @version 1.0.0
 * @license MIT
 */

import { RenderWorldPure } from '../RenderWorldPure';
import { LensMode } from '../LensModeSwitcher';
import { PerceptionMode } from '../PerceptionFilterLayer';
import { InteractionBehavior } from '../InteractableRegistryPure';
import { PerformanceLevel } from '../MobilePerformanceOptimizer';

describe('Gameplay Systems Integration', () => {
  let renderWorld: RenderWorldPure;

  beforeEach(() => {
    renderWorld = new RenderWorldPure();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Lens Mode Switching', () => {
    test('should switch between different lens modes', () => {
      // Test normal mode
      expect(renderWorld.switchLensMode(LensMode.NORMAL)).toBe(true);
      expect(renderWorld.getCurrentLensMode()).toBe(LensMode.NORMAL);

      // Test scan mode
      expect(renderWorld.switchLensMode(LensMode.SCAN)).toBe(true);
      expect(renderWorld.getCurrentLensMode()).toBe(LensMode.SCAN);

      // Test combat mode
      expect(renderWorld.switchLensMode(LensMode.COMBAT)).toBe(true);
      expect(renderWorld.getCurrentLensMode()).toBe(LensMode.COMBAT);
    });

    test('should update perception mode when lens mode changes', () => {
      renderWorld.switchLensMode(LensMode.SCAN);
      expect(renderWorld.getCurrentPerceptionMode()).toBe(PerceptionMode.SCAN);

      renderWorld.switchLensMode(LensMode.COMBAT);
      expect(renderWorld.getCurrentPerceptionMode()).toBe(PerceptionMode.DANGER);
    });
  });

  describe('Object Interactions', () => {
    test('should handle spirit lens pickup', () => {
      const result = renderWorld.interactWithObject('spirit_lens', InteractionBehavior.PICKUP);
      
      expect(result.success).toBe(true);
      expect(renderWorld.getGameState().player.holdingSpiritLens).toBe(true);
      expect(renderWorld.getGameState().world.spiritLens.active).toBe(false);
    });

    test('should handle spirit lens scanning', () => {
      const result = renderWorld.interactWithObject('spirit_lens', InteractionBehavior.SCAN);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Scanned');
    });

    test('should handle portal activation', () => {
      const result = renderWorld.interactWithObject('portal_spiritTamer', InteractionBehavior.USE);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Used');
    });
  });

  describe('Overlay Effects', () => {
    test('should apply scan mode effects', () => {
      renderWorld.switchLensMode(LensMode.SCAN);
      
      const effects = renderWorld.getGameplayState().overlayEffects;
      expect(effects.length).toBeGreaterThan(0);
    });

    test('should apply combat mode effects', () => {
      renderWorld.switchLensMode(LensMode.COMBAT);
      
      const effects = renderWorld.getGameplayState().overlayEffects;
      expect(effects.length).toBeGreaterThan(0);
    });
  });

  describe('Scan Feedback', () => {
    test('should have scan targets in the world', () => {
      const targets = renderWorld.getGameplayState().scanTargets;
      expect(targets.length).toBeGreaterThan(0);
      
      // Should have spirit lens and portals as scan targets
      const targetIds = targets.map(t => t.id);
      expect(targetIds).toContain('spirit_lens');
      expect(targetIds.some(id => id.startsWith('portal_'))).toBe(true);
    });

    test('should update scan progress', () => {
      const scanManager = renderWorld.getEngines().scanFeedback;
      scanManager.startScan('spirit_lens');
      scanManager.updateScanProgress(0.5);
      
      expect(scanManager.getScanProgress()).toBe(0.5);
    });
  });

  describe('Interactable Registry', () => {
    test('should have registered interactables', () => {
      const interactables = renderWorld.getGameplayState().interactables;
      expect(interactables.length).toBeGreaterThan(0);
    });

    test('should support different interaction behaviors', () => {
      const spiritLens = renderWorld.getEngines().interactables.get('spirit_lens');
      expect(spiritLens).toBeDefined();
      expect(spiritLens?.behaviors).toContain(InteractionBehavior.PICKUP);
      expect(spiritLens?.behaviors).toContain(InteractionBehavior.SCAN);
      expect(spiritLens?.behaviors).toContain(InteractionBehavior.EXAMINE);
    });
  });

  describe('Mobile Performance', () => {
    test('should detect device capabilities', () => {
      const capabilities = renderWorld.getEngines().mobilePerformance.getDeviceCapabilities();
      expect(capabilities.type).toBeDefined();
      expect(capabilities.memory).toBeGreaterThan(0);
      expect(capabilities.cpuCores).toBeGreaterThan(0);
    });

    test('should have performance configuration', () => {
      const config = renderWorld.getEngines().mobilePerformance.getConfig();
      expect(config.targetFPS).toBeGreaterThan(0);
      expect(config.maxMemoryUsage).toBeGreaterThan(0);
      expect(config.textureQuality).toBeDefined();
    });

    test('should track performance statistics', () => {
      const stats = renderWorld.getMobilePerformanceStats();
      expect(stats.level).toBeDefined();
      expect(stats.deviceType).toBeDefined();
      expect(stats.fps).toBeGreaterThanOrEqual(0);
      expect(stats.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    test('should allow performance level adjustment', () => {
      renderWorld.setMobilePerformanceLevel(PerformanceLevel.LOW);
      expect(renderWorld.getEngines().mobilePerformance.getPerformanceLevel()).toBe(PerformanceLevel.LOW);

      renderWorld.setMobilePerformanceLevel(PerformanceLevel.HIGH);
      expect(renderWorld.getEngines().mobilePerformance.getPerformanceLevel()).toBe(PerformanceLevel.HIGH);
    });
  });

  describe('System Integration', () => {
    test('should update all systems together', () => {
      const initialTime = Date.now();
      const deltaTime = 16.67; // ~60fps

      // Update gameplay systems
      renderWorld.updateGameplaySystems(deltaTime);

      // Verify systems are updated
      expect(renderWorld.getGameplayState().overlayEffects).toBeDefined();
      expect(renderWorld.getGameplayState().scanTargets).toBeDefined();
      expect(renderWorld.getGameplayState().interactables).toBeDefined();
      expect(renderWorld.getGameplayState().npcs).toBeDefined();
    });

    test('should handle keyboard input', () => {
      // Test lens mode switching via keyboard
      expect(renderWorld.handleGameplayInput('1')).toBe(true); // Normal mode
      expect(renderWorld.handleGameplayInput('2')).toBe(true); // Scan mode
      expect(renderWorld.handleGameplayInput('3')).toBe(true); // Combat mode
    });

    test('should maintain performance under load', () => {
      // Simulate high load by updating multiple times
      for (let i = 0; i < 100; i++) {
        renderWorld.updateGameplaySystems(16.67);
      }

      const stats = renderWorld.getMobilePerformanceStats();
      expect(stats.fps).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid interactions gracefully', () => {
      const result = renderWorld.interactWithObject('nonexistent', InteractionBehavior.PICKUP);
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    test('should handle invalid lens mode switching', () => {
      // This should not throw an error
      expect(() => {
        renderWorld.switchLensMode('invalid' as LensMode);
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory during updates', () => {
      const initialMemory = renderWorld.getEngines().mobilePerformance.getPerformanceStats().memoryUsage;
      
      // Run many updates
      for (let i = 0; i < 1000; i++) {
        renderWorld.updateGameplaySystems(16.67);
      }
      
      const finalMemory = renderWorld.getEngines().mobilePerformance.getPerformanceStats().memoryUsage;
      
      // Memory usage should not increase dramatically
      expect(finalMemory - initialMemory).toBeLessThan(100); // Less than 100MB increase
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should work in different environments', () => {
      // Test that systems work without throwing errors
      expect(() => {
        renderWorld.switchLensMode(LensMode.NORMAL);
        renderWorld.interactWithObject('spirit_lens', InteractionBehavior.EXAMINE);
        renderWorld.updateGameplaySystems(16.67);
      }).not.toThrow();
    });
  });
});