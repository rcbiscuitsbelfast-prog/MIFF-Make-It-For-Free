#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function summarize(label, file){
	const p = path.resolve(file);
	if(!fs.existsSync(p)) return `- ${label}: (no file)`;
	const j = JSON.parse(fs.readFileSync(p,'utf-8'));
	const out = j.outputs && j.outputs[0] || {};
	return `- **${label}**: status=${out.status||'n/a'}, op=${out.op||'n/a'}`;
}

const lines = [];
lines.push('### MIFF CI Summary');
for(const [label,file] of [['Simulate',process.argv[2]],['Diff',process.argv[3]],['Init',process.argv[4]]]){
	if(file) lines.push(summarize(label, file));
}
console.log(lines.join('\n'));