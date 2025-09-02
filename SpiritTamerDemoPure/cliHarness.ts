/**
 * CLI Harness for SpiritTamerDemoPure
 * 
 * This harness provides CLI interface for SpiritTamerDemoPure module testing.
 * Uses shared utilities to eliminate code duplication.
 * 
 * @module SpiritTamerDemoPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import {
  buildSamplePayload,
  validatePayload,
  witcherExplorerDemo,
  spiritTamerDemo,
  defaultStub,
  parseCLIArgs,
  formatOutput
} from './miff/pure/shared/cliHarnessUtils';

const { mode } = parseCLIArgs(process.argv);

// Select output based on CLI argument
let output;
switch (mode) {
  case 'build-sample':
    output = buildSamplePayload();
    break;
  case 'validate':
    output = validatePayload();
    break;
  case 'witcher':
    output = witcherExplorerDemo();
    break;
  case 'spirit':
    output = spiritTamerDemo();
    break;
  default:
    output = spiritTamerDemo(); // Default to spirit for this module
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));