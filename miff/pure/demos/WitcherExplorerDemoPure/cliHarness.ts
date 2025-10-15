import { StructuredLogger } from '../shared/logging/StructuredLogger';
/**
 * CLI Harness for WitcherExplorerDemoPure
 * 
 * This harness provides CLI interface for WitcherExplorerDemoPure module testing.
 * Uses shared utilities to eliminate code duplication.
 * 
 * @module WitcherExplorerDemoPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import {
  witcherExplorerDemo,
  parseCLIArgs,
  formatOutput
} from '../../shared/cliHarnessUtils';

const { mode } = parseCLIArgs(process.argv);

// Select output based on CLI argument (default to witcher demo)
const output = witcherExplorerDemo();
console.info(formatOutput(output));