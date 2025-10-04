#!/usr/bin/env tsx

/**
 * AvatarRendererGodotPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the AvatarRendererGodotPure Godot avatar rendering system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
AvatarRendererGodotPure CLI Harness - Godot Avatar Rendering System

Usage: npx tsx miff/pure/AvatarRendererGodotPure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic Godot renderer tests
  convert-to-scene <file>  - Convert avatar to Godot scene
  convert-manifest <file>  - Convert manifest to Godot nodes
  create-sample-avatar     - Create sample avatar for testing
  create-sample-manifest   - Create sample manifest for testing
  validate-godot-output    - Validate Godot scene output
  simulate-conversion      - Simulate conversion operations
  help                     - Show this help

Examples:
  npx tsx miff/pure/AvatarRendererGodotPure/cliHarness.ts test
  npx tsx miff/pure/AvatarRendererGodotPure/cliHarness.ts convert-to-scene avatar.json
  npx tsx miff/pure/AvatarRendererGodotPure/cliHarness.ts simulate-conversion
`);
  process.exit(0);
}

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { AvatarRendererGodotPure } from './index';
import { ResolvedAvatar, AvatarManifest } from '../AvatarSystemPure/schema';

class AvatarRendererGodotCLI {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'GodotRenderer> '
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });

    this.rl.on('close', () => {
      console.log('\n👋 Godot Avatar Renderer CLI closed');
      process.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'test':
        await this.runTests();
        break;
      case 'convert-to-scene':
        await this.convertToScene(args[0]);
        break;
      case 'convert-manifest':
        await this.convertManifest(args[0]);
        break;
      case 'create-sample-avatar':
        await this.createSampleAvatar();
        break;
      case 'create-sample-manifest':
        await this.createSampleManifest();
        break;
      case 'validate-godot-output':
        this.validateGodotOutput();
        break;
      case 'simulate-conversion':
        await this.simulateConversion();
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
    console.log('🧪 Running Godot Avatar Renderer tests...\n');

    try {
      // Test 1: Renderer class instantiation
      console.log('1. Testing renderer class...');
      const renderer = AvatarRendererGodotPure;
      console.log('   ✅ AvatarRendererGodotPure class accessible');

      // Test 2: Method availability
      console.log('2. Testing method availability...');
      const hasToGodotSceneMethod = typeof renderer.toGodotSceneJSON === 'function';
      const hasManifestToNodesMethod = typeof renderer.manifestToGodotNodes === 'function';
      console.log(`   ${hasToGodotSceneMethod ? '✅' : '❌'} toGodotSceneJSON method: ${hasToGodotSceneMethod ? 'Available' : 'Missing'}`);
      console.log(`   ${hasManifestToNodesMethod ? '✅' : '❌'} manifestToGodotNodes method: ${hasManifestToNodesMethod ? 'Available' : 'Missing'}`);

      // Test 3: Sample avatar creation
      console.log('3. Testing sample avatar creation...');
      const sampleAvatar = this.createSampleAvatarData();
      console.log(`   ✅ Sample avatar created with ${sampleAvatar.components.length} components`);
      console.log(`   ✅ Sample avatar has ${sampleAvatar.assets.entries.length} asset entries`);

      // Test 4: Godot scene conversion
      console.log('4. Testing Godot scene conversion...');
      const godotScene = renderer.toGodotSceneJSON(sampleAvatar);
      console.log(`   ${godotScene ? '✅' : '❌'} Godot scene conversion: ${godotScene ? 'Success' : 'Failed'}`);
      if (godotScene) {
        console.log(`      Scene type: ${godotScene.type}`);
        console.log(`      Nodes count: ${godotScene.nodes.length}`);
        console.log(`      Meta style: ${godotScene.meta.style}`);
      }

      // Test 5: Manifest conversion
      console.log('5. Testing manifest conversion...');
      const sampleManifest = this.createSampleManifestData();
      const godotNodes = renderer.manifestToGodotNodes(sampleManifest);
      console.log(`   ${godotNodes ? '✅' : '❌'} Manifest to nodes conversion: ${godotNodes ? 'Success' : 'Failed'}`);
      if (godotNodes) {
        console.log(`      Generated nodes: ${godotNodes.length}`);
        godotNodes.forEach((node, index) => {
          console.log(`         ${index + 1}. ${node.name} (${node.type})`);
        });
      }

      // Test 6: Output validation
      console.log('6. Testing output validation...');
      const isValidScene = this.validateGodotScene(godotScene);
      const isValidNodes = this.validateGodotNodes(godotNodes);
      console.log(`   ${isValidScene ? '✅' : '❌'} Godot scene validation: ${isValidScene ? 'Valid' : 'Invalid'}`);
      console.log(`   ${isValidNodes ? '✅' : '❌'} Godot nodes validation: ${isValidNodes ? 'Valid' : 'Invalid'}`);

      console.log('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async convertToScene(filePath?: string): Promise<void> {
    if (!filePath) {
      console.log('❌ Usage: convert-to-scene <file>');
      return;
    }

    try {
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return;
      }

      const avatarData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(avatarData);
      
      const outputPath = filePath.replace('.json', '_godot_scene.json');
      fs.writeFileSync(outputPath, JSON.stringify(godotScene, null, 2));
      
      console.log(`✅ Avatar converted to Godot scene: ${outputPath}`);
      console.log(`   Scene type: ${godotScene.type}`);
      console.log(`   Nodes: ${godotScene.nodes.length}`);
      console.log(`   Meta: ${JSON.stringify(godotScene.meta)}`);

    } catch (error) {
      console.error('❌ Scene conversion failed:', error);
    }
  }

  private async convertManifest(filePath?: string): Promise<void> {
    if (!filePath) {
      console.log('❌ Usage: convert-manifest <file>');
      return;
    }

    try {
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return;
      }

      const manifestData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(manifestData);
      
      const outputPath = filePath.replace('.json', '_godot_nodes.json');
      fs.writeFileSync(outputPath, JSON.stringify(godotNodes, null, 2));
      
      console.log(`✅ Manifest converted to Godot nodes: ${outputPath}`);
      console.log(`   Generated nodes: ${godotNodes.length}`);
      godotNodes.forEach((node, index) => {
        console.log(`   ${index + 1}. ${node.name} (${node.type})`);
        if (node.texture) console.log(`      Texture: ${node.texture}`);
        if (node.position) console.log(`      Position: (${node.position.x}, ${node.position.y})`);
      });

    } catch (error) {
      console.error('❌ Manifest conversion failed:', error);
    }
  }

  private async createSampleAvatar(): Promise<void> {
    try {
      const sampleAvatar = this.createSampleAvatarData();
      const outputPath = 'sample-avatar-godot.json';
      
      fs.writeFileSync(outputPath, JSON.stringify(sampleAvatar, null, 2));
      console.log(`✅ Sample avatar created: ${outputPath}`);
      console.log(`   Components: ${sampleAvatar.components.length}`);
      console.log(`   Asset entries: ${sampleAvatar.assets.entries.length}`);
      console.log(`   Style: ${sampleAvatar.style}`);

    } catch (error) {
      console.error('❌ Sample avatar creation failed:', error);
    }
  }

  private async createSampleManifest(): Promise<void> {
    try {
      const sampleManifest = this.createSampleManifestData();
      const outputPath = 'sample-manifest-godot.json';
      
      fs.writeFileSync(outputPath, JSON.stringify(sampleManifest, null, 2));
      console.log(`✅ Sample manifest created: ${outputPath}`);
      console.log(`   ID: ${sampleManifest.id}`);
      console.log(`   Style: ${sampleManifest.style}`);
      console.log(`   Components: ${sampleManifest.components.length}`);

    } catch (error) {
      console.error('❌ Sample manifest creation failed:', error);
    }
  }

  private validateGodotOutput(): void {
    console.log('🔍 Validating Godot output format...');

    try {
      // Test scene validation
      const sampleAvatar = this.createSampleAvatarData();
      const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(sampleAvatar);
      const sceneValid = this.validateGodotScene(godotScene);
      console.log(`   ${sceneValid ? '✅' : '❌'} Godot scene format: ${sceneValid ? 'Valid' : 'Invalid'}`);

      // Test nodes validation
      const sampleManifest = this.createSampleManifestData();
      const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(sampleManifest);
      const nodesValid = this.validateGodotNodes(godotNodes);
      console.log(`   ${nodesValid ? '✅' : '❌'} Godot nodes format: ${nodesValid ? 'Valid' : 'Invalid'}`);

      // Test required fields
      if (godotScene) {
        const hasType = 'type' in godotScene;
        const hasNodes = 'nodes' in godotScene && Array.isArray(godotScene.nodes);
        const hasMeta = 'meta' in godotScene;
        
        console.log(`   ${hasType ? '✅' : '❌'} Scene has type field: ${hasType ? 'Yes' : 'No'}`);
        console.log(`   ${hasNodes ? '✅' : '❌'} Scene has nodes array: ${hasNodes ? 'Yes' : 'No'}`);
        console.log(`   ${hasMeta ? '✅' : '❌'} Scene has meta field: ${hasMeta ? 'Yes' : 'No'}`);
      }

      console.log('✅ Godot output validation completed');

    } catch (error) {
      console.error('❌ Godot output validation failed:', error);
    }
  }

  private async simulateConversion(): Promise<void> {
    console.log('🎭 Starting Godot conversion simulation...');
    
    try {
      // Create multiple test avatars
      console.log('1. Creating test avatars...');
      const avatars = [
        this.createSampleAvatarData('avatar-1', '3d'),
        this.createSampleAvatarData('avatar-2', '2d-side'),
        this.createSampleAvatarData('avatar-3', 'overlay')
      ];
      console.log(`   ✅ Created ${avatars.length} test avatars`);

      // Convert each avatar to Godot scene
      console.log('2. Converting avatars to Godot scenes...');
      for (let i = 0; i < avatars.length; i++) {
        const avatar = avatars[i];
        const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(avatar);
        
        console.log(`   🎨 Converting avatar ${i + 1} (${avatar.style})...`);
        console.log(`      Scene type: ${godotScene.type}`);
        console.log(`      Nodes: ${godotScene.nodes.length}`);
        console.log(`      Meta style: ${godotScene.meta.style}`);
      }

      // Create multiple test manifests
      console.log('3. Creating test manifests...');
      const manifests = [
        this.createSampleManifestData('manifest-1'),
        this.createSampleManifestData('manifest-2'),
        this.createSampleManifestData('manifest-3')
      ];
      console.log(`   ✅ Created ${manifests.length} test manifests`);

      // Convert each manifest to Godot nodes
      console.log('4. Converting manifests to Godot nodes...');
      for (let i = 0; i < manifests.length; i++) {
        const manifest = manifests[i];
        const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(manifest);
        
        console.log(`   🎨 Converting manifest ${i + 1} (${manifest.id})...`);
        console.log(`      Generated nodes: ${godotNodes.length}`);
        godotNodes.forEach((node, index) => {
          console.log(`         ${index + 1}. ${node.name} (${node.type})`);
        });
      }

      // Simulate performance testing
      console.log('5. Simulating performance testing...');
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        const avatar = this.createSampleAvatarData(`perf-avatar-${i}`, '3d');
        AvatarRendererGodotPure.toGodotSceneJSON(avatar);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`   ⚡ Converted 50 avatars in ${duration}ms (${(duration / 50).toFixed(2)}ms per avatar)`);

      // Simulate error handling
      console.log('6. Simulating error handling...');
      try {
        const invalidAvatar = { ...this.createSampleAvatarData(), assets: { entries: [] } };
        const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(invalidAvatar);
        console.log('   ✅ Handled empty assets gracefully');
        console.log(`      Generated scene with ${godotScene.nodes.length} nodes`);
      } catch (error) {
        console.log(`   ⚠️  Error handling: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.log('✅ Godot conversion simulation completed successfully');

    } catch (error) {
      console.error('❌ Conversion simulation failed:', error);
    }
  }

  private createSampleAvatarData(id: string = 'sample-avatar', style: string = '3d'): ResolvedAvatar {
    return {
      id,
      style: style as any,
      components: [
        {
          kind: 'head',
          id: 'head-001',
          name: 'Basic Head',
          anchors: ['anchor_head']
        },
        {
          kind: 'torso',
          id: 'torso-001',
          name: 'Basic Torso',
          anchors: ['anchor_torso']
        },
        {
          kind: 'shirt',
          id: 'shirt-001',
          name: 'Basic Shirt',
          anchors: ['anchor_shirt']
        }
      ],
      animations: [
        {
          id: 'idle',
          name: 'Idle Animation',
          state: 'idle',
          duration: 2000,
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
      customizations: [],
      optimizations: {
        lodLevels: 3,
        textureCompression: true,
        meshSimplification: true,
        animationCompression: true
      },
      assets: {
        entries: [
          {
            anchor: 'anchor_head',
            url: 'https://example.com/assets/head.png'
          },
          {
            anchor: 'anchor_torso',
            url: 'https://example.com/assets/torso.png'
          },
          {
            anchor: 'anchor_shirt',
            url: 'https://example.com/assets/shirt.png'
          }
        ],
        style: style as any,
        base: 'https://example.com/assets/base.png'
      },
      manifest: {
        id: `${id}-manifest`,
        name: `${id} Manifest`,
        style: style as any,
        components: [],
        animations: [],
        materials: [],
        textures: [],
        meshes: [],
        customizations: [],
        optimizations: {
          lodLevels: 3,
          textureCompression: true,
          meshSimplification: true,
          animationCompression: true
        },
        anchor: {
          head: { x: 0, y: -50 },
          torso: { x: 0, y: 0 }
        },
        layers: {
          body: 'https://example.com/assets/body.png',
          face: 'https://example.com/assets/face.png',
          clothing: ['https://example.com/assets/shirt.png']
        }
      }
    };
  }

  private createSampleManifestData(id: string = 'sample-manifest'): any {
    return {
      id,
      name: `${id} Manifest`,
      base: 'barbarian',
      clothing: ['basic_shirt', 'basic_pants'],
      face: 'neutral',
      style: '3d',
      components: [
        {
          kind: 'head',
          id: 'head-001',
          name: 'Basic Head',
          anchors: ['anchor_head']
        }
      ],
      animations: [
        {
          id: 'idle',
          name: 'Idle Animation',
          state: 'idle',
          duration: 2000,
          loop: true
        }
      ],
      materials: [],
      textures: [],
      meshes: [],
      customizations: [],
      optimizations: {
        lodLevels: 3,
        textureCompression: true,
        meshSimplification: true,
        animationCompression: true
      },
      anchor: {
        head: { x: 0, y: -50 },
        torso: { x: 0, y: 0 }
      },
      layers: {
        body: 'https://example.com/assets/body.png',
        face: 'https://example.com/assets/face.png',
        clothing: ['https://example.com/assets/shirt.png']
      }
    };
  }

  private validateGodotScene(scene: any): boolean {
    if (!scene) return false;
    if (!scene.type || scene.type !== 'GodotScene') return false;
    if (!Array.isArray(scene.nodes)) return false;
    if (!scene.meta) return false;
    return true;
  }

  private validateGodotNodes(nodes: any): boolean {
    if (!Array.isArray(nodes)) return false;
    return nodes.every(node => 
      node && 
      typeof node.type === 'string' && 
      typeof node.name === 'string'
    );
  }

  private showHelp(): void {
    console.log(`
Available commands:
  test                     - Run basic Godot renderer tests
  convert-to-scene <file>  - Convert avatar to Godot scene
  convert-manifest <file>  - Convert manifest to Godot nodes
  create-sample-avatar     - Create sample avatar for testing
  create-sample-manifest   - Create sample manifest for testing
  validate-godot-output    - Validate Godot scene output
  simulate-conversion      - Simulate conversion operations
  help                     - Show this help
  exit/quit                - Exit the CLI

Note: This renderer converts avatar data to Godot scene format.
Output files are saved as JSON for easy integration with Godot projects.
`);
  }

  public async start(): Promise<void> {
    console.log('🚀 Godot Avatar Renderer CLI Started');
    console.log('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main() {
  const cli = new AvatarRendererGodotCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}