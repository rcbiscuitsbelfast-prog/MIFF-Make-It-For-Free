/**
 * CLI Harness for StatusEffectsPure
 * 
 * Provides comprehensive CLI interface for status effect management including
 * effect application, simulation, immunity/resistance management, and multi-format export.
 * 
 * @module StatusEffectsPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { StatusEffectsManager, StatusEffect } from './StatusEffectsManager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new StatusEffectsManager();

// Parse additional arguments
const entityId = args.find(arg => arg.startsWith('--entity-id='))?.split('=')[1] || 'entity_001';
const effectId = args.find(arg => arg.startsWith('--effect-id='))?.split('=')[1] || 'effect_001';
const maxHp = parseInt(args.find(arg => arg.startsWith('--max-hp='))?.split('=')[1] || '100');
const magnitude = parseFloat(args.find(arg => arg.startsWith('--magnitude='))?.split('=')[1] || '5');
const duration = parseInt(args.find(arg => arg.startsWith('--duration='))?.split('=')[1] || '10');
const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1] || 'poison';
const effectType = args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'debuff';
const source = args.find(arg => arg.startsWith('--source='))?.split('=')[1] || 'system';
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'events' || 'json';

let output: any;

try {
  switch (mode) {
    case 'create':
      const effects: StatusEffect[] = [];
      if (args.includes('--with-effects')) {
        effects.push({
          id: effectId,
          name: `${category} effect`,
          type: effectType as any,
          category: category as any,
          magnitude,
          duration,
          stackable: true,
          maxStacks: 5,
          currentStacks: 1,
          source,
          appliedAt: Date.now(),
          expiresAt: Date.now() + (duration * 1000)
        });
      }
      output = manager.createEntity(entityId, maxHp, effects);
      break;

    case 'get':
      output = manager.getEntity(entityId);
      break;

    case 'apply-effect':
      const effect: Omit<StatusEffect, 'appliedAt' | 'expiresAt' | 'currentStacks'> = {
        id: effectId,
        name: `${category} effect`,
        type: effectType as any,
        category: category as any,
        magnitude,
        duration,
        stackable: true,
        maxStacks: 5,
        source
      };
      output = manager.applyEffect(entityId, effect);
      break;

    case 'remove-effect':
      output = manager.removeEffect(entityId, effectId);
      break;

    case 'simulate':
      if (args.includes('--all')) {
        output = manager.simulateAll();
      } else {
        output = manager.simulateEntity(entityId);
      }
      break;

    case 'list':
      const filter: any = {};
      if (args.includes('--category')) filter.category = category;
      if (args.includes('--type')) filter.type = effectType;
      if (args.includes('--min-hp')) filter.minHp = parseInt(args.find(arg => arg.startsWith('--min-hp='))?.split('=')[1] || '0');
      if (args.includes('--max-hp')) filter.maxHp = parseInt(args.find(arg => arg.startsWith('--max-hp='))?.split('=')[1] || '100');
      if (args.includes('--has-effects')) filter.hasEffects = true;
      if (args.includes('--is-dead')) filter.isDead = true;
      
      output = manager.listEntities(filter);
      break;

    case 'stats':
      output = manager.getStatusStats();
      break;

    case 'add-immunity':
      output = manager.addImmunity(entityId, category);
      break;

    case 'add-resistance':
      const percentage = parseInt(args.find(arg => arg.startsWith('--percentage='))?.split('=')[1] || '25');
      output = manager.addResistance(entityId, category, percentage);
      break;

    case 'export':
      output = manager.exportStatus(format);
      break;

    case 'reset':
      output = manager.resetStatus();
      break;

    case 'demo':
      // Create demo entities with various status effects
      const demoEntities = [
        {
          id: 'poisoned_warrior',
          maxHp: 100,
          effects: [
            {
              id: 'poison_1',
              name: 'Poison',
              type: 'debuff' as any,
              category: 'poison' as any,
              magnitude: 2,
              duration: 15,
              stackable: true,
              maxStacks: 5,
              currentStacks: 1,
              source: 'spider_bite',
              appliedAt: Date.now(),
              expiresAt: Date.now() + (15 * 1000)
            }
          ]
        },
        {
          id: 'blessed_priest',
          maxHp: 80,
          effects: [
            {
              id: 'regen_1',
              name: 'Regeneration',
              type: 'buff' as any,
              category: 'regen' as any,
              magnitude: 3,
              duration: 20,
              stackable: true,
              maxStacks: 3,
              currentStacks: 1,
              source: 'divine_blessing',
              appliedAt: Date.now(),
              expiresAt: Date.now() + (20 * 1000)
            }
          ]
        },
        {
          id: 'stunned_mage',
          maxHp: 60,
          effects: [
            {
              id: 'stun_1',
              name: 'Stun',
              type: 'debuff' as any,
              category: 'stun' as any,
              magnitude: 1,
              duration: 5,
              stackable: false,
              maxStacks: 1,
              currentStacks: 1,
              source: 'lightning_bolt',
              appliedAt: Date.now(),
              expiresAt: Date.now() + (5 * 1000)
            }
          ]
        }
      ];

      const results = demoEntities.map(entity => manager.createEntity(entity.id, entity.maxHp, entity.effects));
      const simulationResult = manager.simulateAll();
      
      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo entities created and simulated',
          entities: results.map(r => ({ status: r.status, entity: r.result })),
          simulation: simulationResult.result
        }
      };
      break;

    case 'sample':
      // Create sample status effect scenarios
      const sampleScenarios = [
        {
          id: 'combat_scenario',
          entities: [
            {
              id: 'warrior',
              maxHp: 120,
              effects: [
                {
                  id: 'haste_1',
                  name: 'Haste',
                  type: 'buff' as any,
                  category: 'haste' as any,
                  magnitude: 2,
                  duration: 30,
                  stackable: true,
                  maxStacks: 3,
                  currentStacks: 1,
                  source: 'speed_potion',
                  appliedAt: Date.now(),
                  expiresAt: Date.now() + (30 * 1000)
                }
              ]
            },
            {
              id: 'enemy',
              maxHp: 80,
              effects: [
                {
                  id: 'burn_1',
                  name: 'Burn',
                  type: 'debuff' as any,
                  category: 'burn' as any,
                  magnitude: 3,
                  duration: 10,
                  stackable: true,
                  maxStacks: 10,
                  currentStacks: 1,
                  source: 'fire_attack',
                  appliedAt: Date.now(),
                  expiresAt: Date.now() + (10 * 1000)
                }
              ]
            }
          ]
        },
        {
          id: 'magic_scenario',
          entities: [
            {
              id: 'mage',
              maxHp: 60,
              effects: [
                {
                  id: 'shield_1',
                  name: 'Magic Shield',
                  type: 'buff' as any,
                  category: 'shield' as any,
                  magnitude: 50,
                  duration: 60,
                  stackable: false,
                  maxStacks: 1,
                  currentStacks: 1,
                  source: 'magic_armor',
                  appliedAt: Date.now(),
                  expiresAt: Date.now() + (60 * 1000)
                }
              ]
            }
          ]
        }
      ];

      const scenarioResults = sampleScenarios.map(scenario => {
        const entityResults = scenario.entities.map(entity => 
          manager.createEntity(entity.id, entity.maxHp, entity.effects)
        );
        return {
          scenario: scenario.id,
          results: entityResults.map(r => ({ status: r.status, entity: r.result }))
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample status effect scenarios created',
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
            'create --entity-id=<id> --max-hp=<hp> [--with-effects]',
            'get --entity-id=<id>',
            'apply-effect --entity-id=<id> --effect-id=<id> --category=<cat> --magnitude=<mag> --duration=<dur> --type=<type> --source=<src>',
            'remove-effect --entity-id=<id> --effect-id=<id>',
            'simulate [--all] [--entity-id=<id>]',
            'list [--category=<cat>] [--type=<type>] [--min-hp=<min>] [--max-hp=<max>] [--has-effects] [--is-dead]',
            'stats',
            'add-immunity --entity-id=<id> --category=<cat>',
            'add-resistance --entity-id=<id> --category=<cat> --percentage=<pct>',
            'export --format=<json|manifest|summary|events>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts create --entity-id=warrior --max-hp=100 --with-effects',
            'node cliHarness.ts apply-effect --entity-id=warrior --effect-id=poison --category=poison --magnitude=2 --duration=10',
            'node cliHarness.ts simulate --all',
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