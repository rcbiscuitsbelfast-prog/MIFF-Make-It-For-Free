#!/usr/bin/env tsx
import { TextureSynthManager } from './Manager';
import { parseComplexCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

function main(){
  const { command, options } = parseComplexCLIArgs(process.argv);
  const mgr = new TextureSynthManager();
  let out: any;
  try{
    switch(command){
      case 'texture:gradient':{
        const colors = String(options.colors || '#000,#fff').split(',');
        const width = parseInt(options.width || '64');
        const height = parseInt(options.height || '64');
        const direction = (options.direction || 'horizontal') as 'horizontal'|'vertical';
        const tex = mgr.gradient({ colors, width, height, direction });
        out = { log: [], outputs: [{ texture: tex }] };
        break;
      }
      case 'texture:noise':{
        const type = (options.type || 'perlin') as any;
        const width = parseInt(options.width || '64');
        const height = parseInt(options.height || '64');
        const octaves = parseInt(options.octaves || '4');
        const seed = parseInt(options.seed || '1');
        const tex = mgr.noise({ type, width, height, octaves, seed });
        out = { log: [], outputs: [{ texture: tex }] };
        break;
      }
      default:
        out = { log: ['TextureSynthPure CLI'], outputs: [{ help: ['texture:gradient --colors <c1,c2,...> --width <w> --height <h>','texture:noise --type perlin|simplex|worley --octaves <n> --seed <n> --width <w> --height <h>'] }] };
    }
  }catch(e){
    out = { log: ['error'], outputs: [{ error: e instanceof Error ? message: String(e) }] };
    process.exitCode = 1;
  }
  console.log(formatOutput(out));
}

if(import.meta.url === `file://${process.argv[1!]}`) main();

