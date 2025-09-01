/**
 * CLI Harness for OverlinkPure
 * 
 * This harness provides CLI interface for OverlinkPure module testing.
 * Uses shared utilities to eliminate code duplication.
 * 
 * @module OverlinkPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { overlinkDemo, handleError, handleSuccess, parseCLIArgs } from '../shared/cliHarnessUtils';
import { runScenario } from './ScenarioPackOverlinkPure';

function main() {
  const { mode, args } = parseCLIArgs(process.argv);
  
  if (mode === 'demo') {
    // Demo mode for testing
    const result = overlinkDemo();
    handleSuccess(result, 'overlink_demo');
    return;
  }
  
  // Original functionality
  const configFile = args[0];
  
  if (!configFile) {
    console.error('Usage: OverlinkPure/cliHarness.ts <config.json> or OverlinkPure/cliHarness.ts demo');
    process.exit(1);
  }

  try {
    // Parse config file
    const config = JSON.parse(require('fs').readFileSync(configFile, 'utf-8'));
    
    // Run scenario with config
    const result = runScenario(config);
    
    // Output result as JSON
    console.log(JSON.stringify(result, null, 2));
    
    // Exit with error code if scenario failed
    if (result.status === 'error') {
      process.exit(1);
    }
  } catch (error) {
    handleError(error, 1);
  }
}

if (require.main === module) main();