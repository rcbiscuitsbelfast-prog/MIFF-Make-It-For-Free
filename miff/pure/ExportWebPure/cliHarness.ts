#!/usr/bin/env ts-node
import path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface WebExportOptions {
  project: string;
  output: string;
  deploy?: 'pages' | 'netlify' | 'vercel' | 'none';
}

function parseArgs(argv: string[]): WebExportOptions {
  const opts: any = { project: './docs/godot', output: './build/web', deploy: 'none' };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    switch (k) {
      case '--project': opts.project = v; i++; break;
      case '--output': opts.output = v; i++; break;
      case '--deploy': opts.deploy = v; i++; break;
      default: break;
    }
  }
  return opts as WebExportOptions;
}

function main() {
  const opts = parseArgs(process.argv);
  const projectPath = path.resolve(process.cwd(), opts.project);
  console.info(JSON.stringify({
    log: [
      `ExportWebPure: project=${projectPath}`,
      `output=${path.resolve(process.cwd(), opts.output)}`,
      `deploy=${opts.deploy}`
    ],
    outputs: [ { config: opts } ]
  }));
  // TODO: Implement in next phase
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}