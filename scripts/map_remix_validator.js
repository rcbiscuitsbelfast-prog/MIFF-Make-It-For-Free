#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf-8')); }

function usage(){
	console.log('Usage: node scripts/map_remix_validator.js --map <map.json> --registry <tile_manifest.json>');
	process.exit(1);
}

const args = process.argv.slice(2);
let mapPath = null, regPath = null;
for (let i=0;i<args.length;i++){
	if (args[i]==='--map') mapPath = args[++i];
	else if (args[i]==='--registry') regPath = args[++i];
}
if (!mapPath || !regPath) usage();

const map = readJson(mapPath);
const reg = readJson(regPath);

const knownIds = new Set((reg.tiles||[]).map(t=>t.id));
const idToTile = new Map((reg.tiles||[]).map(t=>[t.id,t]));
const errors = [];
const warnings = [];

function validateLayer(name){
	const layer = map.layers && map.layers[name];
	if (!layer) return;
	const grid = layer.map || [];
	for (let y=0;y<grid.length;y++){
		const row = grid[y]||[];
		for (let x=0;x<row.length;x++){
			const id = row[x];
			if (!id) continue;
			if (!knownIds.has(id)) errors.push(`Unknown tile id in ${name}[${y}][${x}]: ${id}`);
			else {
				const t = idToTile.get(id);
				if (!t.tags || !t.tags.length) warnings.push(`Tile missing tags: ${id}`);
			}
		}
	}
}

['terrain','props','npcs'].forEach(validateLayer);

// Orchestration hooks
const orch = map.orchestration||{};
if (orch.quests){
	for (const q of orch.quests){
		if (q.tile && !knownIds.has(q.tile)) errors.push(`Quest references unknown tile id: ${q.tile}`);
	}
}
if (orch.lore){
	for (const l of orch.lore){
		if (l.tile && !knownIds.has(l.tile)) errors.push(`Lore references unknown tile id: ${l.tile}`);
	}
}

console.log('Map:', path.basename(mapPath));
console.log('Registry tiles:', knownIds.size);
if (errors.length){
	console.log('ERRORS:');
	errors.forEach(e=>console.log(' -', e));
	process.exitCode = 1;
} else {
	console.log('No ID errors found.');
}
if (warnings.length){
	console.log('WARNINGS:');
	warnings.forEach(w=>console.log(' -', w));
}