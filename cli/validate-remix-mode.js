#!/usr/bin/env node

// validate-remix-mode: Ensure zones support Remix Mode (remix-safe)
// Modules: RemixSystemPure, UISystemPure, ZoneSystemPure, TestSystemPure

require('ts-node/register/transpile-only');
const fs = require('fs');
const path = require('path');
const Remix = require('../modules/pure/RemixSystemPure.ts');
const Zone = require('../modules/pure/ZoneSystemPure.ts');
const Test = require('../modules/pure/TestSystemPure.ts');

function listZones(dir){
	return fs.readdirSync(dir)
		.filter(f=>f.endsWith('.js'))
		.filter(f=>f!=='index.js')
		.map(f=>({ id: path.basename(f, '.js'), file: path.resolve(dir, f) }));
}

function loadZoneModule(zoneId){
	const map = {
		synth_nexus: '../zones/synth_nexus',
		toppler: '../zones/toppler',
		spirit_tamer: '../zones/spirit_tamer',
		witcher_grove: '../zones/witcher_grove',
		remix_lab: '../zones/remix_lab'
	};
	try { return require(map[zoneId] || `../zones/${zoneId}`); } catch { return null; }
}

function captureLogs(fn){
	const logs = [];
	const orig = console.log;
	console.log = (...args)=>{ logs.push(args.map(a=> String(a)).join(' ')); orig.apply(console, args); };
	try { fn(); } finally { console.log = orig; }
	return logs.join('\n');
}

function checkOverlayFromLogs(logs){
	return logs.includes('overlay= true') || logs.includes('"debugOverlay": true');
}

function run(){
	const zonesDir = path.resolve(__dirname, '../zones');
	const zones = listZones(zonesDir);
	const results = [];
	let anyFail = false;

	for(const z of zones){
		const mod = loadZoneModule(z.id);
		if(!mod || typeof mod.startZone !== 'function'){
			results.push({ Zone:z.id, Pass:false, Details:'startZone() not found' });
			anyFail = true; continue;
		}
		let logs = captureLogs(()=>{ mod.startZone({ remix:true }); });
		const overlay = checkOverlayFromLogs(logs);
		let triggersOk = true;
		if(z.id === 'remix_lab'){
			const app = mod.startZone({ remix:true });
			const r1 = app.onTap && app.onTap('btn_replay');
			const r2 = app.onTap && app.onTap('btn_golden');
			triggersOk = !!(r1 && r1.op==='test.replay' && r2 && r2.op==='test.golden');
		}
		let pass = true;
		let details = [];
		if(z.id === 'synth_nexus' || z.id === 'remix_lab'){
			if(!overlay){ pass = false; details.push('overlay missing'); }
		}
		if(z.id === 'remix_lab' && !triggersOk){ pass = false; details.push('CLI triggers missing'); }
		if(!details.length) details = ['ok'];
		results.push({ Zone:z.id, Pass:pass, Details:details.join('; ') });
		if(!pass) anyFail = true;
	}

	console.log('\nRemix Mode Summary');
	console.table(results);
	if(anyFail){
		console.error('One or more zones failed Remix Mode validation.');
		process.exit(1);
	}
	process.exit(0);
}

if(require.main===module){ run(); }