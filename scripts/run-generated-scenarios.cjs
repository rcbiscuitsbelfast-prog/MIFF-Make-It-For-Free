#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function main(){
	const date = process.env.DATE || new Date().toISOString().slice(0,10);
	const scenDir = path.resolve('scenario/generated');
	const outDir = path.resolve('docs/archive/test-results');
	if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
	let files = fs.readdirSync(scenDir).filter(f => f.startsWith(date) && f.endsWith('-scenario.txt'));

	// Optional batching: --offset N --limit M
	const argv = process.argv.slice(2);
	const offsetIdx = argv.indexOf('--offset');
	const limitIdx = argv.indexOf('--limit');
	const offset = offsetIdx >= 0 ? parseInt(argv[offsetIdx+1]||'0',10) : 0;
	const limit = limitIdx >= 0 ? parseInt(argv[limitIdx+1]||String(files.length),10) : files.length;
	files = files.slice(offset, offset + limit);
	let executed = 0;
	for(const f of files){
		const p = path.join(scenDir, f);
		const scen = JSON.parse(fs.readFileSync(p,'utf8'));
		const result = runScenario(scen);
		const resFile = path.join(outDir, `${date}-${scen.modules[0]}-scenario-results.txt`);
		fs.writeFileSync(resFile, result);
		process.stdout.write(`Wrote ${path.relative(process.cwd(), resFile)}\n`);
		executed++;
	}
	process.stdout.write(`Executed ${executed} generated scenarios.\n`);
}

function runScenario(scen){
	const lines = [];
	lines.push(`Scenario: ${scen.name}`);
	lines.push(`Modules: ${scen.modules.join(', ')}`);
	lines.push('Commands:');
	for(const cmd of scen.commands){
		lines.push(`- ${cmd.join(' ')}`);
		const [bin, ...args] = cmd;
		const res = spawnSync(bin, args, { encoding:'utf8' });
		if(res.stdout) lines.push('Output:\n' + res.stdout.trim());
		if(res.stderr) lines.push('Errors/Stderr:\n' + res.stderr.trim());
		lines.push(`Status: ${res.status===0?'ok':'error'}`);
	}
	return lines.join('\n')+'\n';
}

if(require.main===module) main();