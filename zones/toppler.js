// Zone: Toppler - Physics Puzzle Sampler
// Purpose: Engine-agnostic physics blocks with collision detection and back navigation
// Modules used:
// - PhysicsSystemPure: integrate simple world
// - CollisionSystemPure: detect AABB overlaps
// - ZoneSystemPure: pure routing back to synth_nexus
// - UISystemPure: full-screen back button
// - InputSystemPure: touch input mapping + cursor on load

require('ts-node/register/transpile-only');
const path = require('path');
const fs = require('fs');
const { PhysicsManager } = require('../../PhysicsSystemPure/Manager');
const { CollisionManager } = require('../../CollisionSystemPure/Manager');
const { route } = require('../../modules/pure/ZoneSystemPure.ts');
const UI = require('../../modules/pure/UISystemPure.ts');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');

function loadScenario(){
	const p = path.resolve(__dirname, '../scenarios/toppler.fixture.json');
	return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function startZone(){
	// 1) Load scenario + init physics
	const world = loadScenario();
	const physics = new PhysicsManager();
	physics.load(world);

	// 2) Spawn puzzle blocks into collision manager
	const coll = new CollisionManager();
	const blocks = [
		{ id:'player', min:{ x:0, y:0 }, max:{ x:1, y:1 } },
		{ id:'block_1', min:{ x:1, y:0 }, max:{ x:2, y:1 } },
		{ id:'block_2', min:{ x:2, y:0 }, max:{ x:3, y:1 } }
	];
	coll.load(blocks);

	// 3) Enable touch input + cursor
	const input = mapInputs([{ t:0, type:'tap' }], [{ type:'tap', code:'screen', action:'interact' }]);
	const cursor = 'visible';

	// 4) Run basic physics tick loop (single step for scaffold)
	const step = physics.step(0.016);

	// 5) Detect collisions and log
	const check = coll.check();
	console.log('[Toppler] collisions:', JSON.stringify(check, null, 2));

	// 6) UI back button to return to Synth Nexus
	const ui = UI.renderUI([ UI.createButton('btn_back', '← Back to Synth Nexus', 'full') ]);
	console.log('[Toppler] UI:', JSON.stringify(ui, null, 2));
	function onTap(targetId){
		const act = UI.handleTap(ui.elements, targetId);
		if(act.kind==='button' && act.id==='btn_back'){
			const r = route('toppler', 'synth_nexus');
			console.log('[Toppler] Route:', JSON.stringify(r.route));
			return r;
		}
		return { op:'noop', status:'ok' };
	}

	return { status:'ok', zone:'toppler', onTap };
}

module.exports = { startZone };