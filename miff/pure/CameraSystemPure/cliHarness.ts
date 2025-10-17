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

// Mock implementations for CLI
class MockEventBus {
  private events: Map<string, Function[]> = new Map();

  emit(event: string, data: any) {
    console.log(`📡 Event emitted: ${event}`, data);
    const handlers = this.events.get(event) || [];
    handlers.forEach((handler: any) => handler(data));
  }

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }
}

class MockInputSystem {
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
  private eventBus: MockEventBus;
  private inputSystem: MockInputSystem;
  private rng: MockRNG;
  private running = true;
  private activeCamera: CameraInstance | null = null;
  private demoMode = false;
  private demoTimer?: NodeJS.Timeout;

  constructor() {
    this.eventBus = new MockEventBus();
    this.inputSystem = new MockInputSystem();
    this.rng = new MockRNG();

    this.cameraSystem = new CameraSystemPure(this.eventBus as any, this.inputSystem as any, this.rng as any);

    // Setup event listeners
    this.setupEventListeners();
    this.setupInputActions();
  }

  private setupEventListeners() {
    this.eventBus.on('camera:created', (data) => {
      console.log(`✅ Camera created: ${data.cameraId} (${data.cameraType})`);
      if (!this.activeCamera) {
        this.activeCamera = this.cameraSystem.getCameraInstance(data.cameraId);
      }
    });

    this.eventBus.on('camera:mode-switched', (data) => {
      console.log(`🔄 Camera mode switched: ${data.fromMode} → ${data.toMode}`);
    });

    this.eventBus.on('camera:effect-applied', (data) => {
      console.log(`✨ Camera effect applied: ${data.effectType} (${data.duration}ms)`);
    });

    this.eventBus.on('camera:path-started', (data) => {
      console.log(`🎬 Camera path started: ${data.pathName} (${data.duration}ms)`);
    });

    this.eventBus.on('camera:path-completed', (data) => {
      console.log(`🏁 Camera path completed: ${data.pathName}`);
    });
  }

  private setupInputActions() {
    this.inputSystem.registerAction('zoom_in', () => {
      if (this.activeCamera) {
        this.cameraSystem.adjustZoom(this.activeCamera.id, -1.0);
        console.log('🔍 Zoomed in');
      }
    });

    this.inputSystem.registerAction('zoom_out', () => {
      if (this.activeCamera) {
        this.cameraSystem.adjustZoom(this.activeCamera.id, 1.0);
        console.log('🔍 Zoomed out');
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
    console.log('\n🎥 CameraSystemPure CLI Commands:');
    console.log('=' .repeat(50));
    console.log('📷 Camera Management:');
    console.log('  create <type> <target>    - Create new camera (chase/first-person/orbit)');
    console.log('  list                      - List all cameras');
    console.log('  info <id>                 - Show camera details');
    console.log('  set-main <id>             - Set main camera');
    console.log('  remove <id>               - Remove camera');
    console.log('');
    console.log('🎮 Mode Control:');
    console.log('  switch <mode>             - Switch active camera mode');
    console.log('  modes                     - List available modes');
    console.log('');
    console.log('🎬 Cinematic Control:');
    console.log('  path <name>               - Apply camera path');
    console.log('  paths                     - List available paths');
    console.log('  stop-path                 - Stop current path');
    console.log('');
    console.log('✨ Effects:');
    console.log('  shake <intensity> <time>  - Apply shake effect');
    console.log('  focus <intensity> <time>  - Apply focus effect');
    console.log('  effects                   - List active effects');
    console.log('');
    console.log('⚙️  Configuration:');
    console.log('  config                    - Show current config');
    console.log('  set-rate <fps>            - Set update rate');
    console.log('  set-quality <level>       - Set render quality');
    console.log('');
    console.log('📊 Statistics:');
    console.log('  stats                     - Show system statistics');
    console.log('  performance               - Performance metrics');
    console.log('');
    console.log('🎮 Demo & Testing:');
    console.log('  demo                      - Run demo sequence');
    console.log('  stress-test               - Performance stress test');
    console.log('');
    console.log('❓ Help & Info:');
    console.log('  help                      - Show this help');
    console.log('  exit                      - Exit CLI');
    console.log('=' .repeat(50));
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
          console.log('👋 Goodbye!');
          break;
        default:
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Error executing command: ${error}`);
    }
  }

  private async handleCreate(args: string[]) {
    const type = args[0!];
    const target = args[1!] || 'default-target';

    if (!type || !['chase-camera', 'first-person-camera', 'orbit-camera', 'debug-camera'].includes(type)) {
      console.log('❌ Invalid camera type. Available: chase-camera, first-person-camera, orbit-camera, debug-camera');
      return;
    }

    const camera = this.cameraSystem.createCamera(type, target);
    if (camera) {
      console.log(`✅ Created ${type} targeting "${target}"`);
      console.log(`📷 Camera ID: ${camera.id}`);
      this.activeCamera = camera;
    } else {
      console.log('❌ Failed to create camera');
    }
  }

  private async handleList() {
    const cameras = this.cameraSystem.getAllCameras();
    console.log(`\n📷 Active Cameras (${cameras.length}):`);
    console.log('─'.repeat(60));

    if (cameras.length === 0) {
      console.log('No cameras found. Create one with "create <type> <target>"');
      return;
    }

    cameras.forEach((camera, index) => {
      const isMain = this.cameraSystem.getMainCamera()?.id === camera.id ? ' (MAIN)' : '';
      const isActive = this.activeCamera?.id === camera.id ? ' (ACTIVE)' : '';

      console.log(`${index + 1}. ${camera.definition.name} - ${camera.id}${isMain}${isActive}`);
      console.log(`   Mode: ${camera.state.mode} | Target: ${camera.targetEntity}`);
      console.log(`   Position: (${camera.state.position.x.toFixed(2)}, ${camera.state.position.y.toFixed(2)}, ${camera.state.position.z.toFixed(2)})`);
      console.log(`   FOV: ${camera.currentSettings.fov}° | Distance: ${camera.currentSettings.distance}`);
      console.log('');
    });
  }

  private async handleInfo(args: string[]) {
    const cameraId = args[0!];
    if (!cameraId) {
      console.log('❌ Camera ID required. Use "list" to see available cameras.');
      return;
    }

    const camera = this.cameraSystem.getCameraInstance(cameraId);
    if (!camera) {
      console.log(`❌ Camera not found: ${cameraId}`);
      return;
    }

    console.log(`\n📷 Camera Details: ${camera.id}`);
    console.log('─'.repeat(50));
    console.log(`Name: ${camera.definition.name}`);
    console.log(`Type: ${camera.definition.id}`);
    console.log(`Mode: ${camera.state.mode}`);
    console.log(`Target: ${camera.targetEntity}`);
    console.log(`Position: (${camera.state.position.x.toFixed(2)}, ${camera.state.position.y.toFixed(2)}, ${camera.state.position.z.toFixed(2)})`);
    console.log(`Rotation: (${camera.state.rotation.x.toFixed(2)}, ${camera.state.rotation.y.toFixed(2)}, ${camera.state.rotation.z.toFixed(2)})`);
    console.log(`FOV: ${camera.currentSettings.fov}°`);
    console.log(`Distance: ${camera.currentSettings.distance}`);
    console.log(`Update Count: ${camera.updateCount}`);
    console.log(`Last Update: ${camera.lastUpdateTime}ms ago`);
    console.log(`Effects: ${camera.effects.size}`);

    if (camera.effects.size > 0) {
      console.log('Active Effects:');
      camera.effects.forEach((effect, effectId) => {
        console.log(`  - ${effect.name} (${effect.type}) - ${effect.duration}ms remaining`);
      });
    }
  }

  private async handleSetMain(args: string[]) {
    const cameraId = args[0!];
    if (!cameraId) {
      console.log('❌ Camera ID required.');
      return;
    }

    const success = this.cameraSystem.setMainCamera(cameraId);
    if (success) {
      console.log(`✅ Set main camera: ${cameraId}`);
    } else {
      console.log(`❌ Failed to set main camera: ${cameraId}`);
    }
  }

  private async handleRemove(args: string[]) {
    const cameraId = args[0!];
    if (!cameraId) {
      console.log('❌ Camera ID required.');
      return;
    }

    const success = this.cameraSystem.removeCamera(cameraId);
    if (success) {
      console.log(`✅ Removed camera: ${cameraId}`);
      if (this.activeCamera?.id === cameraId) {
        this.activeCamera = null;
      }
    } else {
      console.log(`❌ Failed to remove camera: ${cameraId}`);
    }
  }

  private async handleSwitch(args: string[]) {
    const mode = args[0!];
    if (!mode || !['chase', 'first-person', 'orbit', 'debug'].includes(mode)) {
      console.log('❌ Invalid mode. Available: chase, first-person, orbit, debug');
      return;
    }

    if (!this.activeCamera) {
      console.log('❌ No active camera. Create one first.');
      return;
    }

    const success = this.cameraSystem.switchCameraMode(this.activeCamera.id, mode);
    if (success) {
      console.log(`✅ Switched to ${mode} mode`);
    } else {
      console.log(`❌ Failed to switch to ${mode} mode`);
    }
  }

  private async handleModes() {
    console.log('\n🎮 Available Camera Modes:');
    console.log('─'.repeat(40));
    console.log('1. chase        - Third-person following camera');
    console.log('2. first-person - Immersive first-person view');
    console.log('3. orbit        - Rotating orbit camera');
    console.log('4. debug        - Development inspection camera');
    console.log('');
    console.log('💡 Each mode has different characteristics:');
    console.log('   • Chase: Good for action games');
    console.log('   • First-Person: Immersive gameplay');
    console.log('   • Orbit: Strategy and inspection');
    console.log('   • Debug: Development and testing');
  }

  private async handlePath(args: string[]) {
    const pathName = args[0!];
    if (!pathName) {
      console.log('❌ Path name required.');
      return;
    }

    const path = this.cameraSystem.getCameraPath(pathName);
    if (!path) {
      console.log(`❌ Path not found: ${pathName}`);
      return;
    }

    if (!this.activeCamera) {
      console.log('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyCameraPath(this.activeCamera.id, path);
    if (success) {
      console.log(`✅ Applied path "${pathName}" to camera`);
    } else {
      console.log(`❌ Failed to apply path: ${pathName}`);
    }
  }

  private async handlePaths() {
    const paths = this.cameraSystem.getAllPaths();
    console.log(`\n🎬 Available Camera Paths (${paths.length}):`);
    console.log('─'.repeat(50));

    paths.forEach((path, index) => {
      console.log(`${index + 1}. ${path.name} (${path.id})`);
      console.log(`   Duration: ${path.duration}ms`);
      console.log(`   Waypoints: ${path.waypoints.length}`);
      console.log(`   Loop: ${path.loop ? 'Yes' : 'No'}`);
      console.log('');
    });
  }

  private async handleStopPath() {
    if (!this.activeCamera) {
      console.log('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.stopCameraPath(this.activeCamera.id);
    if (success) {
      console.log('✅ Stopped current camera path');
    } else {
      console.log('❌ Failed to stop camera path');
    }
  }

  private async handleShake(args: string[]) {
    const intensity = parseFloat(args[0!] || '0.5');
    const duration = parseInt(args[1!] || '1000');

    if (!this.activeCamera) {
      console.log('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyShake(this.activeCamera.id, intensity, duration);
    if (success) {
      console.log(`✅ Applied shake effect (intensity: ${intensity}, duration: ${duration}ms)`);
    } else {
      console.log('❌ Failed to apply shake effect');
    }
  }

  private async handleFocus(args: string[]) {
    const intensity = parseFloat(args[0!] || '0.8');
    const duration = parseInt(args[1!] || '2000');

    if (!this.activeCamera) {
      console.log('❌ No active camera.');
      return;
    }

    const success = this.cameraSystem.applyFocus(this.activeCamera.id, intensity, duration);
    if (success) {
      console.log(`✅ Applied focus effect (intensity: ${intensity}, duration: ${duration}ms)`);
    } else {
      console.log('❌ Failed to apply focus effect');
    }
  }

  private async handleEffects() {
    if (!this.activeCamera) {
      console.log('❌ No active camera.');
      return;
    }

    console.log(`\n✨ Active Effects on ${this.activeCamera.id}:`);
    console.log('─'.repeat(50));

    if (this.activeCamera.effects.size === 0) {
      console.log('No active effects');
      return;
    }

    let index = 1;
    this.activeCamera.effects.forEach((effect, effectId) => {
      console.log(`${index}. ${effect.name} (${effect.type})`);
      console.log(`   Duration: ${effect.duration}ms remaining`);
      console.log(`   Intensity: ${effect.intensity}`);
      console.log(`   Priority: ${effect.priority}`);
      console.log('');
      index++;
    });
  }

  private async handleConfig() {
    const config = this.cameraSystem.getConfig();
    console.log('\n⚙️  Camera System Configuration:');
    console.log('─'.repeat(40));
    console.log(`Default Mode: ${config.defaultMode}`);
    console.log(`Debug Camera: ${config.enableDebugCamera ? 'Enabled' : 'Disabled'}`);
    console.log(`Cinematic Mode: ${config.enableCinematicMode ? 'Enabled' : 'Disabled'}`);
    console.log(`Max Cameras: ${config.maxActiveCameras}`);
    console.log(`Update Rate: ${config.updateRate} FPS`);
    console.log(`Render Quality: ${config.renderQuality}`);
    console.log(`Post Processing: ${config.enablePostProcessing ? 'Enabled' : 'Disabled'}`);
  }

  private async handleSetRate(args: string[]) {
    const fps = parseInt(args[0!]);
    if (!fps || fps < 1 || fps > 240) {
      console.log('❌ Invalid FPS rate. Must be between 1-240.');
      return;
    }

    const config = this.cameraSystem.getConfig();
    config.updateRate = fps;
    config.targetFPS = fps;
    this.cameraSystem.updateConfig(config);

    console.log(`✅ Update rate set to ${fps} FPS`);
  }

  private async handleSetQuality(args: string[]) {
    const quality = args[0!];
    if (!quality || !['low', 'medium', 'high', 'ultra'].includes(quality)) {
      console.log('❌ Invalid quality level. Available: low, medium, high, ultra');
      return;
    }

    const config = this.cameraSystem.getConfig();
    config.renderQuality = quality as 'low' | 'medium' | 'high' | 'ultra';
    this.cameraSystem.updateConfig(config);

    console.log(`✅ Render quality set to ${quality}`);
  }

  private async handleStats() {
    const stats = this.cameraSystem.getStats();
    console.log('\n📊 Camera System Statistics:');
    console.log('─'.repeat(40));
    console.log(`Total Cameras: ${stats.totalCameras}`);
    console.log(`Active Cameras: ${stats.activeCameras}`);
    console.log(`Mode Switches: ${stats.modeSwitches}`);
    console.log(`Cinematic Sequences: ${stats.cinematicSequences}`);
    console.log(`Paths Created: ${stats.pathsCreated}`);
    console.log(`Effects Applied: ${stats.effectsApplied}`);
    console.log(`Total Play Time: ${stats.totalPlayTime}ms`);
    console.log(`Average FPS: ${stats.averageFPS.toFixed(1)}`);
    console.log(`Memory Usage: ${(stats.memoryUsage / 1024).toFixed(1)} KB`);
  }

  private async handlePerformance() {
    const stats = this.cameraSystem.getStats();
    console.log('\n⚡ Performance Metrics:');
    console.log('─'.repeat(40));

    // Simulate performance metrics
    const avgUpdateTime = stats.totalPlayTime / Math.max(stats.totalCameras * 60, 1);
    const efficiency = stats.activeCameras > 0 ? (stats.averageFPS / 60) * 100 : 100;

    console.log(`Average Update Time: ${avgUpdateTime.toFixed(2)}ms`);
    console.log(`Camera Efficiency: ${efficiency.toFixed(1)}%`);
    console.log(`Frame Drops: ${Math.max(0, 60 - stats.averageFPS)} estimated`);
    console.log(`Memory Efficiency: ${((1 - (stats.memoryUsage / (1024 * 1024))) * 100).toFixed(1)}%`);
  }

  private async handleDemo(args: string[]) {
    const duration = parseInt(args[0!] || '30000'); // 30 seconds default
    this.demoMode = true;

    console.log(`🎬 Starting demo sequence (${duration}ms)...`);
    console.log('Press Ctrl+C to stop demo');

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
            console.log('🎯 Chase mode with shake');
            break;
          case 1:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'first-person');
            console.log('👁️  First-person mode');
            break;
          case 2:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'orbit');
            console.log('🌀 Orbit mode');
            break;
          case 3:
            this.cameraSystem.applyFocus(orbitCamera.id, 0.7, 1000);
            console.log('🎭 Focus effect');
            break;
          case 4:
            this.cameraSystem.switchCameraMode(chaseCamera.id, 'chase');
            console.log('🎯 Back to chase');
            break;
          case 5:
            this.cameraSystem.applyShake(chaseCamera.id, 0.8, 2000);
            console.log('💥 Strong shake effect');
            break;
        }

        // Update camera system
        this.cameraSystem.updateCameraSystem(1/60);
      }, 2000);

      // Stop demo after duration
      setTimeout(() => {
        this.demoMode = false;
        clearInterval(demoInterval);
        console.log('🏁 Demo completed!');
      }, duration);
    }
  }

  private async handleStressTest(args: string[]) {
    const cameraCount = parseInt(args[0!] || '20');
    const duration = parseInt(args[1!] || '10000');

    console.log(`🔥 Starting stress test with ${cameraCount} cameras for ${duration}ms...`);

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

    console.log(`✅ Created ${cameras.length} cameras`);

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

      console.log('\n📊 Stress Test Results:');
      console.log('─'.repeat(40));
      console.log(`Duration: ${duration.toFixed(0)}ms`);
      console.log(`Updates: ${updateCount}`);
      console.log(`Avg Update Time: ${(duration / updateCount).toFixed(3)}ms`);
      console.log(`Memory Increase: ${(memoryIncrease / 1024).toFixed(1)} KB`);
      console.log(`Final FPS: ${(updateCount * 1000 / duration).toFixed(1)}`);

      const stats = this.cameraSystem.getStats();
      console.log(`Mode Switches: ${stats.modeSwitches}`);
      console.log(`Effects Applied: ${stats.effectsApplied}`);
    }, duration);
  }

  public async run() {
    console.log('🎥 CameraSystemPure CLI Harness');
    console.log('Type "help" for commands or "demo" for a demonstration');
    console.log('─'.repeat(60));

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
        const command = parts[0!];
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
      console.log('\n👋 Exiting...');
      rl.close();
    });
  }
}

// Main execution
async function main() {
  const cli = new CameraCLIHarness();

  if (process.argv.includes('--demo')) {
    console.log('🚀 Running in demo mode...');
    await cli.runCommand('demo', ['10000']);
    process.exit(0);
  } else if (process.argv.includes('--stress-test')) {
    console.log('🔥 Running stress test...');
    await cli.runCommand('stress-test', ['50', '5000']);
    process.exit(0);
  } else {
    await cli.run();
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(console.error);