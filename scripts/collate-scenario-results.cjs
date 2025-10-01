#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function main() {
	const date = process.env.DATE || new Date().toISOString().slice(0, 10);
	const resultsDir = path.resolve('docs/archive/test-results');
	const out = path.join(resultsDir, `${date}-scenarios-collated-report.txt`);

	const files = fs.readdirSync(resultsDir)
		.filter(f => /-results\.txt$/.test(f) && f.startsWith(date))
		.sort();

	const lines = [];
	lines.push(`# MIFF Scenario Runs - Collated Report ${date}`);
	lines.push(``);

	for (const file of files) {
		const p = path.join(resultsDir, file);
		const content = fs.readFileSync(p, 'utf8');
		const analysis = analyze(content);
		lines.push(`## ${file}`);
		lines.push(``);
		lines.push(content.trim());
		lines.push(``);
		lines.push(`Analysis:`);
		for (const a of analysis.findings) lines.push(`- ${a}`);
		lines.push(`Next Steps:`);
		for (const s of analysis.nextSteps) lines.push(`- ${s}`);
		lines.push(``);
	}

	fs.writeFileSync(out, lines.join('\n'));
	process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
}

function analyze(content) {
	const findings = [];
	const nextSteps = [];
	const status = extract(content, /^Status:\s*(\w+)/m);
	const missingFixture = /Missing fixture:/i.test(content);
	const stderrBlock = /Errors\/Stderr:/i.test(content);

	if (status === 'ok') {
		findings.push('Run status OK');
	} else {
		findings.push('Run reported errors');
		nextSteps.push('Inspect CLI output and stderr for errors');
	}

	if (missingFixture) {
		findings.push('Fixture missing');
		nextSteps.push('Create or correct fixture path in registry');
	}
	if (stderrBlock) {
		findings.push('Stderr present');
		nextSteps.push('Fix errors or missing hooks referenced in stderr');
	}
	if (/Modules Triggered:\s*unknown/i.test(content)) {
		findings.push('Modules triggered could not be inferred');
		nextSteps.push('Add explicit module mapping for this scenario');
	}

	if (nextSteps.length === 0) nextSteps.push('No action required');
	return { findings, nextSteps };
}

function extract(content, regex) {
	const m = content.match(regex);
	return m ? m[1] : '';
}

if (require.main === module) main();