/**
 * CLI Harness for RenderWorldPure
 *
 * This harness provides CLI interface for RenderWorldPure scene testing.
 * Uses shared utilities to eliminate code duplication and provides
 * testing interface for the real-time AI-native game preview engine.
 *
 * @module RenderWorldPure/cliHarness
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

import { renderWorldDemo } from './index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

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
  case 'renderworld':
  default:
    output = renderWorldDemo(); // Default to RenderWorld demo
}

// Output valid JSON to stdout for test runner to consume
this.logger.info(formatOutput(output));