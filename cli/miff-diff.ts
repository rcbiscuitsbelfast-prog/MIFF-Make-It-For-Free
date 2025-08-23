#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';

type RunOutput = { outputs: [ { op:string; status:string; events?:any[]; finalState?:any } ] };

type Diff = { op:'diff'; status:'ok'; events:{ index:number; left?:any; right?:any }[]; finalState:{ path:string; left?:any; right?:any }[] };

function diffEvents(a:any[] = [], b:any[] = []): { index:number; left?:any; right?:any }[]{
	const max = Math.max(a.length, b.length);
	const diffs:any[]=[];
	for(let i=0;i<max;i++){
		const l=a[i], r=b[i];
		if(JSON.stringify(l)!==JSON.stringify(r)) diffs.push({ index:i, left:l, right:r });
	}
	return diffs;
}

function diffObjects(a:any={}, b:any={}, prefix=''): { path:string; left?:any; right?:any }[]{
	const keys = Array.from(new Set([...Object.keys(a||{}), ...Object.keys(b||{})])).sort();
	const diffs:any[]=[];
	for(const k of keys){
		const pa = a?.[k], pb = b?.[k];
		const p = prefix? `${prefix}.${k}`:k;
		if(pa && typeof pa==='object' && pb && typeof pb==='object') diffs.push(...diffObjects(pa,pb,p));
		else if(JSON.stringify(pa)!==JSON.stringify(pb)) diffs.push({ path:p, left:pa, right:pb });
	}
	return diffs;
}

function main(){
	const left = process.argv[2];
	const right = process.argv[3];
	if(!left || !right){ console.error('usage: miff-diff <left.json> <right.json>'); process.exit(2); }
	const l = JSON.parse(fs.readFileSync(path.resolve(left),'utf-8')) as RunOutput;
	const r = JSON.parse(fs.readFileSync(path.resolve(right),'utf-8')) as RunOutput;
	const le = l.outputs[0]?.events||[];
	const re = r.outputs[0]?.events||[];
	const lf = l.outputs[0]?.finalState||{};
	const rf = r.outputs[0]?.finalState||{};
	const diff:Diff = { op:'diff', status:'ok', events: diffEvents(le,re), finalState: diffObjects(lf,rf) };
	console.log(JSON.stringify({ outputs:[diff] }, null, 2));
}
if(require.main===module) main();