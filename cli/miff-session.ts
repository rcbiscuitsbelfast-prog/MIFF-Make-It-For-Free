#!/usr/bin/env ts-node
import { Command } from 'commander';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SessionManifestPure } from '../miff/pure/SessionManifestPure';

const program = new Command();
program.name('miff-session').description('MIFF Session CLI').version('0.1.0');

program.command('create')
  .requiredOption('--players <n>')
  .requiredOption('--zone <zone>')
  .option('--out <path>', 'session manifest path', 'session.json')
  .action((opts)=>{
    const n = parseInt(String(opts.players),10)||2; const zone = String(opts.zone);
    const players = Array.from({length:n}).map((_,i)=>({ playerId:`p${i+1}`, avatar:'presets/avatars/barbarian.json', style:'2d-side' as const }));
    const m = SessionManifestPure.create(`sess_${Date.now()}`, zone, players);
    const out = resolve(process.cwd(), String(opts.out));
    writeFileSync(out, JSON.stringify(m,null,2));
    console.log('✅ session created at', out);
  });

program.command('validate')
  .requiredOption('--manifest <path>')
  .action((opts)=>{
    const path = resolve(process.cwd(), String(opts.manifest));
    const data = JSON.parse(readFileSync(path,'utf8'));
    const res = SessionManifestPure.validate(data);
    if (!res.ok){ console.error('❌ Invalid session:', res.errors.join('; ')); process.exit(1); }
    console.log('✅ Session OK');
  });

program.command('sync')
  .requiredOption('--manifest <path>')
  .action((opts)=>{
    const path = resolve(process.cwd(), String(opts.manifest));
    const data = JSON.parse(readFileSync(path,'utf8'));
    const res = SessionManifestPure.validate(data);
    if (!res.ok){ console.error('❌ Invalid session:', res.errors.join('; ')); process.exit(1); }
    console.log('ℹ️ Sync would broadcast session state for', data.players.length, 'players');
  });

program.command('scaffold')
  .requiredOption('--preset <name>', 'preset name (duel, co-op)')
  .option('--out <path>', 'output pack path', 'pack.json')
  .action((opts)=>{
    const preset = String(opts.preset);
    const out = resolve(process.cwd(), String(opts.out));
    const presetPath = resolve(process.cwd(), 'packs', 'multiplayer', `${preset}-pack.json`);
    try {
      const packData = readFileSync(presetPath, 'utf8');
      const pack = JSON.parse(packData);
      pack.name = `${pack.name} (Remix)`;
      pack.version = '1.0.0-remix';
      if (pack.remixInstructions?.steps) {
        pack.remixInstructions.steps.unshift('0. This is a remix of the original pack');
      }
      writeFileSync(out, JSON.stringify(pack, null, 2));
      console.log('✅ Pack scaffolded at', out);
      console.log('📦 Based on:', preset, 'preset');
    } catch (error) {
      console.error('❌ Failed to load preset:', preset);
      console.error('Available presets: duel, co-op');
      process.exit(1);
    }
  });

program.parse(process.argv);

