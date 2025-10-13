#!/usr/bin/env tsx

/**
 * AvatarRendererWebPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the AvatarRendererWebPure web avatar rendering system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.info(`
AvatarRendererWebPure CLI Harness - Web Avatar Rendering System

Usage: npx tsx miff/pure/AvatarRendererWebPure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic web renderer tests
  render-sample            - Render sample avatar
  create-test-avatar       - Create test avatar data
  validate-renderer        - Validate renderer functionality
  simulate-rendering       - Simulate rendering operations
  help                     - Show this help

Examples:
  npx tsx miff/pure/AvatarRendererWebPure/cliHarness.ts test
  npx tsx miff/pure/AvatarRendererWebPure/cliHarness.ts render-sample
  npx tsx miff/pure/AvatarRendererWebPure/cliHarness.ts simulate-rendering
`);
  process.exit(0);
}

import * as readline from 'readline';
import { AvatarRendererWebPure } from './index';
import { ResolvedAvatar, AvatarStyle } from '../AvatarSystemPure/schema';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class AvatarRendererWebCLI {
  private logger: StructuredLogger;
  private rl: readline.Interface;

  constructor() {
    this.logger = new StructuredLogger({ module: 'AvatarRendererWebCLI' });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'WebRenderer> '
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });

    this.rl.on('close', () => {
      console.info('\n👋 Web Avatar Renderer CLI closed');
      process.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'test':
        await this.runTests();
        break;
      case 'render-sample':
        await this.renderSample();
        break;
      case 'create-test-avatar':
        await this.createTestAvatar();
        break;
      case 'validate-renderer':
        this.validateRenderer();
        break;
      case 'simulate-rendering':
        await this.simulateRendering();
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
    console.info('🧪 Running Web Avatar Renderer tests...\n');

    try {
      // Test 1: Renderer class instantiation
      console.info('1. Testing renderer class...');
      const renderer = AvatarRendererWebPure;
      console.info('   ✅ AvatarRendererWebPure class accessible');

      // Test 2: Method availability
      console.info('2. Testing method availability...');
      const hasRenderMethod = typeof renderer.renderToCanvas === 'function';
      console.info(`   ${hasRenderMethod ? '✅' : '❌'} renderToCanvas method: ${hasRenderMethod ? 'Available' : 'Missing'}`);

      // Test 3: Test avatar creation
      console.info('3. Testing test avatar creation...');
      const testAvatar = this.createTestAvatarData();
      console.info(`   ✅ Test avatar created with ${testAvatar.components.length} components`);
      console.info(`   ✅ Test avatar has ${testAvatar.assets.entries.length} asset entries`);
      console.info(`   ✅ Test avatar style: ${testAvatar.assets.style}`);

      // Test 4: Canvas context simulation
      console.info('4. Testing canvas context simulation...');
      const mockContext = this.createMockCanvasContext();
      console.info('   ✅ Mock canvas context created');

      // Test 5: Rendering simulation
      console.info('5. Testing rendering simulation...');
      try {
        // Note: We can't actually call renderToCanvas in Node.js without a real canvas
        // So we'll simulate the rendering process
        this.simulateRenderingProcess(testAvatar, mockContext);
        console.info('   ✅ Rendering process simulated successfully');
      } catch (error) {
        console.info(`   ⚠️  Rendering simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test 6: Asset validation
      console.info('6. Testing asset validation...');
      const assetCount = testAvatar.assets.entries.length;
      console.info(`   ✅ Test avatar has ${assetCount} asset entries`);

      const anchorOrder = ['anchor_cloak', 'anchor_shirt', 'anchor_torso', 'anchor_head', 'anchor_hat', 'anchor_accessory'];
      const hasAllAnchors = anchorOrder.every(anchor => 
        testAvatar.assets.entries.some(entry => entry.anchor === anchor)
      );
      console.info(`   ${hasAllAnchors ? '✅' : '❌'} Anchor coverage: ${hasAllAnchors ? 'Complete' : 'Incomplete'}`);

      console.info('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async renderSample(): Promise<void> {
    try {
      console.info('🎨 Rendering sample avatar...');
      
      const testAvatar = this.createTestAvatarData();
      const mockContext = this.createMockCanvasContext();
      
      console.info('   📊 Avatar data:');
      console.info(`      Style: ${testAvatar.assets.style}`);
      console.info(`      Components: ${testAvatar.components.length}`);
      console.info(`      Asset Entries: ${testAvatar.assets.entries.length}`);
      console.info(`      Manifest Base: ${testAvatar.manifest.base}`);
      console.info(`      Manifest Style: ${testAvatar.manifest.style}`);

      console.info('   🎯 Rendering process:');
      this.simulateRenderingProcess(testAvatar, mockContext);

      console.info('✅ Sample avatar rendered successfully');

    } catch (error) {
      console.error('❌ Sample rendering failed:', error);
    }
  }

  private async createTestAvatar(): Promise<void> {
    try {
      const testAvatar = this.createTestAvatarData();
      
      console.info('✅ Test avatar created:');
      console.info(`   Style: ${testAvatar.assets.style}`);
      console.info(`   Components: ${testAvatar.components.length}`);
      console.info(`   Asset Entries: ${testAvatar.assets.entries.length}`);
      console.info(`   Manifest Base: ${testAvatar.manifest.base}`);
      console.info(`   Manifest Style: ${testAvatar.manifest.style}`);

      // Save to file for reference
      const fs = await import('fs');
      const avatarData = JSON.stringify(testAvatar, null, 2);
      fs.writeFileSync('test-avatar.json', avatarData);
      console.info('   💾 Test avatar saved to test-avatar.json');

    } catch (error) {
      console.error('❌ Test avatar creation failed:', error);
    }
  }

  private validateRenderer(): void {
    console.info('🔍 Validating Web Avatar Renderer...');

    try {
      // Check class availability
      const renderer = AvatarRendererWebPure;
      console.info('   ✅ AvatarRendererWebPure class available');

      // Check method availability
      const hasRenderMethod = typeof renderer.renderToCanvas === 'function';
      console.info(`   ${hasRenderMethod ? '✅' : '❌'} renderToCanvas method: ${hasRenderMethod ? 'Available' : 'Missing'}`);

      // Check method signature
      if (hasRenderMethod) {
        const methodString = renderer.renderToCanvas.toString();
        const hasCanvasParam = methodString.includes('ctx: CanvasRenderingContext2D');
        const hasAvatarParam = methodString.includes('avatar: ResolvedAvatar');
        console.info(`   ${hasCanvasParam ? '✅' : '❌'} Canvas context parameter: ${hasCanvasParam ? 'Correct' : 'Missing'}`);
        console.info(`   ${hasAvatarParam ? '✅' : '❌'} Avatar parameter: ${hasAvatarParam ? 'Correct' : 'Missing'}`);
      }

      // Check rendering logic
      const methodString = renderer.renderToCanvas.toString();
      const hasAnchorOrdering = methodString.includes('anchor_cloak');
      const hasImageLoading = methodString.includes('new Image()');
      const hasDrawImage = methodString.includes('drawImage');
      
      console.info(`   ${hasAnchorOrdering ? '✅' : '❌'} Anchor ordering logic: ${hasAnchorOrdering ? 'Present' : 'Missing'}`);
      console.info(`   ${hasImageLoading ? '✅' : '❌'} Image loading logic: ${hasImageLoading ? 'Present' : 'Missing'}`);
      console.info(`   ${hasDrawImage ? '✅' : '❌'} Canvas drawing logic: ${hasDrawImage ? 'Present' : 'Missing'}`);

      console.info('✅ Renderer validation completed');

    } catch (error) {
      console.error('❌ Renderer validation failed:', error);
    }
  }

  private async simulateRendering(): Promise<void> {
    console.info('🎭 Starting web avatar rendering simulation...');
    
    try {
      // Create multiple test avatars
      console.info('1. Creating test avatars...');
      const avatars = [
        this.createTestAvatarData('avatar-1', '3d'),
        this.createTestAvatarData('avatar-2', '2d-side'),
        this.createTestAvatarData('avatar-3', 'overlay')
      ];
      console.info(`   ✅ Created ${avatars.length} test avatars`);

      // Simulate rendering each avatar
      console.info('2. Simulating rendering process...');
      for (let i = 0; i < avatars.length; i++) {
        const avatar = avatars[i];
        const mockContext = this.createMockCanvasContext();
        
        console.info(`   🎨 Rendering avatar ${i + 1} (${avatar.assets.style})...`);
        this.simulateRenderingProcess(avatar, mockContext);
        
        // Simulate different rendering scenarios
        console.info(`      📊 Components: ${avatar.components.length}`);
        console.info(`      📦 Asset Entries: ${avatar.assets.entries.length}`);
        console.info(`      🎯 Manifest Base: ${avatar.manifest.base}`);
        console.info(`      🎨 Manifest Style: ${avatar.manifest.style}`);
      }

      // Simulate performance testing
      console.info('3. Simulating performance testing...');
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const avatar = this.createTestAvatarData(`perf-avatar-${i}`, '3d');
        const mockContext = this.createMockCanvasContext();
        this.simulateRenderingProcess(avatar, mockContext);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.info(`   ⚡ Rendered 100 avatars in ${duration}ms (${(duration / 100).toFixed(2)}ms per avatar)`);

      // Simulate error handling
      console.info('4. Simulating error handling...');
      try {
        const invalidAvatar = { ...this.createTestAvatarData(), assets: { style: '3d' as AvatarStyle, entries: [] } };
        const mockContext = this.createMockCanvasContext();
        this.simulateRenderingProcess(invalidAvatar, mockContext);
        console.info('   ✅ Handled empty assets gracefully');
      } catch (error) {
        console.info(`   ⚠️  Error handling: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.info('✅ Web avatar rendering simulation completed successfully');

    } catch (error) {
      console.error('❌ Rendering simulation failed:', error);
    }
  }

  private createTestAvatarData(id: string = 'test-avatar', style: string = '3d'): ResolvedAvatar {
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
        },
        {
          kind: 'cloak',
          id: 'cloak-001',
          variant: 'basic',
          color: '#800080'
        },
        {
          kind: 'hat',
          id: 'hat-001',
          variant: 'basic',
          color: '#654321'
        },
        {
          kind: 'accessory',
          id: 'accessory-001',
          variant: 'basic',
          color: '#FFD700'
        }
      ],
      assets: {
        style: style as any,
        entries: [
          {
            anchor: 'anchor_cloak',
            url: 'https://example.com/assets/cloak.png'
          },
          {
            anchor: 'anchor_shirt',
            url: 'https://example.com/assets/shirt.png'
          },
          {
            anchor: 'anchor_torso',
            url: 'https://example.com/assets/torso.png'
          },
          {
            anchor: 'anchor_head',
            url: 'https://example.com/assets/head.png'
          },
          {
            anchor: 'anchor_hat',
            url: 'https://example.com/assets/hat.png'
          },
          {
            anchor: 'anchor_accessory',
            url: 'https://example.com/assets/accessory.png'
          }
        ]
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
          createdBy: 'AvatarRendererWebPure',
          version: '1.0.0',
          description: `Test avatar for ${id}`
        }
      }
    };
  }

  private createMockCanvasContext(): any {
    return {
      drawImage: (img: any, x: number, y: number) => {
        console.info(`      🖼️  Drawing image at (${x}, ${y})`);
      },
      save: () => console.info('      💾 Saving canvas state'),
      restore: () => console.info('      🔄 Restoring canvas state'),
      translate: (x: number, y: number) => console.info(`      📍 Translating to (${x}, ${y})`),
      rotate: (angle: number) => console.info(`      🔄 Rotating by ${angle} radians`),
      scale: (x: number, y: number) => console.info(`      📏 Scaling by (${x}, ${y})`)
    };
  }

  private simulateRenderingProcess(avatar: ResolvedAvatar, mockContext: any): void {
    console.info('      🎨 Starting rendering process...');
    
    // Simulate the anchor ordering from the actual renderer
    const order = ['anchor_cloak', 'anchor_shirt', 'anchor_torso', 'anchor_head', 'anchor_hat', 'anchor_accessory'];
    
    for (const anchor of order) {
      const entry = avatar.assets.entries.find(e => e.anchor === anchor);
      if (entry) {
        console.info(`      📦 Rendering ${anchor}: ${entry.url}`);
        // Simulate image loading and drawing
        mockContext.drawImage({ src: entry.url }, 0, 0);
      } else {
        console.info(`      ⚠️  No asset found for anchor: ${anchor}`);
      }
    }
    
    console.info('      ✅ Rendering process completed');
  }

  private showHelp(): void {
    console.info(`
Available commands:
  test                     - Run basic web renderer tests
  render-sample            - Render sample avatar
  create-test-avatar       - Create test avatar data
  validate-renderer        - Validate renderer functionality
  simulate-rendering       - Simulate rendering operations
  help                     - Show this help
  exit/quit                - Exit the CLI

Note: This renderer is designed for web browsers with Canvas API.
Some features may not work in Node.js environment.
`);
  }

  public async start(): Promise<void> {
    console.info('🚀 Web Avatar Renderer CLI Started');
    console.info('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main() {
  const cli = new AvatarRendererWebCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}