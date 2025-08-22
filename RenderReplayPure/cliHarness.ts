#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { RenderReplayManager, ReplayConfig, RenderReplayOutput } from './Manager';
import { ReplaySession } from './Manager';

const manager = new RenderReplayManager({
  engine: 'web',
  speed: 1.0,
  loop: false,
  showDebug: true,
  outputFormat: 'json',
  timestamp: true
});

function printUsage(): void {
  console.log(`
RenderReplayPure CLI - Visual replay tool for MIFF engine bridges

Usage:
  npx ts-node RenderReplayPure/cliHarness.ts <command> [options]

Commands:
  replay-golden <test-path>     Replay renderData from golden test file
  replay-cli <output-file>      Replay renderData from CLI output file
  replay-payload <json-file>    Replay renderData from JSON payload file
  export <session-id> <output>  Export replay session to file

Options:
  --engine <engine>             Target engine (unity|web|godot) [default: web]
  --speed <speed>               Replay speed multiplier [default: 1.0]
  --loop                        Enable loop mode
  --no-debug                    Disable debug overlay
  --format <format>             Output format (json|markdown|html) [default: json]
  --no-timestamp                Disable timestamps

Examples:
  # Replay UnityBridgePure golden test
  npx ts-node RenderReplayPure/cliHarness.ts replay-golden UnityBridgePure/tests/goldenBridge.test.ts --engine unity

  # Replay WebBridgePure CLI output
  npx ts-node RenderReplayPure/cliHarness.ts replay-cli web_output.json --engine web --format html

  # Replay GodotBridgePure JSON payload
  npx ts-node RenderReplayPure/cliHarness.ts replay-payload godot_payload.json --engine godot --format markdown

  # Export replay session
  npx ts-node RenderReplayPure/cliHarness.ts export replay_1234567890 replay_report.html --format html
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
    
    if (arg === '--engine') {
      options.engine = commandArgs[++i];
    } else if (arg === '--speed') {
      options.speed = parseFloat(commandArgs[++i]);
    } else if (arg === '--loop') {
      options.loop = true;
    } else if (arg === '--no-debug') {
      options.showDebug = false;
    } else if (arg === '--format') {
      options.outputFormat = commandArgs[++i];
    } else if (arg === '--no-timestamp') {
      options.timestamp = false;
    } else if (!arg.startsWith('--')) {
      // This is a positional argument
      continue;
    }
  }

  return { command, args: commandArgs.filter(arg => !arg.startsWith('--')), options };
}

function updateConfig(options: any): void {
  if (options.engine) {
    manager['config'].engine = options.engine;
  }
  if (options.speed !== undefined) {
    manager['config'].speed = options.speed;
  }
  if (options.loop !== undefined) {
    manager['config'].loop = options.loop;
  }
  if (options.showDebug !== undefined) {
    manager['config'].showDebug = options.showDebug;
  }
  if (options.outputFormat) {
    manager['config'].outputFormat = options.outputFormat;
  }
  if (options.timestamp !== undefined) {
    manager['config'].timestamp = options.timestamp;
  }
}

function replayGolden(args: string[], options: any): void {
  if (args.length < 1) {
    console.error('Error: Test path required');
    printUsage();
    process.exit(1);
  }

  const testPath = args[0];
  updateConfig(options);

  console.log(`🎬 Replaying golden test: ${testPath}`);
  console.log(`🎯 Engine: ${manager['config'].engine}`);
  console.log(`⚡ Speed: ${manager['config'].speed}x`);
  console.log(`🔄 Loop: ${manager['config'].loop ? 'Yes' : 'No'}`);
  console.log(`🐛 Debug: ${manager['config'].showDebug ? 'Yes' : 'No'}`);
  console.log('');

  const result = manager.replayFromGoldenTest(testPath);
  outputResult(result);
}

function replayCLI(args: string[], options: any): void {
  if (args.length < 1) {
    console.error('Error: CLI output file required');
    printUsage();
    process.exit(1);
  }

  const outputFile = args[0];
  updateConfig(options);

  console.log(`🎬 Replaying CLI output: ${outputFile}`);
  console.log(`🎯 Engine: ${manager['config'].engine}`);
  console.log(`⚡ Speed: ${manager['config'].speed}x`);
  console.log(`🔄 Loop: ${manager['config'].loop ? 'Yes' : 'No'}`);
  console.log(`🐛 Debug: ${manager['config'].showDebug ? 'Yes' : 'No'}`);
  console.log('');

  try {
    const cliOutput = fs.readFileSync(outputFile, 'utf-8');
    const result = manager.replayFromCLIOutput(cliOutput);
    outputResult(result);
  } catch (error) {
    console.error(`Error reading CLI output file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

function replayPayload(args: string[], options: any): void {
  if (args.length < 1) {
    console.error('Error: JSON payload file required');
    printUsage();
    process.exit(1);
  }

  const payloadFile = args[0];
  updateConfig(options);

  console.log(`🎬 Replaying JSON payload: ${payloadFile}`);
  console.log(`🎯 Engine: ${manager['config'].engine}`);
  console.log(`⚡ Speed: ${manager['config'].speed}x`);
  console.log(`🔄 Loop: ${manager['config'].loop ? 'Yes' : 'No'}`);
  console.log(`🐛 Debug: ${manager['config'].showDebug ? 'Yes' : 'No'}`);
  console.log('');

  try {
    const payloadContent = fs.readFileSync(payloadFile, 'utf-8');
    const payload = JSON.parse(payloadContent);
    const result = manager.replayFromPayload(payload);
    outputResult(result);
  } catch (error) {
    console.error(`Error reading JSON payload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

function exportSession(args: string[], options: any): void {
  if (args.length < 2) {
    console.error('Error: Session ID and output path required');
    printUsage();
    process.exit(1);
  }

  const sessionId = args[0];
  const outputPath = args[1];
  updateConfig(options);

  console.log(`📤 Exporting session: ${sessionId}`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📄 Format: ${manager['config'].outputFormat}`);
  console.log('');

  // For demo purposes, create a sample session
  // In a real implementation, you'd load the session from storage
  const sampleSession: ReplaySession = {
    sessionId,
    config: manager['config'],
    steps: [
      {
        step: 1,
        timestamp: new Date().toISOString(),
        renderData: [
          {
            id: 'demo_sprite',
            type: 'sprite',
            position: { x: 100, y: 200 },
            asset: 'demo.png'
          }
        ],
        issues: [],
        annotations: ['Demo session for export']
      }
    ],
    summary: {
      totalSteps: 1,
      totalRenderData: 1,
      totalIssues: 0,
      duration: '1000ms',
      engine: manager['config'].engine
    }
  };

  const exportResult = manager.exportReplay(sampleSession, outputPath);
  
  if (exportResult.success) {
    console.log(`✅ Export successful: ${outputPath}`);
  } else {
    console.error(`❌ Export failed: ${exportResult.issues?.join(', ')}`);
    process.exit(1);
  }
}

function outputResult(result: RenderReplayOutput): void {
  if (result.status === 'error') {
    console.error(`❌ Replay failed:`);
    result.issues?.forEach(issue => {
      console.error(`  - ${issue}`);
    });
    process.exit(1);
  }

  const session = result.session;
  
  console.log(`✅ Replay successful!`);
  console.log(`📊 Session ID: ${session.sessionId}`);
  console.log(`🎯 Engine: ${session.summary.engine}`);
  console.log(`📈 Steps: ${session.summary.totalSteps}`);
  console.log(`🎨 RenderData: ${session.summary.totalRenderData}`);
  console.log(`⚠️ Issues: ${session.summary.totalIssues}`);
  console.log(`⏱️ Duration: ${session.summary.duration}`);
  console.log('');

  // Show step summary
  console.log('📋 Step Summary:');
  session.steps.forEach((step, index) => {
    console.log(`  ${index + 1}. Step ${step.step} - ${step.renderData.length} renderData`);
    if (step.issues && step.issues.length > 0) {
      console.log(`     ⚠️ ${step.issues.length} issues`);
    }
  });
  console.log('');

  // Show detailed renderData if debug is enabled
  if (manager['config'].showDebug) {
    console.log('🔍 Detailed RenderData:');
    session.steps.forEach((step, stepIndex) => {
      console.log(`\n  Step ${step.step}:`);
      step.renderData.forEach((data, dataIndex) => {
        console.log(`    ${dataIndex + 1}. ${data.type} (${data.id})`);
        console.log(`       Position: ${JSON.stringify(data.position)}`);
        console.log(`       Asset: ${data.asset || 'None'}`);
        
        if (data.children && data.children.length > 0) {
          console.log(`       Children: ${data.children.length}`);
        }
        
        if (data.signals && data.signals.length > 0) {
          console.log(`       Signals: ${data.signals.length}`);
        }
        
        if (data.engineHints) {
          const hints = Object.keys(data.engineHints).join(', ');
          console.log(`       Engine Hints: ${hints}`);
        }
      });
    });
  }

  // Output JSON result
  console.log('\n📄 JSON Output:');
  console.log(JSON.stringify(result, null, 2));
}

function main(): void {
  const { command, args, options } = parseArgs();

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  switch (command) {
    case 'replay-golden':
      replayGolden(args, options);
      break;
    case 'replay-cli':
      replayCLI(args, options);
      break;
    case 'replay-payload':
      replayPayload(args, options);
      break;
    case 'export':
      exportSession(args, options);
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