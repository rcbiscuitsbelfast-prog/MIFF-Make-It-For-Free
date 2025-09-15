#!/usr/bin/env ts-node
import { Command } from 'commander';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PixelDrawPure } from '../miff/pure/PixelDrawPure';

const program = new Command();
program.name('miff-pixel').description('MIFF Pixel Asset CLI').version('0.1.0');

program.command('draw')
  .requiredOption('--size <wxh>', 'grid size, e.g. 16x16')
  .option('--out <path>', 'output JSON path', 'pixel.json')
  .action((opts)=>{
    const [w,h] = String(opts.size).split('x').map((v:string)=>parseInt(v,10));
    const grid = PixelDrawPure.create(w,h,1);
    const out = resolve(process.cwd(), String(opts.out));
    writeFileSync(out, JSON.stringify(PixelDrawPure.exportJSON(grid), null, 2));
    console.log('✅ pixel grid created at', out);
  });

program.command('generate')
  .requiredOption('--preset <name>', 'preset (forest, village, dungeon)')
  .option('--count <n>', 'number of assets', '10')
  .option('--out <dir>', 'output directory', 'assets')
  .action((opts)=>{
    // Stub: emit simple JSON assets for now
    const n = parseInt(String(opts.count),10)||1;
    const preset = String(opts.preset);
    const outDir = resolve(process.cwd(), String(opts.out));
    for (let i=0;i<n;i++){
      const asset = {
        id: `${preset}_asset_${i+1}`,
        style: 'pixel-topdown',
        layer: `${preset}_asset_${i+1}.png`,
        anchor: { x: 8, y: 16 }
      };
      const p = resolve(outDir, `${asset.id}.json`);
      writeFileSync(p, JSON.stringify(asset, null, 2));
      console.log('🧱', p);
    }
    console.log('✅ generated', n, 'assets in', outDir);
  });

program.command('animate')
  .requiredOption('--frames <list>', 'comma-separated PNGs')
  .option('--out <path>', 'output metadata path', 'anim.json')
  .action((opts)=>{
    const frames = String(opts.frames).split(',').map((s:string)=>s.trim()).filter(Boolean);
    const meta = { schema:'miff.pixel.anim.v1', animation: { walk: frames } };
    const out = resolve(process.cwd(), String(opts.out));
    writeFileSync(out, JSON.stringify(meta, null, 2));
    console.log('✅ animation metadata written to', out);
  });

program.parse(process.argv);

