#!/usr/bin/env node

/**
 * event-bus.ts - CLI commands for EventBusPure module
 * 
 * Provides commands for event publishing, subscription, routing, and scheduling.
 */

import { Command } from 'commander';
import { 
  createEventBus, 
  createEventRouter, 
  createEventFilter, 
  createEventReplicator, 
  createEventScheduler,
  EventPriority,
  EventBusConfig
} from '../../src/modules/EventBusPure/EventBusPure';

const program = new Command();

program
  .name('event-bus')
  .description('Event and messaging system commands for MIFF games')
  .version('1.0.0');

program
  .command('publish')
  .description('Publish an event')
  .argument('<type>', 'Event type')
  .argument('<data>', 'Event data (JSON string)')
  .option('-s, --source <source>', 'Event source', 'cli')
  .option('-p, --priority <priority>', 'Event priority (low, normal, high, critical)', 'normal')
  .option('-r, --replicate', 'Replicate to network')
  .option('-m, --metadata <json>', 'Event metadata (JSON string)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (type, data, options) => {
    console.log(`📢 Publishing event: ${type}`);

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: options.replicate || false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: options.verbose || false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);

    try {
      const eventData = JSON.parse(data);
      const priority = EventPriority[options.priority.toUpperCase() as keyof typeof EventPriority];
      const metadata = options.metadata ? JSON.parse(options.metadata) : {};

      const eventId = await eventBus.publish(type, eventData, {
        source: options.source,
        priority,
        metadata,
        replicate: options.replicate
      });

      console.log(`✅ Event published: ${eventId}`);
      
      if (options.verbose) {
        console.log(`  Type: ${type}`);
        console.log(`  Data: ${JSON.stringify(eventData, null, 2)}`);
        console.log(`  Source: ${options.source}`);
        console.log(`  Priority: ${options.priority}`);
        console.log(`  Replicate: ${options.replicate || false}`);
      }
    } catch (error) {
      console.error(`❌ Failed to publish event: ${error.message}`);
    }
  });

program
  .command('subscribe')
  .description('Subscribe to events')
  .argument('<type>', 'Event type to subscribe to')
  .option('-p, --priority <priority>', 'Handler priority (low, normal, high, critical)', 'normal')
  .option('-o, --once', 'Handle event only once')
  .option('-f, --filter <expression>', 'Filter expression (e.g., "data.value > 5")')
  .option('-v, --verbose', 'Verbose output')
  .action(async (type, options) => {
    console.log(`📡 Subscribing to events: ${type}`);

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: options.verbose || false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);

    // Create a simple handler that logs events
    const handler = (event: any) => {
      console.log(`📨 Event received: ${event.type}`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Data: ${JSON.stringify(event.data, null, 2)}`);
      console.log(`  Source: ${event.source}`);
      console.log(`  Priority: ${EventPriority[event.priority]}`);
      console.log(`  Timestamp: ${new Date(event.timestamp).toISOString()}`);
      console.log('');
    };

    const priority = EventPriority[options.priority.toUpperCase() as keyof typeof EventPriority];
    
    let filter: ((event: any) => boolean) | undefined;
    if (options.filter) {
      filter = (event: any) => {
        try {
          // Simple filter evaluation (in production, use a proper expression parser)
          return eval(`event.${options.filter}`);
        } catch (error) {
          console.error(`❌ Filter evaluation error: ${error.message}`);
          return false;
        }
      };
    }

    const subscriptionId = eventBus.subscribe(type, handler, {
      priority,
      once: options.once || false,
      filter
    });

    console.log(`✅ Subscription created: ${subscriptionId}`);
    console.log(`  Type: ${type}`);
    console.log(`  Priority: ${options.priority}`);
    console.log(`  Once: ${options.once || false}`);
    if (options.filter) {
      console.log(`  Filter: ${options.filter}`);
    }

    // Keep the process running to receive events
    console.log('\n⏸️  Waiting for events... (Press Ctrl+C to stop)');
    process.on('SIGINT', () => {
      console.log('\n👋 Unsubscribing...');
      eventBus.unsubscribe(subscriptionId);
      process.exit(0);
    });

    // Keep alive
    await new Promise(() => {});
  });

program
  .command('route')
  .description('Setup event routing')
  .argument('<source>', 'Source event type')
  .argument('<targets>', 'Target event types (comma-separated)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (source, targets, options) => {
    console.log(`🛣️  Setting up event routing: ${source} -> ${targets}`);

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: options.verbose || false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);
    const router = createEventRouter(eventBus);

    const targetTypes = targets.split(',').map(t => t.trim());
    router.addRoute(source, targetTypes);

    console.log(`✅ Route created: ${source} -> [${targetTypes.join(', ')}]`);

    // Add handlers for target events to demonstrate routing
    for (const targetType of targetTypes) {
      eventBus.subscribe(targetType, (event: any) => {
        console.log(`🔄 Routed event: ${source} -> ${targetType}`);
        console.log(`  Data: ${JSON.stringify(event.data, null, 2)}`);
        console.log(`  Metadata: ${JSON.stringify(event.metadata, null, 2)}`);
        console.log('');
      });
    }

    // Add handler for source event to trigger routing
    eventBus.subscribe(source, async (event: any) => {
      console.log(`📢 Source event received: ${source}`);
      console.log(`  Data: ${JSON.stringify(event.data, null, 2)}`);
      console.log(`  Routing to: [${targetTypes.join(', ')}]`);
      console.log('');
      
      await router.routeEvent(event);
    });

    console.log('\n⏸️  Routing active... (Press Ctrl+C to stop)');
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping router...');
      process.exit(0);
    });

    // Keep alive
    await new Promise(() => {});
  });

program
  .command('schedule')
  .description('Schedule delayed or recurring events')
  .argument('<type>', 'Event type')
  .argument('<data>', 'Event data (JSON string)')
  .argument('<delay>', 'Delay in milliseconds')
  .option('-r, --recurring', 'Make event recurring')
  .option('-i, --interval <ms>', 'Interval for recurring events (ms)')
  .option('-m, --max-executions <count>', 'Maximum executions for recurring events')
  .option('-s, --source <source>', 'Event source', 'cli')
  .option('-p, --priority <priority>', 'Event priority (low, normal, high, critical)', 'normal')
  .option('-v, --verbose', 'Verbose output')
  .action(async (type, data, delay, options) => {
    console.log(`⏰ Scheduling event: ${type}`);

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: options.verbose || false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);
    const scheduler = createEventScheduler(eventBus);

    try {
      const eventData = JSON.parse(data);
      const delayMs = parseInt(delay);
      const priority = EventPriority[options.priority.toUpperCase() as keyof typeof EventPriority];

      let eventId: string;

      if (options.recurring) {
        const interval = options.interval ? parseInt(options.interval) : delayMs;
        const maxExecutions = options.maxExecutions ? parseInt(options.maxExecutions) : undefined;

        eventId = scheduler.scheduleRecurring(type, eventData, interval, {
          source: options.source,
          priority,
          maxExecutions
        });

        console.log(`✅ Recurring event scheduled: ${eventId}`);
        console.log(`  Type: ${type}`);
        console.log(`  Interval: ${interval}ms`);
        if (maxExecutions) {
          console.log(`  Max executions: ${maxExecutions}`);
        }
      } else {
        eventId = scheduler.scheduleDelayed(type, eventData, delayMs, {
          source: options.source,
          priority
        });

        console.log(`✅ Delayed event scheduled: ${eventId}`);
        console.log(`  Type: ${type}`);
        console.log(`  Delay: ${delayMs}ms`);
      }

      // Add handler to see when events are published
      eventBus.subscribe(type, (event: any) => {
        console.log(`⏰ Scheduled event executed: ${event.type}`);
        console.log(`  Data: ${JSON.stringify(event.data, null, 2)}`);
        console.log(`  Timestamp: ${new Date(event.timestamp).toISOString()}`);
        console.log('');
      });

      if (options.verbose) {
        console.log(`  Data: ${JSON.stringify(eventData, null, 2)}`);
        console.log(`  Source: ${options.source}`);
        console.log(`  Priority: ${options.priority}`);
      }

      // Keep the process running to see scheduled events
      console.log('\n⏸️  Scheduler active... (Press Ctrl+C to stop)');
      process.on('SIGINT', () => {
        console.log('\n👋 Stopping scheduler...');
        scheduler.stopScheduler();
        process.exit(0);
      });

      // Keep alive
      await new Promise(() => {});

    } catch (error) {
      console.error(`❌ Failed to schedule event: ${error.message}`);
    }
  });

program
  .command('list')
  .description('List recent events and subscriptions')
  .option('-t, --type <type>', 'Filter by event type')
  .option('-l, --limit <number>', 'Number of events to show', '10')
  .option('-s, --subscriptions', 'Show subscriptions instead of events')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log('📋 Listing events and subscriptions...');

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);

    if (options.subscriptions) {
      const subscriptions = eventBus.getSubscriptions();
      console.log(`📡 Active subscriptions: ${subscriptions.length}`);
      
      for (const sub of subscriptions) {
        console.log(`  📡 ${sub.eventType} (${sub.id})`);
        if (options.verbose) {
          console.log(`    Active: ${sub.active}`);
          console.log(`    Priority: ${EventPriority[sub.handler.priority]}`);
          console.log(`    Once: ${sub.handler.once}`);
        }
      }
    } else {
      const limit = parseInt(options.limit);
      const events = options.type 
        ? eventBus.getEventsByType(options.type, limit)
        : eventBus.getRecentEvents(limit);

      console.log(`📨 Recent events: ${events.length}`);
      
      for (const event of events) {
        console.log(`  📨 ${event.type} (${event.id})`);
        console.log(`    Data: ${JSON.stringify(event.data)}`);
        console.log(`    Source: ${event.source}`);
        console.log(`    Priority: ${EventPriority[event.priority]}`);
        console.log(`    Timestamp: ${new Date(event.timestamp).toISOString()}`);
        
        if (options.verbose && Object.keys(event.metadata).length > 0) {
          console.log(`    Metadata: ${JSON.stringify(event.metadata)}`);
        }
        console.log('');
      }
    }
  });

program
  .command('stats')
  .description('Show event bus statistics')
  .option('-r, --reset', 'Reset statistics')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log('📊 Event bus statistics...');

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);

    if (options.reset) {
      eventBus.resetStats();
      console.log('✅ Statistics reset');
      return;
    }

    const stats = eventBus.getStats();
    const subscriptions = eventBus.getSubscriptions();

    console.log('\n📊 Event Statistics:');
    console.log(`  Total Events: ${stats.totalEvents}`);
    console.log(`  Dropped Events: ${stats.droppedEvents}`);
    console.log(`  Network Messages: ${stats.networkMessages}`);
    console.log(`  Average Latency: ${stats.averageLatency.toFixed(2)}ms`);

    if (Object.keys(stats.eventsByType).length > 0) {
      console.log('\n📨 Events by Type:');
      for (const [type, count] of Object.entries(stats.eventsByType)) {
        console.log(`  ${type}: ${count}`);
      }
    }

    console.log('\n📡 Subscription Statistics:');
    console.log(`  Total Subscriptions: ${subscriptions.length}`);
    
    const typeCounts = new Map<string, number>();
    for (const sub of subscriptions) {
      typeCounts.set(sub.eventType, (typeCounts.get(sub.eventType) || 0) + 1);
    }

    if (typeCounts.size > 0) {
      console.log('\n📡 Subscriptions by Type:');
      for (const [type, count] of typeCounts) {
        console.log(`  ${type}: ${count}`);
      }
    }

    if (options.verbose) {
      console.log('\n📋 Configuration:');
      console.log(`  Max Events: ${config.maxEvents}`);
      console.log(`  Enable Replication: ${config.enableReplication}`);
      console.log(`  Network Latency: ${config.networkLatency}ms`);
      console.log(`  Event Timeout: ${config.eventTimeout}ms`);
    }
  });

program
  .command('simulate')
  .description('Simulate event bus activity')
  .option('-e, --events <number>', 'Number of events to simulate', '10')
  .option('-t, --types <types>', 'Event types to simulate (comma-separated)', 'game.update,player.move,ui.click')
  .option('-i, --interval <ms>', 'Interval between events (ms)', '100')
  .option('-r, --replicate', 'Enable network replication')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log('🎮 Simulating event bus activity...');

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: options.replicate || false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: options.verbose || false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);
    const eventTypes = options.types.split(',').map(t => t.trim());
    const numEvents = parseInt(options.events);
    const interval = parseInt(options.interval);

    // Add handlers for all event types
    for (const eventType of eventTypes) {
      eventBus.subscribe(eventType, (event: any) => {
        console.log(`📨 ${event.type}: ${JSON.stringify(event.data)}`);
      });
    }

    // Simulate events
    for (let i = 0; i < numEvents; i++) {
      const eventType = eventTypes[i % eventTypes.length];
      const eventData = {
        id: i,
        value: Math.random() * 100,
        timestamp: Date.now()
      };

      await eventBus.publish(eventType, eventData, {
        source: 'simulation',
        priority: EventPriority.NORMAL,
        replicate: options.replicate
      });

      if (i < numEvents - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    console.log(`✅ Simulation completed: ${numEvents} events published`);
    
    const stats = eventBus.getStats();
    console.log(`📊 Final stats: ${stats.totalEvents} total events`);
  });

program
  .command('filter')
  .description('Test event filtering')
  .argument('<type>', 'Event type to filter')
  .argument('<expression>', 'Filter expression (e.g., "data.value > 5")')
  .option('-v, --verbose', 'Verbose output')
  .action(async (type, expression, options) => {
    console.log(`🔍 Testing event filter: ${expression}`);

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: options.verbose || false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);
    const filter = createEventFilter();

    // Add filter
    filter.addFilter('test-filter', (event: any) => {
      try {
        return eval(`event.${expression}`);
      } catch (error) {
        console.error(`❌ Filter evaluation error: ${error.message}`);
        return false;
      }
    });

    // Subscribe with filter
    const handler = (event: any) => {
      console.log(`✅ Event passed filter: ${event.type}`);
      console.log(`  Data: ${JSON.stringify(event.data, null, 2)}`);
      console.log(`  Filter: ${expression}`);
      console.log('');
    };

    eventBus.subscribe(type, handler, {
      filter: (event: any) => filter.passesFilters(event)
    });

    // Test with various events
    const testEvents = [
      { value: 3, message: 'low value' },
      { value: 7, message: 'high value' },
      { value: 10, message: 'very high value' },
      { value: 1, message: 'very low value' }
    ];

    console.log(`🧪 Testing filter with ${testEvents.length} events...`);
    
    for (const testData of testEvents) {
      console.log(`📢 Publishing: ${JSON.stringify(testData)}`);
      await eventBus.publish(type, testData);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Filter test completed');
  });

program
  .command('cleanup')
  .description('Clean up old events')
  .option('-a, --age <ms>', 'Maximum age of events to keep (ms)', '60000')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log('🧹 Cleaning up old events...');

    const config: EventBusConfig = {
      maxEvents: 1000,
      enableReplication: false,
      networkLatency: 50,
      eventTimeout: 5000,
      enableLogging: options.verbose || false,
      replicationFilter: () => true
    };

    const eventBus = createEventBus(config);

    // Add some old events
    for (let i = 0; i < 5; i++) {
      await eventBus.publish('old-event', { index: i, timestamp: Date.now() - 100000 });
    }

    // Add some recent events
    for (let i = 0; i < 3; i++) {
      await eventBus.publish('recent-event', { index: i, timestamp: Date.now() });
    }

    const beforeCount = eventBus.getRecentEvents().length;
    const maxAge = parseInt(options.age);
    
    const cleared = eventBus.clearOldEvents(maxAge);
    
    const afterCount = eventBus.getRecentEvents().length;

    console.log(`✅ Cleanup completed:`);
    console.log(`  Events before: ${beforeCount}`);
    console.log(`  Events cleared: ${cleared}`);
    console.log(`  Events after: ${afterCount}`);
    console.log(`  Max age: ${maxAge}ms`);
  });

export default program;