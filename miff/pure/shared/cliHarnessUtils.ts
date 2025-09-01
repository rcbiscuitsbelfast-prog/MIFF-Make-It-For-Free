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
function buildSamplePayload() {
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
function validatePayload() {
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
function witcherExplorerDemo() {
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
function spiritTamerDemo() {
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
function topplerDemo() {
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
 * Simulates Overlink scenario output
 * @returns Overlink scenario result
 */
function overlinkDemo() {
  return {
    op: 'overlink_scenario',
    status: 'ok',
    scenario: 'overlink_demo',
    result: {
      nodes: ['start', 'process', 'end'],
      connections: ['start->process', 'process->end'],
      metadata: { version: '1.0.0' }
    }
  };
}

/**
 * Simulates Debug Overlay output
 * @returns Debug overlay result
 */
function debugOverlayDemo() {
  return {
    op: 'debug_overlay',
    status: 'ok',
    overlay: {
      debugInfo: {
        op: 'render',
        status: 'ok',
        renderDataCount: 3
      },
      issues: [],
      annotations: []
    }
  };
}

/**
 * Simulates Bridge Inspector output
 * @returns Bridge inspection result
 */
function bridgeInspectorDemo() {
  return {
    op: 'bridge_inspection',
    status: 'ok',
    inspection: {
      schemaValid: true,
      engineHintsValid: true,
      signalsValid: true,
      metadataValid: true,
      compatibility: 'high'
    }
  };
}

/**
 * Simulates Render Replay output
 * @returns Render replay result
 */
function renderReplayDemo() {
  return {
    op: 'render_replay',
    status: 'ok',
    replay: {
      frames: 60,
      duration: 1000,
      data: [{ frame: 1, timestamp: Date.now() }]
    }
  };
}

/**
 * Simulates Web Bridge output
 * @returns Web bridge result
 */
function webBridgeDemo() {
  return {
    op: 'web_bridge',
    status: 'ok',
    bridge: {
      platform: 'web',
      capabilities: ['canvas2d', 'webgl'],
      compatibility: 'modern'
    }
  };
}

/**
 * Default stub output for fallback cases
 * @returns Safe default output
 */
function defaultStub() {
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
function parseCLIArgs(argv: string[]) {
  const args = argv.slice(2);
  const mode = args[0] || 'default';
  return { mode, args };
}

/**
 * Enhanced CLI argument parser for complex commands
 * @param argv Process arguments array
 * @returns Parsed command, arguments, and options
 */
function parseComplexCLIArgs(argv: string[]) {
  const args = argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);
  const options: Record<string, any> = {};

  // Parse options
  for (let i = 0; i < commandArgs.length; i++) {
    const arg = commandArgs[i];
    
    if (arg.startsWith('--')) {
      const optionName = arg.slice(2);
      const nextArg = commandArgs[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        options[optionName] = nextArg;
        i++; // Skip next arg since we consumed it
      } else {
        options[optionName] = true;
      }
    }
  }

  return { 
    command, 
    args: commandArgs.filter((arg: string) => !arg.startsWith('--')), 
    options 
  };
}

/**
 * Output formatter for consistent JSON output
 * @param data Data to output
 * @returns Formatted JSON string
 */
function formatOutput(data: any) {
  return JSON.stringify(data, null, 2);
}

/**
 * Error handler for consistent error output
 * @param error Error object or message
 * @param exitCode Exit code to use
 * @returns Formatted error output
 */
function handleError(error: any, exitCode = 1) {
  const errorOutput = {
    op: 'error',
    status: 'error',
    error: error instanceof Error ? error.message : String(error),
    timestamp: Date.now()
  };
  
  console.error(formatOutput(errorOutput));
  process.exit(exitCode);
}

/**
 * Success handler for consistent success output
 * @param data Success data
 * @param operation Operation name
 * @returns Formatted success output
 */
function handleSuccess(data: any, operation = 'operation') {
  const successOutput = {
    op: operation,
    status: 'ok',
    data,
    timestamp: Date.now()
  };
  
  console.log(formatOutput(successOutput));
}

export {
  buildSamplePayload,
  validatePayload,
  witcherExplorerDemo,
  spiritTamerDemo,
  topplerDemo,
  overlinkDemo,
  debugOverlayDemo,
  bridgeInspectorDemo,
  renderReplayDemo,
  webBridgeDemo,
  defaultStub,
  parseCLIArgs,
  parseComplexCLIArgs,
  formatOutput,
  handleError,
  handleSuccess
};