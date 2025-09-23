#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { MeshFactoryManager } from './Manager';
import { parseComplexCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

function main(){
  const { command, options } = parseComplexCLIArgs(process.argv);
  const mgr = new MeshFactoryManager();
  let out: any;
  try {
    switch(command){
      case 'asset:tree':{
        const schemaPath = options.params as string;
        const seed = parseInt(options.seed ?? '1');
        const params = schemaPath && fs.existsSync(schemaPath) ? JSON.parse(fs.readFileSync(path.resolve(schemaPath),'utf-8')) : {};
        const mesh = mgr.createTree(params, seed);
        out = { log: [`seed=${seed}`], outputs: [{ mesh }] };
        break;
      }
      case 'asset:rock':{
        const schemaPath = options.params as string;
        const params = schemaPath && fs.existsSync(schemaPath) ? JSON.parse(fs.readFileSync(path.resolve(schemaPath),'utf-8')) : {};
        const mesh = mgr.createRock(params);
        out = { log: [], outputs: [{ mesh }] };
        break;
      }
      default:
        out = { log: ['MeshFactoryPure CLI'], outputs: [{ help: ['asset:tree --params treeSchema.json --seed <n>','asset:rock --params rockSchema.json'] }] };
    }
  } catch (e){
    out = { log: ['error'], outputs: [{ error: e instanceof Error ? e.message : String(e) }] };
    process.exitCode = 1;
  }
  console.log(formatOutput(out));
}

if(import.meta.url === `file://${process.argv[1]}`) main();

