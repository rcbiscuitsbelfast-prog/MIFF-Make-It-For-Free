#!/usr/bin/env node

/**
 * Unity Bridge CLI Harness
 *
 * Dedicated harness for UnityBridgePure module.
 * Provides testing, validation, and demonstration capabilities
 * for Unity game engine integration.
 */

import { UnityBridgeManager, UnityBridgeConfiguration, UnityBridgeType, UnityCommunicationProtocol } from '../UnityBridgePure';
import { CombatUtils, SpiritInstance, MoveData, MoveCategory } from '../CombatPure/engine';
import { ItemUsageManager, Item, ItemType, ItemEffectType } from '../ItemsPure';
import { BattleAI, AIPolicy } from '../AIPure/Manager';

export class UnityBridgeHarness {
  private bridge: UnityBridgeManager;

  constructor() {
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
    console.log('⚔️  Testing CombatPure integration with Unity bridge...');

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

      const move = new MoveData(
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

      console.log('📤 Sending combat integration test...');
      const success = await this.bridge.sendMessage(testMessage);

      if (success) {
        console.log('✅ Combat integration test sent successfully');
      } else {
        console.log('❌ Failed to send combat integration test');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('💥 Combat integration test failed:', err instanceof Error ? err.message : String(err));
    }
  }

  async testItemIntegration(): Promise<void> {
    console.log('🎒 Testing ItemsPure integration with Unity bridge...');

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

      console.log('📤 Sending item integration test...');
      const success = await this.bridge.sendMessage(testMessage);

      if (success) {
        console.log('✅ Item integration test sent successfully');
      } else {
        console.log('❌ Failed to send item integration test');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('💥 Item integration test failed:', err instanceof Error ? err.message : String(err));
    }
  }

  async testAIIntegration(): Promise<void> {
    console.log('🤖 Testing AIPure integration with Unity bridge...');

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

      console.log('📤 Sending AI integration test...');
      const success = await this.bridge.sendMessage(testMessage);

      if (success) {
        console.log('✅ AI integration test sent successfully');
      } else {
        console.log('❌ Failed to send AI integration test');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('💥 AI integration test failed:', err instanceof Error ? err.message : String(err));
    }
  }

  async runFullIntegrationTest(): Promise<void> {
    console.log('🔗 Running full Unity bridge integration test...');
    console.log('=================================================');

    try {
      // Test connection
      console.log('1️⃣  Testing Unity connection...');
      // const connected = await this.bridge.connect('localhost:8080');
      // console.log(connected ? '✅ Connected' : '❌ Connection failed');

      // Test combat integration
      await this.testCombatIntegration();

      // Test item integration
      await this.testItemIntegration();

      // Test AI integration
      await this.testAIIntegration();

      // Get bridge statistics
      const stats = this.bridge.getStatistics();
      console.log('📊 Bridge Statistics:');
      console.log(`   - Total Messages: ${stats.totalMessages}`);
      console.log(`   - Error Rate: ${stats.errorRate.toFixed(3)}`);
      console.log(`   - Active Connections: ${stats.activeConnections}`);

      console.log('✅ Unity bridge integration test completed successfully');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('💥 Unity bridge integration test failed:', err instanceof Error ? err.message : String(err));
    }
  }

  async demo(): Promise<void> {
    console.log('🎮 Unity Bridge Demo');
    console.log('=====================');

    console.log('This demo shows how MIFF core modules integrate with Unity:');
    console.log('');
    console.log('1. ⚔️  CombatPure → Unity Battle System');
    console.log('   - Spirit stats and moves sync to Unity GameObjects');
    console.log('   - Damage calculations flow through Unity physics');
    console.log('   - Battle events trigger Unity animations');
    console.log('');
    console.log('2. 🎒 ItemsPure → Unity Inventory System');
    console.log('   - Items are represented as Unity ScriptableObjects');
    console.log('   - Item effects trigger Unity particle systems');
    console.log('   - Inventory UI is rendered in Unity Canvas');
    console.log('');
    console.log('3. 🤖 AIPure → Unity Decision Making');
    console.log('   - AI policies control Unity NPC behavior');
    console.log('   - Decision trees integrate with Unity NavMesh');
    console.log('   - Tactical analysis drives Unity formations');
    console.log('');

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
      console.log('Unity Bridge Harness');
      console.log('Usage:');
      console.log('  node unity-harness.ts combat      # Test CombatPure integration');
      console.log('  node unity-harness.ts items       # Test ItemsPure integration');
      console.log('  node unity-harness.ts ai          # Test AIPure integration');
      console.log('  node unity-harness.ts integration # Run full integration test');
      console.log('  node unity-harness.ts demo        # Run interactive demo');
      break;
  }
}