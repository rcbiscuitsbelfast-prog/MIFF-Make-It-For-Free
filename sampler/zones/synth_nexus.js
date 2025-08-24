// Zone: Synth Nexus - Menu hub and router
// Purpose: Provide simple UI buttons to navigate to other zones
// Modules: InputSystemPure for mapping button presses (engine-agnostic placeholder)

require('ts-node/register/transpile-only');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');

function startZone(){
	console.log('[Synth Nexus] Welcome. Use 1/2/3/4 to select a zone.');
	const mapped = mapInputs(
		[{ t:0, type:'key', key:'1' }],
		[
			{ type:'key', code:'1', action:'interact' },
			{ type:'key', code:'2', action:'interact' },
			{ type:'key', code:'3', action:'interact' },
			{ type:'key', code:'4', action:'interact' }
		]
	);
	console.log('[Synth Nexus] mapped:', JSON.stringify(mapped.actions));
	return { status:'ok', zone:'synth_nexus' };
}

module.exports = { startZone };