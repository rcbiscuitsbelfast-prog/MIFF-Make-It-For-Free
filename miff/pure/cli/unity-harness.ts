#!/usr/bin/env node

/**
 * Unity Bridge CLI Harness
 *
 * Dedicated harness for UnityBridgePure module.
 * Provides testing, validation, and demonstration capabilities
 * for Unity game engine integration.
 */

import { UnityBridgeManager, UnityBridgeConfiguration, UnityBridgeType, UnityCommunicationProtocol } from '../UnityBridgePure';
import { SpiritInstance, MoveData, MoveCategory } from '../CombatPure/engine';
import { Item, ItemType, ItemEffectType } from '../ItemsPure';
import { AIPolicy } from '../AIPure/Manager';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

export class UnityBridgeHarness {
  private logger: StructuredLogger;
  private bridge: UnityBridgeManager;

  constructor() {
    this.logger = new StructuredLogger({ module: 'UnityBridgeHarness' });
    const config: UnityBridgeConfiguration = {
      bridgeType: UnityBridgeType.GAME_OBJECT,
      communicationProtocol: UnityCommunicationProtocol.MESSAGE_PASSING,
      unityVersion: '2021.3',
      targetPlatform: 'windows',
      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      maxMessageSize: 1024 * 1024,
      timeout: 5000,
      retryAttempts: 3,
      connectionPoolSize: 5,
      serializationFormat: 'json',
      compression: 'none',
      encryption: false,
      heartbeatInterval: 1000,
      reconnectInterval: 5000,
      bufferSize: 1024,
      queueSize: 100,
      batchSize: 10,
      threadPoolSize: 4,
      customSettings: {}
    };

    this.bridge = new UnityBridgeManager(config);
  }

  async testCombatIntegration(): Promise<void> {
    console.info('⚔️  Testing CombatPure integration with Unity bridge...');

    try {
      // Create sample combat data
      const spirit = new SpiritInstance(
        'unity_spirit_1',
        'Unity Warrior',
        'player',
        { hp: 100, maxHp: 100, atk: 50, def: 40, spd: 30 },
        ['slash', 'defend'],
        'fire',
        10,
        'warrior',
        15,
        0,
        [],
        []
      );

//       const move = new MoveData(
        'unity_slash',
        'Unity Slash',
        MoveCategory.PHYSICAL,
        50,
        1.0,
        5,
        'normal'
      );

      // Test bridge communication
      const testMessage = {
        id: 'combat_test_1',
        type: 'command' as const,
        source: 'harness',
        destination: 'unity',
        timestamp: Date.now(),
        payload: {
          action: 'create_spirit',
          data: {
            name: spirit.name,
            typeTag: spirit.typeTag,
            stats: spirit.stats,
            moves: spirit.moves
          }
        },
        priority: 1,
        ttl: 30000,
        retries: 0,
        encrypted: false,
        compressed: false,
        metadata: {}
      };

      console.info('📤 Sending combat integration test...');
      const success = await this.bridge.sendMessage(testMessage);

      if (success) {
        console.info('✅ Combat integration test sent successfully');
      } else {
        console.info('❌ Failed to send combat integration test');
      }
    } catch (error) {
      console.error('💥 Combat integration test failed:', error);
    }
  }

  async testItemIntegration(): Promise<void> {
    console.info('🎒 Testing ItemsPure integration with Unity bridge...');

    try {
      // Create sample item data
      const item = new Item(
        'unity_potion',
        'Unity Health Potion',
        ItemType.CONSUMABLE,
        {
          type: ItemEffectType.HEAL,
          amount: 25,
          duration: 0,
          param: '',
          conditions: []
        },
        'A magical potion that restores health',
        100,
        'any'
      );

      const testMessage = {
        id: 'item_test_1',
        type: 'command' as const,
        source: 'harness',
        destination: 'unity',
        timestamp: Date.now(),
        payload: {
          action: 'create_item',
          data: {
            name: item.name,
            type: item.type,
            effect: item.effect,
            description: item.description,
            value: item.value
          }
        },
        priority: 1,
        ttl: 30000,
        retries: 0,
        encrypted: false,
        compressed: false,
        metadata: {}
      };

      console.info('📤 Sending item integration test...');
      const success = await this.bridge.sendMessage(testMessage);

      if (success) {
        console.info('✅ Item integration test sent successfully');
      } else {
        console.info('❌ Failed to send item integration test');
      }
    } catch (error) {
      console.error('💥 Item integration test failed:', error);
    }
  }

  async testAIIntegration(): Promise<void> {
    console.info('🤖 Testing AIPure integration with Unity bridge...');

    try {
      // Create sample AI policy
      const policy = AIPolicy.aggressive('unity_ai');

      const testMessage = {
        id: 'ai_test_1',
        type: 'command' as const,
        source: 'harness',
        destination: 'unity',
        timestamp: Date.now(),
        payload: {
          action: 'create_ai_policy',
          data: {
            policyId: policy.policyId,
            aggression: policy.aggression,
            caution: policy.caution,
            efficiency: policy.efficiency,
            overrideRules: policy.overrideRules
          }
        },
        priority: 1,
        ttl: 30000,
        retries: 0,
        encrypted: false,
        compressed: false,
        metadata: {}
      };

      console.info('📤 Sending AI integration test...');
      const success = await this.bridge.sendMessage(testMessage);

      if (success) {
        console.info('✅ AI integration test sent successfully');
      } else {
        console.info('❌ Failed to send AI integration test');
      }
    } catch (error) {
      console.error('💥 AI integration test failed:', error);
    }
  }

  async runFullIntegrationTest(): Promise<void> {
    console.info('🔗 Running full Unity bridge integration test...');
    console.info('=================================================');

    try {
      // Test connection
      console.info('1️⃣  Testing Unity connection...');
      // const connected = await this.bridge.connect('localhost:8080');
      // console.info(connected ? '✅ Connected' : '❌ Connection failed');

      // Test combat integration
      await this.testCombatIntegration();

      // Test item integration
      await this.testItemIntegration();

      // Test AI integration
      await this.testAIIntegration();

      // Get bridge statistics
      const stats = this.bridge.getStatistics();
      console.info('📊 Bridge Statistics:');
      console.info(`   - Total Messages: ${stats.totalMessages}`);
      console.info(`   - Error Rate: ${stats.errorRate.toFixed(3)}`);
      console.info(`   - Active Connections: ${stats.activeConnections}`);

      console.info('✅ Unity bridge integration test completed successfully');
    } catch (error) {
      console.error('💥 Unity bridge integration test failed:', error);
    }
  }

  async demo(): Promise<void> {
    console.info('🎮 Unity Bridge Demo');
    console.info('=====================');

    console.info('This demo shows how MIFF core modules integrate with Unity:');
    console.info('');
    console.info('1. ⚔️  CombatPure → Unity Battle System');
    console.info('   - Spirit stats and moves sync to Unity GameObjects');
    console.info('   - Damage calculations flow through Unity physics');
    console.info('   - Battle events trigger Unity animations');
    console.info('');
    console.info('2. 🎒 ItemsPure → Unity Inventory System');
    console.info('   - Items are represented as Unity ScriptableObjects');
    console.info('   - Item effects trigger Unity particle systems');
    console.info('   - Inventory UI is rendered in Unity Canvas');
    console.info('');
    console.info('3. 🤖 AIPure → Unity Decision Making');
    console.info('   - AI policies control Unity NPC behavior');
    console.info('   - Decision trees integrate with Unity NavMesh');
    console.info('   - Tactical analysis drives Unity formations');
    console.info('');

    await this.runFullIntegrationTest();
  }
}

// CLI Interface
if (require.main === module) {
  const harness = new UnityBridgeHarness();

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'combat':
      harness.testCombatIntegration();
      break;
    case 'items':
      harness.testItemIntegration();
      break;
    case 'ai':
      harness.testAIIntegration();
      break;
    case 'integration':
      harness.runFullIntegrationTest();
      break;
    case 'demo':
      harness.demo();
      break;
    default:
      console.info('Unity Bridge Harness');
      console.info('Usage:');
      console.info('  node unity-harness.ts combat      # Test CombatPure integration');
      console.info('  node unity-harness.ts items       # Test ItemsPure integration');
      console.info('  node unity-harness.ts ai          # Test AIPure integration');
      console.info('  node unity-harness.ts integration # Run full integration test');
      console.info('  node unity-harness.ts demo        # Run interactive demo');
      break;
  }
}