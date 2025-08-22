#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { DebugOverlayManager, DebugConfig, DebugOverlayOutput } from './Manager';

const manager = new DebugOverlayManager({
  showOp: true,
  showStatus: true,
  showIssues: true,
  showTimestamps: true,
  showRenderData: true,
  showEngineHints: true,
  showSignals: true,
  showMetadata: true,
  colorize: true,
  compact: false,
  maxRenderDataItems: 10,
  maxIssueLength: 100,
  outputFormat: 'text'
});

function printUsage(): void {
  console.log(`
DebugOverlayPure CLI - Real-time debug overlay for MIFF engine bridges

Usage:
  npx ts-node DebugOverlayPure/cliHarness.ts <command> [options]

Commands:
  overlay <json-file>           Create debug overlay from JSON payload file
  overlay-cli <output-file>     Create debug overlay from CLI output file
  overlay-golden <test-path>    Create debug overlay from golden test file
  export <overlay-id> <output>  Export debug overlay to file

Options:
  --no-op                       Hide operation information
  --no-status                   Hide status information
  --no-issues                   Hide issues
  --no-timestamps               Hide timestamps
  --no-renderdata               Hide renderData information
  --no-engine-hints             Hide engine hints
  --no-signals                  Hide signals information
  --no-metadata                 Hide metadata
  --no-color                    Disable colorized output
  --compact                     Use compact output format
  --max-items <number>          Maximum renderData items to show [default: 10]
  --max-issue-length <number>   Maximum issue length [default: 100]
  --format <format>             Output format (text|json|html) [default: text]

Examples:
  # Create debug overlay from JSON payload
  npx ts-node DebugOverlayPure/cliHarness.ts overlay payload.json --color --max-items 5

  # Create debug overlay from CLI output
  npx ts-node DebugOverlayPure/cliHarness.ts overlay-cli cli_output.json --no-color --compact

  # Create debug overlay from golden test
  npx ts-node DebugOverlayPure/cliHarness.ts overlay-golden BridgeSchemaPure/sample_render.json --format html

  # Export debug overlay
  npx ts-node DebugOverlayPure/cliHarness.ts export debug_1234567890 debug_report.html --format html
`);
}

function parseArgs(): { command: string; args: string[]; options: any } {
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);
  const options: any = {};

  // Parse options
  for (let i = 0; i < commandArgs.length; i++) {
    const arg = commandArgs[i];
    
    if (arg === '--no-op') {
      options.showOp = false;
    } else if (arg === '--no-status') {
      options.showStatus = false;
    } else if (arg === '--no-issues') {
      options.showIssues = false;
    } else if (arg === '--no-timestamps') {
      options.showTimestamps = false;
    } else if (arg === '--no-renderdata') {
      options.showRenderData = false;
    } else if (arg === '--no-engine-hints') {
      options.showEngineHints = false;
    } else if (arg === '--no-signals') {
      options.showSignals = false;
    } else if (arg === '--no-metadata') {
      options.showMetadata = false;
    } else if (arg === '--no-color') {
      options.colorize = false;
    } else if (arg === '--compact') {
      options.compact = true;
    } else if (arg === '--max-items') {
      options.maxRenderDataItems = parseInt(commandArgs[++i]);
    } else if (arg === '--max-issue-length') {
      options.maxIssueLength = parseInt(commandArgs[++i]);
    } else if (arg === '--format') {
      options.outputFormat = commandArgs[++i];
    } else if (!arg.startsWith('--')) {
      // This is a positional argument
      continue;
    }
  }

  return { command, args: commandArgs.filter(arg => !arg.startsWith('--')), options };
}

function updateConfig(options: any): void {
  if (options.showOp !== undefined) {
    manager['config'].showOp = options.showOp;
  }
  if (options.showStatus !== undefined) {
    manager['config'].showStatus = options.showStatus;
  }
  if (options.showIssues !== undefined) {
    manager['config'].showIssues = options.showIssues;
  }
  if (options.showTimestamps !== undefined) {
    manager['config'].showTimestamps = options.showTimestamps;
  }
  if (options.showRenderData !== undefined) {
    manager['config'].showRenderData = options.showRenderData;
  }
  if (options.showEngineHints !== undefined) {
    manager['config'].showEngineHints = options.showEngineHints;
  }
  if (options.showSignals !== undefined) {
    manager['config'].showSignals = options.showSignals;
  }
  if (options.showMetadata !== undefined) {
    manager['config'].showMetadata = options.showMetadata;
  }
  if (options.colorize !== undefined) {
    manager['config'].colorize = options.colorize;
  }
  if (options.compact !== undefined) {
    manager['config'].compact = options.compact;
  }
  if (options.maxRenderDataItems !== undefined) {
    manager['config'].maxRenderDataItems = options.maxRenderDataItems;
  }
  if (options.maxIssueLength !== undefined) {
    manager['config'].maxIssueLength = options.maxIssueLength;
  }
  if (options.outputFormat) {
    manager['config'].outputFormat = options.outputFormat;
  }
}

function overlay(args: string[], options: any): void {
  if (args.length < 1) {
    console.error('Error: JSON file required');
    printUsage();
    process.exit(1);
  }

  const jsonFile = args[0];
  updateConfig(options);

  console.log(`🔍 Creating debug overlay from: ${jsonFile}`);
  console.log(`🎨 Colorized: ${manager['config'].colorize ? 'Yes' : 'No'}`);
  console.log(`📦 Compact: ${manager['config'].compact ? 'Yes' : 'No'}`);
  console.log(`📄 Format: ${manager['config'].outputFormat}`);
  console.log('');

  try {
    const payloadContent = fs.readFileSync(jsonFile, 'utf-8');
    const payload = JSON.parse(payloadContent);
    const result = manager.createOverlay(payload);
    outputResult(result);
  } catch (error) {
    console.error(`Error reading JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

function overlayCLI(args: string[], options: any): void {
  if (args.length < 1) {
    console.error('Error: CLI output file required');
    printUsage();
    process.exit(1);
  }

  const outputFile = args[0];
  updateConfig(options);

  console.log(`🔍 Creating debug overlay from CLI output: ${outputFile}`);
  console.log(`🎨 Colorized: ${manager['config'].colorize ? 'Yes' : 'No'}`);
  console.log(`📦 Compact: ${manager['config'].compact ? 'Yes' : 'No'}`);
  console.log(`📄 Format: ${manager['config'].outputFormat}`);
  console.log('');

  try {
    const cliOutput = fs.readFileSync(outputFile, 'utf-8');
    const result = manager.createOverlayFromCLI(cliOutput);
    outputResult(result);
  } catch (error) {
    console.error(`Error reading CLI output file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

function overlayGolden(args: string[], options: any): void {
  if (args.length < 1) {
    console.error('Error: Test path required');
    printUsage();
    process.exit(1);
  }

  const testPath = args[0];
  updateConfig(options);

  console.log(`🔍 Creating debug overlay from golden test: ${testPath}`);
  console.log(`🎨 Colorized: ${manager['config'].colorize ? 'Yes' : 'No'}`);
  console.log(`📦 Compact: ${manager['config'].compact ? 'Yes' : 'No'}`);
  console.log(`📄 Format: ${manager['config'].outputFormat}`);
  console.log('');

  const result = manager.createOverlayFromGoldenTest(testPath);
  outputResult(result);
}

function exportOverlay(args: string[], options: any): void {
  if (args.length < 2) {
    console.error('Error: Overlay ID and output path required');
    printUsage();
    process.exit(1);
  }

  const overlayId = args[0];
  const outputPath = args[1];
  updateConfig(options);

  console.log(`📤 Exporting debug overlay: ${overlayId}`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📄 Format: ${manager['config'].outputFormat}`);
  console.log('');

  // For demo purposes, create a sample overlay
  // In a real implementation, you'd load the overlay from storage
  const samplePayload = {
    op: 'render',
    status: 'ok',
    renderData: [
      {
        id: 'demo_sprite',
        type: 'sprite',
        position: { x: 100, y: 200 },
        asset: 'demo.png',
        engineHints: {
          web: {
            element: 'sprite',
            canvas: 'gameCanvas'
          }
        }
      }
    ],
    metadata: {
      schemaVersion: 'v1',
      engine: 'web',
      timestamp: new Date().toISOString(),
      module: 'demo'
    }
  };

  const overlayResult = manager.createOverlay(samplePayload);
  if (overlayResult.status === 'ok') {
    const exportResult = manager.exportOverlay(overlayResult.overlay, outputPath);
    
    if (exportResult.success) {
      console.log(`✅ Export successful: ${outputPath}`);
    } else {
      console.error(`❌ Export failed: ${exportResult.issues?.join(', ')}`);
      process.exit(1);
    }
  } else {
    console.error(`❌ Overlay creation failed: ${overlayResult.issues?.join(', ')}`);
    process.exit(1);
  }
}

function outputResult(result: DebugOverlayOutput): void {
  if (result.status === 'error') {
    console.error(`❌ Debug overlay failed:`);
    result.issues?.forEach(issue => {
      console.error(`  - ${issue}`);
    });
    process.exit(1);
  }

  const overlay = result.overlay;
  
  console.log(`✅ Debug overlay created successfully!`);
  console.log(`📊 Operation: ${overlay.debugInfo.op}`);
  console.log(`🎯 Status: ${overlay.debugInfo.status}`);
  console.log(`📈 RenderData: ${overlay.debugInfo.renderDataCount} items`);
  console.log(`⚠️ Issues: ${overlay.issues.length}`);
  console.log(`📝 Annotations: ${overlay.annotations.length}`);
  console.log('');

  // Show debug display
  const debugDisplay = manager.generateDebugDisplay(overlay);
  console.log(debugDisplay);

  // Show JSON output if requested
  if (manager['config'].outputFormat === 'json') {
    console.log('\n📄 JSON Output:');
    console.log(JSON.stringify(result, null, 2));
  }
}

function main(): void {
  const { command, args, options } = parseArgs();

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  switch (command) {
    case 'overlay':
      overlay(args, options);
      break;
    case 'overlay-cli':
      overlayCLI(args, options);
      break;
    case 'overlay-golden':
      overlayGolden(args, options);
      break;
    case 'export':
      exportOverlay(args, options);
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      printUsage();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}