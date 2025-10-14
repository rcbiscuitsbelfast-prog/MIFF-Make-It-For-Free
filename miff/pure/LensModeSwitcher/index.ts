/**
 * LensModeSwitcher - View Mode Toggle System
 * 
 * Provides seamless switching between different view modes including normal view,
 * scan view, filtered overlays, and specialized perception modes.
 * 
 * @module LensModeSwitcher
 * @version 1.0.0
 * @license MIT
 */

import { PerceptionFilterManager, PerceptionMode, perceptionFilterManager } from '../PerceptionFilterLayer';
import { ScanFeedbackManager, scanFeedbackManager } from '../ScanFeedbackLayer';
import { OverlayFXManager, overlayFXManager } from '../OverlayFXPure';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

export enum LensMode {
  NORMAL = 'normal',
  SCAN = 'scan',
  COMBAT = 'combat',
  STEALTH = 'stealth',
  QUEST = 'quest',
  INTERACT = 'interact',
  DEBUG = 'debug',
  CINEMATIC = 'cinematic'
}

export interface LensModeConfig {
  currentMode: LensMode;
  availableModes: LensMode[];
  autoSwitch: boolean;
  transitionDuration: number; // milliseconds
  hotkeys: Record<LensMode, string>; // key mappings
  modeSettings: Record<LensMode, ModeSettings>;
}

export interface ModeSettings {
  enabled: boolean;
  intensity: number; // 0-1
  transitionSpeed: number; // 0-1
  overlayOpacity: number; // 0-1
  effects: string[]; // effect IDs
  customSettings?: Record<string, any>;
}

export class LensModeSwitcher {
  private logger: StructuredLogger;
  private perceptionManager: PerceptionFilterManager;
  private scanManager: ScanFeedbackManager;
  private overlayManager: OverlayFXManager;
  private config: LensModeConfig;
  private modeHistory: LensMode[] = [];
  private transitionStartTime?: number;
  private isTransitioning: boolean = false;

  constructor(
    perceptionManager: PerceptionFilterManager,
    scanManager: ScanFeedbackManager,
    overlayManager: OverlayFXManager
  ) {
    this.logger = new StructuredLogger({ module: 'LensModeSwitcher' });
    this.perceptionManager = perceptionManager;
    this.scanManager = scanManager;
    this.overlayManager = overlayManager;
    
    this.config = {
      currentMode: LensMode.NORMAL,
      availableModes: [
        LensMode.NORMAL,
        LensMode.SCAN,
        LensMode.COMBAT,
        LensMode.STEALTH,
        LensMode.QUEST,
        LensMode.INTERACT,
        LensMode.DEBUG,
        LensMode.CINEMATIC
      ],
      autoSwitch: true,
      transitionDuration: 500,
      hotkeys: {
        [LensMode.NORMAL]: '1',
        [LensMode.SCAN]: '2',
        [LensMode.COMBAT]: '3',
        [LensMode.STEALTH]: '4',
        [LensMode.QUEST]: '5',
        [LensMode.INTERACT]: '6',
        [LensMode.DEBUG]: '7',
        [LensMode.CINEMATIC]: '8'
      },
      modeSettings: {
        [LensMode.NORMAL]: {
          enabled: true,
          intensity: 1.0,
          transitionSpeed: 1.0,
          overlayOpacity: 0.0,
          effects: []
        },
        [LensMode.SCAN]: {
          enabled: true,
          intensity: 0.8,
          transitionSpeed: 0.8,
          overlayOpacity: 0.6,
          effects: ['scan_lines', 'chromatic_aberration']
        },
        [LensMode.COMBAT]: {
          enabled: true,
          intensity: 0.9,
          transitionSpeed: 0.6,
          overlayOpacity: 0.7,
          effects: ['red_tint', 'distortion', 'pulse']
        },
        [LensMode.STEALTH]: {
          enabled: true,
          intensity: 0.7,
          transitionSpeed: 0.9,
          overlayOpacity: 0.5,
          effects: ['blur', 'purple_tint', 'darken']
        },
        [LensMode.QUEST]: {
          enabled: true,
          intensity: 0.6,
          transitionSpeed: 0.7,
          overlayOpacity: 0.4,
          effects: ['yellow_tint', 'vignette', 'highlight']
        },
        [LensMode.INTERACT]: {
          enabled: true,
          intensity: 0.5,
          transitionSpeed: 0.8,
          overlayOpacity: 0.3,
          effects: ['blue_tint', 'outline']
        },
        [LensMode.DEBUG]: {
          enabled: true,
          intensity: 1.0,
          transitionSpeed: 1.0,
          overlayOpacity: 0.8,
          effects: ['wireframe', 'grid', 'info_overlay']
        },
        [LensMode.CINEMATIC]: {
          enabled: true,
          intensity: 0.8,
          transitionSpeed: 0.5,
          overlayOpacity: 0.6,
          effects: ['letterbox', 'film_grain', 'color_grade']
        }
      }
    };
  }

  /**
   * Switch to a specific lens mode
   */
  switchToMode(): boolean {
    if (!this.config.availableModes.includes(mode)) {
      console.warn(`Lens mode ${mode} is not available`);
      return false;
    }

    if (mode === this.config.currentMode) {
      return true; // Already in this mode
    }

    const settings = this.config.modeSettings[mode];
    if (!settings.enabled) {
      console.warn(`Lens mode ${mode} is disabled`);
      return false;
    }

    // Add current mode to history
    this.modeHistory.push(this.config.currentMode);
    if (this.modeHistory.length > 10) {
      this.modeHistory.shift(); // Keep only last 10 modes
    }

    // Start transition
    this.startTransition(mode);
    return true;
  }

  /**
   * Switch to the previous mode
   */
  switchToPreviousMode(): boolean {
    if (this.modeHistory.length === 0) return false;
    
    const previousMode = this.modeHistory.pop()!;
    return this.switchToMode(previousMode);
  }

  /**
   * Toggle between current mode and a specific mode
   */
  toggleMode(): boolean {
    if (this.config.currentMode === mode) {
      return this.switchToMode(LensMode.NORMAL);
    } else {
      return this.switchToMode(mode);
    }
  }

  /**
   * Start transition to a new mode
   */
  private startTransition(targetMode: LensMode): void {
    this.isTransitioning = true;
    this.transitionStartTime = Date.now();
    
    // Apply transition effects
    this.applyTransitionEffects(this.config.currentMode, targetMode);
    
    // Update perception mode
    this.updatePerceptionMode(targetMode);
    
    // Update scan mode
    this.updateScanMode(targetMode);
    
    // Update overlay effects
    this.updateOverlayEffects(targetMode);
    
    // Update configuration
    this.config.currentMode = targetMode;
  }

  /**
   * Apply transition effects between modes
   */
  private applyTransitionEffects(fromMode: LensMode, toMode: LensMode): void {
    const transitionLayer = 'lens_transition';
    this.overlayManager.createLayer(transitionLayer, 'Lens Transition', 25);
    
    // Fade out current mode effects
    this.overlayManager.setLayerOpacity(`mode_${fromMode}`, 0);
    
    // Fade in new mode effects
    const settings = this.config.modeSettings[toMode];
    this.overlayManager.setLayerOpacity(`mode_${toMode}`, settings.overlayOpacity);
  }

  /**
   * Update perception mode based on lens mode
   */
  private updatePerceptionMode(lensMode: LensMode): void {
    const modeMap: Record<LensMode, PerceptionMode> = {
      [LensMode.NORMAL]: PerceptionMode.NORMAL,
      [LensMode.SCAN]: PerceptionMode.SCAN,
      [LensMode.COMBAT]: PerceptionMode.DANGER,
      [LensMode.STEALTH]: PerceptionMode.STEALTH,
      [LensMode.QUEST]: PerceptionMode.QUEST,
      [LensMode.INTERACT]: PerceptionMode.INTERACT,
      [LensMode.DEBUG]: PerceptionMode.NORMAL,
      [LensMode.CINEMATIC]: PerceptionMode.NORMAL
    };
    
    const perceptionMode = modeMap[lensMode];
    if (perceptionMode) {
      this.perceptionManager.setMode(perceptionMode);
    }
  }

  /**
   * Update scan mode based on lens mode
   */
  private updateScanMode(lensMode: LensMode): void {
    if (lensMode === LensMode.SCAN) {
      // Enable auto-scanning
      this.scanManager.updateConfig({ autoScan: true });
    } else {
      // Disable auto-scanning
      this.scanManager.updateConfig({ autoScan: false });
    }
  }

  /**
   * Update overlay effects for the mode
   */
  private updateOverlayEffects(lensMode: LensMode): void {
    const settings = this.config.modeSettings[lensMode];
    const layerId = `mode_${lensMode}`;
    
    // Clear existing effects
    this.overlayManager.removeEffect(layerId, 'scan_lines' as any);
    this.overlayManager.removeEffect(layerId, 'chromatic_aberration' as any);
    this.overlayManager.removeEffect(layerId, 'red_tint' as any);
    this.overlayManager.removeEffect(layerId, 'distortion' as any);
    this.overlayManager.removeEffect(layerId, 'blur' as any);
    this.overlayManager.removeEffect(layerId, 'purple_tint' as any);
    this.overlayManager.removeEffect(layerId, 'yellow_tint' as any);
    this.overlayManager.removeEffect(layerId, 'blue_tint' as any);
    this.overlayManager.removeEffect(layerId, 'wireframe' as any);
    this.overlayManager.removeEffect(layerId, 'letterbox' as any);
    
    // Create layer for this mode
    this.overlayManager.createLayer(layerId, `Lens Mode - ${lensMode}`, 10);
    
    // Apply mode-specific effects
    for (const effectId of settings.effects) {
      this.applyModeEffect(layerId, effectId, settings);
    }
  }

  /**
   * Apply a specific mode effect
   */
  private applyModeEffect(layerId: string, effectId: string, settings: ModeSettings): void {
    switch (effectId) {
      case 'scan_lines':
        this.overlayManager.addEffect(layerId, {
          type: 'scan_lines' as any,
          intensity: settings.intensity * 0.6
        });
        break;
      case 'chromatic_aberration':
        this.overlayManager.addEffect(layerId, {
          type: 'chromatic_aberration' as any,
          intensity: settings.intensity * 0.4,
          color: '#00ff00'
        });
        break;
      case 'red_tint':
        this.overlayManager.addEffect(layerId, {
          type: 'color_shift' as any,
          intensity: settings.intensity * 0.5,
          color: '#ff0000'
        });
        break;
      case 'distortion':
        this.overlayManager.addEffect(layerId, {
          type: 'distortion' as any,
          intensity: settings.intensity * 0.3
        });
        break;
      case 'blur':
        this.overlayManager.addEffect(layerId, {
          type: 'blur' as any,
          intensity: settings.intensity * 0.4
        });
        break;
      case 'purple_tint':
        this.overlayManager.addEffect(layerId, {
          type: 'color_shift' as any,
          intensity: settings.intensity * 0.4,
          color: '#800080'
        });
        break;
      case 'yellow_tint':
        this.overlayManager.addEffect(layerId, {
          type: 'color_shift' as any,
          intensity: settings.intensity * 0.3,
          color: '#ffff00'
        });
        break;
      case 'blue_tint':
        this.overlayManager.addEffect(layerId, {
          type: 'color_shift' as any,
          intensity: settings.intensity * 0.2,
          color: '#0080ff'
        });
        break;
      case 'wireframe':
        this.overlayManager.addEffect(layerId, {
          type: 'chromatic_aberration' as any,
          intensity: settings.intensity * 0.8,
          color: '#00ffff'
        });
        break;
      case 'letterbox':
        this.overlayManager.addEffect(layerId, {
          type: 'vignette' as any,
          intensity: settings.intensity * 0.9,
          color: '#000000',
          radius: 0.3
        });
        break;
    }
  }

  /**
   * Update transition progress
   */
  updateTransition(): void {
    if (!this.isTransitioning || !this.transitionStartTime) return;
    
    const elapsed = Date.now() - this.transitionStartTime;
    const progress = Math.min(elapsed / this.config.transitionDuration, 1.0);
    
    if (progress >= 1.0) {
      this.isTransitioning = false;
      this.transitionStartTime = undefined;
    }
  }

  /**
   * Handle keyboard input
   */
  handleKeyPress(): boolean {
    for (const [mode, hotkey] of Object.entries(this.config.hotkeys)) {
      if (key === hotkey) {
        return this.switchToMode(mode as LensMode);
      }
    }
    return false;
  }

  /**
   * Get current mode
   */
  getCurrentMode(): LensMode {
    return this.config.currentMode;
  }

  /**
   * Get available modes
   */
  getAvailableModes(): LensMode[] {
    return [...this.config.availableModes];
  }

  /**
   * Check if currently transitioning
   */
  isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
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
  getConfig(): LensModeConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable a mode
   */
  setModeEnabled(): void {
    if (this.config.modeSettings[mode]) {
      this.config.modeSettings[mode].enabled = enabled;
    }
  }

  /**
   * Update mode settings
   */
  updateModeSettings(): void {
    if (this.config.modeSettings[mode]) {
      this.config.modeSettings[mode] = { ...this.config.modeSettings[mode], ...settings };
    }
  }

  /**
   * Get mode history
   */
  getModeHistory(): LensMode[] {
    return [...this.modeHistory];
  }

  /**
   * Clear mode history
   */
  clearModeHistory(): void {
    this.modeHistory = [];
  }
}

// Export default instance
export const lensModeSwitcher = new LensModeSwitcher(
  perceptionFilterManager,
  scanFeedbackManager,
  overlayFXManager
);