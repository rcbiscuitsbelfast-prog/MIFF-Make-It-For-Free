#!/usr/bin/env tsx

import { RenderReplaySystem } from './index';
import { RenderReplayManager, ReplayConfig } from './Manager';
import * as fs from 'fs';
import * as path from 'path';

interface RenderReplayOperation {
  op: 'record' | 'playback' | 'analyze' | 'export' | 'dump';
  sessionId?: string;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

function parseFlags(argv: string[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.replace(/^--/, '');
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = /^\d+(?:\.\d+)?$/.test(next) ? Number(next) : next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function printHelp(): void {
  console.log('RenderReplayPure CLI - Visual replay tool for MIFF engine bridges');
  console.log('');
  console.log('Usage:');
  console.log('  tsx cliHarness.ts <command> [args] [--flags]');
  console.log('');
  console.log('Commands:');
  console.log('  replay-golden <testPath> --engine <unity|web|godot> [--speed <n>] [--loop] [--no-debug] [--format <json|markdown|html>]');
  console.log('  replay-cli <jsonPath> --engine <unity|web|godot> [--format <json|markdown|html>]');
  console.log('  replay-payload <jsonPath> --engine <unity|web|godot> [--format <json|markdown|html>]');
  console.log('  export <sessionId> <outputPath> --format <json|markdown|html>');
  console.log('  help');
  console.log('');
  console.log('Options:');
  console.log('  --engine, --speed, --loop, --no-debug, --format');
  console.log('');
  console.log('Examples:');
  console.log('  tsx cliHarness.ts replay-golden BridgeSchemaPure/sample_render.json --engine web --format json');
}

function ensureConfig(flags: Record<string, any>): ReplayConfig {
  const engine = (flags.engine || 'web') as ReplayConfig['engine'];
  const speed = typeof flags.speed === 'number' ? flags.speed : 1.0;
  const loop = Boolean(flags.loop);
  const showDebug = flags['no-debug'] ? false : true;
  const outputFormat = (flags.format || 'json') as ReplayConfig['outputFormat'];
  return { engine, speed, loop, showDebug, outputFormat };
}

function printReplayResult(prefix: string, out: any): void {
  if (out.status === 'ok') {
    console.log('✅ Replay successful!');
  } else {
    console.log('❌ Replay failed:');
  }
  console.log(`🎯 Engine: ${out.session?.summary?.engine ?? 'unknown'}`);
  console.log(`📈 Steps: ${out.session?.summary?.totalSteps ?? 0}`);
  console.log(`🎨 RenderData: ${out.session?.summary?.totalRenderData ?? 0}`);
  console.log('📄 JSON Output:');
  console.log(JSON.stringify(out, null, 2));
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  try {
    switch (cmd) {
      case 'replay-golden': {
        const testPath = rest[0];
        if (!testPath) {
          console.log('Error: Test path required');
          printHelp();
          process.exitCode = 1;
          return;
        }
        const flags = parseFlags(rest.slice(1));
        const config = ensureConfig(flags);
        const mgr = new RenderReplayManager(config);
        const out = mgr.replayFromGoldenTest(path.isAbsolute(testPath) ? testPath : path.resolve(testPath));
        printReplayResult('replay-golden', out);
        break;
      }
      case 'replay-cli': {
        const jsonPath = rest[0];
        if (!jsonPath || !fs.existsSync(jsonPath)) {
          console.log('Error reading CLI output file: file not found');
          return;
        }
        const flags = parseFlags(rest.slice(1));
        const config = ensureConfig(flags);
        const mgr = new RenderReplayManager(config);
        const out = mgr.replayFromCLIOutput(fs.readFileSync(jsonPath, 'utf-8'));
        printReplayResult('replay-cli', out);
        break;
      }
      case 'replay-payload': {
        const jsonPath = rest[0];
        if (!jsonPath || !fs.existsSync(jsonPath)) {
          console.log('Error reading JSON payload file: file not found');
          return;
        }
        const flags = parseFlags(rest.slice(1));
        const config = ensureConfig(flags);
        const mgr = new RenderReplayManager(config);
        const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const out = mgr.replayFromPayload(payload);
        printReplayResult('replay-payload', out);
        break;
      }
      case 'export': {
        const sessionId = rest[0];
        const outputPath = rest[1];
        const flags = parseFlags(rest.slice(2));
        const config = ensureConfig(flags);
        if (!sessionId || !outputPath) {
          console.log('Error: Missing arguments for export');
          printHelp();
          return;
        }
        const mgr = new RenderReplayManager(config);
        const dummySession = {
          sessionId,
          config,
          steps: [],
          summary: { totalSteps: 0, totalRenderData: 0, totalIssues: 0, duration: '0ms', engine: config.engine }
        } as any;
        console.log(`📤 Exporting session: ${sessionId}`);
        console.log(`📁 Output: ${outputPath}`);
        console.log(`📄 Format: ${config.outputFormat}`);
        const res = mgr.exportReplay(dummySession, path.isAbsolute(outputPath) ? outputPath : path.resolve(outputPath));
        if (res.success) {
          console.log(`✅ Export successful: ${outputPath}`);
        } else {
          console.log(`❌ Export failed: ${(res.issues || []).join(', ')}`);
        }
        break;
      }
      default: {
        console.log('Error: Unknown command');
        printHelp();
        process.exitCode = 1;
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exitCode = 1;
  }
}

if(import.meta.url === `file://${process.argv[1]}`) main();