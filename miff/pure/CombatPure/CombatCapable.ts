/**
 * CombatPure Capability Implementation
 * 
 * Implements MIFFCapable interface for the CombatPure module.
 */

import { MIFFCapable, ModuleCapabilities } from '../shared/MIFFCapable.js';

export class CombatCapable implements MIFFCapable {
  get moduleId(): string {
    return 'CombatPure';
  }

  get moduleName(): string {
    return 'Combat System';
  }

  get version(): string {
    return '1.0.0';
  }

  get description(): string {
    return 'Comprehensive combat system with turn-based and real-time combat support';
  }

  get author(): string {
    return 'MIFF Team';
  }

  get lastUpdated(): Date {
    return new Date('2025-01-08');
  }

  get capabilities(): ModuleCapabilities {
    return {
      operations: [
        {
          name: 'startCombat',
          description: 'Start a new combat encounter',
          parameters: [
            { name: 'participants', type: 'Combatant[]', required: true, description: 'Combat participants' },
            { name: 'rules', type: 'CombatRules', required: false, description: 'Combat rules configuration' }
          ],
          returnType: 'Promise<CombatInstance>',
          async: true
        },
        {
          name: 'executeAction',
          description: 'Execute a combat action',
          parameters: [
            { name: 'action', type: 'CombatAction', required: true, description: 'Action to execute' },
            { name: 'context', type: 'CombatContext', required: true, description: 'Combat context' }
          ],
          returnType: 'Promise<ActionResult>',
          async: true
        },
        {
          name: 'endCombat',
          description: 'End the current combat encounter',
          parameters: [
            { name: 'reason', type: 'string', required: false, description: 'Reason for ending combat' }
          ],
          returnType: 'Promise<CombatResult>',
          async: true
        }
      ],
      dataProcessing: [
        {
          name: 'calculateDamage',
          description: 'Calculate damage for an attack',
          inputType: 'AttackData',
          outputType: 'DamageResult',
          async: false
        },
        {
          name: 'validateAction',
          description: 'Validate a combat action',
          inputType: 'CombatAction',
          outputType: 'ValidationResult',
          async: false
        }
      ],
      integrations: [
        {
          name: 'HealthSystem',
          description: 'Health system integration for damage application',
          type: 'health',
          status: 'active'
        },
        {
          name: 'StatsSystem',
          description: 'Stats system integration for combat calculations',
          type: 'stats',
          status: 'active'
        },
        {
          name: 'TeamsSystem',
          description: 'Teams system integration for team-based combat',
          type: 'teams',
          status: 'active'
        }
      ],
      formats: [
        {
          name: 'JSON',
          description: 'JSON format for combat data serialization',
          supported: true
        },
        {
          name: 'Binary',
          description: 'Binary format for performance-critical combat data',
          supported: true
        }
      ],
      realtime: {
        supported: true,
        websockets: true,
        polling: false
      },
      schemas: [
        {
          name: 'CombatAction',
          version: '1.0',
          description: 'Combat action schema definition'
        },
        {
          name: 'CombatResult',
          version: '1.0',
          description: 'Combat result schema definition'
        }
      ],
      cliInterface: {
        usage: 'combat [command] [options]',
        flags: [
          {
            name: 'mode',
            description: 'Combat mode (turn-based, real-time)',
            type: 'string',
            required: false,
            defaultValue: 'turn-based'
          },
          {
            name: 'participants',
            description: 'Number of participants',
            type: 'number',
            required: true,
            defaultValue: undefined
          }
        ]
      },
      lifecycleHooks: {
        onInit: true,
        onDestroy: true,
        onUpdate: true
      },
      dependencies: [
        {
          name: 'HealthSystemPure',
          version: '1.0.0',
          required: true
        },
        {
          name: 'StatsSystemPure',
          version: '1.0.0',
          required: true
        },
        {
          name: 'TeamsPure',
          version: '1.0.0',
          required: true
        }
      ],
      performanceProfile: {
        memoryUsage: 'medium',
        cpuUsage: 'high',
        networkUsage: 'low'
      },
      testingCapabilities: {
        unitTests: true,
        integrationTests: true,
        e2eTests: true,
        mockSupport: true
      }
    };
  }
}

export default CombatCapable;