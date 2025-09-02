/**
 * CLI Harness for GodotBridgePure
 * 
 * This harness provides CLI interface for GodotBridgePure module testing.
 * Uses shared utilities to eliminate code duplication.
 * 
 * @module GodotBridgePure/cliHarness
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
    console.log('GodotBridgePure CLI - Godot bridge tool');
    console.log('Usage: GodotBridgePure/cliHarness.ts <command> [args]');
    console.log('Commands:');
    console.log('  dump <type>     - Dump bridge information');
    console.log('  simulate <file> - Simulate bridge operation');
    return;
  }

  if (command === 'dump') {
    const type = args[0] || 'npcs';
    const result = {
      op: 'dump',
      type,
      data: {
        npcs: ['npc_001', 'npc_002'],
        entities: ['entity_001'],
        scenes: ['scene_001']
      }
    };
    handleSuccess(result, 'dump');
    return;
  }

  if (command === 'simulate') {
    const file = args[0];
    if (!file) {
      handleError('No file specified for simulation', 1);
      return;
    }
    
    const result = {
      op: 'simulate',
      file,
      data: {
        npcId: 'npc_001',
        duration: 3600,
        renderData: {
          nodes: ['Node1', 'Node2'],
          scripts: ['script1.gd', 'script2.gd']
        }
      }
    };
    handleSuccess(result, 'simulate');
    return;
  }

  // Default fallback
  const result = {
    op: 'demo',
    status: 'ok',
    data: {
      message: 'GodotBridgePure CLI executed successfully',
      command,
      args,
      timestamp: Date.now()
    }
  };
  handleSuccess(result, 'demo');
}

if (require.main === module) {
  main();
}