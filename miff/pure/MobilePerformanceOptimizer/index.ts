/**
 * MobilePerformanceOptimizer - Mobile-First Performance Optimization
 * 
 * Provides performance optimizations specifically designed for mobile devices
 * including memory management, frame rate optimization, and battery efficiency.
 * 
 * @module MobilePerformanceOptimizer
 * @version 1.0.0
 * @license MIT
 */

export enum PerformanceLevel {
  LOW = 'low',           // 30fps, reduced effects
  MEDIUM = 'medium',     // 45fps, balanced effects
  HIGH = 'high',         // 60fps, full effects
  ULTRA = 'ultra'        // 60fps+, maximum effects
}

export enum DeviceType {
  MOBILE_LOW = 'mobile_low',       // Low-end mobile devices
  MOBILE_MID = 'mobile_mid',       // Mid-range mobile devices
  MOBILE_HIGH = 'mobile_high',     // High-end mobile devices
  TABLET = 'tablet',               // Tablet devices
  DESKTOP = 'desktop'              // Desktop devices
}

export interface PerformanceConfig {
  targetFPS: number;
  maxMemoryUsage: number; // MB
  enableVSync: boolean;
  enableAdaptiveQuality: boolean;
  enableBatteryOptimization: boolean;
  enableThermalThrottling: boolean;
  maxParticleCount: number;
  maxLightCount: number;
  maxShadowCount: number;
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  shaderQuality: 'low' | 'medium' | 'high' | 'ultra';
  postProcessingQuality: 'low' | 'medium' | 'high' | 'ultra';
}

export interface DeviceCapabilities {
  type: DeviceType;
  memory: number; // MB
  cpuCores: number;
  gpuTier: number; // 0-3
  supportsWebGL2: boolean;
  supportsWebAssembly: boolean;
  supportsSharedArrayBuffer: boolean;
  batteryLevel?: number; // 0-1
  isCharging?: boolean;
  thermalState?: 'normal' | 'warning' | 'critical';
}

export class MobilePerformanceOptimizer {
  private config: PerformanceConfig;
  private deviceCapabilities: DeviceCapabilities;
  private currentPerformanceLevel: PerformanceLevel;
  private frameTimeHistory: number[] = [];
  private memoryUsageHistory: number[] = [];
  private isOptimizing: boolean = false;

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.currentPerformanceLevel = this.determineOptimalPerformanceLevel();
    this.config = this.generatePerformanceConfig();
  }

  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    const userAgent = typeof navigator !== 'undefined' ? userAgent: '';
    const memory = this.getDeviceMemory();
    const cores = this.getCPUCores();
    const gpuTier = this.getGPUTier();

    let deviceType: DeviceType = DeviceType.DESKTOP;
    
    if (typeof window !== 'undefined') {
      if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        if (memory < 2048) {
          deviceType = DeviceType.MOBILE_LOW;
        } else if (memory < 4096) {
          deviceType = DeviceType.MOBILE_MID;
        } else {
          deviceType = DeviceType.MOBILE_HIGH;
        }
      } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = DeviceType.TABLET;
      }
    }

    return {
      type: deviceType,
      memory,
      cpuCores: cores,
      gpuTier,
      supportsWebGL2: this.supportsWebGL2(),
      supportsWebAssembly: this.supportsWebAssembly(),
      supportsSharedArrayBuffer: this.supportsSharedArrayBuffer(),
      batteryLevel: this.getBatteryLevel(),
      isCharging: this.isCharging(),
      thermalState: this.getThermalState()
    };
  }

  /**
   * Get device memory (approximate)
   */
  private getDeviceMemory(): number {
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
      return (navigator as any).deviceMemory * 1024; // Convert GB to MB
    }
    
    // Fallback based on user agent
    const userAgent = typeof navigator !== 'undefined' ? userAgent: '';
    if (/iPhone|iPad/i.test(userAgent)) {
      return 4096; // Assume 4GB for iOS devices
    } else if (/Android/i.test(userAgent)) {
      return 2048; // Assume 2GB for Android devices
    }
    
    return 8192; // Default to 8GB for desktop
  }

  /**
   * Get CPU core count (approximate)
   */
  private getCPUCores(): number {
    if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency;
    }
    return 4; // Default assumption
  }

  /**
   * Get GPU tier (0-3)
   */
  private getGPUTier(): number {
    if (typeof window === 'undefined') return 1;
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 0;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      
      // GPU tier detection based on renderer string
      if (renderer.includes('Adreno 6') || renderer.includes('Mali-G7')) {
        return 3; // High-end mobile GPU
      } else if (renderer.includes('Adreno 5') || renderer.includes('Mali-G5')) {
        return 2; // Mid-range mobile GPU
      } else if (renderer.includes('Adreno 4') || renderer.includes('Mali-T8')) {
        return 1; // Low-end mobile GPU
      }
    }
    
    return 2; // Default to mid-range
  }

  /**
   * Check WebGL2 support
   */
  private supportsWebGL2(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2'));
  }

  /**
   * Check WebAssembly support
   */
  private supportsWebAssembly(): boolean {
    return typeof WebAssembly === 'object';
  }

  /**
   * Check SharedArrayBuffer support
   */
  private supportsSharedArrayBuffer(): boolean {
    return typeof SharedArrayBuffer !== 'undefined';
  }

  /**
   * Get battery level (0-1)
   */
  private getBatteryLevel(): number | undefined {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      return undefined; // Would need async call
    }
    return undefined;
  }

  /**
   * Check if device is charging
   */
  private isCharging(): boolean | undefined {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      return undefined; // Would need async call
    }
    return undefined;
  }

  /**
   * Get thermal state
   */
  private getThermalState(): 'normal' | 'warning' | 'critical' {
    // This would need to be implemented with actual thermal monitoring
    return 'normal';
  }

  /**
   * Determine optimal performance level based on device capabilities
   */
  private determineOptimalPerformanceLevel(): PerformanceLevel {
    const { type, memory, gpuTier } = this.deviceCapabilities;
    
    if (type === DeviceType.MOBILE_LOW || memory < 2048 || gpuTier < 1) {
      return PerformanceLevel.LOW;
    } else if (type === DeviceType.MOBILE_MID || memory < 4096 || gpuTier < 2) {
      return PerformanceLevel.MEDIUM;
    } else if (type === DeviceType.MOBILE_HIGH || memory < 8192 || gpuTier < 3) {
      return PerformanceLevel.HIGH;
    } else {
      return PerformanceLevel.ULTRA;
    }
  }

  /**
   * Generate performance configuration based on level
   */
  private generatePerformanceConfig(): PerformanceConfig {
    const level = this.currentPerformanceLevel;
    
    switch (level) {
      case LOW:
        return {
          targetFPS: 30,
          maxMemoryUsage: 256,
          enableVSync: true,
          enableAdaptiveQuality: true,
          enableBatteryOptimization: true,
          enableThermalThrottling: true,
          maxParticleCount: 50,
          maxLightCount: 2,
          maxShadowCount: 1,
          textureQuality: 'low',
          shaderQuality: 'low',
          postProcessingQuality: 'low'
        };
      
      case MEDIUM:
        return {
          targetFPS: 45,
          maxMemoryUsage: 512,
          enableVSync: true,
          enableAdaptiveQuality: true,
          enableBatteryOptimization: true,
          enableThermalThrottling: true,
          maxParticleCount: 100,
          maxLightCount: 4,
          maxShadowCount: 2,
          textureQuality: 'medium',
          shaderQuality: 'medium',
          postProcessingQuality: 'medium'
        };
      
      case HIGH:
        return {
          targetFPS: 60,
          maxMemoryUsage: 1024,
          enableVSync: true,
          enableAdaptiveQuality: false,
          enableBatteryOptimization: false,
          enableThermalThrottling: false,
          maxParticleCount: 200,
          maxLightCount: 8,
          maxShadowCount: 4,
          textureQuality: 'high',
          shaderQuality: 'high',
          postProcessingQuality: 'high'
        };
      
      case ULTRA:
        return {
          targetFPS: 60,
          maxMemoryUsage: 2048,
          enableVSync: true,
          enableAdaptiveQuality: false,
          enableBatteryOptimization: false,
          enableThermalThrottling: false,
          maxParticleCount: 500,
          maxLightCount: 16,
          maxShadowCount: 8,
          textureQuality: 'ultra',
          shaderQuality: 'ultra',
          postProcessingQuality: 'ultra'
        };
    }
  }

  /**
   * Update performance monitoring
   */
  updatePerformance(deltaTime: number): void {
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Monitor memory usage
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryUsageHistory.push(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
      if (this.memoryUsageHistory.length > 60) {
        this.memoryUsageHistory.shift();
      }
    }

    // Adaptive quality adjustment
    if (this.config.enableAdaptiveQuality) {
      this.adjustQualityIfNeeded();
    }
  }

  /**
   * Adjust quality based on performance
   */
  private adjustQualityIfNeeded(): void {
    if (this.frameTimeHistory.length < 30) return;

    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    const targetFrameTime = 1000 / this.config.targetFPS;
    const performanceRatio = avgFrameTime / targetFrameTime;

    // If performance is poor, reduce quality
    if (performanceRatio > 1.2) {
      this.reduceQuality();
    } else if (performanceRatio < 0.8 && this.currentPerformanceLevel !== PerformanceLevel.ULTRA) {
      this.increaseQuality();
    }
  }

  /**
   * Reduce quality level
   */
  private reduceQuality(): void {
    const levels = [PerformanceLevel.ULTRA, HIGH: PerformanceLevel.HIGH, PerformanceLevel.MEDIUM, PerformanceLevel.LOW];
    const currentIndex = levels.indexOf(this.currentPerformanceLevel);
    
    if (currentIndex < levels.length - 1) {
      this.currentPerformanceLevel = levels[currentIndex + 1];
      this.config = this.generatePerformanceConfig();
      this.isOptimizing = true;
    }
  }

  /**
   * Increase quality level
   */
  private increaseQuality(): void {
    const levels = [PerformanceLevel.ULTRA, HIGH: PerformanceLevel.HIGH, PerformanceLevel.MEDIUM, PerformanceLevel.LOW];
    const currentIndex = levels.indexOf(this.currentPerformanceLevel);
    
    if (currentIndex > 0) {
      this.currentPerformanceLevel = levels[currentIndex - 1];
      this.config = this.generatePerformanceConfig();
      this.isOptimizing = true;
    }
  }

  /**
   * Get current performance configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Get current performance level
   */
  getPerformanceLevel(): PerformanceLevel {
    return this.currentPerformanceLevel;
  }

  /**
   * Set performance level manually
   */
  setPerformanceLevel(level: PerformanceLevel): void {
    this.currentPerformanceLevel = level;
    this.config = this.generatePerformanceConfig();
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    avgFrameTime: number;
    avgFPS: number;
    memoryUsage: number;
    isOptimizing: boolean;
  } {
    const avgFrameTime = this.frameTimeHistory.length > 0 
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length 
      : 0;
    
    const avgFPS = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    
    const memoryUsage = this.memoryUsageHistory.length > 0 
      ? this.memoryUsageHistory[this.memoryUsageHistory.length - 1] 
      : 0;

    return {
      avgFrameTime,
      avgFPS,
      memoryUsage,
      isOptimizing: this.isOptimizing
    };
  }

  /**
   * Check if current performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const stats = this.getPerformanceStats();
    return stats.avgFPS >= this.config.targetFPS * 0.9; // 90% of target FPS
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getPerformanceStats();
    
    if (stats.avgFPS < this.config.targetFPS * 0.8) {
      recommendations.push('Consider reducing particle count or shadow quality');
    }
    
    if (stats.memoryUsage > this.config.maxMemoryUsage * 0.9) {
      recommendations.push('Memory usage is high, consider reducing texture quality');
    }
    
    if (this.deviceCapabilities.batteryLevel && this.deviceCapabilities.batteryLevel < 0.2) {
      recommendations.push('Low battery detected, enabling power saving mode');
    }
    
    if (this.deviceCapabilities.thermalState === 'warning') {
      recommendations.push('Device is warming up, reducing performance to prevent overheating');
    }
    
    return recommendations;
  }

  /**
   * Reset performance monitoring
   */
  reset(): void {
    this.frameTimeHistory = [];
    this.memoryUsageHistory = [];
    this.isOptimizing = false;
  }
}

// Export default instance
export const mobilePerformanceOptimizer = new MobilePerformanceOptimizer();