#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { ProceduralWorldManager, TerrainOptions, BiomeRulesSchema } from './Manager';
import { parseComplexCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

function toInt(value: any, fallback: number): number { const n = parseInt(String(value)); return Number.isFinite(n) ? n : fallback; }
function toFloat(value: any, fallback: number): number { const n = parseFloat(String(value)); return Number.isFinite(n) ? n : fallback; }

function main() {
  const { command, options } = parseComplexCLIArgs(process.argv);
  const mgr = new ProceduralWorldManager();
  const seed = toInt(options.seed ?? 1, 1);

  let out: any = { op: command, status: 'ok' };

  try {
    switch (command) {
      case 'world:generate-terrain': {
        const width = toInt(options.size?.split?.('x')?.[0!] ?? options.width ?? 64, 64);
        const height = toInt(options.size?.split?.('x')?.[1!] ?? options.height ?? 64, 64);
        const noise = (options.noise || 'perlin') as TerrainOptions['noise'];
        const terrain = mgr.generateTerrain({
          seed,
          width,
          height,
          noise,
          octaves: toInt(options.octaves ?? 4, 4),
          persistence: toFloat(options.persistence ?? 0.5, 0.5),
          lacunarity: toFloat(options.lacunarity ?? 2.0, 2.0),
          scale: toFloat(options.scale ?? 1.0, 1.0)
        });
        out = { log: [
          `seed=${seed}`,
          `size=${width}x${height}`,
          `noise=${noise}`
        ], outputs: [terrain] };
        break;
      }
      case 'world:apply-biomes': {
        const heightmapPath = options.heightmap as string;
        const rulesPath = options.rules as string;
        if (!heightmapPath || !rulesPath) throw new Error('Missing --heightmap <file> or --rules <file>');
        const heightmap = JSON.parse(fs.readFileSync(path.resolve(heightmapPath), 'utf-8')) as number[][];
        const rules = JSON.parse(fs.readFileSync(path.resolve(rulesPath), 'utf-8')) as BiomeRulesSchema;
        const biomes = mgr.applyBiomes(heightmap, rules);
        out = { log: [`seed=${seed}`, `biomes=${rules.biomes.length}`], outputs: [{ biomes }] };
        break;
      }
      case 'world:carve-rivers': {
        const heightmapPath = options.heightmap as string;
        const threshold = toFloat(options.threshold ?? 0.05, 0.05);
        if (!heightmapPath) throw new Error('Missing --heightmap <file>');
        const heightmap = JSON.parse(fs.readFileSync(path.resolve(heightmapPath), 'utf-8')) as number[][];
        const rivers = mgr.carveRivers(heightmap, { threshold, maxRivers: toInt(options.maxRivers ?? 8, 8) });
        out = { log: [`seed=${seed}`, `rivers=${rivers.length}`], outputs: [{ rivers }] };
        break;
      }
      case 'help':
      default:
        out = {
          log: ['ProceduralWorldPure CLI'],
          outputs: [{
            help: [
              'world:generate-terrain --seed <n> --size <WxH> [--noise perlin|simplex|worley] [--octaves n] [--scale v] [--persistence v] [--lacunarity v]',
              'world:apply-biomes --heightmap <file.json> --rules <biomeSchema.json> --seed <n>',
              'world:carve-rivers --heightmap <file.json> --threshold <v> --seed <n>'
            ]
          }]
        };
    }
  } catch (err) {
    out = { log: ['error'], outputs: [{ error: err instanceof Error ? err.message : String(err) }] };
    process.exitCode = 1;
  }

  console.log(formatOutput(out));
}

if (import.meta.url === `file://${process.argv[1!]}`) main();

