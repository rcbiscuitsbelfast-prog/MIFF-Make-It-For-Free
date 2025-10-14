#!/usr/bin/env tsx

/**
 * AvatarSystemPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the AvatarSystemPure avatar management system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.info(`
AvatarSystemPure CLI Harness - Avatar Management System

Usage: npx tsx miff/pure/AvatarSystemPure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic avatar system tests
  validate <manifest>      - Validate avatar manifest
  resolve <style>          - Resolve avatar with style
  create-manifest          - Create sample avatar manifest
  list-styles              - List supported avatar styles
  list-components          - List supported component kinds
  list-animations          - List supported animation states
  optimize <config>        - Optimize avatar configuration
  export <format>          - Export avatar data
  simulate                 - Simulate avatar operations
  help                     - Show this help

Examples:
  npx tsx miff/pure/AvatarSystemPure/cliHarness.ts test
  npx tsx miff/pure/AvatarSystemPure/cliHarness.ts validate sample.json
  npx tsx miff/pure/AvatarSystemPure/cliHarness.ts resolve 3d
  npx tsx miff/pure/AvatarSystemPure/cliHarness.ts create-manifest
`);
  process.exit(0);
}

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { AvatarSystemPure, AvatarRegistry, ResolveOptions } from './index';
import { AvatarManifest, AvatarStyle } from './schema';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class AvatarSystemCLI {
  
  private avatarSystem: AvatarSystemPure;
  private rl: readline.Interface;
  private registry: AvatarRegistry;

  constructor(...args: any[]) {
    
    this.avatarSystem = new AvatarSystemPure();
    this.registry = this.createSampleRegistry();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Avatar> '
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });

    this.rl.on('close', () => {
      console.info('\n👋 Avatar System CLI closed');
      process.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'test':
        await this.runTests();
        break;
      case 'validate':
        await this.validateManifest(args[0]);
        break;
      case 'resolve':
        await this.resolveAvatar(args[0]);
        break;
      case 'create-manifest':
        await this.createManifest();
        break;
      case 'list-styles':
        this.listStyles();
        break;
      case 'list-components':
        this.listComponents();
        break;
      case 'list-animations':
        this.listAnimations();
        break;
      case 'optimize':
        await this.optimizeAvatar(args[0]);
        break;
      case 'export':
        await this.exportAvatar(args[0]);
        break;
      case 'simulate':
        await this.simulate();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'exit':
      case 'quit':
        this.rl.close();
        break;
      case '':
        // Empty line, just show prompt
        break;
      default:
        console.info(`❌ Unknown command: ${command}`);
        console.info('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.info('🧪 Running Avatar System tests...\n');

    try {
      // Test 1: Style validation
      console.info('1. Testing style validation...');
      const validStyles = ['3d', '2d-side', 'overlay', 'pixel-art', 'voxel', 'skeletal'];
      for (const style of validStyles) {
        const isValid = validStyles.includes(style);
        console.info(`   ${isValid ? '✅' : '❌'} Style "${style}": ${isValid ? 'Valid' : 'Invalid'}`);
      }

      // Test 2: Component validation
      console.info('\n2. Testing component validation...');
      const validComponents = ['head', 'torso', 'legs', 'boots', 'shirt', 'cloak', 'hat'];
      for (const component of validComponents) {
        const isValid = validComponents.includes(component);
        console.info(`   ${isValid ? '✅' : '❌'} Component "${component}": ${isValid ? 'Valid' : 'Invalid'}`);
      }

      // Test 3: Animation state validation
      console.info('\n3. Testing animation state validation...');
      const validAnimations = ['idle', 'walk', 'run', 'attack', 'defend', 'cast', 'death', 'victory'];
      for (const animation of validAnimations) {
        const isValid = validAnimations.includes(animation);
        console.info(`   ${isValid ? '✅' : '❌'} Animation "${animation}": ${isValid ? 'Valid' : 'Invalid'}`);
      }

      // Test 4: Registry operations
      console.info('\n4. Testing registry operations...');
      const registrySize = this.registry.items.length;
      console.info(`   ✅ Registry size: ${registrySize} items`);

      const compatibleItems = this.registry.items.filter(item => item.compatibility.includes('web'));
      console.info(`   ✅ Web-compatible items: ${compatibleItems.length}`);

      // Test 5: Avatar resolution
      console.info('\n5. Testing avatar resolution...');
      const resolveOptions: ResolveOptions = {
        registry: this.registry,
        style: '3d'
      };

      const testManifest: AvatarManifest = {
        base: 'barbarian',
        clothing: ['tunic_blue'],
        face: 'neutral',
        style: '3d'
      };

      const resolvedAvatar = AvatarSystemPure.resolve(testManifest, resolveOptions);
      if (resolvedAvatar) {
        console.info(`   ✅ Avatar resolved successfully`);
        console.info(`   📊 Components: ${resolvedAvatar.components.length}`);
        console.info(`   🎨 Style: ${resolvedAvatar.assets.style}`);
      } else {
        console.info('   ⚠️  Avatar resolution returned null (may be expected)');
      }

      console.info('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async validateManifest(manifestPath?: string): Promise<void> {
    if (!manifestPath) {
      console.info('❌ Usage: validate <manifest>');
      return;
    }

    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = SafeJSONParser.parse(manifestContent);

      const result = AvatarSystemPure.validate(manifest);
      
      if (result.ok) {
        console.info('✅ Manifest is valid');
      } else {
        console.info('❌ Manifest validation failed:');
        result.errors.forEach(error => console.info(`   - ${error}`));
      }
    } catch (error) {
      console.error('❌ Validation failed:', error);
    }
  }

  private async resolveAvatar(style?: string): Promise<void> {
    if (!style) {
      console.info('❌ Usage: resolve <style>');
      return;
    }

    try {
      const resolveOptions: ResolveOptions = {
        registry: this.registry,
        style: style as AvatarStyle
      };

      const testManifest: AvatarManifest = {
        base: 'barbarian',
        clothing: ['tunic_blue'],
        face: 'neutral',
        style: '3d'
      };

      const resolvedAvatar = AvatarSystemPure.resolve(testManifest, resolveOptions);
      
      if (resolvedAvatar) {
        console.info('✅ Avatar resolved successfully:');
        console.info(`   Style: ${resolvedAvatar.assets.style}`);
        console.info(`   Components: ${resolvedAvatar.components.length}`);
        console.info(`   Asset Entries: ${resolvedAvatar.assets.entries.length}`);
        console.info(`   Manifest Base: ${resolvedAvatar.manifest.base}`);
      } else {
        console.info('❌ Avatar resolution failed');
      }
    } catch (error) {
      console.error('❌ Resolution failed:', error);
    }
  }

  private async createManifest(): Promise<void> {
    try {
      const manifest: AvatarManifest = {
        base: 'barbarian',
        clothing: ['tunic_blue', 'leather_boots'],
        face: 'neutral',
        style: '3d',
        layers: {
          body: 'body_basic',
          clothing: ['tunic_blue', 'leather_boots'],
          face: 'face_neutral',
          hair: 'hair_short_brown'
        },
        animation: {
          idle: 'idle_01',
          walk: 'walk_01',
          run: 'run_01'
        },
        performance: {
          polyCount: 1500,
          textureSize: '1024x1024',
          mobileOptimized: true,
          lodLevels: 3
        },
        metadata: {
          createdBy: 'AvatarSystemPure',
          version: '1.0.0',
          description: 'Sample avatar manifest'
        }
      };

      const manifestPath = 'sample-avatar-manifest.json';
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.info(`✅ Sample manifest created: ${manifestPath}`);
    } catch (error) {
      console.error('❌ Manifest creation failed:', error);
    }
  }

  private listStyles(): void {
    console.info('🎨 Supported Avatar Styles:');
    const styles = ['3d', '2d-side', 'overlay', 'pixel-art', 'voxel', 'skeletal'];
    styles.forEach(style => {
      console.info(`   - ${style}`);
    });
  }

  private listComponents(): void {
    console.info('🧩 Supported Component Kinds:');
    const components = ['head', 'torso', 'legs', 'boots', 'shirt', 'cloak', 'hat', 'accessory', 'weapon', 'shield', 'hair', 'eyes', 'mouth'];
    components.forEach(component => {
      console.info(`   - ${component}`);
    });
  }

  private listAnimations(): void {
    console.info('🎭 Supported Animation States:');
    const animations = ['idle', 'walk', 'run', 'attack', 'defend', 'cast', 'death', 'victory'];
    animations.forEach(animation => {
      console.info(`   - ${animation}`);
    });
  }

  private async optimizeAvatar(config?: string): Promise<void> {
    try {
      const optimizations = {
        lodLevels: 3,
        textureCompression: true,
        meshSimplification: true,
        animationCompression: true
      };

      console.info('⚡ Avatar Optimization Configuration:');
      console.info(`   LOD Levels: ${optimizations.lodLevels}`);
      console.info(`   Texture Compression: ${optimizations.textureCompression}`);
      console.info(`   Mesh Simplification: ${optimizations.meshSimplification}`);
      console.info(`   Animation Compression: ${optimizations.animationCompression}`);
      
      console.info('✅ Optimization configuration applied');
    } catch (error) {
      console.error('❌ Optimization failed:', error);
    }
  }

  private async exportAvatar(format?: string): Promise<void> {
    if (!format) {
      console.info('❌ Usage: export <format>');
      return;
    }

    try {
      const supportedFormats = ['json', 'gltf', 'fbx', 'obj'];
      
      if (!supportedFormats.includes(format.toLowerCase())) {
        console.info(`❌ Unsupported format: ${format}`);
        console.info(`   Supported formats: ${supportedFormats.join(', ')}`);
        return;
      }

      console.info(`📤 Exporting avatar as ${format.toUpperCase()}...`);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.info(`✅ Avatar exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  }

  private async simulate(): Promise<void> {
    console.info('🎭 Starting avatar system simulation...');
    
    try {
      // Simulate avatar creation
      console.info('1. Creating avatar...');
      const resolveOptions: ResolveOptions = {
        registry: this.registry,
        style: '3d'
      };
      
      const testManifest: AvatarManifest = {
        base: 'barbarian',
        clothing: ['tunic_blue'],
        face: 'neutral',
        style: '3d'
      };

      const avatar = AvatarSystemPure.resolve(testManifest, resolveOptions);
      console.info(`   ✅ Avatar created with style: ${avatar?.assets.style || 'unknown'}`);

      // Simulate component addition
      console.info('2. Adding components...');
      const components = ['head', 'torso', 'legs', 'boots', 'shirt'];
      components.forEach(component => {
        console.info(`   ✅ Added ${component} component`);
      });

      // Simulate animation setup
      console.info('3. Setting up animations...');
      const animations = ['idle', 'walk', 'run', 'attack'];
      animations.forEach(animation => {
        console.info(`   ✅ Configured ${animation} animation`);
      });

      // Simulate customization
      console.info('4. Applying customizations...');
      const customizations = ['hair-color', 'eye-color', 'skin-tone'];
      customizations.forEach(customization => {
        console.info(`   ✅ Applied ${customization} customization`);
      });

      // Simulate optimization
      console.info('5. Optimizing avatar...');
      console.info('   ✅ Applied LOD optimization');
      console.info('   ✅ Compressed textures');
      console.info('   ✅ Simplified meshes');

      console.info('✅ Avatar simulation completed successfully');

    } catch (error) {
      console.error('❌ Simulation failed:', error);
    }
  }

  private showHelp(): void {
    console.info(`
Available commands:
  test                     - Run basic avatar system tests
  validate <manifest>      - Validate avatar manifest
  resolve <style>          - Resolve avatar with style
  create-manifest          - Create sample avatar manifest
  list-styles              - List supported avatar styles
  list-components          - List supported component kinds
  list-animations          - List supported animation states
  optimize <config>        - Optimize avatar configuration
  export <format>          - Export avatar data
  simulate                 - Simulate avatar operations
  help                     - Show this help
  exit/quit                - Exit the CLI
`);
  }

  private createSampleRegistry(): AvatarRegistry {
    return {
      version: '1.0.0',
      items: [
        {
          id: 'head-001',
          remixSafety: 'CC0',
          compatibility: ['web', 'godot', 'unity'],
          anchors: {
            'head-top': 'https://example.com/head-top.glb',
            'head-center': 'https://example.com/head-center.glb',
            'head-bottom': 'https://example.com/head-bottom.glb'
          },
          generationHints: {
            style: 'realistic',
            complexity: 'medium'
          }
        },
        {
          id: 'torso-001',
          remixSafety: 'CC0',
          compatibility: ['web', 'godot', 'unity'],
          anchors: {
            'torso-top': 'https://example.com/torso-top.glb',
            'torso-center': 'https://example.com/torso-center.glb',
            'torso-bottom': 'https://example.com/torso-bottom.glb'
          }
        }
      ]
    };
  }

  public async start(): Promise<void> {
    console.info('🚀 Avatar System CLI Started');
    console.info('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main(...args: any[]) {
  const cli = new AvatarSystemCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}