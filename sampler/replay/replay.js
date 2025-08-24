import { createRemixOverlay, renderReplayUI } from './remix_overlay.js';

const $ = (id) => document.getElementById(id);

function logLine(text){ const el = $('log'); if(el) el.textContent += text + '\n'; else console.log(text); }
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function loadFixture(zone){
	const url = `./zones/${zone}.json`;
	const res = await fetch(url);
	if(!res.ok) throw new Error(`Failed to load fixture ${url}`);
	return res.json();
}

async function importZone(zone){
	const url = `../zones/${zone}/index.js`;
	return import(url);
}

function deepEqual(a, b){ return JSON.stringify(a) === JSON.stringify(b); }

async function runReplay(zone){
	if($('log')) $('log').textContent = '';
	try{
		const fx = await loadFixture(zone);
		const mod = await importZone(zone);
		const reducer = mod && mod.default;
		if(typeof reducer !== 'function') throw new Error('Zone default export is not a reducer');
		logLine(`Running fixture: ${fx.scenario?.id || 'unknown'} for zone: ${zone}`);
		let state = undefined;
		for(const step of fx.steps || []){
			state = await reducer({ state, action: step.action, data: step.data });
			if(step.delayMs) await sleep(step.delayMs);
		}
		const pass = deepEqual(state, fx.expected);
		logLine(pass? 'RESULT: PASS' : 'RESULT: FAIL');
		if(!pass){
			logLine('Expected:');
			logLine(JSON.stringify(fx.expected, null, 2));
			logLine('Got:');
			logLine(JSON.stringify(state, null, 2));
			// Show Remix overlay with tabs
			renderReplayUI();
			const overlay = createRemixOverlay({ zone, scenario: fx.scenario, actual: state, expected: fx.expected });
			overlay.show();
			// Attach Remix button to rerun with editor reducer (no eval for security; just logs code for now)
			overlay.onRunWithEditor(({ reducerCode })=>{
				console.log('Editor reducer code captured (save locally to apply):\n', reducerCode);
			});
		}
		return { zone, id: fx.scenario?.id || 'unknown', pass };
	}catch(err){
		logLine(`ERROR: ${err.message}`);
		return { zone, id: 'error', pass: false };
	}
}

// Browser UI
if(typeof window !== 'undefined'){
	$('run')?.addEventListener('click', async ()=>{
		const zone = $('zone').value;
		const res = await runReplay(zone);
		logLine(`Summary: ${res.zone}#${res.id} -> ${res.pass? 'ok':'fail'}`);
	});
}

export async function runAll(zones){
	const results = [];
	for(const z of zones) results.push(await runReplay(z));
	const anyFail = results.some(r=>!r.pass);
	if(typeof process !== 'undefined' && process?.exit){ process.exit(anyFail? 1: 0); }
	return results;
}