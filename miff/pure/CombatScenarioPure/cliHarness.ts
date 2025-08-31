#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';

type Scenario = {
	schema: 'v13';
	name: string;
	arena: { enemies:{ id:string; hp:number; atk:number; def:number }[] };
	loot: { tableId:string };
	progression: { xpPerWin:number };
};

type Output = { op:'runScenario'|'dumpScenario'; status:'ok'|'error'; events:any[]; finalState:any };

function runScenario(s:Scenario): Output {
	const events:any[]=[];
	let xp = 0;
	for(const e of s.arena.enemies){
		const damage = Math.max(1, 7 - e.def);
		events.push({ type:'combat', attacker:'hero', defender:e.id, damage, victory:true });
		xp += s.progression.xpPerWin;
		events.push({ type:'loot', from:e.id, drops:[ { id:'coin', rarity:'common' } ] });
	}
	const finalState = { hero:{ xp }, inventory: { coin: s.arena.enemies.length } };
	return { op:'runScenario', status:'ok', events, finalState };
}

function main(){
	const scenarioPath = process.argv[2] || 'CombatScenarioPure/scenario.json';
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