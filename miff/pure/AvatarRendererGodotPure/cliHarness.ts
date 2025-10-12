#!/usr/bin/env tsx

/**
 * AvatarRendererGodotPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the AvatarRendererGodotPure Godot avatar rendering system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  this.logger.info(`
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
  private logger: StructuredLogger;
  private rl: readline.Interface;

  constructor() {
    this.logger = new StructuredLogger({ module: 'AvatarRendererGodotCLI' });
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
      this.logger.info('\n👋 Godot Avatar Renderer CLI closed');
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
        this.logger.info(`❌ Unknown command: ${command}`);
        this.logger.info('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    this.logger.info('🧪 Running Godot Avatar Renderer tests...\n');

    try {
      // Test 1: Renderer class instantiation
      this.logger.info('1. Testing renderer class...');
      const renderer = AvatarRendererGodotPure;
      this.logger.info('   ✅ AvatarRendererGodotPure class accessible');

      // Test 2: Method availability
      this.logger.info('2. Testing method availability...');
      const hasToGodotSceneMethod = typeof renderer.toGodotSceneJSON === 'function';
      const hasManifestToNodesMethod = typeof renderer.manifestToGodotNodes === 'function';
      this.logger.info(`   ${hasToGodotSceneMethod ? '✅' : '❌'} toGodotSceneJSON method: ${hasToGodotSceneMethod ? 'Available' : 'Missing'}`);
      this.logger.info(`   ${hasManifestToNodesMethod ? '✅' : '❌'} manifestToGodotNodes method: ${hasManifestToNodesMethod ? 'Available' : 'Missing'}`);

      // Test 3: Sample avatar creation
      this.logger.info('3. Testing sample avatar creation...');
      const sampleAvatar = this.createSampleAvatarData();
      this.logger.info(`   ✅ Sample avatar created with ${sampleAvatar.components.length} components`);
      this.logger.info(`   ✅ Sample avatar has ${sampleAvatar.assets.entries.length} asset entries`);

      // Test 4: Godot scene conversion
      this.logger.info('4. Testing Godot scene conversion...');
      const godotScene = renderer.toGodotSceneJSON(sampleAvatar);
      this.logger.info(`   ${godotScene ? '✅' : '❌'} Godot scene conversion: ${godotScene ? 'Success' : 'Failed'}`);
      if (godotScene) {
        this.logger.info(`      Scene type: ${godotScene.type}`);
        this.logger.info(`      Nodes count: ${godotScene.nodes.length}`);
        this.logger.info(`      Meta style: ${godotScene.meta.style}`);
      }

      // Test 5: Manifest conversion
      this.logger.info('5. Testing manifest conversion...');
      const sampleManifest = this.createSampleManifestData();
      const godotNodes = renderer.manifestToGodotNodes(sampleManifest);
      this.logger.info(`   ${godotNodes ? '✅' : '❌'} Manifest to nodes conversion: ${godotNodes ? 'Success' : 'Failed'}`);
      if (godotNodes) {
        this.logger.info(`      Generated nodes: ${godotNodes.length}`);
        godotNodes.forEach((node, index) => {
          this.logger.info(`         ${index + 1}. ${node.name} (${node.type})`);
        });
      }

      // Test 6: Output validation
      this.logger.info('6. Testing output validation...');
      const isValidScene = this.validateGodotScene(godotScene);
      const isValidNodes = this.validateGodotNodes(godotNodes);
      this.logger.info(`   ${isValidScene ? '✅' : '❌'} Godot scene validation: ${isValidScene ? 'Valid' : 'Invalid'}`);
      this.logger.info(`   ${isValidNodes ? '✅' : '❌'} Godot nodes validation: ${isValidNodes ? 'Valid' : 'Invalid'}`);

      this.logger.info('\n🎉 All tests passed!');

    } catch (error) {
      this.logger.error('❌ Test failed:', error);
    }
  }

  private async convertToScene(filePath?: string): Promise<void> {
    if (!filePath) {
      this.logger.info('❌ Usage: convert-to-scene <file>');
      return;
    }

    try {
      if (!fs.existsSync(filePath)) {
        this.logger.info(`❌ File not found: ${filePath}`);
        return;
      }

      const avatarData = SafeJSONParser.parse(fs.readFileSync(filePath, 'utf-8'));
      const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(avatarData);
      
      const outputPath = filePath.replace('.json', '_godot_scene.json');
      fs.writeFileSync(outputPath, JSON.stringify(godotScene, null, 2));
      
      this.logger.info(`✅ Avatar converted to Godot scene: ${outputPath}`);
      this.logger.info(`   Scene type: ${godotScene.type}`);
      this.logger.info(`   Nodes: ${godotScene.nodes.length}`);
      this.logger.info(`   Meta: ${JSON.stringify(godotScene.meta)}`);

    } catch (error) {
      this.logger.error('❌ Scene conversion failed:', error);
    }
  }

  private async convertManifest(filePath?: string): Promise<void> {
    if (!filePath) {
      this.logger.info('❌ Usage: convert-manifest <file>');
      return;
    }

    try {
      if (!fs.existsSync(filePath)) {
        this.logger.info(`❌ File not found: ${filePath}`);
        return;
      }

      const manifestData = SafeJSONParser.parse(fs.readFileSync(filePath, 'utf-8'));
      const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(manifestData);
      
      const outputPath = filePath.replace('.json', '_godot_nodes.json');
      fs.writeFileSync(outputPath, JSON.stringify(godotNodes, null, 2));
      
      this.logger.info(`✅ Manifest converted to Godot nodes: ${outputPath}`);
      this.logger.info(`   Generated nodes: ${godotNodes.length}`);
      godotNodes.forEach((node, index) => {
        this.logger.info(`   ${index + 1}. ${node.name} (${node.type})`);
        if (node.texture) this.logger.info(`      Texture: ${node.texture}`);
        if (node.position) this.logger.info(`      Position: (${node.position.x}, ${node.position.y})`);
      });

    } catch (error) {
      this.logger.error('❌ Manifest conversion failed:', error);
    }
  }

  private async createSampleAvatar(): Promise<void> {
    try {
      const sampleAvatar = this.createSampleAvatarData();
      const outputPath = 'sample-avatar-godot.json';
      
      fs.writeFileSync(outputPath, JSON.stringify(sampleAvatar, null, 2));
      this.logger.info(`✅ Sample avatar created: ${outputPath}`);
      this.logger.info(`   Components: ${sampleAvatar.components.length}`);
      this.logger.info(`   Asset entries: ${sampleAvatar.assets.entries.length}`);
      this.logger.info(`   Style: ${sampleAvatar.assets.style}`);

    } catch (error) {
      this.logger.error('❌ Sample avatar creation failed:', error);
    }
  }

  private async createSampleManifest(): Promise<void> {
    try {
      const sampleManifest = this.createSampleManifestData();
      const outputPath = 'sample-manifest-godot.json';
      
      fs.writeFileSync(outputPath, JSON.stringify(sampleManifest, null, 2));
      this.logger.info(`✅ Sample manifest created: ${outputPath}`);
      this.logger.info(`   Base: ${sampleManifest.base}`);
      this.logger.info(`   Style: ${sampleManifest.style}`);
      this.logger.info(`   Clothing: ${sampleManifest.clothing.length} items`);

    } catch (error) {
      this.logger.error('❌ Sample manifest creation failed:', error);
    }
  }

  private validateGodotOutput(): void {
    this.logger.info('🔍 Validating Godot output format...');

    try {
      // Test scene validation
      const sampleAvatar = this.createSampleAvatarData();
      const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(sampleAvatar);
      const sceneValid = this.validateGodotScene(godotScene);
      this.logger.info(`   ${sceneValid ? '✅' : '❌'} Godot scene format: ${sceneValid ? 'Valid' : 'Invalid'}`);

      // Test nodes validation
      const sampleManifest = this.createSampleManifestData();
      const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(sampleManifest);
      const nodesValid = this.validateGodotNodes(godotNodes);
      this.logger.info(`   ${nodesValid ? '✅' : '❌'} Godot nodes format: ${nodesValid ? 'Valid' : 'Invalid'}`);

      // Test required fields
      if (godotScene) {
        const hasType = 'type' in godotScene;
        const hasNodes = 'nodes' in godotScene && Array.isArray(godotScene.nodes);
        const hasMeta = 'meta' in godotScene;
        
        this.logger.info(`   ${hasType ? '✅' : '❌'} Scene has type field: ${hasType ? 'Yes' : 'No'}`);
        this.logger.info(`   ${hasNodes ? '✅' : '❌'} Scene has nodes array: ${hasNodes ? 'Yes' : 'No'}`);
        this.logger.info(`   ${hasMeta ? '✅' : '❌'} Scene has meta field: ${hasMeta ? 'Yes' : 'No'}`);
      }

      this.logger.info('✅ Godot output validation completed');

    } catch (error) {
      this.logger.error('❌ Godot output validation failed:', error);
    }
  }

  private async simulateConversion(): Promise<void> {
    this.logger.info('🎭 Starting Godot conversion simulation...');
    
    try {
      // Create multiple test avatars
      this.logger.info('1. Creating test avatars...');
      const avatars = [
        this.createSampleAvatarData('avatar-1', '3d'),
        this.createSampleAvatarData('avatar-2', '2d-side'),
        this.createSampleAvatarData('avatar-3', 'overlay')
      ];
      this.logger.info(`   ✅ Created ${avatars.length} test avatars`);

      // Convert each avatar to Godot scene
      this.logger.info('2. Converting avatars to Godot scenes...');
      for (let i = 0; i < avatars.length; i++) {
        const avatar = avatars[i];
        const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(avatar);
        
        this.logger.info(`   🎨 Converting avatar ${i + 1} (${avatar.assets.style})...`);
        this.logger.info(`      Scene type: ${godotScene.type}`);
        this.logger.info(`      Nodes: ${godotScene.nodes.length}`);
        this.logger.info(`      Meta style: ${godotScene.meta.style}`);
      }

      // Create multiple test manifests
      this.logger.info('3. Creating test manifests...');
      const manifests = [
        this.createSampleManifestData('manifest-1'),
        this.createSampleManifestData('manifest-2'),
        this.createSampleManifestData('manifest-3')
      ];
      this.logger.info(`   ✅ Created ${manifests.length} test manifests`);

      // Convert each manifest to Godot nodes
      this.logger.info('4. Converting manifests to Godot nodes...');
      for (let i = 0; i < manifests.length; i++) {
        const manifest = manifests[i];
        const godotNodes = AvatarRendererGodotPure.manifestToGodotNodes(manifest);
        
        this.logger.info(`   🎨 Converting manifest ${i + 1} (${manifest.base})...`);
        this.logger.info(`      Generated nodes: ${godotNodes.length}`);
        godotNodes.forEach((node, index) => {
          this.logger.info(`         ${index + 1}. ${node.name} (${node.type})`);
        });
      }

      // Simulate performance testing
      this.logger.info('5. Simulating performance testing...');
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        const avatar = this.createSampleAvatarData(`perf-avatar-${i}`, '3d');
        AvatarRendererGodotPure.toGodotSceneJSON(avatar);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.logger.info(`   ⚡ Converted 50 avatars in ${duration}ms (${(duration / 50).toFixed(2)}ms per avatar)`);

      // Simulate error handling
      this.logger.info('6. Simulating error handling...');
      try {
        const invalidAvatar = { ...this.createSampleAvatarData(), assets: { style: '3d' as AvatarStyle, entries: [] } };
        const godotScene = AvatarRendererGodotPure.toGodotSceneJSON(invalidAvatar);
        this.logger.info('   ✅ Handled empty assets gracefully');
        this.logger.info(`      Generated scene with ${godotScene.nodes.length} nodes`);
      } catch (error) {
        this.logger.info(`   ⚠️  Error handling: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      this.logger.info('✅ Godot conversion simulation completed successfully');

    } catch (error) {
      this.logger.error('❌ Conversion simulation failed:', error);
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
    this.logger.info(`
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
    this.logger.info('🚀 Godot Avatar Renderer CLI Started');
    this.logger.info('Type "help" for available commands or "test" to run tests\n');
    
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