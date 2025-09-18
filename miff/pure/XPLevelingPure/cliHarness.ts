/**
 * CLI Harness for XPLevelingPure
 * 
 * Provides comprehensive CLI interface for XP and leveling management including
 * entity creation, XP management, skill progression, and multi-format export.
 * 
 * @module XPLevelingPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { XPLevelingManager, XPCurve } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new XPLevelingManager();

// Parse additional arguments
const entityId = args.find(arg => arg.startsWith('--entity-id='))?.split('=')[1] || 'entity_001';
const curveId = args.find(arg => arg.startsWith('--curve-id='))?.split('=')[1] || 'standard';
const initialLevel = parseInt(args.find(arg => arg.startsWith('--initial-level='))?.split('=')[1] || '1');
const xpAmount = parseInt(args.find(arg => arg.startsWith('--xp='))?.split('=')[1] || '100');
const skillId = args.find(arg => arg.startsWith('--skill-id='))?.split('=')[1] || 'combat';
const skillLevel = parseInt(args.find(arg => arg.startsWith('--skill-level='))?.split('=')[1] || '1');
const statId = args.find(arg => arg.startsWith('--stat-id='))?.split('=')[1] || 'strength';
const statValue = parseInt(args.find(arg => arg.startsWith('--stat-value='))?.split('=')[1] || '10');
const minLevel = parseInt(args.find(arg => arg.startsWith('--min-level='))?.split('=')[1] || '1');
const maxLevel = parseInt(args.find(arg => arg.startsWith('--max-level='))?.split('=')[1] || '100');
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'history' || 'json';

let output: any;

try {
  switch (mode) {
    case 'create':
      output = manager.createEntity(entityId, curveId, initialLevel);
      break;

    case 'get':
      output = manager.getLevel(entityId);
      break;

    case 'add-xp':
      output = manager.addXP(entityId, xpAmount);
      break;

    case 'check-level-up':
      output = manager.checkLevelUp(entityId);
      break;

    case 'force-level-up':
      output = manager.forceLevelUp(entityId);
      break;

    case 'set-skill':
      output = manager.setSkillLevel(entityId, skillId, skillLevel);
      break;

    case 'get-skill':
      output = manager.getSkillLevel(entityId, skillId);
      break;

    case 'set-stat':
      output = manager.setStat(entityId, statId, statValue);
      break;

    case 'get-stat':
      output = manager.getStat(entityId, statId);
      break;

    case 'list':
      const filter: any = {};
      if (args.includes('--min-level')) filter.minLevel = minLevel;
      if (args.includes('--max-level')) filter.maxLevel = maxLevel;
      if (args.includes('--has-skill')) filter.hasSkill = skillId;
      if (args.includes('--min-skill-level')) filter.minSkillLevel = parseInt(args.find(arg => arg.startsWith('--min-skill-level='))?.split('=')[1] || '1');
      if (args.includes('--max-skill-level')) filter.maxSkillLevel = parseInt(args.find(arg => arg.startsWith('--max-skill-level='))?.split('=')[1] || '10');
      if (args.includes('--min-xp')) filter.minXp = parseInt(args.find(arg => arg.startsWith('--min-xp='))?.split('=')[1] || '0');
      if (args.includes('--max-xp')) filter.maxXp = parseInt(args.find(arg => arg.startsWith('--max-xp='))?.split('=')[1] || '10000');
      
      output = manager.listEntities(filter);
      break;

    case 'stats':
      output = manager.getXPStats();
      break;

    case 'create-curve':
      const curve: XPCurve = {
        id: curveId,
        name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'Custom Curve',
        description: args.find(arg => arg.startsWith('--description='))?.split('=')[1] || 'A custom XP curve',
        maxLevel: parseInt(args.find(arg => arg.startsWith('--max-level='))?.split('=')[1] || '100'),
        baseXp: parseInt(args.find(arg => arg.startsWith('--base-xp='))?.split('=')[1] || '100'),
        growthRate: parseFloat(args.find(arg => arg.startsWith('--growth-rate='))?.split('=')[1] || '1.1'),
        levels: [], // Will be generated
        metadata: { type: 'custom' }
      };
      output = manager.createCurve(curve);
      break;

    case 'get-curve':
      output = manager.getCurve(curveId);
      break;

    case 'export':
      output = manager.exportXP(format);
      break;

    case 'reset':
      output = manager.resetXP();
      break;

    case 'demo':
      // Create demo entities with different XP curves
      const demoEntities = [
        {
          id: 'warrior',
          curveId: 'standard',
          initialLevel: 1
        },
        {
          id: 'mage',
          curveId: 'fast',
          initialLevel: 5
        },
        {
          id: 'rogue',
          curveId: 'slow',
          initialLevel: 1
        }
      ];

      const results = demoEntities.map(entity => manager.createEntity(entity.id, entity.curveId, entity.initialLevel));
      
      // Add XP to some entities
      manager.addXP('warrior', 500);
      manager.addXP('mage', 200);
      
      // Set some skills
      manager.setSkillLevel('warrior', 'sword_fighting', 3);
      manager.setSkillLevel('mage', 'spellcasting', 5);
      manager.setSkillLevel('rogue', 'stealth', 2);
      
      // Set some stats
      manager.setStat('warrior', 'strength', 15);
      manager.setStat('mage', 'intelligence', 20);
      manager.setStat('rogue', 'dexterity', 18);
      
      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo entities created with XP, skills, and stats',
          entities: results.map(r => ({ status: r.status, entity: r.result }))
        }
      };
      break;

    case 'sample':
      // Create sample XP scenarios
      const sampleScenarios = [
        {
          id: 'hero_progression',
          entities: [
            {
              id: 'hero',
              curveId: 'standard',
              initialLevel: 1
            }
          ]
        },
        {
          id: 'elite_training',
          entities: [
            {
              id: 'elite_warrior',
              curveId: 'slow',
              initialLevel: 10
            },
            {
              id: 'elite_mage',
              curveId: 'slow',
              initialLevel: 10
            }
          ]
        }
      ];

      const scenarioResults = sampleScenarios.map(scenario => {
        const entityResults = scenario.entities.map(entity => 
          manager.createEntity(entity.id, entity.curveId, entity.initialLevel)
        );
        
        // Add XP and skills to entities
        entityResults.forEach((result, index) => {
          if (result.status === 'ok') {
            const entity = scenario.entities[index];
            manager.addXP(entity.id, 1000);
            manager.setSkillLevel(entity.id, 'combat', 5);
            manager.setStat(entity.id, 'strength', 25);
          }
        });
        
        return {
          scenario: scenario.id,
          results: entityResults.map(r => ({ status: r.status, entity: r.result }))
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample XP scenarios created',
          scenarios: scenarioResults
        }
      };
      break;

    default:
      output = {
        op: 'help',
        status: 'ok',
        result: {
          availableCommands: [
            'create --entity-id=<id> --curve-id=<curve> --initial-level=<level>',
            'get --entity-id=<id>',
            'add-xp --entity-id=<id> --xp=<amount>',
            'check-level-up --entity-id=<id>',
            'force-level-up --entity-id=<id>',
            'set-skill --entity-id=<id> --skill-id=<skill> --skill-level=<level>',
            'get-skill --entity-id=<id> --skill-id=<skill>',
            'set-stat --entity-id=<id> --stat-id=<stat> --stat-value=<value>',
            'get-stat --entity-id=<id> --stat-id=<stat>',
            'list [--min-level=<min>] [--max-level=<max>] [--has-skill=<skill>] [--min-skill-level=<min>] [--max-skill-level=<max>]',
            'stats',
            'create-curve --curve-id=<id> --name=<name> --max-level=<max> --base-xp=<base> --growth-rate=<rate>',
            'get-curve --curve-id=<id>',
            'export --format=<json|manifest|summary|history>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts create --entity-id=warrior --curve-id=standard --initial-level=1',
            'node cliHarness.ts add-xp --entity-id=warrior --xp=500',
            'node cliHarness.ts set-skill --entity-id=warrior --skill-id=combat --skill-level=5',
            'node cliHarness.ts export --format=manifest'
          ]
        }
      };
  }
} catch (error) {
  output = {
    op: mode || 'unknown',
    status: 'error',
    issues: [error instanceof Error ? error.message : 'Unknown error']
  };
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));