#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { NodeGraphManager, GraphDefinition } from './Manager';
import { TextureSynthManager } from '../TextureSynthPure/Manager';
import { MeshFactoryManager } from '../MeshFactoryPure/Manager';
import { parseComplexCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

function main(){
  const { command, options } = parseComplexCLIArgs(process.argv);
  let out: any;
  try {
    switch(command){
      case 'graph:run':{
        const file = options.file as string;
        const seed = parseInt(options.seed || '1');
        if(!file) throw new Error('Missing --file <graphDefinition.json>');
        const def = JSON.parse(fs.readFileSync(path.resolve(file),'utf-8')) as GraphDefinition;
        const mgr = new NodeGraphManager();
        const tex = new TextureSynthManager();
        const mesh = new MeshFactoryManager();
        const res = mgr.execute(def, {
          textureNoise: (opts:any)=> tex.noise({ type: (opts.type||'perlin'), width: opts.width||64, height: opts.height||64, octaves: opts.octaves||4, seed }),
          textureGradient: (opts:any)=> tex.gradient({ colors: opts.colors||['#000','#fff'], width: opts.width||64, height: opts.height||64, direction: opts.direction||'horizontal' }),
          meshTree: (opts:any)=> mesh.createTree(opts, seed),
          meshRock: (opts:any)=> mesh.createRock(opts)
        });
        out = { log: [`seed=${seed}`], outputs: [res] };
        break;
      }
      default:
        out = { log: ['NodeGraphPure CLI'], outputs: [{ help: ['graph:run --file graphDefinition.json --seed <n>'] }] };
    }
  } catch(e){
    out = { log: ['error'], outputs: [{ error: e instanceof Error ? message: String(e) }] };
    process.exitCode = 1;
  }
  console.log(formatOutput(out));
}

if(import.meta.url === `file://${process.argv[1!]}`) main();

