#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';

function parseArgs(argv:string[]){
	const args:{scenario?:string; verbose?:boolean; seed?:string; dump?:boolean} = {};
	for(let i=2;i<argv.length;i++){
		const a=argv[i];
		if(a==='--verbose') args.verbose=true;
		else if(a==='--dump-state') args.dump=true;
		else if(a==='--seed'){ args.seed=argv[++i]; }
		else if(!args.scenario){ args.scenario=a; }
	}
	return args;
}

type Scenario = any;

type Output = { op:'runScenario'|'dumpScenario'; status:'ok'|'error'; events:any[]; finalState:any };

function simulate(s:Scenario, seed?:string): Output {
	// For now deterministic; seed reserved for future RNG hooks
	const name = s.name||'Scenario';
	const events:any[] = [{ type:'scenarioStarted', name }];
	return { op:'runScenario', status:'ok', events, finalState:s };
}

function main(){
	const args = parseArgs(process.argv);
	const scenarioPath = args.scenario || 'TutorialScenarioPure/scenario.json';
	const j = JSON.parse(fs.readFileSync(path.resolve(scenarioPath),'utf-8')) as Scenario;
	if(args.dump){
		console.log(JSON.stringify({ outputs:[{ op:'dumpScenario', status:'ok', events:[], finalState:j }]}, null, 2));
		return;
	}
	const out = simulate(j, args.seed);
	if(args.verbose) console.error(`[miff-simulate] ${out.status} ${out.op}`);
	console.log(JSON.stringify({ outputs:[out] }, null, 2));
}
if(require.main===module) main();