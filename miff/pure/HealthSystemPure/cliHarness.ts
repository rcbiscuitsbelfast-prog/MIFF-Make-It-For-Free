/**
 * CLI Harness for HealthSystemPure
 * 
 * Provides comprehensive CLI interface for health management including
 * entity creation, damage/healing, shields, regeneration, and multi-format export.
 * 
 * @module HealthSystemPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { HealthSystemManager, Shield, RegenerationEffect } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process?.argv);
const manager = new HealthSystemManager();

// Parse additional arguments
const entityId = args?.find(arg => arg?.startsWith('--entity-id='))?.split('=')[1!] || 'entity_001';
const maxHp = parseInt(args?.find(arg => arg?.startsWith('--max-hp='))?.split('=')[1!] || '100');
const currentHp = parseInt(args?.find(arg => arg?.startsWith('--current-hp='))?.split('=')[1!] || '100');
const amount = parseInt(args?.find(arg => arg?.startsWith('--amount='))?.split('=')[1!] || '10');
const damageType = args?.find(arg => arg?.startsWith('--damage-type='))?.split('=')[1!] as 'physical' | 'magical' | 'elemental' | 'pure' || 'physical';
const element = args?.find(arg => arg?.startsWith('--element='))?.split('=')[1!] as 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark' || 'fire';
const source = args?.find(arg => arg?.startsWith('--source='))?.split('=')[1!] || 'system';
const shieldType = args?.find(arg => arg?.startsWith('--shield-type='))?.split('=')[1!] as 'physical' | 'magical' | 'elemental' | 'all' || 'all';
const shieldAmount = parseInt(args?.find(arg => arg?.startsWith('--shield-amount='))?.split('=')[1!] || '50');
const regenType = args?.find(arg => arg?.startsWith('--regen-type='))?.split('=')[1!] as 'hp' | 'shield' | 'both' || 'hp';
const regenAmount = parseInt(args?.find(arg => arg?.startsWith('--regen-amount='))?.split('=')[1!] || '5');
const regenDuration = parseInt(args?.find(arg => arg?.startsWith('--regen-duration='))?.split('=')[1!] || '10');
const immunity = args?.find(arg => arg?.startsWith('--immunity='))?.split('=')[1!] || 'none';
const resistance = args?.find(arg => arg?.startsWith('--resistance='))?.split('=')[1!] || 'none';
const resistanceValue = parseInt(args?.find(arg => arg?.startsWith('--resistance-value='))?.split('=')[1!] || '25');
const format = args?.find(arg => arg?.startsWith('--format='))?.split('=')[1!] as 'json' | 'manifest' | 'summary' | 'events' || 'json';

let output: any;

try {
  switch (mode) {
    case 'create':
      const options: any = {};
      if (args?.includes('--current-hp')) options?.currentHp = currentHp;
      if (args?.includes('--immunity') && immunity !== 'none') options?.immunities = [immunity!];
      if (args?.includes('--resistance') && resistance !== 'none') options?.resistances = { [resistance!]: resistanceValue };
      
      output = manager?.createEntity(entityId, maxHp, options);
      break;

    case 'get':
      output = manager?.getEntity(entityId);
      break;

    case 'damage':
      const damageOptions: any = {};
      if (args?.includes('--damage-type')) damageOptions?.damageType = damageType;
      if (args?.includes('--element')) damageOptions?.element = element;
      if (args?.includes('--source')) damageOptions?.source = source;
      if (args?.includes('--bypass-shields')) damageOptions?.bypassShields = true;
      
      output = manager?.applyDamage(entityId, amount, damageOptions);
      break;

    case 'heal':
      const healOptions: any = {};
      if (args?.includes('--source')) healOptions?.source = source;
      if (args?.includes('--overheal')) healOptions?.overheal = true;
      
      output = manager?.applyHealing(entityId, amount, healOptions);
      break;

    case 'add-shield':
      const shield: Shield = {
        id: `shield_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: shieldType as any,
        amount: shieldAmount,
        maxAmount: shieldAmount,
        absorption: parseInt(args?.find(arg => arg?.startsWith('--absorption='))?.split('=')[1!] || '100'),
        duration: args?.includes('--duration') ? parseInt(args?.find(arg => arg?.startsWith('--duration='))!.split('=')[1!]) : -1,
        expiresAt: args.includes('--duration') ? Date.now() + parseInt(args.find(arg => arg.startsWith('--duration='))!.split('=')[1!]) * 1000 : undefined
      };
      output = manager?.addShield(entityId, shield);
      break;

    case 'add-regeneration':
      const regeneration: RegenerationEffect = {
        id: `regen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: regenType as any,
        amount: regenAmount,
        duration: regenDuration,
        interval: parseInt(args?.find(arg => arg?.startsWith('--interval='))?.split('=')[1!] || '1'),
        lastTick: new Date(),
        expiresAt: new Date() + regenDuration * 1000
      };
      output = manager?.addRegeneration(entityId, regeneration);
      break;

    case 'simulate':
      output = manager?.simulateTick();
      break;

    case 'list':
      const filter: any = {};
      if (args?.includes('--min-hp')) filter?.minHp = parseInt(args?.find(arg => arg?.startsWith('--min-hp='))!.split('=')[1!]);
      if (args?.includes('--max-hp')) filter?.maxHp = parseInt(args?.find(arg => arg?.startsWith('--max-hp='))!.split('=')[1!]);
      if (args?.includes('--has-shields')) filter?.hasShields = true;
      if (args?.includes('--has-regeneration')) filter?.hasRegeneration = true;
      if (args?.includes('--is-alive')) filter?.isAlive = true;
      if (args?.includes('--has-immunity')) filter?.hasImmunity = immunity;
      if (args?.includes('--has-resistance')) filter?.hasResistance = resistance;
      
      output = manager?.listEntities(filter);
      break;

    case 'stats':
      output = manager?.getHealthStats();
      break;

    case 'export':
      output = manager?.exportHealth(format);
      break;

    case 'reset':
      output = manager?.resetHealth();
      break;

    case 'demo':
      // Create demo entities with different health scenarios
      const demoEntities = [
        {
          id: 'warrior',
          maxHp: 150,
          currentHp: 120,
          immunities: ['physical'],
          resistances: { fire: 50 }
        },
        {
          id: 'mage',
          maxHp: 80,
          currentHp: 60,
          immunities: ['magical'],
          resistances: { ice: 75 }
        },
        {
          id: 'rogue',
          maxHp: 100,
          currentHp: 100,
          immunities: [],
          resistances: { poison: 90 }
        }
      ];

      const results = demoEntities?.map((entity: any) => 
        manager?.createEntity(entity?.id, entity?.maxHp, {
          currentHp: entity?.currentHp,
          immunities: entity?.immunities,
          resistances: entity?.resistances
        })
      );

      // Apply damage and healing
      manager?.applyDamage('warrior', 30, { damageType: 'magical', source: 'spell' });
      manager?.applyDamage('mage', 20, { damageType: 'physical', source: 'sword' });
      manager?.applyHealing('rogue', 15, { source: 'potion' });

      // Add shields and regeneration
      manager?.addShield('warrior', {
        id: 'warrior_shield',
        type: 'physical',
        amount: 25,
        maxAmount: 25,
        absorption: 100,
        duration: 30
      });

      manager?.addRegeneration('mage', {
        id: 'mage_regen',
        type: 'hp',
        amount: 2,
        duration: 10,
        interval: 1,
        lastTick: new Date(),
        expiresAt: new Date() + 10000
      });

      // Simulate a few ticks
      manager?.simulateTick();
      manager?.simulateTick();

      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo health scenarios completed',
          entities: results?.map((r: any) => ({ status: r?.status, entity: r?.result })),
          finalState: manager?.listEntities().result
        }
      };
      break;

    case 'sample':
      // Create sample health scenarios
      const sampleScenarios = [
        {
          id: 'battle_scenario',
          entities: [
            {
              id: 'hero',
              maxHp: 200,
              currentHp: 200,
              immunities: ['poison'],
              resistances: { fire: 30, ice: 30 }
            },
            {
              id: 'dragon',
              maxHp: 500,
              currentHp: 500,
              immunities: ['fire'],
              resistances: { physical: 50 }
            }
          ]
        },
        {
          id: 'healing_scenario',
          entities: [
            {
              id: 'healer',
              maxHp: 100,
              currentHp: 50,
              immunities: [],
              resistances: {}
            }
          ]
        }
      ];

      const scenarioResults = sampleScenarios?.map((scenario: any) => {
        const entityResults = scenario?.entities.map((entity: any) => 
          manager?.createEntity(entity?.id, entity?.maxHp, {
            currentHp: entity?.currentHp,
            immunities: entity?.immunities,
            resistances: entity?.resistances
          })
        );

        // Apply scenario-specific effects
        if (scenario?.id === 'battle_scenario') {
          manager?.applyDamage('hero', 50, { damageType: 'fire', source: 'dragon' });
          manager?.applyDamage('dragon', 75, { damageType: 'physical', source: 'hero' });
        } else if (scenario?.id === 'healing_scenario') {
          manager?.applyHealing('healer', 30, { source: 'healing_potion' });
          manager?.addRegeneration('healer', {
            id: 'healer_regen',
            type: 'hp',
            amount: 5,
            duration: 20,
            interval: 2,
            lastTick: new Date(),
            expiresAt: new Date() + 20000
          });
        }

        return {
          scenario: scenario?.id,
          results: entityResults?.map((r: any) => ({ status: r?.status, entity: r?.result }))
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample health scenarios created',
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
            'create --entity-id=<id> --max-hp=<hp> [--current-hp=<hp>] [--immunity=<type>] [--resistance=<type>] [--resistance-value=<value>]',
            'get --entity-id=<id>',
            'damage --entity-id=<id> --amount=<amount> [--damage-type=<type>] [--element=<elem>] [--source=<src>] [--bypass-shields]',
            'heal --entity-id=<id> --amount=<amount> [--source=<src>] [--overheal]',
            'add-shield --entity-id=<id> --shield-type=<type> --shield-amount=<amount> [--absorption=<pct>] [--duration=<sec>]',
            'add-regeneration --entity-id=<id> --regen-type=<type> --regen-amount=<amount> --regen-duration=<sec> [--interval=<sec>]',
            'simulate',
            'list [--min-hp=<min>] [--max-hp=<max>] [--has-shields] [--has-regeneration] [--is-alive] [--has-immunity=<type>] [--has-resistance=<type>]',
            'stats',
            'export --format=<json|manifest|summary|events>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness?.ts create --entity-id=warrior --max-hp=150 --immunity=physical --resistance=fire --resistance-value=50',
            'node cliHarness?.ts damage --entity-id=warrior --amount=30 --damage-type=magical --source=spell',
            'node cliHarness?.ts add-shield --entity-id=warrior --shield-type=physical --shield-amount=25 --absorption=100 --duration=30',
            'node cliHarness?.ts export --format=manifest'
          ]
        }
      };
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  output = {
    op: mode || 'unknown',
    status: 'error',
    issues: [error instanceof Error ? error?.message : 'Unknown error']
  };
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));