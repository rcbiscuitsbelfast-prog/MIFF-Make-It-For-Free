#!/usr/bin/env ts-node
import { Command } from 'commander';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { WorldManifestPure } from '../miff/pure/WorldManifestPure';

const program = new Command();
program.name('miff-world').description('MIFF World Builder CLI').version('0.1.0');

program.command('scaffold')
  .requiredOption('--preset <name>', 'preset (forest, village, dungeon)')
  .option('--width <n>', 'world width', '32')
  .option('--height <n>', 'world height', '32')
  .option('--out <path>', 'output JSON path', 'world.json')
  .action((opts) => {
    const width = parseInt(String(opts.width), 10);
    const height = parseInt(String(opts.height), 10);
    const preset = String(opts.preset);
    const world = WorldManifestPure.create(`${preset}_zone`, `${preset} World`, width, height);
    
    // Add some sample tiles based on preset
    const sampleAssets = {
      forest: ['tree_1', 'bush_1', 'grass_1'],
      village: ['house_1', 'fence_1', 'path_1'],
      dungeon: ['wall_1', 'door_1', 'chest_1']
    };
    
    const assets = sampleAssets[preset as keyof typeof sampleAssets] || ['asset_1'];
    for (let i = 0; i < Math.min(10, width * height / 4); i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const assetId = assets[Math.floor(Math.random() * assets.length)];
      WorldManifestPure.addTile(world, `${preset}_zone`, x, y, assetId, 1);
    }
    
    const out = resolve(process.cwd(), String(opts.out));
    writeFileSync(out, WorldManifestPure.exportJSON(world));
    console.log('✅ world scaffolded at', out);
  });

program.command('validate')
  .requiredOption('--manifest <path>', 'world manifest path')
  .action((opts) => {
    const manifestPath = resolve(process.cwd(), String(opts.manifest));
    const content = readFileSync(manifestPath, 'utf-8');
    const world = JSON.parse(content);
    
    const result = WorldManifestPure.validate(world);
    if (result.valid) {
      console.log('✅ world manifest is valid');
    } else {
      console.log('❌ world manifest has errors:');
      result.errors.forEach(err => console.log('  -', err));
      process.exit(1);
    }
  });

program.command('add-tile')
  .requiredOption('--manifest <path>', 'world manifest path')
  .requiredOption('--zone <id>', 'zone ID')
  .requiredOption('--x <n>', 'x coordinate')
  .requiredOption('--y <n>', 'y coordinate')
  .requiredOption('--asset <id>', 'asset ID')
  .option('--layer <n>', 'layer (0=bg, 1=mid, 2=fg)', '1')
  .action((opts) => {
    const manifestPath = resolve(process.cwd(), String(opts.manifest));
    const content = readFileSync(manifestPath, 'utf-8');
    const world = JSON.parse(content);
    
    const x = parseInt(String(opts.x), 10);
    const y = parseInt(String(opts.y), 10);
    const layer = parseInt(String(opts.layer), 10);
    
    WorldManifestPure.addTile(world, String(opts.zone), x, y, String(opts.asset), layer);
    writeFileSync(manifestPath, WorldManifestPure.exportJSON(world));
    console.log('✅ tile added');
  });

program.parse(process.argv);