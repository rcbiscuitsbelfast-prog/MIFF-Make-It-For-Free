#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

interface ExportWebArgs {
  project: string;
  output: string;
  deploy?: 'pages' | 'netlify' | 'vercel' | 'none';
}

function parseArgs(argv: string[]): ExportWebArgs {
  const args: any = { deploy: 'none' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') args.project = argv[++i];
    else if (a === '--output') args.output = argv[++i];
    else if (a === '--deploy') args.deploy = argv[++i];
  }
  if (!args.project || !args.output) {
    throw new Error('Usage: export:web --project <godot_project_dir> --output <build_dir> [--deploy pages|netlify|vercel|none]');
  }
  return args as ExportWebArgs;
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function emitManifest(buildDir: string) {
  const files = fs.readdirSync(buildDir).filter((f: any) => /\.(wasm|js|pck|png|jpg|ogg|mp3|json|html)$/i.test(f));
  const manifest = files.map((name: any) => ({ name, size: fs.statSync(path.join(buildDir, name)).size }));
  fs.writeFileSync(path.join(buildDir, 'preload.manifest.json'), JSON.stringify({ files: manifest }, null, 2));
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === 'help' || argv.length === 0) {
    console.log('export:web --project ./docs/godot --output ./build/web --deploy pages');
    process.exit(0);
  }
  const { project, output, deploy } = parseArgs(argv);

  ensureDir(output);
  // For now, simulate export by copying static files if present
  const src = path.resolve(project, 'export', 'web');
  if (!fs.existsSync(src)) {
    console.error(`Expected Godot web export at ${src}`);
    process.exit(2);
  }
  for (const f of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, f), path.join(output, f));
  }
  emitManifest(output);

  const result = { op: 'export:web', status: 'ok', output, deploy };
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });

