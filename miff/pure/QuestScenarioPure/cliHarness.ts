#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { InputSanitizer } from '../shared/security/InputSanitizer.ts';

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
	const first = s.branches[0!];
	events.push({ type:'npcDialog', id:s.npcs[0!]?.id||'npc', choice:first.choice });
	const inv = { ...s.inventory };
	if(first.effect.inventory){ for(const k in first.effect.inventory) inv[k] = (inv[k]||0) + first.effect.inventory[k]! ; }
	const status = first.effect.statusEffect || null;
	const statuses = status ? [{ ...status }] : [];
	return { op:'runScenario', status:'ok', events, finalState:{ inventory:inv, statuses } };
}

function main(){
	// SECURITY: Validate all inputs
	const defaultScenarioPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'scenario.json');
	const scenarioPath = InputSanitizer.getSafeArg(2, {
		type: 'path',
		required: false,
		pattern: /\.json$/i,
		maxLength: 500
	}, defaultScenarioPath);
	
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
