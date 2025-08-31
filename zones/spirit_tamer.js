// Zone: Spirit Tamer - Tame spirits via tap, track count, route back
// Purpose: Engine-agnostic sampler using Pure modules only
// Modules used:
// - InputSystemPure: map taps
// - CollisionSystemPure: detect overlap triggers (placeholder)
// - TimeSystemPure: animate fade via timers (placeholder)
// - UISystemPure: display spirit count + Back button
// - ZoneSystemPure: route back to synth_nexus

require('ts-node/register/transpile-only');
const path = require('path');
const fs = require('fs');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');
const { CollisionManager } = require('../../miff/pure/Manager');
const { TimeManager } = require('../../miff/pure/Manager');
const UI = require('../../modules/pure/UISystemPure.ts');
const { route } = require('../../modules/pure/ZoneSystemPure.ts');

function startZone(opts){
	// Load fixture if not provided
	const fixture = opts?.fixture || JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scenarios/spirit_tamer.fixture.json'), 'utf-8'));
	const spirits = new Set((fixture.dialogs ? [] : []).concat(['spirit_fox'])); // placeholder id list

	// Initialize systems
	const cm = new CollisionManager();
	cm.load([ { id:'spirit_fox', min:{ x:0, y:0 }, max:{ x:1, y:1 }, isTrigger:true } ]);
	const tm = new TimeManager();
	const input = mapInputs([{ t:0, type:'tap' }], [{ type:'tap', code:'screen', action:'interact' }]);

	let tamed = 0;
	let ui = UI.renderUI([
		UI.createButton('btn_back', '← Back to Synth Nexus', 'full')
	]);
	console.log('[Spirit Tamer] Ready. Spirits:', Array.from(spirits.values()));

	function onTap(targetId){
		if(targetId==='btn_back'){
			const r = route('spirit_tamer', 'synth_nexus');
			console.log('[Spirit Tamer] Route:', JSON.stringify(r.route));
			return r;
		}
		if(spirits.has(targetId)){
			// Simulate tame: start a small timer to "fade"
			tm.addTimer({ id:`fade_${targetId}`, duration:0.1, remaining:0.1 });
			tm.tick(0.1);
			tamed += 1;
			spirits.delete(targetId);
			ui = UI.renderUI([ UI.createButton('btn_back', `Tamed: ${tamed}  ← Back`, 'full') ]);
			console.log('[Spirit Tamer] Tamed', targetId, 'count=', tamed);
			return { op:'tame', status:'ok', id: targetId, tamed };
		}
		return { op:'noop', status:'ok' };
	}

	return { status:'ok', zone:'spirit_tamer', onTap };
}

module.exports = { startZone };