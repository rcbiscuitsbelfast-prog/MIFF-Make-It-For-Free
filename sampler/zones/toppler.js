// Zone: Toppler - Minimal platformer-like sampler
// Purpose: Demonstrate physics ticks and input mapping
// Modules: PhysicsManager (PhysicsSystemPure facade), InputSystemPure, Dialogue optional

require('ts-node/register/transpile-only');
const path = require('path');
const fs = require('fs');
const { PhysicsManager } = require('../../PhysicsSystemPure/Manager'); // Using existing physics class (remix-safe)
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts'); // facade import

function loadScenario(){
	const p = path.resolve(__dirname, '../scenarios/toppler.fixture.json');
	return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function sceneTick(physics, dt){
	return physics.step(dt);
}

function startZone(){
	const world = loadScenario();
	const physics = new PhysicsManager();
	physics.load(world);
	const input = mapInputs([{ t:0, type:'key', key:'space' }], [{ type:'key', code:'space', action:'jump' }]);
	const step = sceneTick(physics, 0.016);
	console.log('[Toppler] tick:', JSON.stringify({ actions: input.actions, step }, null, 2));
	return { status:'ok', zone:'toppler' };
}

module.exports = { startZone };