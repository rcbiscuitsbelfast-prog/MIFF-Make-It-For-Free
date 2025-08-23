#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';

type Scenario = {
	schema: 'v13';
	name: string;
	npcs: { id:string; }[];
	inventory: Record<string, number>;
	branches: { choice:string; effect:{ inventory?: Record<string,number>; statusEffect?: { type:string; magnitude:number } } }[];
};

type Output = { op:'runScenario'|'dumpScenario'; status:'ok'|'error'; events:any[]; finalState:any };

function runScenario(s:Scenario): Output {
	const events:any[]=[];
	// deterministic branch: pick first choice
	const first = s.branches[0];
	events.push({ type:'npcDialog', id:s.npcs[0]?.id||'npc', choice:first.choice });
	const inv = { ...s.inventory };
	for(const [k,v] of Object.entries(first.effect.inventory||{})) inv[k] = (inv[k]||0)+v;
	if(first.effect.statusEffect) events.push({ type:'statusApplied', to:'hero', effect:first.effect.statusEffect });
	const finalState = { inventory: inv, statuses: first.effect.statusEffect?[first.effect.statusEffect]:[] };
	return { op:'runScenario', status:'ok', events, finalState };
}

function main(){
	const scenarioPath = process.argv[2] || 'QuestScenarioPure/scenario.json';
	const cmd = process.argv[3] || 'run';
	const s = JSON.parse(fs.readFileSync(path.resolve(scenarioPath),'utf-8')) as Scenario;
	if(cmd==='dump'){
		console.log(JSON.stringify({ outputs:[{ op:'dumpScenario', status:'ok', events:[], finalState:s }]},null,2));
		return;
	}
	const out = runScenario(s);
	console.log(JSON.stringify({ outputs:[out] }, null, 2));
}
if(require.main===module) main();