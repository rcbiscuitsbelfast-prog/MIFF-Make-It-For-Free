// Sampler Main Entry (engine-agnostic, remix-safe)
// Zones: Synth Nexus (menu), routes to Toppler, Spirit Tamer, Witcher Grove, Remix Lab
// Modules used: modules/pure facades only

require('ts-node/register/transpile-only'); // allow TS facades
const fs = require('fs');

// Import facades
const { mapInputs } = require('../modules/pure/InputSystemPure.ts'); // facade to systems/InputSystemPure
const { runTimeline } = require('../modules/pure/QuestTimelinePure.ts'); // used for simple scene ticks

// Load scenarios (fixtures)
const paths = {
	toppler: require('path').resolve(__dirname, './scenarios/toppler.fixture.json'),
	spirit: require('path').resolve(__dirname, './scenarios/spirit_tamer.fixture.json'),
	witcher: require('path').resolve(__dirname, './scenarios/witcher_explorer.fixture.json')
};

function startZone(zoneName) {
	const zones = require('./zones');
	switch(zoneName){
		case 'toppler': return zones.toppler.startZone();
		case 'spirit_tamer': return zones.spirit_tamer.startZone();
		case 'witcher_grove': return zones.witcher_grove.startZone();
		case 'remix_lab': return zones.remix_lab.startZone();
		default: return zones.synth_nexus.startZone();
	}
}

function renderMenu(){
	// Engine-agnostic: Just log options as a placeholder UI
	console.log('[Synth Nexus] Select a zone: [1] Toppler  [2] Spirit Tamer  [3] Witcher Grove  [4] Remix Lab');
}

function start(){
	renderMenu();
	// Minimal input mapping placeholder
	const input = mapInputs([
		{ t: 0, type: 'key', key: '1' }
	], [
		{ type:'key', code:'1', action:'interact' }
	]);
	if(input.actions.length){ startZone('toppler'); } else { startZone('synth_nexus'); }
}

if(require.main===module){ start(); }

module.exports = { start, startZone };