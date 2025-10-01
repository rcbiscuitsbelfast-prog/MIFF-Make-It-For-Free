#!/usr/bin/env -S tsx
import fs from 'fs';
import path from 'path';
import { exportToWeb, ExportPlatform } from '../miff/pure/ExportPipelinePure';

async function main(){
	const date = process.env.DATE || new Date().toISOString().slice(0,10);
	const outDir = path.resolve('docs/archive/test-results');
	if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
	const out = path.join(outDir, `${date}-export-web-validation.txt`);

	const payload:any = { renderData: [ { type:'sprite', x:10, y:10, width:32, height:32, color:'#fff' } ], textures: [], meshes: [] };
	try{
		const result = await exportToWeb(payload, ExportPlatform.WEB_BROWSER);
		fs.writeFileSync(out, JSON.stringify(result, null, 2));
		process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
	}catch(e:any){
		fs.writeFileSync(out, `Error: ${e?.message||String(e)}`);
		process.stdout.write(`Wrote ${path.relative(process.cwd(), out)} with error\n`);
		process.exitCode = 1;
	}
}

main();