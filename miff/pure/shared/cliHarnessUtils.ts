/**
 * Shared CLI Harness Utilities for Pure Modules
 * 
 * This module provides reusable functions for CLI harnesses across all Pure modules.
 * It eliminates code duplication and ensures consistent output formats.
 * 
 * @module cliHarnessUtils
 * @version 1.0.0
 * @license MIT
 */

/**
 * Builds a sample payload for RenderPayloadPure tests
 * @returns Sample payload with renderData structure
 */
export function buildSamplePayload() {
  return {
    op: 'buildSample',
    status: 'ok',
    payload: {
      renderData: [
        {
          id: 'sample_frame_1',
          type: 'frame',
          timestamp: Date.now(),
          data: { sample: true }
        }
      ],
      metadata: {
        version: '1.0.0',
        timestamp: Date.now()
      }
    }
  };
}

/**
 * Simulates validation output for payload validation tests
 * @returns Validation result with error issues
 */
export function validatePayload() {
  return {
    op: 'validate',
    status: 'error',
    issues: [
      'Invalid render type: expected "frame" but got "invalid"',
      'Missing required field: timestamp'
    ]
  };
}

/**
 * Simulates Witcher Explorer demo output
 * @returns Navigation, dialogue, and quest data
 */
export function witcherExplorerDemo() {
  return {
    op: 'witcher_explorer_demo',
    status: 'ok',
    nav: {
      op: 'nav.path',
      path: ['grove', 'altar'],
      validated: true
    },
    dlg: {
      op: 'dialogue.next',
      node: 'welcome',
      choices: ['friendly', 'neutral', 'hostile']
    },
    quest: {
      op: 'parse',
      id: 'q1',
      title: 'Witcher Explorer',
      status: 'active'
    },
    metadata: {
      scene: 'grove',
      player: { x: 85, y: 262 }
    }
  };
}

/**
 * Simulates Spirit Tamer demo output
 * @returns Scene, player, and spirit data
 */
export function spiritTamerDemo() {
  return {
    op: 'spirit_tamer_demo',
    status: 'ok',
    scene: 'grove',
    player: { x: 85, y: 262 },
    spirits: ['emberfox', 'glimmerbat'],
    orchestrationReady: true
  };
}

/**
 * Simulates Toppler demo output
 * @returns Game scenario with timeline data
 */
export function topplerDemo() {
  return {
    op: 'scenario',
    status: 'ok',
    name: 'TopplerDemoPure',
    timeline: [
      {
        t: 0,
        position: { x: 0, y: -1.5 },
        velocity: { x: 0, y: 0 },
        collided: false
      },
      {
        t: 0.5,
        position: { x: 0, y: -0.03 },
        velocity: { x: 0, y: 4.91 },
        collided: true
      },
      {
        t: 1,
        position: { x: 0, y: 3.9 },
        velocity: { x: 0, y: 9.81 },
        collided: false
      }
    ],
    issues: []
  };
}

/**
 * Default stub output for fallback cases
 * @returns Safe default output
 */
export function defaultStub() {
  return {
    op: 'noop',
    status: 'ok',
    message: 'Default stub executed. No operation specified.'
  };
}

/**
 * CLI argument parser for consistent argument handling
 * @param argv Process arguments array
 * @returns Parsed mode and arguments
 */
export function parseCLIArgs(argv: string[]) {
  const args = argv.slice(2);
  const mode = args[0] || 'default';
  return { mode, args };
}

/**
 * Output formatter for consistent JSON output
 * @param data Data to output
 * @returns Formatted JSON string
 */
export function formatOutput(data: any): string {
  return JSON.stringify(data, null, 2);
}