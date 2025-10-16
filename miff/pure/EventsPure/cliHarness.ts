#!/usr/bin/env node

/**
 * EventsPure CLI Harness
 *
 * Interactive CLI for testing EventsPure functionality.
 * Supports publishing events, subscribing to topics, and managing subscriptions.
 */

import { EventBus, EventListener, EventUtils } from './index';

interface CLIState {
  eventBus: EventBus;
  subscriptions: Map<string, EventListener>;
}

function parseCommand(input: string): { command: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  return {
    command: parts[0]?.toLowerCase() || '',
    args: parts.slice(1)
  };
}

function printHelp(): void {
  console.log(`
EventsPure CLI - Interactive Event Bus Testing
=============================================

Commands:
  help                    Show this help
  publish <topic> [data]  Publish event to topic
  subscribe <topic>       Subscribe to topic and print events
  unsubscribe <id>        Unsubscribe by ID
  list                    List all active topics and subscriber counts
  stats                   Show event bus statistics
  clear                   Clear all subscriptions
  demo                    Run demo sequence
  quit                    Exit CLI

Examples:
  publish combat damage
  subscribe player_action
  list
  demo
`);
}

function createSubscriptionListener(topic: string): (payload?: any) => void {
  return (payload?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Event on '${topic}':`, payload ? JSON.stringify(payload, null, 2) : 'no payload');
  };
}

function generateDemoEvents(eventBus: EventBus): void {
  console.log('🎮 Running EventsPure Demo...');

  // Demo subscriptions
  const combatListener = eventBus.subscribe('combat', createSubscriptionListener('combat'));
  const questListener = eventBus.subscribe('quest', createSubscriptionListener('quest'));
  const itemListener = eventBus.subscribe('item', createSubscriptionListener('item'));

  console.log('✅ Created subscriptions for: combat, quest, item');

  // Demo events
  setTimeout(() => {
    eventBus.publish('combat', { type: 'attack', damage: 25, target: 'goblin' });
  }, 100);

  setTimeout(() => {
    eventBus.publish('quest', { type: 'progress', questId: 'village_help', progress: 50 });
  }, 200);

  setTimeout(() => {
    eventBus.publish('item', { type: 'pickup', itemId: 'health_potion', quantity: 1 });
  }, 300);

  setTimeout(() => {
    eventBus.publish('combat', { type: 'heal', amount: 15, target: 'hero' });
  }, 400);

  setTimeout(() => {
    console.log('🎯 Demo completed! All events published.');
    showStats(eventBus);
  }, 500);
}

function showStats(eventBus: EventBus): void {
  console.log('\n📊 Event Bus Statistics:');
  console.log(`Total Subscriptions: ${eventBus.getTotalSubscriptions()}`);
  console.log(`Active Topics: ${eventBus.getActiveTopics().join(', ') || 'none'}`);

  eventBus.getActiveTopics().forEach(topic => {
    console.log(`  ${topic}: ${eventBus.getSubscriberCount(topic)} subscribers`);
  });
}

async function runCLI(): Promise<void> {
  const state: CLIState = {
    eventBus: new EventBus(),
    subscriptions: new Map()
  };

  console.log('🎯 EventsPure CLI - Type "help" for commands or "demo" to see it in action\n');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'events> '
  });

  rl.prompt();

  rl.on('line', (input: string) => {
    const { command, args } = parseCommand(input);

    switch (command) {
      case 'help':
      case 'h':
        printHelp();
        break;

      case 'publish':
      case 'pub':
        if (args.length === 0) {
          console.log('❌ Usage: publish <topic> [data]');
        } else {
          const topic = args[0];
          const payload = args.slice(1).length > 0 ? JSON.parse(args.slice(1).join(' ')) : undefined;
          state.eventBus.publish(topic, payload);
          console.log(`✅ Published event to '${topic}'`);
        }
        break;

      case 'subscribe':
      case 'sub':
        if (args.length === 0) {
          console.log('❌ Usage: subscribe <topic>');
        } else {
          const topic = args[0];
          const listener = state.eventBus.subscribe(topic, createSubscriptionListener(topic));
          const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          state.subscriptions.set(subscriptionId, listener);
          console.log(`✅ Subscribed to '${topic}' (ID: ${subscriptionId})`);
        }
        break;

      case 'unsubscribe':
      case 'unsub':
        if (args.length === 0) {
          console.log('❌ Usage: unsubscribe <id>');
        } else {
          const subscriptionId = args[0];
          const listener = state.subscriptions.get(subscriptionId);
          if (listener) {
            listener.dispose();
            state.subscriptions.delete(subscriptionId);
            console.log(`✅ Unsubscribed from '${listener.topic}' (ID: ${subscriptionId})`);
          } else {
            console.log(`❌ Subscription not found: ${subscriptionId}`);
          }
        }
        break;

      case 'list':
      case 'ls':
        console.log('\n📋 Active Subscriptions:');
        if (state.subscriptions.size === 0) {
          console.log('  No active subscriptions');
        } else {
          let index = 1;
          for (const [id, listener] of state.subscriptions) {
            console.log(`  ${index++}. ${listener.topic} (ID: ${id})`);
          }
        }
        showStats(state.eventBus);
        break;

      case 'stats':
        showStats(state.eventBus);
        break;

      case 'clear':
        state.eventBus.clear();
        state.subscriptions.clear();
        console.log('✅ Cleared all subscriptions');
        break;

      case 'demo':
        generateDemoEvents(state.eventBus);
        break;

      case 'quit':
      case 'exit':
      case 'q':
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);

      default:
        if (command !== '') {
          console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
}

// Main execution
if (require.main === module) {
  runCLI().catch(error => {
    console.error('❌ CLI Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}