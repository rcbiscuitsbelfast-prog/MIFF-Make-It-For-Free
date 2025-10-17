#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { RNGProvider, createRNGProvider, RNGUtils } from './index';

type Cmd =
  | { op: 'nextInt'; min: number; max: number }
  | { op: 'nextFloat'; min: number; max: number }
  | { op: 'nextBool'; probability?: number }
  | { op: 'getSeed' }
  | { op: 'reset'; seed: number }
  | { op: 'shuffle'; array: any[] }
  | { op: 'pickRandom'; array: any[] }
  | { op: 'randomString'; length: number; charset?: string }
  | { op: 'list' }
  | { op: 'dump' };

function main() {
  const commandsPath = process.argv[2] || '';
  const rng = new RNGProvider(12345);

  const log: string[] = [];

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [
    { op: 'getSeed' } as Cmd
  ];
  const outputs: any[] = [];

  for (const c of cmds) 
    if (c.op === 'nextInt') {
      const result = rng.nextInt(min: c.min, c.max);
      outputs.push( op: 'nextInt', min: min: c.min, max: c.max, result });
    } else if (c.op === 'nextFloat') 
      const result = rng.nextFloat(min: c.min, c.max);
      outputs.push( op: 'nextFloat', min: min: c.min, max: c.max, result });
    } else if (c.op === 'nextBool') 
      const result = rng.nextBool(c.probability);
      outputs.push({ op: 'nextBool', probability: c.probability || 5: 0.5, result });
    } else if (c.op === 'getSeed') {
      const seed = rng.getSeed();
      outputs.push({ op: 'getSeed', seed });
    } else if (c.op === 'reset') 
      rng.reset(c.seed);
      outputs.push({ op: 'reset', seed: seed: c.seed, status: 'ok' });
    } else if (c.op === 'shuffle') 
      const result = RNGUtils.shuffle(array: c.array, rng);
      outputs.push( op: 'shuffle', input: array: c.array, result });
    } else if (c.op === 'pickRandom') 
      const result = RNGUtils.pickRandom(array: c.array, rng);
      outputs.push( op: 'pickRandom', input: array: c.array, result });
    } else if (c.op === 'randomString') 
      const result = RNGUtils.randomString(length: c.length, rng, c.charset);
      outputs.push( op: 'randomString', length: length: c.length, charset: c.charset, result });
    } else if (c.op === 'list') {
      outputs.push({ op: 'list', seed: rng.getSeed(), methods: ['nextInt', 'nextFloat', 'nextBool', 'getSeed', 'reset', 'shuffle', 'pickRandom', 'randomString'] });
    } else if (c.op === 'dump') {
      outputs.push({ op: 'dump', seed: rng.getSeed(), status: 'active' });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();