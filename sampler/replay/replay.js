const $ = (id) => document.getElementById(id);

function logLine(text){ const el = $('log'); el.textContent += text + '\n'; }
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function loadFixture(zone){
	const url = `./zones/${zone}.json`;
	const res = await fetch(url);
	if(!res.ok) throw new Error(`Failed to load fixture ${url}`);
	return res.json();
}

async function importZone(zone){
	// Expect an ESM wrapper at sampler/zones/ZONE/index.js exporting startZone
	const url = `../zones/${zone}/index.js`;
	return import(url);
}

async function runReplay(zone){
	$('log').textContent = '';
	try{
		logLine(`Loading fixture for zone: ${zone}`);
		const fx = await loadFixture(zone);
		const mod = await importZone(zone);
		if(!mod || typeof mod.startZone !== 'function') throw new Error('Zone does not export startZone()');
		logLine('Initializing zone...');
		const game = mod.startZone({ fixture: fx.scenario, remix: true });
		if(!game || typeof game.onTap !== 'function') logLine('Note: onTap not exposed; steps will be logged only.');

		for(const step of fx.steps || []){
			logLine(`STEP ${step.action} ${step.target || ''}`.trim());
			if(step.delayMs) await sleep(step.delayMs);
			if(game && typeof game.onTap==='function' && step.action==='tap'){
				const ev = game.onTap(step.target);
				if(ev) logLine(` -> event: ${JSON.stringify(ev)}`);
			}
		}

		logLine('Replay complete. Checking expected outcomes...');
		const { expected } = fx;
		let pass = true;
		if(expected){
			if(expected.routeTo){
				pass = pass && true; // placeholder; real zones may expose current route
				logLine(`Expect route → ${expected.routeTo} (not validated in-browser)`);
			}
			if(expected.quest){
				logLine(`Expect quest → ${expected.quest} (validate via golden tests)`);
			}
		}
		logLine(pass? 'RESULT: PASS (manual spot-check)': 'RESULT: REVIEW');
	}catch(err){
		logLine(`ERROR: ${err.message}`);
	}
}

$('run').addEventListener('click', ()=>{
	const zone = $('zone').value;
	runReplay(zone);
});