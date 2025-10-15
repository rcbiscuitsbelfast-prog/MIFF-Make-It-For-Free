#!/usr/bin/env tsx

/**
 * CameraSystemPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the CameraSystemPure module functionality.
 */

import { CameraSystemPure, CameraInstance } from './index';
import { RNGPure } from '../RNGPure/index';
import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';
import { StructuredLogger } from './shared/logging/StructuredLogger';

// Mock implementations for CLI
class RealEventBus {
  
  private events: Map<string, Function[]> = new Map();

  emit(event: string, data: any) {
    console.info(`📡 Event emitted: ${event}`, data);
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(handler);
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
  

  constructor(...args: any[]) {
    
    this.eventBus = new RealEventBus();
    this.inputSystem = new RealInputSystem();
    this.rng = new MockRNG();

    this.cameraSystem = new CameraSystemPure(this.eventBus as any, this.inputSystem as any, this.rng as any);

    // Setup event listeners
    this.setupEventListeners();
    this.setupInputActions();
  }

  private setupEventListeners(...args: any[]) {
    this.eventBus.on('camera:created', (data) => {
      console.info(`✅ Camera created: ${data.cameraId} (${data.cameraType})`);
      if (!this.activeCamera) {
        this.activeCamera = this.cameraSystem.getCameraInstance(data.cameraId);
      }
    });

    this.eventBus.on('camera:mode-switched', (data) => {
      console.info(`🔄 Camera mode switched: ${data.fromMode} → ${data.toMode}`);
    });

    this.eventBus.on('camera:effect-applied', (data) => {
      console.info(`✨ Camera effect applied: ${data.effectType} (${data.duration}ms)`);
    });

    this.eventBus.on('camera:path-started', (data) => {
      console.info(`🎬 Camera path started: ${data.pathName} (${data.duration}ms)`);
    });

    this.eventBus.on('camera:path-completed', (data) => {
      console.info(`🏁 Camera path completed: ${data.pathName}`);
    });
  }

  private setupInputActions(...args: any[]) {
    this.inputSystem.registerAction('zoom_in', () => {
      if (this.activeCamera) {
        this.cameraSystem.adjustZoom(this.activeCamera.id, -1.0);
        console.info('🔍 Zoomed in');
      }
    });

    this.inputSystem.registerAction('zoom_out', () => {
      if (this.activeCamera) {
        this.cameraSystem.adjustZoom(this.activeCamera.id, 1.0);
        console.info('🔍 Zoomed out');
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

  private displayHelp(...args: any[]) {
    console.info('\n🎥 CameraSystemPure CLI Commands:');
    console.info('=' .repeat(50));
    console.info('📷 Camera Management:');
    console.info('  create <type> <target>    - Create new camera (chase/first-person/orbit)');
    console.info('  list                      - List all cameras');
    console.info('  info <id>                 - Show camera details');
    console.info('  set-main <id>             - Set main camera');
    console.info('  remove <id>               - Remove camera');
    console.info('');
    console.info('🎮 Mode Control:');
    console.info('  switch <mode>             - Switch active camera mode');
    console.info('  modes                     - List available modes');
    console.info('');
    console.info('🎬 Cinematic Control:');
    console.info('  path <name>               - Apply camera path');
    console.info('  paths                     - List available paths');
    console.info('  stop-path                 - Stop current path');
    console.info('');
    console.info('✨ Effects:');
    console.info('  shake <intensity> <time>  - Apply shake effect');
    console.info('  focus <intensity> <time>  - Apply focus effect');
    console.info('  effects                   - List active effects');
    console.info('');
    console.info('⚙️  Configuration:');
    console.info('  config                    - Show current config');
    console.info('  set-rate <fps>            - Set update rate');
    console.info('  set-quality <level>       - Set render quality');
    console.info('');
    console.info('📊 Statistics:');
    console.info('  stats                     - Show system statistics');
    console.info('  performance               - Performance metrics');
    console.info('');
    console.info('🎮 Demo & Testing:');
    console.info('  demo                      - Run demo sequence');
    console.info('  stress-test               - Performance stress test');
    console.info('');
    console.info('❓ Help & Info:');
    console.info('  help                      - Show this help');
    console.info('  exit                      - Exit CLI');
    console.info('=' .repeat(50));
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
          console.info('👋 Goodbye!');
          break;
        default:
          console.info(`❌ Unknown command: ${command}`);
          console.info('Type "help" for available commands.');
      }
    } catch (error) {
      console.error(`❌ Error executing command: ${error}`);
    }
  }

  private async handleCreate(args: string[]) {
    const type = args[0];
    const target = args[1] || 'default-target';

    if (!type || !['chase-camera', 'first-person-camera', 'orbit-camera', 'debug-camera'].includes(type)) {
      console.info('❌ Invalid camera type. Available: chase-camera, first-person-camera, orbit-camera, debug-camera');
      return;
    }

    const camera = this.cameraSystem.createCamera(type, target);
    if (camera) {
      console.info(`✅ Created ${type} targeting "${target}"`);
      console.info(`📷 Camera ID: ${camera.id}`);
      this.activeCamera = camera;
    } else {
      console.info('❌ Failed to create camera');
    }
  }

  private async handleList(...args: any[]) {
    const cameras = this.cameraSystem.getAllCameras();
    console.info(`\n📷 Active Cameras (${cameras.length}):`);
    console.info('─'.repeat(60));

    if (cameras.length === 0) {
      console.info('No cameras found. Create one with "create <type> <target>"');
      return;
    }

    cameras.forEach((camera, index) => {
      const isMain = this.cameraSystem.getMainCamera()?.id === camera.id ? ' (MAIN)' : '';
      const isActive = this.activeCamera?.id === camera.id ? ' (ACTIVE)' : '';

      console.info(`${index + 1}. ${camera.definition.name} - ${camera.id}${isMain}${isActive}`);
      console.info(`   Mode: ${camera.state.mode} | Target: ${camera.targetEntity}`);
      console.info(`   Position: (${camera.state.position.x.toFixed(2)}, ${camera.state.position.y.toFixed(2)}, ${camera.state.position.z.toFixed(2)})`);
      console.info(`   FOV: ${camera.currentSettings.fov}° | Distance: ${camera.currentSettings.distance}`);
      console.info('');
    });
  }

  private async handleInfo(args: string[]) {
    const cameraId = args[0];
    if (!cameraId) {
      console.info('❌ Camera ID required. Use "list" to see available cameras.');
      return;
    }

    const camera = this.cameraSystem.getCameraInstance(cameraId);
    if (!camera) {
      console.info(`❌ Camera not found: ${cameraId}`);
      return;
    }

    console.info(`\n📷 Camera Details: ${camera.id}`);
    console.info('─'.repeat(50));
    console.info(`Name: ${camera.definition.name}`);
    console.info(`Type: ${camera.definition.id}`);
    console.info(`Mode: ${camera.state.mode}`);
    console.info(`Target: ${camera.targetEntity}`);
    console.info(`Position: (${camera.state.position.x.toFixed(2)}, ${camera.state.position.y.toFixed(2)}, ${camera.state.position.z.toFixed(2)})`);
    console.info(`Rotation: (${camera.state.rotation.x.toFixed(2)}, ${camera.state.rotation.y.toFixed(2)}, ${camera.state.rotation.z.toFixed(2)})`);
    console.info(`FOV: ${camera.currentSettings.fov}°`);
    console.info(`Distance: ${camera.currentSettings.distance}`);
    console.info(`Update Count: ${camera.updateCount}`);
    console.info(`Last Update: ${camera.lastUpdateTime}ms ago`);
    console.info(`Effects: ${camera.effects.size}`);

    if (camera.effects.size > 0) {
      console.info('Active Effects:');
      camera.effects.forEach((effect, effectId) => {
        console.info(`  - ${effect.name} (${effect.type}) - ${effect.duration}ms remaining`);
      });
    }
  }

  private async handleSetMain(args: string[]) {
    const cameraId = args[0];
    if (!cameraId) {
      console.info('❌ Camera ID required.');
      return;
    }

    const success = this.cameraSystem.setMainCamera(cameraId);
    if (success) {
      console.info(`✅ Set main camera: ${cameraId}`);
    } else {
      console.info(`❌ Failed to set main camera: ${cameraId}`);
    }
  }

  private async handleRemove(args: string[]) {
    const cameraId = args[0];
    if (!cameraId) {
      console.info('❌ Camera ID required.');
      return;
    }

    const success = this.cameraSystem.removeCamera(cameraId);
    if (success) {
      console.info(`✅ Removed camera: ${cameraId}`);
      if (this.activeCamera?.id === cameraId) {
        this.activeCamera = null;
      }
    } else {
      console.info(`❌ Failed to remove camera: ${cameraId}`);
    }
  }

  private async handleSwitch(args: string[]) {
    const mode = args[0];
    if (!mode || !['chase', 'first-person', 'orbit', 'debug'].includes(mode)) {
      console.info('❌ Invalid mode. Available: chase, first-person, orbit, debug');
      return;
    }

    if (!this.activeCamera) {
      console.info('❌ No active camera. Create one first.');
      return;
    }

    const success = this.cameraSystem.switchCameraMode(this.activeCamera.id, mode);
    if (success) {
      console.info(`✅ Switched to ${mode} mode`);
    } else {
      console.info(`❌ Failed to switch to ${mode} mode`);
    }
  }

  private async handleModes(...args: any[]) {
    console.info('\n🎮 Available Camera Modes:');
    console.info('─'.repeat(40));
    console.info('1. chase        - Third-person following camera');
    console.info('2. first-person - Immersive first-person view');
    console.info('3. orbit        - Rotating orbit camera');
    console.info('4. debug        - Development inspection camera');
    console.info('');
    console.info('💡 Each mode has different characteristics:');
    console.info('   • Chase: Good for action games');
    console.info('   • First-Person: Immersive gameplay');
    console.info('   • Orbit: Strategy and inspection');
    console.info('   • Debug: Development and testing');
  }

  private async handlePath(args: string[]) {
    const pathName = args[0];
    if (!pathName) {
      console.info('❌ Path name required.');
      return;
    }

    const path = this.cameraSystem.getCameraPath(pathName);
    if (!path) {
      console.info(`❌ Path not found: ${pathName}`);
      return;
    }

    if (!this.activeCamera) {
      console.info('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyCameraPath(this.activeCamera.id, path);
    if (success) {
      console.info(`✅ Applied path "${pathName}" to camera`);
    } else {
      console.info(`❌ Failed to apply path: ${pathName}`);
    }
  }

  private async handlePaths(...args: any[]) {
    const paths = this.cameraSystem.getAllPaths();
    console.info(`\n🎬 Available Camera Paths (${paths.length}):`);
    console.info('─'.repeat(50));

    paths.forEach((path, index) => {
      console.info(`${index + 1}. ${path.name} (${path.id})`);
      console.info(`   Duration: ${path.duration}ms`);
      console.info(`   Waypoints: ${path.waypoints.length}`);
      console.info(`   Loop: ${path.loop ? 'Yes' : 'No'}`);
      console.info('');
    });
  }

  private async handleStopPath(...args: any[]) {
    if (!this.activeCamera) {
      console.info('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.stopCameraPath(this.activeCamera.id);
    if (success) {
      console.info('✅ Stopped current camera path');
    } else {
      console.info('❌ Failed to stop camera path');
    }
  }

  private async handleShake(args: string[]) {
    const intensity = parseFloat(args[0] || '0.5');
    const duration = parseInt(args[1] || '1000');

    if (!this.activeCamera) {
      console.info('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyShake(this.activeCamera.id, intensity, duration);
    if (success) {
      console.info(`✅ Applied shake effect (intensity: ${intensity}, duration: ${duration}ms)`);
    } else {
      console.info('❌ Failed to apply shake effect');
    }
  }

  private async handleFocus(args: string[]) {
    const intensity = parseFloat(args[0] || '0.8');
    const duration = parseInt(args[1] || '2000');

    if (!this.activeCamera) {
      console.info('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyFocus(this.activeCamera.id, intensity, duration);
    if (success) {
      console.info(`✅ Applied focus effect (intensity: ${intensity}, duration: ${duration}ms)`);
    } else {
      console.info('❌ Failed to apply focus effect');
    }
  }

  private async handleEffects(...args: any[]) {
    if (!this.activeCamera) {
      console.info('❌ No active camera.');
      return;
    }

    console.info(`\n✨ Active Effects on ${this.activeCamera.id}:`);
    console.info('─'.repeat(50));

    if (this.activeCamera.effects.size === 0) {
      console.info('No active effects');
      return;
    }

    let index = 1;
    this.activeCamera.effects.forEach((effect, effectId) => {
      console.info(`${index}. ${effect.name} (${effect.type})`);
      console.info(`   Duration: ${effect.duration}ms remaining`);
      console.info(`   Intensity: ${effect.intensity}`);
      console.info(`   Priority: ${effect.priority}`);
      console.info('');
      index++;
    });
  }

  private async handleConfig(...args: any[]) {
    const config = this.cameraSystem.getConfig();
    console.info('\n⚙️  Camera System Configuration:');
    console.info('─'.repeat(40));
    console.info(`Default Mode: ${config.defaultMode}`);
    console.info(`Debug Camera: ${config.enableDebugCamera ? 'Enabled' : 'Disabled'}`);
    console.info(`Cinematic Mode: ${config.enableCinematicMode ? 'Enabled' : 'Disabled'}`);
    console.info(`Max Cameras: ${config.maxActiveCameras}`);
    console.info(`Update Rate: ${config.updateRate} FPS`);
    console.info(`Render Quality: ${config.renderQuality}`);
    console.info(`Post Processing: ${config.enablePostProcessing ? 'Enabled' : 'Disabled'}`);
  }

  private async handleSetRate(args: string[]) {
    const fps = parseInt(args[0]);
    if (!fps || fps < 1 || fps > 240) {
      console.info('❌ Invalid FPS rate. Must be between 1-240.');
      return;
    }

    const config = this.cameraSystem.getConfig();
    config.updateRate = fps;
    config.targetFPS = fps;
    this.cameraSystem.updateConfig(config);

    console.info(`✅ Update rate set to ${fps} FPS`);
  }

  private async handleSetQuality(args: string[]) {
    const quality = args[0];
    if (!quality || !['low', 'medium', 'high', 'ultra'].includes(quality)) {
      console.info('❌ Invalid quality level. Available: low, medium, high, ultra');
      return;
    }

    const config = this.cameraSystem.getConfig();
    config.renderQuality = quality as 'low' | 'medium' | 'high' | 'ultra';
    this.cameraSystem.updateConfig(config);

    console.info(`✅ Render quality set to ${quality}`);
  }

  private async handleStats(...args: any[]) {
    const stats = this.cameraSystem.getStats();
    console.info('\n📊 Camera System Statistics:');
    console.info('─'.repeat(40));
    console.info(`Total Cameras: ${stats.totalCameras}`);
    console.info(`Active Cameras: ${stats.activeCameras}`);
    console.info(`Mode Switches: ${stats.modeSwitches}`);
    console.info(`Cinematic Sequences: ${stats.cinematicSequences}`);
    console.info(`Paths Created: ${stats.pathsCreated}`);
    console.info(`Effects Applied: ${stats.effectsApplied}`);
    console.info(`Total Play Time: ${stats.totalPlayTime}ms`);
    console.info(`Average FPS: ${stats.averageFPS.toFixed(1)}`);
    console.info(`Memory Usage: ${(stats.memoryUsage / 1024).toFixed(1)} KB`);
  }

  private async handlePerformance(...args: any[]) {
    const stats = this.cameraSystem.getStats();
    console.info('\n⚡ Performance Metrics:');
    console.info('─'.repeat(40));

    // Simulate performance metrics
    const avgUpdateTime = stats.totalPlayTime / Math.max(stats.totalCameras * 60, 1);
    const efficiency = stats.activeCameras > 0 ? (stats.averageFPS / 60) * 100 : 100;

    console.info(`Average Update Time: ${avgUpdateTime.toFixed(2)}ms`);
    console.info(`Camera Efficiency: ${efficiency.toFixed(1)}%`);
    console.info(`Frame Drops: ${Math.max(0, 60 - stats.averageFPS)} estimated`);
    console.info(`Memory Efficiency: ${((1 - (stats.memoryUsage / (1024 * 1024))) * 100).toFixed(1)}%`);
  }

  private async handleDemo(args: string[]) {
    const duration = parseInt(args[0] || '30000'); // 30 seconds default
    this.demoMode = true;

    console.info(`🎬 Starting demo sequence (${duration}ms)...`);
    console.info('Press Ctrl+C to stop demo');

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
            console.info('🎯 Chase mode with shake');
            break;
          case 1:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'first-person');
            console.info('👁️  First-person mode');
            break;
          case 2:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'orbit');
            console.info('🌀 Orbit mode');
            break;
          case 3:
            this.cameraSystem.applyFocus(orbitCamera.id, 0.7, 1000);
            console.info('🎭 Focus effect');
            break;
          case 4:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'chase');
            console.info('🎯 Back to chase');
            break;
          case 5:
            this.cameraSystem.applyShake(chaseCamera.id, 0.8, 2000);
            console.info('💥 Strong shake effect');
            break;
        }

        // Update camera system
        this.cameraSystem.updateCameraSystem(1/60);
      }, 2000);

      // Stop demo after duration
      setTimeout(() => {
        this.demoMode = false;
        clearInterval(demoInterval);
        console.info('🏁 Demo completed!');
      }, duration);
    }
  }

  private async handleStressTest(args: string[]) {
    const cameraCount = parseInt(args[0] || '20');
    const duration = parseInt(args[1] || '10000');

    console.info(`🔥 Starting stress test with ${cameraCount} cameras for ${duration}ms...`);

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

    console.info(`✅ Created ${cameras.length} cameras`);

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

      console.info('\n📊 Stress Test Results:');
      console.info('─'.repeat(40));
      console.info(`Duration: ${duration.toFixed(0)}ms`);
      console.info(`Updates: ${updateCount}`);
      console.info(`Avg Update Time: ${(duration / updateCount).toFixed(3)}ms`);
      console.info(`Memory Increase: ${(memoryIncrease / 1024).toFixed(1)} KB`);
      console.info(`Final FPS: ${(updateCount * 1000 / duration).toFixed(1)}`);

      const stats = this.cameraSystem.getStats();
      console.info(`Mode Switches: ${stats.modeSwitches}`);
      console.info(`Effects Applied: ${stats.effectsApplied}`);
    }, duration);
  }

  public async run(...args: any[]) {
    console.info('🎥 CameraSystemPure CLI Harness');
    console.info('Type "help" for commands or "demo" for a demonstration');
    console.info('─'.repeat(60));

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
      console.info('\n👋 Exiting...');
      rl.close();
    });
  }
}

// Main execution
async function main(...args: any[]) {
  const cli = new CameraCLIHarness();

  if (process.argv.includes('--demo')) {
    console.info('🚀 Running in demo mode...');
    await cli.runCommand('demo', ['10000']);
    process.exit(0);
  } else if (process.argv.includes('--stress-test')) {
    console.info('🔥 Running stress test...');
    await cli.runCommand('stress-test', ['50', '5000']);
    process.exit(0);
  } else {
    await cli.run();
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(console.error);