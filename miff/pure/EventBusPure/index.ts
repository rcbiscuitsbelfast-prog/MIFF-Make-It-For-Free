/**
 * EventBusPure - Event and Messaging System
 * 
 * Centralized messaging system for decoupled communication between game systems.
 * Provides pub/sub messaging, event routing, and network replication capabilities.
 */

export * from './EventBusPure';
export { EventBus as default } from './EventBusPure';

// Module metadata
export const MODULE_INFO = {
  name: 'EventBusPure',
  version: '1.0.0',
  description: 'Event and messaging system with pub/sub capabilities',
  features: [
    'Pub/sub messaging',
    'Event routing and filtering',
    'Network replication',
    'Priority handling',
    'Event persistence',
    'Performance monitoring'
  ],
  exports: ['json', 'events'],
  cliCommands: [
    'publish', 'subscribe', 'unsubscribe', 'list', 'clear', 'stats', 'help'
  ]
};