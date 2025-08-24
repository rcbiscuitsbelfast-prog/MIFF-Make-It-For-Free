// Zone: Remix Lab - Inspect and toggle remix-safe features
// Purpose: Demonstrate engine-agnostic toggles and logging
// Modules: InputSystemPure, QuestTimelinePure (for simple deterministic ticks)

require('ts-node/register/transpile-only');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');
const { runTimeline } = require('../../modules/pure/QuestTimelinePure.ts');

function startZone(){
	const mapped = mapInputs([{ t:0, type:'key', key:'r' }], [{ type:'key', code:'r', action:'pause' }]);
	const tl = { id:'remix_lab', remixMode:true, events:[ { frame:0, op:'visual.item', args:{ type:'helmet.split' } } ] };
	const res = runTimeline(tl);
	console.log('[Remix Lab] mapped:', JSON.stringify(mapped.actions), 'timeline frames:', res.frames);
	return { status:'ok', zone:'remix_lab' };
}

module.exports = { startZone };