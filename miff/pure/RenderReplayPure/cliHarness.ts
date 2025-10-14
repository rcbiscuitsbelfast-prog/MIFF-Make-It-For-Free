#!/usr/bin/env tsx

import { RenderReplayManager, ReplayConfig } from './Manager';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface RenderReplayOperation {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
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
  console.info('RenderReplayPure CLI - Visual replay tool for MIFF engine bridges');
  console.info('');
  console.info('Usage:');
  console.info('  tsx cliHarness.ts <command> [args] [--flags]');
  console.info('');
  console.info('Commands:');
  console.info('  replay-golden <testPath> --engine <unity|web|godot> [--speed <n>] [--loop] [--no-debug] [--format <json|markdown|html>]');
  console.info('  replay-cli <jsonPath> --engine <unity|web|godot> [--format <json|markdown|html>]');
  console.info('  replay-payload <jsonPath> --engine <unity|web|godot> [--format <json|markdown|html>]');
  console.info('  export <sessionId> <outputPath> --format <json|markdown|html>');
  console.info('  help');
  console.info('');
  console.info('Options:');
  console.info('  --engine, --speed, --loop, --no-debug, --format');
  console.info('');
  console.info('Examples:');
  console.info('  tsx cliHarness.ts replay-golden BridgeSchemaPure/sample_render.json --engine web --format json');
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
    console.info('✅ Replay successful!');
  } else {
    console.info('❌ Replay failed:');
  }
  const engine = out.session?.summary?.engine ?? out.session?.config?.engine ?? 'unknown';
  const speedNum = out.session?.config?.speed ?? 1;
  const loopOn = Boolean(out.session?.config?.loop);
  const debugOn = Boolean(out.session?.config?.showDebug);
  console.info(`🎯 Engine: ${engine}`);
  console.info(`⚡ Speed: ${Number.isFinite(speedNum) ? `${speedNum}x` : '1x'}`);
  console.info(`🔄 Loop: ${loopOn ? 'Yes' : 'No'}`);
  console.info(`🐛 Debug: ${debugOn ? 'Yes' : 'No'}`);
  console.info(`📈 Steps: ${out.session?.summary?.totalSteps ?? 0}`);
  console.info(`🎨 RenderData: ${out.session?.summary?.totalRenderData ?? 0}`);
  console.info('📄 JSON Output:');
  console.info(JSON.stringify(out, null, 2));
}

function main(...args: any[]) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  try {
    switch (cmd) {
      case 'replay-golden': {
        let testPath = rest[0];
        if (!testPath) {
          console.info('Error: Test path required');
          printHelp();
          return;
        }
        // Resolve relative to this module dir if not absolute
        if (!path.isAbsolute(testPath)) {
          const cwdPath = path.resolve(process.cwd(), testPath);
          const modulePath = path.resolve(path.dirname(new URL(import.meta.url).pathname), testPath);
          if (fs.existsSync(cwdPath)) testPath = cwdPath; else if (fs.existsSync(modulePath)) testPath = modulePath;
        }
        const flags = parseFlags(rest.slice(1));
        const config = ensureConfig(flags);
        const mgr = new RenderReplayManager(config);
        // If file still not found, treat as error (do not fallback silently)
        if (!fs.existsSync(testPath)) {
          const flags = parseFlags(rest.slice(1));
          const config = ensureConfig(flags);
          const mgr = new RenderReplayManager(config);
          const out = { op: 'replay', status: 'error', session: (mgr as any).createEmptySession?.() || { sessionId: 'replay_error', config, steps: [], summary: { totalSteps: 0, totalRenderData: 0, totalIssues: 0, duration: '0ms', engine: config.engine } }, issues: [`Failed to load golden test: ${testPath}`] };
          printReplayResult('replay-golden', out);
          return;
        }
        const out = mgr.replayFromGoldenTest(testPath);
        printReplayResult('replay-golden', out);
        break;
      }
      case 'replay-cli': {
        const jsonPath = rest[0];
        if (!jsonPath || !fs.existsSync(jsonPath)) {
          console.info('Error reading CLI output file: file not found');
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
          console.info('Error reading JSON payload file: file not found');
          return;
        }
        const flags = parseFlags(rest.slice(1));
        const config = ensureConfig(flags);
        const mgr = new RenderReplayManager(config);
        const payload = SafeJSONParser.parse(fs.readFileSync(jsonPath, 'utf-8'));
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
          console.info('Error: Missing arguments for export');
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
        console.info(`📤 Exporting session: ${sessionId}`);
        console.info(`📁 Output: ${outputPath}`);
        console.info(`📄 Format: ${config.outputFormat}`);
        // Write exports relative to repo root if a relative path was provided,
        // so tests reading from project root find the files.
        const resolvedOutput = path.isAbsolute(outputPath)
          ? outputPath
          : path.resolve(process.cwd(), outputPath);
        const res = mgr.exportReplay(dummySession, resolvedOutput);
        if (res.success) {
          console.info(`✅ Export successful: ${outputPath}`);
        } else {
          console.info(`❌ Export failed: ${(res.issues || []).join(', ')}`);
          process.exitCode = 1;
        }
        break;
      }
      default: {
        console.info('Error: Unknown command');
        printHelp();
        
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exitCode = 1;
  }
}

if(import.meta.url === `file://${process.argv[1]}`) main();