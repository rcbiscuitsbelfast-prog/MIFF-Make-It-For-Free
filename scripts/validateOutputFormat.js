#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function fail(msg){ console.error(`❌ validateOutputFormat: ${msg}`); process.exit(1); }
function ok(msg){ console.log(`✅ validateOutputFormat: ${msg}`); }

const file = process.argv[2];
const kind = process.argv[3] || 'scenario';
if(!file) fail('Usage: validateOutputFormat <output.json> [scenario|diff]');

const raw = fs.readFileSync(path.resolve(file), 'utf-8');
let json;
try{ json = JSON.parse(raw); }catch(e){ fail(`Invalid JSON: ${e.message}`); }

if(!json.outputs || !Array.isArray(json.outputs)) fail('Missing outputs[]');
const first = json.outputs[0];
if(!first || typeof first!=='object') fail('outputs[0] missing');
if(typeof first.op !== 'string') fail('Missing op');
if(typeof first.status !== 'string') fail('Missing status');
if(kind==='scenario'){
	if(!('events' in first) || !('finalState' in first)) fail('Scenario output must include events and finalState');
}
if(kind==='diff'){
	if(!('events' in first) || !('finalState' in first)) fail('Diff output must include events and finalState arrays');
}
ok(`valid ${kind} output`);