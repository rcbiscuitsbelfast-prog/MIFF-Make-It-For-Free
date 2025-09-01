/**
 * CLI Harness for BridgeInspectorPure
 * 
 * This harness provides CLI interface for BridgeInspectorPure module testing.
 * Uses shared utilities to eliminate code duplication.
 * 
 * @module BridgeInspectorPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { 
  bridgeInspectorDemo, 
  handleError, 
  handleSuccess, 
  parseComplexCLIArgs 
} from '../shared/cliHarnessUtils';

function main(): void {
  const { command, args, options } = parseComplexCLIArgs(process.argv);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log('BridgeInspectorPure CLI - Bridge compatibility inspector');
    console.log('Usage: BridgeInspectorPure/cliHarness.ts demo');
    return;
  }

  if (command === 'demo') {
    // Demo mode for testing
    const result = bridgeInspectorDemo();
    handleSuccess(result, 'bridge_inspection_demo');
    return;
  }

  // For now, just run demo mode
  const result = bridgeInspectorDemo();
  handleSuccess(result, 'bridge_inspection');
}

if (require.main === module) {
  main();
}