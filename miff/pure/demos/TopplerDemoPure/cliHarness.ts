/**
 * CLI Harness for TopplerDemoPure
 * 
 * This harness provides CLI interface for TopplerDemoPure module testing.
 * Uses shared utilities to eliminate code duplication.
 * 
 * @module TopplerDemoPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import {
  buildSamplePayload,
  validatePayload,
  witcherExplorerDemo,
  spiritTamerDemo,
  topplerDemo,
  defaultStub,
  parseCLIArgs,
  formatOutput
} from '../miff/pure/shared/cliHarnessUtils';

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
  case 'toppler':
    output = topplerDemo();
    break;
  default:
    output = topplerDemo(); // Default to toppler for this module
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));