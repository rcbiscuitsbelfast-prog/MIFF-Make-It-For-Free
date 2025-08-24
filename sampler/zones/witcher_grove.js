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
	const dialogDef = fixture.dialog ? { dialogs: [fixture.dialog] } : { dialogs: [] };
	if(dialogDef.dialogs.length){ dialog.loadFromObject(dialogDef); }
	let questState = (fixture.initialState && fixture.initialState.questState) || fixture.questState || {
		quests:{}, activeQuests:[], completedQuests:[], failedQuests:[], playerStats:{ level:1, xp:0, inventory:{}, location:{x:0,y:0}, reputation:{} }
	};
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

	// UI: background and buttons (support both asset shapes)
	const assets = fixture.assets || {};
	const bg = assets.background || fixture.background || 'witcher_grove_bg.png';
	const btnAccept = (assets.buttons && assets.buttons.accept) || (fixture.sprites && fixture.sprites.btnAccept) || 'btn_accept_quest.png';
	const btnBack = (assets.buttons && assets.buttons.back) || (fixture.sprites && fixture.sprites.btnBack) || 'btn_back.png';
	const npcIdle = (assets.sprites && assets.sprites.npcIdle) || (fixture.sprites && fixture.sprites.npcIdle) || 'npc_witcher_idle.png';

	let ui = UI.renderUI([
		UI.createButton('btn_accept_quest', 'Accept Quest', 'full', btnAccept),
		UI.createButton('btn_back', '← Back', 'full', btnBack)
	]);
	console.log('[Witcher Grove] Background:', bg, 'NPC:', npcIdle);

	function onTap(targetId){
		if(targetId==='btn_back'){
			const r = route('witcher_grove', 'synth_nexus');
			console.log('[Witcher Grove] Route:', JSON.stringify(r.route));
			return r;
		}
		if(targetId==='npc_witcher'){
			if(dialogDef.dialogs.length){
				const res = dialog.simulateDialog('witcher_intro');
				console.log('[Witcher Grove] Dialog run:', JSON.stringify(res.log));
				return { op:'dialog', status:'ok' };
			}
			console.log('[Witcher Grove] No dialog defined in fixture.');
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