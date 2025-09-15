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

program.parse(process.argv);

