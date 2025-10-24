#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { InputSanitizer } from '../shared/security/InputSanitizer.js';

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
	}
	const loot = { itemId:`loot_${s.loot.tableId}`, quantity:1 };
	events.push({ type:'loot', ...loot });
	return { op:'runScenario', status:'ok', events, finalState:{ xp, loot } };
}

function main(){
	// SECURITY: Validate all inputs
	const scenarioPath = InputSanitizer.getSafeArg(2, {
		type: 'path',
		required: false,
		pattern: /\.json$/i,
		maxLength: 500
	}, 'CombatScenarioPure/sample_arena.json');
	
	const commandArg = InputSanitizer.getSafeArg(3, {
		type: 'string',
		required: false,
		pattern: /^(run|dump|.*\.json)$/i,
		maxLength: 500
	}, '');
	
	const scenario: Scenario = JSON.parse(fs.readFileSync(path.resolve(scenarioPath), 'utf-8'));
	type Cmd = {op:'runScenario'}|{op:'dumpScenario'};
	const cmds:Cmd[] = commandArg && commandArg.endsWith('.json')
		? JSON.parse(fs.readFileSync(path.resolve(commandArg),'utf-8')) 
		: commandArg === 'dump'
			? [{op:'dumpScenario'}]
			: [{op:'runScenario'}];
	const outputs: Output[]=[];
	for(const c of cmds){
		if(c.op==='runScenario') outputs.push(runScenario(scenario));
		else if(c.op==='dumpScenario') outputs.push({op:'dumpScenario', status:'ok', events:[], finalState:scenario});
	}
	console.log(JSON.stringify({outputs},null,2));
}
if(import.meta.url===`file://${process.argv[1!]}`) main();
