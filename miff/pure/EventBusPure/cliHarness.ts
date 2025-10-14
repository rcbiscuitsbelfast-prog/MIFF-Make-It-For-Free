#!/usr/bin/env tsx

import { 
  EventBus, 
  EventRouter, 
  EventFilter, 
  EventReplicator, 
  EventScheduler,
  EventPriority,
  createEventBus,
  createEventRouter,
  createEventFilter,
  createEventReplicator,
  createEventScheduler
} from './EventBusPure';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface EventBusOperation {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  op: 'create' | 'subscribe' | 'unsubscribe' | 'publish' | 'get-events' | 'get-stats' | 'clear-events' | 'demo' | 'dump';
  eventType?: string;
  handlerId?: string;
  data?: any;
  source?: string;
  priority?: EventPriority;
  limit?: number;
  maxAge?: number;
  config?: any;
  exportFormat?: string;
}

async function main(...args: any[]) {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: EventBusOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = SafeJSONParser.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as EventBusOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'create':
          const configFile = argv[1];
          const config = configFile && fs.existsSync(configFile) 
            ? SafeJSONParser.parse(fs.readFileSync(configFile, 'utf-8'))
            : { enableLogging: true, maxEvents: 1000 };
          operation = { op: 'create', config };
          break;
        case 'subscribe':
          if (!argv[1]) throw new Error('subscribe requires eventType');
          operation = { 
            op: 'subscribe', 
            eventType: argv[1],
            handlerId: argv[2] || `handler_${Date.now()}`
          };
          break;
        case 'unsubscribe':
          if (!argv[1]) throw new Error('unsubscribe requires handlerId');
          operation = { op: 'unsubscribe', handlerId: argv[1] };
          break;
        case 'publish':
          if (!argv[1] || !argv[2]) throw new Error('publish requires eventType and data');
          const data = SafeJSONParser.parse(argv[2]);
          operation = { 
            op: 'publish', 
            eventType: argv[1], 
            data,
            source: argv[3] || 'cli',
            priority: argv[4] as EventPriority || EventPriority.NORMAL
          };
          break;
        case 'get-events':
          operation = { 
            op: 'get-events', 
            eventType: argv[1],
            limit: parseInt(argv[2]) || 100
          };
          break;
        case 'get-stats':
          operation = { op: 'get-stats' };
          break;
        case 'clear-events':
          operation = { 
            op: 'clear-events', 
            maxAge: parseInt(argv[1]) || 60000
          };
          break;
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    // Create event bus instance
    const eventBus = createEventBus(operation.config || { enableLogging: true });
    const router = createEventRouter(eventBus);
    const filter = createEventFilter();
    const replicator = createEventReplicator(eventBus);
    const scheduler = createEventScheduler(eventBus);

    let result: any;

    switch (operation.op) {
      case 'create':
        result = {
          eventBus: {
            config: eventBus['config'],
            stats: eventBus.getStats(),
            subscriptionCount: eventBus.getSubscriptionCount()
          },
          components: {
            router: { routes: Array.from(router.getRoutes().entries()) },
            filter: { filters: Array.from(filter.getFilters().entries()) },
            replicator: { rules: Array.from(replicator['replicationRules'].entries()) },
            scheduler: { scheduledEvents: scheduler.getScheduledEvents().length }
          }
        };
        break;

      case 'subscribe':
        const handlerId = eventBus.subscribe(
          operation.eventType!,
          (event) => {
            console.info(`📡 Handler ${operation.handlerId} received event:`, event.type, event.data);
          },
          {
            id: operation.handlerId,
            priority: EventPriority.NORMAL
          }
        );
        result = {
          eventType: operation.eventType,
          handlerId,
          subscriptionCount: eventBus.getSubscriptionCount(operation.eventType),
          allSubscriptions: eventBus.getSubscriptions().length
        };
        break;

      case 'unsubscribe':
        const success = eventBus.unsubscribe(operation.handlerId!);
        result = {
          handlerId: operation.handlerId,
          success,
          remainingSubscriptions: eventBus.getSubscriptions().length
        };
        break;

      case 'publish':
        const eventId = await eventBus.publish(
          operation.eventType!,
          operation.data,
          {
            source: operation.source,
            priority: operation.priority
          }
        );
        result = {
          eventId,
          eventType: operation.eventType,
          data: operation.data,
          source: operation.source,
          priority: operation.priority,
          stats: eventBus.getStats()
        };
        break;

      case 'get-events':
        const events = operation.eventType 
          ? eventBus.getEventsByType(operation.eventType, operation.limit!)
          : eventBus.getRecentEvents(operation.limit!);
        result = {
          eventType: operation.eventType || 'all',
          limit: operation.limit,
          events,
          count: events.length,
          stats: eventBus.getStats()
        };
        break;

      case 'get-stats':
        result = {
          stats: eventBus.getStats(),
          subscriptions: eventBus.getSubscriptions(),
          subscriptionCount: eventBus.getSubscriptionCount(),
          recentEvents: eventBus.getRecentEvents(10)
        };
        break;

      case 'clear-events':
        const clearedCount = eventBus.clearOldEvents(operation.maxAge!);
        result = {
          maxAge: operation.maxAge,
          clearedCount,
          remainingEvents: eventBus.getRecentEvents().length,
          stats: eventBus.getStats()
        };
        break;

      case 'demo':
        // Create a comprehensive demo
        const demoBus = createEventBus({ enableLogging: true, maxEvents: 100 });
        const demoRouter = createEventRouter(demoBus);
        const demoFilter = createEventFilter();
        const demoScheduler = createEventScheduler(demoBus);

        // Add some subscriptions
        const sub1 = demoBus.subscribe('player.move', (event) => {
          console.info(`Player moved: ${event.data.x}, ${event.data.y}`);
        }, { id: 'player-move-handler' });

        const sub2 = demoBus.subscribe('player.action', (event) => {
          console.info(`Player action: ${event.data.action}`);
        }, { id: 'player-action-handler' });

        // Add a filter
        demoFilter.addFilter('high-priority-only', (event) => event.priority >= EventPriority.HIGH);

        // Add a route
        demoRouter.addRoute('player.move', ['world.update', 'camera.follow']);

        // Publish some events
        const publishedEvents = [];
        publishedEvents.push(await demoBus.publish('player.move', { x: 100, y: 200 }, { 
          source: 'player1', 
          priority: EventPriority.NORMAL 
        }));
        publishedEvents.push(await demoBus.publish('player.action', { action: 'jump' }, { 
          source: 'player1', 
          priority: EventPriority.HIGH 
        }));
        publishedEvents.push(await demoBus.publish('system.shutdown', { reason: 'demo' }, { 
          source: 'system', 
          priority: EventPriority.CRITICAL 
        }));

        // Schedule a delayed event
        const scheduledId = demoScheduler.scheduleDelayed('demo.delayed', { message: 'Hello from the future!' }, 1000);

        result = {
          subscriptions: [
            { id: sub1, eventType: 'player.move' },
            { id: sub2, eventType: 'player.action' }
          ],
          publishedEvents: publishedEvents,
          scheduledEvent: scheduledId,
          stats: demoBus.getStats(),
          recentEvents: demoBus.getRecentEvents(10),
          router: {
            routes: Array.from(demoRouter.getRoutes().entries())
          },
          filter: {
            filters: Array.from(demoFilter.getFilters().keys())
          },
          summary: {
            totalEvents: demoBus.getStats().totalEvents,
            eventTypes: Object.keys(demoBus.getStats().eventsByType),
            activeSubscriptions: demoBus.getSubscriptions().length,
            scheduledEvents: demoScheduler.getScheduledEvents().length
          }
        };

        // Clean up
        demoScheduler.stopScheduler();
        break;

      case 'dump':
        result = {
          operations: ['create', 'subscribe', 'unsubscribe', 'publish', 'get-events', 'get-stats', 'clear-events', 'demo', 'dump'],
          description: 'EventBusPure - Event and messaging system with pub/sub pattern',
          features: [
            'Event publishing and subscription',
            'Priority-based event handling',
            'Event routing and filtering',
            'Network replication support',
            'Event scheduling (delayed and recurring)',
            'Statistics and monitoring',
            'Event history and cleanup'
          ],
          components: [
            'EventBus - Core pub/sub messaging',
            'EventRouter - Event routing between types',
            'EventFilter - Event filtering system',
            'EventReplicator - Network replication',
            'EventScheduler - Delayed and recurring events'
          ],
          priorities: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'],
          defaultConfig: {
            maxEvents: 1000,
            enableReplication: false,
            networkLatency: 50,
            eventTimeout: 5000,
            enableLogging: false
          }
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'EventBusPure Export',
      'Event and messaging system data'
    );

    // Output in JSON envelope format
    console.info(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error) {
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}