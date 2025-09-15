#!/usr/bin/env ts-node
import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AvatarSystemPure } from '../miff/pure/AvatarSystemPure';
import { AvatarManifest, AvatarStyle } from '../miff/pure/AvatarSystemPure/schema';

const program = new Command();
program.name('miff-avatar').description('MIFF Avatar CLI').version('0.1.0');

program.command('generate')
  .requiredOption('--style <style>', 'style: 3d|2d-side|overlay')
  .option('--base <base>', 'base template', 'barbarian')
  .option('--components <list>', 'comma separated components', 'shirt,boots')
  .action((opts)=>{
    const style = opts.style as AvatarStyle;
    const manifest: AvatarManifest = {
      base: opts.base,
      clothing: String(opts.components||'').split(',').map((s:string)=>s.trim()).filter(Boolean),
      face: 'neutral',
      style
    };
    console.log(JSON.stringify(manifest,null,2));
  });

program.command('translate')
  .requiredOption('--from <style>')
  .requiredOption('--to <style>')
  .requiredOption('--avatar <path>')
  .action((opts)=>{
    const path = resolve(String(opts.avatar));
    const src = JSON.parse(readFileSync(path,'utf8')) as AvatarManifest;
    const out = AvatarSystemPure.translateStyle(src, opts.to as AvatarStyle);
    console.log(JSON.stringify(out,null,2));
  });

program.command('validate')
  .requiredOption('--manifest <path>')
  .action((opts)=>{
    const path = resolve(String(opts.manifest));
    const src = JSON.parse(readFileSync(path,'utf8'));
    const res = AvatarSystemPure.validate(src);
    if (!res.ok) {
      console.error('❌ Invalid manifest:', res.errors.join('; '));
      process.exit(1);
    }
    console.log('✅ Manifest OK');
  });

program.parse(process.argv);

