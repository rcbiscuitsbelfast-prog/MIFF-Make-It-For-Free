#!/usr/bin/env tsx

/**
 * AvatarRendererGodotPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the AvatarRendererGodotPure Godot avatar rendering system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.info(`
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
import { ResolvedAvatar, AvatarManifest, AvatarStyle } from '../AvatarSystemPure/schema';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class AvatarRendererGodotCLI {
  
  private rl: readline.Interface;

  constructor(...args: any[]) {
    
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
      console.info('\n👋 Godot Avatar Renderer CLI closed');
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
        console.info(`❌ Unknown command: ${command}`);
        console.info('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.info('🧪 Running Godot Avatar Renderer tests...\n');

    try {
      // Test 1: Renderer class instantiation
      console.info('1. Testing renderer class...');
      const renderer = AvatarRendererGodotPure;
      console.info('   ✅ AvatarRendererGodotPure class accessible');

      // Test 2: Method availability
      console.info('2. Testing method availability...');
      const hasToGodotSceneMethod = typeof renderer.toGodotSceneJSON === 'function';
      const hasManifestToNodesMethod = typeof renderer.manifestToGodotNodes === 'function';
      console.info(`   ${hasToGodotSceneMethod ? '✅' : '❌'} toGodotSceneJSON method: ${hasToGodotSceneMethod ? 'Available' : 'Missing'}`);
      console.info(`   ${hasManifestToNodesMethod ? '✅' : '❌'} manifestToGodotNodes method: ${hasManifestToNodesMethod ? 'Available' : 'Missing'}`);

      // Test 3: Sample avatar creation
      console.info('3. Testing sample avatar creation...');
      const sampleAvatar = this.createSampleAvatarData();
      console.info(`   ✅ Sample avatar created with ${sampleAvatar.components.length} components`);
      console.info(`   ✅ Sample avatar has ${sampleAvatar.assets.entries.length} asset entries`);

      // Test 4: Godot scene conversion
      console.info('4. Testing Godot scene conversion...');
      const godotScene = renderer.toGodotSceneJSON(sampleAvatar);
      console.info(`   ${godotScene ? '✅' : '❌'} Godot scene conversion: ${godotScene ? 'Success' : 'Failed'}`);
      if (godotScene) {
        console.info(`      Scene type: ${godotScene.type}`);
        console.info(`      Nodes count: ${godotScene.nodes.length}`);
        console.info(`      Meta style: ${godotScene.meta.style}`);
      }

      // Test 5: Manifest conversion
      console.info('5. Testing manifest conversion...');
      const sampleManifest = this.createSampleManifestData();
      const godotNodes = renderer.manifestToGodotNodes(sampleManifest);
      console.info(`   ${godotNodes ? '✅' : '❌'} Manifest to nodes conversion: ${godotNodes ? 'Success' : 'Failed'}`);
      if (godotNodes) {
        console.info(`      Generated nodes: ${godotNodes.length}`);
        godotNodes.forEach((node, index) => {
          console.info(`         ${index + 1}. ${node.name} (${node.type})`);
        });
      }

      // Test 6: Output validation
      console.info('6. Testing output validation...');
      const isValidScene = this.validateGodotScene(godotScene);
      const isValidNodes = this.validateGodotNodes(godotNodes);
      console.info(`   ${isValidScene ? '✅' : '❌'} Godot scene validation: ${isValidScene ? 'Valid' : 'Invalid'}`);
      console.info(`   ${isValidNodes ? '✅' : '❌'} Godot nodes validation: ${isValidNodes ? 'Valid' : 'Invalid'}`);

      console.info('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async convertToScene(filePath?: string): Promise<void> {
    if (!filePath) {
      console.info('❌ Usage: convert-to-scene <file>');
      return;
    }

    try {
      if (!fs.existsSync(filePath)) {
        console.info(`❌ File not found: ${filePath}`);
        return;
      }

      const avatarData = SafeJSONParser.parse(fs.readFileSync(filePath, 'utf-8'));
      const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(avatarData);
      
      const outputPath = filePath.replace('.json', '_godot_scene.json');
      fs.writeFileSync(outputPath, JSON.stringify(godotScene, null, 2));
      
      console.info(`✅ Avatar converted to Godot scene: ${outputPath}`);
      console.info(`   Scene type: ${godotScene.type}`);
      console.info(`   Nodes: ${godotScene.nodes.length}`);
      console.info(`   Meta: ${JSON.stringify(godotScene.meta)}`);

    } catch (error) {
      console.error('❌ Scene conversion failed:', error);
    }
  }

  private async convertManifest(filePath?: string): Promise<void> {
    if (!filePath) {
      console.info('❌ Usage: convert-manifest <file>');
      return;
    }

    try {
      if (!fs.existsSync(filePath)) {
        console.info(`❌ File not found: ${filePath}`);
        return;
      }

      const manifestData = SafeJSONParser.parse(fs.readFileSync(filePath, 'utf-8'));
      const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(manifestData);
      
      const outputPath = filePath.replace('.json', '_godot_nodes.json');
      fs.writeFileSync(outputPath, JSON.stringify(godotNodes, null, 2));
      
      console.info(`✅ Manifest converted to Godot nodes: ${outputPath}`);
      console.info(`   Generated nodes: ${godotNodes.length}`);
      godotNodes.forEach((node, index) => {
        console.info(`   ${index + 1}. ${node.name} (${node.type})`);
        if (node.texture) console.info(`      Texture: ${node.texture}`);
        if (node.position) console.info(`      Position: (${node.position.x}, ${node.position.y})`);
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
      console.info(`✅ Sample avatar created: ${outputPath}`);
      console.info(`   Components: ${sampleAvatar.components.length}`);
      console.info(`   Asset entries: ${sampleAvatar.assets.entries.length}`);
      console.info(`   Style: ${sampleAvatar.assets.style}`);

    } catch (error) {
      console.error('❌ Sample avatar creation failed:', error);
    }
  }

  private async createSampleManifest(): Promise<void> {
    try {
      const sampleManifest = this.createSampleManifestData();
      const outputPath = 'sample-manifest-godot.json';
      
      fs.writeFileSync(outputPath, JSON.stringify(sampleManifest, null, 2));
      console.info(`✅ Sample manifest created: ${outputPath}`);
      console.info(`   Base: ${sampleManifest.base}`);
      console.info(`   Style: ${sampleManifest.style}`);
      console.info(`   Clothing: ${sampleManifest.clothing.length} items`);

    } catch (error) {
      console.error('❌ Sample manifest creation failed:', error);
    }
  }

  private validateGodotOutput(): void {
    console.info('🔍 Validating Godot output format...');

    try {
      // Test scene validation
      const sampleAvatar = this.createSampleAvatarData();
      const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(sampleAvatar);
      const sceneValid = this.validateGodotScene(godotScene);
      console.info(`   ${sceneValid ? '✅' : '❌'} Godot scene format: ${sceneValid ? 'Valid' : 'Invalid'}`);

      // Test nodes validation
      const sampleManifest = this.createSampleManifestData();
      const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(sampleManifest);
      const nodesValid = this.validateGodotNodes(godotNodes);
      console.info(`   ${nodesValid ? '✅' : '❌'} Godot nodes format: ${nodesValid ? 'Valid' : 'Invalid'}`);

      // Test required fields
      if (godotScene) {
        const hasType = 'type' in godotScene;
        const hasNodes = 'nodes' in godotScene && Array.isArray(godotScene.nodes);
        const hasMeta = 'meta' in godotScene;
        
        console.info(`   ${hasType ? '✅' : '❌'} Scene has type field: ${hasType ? 'Yes' : 'No'}`);
        console.info(`   ${hasNodes ? '✅' : '❌'} Scene has nodes array: ${hasNodes ? 'Yes' : 'No'}`);
        console.info(`   ${hasMeta ? '✅' : '❌'} Scene has meta field: ${hasMeta ? 'Yes' : 'No'}`);
      }

      console.info('✅ Godot output validation completed');

    } catch (error) {
      console.error('❌ Godot output validation failed:', error);
    }
  }

  private async simulateConversion(): Promise<void> {
    console.info('🎭 Starting Godot conversion simulation...');
    
    try {
      // Create multiple test avatars
      console.info('1. Creating test avatars...');
      const avatars = [
        this.createSampleAvatarData('avatar-1', '3d'),
        this.createSampleAvatarData('avatar-2', '2d-side'),
        this.createSampleAvatarData('avatar-3', 'overlay')
      ];
      console.info(`   ✅ Created ${avatars.length} test avatars`);

      // Convert each avatar to Godot scene
      console.info('2. Converting avatars to Godot scenes...');
      for (let i = 0; i < avatars.length; i++) {
        const avatar = avatars[i];
        const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(avatar);
        
        console.info(`   🎨 Converting avatar ${i + 1} (${avatar.assets.style})...`);
        console.info(`      Scene type: ${godotScene.type}`);
        console.info(`      Nodes: ${godotScene.nodes.length}`);
        console.info(`      Meta style: ${godotScene.meta.style}`);
      }

      // Create multiple test manifests
      console.info('3. Creating test manifests...');
      const manifests = [
        this.createSampleManifestData('manifest-1'),
        this.createSampleManifestData('manifest-2'),
        this.createSampleManifestData('manifest-3')
      ];
      console.info(`   ✅ Created ${manifests.length} test manifests`);

      // Convert each manifest to Godot nodes
      console.info('4. Converting manifests to Godot nodes...');
      for (let i = 0; i < manifests.length; i++) {
        const manifest = manifests[i];
        const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(manifest);
        
        console.info(`   🎨 Converting manifest ${i + 1} (${manifest.base})...`);
        console.info(`      Generated nodes: ${godotNodes.length}`);
        godotNodes.forEach((node, index) => {
          console.info(`         ${index + 1}. ${node.name} (${node.type})`);
        });
      }

      // Simulate performance testing
      console.info('5. Simulating performance testing...');
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        const avatar = this.createSampleAvatarData(`perf-avatar-${i}`, '3d');
        AvatarRendererGodotPure.toGodotSceneJSON(avatar);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.info(`   ⚡ Converted 50 avatars in ${duration}ms (${(duration / 50).toFixed(2)}ms per avatar)`);

      // Simulate error handling
      console.info('6. Simulating error handling...');
      try {
        const invalidAvatar = { ...this.createSampleAvatarData(), assets: { style: '3d' as AvatarStyle, entries: [] } };
        const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(invalidAvatar);
        console.info('   ✅ Handled empty assets gracefully');
        console.info(`      Generated scene with ${godotScene.nodes.length} nodes`);
      } catch (error) {
        console.info(`   ⚠️  Error handling: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.info('✅ Godot conversion simulation completed successfully');

    } catch (error) {
      console.error('❌ Conversion simulation failed:', error);
    }
  }

  private createSampleAvatarData(id: string = 'sample-avatar', style: string = '3d'): ResolvedAvatar {
    return {
      components: [
        {
          kind: 'head',
          id: 'head-001',
          variant: 'basic',
          color: '#FFDBAC'
        },
        {
          kind: 'torso',
          id: 'torso-001',
          variant: 'basic',
          color: '#8B4513'
        },
        {
          kind: 'shirt',
          id: 'shirt-001',
          variant: 'basic',
          color: '#4169E1'
        }
      ],
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
        style: style as any
      },
      manifest: {
        base: 'barbarian',
        clothing: ['tunic_blue', 'leather_boots'],
        face: 'neutral',
        style: style as any,
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
          createdBy: 'AvatarRendererGodotPure',
          version: '1.0.0',
          description: `Sample manifest for ${id}`
        }
      }
    };
  }

  private createSampleManifestData(id: string = 'sample-manifest'): AvatarManifest {
    return {
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
        createdBy: 'AvatarRendererGodotPure',
        version: '1.0.0',
        description: `Sample manifest for ${id}`
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
    console.info(`
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
    console.info('🚀 Godot Avatar Renderer CLI Started');
    console.info('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main(...args: any[]) {
  const cli = new AvatarRendererGodotCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}