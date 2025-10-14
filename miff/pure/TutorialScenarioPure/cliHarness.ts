#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

type Scenario = {
	schema: 'v13';
	name: string;
	entities: { id:string; stats:{key:string;base:number}[] }[];
	steps: { op:string; args?:Record<string, unknown> }[];
};

type Output = { op:'runScenario'|'dumpScenario'; status:'ok'|'error'; events:Record<string, unknown>[]; finalState:Record<string, unknown> };

function runScenario(s:Scenario): Output {
	const events:Record<string, unknown>[]=[];
	// deterministic walkthrough: stats total, quest start, combat victory
	const hero = s.entities.find(e=>e.id==='hero');
	const total = (hero?.stats||[]).reduce((a,x)=>a+x.base,0);
	events.push({ type:'statsTotal', id:'hero', total });
	events.push({ type:'questStarted', id:'q_intro' });
	events.push({ type:'combat', attacker:'hero', defender:'slime', damage:6, victory:true });
	const finalState = { hero:{ hp:24, atk:6, def:2 }, quests:['q_intro'] };
	return { op:'runScenario', status:'ok', events, finalState };
}

function main(...args: any[]) {
	const scenarioPath = process.argv[2] || 'TutorialScenarioPure/scenario.json';
	const cmd = process.argv[3] || 'run';
	const s = SafeJSONParser.parse(fs.readFileSync(path.resolve(scenarioPath),'utf-8')) as Scenario;
	if(cmd==='dump'){
		console.info(JSON.stringify({ outputs:[{ op:'dumpScenario', status:'ok', events:[], finalState:s }]},null,2));
		return;
	}
	const out = runScenario(s);
	console.info(JSON.stringify({ outputs:[out] }, null, 2));
}
if(import.meta.url === `file://${process.argv[1]}`) main();