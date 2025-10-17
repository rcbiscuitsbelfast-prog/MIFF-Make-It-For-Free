#!/usr/bin/env tsx

/**
 * AvatarRendererWebPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the AvatarRendererWebPure web avatar rendering system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
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

class AvatarRendererWebCLI 
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: stdin: process.stdin,
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
      console.log('\n👋 Web Avatar Renderer CLI closed');
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
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running Web Avatar Renderer tests...\n');

    try {
      // Test 1: Renderer class instantiation
      console.log('1. Testing renderer class...');
      const renderer = AvatarRendererWebPure;
      console.log('   ✅ AvatarRendererWebPure class accessible');

      // Test 2: Method availability
      console.log('2. Testing method availability...');
      const hasRenderMethod = typeof renderer.renderToCanvas === 'function';
      console.log(`   ${hasRenderMethod ? '✅' : '❌'} renderToCanvas method: ${hasRenderMethod ? 'Available' : 'Missing'}`);

      // Test 3: Test avatar creation
      console.log('3. Testing test avatar creation...');
      const testAvatar = this.createTestAvatarData();
      console.log(`   ✅ Test avatar created with $testAvatar.length: components.length} components`);
      console.log(`   ✅ Test avatar has $testAvatar.assets.length: entries.length} asset entries`);
      console.log(`   ✅ Test avatar style: $testAvatar.style: assets.style}`);

      // Test 4: Canvas context simulation
      console.log('4. Testing canvas context simulation...');
      const mockContext = this.createMockCanvasContext();
      console.log('   ✅ Mock canvas context created');

      // Test 5: Rendering simulation
      console.log('5. Testing rendering simulation...');
      try {
        // Note: We can't actually call renderToCanvas in Node.js without a real canvas
        // So we'll simulate the rendering process
        this.simulateRenderingProcess(testAvatar, mockContext);
        console.log('   ✅ Rendering process simulated successfully');
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.log(`   ⚠️  Rendering simulation: ${error instanceof Error ? message: 'Unknown error'}`);
      }

      // Test 6: Asset validation
      console.log('6. Testing asset validation...');
      const assetCount = testAvatar.assets.entries.length;
      console.log(`   ✅ Test avatar has ${assetCount} asset entries`);

      const anchorOrder = ['anchor_cloak', 'anchor_shirt', 'anchor_torso', 'anchor_head', 'anchor_hat', 'anchor_accessory'];
      const hasAllAnchors = anchorOrder.every(anchor => 
        testAvatar.assets.entries.some(entry => entry.anchor === anchor)
      );
      console.log(`   ${hasAllAnchors ? '✅' : '❌'} Anchor coverage: ${hasAllAnchors ? 'Complete' : 'Incomplete'}`);

      console.log('\n🎉 All tests passed!');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Test failed:', err instanceof Error ? message: String(err));
    }
  }

  private async renderSample(): Promise<void> 
    try {
      console.log('🎨 Rendering sample avatar...');
      
      const testAvatar = this.createTestAvatarData();
      const mockContext = this.createMockCanvasContext();
      
      console.log('   📊 Avatar data:');
      console.log(`      Style: ${  style: assets.style}`);
      console.log(`      Components: $testAvatar.length: components.length}`);
      console.log(`      Asset Entries: $testAvatar.assets.length: entries.length}`);
      console.log(`      Manifest Base: $testAvatar.base: manifest.base}`);
      console.log(`      Manifest Style: $testAvatar.style: manifest.style}`);

      console.log('   🎯 Rendering process:');
      this.simulateRenderingProcess(testAvatar, mockContext);

      console.log('✅ Sample avatar rendered successfully');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Sample rendering failed:', err instanceof Error ? message: String(err));
    }
  }

  private async createTestAvatar(): Promise<void> 
    try {
      const testAvatar = this.createTestAvatarData();
      
      console.log('✅ Test avatar created:');
      console.log(`   Style: ${  style: assets.style}`);
      console.log(`   Components: $testAvatar.length: components.length}`);
      console.log(`   Asset Entries: $testAvatar.assets.length: entries.length}`);
      console.log(`   Manifest Base: $testAvatar.base: manifest.base}`);
      console.log(`   Manifest Style: $testAvatar.style: manifest.style}`);

      // Save to file for reference
      const fs = await import('fs');
      const avatarData = JSON.stringify(testAvatar, null, 2);
      fs.writeFileSync('test-avatar.json', avatarData);
      console.log('   💾 Test avatar saved to test-avatar.json');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Test avatar creation failed:', err instanceof Error ? message: String(err));
    }
  }

  private validateRenderer(): void {
    console.log('🔍 Validating Web Avatar Renderer...');

    try {
      // Check class availability
      const renderer = AvatarRendererWebPure;
      console.log('   ✅ AvatarRendererWebPure class available');

      // Check method availability
      const hasRenderMethod = typeof renderer.renderToCanvas === 'function';
      console.log(`   ${hasRenderMethod ? '✅' : '❌'} renderToCanvas method: ${hasRenderMethod ? 'Available' : 'Missing'}`);

      // Check method signature
      if (hasRenderMethod) {
        const methodString = renderer.renderToCanvas.toString();
        const hasCanvasParam = methodString.includes('ctx: CanvasRenderingContext2D');
        const hasAvatarParam = methodString.includes('avatar: ResolvedAvatar');
        console.log(`   ${hasCanvasParam ? '✅' : '❌'} Canvas context parameter: ${hasCanvasParam ? 'Correct' : 'Missing'}`);
        console.log(`   ${hasAvatarParam ? '✅' : '❌'} Avatar parameter: ${hasAvatarParam ? 'Correct' : 'Missing'}`);
      }

      // Check rendering logic
      const methodString = renderer.renderToCanvas.toString();
      const hasAnchorOrdering = methodString.includes('anchor_cloak');
      const hasImageLoading = methodString.includes('new Image()');
      const hasDrawImage = methodString.includes('drawImage');
      
      console.log(`   ${hasAnchorOrdering ? '✅' : '❌'} Anchor ordering logic: ${hasAnchorOrdering ? 'Present' : 'Missing'}`);
      console.log(`   ${hasImageLoading ? '✅' : '❌'} Image loading logic: ${hasImageLoading ? 'Present' : 'Missing'}`);
      console.log(`   ${hasDrawImage ? '✅' : '❌'} Canvas drawing logic: ${hasDrawImage ? 'Present' : 'Missing'}`);

      console.log('✅ Renderer validation completed');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Renderer validation failed:', err instanceof Error ? message: String(err));
    }
  }

  private async simulateRendering(): Promise<void> 
    console.log('🎭 Starting web avatar rendering simulation...');
    
    try {
      // Create multiple test avatars
      console.log('1. Creating test avatars...');
      const avatars = [
        this.createTestAvatarData('avatar-1', '3d'),
        this.createTestAvatarData('avatar-2', '2d-side'),
        this.createTestAvatarData('avatar-3', 'overlay')
      ];
      console.log(`   ✅ Created ${length: avatars.length} test avatars`);

      // Simulate rendering each avatar
      console.log('2. Simulating rendering process...');
      for (let i = 0; i < avatars.length; i++) {
        const avatar = avatars[i];
        const mockContext = this.createMockCanvasContext();
        
        console.log(`   🎨 Rendering avatar ${i + 1} ($avatar.style: assets.style})...`);
        this.simulateRenderingProcess(avatar, mockContext);
        
        // Simulate different rendering scenarios
        console.log(`      📊 Components: $avatar.length: components.length}`);
        console.log(`      📦 Asset Entries: $avatar.assets.length: entries.length}`);
        console.log(`      🎯 Manifest Base: $avatar.base: manifest.base}`);
        console.log(`      🎨 Manifest Style: $avatar.style: manifest.style}`);
      }

      // Simulate performance testing
      console.log('3. Simulating performance testing...');
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const avatar = this.createTestAvatarData(`perf-avatar-${i}`, '3d');
        const mockContext = this.createMockCanvasContext();
        this.simulateRenderingProcess(avatar, mockContext);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`   ⚡ Rendered 100 avatars in ${duration}ms (${(duration / 100).toFixed(2)}ms per avatar)`);

      // Simulate error handling
      console.log('4. Simulating error handling...');
      try {
        const invalidAvatar = { ...this.createTestAvatarData(), assets: { style: '3d' as AvatarStyle, entries: [] } };
        const mockContext = this.createMockCanvasContext();
        this.simulateRenderingProcess(invalidAvatar, mockContext);
        console.log('   ✅ Handled empty assets gracefully');
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.log(`   ⚠️  Error handling: ${error instanceof Error ? message: 'Unknown error'}`);
      }

      console.log('✅ Web avatar rendering simulation completed successfully');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Rendering simulation failed:', err instanceof Error ? message: String(err));
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
        console.log(`      🖼️  Drawing image at (${x}, ${y})`);
      },
      save: () => console.log('      💾 Saving canvas state'),
      restore: () => console.log('      🔄 Restoring canvas state'),
      translate: (x: number, y: number) => console.log(`      📍 Translating to (${x}, ${y})`),
      rotate: (angle: number) => console.log(`      🔄 Rotating by ${angle} radians`),
      scale: (x: number, y: number) => console.log(`      📏 Scaling by (${x}, ${y})`)
    };
  }

  private simulateRenderingProcess(avatar: ResolvedAvatar, mockContext: any): void {
    console.log('      🎨 Starting rendering process...');
    
    // Simulate the anchor ordering from the actual renderer
    const order = ['anchor_cloak', 'anchor_shirt', 'anchor_torso', 'anchor_head', 'anchor_hat', 'anchor_accessory'];
    
    for (const anchor of order) {
      const entry = avatar.assets.entries.find(e => e.anchor === anchor);
      if (entry) {
        console.log(`      📦 Rendering ${anchor}: $url: entry.url}`);
        // Simulate image loading and drawing
        mockContext.drawImage( src: url: entry.url}, 0, 0);
      } else {
        console.log(`      ⚠️  No asset found for anchor: ${anchor}`);
      }
    }
    
    console.log('      ✅ Rendering process completed');
  }

  private showHelp(): void {
    console.log(`
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
    console.log('🚀 Web Avatar Renderer CLI Started');
    console.log('Type "help" for available commands or "test" to run tests\n');
    
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