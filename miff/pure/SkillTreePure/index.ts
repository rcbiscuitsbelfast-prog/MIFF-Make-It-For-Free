/**
 * SkillTreePure - Skill Tree and Progression System
 * 
 * Advanced skill tree system with branching paths, prerequisites,
 * and skill point management for character progression.
 */

export * from './SkillTreeManager';
export { SkillTreeManager as default } from './SkillTreeManager';

// Module metadata
export const MODULE_INFO = {
  name: 'SkillTreePure',
  version: '1.0.0',
  description: 'Skill tree and progression system',
  features: [
    'Branching skill trees',
    'Prerequisite management',
    'Skill point allocation',
    'Progression tracking',
    'Skill synergies',
    'Reset and respec functionality'
  ],
  exports: ['json', 'skilltree'],
  cliCommands: [
    'unlock', 'allocate', 'reset', 'list', 'analyze', 'export', 'help'
  ]
};