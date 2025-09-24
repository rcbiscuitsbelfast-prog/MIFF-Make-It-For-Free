/**
 * StatsSystemPure - Statistics and Character Stats System
 * 
 * Comprehensive statistics management system for character stats,
 * modifiers, dependencies, and progression tracking.
 */

export * from './Manager';
export { StatsManager as default } from './Manager';

// Module metadata
export const MODULE_INFO = {
  name: 'StatsSystemPure',
  version: '1.0.0',
  description: 'Statistics and character stats management system',
  features: [
    'Character statistics',
    'Stat modifiers and dependencies',
    'Progression tracking',
    'Analytics and reporting',
    'Conditional modifiers',
    'Stat calculations'
  ],
  exports: ['json', 'stats'],
  cliCommands: [
    'get', 'set', 'modify', 'calculate', 'analyze', 'export', 'help'
  ]
};