#!/usr/bin/env ts-node
import { Command } from 'commander';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const program = new Command();
program.name('miff-export').description('MIFF Export CLI').version('0.1.0');

program.command('godot')
  .requiredOption('--world <path>', 'world manifest path')
  .option('--output <path>', 'output scene path', 'godot_scene.json')
  .option('--preview', 'preview scene JSON in console')
  .action((opts) => {
    const worldPath = resolve(process.cwd(), String(opts.world));
    const world = JSON.parse(readFileSync(worldPath, 'utf-8'));
    
    // Convert world manifest to Godot scene JSON
    const godotScene = {
      "scene": {
        "name": "World",
        "type": "Node2D",
        "children": world.zones.map((zone: any) => ({
          "name": zone.name,
          "type": "Node2D",
          "children": zone.tiles.map((tile: any) => ({
            "name": `tile_${tile.x}_${tile.y}`,
            "type": "Sprite2D",
            "properties": {
              "texture": `res://assets/${tile.assetId}.png`,
              "position": { "x": tile.x * 16, "y": tile.y * 16 },
              "z_index": tile.layer
            }
          }))
        }))
      }
    };
    
    if (opts.preview) {
      console.log('🎮 Godot Scene Preview:');
      console.log(JSON.stringify(godotScene, null, 2));
    } else {
      const outputPath = resolve(process.cwd(), String(opts.output));
      writeFileSync(outputPath, JSON.stringify(godotScene, null, 2));
      console.log('✅ Godot scene exported to', outputPath);
    }
  });

program.parse(process.argv);