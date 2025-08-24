// Zone: Remix Lab - Contributor-facing debug zone
// Purpose: Test modules, toggle Remix Mode, simulate CLI golden validation
// Modules used: InputSystemPure, UISystemPure, ZoneSystemPure, RemixSystemPure, TestSystemPure

require('ts-node/register/transpile-only');
const path = require('path');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');
const UI = require('../../modules/pure/UISystemPure.ts');
const { route } = require('../../modules/pure/ZoneSystemPure.ts');
const Remix = require('../../modules/pure/RemixSystemPure.ts');
const Test = require('../../modules/pure/TestSystemPure.ts');

function startZone(opts){
	let remixMode = !!opts?.remixMode;
	const lastFixture = opts?.fixturePath || path.resolve(__dirname, '../scenarios/toppler.fixture.json');

	// Input map placeholder
	const input = mapInputs([{ t:0, type:'tap' }], [{ type:'tap', code:'screen', action:'interact' }]);

	function render(){
		const elements = [
			UI.createToggle('tgl_remix', 'Remix Mode', remixMode),
			UI.createButton('btn_replay', 'Replay Fixture', 'full'),
			UI.createButton('btn_golden', 'Run Golden Tests', 'full'),
			UI.createButton('btn_back', '← Back to Synth Nexus', 'full')
		];
		const frame = UI.renderUI(elements, remixMode);
		console.log('[Remix Lab] bg=remix_lab_bg.png overlay=', frame.debugOverlay);
		return frame;
	}

	let ui = render();

	function onTap(targetId){
		const act = UI.handleTap(ui.elements, targetId);
		if(act.kind==='toggle' && act.id==='tgl_remix'){
			remixMode = !!act.value;
			const state = Remix.toggle(remixMode);
			ui = render();
			console.log('[Remix Lab] Remix toggled:', state.state);
			return state;
		}
		if(act.kind==='button' && act.id==='btn_replay'){
			const res = Test.replayFixture(lastFixture);
			console.log('[Remix Lab] Replay:', res.fixture);
			return res;
		}
		if(act.kind==='button' && act.id==='btn_golden'){
			const res = Test.runGolden('sampler');
			console.log('[Remix Lab] Golden:', res.summary);
			return res;
		}
		if(act.kind==='button' && act.id==='btn_back'){
			const r = route('remix_lab', 'synth_nexus');
			console.log('[Remix Lab] Route:', JSON.stringify(r.route));
			return r;
		}
		return { op:'noop', status:'ok' };
	}

	return { status:'ok', zone:'remix_lab', onTap };
}

module.exports = { startZone };