// Zone: Spirit Tamer - Minimal dialogue and interaction sampler
// Purpose: Demonstrate dialogue progression and simple input mapping
// Modules: DialogSim (DialogPure), InputSystemPure

require('ts-node/register/transpile-only');
const path = require('path');
const fs = require('fs');
const { DialogSim } = require('../../DialogPure/DialogSim');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');

function loadScenario(){
	const p = path.resolve(__dirname, '../scenarios/spirit_tamer.fixture.json');
	return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function startZone(){
	const data = loadScenario();
	const sim = new DialogSim();
	sim.loadFromObject(data);
	const result = sim.simulateDialog(data.dialogs[0].id);
	const input = mapInputs([{ t:0, type:'key', key:'e' }], [{ type:'key', code:'e', action:'interact' }]);
	console.log('[Spirit Tamer] dialog:', JSON.stringify({ result, actions: input.actions }, null, 2));
	return { status:'ok', zone:'spirit_tamer' };
}

module.exports = { startZone };