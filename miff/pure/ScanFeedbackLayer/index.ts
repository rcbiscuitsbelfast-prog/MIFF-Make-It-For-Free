/**
 * ScanFeedbackLayer - Wireframe Overlays and Interactive Highlights
 * 
 * Provides visual feedback for scanning mode including wireframe overlays,
 * pulse cooldowns, interactable highlights, and scanning progress indicators.
 * 
 * @module ScanFeedbackLayer
 * @version 1.0.0
 * @license MIT
 */

import { OverlayFXManager, OverlayEffectType, overlayFXManager } from '../OverlayFXPure';

export enum ScanTargetType {
  ITEM = 'item',
  NPC = 'npc',
  INTERACTABLE = 'interactable',
  DOOR = 'door',
  CONTAINER = 'container',
  TERMINAL = 'terminal',
  PORTAL = 'portal',
  HAZARD = 'hazard',
  SECRET = 'secret'
}

export interface ScanTarget {
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
  type: ScanTargetType;
  position: { x: number; y: number; z: number };
  radius: number;
  isScanned: boolean;
  scanProgress: number; // 0-1
  lastScanned?: number; // timestamp
  cooldownDuration: number; // milliseconds
  highlightColor: string;
  wireframeColor: string;
  pulseIntensity: number; // 0-1
  isInteractable: boolean;
  metadata?: Record<string, any>;
}

export interface ScanConfig {
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
  maxRange: number;
  scanDuration: number; // milliseconds
  cooldownDuration: number; // milliseconds
  wireframeEnabled: boolean;
  highlightEnabled: boolean;
  pulseEnabled: boolean;
  autoScan: boolean;
  scanKey?: string; // keyboard key for manual scanning
}

export class ScanFeedbackManager {
  private overlayManager: OverlayFXManager;
  private targets: Map<string, ScanTarget> = new Map();
  private config: ScanConfig;
  private isScanning: boolean = false;
  private currentScanTarget?: string;
  private scanStartTime?: number;
  private pulsePhase: number = 0;

  constructor(overlayManager: OverlayFXManager) {
    this.overlayManager = overlayManager;
    this.config = {
      maxRange: 10.0,
      scanDuration: 2000,
      cooldownDuration: 5000,
      wireframeEnabled: true,
      highlightEnabled: true,
      pulseEnabled: true,
      autoScan: false
    };
  }

  /**
   * Add a scan target
   */
  addTarget(): void {
    this.targets.set(target.id, target);
    this.updateTargetOverlays(target);
  }

  /**
   * Remove a scan target
   */
  removeTarget(): void {
    const target = this.targets.get(targetId);
    if (target) {
      this.clearTargetOverlays(target);
      this.targets.delete(targetId);
    }
  }

  /**
   * Start scanning a target
   */
  startScan(): boolean {
    const target = this.targets.get(targetId);
    if (!target || this.isScanning) return false;

    this.isScanning = true;
    this.currentScanTarget = targetId;
    this.scanStartTime = Date.now();
    target.scanProgress = 0;

    // Apply scanning effects
    this.applyScanningEffects(target);
    return true;
  }

  /**
   * Update scan progress
   */
  updateScanProgress(): void {
    if (!this.isScanning || !this.currentScanTarget) return;

    const target = this.targets.get(this.currentScanTarget);
    if (!target) return;

    target.scanProgress = Math.max(0, Math.min(1, progress));

    // Update visual feedback
    this.updateTargetOverlays(target);

    // Check if scan is complete
    if (target.scanProgress >= 1.0) {
      this.completeScan();
    }
  }

  /**
   * Complete the current scan
   */
  completeScan(): void {
    if (!this.currentScanTarget) return;

    const target = this.targets.get(this.currentScanTarget);
    if (!target) return;

    target.isScanned = true;
    target.lastScanned = Date.now();
    target.scanProgress = 1.0;

    // Apply completion effects
    this.applyCompletionEffects(target);

    this.isScanning = false;
    this.currentScanTarget = undefined;
    this.scanStartTime = undefined;
  }

  /**
   * Cancel the current scan
   */
  cancelScan(): void {
    if (!this.currentScanTarget) return;

    const target = this.targets.get(this.currentScanTarget);
    if (target) {
      target.scanProgress = 0;
      this.updateTargetOverlays(target);
    }

    this.isScanning = false;
    this.currentScanTarget = undefined;
    this.scanStartTime = undefined;
  }

  /**
   * Update target overlays based on current state
   */
  private updateTargetOverlays(target: ScanTarget): void {
    const layerId = `scan_target_${target.id}`;
    
    // Clear existing effects
    this.overlayManager.removeEffect(layerId, OverlayEffectType.CHROMATIC_ABERRATION);
    this.overlayManager.removeEffect(layerId, OverlayEffectType.COLOR_SHIFT);
    this.overlayManager.removeEffect(layerId, OverlayEffectType.VIGNETTE);

    if (!target.isInteractable) return;

    // Create layer for this target
    this.overlayManager.createLayer(layerId, `Scan Target - ${target.id}`, 15);

    if (target.isScanned) {
      // Apply scanned state effects
      this.overlayManager.addEffect(layerId, {
        type: OverlayEffectType.COLOR_SHIFT,
        intensity: 0.3,
        color: '#00ff00' // Green for scanned
      });
    } else if (this.isScanning && this.currentScanTarget === target.id) {
      // Apply scanning effects
      this.overlayManager.addEffect(layerId, {
        type: OverlayEffectType.CHROMATIC_ABERRATION,
        intensity: 0.5 * target.scanProgress,
        color: target.highlightColor
      });
    } else if (this.isTargetInRange(target)) {
      // Apply highlight effects for unscanned targets in range
      this.overlayManager.addEffect(layerId, {
        type: OverlayEffectType.COLOR_SHIFT,
        intensity: 0.2,
        color: target.highlightColor
      });
    }

    // Apply pulse effects if enabled
    if (this.config.pulseEnabled && !target.isScanned) {
      this.overlayManager.addEffect(layerId, {
        type: OverlayEffectType.VIGNETTE,
        intensity: 0.3 * Math.sin(this.pulsePhase),
        color: target.wireframeColor,
        radius: 0.8
      });
    }
  }

  /**
   * Clear overlays for a target
   */
  private clearTargetOverlays(target: ScanTarget): void {
    const layerId = `scan_target_${target.id}`;
    this.overlayManager.removeEffect(layerId, OverlayEffectType.CHROMATIC_ABERRATION);
    this.overlayManager.removeEffect(layerId, OverlayEffectType.COLOR_SHIFT);
    this.overlayManager.removeEffect(layerId, OverlayEffectType.VIGNETTE);
  }

  /**
   * Apply scanning effects
   */
  private applyScanningEffects(target: ScanTarget): void {
    const layerId = `scan_target_${target.id}`;
    this.overlayManager.createLayer(layerId, `Scanning - ${target.id}`, 20);
    
    this.overlayManager.addEffect(layerId, {
      type: OverlayEffectType.CHROMATIC_ABERRATION,
      intensity: 0.6,
      color: target.highlightColor
    });
  }

  /**
   * Apply completion effects
   */
  private applyCompletionEffects(target: ScanTarget): void {
    const layerId = `scan_target_${target.id}`;
    
    // Flash effect
    this.overlayManager.addEffect(layerId, {
      type: OverlayEffectType.COLOR_SHIFT,
      intensity: 1.0,
      color: '#00ff00',
      duration: 500
    });
  }

  /**
   * Check if target is in scanning range
   */
  private isTargetInRange(target: ScanTarget): boolean {
    // This would need player position from the game
    // For now, assume all targets are in range
    return true;
  }

  /**
   * Update pulse animation
   */
  updatePulse(): void {
    if (!this.config.pulseEnabled) return;

    this.pulsePhase += deltaTime * 0.001; // Convert to seconds
    
    // Update all unscanned targets
    for (const target of this.targets.values()) {
      if (!target.isScanned && target.isInteractable) {
        this.updateTargetOverlays(target);
      }
    }
  }

  /**
   * Get targets within scanning range
   */
  getTargetsInRange(playerPosition: { x: number; y: number; z: number }): ScanTarget[] {
    const inRange: ScanTarget[] = [];
    
    for (const target of this.targets.values()) {
      const distance = this.calculateDistance(playerPosition, target.position);
      if (distance <= this.config.maxRange) {
        inRange.push(target);
      }
    }
    
    return inRange;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get scan progress for current target
   */
  getScanProgress(): number {
    if (!this.currentScanTarget) return 0;
    
    const target = this.targets.get(this.currentScanTarget);
    return target?.scanProgress || 0;
  }

  /**
   * Check if currently scanning
   */
  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  /**
   * Get current scan target
   */
  getCurrentScanTarget(): ScanTarget! {
    if (!this.currentScanTarget) return undefined;
    return this.targets.get(this.currentScanTarget);
  }

  /**
   * Update configuration
   */
  updateConfig(): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): ScanConfig {
    return { ...this.config };
  }

  /**
   * Get all targets
   */
  getAllTargets(): ScanTarget[] {
    return Array.from(this.targets.values());
  }

  /**
   * Clear all targets
   */
  clearAllTargets(): void {
    for (const target of this.targets.values()) {
      this.clearTargetOverlays(target);
    }
    this.targets.clear();
  }

  /**
   * Export scan data for serialization
   */
  exportScanData(): Record<string, any> {
    const data: Record<string, any> = {
      config: this.config,
      targets: {}
    };
    
    for (const [id, target] of this.targets) {
      data.targets[id] = {
        ...target,
        // Don't serialize functions or complex objects
        metadata: target.metadata || {}
      };
    }
    
    return data;
  }

  /**
   * Import scan data from serialized data
   */
  importScanData(): void {
    this.clearAllTargets();
    
    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
    
    if (data.targets) {
      for (const [id, targetData] of Object.entries(data.targets)) {
        this.addTarget(targetData as ScanTarget);
      }
    }
  }
}

// Export default instance
// export const scanFeedbackManager = new ScanFeedbackManager(overlayFXManager);