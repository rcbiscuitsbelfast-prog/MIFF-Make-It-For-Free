// Zone: Witcher Grove - Quiet forest clearing with ambient mist
// Purpose: Engine-agnostic, remix-safe zone using Pure modules only
// Modules used:
// - InputSystemPure: map taps
// - DialogPure: run dialogue tree 'witcher_intro'
// - QuestSystemPure: update quest state on accept
// - CollisionSystemPure: placeholder AABB for NPC interaction
// - TimeSystemPure: timers for ambient pacing
// - UISystemPure: render buttons (accept quest, back) and background sprite refs
// - ZoneSystemPure: route back to synth_nexus

require('ts-node/register/transpile-only');
const path = require('path');
const fs = require('fs');
const { mapInputs } = require('../../modules/pure/InputSystemPure.ts');
const { DialogSim } = require('../../DialogPure/DialogSim');
const { applyQuestEvent, createQuest } = require('../../modules/pure/QuestSystemPure.ts');
const { CollisionManager } = require('../../CollisionSystemPure/Manager');
const { TimeManager } = require('../../TimeSystemPure/Manager');
const UI = require('../../modules/pure/UISystemPure.ts');
const { route } = require('../../modules/pure/ZoneSystemPure.ts');

function startZone(opts){
	const fixturePath = path.resolve(__dirname, '../scenarios/witcher_grove.fixture.json');
	const fixture = opts?.fixture || JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

	// Systems init
	const input = mapInputs([{ t:0, type:'tap' }], [{ type:'tap', code:'screen', action:'interact' }]);
	const dialog = new DialogSim();
	dialog.loadFromObject({ dialogs: [fixture.dialog] });
	let questState = fixture.questState;
	// Ensure quest exists in state for start event
	const qId = 'find_griffin_feather';
	if(!questState.quests[qId]){
		questState.quests[qId] = createQuest(qId, 'Find Griffin Feather', 'Collect a feather for the Witcher', [
			{ id:'step_1', description:'Accept the quest', triggers:[{ type:'interact', target:'witcher', completed:false }], completed:false, requiredTriggers:1 }
		], 'step_1', [ { type:'xp', amount:10 } ]);
	}
	const coll = new CollisionManager();
	coll.load([ { id:'npc_witcher', min:{ x:0, y:0 }, max:{ x:1, y:2 }, isTrigger:true } ]);
	const time = new TimeManager();

	// UI: background and buttons
	let ui = UI.renderUI([
		UI.createButton('btn_accept_quest', 'Accept Quest', 'full', fixture.sprites.btnAccept),
		UI.createButton('btn_back', '← Back', 'full', fixture.sprites.btnBack)
	]);
	console.log('[Witcher Grove] Background:', fixture.background, 'NPC:', fixture.sprites.npcIdle);

	function onTap(targetId){
		if(targetId==='btn_back'){
			const r = route('witcher_grove', 'synth_nexus');
			console.log('[Witcher Grove] Route:', JSON.stringify(r.route));
			return r;
		}
		if(targetId==='npc_witcher'){
			const res = dialog.simulateDialog('witcher_intro');
			console.log('[Witcher Grove] Dialog run:', JSON.stringify(res.log));
			return { op:'dialog', status:'ok' };
		}
		if(targetId==='btn_accept_quest'){
			// Update quest state deterministically
			const event = { type:'start', questId:qId, timestamp: time.now? time.now(): 0 };
			const result = applyQuestEvent(questState, event);
			questState = result.questState;
			console.log('[Witcher Grove] Quest started:', qId);
			return { op:'quest', status:'ok', id:qId };
		}
		return { op:'noop', status:'ok' };
	}

	return { status:'ok', zone:'witcher_grove', onTap };
}

module.exports = { startZone };