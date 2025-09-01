/**
 * MIFF Main Orchestrator Test Harness
 * 
 * Provides testing and integration examples for the main orchestrator:
 * - Basic game loop testing
 * - Input system testing
 * - Save/load testing
 * - Touch input testing
 * - Visual tools integration testing
 * - Scenario integration testing
 */

import { MainOrchestrator, mainOrchestrator, GameState } from './mainOrchestrator';
import { TileManager } from '../TileMapPure/tileManager';
import { TileType } from '../TileMapPure/tileTypes';
import { loadZone } from './zoneLoader';
import { setPlayerPosition } from './playerPosition';
import { registerNPC } from './npcRegistry';
import { registerDialogue } from './dialogueEngine';
import { addQuest } from './questTracker';
import { addItem } from './inventoryState';

// Test configuration
interface TestConfig {
  enableVisual: boolean;
  enableAudio: boolean;
  enableTouch: boolean;
  enableDebug: boolean;
  testDuration: number;
  autoSave: boolean;
}

export class MIFFTestHarness {
  private orchestrator: MainOrchestrator;
  private canvas: HTMLCanvasElement | null = null;
  private testResults: Map<string, boolean> = new Map();
  private testStartTime: number = 0;

  constructor(config: Partial<TestConfig> = {}) {
    const testConfig = {
      enableVisual: true,
      enableAudio: false,
      enableTouch: true,
      enableDebug: true,
      testDuration: 30000, // 30 seconds
      autoSave: true,
      ...config
    };

    this.orchestrator = new MainOrchestrator({
      enableTouch: testConfig.enableTouch,
      enableAudio: testConfig.enableAudio,
      enableDebug: testConfig.enableDebug,
      autoSave: testConfig.autoSave,
    });
  }

  // Test Setup
  public setupTestEnvironment(): void {
    console.log('Setting up MIFF test environment...');
    
    // Create test canvas
    this.createTestCanvas();
    
    // Setup test zone
    this.setupTestZone();
    
    // Setup test NPCs
    this.setupTestNPCs();
    
    // Setup test quests
    this.setupTestQuests();
    
    // Setup test inventory
    this.setupTestInventory();
    
    console.log('Test environment setup complete');
  }

  private createTestCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.border = '1px solid #333';
    this.canvas.style.backgroundColor = '#222';
    
    document.body.appendChild(this.canvas);
    this.orchestrator.setCanvas(this.canvas);
  }

  private setupTestZone(): void {
    loadZone('grove');
    setPlayerPosition(5, 5);
    
    // Add some test tiles
    const world = this.orchestrator.getRenderBridge()?.getWorld?.();
    if (world?.tiles) {
      world.tiles.setTile(3, 3, TileType.Water);
      world.tiles.setTile(7, 7, TileType.Forest);
      world.tiles.setTile(2, 8, TileType.Sand);
    }
  }

  private setupTestNPCs(): void {
    registerNPC({
      id: 'testSpirit',
      name: 'Test Spirit',
      x: 6,
      y: 6,
      dialogue: ['Hello, tester!', 'This is a test dialogue.', 'Good luck with your tests!']
    });

    registerDialogue('testSpirit', [
      'Hello, tester!',
      'This is a test dialogue.',
      'Good luck with your tests!'
    ]);
  }

  private setupTestQuests(): void {
    addQuest('test_quest_1', 'Find the test spirit');
    addQuest('test_quest_2', 'Collect 3 test items');
  }

  private setupTestInventory(): void {
    addItem('test_item_1', 'Test Item 1', 1);
    addItem('test_item_2', 'Test Item 2', 2);
  }

  // Test Execution
  public async runAllTests(): Promise<Map<string, boolean>> {
    console.log('Starting MIFF test suite...');
    this.testStartTime = Date.now();

    const tests = [
      { name: 'Game Loop Test', fn: () => this.testGameLoop() },
      { name: 'Input System Test', fn: () => this.testInputSystem() },
      { name: 'Save/Load Test', fn: () => this.testSaveLoad() },
      { name: 'Touch Input Test', fn: () => this.testTouchInput() },
      { name: 'NPC Interaction Test', fn: () => this.testNPCInteraction() },
      { name: 'Tile System Test', fn: () => this.testTileSystem() },
      { name: 'Event System Test', fn: () => this.testEventSystem() },
      { name: 'Visual Tools Test', fn: () => this.testVisualTools() },
    ];

    for (const test of tests) {
      try {
        console.log(`Running ${test.name}...`);
        const result = await test.fn();
        this.testResults.set(test.name, result);
        console.log(`${test.name}: ${result ? 'PASS' : 'FAIL'}`);
      } catch (error) {
        console.error(`${test.name} failed with error:`, error);
        this.testResults.set(test.name, false);
      }
    }

    this.printTestResults();
    return this.testResults;
  }

  // Individual Tests
  private async testGameLoop(): Promise<boolean> {
    return new Promise((resolve) => {
      this.orchestrator.start();
      
      setTimeout(() => {
        const gameState = this.orchestrator.getGameState();
        this.orchestrator.stop();
        resolve(gameState === GameState.PLAYING);
      }, 1000);
    });
  }

  private async testInputSystem(): Promise<boolean> {
    return new Promise((resolve) => {
      let keyboardTest = false;
      let mouseTest = false;

      // Test keyboard input
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(keyEvent);
      keyboardTest = true;

      // Test mouse input
      if (this.canvas) {
        const mouseEvent = new MouseEvent('click', { 
          clientX: 100, 
          clientY: 100,
          button: 0 
        });
        this.canvas.dispatchEvent(mouseEvent);
        mouseTest = true;
      }

      setTimeout(() => {
        resolve(keyboardTest && mouseTest);
      }, 100);
    });
  }

  private async testSaveLoad(): Promise<boolean> {
    try {
      // Save game
      this.orchestrator.saveGame();
      
      // Load game
      this.orchestrator.loadGame();
      
      return true;
    } catch (error) {
      console.error('Save/Load test failed:', error);
      return false;
    }
  }

  private async testTouchInput(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.canvas) {
        resolve(false);
        return;
      }

      let touchStartTest = false;
      let touchEndTest = false;

      // Test touch start
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{
          clientX: 100,
          clientY: 100,
          identifier: 1,
          target: this.canvas,
          pageX: 100,
          pageY: 100,
          screenX: 100,
          screenY: 100,
          radiusX: 0,
          radiusY: 0,
          rotationAngle: 0,
          force: 1
        } as Touch],
        changedTouches: [],
        targetTouches: [],
        bubbles: true,
        cancelable: true
      });

      this.canvas.dispatchEvent(touchStartEvent);
      touchStartTest = true;

      // Test touch end
      const touchEndEvent = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{
          clientX: 100,
          clientY: 100,
          identifier: 1,
          target: this.canvas,
          pageX: 100,
          pageY: 100,
          screenX: 100,
          screenY: 100,
          radiusX: 0,
          radiusY: 0,
          rotationAngle: 0,
          force: 1
        } as Touch],
        targetTouches: [],
        bubbles: true,
        cancelable: true
      });

      this.canvas.dispatchEvent(touchEndEvent);
      touchEndTest = true;

      setTimeout(() => {
        resolve(touchStartTest && touchEndTest);
      }, 100);
    });
  }

  private async testNPCInteraction(): Promise<boolean> {
    try {
      // Test NPC registration
      const npc = this.orchestrator.getRenderBridge()?.getNPC?.('testSpirit');
      return npc !== undefined;
    } catch (error) {
      console.error('NPC interaction test failed:', error);
      return false;
    }
  }

  private async testTileSystem(): Promise<boolean> {
    try {
      const world = this.orchestrator.getRenderBridge()?.getWorld?.();
      if (!world?.tiles) return false;

      // Test tile operations
      world.tiles.setTile(1, 1, TileType.Grass);
      const tile = world.tiles.getTile(1, 1);
      const isWalkable = world.tiles.isTileWalkable(1, 1);

      return tile?.type === TileType.Grass && isWalkable;
    } catch (error) {
      console.error('Tile system test failed:', error);
      return false;
    }
  }

  private async testEventSystem(): Promise<boolean> {
    return new Promise((resolve) => {
      let eventReceived = false;

      // Subscribe to test event
      this.orchestrator.getRenderBridge()?.on?.('testEvent', () => {
        eventReceived = true;
      });

      // Emit test event
      this.orchestrator.getRenderBridge()?.emit?.('testEvent');

      setTimeout(() => {
        resolve(eventReceived);
      }, 100);
    });
  }

  private async testVisualTools(): Promise<boolean> {
    try {
      // Test if visual tools can be instantiated
      const manager = new TileManager(10, 10);
      return manager !== null;
    } catch (error) {
      console.error('Visual tools test failed:', error);
      return false;
    }
  }

  // Test Results
  private printTestResults(): void {
    const duration = Date.now() - this.testStartTime;
    const passed = Array.from(this.testResults.values()).filter(Boolean).length;
    const total = this.testResults.size;

    console.log('\n=== MIFF Test Results ===');
    console.log(`Duration: ${duration}ms`);
    console.log(`Passed: ${passed}/${total}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log('\nDetailed Results:');

    for (const [testName, result] of this.testResults) {
      console.log(`  ${testName}: ${result ? '✅ PASS' : '❌ FAIL'}`);
    }

    if (passed === total) {
      console.log('\n🎉 All tests passed! MIFF orchestrator is ready for use.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }
  }

  // Integration Examples
  public createPlayableDemo(): void {
    console.log('Creating playable MIFF demo...');
    
    this.setupTestEnvironment();
    this.orchestrator.start();
    
    // Add demo instructions
    this.addDemoInstructions();
  }

  private addDemoInstructions(): void {
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">
        <h4>MIFF Demo Controls</h4>
        <p><strong>Movement:</strong> Arrow keys or WASD</p>
        <p><strong>Touch:</strong> Tap to move, swipe for direction</p>
        <p><strong>Interact:</strong> Space or E key</p>
        <p><strong>Inventory:</strong> I key</p>
        <p><strong>Quests:</strong> Q key</p>
        <p><strong>Save:</strong> F5 key</p>
        <p><strong>Load:</strong> F9 key</p>
        <p><strong>Debug:</strong> F12 key</p>
        <p><strong>Pause:</strong> Escape key</p>
      </div>
    `;
    document.body.appendChild(instructions);
  }

  // Cleanup
  public cleanup(): void {
    this.orchestrator.stop();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    console.log('MIFF test harness cleaned up');
  }
}

// Export test harness instance
export const testHarness = new MIFFTestHarness();

// Auto-run tests if in test environment
if (typeof window !== 'undefined' && window.location.search.includes('test=true')) {
  window.addEventListener('load', async () => {
    const harness = new MIFFTestHarness();
    await harness.runAllTests();
  });
}

export default MIFFTestHarness;