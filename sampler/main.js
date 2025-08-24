// MIFF Sampler Entry (engine-agnostic, remix-safe)
// Modules: ZoneSystemPure, RemixSystemPure, InputSystemPure

require('ts-node/register/transpile-only');
const { load, route } = require('../modules/pure/ZoneSystemPure.ts');
const Remix = require('../modules/pure/RemixSystemPure.ts');
const { mapInputs } = require('../modules/pure/InputSystemPure.ts');

const zones = {
	synth_nexus: require('./zones/synth_nexus'),
	toppler: require('./zones/toppler'),
	spirit_tamer: require('./zones/spirit_tamer'),
	witcher_grove: require('./zones/witcher_grove'),
	remix_lab: require('./zones/remix_lab')
};

function startSampler(){
	// Initialize Remix Mode (default: off)
	let remix = false;
	console.log('[Sampler] Remix mode:', Remix.getState(remix));

	// Load Synth Nexus
	const loaded = load('synth_nexus');
	console.log('[Sampler] Loaded:', loaded.current);
	let current = 'synth_nexus';
	let zone = zones[current].startZone({ remix });

	// Wire routing via menu tap handler
	function handleTapInSynthNexus(targetId){
		const r = zone.onTap ? zone.onTap(targetId) : { op:'noop' };
		if(r && r.op==='zone.route'){
			current = r.route.to;
			zone = zones[current].startZone({ remix });
			console.log('[Sampler] Switched zone ->', current);
		}
	}

	// Placeholder: simulate tapping Toppler from menu
	handleTapInSynthNexus('btn_toppler');

	return { status:'ok', remix, current, zone, setRemix: (on)=>{ remix = !!on; console.log('[Sampler] Remix:', Remix.getState(remix)); } };
}

module.exports = { startSampler };