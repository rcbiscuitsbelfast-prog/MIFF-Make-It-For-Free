#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';

function main(){
	const p = path.resolve('docs/render/viewport/npc_registry.json');
	const j = JSON.parse(fs.readFileSync(p,'utf-8'));
	const names = (j.npcs||[]).map((n:any)=>({ id:n.id, name:n.name, zone:n.zoneAffinity }));
	console.log(JSON.stringify({ op:'npcList', count:names.length, npcs:names }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`){ main(); }