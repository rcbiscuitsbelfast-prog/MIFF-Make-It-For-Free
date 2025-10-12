#!/usr/bin/env tsx

/**
 * CameraSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the CameraSystemPure module functionality.
 */

import { CameraSystemPure, CameraDefinition, CameraInstance } from './index';
import { EventBus } from '../../EventsPure/index';
import { InputSystemPure } from '../../InputPure/index';
import { RNGPure } from '../../RNGPure/index';
import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

// Mock implementations for CLI
class RealEventBus {
  private logger: StructuredLogger;
  private events: Map<string, Function[]> = new Map();

  emit(event: string, data: any) {
    this.logger.info(`📡 Event emitted: ${event}`, data);
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }
}

class RealInputSystem {
  private actions: Map<string, Function> = new Map();

  registerAction(actionId: string, handler: Function) {
    this.actions.set(actionId, handler);
  }

  triggerAction(actionId: string, data?: any) {
    const handler = this.actions.get(actionId);
    if (handler) {
      handler(data);
    }
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

class CameraCLIHarness {
  private cameraSystem: CameraSystemPure;
  private eventBus: RealEventBus;
  private inputSystem: RealInputSystem;
  private rng: MockRNG;
  private running = true;
  private activeCamera: CameraInstance | null = null;
  private demoMode = false;
  private demoTimer?: NodeJS.Timeout;

  constructor() {
    this.logger = new StructuredLogger({ module: 'RealEventBus' });
    this.eventBus = new RealEventBus();
    this.inputSystem = new RealInputSystem();
    this.rng = new MockRNG();

    this.cameraSystem = new CameraSystemPure(this.eventBus as any, this.inputSystem as any, this.rng as any);

    // Setup event listeners
    this.setupEventListeners();
    this.setupInputActions();
  }

  private setupEventListeners() {
    this.eventBus.on('camera:created', (data) => {
      this.logger.info(`✅ Camera created: ${data.cameraId} (${data.cameraType})`);
      if (!this.activeCamera) {
        this.activeCamera = this.cameraSystem.getCameraInstance(data.cameraId);
      }
    });

    this.eventBus.on('camera:mode-switched', (data) => {
      this.logger.info(`🔄 Camera mode switched: ${data.fromMode} → ${data.toMode}`);
    });

    this.eventBus.on('camera:effect-applied', (data) => {
      this.logger.info(`✨ Camera effect applied: ${data.effectType} (${data.duration}ms)`);
    });

    this.eventBus.on('camera:path-started', (data) => {
      this.logger.info(`🎬 Camera path started: ${data.pathName} (${data.duration}ms)`);
    });

    this.eventBus.on('camera:path-completed', (data) => {
      this.logger.info(`🏁 Camera path completed: ${data.pathName}`);
    });
  }

  private setupInputActions() {
    this.inputSystem.registerAction('zoom_in', () => {
      if (this.activeCamera) {
        this.cameraSystem.adjustZoom(this.activeCamera.id, -1.0);
        this.logger.info('🔍 Zoomed in');
      }
    });

    this.inputSystem.registerAction('zoom_out', () => {
      if (this.activeCamera) {
        this.cameraSystem.adjustZoom(this.activeCamera.id, 1.0);
        this.logger.info('🔍 Zoomed out');
      }
    });

    this.inputSystem.registerAction('switch_chase', () => {
      if (this.activeCamera) {
        this.cameraSystem.switchCameraMode(this.activeCamera.id, 'chase');
      }
    });

    this.inputSystem.registerAction('switch_firstperson', () => {
      if (this.activeCamera) {
        this.cameraSystem.switchCameraMode(this.activeCamera.id, 'first-person');
      }
    });

    this.inputSystem.registerAction('switch_orbit', () => {
      if (this.activeCamera) {
        this.cameraSystem.switchCameraMode(this.activeCamera.id, 'orbit');
      }
    });

    this.inputSystem.registerAction('apply_shake', () => {
      if (this.activeCamera) {
        this.cameraSystem.applyShake(this.activeCamera.id, 0.5, 1000);
      }
    });

    this.inputSystem.registerAction('apply_focus', () => {
      if (this.activeCamera) {
        this.cameraSystem.applyFocus(this.activeCamera.id, 0.8, 2000);
      }
    });
  }

  private displayHelp() {
    this.logger.info('\n🎥 CameraSystemPure CLI Commands:');
    this.logger.info('=' .repeat(50));
    this.logger.info('📷 Camera Management:');
    this.logger.info('  create <type> <target>    - Create new camera (chase/first-person/orbit)');
    this.logger.info('  list                      - List all cameras');
    this.logger.info('  info <id>                 - Show camera details');
    this.logger.info('  set-main <id>             - Set main camera');
    this.logger.info('  remove <id>               - Remove camera');
    this.logger.info('');
    this.logger.info('🎮 Mode Control:');
    this.logger.info('  switch <mode>             - Switch active camera mode');
    this.logger.info('  modes                     - List available modes');
    this.logger.info('');
    this.logger.info('🎬 Cinematic Control:');
    this.logger.info('  path <name>               - Apply camera path');
    this.logger.info('  paths                     - List available paths');
    this.logger.info('  stop-path                 - Stop current path');
    this.logger.info('');
    this.logger.info('✨ Effects:');
    this.logger.info('  shake <intensity> <time>  - Apply shake effect');
    this.logger.info('  focus <intensity> <time>  - Apply focus effect');
    this.logger.info('  effects                   - List active effects');
    this.logger.info('');
    this.logger.info('⚙️  Configuration:');
    this.logger.info('  config                    - Show current config');
    this.logger.info('  set-rate <fps>            - Set update rate');
    this.logger.info('  set-quality <level>       - Set render quality');
    this.logger.info('');
    this.logger.info('📊 Statistics:');
    this.logger.info('  stats                     - Show system statistics');
    this.logger.info('  performance               - Performance metrics');
    this.logger.info('');
    this.logger.info('🎮 Demo & Testing:');
    this.logger.info('  demo                      - Run demo sequence');
    this.logger.info('  stress-test               - Performance stress test');
    this.logger.info('');
    this.logger.info('❓ Help & Info:');
    this.logger.info('  help                      - Show this help');
    this.logger.info('  exit                      - Exit CLI');
    this.logger.info('=' .repeat(50));
  }

  private async runCommand(command: string, args: string[]): Promise<void> {
    try {
      switch (command) {
        case 'create':
          await this.handleCreate(args);
          break;
        case 'list':
          await this.handleList();
          break;
        case 'info':
          await this.handleInfo(args);
          break;
        case 'set-main':
          await this.handleSetMain(args);
          break;
        case 'remove':
          await this.handleRemove(args);
          break;
        case 'switch':
          await this.handleSwitch(args);
          break;
        case 'modes':
          await this.handleModes();
          break;
        case 'path':
          await this.handlePath(args);
          break;
        case 'paths':
          await this.handlePaths();
          break;
        case 'stop-path':
          await this.handleStopPath();
          break;
        case 'shake':
          await this.handleShake(args);
          break;
        case 'focus':
          await this.handleFocus(args);
          break;
        case 'effects':
          await this.handleEffects();
          break;
        case 'config':
          await this.handleConfig();
          break;
        case 'set-rate':
          await this.handleSetRate(args);
          break;
        case 'set-quality':
          await this.handleSetQuality(args);
          break;
        case 'stats':
          await this.handleStats();
          break;
        case 'performance':
          await this.handlePerformance();
          break;
        case 'demo':
          await this.handleDemo(args);
          break;
        case 'stress-test':
          await this.handleStressTest(args);
          break;
        case 'help':
        case 'h':
          this.displayHelp();
          break;
        case 'exit':
        case 'quit':
          this.running = false;
          this.logger.info('👋 Goodbye!');
          break;
        default:
          this.logger.info(`❌ Unknown command: ${command}`);
          this.logger.info('Type "help" for available commands.');
      }
    } catch (error) {
      this.logger.error(`❌ Error executing command: ${error}`);
    }
  }

  private async handleCreate(args: string[]) {
    const type = args[0];
    const target = args[1] || 'default-target';

    if (!type || !['chase-camera', 'first-person-camera', 'orbit-camera', 'debug-camera'].includes(type)) {
      this.logger.info('❌ Invalid camera type. Available: chase-camera, first-person-camera, orbit-camera, debug-camera');
      return;
    }

    const camera = this.cameraSystem.createCamera(type, target);
    if (camera) {
      this.logger.info(`✅ Created ${type} targeting "${target}"`);
      this.logger.info(`📷 Camera ID: ${camera.id}`);
      this.activeCamera = camera;
    } else {
      this.logger.info('❌ Failed to create camera');
    }
  }

  private async handleList() {
    const cameras = this.cameraSystem.getAllCameras();
    this.logger.info(`\n📷 Active Cameras (${cameras.length}):`);
    this.logger.info('─'.repeat(60));

    if (cameras.length === 0) {
      this.logger.info('No cameras found. Create one with "create <type> <target>"');
      return;
    }

    cameras.forEach((camera, index) => {
      const isMain = this.cameraSystem.getMainCamera()?.id === camera.id ? ' (MAIN)' : '';
      const isActive = this.activeCamera?.id === camera.id ? ' (ACTIVE)' : '';

      this.logger.info(`${index + 1}. ${camera.definition.name} - ${camera.id}${isMain}${isActive}`);
      this.logger.info(`   Mode: ${camera.state.mode} | Target: ${camera.targetEntity}`);
      this.logger.info(`   Position: (${camera.state.position.x.toFixed(2)}, ${camera.state.position.y.toFixed(2)}, ${camera.state.position.z.toFixed(2)})`);
      this.logger.info(`   FOV: ${camera.currentSettings.fov}° | Distance: ${camera.currentSettings.distance}`);
      this.logger.info('');
    });
  }

  private async handleInfo(args: string[]) {
    const cameraId = args[0];
    if (!cameraId) {
      this.logger.info('❌ Camera ID required. Use "list" to see available cameras.');
      return;
    }

    const camera = this.cameraSystem.getCameraInstance(cameraId);
    if (!camera) {
      this.logger.info(`❌ Camera not found: ${cameraId}`);
      return;
    }

    this.logger.info(`\n📷 Camera Details: ${camera.id}`);
    this.logger.info('─'.repeat(50));
    this.logger.info(`Name: ${camera.definition.name}`);
    this.logger.info(`Type: ${camera.definition.id}`);
    this.logger.info(`Mode: ${camera.state.mode}`);
    this.logger.info(`Target: ${camera.targetEntity}`);
    this.logger.info(`Position: (${camera.state.position.x.toFixed(2)}, ${camera.state.position.y.toFixed(2)}, ${camera.state.position.z.toFixed(2)})`);
    this.logger.info(`Rotation: (${camera.state.rotation.x.toFixed(2)}, ${camera.state.rotation.y.toFixed(2)}, ${camera.state.rotation.z.toFixed(2)})`);
    this.logger.info(`FOV: ${camera.currentSettings.fov}°`);
    this.logger.info(`Distance: ${camera.currentSettings.distance}`);
    this.logger.info(`Update Count: ${camera.updateCount}`);
    this.logger.info(`Last Update: ${camera.lastUpdateTime}ms ago`);
    this.logger.info(`Effects: ${camera.effects.size}`);

    if (camera.effects.size > 0) {
      this.logger.info('Active Effects:');
      camera.effects.forEach((effect, effectId) => {
        this.logger.info(`  - ${effect.name} (${effect.type}) - ${effect.duration}ms remaining`);
      });
    }
  }

  private async handleSetMain(args: string[]) {
    const cameraId = args[0];
    if (!cameraId) {
      this.logger.info('❌ Camera ID required.');
      return;
    }

    const success = this.cameraSystem.setMainCamera(cameraId);
    if (success) {
      this.logger.info(`✅ Set main camera: ${cameraId}`);
    } else {
      this.logger.info(`❌ Failed to set main camera: ${cameraId}`);
    }
  }

  private async handleRemove(args: string[]) {
    const cameraId = args[0];
    if (!cameraId) {
      this.logger.info('❌ Camera ID required.');
      return;
    }

    const success = this.cameraSystem.removeCamera(cameraId);
    if (success) {
      this.logger.info(`✅ Removed camera: ${cameraId}`);
      if (this.activeCamera?.id === cameraId) {
        this.activeCamera = null;
      }
    } else {
      this.logger.info(`❌ Failed to remove camera: ${cameraId}`);
    }
  }

  private async handleSwitch(args: string[]) {
    const mode = args[0];
    if (!mode || !['chase', 'first-person', 'orbit', 'debug'].includes(mode)) {
      this.logger.info('❌ Invalid mode. Available: chase, first-person, orbit, debug');
      return;
    }

    if (!this.activeCamera) {
      this.logger.info('❌ No active camera. Create one first.');
      return;
    }

    const success = this.cameraSystem.switchCameraMode(this.activeCamera.id, mode);
    if (success) {
      this.logger.info(`✅ Switched to ${mode} mode`);
    } else {
      this.logger.info(`❌ Failed to switch to ${mode} mode`);
    }
  }

  private async handleModes() {
    this.logger.info('\n🎮 Available Camera Modes:');
    this.logger.info('─'.repeat(40));
    this.logger.info('1. chase        - Third-person following camera');
    this.logger.info('2. first-person - Immersive first-person view');
    this.logger.info('3. orbit        - Rotating orbit camera');
    this.logger.info('4. debug        - Development inspection camera');
    this.logger.info('');
    this.logger.info('💡 Each mode has different characteristics:');
    this.logger.info('   • Chase: Good for action games');
    this.logger.info('   • First-Person: Immersive gameplay');
    this.logger.info('   • Orbit: Strategy and inspection');
    this.logger.info('   • Debug: Development and testing');
  }

  private async handlePath(args: string[]) {
    const pathName = args[0];
    if (!pathName) {
      this.logger.info('❌ Path name required.');
      return;
    }

    const path = this.cameraSystem.getCameraPath(pathName);
    if (!path) {
      this.logger.info(`❌ Path not found: ${pathName}`);
      return;
    }

    if (!this.activeCamera) {
      this.logger.info('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyCameraPath(this.activeCamera.id, path);
    if (success) {
      this.logger.info(`✅ Applied path "${pathName}" to camera`);
    } else {
      this.logger.info(`❌ Failed to apply path: ${pathName}`);
    }
  }

  private async handlePaths() {
    const paths = this.cameraSystem.getAllPaths();
    this.logger.info(`\n🎬 Available Camera Paths (${paths.length}):`);
    this.logger.info('─'.repeat(50));

    paths.forEach((path, index) => {
      this.logger.info(`${index + 1}. ${path.name} (${path.id})`);
      this.logger.info(`   Duration: ${path.duration}ms`);
      this.logger.info(`   Waypoints: ${path.waypoints.length}`);
      this.logger.info(`   Loop: ${path.loop ? 'Yes' : 'No'}`);
      this.logger.info('');
    });
  }

  private async handleStopPath() {
    if (!this.activeCamera) {
      this.logger.info('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.stopCameraPath(this.activeCamera.id);
    if (success) {
      this.logger.info('✅ Stopped current camera path');
    } else {
      this.logger.info('❌ Failed to stop camera path');
    }
  }

  private async handleShake(args: string[]) {
    const intensity = parseFloat(args[0] || '0.5');
    const duration = parseInt(args[1] || '1000');

    if (!this.activeCamera) {
      this.logger.info('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyShake(this.activeCamera.id, intensity, duration);
    if (success) {
      this.logger.info(`✅ Applied shake effect (intensity: ${intensity}, duration: ${duration}ms)`);
    } else {
      this.logger.info('❌ Failed to apply shake effect');
    }
  }

  private async handleFocus(args: string[]) {
    const intensity = parseFloat(args[0] || '0.8');
    const duration = parseInt(args[1] || '2000');

    if (!this.activeCamera) {
      this.logger.info('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyFocus(this.activeCamera.id, intensity, duration);
    if (success) {
      this.logger.info(`✅ Applied focus effect (intensity: ${intensity}, duration: ${duration}ms)`);
    } else {
      this.logger.info('❌ Failed to apply focus effect');
    }
  }

  private async handleEffects() {
    if (!this.activeCamera) {
      this.logger.info('❌ No active camera.');
      return;
    }

    this.logger.info(`\n✨ Active Effects on ${this.activeCamera.id}:`);
    this.logger.info('─'.repeat(50));

    if (this.activeCamera.effects.size === 0) {
      this.logger.info('No active effects');
      return;
    }

    let index = 1;
    this.activeCamera.effects.forEach((effect, effectId) => {
      this.logger.info(`${index}. ${effect.name} (${effect.type})`);
      this.logger.info(`   Duration: ${effect.duration}ms remaining`);
      this.logger.info(`   Intensity: ${effect.intensity}`);
      this.logger.info(`   Priority: ${effect.priority}`);
      this.logger.info('');
      index++;
    });
  }

  private async handleConfig() {
    const config = this.cameraSystem.getConfig();
    this.logger.info('\n⚙️  Camera System Configuration:');
    this.logger.info('─'.repeat(40));
    this.logger.info(`Default Mode: ${config.defaultMode}`);
    this.logger.info(`Debug Camera: ${config.enableDebugCamera ? 'Enabled' : 'Disabled'}`);
    this.logger.info(`Cinematic Mode: ${config.enableCinematicMode ? 'Enabled' : 'Disabled'}`);
    this.logger.info(`Max Cameras: ${config.maxActiveCameras}`);
    this.logger.info(`Update Rate: ${config.updateRate} FPS`);
    this.logger.info(`Render Quality: ${config.renderQuality}`);
    this.logger.info(`Post Processing: ${config.enablePostProcessing ? 'Enabled' : 'Disabled'}`);
  }

  private async handleSetRate(args: string[]) {
    const fps = parseInt(args[0]);
    if (!fps || fps < 1 || fps > 240) {
      this.logger.info('❌ Invalid FPS rate. Must be between 1-240.');
      return;
    }

    const config = this.cameraSystem.getConfig();
    config.updateRate = fps;
    config.targetFPS = fps;
    this.cameraSystem.updateConfig(config);

    this.logger.info(`✅ Update rate set to ${fps} FPS`);
  }

  private async handleSetQuality(args: string[]) {
    const quality = args[0];
    if (!quality || !['low', 'medium', 'high', 'ultra'].includes(quality)) {
      this.logger.info('❌ Invalid quality level. Available: low, medium, high, ultra');
      return;
    }

    const config = this.cameraSystem.getConfig();
    config.renderQuality = quality as 'low' | 'medium' | 'high' | 'ultra';
    this.cameraSystem.updateConfig(config);

    this.logger.info(`✅ Render quality set to ${quality}`);
  }

  private async handleStats() {
    const stats = this.cameraSystem.getStats();
    this.logger.info('\n📊 Camera System Statistics:');
    this.logger.info('─'.repeat(40));
    this.logger.info(`Total Cameras: ${stats.totalCameras}`);
    this.logger.info(`Active Cameras: ${stats.activeCameras}`);
    this.logger.info(`Mode Switches: ${stats.modeSwitches}`);
    this.logger.info(`Cinematic Sequences: ${stats.cinematicSequences}`);
    this.logger.info(`Paths Created: ${stats.pathsCreated}`);
    this.logger.info(`Effects Applied: ${stats.effectsApplied}`);
    this.logger.info(`Total Play Time: ${stats.totalPlayTime}ms`);
    this.logger.info(`Average FPS: ${stats.averageFPS.toFixed(1)}`);
    this.logger.info(`Memory Usage: ${(stats.memoryUsage / 1024).toFixed(1)} KB`);
  }

  private async handlePerformance() {
    const stats = this.cameraSystem.getStats();
    this.logger.info('\n⚡ Performance Metrics:');
    this.logger.info('─'.repeat(40));

    // Simulate performance metrics
    const avgUpdateTime = stats.totalPlayTime / Math.max(stats.totalCameras * 60, 1);
    const efficiency = stats.activeCameras > 0 ? (stats.averageFPS / 60) * 100 : 100;

    this.logger.info(`Average Update Time: ${avgUpdateTime.toFixed(2)}ms`);
    this.logger.info(`Camera Efficiency: ${efficiency.toFixed(1)}%`);
    this.logger.info(`Frame Drops: ${Math.max(0, 60 - stats.averageFPS)} estimated`);
    this.logger.info(`Memory Efficiency: ${((1 - (stats.memoryUsage / (1024 * 1024))) * 100).toFixed(1)}%`);
  }

  private async handleDemo(args: string[]) {
    const duration = parseInt(args[0] || '30000'); // 30 seconds default
    this.demoMode = true;

    this.logger.info(`🎬 Starting demo sequence (${duration}ms)...`);
    this.logger.info('Press Ctrl+C to stop demo');

    // Create demo cameras
    const chaseCamera = this.cameraSystem.createCamera('chase-camera', 'demo-player');
    const orbitCamera = this.cameraSystem.createCamera('orbit-camera', 'demo-target');

    if (chaseCamera && orbitCamera) {
      this.activeCamera = chaseCamera;

      let demoStep = 0;
      const demoInterval = setInterval(() => {
        if (!this.demoMode) {
          clearInterval(demoInterval);
          return;
        }

        demoStep++;

        switch (demoStep % 6) {
          case 0:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'chase');
            this.cameraSystem.applyShake(chaseCamera.id, 0.3, 500);
            this.logger.info('🎯 Chase mode with shake');
            break;
          case 1:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'first-person');
            this.logger.info('👁️  First-person mode');
            break;
          case 2:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'orbit');
            this.logger.info('🌀 Orbit mode');
            break;
          case 3:
            this.cameraSystem.applyFocus(orbitCamera.id, 0.7, 1000);
            this.logger.info('🎭 Focus effect');
            break;
          case 4:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'chase');
            this.logger.info('🎯 Back to chase');
            break;
          case 5:
            this.cameraSystem.applyShake(chaseCamera.id, 0.8, 2000);
            this.logger.info('💥 Strong shake effect');
            break;
        }

        // Update camera system
        this.cameraSystem.updateCameraSystem(1/60);
      }, 2000);

      // Stop demo after duration
      setTimeout(() => {
        this.demoMode = false;
        clearInterval(demoInterval);
        this.logger.info('🏁 Demo completed!');
      }, duration);
    }
  }

  private async handleStressTest(args: string[]) {
    const cameraCount = parseInt(args[0] || '20');
    const duration = parseInt(args[1] || '10000');

    this.logger.info(`🔥 Starting stress test with ${cameraCount} cameras for ${duration}ms...`);

    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Create many cameras
    const cameras: CameraInstance[] = [];
    for (let i = 0; i < cameraCount; i++) {
      const camera = this.cameraSystem.createCamera('chase-camera', `stress-target-${i}`);
      if (camera) {
        cameras.push(camera);
      }
    }

    this.logger.info(`✅ Created ${cameras.length} cameras`);

    // Stress test updates
    let updateCount = 0;
    const stressInterval = setInterval(() => {
      const deltaTime = 1/60;
      this.cameraSystem.updateCameraSystem(deltaTime);
      updateCount++;

      // Randomly switch modes
      if (cameras.length > 0 && Math.random() < 0.1) {
        const randomCamera = cameras[Math.floor(Math.random() * cameras.length)];
        const modes = ['chase', 'first-person', 'orbit'];
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        this.cameraSystem.switchCameraMode(randomCamera.id, randomMode);
      }
    }, 16); // ~60 FPS

    setTimeout(() => {
      clearInterval(stressInterval);

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      const duration = endTime - startTime;
      const memoryIncrease = endMemory - startMemory;

      this.logger.info('\n📊 Stress Test Results:');
      this.logger.info('─'.repeat(40));
      this.logger.info(`Duration: ${duration.toFixed(0)}ms`);
      this.logger.info(`Updates: ${updateCount}`);
      this.logger.info(`Avg Update Time: ${(duration / updateCount).toFixed(3)}ms`);
      this.logger.info(`Memory Increase: ${(memoryIncrease / 1024).toFixed(1)} KB`);
      this.logger.info(`Final FPS: ${(updateCount * 1000 / duration).toFixed(1)}`);

      const stats = this.cameraSystem.getStats();
      this.logger.info(`Mode Switches: ${stats.modeSwitches}`);
      this.logger.info(`Effects Applied: ${stats.effectsApplied}`);
    }, duration);
  }

  public async run() {
    this.logger.info('🎥 CameraSystemPure CLI Harness');
    this.logger.info('Type "help" for commands or "demo" for a demonstration');
    this.logger.info('─'.repeat(60));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'camera> '
    });

    rl.prompt();

    rl.on('line', async (line: string) => {
      const input = line.trim();
      if (input) {
        const parts = input.split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        await this.runCommand(command, args);
      }

      if (this.running) {
        rl.prompt();
      } else {
        rl.close();
      }
    });

    rl.on('SIGINT', () => {
      this.demoMode = false;
      if (this.demoTimer) {
        clearTimeout(this.demoTimer);
      }
      this.running = false;
      this.logger.info('\n👋 Exiting...');
      rl.close();
    });
  }
}

// Main execution
async function main() {
  const cli = new CameraCLIHarness();

  if (process.argv.includes('--demo')) {
    this.logger.info('🚀 Running in demo mode...');
    await cli.runCommand('demo', ['10000']);
    process.exit(0);
  } else if (process.argv.includes('--stress-test')) {
    this.logger.info('🔥 Running stress test...');
    await cli.runCommand('stress-test', ['50', '5000']);
    process.exit(0);
  } else {
    await cli.run();
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  this.logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  this.logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(console.error);