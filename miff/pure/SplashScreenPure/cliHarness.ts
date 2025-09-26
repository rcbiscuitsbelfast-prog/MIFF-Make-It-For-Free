/**
 * CLI Harness for SplashScreenPure
 *
 * This harness provides CLI interface for SplashScreenPure module testing.
 * Demonstrates the modular splash screen system with MIFF branding.
 *
 * @module SplashScreenPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import {
  buildSamplePayload,
  validatePayload,
  defaultStub,
  parseCLIArgs,
  formatOutput
} from '../shared/cliHarnessUtils';

import { splashScreenDemo } from './index';

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
  case 'splashscreen':
  default:
    output = splashScreenDemo(); // Default to splash screen demo
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));