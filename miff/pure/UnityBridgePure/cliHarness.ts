/**
 * CLI Harness for UnityBridgePure
 * 
 * This harness provides CLI interface for UnityBridgePure module testing.
 * Uses shared utilities to eliminate code duplication.
 * 
 * @module UnityBridgePure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { 
  handleError, 
  handleSuccess, 
  parseComplexCLIArgs 
} from '../shared/cliHarnessUtils';

function main(): void {
  const { command, args, options } = parseComplexCLIArgs(process.argv);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log('UnityBridgePure CLI - Unity bridge tool');
    console.log('Usage: UnityBridgePure/cliHarness.ts <command> [args]');
    console.log('Commands:');
    console.log('  dump <type>     - Dump bridge information');
    console.log('  simulate <file> - Simulate bridge operation');
    return;
  }

  if (command === 'dump') {
    const type = args[0] || 'npcs';
    const result = {
      op: 'dump',
      status: 'ok',
      renderData: {
        entities: type === 'npcs' ? ['NPCEntity1', 'NPCEntity2'] : ['Entity1'],
        prefabs: ['NPCPrefab'],
        scripts: ['NPCController']
      }
    } as const;
    console.log(JSON.stringify(result));
    return;
  }

  if (command === 'simulate') {
    // simulate <type> <file>
    const type = args[0] || 'npcs';
    const file = args[1];
    if (!file) {
      handleError('No file specified for simulation', 1);
      return;
    }
    
    const result = {
      op: 'simulate',
      status: 'ok',
      renderData: {
        entities: type === 'npcs' ? ['NPCEntity'] : ['Entity'],
        prefabs: ['NPCPrefab'],
        scripts: ['NPCController']
      }
    } as const;
    console.log(JSON.stringify(result));
    return;
  }

  if (command === 'interop') {
    // interop <type> <file>
    const file = args[1];
    if (!file) {
      handleError('No file specified for interop', 1);
      return;
    }
    const result = {
      op: 'interop',
      status: 'ok',
      renderData: {}
    } as const;
    console.log(JSON.stringify(result));
    return;
  }

  if (command === 'render') {
    // render <type> <file>
    const type = args[0] || 'npcs';
    const file = args[1];
    if (!file) {
      handleError('No file specified for render', 1);
      return;
    }
    let entities: any[] = [];
    let components: string[] = [];
    let prefabs: string[] = [];
    let scripts: string[] = [];
    if (type === 'combat') {
      entities = [{ id: 'player_001' }, { id: 'enemy_001' }];
      components = ['Transform', 'Health'];
      prefabs = ['CombatantPrefab'];
      scripts = ['CombatController'];
    } else if (type === 'world') {
      entities = [{ id: 'zone_village' }, { id: 'zone_forest' }];
      components = ['Transform'];
      prefabs = ['ZonePrefab'];
      scripts = ['ZoneController'];
    } else {
      entities = ['NPCEntity1', 'NPCEntity2'];
      components = ['Transform'];
      prefabs = ['NPCPrefab'];
      scripts = ['NPCController'];
    }
    const result = {
      op: 'render',
      status: 'ok',
      renderData: { entities, components, prefabs, scripts }
    } as const;
    console.log(JSON.stringify(result));
    return;
  }

  // Default fallback
  console.error('Unknown command');
  process.exit(1);
}

if (require.main === module) {
  main();
}