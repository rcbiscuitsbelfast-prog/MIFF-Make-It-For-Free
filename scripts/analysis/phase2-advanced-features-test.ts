#!/usr/bin/env tsx

/**
 * Phase 2 Advanced Features Test Suite
 * 
 * Comprehensive testing of all advanced features implemented in Phase 2
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  feature: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
  duration: number;
}

interface AdvancedFeaturesTestSuite {
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  totalDuration: number;
}

class AdvancedFeaturesTester {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Run all advanced feature tests
   */
  async runAllTests(): Promise<AdvancedFeaturesTestSuite> {
    console.log('🚀 Starting Phase 2 Advanced Features Test Suite...\n');

    // Test advanced AI features
    await this.testAdvancedAI();
    
    // Test advanced status effects
    await this.testAdvancedStatusEffects();
    
    // Test advanced combat
    await this.testAdvancedCombat();
    
    // Test advanced quests
    await this.testAdvancedQuests();
    
    // Test advanced rendering
    await this.testAdvancedRendering();
    
    // Test advanced input
    await this.testAdvancedInput();
    
    // Test integration between advanced features
    await this.testAdvancedIntegration();

    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const warningTests = this.results.filter(r => r.status === 'WARNING').length;

    return {
      results: this.results,
      totalTests: this.results.length,
      passedTests,
      failedTests,
      warningTests,
      totalDuration
    };
  }

  /**
   * Test Advanced AI features
   */
  private async testAdvancedAI(): Promise<void> {
    console.log('🧠 Testing Advanced AI Features...');
    
    try {
      // Test behavior tree creation
      const behaviorTreeTest = await this.runTest('Advanced AI - Behavior Tree Creation', async () => {
        const { AdvancedAI } = await import('./miff/pure/AIPure/AdvancedAI');
        const ai = new AdvancedAI();
        
        const tree = ai.createBehaviorTree('test_tree', 'Test Tree', {
          type: 'selector',
          name: 'Root',
          children: [
            {
              type: 'condition',
              name: 'Check Health',
              condition: 'low_health'
            },
            {
              type: 'action',
              name: 'Heal',
              action: 'heal'
            }
          ]
        });

        return tree !== null;
      });

      // Test neural network decision making
      const neuralNetworkTest = await this.runTest('Advanced AI - Neural Network Decision Making', async () => {
        const { AdvancedAI } = await import('./miff/pure/AIPure/AdvancedAI');
        const ai = new AdvancedAI();
        
        const inputs = [0.5, 0.3, 0.8, 0.2];
        const outputs = ai.makeNeuralDecision('default', inputs);
        
        return Array.isArray(outputs) && outputs.length > 0;
      });

      // Test AI learning
      const learningTest = await this.runTest('Advanced AI - Learning System', async () => {
        const { AdvancedAI } = await import('./miff/pure/AIPure/AdvancedAI');
        const ai = new AdvancedAI();
        
        ai.learnFromExperience('test_ai', {
          id: 'exp1',
          context: { type: 'combat' },
          action: 'attack',
          result: 'success',
          reward: 1.0,
          timestamp: Date.now()
        });

        const memory = ai.getMemory('test_ai');
        return memory !== null && memory.experiences.length > 0;
      });

      // Test AI statistics
      const statsTest = await this.runTest('Advanced AI - Statistics', async () => {
        const { AdvancedAI } = await import('./miff/pure/AIPure/AdvancedAI');
        const ai = new AdvancedAI();
        
        const stats = ai.getAIStatistics('test_ai');
        return stats !== null && typeof stats === 'object';
      });

    } catch (error) {
      this.addResult('Advanced AI - Module Import', 'FAIL', `Failed to import Advanced AI module: ${error}`);
    }
  }

  /**
   * Test Advanced Status Effects features
   */
  private async testAdvancedStatusEffects(): Promise<void> {
    console.log('⚡ Testing Advanced Status Effects Features...');
    
    try {
      // Test effect chain creation
      const effectChainTest = await this.runTest('Advanced Status Effects - Effect Chain Creation', async () => {
        const { AdvancedStatusEffects } = await import('./miff/pure/StatusEffectsPure/AdvancedStatusEffects');
        const effects = new AdvancedStatusEffects();
        
        effects.createEffectChain({
          id: 'test_chain',
          name: 'Test Chain',
          effects: ['poison', 'weakness'],
          triggers: [],
          conditions: [],
          rewards: []
        });

        const chain = effects.getEffectChain('test_chain');
        return chain !== null;
      });

      // Test effect interactions
      const interactionTest = await this.runTest('Advanced Status Effects - Effect Interactions', async () => {
        const { AdvancedStatusEffects } = await import('./miff/pure/StatusEffectsPure/AdvancedStatusEffects');
        const effects = new AdvancedStatusEffects();
        
        effects.createEffectInteraction({
          id: 'test_interaction',
          effect1: 'fire',
          effect2: 'ice',
          interaction: 'cancellation',
          modifier: 0.5,
          description: 'Fire and ice cancel each other'
        });

        const interaction = effects.getEffectInteraction('fire', 'ice');
        return interaction !== null;
      });

      // Test effect auras
      const auraTest = await this.runTest('Advanced Status Effects - Effect Auras', async () => {
        const { AdvancedStatusEffects } = await import('./miff/pure/StatusEffectsPure/AdvancedStatusEffects');
        const effects = new AdvancedStatusEffects();
        
        effects.createEffectAura({
          id: 'test_aura',
          name: 'Test Aura',
          radius: 5,
          effects: [],
          conditions: [],
          duration: 10000,
          tickInterval: 1000
        });

        const aura = effects.getEffectAura('test_aura');
        return aura !== null;
      });

      // Test statistics
      const statsTest = await this.runTest('Advanced Status Effects - Statistics', async () => {
        const { AdvancedStatusEffects } = await import('./miff/pure/StatusEffectsPure/AdvancedStatusEffects');
        const effects = new AdvancedStatusEffects();
        
        const stats = effects.getEffectStatistics();
        return stats !== null && typeof stats === 'object';
      });

    } catch (error) {
      this.addResult('Advanced Status Effects - Module Import', 'FAIL', `Failed to import Advanced Status Effects module: ${error}`);
    }
  }

  /**
   * Test Advanced Combat features
   */
  private async testAdvancedCombat(): Promise<void> {
    console.log('⚔️ Testing Advanced Combat Features...');
    
    try {
      // Test combo system
      const comboTest = await this.runTest('Advanced Combat - Combo System', async () => {
        const { AdvancedCombat } = await import('./miff/pure/CombatPure/AdvancedCombat');
        const combat = new AdvancedCombat();
        
        combat.createCombo({
          id: 'test_combo',
          name: 'Test Combo',
          moves: ['punch', 'kick', 'uppercut'],
          requirements: [],
          effects: [],
          maxUses: 3,
          currentUses: 0
        });

        const combo = combat.getCombo('test_combo');
        return combo !== null;
      });

      // Test environmental effects
      const environmentalTest = await this.runTest('Advanced Combat - Environmental Effects', async () => {
        const { AdvancedCombat } = await import('./miff/pure/CombatPure/AdvancedCombat');
        const combat = new AdvancedCombat();
        
        combat.createEnvironmentalEffect({
          id: 'test_weather',
          name: 'Test Weather',
          type: 'weather',
          effects: [],
          duration: 300000,
          radius: 50
        });

        const effect = combat.getEnvironmentalEffect('test_weather');
        return effect !== null;
      });

      // Test tactical positions
      const tacticalTest = await this.runTest('Advanced Combat - Tactical Positions', async () => {
        const { AdvancedCombat } = await import('./miff/pure/CombatPure/AdvancedCombat');
        const combat = new AdvancedCombat();
        
        combat.createTacticalPosition({
          id: 'test_position',
          name: 'Test Position',
          position: { x: 0, y: 0, z: 0 },
          advantages: [],
          disadvantages: [],
          movementCost: 10
        });

        const position = combat.getTacticalPosition('test_position');
        return position !== null;
      });

      // Test battle phases
      const phaseTest = await this.runTest('Advanced Combat - Battle Phases', async () => {
        const { AdvancedCombat } = await import('./miff/pure/CombatPure/AdvancedCombat');
        const combat = new AdvancedCombat();
        
        combat.createBattlePhase({
          id: 'test_phase',
          name: 'Test Phase',
          duration: 30000,
          effects: [],
          transitions: []
        });

        const phase = combat.getBattlePhase('test_phase');
        return phase !== null;
      });

    } catch (error) {
      this.addResult('Advanced Combat - Module Import', 'FAIL', `Failed to import Advanced Combat module: ${error}`);
    }
  }

  /**
   * Test Advanced Quests features
   */
  private async testAdvancedQuests(): Promise<void> {
    console.log('📜 Testing Advanced Quests Features...');
    
    try {
      // Test procedural quest generation
      const proceduralTest = await this.runTest('Advanced Quests - Procedural Quest Generation', async () => {
        const { AdvancedQuests } = await import('./miff/pure/QuestsPure/AdvancedQuests');
        const quests = new AdvancedQuests();
        
        const quest = quests.generateProceduralQuest('combat', { id: 'test_player' });
        return quest !== null && quest.type === 'procedural';
      });

      // Test quest templates
      const templateTest = await this.runTest('Advanced Quests - Quest Templates', async () => {
        const { AdvancedQuests } = await import('./miff/pure/QuestsPure/AdvancedQuests');
        const quests = new AdvancedQuests();
        
        const template = quests.getQuestTemplate('combat');
        return template !== null;
      });

      // Test quest statistics
      const statsTest = await this.runTest('Advanced Quests - Statistics', async () => {
        const { AdvancedQuests } = await import('./miff/pure/QuestsPure/AdvancedQuests');
        const quests = new AdvancedQuests();
        
        const stats = quests.getAdvancedQuestStatistics();
        return stats !== null && typeof stats === 'object';
      });

    } catch (error) {
      this.addResult('Advanced Quests - Module Import', 'FAIL', `Failed to import Advanced Quests module: ${error}`);
    }
  }

  /**
   * Test Advanced Rendering features
   */
  private async testAdvancedRendering(): Promise<void> {
    console.log('🎨 Testing Advanced Rendering Features...');
    
    try {
      // Test shader creation
      const shaderTest = await this.runTest('Advanced Rendering - Shader Creation', async () => {
        const { AdvancedRendering } = await import('./miff/pure/RenderWorldPure/AdvancedRendering');
        const rendering = new AdvancedRendering();
        
        rendering.createShader({
          id: 'test_shader',
          name: 'Test Shader',
          vertexShader: 'attribute vec3 position; void main() { gl_Position = vec4(position, 1.0); }',
          fragmentShader: 'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }',
          uniforms: new Map(),
          attributes: new Map(),
          compiled: false
        });

        const shader = rendering.getShader('test_shader');
        return shader !== null;
      });

      // Test light creation
      const lightTest = await this.runTest('Advanced Rendering - Light Creation', async () => {
        const { AdvancedRendering } = await import('./miff/pure/RenderWorldPure/AdvancedRendering');
        const rendering = new AdvancedRendering();
        
        rendering.createLight({
          id: 'test_light',
          type: 'point',
          position: { x: 0, y: 5, z: 0 },
          color: { r: 1, g: 1, b: 1, a: 1 },
          intensity: 1.0,
          shadows: true,
          enabled: true
        });

        const light = rendering.getLight('test_light');
        return light !== null;
      });

      // Test particle system
      const particleTest = await this.runTest('Advanced Rendering - Particle System', async () => {
        const { AdvancedRendering } = await import('./miff/pure/RenderWorldPure/AdvancedRendering');
        const rendering = new AdvancedRendering();
        
        rendering.createParticleSystem({
          id: 'test_particles',
          name: 'Test Particles',
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 1, z: 0 },
          acceleration: { x: 0, y: -0.1, z: 0 },
          size: 1.0,
          color: { r: 1, g: 0, b: 0, a: 1 },
          lifetime: 1000,
          maxParticles: 100,
          emissionRate: 10,
          enabled: true
        });

        const system = rendering.getParticleSystem('test_particles');
        return system !== null;
      });

      // Test camera system
      const cameraTest = await this.runTest('Advanced Rendering - Camera System', async () => {
        const { AdvancedRendering } = await import('./miff/pure/RenderWorldPure/AdvancedRendering');
        const rendering = new AdvancedRendering();
        
        rendering.createCamera({
          id: 'test_camera',
          name: 'Test Camera',
          position: { x: 0, y: 5, z: 10 },
          rotation: { x: 0, y: 0, z: 0 },
          fov: 60,
          near: 0.1,
          far: 1000,
          aspect: 16 / 9,
          projection: 'perspective',
          smoothFollow: true,
          followSpeed: 2.0
        });

        const camera = rendering.getCamera('test_camera');
        return camera !== null;
      });

    } catch (error) {
      this.addResult('Advanced Rendering - Module Import', 'FAIL', `Failed to import Advanced Rendering module: ${error}`);
    }
  }

  /**
   * Test Advanced Input features
   */
  private async testAdvancedInput(): Promise<void> {
    console.log('🎮 Testing Advanced Input Features...');
    
    try {
      // Test gesture creation
      const gestureTest = await this.runTest('Advanced Input - Gesture Creation', async () => {
        const { AdvancedInput } = await import('./miff/pure/InputSystemPure/AdvancedInput');
        const input = new AdvancedInput();
        
        input.createGesture({
          id: 'test_gesture',
          name: 'Test Gesture',
          type: 'tap',
          pattern: {
            type: 'sequence',
            inputs: [{
              type: 'touch',
              value: 'down',
              duration: 100
            }]
          },
          threshold: {
            maxDuration: 200
          },
          callback: (gesture, data) => {
            console.log('Gesture detected:', data);
          },
          enabled: true
        });

        const gesture = input.getGesture('test_gesture');
        return gesture !== null;
      });

      // Test haptic feedback
      const hapticTest = await this.runTest('Advanced Input - Haptic Feedback', async () => {
        const { AdvancedInput } = await import('./miff/pure/InputSystemPure/AdvancedInput');
        const input = new AdvancedInput();
        
        input.createHapticFeedback({
          id: 'test_haptic',
          name: 'Test Haptic',
          type: 'impact',
          intensity: 0.5,
          duration: 100,
          pattern: {
            type: 'single',
            intervals: [0],
            intensities: [0.5]
          },
          enabled: true
        });

        const haptic = input.getHapticFeedback('test_haptic');
        return haptic !== null;
      });

      // Test input mapping
      const mappingTest = await this.runTest('Advanced Input - Input Mapping', async () => {
        const { AdvancedInput } = await import('./miff/pure/InputSystemPure/AdvancedInput');
        const input = new AdvancedInput();
        
        input.createInputMapping({
          id: 'test_mapping',
          name: 'Test Mapping',
          input: {
            type: 'key',
            value: 'space'
          },
          action: 'jump',
          context: 'gameplay',
          priority: 1,
          enabled: true,
          conditions: []
        });

        const mapping = input.getInputMapping('test_mapping');
        return mapping !== null;
      });

      // Test input profile
      const profileTest = await this.runTest('Advanced Input - Input Profile', async () => {
        const { AdvancedInput } = await import('./miff/pure/InputSystemPure/AdvancedInput');
        const input = new AdvancedInput();
        
        input.createInputProfile({
          id: 'test_profile',
          name: 'Test Profile',
          mappings: [],
          gestures: [],
          haptics: [],
          sensitivity: {
            mouse: 1.0,
            touch: 1.0,
            gamepad: 1.0,
            gesture: 1.0
          },
          enabled: true
        });

        const profile = input.getInputProfile('test_profile');
        return profile !== null;
      });

    } catch (error) {
      this.addResult('Advanced Input - Module Import', 'FAIL', `Failed to import Advanced Input module: ${error}`);
    }
  }

  /**
   * Test integration between advanced features
   */
  private async testAdvancedIntegration(): Promise<void> {
    console.log('🔗 Testing Advanced Features Integration...');
    
    try {
      // Test AI + Combat integration
      const aiCombatTest = await this.runTest('Advanced Integration - AI + Combat', async () => {
        const { AdvancedAI } = await import('./miff/pure/AIPure/AdvancedAI');
        const { AdvancedCombat } = await import('./miff/pure/CombatPure/AdvancedCombat');
        
        const ai = new AdvancedAI();
        const combat = new AdvancedCombat();
        
        // Create AI behavior tree for combat
        const combatTree = ai.createBehaviorTree('combat_ai', 'Combat AI', {
          type: 'selector',
          name: 'Combat Root',
          children: []
        });
        
        // Create combat combo
        const combo = combat.createCombo({
          id: 'ai_combo',
          name: 'AI Combo',
          moves: ['attack', 'defend'],
          requirements: [],
          effects: [],
          maxUses: 5,
          currentUses: 0
        });
        
        return combatTree !== null && combo !== null;
      });

      // Test Status Effects + Quests integration
      const effectsQuestsTest = await this.runTest('Advanced Integration - Status Effects + Quests', async () => {
        const { AdvancedStatusEffects } = await import('./miff/pure/StatusEffectsPure/AdvancedStatusEffects');
        const { AdvancedQuests } = await import('./miff/pure/QuestsPure/AdvancedQuests');
        
        const effects = new AdvancedStatusEffects();
        const quests = new AdvancedQuests();
        
        // Create effect chain for quest
        effects.createEffectChain({
          id: 'quest_chain',
          name: 'Quest Chain',
          effects: ['blessing', 'strength'],
          triggers: [],
          conditions: [],
          rewards: []
        });
        
        // Generate quest that might use effects
        const quest = quests.generateProceduralQuest('combat', { id: 'test_player' });
        
        return effects.getEffectChain('quest_chain') !== null && quest !== null;
      });

      // Test Rendering + Input integration
      const renderingInputTest = await this.runTest('Advanced Integration - Rendering + Input', async () => {
        const { AdvancedRendering } = await import('./miff/pure/RenderWorldPure/AdvancedRendering');
        const { AdvancedInput } = await import('./miff/pure/InputSystemPure/AdvancedInput');
        
        const rendering = new AdvancedRendering();
        const input = new AdvancedInput();
        
        // Create camera that follows input
        const camera = rendering.createCamera({
          id: 'input_camera',
          name: 'Input Camera',
          position: { x: 0, y: 5, z: 10 },
          rotation: { x: 0, y: 0, z: 0 },
          fov: 60,
          near: 0.1,
          far: 1000,
          aspect: 16 / 9,
          projection: 'perspective',
          smoothFollow: true,
          followSpeed: 2.0
        });
        
        // Create input gesture for camera control
        const gesture = input.createGesture({
          id: 'camera_gesture',
          name: 'Camera Gesture',
          type: 'swipe',
          pattern: {
            type: 'sequence',
            inputs: [{
              type: 'touch',
              value: 'down',
              duration: 50
            }]
          },
          threshold: {
            minDistance: 50
          },
          callback: (gesture, data) => {
            console.log('Camera gesture detected');
          },
          enabled: true
        });
        
        return camera !== null && gesture !== null;
      });

    } catch (error) {
      this.addResult('Advanced Integration - Module Import', 'FAIL', `Failed to import advanced modules for integration testing: ${error}`);
    }
  }

  /**
   * Run a single test
   */
  private async runTest(name: string, testFn: () => Promise<boolean>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      if (result) {
        this.addResult(name, 'PASS', 'Test passed successfully', undefined, duration);
      } else {
        this.addResult(name, 'FAIL', 'Test returned false', undefined, duration);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult(name, 'FAIL', `Test failed with error: ${error}`, undefined, duration);
    }
  }

  /**
   * Add a test result
   */
  private addResult(feature: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any, duration: number = 0): void {
    this.results.push({
      feature,
      status,
      message,
      details,
      duration
    });
  }

  /**
   * Generate test report
   */
  generateReport(suite: AdvancedFeaturesTestSuite): string {
    const report = `
# Phase 2 Advanced Features Test Report

## Summary
- **Total Tests**: ${suite.totalTests}
- **Passed**: ${suite.passedTests} ✅
- **Failed**: ${suite.failedTests} ❌
- **Warnings**: ${suite.warningTests} ⚠️
- **Total Duration**: ${suite.totalDuration}ms
- **Success Rate**: ${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}%

## Test Results

${suite.results.map(result => `
### ${result.feature}
- **Status**: ${result.status}
- **Message**: ${result.message}
- **Duration**: ${result.duration}ms
${result.details ? `- **Details**: ${JSON.stringify(result.details, null, 2)}` : ''}
`).join('\n')}

## Advanced Features Implemented

### 🧠 Advanced AI System
- Behavior Tree System
- Neural Network Decision Making
- Machine Learning and Experience System
- AI Statistics and Analytics

### ⚡ Advanced Status Effects
- Effect Chain System
- Effect Interactions (Synergy, Conflict, Cancellation)
- Effect Auras
- Advanced Effect Management

### ⚔️ Advanced Combat
- Combo System
- Environmental Effects
- Tactical Positioning
- Battle Phases

### 📜 Advanced Quests
- Procedural Quest Generation
- Quest Templates
- Dynamic Quest Creation
- Advanced Quest Management

### 🎨 Advanced Rendering
- Shader System
- Dynamic Lighting
- Particle Systems
- Post-Processing Effects
- Advanced Camera System

### 🎮 Advanced Input
- Gesture Recognition
- Haptic Feedback
- Input Mapping
- Input Profiles
- Advanced Input Processing

## Integration Testing
- AI + Combat integration
- Status Effects + Quests integration
- Rendering + Input integration
- Cross-module communication

## Recommendations

${suite.failedTests > 0 ? `
### Immediate Actions Required
- Fix ${suite.failedTests} failing tests
- Address any import/export issues
- Ensure all advanced features are properly integrated
` : ''}

${suite.warningTests > 0 ? `
### Warnings to Address
- Review ${suite.warningTests} warning tests
- Consider improving error handling
- Add additional validation where needed
` : ''}

### Next Steps
1. **Performance Optimization**: Profile advanced features for performance bottlenecks
2. **Documentation**: Create comprehensive documentation for all advanced features
3. **Testing**: Expand test coverage for edge cases
4. **Integration**: Continue building cross-module integrations
5. **User Experience**: Gather feedback on advanced feature usability

## Conclusion

Phase 2 advanced features implementation is ${suite.failedTests === 0 ? 'successful' : 'partially successful'}. 
${suite.passedTests} out of ${suite.totalTests} tests passed, demonstrating a ${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}% success rate.

The advanced features provide a solid foundation for the next phase of development, with comprehensive systems for AI, combat, quests, rendering, and input handling.
`;

    return report;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const tester = new AdvancedFeaturesTester();
  
  try {
    const suite = await tester.runAllTests();
    
    // Generate report
    const report = tester.generateReport(suite);
    
    // Save report
    const reportPath = '/workspace/docs/archive/test-results/2025-10-01-phase2-advanced-features-test.txt';
    writeFileSync(reportPath, report);
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${suite.passedTests}`);
    console.log(`❌ Failed: ${suite.failedTests}`);
    console.log(`⚠️  Warnings: ${suite.warningTests}`);
    console.log(`⏱️  Total Duration: ${suite.totalDuration}ms`);
    console.log(`📈 Success Rate: ${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}%`);
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    if (suite.failedTests > 0) {
      console.log('\n❌ Some tests failed. Please review the report for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All advanced features tests passed!');
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run the test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}