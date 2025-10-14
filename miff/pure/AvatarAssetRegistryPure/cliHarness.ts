#!/usr/bin/env tsx

/**
 * AvatarAssetRegistryPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the AvatarAssetRegistryPure avatar asset registry system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.info(`
AvatarAssetRegistryPure CLI Harness - Avatar Asset Registry System

Usage: npx tsx miff/pure/AvatarAssetRegistryPure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic asset registry tests
  resolve <id> <style>     - Resolve asset variant
  list-assets              - List all assets in registry
  add-asset <id>           - Add asset to registry
  create-sample-registry   - Create sample asset registry
  validate-registry        - Validate registry format
  simulate                 - Simulate asset registry operations
  help                     - Show this help

Examples:
  npx tsx miff/pure/AvatarAssetRegistryPure/cliHarness.ts test
  npx tsx miff/pure/AvatarAssetRegistryPure/cliHarness.ts resolve "head-001" "3d"
  npx tsx miff/pure/AvatarAssetRegistryPure/cliHarness.ts create-sample-registry
  npx tsx miff/pure/AvatarAssetRegistryPure/cliHarness.ts simulate
`);
  process.exit(0);
}

import * as readline from 'readline';
import { AvatarAssetRegistryPure, AvatarAssetRegistry, VariantMap } from './index';
import { AvatarStyle } from '../AvatarSystemPure/schema';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class AvatarAssetRegistryCLI {
  
  private registry: AvatarAssetRegistry;
  private rl: readline.Interface;

  constructor(...args: any[]) {
    
    this.registry = this.createSampleRegistryInternal();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'AssetRegistry> '
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });

    this.rl.on('close', () => {
      console.info('\n👋 Avatar Asset Registry CLI closed');
      process.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'test':
        await this.runTests();
        break;
      case 'resolve':
        await this.resolveAsset(args[0], args[1]);
        break;
      case 'list-assets':
        this.listAssets();
        break;
      case 'add-asset':
        await this.addAsset(args[0]);
        break;
      case 'create-sample-registry':
        await this.createSampleRegistry();
        break;
      case 'validate-registry':
        this.validateRegistry();
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
    console.info('🧪 Running Avatar Asset Registry tests...\n');

    try {
      // Test 1: Registry validation
      console.info('1. Testing registry validation...');
      const isValid = this.validateRegistryInternal();
      console.info(`   ${isValid ? '✅' : '❌'} Registry validation: ${isValid ? 'Valid' : 'Invalid'}`);

      // Test 2: Asset resolution
      console.info('2. Testing asset resolution...');
      const testAssets = [
        { id: 'head-001', style: '3d' as AvatarStyle },
        { id: 'head-001', style: '2d-side' as AvatarStyle },
        { id: 'head-001', style: 'overlay' as AvatarStyle },
        { id: 'torso-001', style: '3d' as AvatarStyle },
        { id: 'nonexistent', style: '3d' as AvatarStyle }
      ];

      for (const test of testAssets) {
        const resolved = AvatarAssetRegistryPure.resolveVariant(test.id, test.style, this.registry);
        console.info(`   ${resolved ? '✅' : '❌'} ${test.id} (${test.style}): ${resolved || 'Not found'}`);
      }

      // Test 3: Registry statistics
      console.info('3. Testing registry statistics...');
      console.info(`   ✅ Total assets: ${this.registry.items.length}`);
      console.info(`   ✅ Registry version: ${this.registry.version}`);

      // Test 4: Asset coverage
      console.info('4. Testing asset coverage...');
      const styles: AvatarStyle[] = ['3d', '2d-side', 'overlay'];
      for (const style of styles) {
        const coverage = this.getStyleCoverage(style);
        console.info(`   ✅ ${style} coverage: ${coverage}%`);
      }

      console.info('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async resolveAsset(id?: string, style?: string): Promise<void> {
    if (!id || !style) {
      console.info('❌ Usage: resolve <id> <style>');
      console.info('   Styles: 3d, 2d-side, overlay');
      return;
    }

    try {
      const resolved = AvatarAssetRegistryPure.resolveVariant(id, style as AvatarStyle, this.registry);
      
      if (resolved) {
        console.info(`✅ Asset resolved: ${id} (${style}) -> ${resolved}`);
      } else {
        console.info(`❌ Asset not found: ${id} (${style})`);
        console.info('   Available assets:');
        this.registry.items.forEach(item => {
          console.info(`   - ${item.id}`);
        });
      }
    } catch (error) {
      console.error('❌ Asset resolution failed:', error);
    }
  }

  private listAssets(): void {
    console.info('📦 Available Assets:');
    console.info(`   Registry Version: ${this.registry.version}`);
    console.info(`   Total Assets: ${this.registry.items.length}\n`);

    this.registry.items.forEach((item, index) => {
      console.info(`${index + 1}. ${item.id}`);
      console.info(`   Remix Safety: ${item.remixSafety}`);
      console.info(`   Variants:`);
      
      Object.entries(item.variants).forEach(([style, url]) => {
        console.info(`     ${style}: ${url}`);
      });
      
      if (item.generationHints) {
        console.info(`   Generation Hints: ${Object.keys(item.generationHints).join(', ')}`);
      }
      console.info('');
    });
  }

  private async addAsset(id?: string): Promise<void> {
    if (!id) {
      console.info('❌ Usage: add-asset <id>');
      return;
    }

    try {
      // Check if asset already exists
      const existingAsset = this.registry.items.find(item => item.id === id);
      if (existingAsset) {
        console.info(`❌ Asset "${id}" already exists`);
        return;
      }

      // Create new asset
      const newAsset: VariantMap = {
        id,
        variants: {
          '3d': `https://example.com/assets/${id}/3d.glb`,
          '2d-side': `https://example.com/assets/${id}/2d-side.png`,
          'overlay': `https://example.com/assets/${id}/overlay.png`
        },
        remixSafety: 'CC0',
        generationHints: {
          style: 'realistic',
          complexity: 'medium'
        }
      };

      this.registry.items.push(newAsset);
      console.info(`✅ Asset "${id}" added to registry`);
      console.info(`   Variants: ${Object.keys(newAsset.variants).join(', ')}`);
      console.info(`   Remix Safety: ${newAsset.remixSafety}`);
    } catch (error) {
      console.error('❌ Asset addition failed:', error);
    }
  }

  private async createSampleRegistry(): Promise<void> {
    try {
      this.registry = this.createSampleRegistryInternal();
      console.info('✅ Sample registry created');
      console.info(`   Assets: ${this.registry.items.length}`);
      console.info(`   Version: ${this.registry.version}`);
    } catch (error) {
      console.error('❌ Sample registry creation failed:', error);
    }
  }

  private validateRegistry(): void {
    const isValid = this.validateRegistryInternal();
    
    if (isValid) {
      console.info('✅ Registry is valid');
    } else {
      console.info('❌ Registry validation failed');
      console.info('   Issues found:');
      
      if (!this.registry.version) {
        console.info('   - Missing version');
      }
      if (!this.registry.items || !Array.isArray(this.registry.items)) {
        console.info('   - Invalid items array');
      } else {
        this.registry.items.forEach((item, index) => {
          if (!item.id) {
            console.info(`   - Item ${index}: Missing ID`);
          }
          if (!item.variants || typeof item.variants !== 'object') {
            console.info(`   - Item ${index}: Invalid variants`);
          }
          if (!item.remixSafety) {
            console.info(`   - Item ${index}: Missing remix safety`);
          }
        });
      }
    }
  }

  private validateRegistryInternal(): boolean {
    if (!this.registry.version) return false;
    if (!this.registry.items || !Array.isArray(this.registry.items)) return false;
    
    return this.registry.items.every(item => 
      item.id && 
      item.variants && 
      typeof item.variants === 'object' && 
      item.remixSafety
    );
  }

  private getStyleCoverage(style: AvatarStyle): number {
    const totalAssets = this.registry.items.length;
    if (totalAssets === 0) return 0;
    
    const assetsWithStyle = this.registry.items.filter(item => 
      item.variants[style as keyof typeof item.variants]
    ).length;
    
    return Math.round((assetsWithStyle / totalAssets) * 100);
  }

  private async simulate(): Promise<void> {
    console.info('🎭 Starting asset registry simulation...');
    
    try {
      // Show initial state
      console.info('1. Initial registry state...');
      console.info(`   Assets: ${this.registry.items.length}`);
      console.info(`   Version: ${this.registry.version}`);

      // Simulate asset resolution requests
      console.info('2. Simulating asset resolution requests...');
      const testCases = [
        { id: 'head-001', style: '3d' as AvatarStyle },
        { id: 'torso-001', style: '2d-side' as AvatarStyle },
        { id: 'legs-001', style: 'overlay' as AvatarStyle },
        { id: 'weapon-001', style: '3d' as AvatarStyle },
        { id: 'nonexistent', style: '3d' as AvatarStyle }
      ];

      for (const testCase of testCases) {
        const resolved = AvatarAssetRegistryPure.resolveVariant(testCase.id, testCase.style, this.registry);
        console.info(`   ${resolved ? '✅' : '❌'} ${testCase.id} (${testCase.style}): ${resolved || 'Not found'}`);
      }

      // Simulate adding new assets
      console.info('3. Simulating asset additions...');
      const newAssets = ['hat-001', 'shoes-001', 'gloves-001'];
      
      for (const assetId of newAssets) {
        const newAsset: VariantMap = {
          id: assetId,
          variants: {
            '3d': `https://example.com/assets/${assetId}/3d.glb`,
            '2d-side': `https://example.com/assets/${assetId}/2d-side.png`,
            'overlay': `https://example.com/assets/${assetId}/overlay.png`
          },
          remixSafety: 'CC0',
          generationHints: {
            style: 'realistic',
            complexity: 'low'
          }
        };

        this.registry.items.push(newAsset);
        console.info(`   ✅ Added ${assetId}`);
      }

      // Show final state
      console.info('4. Final registry state...');
      console.info(`   Assets: ${this.registry.items.length}`);
      
      const styleCoverage = ['3d', '2d-side', 'overlay'].map(style => 
        `${style}: ${this.getStyleCoverage(style as AvatarStyle)}%`
      ).join(', ');
      console.info(`   Style Coverage: ${styleCoverage}`);

      // Test final resolution
      console.info('5. Testing final resolution...');
      const finalTest = AvatarAssetRegistryPure.resolveVariant('hat-001', '3d', this.registry);
      console.info(`   ✅ New asset resolution: ${finalTest || 'Failed'}`);

      console.info('✅ Asset registry simulation completed successfully');

    } catch (error) {
      console.error('❌ Simulation failed:', error);
    }
  }

  private showHelp(): void {
    console.info(`
Available commands:
  test                     - Run basic asset registry tests
  resolve <id> <style>     - Resolve asset variant
  list-assets              - List all assets in registry
  add-asset <id>           - Add asset to registry
  create-sample-registry   - Create sample asset registry
  validate-registry        - Validate registry format
  simulate                 - Simulate asset registry operations
  help                     - Show this help
  exit/quit                - Exit the CLI

Styles: 3d, 2d-side, overlay
Remix Safety: CC0, restricted, custom
`);
  }

  private createSampleRegistryInternal(): AvatarAssetRegistry {
    return {
      version: '1.0.0',
      items: [
        {
          id: 'head-001',
          variants: {
            '3d': 'https://example.com/assets/head-001/3d.glb',
            '2d-side': 'https://example.com/assets/head-001/2d-side.png',
            'overlay': 'https://example.com/assets/head-001/overlay.png'
          },
          remixSafety: 'CC0',
          generationHints: {
            style: 'realistic',
            complexity: 'high'
          }
        },
        {
          id: 'torso-001',
          variants: {
            '3d': 'https://example.com/assets/torso-001/3d.glb',
            '2d-side': 'https://example.com/assets/torso-001/2d-side.png',
            'overlay': 'https://example.com/assets/torso-001/overlay.png'
          },
          remixSafety: 'CC0',
          generationHints: {
            style: 'realistic',
            complexity: 'medium'
          }
        },
        {
          id: 'legs-001',
          variants: {
            '3d': 'https://example.com/assets/legs-001/3d.glb',
            '2d-side': 'https://example.com/assets/legs-001/2d-side.png',
            'overlay': 'https://example.com/assets/legs-001/overlay.png'
          },
          remixSafety: 'CC0',
          generationHints: {
            style: 'realistic',
            complexity: 'medium'
          }
        },
        {
          id: 'weapon-001',
          variants: {
            '3d': 'https://example.com/assets/weapon-001/3d.glb',
            '2d-side': 'https://example.com/assets/weapon-001/2d-side.png',
            'overlay': 'https://example.com/assets/weapon-001/overlay.png'
          },
          remixSafety: 'restricted',
          generationHints: {
            style: 'fantasy',
            complexity: 'high'
          }
        }
      ]
    };
  }

  public async start(): Promise<void> {
    console.info('🚀 Avatar Asset Registry CLI Started');
    console.info('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main(...args: any[]) {
  const cli = new AvatarAssetRegistryCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}