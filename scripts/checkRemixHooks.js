#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const strict = process.argv.includes('--strict');
const repos = fs.readdirSync(root, { withFileTypes: true }).filter(d=>d.isDirectory());

let missing = [];
for(const d of repos){
	const readmePath = path.join(root, d.name, 'README.md');
	if(!fs.existsSync(readmePath)) continue;
	const txt = fs.readFileSync(readmePath,'utf-8').toLowerCase();
	if(txt.includes('remix hook') || txt.includes('remix hooks') || txt.includes('override')) continue;
	missing.push(d.name);
}
if(missing.length){
	console.log(`⚠️ Missing remix hooks mention in: ${missing.join(', ')}`);
	if(strict) process.exit(1);
	process.exit(0);
}else{
	console.log('✅ Remix hooks present in module READMEs');
}