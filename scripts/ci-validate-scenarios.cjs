#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function main(){
	const date = process.env.DATE || new Date().toISOString().slice(0,10);
	const outDir = path.resolve('docs/archive/test-results');
	if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
	const summary = path.join(outDir, `${date}-ci-scenario-validation.txt`);

	const run = spawnSync('node', ['scripts/run-scenarios-detailed.cjs'], { encoding:'utf8' });
	process.stdout.write(run.stdout || '');
	process.stderr.write(run.stderr || '');

	const files = fs.readdirSync(outDir).filter(f => f.startsWith(date) && f.endsWith('-results.txt'));
	let failures = 0;
	const lines = [ `# CI Scenario Validation ${date}` ];
	for(const f of files){
		const p = path.join(outDir, f);
		const txt = fs.readFileSync(p, 'utf8');
		const statusMatch = txt.match(/^Status:\s*(\w+)/m);
		const status = statusMatch ? statusMatch[1] : 'unknown';
		if(status !== 'ok') failures++;
		lines.push(`${f}: ${status}`);
	}
	lines.push(`Failures: ${failures}`);
	fs.writeFileSync(summary, lines.join('\n'));
	process.stdout.write(`Wrote ${path.relative(process.cwd(), summary)}\n`);
	process.exitCode = failures ? 1 : 0;
}

if(require.main===module) main();