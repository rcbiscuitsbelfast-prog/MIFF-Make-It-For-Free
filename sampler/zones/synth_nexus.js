// Zone: Synth Nexus - Main Menu for MIFF Sampler
// Purpose: Engine-agnostic, remix-safe menu hub with touch input and routing
// Modules used:
// - InputSystemPure: enable touch mapping and cursor state on load
// - UISystemPure: render full-screen buttons + Remix Mode toggle
// - ZoneSystemPure: pure routing to target zones

require('ts-node/register/transpile-only');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');
const UI = require('../../modules/pure/UISystemPure.ts');
const { route } = require('../../modules/pure/ZoneSystemPure.ts');

function buildMenu(remixMode){
	return [
		UI.createButton('btn_toppler', '🧱 Toppler Puzzle', 'full'),
		UI.createButton('btn_spirit', '🐉 Spirit Tamer Combat', 'full'),
		UI.createButton('btn_witcher', '🧙 Witcher Grove Narrative', 'full'),
		UI.createButton('btn_remix', '🧪 Remix Lab', 'full'),
		UI.createToggle('tgl_remix', 'Remix Mode', !!remixMode)
	];
}

function startZone(opts){
	// 1) Touch input + cursor on load
	const mapped = mapInputs(
		[{ t:0, type:'tap' }], // touch event placeholder
		[{ type:'tap', code:'screen', action:'interact' }]
	);
	const cursor = 'visible';

	// 2) Render UI buttons + toggle
	let remixMode = !!(opts?.remix || opts?.remixMode);
	let uiElements = buildMenu(remixMode);
	const uiFrame = UI.renderUI(uiElements, remixMode);
	console.log('[Synth Nexus] UI frame:', JSON.stringify({ cursor, ui: uiFrame }, null, 2));

	// 3) Routing via ZoneSystemPure on tap (placeholder tap targets)
	function onTap(targetId){
		const act = UI.handleTap(uiElements, targetId);
		if(act.kind === 'toggle' && act.id === 'tgl_remix'){
			remixMode = !!act.value;
			uiElements = buildMenu(remixMode);
			const frame = UI.renderUI(uiElements, remixMode);
			console.log('[Synth Nexus] Remix toggled:', remixMode, 'frame.debugOverlay=', frame.debugOverlay);
			return { op:'ui', status:'ok' };
		}
		if(act.kind === 'button'){
			let target = 'synth_nexus';
			if(act.id==='btn_toppler') target = 'toppler';
			if(act.id==='btn_spirit') target = 'spirit_tamer';
			if(act.id==='btn_witcher') target = 'witcher_grove';
			if(act.id==='btn_remix') target = 'remix_lab';
			const r = route('synth_nexus', target);
			console.log('[Synth Nexus] Route:', JSON.stringify(r.route));
			return r;
		}
		return { op:'noop', status:'ok' };
	}

	// 6) Expose handler for menu interactions
	return { status:'ok', zone:'synth_nexus', onTap };
}

module.exports = { startZone };