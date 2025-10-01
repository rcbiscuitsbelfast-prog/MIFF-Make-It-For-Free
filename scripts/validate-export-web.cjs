#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main(){
	const date = process.env.DATE || new Date().toISOString().slice(0,10);
	const outDir = path.resolve('docs/archive/test-results');
	if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
	const out = path.join(outDir, `${date}-export-web-validation.txt`);

	// Dynamically import TS module through transpiled JS via ts-node/tsx is heavy; use require on compiled TS via ts-node register is out-of-scope.
	// Instead, build a minimal payload and call the exported factory through dynamic import using Node ESM loader since package.json type=module.
	const mod = await import(path.resolve('miff/pure/ExportPipelinePure.ts'));
	const { ExportPlatform, OptimizationLevel, exportToWeb } = mod;

	const payload = { renderData: [ { type:'sprite', x:10, y:10, width:32, height:32, color:'#fff' } ], textures: [], meshes: [] };

	try{
		const result = await exportToWeb(payload, ExportPlatform.WEB_BROWSER, OptimizationLevel.SIZE);
		fs.writeFileSync(out, JSON.stringify(result, null, 2));
		process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
	}catch(e){
		fs.writeFileSync(out, `Error: ${e instanceof Error ? e.message : String(e)}`);
		process.stdout.write(`Wrote ${path.relative(process.cwd(), out)} with error\n`);
	}
}

main();