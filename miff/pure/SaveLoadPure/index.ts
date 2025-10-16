/**
 * SaveLoadPure - Save and Load System
 * 
 * Comprehensive save and load system for game state persistence.
 * Provides serialization, compression, and version management.
 */

export * from './SaveLoadManager';
export { SaveLoadManager as default } from './SaveLoadManager';

// Module metadata
export const MODULE_INFO = {
  name: 'SaveLoadPure',
  version: '1.0.0',
  description: 'Save and load system for game state persistence',
  features: [
    'Game state serialization',
    'Compression and optimization',
    'Version management',
    'Multiple save slots',
    'Auto-save functionality',
    'Cross-platform compatibility'
  ],
  exports: ['json', 'save'],
  cliCommands: [
    'save', 'load', 'list', 'delete', 'export', 'import', 'help'
  ]
};