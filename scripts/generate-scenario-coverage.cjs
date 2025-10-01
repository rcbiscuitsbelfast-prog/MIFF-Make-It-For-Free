#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readLines(p){ try { return fs.readFileSync(p,'utf8').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);} catch{ return []; } }

function main(){
	const date = process.env.DATE || new Date().toISOString().slice(0,10);
	const outDir = path.resolve('docs/archive/test-results');
	if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
	const out = path.join(outDir, `${date}-scenario-coverage-report.txt`);

	const results = fs.readdirSync(outDir).filter(f => f.startsWith(date) && f.endsWith('-scenario-results.txt'));
	const testedModules = new Set();
	let ok = 0, total = 0, cliTriggered = 0;

	for(const f of results){
		const txt = fs.readFileSync(path.join(outDir,f),'utf8');
		const m = txt.match(/^Modules:\s*(.*)$/m);
		if(m){ m[1].split(',').map(s=>s.trim()).forEach(x=>testedModules.add(x)); }
		const statuses = txt.match(/^Status:\s*(\w+)/gm) || [];
		for(const s of statuses){ total++; if(/ok$/i.test(s)) ok++; }
		const cmds = (txt.match(/^\- npx.*$/gm) || []).length;
		cliTriggered += cmds;
	}

	const base = path.resolve('docs/archive/test-results');
	const all = new Set([...readLines(path.join(base,'realModules.txt')), ...readLines(path.join(base,'scaffoldedModules.txt')).map(l=>l.split(/[\\\/]/).pop()).filter(Boolean)]);
	const broken = new Set(readLines(path.join(base,'brokenModules.txt')));
	const skipped = [...all].filter(m => !testedModules.has(m) && !broken.has(m));

	const lines = [];
	lines.push(`# Scenario Coverage ${date}`);
	lines.push(`Total modules tested: ${testedModules.size}`);
	lines.push(`Scenarios generated: ${results.length}`);
	lines.push(`CLI harnesses triggered: ${cliTriggered}`);
	lines.push(`Integration success rate: ${total ? Math.round((ok/total)*100) : 0}% (${ok}/${total})`);
	lines.push(`Modules skipped: ${skipped.length}`);
	for(const m of skipped) lines.push(`- ${m}`);

	fs.writeFileSync(out, lines.join('\n'));
	process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
}

if(require.main===module) main();