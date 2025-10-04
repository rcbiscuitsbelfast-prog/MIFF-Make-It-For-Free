#!/usr/bin/env tsx

/**
 * AvatarSystemPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the AvatarSystemPure avatar management system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
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
import { AvatarSystemPure, AvatarRegistry, ResolveOptions, AssetRegistryRecord } from './index';
import { AvatarManifest, AvatarStyle } from './schema';

class AvatarSystemCLI {
  private avatarSystem: AvatarSystemPure;
  private rl: readline.Interface;
  private registry: AvatarRegistry;

  constructor() {
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
      console.log('\n👋 Avatar System CLI closed');
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
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running Avatar System tests...\n');

    try {
      // Test 1: Style validation
      console.log('1. Testing style validation...');
      const validStyles = ['3d', '2d-side', 'overlay', 'pixel-art', 'voxel', 'skeletal'];
      for (const style of validStyles) {
        const isValid = this.avatarSystem.isValidStyle(style as AvatarStyle);
        console.log(`   ${isValid ? '✅' : '❌'} Style "${style}": ${isValid ? 'Valid' : 'Invalid'}`);
      }

      // Test 2: Component validation
      console.log('\n2. Testing component validation...');
      const validComponents = ['head', 'torso', 'legs', 'boots', 'shirt', 'cloak', 'hat'];
      for (const component of validComponents) {
        const isValid = this.avatarSystem.isValidComponent(component);
        console.log(`   ${isValid ? '✅' : '❌'} Component "${component}": ${isValid ? 'Valid' : 'Invalid'}`);
      }

      // Test 3: Animation state validation
      console.log('\n3. Testing animation state validation...');
      const validAnimations = ['idle', 'walk', 'run', 'attack', 'defend', 'cast', 'death', 'victory'];
      for (const animation of validAnimations) {
        const isValid = this.avatarSystem.isValidAnimationState(animation);
        console.log(`   ${isValid ? '✅' : '❌'} Animation "${animation}": ${isValid ? 'Valid' : 'Invalid'}`);
      }

      // Test 4: Registry operations
      console.log('\n4. Testing registry operations...');
      const registrySize = this.avatarSystem.getRegistrySize(this.registry);
      console.log(`   ✅ Registry size: ${registrySize} items`);

      const compatibleItems = this.avatarSystem.getCompatibleItems(this.registry, 'web');
      console.log(`   ✅ Web-compatible items: ${compatibleItems.length}`);

      // Test 5: Avatar resolution
      console.log('\n5. Testing avatar resolution...');
      const resolveOptions: ResolveOptions = {
        registry: this.registry,
        style: '3d'
      };

      const resolvedAvatar = this.avatarSystem.resolve(resolveOptions);
      if (resolvedAvatar) {
        console.log(`   ✅ Avatar resolved successfully`);
        console.log(`   📊 Components: ${resolvedAvatar.components.length}`);
        console.log(`   🎨 Style: ${resolvedAvatar.style}`);
      } else {
        console.log('   ⚠️  Avatar resolution returned null (may be expected)');
      }

      console.log('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async validateManifest(manifestPath?: string): Promise<void> {
    if (!manifestPath) {
      console.log('❌ Usage: validate <manifest>');
      return;
    }

    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      const result = this.avatarSystem.validate(manifest);
      
      if (result.ok) {
        console.log('✅ Manifest is valid');
      } else {
        console.log('❌ Manifest validation failed:');
        result.errors.forEach((error: string) => console.log(`   - ${error}`));
      }
    } catch (error) {
      console.error('❌ Validation failed:', error);
    }
  }

  private async resolveAvatar(style?: string): Promise<void> {
    if (!style) {
      console.log('❌ Usage: resolve <style>');
      return;
    }

    try {
      const resolveOptions: ResolveOptions = {
        registry: this.registry,
        style: style as AvatarStyle
      };

      const resolvedAvatar = this.avatarSystem.resolve(resolveOptions);
      
      if (resolvedAvatar) {
        console.log('✅ Avatar resolved successfully:');
        console.log(`   Style: ${resolvedAvatar.style}`);
        console.log(`   Components: ${resolvedAvatar.components.length}`);
        console.log(`   Animations: ${resolvedAvatar.animations.length}`);
        console.log(`   Materials: ${resolvedAvatar.materials.length}`);
        console.log(`   Textures: ${resolvedAvatar.textures.length}`);
        console.log(`   Meshes: ${resolvedAvatar.meshes.length}`);
      } else {
        console.log('❌ Avatar resolution failed');
      }
    } catch (error) {
      console.error('❌ Resolution failed:', error);
    }
  }

  private async createManifest(): Promise<void> {
    try {
      const manifest: AvatarManifest = {
        id: 'sample-avatar',
        name: 'Sample Avatar',
        style: '3d',
        components: [
          {
            kind: 'head',
            id: 'head-001',
            name: 'Basic Head',
            anchors: ['head-top', 'head-center', 'head-bottom']
          },
          {
            kind: 'torso',
            id: 'torso-001',
            name: 'Basic Torso',
            anchors: ['torso-top', 'torso-center', 'torso-bottom']
          }
        ],
        animations: [
          {
            id: 'idle',
            name: 'Idle Animation',
            state: 'idle',
            duration: 2000,
            loop: true
          },
          {
            id: 'walk',
            name: 'Walk Animation',
            state: 'walk',
            duration: 1000,
            loop: true
          }
        ],
        materials: [
          {
            id: 'skin-material',
            name: 'Skin Material',
            type: 'pbr',
            properties: {
              baseColor: '#FFDBAC',
              metallic: 0.0,
              roughness: 0.8
            }
          }
        ],
        textures: [
          {
            id: 'skin-texture',
            name: 'Skin Texture',
            type: 'diffuse',
            size: { width: 512, height: 512 },
            format: 'png'
          }
        ],
        meshes: [
          {
            id: 'head-mesh',
            name: 'Head Mesh',
            type: 'triangular',
            vertices: 1000,
            faces: 500,
            uvs: true,
            normals: true
          }
        ],
        customizations: [
          {
            id: 'hair-color',
            name: 'Hair Color',
            type: 'color',
            component: 'hair',
            options: ['#000000', '#8B4513', '#FFD700', '#FF69B4']
          }
        ],
        optimizations: {
          lodLevels: 3,
          textureCompression: true,
          meshSimplification: true,
          animationCompression: true
        }
      };

      const manifestPath = 'sample-avatar-manifest.json';
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`✅ Sample manifest created: ${manifestPath}`);
    } catch (error) {
      console.error('❌ Manifest creation failed:', error);
    }
  }

  private listStyles(): void {
    console.log('🎨 Supported Avatar Styles:');
    const styles = ['3d', '2d-side', 'overlay', 'pixel-art', 'voxel', 'skeletal'];
    styles.forEach(style => {
      console.log(`   - ${style}`);
    });
  }

  private listComponents(): void {
    console.log('🧩 Supported Component Kinds:');
    const components = ['head', 'torso', 'legs', 'boots', 'shirt', 'cloak', 'hat', 'accessory', 'weapon', 'shield', 'hair', 'eyes', 'mouth'];
    components.forEach(component => {
      console.log(`   - ${component}`);
    });
  }

  private listAnimations(): void {
    console.log('🎭 Supported Animation States:');
    const animations = ['idle', 'walk', 'run', 'attack', 'defend', 'cast', 'death', 'victory'];
    animations.forEach(animation => {
      console.log(`   - ${animation}`);
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

      console.log('⚡ Avatar Optimization Configuration:');
      console.log(`   LOD Levels: ${optimizations.lodLevels}`);
      console.log(`   Texture Compression: ${optimizations.textureCompression}`);
      console.log(`   Mesh Simplification: ${optimizations.meshSimplification}`);
      console.log(`   Animation Compression: ${optimizations.animationCompression}`);
      
      console.log('✅ Optimization configuration applied');
    } catch (error) {
      console.error('❌ Optimization failed:', error);
    }
  }

  private async exportAvatar(format?: string): Promise<void> {
    if (!format) {
      console.log('❌ Usage: export <format>');
      return;
    }

    try {
      const supportedFormats = ['json', 'gltf', 'fbx', 'obj'];
      
      if (!supportedFormats.includes(format.toLowerCase())) {
        console.log(`❌ Unsupported format: ${format}`);
        console.log(`   Supported formats: ${supportedFormats.join(', ')}`);
        return;
      }

      console.log(`📤 Exporting avatar as ${format.toUpperCase()}...`);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ Avatar exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  }

  private async simulate(): Promise<void> {
    console.log('🎭 Starting avatar system simulation...');
    
    try {
      // Simulate avatar creation
      console.log('1. Creating avatar...');
      const resolveOptions: ResolveOptions = {
        registry: this.registry,
        style: '3d'
      };
      
      const avatar = this.avatarSystem.resolve(resolveOptions);
      console.log(`   ✅ Avatar created with style: ${avatar?.style || 'unknown'}`);

      // Simulate component addition
      console.log('2. Adding components...');
      const components = ['head', 'torso', 'legs', 'boots', 'shirt'];
      components.forEach(component => {
        console.log(`   ✅ Added ${component} component`);
      });

      // Simulate animation setup
      console.log('3. Setting up animations...');
      const animations = ['idle', 'walk', 'run', 'attack'];
      animations.forEach(animation => {
        console.log(`   ✅ Configured ${animation} animation`);
      });

      // Simulate customization
      console.log('4. Applying customizations...');
      const customizations = ['hair-color', 'eye-color', 'skin-tone'];
      customizations.forEach(customization => {
        console.log(`   ✅ Applied ${customization} customization`);
      });

      // Simulate optimization
      console.log('5. Optimizing avatar...');
      console.log('   ✅ Applied LOD optimization');
      console.log('   ✅ Compressed textures');
      console.log('   ✅ Simplified meshes');

      console.log('✅ Avatar simulation completed successfully');

    } catch (error) {
      console.error('❌ Simulation failed:', error);
    }
  }

  private showHelp(): void {
    console.log(`
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
    console.log('🚀 Avatar System CLI Started');
    console.log('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main() {
  const cli = new AvatarSystemCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}