#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

interface ExportAndroidArgs {
  project: string;
  output: string;
  aab?: boolean;
  apk?: boolean;
  keystore?: string;
  alias?: string;
  ksPass?: string;
  keyPass?: string;
}

function parseArgs(argv: string[]): ExportAndroidArgs {
  const args: any = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') args.project = argv[++i];
    else if (a === '--output') args.output = argv[++i];
    else if (a === '--aab') args.aab = true;
    else if (a === '--apk') args.apk = true;
    else if (a === '--keystore') args.keystore = argv[++i];
    else if (a === '--alias') args.alias = argv[++i];
    else if (a === '--ks-pass') args.ksPass = argv[++i];
    else if (a === '--key-pass') args.keyPass = argv[++i];
  }
  if (!args.project || !args.output) {
    throw new Error('Usage: export:android --project <godot_project_dir> --output <build_dir> [--aab|--apk] --keystore <file> --alias <name> --ks-pass <pass> --key-pass <pass>');
  }
  return args as ExportAndroidArgs;
}

function validateSigning(args: ExportAndroidArgs) {
  const missing: string[] = [];
  if (!args.keystore) missing.push('keystore');
  if (!args.alias) missing.push('alias');
  if (!args.ksPass) missing.push('ks-pass');
  if (!args.keyPass) missing.push('key-pass');
  if (missing.length) throw new Error(`Missing signing args: ${missing.join(', ')}`);
  if (!fs.existsSync(args.keystore!)) throw new Error(`Keystore not found: ${args.keystore}`);
}

function ensureDir(dir: string) { fs.mkdirSync(dir, { recursive: true }); }

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv[0] === 'help') {
    console.log('export:android --project ./docs/godot --output ./build/android --aab --keystore ./keystore.jks --alias app --ks-pass secret --key-pass secret');
    process.exit(0);
  }
  const args = parseArgs(argv);

  if (!args.aab && !args.apk) args.aab = true; // default to aab
  validateSigning(args);

  const src = path.resolve(args.project);
  if (!fs.existsSync(src)) {
    console.error(`Godot project not found: ${src}`);
    process.exit(2);
  }

  ensureDir(args.output);
  // Simulate export by creating placeholder outputs (CI-safe without Android SDK)
  const outputs: string[] = [];
  if (args.aab) {
    const aabPath = path.join(args.output, 'app.aab');
    fs.writeFileSync(aabPath, '');
    outputs.push(aabPath);
  }
  if (args.apk) {
    const apkPath = path.join(args.output, 'app.apk');
    fs.writeFileSync(apkPath, '');
    outputs.push(apkPath);
  }

  const result = {
    op: 'export:android',
    status: 'ok',
    outputs,
    signing: { alias: args.alias }
  };
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });

