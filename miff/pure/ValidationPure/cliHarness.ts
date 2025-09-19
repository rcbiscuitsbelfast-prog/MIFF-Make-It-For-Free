/**
 * CLI Harness for ValidationPure
 * 
 * Provides comprehensive CLI interface for validation including
 * rule-based validation, custom validators, and multi-format export.
 * 
 * @module ValidationPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { ValidationManager, ValidationConfig, ValidationInput } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);

// Legacy compatibility: allow positional [inputPath] ['' for config] [commandsPath]
let legacyInputPath: string | null = null;
let legacyCommandsPath: string | null = null;
try {
  const ar = process.argv.slice(2);
  if (ar.length >= 1 && ar[0] && !ar[0].startsWith('--')) legacyInputPath = ar[0];
  if (ar.length >= 3 && ar[2] && !ar[2].startsWith('--')) legacyCommandsPath = ar[2];
} catch {}
const manager = new ValidationManager();

// Parse additional arguments
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'report' || 'json';

let output: any;

try {
  switch (mode) {
    case 'configure':
      const config: ValidationConfig = args.includes('--config') ? JSON.parse(args.find(arg => arg.startsWith('--config='))!.split('=')[1]) : {
        rules: ['missing_refs', 'stat_bounds', 'zone_overlap'],
        combatExpectedStatKeys: ['hp', 'attack', 'defense']
      };
      output = manager.configure(config);
      break;

    case 'validate-all':
      const input: ValidationInput = args.includes('--input')
        ? JSON.parse(args.find(arg => arg.startsWith('--input='))!.split('=')[1])
        : (legacyInputPath && require('fs').existsSync(legacyInputPath)
            ? JSON.parse(require('fs').readFileSync(legacyInputPath, 'utf-8'))
            : ({
        refs: {
          'ref1': { ok: true },
          'ref2': { ok: false }
        },
        stats: [
          {
            id: 'entity1',
            stats: [
              { key: 'hp', base: 100 },
              { key: 'attack', base: 50 },
              { key: 'defense', base: 25 }
            ]
          },
          {
            id: 'entity2',
            stats: [
              { key: 'hp', base: 150 },
              { key: 'attack', base: 75 },
              { key: 'defense', base: 30 }
            ]
          }
        ],
        zones: [
          { id: 'zone1', x: 0, y: 0, w: 100, h: 100 },
          { id: 'zone2', x: 50, y: 50, w: 100, h: 100 }
        ],
        entities: [
          {
            id: 'entity1',
            name: 'Test Entity 1',
            type: 'character',
            position: { x: 10, y: 20 },
            properties: { health: 100, level: 1 }
          },
          {
            id: 'entity2',
            name: 'Test Entity 2',
            type: 'character',
            position: { x: 30, y: 40 },
            properties: { health: 150, level: 2 }
          }
        ],
        assets: [
          {
            id: 'asset1',
            name: 'Test Asset 1',
            type: 'texture',
            path: '/assets/texture1.png',
            size: 1024,
            checksum: 'abc123'
          },
          {
            id: 'asset2',
            name: 'Test Asset 2',
            type: 'model',
            path: '/assets/model1.obj',
            size: 2048,
            checksum: 'def456'
          }
        ],
        scripts: [
          {
            id: 'script1',
            name: 'Test Script 1',
            type: 'behavior',
            content: 'function update() { console.log("test"); }',
            language: 'javascript',
            dependencies: ['library1']
          }
        ]
          }
        }));
      output = manager.validateAll(input);
      break;

    case 'report-issues':
      output = manager.reportIssues();
      break;

    case 'stats':
      output = manager.getStats();
      break;

    case 'export':
      output = manager.exportValidation(format);
      break;

    case 'reset':
      output = manager.resetValidation();
      break;

    case 'demo':
      // Create demo validation scenarios
      const demoInput: ValidationInput = {
        refs: {
          'valid_ref': { ok: true },
          'missing_ref': { ok: false },
          'broken_ref': { ok: false }
        },
        stats: [
          {
            id: 'player',
            stats: [
              { key: 'hp', base: 100 },
              { key: 'attack', base: 50 },
              { key: 'defense', base: 25 },
              { key: 'speed', base: 10 }
            ]
          },
          {
            id: 'enemy',
            stats: [
              { key: 'hp', base: 200 },
              { key: 'attack', base: 75 },
              { key: 'defense', base: 40 }
            ]
          }
        ],
        zones: [
          { id: 'safe_zone', x: 0, y: 0, w: 200, h: 200 },
          { id: 'danger_zone', x: 150, y: 150, w: 200, h: 200 },
          { id: 'overlap_zone', x: 100, y: 100, w: 150, h: 150 }
        ],
        entities: [
          {
            id: 'player_entity',
            name: 'Player',
            type: 'character',
            position: { x: 50, y: 50 },
            properties: { health: 100, level: 1, class: 'warrior' }
          },
          {
            id: 'enemy_entity',
            name: 'Goblin',
            type: 'enemy',
            position: { x: 200, y: 200 },
            properties: { health: 50, level: 2, type: 'melee' }
          }
        ],
        assets: [
          {
            id: 'player_texture',
            name: 'Player Texture',
            type: 'texture',
            path: '/assets/player.png',
            size: 512,
            checksum: 'player123'
          },
          {
            id: 'large_model',
            name: 'Large Model',
            type: 'model',
            path: '/assets/large.obj',
            size: 10240,
            checksum: 'large456'
          }
        ],
        scripts: [
          {
            id: 'player_script',
            name: 'Player Controller',
            type: 'controller',
            content: 'function update() { movePlayer(); }',
            language: 'javascript',
            dependencies: ['input_lib']
          },
          {
            id: 'unsafe_script',
            name: 'Unsafe Script',
            type: 'utility',
            content: 'function dangerous() { eval(userInput); }',
            language: 'javascript',
            dependencies: []
          }
        ]
      };

      // Configure validation rules
      manager.configure({
        rules: ['missing_refs', 'stat_bounds', 'zone_overlap', 'combat_stat_keys', 'naming_convention', 'data_integrity', 'performance', 'security'],
        combatExpectedStatKeys: ['hp', 'attack', 'defense'],
        performanceThresholds: [
          { metric: 'asset_size', threshold: 5000, unit: 'bytes', severity: 'warning' }
        ]
      });

      // Run validation
      const validationResult = manager.validateAll(demoInput);
      const report = manager.reportIssues();
      const stats = manager.getStats();

      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo validation scenarios completed',
          validation: validationResult.result,
          report: report.result,
          stats: stats.result
        }
      };
      break;

    case 'sample':
      // Create sample validation scenarios
      const sampleScenarios = [
        {
          id: 'game_data_validation',
          input: {
            refs: { 'weapon_ref': { ok: true }, 'armor_ref': { ok: false } },
            stats: [
              { id: 'sword', stats: [{ key: 'damage', base: 25 }, { key: 'durability', base: 100 }] },
              { id: 'shield', stats: [{ key: 'defense', base: 15 }, { key: 'durability', base: 80 }] }
            ],
            zones: [
              { id: 'town', x: 0, y: 0, w: 300, h: 300 },
              { id: 'dungeon', x: 200, y: 200, w: 200, h: 200 }
            ]
          }
        },
        {
          id: 'ui_validation',
          input: {
            entities: [
              { id: 'button1', name: 'Start Button', type: 'ui', position: { x: 100, y: 100 }, properties: { text: 'Start' } },
              { id: 'button2', name: 'Options Button', type: 'ui', position: { x: 100, y: 150 }, properties: { text: 'Options' } }
            ],
            assets: [
              { id: 'button_texture', name: 'Button Texture', type: 'texture', path: '/ui/button.png', size: 256, checksum: 'btn123' }
            ]
          }
        }
      ];

      const scenarioResults = sampleScenarios.map(scenario => {
        const result = manager.validateAll(scenario.input);
        return {
          scenario: scenario.id,
          valid: result.result?.valid || false,
          issues: result.result?.issues?.length || 0,
          warnings: result.result?.warnings?.length || 0
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample validation scenarios created',
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
            'configure --config=<json>',
            'validate-all --input=<json>',
            'report-issues',
            'stats',
            'export --format=<json|manifest|summary|report>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts configure --config={"rules":["missing_refs","stat_bounds"]}',
            'node cliHarness.ts validate-all --input={"refs":{"ref1":{"ok":true}}}',
            'node cliHarness.ts report-issues',
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